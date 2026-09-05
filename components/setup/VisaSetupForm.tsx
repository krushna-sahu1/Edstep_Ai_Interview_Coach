'use client';

import React, { useState } from 'react';
import { Globe2, ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
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
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Embassy Visa Consular Interview
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Select your destination visa category. Our AI Consular Officer will conduct an authentic, verbal visa interview to probe your intentions, funding, program details, and home-country ties.
        </p>
      </div>

      {/* Visa Selection Dropdown */}
      <div>
        <label className="input-label">Select Visa Category</label>
        <div style={{ position: 'relative' }}>
          <select
            className="select-input"
            value={selectedVisaId}
            onChange={(e) => setSelectedVisaId(e.target.value)}
          >
            {VISA_OPTIONS.map((v) => (
              <option key={v.id} value={v.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                {v.name} ({v.destinationCountry})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Visa Info Card */}
      {selectedVisa && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#6ee7b7' }}>
              Consular Protocol: {selectedVisa.code}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {selectedVisa.description}
          </p>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginTop: '0.25rem',
            }}
          >
            <Info size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Note:</strong> You don't need to fill out forms for funding or ties. The officer will probe these conversationally through targeted questions.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontSize: '0.85rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Start Button */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!selectedVisaId || isPreparing || isLoading}
        style={{
          padding: '0.9rem',
          fontSize: '1.05rem',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        }}
      >
        {isPreparing || isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Initializing Consular Session...
          </>
        ) : (
          <>
            Start Consular Interview
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
