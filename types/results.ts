export interface PerQuestionFeedback {
  question: string;
  answer_summary: string;
  feedback: string;
  rating?: 'strong' | 'adequate' | 'needs_work';
}

export interface SessionResult {
  id?: string;
  session_id: string;
  overall_score: number;
  category_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  per_question_feedback: PerQuestionFeedback[];
  flagged_concerns: string[];
  created_at?: string;
}
