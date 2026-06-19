import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dispatchService from '../../services/dispatchService';

export const fetchDispatchData = createAsyncThunk(
  'dispatch/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await dispatchService.getDispatchDashboard();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dispatch data');
    }
  }
);

export const assignDriverToLoad = createAsyncThunk(
  'dispatch/assignDriver',
  async ({ loadId, driverId }, { rejectWithValue }) => {
    try {
      return await dispatchService.assignDriver(loadId, driverId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign driver');
    }
  }
);

export const logGisTracking = createAsyncThunk(
  'dispatch/logGis',
  async ({ loadId, coordinates }, { rejectWithValue }) => {
    try {
      return await dispatchService.updateGisCoordinates(loadId, coordinates);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log GIS coordinates');
    }
  }
);

const initialState = {
  dispatchLoads: [],
  driversCount: 0,
  unassignedCount: 0,
  delayCount: 0,
  activeRouteDetails: null,
  loading: false,
  error: null,
};

const dispatchSlice = createSlice({
  name: 'dispatch',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDispatchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatchData.fulfilled, (state, action) => {
        state.loading = false;
        state.dispatchLoads = action.payload.loads || [];
        state.driversCount = action.payload.drivers || 0;
        state.unassignedCount = action.payload.unassigned || 0;
        state.delayCount = action.payload.delays || 0;
      })
      .addCase(fetchDispatchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(assignDriverToLoad.fulfilled, (state, action) => {
        // Option to update local state if assign endpoint returns updated load
        const index = state.dispatchLoads.findIndex(l => l.loadId === action.payload.loadId);
        if (index !== -1) {
          state.dispatchLoads[index].driver = action.payload.driver;
          state.dispatchLoads[index].status = 'Scheduled';
        }
      });
  },
});

export default dispatchSlice.reducer;
