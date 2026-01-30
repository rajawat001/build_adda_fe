import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend: () => void;
  error?: string;
  loading?: boolean;
  email?: string;
  purpose?: string;
  resendCooldown?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onResend,
  error = '',
  loading = false,
  email = '',
  purpose = 'verification',
  resendCooldown = 60
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [timer, setTimer] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Shake on error
  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }, [error]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const otpString = newOtp.join('');
    if (otpString.length === length && !newOtp.includes('')) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp, length]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData.replace(/\D/g, '').slice(0, length);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < length; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);

      // Focus the next empty input or last
      const nextEmpty = newOtp.findIndex(v => !v);
      const focusIndex = nextEmpty === -1 ? length - 1 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();

      // Check if complete
      if (digits.length === length) {
        onComplete(digits);
      }
    }
  }, [otp, length, onComplete]);

  const handleResend = () => {
    setTimer(resendCooldown);
    setCanResend(false);
    setOtp(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
    onResend();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const purposeLabels: Record<string, string> = {
    'login': 'sign in',
    'register': 'verify your email',
    'reset-password': 'reset your password',
    'verification': 'verify'
  };

  return (
    <div className="otp-container">
      <div className="otp-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="url(#grad)" />
          <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14ZM25 29H23V27H25V29ZM25 25H23V19H25V25Z" fill="white"/>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#FF6B35"/>
              <stop offset="100%" stopColor="#FFC107"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h3 className="otp-title">Enter Verification Code</h3>

      {email && (
        <p className="otp-subtitle">
          We've sent a 6-digit code to <strong>{email}</strong> to {purposeLabels[purpose] || 'verify'}.
        </p>
      )}

      <motion.div
        className="otp-inputs"
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`otp-digit ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </motion.div>

      {error && (
        <motion.p
          className="otp-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      {loading && (
        <div className="otp-loading">
          <div className="otp-spinner"></div>
          <span>Verifying...</span>
        </div>
      )}

      <div className="otp-resend">
        {canResend ? (
          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={loading}
          >
            Resend Code
          </button>
        ) : (
          <p className="otp-timer">
            Resend code in <span className="timer-count">{formatTime(timer)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default OTPInput;
