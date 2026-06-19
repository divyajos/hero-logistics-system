import { createSlice } from '@reduxjs/toolkit';

const mockReportsData = {
  revenueTrends: [
    { name: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { name: 'Feb', revenue: 52000, expenses: 34000, profit: 18000 },
    { name: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { name: 'Apr', revenue: 61000, expenses: 38000, profit: 23000 },
    { name: 'May', revenue: 59000, expenses: 37000, profit: 22000 },
    { name: 'Jun', revenue: 65000, expenses: 40000, profit: 25000 },
  ],
  driverPerformance: [
    { name: 'John D.', trips: 14, distance: 3200, rating: 4.8 },
    { name: 'Sarah R.', trips: 18, distance: 4100, rating: 4.9 },
    { name: 'Donald S.', trips: 22, distance: 5050, rating: 4.7 },
    { name: 'Mike T.', trips: 10, distance: 2100, rating: 4.5 },
    { name: 'Emily K.', trips: 16, distance: 3600, rating: 4.8 },
  ],
  vehicleUtilization: [
    { name: 'In Transit', value: 45 },
    { name: 'Available', value: 30 },
    { name: 'Maintenance', value: 15 },
    { name: 'Out of Service', value: 10 },
  ],
  customerGrowth: [
    { name: 'Wk 1', newCustomers: 4, activeLoads: 12 },
    { name: 'Wk 2', newCustomers: 6, activeLoads: 15 },
    { name: 'Wk 3', newCustomers: 3, activeLoads: 14 },
    { name: 'Wk 4', newCustomers: 8, activeLoads: 22 },
  ],
  warehouseCapacity: [
    { name: 'Bay A (Dry)', used: 94, total: 100 },
    { name: 'Bay B (Cold)', used: 82, total: 100 },
    { name: 'Bay C (Hazard)', used: 42, total: 100 },
    { name: 'Bay D (Overflow)', used: 12, total: 100 },
  ],
  summaryKpis: {
    totalRevenue: '$330,000',
    revenueGrowth: '+12.5%',
    totalProfit: '$116,000',
    profitGrowth: '+15.2%',
    totalTrips: '840',
    tripsGrowth: '+8.4%',
    activeCustomers: '142',
    customerGrowth: '+4.1%',
  }
};

const initialState = {
  data: mockReportsData,
  loading: false,
  filters: {
    dateRange: 'This Month',
    branch: 'All Branches',
    customer: 'All Customers',
    vehicle: 'All Vehicles',
    driver: 'All Drivers'
  }
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    }
  }
});

export const { setFilter, resetFilters } = reportsSlice.actions;
export default reportsSlice.reducer;
