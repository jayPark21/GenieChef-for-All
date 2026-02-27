import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: "A delicious plate of omelet" }] }],
            generationConfig: {
                aspectRatio: "9:16"
            }
        });
        const candidate = result.response.candidates[0];
        console.log("Candidate content parts:", JSON.stringify(candidate.content.parts, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
