import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGateLog } from '../../store/slices/warehouseSlice';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import Toast from '../common/Toast';
import FileUploader from '../common/FileUploader';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Layers, MapPin, Database, Award, Check, Truck, QrCode, AlertTriangle, Clock, ArrowRight, Shield, Calendar, RefreshCw, Navigation, Bell, X, CheckCircle, ChevronRight, User, Clipboard, Eye, FileText, Camera, Zap, Activity } from 'lucide-react';
import { useLogistics } from '../../context/LogisticsContext';

// ─── Initial Data Templates ──────────────────────────────────────────────────
const INITIAL_TASKS = [
  { id: 1, title: 'Spot Trailer TR-9410 to Gate 4', desc: 'Dock unloading request from warehouse team', status: 'Pending', priority: 'High', dueTime: '14:00', gate: 'Gate 4', trailer: 'TR-9410', notes: '' },
  { id: 2, title: 'Audit Seal locks for TR-1102', desc: 'Verify container security codes before departure', status: 'In Progress', priority: 'High', dueTime: '15:30', gate: 'Gate 2', trailer: 'TR-1102', notes: '' },
  { id: 3, title: 'Check damage report for TR-4809', desc: 'Verify reported rear bumper dent specs', status: 'Completed', priority: 'Medium', dueTime: '12:00', gate: 'Gate 1', trailer: 'TR-4809', notes: 'Minor surface scratch noted.' },
  { id: 4, title: 'Move TR-7712 to Lane 3', desc: 'Consolidation move for outbound load', status: 'Pending', priority: 'Medium', dueTime: '16:00', gate: 'Gate 3', trailer: 'TR-7712', notes: '' },
];

const NOTIFICATIONS_DATA = [
  { id: 1, type: 'task', title: 'New Task Assigned', msg: 'Spot Trailer TR-5540 to Gate 1 by 15:00', time: '2 min ago', read: false },
  { id: 2, type: 'supervisor', title: 'Supervisor Message', msg: 'Keep Gate 3 clear — heavy inbound scheduled at 14:30.', time: '10 min ago', read: false },
  { id: 3, type: 'emergency', title: '🚨 Emergency Alert', msg: 'Fuel spill near Dock B2. Avoid area. Safety team dispatched.', time: '22 min ago', read: false },
  { id: 4, type: 'task', title: 'Task Completed', msg: 'Audit for TR-1102 marked complete by supervisor.', time: '1 hr ago', read: true },
  { id: 5, type: 'supervisor', title: 'Shift Update', msg: 'Break time moved to 15:45 today.', time: '2 hr ago', read: true },
];

const YARD_SPOTS = [
  { id: 'A1', type: 'trailer', asset: 'TR-9410', occupied: true, color: 'brand' },
  { id: 'A2', type: 'trailer', asset: 'TR-1102', occupied: true, color: 'blue' },
  { id: 'A3', type: 'empty', asset: null, occupied: false },
  { id: 'A4', type: 'trailer', asset: 'TR-7712', occupied: true, color: 'purple' },
  { id: 'A5', type: 'empty', asset: null, occupied: false },
  { id: 'B1', type: 'container', asset: 'CTR-009', occupied: true, color: 'emerald' },
  { id: 'B2', type: 'empty', asset: null, occupied: false },
  { id: 'B3', type: 'vehicle', asset: 'VEH-4820', occupied: true, color: 'yellow' },
  { id: 'B4', type: 'empty', asset: null, occupied: false },
  { id: 'B5', type: 'container', asset: 'CTR-018', occupied: true, color: 'red' },
  { id: 'C1', type: 'empty', asset: null, occupied: false },
  { id: 'C2', type: 'trailer', asset: 'TR-4809', occupied: true, color: 'brand' },
  { id: 'C3', type: 'empty', asset: null, occupied: false },
  { id: 'C4', type: 'vehicle', asset: 'VEH-1144', occupied: true, color: 'orange' },
  { id: 'C5', type: 'empty', asset: null, occupied: false },
];

export default function YardAttendantDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const gateLogs = useSelector((state) => state.warehouse.gateLogs);
  const { shiftState, startWork, finishWork } = useLogistics();

  // ─── Local Status & Shift Summary State ─────────────────────────────────────
  const [currentStatus, setCurrentStatus] = useState('Available');
  const [statusNote, setStatusNote] = useState('');
  const [shiftSummary, setShiftSummary] = useState(null);
  const [shiftSummaryOpen, setShiftSummaryOpen] = useState(false);

  // ─── Modal States ──────────────────────────────────────────────────────────
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [taskDetailModal, setTaskDetailModal] = useState(null);
  const [taskNotesModal, setTaskNotesModal] = useState(null);
  const [inspectionModal, setInspectionModal] = useState(null);
  const [qrScanModal, setQrScanModal] = useState(false);
  const [incidentModal, setIncidentModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [yardMapModal, setYardMapModal] = useState(false);
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);

  // ─── Data Lists State ───────────────────────────────────────────────────────
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [reports, setReports] = useState([
    { id: 1, type: 'Damage', trailer: 'TR-7712', details: 'Rear container door seal torn. Water leak risk.', severity: 'High', date: '06/19/2026' },
    { id: 2, type: 'Missing Item', trailer: 'TR-1102', details: 'Load securing chains missing from rear locker box.', severity: 'Low', date: '06/18/2026' }
  ]);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [yardSpots, setYardSpots] = useState(YARD_SPOTS);
  const [inwardManifest, setInwardManifest] = useState([
    { item: 'VIN-7YV1HP82A81920', desc: 'Toyota Hilux double-cab', status: 'Pending Spot' },
    { item: 'PLT-AUTO-19', desc: 'Dry Pallets', status: 'Pending Spot' }
  ]);
  const [outboundQueue, setOutboundQueue] = useState([
    { item: 'VIN-3YV1HP52X81254', desc: 'Mitsubishi Triton GLX', status: 'Awaiting Release' }
  ]);

  // ─── Form Inputs State ─────────────────────────────────────────────────────
  const [trailerPlate, setTrailerPlate] = useState('');
  const [gateActionType, setGateActionType] = useState('Gate-In');
  const [driverName, setDriverName] = useState('');

  const [relocateTrailer, setRelocateTrailer] = useState('');
  const [relocateOrigin, setRelocateOrigin] = useState('A2');
  const [relocateDest, setRelocateDest] = useState('A3');

  const [issueType, setIssueType] = useState('Damage');
  const [inspectedTrailer, setInspectedTrailer] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  const [inspectionChecklist, setInspectionChecklist] = useState({
    doors: false, tyres: false, lights: false, seals: false, brakes: false
  });

  const [scanType, setScanType] = useState('Trailer');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const [incident, setIncident] = useState({ type: 'Accident', location: '', desc: '', severity: 'Medium' });
  const [supervisorMessage, setSupervisorMessage] = useState('');

  const [scanInAsset, setScanInAsset] = useState('');
  const [scanInLocation, setScanInLocation] = useState('');

  const [scanOutAsset, setScanOutAsset] = useState('');
  const [scanOutGate, setScanOutGate] = useState('');

  const [laneTrailerId, setLaneTrailerId] = useState('');
  const [laneNotes, setLaneNotes] = useState('');

  // ─── Toast Notifications State ─────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); };

  // ─── Shift Logging Handlers ────────────────────────────────────────────────
  const handleStartWork = () => {
    startWork('Yard Attendant');
    setCurrentStatus('Working');
    triggerToast('Shift started. Status updated to Working.');
  };

  const handleFinishWork = () => {
    if (!shiftState.isWorking) {
      triggerToast('You are not currently clocked in.', 'error');
      return;
    }
    const endTime = new Date().toLocaleTimeString();
    const durationMin = Math.round(shiftState.totalSeconds / 60) || 1;
    const summary = {
      role: 'Yard Attendant',
      startTime: shiftState.startTime || new Date().toLocaleTimeString(),
      endTime: endTime,
      duration: durationMin,
      wages: (durationMin * 0.75).toFixed(2)
    };
    setShiftSummary(summary);
    setShiftSummaryOpen(true);
    finishWork('Yard Attendant');
    setCurrentStatus('Off Duty');
    triggerToast('Shift ended. Timesheet summary generated.');
  };

  // ─── Task Queue Handlers ───────────────────────────────────────────────────
  const handleStartTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'In Progress' } : t));
    triggerToast('Task status updated to In Progress.');
  };

  const handleCompleteTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
    triggerToast('Task completed successfully.');
  };

  const handleSaveNote = () => {
    if (!taskNotesModal) return;
    setTasks(tasks.map(t => t.id === taskNotesModal.id ? { ...t, notes: laneNotes } : t));
    setTaskNotesModal(null);
    setLaneNotes('');
    triggerToast('Task notes saved.');
  };

  const handleConfirmLoaded = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Completed', notes: 'Confirmed Loaded' } : t));
    triggerToast('Trailer cargo confirmed as LOADED.');
  };

  const handleConfirmUnloaded = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Completed', notes: 'Confirmed Unloaded' } : t));
    triggerToast('Trailer cargo confirmed as UNLOADED.');
  };

  // ─── Status Update Handler ─────────────────────────────────────────────────
  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    if (!currentStatus) {
      triggerToast('Please select a valid status.', 'error');
      return;
    }
    setStatusModalOpen(false);
    triggerToast(`Status updated to ${currentStatus}.`);
  };

  // ─── Move Asset Handler ────────────────────────────────────────────────────
  const handleMoveTrailer = (e) => {
    e.preventDefault();
    if (!relocateTrailer || !relocateOrigin || !relocateDest) {
      triggerToast('Trailer ID, Origin Spot, and Destination Spot are required.', 'error');
      return;
    }

    const spots = [...yardSpots];
    const originSpot = spots.find(s => s.id === relocateOrigin);
    const destSpot = spots.find(s => s.id === relocateDest);

    if (destSpot && destSpot.occupied) {
      triggerToast(`Spot ${relocateDest} is already occupied by ${destSpot.asset}.`, 'error');
      return;
    }

    // Move logic
    let foundTrailer = false;
    const updatedSpots = spots.map(s => {
      if (s.asset === relocateTrailer || (s.id === relocateOrigin && s.asset === relocateTrailer)) {
        foundTrailer = true;
        return { ...s, occupied: false, asset: null };
      }
      if (s.id === relocateDest) {
        return { ...s, occupied: true, asset: relocateTrailer, type: 'trailer', color: 'brand' };
      }
      return s;
    });

    setYardSpots(updatedSpots);
    triggerToast(`Trailer ${relocateTrailer} relocated from spot ${relocateOrigin} to ${relocateDest}.`);
    setRelocateTrailer('');
  };

  // ─── Gate Scan Actions ─────────────────────────────────────────────────────
  const handleGateScanAction = (e) => {
    e.preventDefault();
    if (!trailerPlate || !driverName) {
      triggerToast('Complete container plate and driver name.', 'error');
      return;
    }
    dispatch(addGateLog({
      id: Date.now(),
      event: gateActionType,
      trailer: trailerPlate,
      driver: driverName,
      company: 'Apex Cargo Solutions',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active'
    }));

    // Update spot map dynamically if Gate-In
    if (gateActionType === 'Gate-In') {
      const freeSpot = yardSpots.find(s => !s.occupied);
      if (freeSpot) {
        setYardSpots(yardSpots.map(s => s.id === freeSpot.id ? { ...s, occupied: true, asset: trailerPlate, type: 'trailer', color: 'blue' } : s));
      }
    } else {
      // Gate-Out frees up the spot
      setYardSpots(yardSpots.map(s => s.asset === trailerPlate ? { ...s, occupied: false, asset: null } : s));
    }

    setTrailerPlate('');
    setDriverName('');
    triggerToast(`Gate Container logged: ${gateActionType} registered.`);
  };

  // ─── QR/Barcode Scanning ───────────────────────────────────────────────────
  const handleQrScanSubmit = (e) => {
    e.preventDefault();
    if (!scanInput) {
      triggerToast('Scan input cannot be empty.', 'error');
      return;
    }

    // Simple simulated validation
    if (scanType === 'Vehicle' && !scanInput.startsWith('VIN-')) {
      triggerToast('Invalid VIN format. Must start with VIN-', 'error');
      return;
    }
    if (scanType === 'Container' && !scanInput.startsWith('CTR-')) {
      triggerToast('Invalid Container ID. Must start with CTR-', 'error');
      return;
    }
    if (scanType === 'Trailer' && !scanInput.startsWith('TR-')) {
      triggerToast('Invalid Trailer ID. Must start with TR-', 'error');
      return;
    }

    setScanResult({
      id: scanInput,
      type: scanType,
      location: 'Yard Zone B-4',
      status: 'Verified',
      lastSeen: new Date().toLocaleTimeString()
    });
    triggerToast(`${scanType} scan parsed successfully.`);
  };

  // ─── Safety Report Actions ─────────────────────────────────────────────────
  const handleAddInspectionReport = (e) => {
    e.preventDefault();
    if (!inspectedTrailer || !issueDesc) {
      triggerToast('Complete trailer ID and report description.', 'error');
      return;
    }
    const newRep = {
      id: Date.now(),
      type: issueType,
      trailer: inspectedTrailer,
      details: issueDesc,
      severity: issueSeverity,
      date: new Date().toLocaleDateString()
    };
    setReports([newRep, ...reports]);
    setInspectedTrailer('');
    setIssueDesc('');
    triggerToast(`${issueType} report logged to fleet maintenance dashboard.`);
  };

  const handleReportMissingItem = () => {
    if (!inspectedTrailer || !issueDesc) {
      triggerToast('Please complete Trailer ID and Description first.', 'error');
      return;
    }
    const newRep = {
      id: Date.now(),
      type: 'Missing Item',
      trailer: inspectedTrailer,
      details: issueDesc,
      severity: issueSeverity,
      date: new Date().toLocaleDateString()
    };
    setReports([newRep, ...reports]);
    setInspectedTrailer('');
    setIssueDesc('');
    triggerToast('Missing security tools report logged.');
  };

  // ─── Inventory Management Actions ──────────────────────────────────────────
  const handleInventoryScanIn = (e) => {
    e.preventDefault();
    if (!scanInAsset || !scanInLocation) {
      triggerToast('Asset ID and location spot are required for Scan In.', 'error');
      return;
    }

    const updatedSpots = yardSpots.map(s => {
      if (s.id.toLowerCase() === scanInLocation.toLowerCase()) {
        return { ...s, occupied: true, asset: scanInAsset, type: 'container', color: 'emerald' };
      }
      return s;
    });

    setYardSpots(updatedSpots);
    setInwardManifest([{ item: scanInAsset, desc: `Scanned In at spot ${scanInLocation}`, status: 'Completed' }, ...inwardManifest]);
    triggerToast(`Asset ${scanInAsset} successfully scanned in at Spot ${scanInLocation}.`);
    setScanInAsset('');
    setScanInLocation('');
  };

  const handleInventoryScanOut = (e) => {
    e.preventDefault();
    if (!scanOutAsset || !scanOutGate) {
      triggerToast('Asset ID and Gate/Dock ID are required for Scan Out.', 'error');
      return;
    }

    let found = false;
    const updatedSpots = yardSpots.map(s => {
      if (s.asset === scanOutAsset) {
        found = true;
        return { ...s, occupied: false, asset: null };
      }
      return s;
    });

    if (!found) {
      triggerToast(`Asset ${scanOutAsset} not found in yard spots.`, 'warning');
    }

    setYardSpots(updatedSpots);
    setOutboundQueue([{ item: scanOutAsset, desc: `Dispatched via ${scanOutGate}`, status: 'Dispatched' }, ...outboundQueue]);
    triggerToast(`Asset ${scanOutAsset} scanned out successfully through ${scanOutGate}.`);
    setScanOutAsset('');
    setScanOutGate('');
  };

  const handleLaneAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!laneTrailerId) {
      triggerToast('Please specify a Trailer ID to move.', 'error');
      return;
    }
    // Relocate to random free lane or spot A4
    setYardSpots(yardSpots.map(s => s.id === 'A4' ? { ...s, occupied: true, asset: laneTrailerId, type: 'trailer', color: 'purple' } : s));
    triggerToast(`Trailer ${laneTrailerId} assigned to load lane Gate 4.`);
    setLaneTrailerId('');
  };

  // ─── Contact Supervisor Handler ────────────────────────────────────────────
  const handleContactSupervisorSubmit = (e) => {
    e.preventDefault();
    if (!supervisorMessage) {
      triggerToast('Message cannot be empty.', 'error');
      return;
    }
    setSupervisorModalOpen(false);
    setSupervisorMessage('');
    triggerToast('Message sent to supervisor Michael Torres.');
  };

  const markAllNotifRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    triggerToast('All notifications marked as read.');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Yard Attendant • {activeTab.replace(/-/g, ' ')}</h2>
          <p className="text-xs text-slate-400">Perform gate checks, inspect trailers, and log spotted containers.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Notifications Bell */}
          <button type="button" onClick={() => setNotifModal(true)} className="relative p-2 rounded-xl bg-[#111827]/60 border border-[#23324C] hover:border-brand-500/40 transition-colors">
            <Bell className="h-4 w-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
          {/* Yard Map */}
          <button type="button" onClick={() => setYardMapModal(true)} className="p-2 rounded-xl bg-[#111827]/60 border border-[#23324C] hover:border-brand-500/40 transition-colors" title="Yard Map">
            <MapPin className="h-4 w-4 text-slate-300" />
          </button>
          {/* QR Scan */}
          <button type="button" onClick={() => setQrScanModal(true)} className="p-2 rounded-xl bg-[#111827]/60 border border-[#23324C] hover:border-brand-500/40 transition-colors" title="QR / Barcode Scan">
            <QrCode className="h-4 w-4 text-slate-300" />
          </button>
          {/* Incident */}
          <button type="button" onClick={() => setIncidentModal(true)} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors" title="Report Incident">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </button>
          <Button variant="outline" onClick={() => setShiftModalOpen(true)}>View Shift Schedule</Button>
          <Button variant="secondary" onClick={() => setStatusModalOpen(true)}>Update Status</Button>
          <Button variant="primary" onClick={() => setTasksModalOpen(true)}>View My Tasks</Button>
        </div>
      </div>

      {/* ─── Overview Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard title="Trailers Spotted" value={yardSpots.filter(s => s.type === 'trailer' && s.occupied).length} description="Active parking spots" progress={56} />
            <StatCard title="Gate Events" value={gateLogs.length} description="Inward/Outward today" trend="+2 checks" trendDirection="up" />
            <StatCard title="Yard Capacity" value={`${Math.round((yardSpots.filter(s => s.occupied).length / yardSpots.length) * 100)}%`} description="Slots occupied" progress={56} />
            <StatCard title="Pending Tasks" value={tasks.filter(t => t.status === 'Pending').length} description="Awaiting action" trend="Action needed" trendDirection="neutral" />
            <StatCard title="Current Shift" value={shiftState.isWorking ? 'Active' : 'Off Duty'} description={shiftState.isWorking ? `Started: ${shiftState.startTime}` : 'Not clocked in'} trend={shiftState.isWorking ? 'Working' : 'Clock in'} trendDirection={shiftState.isWorking ? 'up' : 'neutral'} />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Move Asset', sub: 'Relocate trailers & containers', icon: Navigation, color: 'blue', onClick: () => triggerToast('Select Move Asset from sidebar or top tabs to relocate.') },
              { label: 'Scan In', sub: 'Check inbound assets into yard', icon: QrCode, color: 'emerald', onClick: () => { setScanType('Container'); setQrScanModal(true); } },
              { label: 'Scan Out', sub: 'Release assets to gate', icon: Truck, color: 'purple', onClick: () => { setScanType('Container'); setQrScanModal(true); } },
              { label: 'Lane Assignment', sub: 'Spot trailers to load lanes', icon: MapPin, color: 'yellow', onClick: () => setYardMapModal(true) },
              { label: 'Report Issue', sub: 'Log damage or missing items', icon: AlertTriangle, color: 'red', onClick: () => setIncidentModal(true) },
            ].map(({ label, sub, icon: Icon, color, onClick }) => (
              <div key={label} className="glass rounded-2xl p-5 border border-[#23324C]/60 text-center flex flex-col items-center gap-3 hover:border-brand-500/40 transition-colors cursor-pointer group" onClick={onClick}>
                <div className={`w-12 h-12 rounded-xl bg-slate-800 border border-[#23324C] flex items-center justify-center group-hover:bg-slate-700/50 transition-colors`}>
                  <Icon className="h-6 w-6 text-brand-400" />
                </div>
                <div>
                  <strong className="text-white text-xs block font-extrabold">{label}</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
              </div>
            ))}
          </div>

          {/* Shift Control Row */}
          <div className="glass rounded-2xl p-4 border border-[#23324C]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${shiftState.isWorking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <div>
                  <strong className="text-white text-xs block">
                    {shiftState.isWorking ? `Shift In Progress (${currentStatus})` : `Shift Off Duty (${currentStatus})`}
                  </strong>
                  {shiftState.isWorking && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Math.floor(shiftState.totalSeconds / 3600).toString().padStart(2,'0')}:{Math.floor((shiftState.totalSeconds % 3600) / 60).toString().padStart(2,'0')}:{(shiftState.totalSeconds % 60).toString().padStart(2,'0')} elapsed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={Calendar} onClick={() => setShiftModalOpen(true)}>Shift Schedule</Button>
                <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => triggerToast('Yard status synced successfully.')}>Sync Yard Status</Button>
                {!shiftState.isWorking ? (
                  <Button size="sm" variant="primary" icon={Clock} onClick={handleStartWork}>Start Work</Button>
                ) : (
                  <Button size="sm" variant="danger" icon={Shield} onClick={handleFinishWork}>Finish Work</Button>
                )}
              </div>
            </div>
          </div>

          {/* Task Queue */}
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-white">Spotted Relocator Task Queue</h3>
              <Button size="sm" variant="outline" onClick={() => setTasksModalOpen(true)}>View All Tasks</Button>
            </div>
            <div className="divide-y divide-[#23324C]/40">
              {tasks.slice(0,3).map(task => (
                <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-xs">{task.title}</strong>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${task.priority === 'High' ? 'text-red-400 border-red-500/30 bg-red-500/5' : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'}`}>{task.priority}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{task.desc}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Due: {task.dueTime} | Gate: {task.gate} | {task.trailer}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} />
                    {task.status === 'Pending' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStartTask(task.id)}>Start Task</Button>
                    )}
                    {task.status === 'In Progress' && (
                      <>
                        <Button size="sm" variant="primary" icon={Check} onClick={() => handleCompleteTask(task.id)}>Complete</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleConfirmLoaded(task.id)}>Confirm Loaded</Button>
                        <Button size="sm" variant="outline" onClick={() => handleConfirmUnloaded(task.id)}>Confirm Unloaded</Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setTaskDetailModal(task)}>View Details</Button>
                    <Button size="sm" variant="outline" onClick={() => { setTaskNotesModal(task); setLaneNotes(task.notes || ''); }}>Add Notes</Button>
                    <Button size="sm" variant="outline" onClick={() => setSupervisorModalOpen(true)}>Contact Supervisor</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Move Asset Tab ───────────────────────────────────────────────── */}
      {activeTab === 'move-asset' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Relocate spotted container</h3>
            <form onSubmit={handleMoveTrailer} className="space-y-4">
              <TextInput label="Trailer Container plate ID" required placeholder="e.g. TR-9410" value={relocateTrailer} onChange={(e) => setRelocateTrailer(e.target.value)} />
              <TextInput label="Origin Spot Lane" required value={relocateOrigin} onChange={(e) => setRelocateOrigin(e.target.value)} />
              <TextInput label="Destination Spot Lane" required value={relocateDest} onChange={(e) => setRelocateDest(e.target.value)} />
              <Button type="submit" variant="primary" className="w-full">Relocate spotted container</Button>
            </form>
          </div>
          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[360px] lg:h-auto min-h-[300px]">
            <div>
              <h3 className="text-sm font-extrabold text-white mb-1">Visual Spotting Map Preview</h3>
              <p className="text-[10px] text-slate-500">Live container parking grid zones.</p>
            </div>
            <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              <button type="button" onClick={() => setYardMapModal(true)} className="absolute inset-0 flex items-center justify-center hover:bg-brand-500/5 transition-colors">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 font-semibold">Click to open Interactive Yard Map</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Gate Scan Tab ────────────────────────────────────────────────── */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Log Gate container event</h3>
            <form onSubmit={handleGateScanAction} className="space-y-4">
              <TextInput label="Trailer Container plate ID" required placeholder="e.g. TR-9410" value={trailerPlate} onChange={(e) => setTrailerPlate(e.target.value)} />
              <TextInput label="Hauling Driver Name" required placeholder="e.g. John D." value={driverName} onChange={(e) => setDriverName(e.target.value)} />
              <SelectInput label="Gate Event Action" value={gateActionType} onChange={(e) => setGateActionType(e.target.value)} options={[{ value: 'Gate-In', label: 'Gate-In Container Log' }, { value: 'Gate-Out', label: 'Gate-Out Container Log' }]} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" icon={QrCode} onClick={() => setQrScanModal(true)}>QR / Barcode Scan</Button>
                <Button type="submit" variant="primary" className="flex-1">Save Gate Entry</Button>
              </div>
            </form>
          </div>
          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Recent Gate Events Log</h3>
            <DataTable columns={[
              { key: 'event', label: 'Event', render: (row) => <span className={`font-extrabold ${row.event === 'Gate-In' ? 'text-brand-400' : 'text-purple-400'}`}>{row.event}</span> },
              { key: 'trailer', label: 'Trailer', render: (row) => <span className="font-mono font-extrabold text-white">{row.trailer}</span> },
              { key: 'driver', label: 'Driver', render: (row) => <span className="text-slate-300 font-semibold">{row.driver}</span> },
              { key: 'time', label: 'Time', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.time}</span> },
              { key: 'status', label: 'Inspection', render: (row) => <StatusBadge status={row.status} /> }
            ]} data={gateLogs} />
          </div>
        </div>
      )}

      {/* ─── Inspections Tab ──────────────────────────────────────────────── */}
      {activeTab === 'inspections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Log Safety Inspection Report</h3>
            <form onSubmit={handleAddInspectionReport} className="space-y-4">
              <SelectInput label="Report Issue Category" value={issueType} onChange={(e) => setIssueType(e.target.value)} options={[
                { value: 'Damage', label: 'Container Damage Report' },
                { value: 'Missing Item', label: 'Missing Security tools / chains' }
              ]} />
              <TextInput label="Trailer Container ID" required placeholder="e.g. TR-9410" value={inspectedTrailer} onChange={(e) => setInspectedTrailer(e.target.value)} />
              <TextInput label="Report details description" required placeholder="e.g. Door latch seal ripped" value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} />
              <SelectInput label="Issue Severity" value={issueSeverity} onChange={(e) => setIssueSeverity(e.target.value)} options={[
                { value: 'High', label: 'High (Immediate Ground)' },
                { value: 'Medium', label: 'Medium (Requires repair)' },
                { value: 'Low', label: 'Low (Warning log)' }
              ]} />
              {/* Checklist */}
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[9px] mb-2">Inspection Checklist</label>
                <div className="space-y-2">
                  {Object.entries(inspectionChecklist).map(([key, checked]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={checked} onChange={() => setInspectionChecklist(prev => ({...prev, [key]: !prev[key]}))} className="w-4 h-4 accent-yellow-400" />
                      <span className="text-xs text-slate-300 capitalize group-hover:text-white transition-colors">{key.charAt(0).toUpperCase() + key.slice(1)} checked</span>
                    </label>
                  ))}
                </div>
              </div>
              <FileUploader label="Upload Inspections photo evidence" onUploadSuccess={() => triggerToast('Photo evidence uploaded.')} />
              <div className="flex gap-2 pt-2 border-t border-[#23324C]/40">
                <Button type="button" variant="warning" className="flex-1" onClick={handleReportMissingItem}>Report Missing Item</Button>
                <Button type="submit" variant="primary" className="flex-1">Submit Inspection</Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Active Safety Issues Index</h3>
            <div className="divide-y divide-[#23324C]/40">
              {reports.map(rep => (
                <div key={rep.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-4">
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rep.type === 'Damage' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{rep.type}</span>
                      <strong className="text-white">Trailer: {rep.trailer}</strong>
                    </div>
                    <p className="text-slate-400">{rep.details}</p>
                    <span className="text-[9px] text-slate-500 font-semibold font-mono block">Logged date: {rep.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border ${rep.severity === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'}`}>{rep.severity} Severity</span>
                    <Button size="sm" variant="outline" onClick={() => setInspectionModal(rep)}>Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Start/Finish Work Tab ────────────────────────────────────────── */}
      {activeTab === 'start-finish' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6 max-w-md mx-auto">
          <div className="text-center space-y-2">
            <Clock className="h-12 w-12 text-brand-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-extrabold text-white">Attendant Time Clock</h3>
            <p className="text-xs text-slate-400">Clock in/out to log operational hours, feed payroll data, and calculate costing.</p>
          </div>
          <div className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl text-center space-y-3">
            {shiftState.isWorking ? (
              <>
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">Active Shift In Progress</span>
                <strong className="text-2xl font-black text-white font-mono block">
                  {Math.floor(shiftState.totalSeconds / 3600).toString().padStart(2, '0')}:
                  {Math.floor((shiftState.totalSeconds % 3600) / 60).toString().padStart(2, '0')}:
                  {(shiftState.totalSeconds % 60).toString().padStart(2, '0')}
                </strong>
                <span className="text-[10px] text-slate-500 block">Started at: {shiftState.startTime}</span>
                <Button variant="danger" className="w-full mt-2 font-black" onClick={handleFinishWork}>Finish Work</Button>
              </>
            ) : (
              <>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Not Clocked In</span>
                <strong className="text-xl font-bold text-slate-400 block py-1">Shift Off-Duty</strong>
                <Button variant="primary" className="w-full mt-2 font-black" onClick={handleStartWork}>Start Work</Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Scan Button Tab ──────────────────────────────────────────────── */}
      {activeTab === 'scan-btn' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-white">Barcode & Asset Scanner</h3>
            <p className="text-xs text-slate-400 mt-1">Select code type and scan physical items in the yard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Scan Item', desc: 'Scan general freight pallets, boxes, or auxiliary assets.', type: 'Trailer' },
              { label: 'Scan VIN', desc: 'Scan vehicle windshield barcode tags to resolve VIN stock numbers.', type: 'Vehicle' },
              { label: 'Scan Barcode', desc: 'Scan standard cargo labels, supplier shipping tags, or BOLs.', type: 'Container' },
            ].map(({ label, desc, type }) => (
              <div key={label} className="p-5 bg-[#111827]/40 border border-[#23324C] rounded-2xl flex flex-col items-center text-center space-y-4">
                <strong className="text-xs text-slate-200 block">{label}</strong>
                <p className="text-[11px] text-slate-400 flex-1">{desc}</p>
                <Button variant="primary" icon={QrCode} className="w-full" onClick={() => { setScanType(type); setQrScanModal(true); }}>
                  {label}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Scan In Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'scan-in' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-white">Scan Inward Custody</h3>
            <p className="text-xs text-slate-400 mt-1">Confirm inward receipt of containers, cars, or pallets into yard locations.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleInventoryScanIn} className="lg:col-span-5 p-5 bg-[#111827]/60 border border-[#23324C] rounded-2xl space-y-4">
              <TextInput label="Scan Container / Asset ID" placeholder="e.g. CTR-4402" value={scanInAsset} onChange={(e) => setScanInAsset(e.target.value)} required />
              <TextInput label="Assign Location Spot" placeholder="e.g. A3" value={scanInLocation} onChange={(e) => setScanInLocation(e.target.value)} required />
              <div className="flex gap-2">
                <Button type="button" variant="outline" icon={QrCode} onClick={() => { setScanType('Container'); setQrScanModal(true); }}>Scan QR</Button>
                <Button type="submit" variant="primary" className="flex-grow">Scan In</Button>
              </div>
            </form>
            <div className="lg:col-span-7 p-4 bg-[#111827]/20 border border-[#23324C] rounded-2xl text-xs space-y-2">
              <strong className="text-white block">Active Yard Inward Manifest</strong>
              <p className="text-slate-400">Review items waiting for spot check-in validation.</p>
              <DataTable columns={[
                { key: 'item', label: 'Item ID', render: (row) => <span className="font-mono font-bold text-white">{row.item}</span> },
                { key: 'desc', label: 'Description', render: (row) => <span>{row.desc}</span> },
                { key: 'status', label: 'Status', render: (row) => <span className={row.status === 'Completed' ? 'text-brand-400 font-bold' : 'text-yellow-400 font-bold'}>{row.status}</span> }
              ]} data={inwardManifest} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Scan Out Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'scan-out' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-white">Scan Outward Gate</h3>
            <p className="text-xs text-slate-400 mt-1">Scan containers, cars, or pallets outbound to driver transport trailers.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleInventoryScanOut} className="lg:col-span-5 p-5 bg-[#111827]/60 border border-[#23324C] rounded-2xl space-y-4">
              <TextInput label="Scan Container / Asset ID" placeholder="e.g. CTR-009" value={scanOutAsset} onChange={(e) => setScanOutAsset(e.target.value)} required />
              <TextInput label="Release Gate / Dock ID" placeholder="e.g. Gate 4" value={scanOutGate} onChange={(e) => setScanOutGate(e.target.value)} required />
              <div className="flex gap-2">
                <Button type="button" variant="outline" icon={QrCode} onClick={() => { setScanType('Container'); setQrScanModal(true); }}>Scan QR</Button>
                <Button type="submit" variant="primary" className="flex-grow">Scan Out</Button>
              </div>
            </form>
            <div className="lg:col-span-7 p-4 bg-[#111827]/20 border border-[#23324C] rounded-2xl text-xs space-y-2">
              <strong className="text-white block">Outbound Loading Queue</strong>
              <DataTable columns={[
                { key: 'item', label: 'Item ID', render: (row) => <span className="font-mono font-bold text-white">{row.item}</span> },
                { key: 'desc', label: 'Description', render: (row) => <span>{row.desc}</span> },
                { key: 'status', label: 'Status', render: (row) => <span className="text-brand-400 font-bold">{row.status}</span> }
              ]} data={outboundQueue} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Lane Assignment Tab ──────────────────────────────────────────── */}
      {activeTab === 'lane-assignment' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">Load Lane & Spotting Assignment</h3>
              <p className="text-xs text-slate-400 mt-1">Spot container trailers to load lanes, upload photo proof, and confirm loading operations.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => {
                if (!laneTrailerId) return triggerToast('Specify Trailer ID first.', 'error');
                setYardSpots(yardSpots.map(s => s.id === 'A4' ? { ...s, occupied: true, asset: laneTrailerId, type: 'trailer', color: 'purple' } : s));
                triggerToast(`Trailer ${laneTrailerId} moved to spot A4.`);
              }}>Move to Location</Button>
              <Button size="sm" variant="primary" onClick={() => {
                if (!laneTrailerId) return triggerToast('Specify Trailer ID first.', 'error');
                triggerToast(`Trailer ${laneTrailerId} relocated to load lane Gate 4.`);
              }}>Move to Load Lane</Button>
              <Button size="sm" variant="secondary" onClick={() => {
                if (!laneTrailerId) return triggerToast('Trailer ID is required to add note.', 'error');
                triggerToast('Time card note added.');
              }}>Add Note</Button>
              <Button size="sm" variant="outline" icon={MapPin} onClick={() => setYardMapModal(true)}>View Yard Map</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleLaneAssignmentSubmit} className="lg:col-span-5 p-5 bg-[#111827]/60 border border-[#23324C] rounded-2xl space-y-4">
              <strong className="text-xs text-slate-200 block">Verify Load Status</strong>
              <TextInput label="Trailer Container ID" placeholder="e.g. TR-9410" value={laneTrailerId} onChange={(e) => setLaneTrailerId(e.target.value)} required />
              <FileUploader label="Upload Spot Photo Proof" onUploadSuccess={() => triggerToast('Spot photo uploaded successfully.')} />
              <div className="flex gap-2">
                <Button type="button" variant="primary" className="flex-1" onClick={() => {
                  if (!laneTrailerId) return triggerToast('Specify Trailer ID.', 'error');
                  triggerToast(`Trailer ${laneTrailerId} confirmed LOADED.`);
                }}>Confirm Loaded</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  if (!laneTrailerId) return triggerToast('Specify Trailer ID.', 'error');
                  triggerToast(`Trailer ${laneTrailerId} confirmed UNLOADED.`);
                }}>Confirm Unloaded</Button>
              </div>
            </form>
            <div className="lg:col-span-7 p-4 bg-[#111827]/20 border border-[#23324C] rounded-2xl text-xs space-y-2">
              <strong className="text-white block font-bold">Yard Attendant Tasks List</strong>
              <DataTable columns={[
                { key: 'title', label: 'Task Description', render: (row) => <span className="font-semibold text-white">{row.title}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={tasks.filter(t => t.status !== 'Completed')} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── Shift Summary Modal ──────────────────────────────────────────── */}
      {shiftSummaryOpen && shiftSummary && (
        <Modal isOpen={shiftSummaryOpen} onClose={() => setShiftSummaryOpen(false)} title="Work Shift Summary">
          <div className="space-y-4 text-left">
            <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-brand-500/20">
                <span className="text-xs text-brand-400 font-extrabold uppercase tracking-wider">{shiftSummary.role}</span>
                <span className="text-xs text-slate-400 font-mono font-bold">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 uppercase font-black text-[9px] mb-0.5">Start Time</p>
                  <p className="text-white font-bold">{shiftSummary.startTime}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-black text-[9px] mb-0.5">End Time</p>
                  <p className="text-white font-bold">{shiftSummary.endTime}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-black text-[9px] mb-0.5">Total Duration</p>
                  <p className="text-emerald-400 font-extrabold">{shiftSummary.duration} minutes</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-black text-[9px] mb-0.5">Estimated Pay</p>
                  <p className="text-brand-400 font-extrabold">${shiftSummary.wages}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setShiftSummaryOpen(false)}>Done</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Shift Schedule Modal ─────────────────────────────────────────── */}
      <Modal isOpen={shiftModalOpen} onClose={() => setShiftModalOpen(false)} title="Shift Schedule">
        <div className="space-y-5">
          <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
            <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-3">Today's Shift — Jun 27, 2026</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Supervisor', value: 'Michael Torres' },
                { label: 'Assigned Gate', value: 'Gate 3 & Gate 4' },
                { label: 'Inspection Zone', value: 'Zone B — Rear Yard' },
                { label: 'Break Time', value: '13:30 – 14:00' },
                { label: 'Shift Start', value: '06:00 AM' },
                { label: 'Shift End', value: '02:00 PM' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#111827]/60 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">{label}</p>
                  <p className="text-white font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Upcoming Shifts</p>
            <div className="space-y-2">
              {[
                { date: 'Jun 28, 2026', shift: '06:00 AM – 02:00 PM', gate: 'Gate 1 & Gate 2', zone: 'Zone A' },
                { date: 'Jun 29, 2026', shift: '02:00 PM – 10:00 PM', gate: 'Gate 3', zone: 'Zone C' },
                { date: 'Jun 30, 2026', shift: 'Rest Day', gate: '—', zone: '—' },
              ].map(({ date, shift, gate, zone }) => (
                <div key={date} className="flex items-center justify-between p-3 bg-[#111827]/40 border border-[#23324C]/40 rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-white">{date}</p>
                    <p className="text-slate-400">{shift}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 font-semibold">{gate}</p>
                    <p className="text-slate-500 text-[10px]">{zone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setShiftModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* ─── Update Status Modal ───────────────────────────────────────────── */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update My Status">
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
          <SelectInput label="Status" value={currentStatus} onChange={e => setCurrentStatus(e.target.value)} options={[
            { value: 'Available', label: '🟢 Available' },
            { value: 'Busy', label: '🟡 Busy' },
            { value: 'On Inspection', label: '🔵 On Inspection' },
            { value: 'On Break', label: '🟠 On Break' },
            { value: 'Off Duty', label: '⚫ Off Duty' },
          ]} />
          <TextInput label="Notes (Optional)" placeholder="e.g. Inspecting trailer near Gate 4..." value={statusNote} onChange={e => setStatusNote(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
            <Button type="button" variant="secondary" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Update Status</Button>
          </div>
        </form>
      </Modal>

      {/* ─── View My Tasks Modal ───────────────────────────────────────────── */}
      <Modal isOpen={tasksModalOpen} onClose={() => setTasksModalOpen(false)} title="My Task List">
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Pending', count: tasks.filter(t => t.status === 'Pending').length, color: 'text-yellow-400' },
              { label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, color: 'text-blue-400' },
              { label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, color: 'text-emerald-400' },
              { label: 'High Priority', count: tasks.filter(t => t.priority === 'High').length, color: 'text-red-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="p-2 bg-[#111827]/60 rounded-xl border border-[#23324C]/40">
                <p className={`text-lg font-black ${color}`}>{count}</p>
                <p className="text-[9px] text-slate-500 font-bold">{label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {tasks.map(task => (
              <div key={task.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/40 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-xs">{task.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${task.priority === 'High' ? 'text-red-400 border-red-500/30 bg-red-500/5' : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'}`}>{task.priority}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5">{task.desc}</p>
                    <div className="flex gap-3 mt-1 text-[9px] text-slate-500 font-mono">
                      <span>⏰ {task.dueTime}</span>
                      <span>🚪 {task.gate}</span>
                      <span>🚛 {task.trailer}</span>
                    </div>
                    {task.notes && <p className="text-[10px] text-slate-400 mt-1 italic">📝 {task.notes}</p>}
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#23324C]/30">
                  {task.status === 'Pending' && <Button size="sm" variant="secondary" onClick={() => handleStartTask(task.id)}>Start Task</Button>}
                  {task.status === 'In Progress' && (
                    <>
                      <Button size="sm" variant="primary" icon={Check} onClick={() => handleCompleteTask(task.id)}>Complete Task</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleConfirmLoaded(task.id)}>Confirm Loaded</Button>
                      <Button size="sm" variant="outline" onClick={() => handleConfirmUnloaded(task.id)}>Confirm Unloaded</Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setTaskDetailModal(task); setTasksModalOpen(false); }}>View Details</Button>
                  <Button size="sm" variant="outline" onClick={() => { setTaskNotesModal(task); setLaneNotes(task.notes || ''); setTasksModalOpen(false); }}>Add Notes</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2 border-t border-[#23324C]/40">
            <Button variant="secondary" onClick={() => setTasksModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* ─── Task Detail Modal ─────────────────────────────────────────────── */}
      {taskDetailModal && (
        <Modal isOpen={!!taskDetailModal} onClose={() => setTaskDetailModal(null)} title="Task Details">
          <div className="space-y-4 text-left">
            <div className="p-4 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl space-y-3">
              <p className="font-bold text-white">{taskDetailModal.title}</p>
              <p className="text-slate-300 text-sm">{taskDetailModal.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Status', value: taskDetailModal.status },
                  { label: 'Priority', value: taskDetailModal.priority },
                  { label: 'Due Time', value: taskDetailModal.dueTime },
                  { label: 'Assigned Gate', value: taskDetailModal.gate },
                  { label: 'Assigned Trailer', value: taskDetailModal.trailer },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#0B0F19] rounded-lg p-2">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{label}</p>
                    <p className="text-white font-bold">{value}</p>
                  </div>
                ))}
              </div>
              {taskDetailModal.notes && (
                <div className="p-2 bg-brand-500/5 border border-brand-500/20 rounded-lg">
                  <p className="text-[9px] text-brand-400 font-bold uppercase mb-1">Notes</p>
                  <p className="text-slate-300 text-xs">{taskDetailModal.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#23324C]/40">
              {taskDetailModal.status === 'Pending' && <Button variant="secondary" onClick={() => { handleStartTask(taskDetailModal.id); setTaskDetailModal(null); }}>Start Task</Button>}
              {taskDetailModal.status === 'In Progress' && <Button variant="primary" onClick={() => { handleCompleteTask(taskDetailModal.id); setTaskDetailModal(null); }}>Complete Task</Button>}
              <Button variant="secondary" onClick={() => setTaskDetailModal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Add Task Notes Modal ──────────────────────────────────────────── */}
      {taskNotesModal && (
        <Modal isOpen={!!taskNotesModal} onClose={() => setTaskNotesModal(null)} title={`Add Notes — ${taskNotesModal.title}`}>
          <div className="space-y-4 text-left">
            <TextInput label="Notes" placeholder="Enter notes about this task..." value={laneNotes} onChange={e => setLaneNotes(e.target.value)} required />
            <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
              <Button variant="secondary" onClick={() => setTaskNotesModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveNote}>Save Notes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Inspection Detail Modal ───────────────────────────────────────── */}
      {inspectionModal && (
        <Modal isOpen={!!inspectionModal} onClose={() => setInspectionModal(null)} title={`Inspection Report — ${inspectionModal.trailer}`}>
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Report Type', value: inspectionModal.type },
                { label: 'Severity', value: inspectionModal.severity },
                { label: 'Date Logged', value: inspectionModal.date },
                { label: 'Trailer ID', value: inspectionModal.trailer },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{label}</p>
                  <p className="text-white font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#111827]/60 border border-[#23324C]/40 rounded-xl">
              <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Details</p>
              <p className="text-slate-300 text-sm">{inspectionModal.details}</p>
            </div>
            <div className="space-y-2">
              <FileUploader label="Upload Additional Photos" onUploadSuccess={() => triggerToast('Photo uploaded to report.')} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
              <Button variant="secondary" onClick={() => setInspectionModal(null)}>Close</Button>
              <Button variant="primary" onClick={() => { triggerToast('Report resolved and archived.'); setInspectionModal(null); }}>Resolve Report</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── QR / Barcode Scan Modal ───────────────────────────────────────── */}
      <Modal isOpen={qrScanModal} onClose={() => { setQrScanModal(false); setScanResult(null); setScanInput(''); }} title="QR / Barcode Scanner">
        <div className="space-y-4 text-left">
          <SelectInput label="Scan Type" value={scanType} onChange={e => setScanType(e.target.value)} options={[
            { value: 'Trailer', label: 'Trailer' },
            { value: 'Container', label: 'Container' },
            { value: 'Vehicle', label: 'Vehicle' },
          ]} />
          {/* Simulated Camera View */}
          <div className="w-full h-36 bg-[#0B0F19] border-2 border-dashed border-brand-500/40 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <QrCode className="h-10 w-10 text-slate-700 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-slate-500">Camera viewfinder (simulated)</p>
            </div>
          </div>
          <form onSubmit={handleQrScanSubmit} className="flex gap-2">
            <TextInput label="" placeholder={`Enter ${scanType} ID (e.g. TR-9410, CTR-009, VIN-882)...`} value={scanInput} onChange={e => setScanInput(e.target.value)} required />
            <div className="pt-0.5">
              <Button type="submit" variant="primary" icon={QrCode}>Scan</Button>
            </div>
          </form>
          {scanResult && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✅ Scan Successful</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div><p className="text-slate-500">Asset ID</p><p className="text-white font-bold">{scanResult.id}</p></div>
                <div><p className="text-slate-500">Type</p><p className="text-white font-bold">{scanResult.type}</p></div>
                <div><p className="text-slate-500">Location</p><p className="text-white font-bold">{scanResult.location}</p></div>
                <div><p className="text-slate-500">Status</p><p className="text-emerald-400 font-bold">{scanResult.status}</p></div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#23324C]/40">
            <Button variant="secondary" onClick={() => { setQrScanModal(false); setScanResult(null); setScanInput(''); }}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* ─── Incident Report Modal ─────────────────────────────────────────── */}
      <Modal isOpen={incidentModal} onClose={() => setIncidentModal(false)} title="🚨 Report Incident">
        <form onSubmit={handleSubmitIncident} className="space-y-4 text-left">
          <SelectInput label="Incident Type *" value={incident.type} onChange={e => setIncident({...incident, type: e.target.value})} options={[
            { value: 'Accident', label: '🚗 Accident' },
            { value: 'Damage', label: '💥 Damage' },
            { value: 'Unsafe Condition', label: '⚠️ Unsafe Condition' },
            { value: 'Spill', label: '🛢️ Spill' },
          ]} />
          <TextInput label="Location / Area *" required placeholder="e.g. Dock B2, near Gate 3" value={incident.location} onChange={e => setIncident({...incident, location: e.target.value})} />
          <TextInput label="Description *" required placeholder="Describe what happened..." value={incident.desc} onChange={e => setIncident({...incident, desc: e.target.value})} />
          <SelectInput label="Severity" value={incident.severity} onChange={e => setIncident({...incident, severity: e.target.value})} options={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High — Supervisor Required' },
            { value: 'Critical', label: '🚨 Critical — Emergency' },
          ]} />
          <FileUploader label="Upload Photos (Optional)" onUploadSuccess={() => triggerToast('Photo attached to incident.')} />
          <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
            <Button type="button" variant="secondary" onClick={() => setIncidentModal(false)}>Cancel</Button>
            <Button type="submit" variant="danger">Submit Report</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Contact Supervisor Modal ──────────────────────────────────────── */}
      <Modal isOpen={supervisorModalOpen} onClose={() => setSupervisorModalOpen(false)} title="Contact Shift Supervisor">
        <form onSubmit={handleContactSupervisorSubmit} className="space-y-4 text-left">
          <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
              <User className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Michael Torres</p>
              <p className="text-[10px] text-slate-500">Shift Yard Supervisor (Active)</p>
            </div>
          </div>
          <TextInput label="Message *" required placeholder="Type your message for the supervisor..." value={supervisorMessage} onChange={e => setSupervisorMessage(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
            <Button type="button" variant="secondary" onClick={() => setSupervisorModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Send Message</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Notifications Modal ───────────────────────────────────────────── */}
      <Modal isOpen={notifModal} onClose={() => setNotifModal(false)} title="Notifications">
        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{unreadCount} unread</span>
            <Button size="sm" variant="outline" onClick={markAllNotifRead}>Mark all read</Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${n.read ? 'bg-[#111827]/20 border-[#23324C]/30' : n.type === 'emergency' ? 'bg-red-500/10 border-red-500/20' : 'bg-brand-500/5 border-brand-500/20'}`} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                <div className="flex justify-between items-start mb-1">
                  <p className={`font-bold ${n.type === 'emergency' ? 'text-red-400' : n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                  <span className="text-[9px] text-slate-500 ml-2 flex-shrink-0">{n.time}</span>
                </div>
                <p className="text-slate-400">{n.msg}</p>
                {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1"></div>}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2 border-t border-[#23324C]/40">
            <Button variant="secondary" onClick={() => setNotifModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* ─── Yard Map Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={yardMapModal} onClose={() => setYardMapModal(false)} title="Yard Map — Parking Grid">
        <div className="space-y-4 text-left">
          <div className="flex flex-wrap gap-3 text-[10px]">
            {[
              { color: 'bg-brand-500', label: 'Trailer' },
              { color: 'bg-blue-500', label: 'Trailer (busy)' },
              { color: 'bg-emerald-500', label: 'Container' },
              { color: 'bg-yellow-500', label: 'Vehicle' },
              { color: 'bg-slate-700', label: 'Available' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded ${color}`}></span>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {yardSpots.map(spot => {
              const colorMap = { brand: 'bg-brand-500/20 border-brand-500/30 text-brand-400', blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400', emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400', purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400', red: 'bg-red-500/20 border-red-500/30 text-red-400', orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400' };
              const cls = spot.occupied ? (colorMap[spot.color] || 'bg-slate-700/40 border-slate-600/40 text-slate-400') : 'bg-[#111827]/40 border-[#23324C]/40 text-slate-600';
              return (
                <div key={spot.id} className={`p-2 rounded-lg border text-center cursor-pointer hover:opacity-80 transition-opacity ${cls}`} onClick={() => {
                  if (spot.occupied) {
                    triggerToast(`Spot ${spot.id} is occupied by ${spot.asset}.`);
                  } else {
                    triggerToast(`Spot ${spot.id} is empty.`);
                  }
                }}>
                  <p className="text-[9px] font-black">{spot.id}</p>
                  <p className="text-[8px] mt-0.5 truncate">{spot.asset || 'Free'}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#23324C]/40">
            <div className="p-2 bg-[#111827]/60 rounded-lg"><p className="font-black text-white">{yardSpots.filter(s => s.occupied).length}</p><p className="text-slate-500 text-[9px]">Occupied</p></div>
            <div className="p-2 bg-[#111827]/60 rounded-lg"><p className="font-black text-emerald-400">{yardSpots.filter(s => !s.occupied).length}</p><p className="text-slate-500 text-[9px]">Available</p></div>
            <div className="p-2 bg-[#111827]/60 rounded-lg"><p className="font-black text-slate-200">{yardSpots.length}</p><p className="text-slate-500 text-[9px]">Total Bays</p></div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setYardMapModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
