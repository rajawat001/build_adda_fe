import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { login } from '../services/auth.service';
import { sendLoginOTP, verifyLoginOTP } from '../services/email-auth.service';
import OTPInput from '../components/common/OTPInput';
import Header from '../components/Header';
import Footer from '../components/Footer';

type AuthMode = 'password' | 'otp';
type OTPStep = 'email' | 'verify';

export default function Login() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [otpStep, setOtpStep] = useState<OTPStep>('email');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otpEmail, setOtpEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [otpError, setOtpError] = useState('');

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
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [name]: undefined });
    }
  };

  const handleLoginSuccess = (user: any, needsSubscription?: boolean) => {
    localStorage.setItem('user', JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved
    }));
    localStorage.setItem('role', user.role);
    window.dispatchEvent(new Event('userLogin'));

    if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (user.role === 'distributor') {
      // Redirect to subscription page if account not approved (needs to complete payment)
      if (needsSubscription || user.isApproved === false) {
        router.push('/distributor/subscription');
      } else {
        router.push('/distributor/dashboard');
      }
    } else {
      router.push('/');
    }
  };

  // Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.user) {
        handleLoginSuccess(response.user, response.needsSubscription);
      }
    } catch (err: any) {
      if (err.response?.data?.validationErrors) {
        const backendErrors: { email?: string; password?: string } = {};
        err.response.data.validationErrors.forEach((error: any) => {
          if (error.field === 'email' || error.field === 'password') {
            backendErrors[error.field] = error.message;
          }
        });
        setValidationErrors(backendErrors);
        setError('Please fix the validation errors below');
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP Login - Send
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailError = validateEmail(otpEmail);
    if (emailError) {
      setError(emailError);
      return;
    }
    setLoading(true);

    try {
      await sendLoginOTP(otpEmail);
      setOtpStep('verify');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Login - Verify
  const handleVerifyOTP = async (otp: string) => {
    setOtpError('');
    setLoading(true);

    try {
      const response = await verifyLoginOTP(otpEmail, otp);
      if (response.user) {
        handleLoginSuccess(response.user, response.needsSubscription);
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendLoginOTP(otpEmail);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <>
      <SEO title="Login" />
      <Header />

      <div className="login-page">
        <div className="login-container">
          <h1>Login to BuildAdda</h1>

          {/* Auth Mode Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${authMode === 'password' ? 'active' : ''}`}
              onClick={() => { setAuthMode('password'); setError(''); setOtpStep('email'); }}
            >
              Password
            </button>
            <button
              className={`auth-tab ${authMode === 'otp' ? 'active' : ''}`}
              onClick={() => { setAuthMode('otp'); setError(''); setValidationErrors({}); }}
            >
              Email OTP
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'password' ? (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handlePasswordSubmit} noValidate>
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

                  <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <Link href="/forgot-password" style={{ fontSize: '13px', color: '#FF6B35' }}>
                      Forgot Password?
                    </Link>
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {otpStep === 'email' ? (
                  <>
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSendOTP} noValidate>
                      <div className="form-group">
                        <label htmlFor="otpEmail">Email Address</label>
                        <input
                          id="otpEmail"
                          type="email"
                          value={otpEmail}
                          onChange={(e) => { setOtpEmail(e.target.value); setError(''); }}
                          placeholder="Enter your registered email"
                          autoComplete="email"
                          required
                        />
                      </div>

                      <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-back"
                      onClick={() => { setOtpStep('email'); setOtpError(''); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                      Change Email
                    </button>

                    <OTPInput
                      onComplete={handleVerifyOTP}
                      onResend={handleResendOTP}
                      error={otpError}
                      loading={loading}
                      email={otpEmail}
                      purpose="login"
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="login-footer">
            Don't have an account? <Link href="/register">Register here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
