'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Clock, AlertTriangle } from 'lucide-react';
import { AgentConnectionState } from '@/hooks/useDeepgramVoiceAgent';

interface InterviewControlsProps {
  connectionState: AgentConnectionState;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndInterview: () => void;
  isEnding: boolean;
}

export default function InterviewControls({
  connectionState,
  isMuted,
  onToggleMute,
  onEndInterview,
  isEnding,
}: InterviewControlsProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isNearTimeLimit = minutes >= 13;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(8, 12, 20, 0.4)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        }}
      >
        {/* Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: isNearTimeLimit ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: 600,
          }}
        >
          <Clock size={18} />
          <span>{formattedTime}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 15:00 limit</span>
          {isNearTimeLimit && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '99px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
              }}
            >
              Session wrapping up soon
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mute Button */}
          <button
            type="button"
            className={`btn ${isMuted ? 'btn-danger' : 'btn-secondary'}`}
            onClick={onToggleMute}
            disabled={connectionState !== 'connected'}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            style={{ padding: '0.65rem 1rem' }}
          >
            {isMuted ? (
              <>
                <MicOff size={18} />
                Unmute
              </>
            ) : (
              <>
                <Mic size={18} />
                Mute Mic
              </>
            )}
          </button>

          {/* End Interview Button */}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowConfirmModal(true)}
            disabled={isEnding}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <PhoneOff size={18} />
            End & Score Interview
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              background: '#0f172a',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertTriangle size={28} color="#f43f5e" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              End Spoken Interview?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Are you ready to complete your interview? We will immediately compile your answers and run Claude's comprehensive evaluation report.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1 }}
              >
                Continue Speaking
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowConfirmModal(false);
                  onEndInterview();
                }}
                disabled={isEnding}
                style={{ flex: 1 }}
              >
                {isEnding ? 'Scoring...' : 'Yes, End Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
