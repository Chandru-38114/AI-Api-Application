"use client";

import { useState, useEffect, useId } from "react";
import dynamic from "next/dynamic";
import {
  Brain,
  Code2,
  Cpu,
  BookOpen,
  Play,
  Loader2,
  Trophy,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
  RotateCcw,
  Download,
  Zap,
  Target,
  Bug,
  ArrowLeft,
  Terminal,
} from "lucide-react";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0A0A0C] flex items-center justify-center border border-white/[0.08] rounded-2xl text-[#9CA3AF] text-sm gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-[#00F2FE]" /> Loading Code Editor...
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface MCQItem {
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface LogicItem {
  snippet: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface DebuggingItem {
  buggy_snippet: string;
  bug_description: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface Assessment {
  mcqs: MCQItem[];
  logic_questions: LogicItem[];
  debugging_question: DebuggingItem[];
}

interface EvalReport {
  userId: string;
  domain: string;
  score: number;
  level: string;
  tutorEligible: boolean;
  badgeIssued: boolean;
  breakdown: {
    mcqScore: string;
    logicScore: string;
    debugScore: string;
  };
  summaryText: string;
}

type View = "select" | "loading" | "assessment" | "submitting" | "results";

// ─── Static Data ──────────────────────────────────────────────────────────────

const DOMAINS = [
  {
    id: "ML",
    label: "Machine Learning",
    Icon: Brain,
    gradient: "from-[#9B51E0] to-[#E056FD]",
    iconGlow: "shadow-[0_0_20px_rgba(155,81,224,0.3)]",
  },
  {
    id: "WebDev",
    label: "Web Development",
    Icon: Code2,
    gradient: "from-[#00F2FE] to-[#4FACFE]",
    iconGlow: "shadow-[0_0_20px_rgba(0,242,254,0.3)]",
  },
  {
    id: "DSA",
    label: "Data Structures & Algorithms",
    Icon: Cpu,
    gradient: "from-[#00F2FE] to-[#9B51E0]",
    iconGlow: "shadow-[0_0_20px_rgba(0,242,254,0.3)]",
  },
];

const LEVEL_STYLE: Record<string, string> = {
  Beginner: "text-slate-300 bg-white/5 border-white/10",
  Intermediate: "text-[#00F2FE] bg-[#00F2FE]/10 border-[#00F2FE]/30",
  Advanced: "text-amber-300 bg-amber-400/10 border-amber-500/30",
  Expert: "text-[#9B51E0] bg-[#9B51E0]/10 border-[#9B51E0]/30 shadow-[0_0_10px_rgba(155,81,224,0.3)]",
};

// ─── Shared Sub-components ────────────────────────────────────────────────────

function PageHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="sticky top-0 z-50 px-4 py-3">
      <div className="max-w-3xl mx-auto bg-[#121318]/70 backdrop-blur-md border border-white/[0.08] rounded-2xl px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] flex items-center justify-center shadow-[0_0_14px_rgba(0,242,254,0.4)]">
            <Zap className="w-4 h-4 text-black fill-current" />
          </div>
          <span className="text-lg font-black text-white">
            Skill<span className="text-[#00F2FE]">Verse</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="text-sm text-[#9CA3AF] truncate">{subtitle}</span>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#00F2FE]" />
      </div>
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-[#9CA3AF]">{subtitle}</p>}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-150 ${
        selected
          ? "bg-[#00F2FE]/10 border-[#00F2FE]/60 text-[#00F2FE] font-medium shadow-[0_0_12px_rgba(0,242,254,0.15)]"
          : "bg-white/[0.03] border-white/[0.08] text-[#9CA3AF] hover:bg-white/[0.06] hover:border-white/[0.14] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-[#0A0A0C] border border-white/[0.08] rounded-xl p-4 overflow-x-auto text-xs text-[#00F2FE] font-mono whitespace-pre-wrap leading-relaxed">
      {code}
    </pre>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm text-rose-300 flex items-start gap-2.5">
      <XCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-400" />
      <span>{message}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const rawId = useId();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    setUserId(`anon_${rawId.replace(/:/g, "")}`);
  }, [rawId]);

  const [view, setView] = useState<View>("select");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Per-section answer state
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [logicAnswers, setLogicAnswers] = useState<Record<number, number>>({});
  const [debugAnswer, setDebugAnswer] = useState<number | null>(null);

  const [report, setReport] = useState<EvalReport | null>(null);

  const effectiveDomain = customDomain.trim() || selectedDomain;

  // ── Derived counts ────────────────────────────────────────────────────────
  const answeredCount =
    Object.keys(mcqAnswers).length +
    Object.keys(logicAnswers).length +
    (debugAnswer !== null ? 1 : 0);
    
  const totalQuestions =
    (assessment?.mcqs?.length ?? 0) +
    (assessment?.logic_questions?.length ?? 0) +
    (assessment?.debugging_question?.length ?? 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!effectiveDomain) return;
    setError(null);
    setView("loading");
    try {
      const res = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: effectiveDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate assessment.");
      setAssessment(data.assessment as Assessment);
      setMcqAnswers({});
      setLogicAnswers({});
      setDebugAnswer(null);
      setView("assessment");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setView("select");
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setView("submitting");
    setError(null);
    try {
      const mcqAnswersArr = assessment.mcqs.map((_, i) => mcqAnswers[i] ?? -1);
      const mcqCorrectArr = assessment.mcqs.map((q) => q.correct_option_index);
      const logicAnswersArr = assessment.logic_questions.map((_, i) => logicAnswers[i] ?? -1);
      const logicCorrectArr = assessment.logic_questions.map((q) => q.correct_option_index);
      const dbgAnswer = debugAnswer ?? -1;
      const dbgCorrect = assessment.debugging_question[0]?.correct_option_index ?? 0;

      const res = await fetch("/api/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          domain: effectiveDomain,
          mcqAnswers: mcqAnswersArr,
          mcqCorrect: mcqCorrectArr,
          logicAnswers: logicAnswersArr,
          logicCorrect: logicCorrectArr,
          debugAnswer: dbgAnswer,
          debugCorrect: dbgCorrect,
          codeOutput: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed.");
      setReport(data.report as EvalReport);
      setView("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setView("assessment");
    }
  };

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify({ report }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillverse_report_${report.domain.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setView("select");
    setReport(null);
    setAssessment(null);
    setSelectedDomain("");
    setCustomDomain("");
    setError(null);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Domain Selection
  // ══════════════════════════════════════════════════════════════════════════

  if (view === "select") {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-[#F9FAFB] flex flex-col font-sans">
        <PageHeader subtitle="Domain Assessment" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">

          {/* Hero text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Start Your Assessment</h1>
            <p className="text-[#9CA3AF] text-sm">
              Score{" "}
              <span className="text-[#00F2FE] font-semibold">≥ 85%</span>{" "}
              to earn a{" "}
              <span className="text-[#00F2FE] font-semibold">Verified Tutor Badge</span>
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Preset domain cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DOMAINS.map(({ id, label, Icon, gradient, iconGlow }) => {
              const isActive = selectedDomain === id && !customDomain;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setSelectedDomain(id); setCustomDomain(""); }}
                  className={`relative rounded-2xl border bg-white/[0.03] backdrop-blur-md p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] hover:bg-white/[0.06] ${
                    isActive
                      ? "border-[#00F2FE]/50 ring-1 ring-[#00F2FE]/30 bg-[#00F2FE]/5"
                      : "border-white/[0.08]"
                  }`}
                >
                  {isActive && (
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE] absolute top-3 right-3" />
                  )}
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 ${iconGlow}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{id}</p>
                </button>
              );
            })}
          </div>

          {/* Custom domain input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block">
              Or enter a custom domain
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => { setCustomDomain(e.target.value); setSelectedDomain(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && effectiveDomain) {
                  handleStart();
                }
              }}
              placeholder="e.g. React, Python, DevOps, Cloud…"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-[#F9FAFB] placeholder-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#00F2FE]/40 focus:border-[#00F2FE]/40 transition-all"
            />
          </div>

          {/* Start button */}
          <button
            type="button"
            onClick={handleStart}
            disabled={!effectiveDomain}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-black font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_0_20px_rgba(0,242,254,0.3)]"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Assessment{effectiveDomain ? ` · ${effectiveDomain}` : ""}
          </button>

          {/* What to expect */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
              What to expect
            </p>
            <ul className="space-y-2.5 text-sm text-[#9CA3AF]">
              {[
                "3 domain-specific multiple choice questions",
                "2 logic & code tracing challenges",
                "1 code debugging challenge",
                "Integrated code playground to test your thinking",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Loading / Submitting spinners
  // ══════════════════════════════════════════════════════════════════════════

  if (view === "loading" || view === "submitting") {
    const msg =
      view === "loading"
        ? "Generating your custom assessment..."
        : "Evaluating your answers…";
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#00F2FE] mx-auto drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]" />
          <p className="text-[#F9FAFB] text-lg font-medium">{msg}</p>
          <p className="text-[#9CA3AF] text-sm">
            {view === "loading" 
              ? `Building questions tailored to ${effectiveDomain}` 
              : "Calculating score & checking badge eligibility"}
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Results
  // ══════════════════════════════════════════════════════════════════════════

  if (view === "results" && report) {
    const levelStyle = LEVEL_STYLE[report.level] ?? LEVEL_STYLE["Beginner"];
    const shortfall = Math.max(0, 85 - report.score);

    return (
      <div className="min-h-screen bg-[#0A0A0C] text-[#F9FAFB] flex flex-col font-sans">
        <PageHeader subtitle="Assessment Report" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-6">

          {/* Score hero */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-8 text-center space-y-5">
            <Trophy className="w-14 h-14 text-[#00F2FE] mx-auto drop-shadow-[0_0_16px_rgba(0,242,254,0.5)]" />
            <div>
              <p className="text-6xl font-black text-white tracking-tight">{report.score}%</p>
              <p className="text-[#9CA3AF] text-sm mt-1">{report.domain} Assessment</p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-bold ${levelStyle}`}
            >
              <Award className="w-4 h-4" />
              {report.level}
            </span>

            {report.badgeIssued && (
              <div className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
                <Zap className="w-5 h-5 text-[#00F2FE] fill-current" />
                <span className="text-[#00F2FE] font-bold text-sm">
                  Verified Tutor Badge Earned!
                </span>
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00F2FE]" />
              Score Breakdown
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "MCQs (3 Qs)", value: report.breakdown.mcqScore },
                { label: "Logic (2 Qs)", value: report.breakdown.logicScore },
                { label: "Debug (1 Q)", value: report.breakdown.debugScore },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white/[0.03] rounded-xl border border-white/[0.08] p-4"
                >
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Summary
            </p>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">{report.summaryText}</p>
          </div>

          {/* Tutor eligibility feedback */}
          {!report.badgeIssued && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-sm text-[#9CA3AF]">
              <strong className="text-[#F9FAFB]">Tutor Badge not earned.</strong>{" "}
              Score ≥ 85% to qualify. You scored{" "}
              <span className="text-white font-semibold">{report.score}%</span> —{" "}
              {shortfall > 0 ? (
                <>
                  you need{" "}
                  <span className="text-white font-semibold">
                    {shortfall.toFixed(2)}% more.
                  </span>
                </>
              ) : (
                "try again to improve your score."
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report (JSON)
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-black font-bold text-sm shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-4 h-4" />
              New Assessment
            </button>
          </div>

        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Active Assessment
  // ══════════════════════════════════════════════════════════════════════════

  if (!assessment) return null;

  const debugQ = assessment.debugging_question?.[0];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F9FAFB] flex flex-col font-sans">

      {/* Sticky header with progress */}
      <header className="sticky top-0 z-50 px-4 py-3">
        <div className="max-w-3xl mx-auto bg-[#121318]/70 backdrop-blur-md border border-white/[0.08] rounded-2xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              title="Change Domain"
              className="p-1 rounded-lg hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] flex items-center justify-center shadow-[0_0_14px_rgba(0,242,254,0.4)]">
              <Zap className="w-4 h-4 text-black fill-current" />
            </div>
            <span className="text-lg font-black text-white hidden sm:inline">
              Skill<span className="text-[#00F2FE]">Verse</span>
            </span>
            <span className="text-white/20 hidden sm:inline">·</span>
            <span className="text-sm text-[#9CA3AF] truncate max-w-[120px] sm:max-w-none">
              {effectiveDomain}
            </span>
          </div>
          <span className="text-xs font-mono text-[#9CA3AF]">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-1.5 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] transition-all duration-300"
            style={{ width: totalQuestions > 0 ? `${(answeredCount / totalQuestions) * 100}%` : "0%" }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-10">

        {error && <ErrorBanner message={error} />}

        {/* ── SECTION 1: MCQs ─────────────────────────────────────────────── */}
        {assessment.mcqs?.length > 0 && (
          <section>
            <SectionHeading
              icon={BookOpen}
              title="Multiple Choice Questions"
              subtitle={`${assessment.mcqs.length} questions · Select the best answer`}
            />
            <div className="space-y-6">
              {assessment.mcqs.map((q, qi) => (
                <div
                  key={qi}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 space-y-4"
                >
                  <p className="text-sm font-medium text-[#F9FAFB] leading-relaxed">
                    <span className="text-[#00F2FE] font-bold mr-2">Q{qi + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <OptionButton
                        key={oi}
                        label={`${String.fromCharCode(65 + oi)}. ${opt}`}
                        selected={mcqAnswers[qi] === oi}
                        onClick={() =>
                          setMcqAnswers((prev) => ({ ...prev, [qi]: oi }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 2: Logic Tracing ─────────────────────────────────────── */}
        {assessment.logic_questions?.length > 0 && (
          <section>
            <SectionHeading
              icon={ChevronRight}
              title="Logic & Code Tracing"
              subtitle={`${assessment.logic_questions.length} questions · Read the snippet, then answer`}
            />
            <div className="space-y-6">
              {assessment.logic_questions.map((q, qi) => (
                <div
                  key={qi}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 space-y-4"
                >
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Code Snippet
                  </p>
                  <CodeBlock code={q.snippet} />
                  <p className="text-sm font-medium text-[#F9FAFB] leading-relaxed">
                    <span className="text-[#9B51E0] font-bold mr-2">L{qi + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <OptionButton
                        key={oi}
                        label={`${String.fromCharCode(65 + oi)}. ${opt}`}
                        selected={logicAnswers[qi] === oi}
                        onClick={() =>
                          setLogicAnswers((prev) => ({ ...prev, [qi]: oi }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 3: Debugging Challenge ──────────────────────────────── */}
        {debugQ && (
          <section>
            <SectionHeading
              icon={Bug}
              title="Code Debugging Challenge"
              subtitle="1 question · Identify the correct fix"
            />
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Buggy Code Snippet
                </p>
                <CodeBlock code={debugQ.buggy_snippet} />
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-amber-500/20 p-3 text-sm">
                <span className="text-amber-300 font-semibold">Bug: </span>
                <span className="text-[#9CA3AF]">{debugQ.bug_description}</span>
              </div>
              <p className="text-sm font-medium text-[#F9FAFB] leading-relaxed">
                <span className="text-amber-400 font-bold mr-2">D1.</span>
                {debugQ.question}
              </p>
              <div className="space-y-2">
                {debugQ.options.map((opt, oi) => (
                  <OptionButton
                    key={oi}
                    label={`${String.fromCharCode(65 + oi)}. ${opt}`}
                    selected={debugAnswer === oi}
                    onClick={() => setDebugAnswer(oi)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 4: Code Playground ──────────────────────────────────── */}
        <section>
          <SectionHeading
            icon={Terminal}
            title="Code Playground"
            subtitle="Test snippets or verify your logic — connected to /api/run"
          />
          <div className="h-[380px] rounded-2xl overflow-hidden border border-white/[0.08]">
            <CodeEditor />
          </div>
        </section>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div className="pb-10 space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-black font-bold text-base shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:opacity-90 transition-opacity"
          >
            <CheckCircle2 className="w-5 h-5" />
            Submit Assessment
          </button>
          <p className="text-center text-xs text-[#4B5563]">
            {answeredCount < totalQuestions
              ? `${totalQuestions - answeredCount} question(s) unanswered — you can still submit`
              : "All questions answered — you are ready!"}
          </p>
        </div>

      </main>
    </div>
  );
}