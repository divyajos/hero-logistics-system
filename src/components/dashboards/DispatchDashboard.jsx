import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads, createLoad, updateLoadStatus } from '../../store/slices/loadsSlice';
import { fetchDrivers } from '../../store/slices/driversSlice';
import { fetchVehicles } from '../../store/slices/vehiclesSlice';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import SearchInput from '../common/SearchInput';
import DatePicker from '../common/DatePicker';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import Drawer from '../common/Drawer';
import { ActivityTimeline } from '../common/DashboardWidgets';
import Tabs from '../common/Tabs';
import { PageHeader } from '../common/UXEnhancements';
import { KpiGridSkeleton, TableSkeleton } from '../common/Skeletons';
import { 
  Layers, Navigation, Truck, ShieldAlert, Plus, Check, Clock, User, Phone, 
  MapPin, MessageSquare, ArrowRight, ArrowLeft, Send, Calendar as CalendarIcon, FileText, Activity, Trash2
} from 'lucide-react';

export default function DispatchDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { items: loads, unassignedCount, driverCount, delayCount, loading } = useSelector((state) => state.loads);
  const { drivers } = useSelector((state) => state.drivers);
  const { fleet } = useSelector((state) => state.vehicles);

  // Modals & Drawers
  const [wizardOpen, setWizardOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');
  const [newNoteText, setNewNoteText] = useState('');

  // Selected load details reactively updated from Redux store state
  const selectedLoadDetail = loads.find(l => l.id === selectedLoad?.id) || selectedLoad;

  // Wizard Steps State
  const [wizardStep, setWizardStep] = useState(1);
  
  // Cargo details
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoCost, setCargoCost] = useState('$1,200.00');

  // Step 1: Customer Information
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerRef, setCustomerRef] = useState('');

  // Step 2: Pickup Details
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupContact, setPickupContact] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');

  // Step 3: Delivery Details
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Step 4: Stop Management
  const [wizardStops, setWizardStops] = useState([]);
  const [stopAddress, setStopAddress] = useState('');
  const [stopType, setStopType] = useState('Layover');
  const [stopNotes, setStopNotes] = useState('');

  // Step 5: Vehicle Assignment
  const [assignedVehicle, setAssignedVehicle] = useState('TX-ROAD88');
  const [trailerType, setTrailerType] = useState('Semi-Truck');

  // Step 6: Driver Assignment
  const [assignedDriver, setAssignedDriver] = useState('John D.');
  const [driverContactInfo, setDriverContactInfo] = useState('555-0192');

  // Step 7: Documents Checklist
  const [docsRateConf, setDocsRateConf] = useState(false);
  const [docsBOL, setDocsBOL] = useState(false);
  const [docsCustoms, setDocsCustoms] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dispatch Chat Inbox State
  const [chats, setChats] = useState([
    { id: 1, sender: 'John D. (Driver)', msg: 'Toll plaza passed on I-35 TX. ETA on target.', time: '10 min ago' },
    { id: 2, sender: 'Sarah R. (Driver)', msg: 'Straps checked. Cargo secured. Departing terminal.', time: '35 min ago' },
    { id: 3, sender: 'System Node', msg: 'Dispatch Load LD-9411 geofence breached Dallas.', time: '2 hours ago' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Route Planner inputs & simulations
  const [plannerOrigin, setPlannerOrigin] = useState('Chicago HQ');
  const [plannerDest, setPlannerDest] = useState('Dallas Depot');
  const [plannerResult, setPlannerResult] = useState(null);
  const [plannerStops, setPlannerStops] = useState([]);
  const [plannerStopAddress, setPlannerStopAddress] = useState('');
  const [plannerStopType, setPlannerStopType] = useState('Layover');
  const [plannerStopDuration, setPlannerStopDuration] = useState('2'); // in hours
  const [averageSpeed, setAverageSpeed] = useState('60'); // in mph
  const [trafficDelay, setTrafficDelay] = useState('None'); // None, Light, Heavy
  const [optimizationMode, setOptimizationMode] = useState('Fastest Route');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchLoads());
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setCargoName('');
    setCargoWeight('');
    setCargoCost('$1,200.00');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerRef('');
    setPickupAddress('');
    setPickupDate('');
    setPickupContact('');
    setPickupNotes('');
    setDeliveryAddress('');
    setDeliveryDate('');
    setDeliveryContact('');
    setDeliveryNotes('');
    setWizardStops([]);
    setAssignedVehicle('TX-ROAD88');
    setAssignedDriver('John D.');
    setDriverContactInfo('555-0192');
    setDocsRateConf(false);
    setDocsBOL(false);
    setDocsCustoms(false);
  };

  // Wizard Next/Prev
  const handleWizardNext = () => {
    if (wizardStep === 1) {
      if (!customerName || !customerEmail) {
        triggerToast('Customer Name and Email are required.', 'error');
        return;
      }
    }
    if (wizardStep === 2) {
      if (!pickupAddress || !pickupDate) {
        triggerToast('Pickup Address and Date are required.', 'error');
        return;
      }
    }
    if (wizardStep === 3) {
      if (!deliveryAddress || !deliveryDate) {
        triggerToast('Delivery Address and Date are required.', 'error');
        return;
      }
    }
    if (wizardStep === 5) {
      if (!cargoName || !cargoWeight) {
        triggerToast('Cargo description and weight are required.', 'error');
        return;
      }
    }
    setWizardStep(wizardStep + 1);
  };

  // Submit Wizard (Finalize)
  const handleWizardSubmit = (e) => {
    if (e) e.preventDefault();
    dispatch(createLoad({
      status: 'Planned',
      cargo: cargoName,
      weight: `${parseFloat(cargoWeight).toLocaleString()} lbs`,
      route: `${pickupAddress} ➔ ${deliveryAddress}`,
      customerName,
      customerEmail,
      customerPhone,
      customerRef,
      pickupAddress,
      pickupDate,
      pickupContact,
      pickupNotes,
      deliveryAddress,
      deliveryDate,
      deliveryContact,
      deliveryNotes,
      stops: wizardStops,
      vehicle: assignedVehicle,
      driver: assignedDriver,
      cost: cargoCost,
      documents: [
        ...(docsRateConf ? [{ name: 'Rate Confirmation.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(docsBOL ? [{ name: 'Bill of Lading.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(docsCustoms ? [{ name: 'Customs Bond.pdf', type: 'PDF', date: 'Just now', url: '#' }] : [])
      ]
    }));

    triggerToast(`Shipment booked and planned!`);
    setWizardOpen(false);
    resetWizard();
  };

  // Save Draft (can be triggered at any step)
  const handleSaveDraft = () => {
    dispatch(createLoad({
      status: 'Draft',
      cargo: cargoName || 'Draft Cargo',
      weight: cargoWeight ? `${parseFloat(cargoWeight).toLocaleString()} lbs` : '0 lbs',
      route: `${pickupAddress || 'Unassigned'} ➔ ${deliveryAddress || 'Unassigned'}`,
      customerName,
      customerEmail,
      customerPhone,
      customerRef,
      pickupAddress,
      pickupDate,
      pickupContact,
      pickupNotes,
      deliveryAddress,
      deliveryDate,
      deliveryContact,
      deliveryNotes,
      stops: wizardStops,
      vehicle: assignedVehicle,
      driver: assignedDriver,
      cost: cargoCost,
      documents: [
        ...(docsRateConf ? [{ name: 'Rate Confirmation.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(docsBOL ? [{ name: 'Bill of Lading.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(docsCustoms ? [{ name: 'Customs Bond.pdf', type: 'PDF', date: 'Just now', url: '#' }] : [])
      ]
    }));

    triggerToast(`Load saved as draft successfully.`);
    setWizardOpen(false);
    resetWizard();
  };

  const handleAddWizardStop = () => {
    if (!stopAddress.trim()) {
      triggerToast('Stop address is required.', 'error');
      return;
    }
    setWizardStops([
      ...wizardStops,
      { id: Date.now(), address: stopAddress.trim(), type: stopType, notes: stopNotes.trim() || 'General Stop', sequence: wizardStops.length + 1 }
    ]);
    setStopAddress('');
    setStopNotes('');
    triggerToast('Intermediate stop added.');
  };

  const handleRemoveWizardStop = (stopId) => {
    setWizardStops(wizardStops.filter(s => s.id !== stopId).map((s, idx) => ({ ...s, sequence: idx + 1 })));
    triggerToast('Stop removed.');
  };

  const handleAddPlannerStop = () => {
    if (!plannerStopAddress.trim()) {
      triggerToast('Stop address is required.', 'error');
      return;
    }
    setPlannerStops([
      ...plannerStops,
      { id: Date.now(), address: plannerStopAddress.trim(), type: plannerStopType, duration: parseFloat(plannerStopDuration) || 2 }
    ]);
    setPlannerStopAddress('');
    triggerToast('Stop added to planner.');
  };

  const handleRemovePlannerStop = (stopId) => {
    setPlannerStops(plannerStops.filter(s => s.id !== stopId));
    triggerToast('Stop removed from planner.');
  };

  // Search Route Planner
  const handleCalculateRoute = (e) => {
    e.preventDefault();
    if (!plannerOrigin || !plannerDest) return;
    
    // Mock distance calculation logic
    const baseDistance = Math.floor(Math.random() * 200) + 380; // 380 - 580 miles base
    const stopDistanceAdd = plannerStops.length * 140;
    const totalDistance = baseDistance + stopDistanceAdd;
    
    const speed = parseFloat(averageSpeed) || 60;
    const drivingHours = totalDistance / speed;
    const stopLayoverHours = plannerStops.reduce((sum, s) => sum + s.duration, 0);
    const trafficMultiplier = trafficDelay === 'Heavy' ? 1.35 : trafficDelay === 'Light' ? 1.12 : 1.0;
    const totalDurationHours = (drivingHours + stopLayoverHours) * trafficMultiplier;
    
    const fuelGals = Math.floor(totalDistance / 6.2); // average 6.2 mpg
    
    let fuelPricePerGal = 3.90;
    if (optimizationMode === 'Minimize Fuel') fuelPricePerGal = 3.65;
    
    let baseTollCost = 145;
    if (optimizationMode === 'Avoid Tolls') baseTollCost = 0;
    
    const totalCostVal = (fuelGals * fuelPricePerGal) + baseTollCost + (plannerStops.length * 110);

    setPlannerResult({
      distance: `${totalDistance} Miles`,
      duration: `${totalDurationHours.toFixed(1)} Hours`,
      fuel: `${fuelGals} Gallons`,
      estCost: `$${totalCostVal.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      stopsCount: plannerStops.length
    });
    triggerToast('Optimized routes calculated.');
  };

  // Chat message submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage) return;
    setChats([{ id: Date.now(), sender: 'Dispatcher Operator', msg: newMessage, time: 'Just now' }, ...chats]);
    setNewMessage('');
    triggerToast('Dispatch message sent.');
  };

  // Open load details in side drawer
  const handleOpenLoad = (load) => {
    setSelectedLoad(load);
    setDrawerTab('details');
    setDrawerOpen(true);
  };

  // Transition load through lifecycle stages
  const handleStatusTransition = (newStatus) => {
    if (!selectedLoadDetail) return;
    dispatch(updateLoadStatus({ 
      id: selectedLoadDetail.id, 
      status: newStatus,
      statusNote: `Status advanced to ${newStatus}`
    }));
    triggerToast(`Load status updated to ${newStatus}`);
  };

  // Add notes to load record
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLoadDetail) return;
    const currentNotes = selectedLoadDetail.notes || [];
    dispatch(updateLoadStatus({
      id: selectedLoadDetail.id,
      notes: [...currentNotes, newNoteText.trim()],
      statusNote: `Added note: "${newNoteText.trim()}"`
    }));
    setNewNoteText('');
    triggerToast('Note successfully recorded.');
  };

  const filteredLoads = loads.filter((l) => {
    const matchesSearch = l.route.toLowerCase().includes(search.toLowerCase()) || 
                          l.driver.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === '' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLoads.length / itemsPerPage);
  const paginatedLoads = filteredLoads.slice(
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
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Dispatcher • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Match loads, track route geofences, and message terminal drivers.</p>
        </div>

        {activeTab === 'loads' && (
          <Button variant="primary" icon={Plus} onClick={() => { setWizardStep(1); setWizardOpen(true); }}>
            Create Load Wizard
          </Button>
        )}
      </div>

      {loading && loads.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Unassigned Loads" value={`${unassignedCount} Loads`} description="Matching queue pending" trend="-2" trendDirection="down" />
                <StatCard title="Active Transits" value={loads.filter(l => l.status === 'Transit').length} description="In interstate coordinates" trend="+4" trendDirection="up" />
                <StatCard title="Available Drivers" value={`${driverCount} Fleet`} description="Awaiting cargo match" trend="Stable" trendDirection="neutral" />
                <StatCard title="Delayed Shipments" value={loads.filter(l => l.status === 'Delayed').length} description="Requires dispatch call" trend="Alert" trendDirection="down" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Visual map preview */}
                <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[340px] lg:h-auto min-h-[300px]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-1">Live GIS Route Map</h3>
                    <p className="text-[10px] text-slate-500">Live fleet coordinates mapped via Google Maps.</p>
                  </div>
                  <div className="flex-1 bg-[#0B0F19] rounded-xl border border-[#23324C] relative overflow-hidden flex items-center justify-center my-4 min-h-[200px]">
                    <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <svg className="absolute inset-0 w-full h-full">
                      <path d="M 60 120 Q 140 60 220 180" fill="none" stroke="#23324c" strokeWidth="2" strokeDasharray="4,4" />
                      <path d="M 80 80 L 260 120" fill="none" stroke="#0ea0ea" strokeWidth="2.5" strokeOpacity="0.4" />
                    </svg>
                    <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-[#0B0F19] animate-ping" />
                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#0B0F19]" />
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
                  </div>
                </div>

                {/* Dispatch Activity Inbox */}
                <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                  <h3 className="text-sm font-extrabold text-white mb-3">Operator Live Logs</h3>
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {chats.map(log => (
                      <div key={log.id} className="p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl text-[11px] leading-relaxed">
                        <div className="flex justify-between font-bold text-white mb-1">
                          <span>{log.sender}</span>
                          <span className="text-slate-500 font-mono text-[9px]">{log.time}</span>
                        </div>
                        <p className="text-slate-400">"{log.msg}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Loads screen */}
          {activeTab === 'loads' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">Active Cargo Loads</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} className="max-w-[200px]" />
                  <SelectInput value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Planned', label: 'Planned' },
                    { value: 'Assigned', label: 'Assigned' },
                    { value: 'In Transit', label: 'In Transit' },
                    { value: 'Delivered', label: 'Delivered' },
                    { value: 'Invoiced', label: 'Invoiced' },
                    { value: 'Closed', label: 'Closed' }
                  ]} className="max-w-[150px]" />
                </div>
              </div>

              {filteredLoads.length === 0 ? (
                <EmptyState title="No Shipments matches" description="Search index empty. Setup a load dispatch card wizard." icon={Layers} actionLabel="Create Load" onAction={() => setWizardOpen(true)} />
              ) : (
                <>
                  <DataTable columns={[
                    { key: 'route', label: 'Origin/Destination Path', render: (row) => <span className="font-extrabold text-white">{row.route}</span> },
                    { key: 'driver', label: 'Driver', render: (row) => <span className="text-slate-300 font-semibold">{row.driver}</span> },
                    { key: 'weight', label: 'Weight Specs', render: (row) => <span className="font-mono text-[11px]">{row.weight}</span> },
                    { key: 'status', label: 'Transit Status', render: (row) => <StatusBadge status={row.status} /> },
                    { key: 'eta', label: 'ETA Timer', render: (row) => <span className="text-brand-400 font-mono font-bold">{row.eta || 'N/A'}</span> },
                    { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => handleOpenLoad(row)}>Track GPS</Button> }
                  ]} data={paginatedLoads} />
                  
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          )}

          {/* Planning Board Screen */}
          {activeTab === 'planning-board' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Active Cargo Timelines</h3>
              <div className="space-y-4">
                {loads.map(load => (
                  <div key={load.id} className="p-4 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block font-bold">{load.route}</strong>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Driver: {load.driver} • {load.weight}</span>
                      </div>
                      <StatusBadge status={load.status} />
                    </div>

                    {/* Progress timeline meter */}
                    <div className="relative">
                      <div className="w-full bg-slate-800 rounded-full h-1" />
                      <div className={`h-1.5 rounded-full absolute top-[-1px] ${
                        load.status === 'Delivered' ? 'bg-emerald-500 w-full' : load.status === 'Transit' ? 'bg-brand-500 w-2/3' : 'bg-slate-500 w-1/3'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route Planner & GIS Screen */}
          {activeTab === 'route-planner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Planner settings */}
              <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Route Optimization Planner</h3>
                  <p className="text-[10px] text-slate-400">Configure stops, simulate traffic speed variables, and calculate fuel cost margins.</p>
                </div>
                
                <form onSubmit={handleCalculateRoute} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Route Origin" required value={plannerOrigin} onChange={(e) => setPlannerOrigin(e.target.value)} />
                    <TextInput label="Route Destination" required value={plannerDest} onChange={(e) => setPlannerDest(e.target.value)} />
                  </div>

                  {/* Stop Manager Sub-panel */}
                  <div className="p-3.5 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Add Intermediate Stops</span>
                    
                    {plannerStops.length > 0 && (
                      <div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
                        {plannerStops.map((stop) => (
                          <div key={stop.id} className="flex justify-between items-center p-2.5 bg-slate-900/60 border border-[#23324C]/40 rounded-lg text-[11px]">
                            <span className="text-slate-200 truncate max-w-[160px] font-bold">{stop.address} ({stop.type})</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-slate-500 font-mono">{stop.duration}h delay</span>
                              <button type="button" onClick={() => handleRemovePlannerStop(stop.id)} className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2.5">
                      <TextInput placeholder="Stop location name..." value={plannerStopAddress} onChange={(e) => setPlannerStopAddress(e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <SelectInput value={plannerStopType} onChange={(e) => setPlannerStopType(e.target.value)} options={[
                          { value: 'Layover', label: 'Layover Rest' },
                          { value: 'Customs', label: 'Customs Clear' },
                          { value: 'Border', label: 'Border Check' },
                          { value: 'Fuel', label: 'Fuel Stop' }
                        ]} />
                        <TextInput type="number" placeholder="Duration (hrs)" value={plannerStopDuration} onChange={(e) => setPlannerStopDuration(e.target.value)} />
                      </div>
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAddPlannerStop}>
                        Add Stop Location
                      </Button>
                    </div>
                  </div>

                  {/* ETA Simulator Parameters */}
                  <div className="p-3.5 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">ETA Simulation Controls</span>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Avg Speed (mph)</label>
                        <input 
                          type="range" min="45" max="75" step="5" 
                          value={averageSpeed} onChange={(e) => setAverageSpeed(e.target.value)} 
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" 
                        />
                        <span className="font-mono text-[10px] text-brand-400 mt-1 block">{averageSpeed} mph</span>
                      </div>
                      <SelectInput label="Traffic delays" value={trafficDelay} onChange={(e) => setTrafficDelay(e.target.value)} options={[
                        { value: 'None', label: 'None (Smooth)' },
                        { value: 'Light', label: 'Light congestion (+12%)' },
                        { value: 'Heavy', label: 'Heavy Traffic (+35%)' }
                      ]} />
                    </div>
                  </div>

                  {/* Route Optimization UI Options */}
                  <SelectInput label="Optimization Protocol" value={optimizationMode} onChange={(e) => setOptimizationMode(e.target.value)} options={[
                    { value: 'Fastest Route', label: 'Fastest Route (Default)' },
                    { value: 'Minimize Fuel', label: 'Fuel Efficient Route' },
                    { value: 'Avoid Tolls', label: 'Avoid Turnpike Tolls' },
                    { value: 'Multi-drop Optimized', label: 'Stops Optimized Sequencer' }
                  ]} />
                  
                  <Button type="submit" variant="primary" className="w-full">
                    Recompute Dispatch Routing
                  </Button>
                </form>

                {plannerResult && (
                  <div className="border-t border-[#23324C]/60 pt-4 space-y-3.5 text-xs text-slate-350">
                    <div className="flex justify-between">
                      <span>Total Distance</span>
                      <strong className="text-white">{plannerResult.distance}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Intermediate Stops</span>
                      <strong className="text-white">{plannerResult.stopsCount} stops</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Drive & Layover Duration</span>
                      <strong className="text-white">{plannerResult.duration}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Consumption</span>
                      <strong className="text-white">{plannerResult.fuel}</strong>
                    </div>
                    <div className="flex justify-between border-t border-[#23324C]/45 pt-2 text-brand-400 font-bold">
                      <span>Estimated Expense Cost</span>
                      <span>{plannerResult.estCost}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Routing map previews */}
              <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[450px] lg:h-auto min-h-[350px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">GIS Optimized Route Map</h3>
                  <p className="text-[10px] text-slate-500">Route paths calculated showing waypoint stops.</p>
                </div>
                
                <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden min-h-[260px]">
                  <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  <svg className="absolute inset-0 w-full h-full">
                    {/* SVG map visual representation */}
                    <circle cx="60" cy="200" r="6" fill="#3b82f6" />
                    <text x="75" y="204" fill="#64748b" className="text-[10px] font-bold font-mono uppercase">Origin</text>
                    
                    {plannerStops.map((stop, idx) => {
                      const cx = 100 + idx * 70;
                      const cy = 160 - idx * 20;
                      return (
                        <g key={stop.id}>
                          <circle cx={cx} cy={cy} r="5" fill="#f59e0b" />
                          <line x1={idx === 0 ? 60 : 100 + (idx - 1) * 70} y1={idx === 0 ? 200 : 160 - (idx - 1) * 20} x2={cx} y2={cy} stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,3" />
                          <text x={cx + 10} y={cy + 4} fill="#94a3b8" className="text-[9px] font-mono">{stop.address.split(',')[0]}</text>
                        </g>
                      );
                    })}
                    
                    {plannerResult && (
                      <>
                        <circle cx="340" cy="100" r="6" fill="#10b981" />
                        <text x="355" y="104" fill="#10b981" className="text-[10px] font-bold font-mono uppercase">Destination</text>
                        
                        <path 
                          d={plannerStops.length > 0 
                            ? `M 60 200 ${plannerStops.map((s, idx) => `L ${100 + idx * 70} ${160 - idx * 20}`).join(' ')} L 340 100`
                            : "M 60 200 Q 180 120 340 100"
                          } 
                          fill="none" 
                          stroke="#0ea0ea" 
                          strokeWidth="3.5" 
                          className="animate-pulse" 
                        />
                      </>
                    )}
                  </svg>
                  
                  <span className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-mono font-bold uppercase">
                    {plannerResult ? `[ Optimal Path Coordinates Calculated: ${plannerResult.distance} ]` : '[ Awaiting route planning parameters ]'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dispatch Calendar Screen */}
          {activeTab === 'calendar' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Upcoming Delivery Runs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loads.map(load => (
                  <div key={load.id} className="p-4 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl flex items-start gap-3">
                    <CalendarIcon className="h-6 w-6 text-brand-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <strong className="text-white text-xs block font-bold truncate">{load.route}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Driver: {load.driver} • ETA: {load.eta}</span>
                      <span className="text-[9px] font-mono text-slate-500">Scheduled: 06/20/2026</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Tracking Screen UI & Chat Console */}
          {activeTab === 'tracking' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* GIS Map tracking */}
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[380px] lg:h-auto min-h-[300px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Live Fleet GIS Positioning</h3>
                  <p className="text-[10px] text-slate-500">Google Map overlay coordinates.</p>
                </div>
                <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden min-h-[220px]">
                  <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-brand-500 rounded-full animate-ping" />
                  <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 bg-brand-500 rounded-full border border-[#0B0F19]" />
                  
                  <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <div className="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0B0F19]" />
                </div>
              </div>

              {/* Chat console */}
              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[380px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Driver Inbox Communication</h3>
                  <p className="text-[10px] text-slate-500">Live chat updates.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-none flex flex-col-reverse">
                  {chats.map(chat => (
                    <div key={chat.id} className="p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl text-[11px] leading-relaxed">
                      <div className="flex justify-between font-bold text-white mb-0.5">
                        <span>{chat.sender}</span>
                        <span className="text-slate-500 font-mono text-[9px]">{chat.time}</span>
                      </div>
                      <p className="text-slate-400">"{chat.msg}"</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[#23324C]/40 pt-3">
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message active drivers..."
                    className="flex-grow px-3 py-2 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-500"
                  />
                  <Button type="submit" variant="primary" className="flex-shrink-0" icon={Send} />
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Load Multi-Step Wizard Modal */}
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="Create Load Wizard Stepper">
        <div className="space-y-5 text-left max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Progress Timeline Stepper */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] font-bold text-slate-500 tracking-wide uppercase border-b border-[#23324C]/45 pb-3">
            {[
              '1. Customer', '2. Pickup', '3. Delivery', '4. Stops', 
              '5. Vehicle', '6. Driver', '7. Docs', '8. Review'
            ].map((stepLabel, idx) => (
              <span key={idx} className={wizardStep === idx + 1 ? 'text-brand-400 font-black border-b border-brand-500 pb-1' : ''}>
                {stepLabel}
              </span>
            ))}
          </div>

          <form onSubmit={handleWizardSubmit} className="space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 1: Customer Information</h4>
                <TextInput label="Customer / Shipper Name" required placeholder="e.g. Vance Refrigeration" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                <TextInput label="Contact Billing Email" type="email" required placeholder="billing@vance.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                <TextInput label="Contact Phone Number" placeholder="555-0912" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                <TextInput label="Customer Reference / PO#" placeholder="PO-10294" value={customerRef} onChange={(e) => setCustomerRef(e.target.value)} />
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 2: Pickup details</h4>
                <TextInput label="Pickup Origin Address" required placeholder="e.g. Chicago HQ Terminal, 100 Logistics Blvd" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
                <TextInput label="Pickup Scheduled Date / Time" required type="datetime-local" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                <TextInput label="Site Contact Representative" placeholder="e.g. Bob Evans" value={pickupContact} onChange={(e) => setPickupContact(e.target.value)} />
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Special Loading Instructions</label>
                  <textarea
                    placeholder="e.g. Flatbed tarps needed."
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    className="w-full min-h-20 px-3.5 py-2.5 bg-[#111827]/80 border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/35 placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 3: Delivery dropoff details</h4>
                <TextInput label="Delivery Dropoff Address" required placeholder="e.g. Dallas Depot, 400 Freight Rd, Dallas TX" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
                <TextInput label="Delivery Scheduled Date / Time" required type="datetime-local" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                <TextInput label="Site Contact Representative" placeholder="e.g. Alice Cooper" value={deliveryContact} onChange={(e) => setDeliveryContact(e.target.value)} />
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Special Offloading Instructions</label>
                  <textarea
                    placeholder="e.g. Check trailer seals before offload."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full min-h-20 px-3.5 py-2.5 bg-[#111827]/80 border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/35 placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 4: Intermediate Stops Manager</h4>
                
                {/* List of currently added stops */}
                {wizardStops.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {wizardStops.map((stop) => (
                      <div key={stop.id} className="flex items-center justify-between p-3 bg-slate-900/60 border border-[#23324C]/60 rounded-xl text-xs">
                        <div>
                          <strong className="text-white block">#{stop.sequence}: {stop.address}</strong>
                          <span className="text-[10px] text-slate-400">{stop.type} • {stop.notes}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveWizardStop(stop.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add stop sub-form */}
                <div className="p-4 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
                  <TextInput label="Intermediate Stop Address" value={stopAddress} onChange={(e) => setStopAddress(e.target.value)} placeholder="e.g. St. Louis Terminal yard, MO" />
                  <SelectInput label="Stop Classification Type" value={stopType} onChange={(e) => setStopType(e.target.value)} options={[
                    { value: 'Layover', label: 'Driver Layover / Rest' },
                    { value: 'Customs', label: 'Customs Clear check' },
                    { value: 'Border Crossing', label: 'Border Checkpoint' },
                    { value: 'Split Terminal', label: 'Cargo Splitting node' }
                  ]} />
                  <TextInput label="Stop Notes / Window Time" value={stopNotes} onChange={(e) => setStopNotes(e.target.value)} placeholder="e.g. 2-hour rest, gate 5" />
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAddWizardStop}>
                    Add Intermediate Stop
                  </Button>
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 5: Cargo Specs & Vehicle</h4>
                <TextInput label="Cargo Description" required placeholder="e.g. Dry Grocery Pallets" value={cargoName} onChange={(e) => setCargoName(e.target.value)} />
                <TextInput label="Cargo weight (lbs)" required type="number" placeholder="e.g. 24000" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} />
                
                <SelectInput label="Assign Active Fleet Vehicle" value={assignedVehicle} onChange={(e) => setAssignedVehicle(e.target.value)} options={
                  (fleet || []).map(v => ({ value: v.plate, label: `${v.plate} (${v.type} - Capacity: ${v.capacity})` }))
                } />
                
                <SelectInput label="Trailer specification" value={trailerType} onChange={(e) => setTrailerType(e.target.value)} options={[
                  { value: 'Semi-Truck', label: 'Standard Semi-Truck Cab' },
                  { value: 'Flatbed Trailer', label: 'Flatbed trailer configuration' },
                  { value: 'Dry Van', label: '53ft Dry Van Container' },
                  { value: 'Reefer', label: 'Reefer Container (Cold)' }
                ]} />
              </div>
            )}

            {wizardStep === 6 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 6: Driver Operator Assignment</h4>
                
                <SelectInput label="Assign Available Driver" value={assignedDriver} onChange={(e) => setAssignedDriver(e.target.value)} options={
                  (drivers || []).map(d => ({ value: d.name, label: `${d.name} (${d.status} - Rating: ★${d.rating})` }))
                } />
                
                <TextInput label="Secondary Dispatch contact phone" placeholder="555-0192" value={driverContactInfo} onChange={(e) => setDriverContactInfo(e.target.value)} />
              </div>
            )}

            {wizardStep === 7 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 7: Documents Checklist</h4>
                <p className="text-[11px] text-slate-400">Select files to attach to this load manifest confirmation.</p>
                
                <div className="space-y-3.5">
                  <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] hover:border-brand-500/20 rounded-xl cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-200">Rate Confirmation Contract.pdf</span>
                    <input type="checkbox" checked={docsRateConf} onChange={(e) => setDocsRateConf(e.target.checked)} className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] hover:border-brand-500/20 rounded-xl cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-200">Bill of Lading (BOL).pdf</span>
                    <input type="checkbox" checked={docsBOL} onChange={(e) => setDocsBOL(e.target.checked)} className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] hover:border-brand-500/20 rounded-xl cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-200">Customs manifest bond declaration.pdf</span>
                    <input type="checkbox" checked={docsCustoms} onChange={(e) => setDocsCustoms(e.target.checked)} className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5" />
                  </label>
                </div>
              </div>
            )}

            {wizardStep === 8 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 8: Review Shipment Order</h4>
                
                <div className="divide-y divide-[#23324C]/60 bg-slate-900/60 border border-[#23324C] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Customer Name</span>
                    <strong className="text-white font-bold">{customerName}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Pickup Location</span>
                    <span className="text-white truncate max-w-[200px] text-right font-medium">{pickupAddress}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Delivery Dropoff</span>
                    <span className="text-white truncate max-w-[200px] text-right font-medium">{deliveryAddress}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Stops Scheduled</span>
                    <strong className="text-white font-bold">{wizardStops.length} stops</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Cargo description</span>
                    <strong className="text-white font-bold">{cargoName} ({parseFloat(cargoWeight || 0).toLocaleString()} lbs)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Assigned Driver & Vehicle</span>
                    <strong className="text-brand-400 font-bold">{assignedDriver} / {assignedVehicle}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Documents attached</span>
                    <span className="text-white font-bold">
                      {[docsRateConf && 'RateConf', docsBOL && 'BOL', docsCustoms && 'Customs'].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex gap-2 justify-between border-t border-[#23324C]/40 pt-4">
              <div>
                <Button type="button" variant="secondary" size="sm" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
              </div>

              <div className="flex gap-2">
                {wizardStep > 1 && (
                  <Button type="button" variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setWizardStep(wizardStep - 1)}>
                    Back
                  </Button>
                )}
                {wizardStep < 8 ? (
                  <Button type="button" variant="primary" size="sm" icon={ArrowRight} iconPosition="right" onClick={handleWizardNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" size="sm" icon={Check}>
                    Book & Plan Shipment
                  </Button>
                )}
              </div>
            </div>
          </form>

        </div>
      </Modal>

      {/* Load inspect details drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Active Route Inspector">
        {selectedLoadDetail && (
          <div className="space-y-6 text-left text-slate-300 text-xs sm:text-sm flex flex-col h-full">
            <div className="border-b border-slate-200 dark:border-[#23324C]/60 pb-4">
              <h4 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">{selectedLoadDetail.route}</h4>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={selectedLoadDetail.status} />
                <span className="text-[10px] font-bold font-mono text-slate-400">{selectedLoadDetail.loadId}</span>
              </div>
            </div>

            <Tabs 
              tabs={[
                { id: 'details', label: 'Details', icon: User },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'docs', label: 'Documents', icon: FileText },
                { id: 'notes', label: 'Notes', icon: MessageSquare },
                { id: 'feed', label: 'Activity', icon: Activity }
              ]} 
              activeTab={drawerTab} 
              onChange={setDrawerTab} 
              className="border-slate-200 dark:border-slate-800"
            />

            <div className="flex-1 overflow-y-auto py-2">
              {drawerTab === 'details' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Driver</span>
                      <strong className="text-slate-800 dark:text-white text-xs block mt-1">{selectedLoadDetail.driver}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{selectedLoadDetail.contact}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Vehicle / Weight</span>
                      <strong className="text-slate-800 dark:text-white text-xs block mt-1">{selectedLoadDetail.vehicle || 'TX-ROAD88'}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{selectedLoadDetail.weight}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">ETA</span>
                      <strong className="text-brand-500 text-xs block mt-1">{selectedLoadDetail.eta || 'Calculating'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Rate / Valuation</span>
                      <strong className="text-emerald-500 text-xs block mt-1">{selectedLoadDetail.cost}</strong>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 dark:bg-[#0b0f19]/30 border border-slate-200 dark:border-[#23324C]/60 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Advance Lifecycle Status</span>
                    <select 
                      value={selectedLoadDetail.status}
                      onChange={(e) => handleStatusTransition(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#23324C] rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
                    >
                      {['Draft', 'Planned', 'Assigned', 'In Transit', 'Delivered', 'Invoiced', 'Closed'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div className="space-y-4 py-1 animate-fade-in">
                  {['Draft', 'Planned', 'Assigned', 'In Transit', 'Delivered', 'Invoiced', 'Closed'].map((step, idx, arr) => {
                    const historyList = selectedLoadDetail.statusHistory || [];
                    const isCompleted = historyList.some(sh => sh.status === step) || step === selectedLoadDetail.status;
                    const isCurrent = step === selectedLoadDetail.status;
                    const stepHistory = historyList.find(sh => sh.status === step);

                    return (
                      <div key={step} className="flex gap-3 relative">
                        {idx < arr.length - 1 && (
                          <div className={`absolute left-3 top-6 bottom-[-20px] w-0.5 ${
                            isCompleted ? 'bg-brand-500' : 'bg-slate-200 dark:bg-[#23324C]'
                          }`} />
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0 z-10 ${
                          isCurrent 
                            ? 'bg-brand-500 border-brand-500 text-white animate-pulse-slow' 
                            : isCompleted
                            ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="text-left">
                          <h5 className={`text-xs font-bold ${isCurrent ? 'text-brand-500' : isCompleted ? 'text-slate-850 dark:text-slate-200' : 'text-slate-400'}`}>
                            {step}
                          </h5>
                          {stepHistory && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">{stepHistory.note} • {stepHistory.time}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {drawerTab === 'docs' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    {(selectedLoadDetail.documents || []).length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No documents uploaded.</p>
                    ) : (
                      (selectedLoadDetail.documents || []).map((doc, dIdx) => (
                        <div key={dIdx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4.5 w-4.5 text-brand-400" />
                            <div className="text-left">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block leading-tight">{doc.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{doc.date} • {doc.type}</span>
                            </div>
                          </div>
                          <a href="#" onClick={(e) => { e.preventDefault(); alert(`Downloading mock file: ${doc.name}`); }} className="text-[10px] text-brand-500 dark:text-brand-400 font-bold hover:underline">
                            Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const updatedDocs = [
                          ...(selectedLoadDetail.documents || []),
                          { name: 'Weight Ticket.pdf', type: 'PDF', date: 'Just now', url: '#' }
                        ];
                        dispatch(updateLoadStatus({ id: selectedLoadDetail.id, documents: updatedDocs, statusNote: 'Attached Weight Ticket' }));
                        triggerToast('Weight Ticket.pdf attached successfully.');
                      }}
                    >
                      Attach Mock Weight Ticket
                    </Button>
                  </div>
                </div>
              )}

              {drawerTab === 'notes' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedLoadDetail.notes || []).length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notes on record.</p>
                    ) : (
                      (selectedLoadDetail.notes || []).map((note, nIdx) => (
                        <div key={nIdx} className="p-3 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-[#23324C]/40 rounded-xl text-left">
                          <p className="text-slate-700 dark:text-slate-350 font-semibold">{note}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <TextInput 
                      placeholder="Add shipment note..." 
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-grow !py-2"
                    />
                    <Button type="submit" variant="primary" className="h-10 mt-auto">Add</Button>
                  </form>
                </div>
              )}

              {drawerTab === 'feed' && (
                <div className="max-h-80 overflow-y-auto pr-1 animate-fade-in">
                  <ActivityTimeline 
                    items={(selectedLoadDetail.activities || []).map(act => ({
                      title: act.message,
                      desc: `Triggered by ${act.user}`,
                      time: act.time,
                      status: 'info'
                    }))} 
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-200 dark:border-[#23324C]/60 pt-4 mt-auto">
              <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(false)} className="w-full">
                Close Tracking Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
