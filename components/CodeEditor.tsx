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


// ─── Component ────────────────────────────────────────────────────────────────


export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>("python");
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [code, setCode] = useState<string>(LANGUAGE_CONFIG.python.boilerplate);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<OutputState | null>(null);

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
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          code: code,
        }),
      });

      const data = await res.json();
      const elapsed = Date.now() - t0;

      if (!res.ok) {
        throw new Error(data.error || `API responded with ${res.status} ${res.statusText}`);
      }

      setOutput({
        stdout: data.output || "",
        stderr: "",
        exitCode: 0,
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

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
      {/* ── Control Bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-white/[0.08] bg-[#121318]/70 backdrop-blur-md">
        {/* Language selector */}
        <div className="relative">
          <select
            aria-label="Select language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00F2FE] cursor-pointer transition-all"
          >
            {(Object.keys(LANGUAGE_CONFIG) as Language[]).map((key) => (
              <option key={key} value={key} className="bg-[#121318] text-white">
                {LANGUAGE_CONFIG[key].label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-slate-400" />
        </div>

        {/* Theme selector */}
        <div className="relative">
          <select
            aria-label="Select editor theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00F2FE] cursor-pointer transition-all"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#121318] text-white">
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-slate-400" />
        </div>

        <span className="flex-1" />

        {/* Ask AI Hint */}
        <button
          onClick={handleAskAIHint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#9B51E0]/30 bg-[#9B51E0]/10 text-[#9B51E0] hover:bg-[#9B51E0]/20 shadow-[0_0_10px_rgba(155,81,224,0.2)] transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Ask AI Hint
        </button>

        {/* Run Code */}
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="btn-primary-glow flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-black" />
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
      <div className="border-t border-white/[0.08] bg-[#0A0A0C]/90">
        {/* Console header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#121318]/80 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00F2FE]" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Output Console
            </span>

            {/* Exit status badge */}
            {output && !output.fetchError && output.exitCode !== null && (
              <span
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  exitOk
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
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
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-[#00F2FE]" />
              {output.elapsedMs} ms
            </div>
          )}
        </div>

        {/* Console body */}
        <div className="h-44 overflow-y-auto bg-[#0A0A0C] font-mono text-xs p-4 space-y-1.5 scrollbar-thin">
          {/* Idle state */}
          {!output && !isRunning && (
            <p className="text-slate-600 select-none">
              // Click &ldquo;Run Code&rdquo; to see execution output…
            </p>
          )}

          {/* Running state */}
          {isRunning && (
            <p className="text-[#00F2FE] animate-pulse font-semibold">● Compiling and executing via sandbox…</p>
          )}

          {/* Network/API error */}
          {output?.fetchError && (
            <div className="flex items-start gap-2 text-rose-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <pre className="whitespace-pre-wrap">{output.fetchError}</pre>
            </div>
          )}

          {/* Stdout */}
          {output && !output.fetchError && output.stdout && (
            <pre className="whitespace-pre-wrap text-[#00F2FE]">{output.stdout}</pre>
          )}

          {/* Stderr (compile errors, runtime errors) */}
          {output && !output.fetchError && output.stderr && (
            <>
              {output.stdout && (
                <hr className="border-white/[0.08] my-2" />
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
              <p className="text-[#9CA3AF] italic">
                (no output – process exited successfully)
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
