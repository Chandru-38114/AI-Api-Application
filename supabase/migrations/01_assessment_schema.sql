-- ────────────────────────────────────────────────────────────────────────────
-- SkillVerse Domain Assessment Schema
-- Run this against your Supabase SQL editor or via the Supabase CLI:
--   supabase db push  (if using local dev)
-- ────────────────────────────────────────────────────────────────────────────

-- 1. coding_problems ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_problems (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT        NOT NULL,
    domain       TEXT        NOT NULL,
    difficulty   TEXT        NOT NULL CHECK (difficulty IN (''Easy'', ''Medium'', ''Hard'')),
    description  TEXT        NOT NULL,
    starter_code TEXT        NOT NULL,
    test_cases   JSONB       NOT NULL DEFAULT ''[]''::jsonb
);

CREATE INDEX IF NOT EXISTS idx_coding_problems_domain     ON coding_problems (domain);
CREATE INDEX IF NOT EXISTS idx_coding_problems_difficulty ON coding_problems (difficulty);


-- 2. user_reports ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_reports (
    id          UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT                        NOT NULL,
    domain      TEXT                        NOT NULL,
    score       NUMERIC(5, 2)               NOT NULL,
    report_data JSONB                       NOT NULL DEFAULT ''{}''::jsonb,
    created_at  TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON user_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_domain  ON user_reports (domain);


-- 3. user_badges ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
    id         UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    TEXT                     NOT NULL,
    badge_type TEXT                     NOT NULL,
    domain     TEXT                     NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_domain  ON user_badges (domain);
