import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

export const fetchCustomerLoads = createAsyncThunk(
  'customers/fetchLoads',
  async (_, { rejectWithValue }) => {
    try {
      return await customerService.getCustomerDashboard();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer loads');
    }
  }
);

export const createBooking = createAsyncThunk(
  'customers/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      return await customerService.createBooking(bookingData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const fetchCustomerInstructions = createAsyncThunk(
  'customers/fetchInstructions',
  async (_, { rejectWithValue }) => {
    try {
      return await customerService.getInstructions();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer instructions');
    }
  }
);

export const createCustomerInstruction = createAsyncThunk(
  'customers/createInstruction',
  async (insData, { rejectWithValue }) => {
    try {
      return await customerService.createInstruction(insData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create instruction');
    }
  }
);

export const editCustomerInstruction = createAsyncThunk(
  'customers/editInstruction',
  async ({ id, ...insData }, { rejectWithValue }) => {
    try {
      return await customerService.updateInstruction(id, insData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit instruction');
    }
  }
);

export const deleteCustomerInstruction = createAsyncThunk(
  'customers/deleteInstruction',
  async (id, { rejectWithValue }) => {
    try {
      await customerService.deleteInstruction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete instruction');
    }
  }
);

export const fetchCustomerInvoices = createAsyncThunk(
  'customers/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      return await customerService.getInvoices();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer invoices');
    }
  }
);

export const fetchCustomerTransactions = createAsyncThunk(
  'customers/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      return await customerService.getTransactions();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer transactions');
    }
  }
);

export const payCustomerInvoice = createAsyncThunk(
  'customers/payInvoice',
  async ({ id, paymentMethod }, { rejectWithValue }) => {
    try {
      return await customerService.payInvoice(id, { paymentMethod });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pay invoice');
    }
  }
);

const initialState = {
  customerLoads: [],
  customerInstructions: [],
  customerInvoices: [],
  customerTransactions: [],
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerLoads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerLoads.fulfilled, (state, action) => {
        state.loading = false;
        state.customerLoads = action.payload.loads || [];
      })
      .addCase(fetchCustomerLoads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.customerLoads.unshift(action.payload);
      })
      // Instructions Reducer Handlers
      .addCase(fetchCustomerInstructions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInstructions.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInstructions = action.payload || [];
      })
      .addCase(fetchCustomerInstructions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomerInstruction.fulfilled, (state, action) => {
        state.customerInstructions.unshift(action.payload);
      })
      .addCase(editCustomerInstruction.fulfilled, (state, action) => {
        const index = state.customerInstructions.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.customerInstructions[index] = action.payload;
        }
      })
      .addCase(deleteCustomerInstruction.fulfilled, (state, action) => {
        state.customerInstructions = state.customerInstructions.filter(i => i.id !== action.payload);
      })
      // Invoices & Transactions cases
      .addCase(fetchCustomerInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInvoices = action.payload || [];
      })
      .addCase(fetchCustomerInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomerTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.customerTransactions = action.payload || [];
      })
      .addCase(fetchCustomerTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(payCustomerInvoice.fulfilled, (state, action) => {
        const { invoice, transaction } = action.payload;
        const index = state.customerInvoices.findIndex(i => String(i.id) === String(invoice.id));
        if (index !== -1) {
          state.customerInvoices[index] = invoice;
        }
        state.customerTransactions.unshift(transaction);
      });
  },
});

export default customersSlice.reducer;
