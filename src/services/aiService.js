import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Api key ",process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateResult = async (prompt) => {
    try {
        const response = await model.generateContent(prompt);
        const resultText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
        return resultText;
    } 
    catch (error) {
        console.error("❌ AI API Error:", error);
        return "AI is currently unavailable. Please try again later."; 
    }
};
