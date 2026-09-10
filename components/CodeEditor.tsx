"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Lightbulb,
  ChevronDown,
  Terminal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = "python" | "javascript" | "cpp";
type Theme = "vs-dark" | "vs-light" | "hc-black";

interface LanguageConfig {
  label: string;
  /** Language identifier sent to the Piston API */
  pistonLang: string;
  /** Language identifier understood by Monaco */
  monacoLang: string;
  boilerplate: string;
}

interface PistonRun {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
}

interface PistonResponse {
  language: string;
  version: string;
  run: PistonRun;
  compile?: PistonRun;
}

interface OutputState {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  /** Wall-clock time from fetch start to response, in ms */
  elapsedMs: number;
  /** Network / API-level error message (not a runtime error) */
  fetchError: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
  python: {
    label: "Python",
    pistonLang: "python",
    monacoLang: "python",
    boilerplate: `# Python – Hello World
print("Hello, World!")

# Try something more interesting:
for i in range(1, 6):
    print(f"  {i}. Counting…")
`,
  },
  javascript: {
    label: "JavaScript",
    pistonLang: "javascript",
    monacoLang: "javascript",
    boilerplate: `// JavaScript – Hello World
console.log("Hello, World!");

// Try something more interesting:
const nums = [1, 2, 3, 4, 5];
console.log("Sum:", nums.reduce((a, b) => a + b, 0));
`,
  },
  cpp: {
    label: "C++",
    pistonLang: "c++",
    monacoLang: "cpp",
    boilerplate: `// C++ – Hello World
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;

    // Try something more interesting:
    for (int i = 1; i <= 5; i++) {
        std::cout << "  " << i << ". Counting…" << std::endl;
    }
    return 0;
}
`,
  },
};

const THEMES: { value: Theme; label: string }[] = [
  { value: "vs-dark", label: "Dark" },
  { value: "vs-light", label: "Light" },
  { value: "hc-black", label: "High Contrast" },
];

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDarkTheme(t: Theme) {
  return t === "vs-dark" || t === "hc-black";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>("python");
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [code, setCode] = useState<string>(LANGUAGE_CONFIG.python.boilerplate);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<OutputState | null>(null);

  const dark = isDarkTheme(theme);

  // Reset editor content when language changes
  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setCode(LANGUAGE_CONFIG[lang].boilerplate);
    setOutput(null);
  }, []);

  // Execute code via Piston
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);

    const t0 = Date.now();

    try {
      const res = await fetch(PISTON_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: LANGUAGE_CONFIG[language].pistonLang,
          version: "*",
          files: [{ content: code }],
        }),
      });

      if (!res.ok) {
        throw new Error(`API responded with ${res.status} ${res.statusText}`);
      }

      const data: PistonResponse = await res.json();
      const elapsed = Date.now() - t0;

      // Merge compile-stage stderr (e.g. C++ build errors) with run stderr
      const compileSterr = data.compile?.stderr ?? "";
      const runStderr = data.run.stderr ?? "";
      const mergedStderr = [compileSterr, runStderr].filter(Boolean).join("\n").trim();

      setOutput({
        stdout: data.run.output || data.run.stdout || "",
        stderr: mergedStderr,
        exitCode: data.run.code,
        elapsedMs: elapsed,
        fetchError: null,
      });
    } catch (err) {
      setOutput({
        stdout: "",
        stderr: "",
        exitCode: null,
        elapsedMs: Date.now() - t0,
        fetchError: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning, language]);

  // Placeholder – wired up by a parent in a future step
  const handleAskAIHint = useCallback(() => {
    console.info("[CodeEditor] Ask AI Hint – not yet implemented");
  }, []);

  const config = LANGUAGE_CONFIG[language];
  const exitOk = output?.exitCode === 0;

  // ── Tailwind class helpers ────────────────────────────────────────────────
  const selectCls = dark
    ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 focus:ring-blue-500"
    : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-blue-500";

  return (
    <div
      className={`flex flex-col h-full rounded-xl overflow-hidden border ${
        dark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
      }`}
    >
      {/* ── Control Bar ───────────────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center gap-2 px-4 py-2.5 border-b ${
          dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        }`}
      >
        {/* Language selector */}
        <div className="relative">
          <select
            aria-label="Select language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className={`appearance-none pl-3 pr-8 py-1.5 text-sm rounded-md border cursor-pointer
                        focus:outline-none focus:ring-2 transition-colors ${selectCls}`}
          >
            {(Object.keys(LANGUAGE_CONFIG) as Language[]).map((key) => (
              <option key={key} value={key}>
                {LANGUAGE_CONFIG[key].label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
              dark ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>

        {/* Theme selector */}
        <div className="relative">
          <select
            aria-label="Select editor theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className={`appearance-none pl-3 pr-8 py-1.5 text-sm rounded-md border cursor-pointer
                        focus:outline-none focus:ring-2 transition-colors ${selectCls}`}
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
              dark ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>

        <span className="flex-1" />

        {/* Ask AI Hint */}
        <button
          onClick={handleAskAIHint}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
            dark
              ? "bg-purple-900/40 border-purple-700 text-purple-300 hover:bg-purple-800/60"
              : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Ask AI Hint
        </button>

        {/* Run Code */}
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-md
                     bg-green-600 hover:bg-green-500 active:bg-green-700 text-white
                     transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* ── Monaco Editor ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={config.monacoLang}
          theme={theme}
          value={code}
          onChange={(val) => setCode(val ?? "")}
          options={{
            fontSize: 14,
            lineNumbers: "on",
            minimap: { enabled: true },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            padding: { top: 16, bottom: 16 },
            tabSize: 4,
          }}
        />
      </div>

      {/* ── Output Console ────────────────────────────────────────────────── */}
      <div className={`border-t ${dark ? "border-gray-700" : "border-gray-200"}`}>
        {/* Console header */}
        <div
          className={`flex items-center justify-between px-4 py-2 ${
            dark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Terminal
              className={`w-4 h-4 ${dark ? "text-gray-400" : "text-gray-500"}`}
            />
            <span
              className={`text-sm font-medium ${
                dark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Output Console
            </span>

            {/* Exit status badge */}
            {output && !output.fetchError && output.exitCode !== null && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  exitOk
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {exitOk ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {exitOk ? "Exited 0" : `Exit ${output.exitCode}`}
              </span>
            )}
          </div>

          {/* Elapsed time */}
          {output && (
            <div
              className={`flex items-center gap-1 text-xs ${
                dark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {output.elapsedMs} ms
            </div>
          )}
        </div>

        {/* Console body */}
        <div className="h-44 overflow-y-auto bg-gray-950 font-mono text-sm p-4 space-y-1">
          {/* Idle state */}
          {!output && !isRunning && (
            <p className="text-gray-600 select-none">
              // Click &ldquo;Run Code&rdquo; to see output here…
            </p>
          )}

          {/* Running state */}
          {isRunning && (
            <p className="text-yellow-400 animate-pulse">● Executing…</p>
          )}

          {/* Network/API error */}
          {output?.fetchError && (
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <pre className="whitespace-pre-wrap">{output.fetchError}</pre>
            </div>
          )}

          {/* Stdout */}
          {output && !output.fetchError && output.stdout && (
            <pre className="whitespace-pre-wrap text-green-300">{output.stdout}</pre>
          )}

          {/* Stderr (compile errors, runtime errors) */}
          {output && !output.fetchError && output.stderr && (
            <>
              {output.stdout && (
                <hr className="border-gray-800 my-2" />
              )}
              <div className="flex items-start gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <pre className="whitespace-pre-wrap">{output.stderr}</pre>
              </div>
            </>
          )}

          {/* Empty-output success */}
          {output &&
            !output.fetchError &&
            !output.stdout &&
            !output.stderr &&
            output.exitCode === 0 && (
              <p className="text-gray-500 italic">
                (no output – process exited successfully)
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
