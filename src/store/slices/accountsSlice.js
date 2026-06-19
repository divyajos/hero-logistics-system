import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountsService from '../../services/accountsService';

export const fetchAccountsData = createAsyncThunk(
  'accounts/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await accountsService.getAccountsDashboard();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts data');
    }
  }
);

export const addLedgerEntry = createAsyncThunk(
  'accounts/addLedger',
  async (entryData, { rejectWithValue }) => {
    try {
      return await accountsService.addLedgerEntry(entryData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add ledger entry');
    }
  }
);

const initialState = {
  ledgers: [],
  factoringCount: 0,
  payrollCount: 0,
  balanceDue: 0,
  loading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountsData.fulfilled, (state, action) => {
        state.loading = false;
        state.ledgers = action.payload.ledgers || [];
        state.factoringCount = action.payload.factoring || 0;
        state.payrollCount = action.payload.payrollCount || 0;
        state.balanceDue = action.payload.balanceDue || 0;
      })
      .addCase(fetchAccountsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addLedgerEntry.fulfilled, (state, action) => {
        state.ledgers.unshift(action.payload);
      });
  },
});

export default accountsSlice.reducer;
