import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, language = "python" } = body;

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Map languages to Judge0 Language IDs
    const judge0LanguageMap: Record<string, number> = {
      python: 71,     // Python (3.8.1)
      javascript: 63, // JavaScript (Node.js 12.14.0)
      typescript: 74, // TypeScript (3.7.4)
      cpp: 54,        // C++ (GCC 9.2.0)
      java: 62,       // Java (OpenJDK 13.0.1)
    };
    const languageId = judge0LanguageMap[language.toLowerCase()] || 71;

    // Use Judge0 CE API via RapidAPI with wait=true to wait for execution results
    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?wait=true&fields=stdout,stderr,compile_output,status", {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Judge0 API Error:", errText);
      return NextResponse.json({ error: "Code execution engine error" }, { status: response.status });
    }

    const data = await response.json();
    const output = data.stdout || data.stderr || data.compile_output || data.status?.description || "Executed successfully with no output.";

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Execution handler error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
