import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Page Not Found | BuildAdda</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>

      <div className="error-page">
        <div className="error-container">
          <div className="error-illustration">
            <div className="error-code">404</div>
            <div className="error-icon">🏗️</div>
          </div>

          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">
            Oops! The page you're looking for seems to have been moved or doesn't exist.
          </p>

          <div className="error-actions">
            <button onClick={() => router.back()} className="btn-secondary">
              Go Back
            </button>
            <Link href="/" className="btn-primary">
              Go to Homepage
            </Link>
          </div>

          <div className="helpful-links">
            <h3>You might be interested in:</h3>
            <div className="links-grid">
              <Link href="/products" className="helpful-link">
                <span className="link-icon">🛍️</span>
                <span className="link-text">Browse Products</span>
              </Link>
              <Link href="/cart" className="helpful-link">
                <span className="link-icon">🛒</span>
                <span className="link-text">View Cart</span>
              </Link>
              <Link href="/profile" className="helpful-link">
                <span className="link-icon">👤</span>
                <span className="link-text">My Account</span>
              </Link>
              <Link href="/contact" className="helpful-link">
                <span className="link-icon">📧</span>
                <span className="link-text">Contact Support</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
