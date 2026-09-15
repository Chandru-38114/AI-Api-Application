import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Updated active models
const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

async function generateMCQsWithFallback(domain: string, difficulty: string) {
  const contents = `Generate 5 multiple-choice questions for the domain "${domain}" at difficulty level "${difficulty}".`;
  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      description: "List of 5 multiple choice questions",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 4 options",
          },
          correctAnswerIndex: {
            type: Type.INTEGER,
            description: "0-based index of the correct answer (0 to 3)",
          },
          explanation: { type: Type.STRING },
        },
        required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
      },
    },
  };

  let lastError: any = null;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      return response;
    } catch (error: any) {
      console.warn(`Failed with model ${model}:`, error?.message || error);
      lastError = error;
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  let requestedDomain = "this subject";
  try {
    const { domain, difficulty = "medium" } = await req.json();
    if (domain) requestedDomain = domain;

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const response = await generateMCQsWithFallback(domain, difficulty);

    const rawText = response.text || "[]";
    const questions = JSON.parse(rawText);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Gemini MCQ Generation Error:", error);

    return NextResponse.json({
      questions: [
        {
          id: "1",
          question: `Sample Question: What is a core concept in ${requestedDomain}?`,
          options: ["Core Concept A", "Data Storage", "Styling", "Network Protocol"],
          correctAnswerIndex: 0,
          explanation: "Fallback question displayed due to a backend connection issue.",
        },
      ],
    });
  }
}