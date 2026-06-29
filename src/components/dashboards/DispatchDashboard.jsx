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
  MapPin, MessageSquare, ArrowRight, ArrowLeft, Send, Calendar as CalendarIcon, FileText, Activity, Trash2, Filter, Info, Eye, LogOut, CheckSquare, Search, Settings
} from 'lucide-react';

export default function DispatchDashboard({ activeTab: initialActiveTab = 'overview' }) {
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
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // Local active tab override (for clicks routing)
  const [activeTabState, setActiveTabState] = useState(initialActiveTab);
  useEffect(() => {
    setActiveTabState(initialActiveTab);
  }, [initialActiveTab]);

  // Allowed Niches Configuration (For Step 1 Select Niche hiding rule)
  const [allowedNiches, setAllowedNiches] = useState(['general_freight', 'car_carrying', 'dangerous_goods']);

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

  // Sub-filter pills for Loads Tab
  const [activePill, setActivePill] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Create Load Stepper State
  const [isCreateLoadOpen, setIsCreateLoadOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newLoadHeader, setNewLoadHeader] = useState({
    loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
    niche: 'general_freight',
    branch: 'Chicago HQ Terminal',
    requiredDate: ''
  });

  // Pre-configured default stops (Pickup & Delivery)
  const [newStops, setNewStops] = useState([
    { id: 'STP-1', address: '', type: 'Pickup', sequence: 1, notes: '' },
    { id: 'STP-2', address: '', type: 'Delivery', sequence: 2, notes: '' }
  ]);

  const [newItems, setNewItems] = useState([]);
  const [newDocs, setNewDocs] = useState({
    rateConf: false,
    bol: false,
    customs: false
  });
  const [newNotes, setNewNotes] = useState('');
  
  // Create item inputs
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemVin, setItemVin] = useState('');
  const [itemRego, setItemRego] = useState('');
  const [itemMake, setItemMake] = useState('');
  const [itemModel, setItemModel] = useState('');
  const [itemDrivable, setItemDrivable] = useState('yes');
  const [itemPallets, setItemPallets] = useState('');
  const [itemHazmatClass, setItemHazmatClass] = useState('');
  const [itemUnNumber, setItemUnNumber] = useState('');
  const [itemCustLink, setItemCustLink] = useState('');

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

  // Load Inbox State
  const [inboxItems, setInboxItems] = useState([
    { 
      id: '1092', 
      time: '10 mins ago', 
      driver: 'Michael Chen', 
      units: 2, 
      route: 'Melbourne ➔ Brisbane', 
      status: 'URGENT', 
      expanded: false,
      vehicles: [
        { vin: '1YV1HP82A81920', make: 'Toyota', model: 'Camry', status: 'Drivable' },
        { vin: '1YV1HP82A81921', make: 'Honda', model: 'Civic', status: 'Drivable' }
      ]
    },
    { 
      id: '1091', 
      time: '45 mins ago', 
      driver: 'Sarah Connor', 
      units: 1, 
      route: 'Sydney ➔ Perth', 
      status: 'PENDING', 
      expanded: false,
      vehicles: [
        { vin: '1YV1HP82A81922', make: 'Ford', model: 'Ranger', status: 'Drivable' }
      ]
    },
    { 
      id: '1090', 
      time: '2 hours ago', 
      driver: 'John Doe', 
      units: 3, 
      route: 'Sydney ➔ Canberra', 
      status: 'PENDING', 
      expanded: false,
      vehicles: [
        { vin: '1YV1HP82A81923', make: 'Isuzu', model: 'D-Max', status: 'Drivable' },
        { vin: '1YV1HP82A81924', make: 'Mitsubishi', model: 'Triton', status: 'Drivable' },
        { vin: '1YV1HP82A81925', make: 'Mazda', model: 'BT-50', status: 'Drivable' }
      ]
    }
  ]);
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilterTab, setInboxFilterTab] = useState('ALL'); // ALL, PENDING, HIGH

  const toggleInboxItemExpanded = (itemId) => {
    setInboxItems(inboxItems.map(item => 
      item.id === itemId ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const handleApproveInboxItem = (item) => {
    dispatch(createLoad({
      status: 'Planned',
      loadId: `LD-${item.id}`,
      niche: 'car_carrying',
      cargo: `Car Transport: ${item.vehicles.map(v => `${v.make} ${v.model}`).join(', ')}`,
      weight: `${item.units * 3500} lbs`,
      route: item.route,
      driver: item.driver,
      vehicle: 'Unassigned',
      trailer: 'TR-4022',
      stops: [
        { id: 'STP-1', address: item.route.split(' ➔ ')[0] || 'Melbourne', type: 'Pickup', sequence: 1, notes: 'Confirm loaded items' },
        { id: 'STP-2', address: item.route.split(' ➔ ')[1] || 'Brisbane', type: 'Delivery', sequence: 2, notes: 'Delivery signature required' }
      ]
    }));
    setInboxItems(inboxItems.filter(i => i.id !== item.id));
    triggerToast(`Draft DRAFT-${item.id} approved and added to Loads Queue.`);
  };

  const handleRejectInboxItem = (itemId) => {
    setInboxItems(inboxItems.filter(i => i.id !== itemId));
    triggerToast(`Draft DRAFT-${itemId} rejected.`, 'warning');
  };

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

  // Trailer swap state
  const [newTrailerPlate, setNewTrailerPlate] = useState('TR-9118');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Terminal Workspace Scan simulation state
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scannedLogs, setScannedLogs] = useState([
    { time: '12:10 PM', packageId: 'SHP-7712', status: 'REDIRECTED', section: 'Lane-1 Outbound', info: 'Cotton Reels' }
  ]);

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

  // Add Item in Stepper
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
      make: itemMake.trim(),
      model: itemModel.trim(),
      drivable: itemDrivable,
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
    setItemMake('');
    setItemModel('');
    setItemDrivable('yes');
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

  // Save Draft Load
  const handleSaveDraft = () => {
    const finalCargo = newItems.map(i => i.name).join(', ') || 'Draft Cargo Load';
    const totalWeight = `${newItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0)} lbs`;
    
    dispatch(createLoad({
      status: 'Draft',
      loadId: newLoadHeader.loadId,
      niche: newLoadHeader.niche,
      cargo: finalCargo,
      weight: totalWeight,
      route: newStops.map(s => s.address).join(' ➔ ') || 'Planned Route',
      pickupAddress: newStops[0]?.address || 'Pending Origin',
      deliveryAddress: newStops[newStops.length - 1]?.address || 'Pending Destination',
      driver: assignedDriver || 'Unassigned',
      vehicle: assignedVehicle || 'Unassigned',
      trailer: assignedTrailer,
      stops: newStops.map(s => ({ ...s, status: 'Pending' })),
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
    setIsCreateLoadOpen(false);
  };

  // Activate & Dispatch Load
  const handleActivateLoad = (dispatchImmediately = false) => {
    if (newStops.some(s => !s.address.trim())) {
      triggerToast('All default stops must have a valid address.', 'error');
      return;
    }
    const finalCargo = newItems.map(i => i.name).join(', ') || 'General Freight Cargo';
    const totalWeight = `${newItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0)} lbs`;

    dispatch(createLoad({
      status: dispatchImmediately ? 'In Transit' : 'Planned',
      loadId: newLoadHeader.loadId,
      niche: newLoadHeader.niche,
      cargo: finalCargo,
      weight: totalWeight,
      route: newStops.map(s => s.address).join(' ➔ '),
      pickupAddress: newStops[0]?.address,
      deliveryAddress: newStops[newStops.length - 1]?.address,
      driver: assignedDriver || 'Unassigned',
      vehicle: assignedVehicle || 'Unassigned',
      trailer: assignedTrailer,
      stops: newStops.map(s => ({ ...s, status: 'Pending' })),
      items: newItems,
      customerName: newItems[0]?.customer || 'General Shipper',
      notes: newNotes ? [newNotes] : [],
      documents: [
        ...(newDocs.rateConf ? [{ name: 'Rate Confirmation.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(newDocs.bol ? [{ name: 'Bill of Lading.pdf', type: 'PDF', date: 'Just now', url: '#' }] : []),
        ...(newDocs.customs ? [{ name: 'Customs Manifest.pdf', type: 'PDF', date: 'Just now', url: '#' }] : [])
      ]
    }));

    triggerToast(dispatchImmediately ? 'Load dispatched directly (In Transit)!' : 'Load activated & scheduled (Planned)!');
    resetStepper();
    setIsCreateLoadOpen(false);
  };

  const resetStepper = () => {
    setCreateStep(1);
    setNewLoadHeader({
      loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
      niche: allowedNiches.length === 1 ? allowedNiches[0] : 'general_freight',
      branch: 'Chicago HQ Terminal',
      requiredDate: ''
    });
    setNewStops([
      { id: 'STP-1', address: '', type: 'Pickup', sequence: 1, notes: '' },
      { id: 'STP-2', address: '', type: 'Delivery', sequence: 2, notes: '' }
    ]);
    setNewItems([]);
    setNewDocs({ rateConf: false, bol: false, customs: false });
    setNewNotes('');
    setAssignedDriver('');
    setAssignedVehicle('');
  };

  // Terminal Workspace Scan simulation handler
  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const matchedLoad = loads.find(l => l.loadId?.toLowerCase() === scanInput.trim().toLowerCase() || l.id.toString() === scanInput.trim());
    if (matchedLoad) {
      const decision = {
        packageId: matchedLoad.loadId || `LD-${matchedLoad.id}`,
        status: 'REDIRECTED',
        section: 'Section A-1 (Linehaul Sorting)',
        weight: matchedLoad.weight || '32,000 lbs',
        action: `Assign linehaul to trailer ${matchedLoad.trailer || 'TR-9118'}`
      };
      setScanResult(decision);
      setScannedLogs([{ time: new Date().toLocaleTimeString(), packageId: decision.packageId, status: 'SUCCESS', section: decision.section, info: matchedLoad.cargo }, ...scannedLogs]);
      triggerToast('Redirection Decision Generated.');
    } else {
      const randomDecisions = [
        { section: 'Section B-3 (Local Courier)', weight: '1,200 lbs', action: 'Load to Courier Van NY-VAN023' },
        { section: 'Section C-1 (Dangerous Goods Yard)', weight: '18,500 lbs', action: 'Hold for HAZMAT Safety Inspector' },
        { section: 'Section A-2 (Heavy Flatbed Loading)', weight: '44,000 lbs', action: 'Attach Flatbed trailer TR-7422' }
      ];
      const selectedDec = randomDecisions[Math.floor(Math.random() * randomDecisions.length)];
      const decision = {
        packageId: scanInput.toUpperCase(),
        status: 'HOLD',
        section: selectedDec.section,
        weight: selectedDec.weight,
        action: selectedDec.action
      };
      setScanResult(decision);
      setScannedLogs([{ time: new Date().toLocaleTimeString(), packageId: decision.packageId, status: 'HOLD', section: decision.section, info: 'Unregistered Shipment Item' }, ...scannedLogs]);
      triggerToast('Cargo hold flag registered.', 'warning');
    }
    setScanInput('');
  };

  // 9-Dimensional filter predicates
  const filteredLoads = loads.filter((l) => {
    const matchesSearch = 
      l.route.toLowerCase().includes(search.toLowerCase()) || 
      l.driver.toLowerCase().includes(search.toLowerCase()) ||
      (l.loadId && l.loadId.toLowerCase().includes(search.toLowerCase())) ||
      (l.cargo && l.cargo.toLowerCase().includes(search.toLowerCase()));
      
    // Status card filter logic
    let matchesStatus = true;
    if (filterStatus === 'Unassigned') {
      matchesStatus = l.driver === 'Unassigned' || !l.driver;
    } else if (filterStatus) {
      matchesStatus = l.status === filterStatus;
    }

    // Pill filter logic (Mock routing filter types)
    let matchesPill = true;
    if (activePill === 'Local Pickups') {
      matchesPill = l.route.toLowerCase().includes('chicago') || l.pickupAddress?.toLowerCase().includes('chicago');
    } else if (activePill === 'Branch Transfers') {
      matchesPill = l.route.toLowerCase().includes('depot') || l.route.toLowerCase().includes('transit');
    } else if (activePill === 'Local Deliveries') {
      matchesPill = l.route.toLowerCase().includes('dallas') || l.deliveryAddress?.toLowerCase().includes('dallas');
    }
    
    const matchesBranch = filterBranch === '' || (l.branch && l.branch.toLowerCase().includes(filterBranch.toLowerCase())) || (l.pickupAddress && l.pickupAddress.toLowerCase().includes(filterBranch.toLowerCase()));
    const matchesDriver = filterDriver === '' || l.driver === filterDriver;
    const matchesCustomer = filterCustomer === '' || (l.customerName && l.customerName === filterCustomer);
    const matchesDestination = filterDestination === '' || l.route.toLowerCase().includes(filterDestination.toLowerCase()) || (l.deliveryAddress && l.deliveryAddress.toLowerCase().includes(filterDestination.toLowerCase()));
    const matchesDate = filterRequiredDate === '' || (l.pickupDate && l.pickupDate.startsWith(filterRequiredDate)) || (l.deliveryDate && l.deliveryDate.startsWith(filterRequiredDate));
    const matchesNiche = filterNicheType === '' || l.niche === filterNicheType || (filterNicheType === 'car_carrying' && l.cargo.toLowerCase().includes('car')) || (filterNicheType === 'dangerous_goods' && l.cargo.toLowerCase().includes('hazmat')) || (filterNicheType === 'general_freight' && !l.cargo.toLowerCase().includes('car') && !l.cargo.toLowerCase().includes('hazmat'));
    const matchesVehicleTrailer = filterVehicleTrailer === '' || l.vehicle === filterVehicleTrailer || l.trailer === filterVehicleTrailer;
    const matchesAvailableWorkers = !filterAvailableWorkersOnly || (l.driver && drivers.some(d => d.name === l.driver && d.status === 'Active'));

    return matchesSearch && matchesStatus && matchesPill && matchesBranch && matchesDriver && matchesCustomer && matchesDestination && matchesDate && matchesNiche && matchesVehicleTrailer && matchesAvailableWorkers;
  });

  const totalPages = Math.ceil(filteredLoads.length / itemsPerPage);
  const paginatedLoads = filteredLoads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Status Cards metrics counts
  const counts = {
    unassigned: loads.filter(l => l.driver === 'Unassigned' || !l.driver).length,
    transit: loads.filter(l => l.status === 'In Transit').length,
    issues: loads.filter(l => l.status === 'Delayed').length,
    received: loads.filter(l => l.status === 'Delivered').length,
  };

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header Container */}
      {activeTabState === 'loads' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5 text-left">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Load Queue</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-brand-500 font-semibold">Sydney Central Depot</span> • Command View
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Reference, Client..."
                className="pl-9 pr-4 py-2 bg-[#0B0F19]/50 border border-[#23324C] hover:border-brand-500/30 text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 w-[240px] font-sans"
              />
            </div>
            <button
              onClick={() => {
                resetStepper();
                setIsCreateLoadOpen(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-none text-slate-950 font-extrabold rounded-xl px-5 py-2.5 shadow-lg shadow-orange-500/10 text-xs transition-all uppercase tracking-wider"
            >
              Create Load
            </button>
          </div>
        </div>
      ) : activeTabState !== 'inbox' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {activeTabState === 'overview' ? 'Command Center' : `Dispatcher • ${activeTabState.replace('-', ' ')}`}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTabState === 'overview' 
                ? 'Sydney Central Depot - Terminal Command & GIS telemetry workspace.' 
                : 'Match loads, track route geofences, and audit driver logs.'}
            </p>
          </div>
          <div className="flex gap-2">
            {(activeTabState === 'overview') && (
              <Button 
                variant="primary" 
                icon={Plus} 
                onClick={() => {
                  resetStepper();
                  setIsCreateLoadOpen(true);
                }}
                className="bg-brand-500 text-slate-950 font-black hover:bg-brand-400 shadow-md shadow-brand-500/10"
              >
                Create Load
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {loading && loads.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {/* ======================================================== */}
          {/* 1. COMMAND CENTRE TAB (OVERVIEW)                         */}
          {/* ======================================================== */}
          {activeTabState === 'overview' && (
            <div className="space-y-6">
              
              {/* 4 Live KPI boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTabState('loads')}
                  className="glass rounded-2xl p-5 border border-[#23324C]/65 text-left cursor-pointer hover:border-brand-500/40 hover:scale-[1.01] transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Active Loads</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-3xl font-black text-white">42</span>
                    <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-500/20 font-mono">+12%</span>
                  </div>
                </div>
                <div 
                  onClick={() => setActiveTabState('roster-control')}
                  className="glass rounded-2xl p-5 border border-[#23324C]/65 text-left cursor-pointer hover:border-brand-500/40 hover:scale-[1.01] transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Drivers Online</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-3xl font-black text-white">18</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider font-mono">LIVE</span>
                  </div>
                </div>
                <div 
                  onClick={() => setActiveTabState('loads')}
                  className="glass rounded-2xl p-5 border border-[#23324C]/65 text-left cursor-pointer hover:border-brand-500/40 hover:scale-[1.01] transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Pending Assignment</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-3xl font-black text-white">04</span>
                    <span className="bg-amber-500/10 text-amber-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider font-mono">URGENT</span>
                  </div>
                </div>
                <div 
                  className="glass rounded-2xl p-5 border border-[#23324C]/65 text-left hover:scale-[1.01] transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Critical Alerts</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-3xl font-black text-rose-400 animate-pulse">02</span>
                    <span className="bg-rose-500/10 text-rose-455 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-wider font-mono">FIX NOW</span>
                  </div>
                </div>
              </div>

              {/* Split layout: Left movements, Right map preview & warning logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Active Movements Table */}
                <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-brand-500" /> Active Movements
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-350">
                        <thead>
                          <tr className="border-b border-[#23324C]/40 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                            <th className="py-2.5 font-bold text-left">LOAD ID</th>
                            <th className="py-2.5 font-bold text-left">ROUTE / STATUS</th>
                            <th className="py-2.5 font-bold text-left">RESOURCE</th>
                            <th className="py-2.5 font-bold text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#23324C]/20">
                          {[
                            { id: 'SHP-20481', client: 'Acme Corp', route: 'Sydney Depot ➔ Melbourne Depot', status: 'IN TRANSIT', statusColor: 'bg-blue-500/10 text-blue-450 border border-blue-500/25', driver: 'Jack Taylor', vehicle: 'TRK-102' },
                            { id: 'SHP-20482', client: 'Global Retail', route: 'Melbourne Depot ➔ Adelaide Terminal', status: 'ARRIVING SOON', statusColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/25', driver: 'Liam Smith', vehicle: 'TRK-105' },
                            { id: 'SHP-20483', client: 'Coke Industries', route: 'Sydney Depot ➔ Canberra Depot', status: 'IN SORTING', statusColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/25', driver: 'Oliver Brown', vehicle: 'VAN-14' }
                          ].map(load => (
                            <tr key={load.id} className="hover:bg-slate-800/10">
                              <td className="py-3.5">
                                <strong className="font-mono font-bold text-white block">{load.id}</strong>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{load.client}</span>
                              </td>
                              <td className="py-3.5">
                                <span className="font-semibold text-slate-200 block">{load.route}</span>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase mt-1 ${load.statusColor}`}>
                                  {load.status}
                                </span>
                              </td>
                              <td className="py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
                                    {load.driver.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="text-slate-200 font-bold block">{load.driver}</span>
                                    <span className="text-[9px] text-slate-500 font-mono block">{load.vehicle}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 text-right">
                                <button 
                                  onClick={() => {
                                    setSelectedOverviewLoadId(load.id);
                                    setActiveTabState('loads');
                                  }}
                                  className="px-3 py-1.5 bg-transparent border border-slate-700 text-slate-200 hover:border-white hover:text-white rounded-lg font-bold transition-all text-xs"
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right side: Live GIS map preview & warning logs */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Map Preview card */}
                  <div 
                    onClick={() => setActiveTabState('fleet-monitor')}
                    className="glass rounded-2xl p-5 border border-amber-500/40 text-left cursor-pointer hover:border-brand-500/60 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider group-hover:text-brand-400 transition-colors">Fleet Map</h4>
                        <p className="text-[10px] text-slate-500">Live Network Monitor</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="flex justify-between items-baseline mt-4">
                      <span className="text-5xl font-black text-white font-mono">18</span>
                      <span className="text-xs font-bold text-slate-400">active tracks</span>
                    </div>
                  </div>

                  {/* Warning Logs card */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Critical Logs</h4>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] space-y-1">
                        <p className="text-slate-200 font-medium">SHP-20483 geofence breach. <span className="text-slate-550 font-mono text-[9px] ml-1">(4m ago)</span></p>
                      </div>
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] space-y-1">
                        <p className="text-slate-200 font-medium">Unassigned SHP-20484 timeout. <span className="text-slate-550 font-mono text-[9px] ml-1">(12m ago)</span></p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom: Driver Status Bar */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Driver Status Bar</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {[
                    { id: '1', name: 'Jack Taylor', vehicle: 'TRK-102', status: 'Moving', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', details: '45 km/h • 45 mins away', job: 'SHP-20481' },
                    { id: '2', name: 'Liam Smith', vehicle: 'VAN-08', status: 'Stopped', statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', details: '0 km/h • Delayed', job: 'SHP-20482' },
                    { id: '3', name: 'Oliver Brown', vehicle: 'VAN-14', status: 'Loading', statusColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20', details: '0 km/h • Pending', job: 'SHP-20483' }
                  ].map((driver) => {
                    return (
                      <div 
                        key={driver.id} 
                        onClick={() => {
                          setSelectedDriverId(driver.id);
                          setActiveTabState('roster-control');
                        }}
                        className="min-w-[240px] p-4 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer hover:border-brand-500/30 transition-all"
                      >
                        <div className="space-y-1">
                          <strong className="text-white block font-bold">{driver.name}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">{driver.vehicle}</span>
                          <span className="text-[9px] text-brand-400 font-bold block">
                            Job: {driver.job}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 items-end text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${driver.statusColor}`}>
                            {driver.status}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-medium mt-1">{driver.details}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 2. LOADS WORKSPACE TAB                                   */}
          {/* ======================================================== */}
          {activeTabState === 'loads' && (
            <div className="space-y-6">
              
              {/* 4 horizontal Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Unassigned */}
                <div 
                  onClick={() => {
                    setFilterStatus(filterStatus === 'Unassigned' ? '' : 'Unassigned');
                    setCurrentPage(1);
                  }}
                  className={`rounded-2xl p-5 border text-left cursor-pointer transition-all flex justify-between items-start ${
                    filterStatus === 'Unassigned'
                      ? 'bg-[#161F30] border-[#23324C] text-white shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="space-y-4 max-w-[80%]">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      filterStatus === 'Unassigned' ? 'bg-brand-500/10 text-brand-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${filterStatus === 'Unassigned' ? 'text-white' : 'text-slate-900'}`}>Unassigned</span>
                      <p className={`text-[10px] leading-relaxed mt-1 ${filterStatus === 'Unassigned' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Booked – awaiting driver assignment
                      </p>
                    </div>
                  </div>
                  <span className={`text-3xl font-extrabold ${filterStatus === 'Unassigned' ? 'text-white' : 'text-slate-900'}`}>
                    {counts.unassigned}
                  </span>
                </div>

                {/* Card 2: In Transit */}
                <div 
                  onClick={() => {
                    setFilterStatus(filterStatus === 'In Transit' ? '' : 'In Transit');
                    setCurrentPage(1);
                  }}
                  className={`rounded-2xl p-5 border text-left cursor-pointer transition-all flex justify-between items-start ${
                    filterStatus === 'In Transit'
                      ? 'bg-[#161F30] border-[#23324C] text-white shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="space-y-4 max-w-[80%]">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      filterStatus === 'In Transit' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${filterStatus === 'In Transit' ? 'text-white' : 'text-slate-900'}`}>In Transit</span>
                      <p className={`text-[10px] leading-relaxed mt-1 ${filterStatus === 'In Transit' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Assigned & physically moving
                      </p>
                    </div>
                  </div>
                  <span className={`text-3xl font-extrabold ${filterStatus === 'In Transit' ? 'text-white' : 'text-slate-900'}`}>
                    {counts.transit}
                  </span>
                </div>

                {/* Card 3: Issues */}
                <div 
                  onClick={() => {
                    setFilterStatus(filterStatus === 'Delayed' ? '' : 'Delayed');
                    setCurrentPage(1);
                  }}
                  className={`rounded-2xl p-5 border text-left cursor-pointer transition-all flex justify-between items-start ${
                    filterStatus === 'Delayed'
                      ? 'bg-[#161F30] border-[#23324C] text-white shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="space-y-4 max-w-[80%]">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      filterStatus === 'Delayed' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${filterStatus === 'Delayed' ? 'text-white' : 'text-slate-900'}`}>Issues</span>
                      <p className={`text-[10px] leading-relaxed mt-1 ${filterStatus === 'Delayed' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Delayed or delivery problems
                      </p>
                    </div>
                  </div>
                  <span className={`text-3xl font-extrabold ${filterStatus === 'Delayed' ? 'text-white' : 'text-slate-900'}`}>
                    {counts.issues}
                  </span>
                </div>

                {/* Card 4: Received */}
                <div 
                  onClick={() => {
                    setFilterStatus(filterStatus === 'Delivered' ? '' : 'Delivered');
                    setCurrentPage(1);
                  }}
                  className={`rounded-2xl p-5 border text-left cursor-pointer transition-all flex justify-between items-start ${
                    filterStatus === 'Delivered'
                      ? 'bg-[#161F30] border-[#23324C] text-white shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="space-y-4 max-w-[80%]">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      filterStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-100 text-slate-505'
                    }`}>
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${filterStatus === 'Delivered' ? 'text-white' : 'text-slate-900'}`}>Received</span>
                      <p className={`text-[10px] leading-relaxed mt-1 ${filterStatus === 'Delivered' ? 'text-slate-400' : 'text-slate-505'}`}>
                        Handover complete / Delivered
                      </p>
                    </div>
                  </div>
                  <span className={`text-3xl font-extrabold ${filterStatus === 'Delivered' ? 'text-white' : 'text-slate-900'}`}>
                    {counts.received}
                  </span>
                </div>
              </div>

              {/* Sub-filter pills */}
              <div className="flex gap-2 text-xs py-1">
                {['All', 'Local Pickups', 'Branch Transfers', 'Local Deliveries'].map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setActivePill(pill)}
                    className={`px-4.5 py-1.5 rounded-full font-bold transition-all border ${
                      activePill === pill
                        ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Table list view matching the screenshot */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-slate-800 text-left">
                {filteredLoads.length === 0 ? (
                  <div className="p-8 text-center text-slate-450 text-xs">
                    No loads matched in selected queue filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-450 uppercase font-black tracking-wider text-[10px]">
                          <th className="pb-3 text-left">Reference</th>
                          <th className="pb-3 text-left">Routing</th>
                          <th className="pb-3 text-left">Priority</th>
                          <th className="pb-3 text-left">Load</th>
                          <th className="pb-3 text-left">Resource</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedLoads.map((load) => (
                          <tr key={load.id} className="hover:bg-slate-50/50">
                            <td className="py-4">
                              <strong className="text-slate-900 block font-bold text-sm">{load.loadId || `SHP-${load.id}`}</strong>
                              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                                REF: {load.customerRef || 'COKE-9901'} • SN: STK-4401
                              </span>
                            </td>
                            <td className="py-4 font-semibold text-slate-700">
                              {load.route}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                                load.status === 'Delayed' || load.status === 'In Transit'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {load.status === 'Delayed' ? 'HIGH' : 'MEDIUM'}
                              </span>
                            </td>
                            <td className="py-4 font-mono font-bold text-slate-600">
                              {load.weight || '6.2t'}
                            </td>
                            <td className="py-4 text-slate-500 font-medium">
                              {load.driver && load.driver !== 'Unassigned' ? (
                                <span className="text-slate-800 font-bold">{load.driver}</span>
                              ) : (
                                <span className="italic text-slate-400">Pending Assignment</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => {
                                  setSelectedLoad(load);
                                  setDrawerOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all text-xs"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 mt-3 flex justify-between items-center text-slate-500">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 3. LOAD INGESTION INBOX TAB                              */}
          {/* ======================================================== */}
          {activeTabState === 'inbox' && (
            <div className="space-y-6">
              <style>{`
                .force-white-text {
                  color: #ffffff !important;
                }
              `}</style>
              
              {/* Header section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5 text-left">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-2xl font-black text-white tracking-tight">Load Inbox</h2>
                    <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[9px] ml-3 uppercase tracking-wider">
                      {inboxItems.length} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Field-submitted draft loads — Review & convert to active
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    resetStepper();
                    setIsCreateLoadOpen(true);
                  }}
                  className="bg-black hover:bg-neutral-900 border border-neutral-800 force-white-text font-extrabold rounded-xl px-5 py-2.5 shadow-md text-xs transition-all uppercase tracking-wider"
                >
                  + New Manual Load
                </button>
              </div>

              {/* Filters bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="relative w-full sm:w-[320px]">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    placeholder="Search by ID, Driver, or Origin..."
                    className="pl-9 pr-4 py-2 bg-[#0B0F19]/50 border border-[#23324C] text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 w-full font-sans"
                  />
                </div>

                <div className="flex gap-2">
                  {['ALL', 'PENDING', 'HIGH'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInboxFilterTab(tab)}
                      className={`px-4.5 py-1.5 rounded-full font-bold transition-all border text-xs ${
                        inboxFilterTab === tab
                          ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inbox cards list */}
              <div className="space-y-4">
                {inboxItems.filter(item => {
                  const matchesSearch = 
                    item.id.includes(inboxSearch) || 
                    item.driver.toLowerCase().includes(inboxSearch.toLowerCase()) || 
                    item.route.toLowerCase().includes(inboxSearch.toLowerCase());
                  
                  let matchesPill = true;
                  if (inboxFilterTab === 'PENDING') {
                    matchesPill = item.status === 'PENDING';
                  } else if (inboxFilterTab === 'HIGH') {
                    matchesPill = item.status === 'URGENT';
                  }
                  return matchesSearch && matchesPill;
                }).length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-white/5 rounded-2xl border border-[#23324C]/45">
                    No pending loads in inbox.
                  </div>
                ) : (
                  inboxItems.filter(item => {
                    const matchesSearch = 
                      item.id.includes(inboxSearch) || 
                      item.driver.toLowerCase().includes(inboxSearch.toLowerCase()) || 
                      item.route.toLowerCase().includes(inboxSearch.toLowerCase());
                    
                    let matchesPill = true;
                    if (inboxFilterTab === 'PENDING') {
                      matchesPill = item.status === 'PENDING';
                    } else if (inboxFilterTab === 'HIGH') {
                      matchesPill = item.status === 'URGENT';
                    }
                    return matchesSearch && matchesPill;
                  }).map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left text-slate-800 transition-all hover:shadow-md"
                    >
                      {/* Top Row Details */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Clock pending icon on left */}
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="h-5 w-5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-slate-900">DRAFT-{item.id}</h4>
                              {item.status === 'URGENT' && (
                                <span className="px-2 py-0.5 border border-rose-200 bg-rose-50 text-rose-600 rounded text-[9px] font-black tracking-wider uppercase">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">{item.time}</span>
                            
                            {/* Badges row */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              {/* Driver Badge */}
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-700">
                                <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-[8px] font-black text-slate-600 overflow-hidden">
                                  {item.driver.charAt(0)}
                                </div>
                                {item.driver}
                              </div>
                              
                              {/* Units Badge */}
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-700">
                                <Truck className="h-3 w-3 text-slate-400" />
                                {item.units} Units
                              </div>

                              {/* Route Badge */}
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-[10px] font-black">
                                {item.route}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on far right */}
                        <div className="flex items-center gap-2.5 justify-end">
                          <button
                            onClick={() => handleRejectInboxItem(item.id)}
                            className="w-9 h-9 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-xl text-rose-500 hover:bg-rose-100 transition-all font-bold"
                            title="Reject draft load"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => handleApproveInboxItem(item)}
                            className="bg-amber-400 hover:bg-amber-300 border border-amber-350 text-slate-950 font-black rounded-xl px-5 py-2 text-xs transition-all uppercase tracking-wider"
                          >
                            APPROVE
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Manifest Selector */}
                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => toggleInboxItemExpanded(item.id)}
                          className="w-full px-5 py-3 bg-slate-50/50 hover:bg-slate-50 text-left text-xs font-bold text-slate-650 flex justify-between items-center transition-all"
                        >
                          <span>View VIN Manifest ({item.units})</span>
                          <ArrowRight className={`h-4 w-4 text-slate-400 transform transition-transform ${item.expanded ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Collapsible vehicles manifest panel */}
                        {item.expanded && (
                          <div className="p-5 bg-white border-t border-slate-100 divide-y divide-slate-100 text-xs">
                            {item.vehicles.map((v, vIdx) => (
                              <div key={vIdx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Unit {vIdx + 1}</span>
                                  <strong className="text-slate-800 font-mono text-sm block">{v.vin}</strong>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-slate-600 font-semibold">{v.make} {v.model}</span>
                                  <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-[9px]">
                                    {v.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 4. TERMINAL WORKSPACE TAB (SMART BARCODE SCANNING)        */}
          {/* ======================================================== */}
          {activeTabState === 'terminal-workspace' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Barcode scanner simulator */}
                <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Smart-Sorting Inbound Scanner</h3>
                    <p className="text-xs text-slate-400">Depot staff sorting barcode scan emulator. Input shipment ID.</p>
                  </div>

                  <form onSubmit={handleScanSubmit} className="space-y-3 pt-2">
                    <TextInput 
                      label="Inbound Shipment ID / Barcode ID" 
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      placeholder="e.g. LD-9411 or type anything..." 
                    />
                    <Button type="submit" variant="primary" className="w-full font-black text-slate-955 bg-brand-500 hover:bg-brand-400">
                      Scan & Redirect Cargo
                    </Button>
                  </form>

                  {/* Dynamic Decision result panel */}
                  {scanResult && (
                    <div className={`p-5 rounded-2xl border ${
                      scanResult.status === 'SUCCESS' || scanResult.status === 'REDIRECTED'
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-amber-500/10 border-amber-500/30'
                    } space-y-3.5 text-xs text-left animate-fade-in`}>
                      <div className="flex justify-between items-center">
                        <strong className="text-white text-sm font-mono">{scanResult.packageId}</strong>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          scanResult.status === 'SUCCESS' || scanResult.status === 'REDIRECTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>{scanResult.status}</span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <p><strong>Redirect Section:</strong> <span className="text-white font-bold">{scanResult.section}</span></p>
                        <p><strong>Weight Class:</strong> {scanResult.weight}</p>
                        <p><strong>DEPOT ACTION REQUIRED:</strong> <span className="text-brand-400 font-bold">{scanResult.action}</span></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan logs timeline */}
                <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Depot Scanned Logs</h3>
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {scannedLogs.map((log, index) => (
                      <div key={index} className="p-3 bg-[#111827]/40 border border-[#23324C]/40 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <strong className="text-white block font-mono">{log.packageId}</strong>
                          <span className="text-[10px] text-slate-400 block">{log.info}</span>
                          <span className="text-[9px] text-slate-500 block font-mono">{log.time}</span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold block ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>{log.status}</span>
                          <span className="text-[10px] text-slate-300 font-semibold block mt-1">{log.section}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 5. FLEET MONITOR TAB (REAL-TIME TELEMETRY)               */}
          {/* ======================================================== */}
          {activeTabState === 'fleet-monitor' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Active telemetry units table */}
                <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Active Fleet Telemetry</h3>
                  
                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {fleet.filter(f => f.type !== 'Trailer').map((unit) => {
                      const matchedLoad = loads.find(l => l.vehicle === unit.plate && l.status === 'In Transit');
                      return (
                        <div key={unit.id} className="p-3.5 bg-[#111827]/60 border border-[#23324C]/45 rounded-xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong className="text-white text-sm font-mono">{unit.plate}</strong>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[8px] font-bold uppercase">{unit.type}</span>
                            </div>
                            <p className="text-slate-350">Driver: <span className="text-slate-200 font-semibold">{matchedLoad?.driver || 'Standby'}</span></p>
                            <p className="text-slate-455 text-[10px]">Current job: {matchedLoad?.loadId || 'N/A'}</p>
                          </div>
                          
                          <div className="text-right space-y-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              unit.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>{unit.status}</span>
                            <div className="text-[10px] text-slate-400">
                              <p className="font-bold text-brand-400">62 mph</p>
                              <p className="text-[9px]">Dist: 14 mi</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Map interface */}
                <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[500px]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">GIS Live GPS Telemetry Overlay</h3>
                    <p className="text-xs text-slate-400">Click actions to manage router telemetry</p>
                  </div>

                  <div className="flex-grow bg-[#0B0F19] rounded-xl border border-[#23324C] relative overflow-hidden flex items-center justify-center my-4 min-h-[260px]">
                    <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-[#0B0F19] animate-ping" />
                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#0B0F19]" />
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
                    <Button size="xs" variant="primary" onClick={() => triggerToast('GIS Live tracking refresh activated.')}>Refresh GPS</Button>
                    <Button size="xs" variant="secondary" onClick={() => triggerToast('Google Maps coordinates launched.')}>Open Route</Button>
                    <Button size="xs" variant="outline" onClick={() => triggerToast('Location logs sent to terminal.')}>Send Location to Driver</Button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 6. FLEET ASSETS TAB                                      */}
          {/* ======================================================== */}
          {activeTabState === 'fleet-assets' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Fleet Assets Registry</h3>
                <Button size="sm" variant="success" onClick={() => triggerToast('New fleet asset registered.')}>Register New Asset</Button>
              </div>

              <DataTable 
                tableName="dispatch_fleet_assets"
                columns={[
                  { key: 'plate', label: 'Asset Plate / ID', render: (row) => <span className="font-mono text-white">{row.plate}</span> },
                  { key: 'type', label: 'Payload Type', render: (row) => <span className="text-slate-300 font-semibold">{row.type}</span> },
                  { key: 'capacity', label: 'Payload Limit Capacity', render: (row) => <span className="font-bold text-slate-355">{row.capacity}</span> },
                  { key: 'fuel', label: 'Fuel Level Gauge', render: (row) => (
                    <div className="w-[120px] bg-slate-800 rounded-full h-2 relative overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full w-2/3" />
                    </div>
                  )},
                  { key: 'status', label: 'Status Badge', render: (row) => <StatusBadge status={row.status || 'Active'} /> }
                ]} data={fleet} />
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. ASSET INVENTORY TAB                                   */}
          {/* ======================================================== */}
          {activeTabState === 'asset-inventory' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Asset Inventory Registry</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => triggerToast('Move item workflow activated.')}>Move Item</Button>
                  <Button size="sm" variant="outline" onClick={() => triggerToast('Asset lane changed.')}>Move to Load Lane</Button>
                </div>
              </div>

              <DataTable 
                tableName="dispatch_asset_inventory"
                columns={[
                  { key: 'vin', label: 'VIN / Serial Number', render: (row) => <span className="font-mono text-white text-[11px]">{row.vin || 'SN-9023812'}</span> },
                  { key: 'desc', label: 'Description', render: (row) => <span className="text-slate-300">{row.cargo || 'Automotive Component parts'}</span> },
                  { key: 'location', label: 'Location Bay Slot', render: (row) => <span className="font-bold text-brand-400">Bay A-3</span> },
                  { key: 'loadId', label: 'Linked Load ID', render: (row) => <span className="font-mono text-slate-400 font-bold">{row.loadId || 'Unassigned / Holding'}</span> },
                  { key: 'status', label: 'Operational status', render: (row) => <StatusBadge status={row.status || 'Holding'} /> }
                ]} data={loads} />
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. ROSTER CONTROL TAB                                    */}
          {/* ======================================================== */}
          {activeTabState === 'roster-control' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Operator Shift Roster Control</h3>

              <div className="space-y-4">
                {drivers.map((driver) => {
                  const isSelected = selectedDriverId === driver.id;
                  return (
                    <div 
                      key={driver.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected ? 'bg-brand-500/5 border-brand-500' : 'bg-[#111827]/40 border-[#23324C]/60'
                      }`}
                    >
                      <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                        <div>
                          <strong className="text-white text-sm block">{driver.name}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">Shift: Sydney Depot Shift - 08:00 - 16:00</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <StatusBadge status={driver.status} />
                          <button 
                            onClick={() => triggerToast(`Dialing operator: ${driver.name}`)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Compliance & Qualifications checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#23324C]/30 mt-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Qualifications</span>
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-bold">Dangerous Goods</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-bold">Heavy Combo (HC)</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-505 block uppercase font-bold">Compliance Checklist</span>
                          <p className="text-emerald-455 font-bold">✓ License & Medical Valid</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-505 block uppercase font-bold">Transit details</span>
                          <p className="text-slate-300 font-semibold">{driver.plate || 'Standby idle'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. COMMUNICATION DEPOT TAB                               */}
          {/* ======================================================== */}
          {activeTabState === 'communication-depot' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Driver list */}
              <div className="lg:col-span-4 glass rounded-2xl p-4 border border-[#23324C]/60 text-left flex flex-col justify-between max-h-[500px]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Operator Hotlines</h3>
                <div className="space-y-2 overflow-y-auto pr-1 flex-grow scrollbar-none">
                  {drivers.map((d) => (
                    <div key={d.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/40 rounded-xl hover:border-brand-500/25 transition-all cursor-pointer">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-white block font-bold">{d.name}</strong>
                        <span className="text-[9px] text-slate-500 font-mono">10 min ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messaging window */}
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[500px]">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Driver hotline chat console</h3>
                  <p className="text-xs text-slate-505">Live coordinates messaging updates.</p>
                </div>

                <div className="flex-grow overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-none flex flex-col-reverse max-h-[320px]">
                  {chats.map(chat => (
                    <div key={chat.id} className="p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-white mb-1">
                        <span>{chat.sender}</span>
                        <span className="text-slate-500 font-mono text-[9px]">{chat.time}</span>
                      </div>
                      <p className="text-slate-350">"{chat.msg}"</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[#23324C]/40 pt-3">
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type driver instruction message..."
                    className="flex-grow px-3 py-2 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                  <Button type="submit" variant="primary" icon={Send} />
                </form>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 10. SYSTEM SETTINGS TAB                                  */}
          {/* ======================================================== */}
          {activeTabState === 'system-settings' && (
            <div className="glass rounded-2xl p-6 border border-[#23324C]/60 text-left space-y-5">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">System settings terminal configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase mb-1.5 block">Dispatcher active Depot Terminal</span>
                    <SelectInput 
                      value="Sydney Central Depot" 
                      onChange={() => triggerToast('Depot terminal branch updated.')} 
                      options={[
                        { value: 'Sydney Central Depot', label: 'Sydney Central Depot' },
                        { value: 'Chicago HQ Terminal', label: 'Chicago HQ Terminal' },
                        { value: 'Los Angeles Depot', label: 'Los Angeles Depot' }
                      ]} 
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase mb-1.5 block">Company Niche Mode</span>
                    <SelectInput 
                      value={selectedNiche} 
                      onChange={(e) => {
                        setSelectedNiche(e.target.value);
                        triggerToast(`Company niche updated: ${e.target.value}`);
                      }} 
                      options={[
                        { value: 'general_freight', label: 'General Freight Dedicated' },
                        { value: 'car_carrying', label: 'Car Carrying Dedicated' },
                        { value: 'dangerous_goods', label: 'Dangerous Goods (HAZMAT) Dedicated' }
                      ]} 
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border border-[#23324C]/40 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allowed Niches Toggle</span>
                  
                  <div className="space-y-2 text-slate-300">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowedNiches.includes('general_freight')} 
                        onChange={(e) => {
                          if (e.target.checked) setAllowedNiches([...allowedNiches, 'general_freight']);
                          else if (allowedNiches.length > 1) setAllowedNiches(allowedNiches.filter(n => n !== 'general_freight'));
                        }}
                        className="rounded border-[#23324C] text-brand-500 h-4.5 w-4.5" 
                      />
                      <span>General Freight</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowedNiches.includes('car_carrying')} 
                        onChange={(e) => {
                          if (e.target.checked) setAllowedNiches([...allowedNiches, 'car_carrying']);
                          else if (allowedNiches.length > 1) setAllowedNiches(allowedNiches.filter(n => n !== 'car_carrying'));
                        }}
                        className="rounded border-[#23324C] text-brand-500 h-4.5 w-4.5" 
                      />
                      <span>Car Carrying</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowedNiches.includes('dangerous_goods')} 
                        onChange={(e) => {
                          if (e.target.checked) setAllowedNiches([...allowedNiches, 'dangerous_goods']);
                          else if (allowedNiches.length > 1) setAllowedNiches(allowedNiches.filter(n => n !== 'dangerous_goods'));
                        }}
                        className="rounded border-[#23324C] text-brand-500 h-4.5 w-4.5" 
                      />
                      <span>Dangerous Goods</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal pt-2">
                    Note: If only 1 niche is selected, the "Select Niche" step in the Load Ingestion wizard will be hidden automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

        </>
      )}

      {/* ======================================================== */}
      {/* CREATE LOAD STEPPER MODAL                                */}
      {/* ======================================================== */}
      <Modal 
        isOpen={isCreateLoadOpen} 
        onClose={() => setIsCreateLoadOpen(false)} 
        title="Create New Dispatch Cargo Load"
      >
        <div className="space-y-6 max-h-[520px] overflow-y-auto pr-1 text-xs text-left">
          
          {/* Header step tracker */}
          <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-3">
            <span className="font-bold text-brand-400 uppercase tracking-widest text-[10px]">
              Step {createStep} of 10
            </span>
            <div className="flex gap-2">
              <Button size="xs" variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
              {createStep === 10 && <Button size="xs" variant="success" onClick={() => handleActivateLoad(true)}>Dispatch Load</Button>}
              {createStep === 10 && <Button size="xs" variant="primary" onClick={() => handleActivateLoad(false)}>Activate Load</Button>}
            </div>
          </div>

          {/* Dynamic Steps rendering */}
          {createStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 1: Load Header Settings</h4>
              
              {allowedNiches.length > 1 ? (
                <SelectInput 
                  label="Select Transport Niche type" 
                  value={newLoadHeader.niche} 
                  onChange={(e) => setNewLoadHeader({ ...newLoadHeader, niche: e.target.value })} 
                  options={allowedNiches.map(n => ({ value: n, label: n.replace('_', ' ').toUpperCase() }))} 
                />
              ) : (
                <div className="p-3 bg-slate-800/40 border border-[#23324C]/50 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Transport Niche (Locked)</span>
                  <strong className="text-white capitalize">{newLoadHeader.niche.replace('_', ' ')}</strong>
                </div>
              )}

              <TextInput 
                label="Customer Reference PO #" 
                placeholder="e.g. PO-90238" 
              />
              <TextInput 
                label="Required Date" 
                type="datetime-local" 
                value={newLoadHeader.requiredDate} 
                onChange={(e) => setNewLoadHeader({ ...newLoadHeader, requiredDate: e.target.value })} 
              />
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 2: Pickup & Drop-off Stops</h4>
              <p className="text-[10px] text-slate-400">Specify locations for default Pickup and Delivery stops.</p>

              {newStops.map((stop, idx) => (
                <div key={stop.id} className="p-4 bg-slate-900/30 border border-[#23324C]/40 rounded-xl space-y-3 relative">
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Stop {stop.sequence}: {stop.type}</span>
                  <TextInput 
                    label="Address / Terminal location" 
                    value={stop.address}
                    onChange={(e) => {
                      const updated = [...newStops];
                      updated[idx].address = e.target.value;
                      setNewStops(updated);
                    }}
                    placeholder={`Enter ${stop.type.toLowerCase()} address...`} 
                  />
                  <TextInput 
                    label="Stop Instructions / Notes" 
                    value={stop.notes}
                    onChange={(e) => {
                      const updated = [...newStops];
                      updated[idx].notes = e.target.value;
                      setNewStops(updated);
                    }}
                    placeholder="e.g. Check gate code" 
                  />
                </div>
              ))}
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 3: Manifest Shipment Item details</h4>
              
              <div className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-3">
                <TextInput label="Item Description / Cargo name" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Description" />
                <TextInput label="Weight" value={itemWeight} onChange={(e) => setItemWeight(e.target.value)} placeholder="e.g. 4500" />
                
                {/* Niche specific fields toggle */}
                {newLoadHeader.niche === 'car_carrying' && (
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput label="VIN Number" value={itemVin} onChange={(e) => setItemVin(e.target.value)} placeholder="VIN" />
                    <TextInput label="Rego / Plate" value={itemRego} onChange={(e) => setItemRego(e.target.value)} placeholder="Rego" />
                    <TextInput label="Make" value={itemMake} onChange={(e) => setItemMake(e.target.value)} placeholder="Make" />
                    <TextInput label="Model" value={itemModel} onChange={(e) => setItemModel(e.target.value)} placeholder="Model" />
                    <SelectInput 
                      label="Drivable status" 
                      value={itemDrivable} 
                      onChange={(e) => setItemDrivable(e.target.value)} 
                      options={[{ value: 'yes', label: 'Yes - Drivable' }, { value: 'no', label: 'No - Inoperable' }]} 
                    />
                  </div>
                )}

                {newLoadHeader.niche === 'general_freight' && (
                  <TextInput label="Pallet Count" value={itemPallets} onChange={(e) => setItemPallets(e.target.value)} placeholder="e.g. 12" />
                )}

                {newLoadHeader.niche === 'dangerous_goods' && (
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput label="Hazmat Class" value={itemHazmatClass} onChange={(e) => setItemHazmatClass(e.target.value)} placeholder="e.g. Class 9" />
                    <TextInput label="UN Number" value={itemUnNumber} onChange={(e) => setItemUnNumber(e.target.value)} placeholder="e.g. UN 3082" />
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={handleAddStepperItem} className="w-full">Add Item to Manifest</Button>
              </div>

              {/* Items checklist */}
              <div className="space-y-2">
                {newItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-900/30 border border-[#23324C]/40 rounded-xl flex justify-between items-center">
                    <div>
                      <strong className="text-white block">{item.name}</strong>
                      <span className="text-[10px] text-slate-400">{item.weight} {item.vin ? `| VIN: ${item.vin}` : ''}</span>
                    </div>
                    <button onClick={() => handleRemoveStepperItem(item.id)} className="text-rose-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {createStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 4: Link items to Pickup Stops</h4>
              <p className="text-[10px] text-slate-400">Verify items are matched with pickup origin.</p>
              <div className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-2">
                {newItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-1">
                    <span className="text-white">{item.name}</span>
                    <span className="text-emerald-455 font-bold">✓ Linked to Stop 1 (Pickup)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {createStep === 5 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 5: Link items to Drop-off Delivery Stops</h4>
              <div className="p-4 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl space-y-2">
                {newItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-1">
                    <span className="text-white">{item.name}</span>
                    <span className="text-sky-455 font-bold">✓ Linked to Stop 2 (Delivery)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {createStep === 6 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 6: Assign Operator Driver</h4>
              <SelectInput 
                value={assignedDriver} 
                onChange={(e) => setAssignedDriver(e.target.value)} 
                options={[{ value: '', label: 'Select Driver...' }, ...drivers.map(d => ({ value: d.name, label: d.name }))]} 
              />
            </div>
          )}

          {createStep === 7 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 7: Assign Truck Vehicle</h4>
              <SelectInput 
                value={assignedVehicle} 
                onChange={(e) => setAssignedVehicle(e.target.value)} 
                options={[{ value: '', label: 'Select Vehicle...' }, ...fleet.filter(f => f.type !== 'Trailer').map(f => ({ value: f.plate, label: f.plate }))]} 
              />
            </div>
          )}

          {createStep === 8 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 8: Assign Trailer Asset</h4>
              <SelectInput 
                value={assignedTrailer} 
                onChange={(e) => setAssignedTrailer(e.target.value)} 
                options={[{ value: '', label: 'Select Trailer...' }, ...fleet.filter(f => f.type === 'Trailer').map(f => ({ value: f.plate, label: f.plate }))]} 
              />
            </div>
          )}

          {createStep === 9 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 9: Upload documents/photos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => { setNewDocs({ ...newDocs, bol: true }); triggerToast('Manifest uploaded.'); }}
                  className={`p-5 rounded-2xl border border-dashed text-center cursor-pointer hover:border-brand-500/40 ${
                    newDocs.bol ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/30 border-[#23324C]/60'
                  }`}
                >
                  <FileText className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                  <span className="font-bold text-slate-200 block text-[10px]">Manifest / BOL</span>
                </div>
                <div 
                  onClick={() => triggerToast('Photos attached.')}
                  className="p-5 rounded-2xl border border-dashed border-[#23324C]/60 bg-slate-900/30 text-center cursor-pointer hover:border-brand-500/40"
                >
                  <Layers className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                  <span className="font-bold text-slate-200 block text-[10px]">Attach Photos</span>
                </div>
              </div>
            </div>
          )}

          {createStep === 10 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 10: Step parameters confirmation review</h4>
              <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-2xl space-y-2">
                <p><strong>Niche:</strong> <span className="text-white">{newLoadHeader.niche}</span></p>
                <p><strong>Total stops:</strong> {newStops.length} stops</p>
                <p><strong>Total items:</strong> {newItems.length} manifest items</p>
                <p><strong>Assigned Driver:</strong> {assignedDriver || 'Unassigned'}</p>
                <p><strong>Assigned Vehicle:</strong> {assignedVehicle || 'Unassigned'}</p>
              </div>
            </div>
          )}

          {/* Navigation controller buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-[#23324C]/45 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={createStep === 1}
              onClick={() => setCreateStep(createStep - 1)}
            >
              Back
            </Button>
            
            {createStep < 10 ? (
              <Button 
                size="sm" 
                variant="primary" 
                onClick={() => setCreateStep(createStep + 1)}
              >
                Next Step
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => handleActivateLoad(true)}>Dispatch Load</Button>
                <Button size="sm" variant="primary" onClick={() => handleActivateLoad(false)}>Activate Load</Button>
              </div>
            )}
          </div>

        </div>
      </Modal>

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
              <div className="grid grid-cols-2 gap-4 bg-slate-800/20 p-3 rounded-lg border border-[#23324C]/45 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Plate</label>
                  <input type="text" value={v.plate} disabled className="w-full bg-[#111827] border border-[#23324C] text-slate-355 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1">Vehicle Type</label>
                  <input type="text" value={v.type} disabled className="w-full bg-[#111827] border border-[#23324C] text-slate-355 p-2 rounded-lg opacity-70" />
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

      {/* Active Load Detail Inspect Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Active Load Operational Dispatch Tracking Log">
        {selectedLoadDetail && (
          <div className="space-y-6 text-xs text-left p-1">
            
            {/* Header info */}
            <div className="flex justify-between items-center bg-[#0B0F19]/80 border border-[#23324C]/60 p-4 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Routing Path Details</span>
                <strong className="text-white font-mono text-sm">{selectedLoadDetail.loadId}</strong>
                <p className="text-slate-350 text-[11px] mt-0.5">{selectedLoadDetail.route}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedLoadDetail.status} />
              </div>
            </div>

            {/* General parameters */}
            <div className="grid grid-cols-2 gap-4 bg-[#111827]/40 border border-[#23324C]/45 p-4 rounded-xl text-slate-300">
              <p><strong>Cargo Manifest:</strong> <span className="text-white font-semibold">{selectedLoadDetail.cargo}</span></p>
              <p><strong>Declared Weight:</strong> {selectedLoadDetail.weight}</p>
              <p><strong>Assigned Truck:</strong> <span className="text-white font-bold">{selectedLoadDetail.vehicle || 'Unassigned'}</span></p>
              <p><strong>Assigned Trailer:</strong> <span className="text-white font-bold">{selectedLoadDetail.trailer || 'TR-4022'}</span></p>
              <p><strong>Operator Driver:</strong> <span className="text-white font-bold">{selectedLoadDetail.driver}</span></p>
              <p><strong>Driver Hotline:</strong> {selectedLoadDetail.contact || 'N/A'}</p>
            </div>

            {/* Trailer swap history */}
            <div className="p-4 bg-[#111827]/40 border border-[#23324C]/45 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trailer swap configuration</span>
                <span className="text-[8px] bg-brand-500/10 text-brand-400 border border-brand-500/25 px-1.5 py-0.5 rounded font-mono font-bold">Active: {selectedLoadDetail.trailer || 'TR-4022'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <SelectInput 
                  label="Select New Swap Trailer Asset" 
                  value={newTrailerPlate} 
                  onChange={(e) => setNewTrailerPlate(e.target.value)} 
                  options={fleet.filter(f => f.type === 'Trailer').map(f => ({ value: f.plate, label: f.plate }))} 
                />
                <TextInput 
                  label="Trailer Swap Reason" 
                  value={swapReason} 
                  onChange={(e) => setSwapReason(e.target.value)} 
                  placeholder="e.g. Tire blowout / maintenance" 
                />
              </div>
              <Button size="sm" variant="primary" className="w-full font-black text-slate-950 bg-brand-500 hover:bg-brand-400" onClick={handleTrailerSwap}>
                Swap Trailer Asset
              </Button>
            </div>

            {/* Stop list */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stop sequence details</span>
              <div className="space-y-2.5">
                {(selectedLoadDetail.stops || []).map((stop, index) => (
                  <div key={index} className="p-3 bg-[#0B0F19]/50 border border-[#23324C]/40 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[8px] rounded uppercase font-bold">{stop.type}</span>
                      <strong className="text-white block mt-1">{stop.address}</strong>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[9px]">Completed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note logs */}
            <div className="p-4 bg-[#111827]/40 border border-[#23324C]/45 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Internal Dispatch Note Logs</span>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea 
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#23324C] rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500 resize-none min-h-[70px]"
                  placeholder="Type new operational dispatch note..."
                ></textarea>
                <Button type="submit" size="sm" variant="success" className="w-full">
                  Record Note
                </Button>
              </form>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {(selectedLoadDetail.notes || []).map((note, index) => (
                  <p key={index} className="p-2 bg-[#0B0F19]/30 rounded-lg text-slate-350 italic border-l-2 border-brand-500">"{note}"</p>
                ))}
              </div>
            </div>

            {/* Close button */}
            <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(false)} className="w-full">
              Close Tracking Inspector
            </Button>
          </div>
        )}
      </Drawer>

    </div>
  );
}
