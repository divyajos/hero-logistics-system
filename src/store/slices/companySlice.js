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
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
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
      });
  },
});

export default companySlice.reducer;
