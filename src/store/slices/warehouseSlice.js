import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseService from '../../services/warehouseService';

export const fetchWarehouseData = createAsyncThunk(
  'warehouse/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseService.getWarehouseDashboard();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse data');
    }
  }
);

export const addWarehouseInventory = createAsyncThunk(
  'warehouse/addInventory',
  async (itemData, { rejectWithValue }) => {
    try {
      return await warehouseService.addInventoryItem(itemData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add inventory item');
    }
  }
);

export const updateWarehouseInventory = createAsyncThunk(
  'warehouse/updateInventory',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await warehouseService.updateInventoryItem(id, data);
      dispatch(fetchInventoryMovements());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory');
    }
  }
);

export const fetchInventoryMovements = createAsyncThunk(
  'warehouse/fetchMovements',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseService.getInventoryMovements();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch movements');
    }
  }
);

export const fetchWarehouseAssets = createAsyncThunk(
  'warehouse/fetchAssets',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseService.getAssets();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

const initialState = {
  inventory: [],
  occupancy: '0%',
  scansCount: '0 Items',
  crossDockCount: '0 Trucks',
  movements: [],
  assets: [],
  // Yard Gate Logs
  gateLogs: [
    { id: 1, event: 'Gate-In', trailer: 'TR-9410', driver: 'Donald S.', company: 'Apex Cargo', time: '11:15 AM', status: 'Completed' },
    { id: 2, event: 'Gate-In', trailer: 'TR-1102', driver: 'Sarah R.', company: 'Apex Cargo', time: '11:42 AM', status: 'Active' },
    { id: 3, event: 'Gate-Out', trailer: 'TR-4809', driver: 'John D.', company: 'Apex Cargo', time: '12:05 PM', status: 'Completed' },
    { id: 4, event: 'Gate-In', trailer: 'TR-7712', driver: 'Marcus A.', company: 'Apex Cargo', time: '12:30 PM', status: 'Pending' }
  ],
  loading: false,
  error: null,
};

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    addGateLog: (state, action) => {
      state.gateLogs.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseData.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.inventory || [];
        state.occupancy = action.payload.occupancy || '0%';
        state.scansCount = action.payload.scans || '0 Items';
        state.crossDockCount = action.payload.crossDock || '0 Trucks';
      })
      .addCase(fetchWarehouseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addWarehouseInventory.fulfilled, (state, action) => {
        state.inventory.unshift(action.payload);
      })
      .addCase(updateWarehouseInventory.fulfilled, (state, action) => {
        const idx = state.inventory.findIndex(item => item.id === action.payload.id);
        if (idx !== -1) {
          state.inventory[idx] = action.payload;
        }
      })
      .addCase(fetchInventoryMovements.fulfilled, (state, action) => {
        state.movements = action.payload || [];
      })
      .addCase(fetchWarehouseAssets.fulfilled, (state, action) => {
        state.assets = action.payload || [];
      });
  },
});

export const { addGateLog } = warehouseSlice.actions;
export default warehouseSlice.reducer;
