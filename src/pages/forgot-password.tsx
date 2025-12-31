import { useState } from 'react';
import Link from 'next/link';
import SEO from '../components/SEO';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });

      setMessage(response.data.message || 'Password reset link sent to your email');
      setEmailSent(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error sending reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Forgot Password"
        description="Reset your BuildAdda account password"
      />

      <div className="login-page">
        <div className="login-container">
          <h1>Forgot Password</h1>
          <p className="subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>

          {emailSent ? (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2>Check Your Email</h2>
              <p>{message}</p>
              <p className="info-text">
                If you don't see the email, please check your spam folder.
              </p>
              <Link href="/login" className="btn-submit">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="login-footer">
            Remember your password? <Link href="/login">Login here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
