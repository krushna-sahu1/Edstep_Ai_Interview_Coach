'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isInterviewLab = pathname === '/' || pathname.startsWith('/interview') || pathname.startsWith('/results');
  const isRoiCalculator = pathname.startsWith('/roi-calculator');

  return (
    <nav className="landing-nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          {/* EdSteps Symbol SVG */}
          <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#3FA96A" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M12 7L6 10.5V17.5L12 21L18 17.5V10.5L12 7Z" fill="rgba(63, 169, 106, 0.2)" stroke="#A78BFA" strokeWidth="1.5" />
            <circle cx="12" cy="14" r="2.5" fill="#3FA96A" />
          </svg>
          <span className="nav-wordmark">
            EdSteps <span>Interview AI</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link
            href="/"
            className={`nav-link-item ${isInterviewLab ? 'active' : ''}`}
          >
            Interview Lab
          </Link>
          <Link
            href="/roi-calculator"
            className={`nav-link-item ${isRoiCalculator ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Calculator size={13} style={{ color: isRoiCalculator ? 'var(--v2-green)' : 'currentColor' }} />
            ROI Calculator
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" className="v2-pill v2-pill-ghost" style={{ padding: '8px 18px', fontSize: '13px' }}>
            New Session
          </Link>
          <a
            href="https://www.edsteps.in/login"
            target="_blank"
            rel="noopener noreferrer"
            className="v2-pill v2-pill-solid"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Join EdSteps
          </a>
        </div>
      </div>
    </nav>
  );
}
