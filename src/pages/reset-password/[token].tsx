import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../../components/SEO';
import api from '../../services/api';

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

    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
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

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error resetting password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SEO title="Password Reset Successful" />
        <div className="login-page">
          <div className="login-container">
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2>Password Reset Successful!</h2>
              <p>Your password has been successfully reset.</p>
              <p className="info-text">You will be redirected to login page...</p>
              <Link href="/login" className="btn-submit">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Reset Password" />

      <div className="login-page">
        <div className="login-container">
          <h1>Reset Your Password</h1>
          <p className="subtitle">Enter your new password below</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={validationErrors.password ? 'input-error' : ''}
                autoComplete="new-password"
                required
              />
              {validationErrors.password && (
                <span className="validation-error">{validationErrors.password}</span>
              )}
              <small className="field-hint">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={validationErrors.confirmPassword ? 'input-error' : ''}
                autoComplete="new-password"
                required
              />
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
        </div>
      </div>
    </>
  );
}
