import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountsData, executeAccountAction } from '../../store/slices/accountsSlice';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import SearchInput from '../common/SearchInput';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import Drawer from '../common/Drawer';
import MiniChart from '../common/MiniChart';
import { KpiGridSkeleton, TableSkeleton } from '../common/Skeletons';
import { 
  Layers, MapPin, Database, Award, Check, DollarSign, 
  Trash2, Edit2, Download, TrendingUp, Users, Calendar, Plus
} from 'lucide-react';
import { useLogistics } from '../../context/LogisticsContext';
import { useAuth } from '../../context/AuthContext';

export default function AccountsDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.accounts);
  const { invoices = [], invoiceItems = [], customers = [], loads = [], trips = [], payments = [], employees = [], drivers = [], contractors = [], payroll = [], expenses = [], gst = [], payg = [], vehicleCosts = [], profitAndLoss = [], cashFlow = [], journalEntries = [], chartOfAccounts = [], customerLedger = [], vendorLedger = [], employeeLedger = [], driverLedger = [], contractorLedger = [], generalLedger = [], auditLogs = [], notifications = [], reports = [], bankReconciliation = [], revenue = 0, expensesSum = 0, grossProfit = 0, margin = '0%', paidRevenue = 0, balanceDue = 0, ledgers = [], driverPayroll = [], employeePayments = [], contractorPayments = [] } = data || {};
  const { shiftState } = useLogistics();
  const { user } = useAuth();
  const isRestricted = ['Read Only', 'Auditor'].includes(user?.role);

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [payRateModalOpen, setPayRateModalOpen] = useState(false);

  // Selection
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form Fields
  const [payeeName, setPayeeName] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [ledgerType, setLedgerType] = useState('Invoice');

  // Search & Filter
  const [invoicesSubTab, setInvoicesSubTab] = useState('all'); // all, review
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Local lists states
  const [localLedgers, setLocalLedgers] = useState([]);
  const [payrollTab, setPayrollTab] = useState('Driver Payroll');

  const [vehicleProfitability, setVehicleProfitability] = useState([
    { plate: 'TX-ROAD88', revenue: '$14,200', expenses: '$9,200', profit: '$5,000', margin: '35%' },
    { plate: 'IL-HAUL42', revenue: '$12,850', expenses: '$8,400', profit: '$4,450', margin: '34%' },
    { plate: 'CA-CARRI7', revenue: '$18,900', expenses: '$14,200', profit: '$4,700', margin: '24%' }
  ]);

  // AI receipts queue states
  const [aiReceipts, setAiReceipts] = useState([
    { id: 'REC-901', source: 'Shell Fuel Station', date: '06/22/2026', parsedData: { item: 'Diesel Fuel', fuelQty: '140 Gal', fuelCost: '$546.00', gst: '$54.60', total: '$600.60' }, status: 'pending' },
    { id: 'REC-902', source: 'Penske Fleet Services', date: '06/21/2026', parsedData: { item: 'Engine Oil Change', fuelQty: 'N/A', fuelCost: '$0.00', gst: '$32.00', total: '$352.00' }, status: 'pending' }
  ]);
  
  const [ledgerSpreadsheet, setLedgerSpreadsheet] = useState([
    { id: 'L-1', date: '06/20/2026', desc: 'Caltex Diesel Ingest', category: 'Fuel', amount: '$450.00', gst: '$45.00', total: '$495.00', method: 'AI Extracted' },
    { id: 'L-2', date: '06/19/2026', desc: 'Volvo Workshop Repair', category: 'Maintenance', amount: '$1,200.00', gst: '$120.00', total: '$1,320.00', method: 'Manual' },
    { id: 'L-3', date: '06/18/2026', desc: 'Wages John D Week 24', category: 'Wages', amount: '$1,420.00', gst: '$0.00', total: '$1,420.00', method: 'Direct Payout' }
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Rate Settings states (Priority 4)
  const [ratesSubTab, setRatesSubTab] = useState('customer');
  const [customerRates, setCustomerRates] = useState([
    { id: 1, name: 'Global Retail Corp', flatRate: '$450.00', kmRate: '$1.85', palletRate: '$15.00', vehicleClass: 'Car Carrier' },
    { id: 2, name: 'Vance Refrigeration', flatRate: '$320.00', kmRate: '$2.10', palletRate: '$18.50', vehicleClass: 'Reefer Trailer' }
  ]);
  const [carrierRates, setCarrierRates] = useState([
    { id: 1, name: 'Apex Carrier', costPerKm: '$1.45', flatRate: '$250.00' },
    { id: 2, name: 'Swift Cargo Express', costPerKm: '$1.60', flatRate: '$300.00' }
  ]);
  const [fuelSurcharges, setFuelSurcharges] = useState([
    { id: 1, threshold: '$1.80/L', surcharge: '12%', status: 'Active' },
    { id: 2, threshold: '$2.00/L', surcharge: '15%', status: 'Active' }
  ]);
  const [accessorials, setAccessorials] = useState([
    { id: 1, type: 'Tailgate Loader', fee: '$50.00', status: 'Active' },
    { id: 2, type: 'Hand Load/Unload', fee: '$80.00', status: 'Active' }
  ]);

  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateFlat, setNewRateFlat] = useState('');
  const [newRateKm, setNewRateKm] = useState('');
  const [newRatePallet, setNewRatePallet] = useState('');

  // AI Receipts confirm handler
  const handleConfirmReceipt = (receipt) => {
    const newEntry = {
      id: `L-${Date.now().toString().slice(-4)}`,
      date: receipt.date,
      desc: `${receipt.source} Ingest`,
      category: receipt.parsedData.fuelCost !== '$0.00' ? 'Fuel' : 'Maintenance',
      amount: receipt.parsedData.fuelCost !== '$0.00' ? receipt.parsedData.fuelCost : `$${(parseFloat(receipt.parsedData.total.replace('$', '')) - parseFloat(receipt.parsedData.gst.replace('$', ''))).toFixed(2)}`,
      gst: receipt.parsedData.gst,
      total: receipt.parsedData.total,
      method: 'AI Extracted'
    };
    setLedgerSpreadsheet([newEntry, ...ledgerSpreadsheet]);
    setAiReceipts(aiReceipts.filter(r => r.id !== receipt.id));
    triggerToast(`AI parsed receipt ${receipt.id} confirmed and logged into spreadsheet ledger.`);
  };

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchAccountsData());
  }, [dispatch]);

  // Sync redux state to local state
  useEffect(() => {
    if (ledgers && ledgers.length > 0) {
      setLocalLedgers(ledgers);
    }
  }, [ledgers]);

  const applySearch = (list) => {
    if (!search || !list || !Array.isArray(list)) return list || [];
    const q = search.toLowerCase();
    return list.filter(item => {
      if (!item) return false;
      return Object.values(item).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      );
    });
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Add ledger entry
  const handleAddLedger = (e) => {
    e.preventDefault();
    if (!payeeName || !amountVal) {
      triggerToast('Complete payee name and amount.', 'error');
      return;
    }
    const newEntry = {
      id: Date.now(),
      type: ledgerType,
      payee: payeeName,
      amount: `$${parseFloat(amountVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      date: new Date().toLocaleDateString(),
      status: 'Pending'
    };
    // Update local state
    setLocalLedgers([newEntry, ...localLedgers]);
    dispatch(executeAccountAction({
      action: 'addLedgerEntry',
      type: ledgerType,
      payee: payeeName,
      amount: parseFloat(amountVal)
    }));

    setPayeeName('');
    setAmountVal('');
    setAddModalOpen(false);
    triggerToast(`Ledger transaction ${ledgerType} logged successfully.`);
  };

  // Complete Invoice Payment
  const handlePayInvoice = (id) => {
    setLocalLedgers(localLedgers.map(l => l.id === id ? { ...l, status: 'Paid' } : l));
    triggerToast('Invoice balance marked Paid.');
  };

  // Run Driver Payroll
  const handlePayDriver = (id) => {
    dispatch(executeAccountAction({ action: 'payPayrollRecord', id, processedBy: 'Company Admin' }));
    triggerToast(`Payroll run complete for driver. Direct deposit issued.`);
  };

  // Pay Contractor
  const handlePayContractor = (id) => {
    dispatch(executeAccountAction({ action: 'payPayrollRecord', id, processedBy: 'Company Admin' }));
    triggerToast('Contractor payment disbursed.');
  };

  // Pay Employee
  const handlePayEmployee = (id) => {
    dispatch(executeAccountAction({ action: 'payPayrollRecord', id, processedBy: 'Company Admin' }));
    triggerToast('Employee payroll payment disbursed.');
  };

  const handleAddRate = (e) => {
    e.preventDefault();
    if (!newRateName) return;

    if (ratesSubTab === 'customer') {
      const newRate = {
        id: Date.now(),
        name: newRateName,
        flatRate: `$${parseFloat(newRateFlat || 0).toFixed(2)}`,
        kmRate: `$${parseFloat(newRateKm || 0).toFixed(2)}`,
        palletRate: `$${parseFloat(newRatePallet || 0).toFixed(2)}`,
        vehicleClass: 'General Freight'
      };
      setCustomerRates([newRate, ...customerRates]);
      triggerToast(`Added customer rate settings for ${newRateName}`);
    } else if (ratesSubTab === 'carrier') {
      const newRate = {
        id: Date.now(),
        name: newRateName,
        flatRate: `$${parseFloat(newRateFlat || 0).toFixed(2)}`,
        costPerKm: `$${parseFloat(newRateKm || 0).toFixed(2)}`
      };
      setCarrierRates([newRate, ...carrierRates]);
      triggerToast(`Added carrier rate settings for ${newRateName}`);
    } else if (ratesSubTab === 'fuel') {
      const newRate = {
        id: Date.now(),
        threshold: newRateName,
        surcharge: `${newRateFlat}%`,
        status: 'Active'
      };
      setFuelSurcharges([newRate, ...fuelSurcharges]);
      triggerToast(`Added fuel surcharge threshold ${newRateName}`);
    } else if (ratesSubTab === 'accessorial') {
      const newRate = {
        id: Date.now(),
        type: newRateName,
        fee: `$${parseFloat(newRateFlat || 0).toFixed(2)}`,
        status: 'Active'
      };
      setAccessorials([newRate, ...accessorials]);
      triggerToast(`Added accessorial charge type ${newRateName}`);
    }

    setNewRateName('');
    setNewRateFlat('');
    setNewRateKm('');
    setNewRatePallet('');
    setRateModalOpen(false);
  };

  // Search & Pagination filtering
  const filteredLedgers = localLedgers.filter(l => {
    const matchesSearch = l.payee.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === '' || l.type === filterType;
    const matchesSubTab = invoicesSubTab === 'all' || (l.type === 'Invoice' && l.status === 'Draft');
    return matchesSearch && matchesType && matchesSubTab;
  });

  const totalPages = Math.ceil(filteredLedgers.length / itemsPerPage);
  const paginatedLedgers = filteredLedgers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper to parse amount
  const getAmt = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[$,]/g, '')) || 0;
  };

  // Dynamic P&L Calculations:
  // Revenue Sources: Paid Invoices and Customer Payments (which are Paid Invoices)
  const paidInvoices = localLedgers.filter(l => l.type === 'Invoice' && l.status === 'Paid');
  const dynamicRevenue = paidInvoices.reduce((sum, l) => sum + getAmt(l.amount), 0);

  // Expenses:
  // - Payroll (Driver Pay, Wages)
  const dynamicPayroll = localLedgers.filter(l => l.type === 'Driver Pay' || l.type === 'Wages').reduce((sum, l) => sum + getAmt(l.amount), 0);
  // - Contractor payments
  const dynamicContractor = localLedgers.filter(l => l.type === 'Contractor Pay' || l.category === 'Contractor').reduce((sum, l) => sum + getAmt(l.amount), 0);
  // - Vehicle costs / Insurance / Registration
  const dynamicVehicleCosts = localLedgers.filter(l => l.type === 'Expense' && (l.category === 'Insurance' || l.category === 'Registration' || l.category === 'Vehicle')).reduce((sum, l) => sum + getAmt(l.amount), 0);
  // - Fuel expenses
  const dynamicFuel = localLedgers.filter(l => l.category === 'Fuel' || l.payee.toLowerCase().includes('fuel')).reduce((sum, l) => sum + getAmt(l.amount), 0);
  // - Maintenance expenses
  const dynamicMaintenance = localLedgers.filter(l => l.category === 'Maintenance' || l.payee.toLowerCase().includes('penske') || l.payee.toLowerCase().includes('workshop') || l.payee.toLowerCase().includes('service')).reduce((sum, l) => sum + getAmt(l.amount), 0);

  const dynamicExpenses = dynamicPayroll + dynamicContractor + dynamicVehicleCosts + dynamicFuel + dynamicMaintenance;
  
  // Margin / Profits
  const dynamicGrossProfit = dynamicRevenue - (dynamicPayroll + dynamicContractor);
  const dynamicNetProfit = dynamicRevenue - dynamicExpenses;
  const dynamicMargin = dynamicRevenue > 0 ? ((dynamicNetProfit / dynamicRevenue) * 100).toFixed(1) : '0';

  const outstandingInvoices = localLedgers.filter(l => l.type === 'Invoice' && l.status === 'Pending').reduce((sum, l) => sum + getAmt(l.amount), 0);
  const factoringFunding = localLedgers.filter(l => l.type === 'Factoring').reduce((sum, l) => sum + getAmt(l.amount), 0);

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">Accounts & Payroll • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-500">Review invoice factoring, disburse driver paychecks, and analyze margins.</p>
        </div>

        {activeTab === 'invoices' && (
          <Button variant="primary" icon={Plus} onClick={() => { setLedgerType('Invoice'); setAddModalOpen(true); }}>
            Record Invoice
          </Button>
        )}
        {activeTab === 'expenses' && (
          <Button variant="primary" icon={Plus} onClick={() => { setLedgerType('Driver Pay'); setAddModalOpen(true); }}>
            Record Expense
          </Button>
        )}
        {activeTab === 'rates' && (
          <Button variant="primary" icon={Plus} onClick={() => setRateModalOpen(true)}>
            Add New Rate Setting
          </Button>
        )}
      </div>

      {loading && localLedgers.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Factored Funding" value={`$${factoringFunding.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Active invoice reserves" trend="Factored" trendDirection="neutral" />
                <StatCard title="Driver Payroll" value={`${localLedgers.filter(l => (l.type === 'Driver Pay' || l.type === 'Wages') && l.status === 'Pending').length} Pending`} description="Awaiting payment runs" trend={`$${dynamicPayroll.toLocaleString()} paid`} trendDirection="neutral" />
                <StatCard title="Outstanding Invoices" value={`$${outstandingInvoices.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Open balances ledger" trend="Awaiting Customer" trendDirection="up" />
                <StatCard title="Net Profit Margin" value={`$${dynamicNetProfit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description={`Margin: ${dynamicMargin}%`} trend={`Revenue: $${dynamicRevenue.toLocaleString()}`} trendDirection="up" />
              </div>

              {/* Bottom 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`$${dynamicRevenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="From paid shipper invoices" trend="Revenue" trendDirection="up" />
                <StatCard title="Total Expenses" value={`$${dynamicExpenses.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Payroll + Fuel + Maintenance" trend="Costs" trendDirection="neutral" />
                <StatCard title="Gross Profit" value={`$${dynamicGrossProfit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="After labour costs" trend="Before overheads" trendDirection="up" />
                <StatCard title="Contractor Pay" value={`$${dynamicContractor.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Subcontractor settlements" trend="Brokerage costs" trendDirection="neutral" />
              </div>

              {/* Quick Actions Strip */}
              <div className="glass rounded-2xl p-4 border border-slate-200">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase mr-2">Quick Actions:</span>
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => { setLedgerType('Invoice'); setAddModalOpen(true); }}>New Invoice</Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast('Credit note raised and applied to customer account.')}>Raise Credit Note</Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast('Factoring application submitted to finance provider.')}>Submit Factoring</Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast('Manual payment record logged to ledger.')}>Record Payment</Button>
                  <Button size="sm" variant="danger" onClick={() => triggerToast('Bad debt written off and flagged in ledger.')}>Write Off Bad Debt</Button>
                  <Button size="sm" variant="secondary" disabled={isRestricted} onClick={() => handleAction('processAllPayroll', null, 'Payroll run initiated for all pending workers.')}>Run Payroll</Button>
                </div>
              </div>

              {/* Cost Categories P&L breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Fuel Cost Category</span>
                    <span className="text-[10px] text-red-400 font-bold font-mono">
                      {dynamicExpenses > 0 ? Math.round((dynamicFuel / dynamicExpenses) * 100) : 0}% of expenses
                    </span>
                  </div>
                  <strong className="text-slate-900 text-xl font-black block">${dynamicFuel.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>
                  <MiniChart type="bar" data={[2100, 2400, 2300, 2500, dynamicFuel > 0 ? dynamicFuel : 2790]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'Current']} />
                </div>
                
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Driver Wages & Payroll</span>
                    <span className="text-[10px] text-brand-400 font-bold font-mono">
                      {dynamicExpenses > 0 ? Math.round((dynamicPayroll / dynamicExpenses) * 100) : 0}% of expenses
                    </span>
                  </div>
                  <strong className="text-slate-900 text-xl font-black block">${dynamicPayroll.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>
                  <MiniChart type="line" data={[3200, 3400, 3600, 3800, dynamicPayroll > 0 ? dynamicPayroll : 4100]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'Current']} />
                </div>
                
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Vehicle Maintenance</span>
                    <span className="text-[10px] text-yellow-500 font-bold font-mono">
                      {dynamicExpenses > 0 ? Math.round((dynamicMaintenance / dynamicExpenses) * 100) : 0}% of expenses
                    </span>
                  </div>
                  <strong className="text-slate-900 text-xl font-black block">${dynamicMaintenance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>
                  <MiniChart type="bar" data={[1200, 1500, 1100, 1400, dynamicMaintenance > 0 ? dynamicMaintenance : 1600]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'Current']} />
                </div>
              </div>

              <div className="glass rounded-2xl p-5 border border-slate-200 text-left">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3">Weekly Net Cash Inflow (USD)</h3>
                <MiniChart type="line" data={[12000, 16000, 14000, 18500, 22000, dynamicRevenue]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Current']} />
              </div>
            </div>
          )}

          {/* Invoice Review Screen */}
          {activeTab === 'invoice-review' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Invoice Review (Drafts)</h3>
                  <p className="text-xs text-slate-450 mt-1">Inspect draft invoices generated automatically from completed stops and POD uploads.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Opening full audit manifest for invoice.")}>
                    Review Invoice
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Opening inline invoice editor panel.")}>
                    Edit Invoice
                  </Button>
                  <Button size="sm" variant="primary" disabled={isRestricted} onClick={() => handleAction('approveInvoice', selectedInvoice || invoices.find(i=>i.status==='Draft')?.id, 'Invoice approved and moved to Sent queue.')}>
                    Approve Invoice
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'id', label: 'Draft ID', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.id}</span> },
                { key: 'customer', label: 'Shipper Customer', render: (row) => <span className="text-slate-600 font-semibold">{row.customer}</span> },
                { key: 'loadId', label: 'Load ID', render: (row) => <span className="font-mono">{row.loadId}</span> },
                { key: 'amount', label: 'Total Amount', render: (row) => <span className="font-mono font-bold text-slate-700">{row.amount}</span> },
                { key: 'gst', label: 'GST (10%)', render: (row) => <span className="font-mono text-slate-500">{row.gst}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={applySearch(invoices.filter(i => i.status === 'Draft'))} />
            </div>
          )}

          {/* Sent Invoices Screen */}
          {activeTab === 'sent-invoices' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Sent Invoices Ledger</h3>
                  <p className="text-xs text-slate-450 mt-1">Audit dispatched invoices, track aging, export tax documents, and issue statements.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" disabled={isRestricted} onClick={() => handleAction('sendInvoice', invoices.find(i=>i.status==='Sent')?.id, 'Re-sent invoice mailer to shipper.')}>
                    Send Invoice
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleExport('PDF Invoice')}>
                    Export PDF
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleExport('Monthly Statement')}>
                    Send Statement
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'id', label: 'Invoice ID', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.id}</span> },
                { key: 'customer', label: 'Shipper Customer', render: (row) => <span className="text-slate-600 font-semibold">{row.customer}</span> },
                { key: 'amount', label: 'Total Amount', render: (row) => <span className="font-mono font-bold text-slate-700">{row.amount}</span> },
                { key: 'dueDate', label: 'Due Date', render: (row) => <span className="font-mono text-slate-500">{row.dueDate}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={[
                { id: 'INV-3981', customer: 'Global Retail Corp', amount: '$1,200.00', dueDate: '07/18/2026', status: 'Sent' },
                { id: 'INV-3982', customer: 'Vance Refrigeration', amount: '$850.00', dueDate: '07/15/2026', status: 'Sent' }
              ]} />
            </div>
          )}

          {/* Payments Screen */}
          {activeTab === 'payments' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Payments Reconciliation</h3>
                  <p className="text-xs text-slate-450 mt-1">Record incoming client check deposits, match bank transactions, and cancel bad debts.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" disabled={isRestricted} onClick={() => handleAction('recordPayment', invoices.find(i=>i.status==='Sent')?.id, 'Invoice settled.')}>
                    Mark Paid
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Manual payment record logged.")}>
                    Record Payment
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => triggerToast("Reconciled against bank deposit.")}>
                    Match Payment to Invoice
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => triggerToast("Invoice voided and marked Cancelled.")}>
                    Cancel Invoice
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'id', label: 'Payment ID', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.id}</span> },
                { key: 'customer', label: 'Customer', render: (row) => <span className="text-slate-600 font-semibold">{row.customer}</span> },
                { key: 'amount', label: 'Settled Amount', render: (row) => <span className="font-mono font-bold text-emerald-400">{row.amount}</span> },
                { key: 'method', label: 'Method', render: (row) => <span>{row.method}</span> },
                { key: 'status', label: 'Status', render: () => <span className="text-emerald-450 font-bold">Cleared</span> }
              ]} data={[
                { id: 'PAY-1002', customer: 'Global Retail Corp', amount: '$1,200.00', method: 'Direct Deposit EFT' },
                { id: 'PAY-1003', customer: 'Vance Refrigeration', amount: '$850.00', method: 'Credit Card checkout' }
              ]} />
            </div>
          )}

          {/* Profit & Loss Screen */}
          {activeTab === 'p-l' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Profit & Loss (P&L) Ledger Statement</h3>
                  <p className="text-xs text-slate-450 mt-1">Review revenue streams, employee payroll, contractor pay, fuel cards, and vehicle costing.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleExport('P&L Spreadsheet')}>
                    View P&L
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("GST BAS tax sheet compiled.")}>
                    Review GST
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("PAYG payroll withholding sheets audited.")}>
                    Review PAYG
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Auditing pending operational expense receipts.")}>
                    Review Expense
                  </Button>
                  <Button size="sm" variant="primary" disabled={isRestricted} onClick={() => handleAction('approveExpense', expenses.find(e=>e.status==='Pending')?.id, 'Expense approved and posted to general ledger.')}>
                    Approve Expense
                  </Button>
                  <Button size="sm" variant="success" onClick={() => triggerToast("AI OCR receipt scan confirmed.")}>
                    Approve AI Receipt
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => triggerToast("AI OCR receipt scan rejected.")}>
                    Reject AI Receipt
                  </Button>
                  <Button size="sm" variant="primary" disabled={isRestricted} onClick={() => handleAction('processContractorPay', payroll.find(p=>p.workerType==='Driver' && p.status==='Pending')?.id, 'Brokerage contractor pay run executed.')}>
                    Process Contractor Pay
                  </Button>
                  <Button size="sm" variant="primary" disabled={isRestricted} onClick={() => handleAction('processEmployeePay', payroll.find(p=>p.workerType==='Employee' && p.status==='Pending')?.id, 'Depot employee salary deposits cleared.')}>
                    Process Employee Pay
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Payroll bank files exported.")}>
                    Export Payroll
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Analyzing load-wise profitability ratios.")}>
                    View Load Profit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Analyzing vehicle-wise cost centers.")}>
                    View Vehicle Costs
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Dynamic Revenue" value={`$${dynamicRevenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Paid shipper invoices" progress={100} />
                <StatCard title="Total Expenses" value={`$${dynamicExpenses.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Payroll, Fuel, Maintenance" progress={75} />
                <StatCard title="Gross Margin" value={`$${dynamicGrossProfit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description="Trips profitability" progress={85} />
                <StatCard title="Net Profit Margin" value={`$${dynamicNetProfit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} description={`Margin: ${dynamicMargin}%`} progress={95} />
              </div>
            </div>
          )}

          {/* Invoices List */}
          {activeTab === 'invoices' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              
              {/* Sub tabs list */}
              <div className="flex border-b border-slate-200/45 pb-px text-xs font-bold gap-4 text-left mb-2">
                <button
                  type="button"
                  onClick={() => setInvoicesSubTab('all')}
                  className={`pb-2 transition-colors cursor-pointer ${invoicesSubTab === 'all' ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  All Invoices & Ledgers
                </button>
                <button
                  type="button"
                  onClick={() => setInvoicesSubTab('review')}
                  className={`pb-2 transition-colors cursor-pointer ${invoicesSubTab === 'review' ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Invoice Review (Drafts)
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {invoicesSubTab === 'review' ? 'Draft Invoices Awaiting Review' : 'Shippers invoice ledger'}
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} className="w-full sm:max-w-[200px]" />
                  <SelectInput value={filterType} onChange={(e) => setFilterType(e.target.value)} options={[
                    { value: '', label: 'All Ledgers' },
                    { value: 'Invoice', label: 'Shipper Invoices' },
                    { value: 'Driver Pay', label: 'Driver Pay' },
                    { value: 'Factoring', label: 'Factoring Funding' }
                  ]} className="w-full sm:max-w-[150px]" />
                </div>
              </div>

              {filteredLedgers.length === 0 ? (
                <EmptyState title="No invoices found" description="No matched invoice records match filters." icon={Database} actionLabel="Add Entry" onAction={() => setAddModalOpen(true)} />
              ) : (
                <>
                  <DataTable columns={[
                    { key: 'type', label: 'Type', render: (row) => <span className={`font-extrabold ${row.type === 'Invoice' ? 'text-emerald-400' : 'text-brand-400'}`}>{row.type}</span> },
                    { key: 'payee', label: 'Payee / Customer', render: (row) => <span className="font-semibold text-slate-900">{row.payee}</span> },
                    { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono font-bold">{row.amount}</span> },
                    { key: 'date', label: 'Due Date', render: (row) => <span className="text-slate-500 font-mono text-[11px]">{row.date}</span> },
                    { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Ledger Actions', render: (row) => (
                      <div className="flex gap-2">
                        {row.status === 'Draft' && (
                          <Button size="sm" variant="primary" onClick={() => {
                            dispatch(updateLedgerStatus({ id: row.id, status: 'Paid' }));
                            triggerToast('Draft Invoice approved and marked Paid.');
                          }}>Approve & Pay</Button>
                        )}
                        {row.status === 'Pending' && (
                          <Button size="sm" variant="secondary" onClick={() => handlePayInvoice(row.id)}>Pay</Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => { setSelectedInvoice(row); setDetailsDrawerOpen(true); }}>Inspect</Button>
                      </div>
                    )}
                  ]} data={paginatedLedgers} />
                  
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          )}
          {/* Payroll & Contractor screen (Priority 6) */}
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              {/* Payroll Actions header */}
              <div className="flex flex-wrap gap-2 justify-between items-center bg-white/40 p-4 border border-slate-200/45 rounded-xl">
                <div>
                  <strong className="text-slate-900 text-xs block">Global Payroll Operations Run</strong>
                  <span className="text-[10px] text-slate-500">Calculate hours, contractor hotshot runs, and base employee salaries.</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPayRateModalOpen(true)}>
                    Configure Worker Pay Rate
                  </Button>
                  <button 
                    onClick={() => triggerToast('Global payroll items approved and locked.')}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-[11px] rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Approve Payroll
                  </button>
                  <button 
                    onClick={() => triggerToast('Bank disbursements transaction batch queued.')}
                    className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] rounded-xl font-black transition-all cursor-pointer"
                  >
                    Process Payroll
                  </button>
                  <button 
                    onClick={() => handleExport('ABA Payroll Manifest')}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-750 text-slate-700 text-[11px] rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Export Payroll
                  </button>
                </div>
              </div>

              {/* Sub tabs list */}
              <div className="flex border-b border-slate-200/45 pb-px text-xs font-bold gap-4 text-left">
                {['Driver Payroll', 'Employee Base Salaries', 'Contractor Settlements', 'Payroll History'].map(st => (
                  <button 
                    key={st}
                    onClick={() => setPayrollTab(st)}
                    className={`capitalize pb-2 transition-colors cursor-pointer ${payrollTab === st ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {payrollTab === 'Driver Payroll' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Driver Pay & Trip Commissions</h3>
                  
                  <DataTable columns={[
                    { key: 'driver', label: 'Driver Node', render: (row) => <span className="font-extrabold text-slate-900">{row.workerName}</span> },
                    { key: 'trips', label: 'Trips Done', render: (row) => <span className="font-mono text-xs">{row.trips} runs</span> },
                    { key: 'amount', label: 'Pay Due', render: (row) => <span className="font-mono font-bold text-brand-400">{row.amount}</span> },
                    { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Disburse', render: (row) => (
                      row.status === 'Pending' ? (
                        <Button size="sm" variant="secondary" onClick={() => handlePayDriver(row.id)}>Pay Direct</Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-550">Direct Deposited</span>
                      )
                    )}
                  ]} data={driverPayroll || []} />
                </div>
              )}

              {payrollTab === 'Employee Base Salaries' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Office staff & Yard Salaries</h3>
                  
                  <DataTable columns={[
                    { key: 'name', label: 'Employee', render: (row) => <span className="font-extrabold text-slate-900">{row.workerName}</span> },
                    { key: 'role', label: 'Position', render: (row) => <span className="text-slate-500">{row.position}</span> },
                    { key: 'rate', label: 'Hourly/Salaried', render: (row) => <span className="font-mono text-xs">{row.rateType}</span> },
                    { key: 'salary', label: 'Salary Net', render: (row) => <span className="font-mono font-bold text-slate-600">{row.amount}</span> },
                    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Disburse', render: (row) => (
                      row.status === 'Pending' ? (
                        <Button size="sm" variant="secondary" onClick={() => handlePayEmployee(row.id)}>Pay Staff</Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-550">Direct Deposited</span>
                      )
                    )}
                  ]} data={employeePayments || []} />
                </div>
              )}

              {payrollTab === 'Contractor Settlements' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Subcontractor Brokerage settlements</h3>
                  <DataTable columns={[
                    { key: 'contractor', label: 'External Contractor Service', render: (row) => <span className="font-extrabold text-slate-900">{row.workerName}</span> },
                    { key: 'amount', label: 'Settlement Amount', render: (row) => <span className="font-mono font-bold text-brand-400">{row.amount}</span> },
                    { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Disburse', render: (row) => (
                      row.status === 'Pending' ? (
                        <Button size="sm" variant="secondary" onClick={() => handlePayContractor(row.id)}>Pay Broker</Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-550">Disbursed</span>
                      )
                    )}
                  ]} data={contractorPayments || []} />
                </div>
              )}

              {payrollTab === 'Payroll History' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Processed Payroll & Payments History</h3>
                  <DataTable columns={[
                    { key: 'id', label: 'Payment ID', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.id}</span> },
                    { key: 'workerName', label: 'Worker / Payee', render: (row) => <span className="font-semibold text-slate-700">{row.workerName}</span> },
                    { key: 'workerType', label: 'Worker Type', render: (row) => <span className="text-slate-500">{row.workerType}</span> },
                    { key: 'amount', label: 'Paid Amount', render: (row) => <span className="font-mono font-bold text-emerald-400">{row.amount}</span> },
                    { key: 'paymentDate', label: 'Payment Date', render: (row) => <span className="font-mono text-slate-500 text-xs">{row.paymentDate}</span> },
                    { key: 'paymentMethod', label: 'Method', render: (row) => <span className="text-xs">{row.paymentMethod}</span> },
                    { key: 'processedBy', label: 'Processed By', render: (row) => <span className="text-slate-455 text-xs">{row.processedBy}</span> },
                    { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
                  ]} data={[
                    ...(driverPayroll || []),
                    ...(employeePayments || []),
                    ...(contractorPayments || [])
                  ].filter(p => p.status === 'Paid')} />
                </div>
              )}

              {/* Live Shift logs logged from Start/Finish Work */}
              <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Time Clock / Shift logs</h4>
                  <p className="text-[10px] text-slate-500">Recorded shifts from Start/Finish Work widgets.</p>
                </div>
                {shiftState.history.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center">No shift log entries recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {shiftState.history.map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-white/40 border border-slate-200/45 rounded-xl flex justify-between text-xs">
                        <div>
                          <strong className="text-slate-700 block font-bold">{log.role} Shift</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{log.date} • {log.startTime} - {log.endTime}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-brand-400 font-bold font-mono">{log.durationMin} min</span>
                          <span className="text-[10px] text-slate-500 block">Costed: ${(log.durationMin * 0.45).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expense Management Screen */}

          {activeTab === 'contractor-pay' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-between items-center bg-white/40 p-4 border border-slate-200/45 rounded-xl">
                <div>
                  <strong className="text-slate-900 text-xs block">Contractor Payouts</strong>
                  <span className="text-[10px] text-slate-500">Manage and disburse external contractor settlements.</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport('ABA Payroll Manifest')} className="px-3.5 py-1.5 bg-white hover:bg-slate-750 text-slate-700 text-[11px] rounded-xl font-bold transition-all cursor-pointer" disabled={isRestricted}>Export Manifest</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Subcontractor Brokerage settlements</h3>
                <DataTable columns={[
                  { key: 'contractor', label: 'External Contractor Service', render: (row) => <span className="font-extrabold text-slate-900">{row.workerName}</span> },
                  { key: 'amount', label: 'Settlement Amount', render: (row) => <span className="font-mono font-bold text-brand-400">{row.amount}</span> },
                  { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Disburse', render: (row) => (
                    row.status === 'Pending' ? (
                      <Button size="sm" variant="secondary" disabled={isRestricted} onClick={() => handlePayContractor(row.id)}>Pay Broker</Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-550">Disbursed</span>
                    )
                  )}
                ]} data={applySearch(contractorPayments || [])} />
              </div>
            </div>
          )}

          {activeTab === 'employee-pay' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-between items-center bg-white/40 p-4 border border-slate-200/45 rounded-xl">
                <div>
                  <strong className="text-slate-900 text-xs block">Employee Base Salaries</strong>
                  <span className="text-[10px] text-slate-500">Manage office staff & yard salaries.</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport('ABA Payroll Manifest')} className="px-3.5 py-1.5 bg-white hover:bg-slate-750 text-slate-700 text-[11px] rounded-xl font-bold transition-all cursor-pointer" disabled={isRestricted}>Export Manifest</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Office staff & Yard Salaries</h3>
                <DataTable columns={[
                  { key: 'name', label: 'Employee', render: (row) => <span className="font-extrabold text-slate-900">{row.workerName}</span> },
                  { key: 'role', label: 'Position', render: (row) => <span className="text-slate-500">{row.position}</span> },
                  { key: 'rate', label: 'Hourly/Salaried', render: (row) => <span className="font-mono text-xs">{row.rateType}</span> },
                  { key: 'salary', label: 'Salary Net', render: (row) => <span className="font-mono font-bold text-slate-600">{row.amount}</span> },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Disburse', render: (row) => (
                    row.status === 'Pending' ? (
                      <Button size="sm" variant="secondary" disabled={isRestricted} onClick={() => handlePayEmployee(row.id)}>Pay Staff</Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-550">Direct Deposited</span>
                    )
                  )}
                ]} data={applySearch(employeePayments || [])} />
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-between items-center bg-white/40 p-4 border border-slate-200/45 rounded-xl">
                <div>
                  <strong className="text-slate-900 text-xs block">Enterprise Reports Center</strong>
                  <span className="text-[10px] text-slate-500">Generate, view, and export all financial and operational reports.</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport('Master Financial Report')} className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] rounded-xl font-black transition-all cursor-pointer" disabled={isRestricted}>Generate Full Report</button>
                  <button onClick={() => handleExport('Audit Trail PDF')} className="px-3.5 py-1.5 bg-white hover:bg-slate-750 text-slate-700 text-[11px] rounded-xl font-bold transition-all cursor-pointer" disabled={isRestricted}>Export Audit Trail</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { title: 'Tax Report', desc: 'Q2 GST and PAYG Summaries', action: 'Tax Report PDF' },
                   { title: 'Profitability Report', desc: 'Per-load net margin & Vehicle Costs', action: 'Costing Reports' },
                   { title: 'P&L Statement', desc: 'Income vs Expense master ledger', action: 'P&L Spreadsheet' },
                   { title: 'Payroll Manifest', desc: 'Consolidated driver & employee pay', action: 'ABA Payroll Manifest' }
                 ].map((r, i) => (
                    <div key={i} className="glass p-4 rounded-xl border border-slate-200 flex flex-col justify-between h-32 text-left">
                       <div>
                         <h4 className="text-sm font-extrabold text-slate-900">{r.title}</h4>
                         <span className="text-[10px] text-slate-500">{r.desc}</span>
                       </div>
                       <Button size="sm" variant="secondary" onClick={() => handleExport(r.action)} className="mt-2 w-full text-xs">Download CSV</Button>
                    </div>
                 ))}
              </div>
              <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 mt-6">
                <h3 className="text-sm font-extrabold text-slate-900">Generated Reports History</h3>
                <DataTable columns={[
                  { key: 'id', label: 'Report ID', render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.id}</span> },
                  { key: 'type', label: 'Report Type', render: (row) => <span className="text-slate-600 font-semibold">{row.type}</span> },
                  { key: 'generatedBy', label: 'Generated By', render: (row) => <span className="text-slate-500 text-xs">{row.generatedBy}</span> },
                  { key: 'date', label: 'Generation Date', render: (row) => <span className="font-mono text-xs text-slate-500">{row.date}</span> },
                  { key: 'actions', label: 'Action', render: (row) => (
                      <Button size="sm" variant="outline" onClick={() => handleExport(row.type)}>Download</Button>
                  )}
                ]} data={applySearch(reports || [])} />
              </div>
            </div>
          )}


          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Reports Panel (Safe Mode)</h3>
                <p className="text-slate-500 text-xs">If you see this, the previous code caused a crash.</p>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Operational Expenses Ledger</h3>
              <DataTable columns={[
                { key: 'payee', label: 'Expense Payee', render: (row) => <span className="font-extrabold text-slate-900">{row.payee}</span> },
                { key: 'type', label: 'Type', render: (row) => <span className="text-slate-600 font-semibold">{row.type}</span> },
                { key: 'amount', label: 'Expense Amount', render: (row) => <span className="font-mono font-bold text-slate-600">{row.amount}</span> },
                { key: 'date', label: 'Logged Date', render: (row) => <span className="text-slate-500 font-mono text-[11px]">{row.date}</span> }
              ]} data={localLedgers.filter(l => l.type !== 'Invoice')} />
            </div>
          )}

          {/* Vehicle Costing & Profitability Screen (Priority 7) */}
          {activeTab === 'profitability' && (
            <div className="space-y-6">
              {/* Cost breakdown cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Fuel Cost" value="$14,890.00" description="Odometer fuel card bills" progress={65} />
                <StatCard title="Maintenance Costs" value="$8,420.00" description="Penske and depot service costs" progress={45} />
                <StatCard title="Registration Cost" value="$2,400.00" description="Semi-truck permit costs" progress={12} />
                <StatCard title="Insurance Premium" value="$5,100.00" description="Commercial fleet cover policy" progress={30} />
              </div>

              {/* Profitability Analysis & Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Vehicle Profitability Matrix</h3>
                  
                  <DataTable columns={[
                    { key: 'plate', label: 'Vehicle Plate', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.plate}</span> },
                    { key: 'revenue', label: 'Revenue Generated', render: (row) => <span className="text-emerald-450 font-bold font-mono">{row.revenue}</span> },
                    { key: 'expenses', label: 'Expenses (Breakdown)', render: (row) => <span className="text-red-400 font-bold font-mono">{row.expenses}</span> },
                    { key: 'profit', label: 'Net Profit Margin', render: (row) => <span className="text-brand-400 font-bold font-mono">{row.profit}</span> },
                    { key: 'margin', label: 'Margin Ratio %', render: (row) => <span className="font-extrabold text-slate-900 font-mono">{row.margin}</span> }
                  ]} data={vehicleProfitability} />
                </div>

                {/* Simulated Cost breakdown visual list */}
                <div className="lg:col-span-4 glass rounded-2xl p-5 border border-slate-200 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Cost Distribution Analysis</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mb-4">Breakdown of operational spend across vehicles.</p>
                  </div>
                  
                  <div className="space-y-4 my-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-500">
                        <span>Fuel Ingestion (Diesel)</span>
                        <span>47%</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-500 h-full w-[47%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-500">
                        <span>Scheduled Maintenance</span>
                        <span>28%</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[28%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-500">
                        <span>Fleet Insurance Policies</span>
                        <span>16%</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-400 h-full w-[16%]" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleExport('Costing Reports')}
                    className="w-full py-2 bg-white hover:bg-slate-750 text-slate-700 text-xs rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Generate Cost Reports
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GST / PAYG Module (Priority 8) */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              {/* Period filters */}
              <div className="flex flex-wrap gap-3 justify-between items-center bg-white/40 p-4 border border-slate-200/45 rounded-xl text-xs font-bold">
                <div className="flex gap-2">
                  {['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'].map(q => (
                    <button 
                      key={q}
                      onClick={() => triggerToast(`Tax period filtered: ${q}`)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 text-slate-600 rounded-lg cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => handleExport('Tax Report PDF')}
                  className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-lg font-black cursor-pointer"
                >
                  Export Tax Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GST Summary */}
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">GST Summary (Goods & Services Tax)</h3>
                  <div className="space-y-3.5 text-xs text-slate-500">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Total Revenue Sales (GST Inc)</span>
                      <strong className="text-slate-900 font-mono font-bold">$48,250.00</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-emerald-450">
                      <span>GST Collected on Invoices (10%)</span>
                      <strong className="font-mono font-bold">$4,825.00</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-red-400">
                      <span>GST Paid on Fleet Purchases (10%)</span>
                      <strong className="font-mono font-bold">$2,140.00</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 text-sm font-black text-brand-400">
                      <span>Net GST Refundable/Payable</span>
                      <strong className="font-mono font-bold">$2,685.00 due</strong>
                    </div>
                  </div>
                </div>

                {/* PAYG Summary */}
                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">PAYG Summary (Pay As You Go Tax)</h3>
                  <div className="space-y-3.5 text-xs text-slate-500">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Gross Employee Wages paid</span>
                      <strong className="text-slate-900 font-mono font-bold">$12,400.00</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-brand-450">
                      <span>PAYG Tax Withheld from Salaries</span>
                      <strong className="text-brand-400 font-mono font-bold">$2,840.00</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Superannuation Employer contributions (11.5%)</span>
                      <strong className="text-slate-900 font-mono font-bold">$1,426.00</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 text-sm font-black text-brand-400">
                      <span>Total PAYG Remittance Liabilities</span>
                      <strong className="font-mono font-bold">$4,266.00 due</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Tax Ledger & Receipts Ingestion Tab */}
          {activeTab === 'ai-ledger' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: AI Receipts Queue */}
              <div className="lg:col-span-5 glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">AI Receipts Ingestion Queue</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Verify extracted odometer readings, fuel cards, and supplier GST taxes.</p>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {aiReceipts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs italic">
                      No pending receipts to verify. All logged to ledger.
                    </div>
                  ) : (
                    aiReceipts.map((receipt) => (
                      <div key={receipt.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-900 block font-bold">{receipt.source}</strong>
                          <span className="text-[9px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-bold">
                            96% Conf
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Item parsed</span>
                            <span className="text-slate-900 font-semibold">{receipt.parsedData.item}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Fuel Qty</span>
                            <span className="text-slate-900 font-semibold font-mono">{receipt.parsedData.fuelQty}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">GST Tax</span>
                            <span className="text-slate-700 font-semibold font-mono">{receipt.parsedData.gst}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Total Bill</span>
                            <span className="text-emerald-400 font-bold font-mono">{receipt.parsedData.total}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleConfirmReceipt(receipt)}
                            className="flex-grow py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] rounded-lg font-black transition-colors cursor-pointer"
                          >
                            Confirm & Log Tax
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              triggerToast('Receipt details loaded for editing.');
                            }}
                            className="px-3 py-2 bg-white hover:bg-slate-700 text-slate-600 text-[11px] rounded-lg font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Yearly/Monthly Tax Spreadsheet Ledger Preview */}
              <div className="lg:col-span-7 glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Yearly & Monthly Tax Spreadsheet</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Auto-generated ledger including GST, fuel tax, and payroll records.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast('Tax spreadsheet exported as XLSX.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-brand-500/40 text-slate-700 text-xs rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Export XLSX
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Net Cost</th>
                        <th className="py-2.5 px-3">GST Tax</th>
                        <th className="py-2.5 px-3">Total Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#23324C]/35">
                      {ledgerSpreadsheet.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-900/20 text-slate-500">
                          <td className="py-3 px-3 font-mono text-[11px]">{row.date}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{row.desc}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              row.category === 'Fuel' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                              row.category === 'Wages' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 
                              'bg-yellow-500/10 text-yellow-405 border border-yellow-500/20'
                            }`}>
                              {row.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono">{row.amount}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{row.gst}</td>
                          <td className="py-3 px-3 font-mono text-slate-900 font-bold">{row.total}</td>
                          <td className="py-3 px-3 text-[10px] text-slate-500 italic">{row.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rates' && (
            <div className="space-y-6 text-left">
              {/* Rate categories navigation */}
              <div className="flex border-b border-slate-200/45 pb-px text-xs font-bold gap-4">
                {[
                  { id: 'customer', label: 'Customer Rate Settings' },
                  { id: 'carrier', label: 'Carrier Rate Settings' },
                  { id: 'fuel', label: 'Fuel Surcharges' },
                  { id: 'accessorial', label: 'Accessorial Charges' }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    onClick={() => setRatesSubTab(subTab.id)}
                    className={`pb-2.5 cursor-pointer transition-colors ${
                      ratesSubTab === subTab.id ? 'text-brand-500 border-b-2 border-brand-500 font-extrabold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {ratesSubTab === 'customer' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Shipper Customer Rates Matrix</h3>
                  <DataTable columns={[
                    { key: 'name', label: 'Customer Name', render: (row) => <span className="font-extrabold text-slate-900">{row.name}</span> },
                    { key: 'vehicleClass', label: 'Freight Class', render: (row) => <span className="text-xs text-slate-600">{row.vehicleClass}</span> },
                    { key: 'flatRate', label: 'Flat Booking Fee', render: (row) => <span className="font-mono">{row.flatRate}</span> },
                    { key: 'kmRate', label: 'Per Km Rate', render: (row) => <span className="font-mono text-brand-400">{row.kmRate}</span> },
                    { key: 'palletRate', label: 'Per Pallet Unit', render: (row) => <span className="font-mono">{row.palletRate}</span> },
                    { key: 'actions', label: 'Actions', render: (row) => (
                      <button 
                        onClick={() => {
                          setCustomerRates(customerRates.filter(c => c.id !== row.id));
                          triggerToast(`Deleted rate settings for ${row.name}`, 'warning');
                        }}
                        className="p-1 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  ]} data={customerRates} />
                </div>
              )}

              {ratesSubTab === 'carrier' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Contractor Carrier Rates</h3>
                  <DataTable columns={[
                    { key: 'name', label: 'Carrier Contractor', render: (row) => <span className="font-extrabold text-slate-900">{row.name}</span> },
                    { key: 'flatRate', label: 'Flat Fee', render: (row) => <span className="font-mono">{row.flatRate}</span> },
                    { key: 'costPerKm', label: 'Cost Per Km', render: (row) => <span className="font-mono text-brand-400">{row.costPerKm}</span> },
                    { key: 'actions', label: 'Actions', render: (row) => (
                      <button 
                        onClick={() => {
                          setCarrierRates(carrierRates.filter(c => c.id !== row.id));
                          triggerToast(`Deleted rate for ${row.name}`, 'warning');
                        }}
                        className="p-1 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  ]} data={carrierRates} />
                </div>
              )}

              {ratesSubTab === 'fuel' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Fuel Surcharge Matrices</h3>
                  <DataTable columns={[
                    { key: 'threshold', label: 'Diesel Index Threshold', render: (row) => <span className="font-extrabold text-slate-900">{row.threshold}</span> },
                    { key: 'surcharge', label: 'Surcharge Percentage', render: (row) => <span className="font-mono text-brand-400 font-bold">{row.surcharge}</span> },
                    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Actions', render: (row) => (
                      <button 
                        onClick={() => {
                          setFuelSurcharges(fuelSurcharges.filter(f => f.id !== row.id));
                          triggerToast(`Deleted fuel threshold ${row.threshold}`, 'warning');
                        }}
                        className="p-1 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  ]} data={fuelSurcharges} />
                </div>
              )}

              {ratesSubTab === 'accessorial' && (
                <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Accessorial Charges & Fees</h3>
                  <DataTable columns={[
                    { key: 'type', label: 'Accessorial Service Type', render: (row) => <span className="font-extrabold text-slate-900">{row.type}</span> },
                    { key: 'fee', label: 'Standard Charge Rate', render: (row) => <span className="font-mono text-brand-400 font-bold">{row.fee}</span> },
                    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Actions', render: (row) => (
                      <button 
                        onClick={() => {
                          setAccessorials(accessorials.filter(a => a.id !== row.id));
                          triggerToast(`Deleted accessorial fee for ${row.type}`, 'warning');
                        }}
                        className="p-1 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  ]} data={accessorials} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Record Ledger Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Record Financial Ledger entry">
        <form onSubmit={handleAddLedger} className="space-y-4">
          <TextInput label="Payee / Billing Customer Name" required placeholder="e.g. Memphis Shippers Inc" value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
          <TextInput label="Transaction Amount (USD)" required type="number" step="0.01" placeholder="e.g. 1420.00" value={amountVal} onChange={(e) => setAmountVal(e.target.value)} />
          <SelectInput label="Ledger Category Type" value={ledgerType} onChange={(e) => setLedgerType(e.target.value)} options={[
            { value: 'Invoice', label: 'Shipper Invoice Inflow' },
            { value: 'Driver Pay', label: 'Driver Payroll Payout' },
            { value: 'Factoring', label: 'Invoice Factoring Margin' }
          ]} />
          <Button type="submit" variant="primary" disabled={isRestricted} className="w-full">
            Save Financial Entry
          </Button>
        </form>
      </Modal>

      {/* Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title="Invoice Ledger Inspector">
        {selectedInvoice && (
          <div className="space-y-6 text-left text-slate-600 text-xs sm:text-sm">
            <div className="border-b border-slate-200 pb-3">
              <h4 className="text-base font-extrabold text-slate-900 mb-1">{selectedInvoice.payee}</h4>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Ledger Category</span>
                <strong className="text-slate-900 text-xs">{selectedInvoice.type}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Financial Amount</span>
                <span className="text-xs font-mono font-bold text-slate-700">{selectedInvoice.amount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Logged Due Date</span>
                <span className="text-xs font-mono">{selectedInvoice.date}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-200 pt-4">
              {selectedInvoice.status === 'Pending' && (
                <Button variant="primary" size="sm" onClick={() => { setDetailsDrawerOpen(false); handlePayInvoice(selectedInvoice.id); }}>
                  Disburse Payment
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setDetailsDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Record Rate Settings Modal (Priority 4) */}
      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title={`Add ${ratesSubTab === 'customer' ? 'Customer Rate' : ratesSubTab === 'carrier' ? 'Carrier Rate' : ratesSubTab === 'fuel' ? 'Fuel Surcharge' : 'Accessorial Fee'}`}>
        <form onSubmit={handleAddRate} className="space-y-4">
          <TextInput 
            label={ratesSubTab === 'customer' ? 'Customer / Shipper Name' : ratesSubTab === 'carrier' ? 'Carrier Partner Name' : ratesSubTab === 'fuel' ? 'Fuel Threshold (Index per L)' : 'Accessorial Type Name'} 
            required 
            placeholder={ratesSubTab === 'customer' ? 'e.g. Memphis Shippers Inc' : ratesSubTab === 'carrier' ? 'e.g. Apex Fuel Network' : ratesSubTab === 'fuel' ? 'e.g. $1.90/L' : 'e.g. Waiting Time'} 
            value={newRateName} 
            onChange={(e) => setNewRateName(e.target.value)} 
          />
          
          <TextInput 
            label={ratesSubTab === 'fuel' ? 'Surcharge Percentage (%)' : 'Flat Booking Fee ($)'} 
            required 
            type="number" 
            step="0.01" 
            placeholder={ratesSubTab === 'fuel' ? 'e.g. 15' : 'e.g. 250.00'} 
            value={newRateFlat} 
            onChange={(e) => setNewRateFlat(e.target.value)} 
          />

          {(ratesSubTab === 'customer' || ratesSubTab === 'carrier') && (
            <TextInput 
              label="Per Km Surcharge Rate ($)" 
              required 
              type="number" 
              step="0.01" 
              placeholder="e.g. 1.85" 
              value={newRateKm} 
              onChange={(e) => setNewRateKm(e.target.value)} 
            />
          )}

          {ratesSubTab === 'customer' && (
            <TextInput 
              label="Per Pallet Unit Charge Rate ($)" 
              required 
              type="number" 
              step="0.01" 
              placeholder="e.g. 15.00" 
              value={newRatePallet} 
              onChange={(e) => setNewRatePallet(e.target.value)} 
            />
          )}

          <Button type="submit" variant="primary" disabled={isRestricted} className="w-full">
            Save Rate Mappings
          </Button>
        </form>
      </Modal>

      {/* Configure Worker Pay Rate Modal */}
      <Modal isOpen={payRateModalOpen} onClose={() => setPayRateModalOpen(false)} title="Configure Worker Pay Rate">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            triggerToast('Worker pay rate configured successfully.');
            setPayRateModalOpen(false);
          }}
          className="space-y-4"
        >
          <SelectInput 
            label="Select Worker / Employee" 
            options={[
              { value: 'John D.', label: 'John D. (Driver)' },
              { value: 'Sarah R.', label: 'Sarah R. (Driver)' },
              { value: 'Adam K.', label: 'Adam K. (Yard Manager)' },
              { value: 'Julie B.', label: 'Julie B. (Accountant)' }
            ]} 
          />
          <SelectInput 
            label="Rate Classification Type" 
            options={[
              { value: 'Hourly', label: 'Hourly Rate ($/hr)' },
              { value: 'Per Mile', label: 'Per Mile Commission ($/mile)' },
              { value: 'Flat Run', label: 'Flat Rate per Trip Run ($/load)' }
            ]} 
          />
          <TextInput label="Rate Value Amount ($)" required placeholder="e.g. 45.00" type="number" step="0.01" />
          
          <Button type="submit" variant="primary" disabled={isRestricted} className="w-full">
            Save Pay Rate
          </Button>
        </form>
      </Modal>

    </div>
  );
}
