import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  pincode: string;
  role?: string;
  businessName?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
}

export interface User {
  _id: string;
  name?: string;
  businessName?: string;
  email: string;
  role: string;
  phone?: string;
  addresses?: any[];
  wishlist?: any[];
  cart?: any[];
  emailVerified?: boolean;
  profileImage?: string;
  createdAt?: string;
  // Distributor-specific fields
  pincode?: string;
  address?: string;
  location?: any;
  isApproved?: boolean;
  products?: any[];
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  // Note: token is in httpOnly cookie, not in response
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getProfile = async (): Promise<{success: boolean; user: User}> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: any): Promise<{success: boolean; user: User}> => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const addAddress = async (data: any): Promise<{success: boolean; address: any}> => {
  const response = await api.post('/auth/addresses', data);
  return response.data;
};

export const updateAddress = async (addressId: string, data: any): Promise<{success: boolean; address: any}> => {
  const response = await api.put(`/auth/addresses/${addressId}`, data);
  return response.data;
};

export const deleteAddress = async (addressId: string): Promise<{success: boolean}> => {
  const response = await api.delete(`/auth/addresses/${addressId}`);
  return response.data;
};

export const logout = async (): Promise<{success: boolean}> => {
  const response = await api.post('/auth/logout');
  // Clear client-side data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  logout
};

export default authService;
