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

const initialState = {
  customerLoads: [],
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
      });
  },
});

export default customersSlice.reducer;
