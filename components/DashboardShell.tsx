"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Brain,
  Trophy,
  Zap,
  User,
  ChevronRight,
  BookOpen,
  Tag,
  Play,
  Star,
  TrendingUp,
  Award,
  Target,
  Cpu,
  Network,
  Medal,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "coding" | "mcq" | "scoreboard";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const PROBLEM = {
  id: 1,
  title: "Two Sum",
  difficulty: "Medium" as Difficulty,
  tags: ["Array", "Hash Table"],
  description:
    'Given an array of integers <code class="bg-white/10 px-1 rounded text-[#00F2FE]">nums</code> and an integer <code class="bg-white/10 px-1 rounded text-[#00F2FE]">target</code>, return the <strong>indices</strong> of the two numbers such that they add up to <code class="bg-white/10 px-1 rounded text-[#00F2FE]">target</code>.<br/><br/>You may assume that each input has <strong>exactly one solution</strong>, and you may not use the same element twice. Return the answer in any order.',
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9, so we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] == 6, so we return [1, 2].",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "−10⁹ ≤ nums[i] ≤ 10⁹",
    "−10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
};

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-500/30",
  Medium: "text-[#00F2FE] bg-[#00F2FE]/10 border-[#00F2FE]/30 shadow-[0_0_10px_rgba(0,242,254,0.2)]",
  Hard: "text-[#9B51E0] bg-[#9B51E0]/10 border-[#9B51E0]/30 shadow-[0_0_10px_rgba(155,81,224,0.2)]",
};

const MCQ_DOMAINS = [
  {
    id: "python",
    title: "Python",
    Icon: Code2,
    gradient: "from-[#00F2FE] to-[#4FACFE]",
    iconGlow: "shadow-[0_0_20px_rgba(0,242,254,0.3)]",
    description:
      "Core Python syntax, data structures, OOP, iterators, and standard library essentials.",
    questions: 40,
    duration: "20 min",
    elo: "+25 Elo on pass",
  },
  {
    id: "ml",
    title: "Machine Learning",
    Icon: Brain,
    gradient: "from-[#9B51E0] to-[#E056FD]",
    iconGlow: "shadow-[0_0_20px_rgba(155,81,224,0.3)]",
    description:
      "Supervised & unsupervised learning, bias-variance tradeoff, model evaluation, sklearn.",
    questions: 35,
    duration: "25 min",
    elo: "+35 Elo on pass",
  },
  {
    id: "nn",
    title: "Neural Networks",
    Icon: Network,
    gradient: "from-[#00F2FE] to-[#9B51E0]",
    iconGlow: "shadow-[0_0_20px_rgba(0,242,254,0.3)]",
    description:
      "Perceptrons, backpropagation, activation functions, vanishing gradients, architectures.",
    questions: 30,
    duration: "22 min",
    elo: "+40 Elo on pass",
  },
  {
    id: "dl",
    title: "Deep Learning",
    Icon: Cpu,
    gradient: "from-[#FF007A] to-[#9B51E0]",
    iconGlow: "shadow-[0_0_20px_rgba(255,0,122,0.3)]",
    description:
      "CNNs, RNNs, Transformers, attention mechanisms, PyTorch/TensorFlow, GANs.",
    questions: 30,
    duration: "25 min",
    elo: "+45 Elo on pass",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Arjun Sharma",  initials: "AS", elo: 2140, domain: "Deep Learning",    wins: 42, losses: 5,  trend: "up"   },
  { rank: 2, name: "Priya Nair",    initials: "PN", elo: 2085, domain: "Machine Learning",  wins: 38, losses: 7,  trend: "up"   },
  { rank: 3, name: "Rohan Mehra",   initials: "RM", elo: 1980, domain: "Neural Networks",   wins: 35, losses: 9,  trend: "same" },
  { rank: 4, name: "Sneha Iyer",    initials: "SI", elo: 1875, domain: "Python",            wins: 30, losses: 11, trend: "up"   },
  { rank: 5, name: "Karan Patel",   initials: "KP", elo: 1820, domain: "Deep Learning",    wins: 28, losses: 13, trend: "down" },
  { rank: 6, name: "Divya Rao",     initials: "DR", elo: 1760, domain: "Machine Learning",  wins: 25, losses: 14, trend: "down" },
  { rank: 7, name: "Vikram Singh",  initials: "VS", elo: 1700, domain: "Python",            wins: 22, losses: 16, trend: "same" },
  { rank: 8, name: "Ananya Gupta", initials: "AG", elo: 1645, domain: "Neural Networks",   wins: 20, losses: 17, trend: "up"   },
];

const DOMAIN_COLOR: Record<string, string> = {
  "Python":           "text-[#00F2FE]",
  "Machine Learning": "text-[#9B51E0]",
  "Neural Networks":  "text-[#00F2FE]",
  "Deep Learning":    "text-[#FF007A]",
};

const PERF_STATS = [
  { label: "Problems Solved", value: "24", Icon: Target,    color: "text-[#00F2FE]",  glow: "shadow-[0_0_15px_rgba(0,242,254,0.3)]" },
  { label: "Win Rate",        value: "68%", Icon: TrendingUp, color: "text-[#9B51E0]", glow: "shadow-[0_0_15px_rgba(155,81,224,0.3)]" },
  { label: "Best Streak",     value: "7×",  Icon: Star,      color: "text-amber-400", glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)]" },
  { label: "Global Rank",     value: "#12", Icon: Award,     color: "text-[#00F2FE]",  glow: "shadow-[0_0_15px_rgba(0,242,254,0.3)]" },
];

const TABS: { id: Tab; label: string; Icon: typeof Code2 }[] = [
  { id: "coding",     label: "LeetCode Coding",                Icon: Code2   },
  { id: "mcq",        label: "MCQ Knowledge Evaluation",       Icon: BookOpen },
  { id: "scoreboard", label: "Student Scoreboard & Rankings",  Icon: Trophy  },
];

// ─── Dashboard Shell ──────────────────────────────────────────────────────────

export default function DashboardShell() {
  const [activeTab, setActiveTab] = useState<Tab>("coding");

  // Quiz State
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<string | null>(null);
  const [activeQuizDomain, setActiveQuizDomain] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleStartQuiz = async (domainId: string, domainTitle: string) => {
    try {
      setIsLoadingQuiz(domainId);
      const res = await fetch("/api/mcq/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ensure "Full Stack Web Development" per request or dynamic domain. Let's pass the dynamic domainTitle but fall back.
        body: JSON.stringify({ domain: domainTitle || "Full Stack Web Development", difficulty: "medium" }),
      });
      
      if (!res.ok) throw new Error("Failed to generate quiz");
      
      const data = await res.json();
      
      setActiveQuizDomain(domainTitle);
      setActiveQuiz(data.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizCompleted(false);
    } catch (err) {
      console.error(err);
      alert("Error starting quiz. Please try again.");
    } finally {
      setIsLoadingQuiz(null);
    }
  };

  return (
    <div className="min-h-screen text-[#F9FAFB] flex flex-col">

      {/* ── Floating Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-screen-2xl mx-auto w-full">
        <div className="bg-[#121318]/70 backdrop-blur-md border border-white/[0.08] rounded-2xl px-6 h-16 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.35)]">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <div className="leading-tight select-none">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                AI Learning Platform
              </p>
              <h1 className="text-lg font-black tracking-tight text-white">
                Skill<span className="text-[#00F2FE]">Verse</span>
              </h1>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Assessment Pipeline Link */}
            <Link
              href="/assessment"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
              Domain Assessment
            </Link>

            {/* Elo chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#00F2FE]/30 bg-[#00F2FE]/10 text-[#00F2FE] text-sm font-bold select-none shadow-[0_0_12px_rgba(0,242,254,0.2)]">
              <Zap className="w-3.5 h-3.5 fill-current" />
              1 200 Elo
            </div>

            {/* Profile badge */}
            <button className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-medium text-slate-200">Student</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ──────────────────────────────────────────────────── */}
      <nav className="mt-4 px-4 sm:px-6 max-w-screen-2xl mx-auto w-full">
        <div className="p-1.5 bg-[#121318]/50 backdrop-blur-md rounded-2xl border border-white/[0.06] flex gap-2 overflow-x-auto scrollbar-none shadow-md">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap transition-all rounded-xl ${
                  active
                    ? "bg-gradient-to-r from-[#00F2FE]/20 to-[#9B51E0]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-[0_0_15px_rgba(0,242,254,0.25)] font-semibold"
                    : "border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* ── TAB: LeetCode Coding ─────────────────────────────────────────── */}
        {activeTab === "coding" && (
          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-13rem)]">

            {/* Problem sidebar */}
            <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

              {/* Title + difficulty */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 shadow-lg">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Problem #{PROBLEM.id}</p>
                    <h2 className="text-xl font-bold text-white">{PROBLEM.title}</h2>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLE[PROBLEM.difficulty]}`}>
                    {PROBLEM.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PROBLEM.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                      <Tag className="w-3 h-3 text-[#00F2FE]" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 shadow-lg">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                  <BookOpen className="w-4 h-4 text-[#00F2FE]" /> Description
                </h3>
                <p
                  className="text-sm text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: PROBLEM.description }}
                />
              </div>

              {/* Examples */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 space-y-4 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200">Examples</h3>
                {PROBLEM.examples.map((ex, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Example {i + 1}</p>
                    <div className="rounded-xl bg-[#0A0A0C]/90 border border-white/[0.08] p-3 space-y-1.5 font-mono text-xs">
                      <p>
                        <span className="text-slate-500">Input: </span>
                        <span className="text-[#00F2FE]">{ex.input}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Output: </span>
                        <span className="text-[#9B51E0]">{ex.output}</span>
                      </p>
                      {ex.explanation && (
                        <p className="text-slate-400 pt-2 border-t border-white/[0.06] text-[11px]">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Constraints</h3>
                <ul className="space-y-2">
                  {PROBLEM.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <ChevronRight className="w-3.5 h-3.5 text-[#00F2FE] mt-0.5 shrink-0" />
                      <code className="font-mono text-slate-300">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Code Editor */}
            <div className="flex-1 min-w-0 min-h-[500px]">
              <CodeEditor />
            </div>
          </div>
        )}

        {/* ── TAB: MCQ Evaluation ──────────────────────────────────────────── */}
        {activeTab === "mcq" && (
          <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">MCQ Knowledge Evaluation</h2>
              <p className="text-slate-400 text-sm">
                Select a domain to start an AI-powered timed quiz and earn Elo rating points
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {MCQ_DOMAINS.map(({ id, title, Icon, gradient, iconGlow, description, questions, duration, elo }) => (
                <div
                  key={id}
                  className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[#00F2FE]/40 hover:shadow-[0_0_24px_rgba(0,242,254,0.12)] hover:-translate-y-1"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center ${iconGlow}`}>
                    <Icon className="w-6 h-6 text-black" />
                  </div>

                  {/* Text */}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#00F2FE]" />
                      {questions} questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#9B51E0]" />
                      {duration}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#00F2FE]">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {elo}
                    </span>
                    <button
                      onClick={() => handleStartQuiz(id, title)}
                      disabled={isLoadingQuiz === id}
                      className="btn-primary-glow flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {isLoadingQuiz === id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current text-black" />
                      )}
                      {isLoadingQuiz === id ? "Generating..." : "Start Quiz"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Scoreboard ──────────────────────────────────────────────── */}
        {activeTab === "scoreboard" && (
          <div className="space-y-6 py-4">

            {/* Section header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Student Scoreboard</h2>
                <p className="text-sm text-slate-400 mt-1">Domain-wise Elo rankings · Updated in real-time</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00F2FE] bg-[#00F2FE]/10 border border-[#00F2FE]/30 rounded-xl px-3 py-1.5 shadow-[0_0_10px_rgba(0,242,254,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
                Live Node Feed
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PERF_STATS.map(({ label, value, Icon, color, glow }) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 flex items-center gap-4 shadow-lg">
                  <div className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${color} ${glow}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs text-slate-400 leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard table */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md overflow-hidden shadow-xl">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.08]">
                <Medal className="w-5 h-5 text-[#00F2FE]" />
                <h3 className="font-bold text-white">Global Elo Leaderboard</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="text-left px-6 py-3.5">Rank</th>
                      <th className="text-left px-6 py-3.5">Student</th>
                      <th className="text-left px-6 py-3.5">Top Domain</th>
                      <th className="text-right px-6 py-3.5">Elo Rating</th>
                      <th className="text-right px-6 py-3.5">W / L</th>
                      <th className="text-center px-6 py-3.5">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {LEADERBOARD.map((row) => (
                      <tr key={row.rank} className="hover:bg-white/[0.04] transition-colors group">

                        {/* Rank */}
                        <td className="px-6 py-4">
                          {row.rank === 1 && <span title="1st" className="text-lg">🥇</span>}
                          {row.rank === 2 && <span title="2nd" className="text-lg">🥈</span>}
                          {row.rank === 3 && <span title="3rd" className="text-lg">🥉</span>}
                          {row.rank > 3 && (
                            <span className="text-slate-500 font-mono">#{row.rank}</span>
                          )}
                        </td>

                        {/* Student */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] flex items-center justify-center text-xs font-bold text-black shrink-0">
                              {row.initials}
                            </div>
                            <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                              {row.name}
                            </span>
                          </div>
                        </td>

                        {/* Domain */}
                        <td className="px-6 py-4">
                          <span className={`font-medium ${DOMAIN_COLOR[row.domain] ?? "text-slate-400"}`}>
                            {row.domain}
                          </span>
                        </td>

                        {/* Elo */}
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-[#00F2FE] justify-end">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            {row.elo.toLocaleString()}
                          </span>
                        </td>

                        {/* W/L */}
                        <td className="px-6 py-4 text-right font-mono text-sm">
                          <span className="text-emerald-400">{row.wins}W</span>
                          <span className="text-slate-600 mx-1.5">/</span>
                          <span className="text-rose-400">{row.losses}L</span>
                        </td>

                        {/* Trend */}
                        <td className="px-6 py-4 text-center">
                          {row.trend === "up" && <ArrowUp className="w-4 h-4 text-emerald-400 inline" />}
                          {row.trend === "down" && <ArrowDown className="w-4 h-4 text-rose-400 inline" />}
                          {row.trend === "same" && <Minus className="w-4 h-4 text-slate-500 inline" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── Active Quiz Modal Overlay ─────────────────────────────────────── */}
      {activeQuiz && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0E0F14]/95 border border-white/[0.12] rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F2FE]" />
                <h2 className="text-lg font-bold text-white">
                  {activeQuizDomain} Quiz
                </h2>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {!quizCompleted ? (
                // Active Question View
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#00F2FE]">
                    <span>Question {currentQuestionIndex + 1} of {activeQuiz.length}</span>
                    <span className="text-slate-500">Passing score earns +Elo</span>
                  </div>
                  <h3 className="text-lg text-white font-semibold leading-relaxed">
                    {activeQuiz[currentQuestionIndex].question}
                  </h3>
                  <div className="space-y-3">
                    {activeQuiz[currentQuestionIndex].options.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: idx }))}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${
                            isSelected
                              ? "bg-[#00F2FE]/15 border-[#00F2FE] text-[#00F2FE] font-medium shadow-[0_0_12px_rgba(0,242,254,0.25)]"
                              : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.15]"
                          }`}
                        >
                          <span className="font-mono text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Results Summary
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,242,254,0.4)]">
                      <Trophy className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Quiz Completed!</h3>
                    <p className="text-slate-400 text-sm">
                      You scored{" "}
                      <span className="text-[#00F2FE] font-bold">
                        {Object.entries(selectedAnswers).filter(([qIdx, aIdx]) => activeQuiz[Number(qIdx)].correctAnswerIndex === aIdx).length}
                      </span>{" "}
                      out of {activeQuiz.length}
                    </p>
                  </div>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin">
                    {activeQuiz.map((q, qIdx) => {
                      const userAnswer = selectedAnswers[qIdx];
                      const isCorrect = userAnswer === q.correctAnswerIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
                          <h4 className="text-white font-medium text-sm flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <span>{q.question}</span>
                          </h4>
                          <div className="pl-6 space-y-1 text-xs">
                            <p className="text-slate-400">
                              Your answer:{" "}
                              <span className={isCorrect ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                                {q.options[userAnswer] ?? "Unanswered"}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-slate-400">
                                Correct answer:{" "}
                                <span className="text-emerald-400 font-medium">
                                  {q.options[q.correctAnswerIndex]}
                                </span>
                              </p>
                            )}
                            <p className="text-slate-500 italic pt-1">{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-between items-center">
              {!quizCompleted ? (
                <>
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="btn-glass px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {currentQuestionIndex === activeQuiz.length - 1 ? (
                    <button
                      onClick={() => setQuizCompleted(true)}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="btn-primary-glow px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeQuiz.length - 1, prev + 1))}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="btn-glass px-5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="btn-primary-glow w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Back to Dashboard
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
