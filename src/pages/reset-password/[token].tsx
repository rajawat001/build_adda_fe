import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import SEO from '../../components/SEO';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getApiErrorMessage, scrollToError } from '../../utils/api-error';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[@$!%*?&]/.test(password))
      return 'Password must contain at least one special character (@$!%*?&)';
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = {
      password: '',
      confirmPassword: ''
    };

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    if (errors.password || errors.confirmPassword) {
      return;
    }

    try {
      setLoading(true);
      await api.post(`/auth/reset-password/${token}`, {
        password: formData.password
      });

      setSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(getApiErrorMessage(err, 'Error resetting password. The link may have expired.'));
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SEO title="Password Reset Successful" />
        <Header />
        <div className="login-page">
          <motion.div
            className="login-container"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="auth-success">
              <div className="auth-success-icon">{'\u2713'}</div>
              <h2>Password reset successful!</h2>
              <p>Your password has been updated. Redirecting to login...</p>
              <Link href="/login" className="btn-submit" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', marginTop: '12px' }}>
                Go to Login
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="Reset Password" />
      <Header />

      <div className="login-page">
        <motion.div
          className="login-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="login-logo">
            <img src="/buildAddaBrandImage.png" alt="BuildAdda" />
          </div>

          <h1>Set new password</h1>
          <p style={{ textAlign: 'center', color: '#6d7175', marginBottom: '20px', fontSize: '13px' }}>
            Enter your new password below
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="password">New password</label>
              <div className="input-with-icon">
                <span className="input-icon-left"><FiLock /></span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={validationErrors.password ? 'input-error' : ''}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                />
              </div>
              {validationErrors.password && (
                <span className="validation-error">{validationErrors.password}</span>
              )}
              <small className="field-hint">
                8+ characters with uppercase, lowercase, number & special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="input-with-icon">
                <span className="input-icon-left"><FiLock /></span>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={validationErrors.confirmPassword ? 'input-error' : ''}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                />
              </div>
              {validationErrors.confirmPassword && (
                <span className="validation-error">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="login-footer">
            Remember your password? <Link href="/login">Login here</Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
