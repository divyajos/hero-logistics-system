import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCustomerLoads, createBooking, 
  fetchCustomerInvoices, fetchCustomerTransactions, payCustomerInvoice 
} from '../../store/slices/customersSlice';
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
import FileUploader from '../common/FileUploader';
import { TableSkeleton } from '../common/Skeletons';
import { Layers, MapPin, Database, Award, Plus, Check, CreditCard, FileText, Send, HelpCircle } from 'lucide-react';

export default function CustomerDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { 
    customerLoads: shipments, 
    customerInvoices: invoices, 
    customerTransactions: transactions, 
    loading 
  } = useSelector((state) => state.customers);

  // Modals & Drawers
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [supportDrawerOpen, setSupportDrawerOpen] = useState(false);

  // Selection
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form Fields
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [routePath, setRoutePath] = useState('');

  // Payment Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // Support Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  // Local lists states
  const [reminderStates, setReminderStates] = useState({});
  const [tickets, setTickets] = useState([
    { id: 201, subject: 'Shipment #LD-9411 Status Delay', status: 'Open', date: '06/19/2026' }
  ]);

  const [documents, setDocuments] = useState([
    { name: 'Signed_BOL_LD-9411.pdf', size: '245 KB', category: 'Bill of Lading' },
    { name: 'Invoice_Receipt_INV-3981.pdf', size: '120 KB', category: 'Tax Invoice' }
  ]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchCustomerLoads());
    dispatch(fetchCustomerInvoices());
    dispatch(fetchCustomerTransactions());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Book Load Form
  const handleBookLoadSubmit = (e) => {
    e.preventDefault();
    if (!cargoName || !cargoWeight || !routePath) {
      triggerToast('Complete all shipment details.', 'error');
      return;
    }
    dispatch(createBooking({
      cargo: cargoName,
      weight: `${parseFloat(cargoWeight).toLocaleString()} lbs`,
      route: routePath
    }));

    setCargoName('');
    setCargoWeight('');
    setRoutePath('');
    setBookModalOpen(false);
    triggerToast('Delivery cargo booked successfully! Awaiting carrier dispatch.');
  };

  // Invoice Checkout Submit
  const handlePaymentCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry) return;
    dispatch(payCustomerInvoice({ id: selectedInvoice.id, paymentMethod: 'Visa Card Credit' }));
    setPaymentModalOpen(false);
    setCardNumber('');
    setCardExpiry('');
    triggerToast(`Payment authorized. Invoice ${selectedInvoice.id} settled.`);
  };

  // Support Ticket Submit
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    const newT = {
      id: Date.now(),
      subject: ticketSubject,
      status: 'Open',
      date: new Date().toLocaleDateString()
    };
    setTickets([newT, ...tickets]);
    setTicketSubject('');
    setTicketMsg('');
    setSupportDrawerOpen(false);
    triggerToast('Support request registered. Developer logs created.');
  };

  // Filters & Page logic
  const filteredShipments = shipments.filter(s => {
    const itemRoute = s.route || '';
    const itemCargo = s.cargo || '';
    const itemStatus = s.status || '';

    const matchesSearch = itemRoute.toLowerCase().includes(search.toLowerCase()) || 
                          itemCargo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === '' || itemStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
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
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Customer Shipper Portal • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Request load deliveries, audit invoices, download BOL papers, and track active route paths.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => triggerToast('Opening support ticket window...')}>
            Contact Support
          </Button>
          {activeTab === 'my-loads' && (
            <Button variant="primary" icon={Plus} onClick={() => setBookModalOpen(true)}>
              Book Shipment
            </Button>
          )}
        </div>
      </div>

      {loading && shipments.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Active Transits" value={shipments.filter(s => s.status === 'Transit').length} description="Live GPS tracking coordinates" trend="1 in transit" trendDirection="neutral" />
                <StatCard title="Completed Runs" value={shipments.filter(s => s.status === 'Delivered').length} description="Signed POD manifests" trend="No issues" trendDirection="up" />
                <StatCard title="Awaiting Match" value={shipments.filter(s => s.status === 'Pending' || s.status === 'Scheduled').length} description="Dispatcher queue pending" trend="Awaiting carrier" trendDirection="neutral" />
                <StatCard title="Ledger Balance Due" value={`$${invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + parseFloat(curr.amount.replace(/[$,]/g, '')), 0).toLocaleString()}`} description="Invoices outstanding bills" trend="Net 30 terms" trendDirection="neutral" />
                <StatCard title="Total Loads Shipped" value={shipments.length} description="All-time lifetime bookings" trend="Lifetime total" trendDirection="up" />
              </div>

              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[300px] min-h-[250px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Live Shipment Path Progress</h3>
                  <p className="text-[10px] text-slate-500">Google map tracking dashboard.</p>
                </div>
                <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-brand-500 rounded-full animate-ping" />
                  <div className="absolute top-1/3 left-1/3 w-2.5 h-2.5 bg-brand-500 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* My Loads Screen */}
          {activeTab === 'my-loads' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Shipped Cargo Manifests</h3>
                  <button 
                    onClick={() => triggerToast('CSV Shipment history exported. Saved shipment_history.csv to downloads.')}
                    className="mt-1 text-[10px] text-brand-400 font-black hover:underline cursor-pointer"
                  >
                    Export Shipment History (CSV)
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} className="w-full sm:max-w-[200px]" />
                  <SelectInput value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
                    { value: '', label: 'All Shipments' },
                    { value: 'Accepted', label: 'Accepted' },
                    { value: 'Transit', label: 'In Transit' },
                    { value: 'Scheduled', label: 'Scheduled Match' },
                    { value: 'Delivered', label: 'Delivered' },
                    { value: 'Pending', label: 'Awaiting Matching' }
                  ]} className="w-full sm:max-w-[150px]" />
                </div>
              </div>

              {filteredShipments.length === 0 ? (
                <EmptyState title="No Shipments" description="Book a new cargo shipment delivery load." icon={Layers} actionLabel="Book Load" onAction={() => setBookModalOpen(true)} />
              ) : (
                <>
                  <DataTable columns={[
                    { key: 'loadId', label: 'Load ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.loadId || row.id}</span> },
                    { key: 'cargo', label: 'Cargo specs', render: (row) => <span className="text-slate-300 font-semibold">{row.cargo}</span> },
                    { key: 'route', label: 'Origin/Destination Path', render: (row) => <span className="text-slate-400">{row.route}</span> },
                    { key: 'cost', label: 'Cost', render: (row) => <span className="font-mono font-bold text-brand-400">{row.cost || '$950.00'}</span> },
                    { key: 'status', label: 'Transit State', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'actions', label: 'Actions', render: (row) => (
                      <div className="flex gap-1.5 flex-wrap">
                        <Button size="sm" variant="secondary" onClick={() => { setSelectedShipment(row); setDetailsDrawerOpen(true); }}>Inspect</Button>
                        <button type="button" onClick={() => triggerToast(`Downloading BOL for ${row.loadId || row.id}... Saved.`)} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[#23324C] hover:border-brand-500/40 text-slate-350 hover:text-white cursor-pointer transition-colors">Download BOL</button>
                        <button type="button" onClick={() => triggerToast(`GPS tracking opened for ${row.loadId || row.id}.`)} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[#23324C] hover:border-emerald-500/40 text-slate-350 hover:text-white cursor-pointer transition-colors">Track</button>
                      </div>
                    )}
                  ]} data={paginatedShipments} />
                  
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          )}

          {/* Live Tracking Map Screen */}
          {activeTab === 'tracking' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 h-[420px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-1">Live Shipment Route GPS</h3>
                <p className="text-[10px] text-slate-500">Live coordinates matched.</p>
              </div>
              <div className="flex-1 bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-brand-500 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-brand-500 rounded-full" />
              </div>
            </div>
          )}

          {/* Documents Center Screen */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Secure Documents Vault</h3>
                
                <DataTable columns={[
                  { key: 'name', label: 'Document File Name', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
                  { key: 'category', label: 'Paper Category', render: (row) => <span className="text-slate-300 font-semibold">{row.category}</span> },
                  { key: 'size', label: 'Size', render: (row) => <span className="font-mono text-[10px] text-slate-500">{row.size}</span> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <Button size="sm" variant="secondary" icon={FileText} onClick={() => triggerToast(`Initiating download for ${row.name}... Completed.`)}>Download</Button>
                  )}
                ]} data={documents} />
              </div>

              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Upload signed BOL / customs papers</h3>
                <FileUploader onUploadSuccess={(url, name) => {
                  setDocuments([{ name, size: '110 KB', category: 'Audit Document' }, ...documents]);
                  triggerToast('Document added to secure vaults.');
                }} />
              </div>
            </div>
          )}

          {/* Invoice Center & Payments screen */}
          {activeTab === 'invoices' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Shippers billing invoices</h3>
              
              <DataTable columns={[
                { key: 'id', label: 'Invoice ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.id}</span> },
                { key: 'amount', label: 'Total Amount', render: (row) => <span className="font-mono font-bold text-slate-300">{row.amount}</span> },
                { key: 'date', label: 'Due Date', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.date}</span> },
                { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                { key: 'actions', label: 'Actions', render: (row) => (
                  <div className="flex gap-2 items-center">
                    {row.status === 'Pending' ? (
                      <Button size="sm" variant="primary" icon={CreditCard} onClick={() => { setSelectedInvoice(row); setPaymentModalOpen(true); }}>
                        Pay Invoice
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">Paid and Cleared</span>
                    )}
                    <button
                      type="button"
                      onClick={() => triggerToast(`Downloading PDF Tax Invoice receipt for ${row.id}... Saved.`)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-[#23324C] hover:border-brand-500/40 text-slate-350 hover:text-white cursor-pointer transition-colors"
                    >
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const isCurrentlyActive = !!reminderStates[row.id];
                        setReminderStates({ ...reminderStates, [row.id]: !isCurrentlyActive });
                        triggerToast(!isCurrentlyActive ? 'Invoice email reminders activated.' : 'Invoice reminders deactivated.');
                      }}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-colors ${
                        reminderStates[row.id] ? 'bg-brand-500 border-brand-500 text-slate-950 font-black' : 'border-[#23324C] text-slate-400 hover:text-white'
                      }`}
                    >
                      {reminderStates[row.id] ? 'Reminders ON' : 'Reminders OFF'}
                    </button>
                  </div>
                )}
              ]} data={invoices || []} />
            </div>
          )}

          {/* Payments Screen */}
          {activeTab === 'payments' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Payments Center</h3>
                  <p className="text-xs text-slate-450 mt-1">Settle outstanding invoices, review transaction history, and configure automated billing reminders.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Re-dispatched customer billing notifications.")}>
                    Invoice reminders
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Exporting payments ledger history...")}>
                    View Payment History
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => { 
                    const pendingInvoice = (invoices || []).find(i => i.status === 'Pending');
                    if (pendingInvoice) {
                      setSelectedInvoice(pendingInvoice);
                      setPaymentModalOpen(true);
                    } else {
                      triggerToast('No pending invoices to pay.', 'info');
                    }
                  }}>
                    Pay Invoice
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'txnId', label: 'Transaction ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.txnId}</span> },
                { key: 'invId', label: 'Invoice ID', render: (row) => <span className="font-mono">INV-{row.invId}</span> },
                { key: 'amount', label: 'Amount Settled', render: (row) => <span className="font-mono font-bold text-emerald-400">{row.amount}</span> },
                { key: 'date', label: 'Payment Date', render: (row) => <span className="font-mono text-slate-400">{row.date}</span> },
                { key: 'method', label: 'Billing Method', render: (row) => <span>{row.method}</span> }
              ]} data={transactions || []} />
            </div>
          )}

          {/* Customer Instructions Screen */}
          {activeTab === 'customer-instructions' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Delivery Instructions &amp; Site Requirements</h3>
                    <p className="text-xs text-slate-450 mt-1">Manage site-specific delivery instructions, access codes, and site contacts per address.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" onClick={() => triggerToast('New delivery instruction added to address book.')}>
                      Add Instruction
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => triggerToast('Instructions exported to PDF for driver brief.')}>
                      Export to PDF
                    </Button>
                  </div>
                </div>
                <DataTable columns={[
                  { key: 'address', label: 'Delivery Address', render: (row) => <span className="font-extrabold text-white text-xs">{row.address}</span> },
                  { key: 'contact', label: 'Site Contact', render: (row) => <span className="text-slate-300">{row.contact}</span> },
                  { key: 'instruction', label: 'Special Instruction', render: (row) => <span className="text-slate-400 text-xs">{row.instruction}</span> },
                  { key: 'access', label: 'Access Code', render: (row) => <span className="font-mono text-brand-400 font-bold">{row.access}</span> },
                  { key: 'actions', label: 'Actions', render: () => (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => triggerToast('Instruction editor opened.')}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => triggerToast('Instruction removed.')}>Remove</Button>
                    </div>
                  )}
                ]} data={[
                  { address: '742 Warehouse Blvd, Chicago IL', contact: 'Mike Thompson', instruction: 'Back dock entry only. Ring buzzer 3 times.', access: 'DOCK-A4' },
                  { address: '99 Industrial Ave, Dallas TX', contact: 'Sarah Lin', instruction: 'Forklift unload required. No hand trucks.', access: 'GATE-12' },
                  { address: '55 Freight Way, Atlanta GA', contact: 'James Pool', instruction: 'Call 30 min before arrival. Security escort required.', access: 'SEC-777' }
                ]} />
              </div>
              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                <h3 className="text-sm font-extrabold text-white">Quick Actions</h3>
                {[
                  { label: 'Add Delivery Address', desc: 'Save new pickup or drop-off location', action: 'New delivery address saved to address book.' },
                  { label: 'Edit Delivery Instructions', desc: 'Update site-specific notes for drivers', action: 'Instruction editor opened.' },
                  { label: 'Print Driver Brief', desc: 'Generate printable instruction sheet', action: 'Driver instruction brief sent to print.' },
                  { label: 'Notify Carrier', desc: 'Send updated instructions to carrier', action: 'Updated instructions dispatched to assigned carrier.' },
                ].map(item => (
                  <button key={item.label} type="button" onClick={() => triggerToast(item.action)}
                    className="w-full text-left p-3 bg-[#111827]/40 border border-[#23324C] hover:border-brand-500/40 rounded-xl transition-colors group cursor-pointer">
                    <strong className="text-white text-xs block group-hover:text-brand-400 transition-colors">{item.label}</strong>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Load Requests Screen */}
          {activeTab === 'load-requests' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Load Requests & Bookings</h3>
                  <p className="text-xs text-slate-450 mt-1">Request trailer dispatches, add location instructions, and review booking history.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => setBookModalOpen(true)}>
                    Submit Load Request
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("New destination address registered in addresses catalog.")}>
                    Add Delivery Address
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Address instructions updated in dispatcher logs.")}>
                    Edit Delivery Instructions
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Booking history ledger exported.")}>
                    View History
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'reqId', label: 'Request ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.reqId}</span> },
                { key: 'cargo', label: 'Cargo specs', render: (row) => <span className="text-slate-300 font-semibold">{row.cargo}</span> },
                { key: 'route', label: 'Route Path', render: (row) => <span className="text-slate-400">{row.route}</span> },
                { key: 'status', label: 'Request State', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={[
                { reqId: 'REQ-9912', cargo: 'Automotive components (42,000 lbs)', route: 'Chicago IL ➔ Dallas TX', status: 'Approved' },
                { reqId: 'REQ-9913', cargo: 'Dry Grocery Pallets (15,000 lbs)', route: 'New York NY ➔ Boston MA', status: 'Pending' }
              ]} />
            </div>
          )}

          {/* Settings Screen */}
          {activeTab === 'settings' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white">Customer Profile Settings</h3>
                <p className="text-xs text-slate-450 mt-1">Update legal contact credentials, adjust invoice notifications, and manage address presets.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <TextInput label="Billing Email Address" defaultValue="accounts@globalretail.com" />
                <TextInput label="Corporate Office HQ Address" defaultValue="742 Evergreen Terrace, Springfield" />
                <Button variant="primary" onClick={() => triggerToast("Shipper profile values saved.")}>
                  Save Profile Settings
                </Button>
              </div>
            </div>
          )}

          {/* Support Tickets Screen */}
          {activeTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Ticket list */}
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Support Tickets history</h3>
                <DataTable columns={[
                  { key: 'id', label: 'Ticket ID', render: (row) => <span className="font-mono text-slate-400">#{row.id}</span> },
                  { key: 'subject', label: 'Subject Heading', render: (row) => <span className="font-extrabold text-white">{row.subject}</span> },
                  { key: 'date', label: 'Date Filed', render: (row) => <span className="text-slate-400 font-mono">{row.date}</span> },
                  { key: 'status', label: 'State Status', render: (row) => <StatusBadge status={row.status} /> }
                ]} data={tickets} />
              </div>

              {/* Submit Ticket form */}
              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Create Support Ticket</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Request assistance from our platform support desk.</p>
                </div>
                <form onSubmit={handleTicketSubmit} className="space-y-4 my-2">
                  <TextInput label="Subject heading" required placeholder="e.g. Shipment update delay" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} />
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Problem description</label>
                    <textarea required rows={3} placeholder="Please provide specific details..." value={ticketMsg} onChange={(e) => setTicketMsg(e.target.value)} className="block w-full px-4 py-3 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-500" />
                  </div>
                  <Button type="submit" variant="primary" className="w-full">
                    Submit Support Ticket
                  </Button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Book Load Modal */}
      <Modal isOpen={bookModalOpen} onClose={() => setBookModalOpen(false)} title="Book New Cargo Shipment Load">
        <form onSubmit={handleBookLoadSubmit} className="space-y-4">
          <TextInput label="Cargo Specs / Items" required placeholder="e.g. Dry Grocery Pallets" value={cargoName} onChange={(e) => setCargoName(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Cargo Weight (lbs)" required type="number" placeholder="e.g. 12000" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} />
            <TextInput label="Route Path Origin/Dest" required placeholder="e.g. Chicago IL ➔ Atlanta GA" value={routePath} onChange={(e) => setRoutePath(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Book Delivery Load
          </Button>
        </form>
      </Modal>

      {/* Pay Invoice Checkout Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Authorize Invoice payment Checkout">
        {selectedInvoice && (
          <form onSubmit={handlePaymentCheckoutSubmit} className="space-y-4 text-left">
            <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl text-xs flex justify-between font-bold text-white mb-2">
              <span>Settling Invoice {selectedInvoice.id}</span>
              <span className="text-brand-400">{selectedInvoice.amount}</span>
            </div>
            
            <TextInput label="Credit Card Number" required placeholder="xxxx-xxxx-xxxx-xxxx" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput label="Expiration Date" required placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
              <TextInput label="Security Code CVV" required type="password" placeholder="***" maxLength={3} />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Authorize Payment Charge
            </Button>
          </form>
        )}
      </Modal>

      {/* Shipment details drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title="Shipment manifest Audit Inspector">
        {selectedShipment && (
          <div className="space-y-6 text-left text-slate-300 text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/60 pb-3">
              <h4 className="text-base font-extrabold text-white mb-1">Load ID: {selectedShipment.loadId || selectedShipment.id}</h4>
              <StatusBadge status={selectedShipment.status} />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Cargo specifications</span>
                <strong className="text-white text-xs">{selectedShipment.cargo}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Delivery route path</span>
                <span className="text-xs">{selectedShipment.route}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Delivery Cost pricing</span>
                <span className="text-xs font-mono font-bold text-brand-400">{selectedShipment.cost || '$950.00'}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4">
              {selectedShipment.status === 'Delivered' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => triggerToast(`Downloading signed Proof of Delivery (POD) for ${selectedShipment.loadId || selectedShipment.id}... Saved.`)}
                >
                  Download POD
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
