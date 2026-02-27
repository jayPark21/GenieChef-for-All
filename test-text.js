import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function test() {
    try {
        console.log("Testing gemini-2.5-flash for text...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, can you hear me? Respond with 'YES'.");
        console.log("Success?", result.response.text());
    } catch (e) {
        console.error("Error with gemini-2.5-flash:", e);

        try {
            console.log("Fallback: Testing gemini-1.5-flash for text...");
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const resultFallback = await modelFallback.generateContent("Hello, can you hear me? Respond with 'YES'.");
            console.log("Success with fallback?", resultFallback.response.text());
        } catch (e2) {
            console.error("Error with gemini-1.5-flash:", e2);
        }
    }
}
test();
