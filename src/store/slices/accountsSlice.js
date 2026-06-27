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

export const executeAccountAction = createAsyncThunk(
  'accounts/executeAction',
  async (actionData, { dispatch, rejectWithValue }) => {
    try {
      const response = await accountsService.executeAction(actionData);
      dispatch(fetchAccountsData());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Action failed');
    }
  }
);

const initialState = {
  data: {},
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
        state.data = action.payload || {};
      })
      .addCase(fetchAccountsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default accountsSlice.reducer;