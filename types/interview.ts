export type InterviewMode = 'job' | 'visa';

export interface GitHubRepoContext {
  name: string;
  description: string | null;
  language: string | null;
  readme_summary: string | null;
  last_pushed: string;
  url?: string;
}

export interface JobContextBundle {
  mode: 'job';
  resume_text: string | null;
  github_username?: string | null;
  github_projects: GitHubRepoContext[] | null;
}

export interface VisaContextBundle {
  mode: 'visa';
  visa_type: string;
  destination_country: string;
  category_name?: string;
}

export type ContextBundle = JobContextBundle | VisaContextBundle;

export interface InterviewSession {
  id: string;
  user_id?: string | null;
  mode: InterviewMode;
  context_bundle: ContextBundle;
  started_at: string;
  ended_at: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface SessionTurn {
  id?: string;
  session_id: string;
  turn_index: number;
  speaker: 'agent' | 'user';
  question_text: string;
  answer_transcript: string;
  timestamp: string;
}
