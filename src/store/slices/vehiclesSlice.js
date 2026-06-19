import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../../services/vehicleService';

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      return await vehicleService.getVehicles();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const addVehicle = createAsyncThunk(
  'vehicles/addVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      return await vehicleService.addVehicle(vehicleData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add vehicle');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await vehicleService.updateVehicle(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await vehicleService.deleteVehicle(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete vehicle');
    }
  }
);

const initialState = {
  fleet: [],
  loading: false,
  error: null,
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.fleet = action.payload || [];
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.fleet.unshift(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.fleet.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.fleet[index] = action.payload;
        }
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.fleet = state.fleet.filter(v => v.id !== action.payload);
      });
  },
});

export default vehiclesSlice.reducer;
