import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ServerErrorPage: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'down' | 'up'>('checking');
  const [countdown, setCountdown] = useState(30);
  const [retryCount, setRetryCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const healthUrl = API_URL.replace(/\/api\/?$/, '') + '/health';

  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setServerStatus('up');
        // Server is back — reload after brief delay
        setTimeout(() => window.location.reload(), 500);
        return;
      }
      setServerStatus('down');
    } catch {
      setServerStatus('down');
    }
    setRetryCount(prev => prev + 1);
    setCountdown(30);
  }, [healthUrl]);

  // Initial check
  useEffect(() => {
    checkServer();
  }, [checkServer]);

  // Auto-retry every 30 seconds
  useEffect(() => {
    if (serverStatus === 'up') return;
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, [checkServer, serverStatus]);

  // Countdown ticker
  useEffect(() => {
    if (serverStatus === 'up') return;
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [serverStatus]);

  const isDown = serverStatus === 'down';
  const isChecking = serverStatus === 'checking';

  return (
    <>
      <Head>
        <title>{isDown ? 'Server Down' : 'Server Error'} | BuildAdda</title>
        <meta name="description" content="Something went wrong. We're working on fixing it." />
      </Head>

      <div className="error-page">
        <div className="error-container">
          {/* Animated Server Status */}
          <div className="server-status-visual">
            <div className={`server-icon-wrapper ${isDown ? 'down' : isChecking ? 'checking' : 'up'}`}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div className={`status-indicator ${isDown ? 'red' : isChecking ? 'yellow' : 'green'}`} />
          </div>

          <h1 className="error-title">
            {isDown ? 'Server is Unreachable' : isChecking ? 'Checking Server...' : 'Server Error'}
          </h1>

          <p className="error-message">
            {isDown
              ? 'Our servers are currently down. Our team has been notified and is working to restore service as quickly as possible.'
              : isChecking
                ? 'Please wait while we check the server status...'
                : 'An unexpected error occurred. Please try again.'
            }
          </p>

          {/* Live Status Card */}
          <div className="status-card">
            <div className="status-row">
              <span className="status-label">Server Status</span>
              <span className={`status-badge ${isDown ? 'badge-red' : isChecking ? 'badge-yellow' : 'badge-green'}`}>
                <span className={`badge-dot ${isDown ? 'red' : isChecking ? 'yellow' : 'green'}`} />
                {isDown ? 'Offline' : isChecking ? 'Checking...' : 'Online'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Retry Attempts</span>
              <span className="status-value">{retryCount}</span>
            </div>
            <div className="status-row">
              <span className="status-label">Next Retry</span>
              <span className="status-value">
                {isChecking ? 'Now...' : `${countdown}s`}
              </span>
            </div>
            <div className="retry-bar">
              <div
                className="retry-fill"
                style={{ width: `${((30 - countdown) / 30) * 100}%` }}
              />
            </div>
          </div>

          <div className="error-actions">
            <button
              onClick={checkServer}
              className="btn-primary"
              disabled={isChecking}
            >
              {isChecking ? '🔄 Checking...' : '🔄 Check Now'}
            </button>
            <Link href="/" className="btn-secondary">
              Go to Homepage
            </Link>
          </div>

          <div className="helpful-links">
            <h3>While you wait:</h3>
            <div className="links-grid">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.location.reload(); }}
                className="helpful-link"
              >
                <span className="link-icon">🔄</span>
                <span className="link-text">Reload Page</span>
              </a>
              <Link href="/products" className="helpful-link">
                <span className="link-icon">🛍️</span>
                <span className="link-text">Browse Products</span>
              </Link>
              <Link href="/contact" className="helpful-link">
                <span className="link-icon">📧</span>
                <span className="link-text">Contact Support</span>
              </Link>
              <Link href="/cart" className="helpful-link">
                <span className="link-icon">🛒</span>
                <span className="link-text">View Cart</span>
              </Link>
            </div>
          </div>

          <div className="error-code-info">
            <p className="tech-info">Error Code: 500 | Server Error</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .server-status-visual {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .server-icon-wrapper {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s;
        }

        .server-icon-wrapper.down {
          background: #fee2e2;
          color: #dc2626;
          animation: shake 0.5s ease-in-out infinite alternate;
        }

        .server-icon-wrapper.checking {
          background: #fef3c7;
          color: #d97706;
          animation: pulse-check 1.5s ease-in-out infinite;
        }

        .server-icon-wrapper.up {
          background: #d1fae5;
          color: #059669;
        }

        @keyframes shake {
          0% { transform: translateX(-2px); }
          100% { transform: translateX(2px); }
        }

        @keyframes pulse-check {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        .status-indicator {
          position: absolute;
          bottom: 8px;
          right: calc(50% - 52px);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .status-indicator.red {
          background: #ef4444;
          animation: blink 1s infinite;
        }

        .status-indicator.yellow {
          background: #f59e0b;
          animation: blink 0.5s infinite;
        }

        .status-indicator.green {
          background: #10b981;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .status-card {
          max-width: 400px;
          margin: 1.5rem auto;
          padding: 1.25rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .status-row + .status-row {
          border-top: 1px solid #f3f4f6;
        }

        .status-label {
          font-size: 14px;
          color: #6b7280;
        }

        .status-value {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .badge-red { background: #fee2e2; color: #dc2626; }
        .badge-yellow { background: #fef3c7; color: #d97706; }
        .badge-green { background: #d1fae5; color: #059669; }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .badge-dot.red { background: #ef4444; animation: blink 1s infinite; }
        .badge-dot.yellow { background: #f59e0b; animation: blink 0.5s infinite; }
        .badge-dot.green { background: #10b981; }

        .retry-bar {
          margin-top: 12px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .retry-fill {
          height: 100%;
          background: #ff6b35;
          border-radius: 2px;
          transition: width 1s linear;
        }
      `}</style>
    </>
  );
};

export default ServerErrorPage;
