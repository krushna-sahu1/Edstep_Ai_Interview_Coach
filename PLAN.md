# PLAN.md — AI Mock Interview Coach (Voice-Based)

## 1. Project Overview

An audio-only, real-time AI mock interview platform with two modes:

1. **Job Interview Mode** — personalized using resume (PDF) and/or GitHub profile (top 3 recent repos)
2. **Visa Interview Mode** — personalized using a single visa-type selection; rest is conversational

The AI conducts a real-time spoken interview (not turn-based record/upload), listens to answers, asks relevant follow-ups, and produces a scored feedback report at the end.

**Core tech decision:** Real-time voice is powered by **Deepgram Voice Agent API**, which bundles STT + LLM orchestration + TTS + turn-detection (VAD) into a single streaming connection. This avoids building a custom WebRTC + STT + LLM + TTS pipeline from scratch.

**Deployment decision (locked):** Frontend + backend logic deploy on **Vercel** (Next.js). Database/Auth/Storage on **Supabase**. Because Vercel serverless functions cannot hold long-lived connections for the full interview duration, the **browser connects DIRECTLY to Deepgram's Voice Agent WebSocket** — Vercel is never in the real-time audio path. Vercel API routes only handle short-lived requests: context prep (PDF/GitHub), issuing the Deepgram session config/token, writing turns to Supabase, and running the post-interview scoring call. See Section 5 for the full data-flow diagram.

---

## 2. Goals / Non-Goals

**Goals**
- Real-time, low-latency spoken interview practice (not batch record-then-transcribe)
- Two interview types: Job and Visa, sharing one core "interview engine"
- Personalization: resume + GitHub for job; visa type for visa
- Post-interview scoring and feedback report
- Frictionless UX — minimum required inputs, no unnecessary forms

**Non-Goals (v1)**
- No video / body language analysis (audio only)
- No non-technical resume-less generic job questions as default — job mode requires at least one context input (resume OR GitHub)
- No deep code-quality reading of GitHub repos (metadata + README only)
- No mobile app — web only for v1
- No multi-language support for v1 (English only)

---

## 3. User Flows

### 3.1 Job Interview Flow

```
1. User lands on "Job Interview" tab
2. Two optional inputs shown:
   [ ] Upload Resume (PDF)
   [ ] Paste GitHub profile URL
3. GATING RULE: "Start Interview" button is DISABLED until at least ONE input is provided
   - If both empty → show inline message: "Add your resume or GitHub link to get personalized questions"
4. On valid input(s):
   a. If resume provided → backend extracts text from PDF
   b. If GitHub provided → backend fetches top 3 MOST RECENTLY PUSHED public repos
      (name, description, primary language, README content)
5. Backend merges available data into a single "context bundle" (see Section 6)
6. User clicks "Start Interview"
7. Frontend calls a Vercel API route (`/api/interview/start`) with the context bundle
   → route creates a session record in Supabase and returns a Deepgram session
   config/token seeded with the context bundle as system instructions
8. Frontend connects DIRECTLY to Deepgram's Voice Agent WebSocket using that config
   (Vercel is NOT in the real-time audio path — see Section 5)
9. Real-time spoken interview begins (see Section 5 — Interview Engine)
10. On completion (user ends interview or question set exhausted):
    a. Full transcript retrieved (compiled client-side from the Deepgram session,
       periodically synced to Supabase via Vercel API route)
    b. Transcript sent to a Vercel API route → scoring LLM call
    c. Results screen displayed
```

### 3.2 Visa Interview Flow

```
1. User lands on "Visa Interview" tab
2. Single required input: Visa Type dropdown
   (F1 - Student / H1B - Work / B1B2 - Visitor / UK Student Route / Australia Subclass 500 / etc.)
3. "Start Interview" enabled as soon as a visa type is selected (no other fields required)
4. Backend generates initial system instructions using ONLY the visa type
   (funding source, ties to home country, prior rejections, etc. are extracted
   conversationally by the AI asking as its OPENING questions — not via a form)
5. Real-time spoken interview begins (same engine as job flow, different question bank/rubric)
6. On completion: transcript → scoring → results screen
```

---

## 4. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js (React) | UI, mic capture, audio playback, direct WebSocket connection to Deepgram |
| Hosting (frontend + backend logic) | **Vercel** | Next.js app + API routes, single deploy target |
| Real-time transport | **Deepgram Voice Agent API** — browser connects **directly**, not proxied through Vercel | STT + LLM + TTS + turn-detection bundled, no custom pipeline needed |
| Backend logic | Vercel API routes (Next.js `app/api/*` route handlers) | Context prep (PDF/GitHub), issuing Deepgram session config, writing turns to Supabase, scoring calls — all short-lived requests, no persistent connections needed here |
| PDF parsing | `pdf-parse` (Node), run inside a Vercel API route | Extract text from uploaded resume, in-memory, discarded after parsing |
| GitHub data | GitHub REST API (public, unauthenticated for public repos), called from a Vercel API route | Fetch top 3 recent repos + README |
| Scoring LLM | Claude API (Anthropic) | Post-interview transcript scoring + feedback generation |
| Database | **Supabase (Postgres)** | Sessions, transcripts, scores, context bundles |
| File storage | None — PDFs parsed in-memory and discarded, not persisted | Simpler, better privacy story |
| Auth | **Supabase Auth** (can be deferred — anonymous session IDs acceptable for v1 if auth isn't needed yet) | User accounts, session history (if/when needed) |

**Why direct browser→Deepgram instead of a backend relay:** Vercel serverless functions have execution time limits and don't hold long-lived WebSocket connections well — a 5–15 minute interview session would exceed what a Vercel function can hold open. Routing the persistent connection directly from the browser to Deepgram avoids this entirely and also removes an unnecessary network hop (lower latency). Vercel only ever handles short request/response calls (prepare context, issue session token, log turns, score transcript at the end) — exactly what it's good at.

---

## 5. Interview Engine (Shared Core)

Both Job and Visa modes use the **same underlying loop**. Only the "context bundle" and "scoring rubric" differ.

```
┌───────────────────────────────────────────────┐
│  1. Vercel API route builds system prompt from  │
│     context bundle (resume/github OR visa       │
│     type) + interview-type-specific             │
│     instructions (question style, tone,         │
│     what to probe for)                          │
│                                                  │
│  2. Vercel API route calls Deepgram to create a  │
│     Voice Agent session config/token seeded      │
│     with this system prompt, creates a session   │
│     record in Supabase, returns config to        │
│     frontend                                     │
│                                                  │
│  3. Frontend connects DIRECTLY to Deepgram's     │
│     Voice Agent WebSocket using that config —    │
│     Vercel is NOT in this real-time connection    │
│                                                  │
│  4. Deepgram Voice Agent handles (entirely       │
│     between browser and Deepgram):               │
│     - Speaking the first question (TTS)          │
│     - Listening + transcribing (STT)             │
│     - Detecting when user stops talking (VAD)    │
│     - Deciding follow-up vs next question        │
│       (LLM, using system prompt + history)       │
│     - Speaking its response (TTS)                │
│     — this loops automatically                   │
│                                                  │
│  5. Frontend periodically POSTs each new turn    │
│     (question, answer transcript, timestamp) to  │
│     a Vercel API route → written to Supabase     │
│                                                  │
│  6. Session ends when:                           │
│     - Question set exhausted (agent decides)     │
│     - User manually ends interview               │
│     - Time limit reached (optional cap)          │
└───────────────────────────────────────────────┘
        ↓
Frontend calls Vercel API route to finalize session
        ↓
Vercel API route compiles full transcript from Supabase,
sends to Scoring LLM (Claude) with mode-specific rubric (Section 7)
        ↓
Results written to Supabase + returned to frontend for display
```

---

## 6. Context Bundle Schema

### Job Interview Context Bundle
```json
{
  "mode": "job",
  "resume_text": "string or null — raw extracted PDF text",
  "github_projects": [
    {
      "name": "string",
      "description": "string",
      "language": "string",
      "readme_summary": "string (truncated/summarized if long)",
      "last_pushed": "ISO date"
    }
  ] // max 3 items, sorted by most recently pushed, or null if no GitHub link given
}
```

### Visa Interview Context Bundle
```json
{
  "mode": "visa",
  "visa_type": "string (e.g. 'F1-Student', 'H1B-Work', 'UK-Student-Route')",
  "destination_country": "string (derived from visa_type)"
}
```
Note: funding source, ties to home country, prior rejections, program details are
NOT collected via form — they emerge from the AI's own opening questions during
the live conversation and are captured in the transcript for scoring purposes.

---

## 7. Scoring & Feedback

Both modes end with a scoring LLM call over the full transcript. Use a single scoring prompt with mode-specific rubric injected.

### Job Interview Rubric
- **Relevance/specificity** — did the answer address the actual question with concrete detail (vs. vague generalities)?
- **Technical accuracy** (if technical question) — correctness relative to what's verifiable from GitHub context
- **Structure** — e.g., STAR method usage for behavioral questions
- **Confidence/delivery signals** — filler word frequency, hedging language, pacing (derivable from transcript text patterns; true prosody/tone analysis is a stretch goal, not v1)
- **Consistency with provided context** — do answers align with resume/GitHub claims?

### Visa Interview Rubric
- **Directness** — avoiding vague or evasive answers
- **Consistency** — do answers contradict each other or typical red flags (e.g., unclear funding, unclear return intent)?
- **Confidence/delivery signals** — same as above
- **Red-flag detection** — flag answers that would concern a real consular officer (e.g., unclear ties to home country, vague program justification)

### Output format (both modes)
```json
{
  "overall_score": "0-100",
  "category_scores": { "...": "0-100" },
  "strengths": ["string", "..."],
  "weaknesses": ["string", "..."],
  "per_question_feedback": [
    { "question": "string", "answer_summary": "string", "feedback": "string" }
  ],
  "flagged_concerns": ["string", "..."]  // visa mode especially
}
```

---

## 8. Data Model (Database Tables)

**users** (if auth is included)
- id, email, created_at

**interview_sessions**
- id, user_id (nullable if no auth for v1), mode ('job' | 'visa'), context_bundle (jsonb), started_at, ended_at, status ('in_progress' | 'completed' | 'abandoned')

**session_turns**
- id, session_id, turn_index, question_text, answer_transcript, timestamp

**session_results**
- id, session_id, overall_score, category_scores (jsonb), strengths (jsonb), weaknesses (jsonb), per_question_feedback (jsonb), flagged_concerns (jsonb), created_at

---

## 9. API Endpoints (Backend)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/job/prepare` | Accepts resume PDF (multipart) and/or GitHub URL; returns context_bundle |
| POST | `/api/visa/prepare` | Accepts visa_type; returns context_bundle |
| POST | `/api/interview/start` | Accepts context_bundle + mode; creates session; returns session_id + Deepgram session connection info |
| WS | `/api/interview/stream/:session_id` | WebSocket relay between frontend mic and Deepgram Voice Agent (if not connecting client-direct to Deepgram) |
| POST | `/api/interview/end` | Marks session complete, triggers scoring |
| GET | `/api/interview/results/:session_id` | Returns scored results |
| GET | `/api/interview/history` | (if auth) List past sessions for a user |

---

## 10. GitHub Fetch Logic (Detail)

```
GET https://api.github.com/users/{username}/repos?sort=pushed&direction=desc&per_page=3
```
For each of the top 3 repos:
```
GET https://api.github.com/repos/{username}/{repo}/readme
```
(Base64-decode README content; truncate/summarize if very long before injecting into context bundle — avoid blowing up the system prompt size.)

**Edge cases to handle:**
- Invalid/nonexistent GitHub username → show error, don't block if resume was also provided
- User has 0 public repos → treat as if no GitHub was provided
- Private-only repos → same as above (API only returns public repos by default)
- README missing on a repo → fall back to repo description + language only

---

## 11. PDF Parsing Logic (Detail)

- Accept PDF upload (frontend: `<input type="file" accept=".pdf">`)
- Backend: `pdf-parse` extracts raw text
- Truncate to a reasonable token budget before injecting into system prompt (e.g., first ~3000 characters or key sections if you later add structured parsing)
- **v1 simplification:** treat resume as unstructured text blob fed into the LLM's system prompt — no need to structurally parse into "experience/education/skills" fields for v1. The LLM can extract relevant info itself.
- Delete uploaded PDF from storage after parsing (privacy — don't retain raw resumes longer than needed, unless building session history is a stated feature)

---

## 12. Visa Type → Question Bank Mapping

Maintain a lookup table (can live in code or DB) mapping visa_type to:
- Destination country (for display)
- A short system-prompt fragment describing what a real officer for that visa type typically probes (funding, ties to home, program legitimacy, prior immigration history, etc.)

Example entries: F1 (US Student), H1B (US Work), B1/B2 (US Visitor), UK Student Route, Australia Subclass 500. Extend list as needed.

---

## 13. Gating / Validation Rules (Explicit)

- **Job mode:** `Start Interview` disabled unless `resume_provided === true OR github_provided === true`
- **Visa mode:** `Start Interview` disabled until `visa_type !== null`
- Show clear inline validation messages, not silent disabling

---

## 14. Build Phases (Suggested Order for AI Agent)

**Phase 1 — Core scaffolding**
- Next.js frontend + Node backend skeleton
- Basic routing: Job tab, Visa tab
- DB schema setup (Supabase or chosen Postgres)

**Phase 2 — Context preparation (non-realtime parts first)**
- PDF upload + parsing endpoint
- GitHub fetch endpoint (top 3 recent repos + README)
- Visa type dropdown + context bundle builder
- Gating logic on frontend buttons

**Phase 3 — Deepgram Voice Agent integration**
- Backend: create Voice Agent session seeded with context bundle as system prompt
- Frontend: mic capture, connect to Deepgram session (via backend relay or direct per Deepgram's recommended client pattern)
- Playback of agent's spoken responses
- Turn logging to `session_turns` table as conversation progresses

**Phase 4 — Session lifecycle**
- Start/end session handling
- Manual "End Interview" control on frontend
- Optional time-cap auto-end

**Phase 5 — Scoring & results**
- Post-session transcript compilation
- Scoring LLM call (mode-specific rubric)
- Results screen UI (overall score, strengths/weaknesses, per-question feedback)

**Phase 6 — Polish**
- Error handling (GitHub 404, malformed PDF, mic permission denied, connection drops mid-interview)
- Loading/connecting states for real-time session setup (Deepgram connection handshake latency)
- Basic session history (if auth included)

---

## 15. Environment Variables Needed

```
DEEPGRAM_API_KEY=                    # server-side only, used in Vercel API route to mint session config/token
ANTHROPIC_API_KEY=                   # scoring LLM (Claude), server-side only
SUPABASE_URL=                        # public, used client + server
NEXT_PUBLIC_SUPABASE_URL=            # same value, exposed to client if needed for direct Supabase client calls
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # client-side Supabase access (respects RLS policies)
SUPABASE_SERVICE_ROLE_KEY=           # server-side only, used in Vercel API routes for privileged writes
GITHUB_TOKEN=                        # optional — increases GitHub API rate limit from 60/hr to 5000/hr
```

**Note:** `DEEPGRAM_API_KEY` and `ANTHROPIC_API_KEY` must NEVER be exposed to the client. Since the browser connects directly to Deepgram, the Vercel API route mints a short-lived, scoped session token/config (per Deepgram's recommended pattern for client-side connections) rather than handing the raw API key to the frontend.

---

## 16. Open Decisions to Confirm Before/During Build

- [ ] Auth required for v1, or fully anonymous sessions? (Supabase Auth is available whenever this is decided — no architecture change needed either way)
- [ ] Time cap per interview session (e.g., max 15 min)?
- [ ] Resume PDF retention policy — currently planned as in-memory parse + immediate discard (not stored in Supabase Storage); confirm this is acceptable or if session-history replay of the original resume is a future requirement

**Resolved:**
- ~~Which scoring LLM~~ → Claude API (Anthropic), locked in.
- ~~Frontend connects directly to Deepgram vs backend proxy~~ → **Direct browser-to-Deepgram connection**, locked in. Vercel cannot hold the long-lived connection, so it only issues the session config and never sits in the real-time audio path (see Sections 4 and 5).
- ~~Supabase vs no Supabase~~ → **Supabase confirmed** (Postgres + Auth + available Storage if needed later).

---

## 17. Explicitly Out of Scope for v1 (Do Not Build)

- Video/webcam analysis
- Multi-language interviews
- Deep static-analysis code review of GitHub repos
- Mobile native app
- Payment/subscription system (unless separately scoped)
