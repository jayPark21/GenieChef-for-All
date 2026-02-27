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

        // 이미지 랜덤 할당 모의에서 실제 AI 이미지 생성으로 변경
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        const recipesWithImages = await Promise.all(recipes.map(async (recipe, index) => {
            let imageUrl = FACK_IMAGES[index % FACK_IMAGES.length]; // fallback
            try {
                const imagePrompt = `${recipe.title} delicious high quality food photography`;
                const imageResult = await imageModel.generateContent(imagePrompt);

                if (imageResult && imageResult.response && imageResult.response.candidates && imageResult.response.candidates.length > 0) {
                    const parts = imageResult.response.candidates[0].content.parts;
                    const imagePart = parts.find(p => p.inlineData);
                    if (imagePart && imagePart.inlineData) {
                        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                    }
                }
            } catch (e) {
                console.error("Home recipe thumbnail generation failed:", e);
            }

            return {
                ...recipe,
                id: Date.now() + index,
                img: imageUrl
            };
        }));

        return recipesWithImages;

    } catch (error) {
        console.error("AI 레시피 추천 실패:", error);
        throw new Error("레시피 추천을 생성하는 중 오류가 발생했습니다.");
    }
};

// 3. 인포그래픽 실시간 상태 체크 (NotebookLM Polling Simulator)
// 실제 환경에서는 백엔드 API를 호출하지만, 데모를 위해 리얼하게 동작하도록 구성
export const checkInfographicStatus = async (recipeTitle) => {
    // 인물(땡칠이)이 인지하는 실제 데이터 (NotebookLM Studio ID: bc9897ff)
    // 실제 생성 시간이 걸리므로 5초 주기로 호출될 때마다 시각적으로 단계를 보여줌
    return new Promise((resolve) => {
        setTimeout(() => {
            // 특정 시점 이후에만 완료 상태 반환 (리얼함 강조)
            const isCompleted = Math.random() > 0.7; // 30% 확률로 완료 (수차례 폴링 유도)

            if (isCompleted && recipeTitle.includes('김치찌개')) {
                resolve({
                    completed: true,
                    url: 'https://lh3.googleusercontent.com/notebooklm/ANHLwAzSgmsoN8mWhawG8K5WUmHM-8XPVAV9VI9ib3NXzU1h6oQGM44sM532bR9QEyir-7e7efGoh8Rt9i9EaTpXF3Rzp31pTnYsUJrQqGKJPc9wHtteizoG483Xt01ryl5gstk9u15NfY1y8-hzePNXXnT6oeDxiA=w1536-d-h2752-mp2',
                    message: "Genie Chef has finished your recipe infographic! 🐟"
                });
            } else {
                resolve({
                    completed: false,
                    message: "Still creating the masterpiece... please wait! ✍️"
                });
            }
        }, 800);
    });
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
  "ingredientsUsed": ["계란", "양파"], // 단계에서 사용될 실제 주재료/부재료 이름 배열
  "saucesUsed": ["간장", "설탕", "참기름"], // 단계에서 사용될 소스 및 양념 이름 배열
  "steps": [
    "양파를 채 썬다.",
    "계란을 푼다.",
    "팬에 기름을 두르고 양파를 볶다가 계란을 붓는다."
  ],
  "tip": "요리의 맛을 한층 끌어올릴 수 있는 지니 쉪만의 특별한 꿀팁 (1~2문장)",
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
        // 상세 정보와 이미지를 병렬로 생성하여 속도 향상
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const imagePrompt = `${recipeTitle} delicious high quality food photography, photorealistic, professional lighting`;

        const [result, imageResult] = await Promise.all([
            model.generateContent(prompt),
            imageModel.generateContent(imagePrompt).catch(e => {
                console.error("Gemini image generation failed:", e);
                return null;
            })
        ]);

        const responseText = result.response.text();

        // JSON 파싱 (마크다운 블록 제거)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipeDetail = JSON.parse(cleanedText);

        // 이미지 데이터 매핑
        let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2626&auto=format&fit=crop"; // fallback
        if (imageResult && imageResult.response && imageResult.response.candidates && imageResult.response.candidates.length > 0) {
            const parts = imageResult.response.candidates[0].content.parts;
            const imagePart = parts.find(p => p.inlineData);
            if (imagePart && imagePart.inlineData) {
                imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }
        }
        recipeDetail.img = imageUrl;

        return recipeDetail;

    } catch (error) {
        console.error("AI 상세 레시피 생성 실패:", error);
        throw new Error("상세 레시피를 생성하는 중 오류가 발생했습니다.");
    }
};
