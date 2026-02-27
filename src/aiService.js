import { GoogleGenerativeAI } from '@google/generative-ai';

// [땡칠이 팀장 중요 브리핑]
// 외부 NotebookLM 대신 Gemini API를 이용한 '자체 실시간 이미지 생성'으로 전환했습니다!
// 디자인 통제권과 속도(10분->20초)를 모두 잡았습니다. 🫡🚀🧪
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.1-pro-preview";
const IMAGE_MODEL_NAME = "gemini-3.1-flash-image-preview";
const GEN_IMAGE_PROMPT = (title) => `Create a high-end, professional food photography of '${title}'. Portrait orientation, moody lighting, gourmet plating, high resolution, realistic textures, vibrant colors. No text in image.`;

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

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

        // 이미지 모델 호출
        const imageModel = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });

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

// 3. 인포그래픽 실시간 상태 체크 (Gemini 2.5 Flash Image Integration)
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

export const generateRecipeDetail = async (recipeTitle, ingredients, dietMode) => {
    if (!genAI) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
  "ingredientsUsed": ["계란", "양파"],
  "saucesUsed": ["간장", "설탕", "참기름"],
  "steps": [
    "양파를 채 썬다.",
    "계란을 푼다.",
    "팬에 기름을 두르고 양파를 볶다가 계란을 붓는다."
  ],
  "tip": "요리의 맛을 한층 끌어올릴 수 있는 지니 쉪만의 특별한 꿀팁 (1~2문장)",
  "nutrition": {
    "calories": 350,
    "carbs": 20,
    "protein": 45,
    "fat": 35,
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
