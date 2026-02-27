import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const result = await model.generateContent("A delicious plate of omelet");
        console.log("Success?", result);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
