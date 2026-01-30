import api from './api';

interface OTPResponse {
  success: boolean;
  message: string;
}

interface LoginOTPResponse {
  success: boolean;
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    emailVerified: boolean;
  };
}

interface RegisterOTPData {
  email: string;
  otp: string;
  name: string;
  password: string;
  phone: string;
  role?: string;
  businessName?: string;
  pincode?: string;
  address?: string;
  city?: string;
  state?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
}

export const sendLoginOTP = async (email: string): Promise<OTPResponse> => {
  const response = await api.post('/auth/otp/send-login', { email });
  return response.data;
};

export const verifyLoginOTP = async (email: string, otp: string): Promise<LoginOTPResponse> => {
  const response = await api.post('/auth/otp/verify-login', { email, otp });
  return response.data;
};

export const sendRegisterOTP = async (email: string): Promise<OTPResponse> => {
  const response = await api.post('/auth/otp/send-register', { email });
  return response.data;
};

export const verifyRegisterOTP = async (data: RegisterOTPData): Promise<LoginOTPResponse> => {
  const response = await api.post('/auth/otp/verify-register', data);
  return response.data;
};

export const sendResetOTP = async (email: string): Promise<OTPResponse> => {
  const response = await api.post('/auth/otp/send-reset', { email });
  return response.data;
};

export const verifyResetOTP = async (email: string, otp: string): Promise<OTPResponse> => {
  const response = await api.post('/auth/otp/verify-reset', { email, otp });
  return response.data;
};

export const resetPasswordWithOTP = async (email: string, newPassword: string): Promise<OTPResponse> => {
  const response = await api.post('/auth/otp/reset-password', { email, newPassword });
  return response.data;
};

export const resendOTP = async (email: string, purpose: 'login' | 'register' | 'reset-password'): Promise<OTPResponse> => {
  const response = await api.post('/auth/otp/resend', { email, purpose });
  return response.data;
};

const emailAuthService = {
  sendLoginOTP,
  verifyLoginOTP,
  sendRegisterOTP,
  verifyRegisterOTP,
  sendResetOTP,
  verifyResetOTP,
  resetPasswordWithOTP,
  resendOTP
};

export default emailAuthService;
