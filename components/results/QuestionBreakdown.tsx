'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Lightbulb } from 'lucide-react';
import { PerQuestionFeedback } from '@/types/results';

interface QuestionBreakdownProps {
  feedbackList: PerQuestionFeedback[];
}

export default function QuestionBreakdown({ feedbackList }: QuestionBreakdownProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getRatingBadge = (rating?: string) => {
    switch (rating?.toLowerCase()) {
      case 'strong':
        return <span className="badge badge-strong">Strong Response</span>;
      case 'adequate':
        return <span className="badge badge-adequate">Adequate</span>;
      default:
        return <span className="badge badge-warning">Needs Refinement</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={20} color="var(--primary)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
          Question-by-Question Spoken Dialogue Review
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {feedbackList.map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Header Toggle */}
              <div
                onClick={() => toggleExpand(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.25rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, paddingRight: '1rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {item.question}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {getRatingBadge(item.rating)}
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0 1.25rem 1.25rem 1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Your Spoken Answer Summary:
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{item.answer_summary}"
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                    }}
                  >
                    <Lightbulb size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe', marginBottom: '0.2rem' }}>
                        Coach Recommendation:
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {item.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
