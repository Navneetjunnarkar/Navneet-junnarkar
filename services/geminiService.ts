import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Language } from "../types";

// Initialize Gemini Client
// NOTE: In a real app, strict backend proxying is recommended for keys.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are 'Legal Sathi', an expert Indian Legal Assistant AI.
Your goal is to simplify legal concepts for Indian citizens.

Guidelines:
1. Base your answers on Indian Law (IPC, CrPC, BNS, BNSS, Constitution of India, etc.).
2. **IMPORTANT: Reference Previous Similar Cases.** Whenever you explain a legal concept or provide advice, you MUST cite relevant landmark judgments or similar past cases from the Supreme Court of India or High Courts to support your explanation.
   - Format the case citation clearly (e.g., *State of Maharashtra vs. X, 2015*).
   - Briefly explain why that case is relevant to the user's query.
3. Be polite, professional, and trustworthy.
4. If a query implies a serious crime or emergency, advise the user to contact the police or a lawyer immediately.
5. Summarize complex legal documents in simple Hindi or English as requested.
6. Do not provide binding legal judgment; always add a disclaimer that you are an AI and they should consult a real lawyer.
`;

export const getLegalAdvice = async (history: ChatMessage[], currentMessage: string, language: Language = 'en'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let langInstruction = "Respond in English.";
    if (language === 'hi') langInstruction = "Respond in Hindi (Devanagari script). Use simple legal Hindi.";
    else if (language === 'mr') langInstruction = "Respond in Marathi (Devanagari script). Use formal yet accessible Marathi.";

    // Construct prompt history
    let fullPrompt = `${SYSTEM_INSTRUCTION}\n\nIMPORTANT: ${langInstruction}\n\n`;
    history.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Legal Sathi'}: ${msg.text}\n`;
    });
    fullPrompt += `User: ${currentMessage}\nLegal Sathi:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });

    return response.text || "I apologize, I could not process that legal query at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to Legal Sathi AI. Please try again later.";
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, language: Language = 'en'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash'; // Capable of multimodal input
    
    let langInstruction = "English";
    if (language === 'hi') langInstruction = "Hindi (Devanagari script)";
    else if (language === 'mr') langInstruction = "Marathi (Devanagari script)";

    const prompt = `
      Please act as a legal document analyzer. 
      1. Identify the type of document (e.g., Rental Agreement, Affidavit, Court Summons).
      2. Summarize the key points in simple terms in ${langInstruction}.
      3. Highlight any potential risks or important dates in ${langInstruction}.
      4. Format the output clearly with Markdown headers.
      5. If applicable, mention any relevant sections of Indian Law that govern this type of document.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
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

    return response.text || "Could not analyze the document.";
  } catch (error) {
    console.error("Document Analysis Error:", error);
    return "Failed to analyze document. Please ensure the image is clear.";
  }
};