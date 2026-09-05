'use client';

import React from 'react';
import { CheckCircle2, TrendingUp, AlertOctagon } from 'lucide-react';

interface FeedbackCardProps {
  strengths: string[];
  weaknesses: string[];
  flaggedConcerns: string[];
  mode: 'job' | 'visa';
}

export default function FeedbackCard({
  strengths,
  weaknesses,
  flaggedConcerns,
  mode,
}: FeedbackCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Flagged Concerns (Highlighted prominently at top if present) */}
      {flaggedConcerns && flaggedConcerns.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            background: 'rgba(244, 63, 94, 0.08)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <AlertOctagon size={20} color="#f43f5e" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fecdd3' }}>
              {mode === 'visa' ? 'Consular Red Flags & Refusal Risks' : 'Critical Performance Concerns'}
            </h4>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: 0 }}>
            {flaggedConcerns.map((concern, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#fda4af',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: '#f43f5e', fontWeight: 800 }}>•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Side-by-Side Strengths & Growth Areas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Strengths */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Key Strengths Demonstrated</h4>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingLeft: 0 }}>
            {strengths.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} color="var(--accent-amber)" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Areas for Growth & Polish</h4>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingLeft: 0 }}>
            {weaknesses.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <TrendingUp size={16} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
