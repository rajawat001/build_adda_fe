import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

const ServerErrorPage: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'down' | 'up'>('down');
  const [countdown, setCountdown] = useState(15);
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRedirected = useRef(false);

  const checkServer = useCallback(async () => {
    if (hasRedirected.current) return;
    setStatus('checking');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const healthUrl = API_URL.replace(/\/api\/?$/, '') + '/health';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      // Use fetch directly — NOT the api.ts interceptor (avoids redirect loop)
      const res = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setStatus('up');
        hasRedirected.current = true;
        // Navigate to homepage (not reload — prevents infinite loop)
        setTimeout(() => { window.location.href = '/'; }, 1000);
        return;
      }
    } catch {
      // Server still down
    }
    setStatus('down');
    setRetryCount(prev => prev + 1);
    setCountdown(15);
  }, []);

  // Auto-retry countdown
  useEffect(() => {
    if (status === 'up') return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          checkServer();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, checkServer]);

  // Initial check on mount
  useEffect(() => { checkServer(); }, []);

  const goHome = () => { window.location.href = '/'; };
  const goContact = () => { window.location.href = '/contact'; };

  return (
    <>
      <Head>
        <title>Something went wrong | BuildAdda</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="err5">
        <div className="err5-card">
          {/* Illustration */}
          <div className="err5-illustration">
            <div className={`err5-icon-ring ${status}`}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {status === 'up' ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Content */}
          {status === 'up' ? (
            <>
              <h1 className="err5-title" style={{ color: '#16a34a' }}>We&apos;re back!</h1>
              <p className="err5-subtitle">Redirecting you to the homepage...</p>
            </>
          ) : (
            <>
              <h1 className="err5-title">Something went wrong</h1>
              <p className="err5-subtitle">
                We&apos;re experiencing technical difficulties. Our team is working on it.
                {status === 'checking' ? ' Checking now...' : ` Retrying in ${countdown}s`}
              </p>
            </>
          )}

          {/* Status Badge */}
          <div className="err5-status-row">
            <span className={`err5-badge ${status}`}>
              <span className={`err5-dot ${status}`} />
              {status === 'up' ? 'Online' : status === 'checking' ? 'Checking...' : 'Offline'}
            </span>
            {retryCount > 0 && status !== 'up' && (
              <span className="err5-retry-count">Attempt {retryCount}</span>
            )}
          </div>

          {/* Progress bar */}
          {status !== 'up' && (
            <div className="err5-progress">
              <div className="err5-progress-fill" style={{ width: `${((15 - countdown) / 15) * 100}%` }} />
            </div>
          )}

          {/* Actions */}
          <div className="err5-actions">
            <button onClick={checkServer} className="err5-btn-primary" disabled={status === 'checking' || status === 'up'}>
              {status === 'checking' ? 'Checking...' : 'Retry Now'}
            </button>
            <button onClick={goHome} className="err5-btn-secondary">
              Go to Homepage
            </button>
          </div>

          {/* Help links */}
          <div className="err5-help">
            <button onClick={goContact} className="err5-help-link">Contact Support</button>
            <span className="err5-help-sep" />
            <button onClick={() => { window.location.reload(); }} className="err5-help-link">Reload Page</button>
          </div>

          {/* Footer */}
          <p className="err5-footer">Error 500 &middot; BuildAdda</p>
        </div>
      </div>

      <style jsx>{`
        .err5 {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .err5-card {
          max-width: 440px;
          width: 100%;
          text-align: center;
          padding: 48px 32px 36px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.06);
        }

        .err5-illustration { margin-bottom: 28px; }

        .err5-icon-ring {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
        }
        .err5-icon-ring.down { background: #fef2f2; color: #ef4444; }
        .err5-icon-ring.checking { background: #fffbeb; color: #f59e0b; animation: err5-pulse 1.5s ease infinite; }
        .err5-icon-ring.up { background: #f0fdf4; color: #16a34a; }

        @keyframes err5-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .err5-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px;
          line-height: 1.3;
        }

        .err5-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 20px;
          line-height: 1.6;
        }

        .err5-status-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .err5-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }
        .err5-badge.down { background: #fef2f2; color: #dc2626; }
        .err5-badge.checking { background: #fffbeb; color: #d97706; }
        .err5-badge.up { background: #f0fdf4; color: #16a34a; }

        .err5-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .err5-dot.down { background: #ef4444; animation: err5-blink 1.2s infinite; }
        .err5-dot.checking { background: #f59e0b; animation: err5-blink 0.6s infinite; }
        .err5-dot.up { background: #22c55e; }

        @keyframes err5-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }

        .err5-retry-count {
          font-size: 12px;
          color: #9ca3af;
        }

        .err5-progress {
          height: 3px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .err5-progress-fill {
          height: 100%;
          background: #ff6b35;
          border-radius: 3px;
          transition: width 1s linear;
        }

        .err5-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .err5-btn-primary,
        .err5-btn-secondary {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .err5-btn-primary {
          background: #ff6b35;
          color: #fff;
        }
        .err5-btn-primary:hover:not(:disabled) { background: #e85a2b; }
        .err5-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .err5-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .err5-btn-secondary:hover { background: #e5e7eb; }

        .err5-help {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .err5-help-link {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          padding: 0;
        }
        .err5-help-link:hover { color: #ff6b35; }
        .err5-help-sep {
          width: 1px;
          height: 14px;
          background: #d1d5db;
        }

        .err5-footer {
          font-size: 11px;
          color: #d1d5db;
          margin: 0;
          letter-spacing: 0.5px;
        }

        @media (max-width: 480px) {
          .err5-card { padding: 36px 20px 28px; }
          .err5-title { font-size: 20px; }
          .err5-actions { flex-direction: column; }
        }
      `}</style>
    </>
  );
};

export default ServerErrorPage;
