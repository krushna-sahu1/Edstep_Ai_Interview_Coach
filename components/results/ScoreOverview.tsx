'use client';

import React from 'react';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScoreOverviewProps {
  overallScore: number;
  categoryScores: Record<string, number>;
  mode: 'job' | 'visa';
}

export default function ScoreOverview({ overallScore, categoryScores, mode }: ScoreOverviewProps) {
  const getScoreVerdict = (score: number) => {
    if (mode === 'job') {
      if (score >= 90) return { label: 'Exceptional — Ready for Top Tech', color: 'var(--v2-green)' };
      if (score >= 80) return { label: 'Solid Candidate — Ready for Live Rounds', color: 'var(--v2-purple)' };
      if (score >= 70) return { label: 'Promising — Needs Minor Polish', color: 'var(--v2-amber)' };
      return { label: 'Needs Intensive Practice', color: 'var(--v2-rose)' };
    } else {
      if (score >= 88) return { label: 'High Approval Probability', color: 'var(--v2-green)' };
      if (score >= 78) return { label: 'Solid Case — Minor Clarifications Advised', color: 'var(--v2-purple)' };
      if (score >= 68) return { label: 'Consular Scrutiny Risk Detected', color: 'var(--v2-amber)' };
      return { label: 'High Refusal Risk (214b Concerns)', color: 'var(--v2-rose)' };
    }
  };

  const verdict = getScoreVerdict(overallScore);

  return (
    <div
      className="v2-card"
      style={{
        padding: '36px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '40px',
        alignItems: 'center',
      }}
    >
      {/* EdSteps Score Badge Dial */}
      <div style={{ textAlign: 'center', minWidth: '190px' }}>
        <div
          style={{
            width: '144px',
            height: '144px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 34% 28%, #251c40, #110c1e)',
            border: `2px solid ${verdict.color}`,
            boxShadow: `0 0 50px ${verdict.color}35`,
            margin: '0 auto',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--v2-serif)',
              fontSize: '3.2rem',
              fontWeight: 400,
              color: verdict.color,
              lineHeight: 1,
            }}
          >
            {overallScore}
          </span>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--v2-dim)',
              marginTop: '4px',
              fontFamily: 'var(--v2-sans)',
            }}
          >
            Overall Score
          </span>
        </div>

        <div style={{ marginTop: '14px' }}>
          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: verdict.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--v2-sans)',
            }}
          >
            {overallScore >= 75 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {verdict.label}
          </span>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Award size={18} color="var(--v2-green)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Category Rubric Breakdown</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {Object.entries(categoryScores).map(([category, score], idx) => {
            const barColor = idx % 2 === 0 ? 'var(--v2-green)' : 'var(--v2-purple)';
            return (
              <div key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--v2-white)', fontWeight: 500, fontFamily: 'var(--v2-sans)' }}>{category}</span>
                  <span style={{ color: barColor, fontWeight: 600, fontFamily: 'var(--v2-mono)' }}>{score}%</span>
                </div>
                <div
                  style={{
                    height: '7px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '99px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, score))}%`,
                      background: barColor,
                      borderRadius: '99px',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
