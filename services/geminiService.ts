
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractMeterReading = async (base64Image: string): Promise<number | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Extract the gas meter reading from this photo. The reading is a series of digits, usually with a decimal part (sometimes indicated by a red box or comma). Return ONLY the numerical value as a float. DO NOT READ DIGITS IN RED BOX. If the image is not a gas meter or the number is illegible, return null.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reading: {
              type: Type.NUMBER,
              description: "The numerical value of the gas meter reading."
            }
          },
          required: ["reading"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const json = JSON.parse(text);
    return json.reading || null;
  } catch (error) {
    console.error("Error extracting meter reading:", error);
    return null;
  }
};
