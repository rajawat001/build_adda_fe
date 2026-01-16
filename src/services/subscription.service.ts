import api from './api';

const subscriptionService = {
  // Get all subscription plans
  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  // Get current subscription
  getMySubscription: async () => {
    const response = await api.get('/subscriptions/my-subscription');
    return response.data;
  },

  // Apply coupon code
  applyCoupon: async (code: string, planId: string) => {
    const response = await api.post('/subscriptions/apply-coupon', { code, planId });
    return response.data;
  },

  // Create Razorpay order
  createOrder: async (planId: string, couponCode?: string) => {
    const response = await api.post('/subscriptions/create-order', { planId, couponCode });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData: any) => {
    const response = await api.post('/subscriptions/verify-payment', paymentData);
    return response.data;
  },

  // Get subscription history
  getHistory: async () => {
    const response = await api.get('/subscriptions/history');
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, reason: string) => {
    const response = await api.post('/subscriptions/cancel', { subscriptionId, reason });
    return response.data;
  }
};

export default subscriptionService;
