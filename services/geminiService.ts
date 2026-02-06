
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, GenerationResult, AdditionalInfo } from "../types";

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
            Also, provide a comprehensive summary of the document and a list of 5-7 key takeaways or bullet points.
            Focus on key concepts, definitions, and important facts.`,
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
            description: "A comprehensive summary of the document content.",
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the most important points or concepts.",
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
        required: ["summary", "flashcards", "keyTakeaways"],
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
    keyTakeaways: result.keyTakeaways || [],
    flashcards: flashcardsWithIds
  };
};

export const getMoreTopicInfo = async (topic: string): Promise<AdditionalInfo> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explain the concept of "${topic}" briefly but comprehensively for a student. Include historical context if relevant and provide educational depth. Prioritize sources like Wikipedia, Britannica, or academic sites.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const explanation = response.text || "Could not find additional information.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web?.uri)
    .map((chunk: any) => ({
      title: chunk.web.title || "Reference",
      uri: chunk.web.uri
    }));

  return {
    explanation,
    sources: sources.slice(0, 4) // Keep it concise
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
