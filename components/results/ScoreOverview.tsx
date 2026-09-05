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
      if (score >= 90) return { label: 'Exceptional — Strong Hire', color: '#10b981' };
      if (score >= 80) return { label: 'Solid Candidate — Ready for Live Interviews', color: '#38bdf8' };
      if (score >= 70) return { label: 'Promising — Needs Refinement & Polish', color: '#f59e0b' };
      return { label: 'Needs Intensive Practice', color: '#f43f5e' };
    } else {
      if (score >= 88) return { label: 'High Visa Approval Probability', color: '#10b981' };
      if (score >= 78) return { label: 'Solid Case — Minor Clarifications Advised', color: '#38bdf8' };
      if (score >= 68) return { label: 'Consular Scrutiny Risk Detected', color: '#f59e0b' };
      return { label: 'High Refusal Risk (214b Concerns)', color: '#f43f5e' };
    }
  };

  const verdict = getScoreVerdict(overallScore);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '2.5rem',
        alignItems: 'center',
      }}
    >
      {/* Dial / Circular Badge */}
      <div style={{ textAlign: 'center', minWidth: '180px' }}>
        <div
          className="score-circle"
          style={{
            borderColor: verdict.color,
            boxShadow: `0 0 40px ${verdict.color}40`,
          }}
        >
          <span className="score-number" style={{ color: verdict.color }}>
            {overallScore}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Score
          </span>
        </div>
        <div style={{ marginTop: '0.85rem' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: verdict.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {overallScore >= 75 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {verdict.label}
          </span>
        </div>
      </div>

      {/* Category Bars */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--primary)" />
          Category Performance Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(categoryScores).map(([category, score]) => {
            const barColor = score >= 85 ? '#10b981' : score >= 75 ? '#38bdf8' : score >= 65 ? '#f59e0b' : '#f43f5e';
            return (
              <div key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{category}</span>
                  <span style={{ color: barColor, fontWeight: 700 }}>{score}%</span>
                </div>
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.08)',
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
