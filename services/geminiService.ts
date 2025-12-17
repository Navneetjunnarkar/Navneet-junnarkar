import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Language } from "../types";

// Safe initialization of the API Key
export const getApiKey = () => {
  // In some build environments, accessing process.env might throw if not polyfilled.
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

const apiKey = getApiKey();
// Initialize Gemini Client with a fallback to prevent immediate crash, but requests will fail if key is missing.
const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });

export const SYSTEM_INSTRUCTION = `
You are 'Legal Sathi', an expert Indian Legal Assistant AI.
Your goal is to simplify legal concepts for Indian citizens.

Guidelines:
1. Base your answers on Indian Law (IPC, CrPC, BNS, BNSS, Constitution of India, etc.).
2. **IMPORTANT: Reference Previous Similar Cases.** Whenever you explain a legal concept or provide advice, you MUST cite relevant landmark judgments or similar past cases from the Supreme Court of India or High Courts to support your explanation.
   - Format the case citation clearly (e.g., *State of Maharashtra vs. X, 2015*).
   - Briefly explain why that case is relevant to the user's query.
   - **SPECIFIC INSTRUCTION:** If the user asks about **Theft** or **Murder**, you MUST provide references to specific landmark cases regarding IPC Section 378/300 or BNS Section 303/101 respectively.
3. Be polite, professional, and trustworthy.
4. If a query implies a serious crime or emergency, advise the user to contact the police or a lawyer immediately.
5. Summarize complex legal documents in simple Hindi or English as requested.
6. Do not provide binding legal judgment; always add a disclaimer that you are an AI and they should consult a real lawyer.
`;

export const getLegalAdvice = async (history: ChatMessage[], currentMessage: string, language: Language = 'en'): Promise<string> => {
  // Explicit check for API Key before making the call
  if (!apiKey) {
    console.error("Configuration Error: API_KEY is missing in environment variables.");
    return "System Error: The API Key is not configured. Please add 'API_KEY' to your Vercel Environment Variables.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    let langInstruction = "Respond in English.";
    if (language === 'hi') langInstruction = "Respond in Hindi (Devanagari script). Use simple legal Hindi.";
    else if (language === 'mr') langInstruction = "Respond in Marathi (Devanagari script). Use formal yet accessible Marathi.";
    else if (language === 'pa') langInstruction = "Respond in Punjabi (Gurmukhi script). Use simple legal Punjabi.";
    else if (language === 'raj') langInstruction = "Respond in Rajasthani (Devanagari script) or Marwari dialect where appropriate, otherwise use simple Hindi with Rajasthani context.";

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
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide more specific feedback based on error type
    if (error.message?.includes('400') || error.toString().includes('400')) {
        return "Connection Error: Invalid Request or API Key (400). Please check your API Key configuration.";
    }
    if (error.message?.includes('401') || error.message?.includes('403')) {
        return "Authorization Error: Access denied. Please check if your API Key is valid and enabled.";
    }

    return "Error connecting to Legal Sathi AI. Please check the browser console for details.";
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, language: Language = 'en'): Promise<string> => {
  if (!apiKey) {
    return "System Error: API Key is not configured in Vercel settings.";
  }

  try {
    const model = 'gemini-2.5-flash'; // Capable of multimodal input
    
    let langInstruction = "English";
    if (language === 'hi') langInstruction = "Hindi (Devanagari script)";
    else if (language === 'mr') langInstruction = "Marathi (Devanagari script)";
    else if (language === 'pa') langInstruction = "Punjabi (Gurmukhi script)";
    else if (language === 'raj') langInstruction = "Rajasthani (Devanagari script)";

    const prompt = `
      You are a strict legal document analyzer.
      
      STEP 1: CHECK VALIDITY
      Look at the image provided. Is it a valid legal document (e.g., contract, court order, affidavit, deed, ID proof, official notice)?
      - If the image is a person (selfie), a landscape, food, a meme, or clearly NOT a legal document:
        Return EXACTLY the string: "NOT_LEGAL_DOC"
        
      STEP 2: ANALYZE (Only if Step 1 passes)
      1. Identify the type of document.
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

    const text = response.text?.trim() || "Could not analyze the document.";
    
    if (text.includes("NOT_LEGAL_DOC")) {
        throw new Error("NOT_LEGAL_DOC");
    }

    return text;
  } catch (error: any) {
    if (error.message === "NOT_LEGAL_DOC") {
        return "Please upload a valid legal document. The image provided does not appear to be an official contract, notice, or legal paper.";
    }
    console.error("Document Analysis Error:", error);
    return "Failed to analyze document. Please ensure the image is clear and check your API Key.";
  }
};