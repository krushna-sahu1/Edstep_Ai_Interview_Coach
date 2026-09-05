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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Flagged Concerns (Highlighted prominently at top if present) */}
      {flaggedConcerns && flaggedConcerns.length > 0 && (
        <div
          className="v2-card"
          style={{
            padding: '24px',
            background: 'rgba(244, 63, 94, 0.08)',
            borderColor: 'rgba(244, 63, 94, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertOctagon size={20} color="#f43f5e" />
            <h4 style={{ fontSize: '1.2rem', color: '#fecdd3', margin: 0 }}>
              {mode === 'visa' ? 'Consular Red Flags & Refusal Risks' : 'Critical Performance Flags'}
            </h4>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: 0 }}>
            {flaggedConcerns.map((concern, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#fda4af',
                  lineHeight: 1.6,
                  fontFamily: 'var(--v2-body)',
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
          gap: '20px',
        }}
      >
        {/* Strengths */}
        <div className="v2-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(63, 169, 106, 0.12)',
                border: '1px solid rgba(63, 169, 106, 0.3)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CheckCircle2 size={18} color="var(--v2-green)" />
            </div>
            <h4 style={{ fontSize: '1.25rem', margin: 0 }}>Key Strengths Demonstrated</h4>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0 }}>
            {strengths.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '14px',
                  color: 'var(--v2-white)',
                  lineHeight: 1.6,
                  fontFamily: 'var(--v2-body)',
                }}
              >
                <CheckCircle2 size={16} color="var(--v2-green)" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="v2-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(167, 139, 250, 0.12)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <TrendingUp size={18} color="var(--v2-purple)" />
            </div>
            <h4 style={{ fontSize: '1.25rem', margin: 0 }}>Areas for Growth &amp; Polish</h4>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0 }}>
            {weaknesses.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '14px',
                  color: 'var(--v2-white)',
                  lineHeight: 1.6,
                  fontFamily: 'var(--v2-body)',
                }}
              >
                <TrendingUp size={16} color="var(--v2-purple)" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
