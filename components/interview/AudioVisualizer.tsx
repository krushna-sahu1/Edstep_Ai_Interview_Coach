'use client';

import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Radio } from 'lucide-react';
import { AgentSpeakerState, AgentConnectionState } from '@/hooks/useDeepgramVoiceAgent';

interface AudioVisualizerProps {
  speakerState: AgentSpeakerState;
  connectionState: AgentConnectionState;
  isMuted: boolean;
  volumeLevel: number;
  mode: 'job' | 'visa';
}

export default function AudioVisualizer({
  speakerState,
  connectionState,
  isMuted,
  volumeLevel,
  mode,
}: AudioVisualizerProps) {
  // Generate reactive height for 16 waveform bars
  const bars = Array.from({ length: 16 }, (_, i) => {
    let height = 8;
    if (speakerState === 'speaking-agent') {
      height = Math.max(12, Math.sin((i / 16) * Math.PI + Date.now() / 200) * 32 + 10);
    } else if (speakerState === 'speaking-user' && !isMuted) {
      const multiplier = Math.max(0.2, volumeLevel * 2.5);
      height = Math.max(10, Math.sin((i / 16) * Math.PI) * 36 * multiplier + 8);
    }
    return Math.min(38, Math.max(6, height));
  });

  const getStatusLabel = () => {
    if (connectionState === 'connecting') return 'Connecting to Voice Agent...';
    if (connectionState === 'reconnecting') return 'Reconnecting audio stream...';
    if (isMuted) return 'Microphone Muted';
    if (speakerState === 'speaking-agent') {
      return mode === 'job' ? 'Hiring Lead Speaking...' : 'Consular Officer Speaking...';
    }
    if (speakerState === 'speaking-user') return 'Listening to Your Answer...';
    if (speakerState === 'thinking') return 'Analyzing Response...';
    if (connectionState === 'connected') return 'Listening (Ready for your response)';
    return 'Voice Inactive';
  };

  const getStatusBadgeClass = () => {
    if (speakerState === 'speaking-agent') return 'badge-adequate';
    if (speakerState === 'speaking-user') return 'badge-strong';
    if (isMuted) return 'badge-warning';
    return 'badge-strong';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        position: 'relative',
      }}
    >
      {/* Orb Animation */}
      <div className="orb-container">
        <div
          className={`voice-orb ${speakerState} ${isMuted ? 'muted' : ''}`}
          style={{
            transform:
              speakerState === 'speaking-user' && !isMuted
                ? `scale(${1 + Math.min(0.25, volumeLevel * 0.8)})`
                : undefined,
          }}
        >
          {isMuted ? (
            <MicOff size={44} color="#f43f5e" />
          ) : speakerState === 'speaking-agent' ? (
            <Volume2 size={44} color="#ffffff" />
          ) : speakerState === 'speaking-user' ? (
            <Mic size={44} color="#ffffff" />
          ) : speakerState === 'thinking' ? (
            <Sparkles size={40} color="#c7d2fe" />
          ) : (
            <Radio size={40} color="rgba(255, 255, 255, 0.7)" />
          )}
        </div>
      </div>

      {/* Reactive Waveform Bars */}
      <div className="waveform" style={{ marginTop: '1.75rem' }}>
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`waveform-bar ${
              speakerState === 'speaking-agent' || (speakerState === 'speaking-user' && !isMuted)
                ? 'active'
                : ''
            }`}
            style={{
              height: `${height}px`,
              background:
                speakerState === 'speaking-user'
                  ? 'var(--accent-emerald)'
                  : speakerState === 'speaking-agent'
                  ? 'var(--accent-cyan)'
                  : undefined,
            }}
          />
        ))}
      </div>

      {/* Live State Badge */}
      <div style={{ marginTop: '1.25rem' }}>
        <span className={`badge ${getStatusBadgeClass()}`} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
}
