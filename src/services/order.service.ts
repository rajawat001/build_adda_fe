import api from './api';

export const createOrder = async (data: any) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export const cancelOrder = async (id: string) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};

export const initiatePhonepePayment = async (orderId: string) => {
  const response = await api.post('/orders/phonepe/initiate', { orderId });
  return response.data;
};

export const checkPaymentStatus = async (merchantTransactionId: string, orderId: string) => {
  const response = await api.post('/orders/phonepe/status', { merchantTransactionId, orderId });
  return response.data;
};

export const confirmCOD = async (orderId: string) => {
  const response = await api.post('/orders/cod/confirm', { orderId });
  return response.data;
};

export const applyCoupon = async (couponCode: string, totalAmount: number) => {
  const response = await api.post('/orders/apply-coupon', { couponCode, totalAmount });
  return response.data;
};

// Export as default object for compatibility
const orderService = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  initiatePhonepePayment,
  checkPaymentStatus,
  confirmCOD,
  applyCoupon
};

export default orderService;