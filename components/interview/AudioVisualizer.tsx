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
  // Generate reactive height for 18 waveform bars
  const bars = Array.from({ length: 18 }, (_, i) => {
    let height = 6;
    if (speakerState === 'speaking-agent') {
      height = Math.max(10, Math.sin((i / 18) * Math.PI + Date.now() / 200) * 30 + 8);
    } else if (speakerState === 'speaking-user' && !isMuted) {
      const multiplier = Math.max(0.2, volumeLevel * 2.5);
      height = Math.max(8, Math.sin((i / 18) * Math.PI) * 34 * multiplier + 6);
    }
    return Math.min(36, Math.max(6, height));
  });

  const getStatusLabel = () => {
    if (connectionState === 'connecting') return 'Connecting Voice Stream...';
    if (connectionState === 'reconnecting') return 'Reconnecting audio...';
    if (isMuted) return 'Microphone Muted';
    if (speakerState === 'speaking-agent') {
      return mode === 'job' ? 'Lead Interviewer Speaking...' : 'Consular Officer Speaking...';
    }
    if (speakerState === 'speaking-user') return 'Listening to Your Response...';
    if (speakerState === 'thinking') return 'Analyzing Response...';
    if (connectionState === 'connected') return 'Live Spoken Session Active';
    return 'Voice Engine Inactive';
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
      {/* EdSteps Concentric Hub Orb */}
      <div className="v2-hub-container">
        <div className="v2-hub-ring" />
        <div className="v2-hub-ring r2" />

        <div
          className={`v2-hub-core-orb ${speakerState}`}
          style={{
            transform:
              speakerState === 'speaking-user' && !isMuted
                ? `scale(${1 + Math.min(0.22, volumeLevel * 0.75)})`
                : undefined,
          }}
        >
          {isMuted ? (
            <MicOff size={38} color="#f43f5e" />
          ) : speakerState === 'speaking-agent' ? (
            <Volume2 size={40} color="var(--v2-purple)" />
          ) : speakerState === 'speaking-user' ? (
            <Mic size={40} color="var(--v2-green)" />
          ) : speakerState === 'thinking' ? (
            <Sparkles size={36} color="var(--v2-purple)" />
          ) : (
            <Radio size={36} color="var(--v2-muted)" />
          )}
        </div>
      </div>

      {/* EdSteps Styled Waveform */}
      <div className="ed-waveform" style={{ marginTop: '28px' }}>
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`ed-wave-bar ${
              speakerState === 'speaking-agent'
                ? 'active-agent'
                : speakerState === 'speaking-user' && !isMuted
                ? 'active-user'
                : ''
            }`}
            style={{
              height: `${height}px`,
            }}
          />
        ))}
      </div>

      {/* Status Badge */}
      <div style={{ marginTop: '20px' }}>
        <div
          className="v2-badge"
          style={{
            marginBottom: 0,
            borderColor:
              speakerState === 'speaking-agent'
                ? 'rgba(167, 139, 250, 0.4)'
                : isMuted
                ? 'rgba(244, 63, 94, 0.4)'
                : 'rgba(63, 169, 106, 0.3)',
            color:
              speakerState === 'speaking-agent'
                ? 'var(--v2-purple)'
                : isMuted
                ? '#fda4af'
                : 'var(--v2-green)',
            background:
              speakerState === 'speaking-agent'
                ? 'rgba(167, 139, 250, 0.1)'
                : isMuted
                ? 'rgba(244, 63, 94, 0.1)'
                : 'rgba(63, 169, 106, 0.12)',
          }}
        >
          <span
            className="v2-badge-dot"
            style={{
              background:
                speakerState === 'speaking-agent'
                  ? 'var(--v2-purple)'
                  : isMuted
                  ? '#f43f5e'
                  : 'var(--v2-green)',
            }}
          />
          {getStatusLabel()}
        </div>
      </div>
    </div>
  );
}
