import { GoogleGenerativeAI } from '@google/generative-ai';

// API 키가 없으면 에러 발생 방지를 위해 미리 체크합니다.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// 레시피 추천에 사용할 공통 이미지 풀
const FACK_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2626&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2672&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2670&auto=format&fit=crop'
];

export const recommendRecipes = async (ingredients, dietMode) => {
    if (!genAI) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 시스템 프롬프트 작성
    const prompt = `
당신은 최고의 요리사입니다. 사용자가 입력한 식재료 조합을 활용하여, 사용자가 선택한 [식단 목적]에 정확하게 부합하는 레시피를 1~3개 추천해야 합니다.
중요: 식재료가 제한적이더라도, 반드시 [식단 목적]의 성격(예: '든든 한끼'면 포만감이 큰 요리, '간단식'이면 빠르고 가벼운 요리, '술안주'면 짭짤하고 매콤한 요리 등)을 극대화하여 독창적인 레시피를 제안하세요. 식단 목적이 다르면 추천 결과도 확실히 달라야 합니다.

식재료: ${ingredients.join(', ')}
식단 목적: ${dietMode}

요리 이름(title)과 간단한 설명(desc)을 JSON 배열 형태로만 반환해야 합니다. 마크다운 기호 없이 순수 JSON 배열만 출력하세요.
자세한 조리법은 필요하지 않으며, 'desc'에는 식단 목적과 어떻게 어울리는지 어필하는 50자 내외의 설명을 적어주세요.

응답 형식 예시:
[
  {
    "id": 1,
    "title": "요리 이름",
    "desc": "요리에 대한 짧은 설명 및 매력 포인트 (50자 내외)"
  }
]
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // JSON 파싱 (마크다운 블록 제거)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipes = JSON.parse(cleanedText);

        // 이미지 랜덤 할당 및 최종 데이터 포맷팅
        return recipes.map((recipe, index) => ({
            ...recipe,
            id: Date.now() + index, // 고유 ID 보장
            img: FACK_IMAGES[index % FACK_IMAGES.length] // 랜덤/순차 이미지
        }));

    } catch (error) {
        console.error("AI 레시피 추천 실패:", error);
        throw new Error("레시피 추천을 생성하는 중 오류가 발생했습니다.");
    }
};

export const generateRecipeDetail = async (recipeTitle, ingredients, dietMode) => {
    if (!genAI) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 시스템 프롬프트 작성
    const prompt = `
당신은 최고의 요리사입니다. 사용자가 선택한 요리 이름과 식재료, 식단 목적을 기반으로 상세 레시피와 영양 정보를 생성해주세요.

요리 이름: ${recipeTitle}
활용 가능 식재료: ${ingredients.join(', ')}
식단 목적: ${dietMode}

응답은 항상 순수 JSON 형식으로만 반환해야 하며, 마크다운(예: \`\`\`json)은 포함하지 마세요.
JSON 구조는 다음과 같아야 합니다:
{
  "time": "예: 15분",
  "difficulty": "예: 쉬움, 보통, 어려움",
  "ingredientsUsed": ["계란", "양파", "간장"], // 단계에서 사용될 실제 재료 이름 배열
  "steps": [
    "양파를 채 썬다.",
    "계란을 푼다.",
    "팬에 기름을 두르고 양파를 볶다가 계란을 붓는다."
  ],
  "nutrition": {
    "calories": 350,
    "carbs": 20, // 탄수화물 퍼센트 기호 없이 정수 형태의 0~100 사이 숫자
    "protein": 45, // 단백질 비율 숫자
    "fat": 35, // 지방 비율 숫자
    "sodium": "420mg",
    "sugar": "4.5g",
    "fiber": "2.1g"
  }
}
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // JSON 파싱 (마크다운 블록 제거)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipeDetail = JSON.parse(cleanedText);

        return recipeDetail;

    } catch (error) {
        console.error("AI 상세 레시피 생성 실패:", error);
        throw new Error("상세 레시피를 생성하는 중 오류가 발생했습니다.");
    }
};
