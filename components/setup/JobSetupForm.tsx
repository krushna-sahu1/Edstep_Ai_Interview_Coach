'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Github, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
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
      setErrorMsg('Add your resume or GitHub link to get personalized questions.');
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
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Personalized Tech Job Interview
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Provide your resume or GitHub profile (or both). Our AI engineering lead will craft deep-dive questions based on your actual repositories, stack, and project achievements.
        </p>
      </div>

      {/* Resume Upload Dropzone */}
      <div>
        <label className="input-label">Resume (PDF)</label>
        <div
          className={`file-dropzone ${dragOver ? 'active' : ''}`}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <FileText size={28} color="var(--primary)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                </div>
              </div>
              <CheckCircle2 size={20} color="var(--accent-emerald)" style={{ marginLeft: 'auto' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={32} color="var(--text-secondary)" />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Click to upload or drag & drop your resume
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                PDF format only (analyzed in-memory, never stored permanently)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub URL */}
      <div>
        <label className="input-label">GitHub Profile URL or Username</label>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Github size={18} />
          </div>
          <input
            type="text"
            className="text-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="e.g. https://github.com/torvalds or torvalds"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
          />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          We will inspect your top 3 recently pushed public repositories and project READMEs.
        </p>
      </div>

      {/* Inline Validation / Status */}
      {!hasAtLeastOneInput && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#fcd34d',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>Add your resume or GitHub link to unlock personalized questions.</span>
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Start Button */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!hasAtLeastOneInput || isPreparing || isLoading}
        style={{ padding: '0.9rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
      >
        {isPreparing || isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Analyzing Profile & Initializing...
          </>
        ) : (
          <>
            Start Spoken Interview
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
