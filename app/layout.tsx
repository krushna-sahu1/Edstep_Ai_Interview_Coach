import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mic, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Mock Interview Coach — Real-Time Voice Practice',
  description:
    'Prepare for technical job and consular visa interviews with real-time AI spoken conversation, instant follow-ups, and comprehensive scored feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="nav-header">
          <Link href="/" className="brand-badge">
            <div className="brand-icon">
              <Mic size={20} color="#ffffff" />
            </div>
            <span>
              Interview<span style={{ color: 'var(--primary)' }}>Pulse</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={13} />
              Deepgram Voice Agent + Claude
            </span>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
