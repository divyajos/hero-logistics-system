import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads, createLoad, updateLoadStatus } from '../../store/slices/loadsSlice';
import { fetchDrivers } from '../../store/slices/driversSlice';
import { fetchVehicles } from '../../store/slices/vehiclesSlice';
import { fetchCustomerInstructions } from '../../store/slices/customersSlice';
import { useLogistics } from '../../context/LogisticsContext';
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
  MapPin, MessageSquare, ArrowRight, ArrowLeft, Send, Calendar as CalendarIcon, FileText, Activity, Trash2, Filter, Info, Eye
} from 'lucide-react';

export default function DispatchDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { items: loads, unassignedCount, driverCount, delayCount, loading } = useSelector((state) => state.loads);
  const { drivers } = useSelector((state) => state.drivers);
  const { fleet } = useSelector((state) => state.vehicles);
  const { customerInstructions } = useSelector((state) => state.customers);
  const { user } = useSelector((state) => state.auth);
  
  const { 
    selectedNiche,
    setSelectedNiche,
    aiQueue, 
    resolveAiItem, 
    transfers, 
    initiateTransfer, 
    acceptTransfer, 
    rejectTransfer 
  } = useLogistics();

  // Selected overview load for Centre/Right panels
  const [selectedOverviewLoadId, setSelectedOverviewLoadId] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterRequiredDate, setFilterRequiredDate] = useState('');
  const [filterNicheType, setFilterNicheType] = useState('');
  const [filterVehicleTrailer, setFilterVehicleTrailer] = useState('');
  const [filterAvailableWorkersOnly, setFilterAvailableWorkersOnly] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 11-Step Create Load Stepper State
  const [createStep, setCreateStep] = useState(1);
  const [newLoadHeader, setNewLoadHeader] = useState({
    loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
    niche: 'general_freight',
    branch: 'Chicago HQ Terminal',
    requiredDate: ''
  });
  const [newStops, setNewStops] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [newDocs, setNewDocs] = useState({
    rateConf: false,
    bol: false,
    customs: false
  });
  const [newNotes, setNewNotes] = useState('');
  
  // Create stop inputs
  const [stopAddress, setStopAddress] = useState('');
  const [stopType, setStopType] = useState('Pickup');
  const [stopNotes, setStopNotes] = useState('');
  
  // Create item inputs
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemVin, setItemVin] = useState('');
  const [itemRego, setItemRego] = useState('');
  const [itemPallets, setItemPallets] = useState('');
  const [itemHazmatClass, setItemHazmatClass] = useState('');
  const [itemUnNumber, setItemUnNumber] = useState('');
  const [itemCustLink, setItemCustLink] = useState('');

  // Link Items mapping: itemId -> stopId
  const [itemPickupLinks, setItemPickupLinks] = useState({});
  const [itemDeliveryLinks, setItemDeliveryLinks] = useState({});
  
  // Stepper Assignment selections
  const [assignedDriver, setAssignedDriver] = useState('');
  const [assignedVehicle, setAssignedVehicle] = useState('');
  const [assignedTrailer, setAssignedTrailer] = useState('TR-4022');
  const [swapReason, setSwapReason] = useState('');

  // Dispatch Chat Inbox State
  const [chats, setChats] = useState([
    { id: 1, sender: 'John D. (Driver)', msg: 'Toll plaza passed on I-35 TX. ETA on target.', time: '10 min ago' },
    { id: 2, sender: 'Sarah R. (Driver)', msg: 'Straps checked. Cargo secured. Departing terminal.', time: '35 min ago' },
    { id: 3, sender: 'System Node', msg: 'Dispatch Load LD-9411 geofence breached Dallas.', time: '2 hours ago' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Modals & Drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');
  const [newNoteText, setNewNoteText] = useState('');
  
  // Assign Vehicle Modal State
  const [isAssignVehicleModalOpen, setIsAssignVehicleModalOpen] = useState(false);
  const [assignVehicleForm, setAssignVehicleForm] = useState({
    loadId: '',
    vehicleId: '',
    driver: '',
    trailer: '',
    notes: ''
  });
  
  // Selected load details reactively updated from Redux store state
  const selectedLoadDetail = loads.find(l => l.id === selectedLoad?.id) || selectedLoad;
  const selectedOverviewLoad = loads.find(l => l.id === selectedOverviewLoadId) || loads[0];

  // Trailer swap in-drawer state
  const [newTrailerPlate, setNewTrailerPlate] = useState('TR-9118');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    dispatch(fetchLoads());
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
    dispatch(fetchCustomerInstructions());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage) return;
    setChats([{ id: Date.now(), sender: 'Dispatcher (You)', msg: newMessage, time: 'Just now' }, ...chats]);
    setNewMessage('');
    triggerToast('Message dispatched to driver.');
  };

  const handleStatusTransition = (newStatus) => {
    if (!selectedLoadDetail) return;
    dispatch(updateLoadStatus({ 
      id: selectedLoadDetail.id, 
      status: newStatus,
      statusNote: `Status advanced to ${newStatus} by Dispatcher`
    }));
    triggerToast(`Load status updated to ${newStatus}`);
  };

  const handleTrailerSwap = () => {
    if (!selectedLoadDetail) return;
    const oldTrailer = selectedLoadDetail.trailer || 'TR-4022';
    if (newTrailerPlate === oldTrailer) {
      triggerToast('New trailer must be different from current trailer.', 'error');
      return;
      }
    if (!swapReason.trim()) {
      triggerToast('Please provide a swap reason.', 'error');
      return;
    }
    const swapRecord = {
      from: oldTrailer,
      to: newTrailerPlate,
      reason: swapReason.trim(),
      timestamp: new Date().toISOString()
    };
    const currentSwapHistory = selectedLoadDetail.trailerSwapHistory || [];
    const updatedSwapHistory = [swapRecord, ...currentSwapHistory];

    dispatch(updateLoadStatus({
      id: selectedLoadDetail.id,
      trailer: newTrailerPlate,
      previousTrailer: oldTrailer,
      trailerSwapReason: swapReason.trim(),
      trailerSwapHistory: updatedSwapHistory,
      statusNote: `Trailer swapped from ${oldTrailer} to ${newTrailerPlate}. Reason: ${swapReason.trim()}`
    }));

    setSwapReason('');
    triggerToast(`Trailer swapped to ${newTrailerPlate} successfully.`);
  };

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

  const handleAssignVehicleSubmit = (e) => {
    e.preventDefault();
    
    if (!assignVehicleForm.vehicleId) {
      triggerToast('Please select a vehicle.', 'error');
      return;
    }

    const targetLoadId = assignVehicleForm.loadId || (loads && loads.length > 0 ? loads[0].id : null);

    const selectedVehicle = fleet.find(v => v.id === assignVehicleForm.vehicleId || v.plate === assignVehicleForm.vehicleId);
    if (!selectedVehicle) {
      triggerToast('Invalid vehicle selected.', 'error');
      return;
    }

    if (selectedVehicle.status === 'Maintenance') {
      triggerToast(`Vehicle ${selectedVehicle.plate} is currently under Maintenance and cannot be assigned.`, 'error');
      return;
    }

    if (targetLoadId) {
      dispatch(updateLoadStatus({
        id: targetLoadId,
        vehicle: selectedVehicle.plate,
        driver: assignVehicleForm.driver || undefined,
        trailer: assignVehicleForm.trailer || undefined,
        statusNote: `Vehicle ${selectedVehicle.plate} assigned to load by Dispatcher. ${assignVehicleForm.notes}`
      }));
    }

    triggerToast(`Vehicle ${selectedVehicle.plate} successfully assigned to load.`);
    setIsAssignVehicleModalOpen(false);
    setAssignVehicleForm({ loadId: '', vehicleId: '', driver: '', trailer: '', notes: '' });
  };

  // Add Stop in 11-step Stepper
  const handleAddStepperStop = () => {
    if (!stopAddress.trim()) {
      triggerToast('Stop address is required.', 'error');
      return;
    }
    const stop = {
      id: `STP-${Date.now()}`,
      address: stopAddress.trim(),
      type: stopType,
      sequence: newStops.length + 1,
      notes: stopNotes.trim() || 'No instructions'
    };
    setNewStops([...newStops, stop]);
    setStopAddress('');
    setStopNotes('');
    triggerToast('Stop successfully added.');
  };

  const handleRemoveStepperStop = (id) => {
    setNewStops(newStops.filter(s => s.id !== id).map((s, idx) => ({ ...s, sequence: idx + 1 })));
    triggerToast('Stop removed.');
  };

  const handleReorderStops = () => {
    // Reverse sequence or shift order to demonstrate reordering
    if (newStops.length < 2) {
      triggerToast('Need at least 2 stops to reorder.', 'warning');
      return;
    }
    const reordered = [...newStops].reverse().map((s, idx) => ({ ...s, sequence: idx + 1 }));
    setNewStops(reordered);
    triggerToast('Stops sequence reordered and optimized.');
  };

  // Add Item in 11-step Stepper
  const handleAddStepperItem = () => {
    if (!itemName.trim()) {
      triggerToast('Item name is required.', 'error');
      return;
    }
    const item = {
      id: `ITM-${Date.now()}`,
      name: itemName.trim(),
      weight: itemWeight.trim() || '0 lbs',
      vin: itemVin.trim(),
      rego: itemRego.trim(),
      pallets: itemPallets.trim(),
      hazmatClass: itemHazmatClass.trim(),
      unNumber: itemUnNumber.trim(),
      customer: itemCustLink.trim() || newLoadHeader.branch
    };
    setNewItems([...newItems, item]);
    setItemName('');
    setItemWeight('');
    setItemVin('');
    setItemRego('');
    setItemPallets('');
    setItemHazmatClass('');
    setItemUnNumber('');
    setItemCustLink('');
    triggerToast('Item added to manifest.');
  };

  const handleRemoveStepperItem = (id) => {
    setNewItems(newItems.filter(i => i.id !== id));
    triggerToast('Item removed.');
  };

  const handleSaveDraft = () => {
    const finalCargo = newItems.map(i => i.name).join(', ') || 'Draft Shipment';
    const totalWeight = `${newItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0)} lbs`;
    
    dispatch(createLoad({
      status: 'Draft',
      loadId: newLoadHeader.loadId,
      cargo: finalCargo,
      weight: totalWeight,
      route: newStops.map(s => s.address).join(' ➔ ') || 'Planned Route',
      pickupAddress: newStops[0]?.address || 'Pending Origin',
      deliveryAddress: newStops[newStops.length - 1]?.address || 'Pending Destination',
      driver: assignedDriver || 'Unassigned',
      vehicle: assignedVehicle || 'Unassigned',
      trailer: assignedTrailer,
      stops: newStops.map(s => ({
        ...s,
        status: 'Pending',
        itemIds: Object.keys(itemPickupLinks).filter(itmId => itemPickupLinks[itmId] === s.id || itemDeliveryLinks[itmId] === s.id)
      })),
      items: newItems,
      customerName: newItems[0]?.customer || 'General Shipper',
      notes: newNotes ? [newNotes] : [],
      documents: [
        ...(newDocs.rateConf ? [{ name: 'Rate Confirmation.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(newDocs.bol ? [{ name: 'Bill of Lading.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(newDocs.customs ? [{ name: 'Customs Manifest.pdf', type: 'PDF', date: 'Just now', url: '#' }] : [])
      ]
    }));

    triggerToast('Load saved as Draft successfully!');
    resetStepper();
  };

  const handleActivateLoad = (dispatchImmediately = false) => {
    if (newStops.length === 0) {
      triggerToast('Must configure at least 1 stop.', 'error');
      return;
    }
    const finalCargo = newItems.map(i => i.name).join(', ') || 'General Cargo';
    const totalWeight = `${newItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0)} lbs`;

    dispatch(createLoad({
      status: dispatchImmediately ? 'In Transit' : 'Planned',
      loadId: newLoadHeader.loadId,
      cargo: finalCargo,
      weight: totalWeight,
      route: newStops.map(s => s.address).join(' ➔ ') || 'Planned Route',
      pickupAddress: newStops[0]?.address || 'Pending Origin',
      deliveryAddress: newStops[newStops.length - 1]?.address || 'Pending Destination',
      driver: assignedDriver || 'Unassigned',
      vehicle: assignedVehicle || 'Unassigned',
      trailer: assignedTrailer,
      stops: newStops.map(s => ({
        ...s,
        status: 'Pending',
        itemIds: Object.keys(itemPickupLinks).filter(itmId => itemPickupLinks[itmId] === s.id || itemDeliveryLinks[itmId] === s.id)
      })),
      items: newItems,
      customerName: newItems[0]?.customer || 'General Shipper',
      notes: newNotes ? [newNotes] : [],
      documents: [
        ...(newDocs.rateConf ? [{ name: 'Rate Confirmation.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(newDocs.bol ? [{ name: 'Bill of Lading.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(newDocs.customs ? [{ name: 'Customs Manifest.pdf', type: 'PDF', date: 'Just now', url: '#' }] : [])
      ]
    }));

    triggerToast(dispatchImmediately ? 'Load dispatched directly!' : 'Load activated & scheduled!');
    resetStepper();
  };

  const resetStepper = () => {
    setCreateStep(1);
    setNewLoadHeader({
      loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
      niche: 'general_freight',
      branch: 'Chicago HQ Terminal',
      requiredDate: ''
    });
    setNewStops([]);
    setNewItems([]);
    setNewDocs({ rateConf: false, bol: false, customs: false });
    setNewNotes('');
    setItemPickupLinks({});
    setItemDeliveryLinks({});
    setAssignedDriver('');
    setAssignedVehicle('');
  };

  // 9-Dimensional filter predicates
  const filteredLoads = loads.filter((l) => {
    const matchesSearch = 
      l.route.toLowerCase().includes(search.toLowerCase()) || 
      l.driver.toLowerCase().includes(search.toLowerCase()) ||
      (l.loadId && l.loadId.toLowerCase().includes(search.toLowerCase())) ||
      (l.cargo && l.cargo.toLowerCase().includes(search.toLowerCase()));
      
    const matchesStatus = filterStatus === '' || l.status === filterStatus;
    
    const matchesBranch = filterBranch === '' || 
      (l.branch && l.branch.toLowerCase().includes(filterBranch.toLowerCase())) ||
      (l.pickupAddress && l.pickupAddress.toLowerCase().includes(filterBranch.toLowerCase()));
      
    const matchesDriver = filterDriver === '' || l.driver === filterDriver;
    
    const matchesCustomer = filterCustomer === '' || 
      (l.customerName && l.customerName === filterCustomer);
      
    const matchesDestination = filterDestination === '' || 
      l.route.toLowerCase().includes(filterDestination.toLowerCase()) ||
      (l.deliveryAddress && l.deliveryAddress.toLowerCase().includes(filterDestination.toLowerCase()));
      
    const matchesDate = filterRequiredDate === '' || 
      (l.pickupDate && l.pickupDate.startsWith(filterRequiredDate)) ||
      (l.deliveryDate && l.deliveryDate.startsWith(filterRequiredDate));
      
    const matchesNiche = filterNicheType === '' || 
      l.niche === filterNicheType ||
      (filterNicheType === 'car_carrying' && l.cargo.toLowerCase().includes('car')) ||
      (filterNicheType === 'dangerous_goods' && l.cargo.toLowerCase().includes('hazmat')) ||
      (filterNicheType === 'general_freight' && !l.cargo.toLowerCase().includes('car') && !l.cargo.toLowerCase().includes('hazmat'));
      
    const matchesVehicleTrailer = filterVehicleTrailer === '' || 
      l.vehicle === filterVehicleTrailer || 
      l.trailer === filterVehicleTrailer;
      
    const matchesAvailableWorkers = !filterAvailableWorkersOnly || 
      (l.driver && drivers.some(d => d.name === l.driver && d.status === 'Active'));

    return matchesSearch && matchesStatus && matchesBranch && matchesDriver && matchesCustomer && matchesDestination && matchesDate && matchesNiche && matchesVehicleTrailer && matchesAvailableWorkers;
  });

  const totalPages = Math.ceil(filteredLoads.length / itemsPerPage);
  const paginatedLoads = filteredLoads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Dispatcher • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Match loads, track route geofences, and audit driver logs.</p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      {loading && loads.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {/* 1. DISPATCH DASHBOARD OVERVIEW LAYOUT */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Collapsible Filter Bar */}
              <div className="glass rounded-xl border border-[#23324C]/65 p-4 text-left">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowFiltersPanel(!showFiltersPanel)}>
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Filter className="h-4 w-4 text-brand-500" />
                    Advanced Load Filter Dashboard ({filteredLoads.length} matched)
                  </span>
                  <span className="text-[10px] text-brand-400 underline">{showFiltersPanel ? 'Hide Filters' : 'Expand Filters'}</span>
                </div>
                
                {showFiltersPanel && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-[#23324C]/40 mt-3 text-xs">
                    <div>
                      <label className="block text-slate-450 mb-1">Branch Terminal</label>
                      <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none">
                        <option value="">All Branches</option>
                        <option value="Chicago">Chicago HQ</option>
                        <option value="Los Angeles">Los Angeles Depot</option>
                        <option value="Atlanta">Atlanta Depot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Status Type</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none">
                        <option value="">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Planned">Planned</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Active Driver</label>
                      <select value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none">
                        <option value="">All Drivers</option>
                        {drivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Customer / Shipper</label>
                      <select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none">
                        <option value="">All Customers</option>
                        <option value="Global Retail Corp">Global Retail Corp</option>
                        <option value="HEB Distributors">HEB Distributors</option>
                        <option value="Seattle Metalworks">Seattle Metalworks</option>
                        <option value="East Coast Textiles">East Coast Textiles</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Destination Search</label>
                      <input type="text" placeholder="e.g. Dallas" value={filterDestination} onChange={(e) => setFilterDestination(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Required Date</label>
                      <input type="date" value={filterRequiredDate} onChange={(e) => setFilterRequiredDate(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Niche Category</label>
                      <select value={filterNicheType} onChange={(e) => setFilterNicheType(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none">
                        <option value="">All Niches</option>
                        <option value="general_freight">General Freight</option>
                        <option value="car_carrying">Car Carrying</option>
                        <option value="dangerous_goods">Dangerous Goods (HAZMAT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1">Vehicle / Trailer Plate</label>
                      <input type="text" placeholder="e.g. TX-ROAD88" value={filterVehicleTrailer} onChange={(e) => setFilterVehicleTrailer(e.target.value)} className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg focus:outline-none" />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={filterAvailableWorkersOnly} onChange={(e) => setFilterAvailableWorkersOnly(e.target.checked)} className="rounded border-[#23324C] text-brand-500 focus:ring-brand-500 h-4.5 w-4.5" />
                        <span>Active Drivers Only</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={() => {
                          setFilterBranch('');
                          setFilterStatus('');
                          setFilterDriver('');
                          setFilterCustomer('');
                          setFilterDestination('');
                          setFilterRequiredDate('');
                          setFilterNicheType('');
                          setFilterVehicleTrailer('');
                          setFilterAvailableWorkersOnly(false);
                          setSearch('');
                          triggerToast('Filters reset.');
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-slate-300 font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended 3-Column Layout: Left (Loads) | Centre (Planning Board) | Right (Live Map) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Column: Load List */}
                <div className="lg:col-span-3 glass rounded-2xl p-4 border border-[#23324C]/60 text-left flex flex-col justify-between max-h-[500px] overflow-hidden">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-2">Dispatcher Load List</h3>
                    <input 
                      type="text" 
                      placeholder="Quick search load/driver..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      className="w-full mb-3 px-3 py-2 bg-[#0B0F19] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                    {filteredLoads.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-8">No matching shipments.</p>
                    ) : (
                      filteredLoads.map((load) => (
                        <div 
                          key={load.id} 
                          onClick={() => setSelectedOverviewLoadId(load.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                            (selectedOverviewLoad?.id === load.id)
                              ? 'bg-brand-500/10 border-brand-500' 
                              : 'bg-[#111827]/40 border-[#23324C]/40 hover:border-[#23324C]'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <strong className="text-white font-mono">{load.loadId || `LD-${load.id}`}</strong>
                            <StatusBadge status={load.status} />
                          </div>
                          <h4 className="text-[11px] font-extrabold text-slate-200 truncate">{load.cargo}</h4>
                          <div className="flex justify-between text-[9px] text-slate-450 mt-1">
                            <span>Driver: {load.driver}</span>
                            <span>{load.weight}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Centre Column: Planning Board */}
                <div className="lg:col-span-5 glass rounded-2xl p-4 border border-[#23324C]/60 text-left flex flex-col justify-between max-h-[500px] overflow-hidden">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-2 flex items-center justify-between">
                      <span>Planning Board</span>
                      {selectedOverviewLoad && <span className="text-[10px] text-brand-400 font-mono font-bold">{selectedOverviewLoad.loadId}</span>}
                    </h3>
                  </div>

                  {selectedOverviewLoad ? (
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                      <div className="p-3 bg-[#0B0F19]/60 border border-[#23324C] rounded-xl text-xs space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                          <span>Route Summary</span>
                          <span>Niche: {selectedOverviewLoad.niche || 'General'}</span>
                        </div>
                        <p className="text-white font-extrabold">{selectedOverviewLoad.route}</p>
                        <p className="text-slate-350 text-[11px]">Vehicles assigned: <span className="text-brand-400 font-bold">{selectedOverviewLoad.vehicle || 'TX-ROAD88'}</span> | Trailer: <span className="text-brand-400 font-bold">{selectedOverviewLoad.trailer || 'TR-4022'}</span></p>
                      </div>

                      {/* Customer Instructions */}
                      {(() => {
                        const matching = (customerInstructions || []).filter(ins => {
                          const scope = ins.scope.toLowerCase();
                          return scope.includes(selectedOverviewLoad.customerName?.toLowerCase() || '') || scope.includes(selectedOverviewLoad.loadId?.toLowerCase() || '');
                        });
                        if (matching.length === 0) return null;
                        return (
                          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider block">Customer Instructions</span>
                            {matching.map((ins, idx) => (
                              <p key={idx} className="italic text-[10px] text-slate-200">"{ins.text}"</p>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Stops Timeline */}
                      <div className="space-y-3 pt-2">
                        <strong className="text-[10px] text-slate-500 uppercase tracking-wider block">Sequence Stops</strong>
                        {(selectedOverviewLoad.stops || []).length === 0 ? (
                          <div className="p-4 border border-[#23324C]/40 rounded-xl text-slate-500 text-xs text-center">
                            No intermediate stops defined.
                          </div>
                        ) : (
                          (selectedOverviewLoad.stops || []).map((stop, index) => (
                            <div key={index} className="flex gap-3 relative">
                              {index < selectedOverviewLoad.stops.length - 1 && (
                                <div className="absolute left-2.5 top-5 bottom-[-20px] w-0.5 bg-slate-800" />
                              )}
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-brand-500/10 border border-brand-500/30 text-brand-400 flex-shrink-0 z-10">
                                {index + 1}
                              </div>
                              <div className="text-left text-xs">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[8px] font-bold uppercase tracking-wider">{stop.type}</span>
                                <strong className="text-white block mt-1">{stop.address}</strong>
                                <p className="text-slate-455 text-[10px] mt-0.5">{stop.notes}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                      Select a shipment from the Left Load list to track routing schedule.
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-[#23324C]/40">
                    <Button size="xs" variant="success" onClick={() => triggerToast('Optimizing load stop order...')} className="w-full">
                      Optimise Load
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => handleOpenLoad(selectedOverviewLoad)} className="w-full">
                      Review Load
                    </Button>
                  </div>
                </div>

                {/* Right Column: Live GPS Map */}
                <div className="lg:col-span-4 glass rounded-2xl p-4 border border-[#23324C]/60 text-left flex flex-col justify-between max-h-[500px]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-1">Live GIS Route Map</h3>
                    <p className="text-[10px] text-slate-500">Fleet coordinates updated via telemetry feed.</p>
                  </div>

                  <div className="flex-grow bg-[#0B0F19] rounded-xl border border-[#23324C] relative overflow-hidden flex items-center justify-center my-3 min-h-[220px]">
                    <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <svg className="absolute inset-0 w-full h-full">
                      <path d="M 40 160 Q 120 80 260 140" fill="none" stroke="#23324c" strokeWidth="2" strokeDasharray="4,4" />
                      {selectedOverviewLoad && <path d="M 40 160 L 260 140" fill="none" stroke="#0ea0ea" strokeWidth="2.5" strokeOpacity="0.4" />}
                    </svg>
                    <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-[#0B0F19] animate-ping" />
                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#0B0F19]" />
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
                  </div>

                  {/* GPS Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <Button size="xs" variant="primary" onClick={() => triggerToast('Toggling live GIS map view...')}>View Live Map</Button>
                    <Button size="xs" variant="secondary" onClick={() => triggerToast('Real-time driver tracking initiated.')}>Track Driver</Button>
                    <Button size="xs" variant="outline" onClick={() => triggerToast('Opening Google Maps route...')}>Open Route</Button>
                    <Button size="xs" variant="outline" onClick={() => triggerToast('Location coordinates sent to driver.')}>Send Location to Driver</Button>
                    <Button size="xs" variant="success" onClick={() => triggerToast('GPS coordinates refreshed.')}>Refresh GPS</Button>
                    <Button size="xs" variant="secondary" onClick={() => triggerToast('Loading vehicle location history...')}>View Location History</Button>
                    <Button size="xs" variant="danger" className="col-span-2 mt-1" onClick={() => triggerToast('Load flagged as delayed. Alert sent to customer.')}>Flag Delay</Button>
                  </div>
                </div>

              </div>

              {/* Bottom Column: Driver ELD Status Bar */}
              <div className="glass rounded-2xl p-4 border border-[#23324C]/60 text-left space-y-3">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Driver Status Bar</h3>
                
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {drivers.map((driver) => {
                    const matchedLoad = loads.find(l => l.driver === driver.name && l.status === 'In Transit');
                    return (
                      <div key={driver.id} className="min-w-[200px] p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <strong className="text-white block font-bold">{driver.name}</strong>
                          <span className="text-[10px] text-slate-450 block font-mono">{driver.plate || 'Unassigned'}</span>
                          <span className="text-[9px] text-brand-400 font-bold block">
                            {matchedLoad ? `Transit: ${matchedLoad.loadId}` : 'ELD status: Idle'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <StatusBadge status={driver.status} />
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => triggerToast(`Dialing hotline to: ${driver.name}`)} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-350" title="Call Driver">
                              <Phone className="h-3 w-3" />
                            </button>
                            <button onClick={() => triggerToast(`Open chat screen with: ${driver.name}`)} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-350" title="Message Driver">
                              <MessageSquare className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 2. 11-STEP CREATE LOAD FLOW */}
          {activeTab === 'create-load' && (
            <div className="flex flex-col space-y-6">
              {/* Header - Step 11 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0B0F19] border border-[#23324C]/60 rounded-2xl p-5 shadow-lg">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Create Load Console</h3>
                  <p className="text-[10px] text-brand-400 font-bold tracking-widest mt-1">STEP 11: ACTIVATE / DISPATCH</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleSaveDraft} className="flex-1 sm:flex-none border-[#23324C] text-slate-300 hover:bg-slate-800 text-xs">
                    SAVE DRAFT
                  </Button>
                  <Button variant="primary" onClick={() => handleActivateLoad(false)} className="flex-1 sm:flex-none bg-brand-500 text-slate-950 font-black hover:bg-brand-400 text-xs">
                    ACTIVATE LOAD
                  </Button>
                  <Button variant="success" onClick={() => handleActivateLoad(true)} className="flex-1 sm:flex-none text-xs font-black">
                    DISPATCH LOAD
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 1: Create Load Header */}
                  <div className="bg-[#0B0F19] rounded-2xl p-6 border border-[#23324C]/60 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500"></div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#23324C]/40 pb-3 mb-4 flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" /> Step 1: Create Load Header
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput label="Customer Reference #" placeholder="e.g. PO-99238" />
                      <TextInput label="Global Deadline / Required Date" type="datetime-local" value={newLoadHeader.requiredDate} onChange={(e) => setNewLoadHeader({...newLoadHeader, requiredDate: e.target.value})} />
                      <SelectInput label="Niche" value={newLoadHeader.niche} onChange={(e) => setNewLoadHeader({...newLoadHeader, niche: e.target.value})} options={[{value:'general_freight', label:'General Freight'},{value:'car_carrying', label:'Car Carrying'},{value:'dangerous_goods', label:'Dangerous Goods'}]} />
                      <SelectInput label="Branch" value={newLoadHeader.branch} onChange={(e) => setNewLoadHeader({...newLoadHeader, branch: e.target.value})} options={[{value:'Chicago HQ Terminal', label:'Chicago HQ Terminal'},{value:'Los Angeles Depot', label:'Los Angeles Depot'}]} />
                    </div>
                  </div>

                  {/* Step 2: Add Stops */}
                  <div className="glass rounded-2xl p-6 border border-[#23324C]/60 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 2: Add Stops</h4>
                          <p className="text-[10px] text-slate-400">Define pickup, layover, and delivery locations.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleReorderStops} className="text-[10px] border-[#23324C]">
                          REORDER STOPS
                        </Button>
                        <Button variant="outline" size="sm" icon={Plus} onClick={handleAddStepperStop} className="text-[10px] border-[#23324C] hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                          ADD STOP
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {newStops.length === 0 ? (
                        <div className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-4">
                          <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">New Stop Setup</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                              <SelectInput label="Stop Type" value={stopType} onChange={(e) => setStopType(e.target.value)} options={[{value:'Pickup', label:'Pickup'},{value:'Delivery', label:'Delivery'}]} />
                            </div>
                            <div className="sm:col-span-2">
                              <TextInput label="Address / Location" value={stopAddress} onChange={(e) => setStopAddress(e.target.value)} placeholder="Enter full address..." />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <TextInput label="Stop Notes" value={stopNotes} onChange={(e) => setStopNotes(e.target.value)} placeholder="e.g. Call before arrival" className="sm:col-span-3" />
                          </div>
                        </div>
                      ) : (
                        newStops.map((stop, idx) => (
                          <div key={stop.id} className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-4 relative">
                            <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Stop {stop.sequence}: {stop.type}</span>
                              <button onClick={() => handleRemoveStepperStop(stop.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                            <p className="text-xs text-white font-bold">{stop.address}</p>
                            {stop.notes && <p className="text-[10px] text-slate-400">{stop.notes}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Step 3, 4, 5: Add Items & Link */}
                  <div className="glass rounded-2xl p-6 border border-[#23324C]/60 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
                    
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-brand-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 3, 4, 5: Add Items & Links</h4>
                          <p className="text-[10px] text-slate-400">Declare items, Link to Stops, and Link Customer.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" icon={Plus} onClick={handleAddStepperItem} className="text-[10px] border-[#23324C] hover:border-brand-500/50 hover:text-brand-400 transition-colors">
                        ADD ITEM
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {newItems.length === 0 ? (
                        <div className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-4">
                          <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">New Item Setup</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-b border-[#23324C]/40 pb-4">
                            <div className="sm:col-span-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Step 5: Link Customer</span>
                              <TextInput value={itemCustLink} onChange={(e) => setItemCustLink(e.target.value)} placeholder="Select Customer Profile" />
                            </div>
                            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                              <div className="col-span-2"><span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Step 4: Link Items to Stops</span></div>
                              <SelectInput options={[{value:'', label:'Select Pickup Stop'}, ...newStops.filter(s=>s.type==='Pickup').map(s=>({value:s.id, label:`Stop ${s.sequence}: ${s.address}`}))]} />
                              <SelectInput options={[{value:'', label:'Select Drop-off Stop'}, ...newStops.filter(s=>s.type==='Delivery').map(s=>({value:s.id, label:`Stop ${s.sequence}: ${s.address}`}))]} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                              <TextInput label="Item Description" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Description" />
                            </div>
                            <div className="sm:col-span-1">
                              <TextInput label="VIN / Serial" value={itemVin} onChange={(e) => setItemVin(e.target.value)} placeholder="VIN" />
                            </div>
                            <div className="sm:col-span-1">
                              <TextInput label="Weight (Lbs/Kg)" value={itemWeight} onChange={(e) => setItemWeight(e.target.value)} placeholder="e.g. 4500" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        newItems.map((item, idx) => (
                          <div key={item.id} className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-4 relative">
                            <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Item: {item.name}</span>
                              <button onClick={() => handleRemoveStepperItem(item.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                            <div className="text-xs text-slate-300">
                              <p>Customer: {item.customer}</p>
                              <p>Weight: {item.weight} | VIN: {item.vin}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Step 6, 7, 8: Vehicle Assignment */}
                  <div className="glass rounded-2xl p-6 border border-[#23324C]/60 shadow-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#23324C]/40 pb-3 mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-brand-400" /> Step 6, 7, 8: Assignments
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Step 6: Assign Driver</span>
                        <SelectInput value={assignedDriver} onChange={(e) => setAssignedDriver(e.target.value)} options={[{value:'', label:'Select Driver'}, ...drivers.map(d=>({value:d.name, label:d.name}))]} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Step 7: Assign Truck</span>
                        <SelectInput value={assignedVehicle} onChange={(e) => setAssignedVehicle(e.target.value)} options={[{value:'', label:'Select Truck'}, ...fleet.filter(f=>f.type!=='Trailer').map(f=>({value:f.plate, label:`${f.plate} (${f.type})`}))]} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Step 8: Assign Trailer</span>
                        <SelectInput value={assignedTrailer} onChange={(e) => setAssignedTrailer(e.target.value)} options={[{value:'', label:'Select Trailer'}, ...fleet.filter(f=>f.type==='Trailer').map(f=>({value:f.plate, label:`${f.plate} (${f.type})`}))]} />
                      </div>
                    </div>
                  </div>

                  {/* Step 9: Upload Documents */}
                  <div className="glass rounded-2xl p-6 border border-[#23324C]/60 shadow-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#23324C]/40 pb-3 mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-300" /> Step 9: Upload Documents
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => {setNewDocs({...newDocs, bol: true}); triggerToast('Manifest uploaded.');}} className={`border border-dashed ${newDocs.bol ? 'border-emerald-500 bg-emerald-500/10' : 'border-[#23324C] bg-[#0B0F19]/50'} rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-colors cursor-pointer min-h-[100px]`}>
                        <FileText className={`h-6 w-6 ${newDocs.bol ? 'text-emerald-400' : 'text-slate-500'} mb-2`} />
                        <span className="text-[10px] font-bold text-slate-300">Manifest / BOL</span>
                      </div>
                      <div onClick={() => triggerToast('Photos uploaded.')} className="border border-dashed border-[#23324C] bg-[#0B0F19]/50 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-colors cursor-pointer min-h-[100px]">
                        <Layers className="h-6 w-6 text-slate-500 mb-2" />
                        <span className="text-[10px] font-bold text-slate-300">Upload Photos</span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => triggerToast('Select document dialog opened')} className="w-full">Upload Document</Button>
                      </div>
                    </div>
                  </div>

                  {/* Internal Dispatch Notes */}
                  <div className="glass rounded-2xl p-6 border border-[#23324C]/60 shadow-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#23324C]/40 pb-3 mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-300" /> Internal Dispatch Notes
                    </h4>
                    <textarea 
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-[#23324C] rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-brand-500 resize-none min-h-[100px]"
                      placeholder="Add any internal routing or dispatcher notes here..."
                    ></textarea>
                  </div>
                  
                  {/* Step 10: Review Load */}
                  <div className="bg-brand-500/10 rounded-2xl p-6 border border-brand-500/30 shadow-xl">
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-500/30 pb-3 mb-4 flex items-center gap-2">
                      <Eye className="h-4 w-4" /> Step 10: Review Load
                    </h4>
                    <p className="text-xs text-slate-300 mb-4">Review all parameters before activating. Load contains {newStops.length} stops and {newItems.length} items.</p>
                    <Button variant="primary" className="w-full" onClick={() => triggerToast('Load reviewed. Ready for Dispatch.')}>
                      Review Load
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* 3. LOAD INBOX SECTION (AI INGESTION QUEUE) */}
          {activeTab === 'ai-inbox' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-500" /> AI Load Inbox Ingestion Queue
                  </h3>
                  <p className="text-xs text-slate-400">Review, confirm, match fields, or reject load manifests extracted automatically by AI model pipelines.</p>
                </div>

                <div className="space-y-6">
                  {aiQueue.loadInbox.filter(item => item.status === 'pending').length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No pending AI load extraction results in queue.
                    </div>
                  ) : (
                    aiQueue.loadInbox.filter(item => item.status === 'pending').map((item) => (
                      <div key={item.id} className="p-5 bg-[#111827]/80 border border-[#23324C] rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-3 flex-wrap gap-2">
                          <span className="text-[11px] text-slate-350 font-mono font-bold">Source manifest: <span className="text-slate-400 font-semibold">{item.source}</span></span>
                          <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-bold">96.8% AI Match Confidence</span>
                        </div>

                        {/* Matching Modules Grid with Confidence Levels */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-3.5 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-slate-500 font-extrabold uppercase">Customer Match</span>
                              <span className="text-[10px] text-emerald-450 font-bold">98%</span>
                            </div>
                            <strong className="text-white text-xs block truncate">{item.data.customer || 'Vance Refrigeration'}</strong>
                            <button 
                              onClick={() => { if (window.confirm('Confirm Match Customer?')) triggerToast(`Matched with customer registry: ${item.data.customer}`) }}
                              className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] rounded-lg font-bold transition-all cursor-pointer"
                            >
                              Match Customer
                            </button>
                          </div>

                          <div className="p-3.5 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-slate-500 font-extrabold uppercase">Address Match</span>
                              <span className="text-[10px] text-emerald-450 font-bold">89%</span>
                            </div>
                            <strong className="text-white text-xs block truncate">{item.data.route || 'Chicago HQ ➔ St. Louis'}</strong>
                            <button 
                              onClick={() => { if (window.confirm('Confirm Match Address?')) triggerToast(`Terminal route coordinates geocoded.`) }}
                              className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] rounded-lg font-bold transition-all cursor-pointer"
                            >
                              Match Address
                            </button>
                          </div>

                          <div className="p-3.5 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-slate-500 font-extrabold uppercase">Stop Match</span>
                              <span className="text-[10px] text-brand-400 font-bold">94%</span>
                            </div>
                            <strong className="text-white text-xs block">2 stops identified</strong>
                            <button 
                              onClick={() => { if (window.confirm('Confirm Stops sequence?')) triggerToast(`Confirmed Stops sequence synced.`) }}
                              className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] rounded-lg font-bold transition-all cursor-pointer"
                            >
                              Confirm Stops
                            </button>
                          </div>

                          <div className="p-3.5 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-slate-500 font-extrabold uppercase">Item Match</span>
                              <span className="text-[10px] text-emerald-450 font-bold">92%</span>
                            </div>
                            <strong className="text-white text-xs block truncate">{item.data.cargo || 'HVAC Units'}</strong>
                            <button 
                              onClick={() => { if (window.confirm('Confirm Items quantity?')) triggerToast(`Confirmed Items quantity: ${item.data.weight}`) }}
                              className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] rounded-lg font-bold transition-all cursor-pointer"
                            >
                              Confirm Items
                            </button>
                          </div>
                        </div>

                        {/* Ingestion & Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-[#23324C]/35">
                          <button 
                            onClick={() => { if (window.confirm('Review AI Extract?')) triggerToast(`AI Raw JSON manifest metadata loaded for inspection.`) }}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Review AI Extract
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Confirm AI Load and create Planned Load?')) {
                                resolveAiItem('loadInbox', item.id, 'confirmed');
                                dispatch(createLoad({
                                  status: 'Planned',
                                  cargo: item.data.cargo,
                                  weight: item.data.weight,
                                  route: item.data.route,
                                  customerName: item.data.customer,
                                  cost: '$1,200.00'
                                }));
                                triggerToast(`AI Ingested Load ${item.id} successfully Confirmed and created!`);
                              }
                            }}
                            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-all cursor-pointer"
                          >
                            Confirm AI Load
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Create Draft Load?')) {
                                resolveAiItem('loadInbox', item.id, 'confirmed');
                                dispatch(createLoad({
                                  status: 'Draft',
                                  cargo: item.data.cargo,
                                  weight: item.data.weight,
                                  route: item.data.route,
                                  customerName: item.data.customer,
                                  cost: '$1,200.00'
                                }));
                                triggerToast(`Draft Load created successfully!`);
                              }
                            }}
                            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 text-slate-300 text-xs rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Create Draft Load
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Reject Inbox Item?')) {
                                resolveAiItem('loadInbox', item.id, 'rejected');
                                triggerToast(`AI extracted load ${item.id} Rejected.`, 'warning');
                              }
                            }}
                            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Reject Inbox Item
                          </button>
                          <button 
                            onClick={() => { if (window.confirm('Assign to Dispatcher?')) triggerToast(`AI Ingestion item assigned to dispatch node operator.`) }}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-450 text-xs rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Assign to Dispatcher
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. ACTIVE LOADS TAB */}
          {activeTab === 'active-loads' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Active Cargo Loads</h3>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Button size="xs" variant="success" onClick={() => triggerToast('Optimising active load paths...')}>Optimise Load</Button>
                    <Button size="xs" variant="outline" onClick={() => triggerToast('Searching active database by VIN...')}>Search by VIN</Button>
                    <Button size="xs" variant="outline" onClick={() => triggerToast('Searching active database by Rego...')}>Search by Rego</Button>
                    <Button size="xs" variant="outline" onClick={() => triggerToast('Searching active database by Destination...')}>Search by Destination</Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} className="w-full sm:max-w-[200px]" />
                  <SelectInput value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Planned', label: 'Planned' },
                    { value: 'Assigned', label: 'Assigned' },
                    { value: 'Accepted', label: 'Accepted' },
                    { value: 'In Transit', label: 'In Transit' },
                    { value: 'Delivered', label: 'Delivered' }
                  ]} className="w-full sm:max-w-[150px]" />
                </div>
              </div>

              {filteredLoads.length === 0 ? (
                <EmptyState title="No Shipments matches" description="Search index empty. Setup a load dispatch card wizard." icon={Layers} actionLabel="Create Load" onAction={() => resetStepper()} />
              ) : (
                <>
                  <DataTable 
                    tableName="dispatch_active_loads"
                    columns={[
                      { key: 'route', label: 'Origin/Destination Path', render: (row) => <span className="font-extrabold text-white">{row.route}</span> },
                      { key: 'driver', label: 'Driver', render: (row) => <span className="text-slate-300 font-semibold">{row.driver}</span> },
                      { key: 'compliance', label: 'Compliance', render: (row) => (
                        row.complianceChecked ? (
                          <span className="text-[10px] text-emerald-400 font-bold">✓ Compliant</span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-bold">⚠️ Pending Check</span>
                        )
                      )},
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

          {/* 5. PLANNING BOARD TAB */}
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

          {/* 6. LIVE GPS MAP TAB */}
          {activeTab === 'tracking' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[420px] lg:h-auto min-h-[380px] relative">
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-1">Live GPS Fleet Positioning</h3>
                      <p className="text-[10px] text-slate-500">GIS overlay logs. Click coordinates to audit driver.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden min-h-[260px]">
                  <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#0B0F19]" />
                  <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[#23324C]/40">
                  <Button size="xs" variant="primary" onClick={() => triggerToast('Real-time driver tracking initiated.')}>Track Driver</Button>
                  <Button size="xs" variant="secondary" onClick={() => triggerToast('Opening Google Maps route...')}>Open Route</Button>
                  <Button size="xs" variant="outline" onClick={() => triggerToast('Location coordinates sent to driver.')}>Send Location to Driver</Button>
                  <Button size="xs" variant="success" onClick={() => triggerToast('GPS coordinates refreshed.')}>Refresh GPS</Button>
                  <Button size="xs" variant="secondary" onClick={() => triggerToast('Loading vehicle location history...')}>View Location History</Button>
                  <Button size="xs" variant="danger" onClick={() => triggerToast('Load flagged as delayed.')}>Flag Delay</Button>
                </div>
              </div>

              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[380px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Dispatcher Communication Chat</h3>
                  <p className="text-[10px] text-slate-500">Live chat updates.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-none flex flex-col-reverse">
                  {chats.map(chat => (
                    <div key={chat.id} className="p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl text-[11px]">
                      <div className="flex justify-between font-bold text-white mb-0.5">
                        <span>{chat.sender}</span>
                        <span className="text-slate-500 font-mono text-[9px]">{chat.time}</span>
                      </div>
                      <p className="text-slate-455">"{chat.msg}"</p>
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
                    className="flex-grow px-3 py-2 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                  <Button type="submit" variant="primary" icon={Send} />
                </form>
              </div>
            </div>
          )}

          {/* 7. DRIVERS SECTION */}
          {activeTab === 'drivers' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Fleet Driver Availability</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => triggerToast('Filtering active drivers only')}>View Available Drivers</Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast('Filtering off-duty drivers only')}>View Unavailable Drivers</Button>
                </div>
              </div>
              <DataTable 
                tableName="dispatch_drivers_list"
                columns={[
                  { key: 'name', label: 'Driver Operator', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'contact', label: 'Hotline', render: (row) => <span className="font-mono text-slate-400">{row.contact}</span> },
                  { key: 'license', label: 'License Check', render: (row) => <span className="text-[10px] text-emerald-400 font-bold">{row.license?.status || 'Valid'}</span> }
                ]} data={drivers} />
            </div>
          )}

          {/* 8. VEHICLES / TRAILERS SECTION */}
          {activeTab === 'vehicles-trailers' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Fleet Trailer Assets Registry</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => triggerToast('Trailer swap wizard triggered.')}>Swap Trailer</Button>
                  <Button size="sm" variant="outline" onClick={() => triggerToast('Trailer change reason saved.')}>Record Trailer Change Reason</Button>
                  <Button size="sm" variant="success" onClick={() => setIsAssignVehicleModalOpen(true)}>Add Vehicle</Button>
                </div>
              </div>
              <DataTable 
                tableName="dispatch_vehicles_trailers"
                columns={[
                  { key: 'plate', label: 'Plate', render: (row) => <span className="font-mono text-white">{row.plate}</span> },
                  { key: 'type', label: 'Type', render: (row) => <span>{row.type}</span> },
                  { key: 'compliance', label: 'Safety Compliance', render: (row) => (
                    row.complianceChecked ? (
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Compliant ({row.odometer} mi)</span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-bold">⚠️ Pending Inspection</span>
                    )
                  )},
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status || 'Active'} /> }
                ]} data={fleet} />
            </div>
          )}

          {/* 9. CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Shipper Accounts</h3>
                <Button size="sm" variant="primary" onClick={() => triggerToast('Shipper account linked to dispatch workflow.')}>Link Customer</Button>
              </div>
              <DataTable
                tableName="dispatch_customers"
                columns={[
                  { key: 'scope', label: 'Scope', render: (row) => <span className="font-extrabold text-white">{row.scope}</span> },
                  { key: 'type', label: 'Instruction Type', render: (row) => <span className="text-slate-400">{row.type}</span> },
                  { key: 'text', label: 'Instructions Directive', render: (row) => <span className="italic text-[11px]">"{row.text}"</span> }
                ]}
                data={customerInstructions}
              />
            </div>
          )}

          {/* 10. YARD / WAREHOUSE */}
          {activeTab === 'yard-warehouse' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 animate-fade-in">
              <h3 className="text-sm font-extrabold text-white">Storage Slots Grid</h3>
              <p className="text-xs text-slate-400">Yard capacity layout mapping trailer bays.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Bay 1 (Reefer)', 'Bay 2 (Dry Van)', 'Bay 3 (Flatbed)'].map((bay, idx) => (
                  <div key={idx} className="p-4 bg-[#111827]/40 border border-[#23324C] rounded-xl text-center space-y-2">
                    <span className="text-xs font-bold text-slate-200 block">{bay}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">Occupied (TR-4022)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. WORKFORCE AVAILABILITY */}
          {activeTab === 'workforce-availability' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Worker Shift Roster Calendar</h3>
                <Button size="sm" variant="primary" onClick={() => triggerToast('Shift assigned successfully from Dispatch.')}>Assign Shift</Button>
              </div>
              <p className="text-xs text-slate-400">Roster calendar tracking driver logs.</p>
            </div>
          )}

          {/* 12. MESSAGES */}
          {activeTab === 'messages' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Driver Hotline Chat Console</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => triggerToast('Opening driver text thread...')}>Message Driver</Button>
                <Button size="sm" variant="secondary" onClick={() => triggerToast('Hotline dialer initiated.')}>Call Driver</Button>
              </div>
            </div>
          )}

          {/* 13. REPORTS */}
          {activeTab === 'reports' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Dispatcher Delivery Performance reports</h3>
              <p className="text-xs text-slate-400">Total shipments dispatched per week metrics.</p>
            </div>
          )}

        </>
      )}

      {/* Active Load Detail Inspect Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Active Route Inspector">
        {selectedLoadDetail && (
          <div className="space-y-6 text-left text-slate-350 text-xs sm:text-sm flex flex-col h-full">
            <div className="border-b border-[#23324C]/60 pb-4">
              <h4 className="text-base font-extrabold text-white mb-1">{selectedLoadDetail.route}</h4>
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
                { id: 'swap', label: 'Trailer Swap', icon: Truck },
                { id: 'feed', label: 'Activity', icon: Activity }
              ]} 
              activeTab={drawerTab} 
              onChange={setDrawerTab} 
              className="border-slate-800"
            />

            <div className="flex-1 overflow-y-auto py-2">
              {drawerTab === 'details' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-800/10 border border-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Driver</span>
                      <strong className="text-white text-xs block mt-1">{selectedLoadDetail.driver}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{selectedLoadDetail.contact}</span>
                    </div>
                    <div className="p-3 bg-slate-800/10 border border-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Vehicle / Weight</span>
                      <strong className="text-white text-xs block mt-1">{selectedLoadDetail.vehicle || 'TX-ROAD88'}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{selectedLoadDetail.weight}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0b0f19]/30 border border-[#23324C]/60 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Operations Actions</span>
                    <div className="flex flex-wrap gap-2">
                      <Button size="xs" variant="primary" onClick={() => triggerToast('Coordinates sent to driver GPS.')}>Send Location to Driver</Button>
                      <Button size="xs" variant="secondary" onClick={() => triggerToast('Loading vehicle coordinates history...')}>View GPS History</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Transfer Load initiated.')}>Transfer Load</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Transfer Item initiated.')}>Transfer Item</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Opening Chain of Custody logs...')}>View Chain of Custody</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Displaying Customer Instructions...')}>View Customer Instructions</Button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#0b0f19]/30 border border-[#23324C]/60 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Advance Lifecycle Status</span>
                    <div className="flex gap-2">
                      <Button size="xs" variant="outline" onClick={() => handleStatusTransition('Planned')}>Review Load</Button>
                      <Button size="xs" variant="primary" onClick={() => handleStatusTransition('Accepted')}>Activate Load</Button>
                      <Button size="xs" variant="success" onClick={() => handleStatusTransition('In Transit')}>Dispatch Load</Button>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div className="space-y-4 py-1 animate-fade-in">
                  {['Draft', 'Planned', 'Assigned', 'Accepted', 'In Transit', 'Delivered', 'Closed'].map((step, idx, arr) => {
                    const isCurrent = step === selectedLoadDetail.status;
                    return (
                      <div key={step} className="flex gap-3 relative">
                        {idx < arr.length - 1 && (
                          <div className={`absolute left-3 top-6 bottom-[-20px] w-0.5 bg-slate-800`} />
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0 z-10 ${
                          isCurrent ? 'bg-brand-500 border-brand-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-650'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="text-left">
                          <h5 className={`text-xs font-bold ${isCurrent ? 'text-brand-500' : 'text-slate-400'}`}>{step}</h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {drawerTab === 'docs' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="space-y-2">
                    {(selectedLoadDetail.documents || []).length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No documents uploaded.</p>
                    ) : (
                      (selectedLoadDetail.documents || []).map((doc, dIdx) => (
                        <div key={dIdx} className="flex items-center justify-between p-3 bg-slate-800/10 border border-slate-800/40 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4.5 w-4.5 text-brand-400" />
                            <span>{doc.name}</span>
                          </div>
                          <button onClick={() => triggerToast(`Downloading ${doc.name}...`)} className="text-[10px] text-brand-400 font-bold hover:underline">Download</button>
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => triggerToast('Document uploaded.')}>Upload Document</Button>
                </div>
              )}

              {drawerTab === 'notes' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedLoadDetail.notes || []).length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notes on record.</p>
                    ) : (
                      (selectedLoadDetail.notes || []).map((note, nIdx) => (
                        <div key={nIdx} className="p-3 bg-slate-800/10 border border-[#23324C]/40 rounded-xl text-left">
                          <p className="text-slate-350 font-semibold">{note}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <TextInput placeholder="Add internal note..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} className="flex-grow !py-2" />
                    <Button type="submit" variant="primary" className="h-10 mt-auto">Add Internal Note</Button>
                  </form>
                </div>
              )}

              {drawerTab === 'swap' && (
                <div className="space-y-4 animate-fade-in text-left text-xs">
                  <div className="p-3 bg-slate-800/10 border border-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold block">Current Trailer</span>
                    <strong className="text-white text-sm font-mono block">{selectedLoadDetail.trailer || 'TR-4022'}</strong>
                  </div>
                  
                  <div className="bg-[#111827]/40 border border-[#23324C]/60 rounded-xl p-4 space-y-3">
                    <SelectInput label="Select Trailer Swap Plate" value={newTrailerPlate} onChange={(e) => setNewTrailerPlate(e.target.value)} options={['TR-4022', 'TR-9118', 'TR-7422'].map(tr => ({ value: tr, label: tr }))} />
                    <TextInput label="Trailer Change Reason" value={swapReason} onChange={(e) => setSwapReason(e.target.value)} placeholder="Record reason..." />
                    <Button variant="primary" className="w-full text-xs font-black" onClick={handleTrailerSwap}>Swap Trailer</Button>
                  </div>
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

            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4 mt-auto">
              <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(false)} className="w-full">
                Close Tracking Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>

    {/* Assign Vehicle Modal */}
      <Modal isOpen={isAssignVehicleModalOpen} onClose={() => setIsAssignVehicleModalOpen(false)} title="Assign Existing Vehicle to Dispatch Load">
        <form onSubmit={handleAssignVehicleSubmit} className="space-y-4 p-1 text-left">
          <SelectInput 
            label="Select Load" 
            value={assignVehicleForm.loadId} 
            onChange={(e) => setAssignVehicleForm({...assignVehicleForm, loadId: e.target.value})} 
            options={[{value:'', label:'Select a load...'}, ...loads.map(l => ({value: l.id, label: `${l.loadId || l.id} - ${l.route}`}))]} 
          />
          <SelectInput 
            label="Select Vehicle" 
            value={assignVehicleForm.vehicleId} 
            onChange={(e) => setAssignVehicleForm({...assignVehicleForm, vehicleId: e.target.value})} 
            options={[{value:'', label:'Select a vehicle...'}, ...fleet.filter(f => f.type !== 'Trailer').map(f => ({value: f.plate, label: `${f.plate} - ${f.status}`}))]} 
          />
          
          {assignVehicleForm.vehicleId && (() => {
            const v = fleet.find(f => f.id === assignVehicleForm.vehicleId || f.plate === assignVehicleForm.vehicleId);
            if (!v) return null;
            return (
              <div className="grid grid-cols-2 gap-4 bg-slate-800/20 p-3 rounded-lg border border-[#23324C]/40">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vehicle Plate</label>
                  <input type="text" value={v.plate} disabled className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vehicle Type</label>
                  <input type="text" value={v.type} disabled className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current Status</label>
                  <input type="text" value={v.status} disabled className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current Branch</label>
                  <input type="text" value={v.branch || 'Main Depot'} disabled className="w-full bg-[#111827] border border-[#23324C] text-slate-300 p-2 rounded-lg opacity-70" />
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4">
            <SelectInput 
              label="Assigned Driver (Optional)" 
              value={assignVehicleForm.driver} 
              onChange={(e) => setAssignVehicleForm({...assignVehicleForm, driver: e.target.value})} 
              options={[{value:'', label:'Unassigned'}, ...drivers.map(d => ({value: d.name, label: d.name}))]} 
            />
            <SelectInput 
              label="Trailer (Optional)" 
              value={assignVehicleForm.trailer} 
              onChange={(e) => setAssignVehicleForm({...assignVehicleForm, trailer: e.target.value})} 
              options={[{value:'', label:'None'}, ...fleet.filter(f => f.type === 'Trailer').map(f => ({value: f.plate, label: f.plate}))]} 
            />
          </div>
          
          <TextInput 
            label="Dispatch Notes" 
            value={assignVehicleForm.notes} 
            onChange={(e) => setAssignVehicleForm({...assignVehicleForm, notes: e.target.value})} 
            placeholder="Add any routing or dispatch notes..." 
          />

          <div className="flex gap-2 justify-end pt-4 border-t border-[#23324C]/60 mt-2">
            <Button variant="secondary" onClick={(e) => { e.preventDefault(); setIsAssignVehicleModalOpen(false); }}>Cancel</Button>
            <Button type="submit" variant="primary">Assign Vehicle</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
