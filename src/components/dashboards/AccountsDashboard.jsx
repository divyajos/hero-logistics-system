import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountsData, addLedgerEntry } from '../../store/slices/accountsSlice';
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
  Trash2, Edit2, Download, TrendingUp, Users, Calendar
} from 'lucide-react';

export default function AccountsDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { ledgers, factoringCount, payrollCount, balanceDue, loading } = useSelector((state) => state.accounts);

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Selection
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form Fields
  const [payeeName, setPayeeName] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [ledgerType, setLedgerType] = useState('Invoice');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Local lists states
  const [localLedgers, setLocalLedgers] = useState([]);

  const [driverPayroll, setDriverPayroll] = useState([
    { id: 1, driver: 'John D.', trips: 14, amount: '$1,420.00', status: 'Pending' },
    { id: 2, driver: 'Sarah R.', trips: 18, amount: '$1,890.00', status: 'Pending' },
    { id: 3, driver: 'Donald S.', trips: 22, amount: '$2,200.00', status: 'Paid' }
  ]);

  const [contractorPayments, setContractorPayments] = useState([
    { id: 101, contractor: 'Apex Fuel Network', desc: 'Fleet card diesel purchase', amount: '$4,290.00', status: 'Paid' },
    { id: 102, contractor: 'Brokerage Freight Inc', desc: 'Subcontracted hotshot runs', amount: '$1,850.00', status: 'Pending' }
  ]);

  const [vehicleProfitability, setVehicleProfitability] = useState([
    { plate: 'TX-ROAD88', revenue: '$14,200', expenses: '$9,200', profit: '$5,000', margin: '35%' },
    { plate: 'IL-HAUL42', revenue: '$12,850', expenses: '$8,400', profit: '$4,450', margin: '34%' },
    { plate: 'CA-CARRI7', revenue: '$18,900', expenses: '$14,200', profit: '$4,700', margin: '24%' }
  ]);

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
    dispatch(addLedgerEntry({
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
    setDriverPayroll(driverPayroll.map(d => d.id === id ? { ...d, status: 'Paid' } : d));
    triggerToast(`Payroll run complete for driver. Direct deposit issued.`);
  };

  // Pay Contractor
  const handlePayContractor = (id) => {
    setContractorPayments(contractorPayments.map(c => c.id === id ? { ...c, status: 'Paid' } : c));
    triggerToast('Contractor payment disbursed.');
  };

  // Search & Pagination filtering
  const filteredLedgers = localLedgers.filter(l => {
    const matchesSearch = l.payee.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === '' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredLedgers.length / itemsPerPage);
  const paginatedLedgers = filteredLedgers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Accounts & Payroll • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Review invoice factoring, disburse driver paychecks, and analyze margins.</p>
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
      </div>

      {loading && localLedgers.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Factored Funding" value={`$${factoringCount.toLocaleString()}`} description="Active invoice reserves" trend="Factored" trendDirection="neutral" />
                <StatCard title="Driver Payroll" value={`${driverPayroll.filter(d => d.status === 'Pending').length} Pending`} description="Awaiting payment runs" trend={`$3,310 due`} trendDirection="neutral" />
                <StatCard title="Outstanding Shipper Invoices" value={`$${balanceDue.toLocaleString()}`} description="Open balances ledger" trend="+3 invoices" trendDirection="up" />
                <StatCard title="Total Net Cash Flow" value="$25,190" description="In/Out flow timeline" trend="+18.2%" trendDirection="up" />
              </div>

              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                <h3 className="text-sm font-extrabold text-white mb-3">Weekly Net Cash Inflow (USD)</h3>
                <MiniChart type="line" data={[12000, 16000, 14000, 18500, 22000, 25190]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
              </div>
            </div>
          )}

          {/* Invoices List */}
          {activeTab === 'invoices' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">Shippers invoice ledger</h3>
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
                <EmptyState title="No invoices resolved" description="No matched invoice records. Log a financial bill entry." icon={Database} actionLabel="Add Entry" onAction={() => setAddModalOpen(true)} />
              ) : (
                <>
                  <DataTable columns={[
                    { key: 'type', label: 'Type', render: (row) => <span className={`font-extrabold ${row.type === 'Invoice' ? 'text-emerald-400' : 'text-brand-400'}`}>{row.type}</span> },
                    { key: 'payee', label: 'Payee / Customer', render: (row) => <span className="font-semibold text-white">{row.payee}</span> },
                    { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono font-bold">{row.amount}</span> },
                    { key: 'date', label: 'Due Date', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.date}</span> },
                    { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Ledger Actions', render: (row) => (
                      <div className="flex gap-2">
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

          {/* Payroll & Contractor screen */}
          {activeTab === 'payroll' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Driver Payroll */}
              <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Driver payroll payout runs</h3>
                
                <DataTable columns={[
                  { key: 'driver', label: 'Driver', render: (row) => <span className="font-extrabold text-white">{row.driver}</span> },
                  { key: 'trips', label: 'Trips Completed', render: (row) => <span className="font-mono text-xs">{row.trips} runs</span> },
                  { key: 'amount', label: 'Salary Due', render: (row) => <span className="font-mono font-bold text-slate-300">{row.amount}</span> },
                  { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Payroll Actions', render: (row) => (
                    row.status === 'Pending' ? (
                      <Button size="sm" variant="secondary" onClick={() => handlePayDriver(row.id)}>Pay Direct</Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">Paid Direct</span>
                    )
                  )}
                ]} data={driverPayroll} />
              </div>

              {/* Contractor Payouts */}
              <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Contractor & Broker Settlements</h3>

                <DataTable columns={[
                  { key: 'contractor', label: 'Contractor Service', render: (row) => <span className="font-extrabold text-white">{row.contractor}</span> },
                  { key: 'amount', label: 'Settlement Amount', render: (row) => <span className="font-mono font-bold text-slate-300">{row.amount}</span> },
                  { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Disburse', render: (row) => (
                    row.status === 'Pending' ? (
                      <Button size="sm" variant="secondary" onClick={() => handlePayContractor(row.id)}>Pay Broker</Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">Settled</span>
                    )
                  )}
                ]} data={contractorPayments} />
              </div>
            </div>
          )}

          {/* Expense Management Screen */}
          {activeTab === 'expenses' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Operational Expenses Ledger</h3>
              <DataTable columns={[
                { key: 'payee', label: 'Expense Payee', render: (row) => <span className="font-extrabold text-white">{row.payee}</span> },
                { key: 'type', label: 'Type', render: (row) => <span className="text-slate-300 font-semibold">{row.type}</span> },
                { key: 'amount', label: 'Expense Amount', render: (row) => <span className="font-mono font-bold text-slate-300">{row.amount}</span> },
                { key: 'date', label: 'Logged Date', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.date}</span> }
              ]} data={localLedgers.filter(l => l.type !== 'Invoice')} />
            </div>
          )}

          {/* Vehicle Profitability Screen */}
          {activeTab === 'profitability' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Vehicle Margins Profitability</h3>
              
              <DataTable columns={[
                { key: 'plate', label: 'Vehicle Plate', render: (row) => <span className="font-mono font-extrabold text-white">{row.plate}</span> },
                { key: 'revenue', label: 'Revenue Generated', render: (row) => <span className="text-emerald-400 font-bold font-mono">{row.revenue}</span> },
                { key: 'expenses', label: 'Expenses Incurred', render: (row) => <span className="text-red-400 font-bold font-mono">{row.expenses}</span> },
                { key: 'profit', label: 'Net Profit Margin', render: (row) => <span className="text-brand-400 font-bold font-mono">{row.profit}</span> },
                { key: 'margin', label: 'Margin % Ratio', render: (row) => <span className="font-extrabold text-white font-mono">{row.margin}</span> }
              ]} data={vehicleProfitability} />
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
          <Button type="submit" variant="primary" className="w-full">
            Save Financial Entry
          </Button>
        </form>
      </Modal>

      {/* Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title="Invoice Ledger Inspector">
        {selectedInvoice && (
          <div className="space-y-6 text-left text-slate-300 text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/60 pb-3">
              <h4 className="text-base font-extrabold text-white mb-1">{selectedInvoice.payee}</h4>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Ledger Category</span>
                <strong className="text-white text-xs">{selectedInvoice.type}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Financial Amount</span>
                <span className="text-xs font-mono font-bold text-slate-200">{selectedInvoice.amount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Logged Due Date</span>
                <span className="text-xs font-mono">{selectedInvoice.date}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4">
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

    </div>
  );
}
