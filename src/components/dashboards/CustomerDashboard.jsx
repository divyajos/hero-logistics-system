import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Layers, MapPin, Database, Award, Plus, Check, CreditCard, 
  FileText, Send, HelpCircle, Calendar, Trash2, Star, RefreshCw, 
  Bell, MessageSquare, Paperclip, Smile, Mic, Download, X, User, 
  Clock, Navigation, CheckCircle, Smile as EmojiIcon, CheckCheck
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'Shipment', title: 'Load REQ-9912 Dispatched', msg: 'Your booking REQ-9912 has been matched with driver David Miller. ETA is 17:45 PM today.', time: '2 min ago', read: false },
  { id: 2, type: 'Invoice', title: 'New Invoice Issued', msg: 'Invoice INV-3981 for $950.00 is ready for review.', time: '15 min ago', read: false },
  { id: 3, type: 'Payment', title: 'Payment Settled', msg: 'Tax Invoice INV-3980 payment was processed and approved.', time: '2 hours ago', read: true },
  { id: 4, type: 'Shipment', title: 'Shipment Delivered', msg: 'Load LD-9411 was delivered to Springfield Depot. Signed POD uploaded.', time: 'Yesterday', read: true },
];

const INITIAL_CHAT_MESSAGES = [
  { id: 1, sender: 'dispatcher', text: 'Hi! I am your dispatch support today. Let me know if you need assistance with bookings or tracking.', time: '10:00 AM', read: true },
  { id: 2, sender: 'shipper', text: 'Hello, is there an updated ETA for Springfield shipment REQ-9912?', time: '10:02 AM', read: true },
  { id: 3, sender: 'dispatcher', text: 'Checking on that now. The driver is currently passing Bloomington IL. Still on track for 17:45 PM.', time: '10:03 AM', read: true },
];

export default function CustomerDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { 
    customerLoads: storeShipments, 
    customerInvoices: invoices, 
    customerTransactions: transactions, 
    loading 
  } = useSelector((state) => state.customers);

  // ─── Local State Overrides for Persistence ─────────────────────────────────
  const [shipments, setShipments] = useState([]);
  
  useEffect(() => {
    if (storeShipments && storeShipments.length > 0) {
      // Merge store shipments with any cancelled or rescheduled status in localStorage
      const savedOverwrites = localStorage.getItem('hero_shipment_overwrites');
      const overwrites = savedOverwrites ? JSON.parse(savedOverwrites) : {};
      const merged = storeShipments.map(s => {
        const idKey = s.loadId || s.id;
        if (overwrites[idKey]) {
          return { ...s, ...overwrites[idKey] };
        }
        return s;
      });
      setShipments(merged);
    } else {
      setShipments([]);
    }
  }, [storeShipments]);

  // Modals & Drawers
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [supportDrawerOpen, setSupportDrawerOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [rebookModalOpen, setRebookModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Selection
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form Fields
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [routePath, setRoutePath] = useState('');

  // Reschedule Date
  const [rescheduleDate, setRescheduleDate] = useState('');

  // Delivery Rating & Feedback
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittedRatings, setSubmittedRatings] = useState(() => {
    const saved = localStorage.getItem('hero_delivery_ratings');
    return saved ? JSON.parse(saved) : {};
  });

  // Saved addresses state
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('hero_saved_addresses');
    return saved ? JSON.parse(saved) : [
      { id: 1, address: '742 Warehouse Blvd, Chicago IL', contact: 'Mike Thompson', instruction: 'Back dock entry only. Ring buzzer 3 times.', access: 'DOCK-A4' },
      { id: 2, address: '99 Industrial Ave, Dallas TX', contact: 'Sarah Lin', instruction: 'Forklift unload required. No hand trucks.', access: 'GATE-12' },
      { id: 3, address: '55 Freight Way, Atlanta GA', contact: 'James Pool', instruction: 'Call 30 min before arrival. Security escort required.', access: 'SEC-777' }
    ];
  });
  const [addressForm, setAddressForm] = useState({ id: null, address: '', contact: '', instruction: '', access: '' });

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hero_cust_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [notifSearch, setNotifSearch] = useState('');
  const [notifFilter, setNotifFilter] = useState('All');
  const [notifPage, setNotifPage] = useState(1);

  // Chat State
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('hero_cust_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });
  const [chatInput, setChatInput] = useState('');
  const [activeDispatcher, setActiveDispatcher] = useState({ id: 1, name: 'Alex Rivera (Lead Dispatcher)', status: 'Online', avatar: 'AR' });
  const [dispatcherSearch, setDispatcherSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const chatBottomRef = useRef(null);

  // Payment Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // Support Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  // Profile Form
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('hero_cust_profile');
    return saved ? JSON.parse(saved) : {
      email: 'accounts@globalretail.com',
      address: '742 Evergreen Terrace, Springfield',
      phone: '+1-555-0100',
      contactName: 'Jane Doe',
      currency: 'USD'
    };
  });

  // Local lists states
  const [reminderStates, setReminderStates] = useState({});
  const [tickets, setTickets] = useState([
    { id: 201, subject: 'Shipment #LD-9411 Status Delay', status: 'Open', date: '06/19/2026' }
  ]);

  const [documents, setDocuments] = useState([
    { name: 'Signed_BOL_LD-9411.pdf', size: '245 KB', category: 'Bill of Lading' },
    { name: 'Signed_POD_LD-9411.pdf', size: '185 KB', category: 'Proof of Delivery' },
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

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // State Persistence Helpers
  const saveShipmentOverwrite = (id, fields) => {
    const saved = localStorage.getItem('hero_shipment_overwrites');
    const overwrites = saved ? JSON.parse(saved) : {};
    overwrites[id] = { ...overwrites[id], ...fields };
    localStorage.setItem('hero_shipment_overwrites', JSON.stringify(overwrites));
    
    // Update local state directly
    setShipments(prev => prev.map(s => {
      const idKey = s.loadId || s.id;
      if (idKey === id) return { ...s, ...fields };
      return s;
    }));
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
    })).then(() => {
      dispatch(fetchCustomerLoads());
    });

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

  // Cancel Booking
  const handleCancelBooking = () => {
    if (!selectedShipment) return;
    const idKey = selectedShipment.loadId || selectedShipment.id;
    saveShipmentOverwrite(idKey, { status: 'Cancelled' });
    setCancelModalOpen(false);
    triggerToast(`Shipment ${idKey} cancelled successfully.`);
  };

  // Reschedule Pickup
  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleDate) {
      triggerToast('Please select a valid reschedule date.', 'error');
      return;
    }
    const selectedTime = new Date(rescheduleDate).getTime();
    if (selectedTime < Date.now()) {
      triggerToast('Pickup date must be in the future.', 'error');
      return;
    }
    const idKey = selectedShipment.loadId || selectedShipment.id;
    saveShipmentOverwrite(idKey, { scheduledDate: rescheduleDate, status: 'Scheduled' });
    setRescheduleModalOpen(false);
    triggerToast(`Pickup for shipment ${idKey} rescheduled to ${new Date(rescheduleDate).toLocaleDateString()}.`);
  };

  // Rebook Shipment
  const handleRebookSubmit = (e) => {
    e.preventDefault();
    if (!cargoName || !routePath) {
      triggerToast('Please complete all details.', 'error');
      return;
    }
    dispatch(createBooking({
      cargo: cargoName,
      weight: cargoWeight || '20,000 lbs',
      route: routePath
    })).then(() => {
      dispatch(fetchCustomerLoads());
    });
    setRebookModalOpen(false);
    triggerToast('Rebooked previous load configuration successfully!');
  };

  // Star Rating Submission
  const handleRatingSubmit = (e) => {
    e.preventDefault();
    const idKey = selectedShipment.loadId || selectedShipment.id;
    const ratings = { ...submittedRatings, [idKey]: { rating, feedback } };
    setSubmittedRatings(ratings);
    localStorage.setItem('hero_delivery_ratings', JSON.stringify(ratings));
    setRatingModalOpen(false);
    setFeedback('');
    triggerToast('Thank you! Your feedback has been sent to our carrier management team.');
  };

  // Address Form Actions
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.address || !addressForm.contact) {
      triggerToast('Address and Site Contact are required.', 'error');
      return;
    }
    let updated;
    if (addressForm.id) {
      updated = addresses.map(a => a.id === addressForm.id ? addressForm : a);
      triggerToast('Saved address instructions updated.');
    } else {
      const newA = { ...addressForm, id: Date.now() };
      updated = [...addresses, newA];
      triggerToast('New delivery address registered in address book.');
    }
    setAddresses(updated);
    localStorage.setItem('hero_saved_addresses', JSON.stringify(updated));
    setAddressModalOpen(false);
    setAddressForm({ id: null, address: '', contact: '', instruction: '', access: '' });
  };

  const handleRemoveAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('hero_saved_addresses', JSON.stringify(updated));
    triggerToast('Delivery address removed from site presets.');
  };

  // Profile Edit
  const handleProfileSave = (e) => {
    e.preventDefault();
    localStorage.setItem('hero_cust_profile', JSON.stringify(profile));
    triggerToast('Shipper profile values saved.');
  };

  // Document Vault Simulation Generators
  const simulateDocDownload = (filename, contentStr) => {
    const blob = new Blob([contentStr], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBOL = (id) => {
    simulateDocDownload(`Signed_BOL_${id}.pdf`, `HERO LOGISTICS BILL OF LADING\nLoad ID: ${id}\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified & Signed`);
    triggerToast(`BOL download for ${id} started.`);
  };

  const handleDownloadPOD = (id) => {
    simulateDocDownload(`Signed_POD_${id}.pdf`, `HERO LOGISTICS PROOF OF DELIVERY\nLoad ID: ${id}\nDate: ${new Date().toLocaleDateString()}\nStatus: Delivered & Customer Approved`);
    triggerToast(`POD download for ${id} started.`);
  };

  const handleDownloadInvoice = (id) => {
    simulateDocDownload(`Invoice_${id}.pdf`, `HERO LOGISTICS COMMERCIAL TAX INVOICE\nInvoice ID: ${id}\nDue: Within Net 30 Terms\nTotal Balance Settled`);
    triggerToast(`Invoice receipt PDF for ${id} downloaded.`);
  };

  // Export transaction ledger to CSV/PDF
  const handleExportPaymentHistory = (format) => {
    if (format === 'csv') {
      const headers = ['Transaction ID', 'Invoice ID', 'Amount Settled', 'Payment Date', 'Billing Method'];
      const rows = transactions.map(t => [t.txnId, t.invId, t.amount, t.date, t.method]);
      const csvContent = [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
      simulateDocDownload(`Payment_History_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
      triggerToast('Payments ledger CSV exported.');
    } else {
      simulateDocDownload(`Payment_History_Report.pdf`, `HERO LOGISTICS SYSTEM - TRANSACTIONS LEDGER REPORT\n\nGenerated: ${new Date().toLocaleString()}\n\nTransactions:\n${transactions.map(t => `Txn: ${t.txnId} | Inv: ${t.invId} | Amount: ${t.amount} | Date: ${t.date}`).join('\n')}`);
      triggerToast('Payments ledger PDF report generated.');
    }
  };

  // Chat message sending
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'shipper',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    const nextMessages = [...chatMessages, newMsg];
    setChatMessages(nextMessages);
    localStorage.setItem('hero_cust_chat', JSON.stringify(nextMessages));
    setChatInput('');

    // Trigger typing indicator and mock response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Copy that, checking the driver GPS logs right now.",
        "Understood, I am coordinating with warehouse gate control.",
        "Your loader instructions have been saved and dispatched to the truck cabin.",
        "We are confirming the signed POD with the Springfield receiver now."
      ];
      const botResponse = {
        id: Date.now() + 1,
        sender: 'dispatcher',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      const finalMessages = [...nextMessages, botResponse];
      setChatMessages(finalMessages);
      localStorage.setItem('hero_cust_chat', JSON.stringify(finalMessages));
    }, 1500);
  };

  // Notifications filters & pagination
  const handleMarkNotifRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('hero_cust_notifications', JSON.stringify(updated));
    triggerToast('Notification marked as read.');
  };

  const handleMarkAllNotifRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('hero_cust_notifications', JSON.stringify(updated));
    triggerToast('All notifications marked as read.');
  };

  const handleDeleteNotif = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('hero_cust_notifications', JSON.stringify(updated));
    triggerToast('Notification removed.');
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(notifSearch.toLowerCase()) || 
                          n.msg.toLowerCase().includes(notifSearch.toLowerCase());
    const matchesType = notifFilter === 'All' || 
                        (notifFilter === 'Unread' && !n.read) || 
                        n.type === notifFilter;
    return matchesSearch && matchesType;
  });

  const totalNotifPages = Math.ceil(filteredNotifications.length / 5) || 1;
  const paginatedNotifications = filteredNotifications.slice(
    (notifPage - 1) * 5,
    notifPage * 5
  );

  // Filters & Page logic for Shipments
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

  // Find a shipment to track live. Default to first active transit, otherwise select Springfield Component load.
  const activeTrackingShipment = selectedShipment || shipments.find(s => s.status === 'Transit') || shipments[0];

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
          <Button variant="outline" onClick={() => setSupportDrawerOpen(true)}>
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
                    { value: 'Pending', label: 'Awaiting Matching' },
                    { value: 'Cancelled', label: 'Cancelled' }
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
                    { key: 'actions', label: 'Actions', render: (row) => {
                      const idKey = row.loadId || row.id;
                      const hasRating = !!submittedRatings[idKey];
                      return (
                        <div className="flex gap-1.5 flex-wrap">
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedShipment(row); setDetailsDrawerOpen(true); }}>Inspect</Button>
                          <button type="button" onClick={() => handleDownloadBOL(idKey)} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[#23324C] hover:border-brand-500/40 text-slate-350 hover:text-white cursor-pointer transition-colors">BOL</button>
                          
                          {row.status === 'Delivered' && (
                            <>
                              <button type="button" onClick={() => handleDownloadPOD(idKey)} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-colors">POD</button>
                              <button type="button" onClick={() => { setSelectedShipment(row); setRatingModalOpen(true); }} className={`px-2 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-colors ${hasRating ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-[#23324C] text-slate-350 hover:text-white'}`}>
                                {hasRating ? '★ Rated' : 'Rate'}
                              </button>
                              <button type="button" onClick={() => { setCargoName(row.cargo); setCargoWeight(row.weight || '25,000 lbs'); setRoutePath(row.route); setRebookModalOpen(true); }} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer transition-colors">Rebook</button>
                            </>
                          )}

                          {(row.status === 'Pending' || row.status === 'Scheduled') && (
                            <>
                              <button type="button" onClick={() => { setSelectedShipment(row); setRescheduleModalOpen(true); }} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 cursor-pointer">Reschedule</button>
                              <button type="button" onClick={() => { setSelectedShipment(row); setCancelModalOpen(true); }} className="px-2 py-1 text-[10px] font-bold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer">Cancel</button>
                            </>
                          )}
                        </div>
                      );
                    }}
                  ]} data={paginatedShipments} />
                  
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          )}

          {/* Live Tracking Map Screen */}
          {activeTab === 'tracking' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Timeline, Driver Details & Contact */}
              <div className="lg:col-span-4 space-y-4">
                {activeTrackingShipment ? (
                  <>
                    {/* Active Shipment Details */}
                    <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Tracking ID</span>
                        <h4 className="text-sm font-extrabold text-white font-mono mt-0.5">{activeTrackingShipment.loadId || activeTrackingShipment.id}</h4>
                        <p className="text-xs text-slate-300 mt-1 font-semibold">{activeTrackingShipment.cargo}</p>
                        <p className="text-[11px] text-slate-400">{activeTrackingShipment.route}</p>
                      </div>

                      {/* Timeline */}
                      <div className="pt-2 border-t border-[#23324C]/40 space-y-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Shipment Timeline</p>
                        <div className="space-y-3 pl-2">
                          {[
                            { label: 'Booked', date: '06/27 10:00 AM', ok: true },
                            { label: 'Dispatched', date: '06/27 11:30 AM', ok: activeTrackingShipment.status !== 'Pending' },
                            { label: 'In Transit', date: '06/27 14:00 PM', ok: activeTrackingShipment.status === 'Transit' || activeTrackingShipment.status === 'Delivered' },
                            { label: 'Delivered', date: 'Estimated 17:45 PM', ok: activeTrackingShipment.status === 'Delivered' }
                          ].map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 relative">
                              {idx < 3 && <div className={`absolute left-2.5 top-5 bottom-[-16px] w-[2px] ${step.ok ? 'bg-brand-500' : 'bg-slate-700'}`} />}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${step.ok ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-slate-900 border-slate-700 text-slate-500'} z-10`}>
                                <Check className="w-3 h-3" />
                              </div>
                              <div>
                                <p className={`text-xs font-bold ${step.ok ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                <p className="text-[10px] text-slate-400">{step.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Driver Details */}
                      <div className="pt-4 border-t border-[#23324C]/40 space-y-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Assigned Carrier Details</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-[#23324C] flex items-center justify-center text-xs font-bold text-white">DM</div>
                          <div>
                            <p className="text-xs font-bold text-white">David Miller</p>
                            <p className="text-[10px] text-slate-500">Plate: TR-9410 | Volvo FH16</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#111827] p-2.5 border border-[#23324C]/60 rounded-xl">
                          <div><span className="text-slate-500">ETA</span><p className="text-brand-400 font-bold">17:45 PM</p></div>
                          <div><span className="text-slate-500">SPEED</span><p className="text-emerald-400 font-bold">55 mph</p></div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => triggerToast('Dialing Driver David Miller (+1-555-0199) - Simulated call.')}>Call Driver</Button>
                          <Button variant="primary" size="sm" className="flex-1" onClick={() => triggerToast('Direct Message sent to driver mobile app.')}>Message</Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60">
                    <p className="text-xs text-slate-400 text-center">No active transit loads to display.</p>
                  </div>
                )}
              </div>

              {/* Live Route Map (Visual coordinates) */}
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between min-h-[420px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Live Shipment Route GPS</h3>
                  <p className="text-[10px] text-slate-500">Live coordinates matched.</p>
                </div>
                <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-brand-500 rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-brand-500 rounded-full" />
                </div>
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
                      <span className="text-[11px] font-semibold text-slate-500 font-bold text-emerald-400">Paid and Cleared</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(row.id)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-[#23324C] hover:border-brand-500/40 text-slate-350 hover:text-white cursor-pointer transition-colors"
                    >
                      Download Invoice PDF
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
                  <Button size="sm" variant="outline" onClick={() => handleExportPaymentHistory('csv')}>
                    Export Ledger (CSV)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExportPaymentHistory('pdf')}>
                    Export Ledger (PDF)
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

          {/* Customer Instructions & Addresses Tab */}
          {activeTab === 'customer-instructions' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Delivery Instructions &amp; Site Requirements</h3>
                    <p className="text-xs text-slate-450 mt-1">Manage site-specific delivery instructions, access codes, and site contacts per address.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" onClick={() => {
                      setAddressForm({ id: null, address: '', contact: '', instruction: '', access: '' });
                      setAddressModalOpen(true);
                    }}>
                      Add Instruction
                    </Button>
                  </div>
                </div>
                <DataTable columns={[
                  { key: 'address', label: 'Delivery Address', render: (row) => <span className="font-extrabold text-white text-xs">{row.address}</span> },
                  { key: 'contact', label: 'Site Contact', render: (row) => <span className="text-slate-300">{row.contact}</span> },
                  { key: 'instruction', label: 'Special Instruction', render: (row) => <span className="text-slate-400 text-xs">{row.instruction}</span> },
                  { key: 'access', label: 'Access Code', render: (row) => <span className="font-mono text-brand-400 font-bold">{row.access}</span> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => {
                        setAddressForm(row);
                        setAddressModalOpen(true);
                      }}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRemoveAddress(row.id)}>Remove</Button>
                    </div>
                  )}
                ]} data={addresses} />
              </div>
              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                <h3 className="text-sm font-extrabold text-white">Quick Actions</h3>
                {[
                  { label: 'Add Delivery Address', desc: 'Save new pickup or drop-off location', onClick: () => {
                    setAddressForm({ id: null, address: '', contact: '', instruction: '', access: '' });
                    setAddressModalOpen(true);
                  }},
                  { label: 'Print Driver Brief', desc: 'Generate printable instruction sheet', onClick: () => triggerToast('Driver instruction brief sent to print.') },
                  { label: 'Notify Carrier', desc: 'Send updated instructions to carrier', onClick: () => triggerToast('Updated instructions dispatched to assigned carrier.') },
                ].map(item => (
                  <button key={item.label} type="button" onClick={item.onClick}
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
                  <Button size="sm" variant="secondary" onClick={() => {
                    setAddressForm({ id: null, address: '', contact: '', instruction: '', access: '' });
                    setAddressModalOpen(true);
                  }}>
                    Add Delivery Address
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

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Customer Notifications Log</h3>
                  <p className="text-[10px] text-slate-500">Live operational and billing status updates.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <SearchInput value={notifSearch} onChange={(e) => setNotifSearch(e.target.value)} onClear={() => setNotifSearch('')} className="w-full sm:max-w-[200px]" />
                  <SelectInput value={notifFilter} onChange={(e) => setNotifFilter(e.target.value)} options={[
                    { value: 'All', label: 'All Alerts' },
                    { value: 'Unread', label: 'Unread' },
                    { value: 'Shipment', label: 'Shipment Updates' },
                    { value: 'Invoice', label: 'Invoice Alerts' },
                    { value: 'Payment', label: 'Payments' }
                  ]} className="w-full sm:max-w-[150px]" />
                  <Button size="sm" variant="outline" onClick={handleMarkAllNotifRead}>Mark All Read</Button>
                </div>
              </div>

              {paginatedNotifications.length === 0 ? (
                <EmptyState title="No Alerts Found" description="There are no system or shipment alerts matching your filters." icon={Bell} />
              ) : (
                <div className="space-y-2">
                  {paginatedNotifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${n.read ? 'bg-[#111827]/30 border-[#23324C]/40 text-slate-400' : 'bg-brand-500/5 border-brand-500/20 text-slate-200'}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${n.type === 'Shipment' ? 'bg-blue-500/10 text-blue-400' : n.type === 'Invoice' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{n.type}</span>
                          <strong className="text-white text-xs">{n.title}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">({n.time})</span>
                        </div>
                        <p className="text-xs text-slate-350">{n.msg}</p>
                      </div>
                      <div className="flex gap-2">
                        {!n.read && <Button size="sm" variant="secondary" onClick={() => handleMarkNotifRead(n.id)}>Mark Read</Button>}
                        <Button size="sm" variant="outline" icon={Trash2} onClick={() => handleDeleteNotif(n.id)} />
                      </div>
                    </div>
                  ))}
                  <Pagination currentPage={notifPage} totalPages={totalNotifPages} onPageChange={setNotifPage} />
                </div>
              )}
            </div>
          )}

          {/* Dispatcher Chat Tab */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
              {/* Sidebar List */}
              <div className="lg:col-span-4 glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col text-left space-y-4 h-full overflow-hidden">
                <SearchInput value={dispatcherSearch} onChange={(e) => setDispatcherSearch(e.target.value)} onClear={() => setDispatcherSearch('')} placeholder="Search dispatcher..." />
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                  {[
                    { id: 1, name: 'Alex Rivera (Lead Dispatch)', status: 'Online', avatar: 'AR' },
                    { id: 2, name: 'Sophia Chen (Night Shift)', status: 'Offline', avatar: 'SC' }
                  ].filter(d => d.name.toLowerCase().includes(dispatcherSearch.toLowerCase())).map(d => (
                    <div key={d.id} onClick={() => setActiveDispatcher(d)} className={`p-3 rounded-xl flex items-center justify-between border cursor-pointer transition-colors ${d.id === activeDispatcher.id ? 'bg-brand-500/10 border-brand-500/30' : 'bg-[#111827]/40 border-[#23324C]/30 hover:border-[#23324C]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">{d.avatar}</div>
                        <div>
                          <p className="text-xs font-bold text-white">{d.name}</p>
                          <p className="text-[9px] text-slate-500">{d.status}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${d.status === 'Online' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Window Panel */}
              <div className="lg:col-span-8 glass rounded-2xl border border-[#23324C]/60 flex flex-col justify-between h-full overflow-hidden">
                {/* Header */}
                <div className="p-3 bg-[#111827]/80 border-b border-[#23324C]/60 flex justify-between items-center text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm">{activeDispatcher.avatar}</div>
                    <div>
                      <p className="text-xs font-extrabold text-white">{activeDispatcher.name}</p>
                      <p className="text-[9px] text-emerald-400 font-semibold">{activeDispatcher.status === 'Online' ? 'Active chat channel' : 'Offline'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => triggerToast('Direct support hotline: Dialing 1-800-HERO-LOG...')}>Call Dispatch</Button>
                </div>

                {/* Messages Box */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0F19]/40 scrollbar-hide">
                  {chatMessages.map((msg) => {
                    const isSelf = msg.sender === 'shipper';
                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl text-xs space-y-1 ${isSelf ? 'bg-brand-500 text-slate-950 font-semibold rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-[#23324C]/50'}`}>
                          <p>{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 text-[8px] opacity-70 font-mono">
                            <span>{msg.time}</span>
                            {isSelf && <CheckCheck className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="p-2.5 bg-slate-800 text-slate-400 text-[10px] rounded-2xl rounded-tl-none border border-[#23324C]/50 font-medium italic animate-pulse">
                        Dispatcher is typing...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Controls */}
                <form onSubmit={handleSendMessage} className="p-3 bg-[#111827] border-t border-[#23324C]/60 flex items-center gap-2 relative">
                  <button type="button" onClick={() => setEmojiOpen(!emojiOpen)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                    <EmojiIcon className="w-4 h-4" />
                  </button>
                  {emojiOpen && (
                    <div className="absolute bottom-16 left-3 bg-slate-900 border border-[#23324C] rounded-xl p-2.5 grid grid-cols-5 gap-2 z-30 shadow-2xl">
                      {['👍', '👌', '🚛', '📦', '⚠️'].map(emoji => (
                        <button type="button" key={emoji} onClick={() => { setChatInput(prev => prev + emoji); setEmojiOpen(false); }} className="text-lg hover:scale-125 transition-transform">{emoji}</button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={() => triggerToast('Select BOL or Customs PDF to send.')} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => triggerToast('Mic access enabled. Recording voice message...')} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                    <Mic className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type a message to Dispatcher..." 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    className="flex-grow px-4 py-2.5 bg-[#0B0F19] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-500" 
                  />
                  <button type="submit" className="p-2.5 bg-brand-500 text-slate-950 rounded-xl font-bold hover:bg-brand-400 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Settings Screen */}
          {activeTab === 'settings' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white">Customer Profile Settings</h3>
                <p className="text-xs text-slate-450 mt-1">Update legal contact credentials, adjust invoice notifications, and manage address presets.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                <TextInput label="Corporate Contact Name" value={profile.contactName} onChange={e => setProfile({...profile, contactName: e.target.value})} required />
                <TextInput label="Billing Email Address" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} required />
                <TextInput label="Contact Phone Number" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} required />
                <TextInput label="Corporate Office HQ Address" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} required />
                <SelectInput label="Preferred Invoice Currency" value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})} options={[
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'CAD', label: 'CAD - Canadian Dollar' },
                  { value: 'AUD', label: 'AUD - Australian Dollar' }
                ]} />
                <Button type="submit" variant="primary">
                  Save Profile Settings
                </Button>
              </form>
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

      {/* Reschedule Modal */}
      {selectedShipment && (
        <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title={`Reschedule Pickup: ${selectedShipment.loadId || selectedShipment.id}`}>
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-left">
            <TextInput label="Choose New Pickup Date & Time" type="datetime-local" required value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
            <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
              <Button type="button" variant="secondary" onClick={() => setRescheduleModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Reschedule</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Modal */}
      {selectedShipment && (
        <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Shipment Booking?">
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-300">Are you sure you want to cancel the booking for shipment <strong>{selectedShipment.loadId || selectedShipment.id}</strong>? This action will alert dispatchers and cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>No, Keep Booking</Button>
              <Button variant="danger" onClick={handleCancelBooking}>Yes, Cancel Booking</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delivery Rating & Feedback Modal */}
      {selectedShipment && (
        <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title={`Rate Delivery: ${selectedShipment.loadId || selectedShipment.id}`}>
          <form onSubmit={handleRatingSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Delivery Rating (1 - 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-brand-500 fill-brand-500' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>
            <TextInput label="Feedback Comments" placeholder="Tell us about the delivery and driver professionalism..." value={feedback} onChange={e => setFeedback(e.target.value)} />
            <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
              <Button type="button" variant="secondary" onClick={() => setRatingModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Feedback</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Rebook Modal */}
      <Modal isOpen={rebookModalOpen} onClose={() => setRebookModalOpen(false)} title="Rebook Previous Shipment Config">
        <form onSubmit={handleRebookSubmit} className="space-y-4 text-left">
          <TextInput label="Cargo specs" value={cargoName} onChange={e => setCargoName(e.target.value)} required />
          <TextInput label="Cargo weight" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} required />
          <TextInput label="Route origin/destination path" value={routePath} onChange={e => setRoutePath(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
            <Button type="button" variant="secondary" onClick={() => setRebookModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Booking</Button>
          </div>
        </form>
      </Modal>

      {/* Site Address Add/Edit Modal */}
      <Modal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} title={addressForm.id ? "Edit Site Instruction" : "Add Site Instruction"}>
        <form onSubmit={handleAddressSubmit} className="space-y-4 text-left">
          <TextInput label="Delivery Address *" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} placeholder="e.g. 100 Logistics Blvd, Chicago IL" required />
          <TextInput label="Site Contact Person *" value={addressForm.contact} onChange={e => setAddressForm({...addressForm, contact: e.target.value})} placeholder="e.g. Mike Thompson" required />
          <TextInput label="Special Delivery Instructions" value={addressForm.instruction} onChange={e => setAddressForm({...addressForm, instruction: e.target.value})} placeholder="e.g. Ring buzzer at Gate 4..." />
          <TextInput label="Site Access Code" value={addressForm.access} onChange={e => setAddressForm({...addressForm, access: e.target.value})} placeholder="e.g. GATE-102" />
          <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
            <Button type="button" variant="secondary" onClick={() => setAddressModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Address</Button>
          </div>
        </form>
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

            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setDetailsDrawerOpen(false);
                  handleDownloadBOL(selectedShipment.loadId || selectedShipment.id);
                }}
              >
                Download BOL
              </Button>
              {selectedShipment.status === 'Delivered' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setDetailsDrawerOpen(false);
                    handleDownloadPOD(selectedShipment.loadId || selectedShipment.id);
                  }}
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

      {/* Support tickets drawer */}
      <Drawer isOpen={supportDrawerOpen} onClose={() => setSupportDrawerOpen(false)} title="Shipper Help Desk & Ticket Center">
        <form onSubmit={handleTicketSubmit} className="space-y-4 text-left">
          <TextInput label="Subject heading" required placeholder="e.g. Shipment update delay" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} />
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Problem description</label>
            <textarea required rows={4} placeholder="Please provide specific details..." value={ticketMsg} onChange={(e) => setTicketMsg(e.target.value)} className="block w-full px-4 py-3 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-500" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setSupportDrawerOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-grow">Submit Ticket</Button>
          </div>
        </form>
      </Drawer>

    </div>
  );
}
