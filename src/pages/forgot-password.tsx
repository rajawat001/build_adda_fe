import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { sendResetOTP, verifyResetOTP, resetPasswordWithOTP } from '../services/email-auth.service';
import OTPInput from '../components/common/OTPInput';

type ResetStep = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string): { level: number; label: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak' };
    if (score <= 2) return { level: 2, label: 'Fair' };
    if (score <= 3) return { level: 3, label: 'Good' };
    return { level: 4, label: 'Strong' };
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendResetOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (otp: string) => {
    setOtpError('');
    setLoading(true);

    try {
      await verifyResetOTP(email, otp);
      setStep('password');
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendResetOTP(email);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword) {
      setPasswordError('Password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, number, and special character');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOTP(email, newPassword);
      setStep('success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  const getStepStatus = (s: number) => {
    const stepMap: Record<ResetStep, number> = { email: 1, otp: 2, password: 3, success: 4 };
    const current = stepMap[step];
    if (s < current) return 'completed';
    if (s === current) return 'active';
    return '';
  };

  return (
    <>
      <SEO
        title="Forgot Password"
        description="Reset your BuildAdda account password"
      />

      <div className="login-page">
        <div className="login-container">
          <h1>Reset Password</h1>

          {/* Step Progress */}
          <div className="step-progress">
            <div className="step-item">
              <div className={`step-circle ${getStepStatus(1)}`}>
                {getStepStatus(1) === 'completed' ? '\u2713' : '1'}
              </div>
              <span className={`step-label ${getStepStatus(1)}`}>Email</span>
            </div>
            <div className={`step-connector ${getStepStatus(1) === 'completed' ? 'completed' : ''}`} />
            <div className="step-item">
              <div className={`step-circle ${getStepStatus(2)}`}>
                {getStepStatus(2) === 'completed' ? '\u2713' : '2'}
              </div>
              <span className={`step-label ${getStepStatus(2)}`}>Verify</span>
            </div>
            <div className={`step-connector ${getStepStatus(2) === 'completed' ? 'completed' : ''}`} />
            <div className="step-item">
              <div className={`step-circle ${getStepStatus(3)}`}>
                {getStepStatus(3) === 'completed' ? '\u2713' : '3'}
              </div>
              <span className={`step-label ${getStepStatus(3)}`}>Reset</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Enter Email */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <p className="subtitle" style={{ textAlign: 'center', color: '#6c757d', marginBottom: '24px', fontSize: '14px' }}>
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSendOTP} noValidate>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Verify OTP */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  className="btn-back"
                  onClick={() => { setStep('email'); setOtpError(''); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Change Email
                </button>

                <OTPInput
                  onComplete={handleVerifyOTP}
                  onResend={handleResendOTP}
                  error={otpError}
                  loading={loading}
                  email={email}
                  purpose="reset-password"
                />
              </motion.div>
            )}

            {/* Step 3: Set New Password */}
            {step === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="otp-email-display" style={{ marginBottom: '24px' }}>
                  <span className="email-icon">&#9989;</span>
                  <span className="email-text">Email verified: {email}</span>
                </div>

                {passwordError && <div className="error-message">{passwordError}</div>}

                <form onSubmit={handleResetPassword} noValidate>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      required
                    />
                    {newPassword && (
                      <>
                        <div className="password-strength">
                          {[1, 2, 3, 4].map(i => (
                            <div
                              key={i}
                              className={`strength-bar ${
                                i <= strength.level
                                  ? strength.level <= 1 ? 'weak' : strength.level <= 2 ? 'medium' : 'strong'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`strength-label ${
                          strength.level <= 1 ? 'weak' : strength.level <= 2 ? 'medium' : 'strong'
                        }`}>
                          {strength.label}
                        </span>
                      </>
                    )}
                    <small className="field-hint">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <span className="validation-error">Passwords do not match</span>
                    )}
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading || newPassword !== confirmPassword}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-success">
                  <div className="auth-success-icon">{'\u2713'}</div>
                  <h2>Password Reset Successful!</h2>
                  <p>Your password has been updated. Redirecting to login...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== 'success' && (
            <p className="login-footer">
              Remember your password? <Link href="/login">Login here</Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
