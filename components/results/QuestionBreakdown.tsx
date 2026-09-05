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
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(63, 169, 106, 0.12)',
              border: '1px solid rgba(63, 169, 106, 0.35)',
              color: 'var(--v2-green)',
              fontFamily: 'var(--v2-sans)',
            }}
          >
            Strong Response
          </span>
        );
      case 'adequate':
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(167, 139, 250, 0.12)',
              border: '1px solid rgba(167, 139, 250, 0.35)',
              color: 'var(--v2-purple)',
              fontFamily: 'var(--v2-sans)',
            }}
          >
            Adequate
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(240, 185, 92, 0.12)',
              border: '1px solid rgba(240, 185, 92, 0.35)',
              color: 'var(--v2-amber)',
              fontFamily: 'var(--v2-sans)',
            }}
          >
            Needs Refinement
          </span>
        );
    }
  };

  return (
    <div className="v2-card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <MessageSquare size={20} color="var(--v2-purple)" />
        <h3 style={{ fontSize: '1.4rem', margin: 0 }}>
          Question-by-Question Spoken Dialogue Review
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {feedbackList.map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              style={{
                border: '1px solid var(--v2-line)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: isExpanded ? 'var(--v2-card2)' : 'rgba(20, 16, 33, 0.4)',
                transition: 'all 0.22s ease',
              }}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleExpand(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '12px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(167, 139, 250, 0.15)',
                      color: 'var(--v2-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                      fontFamily: 'var(--v2-mono)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: '15px', color: 'var(--v2-white)', fontFamily: 'var(--v2-sans)' }}>
                    {item.question}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getRatingBadge(item.rating)}
                  {isExpanded ? (
                    <ChevronUp size={18} color="var(--v2-muted)" />
                  ) : (
                    <ChevronDown size={18} color="var(--v2-muted)" />
                  )}
                </div>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0 20px 20px',
                    borderTop: '1px solid var(--v2-line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--v2-dim)', marginBottom: '4px', fontFamily: 'var(--v2-sans)' }}>
                      Spoken Answer Summary:
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--v2-muted)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                      "{item.answer_summary}"
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'rgba(63, 169, 106, 0.06)',
                      border: '1px solid rgba(63, 169, 106, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    <Lightbulb size={18} color="var(--v2-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--v2-green)', marginBottom: '3px', fontFamily: 'var(--v2-sans)' }}>
                        Coach Recommendation:
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--v2-white)', lineHeight: 1.6, margin: 0 }}>
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
