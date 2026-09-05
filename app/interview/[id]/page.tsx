'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import AudioVisualizer from '@/components/interview/AudioVisualizer';
import LiveTranscript from '@/components/interview/LiveTranscript';
import InterviewControls from '@/components/interview/InterviewControls';
import { useDeepgramVoiceAgent } from '@/hooks/useDeepgramVoiceAgent';
import { InterviewMode } from '@/types/interview';

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || '';

  const [mode, setMode] = useState<InterviewMode>('job');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [contextBundle, setContextBundle] = useState<any>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`interview_session_${sessionId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setMode(parsed.mode || 'job');
          setSystemPrompt(parsed.systemPrompt || '');
          setContextBundle(parsed.contextBundle || {});
          return;
        } catch (e) {
          console.error('Failed to parse cached session:', e);
        }
      }
    }

    setSystemPrompt(
      'You are a senior hiring engineering lead conducting an interactive technical interview. Greet the candidate and ask your opening question.'
    );
  }, [sessionId]);

  const {
    connectionState,
    speakerState,
    isMuted,
    volumeLevel,
    transcripts,
    errorMessage,
    startSession,
    toggleMute,
    endSession,
  } = useDeepgramVoiceAgent({
    sessionId,
    systemPrompt,
    onError: (err) => {
      if (err.toLowerCase().includes('permission') || err.toLowerCase().includes('notallowederror')) {
        setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      }
    },
  });

  useEffect(() => {
    if (systemPrompt && !hasStarted && connectionState === 'idle') {
      setHasStarted(true);
      startSession();
    }
  }, [systemPrompt, hasStarted, connectionState, startSession]);

  const handleEndInterview = async () => {
    setIsEnding(true);
    endSession();

    try {
      const turnsPayload = transcripts.map((t, idx) => ({
        session_id: sessionId,
        turn_index: idx,
        speaker: t.speaker,
        question_text: t.speaker === 'agent' ? t.text : '',
        answer_transcript: t.speaker === 'user' ? t.text : '',
        timestamp: new Date().toISOString(),
      }));

      const res = await fetch('/api/interview/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          mode,
          context_bundle: contextBundle,
          turns: turnsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete interview scoring.');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`interview_result_${sessionId}`, JSON.stringify(data.result));
      }

      router.push(`/results/${sessionId}`);
    } catch (err: any) {
      console.error('End interview error:', err);
      alert(err.message || 'Error compiling evaluation report.');
      setIsEnding(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Top Breadcrumb Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <Link
          href="/"
          className="v2-pill v2-pill-ghost"
          style={{
            padding: '7px 16px',
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          Exit to Setup
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="v2-badge"
            style={{
              marginBottom: 0,
              padding: '6px 14px',
              fontSize: '11px',
              background: mode === 'job' ? 'rgba(167, 139, 250, 0.12)' : 'rgba(63, 169, 106, 0.12)',
              borderColor: mode === 'job' ? 'rgba(167, 139, 250, 0.35)' : 'rgba(63, 169, 106, 0.35)',
              color: mode === 'job' ? 'var(--v2-purple)' : 'var(--v2-green)',
            }}
          >
            <span
              className="v2-badge-dot"
              style={{
                background: mode === 'job' ? 'var(--v2-purple)' : 'var(--v2-green)',
              }}
            />
            {mode === 'job' ? 'Engineering Technical Interview' : 'Consular Visa Adjudication'}
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: 'var(--v2-mono)',
              color: connectionState === 'connected' ? 'var(--v2-green)' : 'var(--v2-amber)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: connectionState === 'connected' ? 'var(--v2-green)' : 'var(--v2-amber)',
              }}
            />
            {connectionState === 'connected'
              ? 'Voice Live'
              : connectionState === 'connecting'
              ? 'Connecting...'
              : connectionState === 'reconnecting'
              ? 'Reconnecting...'
              : 'Idle'}
          </span>
        </div>
      </div>

      {/* Permission / Error Warning */}
      {(permissionError || errorMessage) && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '13.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span>{permissionError || errorMessage}</span>
          </div>
          <button
            type="button"
            className="v2-pill v2-pill-ghost"
            onClick={() => startSession()}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Main Room Layout: Two Columns */}
      <div
        className="v2-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.25fr)',
          padding: 0,
          overflow: 'hidden',
          minHeight: '580px',
        }}
      >
        {/* Left: Audio Visualizer & Concentric Ring Hub */}
        <div
          style={{
            borderRight: '1px solid var(--v2-line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(17, 13, 28, 0.5)',
          }}
        >
          <AudioVisualizer
            speakerState={speakerState}
            connectionState={connectionState}
            isMuted={isMuted}
            volumeLevel={volumeLevel}
            mode={mode}
          />
        </div>

        {/* Right: Live Transcript Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--v2-card)' }}>
          <LiveTranscript transcripts={transcripts} mode={mode} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="v2-card" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <InterviewControls
          connectionState={connectionState}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onEndInterview={handleEndInterview}
          isEnding={isEnding}
        />
      </div>

      {/* Loading Overlay */}
      {isEnding && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(11, 8, 20, 0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <div className="v2-hub-core-orb speaking-agent" style={{ width: '100px', height: '100px' }}>
            <Sparkles size={38} color="var(--v2-green)" />
          </div>
          <div>
            <span className="v2-eyebrow">EdSteps Assessment Engine</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              Compiling Interview <em>Evaluation</em>
            </h2>
            <p style={{ color: 'var(--v2-muted)', fontSize: '15px', maxWidth: '460px', lineHeight: 1.6 }}>
              Claude is analyzing your verbal exchanges against the {mode === 'job' ? 'technical rubric and STAR method' : 'consular credibility and non-immigrant intent criteria'}...
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--v2-green)', fontSize: '13px', fontFamily: 'var(--v2-mono)' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Calculating score and actionable advice...</span>
          </div>
        </div>
      )}
    </div>
  );
}
