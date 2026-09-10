"use client";

import { useState } from "react";
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
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "coding" | "mcq" | "scoreboard";
type Difficulty = "Easy" | "Medium" | "Hard";

// ─── Static data ──────────────────────────────────────────────────────────────

const PROBLEM = {
  id: 1,
  title: "Two Sum",
  difficulty: "Medium" as Difficulty,
  tags: ["Array", "Hash Table"],
  description:
    'Given an array of integers <code class="bg-gray-800 px-1 rounded text-blue-300">nums</code> and an integer <code class="bg-gray-800 px-1 rounded text-blue-300">target</code>, return the <strong>indices</strong> of the two numbers such that they add up to <code class="bg-gray-800 px-1 rounded text-blue-300">target</code>.<br/><br/>You may assume that each input has <strong>exactly one solution</strong>, and you may not use the same element twice. Return the answer in any order.',
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
  Easy: "text-green-400 bg-green-400/10 border-green-500/40",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-500/40",
  Hard: "text-red-400 bg-red-400/10 border-red-500/40",
};

const MCQ_DOMAINS = [
  {
    id: "python",
    title: "Python",
    Icon: Code2,
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-950/30",
    border: "border-blue-700/40",
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
    gradient: "from-purple-500 to-violet-400",
    bg: "bg-purple-950/30",
    border: "border-purple-700/40",
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
    gradient: "from-orange-500 to-amber-400",
    bg: "bg-orange-950/30",
    border: "border-orange-700/40",
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
    gradient: "from-pink-500 to-rose-400",
    bg: "bg-pink-950/30",
    border: "border-pink-700/40",
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
  "Python":           "text-blue-400",
  "Machine Learning": "text-purple-400",
  "Neural Networks":  "text-orange-400",
  "Deep Learning":    "text-pink-400",
};

const PERF_STATS = [
  { label: "Problems Solved", value: "24", Icon: Target,    color: "text-green-400",  bg: "bg-green-400/10"  },
  { label: "Win Rate",        value: "68%", Icon: TrendingUp, color: "text-blue-400",  bg: "bg-blue-400/10"   },
  { label: "Best Streak",     value: "7×",  Icon: Star,      color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { label: "Global Rank",     value: "#12", Icon: Award,     color: "text-purple-400", bg: "bg-purple-400/10" },
];

const TABS: { id: Tab; label: string; Icon: typeof Code2 }[] = [
  { id: "coding",     label: "LeetCode Coding",                Icon: Code2   },
  { id: "mcq",        label: "MCQ Knowledge Evaluation",       Icon: BookOpen },
  { id: "scoreboard", label: "Student Scoreboard & Rankings",  Icon: Trophy  },
];

// ─── Dashboard Shell ──────────────────────────────────────────────────────────

export default function DashboardShell() {
  const [activeTab, setActiveTab] = useState<Tab>("coding");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <div className="leading-tight select-none">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase">
                AI Learning Platform
              </p>
              <h1 className="text-lg font-black tracking-tight text-white">
                Skill<span className="text-blue-400">Verse</span>
              </h1>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Elo chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-bold select-none">
              <Zap className="w-3.5 h-3.5 fill-current" />
              1 200 Elo
            </div>
            {/* Profile badge */}
            <button className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700/80 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-200">Student</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ──────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {TABS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                    active
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-6 py-6">

        {/* ── TAB: LeetCode Coding ─────────────────────────────────────────── */}
        {activeTab === "coding" && (
          <div className="flex gap-6 h-[calc(100vh-12rem)]">

            {/* Problem sidebar */}
            <aside className="w-[360px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">

              {/* Title + difficulty */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Problem #{PROBLEM.id}</p>
                    <h2 className="text-xl font-bold text-white">{PROBLEM.title}</h2>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLE[PROBLEM.difficulty]}`}>
                    {PROBLEM.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PROBLEM.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                  <BookOpen className="w-4 h-4" /> Description
                </h3>
                <p
                  className="text-sm text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: PROBLEM.description }}
                />
              </div>

              {/* Examples */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300">Examples</h3>
                {PROBLEM.examples.map((ex, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Example {i + 1}</p>
                    <div className="rounded-lg bg-gray-950 border border-gray-800 p-3 space-y-1 font-mono text-xs">
                      <p>
                        <span className="text-gray-500">Input: </span>
                        <span className="text-green-400">{ex.input}</span>
                      </p>
                      <p>
                        <span className="text-gray-500">Output: </span>
                        <span className="text-blue-400">{ex.output}</span>
                      </p>
                      {ex.explanation && (
                        <p className="text-gray-500 pt-2 border-t border-gray-800 text-[11px]">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Constraints</h3>
                <ul className="space-y-2">
                  {PROBLEM.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                      <code className="font-mono">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Code Editor */}
            <div className="flex-1 min-w-0">
              <CodeEditor />
            </div>
          </div>
        )}

        {/* ── TAB: MCQ Evaluation ──────────────────────────────────────────── */}
        {activeTab === "mcq" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">MCQ Knowledge Evaluation</h2>
              <p className="text-gray-400 text-sm">
                Select a domain to start a timed quiz and earn Elo rating points
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {MCQ_DOMAINS.map(({ id, title, Icon, gradient, bg, border, description, questions, duration, elo }) => (
                <div key={id} className={`relative rounded-xl border ${border} ${bg} p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Text */}
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      {duration}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {elo}
                    </span>
                    <button
                      onClick={() => console.info(`[MCQ] Starting: ${title}`)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Scoreboard ──────────────────────────────────────────────── */}
        {activeTab === "scoreboard" && (
          <div className="space-y-6">

            {/* Section header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Student Scoreboard</h2>
                <p className="text-sm text-gray-400 mt-1">Domain-wise Elo rankings · Updated in real-time</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PERF_STATS.map(({ label, value, Icon, color, bg }) => (
                <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-500 leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard table */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
                <Medal className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Global Elo Leaderboard</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="text-left px-6 py-3">Rank</th>
                      <th className="text-left px-6 py-3">Student</th>
                      <th className="text-left px-6 py-3">Top Domain</th>
                      <th className="text-right px-6 py-3">Elo Rating</th>
                      <th className="text-right px-6 py-3">W / L</th>
                      <th className="text-center px-6 py-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {LEADERBOARD.map((row) => (
                      <tr key={row.rank} className="hover:bg-gray-800/40 transition-colors group">

                        {/* Rank */}
                        <td className="px-6 py-4">
                          {row.rank === 1 && <span title="1st" className="text-lg">🥇</span>}
                          {row.rank === 2 && <span title="2nd" className="text-lg">🥈</span>}
                          {row.rank === 3 && <span title="3rd" className="text-lg">🥉</span>}
                          {row.rank > 3 && (
                            <span className="text-gray-500 font-mono">#{row.rank}</span>
                          )}
                        </td>

                        {/* Student */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {row.initials}
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
                              {row.name}
                            </span>
                          </div>
                        </td>

                        {/* Domain */}
                        <td className="px-6 py-4">
                          <span className={`font-medium ${DOMAIN_COLOR[row.domain] ?? "text-gray-400"}`}>
                            {row.domain}
                          </span>
                        </td>

                        {/* Elo */}
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-yellow-400 justify-end">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            {row.elo.toLocaleString()}
                          </span>
                        </td>

                        {/* W/L */}
                        <td className="px-6 py-4 text-right font-mono text-sm">
                          <span className="text-green-400">{row.wins}W</span>
                          <span className="text-gray-600 mx-1.5">/</span>
                          <span className="text-red-400">{row.losses}L</span>
                        </td>

                        {/* Trend */}
                        <td className="px-6 py-4 text-center">
                          {row.trend === "up"   && <ArrowUp   className="w-4 h-4 text-green-400 inline" />}
                          {row.trend === "down" && <ArrowDown className="w-4 h-4 text-red-400 inline"   />}
                          {row.trend === "same" && <Minus     className="w-4 h-4 text-gray-500 inline"  />}
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
    </div>
  );
}
