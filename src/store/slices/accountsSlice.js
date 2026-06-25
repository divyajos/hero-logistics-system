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

export const updateLedgerStatus = createAsyncThunk(
  'accounts/updateStatus',
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
       return await accountsService.updateLedgerStatus(id, updateData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ledger status');
    }
  }
);

export const payPayrollRecord = createAsyncThunk(
  'accounts/payPayroll',
  async ({ id, processedBy }, { rejectWithValue }) => {
    try {
      return await accountsService.payPayrollRecord(id, { processedBy });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payroll payment');
    }
  }
);

const initialState = {
  ledgers: [],
  factoringCount: 0,
  payrollCount: 0,
  balanceDue: 0,
  driverPayroll: [],
  employeePayments: [],
  contractorPayments: [],
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
        state.driverPayroll = action.payload.driverPayroll || [];
        state.employeePayments = action.payload.employeePayments || [];
        state.contractorPayments = action.payload.contractorPayments || [];
      })
      .addCase(fetchAccountsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addLedgerEntry.fulfilled, (state, action) => {
        state.ledgers.unshift(action.payload);
      })
      .addCase(updateLedgerStatus.fulfilled, (state, action) => {
        const index = state.ledgers.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.ledgers[index] = action.payload;
        }
      })
      .addCase(payPayrollRecord.fulfilled, (state, action) => {
        const { record, ledger } = action.payload;
        if (record.workerType === 'Driver') {
          const index = state.driverPayroll.findIndex(r => r.id === record.id);
          if (index !== -1) {
            state.driverPayroll[index] = record;
          }
        }
        if (record.workerType === 'Employee') {
          const index = state.employeePayments.findIndex(r => r.id === record.id);
          if (index !== -1) {
            state.employeePayments[index] = record;
          }
        }
        if (record.workerType === 'Contractor') {
          const index = state.contractorPayments.findIndex(r => r.id === record.id);
          if (index !== -1) {
            state.contractorPayments[index] = record;
          }
        }
        state.ledgers.unshift(ledger);
      });
  },
});

export default accountsSlice.reducer;
