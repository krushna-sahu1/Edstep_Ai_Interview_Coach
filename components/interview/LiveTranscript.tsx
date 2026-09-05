'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, User, MessageSquare, Loader2, AlertTriangle, Radio } from 'lucide-react';
import { TranscriptItem, AgentConnectionState } from '@/hooks/useDeepgramVoiceAgent';

interface LiveTranscriptProps {
  transcripts: TranscriptItem[];
  mode: 'job' | 'visa';
  connectionState?: AgentConnectionState;
  errorMessage?: string | null;
}

export default function LiveTranscript({ transcripts, mode, connectionState = 'idle', errorMessage }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Transcript Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 20px',
          borderBottom: '1px solid var(--v2-line)',
          background: 'rgba(20, 16, 33, 0.6)',
        }}
      >
        <MessageSquare size={16} color="var(--v2-purple)" />
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v2-muted)', fontFamily: 'var(--v2-sans)' }}>
          Spoken Transcript Stream
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '99px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--v2-muted)',
            fontFamily: 'var(--v2-mono)',
          }}
        >
          {transcripts.length} exchanges
        </span>
      </div>

      {/* Transcript List */}
      <div className="ed-transcript-container" style={{ flex: 1, minHeight: '340px' }}>
        {transcripts.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '260px',
              color: 'var(--v2-dim)',
              textAlign: 'center',
              padding: '2rem',
              gap: '14px',
            }}
          >
            {connectionState === 'connecting' ? (
              <>
                <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(167, 139, 250, 0.1)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--v2-purple)' }} />
                </div>
                <div style={{ maxWidth: '340px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--v2-text)', marginBottom: '4px' }}>
                    Establishing secure stream with Deepgram
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--v2-muted)', lineHeight: 1.5 }}>
                    Verifying microphone permissions, minting session token, and configuring AI speech models...
                  </p>
                </div>
              </>
            ) : connectionState === 'reconnecting' ? (
              <>
                <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--v2-amber)' }} />
                </div>
                <div style={{ maxWidth: '340px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--v2-amber)', marginBottom: '4px' }}>
                    Reconnecting to Deepgram
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--v2-muted)', lineHeight: 1.5 }}>
                    Restoring audio WebSocket stream. Stand by...
                  </p>
                </div>
              </>
            ) : connectionState === 'error' || connectionState === 'disconnected' ? (
              <>
                <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)' }}>
                  <AlertTriangle size={32} style={{ color: '#f43f5e' }} />
                </div>
                <div style={{ maxWidth: '340px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', marginBottom: '4px' }}>
                    Voice Connection Interrupted
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--v2-muted)', lineHeight: 1.5 }}>
                    {errorMessage || 'Unable to establish WebSocket connection to Deepgram. Please click Retry above.'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(63, 169, 106, 0.1)' }}>
                  <Radio size={32} style={{ color: 'var(--v2-green)' }} />
                </div>
                <div style={{ maxWidth: '340px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--v2-text)', marginBottom: '4px' }}>
                    Voice Stream Active
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--v2-muted)', lineHeight: 1.5 }}>
                    The AI {mode === 'job' ? 'engineering lead' : 'consular officer'} is preparing the opening question. Speak freely into your microphone.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          transcripts.map((item) => (
            <div
              key={item.id}
              className={`ed-bubble ${item.speaker}`}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background:
                    item.speaker === 'agent'
                      ? 'rgba(167, 139, 250, 0.2)'
                      : 'rgba(63, 169, 106, 0.2)',
                  border: `1px solid ${item.speaker === 'agent' ? 'rgba(167, 139, 250, 0.4)' : 'rgba(63, 169, 106, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {item.speaker === 'agent' ? (
                  <Bot size={13} color="var(--v2-purple)" />
                ) : (
                  <User size={13} color="var(--v2-green)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '11px',
                    color: 'var(--v2-dim)',
                    fontFamily: 'var(--v2-sans)',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: item.speaker === 'agent' ? 'var(--v2-purple)' : 'var(--v2-green)',
                    }}
                  >
                    {item.speaker === 'agent'
                      ? mode === 'job'
                        ? 'Engineering Lead'
                        : 'Consular Officer'
                      : 'You (Spoken)'}
                  </span>
                  <span style={{ fontFamily: 'var(--v2-mono)' }}>{item.timestamp}</span>
                </div>
                <div style={{ fontSize: '14.5px', lineHeight: 1.6, wordBreak: 'break-word', color: 'var(--v2-white)' }}>
                  {item.text}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
