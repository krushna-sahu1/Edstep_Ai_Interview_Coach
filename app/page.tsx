'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plane, Sparkles, Volume2, Shield, Award } from 'lucide-react';
import JobSetupForm from '@/components/setup/JobSetupForm';
import VisaSetupForm from '@/components/setup/VisaSetupForm';
import { ContextBundle, InterviewMode } from '@/types/interview';

export default function HomePage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<InterviewMode>('job');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async (contextBundle: ContextBundle) => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          context_bundle: contextBundle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start interview.');
      }

      // Cache session data locally for immediate voice agent initialization in the room
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `interview_session_${data.session_id}`,
          JSON.stringify({
            sessionId: data.session_id,
            mode: activeMode,
            agentConfig: data.agent_config,
            systemPrompt: data.system_prompt,
            contextBundle,
          })
        );
      }

      router.push(`/interview/${data.session_id}`);
    } catch (err: any) {
      alert(err.message || 'Error initializing interview session.');
      setIsStarting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: '#c7d2fe',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={15} color="var(--primary)" />
          Real-Time Voice AI • Low Latency Spoken Practice
        </div>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}
        >
          Ace Your Spoken Interview With{' '}
          <span
            style={{
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Live AI Conversation
          </span>
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Experience realistic, spoken dialogues with real-time turn detection and follow-ups. Choose technical engineering preparation or strict consular visa grilling.
        </p>

        {/* Mode Selector Tabs */}
        <div style={{ marginTop: '2.5rem' }}>
          <div className="mode-tabs">
            <button
              type="button"
              className={`tab-btn ${activeMode === 'job' ? 'active' : ''}`}
              onClick={() => setActiveMode('job')}
            >
              <Briefcase size={17} />
              Job Interview Mode
            </button>
            <button
              type="button"
              className={`tab-btn ${activeMode === 'visa' ? 'active' : ''}`}
              onClick={() => setActiveMode('visa')}
            >
              <Plane size={17} />
              Visa Consular Mode
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        className="glass-panel"
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '2.5rem',
        }}
      >
        {activeMode === 'job' ? (
          <JobSetupForm onStart={handleStartInterview} isLoading={isStarting} />
        ) : (
          <VisaSetupForm onStart={handleStartInterview} isLoading={isStarting} />
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '4rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Volume2 size={22} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Spoken, Not Written
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            No button clicks to record each response. Speak naturally and converse seamlessly with built-in voice activity detection (VAD).
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Shield size={22} color="var(--accent-emerald)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Complete Data Privacy
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your uploaded resume PDF is processed entirely in memory and immediately discarded. No raw resumes are ever stored on disk.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Award size={22} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Claude AI Scoring Report
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Receive an objective 0–100 score, rubric breakdown, delivery review, per-question critiques, and consular red-flag warnings.
          </p>
        </div>
      </div>
    </div>
  );
}
