import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../components/SEO';
import { login } from '../services/auth.service';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData);

      // SECURITY FIX: Don't store JWT token - it's in httpOnly cookie
      // Only store non-sensitive user data for UI purposes
      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role
        }));
        localStorage.setItem('role', response.user.role);

        // Redirect based on role
        if (response.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (response.user.role === 'distributor') {
          router.push('/distributor/dashboard');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login" />

      <div className="login-page">
        <div className="login-container">
          <h1>Login to BuildAdda</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? 'input-error' : ''}
                autoComplete="email"
                required
              />
              {validationErrors.email && (
                <span className="validation-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={validationErrors.password ? 'input-error' : ''}
                autoComplete="current-password"
                required
              />
              {validationErrors.password && (
                <span className="validation-error">{validationErrors.password}</span>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <Link href="/register">Register here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
