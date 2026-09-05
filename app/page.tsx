'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plane, ArrowRight } from 'lucide-react';
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
    <div>
      {/* Hero Section styled with EdSteps typography & layout */}
      <section style={{ padding: '80px 0 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div className="v2-badge">
            <span className="v2-badge-dot" />
            EdSteps AI Interview Lab
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.1rem)',
              lineHeight: 1.14,
              marginBottom: '20px',
            }}
          >
            Every interview decision.<br />
            <em>Mastered in spoken conversation.</em>
          </h1>

          <p
            style={{
              fontSize: '18px',
              maxWidth: '620px',
              margin: '0 auto 32px',
              color: 'var(--v2-white)',
              lineHeight: 1.7,
            }}
          >
            Practice real-time verbal interviews tailored to your actual resume, GitHub projects, or target visa protocol. Powered by Deepgram Voice Agent and graded by Claude.
          </p>

          {/* Mode Switcher Pills */}
          <div style={{ marginBottom: '36px' }}>
            <div className="mode-tabs-container">
              <button
                type="button"
                className={`mode-tab-btn ${activeMode === 'job' ? 'active' : ''}`}
                onClick={() => setActiveMode('job')}
              >
                <Briefcase size={16} color={activeMode === 'job' ? '#A78BFA' : 'currentColor'} />
                Job Interview Mode
              </button>
              <button
                type="button"
                className={`mode-tab-btn ${activeMode === 'visa' ? 'active' : ''}`}
                onClick={() => setActiveMode('visa')}
              >
                <Plane size={16} color={activeMode === 'visa' ? '#3FA96A' : 'currentColor'} />
                Visa Consular Mode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Form Card */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div className="v2-card">
          {activeMode === 'job' ? (
            <JobSetupForm onStart={handleStartInterview} isLoading={isStarting} />
          ) : (
            <VisaSetupForm onStart={handleStartInterview} isLoading={isStarting} />
          )}
        </div>
      </section>

      {/* EdSteps Infinite Ticker */}
      <div className="v2-ticker" aria-hidden="true">
        <div className="v2-ticker-track">
          <span>Real-Time Voice</span>
          <span>·</span>
          <span><b>Sub-Second Streaming</b></span>
          <span>·</span>
          <span>Resume &amp; GitHub Ingest</span>
          <span>·</span>
          <span><b>F-1 &amp; H-1B Consular Simulation</b></span>
          <span>·</span>
          <span>Claude 3.5 Rubric Scoring</span>
          <span>·</span>
          <span><b>Zero Turn-Based Latency</b></span>
          <span>·</span>
          <span>STAR Method Analysis</span>
          <span>·</span>
          <span><b>In-Memory Privacy</b></span>
          <span>·</span>
          <span>Real-Time Voice</span>
          <span>·</span>
          <span><b>Sub-Second Streaming</b></span>
          <span>·</span>
          <span>Resume &amp; GitHub Ingest</span>
          <span>·</span>
          <span><b>F-1 &amp; H-1B Consular Simulation</b></span>
          <span>·</span>
          <span>Claude 3.5 Rubric Scoring</span>
          <span>·</span>
          <span><b>Zero Turn-Based Latency</b></span>
          <span>·</span>
        </div>
      </div>

      {/* EdSteps Ecosystem Capabilities Grid */}
      <section style={{ padding: '80px 0 30px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="v2-eyebrow">EdSteps Interview Simulation Features</span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)', margin: '8px 0 12px' }}>
              Built for real candidates, <em>not test scripts.</em>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Feature 1 */}
            <div className="v2-card" style={{ padding: '24px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(63, 169, 106, 0.12)',
                  border: '1px solid rgba(63, 169, 106, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '16px',
                }}
              >
                🎙️
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Conversational Spoken Flow</h3>
              <p style={{ fontSize: '14px', color: 'var(--v2-white)', lineHeight: 1.6 }}>
                Powered by Deepgram Voice Agent. Interrupt when needed, hear natural intonation, and experience realistic pressure with zero record-and-wait friction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="v2-card" style={{ padding: '24px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(167, 139, 250, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '16px',
                }}
              >
                🔍
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Personalized Question Engine</h3>
              <p style={{ fontSize: '14px', color: 'var(--v2-white)', lineHeight: 1.6 }}>
                Your engineering interview probes your actual GitHub commit history and resume text. Your visa interview scrutinizes ties and funding conversationally.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="v2-card" style={{ padding: '24px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '16px',
                }}
              >
                📊
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Claude 3.5 Evaluation Report</h3>
              <p style={{ fontSize: '14px', color: 'var(--v2-white)', lineHeight: 1.6 }}>
                Receive an objective 0–100 score, rubric breakdown, delivery signals, per-question feedback, and flagged consular red flags upon session completion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
