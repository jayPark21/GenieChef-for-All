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
당신은 최고의 요리사입니다. 사용자가 입력한 식재료와 식단 목적에 딱 맞는 레시피를 1~3개 추천해주세요.
요리 이름(title)과 간단한 설명(desc)을 JSON 배열 형태로만 반환해야 합니다. 다른 부가적인 텍스트는 출력하지 마세요.

식재료: ${ingredients.join(', ')}
목적: ${dietMode}

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
