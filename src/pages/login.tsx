import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import SEO from '../components/SEO';
import { login, googleAuth } from '../services/auth.service';
import { sendLoginOTP, verifyLoginOTP } from '../services/email-auth.service';
import OTPInput from '../components/common/OTPInput';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthIllustration from '../components/AuthIllustration';
import SuccessTruck from '../components/SuccessTruck';
import { getApiErrorMessage, scrollToError } from '../utils/api-error';

type AuthMode = 'password' | 'otp';
type OTPStep = 'email' | 'verify';

// Animation variants
const panelVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 22, stiffness: 100, staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20, stiffness: 120 } },
};

const tabContentVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 50, rotateY: dir * 6 }),
  center: { opacity: 1, x: 0, rotateY: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -50, rotateY: dir * -6 }),
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [tabDirection, setTabDirection] = useState(1);

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
      isApproved: user.isApproved,
      permissions: user.permissions
    }));
    localStorage.setItem('role', user.role);
    window.dispatchEvent(new Event('userLogin'));

    setLoginSuccess(true);

    setTimeout(() => {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'distributor') {
        if (needsSubscription || user.isApproved === false) {
          router.push('/distributor/subscription');
        } else {
          router.push('/distributor/dashboard');
        }
      } else {
        router.push('/');
      }
    }, 2000);
  };

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
        scrollToError();
      } else {
        const msg = getApiErrorMessage(err, 'Login failed. Please try again.');
        setError(msg);
        scrollToError();
      }
    } finally {
      setLoading(false);
    }
  };

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
      setError(getApiErrorMessage(err, 'Failed to send OTP. Please try again.'));
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setOtpError('');
    setLoading(true);

    try {
      const response = await verifyLoginOTP(otpEmail, otp);
      if (response.user) {
        handleLoginSuccess(response.user, response.needsSubscription);
      }
    } catch (err: any) {
      setOtpError(getApiErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await googleAuth(credentialResponse.credential);
      if (response.user) {
        handleLoginSuccess(response.user, response.needsSubscription);
      }
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Google sign-in failed. Please try again.');
      setError(msg);
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendLoginOTP(otpEmail);
    } catch (err: any) {
      setOtpError(getApiErrorMessage(err, 'Failed to resend OTP.'));
    }
  };

  return (
    <>
      <SEO
        title="Login"
        description="Login to BuildAdda - India's Premier Building Materials Marketplace. Access your account to order cement, steel, bricks and more."
        canonicalUrl="https://www.buildadda.in/login"
      />
      <Header />

      <div className="auth-layout">
        <AuthIllustration
          theme="user"
          scene="login"
          title="Welcome back"
          subtitle="Access your building materials marketplace"
        />

        <motion.div
          className="auth-form-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          style={{ perspective: 1200 }}
        >
          <motion.div className="login-logo" variants={itemVariants}>
            <img src="/buildAddaBrandImage.png" alt="BuildAdda" />
          </motion.div>

          <motion.h1 variants={itemVariants}>Sign in</motion.h1>
          <motion.p className="auth-form-subtitle" variants={itemVariants}>
            Welcome to BuildAdda logistics platform
          </motion.p>

          {/* Google Sign-In */}
          {!loginSuccess && (
            <motion.div variants={itemVariants} style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  width={320}
                />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                margin: '16px 0 8px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-primary, #e5e7eb)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-primary, #e5e7eb)' }} />
              </div>
            </motion.div>
          )}

          {loginSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            >
              <div className="auth-success">
                <div className="auth-success-icon">{'\u2713'}</div>
                <h2>Login successful!</h2>
                <p>Redirecting you now...</p>
              </div>
              <SuccessTruck color="#2c3e50" />
            </motion.div>
          ) : (
            <>
              {/* Auth Mode Tabs */}
              <motion.div className="auth-tabs" variants={itemVariants}>
                <button
                  className={`auth-tab ${authMode === 'password' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('password'); setTabDirection(-1); setError(''); setOtpStep('email'); }}
                >
                  Password
                </button>
                <button
                  className={`auth-tab ${authMode === 'otp' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('otp'); setTabDirection(1); setError(''); setValidationErrors({}); }}
                >
                  Email OTP
                </button>
              </motion.div>

              <AnimatePresence mode="wait" custom={tabDirection}>
                {authMode === 'password' ? (
                  <motion.div
                    key="password"
                    custom={tabDirection}
                    variants={tabContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ perspective: 1200 }}
                  >
                    {error && (
                      <motion.div
                        className="error-message"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handlePasswordSubmit} noValidate>
                      <motion.div
                        className="form-group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <label htmlFor="email">E-mail</label>
                        <div className="input-with-icon">
                          <span className="input-icon-left"><FiMail /></span>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={validationErrors.email ? 'input-error' : ''}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                          />
                        </div>
                        {validationErrors.email && (
                          <span className="validation-error">{validationErrors.email}</span>
                        )}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                          <span className="input-icon-left"><FiLock /></span>
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${validationErrors.password ? 'input-error' : ''} ${showPassword ? 'password-input' : ''}`}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {validationErrors.password && (
                          <span className="validation-error">{validationErrors.password}</span>
                        )}
                      </motion.div>

                      <motion.div
                        style={{ textAlign: 'right', marginBottom: '14px' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <Link href="/forgot-password" style={{ fontSize: '12px', color: '#FF6B35', fontWeight: 600 }}>
                          Forgot Password?
                        </Link>
                      </motion.div>

                      <motion.button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.01 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {loading ? <><span className="btn-spinner" />Signing in...</> : 'Sign in'}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    custom={tabDirection}
                    variants={tabContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ perspective: 1200 }}
                  >
                    {otpStep === 'email' ? (
                      <>
                        {error && (
                          <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {error}
                          </motion.div>
                        )}

                        <form onSubmit={handleSendOTP} noValidate>
                          <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                          >
                            <label htmlFor="otpEmail">E-mail</label>
                            <div className="input-with-icon">
                              <span className="input-icon-left"><FiMail /></span>
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
                          </motion.div>

                          <motion.button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.01 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {loading ? <><span className="btn-spinner" />Sending OTP...</> : 'Send OTP'}
                          </motion.button>
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

              <motion.p className="login-footer" variants={itemVariants}>
                Don't have an account? <Link href="/register">Sign up</Link>
              </motion.p>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
