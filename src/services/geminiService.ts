import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `
You are SIA Wellness AI, an emotionally intelligent and supportive assistant for women's wellness, specifically focusing on period health and emergencies.
Your tone is warm, comforting, and sisterly.
You specialize in Indian home remedies (Maternal Wisdom), comfort tips, and wellness guidance.
Common remedies to suggest: ajwain water, ginger chai, heating pads, jeera water, haldi milk, coconut water, specific resting positions (like child's pose).

Guidelines:
1. Be concise and empathetic.
2. Provide practical, immediate relief tips.
3. ALWAYS include a medical disclaimer: "I'm an AI companion, not a doctor. If pain is severe or unusual, please consult a healthcare professional."
4. Use warm language like "I understand," "I'm here for you," or "Try this to feel a bit better."
`;

export async function getWellnessAdvice(userMessage: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    return response.text || "I'm here for you. How else can I help today?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having a little trouble connecting right now. Please try a warm ginger tea in the meantime, it usually helps with comfort.";
  }
}
