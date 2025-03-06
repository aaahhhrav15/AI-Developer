import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateResult = async (prompt) => {
    try {
        const response = await model.generateContent(prompt);

        const resultText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

        return resultText;
    } 
    catch (error) {
        throw new Error("Error generating AI response: " + error.message);
    }
};
