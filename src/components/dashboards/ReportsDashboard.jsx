import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, resetFilters } from '../../store/slices/reportsSlice';
import { fetchAccountsData } from '../../store/slices/accountsSlice';
import { fetchLoads } from '../../store/slices/loadsSlice';
import Button from '../common/Button';
import SelectInput from '../common/SelectInput';
import StatCard from '../common/StatCard';
import Tabs from '../common/Tabs';
import { Download, Calendar as CalendarIcon, Filter, Building2, Truck, Users } from 'lucide-react';
import { LineChartWidget, BarChartWidget, PieChartWidget } from '../common/DashboardCharts';
import DataTable from '../common/DataTable';
import Toast from '../common/Toast';

export default function ReportsDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { data: staticData, filters } = useSelector((state) => state.reports);
  const { ledgers } = useSelector((state) => state.accounts);
  const { items: loads } = useSelector((state) => state.loads);
  
  const [reportTab, setReportTab] = useState('revenue'); // revenue, driver, vehicle, customer, warehouse
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAccountsData());
    dispatch(fetchLoads());
  }, [dispatch]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

  // Helper to parse amount
  const getAmt = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[$,]/g, '')) || 0;
  };

  const paidInvoices = ledgers.filter(l => l.type === 'Invoice' && l.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum, l) => sum + getAmt(l.amount), 0);

  const totalExpenses = ledgers.filter(l => l.type !== 'Invoice' && l.type !== 'Factoring').reduce((sum, l) => sum + getAmt(l.amount), 0);
  
  const netProfit = totalRevenue - totalExpenses;
  const marginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const completedTrips = loads.filter(l => l.status === 'Delivered' || l.status === 'Closed' || l.status === 'Invoiced').length;
  
  const uniqueCustomers = Array.from(new Set([
    ...loads.map(l => l.customerName),
    ...ledgers.filter(l => l.type === 'Invoice').map(l => l.payee)
  ].filter(Boolean))).length;

  const dynamicKpis = {
    totalRevenue: `$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    revenueGrowth: '+14.2%',
    totalProfit: `$${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    profitGrowth: `${marginPercent}% Margin`,
    totalTrips: `${completedTrips}`,
    tripsGrowth: 'Live',
    activeCustomers: `${uniqueCustomers}`,
    customerGrowth: 'Stable'
  };

  // Group by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const mIdx = (currentMonthIdx - i + 12) % 12;
    const mName = months[mIdx];
    let rev = 0;
    let exp = 0;
    if (i === 0) {
      rev = totalRevenue;
      exp = totalExpenses;
    } else {
      const histRev = [35000, 42000, 48000, 52000, 59000];
      const histExp = [28000, 31000, 35000, 39000, 42000];
      rev = histRev[5 - i] || 45000;
      exp = histExp[5 - i] || 32000;
    }
    trendData.push({
      name: mName,
      revenue: rev,
      expenses: exp,
      profit: rev - exp
    });
  }

  // Combine static and dynamic data
  const data = {
    ...staticData,
    summaryKpis: dynamicKpis,
    revenueTrends: trendData
  };

  const handleExport = (format) => {
    triggerToast(`Reports module exported successfully to ${format.toUpperCase()} format.`);
  };

  const renderFilters = () => (
    <div className="flex flex-wrap items-center gap-3 bg-[#111827]/60 p-4 border-b border-[#23324C]/60 rounded-t-2xl">
      <div className="flex items-center space-x-2 mr-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filters:</span>
      </div>
      <SelectInput 
        value={filters.dateRange} 
        onChange={(e) => dispatch(setFilter({ key: 'dateRange', value: e.target.value }))}
        options={[
          { value: 'Today', label: 'Today' },
          { value: 'This Week', label: 'This Week' },
          { value: 'This Month', label: 'This Month' },
          { value: 'Last Quarter', label: 'Last Quarter' },
          { value: 'Year to Date', label: 'Year to Date' }
        ]}
        className="w-40"
      />
      <SelectInput 
        value={filters.branch} 
        onChange={(e) => dispatch(setFilter({ key: 'branch', value: e.target.value }))}
        options={[
          { value: 'All Branches', label: 'All Branches' },
          { value: 'Chicago HQ', label: 'Chicago HQ' },
          { value: 'Dallas Depot', label: 'Dallas Depot' }
        ]}
        className="w-40"
      />
      <div className="flex-1"></div>
      <div className="flex items-center space-x-2">
        <Button variant="secondary" size="sm" icon={Download} onClick={() => handleExport('csv')}>Export CSV</Button>
        <Button variant="primary" size="sm" icon={Download} onClick={() => handleExport('pdf')}>Export PDF</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Reports & Analytics Center</h2>
          <p className="text-xs text-slate-400">Generate, export, and visualize system-wide logistics performance metrics.</p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={data.summaryKpis.totalRevenue} description="Across selected period" trend={data.summaryKpis.revenueGrowth} trendDirection="up" />
        <StatCard title="Net Profit Margin" value={data.summaryKpis.totalProfit} description="After expenses" trend={data.summaryKpis.profitGrowth} trendDirection="up" />
        <StatCard title="Total Trips Completed" value={data.summaryKpis.totalTrips} description="Loads delivered" trend={data.summaryKpis.tripsGrowth} trendDirection="up" />
        <StatCard title="Active Customers" value={data.summaryKpis.activeCustomers} description="Billed shippers" trend={data.summaryKpis.customerGrowth} trendDirection="up" />
      </div>

      {/* Reports Workspace */}
      <div className="glass rounded-2xl border border-[#23324C]/60 text-left flex flex-col">
        
        {renderFilters()}
        
        <div className="border-b border-[#23324C]/60 px-5 pt-4">
          <Tabs 
            tabs={[
              { id: 'revenue', label: 'Revenue Trends', icon: Building2 },
              { id: 'driver', label: 'Driver Performance', icon: Users },
              { id: 'vehicle', label: 'Vehicle Utilization', icon: Truck },
              { id: 'customer', label: 'Customer Growth', icon: Building2 },
              { id: 'warehouse', label: 'Warehouse Capacity', icon: Building2 }
            ]} 
            activeTab={reportTab} 
            onChange={setReportTab} 
            className="border-transparent"
          />
        </div>

        <div className="p-6">
          {reportTab === 'revenue' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-extrabold text-white mb-2">Revenue vs Expenses Flow</h3>
              <div className="h-80 w-full bg-[#0B0F19] rounded-xl border border-[#23324C] p-4 flex items-center justify-center">
                <LineChartWidget data={data.revenueTrends} dataKey1="revenue" dataKey2="expenses" color1="#0ea0ea" color2="#f43f5e" />
              </div>
              <DataTable columns={[
                { key: 'name', label: 'Period' },
                { key: 'revenue', label: 'Gross Revenue', render: (row) => <span className="text-brand-400 font-bold font-mono">${row.revenue.toLocaleString()}</span> },
                { key: 'expenses', label: 'Total Expenses', render: (row) => <span className="text-red-400 font-bold font-mono">${row.expenses.toLocaleString()}</span> },
                { key: 'profit', label: 'Net Profit', render: (row) => <span className="text-emerald-400 font-bold font-mono">${row.profit.toLocaleString()}</span> }
              ]} data={data.revenueTrends} />
            </div>
          )}

          {reportTab === 'driver' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-extrabold text-white mb-2">Driver Distance & Trips Metrics</h3>
              <div className="h-80 w-full bg-[#0B0F19] rounded-xl border border-[#23324C] p-4 flex items-center justify-center">
                <BarChartWidget data={data.driverPerformance} dataKey="distance" color="#10b981" />
              </div>
              <DataTable columns={[
                { key: 'name', label: 'Driver Operator' },
                { key: 'trips', label: 'Trips Completed', render: (row) => <span className="font-mono">{row.trips} runs</span> },
                { key: 'distance', label: 'Distance Logged', render: (row) => <span className="font-mono text-emerald-400">{row.distance.toLocaleString()} miles</span> },
                { key: 'rating', label: 'Safety Rating', render: (row) => <span className="font-bold text-yellow-400">★ {row.rating}</span> }
              ]} data={data.driverPerformance} />
            </div>
          )}

          {reportTab === 'vehicle' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-2">Fleet Status Distribution</h3>
                  <div className="h-80 w-full bg-[#0B0F19] rounded-xl border border-[#23324C] p-4 flex items-center justify-center">
                    <PieChartWidget data={data.vehicleUtilization} height={280} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Status Breakdown</h4>
                  <div className="divide-y divide-[#23324C]/40">
                    {data.vehicleUtilization.map((v, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-xs">
                        <span className="text-white font-bold">{v.name}</span>
                        <span className="font-mono text-brand-400">{v.value}% of Fleet</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportTab === 'customer' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-extrabold text-white mb-2">Client Acquisition vs Output</h3>
              <div className="h-80 w-full bg-[#0B0F19] rounded-xl border border-[#23324C] p-4 flex items-center justify-center">
                <LineChartWidget data={data.customerGrowth} dataKey1="newCustomers" dataKey2="activeLoads" color1="#8b5cf6" color2="#0ea0ea" />
              </div>
              <DataTable columns={[
                { key: 'name', label: 'Timeline Period' },
                { key: 'newCustomers', label: 'New Contracts Signed', render: (row) => <span className="font-bold text-purple-400">+{row.newCustomers}</span> },
                { key: 'activeLoads', label: 'Active Loads Volume', render: (row) => <span className="font-mono text-brand-400">{row.activeLoads} Shipments</span> }
              ]} data={data.customerGrowth} />
            </div>
          )}

          {reportTab === 'warehouse' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-extrabold text-white mb-2">Storage Bay Occupancy Rate</h3>
              <div className="h-80 w-full bg-[#0B0F19] rounded-xl border border-[#23324C] p-4 flex items-center justify-center">
                <BarChartWidget data={data.warehouseCapacity} dataKey="used" color="#f59e0b" />
              </div>
              <DataTable columns={[
                { key: 'name', label: 'Warehouse Zone' },
                { key: 'used', label: 'Capacity Utilization', render: (row) => (
                  <div className="w-full max-w-[200px] flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-yellow-500 rounded-full" style={{ width: `${row.used}%` }}></div>
                    </div>
                    <span className="font-mono text-xs">{row.used}%</span>
                  </div>
                )}
              ]} data={data.warehouseCapacity} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
