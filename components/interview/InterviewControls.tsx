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
          padding: '16px 24px',
          borderTop: '1px solid var(--v2-line)',
          background: 'rgba(17, 14, 30, 0.7)',
          borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        }}
      >
        {/* Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: isNearTimeLimit ? 'var(--v2-amber)' : 'var(--v2-muted)',
            fontWeight: 600,
            fontFamily: 'var(--v2-sans)',
          }}
        >
          <Clock size={16} />
          <span style={{ fontFamily: 'var(--v2-mono)' }}>{formattedTime}</span>
          <span style={{ fontSize: '12px', color: 'var(--v2-dim)' }}>/ 15:00 limit</span>
          {isNearTimeLimit && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'rgba(240, 185, 92, 0.15)',
                color: 'var(--v2-amber)',
              }}
            >
              Session wrapping up
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mute Button */}
          <button
            type="button"
            className={`v2-pill ${isMuted ? 'v2-pill-danger' : 'v2-pill-ghost'}`}
            onClick={onToggleMute}
            disabled={connectionState !== 'connected'}
            style={{ padding: '9px 18px', fontSize: '13.5px' }}
          >
            {isMuted ? (
              <>
                <MicOff size={16} />
                Unmute Mic
              </>
            ) : (
              <>
                <Mic size={16} />
                Mute Mic
              </>
            )}
          </button>

          {/* End Interview Button */}
          <button
            type="button"
            className="v2-pill v2-pill-danger"
            onClick={() => setShowConfirmModal(true)}
            disabled={isEnding}
            style={{ padding: '9px 20px', fontSize: '13.5px', fontWeight: 600 }}
          >
            <PhoneOff size={16} />
            End &amp; Score Interview
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
            background: 'rgba(11, 8, 20, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="v2-card"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '32px 28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={24} color="#f43f5e" />
            </div>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '8px' }}>
              End Spoken Interview?
            </h3>
            <p style={{ color: 'var(--v2-muted)', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px' }}>
              Are you ready to complete your interview? We will immediately compile your answers and run Claude's comprehensive evaluation report.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="v2-pill v2-pill-ghost"
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: '12px' }}
              >
                Continue Speaking
              </button>
              <button
                type="button"
                className="v2-pill v2-pill-danger"
                onClick={() => {
                  setShowConfirmModal(false);
                  onEndInterview();
                }}
                disabled={isEnding}
                style={{ flex: 1, padding: '12px' }}
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
