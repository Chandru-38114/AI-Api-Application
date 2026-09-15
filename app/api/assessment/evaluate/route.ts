import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (server-side) ────────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }
  return createClient(url, key);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvaluateRequestBody {
  userId: string;
  domain: string;
  mcqAnswers: number[];
  mcqCorrect: number[];
  logicAnswers: number[];
  logicCorrect: number[];
  debugAnswer: number;
  debugCorrect: number;
  codeOutput?: string;
}

interface Breakdown {
  mcqScore: string;
  logicScore: string;
  debugScore: string;
}

interface Report {
  userId: string;
  domain: string;
  score: number;
  level: string;
  tutorEligible: boolean;
  badgeIssued: boolean;
  breakdown: Breakdown;
  summaryText: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countCorrect(answers: number[], correct: number[]): number {
  return answers.reduce(
    (acc, ans, i) => acc + (ans === correct[i] ? 1 : 0),
    0
  );
}

function determineLevel(score: number): string {
  if (score >= 85) return "Expert";
  if (score >= 70) return "Advanced";
  if (score >= 50) return "Intermediate";
  return "Beginner";
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as EvaluateRequestBody | null;

    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
      userId,
      domain,
      mcqAnswers,
      mcqCorrect,
      logicAnswers,
      logicCorrect,
      debugAnswer,
      debugCorrect,
      codeOutput = "",
    } = body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!userId || !domain) {
      return NextResponse.json(
        { error: "userId and domain are required." },
        { status: 400 }
      );
    }
    if (
      !Array.isArray(mcqAnswers) ||
      !Array.isArray(mcqCorrect) ||
      !Array.isArray(logicAnswers) ||
      !Array.isArray(logicCorrect)
    ) {
      return NextResponse.json(
        { error: "mcqAnswers, mcqCorrect, logicAnswers, logicCorrect must be arrays." },
        { status: 400 }
      );
    }

    // ── Score calculation ────────────────────────────────────────────────────
    const mcqHits   = countCorrect(mcqAnswers, mcqCorrect);
    const logicHits = countCorrect(logicAnswers, logicCorrect);
    const debugHit  = debugAnswer === debugCorrect ? 1 : 0;

    const totalQuestions = mcqCorrect.length + logicCorrect.length + 1;
    const totalHits      = mcqHits + logicHits + debugHit;
    const score          = totalQuestions > 0
      ? Math.round((totalHits / totalQuestions) * 10000) / 100   // 2 decimal places
      : 0;

    const level          = determineLevel(score);
    const tutorEligible  = score >= 85;

    const breakdown: Breakdown = {
      mcqScore:   `${mcqHits}/${mcqCorrect.length}`,
      logicScore: `${logicHits}/${logicCorrect.length}`,
      debugScore: `${debugHit}/1`,
    };

    const summaryText =
      `Domain: ${domain} | Score: ${score}% | Level: ${level} | ` +
      `MCQ: ${breakdown.mcqScore}, Logic: ${breakdown.logicScore}, Debug: ${breakdown.debugScore}` +
      (codeOutput ? ` | Code Output: ${codeOutput.slice(0, 100)}` : "");

    // ── Supabase operations ──────────────────────────────────────────────────
    const supabase = getSupabase();
    let badgeIssued = false;

    // Insert evaluation report
    const reportData = {
      breakdown,
      codeOutput,
      mcqAnswers,
      mcqCorrect,
      logicAnswers,
      logicCorrect,
      debugAnswer,
      debugCorrect,
    };

    const { error: reportError } = await supabase.from("user_reports").insert({
      user_id:     userId,
      domain,
      score,
      report_data: reportData,
    });

    if (reportError) {
      console.error("Supabase insert user_reports error:", reportError.message);
      // Non-fatal — still return the computed report
    }

    // Conditionally issue badge
    if (tutorEligible) {
      const { error: badgeError } = await supabase.from("user_badges").insert({
        user_id:    userId,
        badge_type: "Verified Tutor",
        domain,
      });

      if (badgeError) {
        console.error("Supabase insert user_badges error:", badgeError.message);
      } else {
        badgeIssued = true;
      }
    }

    const report: Report = {
      userId,
      domain,
      score,
      level,
      tutorEligible,
      badgeIssued,
      breakdown,
      summaryText,
    };

    return NextResponse.json({ success: true, report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Evaluation handler error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
