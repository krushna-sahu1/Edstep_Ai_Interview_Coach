'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FolderGit2, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { JobContextBundle } from '@/types/interview';

interface JobSetupFormProps {
  onStart: (bundle: JobContextBundle) => void;
  isLoading: boolean;
}

export default function JobSetupForm({ onStart, isLoading }: JobSetupFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasAtLeastOneInput = Boolean(file || githubUrl.trim());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.pdf')) {
        setErrorMsg('Please upload a PDF file (.pdf format).');
        return;
      }
      setErrorMsg(null);
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.name.endsWith('.pdf')) {
        setErrorMsg('Please upload a PDF file (.pdf format).');
        return;
      }
      setErrorMsg(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAtLeastOneInput) {
      setErrorMsg('Add your resume or GitHub link to unlock personalized questions.');
      return;
    }

    setErrorMsg(null);
    setIsPreparing(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }
      if (githubUrl.trim()) {
        formData.append('github_url', githubUrl.trim());
      }

      const res = await fetch('/api/job/prepare', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to prepare interview context.');
      }

      onStart(data.context_bundle);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong preparing your interview.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <span className="v2-eyebrow">Engineering Track</span>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
          Technical Job Interview <em>Simulation</em>
        </h2>
        <p style={{ color: 'var(--v2-muted)', fontSize: '14.5px', lineHeight: 1.6 }}>
          Provide your resume or GitHub profile (or both). Our AI engineering manager will construct personalized probing questions based on your actual repositories and stack.
        </p>
      </div>

      {/* Resume Upload Dropzone */}
      <div>
        <label className="ed-label">Candidate Resume (PDF)</label>
        <div
          className={`ed-dropzone ${dragOver ? 'active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
          />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <FileText size={28} color="var(--v2-green)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--v2-white)' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--v2-muted)', fontFamily: 'var(--v2-sans)' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • In-Memory Parsing Ready
                </div>
              </div>
              <CheckCircle2 size={20} color="var(--v2-green)" style={{ marginLeft: 'auto' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={30} color="var(--v2-dim)" />
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--v2-white)' }}>
                Click to upload or drag &amp; drop your resume
              </div>
              <div style={{ fontSize: '12px', color: 'var(--v2-dim)', fontFamily: 'var(--v2-sans)' }}>
                Processed in-memory only — never permanently stored
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub URL */}
      <div>
        <label className="ed-label">GitHub Profile URL or Username</label>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--v2-dim)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FolderGit2 size={18} />
          </div>
          <input
            type="text"
            className="ed-input"
            style={{ paddingLeft: '44px' }}
            placeholder="e.g. https://github.com/torvalds or torvalds"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
          />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--v2-dim)', marginTop: '6px', fontFamily: 'var(--v2-sans)' }}>
          We inspect your top 3 most recently pushed public repositories &amp; README architecture summaries.
        </p>
      </div>

      {/* Validation Warning */}
      {!hasAtLeastOneInput && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(240, 185, 92, 0.08)',
            border: '1px solid rgba(240, 185, 92, 0.25)',
            color: 'var(--v2-amber)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--v2-sans)',
          }}
        >
          <AlertCircle size={16} />
          <span>Add your resume or GitHub link to unlock personalized questions.</span>
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--v2-sans)',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Start Button */}
      <button
        type="submit"
        className="v2-pill v2-pill-solid"
        disabled={!hasAtLeastOneInput || isPreparing || isLoading}
        style={{ width: '100%', padding: '14px', fontSize: '15.5px', marginTop: '6px' }}
      >
        {isPreparing || isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing Profile &amp; Preparing Session...
          </>
        ) : (
          <>
            Start Spoken Interview
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
