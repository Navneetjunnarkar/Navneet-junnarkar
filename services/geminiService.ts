
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Language } from "../types";

// Fixed: Initialized GoogleGenAI strictly following the guideline: 
// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SYSTEM_INSTRUCTION = `
You are 'Legal Sathi', an expert Indian Legal Assistant AI.
Your goal is to simplify legal concepts for Indian citizens.

Guidelines:
1. Base your answers on Indian Law (IPC, CrPC, BNS, BNSS, Constitution of India, etc.).
2. **IMPORTANT: Reference Previous Similar Cases.** Whenever you explain a legal concept or provide advice, you MUST cite relevant landmark judgments or similar past cases from the Supreme Court of India or High Courts.
3. Be polite, professional, and trustworthy.
4. Summarize complex legal documents in simple Hindi or English as requested.
5. Do not provide binding legal judgment; always add a disclaimer that you are an AI.
`;

// Use gemini-3-pro-preview for complex legal advice tasks
export const getLegalAdvice = async (history: ChatMessage[], currentMessage: string, language: Language = 'en'): Promise<string> => {
  try {
    let langInstruction = "Respond in English.";
    if (language === 'hi') langInstruction = "Respond in Hindi (Devanagari script).";
    else if (language === 'mr') langInstruction = "Respond in Marathi (Devanagari script).";
    else if (language === 'pa') langInstruction = "Respond in Punjabi (Gurmukhi script).";
    else if (language === 'raj') langInstruction = "Respond in Rajasthani or simple Hindi.";

    let fullPrompt = `${SYSTEM_INSTRUCTION}\n\nIMPORTANT: ${langInstruction}\n\n`;
    history.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Legal Sathi'}: ${msg.text}\n`;
    });
    fullPrompt += `User: ${currentMessage}\nLegal Sathi:`;

    // Query GenAI with both model name and prompt as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
    });

    return response.text || "I apologize, I could not process that query.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "Error connecting to Legal Sathi AI. Please ensure your API Key is valid.";
  }
};

// Use gemini-3-flash-preview for document analysis and summarization
export const analyzeDocument = async (base64Data: string, mimeType: string, language: Language = 'en'): Promise<string> => {
  try {
    let langInstruction = "English";
    if (language === 'hi') langInstruction = "Hindi (Devanagari script)";
    else if (language === 'mr') langInstruction = "Marathi (Devanagari script)";
    else if (language === 'pa') langInstruction = "Punjabi (Gurmukhi script)";
    else if (language === 'raj') langInstruction = "Rajasthani (Devanagari script)";

    const prompt = `
      Analyze this document in ${langInstruction}.
      Identify document type, summarize key points, highlight risks/dates, and cite relevant Indian Law sections.
      If it is not a legal document, return "NOT_LEGAL_DOC".
    `;

    // Query GenAI with both model name and contents including image data as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    const text = response.text?.trim() || "Could not analyze the document.";
    if (text.includes("NOT_LEGAL_DOC")) {
        return "Please upload a valid legal document.";
    }
    return text;
  } catch (error: any) {
    console.error("Document Analysis Error:", error);
    return "Failed to analyze document. Check API Key and image quality.";
  }
};
