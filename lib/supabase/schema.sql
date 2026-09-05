-- Supabase Schema for AI Mock Interview Coach

-- 1. Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  mode TEXT NOT NULL CHECK (mode IN ('job', 'visa')),
  context_bundle JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_started_at ON interview_sessions(started_at DESC);

-- 2. Session Turns
CREATE TABLE IF NOT EXISTS session_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  turn_index INTEGER NOT NULL,
  speaker TEXT NOT NULL DEFAULT 'agent' CHECK (speaker IN ('agent', 'user')),
  question_text TEXT NOT NULL DEFAULT '',
  answer_transcript TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_turns_session_id ON session_turns(session_id, turn_index);

-- 3. Session Results
CREATE TABLE IF NOT EXISTS session_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  per_question_feedback JSONB NOT NULL DEFAULT '[]'::jsonb,
  flagged_concerns JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_results_session_id ON session_results(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_results ENABLE ROW LEVEL SECURITY;

-- Allow public reads and inserts for anonymous mock interview sessions (v1)
CREATE POLICY "Allow public read on interview_sessions"
  ON interview_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on interview_sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on interview_sessions"
  ON interview_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read on session_turns"
  ON session_turns FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on session_turns"
  ON session_turns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on session_results"
  ON session_results FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on session_results"
  ON session_results FOR INSERT
  WITH CHECK (true);
