import { GoogleGenAI, Type } from "@google/genai";
import { Ticket } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTasksForTicket = async (ticket: Ticket): Promise<string[]> => {
  try {
    const prompt = `
      You are a technical project manager. 
      Analyze the following ticket and break it down into 3 to 6 concrete, actionable technical subtasks for a developer.
      
      Ticket Title: ${ticket.title}
      Ticket Type: ${ticket.type}
      Description: ${ticket.description}
      
      Return ONLY a list of strings acting as task titles.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    console.error("Failed to generate tasks:", error);
    return ["Review requirements", "Investigate codebase", "Implement fix/feature", "Test changes"];
  }
};

export const suggestPriorityAndType = async (title: string, description: string): Promise<{ priority: string, type: string }> => {
    try {
        const prompt = `
            Analyze this request and suggest a Priority (LOW, MEDIUM, HIGH, CRITICAL) and Type (BUG_ISSUE, FEATURE_REQUEST, SELF_INITIATION).
            Title: ${title}
            Description: ${description}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                        type: { type: Type.STRING, enum: ["BUG_ISSUE", "FEATURE_REQUEST", "SELF_INITIATION"] }
                    }
                }
            }
        });

        const jsonStr = response.text?.trim();
         if (!jsonStr) return { priority: "MEDIUM", type: "SELF_INITIATION" };
         return JSON.parse(jsonStr);

    } catch (e) {
        return { priority: "MEDIUM", type: "SELF_INITIATION" };
    }
}