import api from './api';

const commissionService = {
  // ─── Distributor Endpoints ───

  getCommissionPlans: async () => {
    const response = await api.get('/commission/plans');
    return response.data;
  },

  selectCommissionPlan: async (planId: string) => {
    const response = await api.post('/commission/select-plan', { planId });
    return response.data;
  },

  getMyWallet: async () => {
    const response = await api.get('/commission/wallet');
    return response.data;
  },

  getMyTransactions: async (params?: { page?: number; limit?: number; type?: string }) => {
    const response = await api.get('/commission/transactions', { params });
    return response.data;
  },

  initiatePayment: async (amount: number) => {
    const response = await api.post('/commission/payment/initiate', { amount });
    return response.data;
  },

  checkPaymentStatus: async (merchantOrderId: string) => {
    const response = await api.get(`/commission/payment/status/${merchantOrderId}`);
    return response.data;
  },

  getCommissionDashboard: async () => {
    const response = await api.get('/commission/dashboard');
    return response.data;
  },

  // ─── Admin Endpoints ───

  adminGetPlans: async () => {
    const response = await api.get('/admin/commission/plans');
    return response.data;
  },

  adminCreatePlan: async (data: {
    name: string;
    description?: string;
    type: 'percentage' | 'fixed';
    value: number;
    walletLimit: number;
    minPaymentAmount: number;
    gracePeriodDays?: number;
    earlyPaymentAllowed?: boolean;
  }) => {
    const response = await api.post('/admin/commission/plans', data);
    return response.data;
  },

  adminUpdatePlan: async (id: string, data: Record<string, any>) => {
    const response = await api.put(`/admin/commission/plans/${id}`, data);
    return response.data;
  },

  adminTogglePlan: async (id: string) => {
    const response = await api.patch(`/admin/commission/plans/${id}/toggle`);
    return response.data;
  },

  adminGetWallets: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/commission/wallets', { params });
    return response.data;
  },

  adminGetWalletDetails: async (distributorId: string) => {
    const response = await api.get(`/admin/commission/wallets/${distributorId}`);
    return response.data;
  },

  adminAdjustWallet: async (distributorId: string, data: { amount: number; reason: string }) => {
    const response = await api.post(`/admin/commission/wallets/${distributorId}/adjust`, data);
    return response.data;
  },

  adminForceUnlock: async (distributorId: string) => {
    const response = await api.post(`/admin/commission/wallets/${distributorId}/unlock`);
    return response.data;
  },

  adminGetTransactions: async (params?: { type?: string; distributorId?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/commission/transactions', { params });
    return response.data;
  },

  adminGetDashboard: async () => {
    const response = await api.get('/admin/commission/dashboard');
    return response.data;
  }
};

export default commissionService;
