import { InterviewMode } from '@/types/interview';
import { SessionResult } from '@/types/results';

export function getMockEvaluation(sessionId: string, mode: InterviewMode, note?: string): SessionResult {
  if (mode === 'job') {
    return {
      session_id: sessionId,
      overall_score: 82,
      category_scores: {
        'Technical Depth': 84,
        'Communication & STAR': 80,
        'Problem Solving': 85,
        'Delivery & Confidence': 79,
      },
      strengths: [
        'Demonstrated strong concrete knowledge of project architecture and tech stack.',
        'Articulated trade-offs clearly when discussing state management and database selections.',
        'Maintained composed and professional communication throughout the conversation.',
      ],
      weaknesses: [
        'Could provide more quantified business impact (metrics, latency reduction percentages).',
        'Occasional hesitation when answering edge-case reliability questions.',
      ],
      per_question_feedback: [
        {
          question: 'Can you introduce yourself and describe an engineering challenge you solved recently?',
          answer_summary: 'Discussed recent full-stack architecture and microservices migration.',
          feedback: 'Strong technical overview. To elevate the answer, use the STAR format to clearly delineate your individual contribution.',
          rating: 'strong',
        },
        {
          question: 'How did you handle race conditions or concurrency in that project?',
          answer_summary: 'Explained locking and transaction mechanisms.',
          feedback: 'Clear understanding shown; mentioning distributed locking solutions like Redis Redlock would be a bonus.',
          rating: 'adequate',
        },
      ],
      flagged_concerns: note ? [note] : [],
      created_at: new Date().toISOString(),
    };
  }

  return {
    session_id: sessionId,
    overall_score: 88,
    category_scores: {
      'Directness & Clarity': 90,
      'Financial Credibility': 88,
      'Ties to Home Country': 84,
      'Consistency & Demeanor': 90,
    },
    strengths: [
      'Answers were direct and concise, which is critical for consular interviews.',
      'Clear explanation of financial sponsorship and family financial standing.',
      'Logical connection between chosen degree program and future career in home country.',
    ],
    weaknesses: [
      'Avoid vague phrases like "many opportunities" when discussing post-graduation plans back home.',
    ],
    per_question_feedback: [
      {
        question: 'What is the purpose of your travel and why did you select this specific university?',
        answer_summary: 'Stated degree program and faculty research alignment.',
        feedback: 'Direct and focused response without unnecessary rambling.',
        rating: 'strong',
      },
      {
        question: 'Who is sponsoring your education and how will living expenses be met?',
        answer_summary: 'Stated family sponsorship and verified annual income documentation.',
        feedback: 'Transparent financial explanation matching visa requirements.',
        rating: 'strong',
      },
    ],
    flagged_concerns: note ? [note] : [],
    created_at: new Date().toISOString(),
  };
}
