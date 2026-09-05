'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Printer, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import ScoreOverview from '@/components/results/ScoreOverview';
import FeedbackCard from '@/components/results/FeedbackCard';
import QuestionBreakdown from '@/components/results/QuestionBreakdown';
import { SessionResult } from '@/types/results';
import { InterviewMode } from '@/types/interview';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || '';

  const [result, setResult] = useState<SessionResult | null>(null);
  const [mode, setMode] = useState<InterviewMode>('job');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    if (typeof window !== 'undefined') {
      const cachedResult = sessionStorage.getItem(`interview_result_${sessionId}`);
      const cachedSession = sessionStorage.getItem(`interview_session_${sessionId}`);

      if (cachedSession) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          if (parsedSession.mode) setMode(parsedSession.mode);
        } catch (e) {
          // ignore
        }
      }

      if (cachedResult) {
        try {
          const parsed = JSON.parse(cachedResult);
          setResult(parsed);
          setLoading(false);

          if (parsed.overall_score >= 78) {
            confetti({
              particleCount: 85,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
          return;
        } catch (e) {
          console.error('Failed to parse cached result:', e);
        }
      }
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/interview/results/${sessionId}`);
        const data = await res.json();
        if (res.ok && data.result) {
          setResult(data.result);
          if (data.session?.mode) setMode(data.session.mode);

          if (data.result.overall_score >= 78) {
            confetti({
              particleCount: 85,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <Loader2 size={36} className="animate-spin" color="var(--v2-green)" />
        <p style={{ color: 'var(--v2-muted)', fontSize: '15px' }}>Loading evaluation report...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', textAlign: 'center', padding: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Evaluation Report Not Found</h2>
        <p style={{ color: 'var(--v2-muted)', marginBottom: '24px' }}>
          We could not locate an evaluation report for this session. It may have expired or not yet finalized.
        </p>
        <Link href="/" className="v2-pill v2-pill-solid">
          Return to Interview Lab
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Link
          href="/"
          className="v2-pill v2-pill-ghost"
          style={{
            padding: '8px 18px',
            fontSize: '13.5px',
          }}
        >
          <ArrowLeft size={15} />
          Back to Mode Selection
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="v2-pill v2-pill-ghost"
            onClick={() => window.print()}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Printer size={15} />
            Print Report
          </button>
          <Link
            href="/"
            className="v2-pill v2-pill-solid"
            style={{ padding: '8px 22px', fontSize: '13px' }}
          >
            <RotateCcw size={15} />
            Practice Another Session
          </Link>
        </div>
      </div>

      {/* Header Title */}
      <div style={{ marginBottom: '36px' }}>
        <div className="v2-badge" style={{ marginBottom: '12px' }}>
          <span className="v2-badge-dot" />
          {mode === 'job' ? 'Technical Job Performance' : 'Consular Visa Credibility Report'}
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', marginBottom: '12px' }}>
          Spoken Performance <em>Evaluation Report</em>
        </h1>
        <p style={{ color: 'var(--v2-muted)', fontSize: '16px', maxWidth: '720px', lineHeight: 1.7 }}>
          Evaluated rigorously with Claude AI based on conversational depth, technical accuracy against GitHub/resume context, STAR method structure, and delivery confidence.
        </p>
      </div>

      {/* Score Overview */}
      <div style={{ marginBottom: '28px' }}>
        <ScoreOverview
          overallScore={result.overall_score}
          categoryScores={result.category_scores}
          mode={mode}
        />
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ marginBottom: '28px' }}>
        <FeedbackCard
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          flaggedConcerns={result.flagged_concerns}
          mode={mode}
        />
      </div>

      {/* Question by Question Review */}
      {result.per_question_feedback && result.per_question_feedback.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <QuestionBreakdown feedbackList={result.per_question_feedback} />
        </div>
      )}
    </div>
  );
}
