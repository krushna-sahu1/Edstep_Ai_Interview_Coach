'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, User, MessageSquare } from 'lucide-react';
import { TranscriptItem } from '@/hooks/useDeepgramVoiceAgent';

interface LiveTranscriptProps {
  transcripts: TranscriptItem[];
  mode: 'job' | 'visa';
}

export default function LiveTranscript({ transcripts, mode }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
        }}
      >
        <MessageSquare size={16} />
        <span>Live Spoken Transcript</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '99px',
            background: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          {transcripts.length} exchanges
        </span>
      </div>

      <div className="transcript-box" style={{ flex: 1, minHeight: '300px' }}>
        {transcripts.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '220px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '2rem',
              gap: '0.75rem',
            }}
          >
            <Bot size={36} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem', maxWidth: '320px', lineHeight: 1.5 }}>
              Waiting for connection. The AI {mode === 'job' ? 'interviewer' : 'consular officer'} will speak the opening question aloud.
            </p>
          </div>
        ) : (
          transcripts.map((item) => (
            <div
              key={item.id}
              className={`message-bubble ${item.speaker}`}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background:
                    item.speaker === 'agent'
                      ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {item.speaker === 'agent' ? (
                  <Bot size={13} color="#ffffff" />
                ) : (
                  <User size={13} color="#ffffff" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: item.speaker === 'agent' ? '#38bdf8' : '#a5b4fc' }}>
                    {item.speaker === 'agent'
                      ? mode === 'job'
                        ? 'Engineering Lead'
                        : 'Consular Officer'
                      : 'You'}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
                <div style={{ fontSize: '0.92rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
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
