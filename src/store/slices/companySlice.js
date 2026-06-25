import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companyService from '../../services/companyService';

export const fetchTenants = createAsyncThunk(
  'company/fetchTenants',
  async (_, { rejectWithValue }) => {
    try {
      const data = await companyService.getTenants();
      return data; // contains tenants array, and metrics: mrr, load, sla
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
    }
  }
);

export const fetchCompanyDashboard = createAsyncThunk(
  'company/fetchCompanyDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await companyService.getDashboard();
      return data; // contains fleet, branches count, staff count, etc.
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company dashboard');
    }
  }
);

export const provisionTenant = createAsyncThunk(
  'company/provisionTenant',
  async (tenantData, { rejectWithValue }) => {
    try {
      return await companyService.createTenant(tenantData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to provision tenant');
    }
  }
);

export const signupCompanyTrial = createAsyncThunk(
  'company/signupCompanyTrial',
  async (trialData, { rejectWithValue }) => {
    try {
      return await companyService.signupTrial(trialData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to signup trial');
    }
  }
);

export const fetchSalesDashboard = createAsyncThunk(
  'company/fetchSalesDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await companyService.getSalesDashboard();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales dashboard');
    }
  }
);

const initialState = {
  tenants: [],
  companyDashboard: null,
  mrr: '$42,910',
  platformLoad: '14.2%',
  slaTarget: '99.98%',
  // Sales Dashboard CRM Data
  leads: [],
  salesConversions: '14.8%',
  salesDemos: 12,
  salesActiveTrials: 8,
  tickets: [],
  auditLogs: [],
  loading: false,
  error: null,
};

export const fetchSupportTickets = createAsyncThunk(
  'company/fetchSupportTickets',
  async (_, { rejectWithValue }) => {
    try {
      return await companyService.getSupportTickets();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch support tickets');
    }
  }
);

export const replySupportTicket = createAsyncThunk(
  'company/replySupportTicket',
  async ({ id, msg }, { rejectWithValue }) => {
    try {
      return await companyService.replySupportTicket(id, msg);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reply to support ticket');
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'company/fetchAuditLogs',
  async (_, { rejectWithValue }) => {
    try {
      return await companyService.getAuditLogs();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

export const createAuditLog = createAsyncThunk(
  'company/createAuditLog',
  async (logData, { rejectWithValue }) => {
    try {
      return await companyService.createAuditLog(logData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create audit log');
    }
  }
);

export const createTenantUser = createAsyncThunk(
  'company/createTenantUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await companyService.createTenantUser(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to invite user');
    }
  }
);

export const pauseSubscription = createAsyncThunk(
  'company/pauseSubscription',
  async (id, { rejectWithValue }) => {
    try {
      return await companyService.pauseSubscription(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pause subscription');
    }
  }
);

export const resumeSubscription = createAsyncThunk(
  'company/resumeSubscription',
  async (id, { rejectWithValue }) => {
    try {
      return await companyService.resumeSubscription(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resume subscription');
    }
  }
);

export const renewSubscription = createAsyncThunk(
  'company/renewSubscription',
  async (id, { rejectWithValue }) => {
    try {
      return await companyService.renewSubscription(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to renew subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'company/cancelSubscription',
  async (id, { rejectWithValue }) => {
    try {
      return await companyService.cancelSubscription(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

export const assignPlan = createAsyncThunk(
  'company/assignPlan',
  async ({ id, plan }, { rejectWithValue }) => {
    try {
      return await companyService.assignPlan(id, plan);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign plan');
    }
  }
);

export const generateInvoice = createAsyncThunk(
  'company/generateInvoice',
  async ({ id, amount, period }, { rejectWithValue }) => {
    try {
      return await companyService.generateInvoice(id, { amount, period });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice');
    }
  }
);

export const sendReminder = createAsyncThunk(
  'company/sendReminder',
  async (id, { rejectWithValue }) => {
    try {
      return await companyService.sendReminder(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reminder');
    }
  }
);

export const updateSubscriptionSettings = createAsyncThunk(
  'company/updateSubscriptionSettings',
  async ({ id, settings }, { rejectWithValue }) => {
    try {
      return await companyService.updateSubscriptionSettings(id, settings);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    suspendCompanyRedux: (state, action) => {
      const tenant = state.tenants.find(t => t.id === action.payload);
      if (tenant) tenant.status = 'Hold';
    },
    reactivateCompanyRedux: (state, action) => {
      const tenant = state.tenants.find(t => t.id === action.payload);
      if (tenant) tenant.status = 'Active';
    },
    editCompanyRedux: (state, action) => {
      const { id, name, plan, email } = action.payload;
      const tenant = state.tenants.find(t => t.id === id);
      if (tenant) {
        tenant.name = name;
        tenant.plan = plan;
        tenant.manager = email;
      }
    },
    deleteCompanyRedux: (state, action) => {
      state.tenants = state.tenants.filter(t => t.id !== action.payload);
    },
    bulkUpdateRedux: (state, action) => {
      const { ids, status, plan } = action.payload;
      state.tenants.forEach(t => {
        if (ids.includes(t.id)) {
          if (status !== undefined) t.status = status;
          if (plan !== undefined) t.plan = plan;
        }
      });
    },
    bulkDeleteRedux: (state, action) => {
      const { ids } = action.payload;
      state.tenants = state.tenants.filter(t => !ids.includes(t.id));
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tenants
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload.tenants || [];
        state.mrr = action.payload.mrr ? `$${action.payload.mrr.toLocaleString()}` : state.mrr;
        state.platformLoad = action.payload.load || state.platformLoad;
        state.slaTarget = action.payload.sla || state.slaTarget;
        if (action.payload.tickets !== undefined) {
          state.tickets = action.payload.tickets;
        }
        if (action.payload.auditLogs !== undefined) {
          state.auditLogs = action.payload.auditLogs;
        }
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Company Dashboard
      .addCase(fetchCompanyDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.companyDashboard = action.payload;
      })
      .addCase(fetchCompanyDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Provision Tenant
      .addCase(provisionTenant.fulfilled, (state, action) => {
        state.tenants.unshift(action.payload);
      })
      // Fetch Sales Dashboard
      .addCase(fetchSalesDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads || [];
        state.salesConversions = action.payload.conversions || '14.8%';
        state.salesDemos = action.payload.demos || 12;
        state.salesActiveTrials = action.payload.activeTrials || 8;
      })
      .addCase(fetchSalesDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Support Tickets
      .addCase(fetchSupportTickets.fulfilled, (state, action) => {
        state.tickets = action.payload || [];
      })
      // Reply Support Ticket
      .addCase(replySupportTicket.fulfilled, (state, action) => {
        const ticket = state.tickets.find(t => t.id === action.payload.id);
        if (ticket) {
          ticket.status = action.payload.status;
          ticket.replies = action.payload.replies;
        }
      })
      // Fetch Audit Logs
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload || [];
      })
      // Create Audit Log
      .addCase(createAuditLog.fulfilled, (state, action) => {
        state.auditLogs.unshift(action.payload);
      })
      // Create Tenant User
      .addCase(createTenantUser.fulfilled, (state, action) => {
        state.tenants.forEach(t => {
          if (action.payload.email.includes(t.name.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
            t.users = (t.users || 0) + 1;
            t.usersList = t.usersList || [];
            t.usersList.push(action.payload);
          }
        });
      })
      // Subscription Actions
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === action.payload.id);
        if (tenant) {
          tenant.status = action.payload.status;
          tenant.audits = action.payload.audits;
        }
      })
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === action.payload.id);
        if (tenant) {
          tenant.status = action.payload.status;
          tenant.audits = action.payload.audits;
        }
      })
      .addCase(renewSubscription.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === action.payload.id);
        if (tenant) {
          tenant.status = action.payload.status;
          tenant.nextRenewalDate = action.payload.nextRenewalDate;
          tenant.invoices = action.payload.invoices;
          tenant.payments = action.payload.payments;
          tenant.audits = action.payload.audits;
        }
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === action.payload.id);
        if (tenant) {
          tenant.autoRenewal = action.payload.autoRenewal;
          tenant.audits = action.payload.audits;
        }
      })
      .addCase(assignPlan.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === action.payload.id);
        if (tenant) {
          tenant.plan = action.payload.plan;
          tenant.revenue = action.payload.revenue;
          tenant.audits = action.payload.audits;
        }
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === Number(action.meta.arg.id));
        if (tenant) {
          tenant.invoices = tenant.invoices || [];
          tenant.invoices.unshift(action.payload);
          tenant.audits = tenant.audits || [];
          tenant.audits.unshift({ id: Date.now(), action: 'Invoice Generation', detail: `Generated invoice ${action.payload.id} for $${action.payload.amount}.`, time: new Date().toLocaleString() });
        }
      })
      .addCase(sendReminder.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === Number(action.meta.arg));
        if (tenant) {
          tenant.audits = tenant.audits || [];
          tenant.audits.unshift({ id: Date.now(), action: 'Notification Sent', detail: 'Sent renewal invoice reminder notification to account manager.', time: new Date().toLocaleString() });
        }
      })
      .addCase(updateSubscriptionSettings.fulfilled, (state, action) => {
        const tenant = state.tenants.find(t => t.id === action.payload.id);
        if (tenant) {
          tenant.nextRenewalDate = action.payload.nextRenewalDate;
          tenant.autoRenewal = action.payload.autoRenewal;
        }
      });
  },
});

export const {
  suspendCompanyRedux,
  reactivateCompanyRedux,
  editCompanyRedux,
  deleteCompanyRedux,
  bulkUpdateRedux,
  bulkDeleteRedux
} = companySlice.actions;

export default companySlice.reducer;
