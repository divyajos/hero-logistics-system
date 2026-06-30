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
import { BarChartWidget } from '../common/DashboardCharts';
import { 
  Layers, Navigation, Truck, ShieldAlert, Plus, Check, Clock, User, Phone, 
  MapPin, MessageSquare, ArrowRight, ArrowLeft, Send, Calendar as CalendarIcon, FileText, Activity, Trash2, Filter, Info, Eye, Package, Lock, Sliders,
  DollarSign, Globe, Users, Download, Star, Wrench, Shield, Key, AlertTriangle, QrCode, Cpu, Edit, Trash, ChevronDown, ChevronLeft, Inbox
} from 'lucide-react';

const loadThroughputData = [
  { label: 'JAN', value: 15 },
  { label: 'FEB', value: 20 },
  { label: 'MAR', value: 18 },
  { label: 'APR', value: 25 },
  { label: 'MAY', value: 30 },
  { label: 'JUN', value: 28 },
  { label: 'JUL', value: 38 },
  { label: 'AUG', value: 35 },
  { label: 'SEP', value: 42 },
  { label: 'OCT', value: 39 },
  { label: 'NOV', value: 46 },
  { label: 'DEC', value: 52 },
];

const financialPerformanceData = [
  { label: 'JAN', value: 10 },
  { label: 'FEB', value: 13 },
  { label: 'MAR', value: 12 },
  { label: 'APR', value: 17 },
  { label: 'MAY', value: 20 },
  { label: 'JUN', value: 18 },
  { label: 'JUL', value: 25 },
  { label: 'AUG', value: 23 },
  { label: 'SEP', value: 29 },
  { label: 'OCT', value: 27 },
  { label: 'NOV', value: 33 },
  { label: 'DEC', value: 38 },
];

const defaultAuditLogs = [
  { refId: 'LOG-4412', name: 'Michael Adams', role: 'ADMIN', action: 'Modified System Settings', time: '10 mins ago', ip: '192.168.1.44' },
  { refId: 'LOG-4411', name: 'Sarah Mitchell', role: 'DISPATCH', action: 'Created New Job', time: '22 mins ago', ip: '192.168.1.101' },
  { refId: 'LOG-4410', name: 'Jack Taylor', role: 'DRIVER', action: 'Vehicle Status Update', time: '1 hr ago', ip: '172.16.0.4' },
  { refId: 'LOG-4409', name: 'Liam Smith', role: 'DISPATCH', action: 'Handover Initiated', time: '2 hrs ago', ip: '192.168.1.102' },
  { refId: 'LOG-4408', name: 'Maria Garcia', role: 'OPERATOR', action: 'Cross-Dock Sorting', time: '5 hrs ago', ip: '192.168.1.55' },
];

export default function DispatchDashboard({ activeTab = 'overview', setActiveTab }) {
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
  const [activeWorkflowFilter, setActiveWorkflowFilter] = useState('Review');
  const [loadSubTab, setLoadSubTab] = useState('All');

  // Customer sub-tab filter
  const [activeCustomerFilter, setActiveCustomerFilter] = useState('All');
  const [customerSortOrder, setCustomerSortOrder] = useState('name');
  
  // Asset sub-tab filter
  const [activeAssetFilter, setActiveAssetFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View state (List or Grid)
  const [isGridView, setIsGridView] = useState(false);
  const [sortByField, setSortByField] = useState('plate');

  // Load Creation Flow (11-step stepper)
  const [isCreatingLoad, setIsCreatingLoad] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newLoadHeader, setNewLoadHeader] = useState({
    loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
    niche: 'general_freight',
    branch: 'Sydney Central Depot',
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
    { id: 1, sender: 'Jack Taylor (Driver)', msg: 'Toll plaza passed on Sydney M5. ETA on target.', time: '12 min ago' },
    { id: 2, sender: 'Liam Smith (Driver)', msg: 'Straps checked. Cargo secured. Departing depot.', time: '35 min ago' },
    { id: 3, sender: 'System Node', msg: 'Dispatch Load LD-9411 geofence breached Strachfield.', time: '2 hours ago' }
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
  
  // Add Vehicle Modal State
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState({
    plate: '',
    type: 'Heavy Truck',
    status: 'Active',
    branch: 'Sydney Central Depot',
    driver: '',
    payload: '20T'
  });

  // Selected load details reactively updated from Redux store state
  const selectedLoadDetail = loads.find(l => l.id === selectedLoad?.id) || selectedLoad;
  const selectedOverviewLoad = loads.find(l => l.id === selectedOverviewLoadId) || loads[0];

  // Trailer swap in-drawer state
  const [newTrailerPlate, setNewTrailerPlate] = useState('TR-9118');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditSortOrder, setAuditSortOrder] = useState('newest');

  // Interactive checklist definitions matching reference screen 3
  const [checklists, setChecklists] = useState([
    { id: 'CL-001', title: 'Standard Pre-Trip', active: true, scope: 'All Drivers', trigger: 'Every Trip', itemsCount: 6, requiredCount: 5 },
    { id: 'CL-002', title: 'Dangerous Goods Check', active: true, scope: 'DG Certified Drivers', trigger: 'DG Loads Only', itemsCount: 5, requiredCount: 5 },
    { id: 'CL-003', title: 'Cold Chain Monitoring', active: false, scope: 'Reefer Vehicle Drivers', trigger: 'Cold Chain Loads', itemsCount: 3, requiredCount: 3 }
  ]);

  // Delivery problems list matching reference screen 4
  const [deliveryIssues, setDeliveryIssues] = useState([
    { id: 'SHP-9039', time: '14 mins ago', type: 'GPS', category: 'HIGH', title: 'Location Problem', desc: 'The driver is in the wrong place for this drop-off.', driver: 'Liam Smith', status: 'Active' },
    { id: 'SHP-9111', time: '41 mins ago', type: 'Sensor', category: 'CRITICAL', title: 'Temperature Alert', desc: 'The truck storage is too warm for the items.', driver: 'Oliver Brown', status: 'Active' },
    { id: 'SHP-8992', time: '2 hrs ago', type: 'Customer', category: 'MEDIUM', title: 'Customer Refusal', desc: 'The client did not want to take the items today.', driver: 'Noah Williams', status: 'Active' }
  ]);

  // B2B Customer Management directory matching reference screen 1
  const [customersList, setCustomersList] = useState([
    { id: 'CUST-001', name: 'Acme Corp Logistics', logoBg: 'bg-black text-[#FFB200]', logoText: 'Acme', contactName: 'John Smith', contactEmail: 'john@acme.com.au', creditLimit: '$50,000', terms: 'Net 30', loadsCount: '142', loadsValue: '$28,400', rating: '4.8', status: 'ACTIVE' },
    { id: 'CUST-006', name: 'Blue River Exports', logoBg: 'bg-blue-900 text-white', logoText: 'Blue', contactName: 'Mike Tan', contactEmail: 'mike@blueriver.com', creditLimit: '$5,000', terms: 'Net 7', loadsCount: '0', loadsValue: '$0', rating: '2.8', status: 'SUSPENDED' },
    { id: 'CUST-004', name: 'Fresh Markets AU', logoBg: 'bg-emerald-900 text-white', logoText: 'Fresh', contactName: 'Ben Chu', contactEmail: 'ben@freshmarkets.com', creditLimit: '$25,000', terms: 'Net 14', loadsCount: '89', loadsValue: '$14,600', rating: '4.9', status: 'ACTIVE' },
    { id: 'CUST-003', name: 'Global Traders Australia', logoBg: 'bg-yellow-600 text-black', logoText: 'Global', contactName: 'Lucas Brown', contactEmail: 'lucas@globaltr.com', creditLimit: '$150,000', terms: 'Net 60', loadsCount: '0', loadsValue: '$0', rating: '3.2', status: 'ON HOLD' },
    { id: 'CUST-005', name: 'Southport Logistics', logoBg: 'bg-green-800 text-white', logoText: 'South', contactName: 'Sarah Miller', contactEmail: 'sarah@southport.com', creditLimit: '$80,000', terms: 'Net 30', loadsCount: '204', loadsValue: '$41,300', rating: '4.7', status: 'ACTIVE' },
    { id: 'CUST-002', name: 'Tech Solutions Ltd', logoBg: 'bg-stone-900 text-white', logoText: 'Tech', contactName: 'Emma Watson', contactEmail: 'emma@techsol.com', creditLimit: '$10,000', terms: 'Net 14', loadsCount: '38', loadsValue: '$7,200', rating: '4.5', status: 'ACTIVE' }
  ]);

  // Asset register list matching reference screen 2
  const [assetsList, setAssetsList] = useState([
    { id: 'AST-001', make: 'Toyota Camry', year: '2022', color: 'White', type: 'Sedan', weight: '1,450 kg', vin: '1HGCM82G33A004352', plate: 'ABC 123', status: 'IN DEPOT', task: 'LD-2041', target: 'Brisbane QLD', client: 'AutoDeal Pty Ltd' },
    { id: 'AST-002', make: 'Honda CR-V', year: '2023', color: 'Black', type: 'SUV', weight: '1,720 kg', vin: '2T1BU8HE0JC034820', plate: 'XYZ 987', status: 'IN TRANSIT', task: 'LD-2039', target: 'Melbourne VIC', client: 'Smith Motors' },
    { id: 'AST-003', make: 'Tesla Model S', year: '2024', color: 'Red', type: 'Sedan', weight: '2,162 kg', vin: '5YJSA1DG9PF312345', plate: 'EV 0001', status: 'DELIVERED', task: 'LD-2031', target: 'Sydney NSW', client: 'EV Fleet Co' },
    { id: 'AST-004', make: 'Ford Ranger', year: '2021', color: 'Silver', type: 'Ute', weight: '2,030 kg', vin: '3FADP4BJ7FM123456', plate: 'TRK 444', status: 'AWAITING LOAD', task: 'Available', target: 'Perth WA', client: 'WA Motors' },
    { id: 'AST-005', make: 'Nissan X-Trail', year: '2022', color: 'Blue', type: 'SUV', weight: '1,680 kg', vin: '1N4AL3AP7JC234567', plate: 'NIS 202', status: 'IN DEPOT', task: 'LD-2042', target: 'Adelaide SA', client: 'SA Auto Group' }
  ]);

  // Finance Breakdown active view (PL_Breakdown, Invoices, Audit_Trail)
  const [activeFinanceTab, setActiveFinanceTab] = useState('PL_Breakdown');

  // Phase 3 states
  const [operatorsList, setOperatorsList] = useState([
    { name: 'Emma Stevens', email: 'emma.s@hero.com', role: 'WAREHOUSE', branch: 'Brisbane Port', accessLevel: 'Floor Devices', lastActivity: '3 days ago', status: 'OFFLINE' },
    { name: 'Jack Taylor', email: 'jack.t@hero.com', role: 'DRIVER', branch: 'Sydney Central Depot', accessLevel: 'Mobile Only', lastActivity: '2 days ago', status: 'ACTIVE' },
    { name: 'Liam Smith', email: 'liam.s@hero.com', role: 'DRIVER', branch: 'Sydney Central Depot', accessLevel: 'Mobile Only', lastActivity: '1 hr ago', status: 'ACTIVE' },
    { name: 'Michael Adams', email: 'mike.a@hero.com', role: 'ACCOUNTS', branch: 'All Branches', accessLevel: 'Full', lastActivity: 'Now', status: 'ACTIVE' },
    { name: 'Noah Williams', email: 'noah.w@hero.com', role: 'DRIVER', branch: 'Melbourne Depot', accessLevel: 'Mobile Only', lastActivity: '30 mins ago', status: 'ACTIVE' },
    { name: 'Oliver Brown', email: 'oliver.b@hero.com', role: 'DISPATCHER', branch: 'Melbourne Depot', accessLevel: 'Full', lastActivity: '1 week ago', status: 'OFFLINE' },
    { name: 'Sarah Mitchell', email: 'sarah.m@hero.com', role: 'DISPATCHER', branch: 'Sydney Central Depot', accessLevel: 'Full', lastActivity: '10 mins ago', status: 'ACTIVE' }
  ]);
  const [activeOperatorTab, setActiveOperatorTab] = useState('All');
  const [operatorSearch, setOperatorSearch] = useState('');
  const [supportSubTab, setSupportSubTab] = useState('Team Support (Internal)');
  
  // Regions toggles
  const [regionNSW, setRegionNSW] = useState(true);
  const [regionVIC, setRegionVIC] = useState(true);
  const [regionWA, setRegionWA] = useState(false);

  // Create Load Console states
  const [consoleStops, setConsoleStops] = useState([
    { id: 1, type: 'Pickup', address: '', contactName: '', phone: '', requiredTime: '' },
    { id: 2, type: 'Drop', address: '', contactName: '', phone: '', requiredTime: '' }
  ]);
  const [consoleItems, setConsoleItems] = useState([
    { id: 1, customer: 'Acme Corp', pickupStop: 'Stop #1', dropStop: 'Stop #2', niche: 'FREIGHT', desc: '', weight: '0' }
  ]);
  const [consoleCustomerRef, setConsoleCustomerRef] = useState('PO-12345');
  const [consolePriority, setConsolePriority] = useState('NORMAL');
  const [consoleDeadline, setConsoleDeadline] = useState('');
  const [consoleNotes, setConsoleNotes] = useState('');

  // Phase 4 - Master Prompt Redesign States
  // 1. Load Inbox states
  const [inboxDrafts, setInboxDrafts] = useState([
    { id: 'DRAFT-1092', time: '10 mins ago', priority: 'URGENT', driver: 'Michael Chen', units: '2 Units', route: 'Melbourne ➔ Brisbane', vins: ['VIN-MEL8820', 'VIN-MEL8821'] },
    { id: 'DRAFT-1091', time: '45 mins ago', priority: '', driver: 'Sarah Connor', units: '1 Units', route: 'Sydney ➔ Perth', vins: ['VIN-SYD7422'] },
    { id: 'DRAFT-1088', time: '2 hrs ago', priority: '', driver: 'James Park', units: '4 Units', route: 'Brisbane ➔ Adelaide', vins: ['VIN-BNE4021', 'VIN-BNE4022', 'VIN-BNE4023', 'VIN-BNE4024'] }
  ]);
  const [expandedDrafts, setExpandedDrafts] = useState({});
  const [inboxFilter, setInboxFilter] = useState('ALL');
  const [inboxSearch, setInboxSearch] = useState('');

  // 2. Terminal Workspace states
  const [terminalScanInput, setTerminalScanInput] = useState('');
  const [terminalRecentEntries, setTerminalRecentEntries] = useState([
    { id: 'SHP-9041', status: 'REDIRECTED TO LOCAL DELIVERY VAN', time: 'Just now' },
    { id: 'SHP-9042', status: 'REDIRECTED TO LINE-HAUL TRUCK BNE', time: '5 mins ago' }
  ]);
  const [terminalAwaitingArrival, setTerminalAwaitingArrival] = useState([
    { id: 'SHP-9042', depot: 'SYDNEY DEPOT' },
    { id: 'SHP-9044', depot: 'SYDNEY DEPOT' }
  ]);

  // 3. Fleet Monitor map/zoom states
  const [fleetMonitorSearch, setFleetMonitorSearch] = useState('');
  const [mapZoom, setMapZoom] = useState(12);

  // 4. Roster Control states
  const [rosterDrivers, setRosterDrivers] = useState([
    { id: 'DRV-134', name: 'Oliver Brown', status: 'In Break', shift: 'Night Shift (22:00 - 10:00)', score: '★ 4 / 5.0', assignment: 'No Active Job', compliance: ['VALID'], phone: '+61 414 000 004', tier: 'JUNIOR' },
    { id: 'DRV-145', name: 'Lucas Jones', status: 'Off Duty', shift: 'Day Shift', score: '★ 4.9 / 5.0', assignment: 'No Active Job', compliance: ['VALID', 'DG'], phone: '+61 415 000 005', tier: 'SENIOR' },
    { id: 'DRV-105', name: 'Liam Smith', status: 'On Duty', shift: 'Night Shift (18:00 - 06:00)', score: '★ 4.5 / 5.0', assignment: '📍 SHP-20482', compliance: ['VALID', 'WHITE CARD'], phone: '+61 412 000 002', tier: 'REGULAR' },
    { id: 'DRV-102', name: 'Jack Taylor', status: 'On Duty', shift: 'Day Shift (06:00 - 18:00)', score: '★ 4.8 / 5.0', assignment: '📍 SHP-20481', compliance: ['VALID', 'DG', 'MSIC', 'WHITE CARD'], phone: '+61 411 000 001', tier: 'SENIOR' }
  ]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState('All');
  const [rosterSort, setRosterSort] = useState('name');
  const [fleetAssetFilter, setFleetAssetFilter] = useState('All');
  const [fleetAssetsList, setFleetAssetsList] = useState([
    { id: 'TRK-102', reg: 'XQG-984', type: 'Heavy Truck', payload: '20T PAYLOAD', status: 'ACTIVE', location: 'HUME HIGHWAY', fuel: '72%' },
    { id: 'VAN-08', reg: 'BZX-441', type: 'Delivery Van', payload: '2.5T PAYLOAD', status: 'MAINTENANCE', location: 'DEPOT A', fuel: '45%' },
    { id: 'TRL-44', reg: 'T-9921', type: 'Trailer Flatbed', payload: '40T PAYLOAD', status: 'ACTIVE', location: 'WAREHOUSE B', fuel: '-' },
    { id: 'TRK-09', reg: 'XYY-112', type: 'Heavy Truck', payload: '20T PAYLOAD', status: 'ACTIVE', location: 'PACIFIC MWY', fuel: '88%' },
    { id: 'VAN-14', reg: 'VAN-14-SYD', type: 'Cargo Van', payload: '3.5T PAYLOAD', status: 'LOADING', location: 'SYDNEY CBD', fuel: '55%' }
  ]);
  const [fleetAssetSearch, setFleetAssetSearch] = useState('');

  // 5. Communication Depot chat states
  const [activeChatDriver, setActiveChatDriver] = useState('Noah Williams');
  const [chatSearch, setChatSearch] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Noah Williams', text: 'Hi Dispatch. Encountering severe traffic on the Pacific Highway bypass.', time: '10:30 AM' },
    { id: 2, sender: 'Dispatcher', text: 'Noted Noah. ETA updated to 1h 15m in the system. Let know if you need a reroute.', time: '10:35 AM' },
    { id: 3, sender: 'Noah Williams', text: "Traffic is fully stopped now. There's an accident ahead.", time: '10:42 AM' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  useEffect(() => {
    if (activeChatDriver === 'Noah Williams') {
      setChatMessages([
        { id: 1, sender: 'Noah Williams', text: 'Hi Dispatch. Encountering severe traffic on the Pacific Highway bypass.', time: '10:30 AM' },
        { id: 2, sender: 'Dispatcher', text: 'Noted Noah. ETA updated to 1h 15m in the system. Let know if you need a reroute.', time: '10:35 AM' },
        { id: 3, sender: 'Noah Williams', text: "Traffic is fully stopped now. There's an accident ahead.", time: '10:42 AM' }
      ]);
    } else if (activeChatDriver === 'Jack Taylor') {
      setChatMessages([
        { id: 1, sender: 'Jack Taylor', text: 'ETA is looking good. Reaching in 45m.', time: '09:15 AM' }
      ]);
    } else if (activeChatDriver === 'Warehouse A') {
      setChatMessages([
        { id: 1, sender: 'Warehouse A', text: 'Manifest LOD-044 is ready for assignment.', time: 'YESTERDAY' }
      ]);
    }
  }, [activeChatDriver]);

  // 6. Asset Inventory states
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('ALL');
  const [inventoryAssets, setInventoryAssets] = useState([
    { id: 'INV-7721', desc: 'Flatbed Trailer Tie Downs', depot: 'Sydney Central Depot', qty: '124 units', status: 'IN STOCK' },
    { id: 'INV-7722', desc: 'Heavy Duty Ratchet Straps', depot: 'Melbourne Depot', qty: '82 units', status: 'IN STOCK' },
    { id: 'INV-7723', desc: 'Dangerous Goods Hazmat Kits', depot: 'Brisbane Port Branch', qty: '15 units', status: 'LOW STOCK' },
    { id: 'INV-7724', desc: 'Standard Timber Pallets 1.2m', depot: 'Sydney Central Depot', qty: '450 units', status: 'IN STOCK' }
  ]);

  // 7. System Settings sub-tabs
  const [settingsActiveSubTab, setSettingsActiveSubTab] = useState('account');

  useEffect(() => {
    setShowAuditLogs(false);
  }, [activeTab]);

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

  // Create Load Console handler functions
  const handleConsoleAddStop = (e) => {
    if (e) e.preventDefault();
    const nextId = consoleStops.length + 1;
    setConsoleStops([...consoleStops, { id: nextId, type: 'Drop', address: '', contactName: '', phone: '', requiredTime: '' }]);
    triggerToast('Added Stop item.');
  };

  const handleConsoleRemoveStop = (id) => {
    if (consoleStops.length <= 2) {
      triggerToast('A load must have at least 2 stops.', 'warning');
      return;
    }
    setConsoleStops(consoleStops.filter(s => s.id !== id).map((s, idx) => ({ ...s, id: idx + 1 })));
    triggerToast('Removed Stop item.');
  };

  const handleConsoleUpdateStop = (id, field, value) => {
    setConsoleStops(consoleStops.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleConsoleAddItem = (e) => {
    if (e) e.preventDefault();
    const nextId = consoleItems.length + 1;
    setConsoleItems([...consoleItems, { id: nextId, customer: 'Acme Corp', pickupStop: 'Stop #1', dropStop: 'Stop #2', niche: 'FREIGHT', desc: '', weight: '0' }]);
    triggerToast('Added Item entry.');
  };

  const handleConsoleRemoveItem = (id) => {
    if (consoleItems.length <= 1) {
      triggerToast('A load must contain at least 1 cargo item.', 'warning');
      return;
    }
    setConsoleItems(consoleItems.filter(i => i.id !== id).map((i, idx) => ({ ...i, id: idx + 1 })));
    triggerToast('Removed Item entry.');
  };

  const handleConsoleUpdateItem = (id, field, value) => {
    setConsoleItems(consoleItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleConsoleSaveDraft = (e) => {
    if (e) e.preventDefault();
    const finalCargo = consoleItems.map(i => i.desc || 'General Freight').join(', ');
    const totalWeight = `${consoleItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0)} kg`;
    const routePath = consoleStops.map(s => s.address || 'Unknown Suburb').join(' ➔ ');

    dispatch(createLoad({
      status: 'Draft',
      loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
      cargo: finalCargo,
      weight: totalWeight,
      route: routePath,
      pickupAddress: consoleStops[0]?.address || 'Pending Origin',
      deliveryAddress: consoleStops[consoleStops.length - 1]?.address || 'Pending Destination',
      driver: 'Unassigned',
      vehicle: 'Unassigned',
      trailer: 'TR-4022',
      stops: consoleStops,
      items: consoleItems,
      customerName: consoleItems[0]?.customer || 'Acme Corp',
      notes: consoleNotes ? [consoleNotes] : [],
      documents: []
    }));

    triggerToast('Draft load saved successfully.');
    setIsCreatingLoad(false);
    resetConsoleState();
  };

  const handleConsoleActivateLoad = (e) => {
    if (e) e.preventDefault();
    const finalCargo = consoleItems.map(i => i.desc || 'General Freight').join(', ');
    const totalWeight = `${consoleItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0)} kg`;
    const routePath = consoleStops.map(s => s.address || 'Unknown Suburb').join(' ➔ ');

    dispatch(createLoad({
      status: 'Ready',
      loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
      cargo: finalCargo,
      weight: totalWeight,
      route: routePath,
      pickupAddress: consoleStops[0]?.address || 'Pending Origin',
      deliveryAddress: consoleStops[consoleStops.length - 1]?.address || 'Pending Destination',
      driver: 'Unassigned',
      vehicle: 'Unassigned',
      trailer: 'TR-4022',
      stops: consoleStops,
      items: consoleItems,
      customerName: consoleItems[0]?.customer || 'Acme Corp',
      notes: consoleNotes ? [consoleNotes] : [],
      documents: []
    }));

    triggerToast('Load activated successfully.');
    setIsCreatingLoad(false);
    resetConsoleState();
  };

  const resetConsoleState = () => {
    setConsoleStops([
      { id: 1, type: 'Pickup', address: '', contactName: '', phone: '', requiredTime: '' },
      { id: 2, type: 'Drop', address: '', contactName: '', phone: '', requiredTime: '' }
    ]);
    setConsoleItems([
      { id: 1, customer: 'Acme Corp', pickupStop: 'Stop #1', dropStop: 'Stop #2', niche: 'FREIGHT', desc: '', weight: '0' }
    ]);
    setConsoleCustomerRef('PO-12345');
    setConsolePriority('NORMAL');
    setConsoleDeadline('');
    setConsoleNotes('');
  };

  const handleApproveDraft = (draftId) => {
    const draft = inboxDrafts.find(d => d.id === draftId);
    if (!draft) return;
    dispatch(createLoad({
      status: 'Ready',
      loadId: draft.id,
      cargo: `Inbox Cargo (${draft.units})`,
      weight: '6.2t',
      route: draft.route,
      pickupAddress: draft.route.split('➔')[0]?.trim() || 'Sydney Depot',
      deliveryAddress: draft.route.split('➔')[1]?.trim() || 'Melbourne Depot',
      driver: draft.driver,
      vehicle: 'TRK-102',
      trailer: 'TR-4022',
      stops: [],
      items: []
    }));
    setInboxDrafts(inboxDrafts.filter(d => d.id !== draftId));
    triggerToast(`Approved and converted ${draftId} to active load.`);
  };

  const handleRejectDraft = (draftId) => {
    setInboxDrafts(inboxDrafts.filter(d => d.id !== draftId));
    triggerToast(`Rejected ${draftId}.`, 'warning');
  };

  const handleTerminalScanSubmit = (e) => {
    if (e) e.preventDefault();
    if (!terminalScanInput.trim()) return;
    const cleanId = terminalScanInput.toUpperCase().trim();
    
    let actionResult = 'REDIRECTED TO LINE-HAUL TRUCK BNE';
    if (cleanId === 'SHP-9041') {
      actionResult = 'REDIRECTED TO LOCAL DELIVERY VAN (GATE 2)';
    } else if (cleanId === 'SHP-9042') {
      actionResult = 'REDIRECTED TO LINE-HAUL TRUCK (MELBOURNE)';
    }

    setTerminalRecentEntries([
      { id: cleanId, status: actionResult, time: 'Just now' },
      ...terminalRecentEntries
    ]);

    setTerminalAwaitingArrival(terminalAwaitingArrival.filter(a => a.id !== cleanId));

    triggerToast(`Scanned and processed ${cleanId}`);
    setTerminalScanInput('');
  };

  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!newChatMessage.trim()) return;
    const msg = {
      id: chatMessages.length + 1,
      sender: 'Dispatcher',
      text: newChatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, msg]);
    setNewChatMessage('');
    triggerToast('Message sent to driver.');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: activeChatDriver,
          text: `Acknowledged, message received. Over and out.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Add Stop in stepper
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
    if (newStops.length < 2) {
      triggerToast('Need at least 2 stops to reorder.', 'warning');
      return;
    }
    const reordered = [...newStops].reverse().map((s, idx) => ({ ...s, sequence: idx + 1 }));
    setNewStops(reordered);
    triggerToast('Stops sequence reordered and optimized.');
  };

  // Add Item in stepper
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
        ...(newDocs.customs ? [{ name: 'Customs Declaration.pdf', type: 'PDF', date: 'Just now', url: '#' }] : [])
      ]
    }));

    triggerToast('Load created successfully.');
    setIsCreatingLoad(false);
    resetStepper();
  };

  const resetStepper = () => {
    setCreateStep(1);
    setNewLoadHeader({
      loadId: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
      niche: 'general_freight',
      branch: 'Sydney Central Depot',
      requiredDate: ''
    });
    setNewStops([]);
    setNewItems([]);
    setNewDocs({ rateConf: false, bol: false, customs: false });
    setNewNotes('');
    setAssignedDriver('');
    setAssignedVehicle('');
  };

  const handleOpenLoad = (load) => {
    setSelectedLoad(load);
    setDrawerTab('details');
    setDrawerOpen(true);
  };

  // Add vehicle submit
  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    if (!newVehicleForm.plate) {
      triggerToast('Plate is required.', 'error');
      return;
    }
    dispatch(fetchVehicles()); 
    triggerToast(`Vehicle ${newVehicleForm.plate} added to fleet.`);
    setIsAddVehicleModalOpen(false);
    setNewVehicleForm({
      plate: '',
      type: 'Heavy Truck',
      status: 'Active',
      branch: 'Sydney Central Depot',
      driver: '',
      payload: '20T'
    });
  };

  // Filters calculation
  const filteredLoads = loads.filter(load => {
    if (activeTab === 'loads') {
      const wFilter = activeWorkflowFilter.toLowerCase();
      if (wFilter === 'draft' && load.status.toLowerCase() !== 'draft') return false;
      if (wFilter === 'review' && !['planned', 'review'].includes(load.status.toLowerCase())) return false;
      if (wFilter === 'ready' && load.status.toLowerCase() !== 'ready') return false;
      if (wFilter === 'assigned' && load.status.toLowerCase() !== 'assigned') return false;
      if (wFilter === 'active' && !['in transit', 'active'].includes(load.status.toLowerCase())) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const inRoute = load.route?.toLowerCase().includes(q);
      const inId = load.loadId?.toLowerCase().includes(q) || load.id?.toString().includes(q);
      const inDriver = load.driver?.toLowerCase().includes(q);
      const inCargo = load.cargo?.toLowerCase().includes(q);
      if (!inRoute && !inId && !inDriver && !inCargo) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLoads.length / itemsPerPage);
  const paginatedLoads = filteredLoads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredFleet = fleet.filter(vehicle => {
    if (search) {
      const q = search.toLowerCase();
      const inPlate = vehicle.plate?.toLowerCase().includes(q);
      const inBranch = vehicle.branch?.toLowerCase().includes(q);
      const inType = vehicle.type?.toLowerCase().includes(q);
      const inDriver = vehicle.driver?.toLowerCase().includes(q);
      if (!inPlate && !inBranch && !inType && !inDriver) return false;
    }
    return true;
  });

  // KPI count helpers
  const draftLoadsCount = loads.filter(l => l.status.toLowerCase() === 'draft').length;
  const reviewLoadsCount = loads.filter(l => ['planned', 'review'].includes(l.status.toLowerCase())).length;
  const readyLoadsCount = loads.filter(l => l.status.toLowerCase() === 'ready').length;
  const assignedLoadsCount = loads.filter(l => l.status.toLowerCase() === 'assigned').length;
  const activeLoadsCount = loads.filter(l => ['in transit', 'active'].includes(l.status.toLowerCase())).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-t-2 border-[#FFB200] rounded-full animate-spin"></div>
          <span className="text-xs font-extrabold tracking-widest text-slate-500 uppercase">Synchronizing logistics ledger...</span>
        </div>
      ) : (
        <>
          {/* =========================================================================
              1. COMMAND CENTER (OVERVIEW)
             ========================================================================= */}
          {activeTab === 'overview' && !showAuditLogs && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Page header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Command Center</h1>
                  <p className="text-xs font-semibold text-slate-450 mt-1 uppercase tracking-wide">Fleet Intelligence HQ</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto items-center">
                  <div className="relative flex-grow md:flex-grow-0">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search ID, Driver, Client..." 
                      className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-200 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setIsCreatingLoad(true)}
                    className="px-5 py-2.5 bg-[#FFB200] hover:bg-[#E68A00] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all whitespace-nowrap"
                  >
                    Create Load
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* KPI 1: Active Loads */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                      📦
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">+12%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Loads</span>
                    <strong className="text-3xl font-black text-slate-900 block mt-2">42</strong>
                  </div>
                </div>

                {/* KPI 2: Drivers Online */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                      🚚
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">LIVE</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Drivers Online</span>
                    <strong className="text-3xl font-black text-slate-900 block mt-2">18</strong>
                  </div>
                </div>

                {/* KPI 3: Pending Assignment */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                      ⚠️
                    </div>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">URGENT</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Assignment</span>
                    <strong className="text-3xl font-black text-slate-900 block mt-2">04</strong>
                  </div>
                </div>

                {/* KPI 4: Critical Alerts */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                      🚨
                    </div>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">FIX NOW</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Critical Alerts</span>
                    <strong className="text-3xl font-black text-slate-900 block mt-2">02</strong>
                  </div>
                </div>

              </div>

              {/* Main 2-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column (col-span-2) - Active Movements */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 font-extrabold text-lg">📈</span>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Movements</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">Live tracking</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="pb-3 font-black">LOAD ID</th>
                          <th className="pb-3 font-black">ROUTE / STATUS</th>
                          <th className="pb-3 font-black">RESOURCE</th>
                          <th className="pb-3 font-black">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        
                        {/* Row 1 */}
                        <tr className="align-middle">
                          <td className="py-4">
                            <strong className="font-extrabold text-slate-900 block">SHP-20481</strong>
                            <span className="text-[10px] text-slate-450 block font-semibold mt-0.5">Acme Corp</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span>Sydney Depot</span>
                              <span className="text-slate-400 font-normal">➔</span>
                              <span>Melbourne Depot</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-black rounded-full text-[9px] uppercase tracking-wider">
                                IN TRANSIT
                              </span>
                              <span className="text-[9.5px] text-slate-400 flex items-center gap-0.5 font-bold">
                                📍 Melbourne Terminal
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px] uppercase border border-slate-200">
                                JT
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-none">Jack Taylor</span>
                                <span className="text-[9.5px] text-slate-400 font-mono block mt-1">TRK-102</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => triggerToast('Opening tracking inspector for SHP-20481...')}
                              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr className="align-middle">
                          <td className="py-4">
                            <strong className="font-extrabold text-slate-900 block">SHP-20482</strong>
                            <span className="text-[10px] text-slate-455 block font-semibold mt-0.5">Tech Solutions Ltd</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span>Brisbane Depot</span>
                              <span className="text-slate-400 font-normal">➔</span>
                              <span>Sydney Depot</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 font-black rounded-full text-[9px] uppercase tracking-wider">
                                ARRIVING SOON
                              </span>
                              <span className="text-[9.5px] text-slate-400 flex items-center gap-0.5 font-bold">
                                📍 Sydney Central Depot
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px] uppercase border border-slate-200">
                                LS
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-none">Liam Smith</span>
                                <span className="text-[9.5px] text-slate-400 font-mono block mt-1">VAN-08</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => triggerToast('Opening tracking inspector for SHP-20482...')}
                              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>

                        {/* Row 3 */}
                        <tr className="align-middle">
                          <td className="py-4">
                            <strong className="font-extrabold text-slate-900 block">SHP-20483</strong>
                            <span className="text-[10px] text-slate-455 block font-semibold mt-0.5">Global Traders</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span>Perth Depot</span>
                              <span className="text-slate-400 font-normal">➔</span>
                              <span>Adelaide Depot</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 font-black rounded-full text-[9px] uppercase tracking-wider">
                                IN SORTING
                              </span>
                              <span className="text-[9.5px] text-slate-400 flex items-center gap-0.5 font-bold">
                                📍 Adelaide Terminal
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px] uppercase border border-slate-200">
                                NW
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-none">Noah Williams</span>
                                <span className="text-[9.5px] text-slate-400 font-mono block mt-1">TRK-05</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => triggerToast('Opening tracking inspector for SHP-20483...')}
                              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>

                        {/* Row 4 */}
                        <tr className="align-middle">
                          <td className="py-4">
                            <strong className="font-extrabold text-slate-905 block">SHP-20484</strong>
                            <span className="text-[10px] text-slate-455 block font-semibold mt-0.5">Express Goods</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span>Sydney Depot</span>
                              <span className="text-slate-400 font-normal">➔</span>
                              <span>Newcastle Depot</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-slate-150 text-slate-505 font-black rounded-full text-[9px] uppercase tracking-wider">
                                UNASSIGNED
                              </span>
                              <span className="text-[9.5px] text-slate-400 flex items-center gap-0.5 font-bold">
                                📍 Newcastle Depot
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-950 text-[#FFB200] flex items-center justify-center font-bold text-xs">
                                ?
                              </div>
                              <div>
                                <span className="font-black text-red-500 block leading-none">Unassigned</span>
                                <span className="text-[9.5px] text-slate-400 font-mono block mt-1">-</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => triggerToast('Opening tracking inspector for SHP-20484...')}
                              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column (col-span-1) - Fleet Map & Critical Logs */}
                <div className="space-y-6">
                  
                  {/* Fleet Map Card */}
                  <div 
                    onClick={() => setActiveTab('fleet-monitor')}
                    className="bg-white border-2 border-yellow-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all text-left space-y-4 cursor-pointer relative overflow-hidden bg-gradient-to-tr from-yellow-50/20 to-transparent"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-lg">📍</span>
                        <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider">Fleet Map</h4>
                      </div>
                      <span className="text-slate-400 text-xs font-black">➔</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Live Network Monitor</span>
                    <strong className="text-4xl font-black text-slate-905 block mt-2">18</strong>
                  </div>

                  {/* Critical Logs Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-105 pb-3">
                      <span className="text-red-500 font-bold text-sm">🚨</span>
                      <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider">Critical Logs</h4>
                    </div>

                    <div className="space-y-3">
                      
                      <div className="p-3 bg-white border border-slate-100 hover:border-red-100 rounded-xl transition-colors space-y-1">
                        <strong className="text-xs font-black text-slate-850 block">SHP-20483 geofence breach.</strong>
                        <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">4m ago</span>
                      </div>

                      <div className="p-3 bg-white border border-slate-100 hover:border-red-100 rounded-xl transition-colors space-y-1">
                        <strong className="text-xs font-black text-slate-850 block">Unassigned SHP-20484 timeout.</strong>
                        <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">12m ago</span>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Audit Terminal Modal / Screen */}
          {showAuditLogs && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left animate-fade-in space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Enterprise Security Audit Logs</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Real-time system events logging.</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setShowAuditLogs(false)}>Back to dashboard</Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <TextInput 
                  placeholder="Filter logs by operator..." 
                  value={auditSearchQuery} 
                  onChange={(e) => setAuditSearchQuery(e.target.value)} 
                  className="w-full sm:max-w-xs"
                />
                <select 
                  value={auditSortOrder} 
                  onChange={(e) => setAuditSortOrder(e.target.value)}
                  className="border border-slate-200 rounded-xl text-xs font-bold text-slate-700 p-2 focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>

              <DataTable
                tableName="dispatch_audit_logs"
                columns={[
                  { key: 'refId', label: 'ID Reference', render: (row) => <span className="font-mono text-[10px] font-bold text-slate-500">{row.refId}</span> },
                  { key: 'name', label: 'Operator Name', render: (row) => <span className="font-extrabold text-slate-800">{row.name}</span> },
                  { key: 'role', label: 'Access Tier', render: (row) => <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-650 rounded-full">{row.role}</span> },
                  { key: 'action', label: 'Directive Event', render: (row) => <span className="font-semibold text-slate-700">{row.action}</span> },
                  { key: 'time', label: 'Event Timestamp', render: (row) => <span className="text-slate-450 font-mono text-[11px]">{row.time}</span> },
                  { key: 'ip', label: 'Source Node IP', render: (row) => <span className="text-slate-450 font-mono text-[10px]">{row.ip}</span> }
                ]}
                data={defaultAuditLogs.filter(log => !auditSearchQuery || log.name.toLowerCase().includes(auditSearchQuery.toLowerCase()))}
              />
            </div>
          )}

          {/* =========================================================================
              2. LOADS (LOADS QUEUE)
             ========================================================================= */}
          {activeTab === 'loads' && !isCreatingLoad && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Load Queue</h1>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-450 mt-1.5 leading-none">
                    <span className="text-[#FFB200]">📁</span> Sydney Central Depot • Command View
                  </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto items-center">
                  <div className="relative flex-grow md:flex-grow-0">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search Reference, Client..." 
                      className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-200 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setIsCreatingLoad(true)}
                    className="px-5 py-2.5 bg-[#FFB200] hover:bg-[#E68A00] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all whitespace-nowrap"
                  >
                    Create Load
                  </button>
                </div>
              </div>

              {/* Workflow Counters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Unassigned */}
                <button
                  onClick={() => setActiveWorkflowFilter('Review')}
                  className={`p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer w-full border ${
                    activeWorkflowFilter === 'Review'
                      ? 'bg-[#0B1528] text-white border-slate-800'
                      : 'bg-white text-slate-900 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      activeWorkflowFilter === 'Review'
                        ? 'bg-slate-800/80 text-[#FFB200]'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Inbox size={20} />
                    </div>
                    <strong className={`text-3xl font-black ${activeWorkflowFilter === 'Review' ? 'text-white' : 'text-slate-900'}`}>3</strong>
                  </div>
                  <div>
                    <p className={`text-sm font-bold mt-4 ${activeWorkflowFilter === 'Review' ? 'text-[#FFB200]' : 'text-slate-700'}`}>
                      Unassigned
                    </p>
                    <p className={`text-[11px] mt-1 leading-normal font-semibold ${activeWorkflowFilter === 'Review' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Booked – awaiting driver assignment
                    </p>
                  </div>
                </button>

                {/* Card 2: In Transit */}
                <button
                  onClick={() => setActiveWorkflowFilter('Active')}
                  className={`p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer w-full border ${
                    activeWorkflowFilter === 'Active'
                      ? 'bg-[#0B1528] text-white border-slate-800'
                      : 'bg-white text-slate-900 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeWorkflowFilter === 'Active' ? 'text-[#FFB200]' : 'text-slate-400'}`}>
                      ⚡ In Transit
                    </span>
                    <strong className={`text-2xl font-black ${activeWorkflowFilter === 'Active' ? 'text-white' : 'text-slate-900'}`}>1</strong>
                  </div>
                  <p className={`text-[9.5px] mt-4 leading-normal font-semibold ${activeWorkflowFilter === 'Active' ? 'text-slate-300' : 'text-slate-455'}`}>
                    Assigned & physically moving
                  </p>
                </button>

                {/* Card 3: Issues */}
                <button
                  onClick={() => triggerToast('Filtering by delayed issue loads...')}
                  className="p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer w-full bg-white border border-slate-100 hover:border-slate-200"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      ⚠️ Issues
                    </span>
                    <strong className="text-2xl font-black text-slate-900">1</strong>
                  </div>
                  <p className="text-[9px] text-slate-455 mt-4 leading-normal font-semibold">
                    Delayed or delivery problems
                  </p>
                </button>

                {/* Card 4: Received */}
                <button
                  onClick={() => triggerToast('Filtering by received loads...')}
                  className="p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer w-full bg-white border border-slate-100 hover:border-slate-200"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      ✓ Received
                    </span>
                    <strong className="text-2xl font-black text-slate-900">1</strong>
                  </div>
                  <p className="text-[9px] text-slate-455 mt-4 leading-normal font-semibold">
                    Handover complete / Delivered
                  </p>
                </button>

              </div>

              {/* Data Table Block */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                
                {/* Sub Tab Pills */}
                <div className="flex flex-wrap gap-2 border-b border-slate-50 pb-3">
                  {['All', 'Local Pickups', 'Branch Transfers', 'Local Deliveries'].map((tabName) => {
                    const isTabActive = loadSubTab === tabName;
                    return (
                      <button
                        key={tabName}
                        onClick={() => setLoadSubTab(tabName)}
                        className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                          isTabActive
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tabName}
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="pb-3 font-black">REFERENCE</th>
                        <th className="pb-3 font-black">ROUTING</th>
                        <th className="pb-3 font-black">PRIORITY</th>
                        <th className="pb-3 font-black">LOAD</th>
                        <th className="pb-3 font-black">RESOURCE</th>
                        <th className="pb-3 font-black text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      
                      {/* Row 1 */}
                      <tr className="align-middle">
                        <td className="py-4">
                          <strong className="font-extrabold text-slate-900 block">SHP-9055</strong>
                          <span className="text-[10px] text-slate-400 block font-mono font-bold mt-1">REF: COKE-9901 • SN: STK-4401</span>
                        </td>
                        <td className="py-4 font-bold text-slate-700">
                          Sydney <span className="text-slate-400 font-normal mx-1">➔</span> Canberra
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-red-650 font-black rounded-md text-[9px] uppercase tracking-wider">
                            HIGH
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-slate-500">6.2t</td>
                        <td className="py-4 text-slate-400 font-bold">Pending Assignment</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => triggerToast('Displaying details for SHP-9055...')}
                            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="align-middle">
                        <td className="py-4">
                          <strong className="font-extrabold text-slate-900 block">SHP-9054</strong>
                          <span className="text-[10px] text-slate-400 block font-mono font-bold mt-1">REF: PO-8822 • SN: STK-4402</span>
                        </td>
                        <td className="py-4 font-bold text-slate-700">
                          Sydney <span className="text-slate-400 font-normal mx-1">➔</span> Penrith
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 bg-yellow-50 border border-yellow-100 text-yellow-600 font-black rounded-md text-[9px] uppercase tracking-wider">
                            MEDIUM
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-slate-500">2.1t</td>
                        <td className="py-4 text-slate-400 font-bold">Pending Assignment</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => triggerToast('Displaying details for SHP-9054...')}
                            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="align-middle">
                        <td className="py-4">
                          <strong className="font-extrabold text-slate-900 block">SHP-9060</strong>
                          <span className="text-[10px] text-slate-400 block font-mono font-bold mt-1">REF: VL-X77 • SN: STK-4403</span>
                        </td>
                        <td className="py-4 font-bold text-slate-700">
                          Melbourne <span className="text-slate-400 font-normal mx-1">➔</span> Brisbane
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-red-650 font-black rounded-md text-[9px] uppercase tracking-wider">
                            HIGH
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-slate-500">14.5t</td>
                        <td className="py-4 text-slate-400 font-bold">Pending Assignment</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => triggerToast('Displaying details for SHP-9060...')}
                            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Create Load Console Redesign */}
          {activeTab === 'loads' && isCreatingLoad && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Top Header Bar */}
              <div className="flex justify-between items-center bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <button 
                    onClick={() => { setIsCreatingLoad(false); resetConsoleState(); }} 
                    className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="h-4.5 w-4.5 text-slate-600" />
                  </button>
                  <div className="text-left">
                    <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                      CREATE LOAD <span className="text-[#FFB200]">CONSOLE</span>
                    </h1>
                    <p className="text-[9px] font-black tracking-widest text-slate-400 mt-1 uppercase">
                      OPERATIONAL PRINCIPLE: LOAD ➔ STOPS ➔ ITEMS
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleConsoleSaveDraft}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-black text-slate-700 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
                  >
                    Save Draft
                  </button>
                  <button 
                    onClick={handleConsoleActivateLoad}
                    className="px-5 py-2.5 bg-[#0C1E3E] hover:bg-[#08152A] text-xs font-black text-[#FFB200] rounded-xl cursor-pointer uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    ⚡ Activate Load
                  </button>
                </div>
              </div>

              {/* Main Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column (wide) - Steps */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* STEP 1: CONFIGURE ROUTE STOPS */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550 flex-shrink-0 font-bold">
                          🗺
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">STEP 1: CONFIGURE ROUTE STOPS</h3>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">DEFINE ALL PHYSICAL LOCATIONS FOR THIS LOAD</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleConsoleAddStop}
                        className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        + Add Stop
                      </button>
                    </div>

                    {/* Stops List */}
                    <div className="space-y-6">
                      {consoleStops.map((stop, idx) => (
                        <div key={stop.id} className="flex gap-4 relative">
                          {idx < consoleStops.length - 1 && (
                            <div className="absolute left-[13px] top-8 bottom-[-28px] w-0.5 border-l-2 border-dashed border-slate-200" />
                          )}
                          
                          {/* Circle badge stop number */}
                          <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-black z-10 flex-shrink-0">
                            {idx + 1}
                          </div>

                          {/* Inputs Grid Block */}
                          <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl relative text-left">
                            
                            {consoleStops.length > 2 && (
                              <button 
                                onClick={() => handleConsoleRemoveStop(stop.id)}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-black cursor-pointer bg-transparent border-none"
                              >
                                ✕
                              </button>
                            )}

                            <div className="sm:col-span-1">
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">STOP TYPE</label>
                              <select 
                                value={stop.type}
                                onChange={(e) => handleConsoleUpdateStop(stop.id, 'type', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl text-xs font-bold text-slate-700 p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              >
                                <option value="Pickup">Pickup</option>
                                <option value="Drop">Drop</option>
                                <option value="Delivery">Delivery</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">ADDRESS / SUBURB</label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-2.5 text-slate-400">📍</span>
                                <input 
                                  type="text"
                                  placeholder="Full location address..."
                                  value={stop.address}
                                  onChange={(e) => handleConsoleUpdateStop(stop.id, 'address', e.target.value)}
                                  className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 pl-9 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">CONTACT NAME</label>
                              <input 
                                type="text"
                                placeholder="Receiver/Sender Name"
                                value={stop.contactName}
                                onChange={(e) => handleConsoleUpdateStop(stop.id, 'contactName', e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">PHONE</label>
                              <input 
                                type="text"
                                placeholder="+61..."
                                value={stop.phone}
                                onChange={(e) => handleConsoleUpdateStop(stop.id, 'phone', e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">REQUIRED TIME</label>
                              <input 
                                type="text"
                                placeholder="dd-mm-yyyy --:--"
                                value={stop.requiredTime}
                                onChange={(e) => handleConsoleUpdateStop(stop.id, 'requiredTime', e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              />
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STEP 2: DECLARE ITEMS / CARS */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-550 flex-shrink-0 font-bold">
                          📦
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">STEP 2: DECLARE ITEMS / CARS</h3>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">LINK EACH ITEM TO THE CREATED STOPS ABOVE</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleConsoleAddItem}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-[#FFB200] font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        + Add Item
                      </button>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                      {consoleItems.map((item) => (
                        <div key={item.id} className="border-l-4 border-[#FFB200] bg-slate-50/30 p-5 rounded-r-2xl border border-slate-100 hover:shadow-xs transition-all space-y-4 text-left">
                          
                          <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                            <span className="text-[10px] font-black text-[#FFB200] uppercase tracking-wider">ITEM ENTRY #{item.id}</span>
                            {consoleItems.length > 1 && (
                              <button 
                                onClick={() => handleConsoleRemoveItem(item.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">CUSTOMER / OWNER</label>
                              <input 
                                type="text"
                                placeholder="Acme Corp"
                                value={item.customer}
                                onChange={(e) => handleConsoleUpdateItem(item.id, 'customer', e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">LINK PICKUP STOP</label>
                              <select 
                                value={item.pickupStop}
                                onChange={(e) => handleConsoleUpdateItem(item.id, 'pickupStop', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl text-xs font-bold text-[#4F46E5] bg-blue-50/45 p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              >
                                {consoleStops.map((st) => (
                                  <option key={st.id} value={`Stop #${st.id}`}>Stop #{st.id}: {st.type} ({st.address || 'No Address'})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">LINK DROP-OFF STOP</label>
                              <select 
                                value={item.dropStop}
                                onChange={(e) => handleConsoleUpdateItem(item.id, 'dropStop', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              >
                                {consoleStops.map((st) => (
                                  <option key={st.id} value={`Stop #${st.id}`}>Stop #{st.id}: {st.type} ({st.address || 'No Address'})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Niche & Description */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="md:col-span-1 space-y-1.5">
                              <span className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">NICHE TYPE</span>
                              <div className="flex border border-slate-200 rounded-xl p-1 bg-white gap-1 max-w-max">
                                {['CAR', 'FREIGHT', 'DANGEROUS'].map((nch) => {
                                  const isSel = item.niche === nch;
                                  return (
                                    <button
                                      key={nch}
                                      type="button"
                                      onClick={() => handleConsoleUpdateItem(item.id, 'niche', nch)}
                                      className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                                        isSel
                                          ? 'bg-slate-950 text-[#FFB200]'
                                          : 'text-slate-500 hover:text-slate-805'
                                      }`}
                                    >
                                      {nch}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">ITEM DESCRIPTION / IDENTIFICATION</label>
                              <input 
                                type="text"
                                placeholder="e.g. 2024 Toyota Hilux or General..."
                                value={item.desc}
                                onChange={(e) => handleConsoleUpdateItem(item.id, 'desc', e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-805 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                              />
                            </div>
                          </div>

                          {/* Weight */}
                          <div className="max-w-[200px]">
                            <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">WEIGHT (KG)</label>
                            <input 
                              type="text"
                              value={item.weight}
                              onChange={(e) => handleConsoleUpdateItem(item.id, 'weight', e.target.value)}
                              className="w-full bg-white border border-slate-200 text-slate-805 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                            />
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column (narrow) - Specs Sidebar */}
                <div className="space-y-6">
                  
                  {/* Specifications Card */}
                  <div className="bg-[#0B1528] text-white border border-slate-850 rounded-3xl p-6 shadow-md text-left space-y-5">
                    <span className="text-[10px] font-black text-[#FFB200] uppercase tracking-widest block">LOAD SPECIFICATIONS</span>
                    
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">CUSTOMER REFERENCE</label>
                      <input 
                        type="text"
                        value={consoleCustomerRef}
                        onChange={(e) => setConsoleCustomerRef(e.target.value)}
                        placeholder="PO-12345"
                        className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                      />
                    </div>

                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">PRIORITY TIER</span>
                      <div className="flex border border-slate-800 rounded-xl p-1 bg-slate-900 gap-1">
                        {['NORMAL', 'EXPRESS', 'URGENT'].map((pr) => {
                          const isSel = consolePriority === pr;
                          return (
                            <button
                              key={pr}
                              type="button"
                              onClick={() => setConsolePriority(pr)}
                              className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-[#FFB200] text-black font-black'
                                  : 'text-slate-450 hover:text-white'
                              }`}
                            >
                              {pr}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">GLOBAL DEADLINE</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-450">⏰</span>
                        <input 
                          type="text"
                          placeholder="dd-mm-yyyy --:--"
                          value={consoleDeadline}
                          onChange={(e) => setConsoleDeadline(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 pl-9 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents & Photos upload card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      📎 DOCUMENTS & PHOTOS
                    </span>

                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => triggerToast('Manifest file upload handler activated')}
                        className="p-5 border border-dashed border-slate-205 rounded-2xl text-center hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <span className="text-slate-400 text-lg">📤</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">MANIFEST</span>
                      </div>
                      
                      <div 
                        onClick={() => triggerToast('Photos upload handler activated')}
                        className="p-5 border border-dashed border-slate-205 rounded-2xl text-center hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <span className="text-slate-400 text-lg">📷</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">PHOTOS</span>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch internal notes */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      INTERNAL DISPATCH NOTES
                    </span>

                    <textarea 
                      placeholder="Gate codes, site rules, or special procedures..."
                      value={consoleNotes}
                      onChange={(e) => setConsoleNotes(e.target.value)}
                      rows="4"
                      className="w-full bg-slate-55 border border-slate-200 text-slate-800 p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FFB200] resize-none"
                    />
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              3. VEHICLES (VEHICLES & FLEET)
             ========================================================================= */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <Truck className="h-5 w-5" />
                    </span>
                    Vehicles & Fleet
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Manage trucks, vans, and trailers across all branches.</p>
                </div>
                <Button 
                  size="sm"
                  className="!bg-[#FFB200] hover:!bg-[#E68A00] !text-black !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase"
                  onClick={() => setIsAddVehicleModalOpen(true)}
                >
                  + Add Vehicle
                </Button>
              </div>

              {/* Top Widgets row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Fleet Usage */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Fleet Usage</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5">84%</strong>
                  </div>
                  <div className="w-16 h-8 text-blue-500">
                    <svg viewBox="0 0 50 20" className="w-full h-full stroke-current stroke-2 fill-none">
                      <path d="M0,15 Q10,5 20,10 T40,5 T50,15" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Needs Maintenance */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Needs Maintenance</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5">
                      {fleet.filter(v => v.status === 'Maintenance').length.toString().padStart(2, '0')} Trucks
                    </strong>
                  </div>
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                    <Wrench className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Safety Check */}
                <div className="bg-white border-2 border-[#FFB200]/20 rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden bg-gradient-to-tr from-[#FFB200]/2 to-transparent">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Safety Check</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5">100%</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Fuel Cost */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Fuel Cost</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5">$1.42/km</strong>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                    <span className="font-extrabold text-xs">💧</span>
                  </div>
                </div>

              </div>

              {/* Fleet management table */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <SearchInput 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    onClear={() => setSearch('')} 
                    placeholder="Search Reg, ID or Branch..."
                    className="w-full sm:max-w-xs"
                  />
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    
                    <div className="border border-slate-200 rounded-xl p-1 flex gap-1 bg-slate-50">
                      <button 
                        onClick={() => setIsGridView(false)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${!isGridView ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setIsGridView(true)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isGridView ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => triggerToast('Status filtering applied')}
                      className="!text-xs !font-bold flex items-center gap-1.5"
                    >
                      <Filter className="h-3.5 w-3.5 text-slate-550" /> Filter Status
                    </Button>
                    <select 
                      value={sortByField} 
                      onChange={(e) => setSortByField(e.target.value)}
                      className="border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200] max-w-[120px]"
                    >
                      <option value="plate">SORT BY</option>
                      <option value="status">Status</option>
                      <option value="branch">Branch</option>
                    </select>
                  </div>
                </div>

                {isGridView ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredFleet.map((v) => (
                      <div key={v.id || v.plate} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-black text-slate-800">{v.plate}</span>
                          <StatusBadge status={v.status || 'Active'} />
                        </div>
                        <div className="text-xs space-y-1 text-slate-500 font-semibold">
                          <div>Type: {v.type}</div>
                          <div>Branch: {v.branch || 'Sydney Central Depot'}</div>
                          <div>Driver: {v.driver || 'Unassigned'}</div>
                        </div>
                        <Button size="xs" variant="outline" className="w-full text-center" onClick={() => { setAssignVehicleForm({ ...assignVehicleForm, vehicleId: v.plate }); setIsAssignVehicleModalOpen(true); }}>MANAGE</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <DataTable
                    tableName="dispatch_fleet_table"
                    columns={[
                      { key: 'checkbox', label: '', render: () => <input type="checkbox" className="rounded border-slate-200" /> },
                      { 
                        key: 'plate', 
                        label: 'Vehicle Details', 
                        render: (row) => (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                              {row.type?.charAt(0) || 'T'}
                            </div>
                            <div className="text-left">
                              <span className="font-mono font-black text-slate-900 block leading-tight">{row.plate}</span>
                              <span className="text-[10px] font-extrabold text-slate-400 block mt-0.5 uppercase tracking-wider">VIN: {row.vin || '1YV1HP82A81920'}</span>
                            </div>
                          </div>
                        )
                      },
                      { key: 'branch', label: 'Branch', render: (row) => <span className="font-bold text-slate-850 uppercase text-[10px] tracking-wider">{row.branch || 'Sydney Central Depot'}</span> },
                      { 
                        key: 'driver', 
                        label: 'Assigned Driver', 
                        render: (row) => (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">
                              {row.driver?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-slate-700">{row.driver || 'Unassigned'}</span>
                          </div>
                        )
                      },
                      { 
                        key: 'type', 
                        label: 'Type', 
                        render: (row) => (
                          <div className="text-left">
                            <span className="font-extrabold text-slate-850 uppercase text-[10px] tracking-wider block">{row.type || 'Heavy Truck'}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Payload: {row.payload || '20T'}</span>
                          </div>
                        )
                      },
                      { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status || 'Active'} /> },
                      { 
                        key: 'actions', 
                        label: 'Actions', 
                        render: (row) => (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => { setAssignVehicleForm({ ...assignVehicleForm, vehicleId: row.plate }); setIsAssignVehicleModalOpen(true); }}
                            className="!text-[10px] !font-black uppercase tracking-wider !px-3 !py-1.5"
                          >
                            MANAGE
                          </Button>
                        )
                      }
                    ]}
                    data={filteredFleet}
                  />
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              4. BRANCHES
             ========================================================================= */}
          {activeTab === 'branches' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                    <Globe className="h-5 w-5" />
                  </span>
                  Depots & Branches
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">Operations distribution network map and capacity logs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Branch 1: Sydney */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[9px] font-black tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">PRIMARY DEPOT</span>
                      <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Online 98% Score</span>
                    </div>

                    <div className="text-left">
                      <h3 className="text-base font-black text-slate-900 leading-tight">Sydney Central Depot</h3>
                      <span className="text-[10px] text-slate-400 font-extrabold tracking-wide flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> STRATHFIELD, NSW
                      </span>
                    </div>

                    <div className="flex items-center gap-2 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">MA</div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wide">LEAD: MICHAEL ADAMS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-450 uppercase tracking-wider block">STAFF COUNT</span>
                        <strong className="text-lg font-black text-slate-900 block mt-1">42</strong>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-450 uppercase tracking-wider block">VEHICLES</span>
                        <strong className="text-lg font-black text-slate-900 block mt-1">18</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-450">
                        <span>STORAGE USAGE</span>
                        <span className="text-red-500 font-black">Full 92%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400 font-bold uppercase tracking-wider">SYD-CENTRAL</span>
                    <button className="font-black text-slate-900 uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer" onClick={() => triggerToast('Opening Sydney depot portal...')}>
                      MANAGE BRANCH <span className="text-[10px]">↗</span>
                    </button>
                  </div>
                </div>

                {/* Branch 2: Melbourne */}
                <div className="bg-white border-2 border-[#FFB200]/20 rounded-3xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow bg-gradient-to-b from-[#FFB200]/2 to-transparent relative">
                  <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full border border-white"></div>
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[9px] font-black tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">PRIMARY DEPOT</span>
                      <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Online 84% Score</span>
                    </div>

                    <div className="text-left">
                      <h3 className="text-base font-black text-[#FFB200] leading-tight">Melbourne Depot</h3>
                      <span className="text-[10px] text-slate-400 font-extrabold tracking-wide flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> TULLAMARINE, VIC
                      </span>
                    </div>

                    <div className="flex items-center gap-2 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">SM</div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wide">LEAD: SARAH MITCHELL</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-455 uppercase tracking-wider block">STAFF COUNT</span>
                        <strong className="text-lg font-black text-slate-900 block mt-1">14</strong>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-455 uppercase tracking-wider block">VEHICLES</span>
                        <strong className="text-lg font-black text-slate-900 block mt-1">6</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-450">
                        <span>STORAGE USAGE</span>
                        <span className="text-yellow-600 font-black">Ok 45%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#FFB200] h-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border-t border-slate-800 p-4 rounded-2xl mt-6 flex justify-between items-center text-xs -mx-6 -mb-6">
                    <span className="font-mono text-gray-500 font-bold uppercase tracking-wider">MEL-DEPOT</span>
                    <button className="font-black text-[#FFB200] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none" onClick={() => triggerToast('Opening Melbourne depot portal...')}>
                      MANAGE BRANCH <span className="text-[10px]">↗</span>
                    </button>
                  </div>
                </div>

                {/* Branch 3: Brisbane */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[9px] font-black tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase">LOCAL BRANCH</span>
                      <span className="text-[9px] font-black tracking-widest text-[#FFB200] bg-[#FFB200]/5 px-2 py-0.5 rounded-md uppercase">Maintenance 72% Score</span>
                    </div>

                    <div className="text-left">
                      <h3 className="text-base font-black text-slate-900 leading-tight">Brisbane Port Branch</h3>
                      <span className="text-[10px] text-slate-400 font-extrabold tracking-wide flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> LYTTON, QLD
                      </span>
                    </div>

                    <div className="flex items-center gap-2 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">LS</div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wide">LEAD: LIAM SMITH</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-450 uppercase tracking-wider block">STAFF COUNT</span>
                        <strong className="text-lg font-black text-slate-900 block mt-1">28</strong>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-450 uppercase tracking-wider block">VEHICLES</span>
                        <strong className="text-lg font-black text-slate-900 block mt-1">12</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-455">
                        <span>STORAGE USAGE</span>
                        <span className="text-yellow-600 font-black">Ok 78%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#FFB200] h-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400 font-bold uppercase tracking-wider">BNE-PORT</span>
                    <button className="font-black text-slate-900 uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer" onClick={() => triggerToast('Opening Brisbane depot portal...')}>
                      MANAGE BRANCH <span className="text-[10px]">↗</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              5. DRIVERS
             ========================================================================= */}
          {activeTab === 'drivers' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <Users className="h-5 w-5" />
                    </span>
                    Drivers
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Manage fleet vehicle operators, credentials, and deployment zones.</p>
                </div>
                <Button 
                  size="sm"
                  className="!bg-[#FFB200] hover:!bg-[#E68A00] !text-black !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase"
                  onClick={() => triggerToast('New Driver wizard launched')}
                >
                  + New Driver
                </Button>
              </div>

              {/* Top KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* On Duty Now */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">On Duty Now</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5">18</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                    <span className="font-extrabold text-xs">👤+</span>
                  </div>
                </div>

                {/* Active Trips */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Trips</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5">12</strong>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Avg Rating */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Rating</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1.5 flex items-center gap-1">4.85 <Star className="h-5 w-5 fill-[#FFB200] stroke-none" /></strong>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                    <Star className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Alerts</span>
                    <strong className="text-2xl font-black text-red-500 block mt-1.5">02</strong>
                  </div>
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                </div>

              </div>

              {/* Data Table */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <SearchInput 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    onClear={() => setSearch('')} 
                    placeholder="Search drivers or regions..."
                    className="w-full sm:max-w-xs"
                  />
                  <select className="border border-slate-200 rounded-xl text-xs font-bold text-slate-700 p-2 focus:outline-none focus:ring-1 focus:ring-[#FFB200]">
                    <option>Sort: Driver Name</option>
                    <option>Sort: Active Trip</option>
                  </select>
                </div>

                <DataTable
                  tableName="dispatch_drivers_table"
                  columns={[
                    { 
                      key: 'name', 
                      label: 'IDENTITY & ID', 
                      render: (row) => (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                            {row.name?.charAt(0) || 'D'}
                          </div>
                          <div className="text-left">
                            <span className="font-extrabold text-slate-900 block leading-tight">{row.name}</span>
                            <span className="text-[10px] font-extrabold text-slate-400 block mt-0.5 uppercase tracking-wider">DRV-102 • {row.contact || '+61 412 888 456'}</span>
                          </div>
                        </div>
                      )
                    },
                    { 
                      key: 'license', 
                      label: 'CREDENTIALS', 
                      render: (row) => (
                        <div className="text-left font-semibold">
                          <span className="font-bold text-slate-800 block text-xs">HC Class</span>
                          <span className="text-[10px] font-mono text-slate-455 mt-0.5 block">BGT-221</span>
                        </div>
                      )
                    },
                    { 
                      key: 'region', 
                      label: 'PRIMARY REGION', 
                      render: (row) => (
                        <span className="font-bold text-slate-500 flex items-center gap-1 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" /> Melbourne SE
                        </span>
                      )
                    },
                    { 
                      key: 'status', 
                      label: 'STATUS', 
                      render: (row) => (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          row.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
                        }`}>
                          {row.status === 'Active' ? 'ACTIVE' : 'ON TRIP'}
                        </span>
                      )
                    },
                    { 
                      key: 'actions', 
                      label: 'ACTIONS', 
                      render: (row) => (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => triggerToast(`Managing driver ${row.name}`)}
                          className="!text-[10px] !font-black uppercase tracking-wider !px-3 !py-1.5"
                        >
                          MANAGE
                        </Button>
                      )
                    }
                  ]}
                  data={drivers}
                />
              </div>

            </div>
          )}

          {/* =========================================================================
              6. CUSTOMER MANAGEMENT (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <FileText className="h-5 w-5" />
                    </span>
                    Customer Management
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Manage B2B clients, credit limits, and payment terms.</p>
                </div>
                <Button 
                  size="sm" 
                  className="!bg-[#FFB200] hover:!bg-[#E68A00] !text-black !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase"
                  onClick={() => triggerToast('New Customer wizard launched')}
                >
                  + New Customer
                </Button>
              </div>

              {/* Table Block with Filters */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Status Pills */}
                  <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 gap-1 overflow-x-auto max-w-full">
                    {['All', 'Active', 'On Hold', 'Suspended'].map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => setActiveCustomerFilter(statusOption)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeCustomerFilter === statusOption
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>

                  {/* Search and sorting */}
                  <div className="flex gap-2 w-full md:w-auto items-center justify-end">
                    <SearchInput 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      onClear={() => setSearch('')} 
                      placeholder="Search by Company or ID..."
                      className="w-full sm:max-w-[220px] text-xs"
                    />
                    
                    <select
                      value={customerSortOrder}
                      onChange={(e) => setCustomerSortOrder(e.target.value)}
                      className="border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="loads">Sort by Loads</option>
                      <option value="credit">Sort by Credit</option>
                    </select>

                    <button 
                      onClick={() => triggerToast('Sort direction toggled.')}
                      className="border border-slate-200 hover:border-slate-350 p-2 rounded-xl text-slate-500 bg-white cursor-pointer hover:bg-slate-50 text-xs"
                    >
                      ↓↑
                    </button>
                  </div>
                </div>

                {/* Customers Table */}
                <DataTable
                  tableName="redesigned_customers_management_table"
                  columns={[
                    { 
                      key: 'company', 
                      label: 'Company', 
                      render: (row) => (
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 ${row.logoBg}`}>
                            {row.logoText}
                          </div>
                          <div className="text-left">
                            <span className="font-black text-slate-900 block leading-tight">{row.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5 font-mono">{row.id}</span>
                          </div>
                        </div>
                      )
                    },
                    { 
                      key: 'contact', 
                      label: 'Primary Contact', 
                      render: (row) => (
                        <div className="text-left text-xs font-semibold">
                          <span className="font-bold text-slate-800 block">{row.contactName}</span>
                          <span className="text-[10px] text-slate-450 block mt-0.5">✉ {row.contactEmail}</span>
                        </div>
                      )
                    },
                    { key: 'creditLimit', label: 'Credit Limit', render: (row) => <span className="font-extrabold text-slate-900">{row.creditLimit}</span> },
                    { 
                      key: 'terms', 
                      label: 'Terms', 
                      render: (row) => (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded uppercase tracking-wider">
                          📁 {row.terms}
                        </span>
                      ) 
                    },
                    { 
                      key: 'loads', 
                      label: 'Loads', 
                      render: (row) => (
                        <div className="text-left text-xs font-black">
                          <span className="text-slate-800 block">{row.loadsCount}</span>
                          <span className="text-emerald-500 font-extrabold block text-[10px] mt-0.5">{row.loadsValue}</span>
                        </div>
                      ) 
                    },
                    { 
                      key: 'rating', 
                      label: 'Rating', 
                      render: (row) => (
                        <span className="text-[#FFB200] font-bold text-xs flex items-center gap-1">
                          ★ {row.rating}
                        </span>
                      ) 
                    },
                    { 
                      key: 'status', 
                      label: 'Status', 
                      render: (row) => {
                        const s = row.status;
                        let sClass = 'text-emerald-600 bg-emerald-50';
                        if (s === 'SUSPENDED') sClass = 'text-red-600 bg-red-50';
                        if (s === 'ON HOLD') sClass = 'text-amber-600 bg-amber-50';
                        return (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${sClass}`}>
                            {s}
                          </span>
                        );
                      } 
                    }
                  ]}
                  data={customersList.filter(c => {
                    // Search filter
                    if (search) {
                      const q = search.toLowerCase();
                      if (!c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
                    }
                    // Tab filter
                    if (activeCustomerFilter !== 'All') {
                      if (c.status.toLowerCase() !== activeCustomerFilter.toLowerCase()) return false;
                    }
                    return true;
                  })}
                />
              </div>

            </div>
          )}

          {/* =========================================================================
              7. ASSET INVENTORY (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'asset-inventory' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <Truck className="h-5 w-5" />
                    </span>
                    Asset Inventory
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">5 assets registered • Global VIN Search</p>
                </div>
                <Button 
                  size="sm" 
                  className="!bg-slate-900 hover:!bg-slate-800 !text-white !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase"
                  onClick={() => triggerToast('Asset registration form activated')}
                >
                  + Register Asset
                </Button>
              </div>

              {/* Table controls */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                
                <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
                  <TextInput 
                    placeholder="Search VIN, Plate, Make, Model, Destination..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full md:flex-grow text-xs"
                  />
                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    <div className="border border-slate-200 rounded-xl p-1 flex gap-1 bg-slate-50">
                      <button className="p-1.5 rounded-lg bg-white text-slate-850 shadow-xs"><Layers className="h-3.5 w-3.5" /></button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"><QrCode className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 border-b border-slate-100">
                  {['ALL', 'AWAITING LOAD', 'IN DEPOT', 'IN TRANSIT', 'DELIVERED'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setActiveAssetFilter(pill)}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        activeAssetFilter === pill
                          ? 'bg-slate-100 text-slate-900 font-black'
                          : 'text-slate-450 hover:text-slate-700'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Assets Data Table */}
                <DataTable
                  tableName="redesigned_assets_inventory_table"
                  columns={[
                    { key: 'select', label: '', render: () => <input type="checkbox" className="rounded border-slate-200" /> },
                    { 
                      key: 'asset', 
                      label: 'REGISTERED ASSET', 
                      render: (row) => (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden flex-shrink-0">
                            {row.make.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-extrabold text-[#FFB200] block tracking-wide font-mono">{row.year}</span>
                            <span className="font-extrabold text-slate-900 block text-xs mt-0.5">{row.make}</span>
                            <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 leading-none">{row.color} • {row.type} • {row.weight}</span>
                          </div>
                        </div>
                      )
                    },
                    { 
                      key: 'vinPlate', 
                      label: 'VIN / PLATE', 
                      render: (row) => (
                        <div className="text-left font-semibold">
                          <span className="font-mono text-[9px] bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded block max-w-max text-slate-700">{row.vin}</span>
                          <span className="font-mono text-xs text-slate-800 font-extrabold mt-1 block">{row.plate}</span>
                        </div>
                      ) 
                    },
                    { 
                      key: 'status', 
                      label: 'OPERATIONAL STATUS', 
                      render: (row) => {
                        let stClass = 'text-blue-600 bg-blue-50';
                        if (row.status === 'IN TRANSIT') stClass = 'text-amber-600 bg-amber-50';
                        if (row.status === 'DELIVERED') stClass = 'text-emerald-600 bg-emerald-50';
                        if (row.status === 'AWAITING LOAD') stClass = 'text-gray-500 bg-gray-50';
                        
                        return (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${stClass}`}>
                            {row.status}
                          </span>
                        );
                      }
                    },
                    { 
                      key: 'task', 
                      label: 'CURRENT TASK', 
                      render: (row) => (
                        row.task.startsWith('LD') ? (
                          <span className="inline-flex items-center text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-150 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {row.task}
                          </span>
                        ) : (
                          <span className="text-slate-450 text-xs font-semibold">{row.task}</span>
                        )
                      )
                    },
                    { 
                      key: 'target', 
                      label: 'TARGET', 
                      render: (row) => (
                        <div className="text-left text-xs font-semibold">
                          <span className="font-black text-slate-850 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-500" /> {row.target}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-bold uppercase">{row.client}</span>
                        </div>
                      )
                    },
                    { 
                      key: 'actions', 
                      label: '', 
                      render: (row) => (
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={() => triggerToast(`Edit asset ${row.plate}`)} className="p-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 cursor-pointer text-xs"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => { setAssetsList(assetsList.filter(a => a.id !== row.id)); triggerToast(`Deleted asset ${row.plate}`); }} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer text-xs"><Trash className="h-3.5 w-3.5" /></button>
                        </div>
                      )
                    }
                  ]}
                  data={assetsList.filter(a => {
                    // Search Filter
                    if (search) {
                      const q = search.toLowerCase();
                      const matchMake = a.make.toLowerCase().includes(q);
                      const matchPlate = a.plate.toLowerCase().includes(q);
                      const matchVin = a.vin.toLowerCase().includes(q);
                      const matchTarget = a.target.toLowerCase().includes(q);
                      if (!matchMake && !matchPlate && !matchVin && !matchTarget) return false;
                    }
                    // Status Pill Filter
                    if (activeAssetFilter !== 'ALL') {
                      if (a.status !== activeAssetFilter) return false;
                    }
                    return true;
                  })}
                />
              </div>

            </div>
          )}

          {/* =========================================================================
              8. SAFETY CHECKLISTS (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'safety-checklists' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Trip block enforcement warning banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg text-left flex justify-between items-center text-xs font-semibold relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-550 flex-shrink-0 text-sm">
                    ⚠️
                  </div>
                  <div>
                    <strong className="text-[10px] font-black text-amber-500 uppercase tracking-widest block leading-none">TRIP BLOCK ENFORCEMENT ACTIVE</strong>
                    <p className="text-gray-450 mt-1.5 font-bold leading-normal">Drivers cannot start a trip until all required checklist items are completed. 2 checklists currently enforced.</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse-slow">LIVE</span>
              </div>

              {/* Safety checklists list */}
              <div className="space-y-4">
                {checklists.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                    
                    {/* Left details */}
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl flex items-center justify-center ${
                        c.active ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 leading-tight">{c.title}</h3>
                          <span className="font-mono text-[9.5px] font-bold text-slate-400 uppercase">{c.id}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-slate-350'}`}></span>
                          <span className={`text-[9.5px] font-extrabold uppercase tracking-wide ${c.active ? 'text-emerald-500' : 'text-slate-450'}`}>
                            {c.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                          <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider">STRICT EXECUTION</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-2 font-bold uppercase tracking-wider">
                          👥 {c.scope} • ⚡ {c.trigger} • 📝 {c.itemsCount} items • {c.requiredCount} required
                        </p>
                      </div>
                    </div>

                    {/* Right action keys */}
                    <div className="flex gap-2 items-center w-full md:w-auto justify-end">
                      <button onClick={() => triggerToast(`Previewing ${c.title}`)} className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-550 bg-white hover:bg-slate-50 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-slate-500" /> Preview
                      </button>
                      <button onClick={() => triggerToast(`Editing ${c.title}`)} className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-550 bg-white hover:bg-slate-50 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Edit className="h-3.5 w-3.5 text-slate-500" /> Edit
                      </button>
                      
                      {c.active ? (
                        <button 
                          onClick={() => {
                            setChecklists(checklists.map(item => item.id === c.id ? { ...item, active: false } : item));
                            triggerToast(`${c.title} checklist disabled.`);
                          }} 
                          className="px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1"
                        >
                          Disable
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setChecklists(checklists.map(item => item.id === c.id ? { ...item, active: true } : item));
                            triggerToast(`${c.title} checklist enabled.`);
                          }} 
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1"
                        >
                          Enable
                        </button>
                      )}
                      
                      <button onClick={() => { setChecklists(checklists.filter(item => item.id !== c.id)); triggerToast(`Deleted ${c.title}`); }} className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer text-xs">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* =========================================================================
              9. DELIVERY ISSUES (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'delivery-issues' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  Delivery Issues
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">3 delivery problems requiring attention across the network</p>
              </div>

              {/* Delivery Issues List */}
              <div className="space-y-4">
                {deliveryIssues.map((issue) => (
                  <div key={issue.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                    
                    {/* Details block */}
                    <div className="flex items-center gap-5">
                      <div className="text-left w-20 flex-shrink-0">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider leading-none">{issue.time}</span>
                        <strong className="text-xs font-mono font-black text-slate-800 block mt-2 cursor-pointer hover:underline" onClick={() => triggerToast(`Inspecting issue ${issue.id}`)}>
                          {issue.id} ➔
                        </strong>
                      </div>

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        issue.category === 'CRITICAL' 
                          ? 'bg-red-50 text-red-500' 
                          : issue.category === 'HIGH'
                            ? 'bg-pink-50 text-pink-500'
                            : 'bg-blue-50 text-blue-500'
                      }`}>
                        {issue.type === 'GPS' && <MapPin className="h-5 w-5" />}
                        {issue.type === 'Sensor' && <Truck className="h-5 w-5" />}
                        {issue.type === 'Customer' && <User className="h-5 w-5" />}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            issue.category === 'CRITICAL'
                              ? 'text-red-600 bg-red-50 border border-red-100'
                              : issue.category === 'HIGH'
                                ? 'text-pink-600 bg-pink-50 border border-pink-100'
                                : 'text-blue-600 bg-blue-50 border border-blue-100'
                          }`}>
                            {issue.category}
                          </span>
                          <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-widest font-mono">
                            {issue.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-2 leading-none">{issue.title}</h3>
                        <p className="text-[11px] text-slate-450 mt-2 font-semibold leading-normal">
                          {issue.desc} • <span className="font-extrabold text-slate-700">Driver: {issue.driver}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions block */}
                    <div className="relative self-stretch md:self-auto flex items-center justify-end">
                      <Button 
                        size="sm"
                        className="!bg-[#FFB200] hover:!bg-[#E68A00] !text-black !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-[10px] uppercase flex items-center gap-1.5"
                        onClick={() => {
                          setDeliveryIssues(deliveryIssues.filter(item => item.id !== issue.id));
                          triggerToast(`Issue ${issue.id} marked as resolved.`);
                        }}
                      >
                        UPDATE STATUS <ChevronDown className="h-3 w-3 text-black" />
                      </Button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Bottom Info Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg text-left text-xs font-semibold flex items-center gap-3">
                <span className="text-[#FF9A00] text-sm">ℹ</span>
                <p className="text-gray-400 font-bold leading-normal">
                  Issues now display their status in the middle column next to the priority. Track and clear resolved issues using the top action bar.
                </p>
              </div>

            </div>
          )}

          {/* =========================================================================
              10. FINANCE & P&L (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <DollarSign className="h-5 w-5" />
                    </span>
                    Finance & P&L
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Revenue, expenses & profitability dashboard</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <select className="border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200] bg-white">
                    <option>This Quarter</option>
                    <option>Last Quarter</option>
                  </select>
                  
                  <Button 
                    size="sm" 
                    className="!bg-slate-900 hover:!bg-slate-800 !text-white !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase flex items-center gap-1.5"
                    onClick={() => triggerToast('New Invoice created')}
                  >
                    📝 New Invoice
                  </Button>
                </div>
              </div>

              {/* 4 Cards on top */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Revenue */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                      <span className="font-extrabold text-xs">↗</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+14.2%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block leading-none mt-0.5">Collected (Paid)</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-2">$60,200</strong>
                  </div>
                  {/* Sparkline curve */}
                  <div className="w-full h-8 text-emerald-500 mt-2">
                    <svg viewBox="0 0 100 20" className="w-full h-full stroke-current stroke-2 fill-none">
                      <path d="M0,15 Q20,5 40,12 T80,3 T100,10" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Pending / Owed */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                      <span className="font-extrabold text-xs">⚠️</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+2.1%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider block">Pending / Owed</span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block leading-none mt-0.5">Unpaid + Overdue</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-2">$192,000</strong>
                  </div>
                  <div className="h-8 mt-2"></div>
                </div>

                {/* Total Expenses */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-red-50 text-red-550 rounded-xl">
                      <span className="font-extrabold text-xs">↘</span>
                    </div>
                    <span className="text-xs font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-full">+4.1%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider block">Total Expenses</span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block leading-none mt-0.5">Operational Costs</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-2">$858,200</strong>
                  </div>
                  {/* Sparkline curve */}
                  <div className="w-full h-8 text-red-500 mt-2">
                    <svg viewBox="0 0 100 20" className="w-full h-full stroke-current stroke-2 fill-none">
                      <path d="M0,5 Q30,18 60,10 T100,18" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="bg-white border-2 border-[#FFB200]/20 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between relative overflow-hidden bg-gradient-to-tr from-[#FFB200]/2 to-transparent">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                      <span className="font-extrabold text-xs">$</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+9.8%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Net Profit</span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block leading-none mt-0.5">-1325.6% Margin</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-2">$0</strong>
                  </div>
                  <div className="h-8 mt-2"></div>
                </div>

              </div>

              {/* Subtabs switcher */}
              <div className="flex gap-2 border-b border-slate-100 pb-1 text-xs font-bold">
                {[
                  { id: 'PL_Breakdown', label: '📊 P&L Breakdown' },
                  { id: 'Invoices', label: '📄 Invoices' },
                  { id: 'Audit_Trail', label: '⏱ Audit Trail' }
                ].map((ftab) => {
                  const isActive = activeFinanceTab === ftab.id;
                  return (
                    <button
                      key={ftab.id}
                      onClick={() => setActiveFinanceTab(ftab.id)}
                      className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {ftab.label}
                    </button>
                  );
                })}
              </div>

              {/* Side-by-side Columns */}
              {activeFinanceTab === 'PL_Breakdown' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  
                  {/* Left Column: Revenue Breakdown */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <span className="text-emerald-500">↗</span> Revenue Breakdown
                      </h4>
                      
                      <div className="space-y-3">
                        {[
                          { company: 'Tech Solutions', spec: 'INV-1022 - 2 loads', value: '$12,200' },
                          { company: 'Smith Motors', spec: 'INV-1020 - 3 loads', value: '$28,800' },
                          { company: 'EV Fleet Co', spec: 'INV-1019 - 2 loads', value: '$19,200' }
                        ].map((row, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-semibold">
                            <div>
                              <strong className="text-slate-850 block font-bold">{row.company}</strong>
                              <span className="text-[10px] text-slate-450 font-bold uppercase mt-0.5 block font-mono">{row.spec}</span>
                            </div>
                            <span className="text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-3 py-1 rounded-lg font-black text-sm">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-500 border-t border-emerald-600 p-4.5 rounded-2xl mt-6 flex justify-between items-center text-white">
                      <span className="text-xs font-extrabold uppercase tracking-widest">Total Revenue</span>
                      <strong className="text-lg font-black">$60,200</strong>
                    </div>
                  </div>

                  {/* Right Column: Expense Breakdown */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-455 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <span className="text-red-500">↘</span> Expense Breakdown
                      </h4>
                      
                      <div className="space-y-2">
                        {[
                          { category: 'Fuel & AdBlue', trend: '+4.1%', spend: '21% of total spend', val: '$184,200' },
                          { category: 'Driver Wages', trend: '+2.3%', spend: '61% of total spend', val: '$521,000' },
                          { category: 'Maintenance', trend: '-1.2%', spend: '10% of total spend', val: '$89,400' },
                          { category: 'Depot / Storage', trend: '+0.8%', spend: '5% of total spend', val: '$42,000' },
                          { category: 'Tolls & Levies', trend: '+1.1%', spend: '3% of total spend', val: '$21,600' }
                        ].map((row, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-semibold">
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-850 font-bold block">{row.category}</strong>
                                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  row.trend.startsWith('+') ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'
                                }`}>
                                  {row.trend}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-450 font-bold block mt-0.5 leading-none">{row.spend}</span>
                            </div>
                            <strong className="text-slate-900 font-extrabold text-sm">{row.val}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 border-t border-slate-800 p-4.5 rounded-2xl mt-6 flex justify-between items-center text-white">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#FFB200]">Total Expenses</span>
                      <strong className="text-lg font-black text-red-500">$858,200</strong>
                    </div>
                  </div>

                </div>
              )}

              {/* Bottom Summary block */}
              {activeFinanceTab === 'PL_Breakdown' && (
                <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl text-left text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="text-left space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450 block">Net Profit (This Quarter)</span>
                    <strong className="text-3xl font-black block text-[#FFB200]">$0</strong>
                    <span className="text-[10px] font-bold text-gray-500 block leading-tight">-1325.6% profit margin • Revenue - Expenses</span>
                  </div>
                  
                  <div className="w-full md:max-w-md text-left space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <span>Revenue vs Expenses</span>
                      <span>$60,200 / $858,200</span>
                    </div>
                    {/* Stacked bar diagram */}
                    <div className="w-full bg-slate-800 h-2.5 rounded-full flex overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '7%' }} title="Revenue - $60,200"></div>
                      <div className="bg-red-500 h-full" style={{ width: '93%' }} title="Expenses - $858,200"></div>
                    </div>
                    <div className="flex gap-4 text-[10px] font-extrabold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Revenue: $60,200</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Expenses: $858,200</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================================
              11. USER ROLES (IDENTITY & ACCESS - REDESIGNED)
             ========================================================================= */}
          {activeTab === 'user-roles' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <User className="h-5 w-5" />
                    </span>
                    Identity & Access
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Manage platform operators, roles, and branch permissions.</p>
                </div>
                <Button 
                  size="sm" 
                  className="!bg-[#FFB200] hover:!bg-[#E68A00] !text-black !font-black !px-5 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase flex items-center gap-1.5"
                  onClick={() => triggerToast('Invite Operator wizard launched')}
                >
                  <span className="text-sm font-black">+</span> Invite Operator
                </Button>
              </div>

              {/* Table Block with Filters */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Roles Pills */}
                  <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 gap-1 overflow-x-auto max-w-full">
                    {['All', 'Dispatcher', 'Driver', 'Warehouse', 'Accounts'].map((roleOption) => (
                      <button
                        key={roleOption}
                        onClick={() => setActiveOperatorTab(roleOption)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeOperatorTab === roleOption
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {roleOption}
                      </button>
                    ))}
                  </div>

                  {/* Dropdown, search */}
                  <div className="flex gap-2 w-full md:w-auto items-center justify-end">
                    <select
                      className="border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200] bg-white"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Offline</option>
                    </select>

                    <SearchInput 
                      value={operatorSearch} 
                      onChange={(e) => setOperatorSearch(e.target.value)} 
                      onClear={() => setOperatorSearch('')} 
                      placeholder="Search by Operator or Branch..."
                      className="w-full sm:max-w-[240px] text-xs"
                    />
                  </div>
                </div>

                {/* Table */}
                <DataTable
                  tableName="identity_access_operators_table"
                  columns={[
                    {
                      key: 'operator',
                      label: 'Operator',
                      render: (row) => (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-105 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0 font-mono">
                            {row.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="font-black text-slate-900 block leading-tight">{row.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5 font-mono">{row.email}</span>
                          </div>
                        </div>
                      )
                    },
                    {
                      key: 'role',
                      label: 'Role',
                      render: (row) => {
                        let rClass = 'text-blue-600 bg-blue-50';
                        if (row.role === 'WAREHOUSE') rClass = 'text-purple-600 bg-purple-50/50';
                        if (row.role === 'DRIVER') rClass = 'text-emerald-600 bg-emerald-50';
                        if (row.role === 'ACCOUNTS') rClass = 'text-amber-600 bg-amber-50';
                        return (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${rClass}`}>
                            {row.role}
                          </span>
                        );
                      }
                    },
                    { key: 'branch', label: 'Branch', render: (row) => <span className="font-bold text-slate-800 text-xs">{row.branch}</span> },
                    {
                      key: 'accessLevel',
                      label: 'Access Level',
                      render: (row) => (
                        <span className="text-slate-500 font-bold text-xs flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${row.accessLevel === 'Full' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                          {row.accessLevel}
                        </span>
                      )
                    },
                    { key: 'lastActivity', label: 'Last Activity', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.lastActivity}</span> },
                    {
                      key: 'status',
                      label: 'Status',
                      render: (row) => (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          row.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100 text-slate-400'
                        }`}>
                          {row.status}
                        </span>
                      )
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (row) => (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => triggerToast(`Managing operator ${row.name}`)}
                          className="!text-[10px] !font-black uppercase tracking-wider !px-3.5 !py-1.5 flex items-center gap-1"
                        >
                          MANAGE <span className="text-[9px]">➔</span>
                        </Button>
                      )
                    }
                  ]}
                  data={operatorsList.filter(o => {
                    if (operatorSearch) {
                      const q = operatorSearch.toLowerCase();
                      if (!o.name.toLowerCase().includes(q) && !o.email.toLowerCase().includes(q) && !o.branch.toLowerCase().includes(q)) return false;
                    }
                    if (activeOperatorTab !== 'All') {
                      if (o.role.toLowerCase() !== activeOperatorTab.toLowerCase()) return false;
                    }
                    return true;
                  })}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              12. SUPPORT (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <MessageSquare className="h-5 w-5" />
                    </span>
                    Support
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Manage internal team issues or contact HERO platform support.</p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-4 border-b border-slate-100 pb-1 text-xs font-bold">
                {[
                  { id: 'Team Support (Internal)', label: '👥 Team Support (Internal)' },
                  { id: 'HERO Support', label: '🎧 HERO Support' }
                ].map((sTab) => {
                  const isActive = supportSubTab === sTab.id;
                  return (
                    <button
                      key={sTab.id}
                      onClick={() => setSupportSubTab(sTab.id)}
                      className={`px-2 py-2 border-b-2 font-black transition-all cursor-pointer ${
                        isActive
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-450 hover:text-slate-800'
                      }`}
                    >
                      {sTab.label}
                    </button>
                  );
                })}
              </div>

              {supportSubTab === 'Team Support (Internal)' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  {/* Left Main list */}
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Manage Internal Tickets</h3>
                    
                    <div className="space-y-4">
                      {/* Ticket 1 */}
                      <div className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex justify-between items-start gap-4">
                        <div className="text-left space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] bg-slate-950 text-white px-2 py-0.5 rounded font-black">TKT-104</span>
                            <span className="text-[10px] text-slate-400 font-bold">Today, 08:30 AM</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">Driver App Login Issue</h4>
                          <span className="text-[10px] text-slate-450 font-bold block uppercase">👤 Mike - Driver</span>
                        </div>
                        <span className="text-[10px] font-black text-red-650 bg-red-50 border border-red-100 px-3 py-1 rounded-md uppercase">OPEN</span>
                      </div>

                      {/* Ticket 2 */}
                      <div className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex justify-between items-start gap-4">
                        <div className="text-left space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] bg-slate-950 text-white px-2 py-0.5 rounded font-black">TKT-103</span>
                            <span className="text-[10px] text-slate-400 font-bold">Yesterday</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">Vehicle Maintenance Request</h4>
                          <span className="text-[10px] text-slate-450 font-bold block uppercase">👤 Sarah - Fleet</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-md uppercase">IN REVIEW</span>
                      </div>
                    </div>
                  </div>

                  {/* Right History panel */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-455 uppercase tracking-widest mb-4">Ticket History</h3>
                    
                    <div className="space-y-3.5">
                      {/* Ticket 1 */}
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">TKT-104</span>
                          <span className="text-slate-400 font-mono">Today, 08:30 AM</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 leading-tight">Driver App Login Issue</h4>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase block w-max">OPEN</span>
                      </div>

                      {/* Ticket 2 */}
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">TKT-103</span>
                          <span className="text-slate-400 font-mono">Yesterday</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 leading-tight">Vehicle Maintenance Request</h4>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase block w-max font-semibold">IN REVIEW</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {supportSubTab === 'HERO Support' && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center py-10 space-y-3">
                  <span className="text-3xl">🎧</span>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">HERO Platform Enterprise Support</h4>
                  <p className="text-xs text-slate-450 max-w-sm mx-auto font-semibold leading-relaxed">Direct Slack/Phone hotlines are active for your Dispatch operator accounts. Dial +61 1800 000 000 for high priority network issues.</p>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              13. COMPANY SETTINGS (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'company-settings' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Left Card: Company Profile */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 text-left flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Legal name card */}
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-150 flex items-center justify-center text-slate-500 text-lg shadow-xs flex-shrink-0">
                        🏢
                      </div>
                      <div className="text-left flex-grow">
                        <span className="text-[9px] font-black text-slate-455 uppercase tracking-widest block leading-none">Registered Entity Name</span>
                        <input 
                          type="text" 
                          value="HERO Logistics AU Pty Ltd" 
                          disabled 
                          className="w-full bg-transparent border-none text-slate-850 font-black text-base mt-2.5 p-0 focus:outline-none focus:ring-0 opacity-90"
                        />
                        <span className="text-[9px] font-bold text-slate-400 block mt-1">Official company name used for all legal invoicing and POD documents.</span>
                      </div>
                    </div>

                    {/* Business Specializations */}
                    <div className="space-y-3">
                      <strong className="text-[10px] font-black text-slate-455 uppercase tracking-widest block">BUSINESS SPECIALIZATIONS</strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label className="flex items-center gap-3 p-3 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 bg-slate-50/50">
                          <input type="checkbox" defaultChecked className="rounded text-[#FFB200] focus:ring-[#FFB200] w-4 h-4" />
                          General Freight
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 bg-slate-50/50">
                          <input type="checkbox" defaultChecked className="rounded text-[#FFB200] focus:ring-[#FFB200] w-4 h-4" />
                          Car / Vehicle Transport
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 bg-slate-50/50">
                          <input type="checkbox" className="rounded text-[#FFB200] focus:ring-[#FFB200] w-4 h-4" />
                          Dangerous Goods (DG)
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 bg-slate-50/50">
                          <input type="checkbox" className="rounded text-[#FFB200] focus:ring-[#FFB200] w-4 h-4" />
                          Refrigerated / Cold Chain
                        </label>
                      </div>
                    </div>

                    {/* Phone & Address Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">SUPPORT PHONE NUMBER</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-slate-450">📞</span>
                          <input 
                            type="text" 
                            defaultValue="+61 1800 000 000" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 pl-9 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">HEADQUARTERS ADDRESS</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-slate-450">📍</span>
                          <input 
                            type="text" 
                            defaultValue="Level 4, 200 George St, Sydney NSW 2000" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 pl-9 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6">
                    <Button onClick={() => triggerToast('Company entity parameters saved.')} className="!px-6">Update Settings</Button>
                  </div>
                </div>

                {/* Right Card: Regions & Currency */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 text-left flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        🌐 Regions & Zones
                      </h4>
                      <p className="text-[10px] text-slate-405 font-semibold leading-normal">Specify where your fleet currently operates.</p>
                    </div>

                    <div className="space-y-4">
                      {/* NSW switch */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                        <span className="text-xs font-bold text-slate-700">New South Wales</span>
                        <button 
                          onClick={() => setRegionNSW(!regionNSW)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-250 cursor-pointer border-none flex ${
                            regionNSW ? 'bg-[#FFB200] justify-end' : 'bg-slate-200 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-xs"></span>
                        </button>
                      </div>

                      {/* VIC switch */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                        <span className="text-xs font-bold text-slate-700">Victoria</span>
                        <button 
                          onClick={() => setRegionVIC(!regionVIC)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-250 cursor-pointer border-none flex ${
                            regionVIC ? 'bg-[#FFB200] justify-end' : 'bg-slate-200 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-xs"></span>
                        </button>
                      </div>

                      {/* WA switch */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                        <span className="text-xs font-bold text-slate-400">Western Australia</span>
                        <button 
                          onClick={() => setRegionWA(!regionWA)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-250 cursor-pointer border-none flex ${
                            regionWA ? 'bg-[#FFB200] justify-end' : 'bg-slate-200 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-xs"></span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4.5">
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">💸 SYSTEM CURRENCY</label>
                      <select 
                        className="w-full border border-slate-200 rounded-xl text-xs font-bold text-slate-700 p-2.5 focus:outline-none focus:ring-1 focus:ring-[#FFB200] bg-white"
                      >
                        <option>AUD - Australian Dollar ($)</option>
                        <option>USD - United States Dollar ($)</option>
                        <option>EUR - Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              14. SUBSCRIPTION & BILLING (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Left Card: Plan Details */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm text-left flex flex-col justify-between overflow-hidden">
                  
                  {/* Black gradient active plan banner */}
                  <div className="bg-slate-950 p-6 text-white relative overflow-hidden flex flex-col justify-between h-44">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFB200]/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[9px] font-black text-slate-950 bg-[#FFB200] px-3.5 py-1 rounded-full uppercase tracking-wider">ACTIVE PLAN</span>
                      <div className="text-right text-xs">
                        <span className="text-gray-400 block font-semibold">NEXT BILLING DATE</span>
                        <strong className="text-white block mt-0.5 text-sm font-black">14 Sep 2026</strong>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black block leading-none text-[#FFB200]">Enterprise Fleet</h3>
                      <span className="text-xs text-gray-400 block mt-2 font-semibold">Billed annually at $12,000/yr</span>
                    </div>
                  </div>

                  {/* Plan Inclusions Checklist Grid */}
                  <div className="p-6 space-y-6">
                    <strong className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">PLAN INCLUSIONS</strong>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center font-bold text-[10px]">✓</span>
                        Unlimited Branches & Warehouses
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center font-bold text-[10px]">✓</span>
                        Advanced Driver Routing (AI)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center font-bold text-[10px]">✓</span>
                        Predictive Fleet Maintenance
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-150 flex items-center justify-center font-bold text-[10px]">✓</span>
                        24/7 Priority Hotline Support
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-150 flex items-center justify-center font-bold text-[10px]">✓</span>
                        Dedicated Success Manager
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-150 flex items-center justify-center font-bold text-[10px]">✓</span>
                        API & ERP Access Keys
                      </div>
                    </div>
                  </div>

                  {/* Active footer link */}
                  <div className="border-t border-slate-100 p-4 px-6 flex justify-between items-center text-xs bg-slate-50/50">
                    <span className="text-slate-400 font-bold">☉ Subscription active since Sep 2024</span>
                    <button className="font-black text-slate-900 hover:underline cursor-pointer uppercase tracking-wider bg-transparent border-none flex items-center gap-1" onClick={() => triggerToast('Opening billing comparison plan...')}>
                      Compare available plans ➔
                    </button>
                  </div>
                </div>

                {/* Right Cards: Payment Method & History */}
                <div className="space-y-6">
                  
                  {/* Visa Card Mockup */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
                    <h4 className="text-xs font-black text-slate-805 uppercase tracking-widest">Payment Method</h4>
                    
                    {/* Credit Card Graphic */}
                    <div className="bg-slate-950 text-white p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 shadow-md">
                      <div className="flex justify-between items-start w-full">
                        <strong className="text-xs font-mono font-black italic">VISA</strong>
                        <span className="text-emerald-450 border border-emerald-450/25 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px]">✓</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-mono tracking-widest block">•••• •••• •••• 4122</span>
                        <div className="flex justify-between text-[9px] font-mono text-slate-450 uppercase mt-2">
                          <span>SARAH MITCHELL</span>
                          <span>08/28</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => triggerToast('Redirecting to Stripe Billing Management...')}
                      className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Manage in Stripe <span className="text-[10px]">↗</span>
                    </button>
                    <span className="text-[9.5px] text-slate-400 font-semibold block text-center mt-1">Secure billing portal provided by Stripe, Inc.</span>
                  </div>

                  {/* Billing History */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
                    <h4 className="text-xs font-black text-slate-805 uppercase tracking-widest">Billing History</h4>
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-semibold">
                      <div>
                        <strong className="text-slate-800 block font-bold">$12,000.00</strong>
                        <span className="text-[10px] text-slate-450 font-bold uppercase mt-0.5 block font-mono">14 Sep 2025</span>
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 font-black px-2.5 py-0.5 rounded-md uppercase text-[10px]">PAID</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              15. MY PROFILE (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800">
                      <User className="h-5 w-5" />
                    </span>
                    My Profile
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Manage your personal information and security credentials</p>
                </div>
                <Button 
                  size="sm" 
                  className="!bg-[#FF9F00] hover:!bg-[#E68F00] !text-white !font-black !px-6 !py-2.5 !rounded-xl shadow-md cursor-pointer tracking-wider text-xs uppercase"
                  onClick={() => triggerToast('Profile details updated successfully.')}
                >
                  📝 Save Profile
                </Button>
              </div>

              {/* Personal Details Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 text-left">
                <h4 className="text-xs font-black text-slate-805 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  👤 PERSONAL DETAILS
                </h4>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Photo upload */}
                  <div className="flex flex-col items-center gap-3 w-full md:w-32 bg-slate-50 p-4 border border-slate-100 rounded-2xl text-center flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-slate-950 text-white flex items-center justify-center text-xl font-bold font-mono">
                      MA
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); triggerToast('Avatar upload handler activated'); }} 
                      className="text-[10px] font-black text-slate-850 border border-slate-205 bg-white p-1 px-2.5 rounded-lg uppercase tracking-wider cursor-pointer"
                    >
                      Upload Photo
                    </button>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">SUPER ADMIN</span>
                  </div>

                  {/* Form fields */}
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div>
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">FULL NAME</label>
                      <input 
                        type="text" 
                        defaultValue="Michael Adams" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">CONTACT NUMBER</label>
                      <input 
                        type="text" 
                        defaultValue="+61 412 345 678" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">LOGIN EMAIL</label>
                      <input 
                        type="text" 
                        defaultValue="michael@hero.com.au" 
                        disabled 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-605 p-2.5 rounded-xl text-xs font-semibold opacity-70 cursor-not-allowed"
                      />
                      <span className="text-[9.5px] text-slate-400 block mt-1">Account ownership transfers must go through support.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety & Security Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 text-left">
                <h4 className="text-xs font-black text-slate-805 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  🔒 SAFETY & SECURITY
                </h4>

                <div className="max-w-xl space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">CURRENT PASSWORD</label>
                    <input 
                      type="password" 
                      defaultValue="••••••••" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">NEW PASSWORD</label>
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">CONFIRM NEW PASSWORD</label>
                      <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB200]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={() => triggerToast('Password update successful')}
                      className="!bg-slate-900 hover:!bg-slate-800 !text-white !font-black !px-6 !py-2.5 !rounded-xl text-xs uppercase"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'load-inbox' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-805">
                    <span className="text-xl">📥</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-2">
                      Load Inbox
                      <span className="px-2.5 py-0.5 bg-[#FFB200] text-black font-black rounded-md text-[9px] uppercase tracking-wider leading-none">
                        {inboxDrafts.length} PENDING
                      </span>
                    </h1>
                    <p className="text-xs font-semibold text-slate-455 mt-1 block">Field-submitted draft loads — Review & convert to active</p>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => triggerToast('Manual Load Builder activated')}
                  className="px-5 py-2.5 bg-black hover:bg-slate-900 !text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all whitespace-nowrap"
                >
                  + New Manual Load
                </button>
              </div>

              {/* Search and Filters row */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-grow sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search by ID, Driver, or Origin..." 
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all placeholder-slate-400 shadow-xs"
                  />
                </div>

                <div className="flex gap-1.5 bg-slate-50 border border-slate-105 p-1 rounded-xl">
                  {[
                    { id: 'ALL', label: 'ALL' },
                    { id: 'PENDING', label: 'PENDING' },
                    { id: 'HIGH', label: 'HIGH' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setInboxFilter(opt.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        inboxFilter === opt.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inbox Card List */}
              <div className="space-y-4 max-w-5xl">
                {inboxDrafts
                  .filter(d => {
                    if (inboxFilter === 'HIGH' && d.priority !== 'URGENT') return false;
                    if (inboxSearch) {
                      const q = inboxSearch.toLowerCase();
                      return d.id.toLowerCase().includes(q) || d.driver.toLowerCase().includes(q) || d.route.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map(draft => {
                    const isExpanded = expandedDrafts[draft.id];
                    const isUrgent = draft.priority === 'URGENT';
                    return (
                      <div 
                        key={draft.id} 
                        className={`bg-white border border-slate-200 border-t-4 rounded-3xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all ${
                          isUrgent ? 'border-t-red-500' : 'border-t-amber-400'
                        }`}
                      >
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-extrabold text-xs">
                              🕒
                            </div>
                            <div className="text-left space-y-1">
                              <div className="flex items-center gap-2">
                                <strong className="text-sm font-black text-slate-909 block leading-none">{draft.id}</strong>
                                {isUrgent && (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 font-black rounded text-[8px] uppercase tracking-wider leading-none">
                                    URGENT
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5 leading-none">{draft.time}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRejectDraft(draft.id)}
                              className="w-8 h-8 border border-slate-205 hover:bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                              title="Reject Draft"
                            >
                              ✕
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleApproveDraft(draft.id)}
                              className="bg-[#FFB200] hover:bg-[#E68A00] text-black font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-black/35 flex items-center justify-center font-bold text-[9px] shrink-0">✓</span>
                              APPROVE
                            </button>
                          </div>
                        </div>

                        {/* Metadata Details Row */}
                        <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-wrap items-center justify-between text-xs text-slate-800 gap-4">
                          
                          {/* Driver Info */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-black text-[10px] text-slate-700 uppercase shrink-0">
                              {draft.driver.charAt(0)}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-400 font-black text-[9px] block uppercase leading-none tracking-wider">DRIVER ASSIGNED</span>
                              <strong className="text-slate-800 font-extrabold block mt-1 leading-none">{draft.driver}</strong>
                            </div>
                          </div>

                          {/* Cargo count */}
                          <div className="text-left">
                            <span className="text-slate-400 font-black text-[9px] block uppercase leading-none tracking-wider">CARGO VOLUME</span>
                            <strong className="text-slate-800 font-extrabold block mt-1 leading-none">📦 {draft.units}</strong>
                          </div>

                          {/* Route Path (Blue pill badge) */}
                          <div className="px-3 py-1.5 bg-[#EFF6FF] border border-blue-100 text-blue-700 font-black rounded-xl text-xs uppercase tracking-wider">
                            {draft.route.replace('➔', '→')}
                          </div>

                        </div>

                        {/* Expandable Manifest Accordion */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setExpandedDrafts({ ...expandedDrafts, [draft.id]: !isExpanded })}
                            className="w-full text-left text-[10px] font-black text-slate-455 uppercase tracking-widest hover:text-slate-705 flex items-center justify-between py-1 cursor-pointer"
                          >
                            <span>View VIN Manifest ({draft.vins.length})</span>
                            <span className="text-xs transition-transform duration-200">{isExpanded ? '▲' : '▼'}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl space-y-1.5 font-mono text-[10.5px] text-slate-655 border border-slate-100">
                              {draft.vins.map(v => (
                                <div key={v} className="flex justify-between items-center py-0.5">
                                  <span>{v}</span>
                                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">✓ SCAN PASS</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* =========================================================================
              4. TERMINAL WORKSPACE (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'terminal-workspace' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-805">
                    <Package className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Terminal Sortation</h1>
                    <span className="text-xs font-semibold text-slate-455 mt-1.5 block">Sydney Depot Node 01 • Active Inbound</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl shadow-xs">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Efficiency</span>
                  <strong className="text-base font-black text-emerald-700">98.4%</strong>
                  <span className="text-emerald-500 font-extrabold text-sm leading-none">↗</span>
                </div>
              </div>

              {/* Blue Info box alert */}
              <div className="bg-[#EFF6FF] border border-blue-105 rounded-3xl p-5 text-left flex gap-4 items-start shadow-xs">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider leading-none">WHAT IS THIS WORKSPACE?</h4>
                  <p className="text-xs text-blue-800 leading-relaxed font-semibold">
                    This module is used by Warehouse Staff when large line-haul trucks arrive at a Terminal. Workers scan every incoming box. The "Smart Sorter" instantly checks the <strong className="font-extrabold text-slate-900">Full Network Manifest</strong> (the master list of all cross-country jobs) to decide if the box should go out on a <strong className="font-extrabold text-slate-900">Local Delivery Van</strong> or be loaded onto another <strong className="font-extrabold text-slate-900">Line-haul Truck</strong> for the next Depot.
                  </p>
                  <p className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                    💡 Try scanning: <span className="underline font-mono">SHP-9041</span> or <span className="underline font-mono">SHP-9042</span>
                  </p>
                </div>
              </div>

              {/* 3-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left/Center Column (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Scan Input Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Scan & Redirection Input</span>
                    
                    <form onSubmit={handleTerminalScanSubmit} className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                        <QrCode className="h-5 w-5 text-slate-400" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Enter / Scan Load ID..."
                        value={terminalScanInput}
                        onChange={(e) => setTerminalScanInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-slate-205 focus:border-[#FFB200] text-sm font-bold rounded-2xl focus:outline-none bg-slate-50/50 transition-all uppercase placeholder-slate-400"
                      />
                    </form>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-450 pt-1">
                      <div className="flex items-center gap-1.5 font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Auto-dispatch on Scan Active
                      </div>
                      <span className="font-black text-slate-900 tracking-wider">BATCH SCAN MODE</span>
                    </div>
                  </div>

                  {/* Recent Entries */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Recent Sorting Entries</span>
                    
                    <div className="space-y-3">
                      {terminalRecentEntries.map((log, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-semibold gap-4 hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-405 text-xs font-mono">🕒</span>
                            <div>
                              <strong className="text-slate-900 block font-black font-mono">{log.id}</strong>
                              <span className="text-[9.5px] text-slate-400 block mt-0.5">{log.time}</span>
                            </div>
                          </div>
                          <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wider text-right font-mono">
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column (col-span-1) */}
                <div className="space-y-6">
                  
                  {/* Awaiting Arrival (Dark Navy) */}
                  <div className="bg-[#111827] text-white border border-slate-900 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Awaiting Arrival</span>
                      <span className="text-[9px] font-black text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">Linehaul Queue</span>
                    </div>

                    <div className="space-y-2.5">
                      {terminalAwaitingArrival.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">All expected linehauls sorted.</p>
                      ) : (
                        terminalAwaitingArrival.map(item => (
                          <div key={item.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-semibold hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🚚</span>
                              <div>
                                <strong className="text-white block font-black font-mono">{item.id}</strong>
                                <span className="text-[9.5px] text-slate-400 block mt-0.5">{item.depot}</span>
                              </div>
                            </div>
                            <span className="text-slate-400 font-extrabold text-sm hover:translate-x-0.5 transition-transform">➔</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => triggerToast('Opening full linehaul manifest...')}
                      className="w-full py-2.5 bg-slate-850 hover:bg-slate-750 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer text-center transition-colors"
                    >
                      View Full Manifest
                    </button>
                  </div>

                  {/* Sorting Protocol Card (Yellow warning) */}
                  <div className="bg-white border border-yellow-100 rounded-3xl p-5 text-left flex gap-4 items-start shadow-sm bg-gradient-to-tr from-yellow-50/10 to-transparent">
                    <AlertTriangle className="h-5 w-5 text-amber-505 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1.5 leading-none">Sorting Protocol</h4>
                      <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                        Ensure every scan is cross-referenced with the digital manifest (the master list of active network Loads). Unrecognized items must be quarantined immediately to Section X.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {activeTab === 'fleet-monitor' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="p-3 bg-yellow-50 border border-yellow-205 rounded-2xl text-yellow-605">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Fleet Monitor</h1>
                    <span className="text-xs font-semibold text-slate-455 mt-1.5 block">Live Network • Sydney Central Depot</span>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto items-center">
                  <button 
                    onClick={() => triggerToast('Toggled layers view.')}
                    className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-805 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Layers
                  </button>
                  <button 
                    onClick={() => triggerToast('Fullscreen live monitor activated.')}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#FFB200]" />
                    Full Screen
                  </button>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Left Side: Drivers telemetry list */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex flex-col gap-4">
                  
                  {/* Search Input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search driver or vehicle..." 
                      value={fleetMonitorSearch}
                      onChange={(e) => setFleetMonitorSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all placeholder-slate-400"
                    />
                  </div>

                  {/* Active units vs Incidents badges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-left">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">Active Units</span>
                      <strong className="text-xl font-black text-emerald-700 block mt-1">24</strong>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-left">
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">Incidents</span>
                      <strong className="text-xl font-black text-rose-700 block mt-1">03</strong>
                    </div>
                  </div>

                  {/* Vehicles List */}
                  <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                    {[
                      { name: 'Jack Taylor', status: 'MOVING', speed: '45 km/h', vehicle: 'TRK-102', loc: 'Hume Highway, G...', time: '45 mins away' },
                      { name: 'Liam Smith', status: 'STOPPED', speed: '0 km/h', vehicle: 'VAN-08', loc: 'Albury Stopover', time: 'Delayed away' }
                    ]
                    .filter(d => !fleetMonitorSearch || d.name.toLowerCase().includes(fleetMonitorSearch.toLowerCase()) || d.vehicle.toLowerCase().includes(fleetMonitorSearch.toLowerCase()))
                    .map(item => (
                      <div key={item.name} className="p-4 bg-slate-50 border border-slate-100 hover:border-slate-205 rounded-2xl transition-all cursor-pointer space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0B1528] text-[#FFB200] flex items-center justify-center font-bold text-xs">
                              🚚
                            </div>
                            <div>
                              <strong className="text-slate-900 font-extrabold text-xs block leading-tight font-mono">{item.vehicle}</strong>
                              <span className="text-[10px] text-slate-455 font-semibold block mt-0.5">{item.name}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                            item.status === 'STOPPED' 
                              ? 'bg-slate-150 text-slate-600' 
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-2.5">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">📍</span>
                            <span>{item.speed}</span>
                            <span className="mx-1 text-slate-300">•</span>
                            <span className="text-slate-400">{item.loc}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-slate-455 text-[9px]">
                            <span>🕒</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Right Side: Map Block */}
                <div className="lg:col-span-2 bg-[#f8fafc] border border-slate-200 rounded-3xl min-h-[400px] flex flex-col justify-between relative overflow-hidden shadow-xs">
                  
                  {/* Dot Grid Map Backdrop */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  {/* Top Map bar */}
                  <div className="absolute top-4 left-4 z-10 bg-white border border-slate-105 rounded-2xl p-3 shadow-md flex items-center gap-4">
                    <div className="text-left border-r border-slate-100 pr-4">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Focus Area</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5 uppercase">Sydney Central Depot</strong>
                    </div>
                    <div className="flex items-end gap-0.5 h-3.5 mt-0.5 pl-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-xs"></span>
                      <span className="w-1.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                      <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs"></span>
                    </div>
                  </div>

                  {/* Map overlay controls */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <button 
                      onClick={() => triggerToast('Opening alerts portal...')}
                      className="w-8 h-8 bg-white border border-slate-200 shadow-md text-slate-700 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      🔔
                    </button>
                  </div>

                  {/* Zoom controls */}
                  <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                    <button 
                      onClick={() => { setMapZoom(prev => Math.min(18, prev + 1)); triggerToast('Zoomed in live tracking map'); }}
                      className="w-8 h-8 bg-white border border-slate-200 shadow-md text-slate-800 font-extrabold flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => { setMapZoom(prev => Math.max(8, prev - 1)); triggerToast('Zoomed out live tracking map'); }}
                      className="w-8 h-8 bg-white border border-slate-200 shadow-md text-slate-800 font-extrabold flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      -
                    </button>
                  </div>

                  {/* Visual Map Pin Graphic */}
                  <div className="m-auto z-10 space-y-4 text-center">
                    <div className="relative inline-block">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 animate-ping absolute -top-1 -left-1"></div>
                      <div className="w-8 h-8 rounded-full bg-[#0B1528] text-[#FFB200] border-2 border-white flex items-center justify-center shadow-lg text-sm relative">
                        📍
                      </div>
                    </div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block uppercase">Sydney Central Depot</strong>
                      <span className="text-[10px] text-slate-450 font-bold block mt-1">Level {mapZoom} grid focus index</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {(activeTab === 'fleet-assets' || activeTab === 'vehicles') && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-805">
                    <Truck className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Fleet Asset Control</h1>
                    <span className="text-xs font-semibold text-slate-455 mt-1.5 block">Real-time status, health monitoring, and assignment for all fleet assets.</span>
                  </div>
                </div>
              </div>

              {/* Statistics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Assets</span>
                    <strong className="text-3xl font-black text-slate-900 block mt-2">124</strong>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-2xl">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fuel Warning</span>
                    <strong className="text-3xl font-black text-[#FFB200] block mt-2">3</strong>
                  </div>
                  <div className="p-3.5 bg-yellow-50 text-[#FFB200] rounded-2xl">
                    <span className="text-xl">💧</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Maintenance</span>
                    <strong className="text-3xl font-black text-rose-500 block mt-2">8</strong>
                  </div>
                  <div className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl">
                    <Wrench className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operational</span>
                    <strong className="text-3xl font-black text-slate-900 block mt-2">94%</strong>
                  </div>
                  <div className="p-3.5 bg-blue-50 text-blue-500 rounded-2xl">
                    <Truck className="h-6 w-6" />
                  </div>
                </div>

              </div>

              {/* Table list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                
                {/* Search & subtab filters */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                  <div className="relative flex-grow sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search by ID or Reg..." 
                      value={fleetAssetSearch}
                      onChange={(e) => setFleetAssetSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all placeholder-slate-400"
                    />
                  </div>
                  
                  <div className="flex gap-2 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                    {['All', 'Active', 'Maintenance', 'Loading'].map(tabName => (
                      <button
                        key={tabName}
                        type="button"
                        onClick={() => setFleetAssetFilter(tabName)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          fleetAssetFilter === tabName
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tabName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                        <th className="pb-3 font-black">ASSET ID & REG</th>
                        <th className="pb-3 font-black">TYPE</th>
                        <th className="pb-3 font-black">STATUS & LOCATION</th>
                        <th className="pb-3 font-black font-mono">FUEL</th>
                        <th className="pb-3 font-black text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {fleetAssetsList
                        .filter(item => {
                          if (fleetAssetSearch) {
                            const q = fleetAssetSearch.toLowerCase();
                            if (!item.id.toLowerCase().includes(q) && !item.reg.toLowerCase().includes(q)) return false;
                          }
                          if (fleetAssetFilter !== 'All') {
                            if (item.status.toUpperCase() !== fleetAssetFilter.toUpperCase()) return false;
                          }
                          return true;
                        })
                        .map(item => (
                          <tr key={item.id} className="align-middle hover:bg-slate-50/40 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                                  <Truck className="h-4.5 w-4.5 text-slate-655" />
                                </div>
                                <div className="text-left">
                                  <strong className="font-black text-slate-905 block font-mono leading-none">{item.id}</strong>
                                  <span className="text-[10px] text-slate-400 font-bold block mt-1">{item.reg}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-left">
                              <strong className="font-extrabold text-slate-805 block">{item.type}</strong>
                              <span className="text-[10px] text-slate-400 font-bold block mt-1">{item.payload}</span>
                            </td>
                            <td className="py-4 text-left">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  item.status === 'ACTIVE' 
                                    ? 'bg-emerald-50 text-emerald-650' 
                                    : item.status === 'MAINTENANCE' 
                                      ? 'bg-rose-50 text-rose-650' 
                                      : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {item.status}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block">📍 {item.location}</span>
                              </div>
                            </td>
                            <td className="py-4 font-bold text-slate-805 font-mono">{item.fuel}</td>
                            <td className="py-4 text-right">
                              <button 
                                type="button"
                                onClick={() => triggerToast(`Viewing details for asset ${item.id}`)}
                                className="px-3.5 py-1.5 border border-slate-205 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {(activeTab === 'roster-control' || activeTab === 'drivers') && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-805">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Roster Control</h1>
                    <p className="text-xs font-semibold text-slate-455 mt-1 block">Active Fleet Operators and Live Status Monitoring</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => triggerToast('Exporting roster CSV...')}
                    className="px-5 py-2.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-xs"
                  >
                    Export CSV
                  </button>
                  <button 
                    type="button"
                    onClick={() => triggerToast('Add new driver modal opened.')}
                    className="px-5 py-2.5 bg-[#FFB200] hover:bg-[#E68A00] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all"
                  >
                    + Add Driver
                  </button>
                </div>
              </div>

              {/* Filters, Search and Sort row */}
              <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
                
                {/* Scrollable Tab bar matching the image */}
                <div className="flex items-center gap-2">
                  <button type="button" className="text-slate-400 font-extrabold hover:text-slate-800 text-xs px-1" onClick={() => triggerToast('Scroll left')}>◀</button>
                  <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl overflow-x-auto scrollbar-none max-w-sm sm:max-w-md">
                    {['All', 'On Duty', 'In Break', 'Delay Alert', 'Off Duty'].map(tabName => (
                      <button
                        key={tabName}
                        type="button"
                        onClick={() => setRosterFilter(tabName)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                          rosterFilter === tabName
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-550 hover:text-slate-900'
                        }`}
                      >
                        {tabName}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="text-slate-400 font-extrabold hover:text-slate-800 text-xs px-1" onClick={() => triggerToast('Scroll right')}>▶</button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-grow sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search by ID or Name..." 
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={rosterSort}
                      onChange={(e) => setRosterSort(e.target.value)}
                      className="appearance-none bg-white border border-slate-205 pl-4 pr-10 py-2.5 rounded-xl text-xs font-black focus:outline-none focus:border-[#FFB200] cursor-pointer text-slate-700 shadow-xs"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="score">Sort by Rating</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-455 pointer-events-none text-[10px]">▼</span>
                  </div>
                </div>

              </div>

              {/* Roster Table Card Layout */}
              <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                      <th className="pb-4 font-black">DRIVER DETAILS</th>
                      <th className="pb-4 font-black">CURRENT SHIFT</th>
                      <th className="pb-4 font-black">STATUS & ASSIGNMENT</th>
                      <th className="pb-4 font-black">COMPLIANCE</th>
                      <th className="pb-4 font-black text-right pr-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rosterDrivers
                      .filter(d => {
                        if (rosterSearch) {
                          const q = rosterSearch.toLowerCase();
                          if (!d.name.toLowerCase().includes(q) && !d.id.toLowerCase().includes(q)) return false;
                        }
                        if (rosterFilter !== 'All') {
                          if (rosterFilter === 'Delay Alert') {
                            // If delay alerts tab, let's mock no active delayed drivers, or just return none
                            return false;
                          }
                          if (d.status.toUpperCase() !== rosterFilter.toUpperCase()) return false;
                        }
                        return true;
                      })
                      .sort((a, b) => {
                        if (rosterSort === 'score') {
                          return b.score.localeCompare(a.score);
                        }
                        return a.name.localeCompare(b.name);
                      })
                      .map(driver => (
                        <tr key={driver.id} className="align-middle hover:bg-slate-50/30 transition-colors">
                          
                          {/* Driver Details */}
                          <td className="py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-205 flex items-center justify-center font-black text-xs text-slate-700 uppercase shrink-0 shadow-xs font-mono">
                                {driver.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <strong className="text-slate-900 font-black text-sm block leading-none">{driver.name}</strong>
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-450 font-black rounded text-[9px] uppercase tracking-wider leading-none shrink-0">
                                    {driver.tier}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5 leading-none">
                                  {driver.id} • {driver.phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Current Shift */}
                          <td className="py-4.5">
                            <div className="text-left space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-805 font-bold leading-none">
                                <span>🕒</span>
                                <span>{driver.shift}</span>
                              </div>
                              <span className="text-[#FF9A00] font-black text-[10.5px] block leading-none">
                                {driver.score}
                              </span>
                            </div>
                          </td>

                          {/* Status & Assignment */}
                          <td className="py-4.5">
                            <div className="text-left space-y-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block leading-none ${
                                driver.status === 'On Duty' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : driver.status === 'In Break' 
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-slate-100 text-slate-500'
                              }`}>
                                {driver.status}
                              </span>
                              <div className="flex items-center gap-1 text-[10.5px] text-slate-450 font-black leading-none">
                                <span>📍</span>
                                <span>{driver.assignment.toUpperCase()}</span>
                              </div>
                            </div>
                          </td>

                          {/* Compliance */}
                          <td className="py-4.5">
                            <div className="text-left space-y-2">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 leading-none">
                                <span>✓</span> VALID
                              </span>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {driver.compliance.filter(c => c !== 'VALID').map(cert => (
                                  <span key={cert} className="px-1.5 py-0.5 bg-slate-50 border border-slate-205 text-slate-505 rounded text-[8.5px] font-black uppercase tracking-wider leading-none">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4.5 text-right">
                            <div className="flex justify-end gap-2 pr-2">
                              <button
                                type="button"
                                onClick={() => triggerToast(`Dialing voice connection to ${driver.phone}...`)}
                                className="px-3.5 py-2 border border-slate-205 hover:bg-slate-50 text-slate-705 font-black rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                              >
                                📞 Call
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveTab('communication-depot'); setActiveChatDriver(driver.name); triggerToast(`Opening live chat with ${driver.name}`); }}
                                className="px-3.5 py-2 bg-[#FFB200] hover:bg-[#E68A00] text-black font-black rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                              >
                                💬 Chat
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* =========================================================================
              8. ASSET INVENTORY (REDESIGNED)
             ========================================================================= */}
          {activeTab === 'asset-inventory' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-850">
                    <Layers className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Asset Inventory</h1>
                    <span className="text-xs font-semibold text-slate-455 mt-1.5 block">Depot vehicle transport catalog and manifest ledger.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex border border-slate-205 rounded-xl p-1 bg-slate-50/50">
                    <button type="button" className="px-3 py-1 bg-white text-slate-800 shadow-xs text-[10px] font-black rounded-lg transition-all cursor-pointer">List</button>
                    <button type="button" className="px-3 py-1 text-slate-500 hover:text-slate-800 text-[10px] font-black transition-all cursor-pointer" onClick={() => triggerToast('Grid view toggled.')}>Grid</button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => triggerToast('Register new asset modal opened.')}
                    className="px-5 py-2 bg-[#FFB200] hover:bg-[#E68A00] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all"
                  >
                    + Register Asset
                  </button>
                </div>
              </div>

              {/* Inventory Table Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                
                {/* Search & filter pills */}
                <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
                  <div className="relative flex-grow sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search by VIN or Plate..." 
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-white transition-all placeholder-slate-400"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'AWAITING LOAD', 'IN DEPOT', 'IN TRANSIT', 'DELIVERED'].map(tabName => (
                      <button
                        key={tabName}
                        type="button"
                        onClick={() => setInventoryFilter(tabName)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          inventoryFilter === tabName
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {tabName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                        <th className="pb-3 font-black">ID</th>
                        <th className="pb-3 font-black">VEHICLE</th>
                        <th className="pb-3 font-black">TYPE</th>
                        <th className="pb-3 font-black font-mono">VIN</th>
                        <th className="pb-3 font-black">STATUS</th>
                        <th className="pb-3 font-black">ASSIGNED TASK</th>
                        <th className="pb-3 font-black">TARGET DESTINATION</th>
                        <th className="pb-3 font-black">CLIENT</th>
                        <th className="pb-3 font-black text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {assetsList
                        .filter(item => {
                          if (inventorySearch) {
                            const q = inventorySearch.toLowerCase();
                            if (!item.vin.toLowerCase().includes(q) && !item.plate.toLowerCase().includes(q) && !item.make.toLowerCase().includes(q)) return false;
                          }
                          if (inventoryFilter !== 'ALL') {
                            if (item.status.toUpperCase() !== inventoryFilter.toUpperCase()) return false;
                          }
                          return true;
                        })
                        .map(item => (
                          <tr key={item.id} className="align-middle hover:bg-slate-50/40 transition-colors">
                            <td className="py-4">
                              <strong className="font-black text-slate-905 font-mono">{item.id}</strong>
                            </td>
                            <td className="py-4">
                              <strong className="font-extrabold text-slate-805 block">{item.make}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{item.color} • {item.year}</span>
                            </td>
                            <td className="py-4 font-bold text-slate-655">{item.type}</td>
                            <td className="py-4">
                              <strong className="font-mono text-slate-905 block text-[10px]">{item.vin}</strong>
                              <span className="text-[10px] text-slate-405 block mt-0.5 font-mono">{item.plate}</span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                item.status === 'IN DEPOT' 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : item.status === 'IN TRANSIT' 
                                    ? 'bg-emerald-50 text-emerald-600' 
                                    : item.status === 'DELIVERED'
                                      ? 'bg-slate-100 text-slate-500'
                                      : 'bg-yellow-50 text-yellow-600'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 font-bold font-mono text-slate-805">{item.task}</td>
                            <td className="py-4 font-bold text-slate-600">📍 {item.target}</td>
                            <td className="py-4 font-bold text-slate-800">{item.client}</td>
                            <td className="py-4 text-right">
                              <button 
                                type="button"
                                onClick={() => triggerToast(`Viewing details for asset ${item.id}`)}
                                className="px-3 py-1.5 border border-slate-205 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'communication-depot' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-805">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Communication Depot</h1>
                  <p className="text-xs font-semibold text-slate-455 mt-1 block">Real-time driver dispatch alerts and terminal broadcasts</p>
                </div>
              </div>

              {/* Chat Layout Pane */}
              <div className="grid grid-cols-1 lg:grid-cols-3 bg-white border border-slate-105 rounded-3xl overflow-hidden min-h-[550px] shadow-sm items-stretch">
                
                {/* Channels Sidebar List */}
                <div className="border-r border-slate-100 p-5 space-y-4 bg-slate-50/20">
                  <div className="flex justify-between items-center px-1">
                    <strong className="text-xs font-black text-slate-900 tracking-wide">Messages</strong>
                  </div>
                  
                  {/* Search input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search chats..." 
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl focus:outline-none bg-slate-50/50 transition-all placeholder-slate-400"
                    />
                  </div>

                  {/* Chat items list */}
                  <div className="space-y-2">
                    {[
                      { name: 'Noah Williams', role: 'DRIVER (TRK-05)', msg: 'Traffic is fully stopped now...', time: '10:42 AM', unread: 2 },
                      { name: 'Jack Taylor', role: 'DRIVER (TRK-12)', msg: 'ETA is looking good. Reaching in 45m.', time: '09:15 AM' },
                      { name: 'Warehouse A', role: 'INBOUND TEAM', msg: 'Manifest LOD-044 is ready for assignment.', time: 'YESTERDAY' }
                    ]
                    .filter(c => !chatSearch || c.name.toLowerCase().includes(chatSearch.toLowerCase()) || c.role.toLowerCase().includes(chatSearch.toLowerCase()))
                    .map(c => {
                      const isActive = activeChatDriver === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setActiveChatDriver(c.name)}
                          className={`w-full p-4 rounded-2xl text-left transition-all flex flex-col gap-1 relative cursor-pointer border ${
                            isActive
                              ? 'bg-blue-50/20 text-slate-900 border-slate-150 shadow-xs'
                              : 'bg-white text-slate-800 border-transparent hover:bg-slate-50'
                          }`}
                        >
                          {/* Active Yellow bar on left */}
                          {isActive && (
                            <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#FFB200] rounded-r-md"></span>
                          )}
                          
                          <div className="flex justify-between items-center w-full">
                            <strong className="text-xs font-black text-slate-900 font-sans">{c.name}</strong>
                            <span className="text-[9px] font-bold text-slate-400 font-mono">{c.time}</span>
                          </div>
                          
                          <span className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-wider block">{c.role}</span>
                          
                          <div className="flex justify-between items-center w-full mt-1.5 gap-2">
                            <p className="text-[10.5px] text-slate-505 font-bold truncate flex-1 leading-tight">{c.msg}</p>
                            {c.unread && (
                              <span className="px-2 py-0.5 bg-[#FFB200] text-black font-black rounded-md text-[9px] tracking-wider shrink-0">
                                {c.unread}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Messages Chat Screen Pane */}
                <div className="lg:col-span-2 flex flex-col justify-between min-h-[550px]">
                  
                  {/* Chat Pane Header */}
                  <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#111827] text-white flex items-center justify-center font-black text-sm uppercase">
                        {activeChatDriver.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <strong className="text-xs font-black text-slate-909 block">{activeChatDriver}</strong>
                        <span className="text-[9.5px] text-slate-455 font-bold block mt-1 uppercase tracking-wider">Active Status</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => triggerToast(`Requesting voice channel hook to ${activeChatDriver}...`)}
                        className="w-8 h-8 bg-white border border-slate-205 hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 cursor-pointer transition-all shadow-xs"
                        title="Voice Call"
                      >
                        📞
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerToast('More options opened.')}
                        className="w-8 h-8 bg-white border border-slate-205 hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-extrabold cursor-pointer transition-all shadow-xs"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {/* Messages Scroller Pane */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/10">
                    
                    {/* Timestamp pill */}
                    <div className="flex justify-center my-3">
                      <span className="px-3.5 py-1 bg-slate-100/80 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-wider">
                        Today, 10:30 AM
                      </span>
                    </div>

                    {chatMessages.map((msg, index) => {
                      const isMe = msg.sender === 'Dispatcher';
                      return (
                        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                          <div className={`max-w-md p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                            isMe 
                              ? 'bg-[#FFB200] text-black rounded-tr-none' 
                              : 'bg-white border border-slate-205 text-slate-805 rounded-tl-none'
                          }`}>
                            <p>{msg.text}</p>
                          </div>
                          <span className="text-[9px] font-bold text-slate-450 block px-1 font-mono flex items-center gap-1">
                            {msg.time}
                            {isMe && <span className="text-blue-500 font-bold ml-0.5">✓✓</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message input footer */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-100 bg-white space-y-3">
                    <textarea
                      placeholder={`Message ${activeChatDriver.split(' ')[0]}...`}
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      rows={2}
                      className="w-full pl-4 pr-4 py-3 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-2xl focus:outline-none bg-slate-50/50 transition-all placeholder-slate-400 resize-none"
                    />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => triggerToast('Attachment portal opened.')}
                          className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-205 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          📎
                        </button>
                        <button 
                          type="button" 
                          onClick={() => triggerToast('Mic interface ready.')}
                          className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-205 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          🎙️
                        </button>
                      </div>
                      
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-black hover:bg-slate-900 text-[#FFB200] font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-md font-sans"
                      >
                        <Send className="h-3.5 w-3.5 text-[#FFB200]" />
                        SEND
                      </button>
                    </div>
                  </form>

                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              10. SYSTEM SETTINGS (REDESIGNED)
             ========================================================================= */}
          {(activeTab === 'system-settings' || activeTab === 'settings') && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Page header */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="p-3 bg-slate-50 border border-slate-205 rounded-2xl text-slate-805">
                  <span className="text-xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">System Settings</h1>
                  <p className="text-xs font-semibold text-slate-455 mt-1 block">Configure your operator profile and terminal preferences</p>
                </div>
              </div>

              {/* Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Left Sidebar Menu */}
                <div className="lg:col-span-1 space-y-3">
                  {[
                    { id: 'account', label: 'My Account', sub: 'Personal details and Depot info', icon: '👤', iconBg: 'bg-[#FFB200]/10 text-black' },
                    { id: 'security', label: 'Security', sub: 'Passwords and 2FA', icon: '🔒', iconBg: 'bg-slate-100 text-slate-650' },
                    { id: 'preferences', label: 'Preferences', sub: 'Theme and terminal alerts', icon: '🔧', iconBg: 'bg-slate-100 text-slate-650' },
                    { id: 'support', label: 'Help & Support', sub: 'Contact Admin Support', icon: '📞', iconBg: 'bg-slate-100 text-slate-655' }
                  ].map((tab) => {
                    const isActive = settingsActiveSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSettingsActiveSubTab(tab.id)}
                        className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center gap-3.5 cursor-pointer ${
                          isActive
                            ? 'bg-white border-slate-205 shadow-sm text-slate-900 font-sans'
                            : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${tab.iconBg}`}>
                          {tab.icon}
                        </div>
                        <div>
                          <strong className="text-xs font-black text-slate-900 block leading-tight">{tab.label}</strong>
                          <span className="text-[10px] font-semibold text-slate-450 block mt-0.5 leading-none">{tab.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Form Pane */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {settingsActiveSubTab === 'account' && (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* Identity Section */}
                      <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-xs space-y-4">
                        <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operator Identity</strong>
                        
                        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-left">
                          <div className="relative w-20 h-20 bg-black text-[#FFB200] rounded-2xl flex items-center justify-center font-black text-2xl font-mono shrink-0 shadow-sm">
                            SM
                            <button 
                              type="button"
                              onClick={() => triggerToast('Uploading new profile image...')}
                              className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] rounded-full flex items-center justify-center text-slate-700 cursor-pointer shadow-xs"
                              title="Upload Photo"
                            >
                              📷
                            </button>
                          </div>

                          <div className="text-center sm:text-left space-y-2.5">
                            <h3 className="text-xl font-black text-slate-909 tracking-tight leading-none">Sarah Mitchell</h3>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-550 font-black rounded text-[9px] uppercase tracking-wider">
                                DISPATCHER
                              </span>
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-black rounded text-[9px] uppercase tracking-wider">
                                LIVE STATUS
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Credentials & Access */}
                      <form onSubmit={(e) => { e.preventDefault(); triggerToast('Operator identity modifications saved.'); }} className="bg-white border border-slate-105 rounded-3xl p-6 shadow-xs space-y-6">
                        <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Credential & Access</strong>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                          <div>
                            <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2.5">Login Handle</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">👤</span>
                              <input 
                                type="text" 
                                defaultValue="Sarah Mitchell"
                                className="w-full bg-slate-50/50 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl p-2.5 pl-9 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2.5">Primary Email</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">✉️</span>
                              <input 
                                type="text" 
                                defaultValue="sarah.m@herologistics.com"
                                className="w-full bg-slate-50/50 border border-slate-205 focus:border-[#FFB200] text-xs font-bold rounded-xl p-2.5 pl-9 focus:outline-none text-slate-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Operational Depot Box */}
                        <div className="space-y-3.5 pt-3">
                          <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Assigned Operational Depot</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch text-left">
                            
                            <div className="p-4 border border-slate-105 bg-slate-50/20 rounded-2xl flex gap-3.5 items-center">
                              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-205 flex items-center justify-center text-lg shrink-0">
                                🏢
                              </div>
                              <div>
                                <strong className="text-xs font-black text-slate-900 block leading-tight">Sydney Central Depot</strong>
                                <span className="text-[10px] font-bold text-slate-450 block mt-0.5 font-mono leading-none">SYD-CENTRAL • MAIN DEPOT</span>
                              </div>
                            </div>

                            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-center">
                              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                                Branch location is locked to your dispatcher license. For inter-Depot duty, please submit a transfer request.
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                          <button
                            type="submit"
                            className="px-5 py-3 bg-black hover:bg-slate-900 text-[#FFB200] hover:text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-md font-sans"
                          >
                            💾 Save Profile Changes
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                  {settingsActiveSubTab === 'security' && (
                    <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in text-left">
                      <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Security Configuration</strong>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">Update password and configure Multi-Factor Authentication credentials.</p>
                      <button type="button" onClick={() => triggerToast('MFA options opened.')} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer">Configure MFA</button>
                    </div>
                  )}

                  {settingsActiveSubTab === 'preferences' && (
                    <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in text-left">
                      <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Preferences</strong>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">Customize terminal theme defaults, notification center triggers, and alert sounds.</p>
                      <button type="button" onClick={() => triggerToast('Toggled dark mode preference.')} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer">Toggle Dark Mode</button>
                    </div>
                  )}

                  {settingsActiveSubTab === 'support' && (
                    <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in text-left">
                      <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Admin Support</strong>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">Submit support issues directly to system administrators for hardware, routing or mapping configuration assistance.</p>
                      <button type="button" onClick={() => triggerToast('Opening support ticket portal...')} className="px-4 py-2 bg-[#FFB200] hover:bg-[#E68A00] text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Submit Ticket</button>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </>
      )}

      {/* Active Load Detail Inspect Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Active Route Inspector">
        {selectedLoadDetail && (
          <div className="space-y-6 text-left text-slate-550 text-xs sm:text-sm flex flex-col h-full">
            <div className="border-b border-slate-200 pb-4">
              <h4 className="text-base font-black text-slate-900 mb-1">{selectedLoadDetail.route}</h4>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={selectedLoadDetail.status} />
                <span className="text-[10px] font-bold font-mono text-slate-500">{selectedLoadDetail.loadId}</span>
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
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] text-slate-450 font-black uppercase block">Driver</span>
                      <strong className="text-slate-900 text-xs block mt-1">{selectedLoadDetail.driver || 'Unassigned'}</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{selectedLoadDetail.contact || 'No phone'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] text-slate-450 font-black uppercase block">Vehicle / Weight</span>
                      <strong className="text-slate-900 text-xs block mt-1">{selectedLoadDetail.vehicle || 'Unassigned'}</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{selectedLoadDetail.weight}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Operations Actions</span>
                    <div className="flex flex-wrap gap-2">
                      <Button size="xs" variant="primary" onClick={() => triggerToast('Coordinates sent to driver GPS.')}>Send Location to Driver</Button>
                      <Button size="xs" variant="secondary" onClick={() => triggerToast('Loading vehicle coordinates history...')}>View GPS History</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Transfer Load initiated.')}>Transfer Load</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Transfer Item initiated.')}>Transfer Item</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Opening Chain of Custody logs...')}>View Chain of Custody</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Displaying Customer Instructions...')}>View Customer Instructions</Button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Advance Lifecycle Status</span>
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
                          <div className={`absolute left-3 top-6 bottom-[-20px] w-0.5 bg-slate-100`} />
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0 z-10 ${
                          isCurrent ? 'bg-[#FFB200] border-[#FFB200] text-black font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="text-left">
                          <h5 className={`text-xs font-black ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>{step}</h5>
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
                      <p className="text-xs text-slate-400 py-4 text-center">No documents uploaded.</p>
                    ) : (
                      (selectedLoadDetail.documents || []).map((doc, dIdx) => (
                        <div key={dIdx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4.5 w-4.5 text-blue-500" />
                            <span className="font-semibold text-slate-800">{doc.name}</span>
                          </div>
                          <button onClick={() => triggerToast(`Downloading ${doc.name}...`)} className="text-[10px] text-blue-600 font-extrabold hover:underline cursor-pointer">Download</button>
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
                      <p className="text-xs text-slate-400 text-center py-4">No notes on record.</p>
                    ) : (
                      (selectedLoadDetail.notes || []).map((note, nIdx) => (
                        <div key={nIdx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left font-semibold">
                          <p className="text-slate-655">{note}</p>
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
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-455 font-black block">Current Trailer</span>
                    <strong className="text-slate-900 text-sm font-mono block">{selectedLoadDetail.trailer || 'TR-4022'}</strong>
                  </div>
                  
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
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

            <div className="flex gap-2 border-t border-slate-200 pt-4 mt-auto">
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
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs font-semibold">
                <div>
                  <label className="block text-[9px] font-black text-slate-455 uppercase mb-1">Vehicle Plate</label>
                  <input type="text" value={v.plate} disabled className="w-full bg-white border border-slate-200 text-slate-600 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-455 uppercase mb-1">Vehicle Type</label>
                  <input type="text" value={v.type} disabled className="w-full bg-white border border-slate-200 text-slate-600 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-455 uppercase mb-1">Current Status</label>
                  <input type="text" value={v.status} disabled className="w-full bg-white border border-slate-200 text-slate-600 p-2 rounded-lg opacity-70" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-455 uppercase mb-1">Current Branch</label>
                  <input type="text" value={v.branch || 'Main Depot'} disabled className="w-full bg-white border border-slate-200 text-slate-600 p-2 rounded-lg opacity-70" />
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

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 mt-2">
            <Button variant="secondary" onClick={(e) => { e.preventDefault(); setIsAssignVehicleModalOpen(false); }}>Cancel</Button>
            <Button type="submit" variant="primary">Assign Vehicle</Button>
          </div>
        </form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isAddVehicleModalOpen} onClose={() => setIsAddVehicleModalOpen(false)} title="Add Vehicle Asset to Fleet">
        <form onSubmit={handleAddVehicleSubmit} className="space-y-4 p-1 text-left">
          <TextInput 
            label="Registration Plate" 
            value={newVehicleForm.plate} 
            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, plate: e.target.value })} 
            placeholder="e.g. TRK-442"
          />
          <SelectInput 
            label="Vehicle Type" 
            value={newVehicleForm.type} 
            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, type: e.target.value })} 
            options={[{ value: 'Heavy Truck', label: 'Heavy Truck' }, { value: 'Delivery Van', label: 'Delivery Van' }, { value: 'Trailer Flatbed', label: 'Trailer Flatbed' }]} 
          />
          <SelectInput 
            label="Branch Assignment" 
            value={newVehicleForm.branch} 
            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, branch: e.target.value })} 
            options={[{ value: 'Sydney Central Depot', label: 'Sydney Central Depot' }, { value: 'Melbourne Depot', label: 'Melbourne Depot' }, { value: 'Brisbane Port Branch', label: 'Brisbane Port Branch' }]} 
          />
          <SelectInput 
            label="Assigned Driver (Optional)" 
            value={newVehicleForm.driver} 
            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, driver: e.target.value })} 
            options={[{ value: '', label: 'Unassigned' }, ...drivers.map(d => ({ value: d.name, label: d.name }))]} 
          />
          <TextInput 
            label="Payload Spec Capacity" 
            value={newVehicleForm.payload} 
            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, payload: e.target.value })} 
            placeholder="e.g. 20T"
          />

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 mt-2">
            <Button variant="secondary" onClick={(e) => { e.preventDefault(); setIsAddVehicleModalOpen(false); }}>Cancel</Button>
            <Button type="submit" variant="primary">Add Asset</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
