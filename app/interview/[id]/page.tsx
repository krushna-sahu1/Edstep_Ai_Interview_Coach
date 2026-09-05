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

  // 1. Retrieve session configuration
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

    // Default fallback prompt if refreshed directly without storage
    setSystemPrompt(
      'You are a senior hiring engineering lead conducting an interactive technical interview. Greet the candidate and ask your opening question.'
    );
  }, [sessionId]);

  // 2. Initialize Voice Agent Hook
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

  // 3. Connect once prompt is available
  useEffect(() => {
    if (systemPrompt && !hasStarted && connectionState === 'idle') {
      setHasStarted(true);
      startSession();
    }
  }, [systemPrompt, hasStarted, connectionState, startSession]);

  // 4. Handle End Interview & Trigger Scoring
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

      // Store evaluation in session storage for immediate instant display
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
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
          Exit to Setup
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            className="badge"
            style={{
              background: mode === 'job' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: mode === 'job' ? '#a5b4fc' : '#6ee7b7',
              border: `1px solid ${mode === 'job' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            {mode === 'job' ? 'Technical Job Mode' : 'Consular Visa Mode'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              color: connectionState === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connectionState === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              }}
            />
            {connectionState === 'connected'
              ? 'Deepgram Voice Live'
              : connectionState === 'connecting'
              ? 'Connecting Voice...'
              : connectionState === 'reconnecting'
              ? 'Reconnecting...'
              : 'Voice Idle'}
          </span>
        </div>
      </div>

      {/* Permission / Reconnect Warning Banner */}
      {(permissionError || errorMessage) && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>{permissionError || errorMessage}</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => startSession()}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Main Room Layout: Two Columns (Visualizer + Live Transcript) */}
      <div
        className="glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)',
          overflow: 'hidden',
          minHeight: '560px',
        }}
      >
        {/* Left: Audio Visualizer & Voice Orb */}
        <div
          style={{
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(10, 15, 26, 0.5)',
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <LiveTranscript transcripts={transcripts} mode={mode} />
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div style={{ marginTop: '1rem' }} className="glass-panel">
        <InterviewControls
          connectionState={connectionState}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onEndInterview={handleEndInterview}
          isEnding={isEnding}
        />
      </div>

      {/* Full-Screen Loading Overlay when scoring */}
      {isEnding && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(8, 12, 20, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div className="voice-orb speaking-agent" style={{ width: '110px', height: '110px' }}>
            <Sparkles size={44} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Compiling Interview Evaluation
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '440px' }}>
              Claude is analyzing your verbal answers against the {mode === 'job' ? 'technical rubric and STAR method' : 'consular credibility and non-immigrant intent criteria'}...
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Calculating score & actionable recommendations</span>
          </div>
        </div>
      )}
    </div>
  );
}
