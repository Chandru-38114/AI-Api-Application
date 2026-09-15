import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─── Shared sub-schemas ────────────────────────────────────────────────────────

const mcqItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: "The question text" },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 answer options",
    },
    correct_option_index: {
      type: Type.INTEGER,
      description: "0-based index of the correct option (0 to 3)",
    },
    explanation: { type: Type.STRING, description: "Brief explanation of the correct answer" },
  },
  required: ["question", "options", "correct_option_index", "explanation"],
};

const logicItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    snippet: { type: Type.STRING, description: "Code snippet the student must trace" },
    question: { type: Type.STRING, description: "The tracing or logic question" },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 answer options",
    },
    correct_option_index: {
      type: Type.INTEGER,
      description: "0-based index of the correct option (0 to 3)",
    },
    explanation: { type: Type.STRING },
  },
  required: ["snippet", "question", "options", "correct_option_index", "explanation"],
};

const debuggingItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    buggy_snippet: { type: Type.STRING, description: "Code snippet containing an intentional bug" },
    bug_description: { type: Type.STRING, description: "Short description of what the bug is" },
    question: { type: Type.STRING, description: "Question asking the student to identify the fix" },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 fix choices",
    },
    correct_option_index: {
      type: Type.INTEGER,
      description: "0-based index of the correct fix (0 to 3)",
    },
    explanation: { type: Type.STRING },
  },
  required: [
    "buggy_snippet",
    "bug_description",
    "question",
    "options",
    "correct_option_index",
    "explanation",
  ],
};

// ─── Helper: Exponential Backoff for 503 Spike Protection ───────────────────────

async function generateWithRetry(params: Parameters<typeof ai.models.generateContent>[0], retries = 3, initialDelay = 1500) {
  let delay = initialDelay;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const is503 =
        error?.status === 503 ||
        error?.code === 503 ||
        error?.message?.includes("503") ||
        error?.message?.includes("UNAVAILABLE") ||
        error?.message?.includes("high demand");

      if (is503 && attempt < retries) {
        console.warn(`[Gemini API] 503 High Demand (Attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Doubles wait time: 1.5s -> 3s -> 6s
      } else {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate content after maximum retry attempts.");
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain } = body as { domain?: string };

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const response = await generateWithRetry({
      model: "gemini-3.6-flash",
      contents: `Generate a technical assessment for the software/engineering domain "${domain}".
Return EXACTLY:
- 3 domain-specific multiple-choice questions (mcqs)
- 2 code tracing / logic questions (logic_questions)
- 1 code debugging question (debugging_question)
All code snippets must be relevant to "${domain}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcqs: {
              type: Type.ARRAY,
              description: "3 domain-specific MCQs",
              items: mcqItemSchema,
            },
            logic_questions: {
              type: Type.ARRAY,
              description: "2 logic/tracing questions",
              items: logicItemSchema,
            },
            debugging_question: {
              type: Type.ARRAY,
              description: "1 code debugging question",
              items: debuggingItemSchema,
            },
          },
          required: ["mcqs", "logic_questions", "debugging_question"],
        },
      },
    });

    const rawText = response.text || "{}";
    const assessment = JSON.parse(rawText);

    return NextResponse.json({ domain, assessment });
  } catch (error: any) {
    console.error("Assessment generation error:", error);

    const is503 =
      error?.status === 503 ||
      error?.code === 503 ||
      error?.message?.includes("503") ||
      error?.message?.includes("UNAVAILABLE") ||
      error?.message?.includes("high demand");

    if (is503) {
      return NextResponse.json(
        {
          error: "The AI service is currently experiencing heavy traffic spikes. Please try again in a few seconds.",
          assessment: { mcqs: [], logic_questions: [], debugging_question: [] },
        },
        { status: 503 }
      );
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        error: message,
        assessment: {
          mcqs: [],
          logic_questions: [],
          debugging_question: [],
        },
      },
      { status: 500 }
    );
  }
}