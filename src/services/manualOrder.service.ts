import api from './api';

// ─── Offline Customers ───

export const searchCustomers = async (query: string) => {
  const response = await api.get('/distributor/customers/search', { params: { q: query } });
  return response.data;
};

export const createCustomer = async (data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  const response = await api.post('/distributor/customers', data);
  return response.data;
};

export const getMyCustomers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get('/distributor/customers', { params });
  return response.data;
};

export const getCustomerById = async (customerId: string) => {
  const response = await api.get(`/distributor/customers/${customerId}`);
  return response.data;
};

export const updateCustomer = async (customerId: string, data: Record<string, any>) => {
  const response = await api.put(`/distributor/customers/${customerId}`, data);
  return response.data;
};

// ─── Manual Orders ───

export const createManualOrder = async (data: {
  offlineCustomerId: string;
  items: Array<{ product: string; quantity: number; price?: number }>;
  shippingAddress?: Record<string, string>;
  paymentMethod?: string;
  deliveryCharge?: number;
  notes?: string;
}) => {
  const response = await api.post('/distributor/manual-orders', data);
  return response.data;
};

export const getManualOrders = async (params?: { page?: number; limit?: number; orderStatus?: string; search?: string }) => {
  const response = await api.get('/distributor/manual-orders', { params });
  return response.data;
};

export const getManualOrderById = async (orderId: string) => {
  const response = await api.get(`/distributor/manual-orders/${orderId}`);
  return response.data;
};

export const getManualOrderStats = async () => {
  const response = await api.get('/distributor/manual-orders/stats');
  return response.data;
};

const manualOrderService = {
  searchCustomers,
  createCustomer,
  getMyCustomers,
  getCustomerById,
  updateCustomer,
  createManualOrder,
  getManualOrders,
  getManualOrderById,
  getManualOrderStats,
};

export default manualOrderService;
