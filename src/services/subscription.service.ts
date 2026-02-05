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

  // Create payment order (one-time payment)
  createOrder: async (planId: string, couponCode?: string) => {
    const response = await api.post('/subscriptions/create-order', { planId, couponCode });
    return response.data;
  },

  // Create payment order with autopay (recurring payment mandate)
  createOrderWithAutopay: async (planId: string, couponCode?: string) => {
    const response = await api.post('/subscriptions/create-order-autopay', { planId, couponCode });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData: any) => {
    const response = await api.post('/subscriptions/verify-payment', paymentData);
    return response.data;
  },

  // Verify autopay mandate
  verifyAutopay: async (merchantSubscriptionId: string, subscriptionId: string) => {
    const response = await api.post('/subscriptions/verify-autopay', {
      merchantSubscriptionId,
      subscriptionId
    });
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
  },

  // Toggle auto-renewal
  toggleAutoRenew: async (subscriptionId: string, enableAutoRenew: boolean) => {
    const response = await api.post('/subscriptions/toggle-auto-renew', {
      subscriptionId,
      enableAutoRenew
    });
    return response.data;
  },

  // Revoke autopay mandate
  revokeAutopay: async (subscriptionId: string) => {
    const response = await api.post('/subscriptions/revoke-autopay', { subscriptionId });
    return response.data;
  }
};

export default subscriptionService;
