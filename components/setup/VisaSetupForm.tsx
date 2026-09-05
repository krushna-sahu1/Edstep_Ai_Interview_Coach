'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
import { VISA_OPTIONS, VisaOption } from '@/lib/visa-data';
import { VisaContextBundle } from '@/types/interview';

interface VisaSetupFormProps {
  onStart: (bundle: VisaContextBundle) => void;
  isLoading: boolean;
}

export default function VisaSetupForm({ onStart, isLoading }: VisaSetupFormProps) {
  const [selectedVisaId, setSelectedVisaId] = useState<string>('f1-student-us');
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedVisa: VisaOption | undefined = VISA_OPTIONS.find(v => v.id === selectedVisaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisaId) return;

    setErrorMsg(null);
    setIsPreparing(true);

    try {
      const res = await fetch('/api/visa/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visa_type: selectedVisaId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to prepare visa interview.');
      }

      onStart(data.context_bundle);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error preparing visa interview.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <span className="v2-eyebrow">Immigration &amp; Study Track</span>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
          Embassy Consular Interview <em>Simulation</em>
        </h2>
        <p style={{ color: 'var(--v2-muted)', fontSize: '14.5px', lineHeight: 1.6 }}>
          Select your destination visa category. Our AI Consular Officer conducts an authentic, verbal visa adjudication to probe your intent, funding, academic program, and home-country ties.
        </p>
      </div>

      {/* Visa Selection Dropdown */}
      <div>
        <label className="ed-label">Target Visa Category</label>
        <div style={{ position: 'relative' }}>
          <select
            className="ed-select"
            value={selectedVisaId}
            onChange={(e) => setSelectedVisaId(e.target.value)}
          >
            {VISA_OPTIONS.map((v) => (
              <option key={v.id} value={v.id} style={{ background: '#141021', color: '#F5F4FA' }}>
                {v.name} ({v.destinationCountry})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Visa Info Card (EdSteps Card2 Style) */}
      {selectedVisa && (
        <div
          className="v2-card2"
          style={{
            padding: '20px',
            background: 'rgba(63, 169, 106, 0.05)',
            borderColor: 'rgba(63, 169, 106, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--v2-green)" />
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--v2-green)', fontFamily: 'var(--v2-sans)' }}>
              Protocol Active: {selectedVisa.code}
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--v2-white)', lineHeight: 1.6 }}>
            {selectedVisa.description}
          </p>
          <div
            style={{
              fontSize: '12.5px',
              color: 'var(--v2-muted)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              marginTop: '4px',
              fontFamily: 'var(--v2-sans)',
            }}
          >
            <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--v2-purple)' }} />
            <span>
              <strong>Conversational Probing:</strong> You do not need to submit financial paperwork in advance. The consular officer will probe funding and non-immigrant intent dynamically.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontSize: '13.5px',
            fontFamily: 'var(--v2-sans)',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Start Button */}
      <button
        type="submit"
        className="v2-pill v2-pill-solid"
        disabled={!selectedVisaId || isPreparing || isLoading}
        style={{ width: '100%', padding: '14px', fontSize: '15.5px', marginTop: '6px' }}
      >
        {isPreparing || isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Initializing Consular Session...
          </>
        ) : (
          <>
            Start Consular Interview
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
