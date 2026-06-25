import apiClient from '../api/apiClient';

const companyService = {
  getDashboard: async () => {
    const response = await apiClient.get('dashboard/company');
    return response.data;
  },

  getSalesDashboard: async () => {
    const response = await apiClient.get('dashboard/sales');
    return response.data;
  },

  getTenants: async () => {
    const response = await apiClient.get('dashboard/super-admin');
    return response.data;
  },

  createTenant: async (tenantData) => {
    const response = await apiClient.post('tenants', tenantData);
    return response.data;
  },

  signupTrial: async (trialData) => {
    const response = await apiClient.post('company/trial', trialData);
    return response.data;
  },

  pauseSubscription: async (id) => {
    const response = await apiClient.put(`subscriptions/${id}/pause`);
    return response.data;
  },

  resumeSubscription: async (id) => {
    const response = await apiClient.put(`subscriptions/${id}/resume`);
    return response.data;
  },

  renewSubscription: async (id) => {
    const response = await apiClient.put(`subscriptions/${id}/renew`);
    return response.data;
  },

  cancelSubscription: async (id) => {
    const response = await apiClient.put(`subscriptions/${id}/cancel`);
    return response.data;
  },

  generateInvoice: async (id, invoiceData) => {
    const response = await apiClient.post(`subscriptions/${id}/invoices`, invoiceData);
    return response.data;
  },

  assignPlan: async (id, plan) => {
    const response = await apiClient.put(`subscriptions/${id}/assign-plan`, { plan });
    return response.data;
  },

  sendReminder: async (id) => {
    const response = await apiClient.post(`subscriptions/${id}/reminder`);
    return response.data;
  },

  updateSubscriptionSettings: async (id, settings) => {
    const response = await apiClient.put(`subscriptions/${id}/settings`, settings);
    return response.data;
  },

  getSupportTickets: async () => {
    const response = await apiClient.get('support/tickets');
    return response.data;
  },

  replySupportTicket: async (id, msg) => {
    const response = await apiClient.post(`support/tickets/${id}/reply`, { msg });
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await apiClient.get('audit/logs');
    return response.data;
  },

  createAuditLog: async (logData) => {
    const response = await apiClient.post('audit/logs', logData);
    return response.data;
  },

  createTenantUser: async (userData) => {
    const response = await apiClient.post('users', userData);
    return response.data;
  }
};

export default companyService;
