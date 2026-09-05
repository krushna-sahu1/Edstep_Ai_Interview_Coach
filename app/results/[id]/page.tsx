'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Printer, Share2, Sparkles, Loader2 } from 'lucide-react';
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

    // 1. Check local session storage first for immediate instant display
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

          // Confetti celebration for score >= 78
          if (parsed.overall_score >= 78) {
            confetti({
              particleCount: 80,
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

    // 2. Fetch from database if not cached
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/interview/results/${sessionId}`);
        const data = await res.json();
        if (res.ok && data.result) {
          setResult(data.result);
          if (data.session?.mode) setMode(data.session.mode);

          if (data.result.overall_score >= 78) {
            confetti({
              particleCount: 80,
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
          gap: '1rem',
        }}
      >
        <Loader2 size={36} className="animate-spin" color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading evaluation report...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Evaluation Report Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          We could not locate an evaluation report for this session. It may have expired or not yet finalized.
        </p>
        <Link href="/" className="btn btn-primary">
          Return to Setup
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          Back to Mode Selection
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
            style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            Print Report
          </button>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            <RotateCcw size={15} />
            Practice Another Session
          </Link>
        </div>
      </div>

      {/* Header Title */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span
            className="badge"
            style={{
              background: mode === 'job' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: mode === 'job' ? '#a5b4fc' : '#6ee7b7',
              border: `1px solid ${mode === 'job' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            {mode === 'job' ? 'Technical Job Interview' : 'Consular Visa Interview'}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Session ID: {sessionId.slice(0, 8)}...
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Spoken Performance Evaluation Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Graded objectively using Claude AI based on conversational depth, technical/consular accuracy, STAR method structure, and delivery confidence.
        </p>
      </div>

      {/* Score Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <ScoreOverview
          overallScore={result.overall_score}
          categoryScores={result.category_scores}
          mode={mode}
        />
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ marginBottom: '2rem' }}>
        <FeedbackCard
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          flaggedConcerns={result.flagged_concerns}
          mode={mode}
        />
      </div>

      {/* Question by Question Review */}
      {result.per_question_feedback && result.per_question_feedback.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <QuestionBreakdown feedbackList={result.per_question_feedback} />
        </div>
      )}
    </div>
  );
}
