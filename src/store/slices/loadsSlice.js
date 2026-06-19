import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loadService from '../../services/loadService';

export const fetchLoads = createAsyncThunk(
  'loads/fetchLoads',
  async (_, { rejectWithValue }) => {
    try {
      const data = await loadService.getLoadsDashboard();
      return data; // contains loads array and metrics: unassigned, drivers, delays
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loads');
    }
  }
);

export const createLoad = createAsyncThunk(
  'loads/createLoad',
  async (loadData, { rejectWithValue }) => {
    try {
      return await loadService.createLoad(loadData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create load');
    }
  }
);

export const updateLoadStatus = createAsyncThunk(
  'loads/updateStatus',
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      return await loadService.updateLoadStatus(id, updateData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update load status');
    }
  }
);

const initialState = {
  items: [],
  unassignedCount: 0,
  driverCount: 0,
  delayCount: 0,
  loading: false,
  error: null,
};

const loadsSlice = createSlice({
  name: 'loads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.loads || [];
        state.unassignedCount = action.payload.unassigned || 0;
        state.driverCount = action.payload.drivers || 0;
        state.delayCount = action.payload.delays || 0;
      })
      .addCase(fetchLoads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLoad.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLoadStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default loadsSlice.reducer;
