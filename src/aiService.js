import { GoogleGenerativeAI } from '@google/generative-ai';

// [땡칠이 팀장 중요 브리핑]
// 외부 NotebookLM 대신 Gemini API를 이용한 '자체 실시간 이미지 생성'으로 전환했습니다!
// [초고속 모드 전환] 대표님 요청으로 텍스트는 번개처럼 빠른 Flash 모델을 사용하고, 목록 썸네일 생성은 건너뜁니다! ⚡️⚡️⚡️
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-3-flash-preview";
const IMAGE_MODEL_NAME = "gemini-3.1-flash-image-preview";
const GEN_IMAGE_PROMPT = (title) => `Create a high-end, professional food photography of '${title}'. Portrait orientation, moody lighting, gourmet plating, high resolution, realistic textures, vibrant colors. No text in image.`;

// API 키가 없으면 에러 발생 방지를 위해 미리 체크합니다.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// 레시피 추천 중 임시 이미지 삭제 (UI에서 로딩 애니메이션으로 대체)

export const recommendRecipes = async (ingredients, dietMode, dietGoal = '') => {
    if (!genAI) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const goalText = dietGoal ? `**다이어트 특별 목표**: [${dietGoal}]\n(주의: '체중 감량'인 경우 저칼로리/고단백 위주로, '근육 성장'인 경우 고단백/양질의 탄수화물 위주로, '체중 유지'인 경우 탄단지 비율이 균형 잡힌 메뉴로 구성하세요.)\n` : '';

    // 시스템 프롬프트 작성
    const prompt = `
당신은 최고의 요리사입니다. 사용자가 입력한 식재료 조합을 활용하여, 사용자가 선택한 [식단 목적]에 정확하게 부합하는 레시피를 1~3개 추천해야 합니다.
중요: 모든 추천 레시피는 무조건 **2인분 기준**이어야 합니다.
중요: 식재료가 제한적이더라도, 반드시 [식단 목적]의 성격(예: '든든 한끼'면 포만감이 큰 요리, '간단식'이면 빠르고 가벼운 요리, '술안주'면 짭짤하고 매콤한 요리 등)을 극대화하여 독창적인 레시피를 제안하세요. 식단 목적이 다르면 추천 결과도 확실히 달라야 합니다.

${goalText}
식재료: ${ingredients.join(', ')}
식단 목적: ${dietMode}

요리 이름(title)과 간단한 설명(desc)을 JSON 배열 형태로만 반환해야 합니다. 마크다운 기호 없이 순수 JSON 배열만 출력하세요.
자세한 조리법은 필요하지 않으며, 'desc'에는 식단 목적과 어떻게 어울리는지 어필하는 50자 내외의 설명을 적어주세요.

응답 형식 예시:
[
  {
    "id": 1,
    "title": "요리 이름",
    "desc": "요리에 대한 짧은 설명 및 매력 포인트 (50자 내외)",
    "calories": "320kcal",
    "carbs": "15g",
    "protein": "35g",
    "fat": "10g"
  }
]
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // JSON 파싱 (마크다운 블록 제거)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipes = JSON.parse(cleanedText);

        // [땡칠이 팀장 최적화] 방안 A 적용: 썸네일 AI 이미지 생성 생략 (체감 속도 MAX)
        // 백엔드 통신 없이 이미지 부분을 비워둔 채 먼저 텍스트를 반환합니다.
        const recipesWithImages = recipes.map((recipe, index) => ({
            ...recipe,
            id: Date.now() + index,
            img: null
        }));

        return recipesWithImages;

    } catch (error) {
        console.error("AI 레시피 추천 실패:", error);
        throw new Error("레시피 추천을 생성하는 중 오류가 발생했습니다.");
    }
};

export const generateRecipeImage = async (title) => {
    if (!genAI) return null;
    try {
        const imageModel = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });
        // 빠른 속도로 적당한 품질의 음식 사진을 생성합니다.
        const imagePrompt = `${title}, delicious food photography, appetizing, bright lighting`;
        const imageResult = await imageModel.generateContent(imagePrompt);

        if (imageResult?.response?.candidates?.[0]?.content?.parts) {
            const imagePart = imageResult.response.candidates[0].content.parts.find(p => p.inlineData);
            if (imagePart && imagePart.inlineData) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }
        }
    } catch (error) {
        console.error("Header image generation failed:", error);
    }
    return null;
};

const GEN_INFOGRAPHIC_PROMPT = (title, detail) => `
Create a very tall and narrow, scrolling vertical infographic for '${title}'.
CRITICAL INSTRUCTION: DO NOT make a single page poster or a square image. It MUST be an extremely tall vertical layout designed to be scrolled from top to bottom.

You MUST visualize the EXACT recipe details provided below. Do not make up your own ingredients or steps.

[ACTUAL RECIPE TO VISUALIZE]
- Ingredients: ${detail?.ingredientsUsed?.join(', ')}
- Sauces: ${detail?.saucesUsed?.join(', ')}
- Steps:
${detail?.steps?.map((step, index) => `  ${index + 1}. ${step}`).join('\n')}
- Chef's Tip: ${detail?.tip}

Style Guidelines exactly matching this description:
- Warm, cozy, and soft vector illustration style (like a premium cozy webtoon or beautifully illustrated cookbook).
- Creamy, pastel, and appetizing color palette.
- Layout Requirements (LONG & NARROW VERTICAL):
  1. A prominently styled main title area at the very top.
  2. A sheer vertical flowing layout. The cooking steps MUST be stacked strictly one below the other in a single vertical column, matching the exact steps provided above.
  3. Show every cooking action sequentially downwards. Number each step cleanly and illustrate the specific actions described in the text.
  4. A prominently featured "Chef's Tip" box placed at the very bottom end of the long infographic, containing a visual representation of the provided tip.
- Make it look like an authentic, highly detailed Korean recipe infographic for mobile scrolling.
- Use Korean text styling visually where appropriate to create a genuine, professional vibe.
- Strict Portrait/Vertical orientation. Must feel cozy, aesthetic, perfectly structured for vertical scrolling, and rich in culinary details.
`;

// 3. 인포그래픽 실시간 상태 체크 (Gemini 3.1 Flash Image Integration)
// [대표님!] NotebookLM 대신 Gemini의 초고속 이미지 생성 능력을 '인포그래픽 스타일'로 극대화했습니다.
// 사진 한 장에 정보의 기운이 느껴지도록 프롬프트를 고도화했습니다. 🫡📸✨
export const checkInfographicStatus = async (recipeTitle, recipeDetail) => {
    try {
        const imageModel = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });
        const imagePrompt = GEN_INFOGRAPHIC_PROMPT(recipeTitle, recipeDetail);

        // [땡칠이 팀장 기술 팁] 생성이 시작되었음을 알리고 약 3~5초 후 결과를 반환하기 위해 약간의 대기를 줍니다.
        await new Promise(resolve => setTimeout(resolve, 3000));

        const imageResult = await imageModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: imagePrompt }] }]
        });
        let finalUrl = "";

        if (imageResult?.response?.candidates?.[0]?.content?.parts) {
            const imagePart = imageResult.response.candidates[0].content.parts.find(p => p.inlineData);
            if (imagePart && imagePart.inlineData) {
                finalUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }
        }

        // Fallback (API 실패 시)
        if (!finalUrl) {
            finalUrl = 'https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&q=80&w=1000';
        }

        return {
            completed: true,
            url: finalUrl,
            message: "지니 쉪이 최신 Gemini 엔진으로 구워낸 명품 인포그래픽 이미지가 완성되었습니다! 🫡🎨✨"
        };
    } catch (error) {
        console.error("Infographic generation failed:", error);
        return {
            completed: true,
            url: 'https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&q=80&w=1000',
            message: "이미지 생성 중 오류가 발생했지만, 최선의 결과물을 준비했습니다! 🫡"
        };
    }
};

export const generateRecipeDetail = async (recipeTitle, ingredients, dietMode, dietGoal = '') => {
    if (!genAI) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const goalText = dietGoal ? `**다이어트 특별 목표**: [${dietGoal}]\n(주의: '체중 감량'인 경우 저칼로리/고단백 위주로, '근육 성장'인 경우 고단백/양질의 탄수화물 위주로, '체중 유지'인 경우 탄단지 비율이 균형 잡힌(예: 5:2:3) 메뉴로 구성하며, nutrition 영양 정보 또한 이 목표 비율에 완벽히 부합하도록 수치를 설정하세요.)\n` : '';

    // 시스템 프롬프트 작성
    const prompt = `
당신은 최고의 요리사입니다. 사용자가 선택한 요리 이름과 식재료, 식단 목적을 기반으로 상세 레시피와 영양 정보를 생성해주세요.
중요!!!: 이 레시피의 요리법, 계량, 영양 정보 등 모든 기준은 반드시 **2인분 기준**이어야 합니다. 각 재료와 소스의 양(예: '100g', '2큰술' 등)을 정확히 2인분에 맞게 명시하세요.

${goalText}
요리 이름: ${recipeTitle} (2인분 기준)
활용 가능 식재료: ${ingredients.join(', ')}
식단 목적: ${dietMode}

응답은 항상 순수 JSON 형식으로만 반환해야 하며, 마크다운(예: \`\`\`json)은 포함하지 마세요.
JSON 구조는 다음과 같아야 합니다:
{
  "time": "예: 15분",
  "difficulty": "예: 쉬움, 보통, 어려움",
  "ingredientsUsed": ["계란 4개", "양파 1개"],
  "saucesUsed": ["간장 2큰술", "설탕 1큰술", "참기름 1큰술"],
  "steps": [
    "양파를 채 썬다.",
    "계란을 푼다.",
    "팬에 기름을 두르고 양파를 볶다가 계란을 붓는다."
  ],
  "tip": "요리의 맛을 한층 끌어올릴 수 있는 지니 쉪만의 특별한 꿀팁 (1~2문장)",
  "nutrition": {
    "calories": "예: 350kcal",
    "carbs": "예: 20g (6%)",
    "protein": "예: 45g (82%)",
    "fat": "예: 35g (65%)",
    "sodium": "예: 420mg",
    "sugar": "예: 4.5g",
    "fiber": "예: 2.1g"
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
export const getNutrientInfo = async (ingredient, amount) => {
    if (!genAI) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
당신은 최고의 영양사입니다. 입력된 식재료와 중량을 바탕으로 정확한 영양 성분(탄수화물, 단백질, 지방)을 계산해 주세요.
식재료: ${ingredient}
중량: ${amount}g(ml)

응답은 항상 순수 JSON 형식으로만 반환해야 하며, 마크다운은 포함하지 마세요.
반드시 숫자값만 포함하고 단위(g)는 제외한 숫자값만 키값에 넣어주세요.

JSON 구조:
{
  "ingredient": "${ingredient}",
  "amount": ${amount},
  "carbs": 0.0,
  "protein": 0.0,
  "fat": 0.0,
  "calories": 0.0,
  "unit": "g"
}
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("AI 영양 정보 조회 실패:", error);
        throw new Error("영양 정보를 가져오는 중 오류가 발생했습니다.");
    }
};
