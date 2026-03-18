import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number | undefined;
}

const ErrorPage = ({ statusCode }: ErrorProps) => {
  const router = useRouter();

  const errorConfig: Record<number, { icon: string; title: string; message: string }> = {
    400: {
      icon: '🚫',
      title: 'Bad Request',
      message: 'The request could not be understood. Please check and try again.'
    },
    403: {
      icon: '🔒',
      title: 'Access Denied',
      message: 'You don\'t have permission to access this page.'
    },
    404: {
      icon: '🏗️',
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.'
    },
    408: {
      icon: '⏰',
      title: 'Request Timeout',
      message: 'The server took too long to respond. Please try again.'
    },
    500: {
      icon: '⚠️',
      title: 'Server Error',
      message: 'Something went wrong on our end. We\'re working to fix it.'
    },
    502: {
      icon: '🔌',
      title: 'Server Unavailable',
      message: 'Our server is temporarily unavailable. Please try again in a few minutes.'
    },
    503: {
      icon: '🛠️',
      title: 'Service Unavailable',
      message: 'We\'re currently performing maintenance. Please try again shortly.'
    },
    504: {
      icon: '⏳',
      title: 'Gateway Timeout',
      message: 'The server didn\'t respond in time. Please try again.'
    }
  };

  const code = statusCode || 500;
  const config = errorConfig[code] || {
    icon: '❓',
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.'
  };

  return (
    <>
      <Head>
        <title>{code} - {config.title} | BuildAdda</title>
      </Head>

      <div className="error-page">
        <div className="error-container">
          <div className="error-illustration">
            <div className="error-code">{code}</div>
            <div className="error-icon">{config.icon}</div>
          </div>

          <h1 className="error-title">{config.title}</h1>
          <p className="error-message">{config.message}</p>

          <div className="error-actions">
            <button onClick={() => router.back()} className="btn-secondary">
              Go Back
            </button>
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Try Again
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

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
