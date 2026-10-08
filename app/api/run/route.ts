import { NextResponse } from "next/server";

// Compiler mappings for Wandbox API
const COMPILER_MAP: Record<string, string> = {
  javascript: "nodejs-head",
  js: "nodejs-head",
  typescript: "typescript-5.3.3",
  ts: "typescript-5.3.3",
  python: "cpython-head",
  py: "cpython-head",
  cpp: "gcc-head",
  "c++": "gcc-head",
  c: "gcc-head-c",
  java: "openjdk-head",
};

export async function POST(req: Request) {
  try {
    const { code, language = "javascript" } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "No code provided for execution." },
        { status: 400 }
      );
    }

    const compiler = COMPILER_MAP[language.toLowerCase()] || "nodejs-head";

    const response = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler,
        code,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to connect to execution engine." },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Combine program output, compiler errors, or runtime errors
    const output =
      data.program_output ||
      data.compiler_error ||
      data.program_error ||
      "Code executed successfully with no output.";

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Execution Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while executing code." },
      { status: 500 }
    );
  }
}