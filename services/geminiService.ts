
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, GenerationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFlashcardsFromDocument = async (
  fileBase64: string,
  mimeType: string,
  count: number = 10
): Promise<GenerationResult> => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this document and create ${count} high-quality flashcards for learning. 
            Focus on key concepts, definitions, and important facts. 
            Also provide a short 2-sentence summary of the document content.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A short summary of the document content.",
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["question", "answer"],
            },
          },
        },
        required: ["summary", "flashcards"],
      },
    },
  });

  const response = await model;
  const rawText = response.text;
  
  if (!rawText) {
    throw new Error("No content generated from model.");
  }

  const result = JSON.parse(rawText);
  
  // Add unique IDs to flashcards
  const flashcardsWithIds = result.flashcards.map((card: any, index: number) => ({
    ...card,
    id: `card-${Date.now()}-${index}`
  }));

  return {
    summary: result.summary,
    flashcards: flashcardsWithIds
  };
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
