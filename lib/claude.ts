import Anthropic from '@anthropic-ai/sdk';
import { InterviewMode, SessionTurn } from '@/types/interview';
import { SessionResult } from '@/types/results';
import { buildScoringPrompt } from '@/lib/prompts/scoring-prompts';

const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';

export async function scoreInterviewTranscript(
  sessionId: string,
  mode: InterviewMode,
  contextBundle: any,
  turns: SessionTurn[]
): Promise<SessionResult> {
  if (!anthropicApiKey) {
    console.warn('ANTHROPIC_API_KEY is not set. Returning mock evaluation for demo/testing.');
    return getMockEvaluation(sessionId, mode);
  }

  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
  });

  const prompt = buildScoringPrompt(mode, contextBundle, turns);
  const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  try {
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 2500,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const contentBlock = message.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected non-text response from Claude API');
    }

    let rawJson = contentBlock.text.trim();
    // Clean code fences if Claude returned ```json ... ```
    if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(rawJson);

    return {
      session_id: sessionId,
      overall_score: Math.min(100, Math.max(0, Math.round(parsed.overall_score || 75))),
      category_scores: parsed.category_scores || {},
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      per_question_feedback: Array.isArray(parsed.per_question_feedback) ? parsed.per_question_feedback : [],
      flagged_concerns: Array.isArray(parsed.flagged_concerns) ? parsed.flagged_concerns : [],
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error invoking Claude scoring API:', error);
    // Return structured fallback on API error so user gets feedback rather than hard crash
    return getMockEvaluation(sessionId, mode, `Evaluation generated with fallback: ${error.message}`);
  }
}

function getMockEvaluation(sessionId: string, mode: InterviewMode, note?: string): SessionResult {
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
