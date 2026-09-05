import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mic } from 'lucide-react';

export const metadata: Metadata = {
  title: 'EdSteps Interview AI — Real-Time Voice Career & Visa Simulator',
  description:
    'Experience real-time AI spoken mock interviews with alumni-calibrated engineering leads and consular visa officers. Direct low-latency voice, instant follow-ups, and Claude scoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* EdSteps Header / Navigation */}
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
              <Link href="/" className="nav-link-item active">
                Interview Lab
              </Link>
              <a href="https://www.edsteps.in/ecosystem" target="_blank" rel="noopener noreferrer" className="nav-link-item">
                Ecosystem
              </a>
              <a href="https://www.edsteps.in/direction" target="_blank" rel="noopener noreferrer" className="nav-link-item">
                Direction
              </a>
              <a href="https://www.edsteps.in/edstepsai" target="_blank" rel="noopener noreferrer" className="nav-link-item">
                AI Agents
              </a>
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

        <main>{children}</main>

        {/* EdSteps Footer */}
        <footer className="es-footer">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 30px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '40px',
                marginBottom: '60px',
              }}
            >
              <div>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#3FA96A" strokeWidth="2.2" strokeLinejoin="round" />
                    <circle cx="12" cy="14" r="2.5" fill="#3FA96A" />
                  </svg>
                  <span style={{ fontFamily: 'var(--v2-sans)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--v2-white)' }}>
                    EdSteps
                  </span>
                </Link>
                <p style={{ color: 'var(--v2-muted)', fontSize: '14px', lineHeight: 1.7, maxWidth: '260px' }}>
                  Alumni-Informed. AI-Powered.<br />
                  Concierge-Supported.<br />
                  Vault-Protected.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--v2-dim)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Simulation Lab
                </h4>
                <div style={{ width: '100%', height: '1px', background: 'var(--v2-line)', marginBottom: '16px' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><Link href="/" style={{ color: 'var(--v2-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Job Interview Practice</Link></li>
                  <li><Link href="/" style={{ color: 'var(--v2-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Consular Visa Practice</Link></li>
                  <li><span style={{ color: 'var(--v2-muted)', fontSize: '13.5px' }}>Personalized via GitHub / PDF</span></li>
                  <li><span style={{ color: 'var(--v2-muted)', fontSize: '13.5px' }}>Claude 3.5 Scoring Rubric</span></li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: 'var(--v2-dim)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  EdSteps Ecosystem
                </h4>
                <div style={{ width: '100%', height: '1px', background: 'var(--v2-line)', marginBottom: '16px' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><a href="https://www.edsteps.in/edstepsai" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none', fontSize: '13.5px' }}>EdSteps AI</a></li>
                  <li><a href="https://www.edsteps.in/direction" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Direction Library</a></li>
                  <li><a href="https://www.edsteps.in/find-mentor" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Mentor Platform</a></li>
                  <li><a href="https://www.edsteps.in/concierge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Concierge Services</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: 'var(--v2-dim)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Architecture
                </h4>
                <div style={{ width: '100%', height: '1px', background: 'var(--v2-line)', marginBottom: '16px' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><span style={{ color: 'var(--v2-muted)', fontSize: '13.5px' }}>Deepgram Voice Agent API</span></li>
                  <li><span style={{ color: 'var(--v2-muted)', fontSize: '13.5px' }}>Anthropic Claude Evaluation</span></li>
                  <li><span style={{ color: 'var(--v2-muted)', fontSize: '13.5px' }}>Supabase Postgres</span></li>
                  <li><span style={{ color: 'var(--v2-green)', fontSize: '13.5px' }}>In-Memory Resume Privacy</span></li>
                </ul>
              </div>
            </div>

            <div
              style={{
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                fontSize: '12px',
                color: 'var(--v2-dim)',
              }}
            >
              <p style={{ margin: 0, fontFamily: 'var(--v2-sans)' }}>
                © 2026 Movyra Private Limited. All rights reserved. Powered by EdSteps.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="https://www.edsteps.in/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none' }}>Privacy</a>
                <span>·</span>
                <a href="https://www.edsteps.in/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none' }}>Terms</a>
                <span>·</span>
                <a href="https://www.edsteps.in/security" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-muted)', textDecoration: 'none' }}>Security</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
