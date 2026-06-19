import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import driverService from '../../services/driverService';

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      return await driverService.getDrivers();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drivers');
    }
  }
);

export const addDriver = createAsyncThunk(
  'drivers/addDriver',
  async (driverData, { rejectWithValue }) => {
    try {
      return await driverService.addDriver(driverData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add driver');
    }
  }
);

export const updateDriver = createAsyncThunk(
  'drivers/updateDriver',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await driverService.updateDriver(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update driver');
    }
  }
);

export const deleteDriver = createAsyncThunk(
  'drivers/deleteDriver',
  async (id, { rejectWithValue }) => {
    try {
      await driverService.deleteDriver(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete driver');
    }
  }
);

const initialState = {
  drivers: [],
  loading: false,
  error: null,
};

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.drivers || [];
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.drivers.unshift(action.payload);
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d.id !== action.payload);
      });
  },
});

export default driversSlice.reducer;
