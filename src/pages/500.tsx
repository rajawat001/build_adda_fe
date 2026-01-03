import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ServerErrorPage: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>500 - Server Error | BuildAdda</title>
        <meta name="description" content="Something went wrong on our end." />
      </Head>

      <div className="error-page">
        <div className="error-container">
          <div className="error-illustration">
            <div className="error-code">500</div>
            <div className="error-icon">⚠️</div>
          </div>

          <h1 className="error-title">Internal Server Error</h1>
          <p className="error-message">
            Oops! Something went wrong on our end. We're working to fix it as quickly as possible.
          </p>

          <div className="error-details">
            <p>If this problem persists, please contact our support team.</p>
          </div>

          <div className="error-actions">
            <button onClick={() => router.reload()} className="btn-secondary">
              Refresh Page
            </button>
            <Link href="/" className="btn-primary">
              Go to Homepage
            </Link>
          </div>

          <div className="helpful-links">
            <h3>What you can do:</h3>
            <div className="suggestions-list">
              <div className="suggestion-item">
                <span className="suggestion-icon">🔄</span>
                <div className="suggestion-content">
                  <strong>Try Again</strong>
                  <p>Refresh the page or try your action again in a few moments</p>
                </div>
              </div>
              <div className="suggestion-item">
                <span className="suggestion-icon">📞</span>
                <div className="suggestion-content">
                  <strong>Contact Support</strong>
                  <p>If the issue persists, reach out to our support team at <a href="mailto:support@buildmat.com">support@buildmat.com</a></p>
                </div>
              </div>
              <div className="suggestion-item">
                <span className="suggestion-icon">🏠</span>
                <div className="suggestion-content">
                  <strong>Return Home</strong>
                  <p>Go back to our homepage and explore our products</p>
                </div>
              </div>
            </div>
          </div>

          <div className="error-code-info">
            <p className="tech-info">Error Code: 500 | Internal Server Error</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerErrorPage;
