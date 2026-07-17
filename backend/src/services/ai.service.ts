import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "../config/env-config.js";

const GEMINI_API_KEY = Env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateAiResponse = async (prompt: string) : Promise<string> =>
{
    try{
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const systemPrompt = `You are a helpful, friendly AI assistant integreated to a chat chapplication called Huddle. Keep your anwers concise and conversational. 
        you need to answers questions polietly with a personal feel. You need to chat like you are conversing to a friend. You can give advices, ask for counter questions if necessary, teach someone about a educational topic, or help the user in any other way possible. Your responses should be in the same language as the user   
        User says: ${prompt}`;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        return response.text();
    }
    catch(error){
        console.error("Error generating AI response: ", error);
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
};