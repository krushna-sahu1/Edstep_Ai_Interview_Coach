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
              gap: '12px',
            }}
          >
            <Bot size={38} style={{ opacity: 0.35, color: 'var(--v2-purple)' }} />
            <p style={{ fontSize: '14px', maxWidth: '340px', lineHeight: 1.6, color: 'var(--v2-muted)' }}>
              Establishing stream with Deepgram. The AI {mode === 'job' ? 'engineering lead' : 'consular officer'} will speak the opening question.
            </p>
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
