import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads, updateLoadStatus } from '../../store/slices/loadsSlice';
import { fetchVehicles, updateVehicle } from '../../store/slices/vehiclesSlice';
import { fetchCustomerInstructions } from '../../store/slices/customersSlice';
import { useLogistics } from '../../context/LogisticsContext';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import Toast from '../common/Toast';
import FileUploader from '../common/FileUploader';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import MiniChart from '../common/MiniChart';
import { 
  Navigation, FileText, CheckCircle, Compass, MapPin, Award, 
  DollarSign, ShieldAlert, Plus, Upload, Heart, Lock, Phone, MessageSquare, Mic, PenTool, Check, Truck, X, Clock,
  Bell, Calendar, AlertTriangle
} from 'lucide-react';
import Modal from '../common/Modal';

export default function DriverDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { items: loads } = useSelector((state) => state.loads);
  const { user } = useSelector((state) => state.auth);
  const { fleet } = useSelector((state) => state.vehicles);
  const { customerInstructions } = useSelector((state) => state.customers);
  const { permissions, aiQueue, resolveAiItem } = useLogistics();

  // Guided Workflow Step (1 to 17)
  const [workflowStep, setWorkflowStep] = useState(1);
  const [shiftStarted, setShiftStarted] = useState(false);
  const [truckConfirmed, setTruckConfirmed] = useState(false);
  const [trailerConfirmed, setTrailerConfirmed] = useState(false);
  
  // Compliance & Odometer states
  const [odometerReading, setOdometerReading] = useState('124,500');
  const [odometerPhotoUrl, setOdometerPhotoUrl] = useState('');
  const [complianceChecks, setComplianceChecks] = useState({
    brakeInspection: true,
    tirePressure: true,
    loadStrapsSecured: false,
    hazardKitVerified: true
  });
  
  // Job execution states
  const [jobAccepted, setJobAccepted] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [stopArrived, setStopArrived] = useState(false);
  const [pickupStarted, setPickupStarted] = useState(false);
  const [scannedItems, setScannedItems] = useState({});
  const [stopPhotoUploaded, setStopPhotoUploaded] = useState(false);
  const [damageMarked, setDamageMarked] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [damagePhoto, setDamagePhoto] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [stopCompleted, setStopCompleted] = useState(false);
  const [deliveryStarted, setDeliveryStarted] = useState(false);

  // Expense states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Fuel');
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState('');
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Fuel', amount: '$320.00', status: 'Approved', date: '06/18/2026' },
    { id: 2, category: 'Tolls', amount: '$42.50', status: 'Pending', date: '06/19/2026' }
  ]);

  // Draft load states
  const [draftCustomer, setDraftCustomer] = useState('');
  const [draftRoute, setDraftRoute] = useState('');

  // Floating Action Button State
  const [fabOpen, setFabOpen] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // SOS State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosType, setSosType] = useState('');
  const [shareGps, setShareGps] = useState(true);
  const [notifyDispatcherState, setNotifyDispatcherState] = useState(true);

  // Offline Mode States
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncList, setPendingSyncList] = useState([]);

  // Stateful Chat Messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'dispatcher', text: 'John, please confirm trailer change at Chicago Gate 4. LD-9411 is scheduled for immediate departure.', time: '10:30 AM', status: 'read' },
    { id: 2, sender: 'driver', text: 'Copy that, logs updated and trailer verified. Rolling out now.', time: '10:32 AM', status: 'read' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Notifications Page States
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'New Load Assigned', body: 'LD-9411: Chicago HQ Terminal ➔ Dallas Depot Terminal', time: '1 hour ago', read: false },
    { id: 2, title: 'Route Updated detour', body: 'Traffic alert: Detour on I-35 Southbound due to construction.', time: '3 hours ago', read: false },
    { id: 3, title: 'Compliance Reminder', body: 'Submit your signed DOT monthly logs before Friday.', time: '1 day ago', read: false },
    { id: 4, title: 'Expense Approved', body: 'Your diesel fuel receipt ($320.00) has been approved.', time: '2 days ago', read: true }
  ]);

  // Documents States
  const [driverDocuments, setDriverDocuments] = useState([
    { id: 1, name: 'Commercial Driver License (CDL)', status: 'Valid', expiry: '12/15/2028', type: 'CDL' },
    { id: 2, name: 'DOT Medical Certificate', status: 'Valid', expiry: '09/01/2027', type: 'Medical' },
    { id: 3, name: 'Hazmat Training Endorsement', status: 'Expiring Soon', expiry: '07/15/2026', type: 'Training' }
  ]);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('CDL');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  // Leave Management States
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, type: 'Annual Leave', start: '07/04/2026', end: '07/06/2026', status: 'Approved', reason: 'Family vacation' },
    { id: 2, type: 'Sick Leave', start: '06/05/2026', end: '06/06/2026', status: 'Approved', reason: 'Dental appointment' }
  ]);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Incidents Reporting States
  const [incidentsList, setIncidentsList] = useState([
    { id: 1, type: 'Cargo Damage', date: '06/12/2026', status: 'Under Review', desc: 'Slight tear in flatbed protective tarps.' }
  ]);
  const [incidentType, setIncidentType] = useState('Accident');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentPhoto, setIncidentPhoto] = useState('');

  // Maintenance States
  const [maintenanceList, setMaintenanceList] = useState([
    { id: 1, issue: 'Slight brake squeal on front axles.', severity: 'Minor', date: '06/20/2026', status: 'Scheduled' }
  ]);
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceSeverity, setMaintenanceSeverity] = useState('Minor');
  const [maintenancePhoto, setMaintenancePhoto] = useState('');

  // --- START SHIFT STATES ---
  const [startShiftActive, setStartShiftActive] = useState(false);
  const [startVehicle, setStartVehicle] = useState('TX-ROAD88');
  const [startTrailer, setStartTrailer] = useState('TR-4022');
  const [dvirPreTripChecked, setDvirPreTripChecked] = useState(false);
  const [startOdometer, setStartOdometer] = useState('124500');
  const [startFuelLevel, setStartFuelLevel] = useState('85');
  const [eldConfirmed, setEldConfirmed] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(false);

  // --- ACTIVE SHIFT STATES ---
  const [dutyStatus, setDutyStatus] = useState('Off Duty');
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState(0); // in seconds
  const [remainingDrivingHours, setRemainingDrivingHours] = useState(11.0);
  const [remainingOnDutyHours, setRemainingOnDutyHours] = useState(14.0);
  const [remainingCycleHours, setRemainingCycleHours] = useState(70.0);
  const [breakTimer, setBreakTimer] = useState(8.0 * 3600); // 8 hours in seconds
  const [onBreak, setOnBreak] = useState(false);

  // --- ROUTE PROGRESS ---
  const [routeStep, setRouteStep] = useState('Idle');
  const [podUploaded, setPodUploaded] = useState(false);
  const [podFileAttached, setPodFileAttached] = useState('');

  // --- FINISH SHIFT STATES ---
  const [finishShiftModalOpen, setFinishShiftModalOpen] = useState(false);
  const [finishOdometer, setFinishOdometer] = useState('124750');
  const [finishFuel, setFinishFuel] = useState('45');
  const [dvirPostTripChecked, setDvirPostTripChecked] = useState(false);
  const [finishDefects, setFinishDefects] = useState('');

  // Audit Logs inside DriverDashboard
  const [driverAuditLogs, setDriverAuditLogs] = useState([
    { id: 1, action: 'Duty Status Change', detail: 'Status set to Off Duty on login.', time: new Date().toLocaleTimeString() }
  ]);

  const addDriverAuditLog = (action, detail) => {
    setDriverAuditLogs(prev => [
      { id: Date.now(), action, detail, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  useEffect(() => {
    let interval = null;
    if (startShiftActive && !onBreak) {
      interval = setInterval(() => {
        setShiftDuration(prev => prev + 1);
        if (dutyStatus === 'Driving') {
          setRemainingDrivingHours(prev => Math.max(0, parseFloat((prev - 1/3600).toFixed(4))));
        }
        if (dutyStatus === 'On Duty' || dutyStatus === 'Driving') {
          setRemainingOnDutyHours(prev => Math.max(0, parseFloat((prev - 1/3600).toFixed(4))));
          setRemainingCycleHours(prev => Math.max(0, parseFloat((prev - 1/3600).toFixed(4))));
          setBreakTimer(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startShiftActive, dutyStatus, onBreak]);

  const queueOrSync = (actionObject) => {
    if (isOffline) {
      setPendingSyncList(prev => [...prev, actionObject]);
      triggerToast('Offline mode active. Operation queued for sync.', 'warning');
    } else {
      actionObject.execute();
      triggerToast(actionObject.successMsg);
    }
  };

  const handleManualSync = () => {
    if (isOffline) {
      triggerToast('Cannot sync while offline. Please connect first.', 'error');
      return;
    }
    triggerToast('Synchronizing offline logs with fleet center...', 'info');
    setTimeout(() => {
      pendingSyncList.forEach(item => {
        item.execute();
      });
      setPendingSyncList([]);
      triggerToast('Synchronization complete! All logs uploaded.', 'success');
    }, 1000);
  };

  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'driver',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    };
    
    setChatMessages(prev => [...prev, newMsg]);
    const typedMsg = chatInput;
    setChatInput('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'dispatcher',
        text: `Roger that John, dispatcher copied: "${typedMsg}". Operations monitoring.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }]);
      triggerToast('New dispatcher message received.');
    }, 2000);
  };

  const handleShareImageInChat = () => {
    triggerToast('Simulating image capture/attachment upload...');
    setTimeout(() => {
      const newMsg = {
        id: Date.now(),
        sender: 'driver',
        text: 'Cargo Loading Status Image Attached 📷',
        imageUrl: 'https://hero-mock-storage.s3.amazonaws.com/cargo_loading.jpg',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setChatMessages(prev => [...prev, newMsg]);
      triggerToast('Image sent to dispatcher.');
    }, 1000);
  };

  const handleShareVoiceInChat = () => {
    triggerToast('Simulating voice note recording (0:12)...');
    setTimeout(() => {
      const newMsg = {
        id: Date.now(),
        sender: 'driver',
        text: 'Voice Note (0:12) 🎤 ⏺',
        isVoice: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setChatMessages(prev => [...prev, newMsg]);
      triggerToast('Voice note uploaded to dispatch.');
    }, 1200);
  };

  const handleTriggerSOS = (type) => {
    setSosType(type);
    setSosActive(true);
    setSosModalOpen(false);
    triggerToast(`🚨 EMERGENCY DISPATCH ALERT: ${type} triggered!`, 'error');
  };

  const handleApplyLeave = (e) => {
    if (e) e.preventDefault();
    if (!leaveStart || !leaveEnd) {
      triggerToast('Please select dates.', 'error');
      return;
    }
    const newLeave = {
      id: Date.now(),
      type: leaveType,
      start: leaveStart,
      end: leaveEnd,
      status: 'Pending',
      reason: leaveReason || 'No reason provided'
    };

    queueOrSync({
      type: 'Apply Leave',
      successMsg: 'Leave request submitted successfully.',
      execute: () => {
        setLeaveRequests(prev => [newLeave, ...prev]);
      },
      data: newLeave
    });

    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
  };

  const handleReportIncident = (e) => {
    if (e) e.preventDefault();
    if (!incidentDesc.trim()) {
      triggerToast('Please provide a description.', 'error');
      return;
    }
    const newIncident = {
      id: Date.now(),
      type: incidentType,
      date: new Date().toLocaleDateString(),
      status: 'Pending',
      desc: incidentDesc
    };

    queueOrSync({
      type: 'Incident Report',
      successMsg: 'Incident report filed successfully.',
      execute: () => {
        setIncidentsList(prev => [newIncident, ...prev]);
      },
      data: newIncident
    });

    setIncidentDesc('');
    setIncidentPhoto('');
  };

  const handleReportMaintenance = (e) => {
    if (e) e.preventDefault();
    if (!maintenanceDesc.trim()) {
      triggerToast('Please provide issue details.', 'error');
      return;
    }
    const newReq = {
      id: Date.now(),
      issue: maintenanceDesc,
      severity: maintenanceSeverity,
      date: new Date().toLocaleDateString(),
      status: 'Pending'
    };

    queueOrSync({
      type: 'Maintenance Request',
      successMsg: 'Vehicle maintenance issue logged.',
      execute: () => {
        setMaintenanceList(prev => [newReq, ...prev]);
      },
      data: newReq
    });

    setMaintenanceDesc('');
    setMaintenancePhoto('');
  };

  useEffect(() => {
    dispatch(fetchLoads());
    dispatch(fetchVehicles());
    dispatch(fetchCustomerInstructions());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Find active driver load
  const activeLoad = loads.find(l => l.driver === 'John D.' || l.driver === user?.name) || loads[0] || {
    id: 1,
    loadId: 'LD-9411',
    cargo: 'Automotive Components (Flatbed)',
    route: 'Chicago IL ➔ Dallas TX',
    driver: 'John D.',
    weight: '42,000 lbs',
    status: 'Assigned',
    eta: '3 hours',
    vehicle: 'TX-ROAD88',
    trailer: 'TR-4022',
    items: [
      { id: 'ITM-1', name: 'Automotive Components Gearbox', weight: '22,000 lbs' },
      { id: 'ITM-2', name: 'Chassis Frame Rails', weight: '20,000 lbs' }
    ],
    stops: [
      { id: 'STP-1', address: 'Chicago HQ Terminal', type: 'Pickup', itemIds: ['ITM-1', 'ITM-2'], status: 'Pending', sequence: 1, notes: 'Gate 4 cargo.' },
      { id: 'STP-2', address: 'Dallas Depot Terminal', type: 'Delivery', itemIds: ['ITM-1', 'ITM-2'], status: 'Pending', sequence: 2, notes: 'Offload.' }
    ]
  };

  const stops = activeLoad.stops && activeLoad.stops.length > 0 ? activeLoad.stops : [
    { id: 1, address: activeLoad.pickupAddress || 'Chicago Origin', type: 'Pickup', itemIds: (activeLoad.items || []).map(i => i.id), status: 'Pending', sequence: 1, notes: 'Log origin terminal departure.' },
    { id: 2, address: activeLoad.deliveryAddress || 'Dallas Destination', type: 'Delivery', itemIds: (activeLoad.items || []).map(i => i.id), status: 'Pending', sequence: 2, notes: 'Drop off and verify cargo seals.' }
  ];

  const currentStopIndex = stops.findIndex(s => s.status !== 'Completed');
  const currentStop = currentStopIndex !== -1 ? stops[currentStopIndex] : stops[stops.length - 1];

  // Isolated items for this stop
  const currentStopItems = (activeLoad.items || []).filter(item => (currentStop?.itemIds || []).includes(item.id));

  // Sync activeTab with workflow steps
  useEffect(() => {
    if (activeTab === 'start-finish') {
      setWorkflowStep(shiftStarted ? 17 : 1);
    }
  }, [activeTab]);

  const handleStartWork = () => {
    setShiftStarted(true);
    setWorkflowStep(2);
    triggerToast('Clock-in shift started. Duty logs active.');
  };

  const handleFinishWork = () => {
    setShiftStarted(false);
    setWorkflowStep(1);
    triggerToast('Shift completed. Duty logs closed.');
  };

  const handleComplianceSubmit = () => {
    triggerToast('Pre-trip safety checklist submitted.');
    setWorkflowStep(5);
  };

  const handleAcceptJob = () => {
    setJobAccepted(true);
    dispatch(updateLoadStatus({ id: activeLoad.id, status: 'Accepted' }));
    triggerToast('Load accepted successfully.');
    setWorkflowStep(6);
  };

  const handleNavigate = () => {
    setNavigating(true);
    triggerToast('Google Maps routing initiated. GPS synced.');
    setWorkflowStep(7);
  };

  const handleArrived = () => {
    setStopArrived(true);
    triggerToast(`Arrived at stop: ${currentStop.address}`);
    setWorkflowStep(currentStop.type === 'Pickup' ? 8 : 14);
  };

  const handleStartPickup = () => {
    setPickupStarted(true);
    triggerToast('Loading sequence active.');
    setWorkflowStep(9);
  };

  const handleScanItem = (itemId) => {
    setScannedItems({ ...scannedItems, [itemId]: !scannedItems[itemId] });
    triggerToast('Item barcode scanned successfully.');
  };

  const handleAddPhoto = () => {
    setStopPhotoUploaded(true);
    triggerToast('Verification photo uploaded.');
  };

  const handleMarkDamage = () => {
    setDamageMarked(true);
    setDamageNotes('Dent verified on cargo trailer rails.');
    setDamagePhoto('https://hero-mock-storage.s3.amazonaws.com/damage_proof.jpg');
    triggerToast('Damage exception flagged on shipment item.', 'warning');
  };

  const handleCaptureSignature = () => {
    if (!receiverName.trim()) {
      triggerToast('Receiver name required.', 'error');
      return;
    }
    setSignatureCaptured(true);
    triggerToast('Digital signature captured successfully.');
    setWorkflowStep(13);
  };

  const handleCompleteStop = () => {
    const updatedStops = stops.map(s => s.id === currentStop.id ? { ...s, status: 'Completed' } : s);
    const allCompleted = updatedStops.every(s => s.status === 'Completed');
    
    if (allCompleted) {
      dispatch(updateLoadStatus({
        id: activeLoad.id,
        status: 'Delivered',
        stops: updatedStops
      }));
      triggerToast('All stops completed. Close shipment.');
      setWorkflowStep(16);
    } else {
      dispatch(updateLoadStatus({
        id: activeLoad.id,
        stops: updatedStops
      }));
      // Loop back to navigation step for next stop
      setStopArrived(false);
      setPickupStarted(false);
      setStopPhotoUploaded(false);
      setSignatureCaptured(false);
      setScannedItems({});
      triggerToast(`Stop #${currentStop.sequence} completed.`);
      setWorkflowStep(6);
    }
  };

  const handleAddExpenseSubmit = (e) => {
    if (e) e.preventDefault();
    if (!expenseAmount) return;
    const amountVal = `$${parseFloat(expenseAmount).toFixed(2)}`;
    const newE = {
      id: Date.now(),
      category: expenseCategory,
      amount: amountVal,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };

    queueOrSync({
      type: 'Add Expense',
      successMsg: 'Expense logged successfully.',
      execute: () => {
        setExpenses(prev => [newE, ...prev]);
      },
      data: newE
    });
    setExpenseAmount('');
  };

  const handleCreateDraftLoad = () => {
    if (!draftCustomer || !draftRoute) {
      triggerToast('Shipper and Route are required.', 'error');
      return;
    }
    triggerToast('Draft shipment created.');
  };

  const handleSubmitDraftReview = () => {
    triggerToast('Draft shipment submitted for dispatcher review.');
    setDraftCustomer('');
    setDraftRoute('');
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-left pb-16 relative bg-slate-50 text-slate-700 min-h-screen p-4">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Connectivity Simulator Widget */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs">
        <span className="font-bold text-slate-500 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-brand-500" />
          Connection Status:
        </span>
        <button 
          onClick={() => {
            const next = !isOffline;
            setIsOffline(next);
            triggerToast(next ? 'Offline Mode Active. Operations will queue.' : 'Online Mode Restored. Sync available.', next ? 'warning' : 'success');
          }}
          className={`px-3 py-1 rounded-lg font-black transition-all ${isOffline ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'}`}
        >
          {isOffline ? 'Offline Mode ⛔' : 'Online Mode 🌐'}
        </button>
      </div>

      {/* SOS Blinking Alert Banner */}
      {sosActive && (
        <div className="bg-red-500/20 border border-red-500/45 p-3 rounded-2xl flex justify-between items-center text-xs text-red-400 animate-pulse font-extrabold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 animate-bounce" />
            <span>🚨 SOS ACTIVE: {sosType} Alert dispatched!</span>
          </div>
          <Button size="xs" variant="danger" onClick={() => { setSosActive(false); triggerToast('SOS emergency cleared.', 'success'); }}>Clear</Button>
        </div>
      )}

      {/* Offline Pending Sync Banner */}
      {isOffline && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex justify-between items-center text-xs text-amber-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Offline Active | <strong>{pendingSyncList.length} items queued</strong></span>
          </div>
          {pendingSyncList.length > 0 && (
            <Button size="xs" variant="primary" onClick={() => triggerToast('Please go online to synchronize queued actions.', 'error')}>Sync Now</Button>
          )}
        </div>
      )}
      {!isOffline && pendingSyncList.length > 0 && (
        <div className="bg-slate-50 border border-brand-500/20 p-3 rounded-2xl flex justify-between items-center text-xs text-brand-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-brand-400 animate-bounce" />
            <span>Pending Sync | <strong>{pendingSyncList.length} items to upload</strong></span>
          </div>
          <Button size="xs" variant="success" onClick={handleManualSync}>Sync Now</Button>
        </div>
      )}

      {/* Driver Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Driver Portal • {activeTab.replace('-', ' ')}</h2>
          <p className="text-[10px] text-slate-500">ELD & logistics operations controls.</p>
        </div>
        <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
          <Compass className="h-5 w-5 animate-spin-slow" />
        </div>
      </div>

      {/* START WORK / FINISH WORK SHIFT MANAGER TAB */}
      {activeTab === 'start-finish' && (
        <div className="space-y-5 animate-fade-in text-xs">
          
          {/* Shift state indicator banner */}
          <div className={`p-4 rounded-2xl border text-left flex justify-between items-center ${
            startShiftActive 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-bold block opacity-70">Shift Logging System</span>
              <strong className="text-sm font-black text-slate-900 block mt-1">
                {startShiftActive ? '🟢 Shift Active (On Duty)' : '⚪ Shift Inactive (Off Duty)'}
              </strong>
              {startShiftActive && (
                <span className="text-[10px] font-mono mt-0.5 block">
                  Duration: {Math.floor(shiftDuration / 3600)}h {Math.floor((shiftDuration % 3600) / 60)}m {shiftDuration % 60}s
                </span>
              )}
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <Clock className={`h-5 w-5 ${startShiftActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            </div>
          </div>

          {/* Today's Assigned Loads */}
          <div className="glass rounded-2xl p-4 border border-slate-200 text-left space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Today's Assigned Manifest</h3>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-500">LOAD ID: <span className="text-slate-900 font-mono font-black">{activeLoad.loadId}</span></span>
                <StatusBadge status={activeLoad.status} />
              </div>
              <div className="border-t border-slate-200/50 pt-2">
                <strong className="text-slate-900 text-xs block font-black">{activeLoad.cargo}</strong>
                <p className="text-[10px] text-slate-500 mt-1">Route: {activeLoad.route}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/35 text-[9px] text-slate-500">
                  <div><strong>Customer:</strong> {activeLoad.customerName || 'Apex Logistics'}</div>
                  <div><strong>Trailer:</strong> {activeLoad.trailer}</div>
                  <div><strong>Appt:</strong> 16:00 PM (Priority: High)</div>
                  <div><strong>Status:</strong> {activeLoad.status}</div>
                </div>
              </div>
            </div>
          </div>

          {/* BEFORE START SHIFT: CONFIGURATION SCREEN */}
          {!startShiftActive ? (
            <div className="glass rounded-2xl p-4 border border-slate-200 text-left space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200/50">Start Shift Checklist</h3>
              
              <div className="space-y-3">
                <SelectInput 
                  label="Select Tractor / Power Unit" 
                  value={startVehicle} 
                  onChange={(e) => setStartVehicle(e.target.value)} 
                  options={[
                    { value: 'TX-ROAD88', label: 'TX-ROAD88 (Freightliner Cascadia)' },
                    { value: 'TX-CAB002', label: 'TX-CAB002 (Kenworth T680)' },
                    { value: 'TX-HAUL77', label: 'TX-HAUL77 (Volvo VNL)' }
                  ]}
                />

                <SelectInput 
                  label="Select Trailer Unit" 
                  value={startTrailer} 
                  onChange={(e) => setStartTrailer(e.target.value)} 
                  options={[
                    { value: 'TR-4022', label: 'TR-4022 (Flatbed 48ft)' },
                    { value: 'TR-5088', label: 'TR-5088 (Dry Van 53ft)' },
                    { value: 'TR-6022', label: 'TR-6022 (Reefer 53ft)' }
                  ]}
                />

                <TextInput 
                  label="Initial Odometer Reading (miles)" 
                  type="number"
                  value={startOdometer} 
                  onChange={(e) => setStartOdometer(e.target.value)}
                />

                <TextInput 
                  label="Initial Fuel Level (%)" 
                  type="number"
                  min="0"
                  max="100"
                  value={startFuelLevel} 
                  onChange={(e) => setStartFuelLevel(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                    <span className="font-bold">Verify Pre-Trip DVIR completed</span>
                    <input 
                      type="checkbox" 
                      checked={dvirPreTripChecked} 
                      onChange={(e) => setDvirPreTripChecked(e.target.checked)} 
                      className="rounded text-brand-500 h-4.5 w-4.5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                    <span className="font-bold">Confirm Regulatory ELD connection</span>
                    <input 
                      type="checkbox" 
                      checked={eldConfirmed} 
                      onChange={(e) => setEldConfirmed(e.target.checked)} 
                      className="rounded text-brand-500 h-4.5 w-4.5"
                    />
                  </label>
                </div>

                {/* GPS Verification Action */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Live GPS Telemetry</span>
                    <strong className="text-slate-900 block font-mono text-[10px]">
                      {gpsVerified ? 'Verified ✓ (41.8781° N, 87.6298° W)' : 'Signal Unverified'}
                    </strong>
                  </div>
                  <Button 
                    size="xs" 
                    variant={gpsVerified ? 'success' : 'primary'} 
                    onClick={() => {
                      setGpsVerified(true);
                      triggerToast('GPS coordinates locked. Signal strength: Strong.');
                      addDriverAuditLog('GPS Verify', 'GPS telemetry coordinates successfully locked.');
                    }}
                  >
                    {gpsVerified ? 'Lock Reset' : 'Verify GPS'}
                  </Button>
                </div>

                <Button 
                  variant="success" 
                  className="w-full font-black mt-3 py-3"
                  disabled={!dvirPreTripChecked || !eldConfirmed || !gpsVerified || !startOdometer || !startFuelLevel}
                  onClick={() => {
                    setStartShiftActive(true);
                    setShiftStartTime(new Date().toLocaleTimeString());
                    setDutyStatus('On Duty');
                    addDriverAuditLog('Shift Start', `Shift started using Tractor ${startVehicle} & Trailer ${startTrailer}. Odometer: ${startOdometer} mi.`);
                    triggerToast('Clock-in shift started. Duty logs active.');
                  }}
                >
                  Confirm & Start Work Shift
                </Button>
              </div>
            </div>
          ) : (
            
            /* AFTER START SHIFT: ACTIVE DASHBOARD CONTROLS */
            <div className="space-y-4">
              
              {/* 8-Grid Live Metrics Dashboard */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Current Active Job</span>
                  <strong className="text-slate-900 font-mono text-xs mt-1 block">{activeLoad.loadId}</strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Current Position</span>
                  <strong className="text-slate-900 text-xs mt-1 block truncate">
                    {routeStep === 'Idle' ? 'Origin Depot' : (routeStep.includes('Pickup') ? 'Chicago IL' : 'In Transit (I-55)')}
                  </strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Distance Remaining</span>
                  <strong className="text-slate-900 font-mono text-xs mt-1 block">
                    {routeStep === 'Delivered' ? '0 mi' : (routeStep === 'In Transit' ? '410 mi' : '960 mi')}
                  </strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Calculated ETA</span>
                  <strong className="text-brand-400 font-mono text-xs mt-1 block">
                    {routeStep === 'Delivered' ? 'Completed' : (routeStep === 'Idle' ? 'Pending' : '3.5 Hours')}
                  </strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">ELD Driving Hours left</span>
                  <strong className="text-emerald-400 font-mono text-xs mt-1 block">{remainingDrivingHours} hrs</strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Next Break Required in</span>
                  <strong className="text-amber-400 font-mono text-xs mt-1 block">
                    {Math.floor(breakTimer / 3600)}h {Math.floor((breakTimer % 3600) / 60)}m
                  </strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Tractor Fuel Level</span>
                  <strong className="text-slate-900 font-mono text-xs mt-1 block">{startFuelLevel}%</strong>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Active ELD Status</span>
                  <strong className="text-slate-900 font-bold text-xs mt-1 block flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" />
                    {dutyStatus}
                  </strong>
                </div>
              </div>

              {/* FMCSA Regulatory Duty Status Toggles */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block border-b border-slate-200/45 pb-1.5">FMCSA ELD Duty Status Control</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { statusName: 'Off Duty', color: 'variant="outline"' },
                    { statusName: 'Sleeper Berth', color: 'variant="outline"' },
                    { statusName: 'On Duty', color: 'variant="primary"' },
                    { statusName: 'Driving', color: 'variant="success"' }
                  ].map(s => (
                    <button
                      key={s.statusName}
                      onClick={() => {
                        if (onBreak && s.statusName !== 'Off Duty') {
                          triggerToast('Please resume work shift from break first.', 'error');
                          return;
                        }
                        setDutyStatus(s.statusName);
                        addDriverAuditLog('Duty Status Change', `Duty status changed to: ${s.statusName}`);
                        triggerToast(`Duty status updated to ${s.statusName}`);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                        dutyStatus === s.statusName
                          ? 'bg-brand-500 border-brand-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-50/60 border-slate-200/50 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {s.statusName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Break Management */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Rest Break Coordinator</span>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-900 block font-black">{onBreak ? 'Break in progress...' : 'Active duty shift'}</strong>
                    <span className="text-slate-455 text-[10px] block mt-0.5">ELD rest break policy 30-min reset.</span>
                  </div>
                  {!onBreak ? (
                    <Button 
                      size="sm" 
                      variant="warning" 
                      onClick={() => {
                        setOnBreak(true);
                        setDutyStatus('Off Duty');
                        addDriverAuditLog('Break Started', '30-minute DOT rest break sequence initiated.');
                        triggerToast('Rest break activated. Duty timers suspended.');
                      }}
                    >
                      Start Break
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => {
                        setOnBreak(false);
                        setDutyStatus('On Duty');
                        setBreakTimer(8.0 * 3600);
                        addDriverAuditLog('Break Ended', 'Rest break finished. Timer reset.');
                        triggerToast('Work shift resumed. Timers active.');
                      }}
                    >
                      Resume Work
                    </Button>
                  )}
                </div>
              </div>

              {/* Route Progress timeline checkpoints */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-4">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block border-b border-slate-200/45 pb-1.5">Load Journey Milestones</span>
                
                <div className="space-y-3 text-xs">
                  {routeStep === 'Idle' && (
                    <Button variant="primary" className="w-full font-bold" onClick={() => {
                      setRouteStep('Navigate to Pickup');
                      addDriverAuditLog('Route Milestone', 'Initiated navigation path to pickup terminal.');
                      triggerToast('Routing loaded. Dispatcher notified.');
                    }}>Navigate to Pickup Stop</Button>
                  )}
                  {routeStep === 'Navigate to Pickup' && (
                    <Button variant="success" className="w-full font-bold" onClick={() => {
                      setRouteStep('Arrived at Pickup');
                      addDriverAuditLog('Route Milestone', 'Arrived at Chicago HQ Origin Terminal.');
                      triggerToast('Checkpoint reached: Arrived at Pickup.');
                    }}>Confirm Arrival at Pickup Terminal</Button>
                  )}
                  {routeStep === 'Arrived at Pickup' && (
                    <Button variant="primary" className="w-full font-bold" onClick={() => {
                      setRouteStep('Loaded');
                      addDriverAuditLog('Route Milestone', 'Cargo securely loaded. Seals confirmed.');
                      triggerToast('Cargo manifest loaded.');
                    }}>Confirm Cargo Loaded & Strapped</Button>
                  )}
                  {routeStep === 'Loaded' && (
                    <Button variant="success" className="w-full font-bold" onClick={() => {
                      setRouteStep('In Transit');
                      setDutyStatus('Driving');
                      addDriverAuditLog('Route Milestone', 'Departed origin depot terminal. In transit to destination.');
                      triggerToast('In transit state active. ELD set to Driving.');
                    }}>Depart Terminal (In Transit)</Button>
                  )}
                  {routeStep === 'In Transit' && (
                    <Button variant="primary" className="w-full font-bold" onClick={() => {
                      setRouteStep('Arrived at Delivery');
                      setDutyStatus('On Duty');
                      addDriverAuditLog('Route Milestone', 'Arrived at Dallas depot destination.');
                      triggerToast('Checkpoint reached: Arrived at Destination.');
                    }}>Confirm Arrival at Delivery Site</Button>
                  )}
                  {routeStep === 'Arrived at Delivery' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-900 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer" onClick={() => {
                        setPodUploaded(true);
                        setPodFileAttached('pod_seal_confirm.pdf');
                        triggerToast('Proof of Delivery (POD) image attached successfully.');
                      }}>
                        <Upload className="h-5 w-5 mx-auto text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {podUploaded ? 'POD Document Attached ✓' : 'Upload Signed POD Credentials'}
                        </span>
                      </div>
                      
                      <Button 
                        variant="success" 
                        className="w-full font-black"
                        disabled={!podUploaded}
                        onClick={() => {
                          setRouteStep('Delivered');
                          addDriverAuditLog('Route Milestone', 'Shipment successfully delivered and closed with POD.');
                          triggerToast('Job successfully delivered!');
                        }}
                      >
                        Finalize & Submit Delivery
                      </Button>
                    </div>
                  )}

                  {routeStep === 'Delivered' && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-center">
                      ✓ Shipment Delivery Completed & Transmitted
                    </div>
                  )}
                </div>
              </div>

              {/* Regulatory ELD Information Table */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Federal Regulatory ELD Logbook</span>
                <div className="space-y-2 text-[11px] text-slate-355">
                  <div className="flex justify-between border-b border-slate-200/45 pb-1">
                    <span>Driving Limit (11-hr Rule)</span>
                    <span className="font-mono font-bold text-slate-900">{remainingDrivingHours} Hours Remaining</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/45 pb-1">
                    <span>On-Duty Shift Limit (14-hr Rule)</span>
                    <span className="font-mono font-bold text-slate-900">{remainingOnDutyHours} Hours Remaining</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/45 pb-1">
                    <span>Cycle Duration Limit (70-hr Rule)</span>
                    <span className="font-mono font-bold text-slate-900">{remainingCycleHours} Hours Remaining</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/45 pb-1">
                    <span>ELD Policy Violations</span>
                    <span className="font-mono font-bold text-emerald-400">No violations flagged</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rest Break Alert Warning</span>
                    <span className="font-mono font-bold text-slate-900">None (Duty hours compliant)</span>
                  </div>
                </div>
              </div>

              {/* Post Trip Defect Inspection Section */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Safety Defects Inspections (DVIR)</span>
                <div className="flex justify-between items-center text-xs">
                  <span>Pre/Post-Trip Defect Reporting</span>
                  <Button 
                    size="xs" 
                    variant="outline" 
                    onClick={() => {
                      triggerToast('Defect reporting checklist active.');
                      setActiveTab('maintenance');
                    }}
                  >
                    Report Defect
                  </Button>
                </div>
              </div>

              {/* Emergency SOS Shortcuts */}
              <div className="p-4 bg-white border border-red-500/20 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide block">Emergency Roadside Response</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => {
                      setSosType('Panic');
                      setSosActive(true);
                      triggerToast('🚨 EMERGENCY DISPATCH ALERT: Panic Alert triggered!', 'error');
                      addDriverAuditLog('SOS Trigger', 'SOS Panic Button manually engaged.');
                    }}
                  >
                    Panic Button
                  </Button>
                  <Button 
                    size="sm" 
                    variant="warning" 
                    onClick={() => {
                      setSosType('Breakdown');
                      setSosActive(true);
                      triggerToast('🚨 EMERGENCY DISPATCH ALERT: Mechanical breakdown triggered!', 'error');
                      addDriverAuditLog('SOS Trigger', 'Vehicle breakdown reported.');
                    }}
                  >
                    Report Breakdown
                  </Button>
                </div>
              </div>

              {/* Delay Notification Communication */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wide block">Alert Dispatcher of Route Delay</span>
                <div className="flex gap-2">
                  <select 
                    id="delay-reason-select"
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-355 outline-none font-semibold"
                  >
                    <option value="Traffic Congestion">Traffic Congestion Detour</option>
                    <option value="Terminal Queue Wait">Shipper Terminal Wait Time</option>
                    <option value="Mechanical Issue Check">Mechanical Equipment Check</option>
                    <option value="Severe Weather Delay">Adverse Weather Hold</option>
                  </select>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={() => {
                      const reason = document.getElementById('delay-reason-select').value;
                      addDriverAuditLog('Delay Alert', `Dispatcher alerted of route delay: ${reason}`);
                      triggerToast(`Delay alert transmitted to ops desk: ${reason}`);
                    }}
                  >
                    Send Delay
                  </Button>
                </div>
              </div>

              {/* Active Audit Logs Table */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wide block">Shift Operational Logs</span>
                <DataTable 
                  tableName="driver_shift_audit_logs"
                  columns={[
                    { key: 'action', label: 'Action', render: (row) => <span className="font-bold text-slate-900">{row.action}</span> },
                    { key: 'detail', label: 'Details', render: (row) => <span className="text-slate-500">{row.detail}</span> },
                    { key: 'time', label: 'Time', render: (row) => <span className="font-mono text-slate-500">{row.time}</span> }
                  ]} 
                  data={driverAuditLogs} 
                />
              </div>

              {/* Finish Shift Trigger Panel */}
              <div className="p-4 bg-gradient-to-br from-[#1E1B4B]/20 to-[#111827] border border-slate-200 rounded-2xl text-left space-y-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">Complete Active Work Shift</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Submit DVIR checklist inspection logs and clock out.</p>
                </div>
                <Button 
                  variant="danger" 
                  className="w-full font-black py-2.5" 
                  onClick={() => {
                    setFinishOdometer(String(parseInt(startOdometer) + 250));
                    setFinishShiftModalOpen(true);
                  }}
                >
                  Review & Finish Work Shift
                </Button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* MOBILE HOME LAYOUT (Overview tab) */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Top card */}
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl space-y-3.5 shadow-xl">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span>CURRENT JOB: <span className="text-slate-900 font-mono font-black">{activeLoad.loadId}</span></span>
              <StatusBadge status={activeLoad.status} />
            </div>

            <div className="border-t border-slate-200/50 pt-2.5">
              <strong className="text-slate-900 text-sm block font-black leading-snug">{activeLoad.cargo}</strong>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-brand-500" />
                Route: {activeLoad.route}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/40 p-2.5 rounded-xl border border-slate-200/35">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[8px]">Next Destination</span>
                <span className="text-slate-700 truncate block font-bold">{currentStop?.address || 'Dallas'}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[8px]">Next Required Action</span>
                <span className="text-brand-400 font-bold block">
                  {workflowStep === 1 && 'Start Work Shift'}
                  {workflowStep === 2 && 'Confirm Truck/Trailer'}
                  {workflowStep === 3 && 'Upload Odometer'}
                  {workflowStep === 4 && 'Complete Compliance'}
                  {workflowStep === 5 && 'Accept Job'}
                  {workflowStep === 6 && 'Navigate to Stop'}
                  {workflowStep === 7 && 'Check-in (Arrived)'}
                  {workflowStep === 8 && 'Start Pickup'}
                  {workflowStep === 9 && 'Scan Cargo Items'}
                  {workflowStep === 10 && 'Upload Photo proof'}
                  {workflowStep === 11 && 'Log Damage/Exceptions'}
                  {workflowStep === 12 && 'Collect Signature'}
                  {workflowStep === 13 && 'Complete Stop'}
                  {workflowStep === 14 && 'Start Delivery'}
                  {workflowStep === 15 && 'Final Payout & POD'}
                  {workflowStep === 16 && 'Complete Load'}
                  {workflowStep === 17 && 'Finish Shift'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-450 pt-1 border-t border-slate-200/45">
              <span>Next Job: <span className="text-slate-700 font-bold">LD-1102 (Grocery Pallets)</span></span>
              <span className="font-mono text-brand-500 font-bold">ETA: {activeLoad.eta}</span>
            </div>
          </div>

          {/* Chronological 17-Step Guided Workflow Timeline Panel */}
          <div className="glass rounded-2xl p-4 border border-slate-200 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Guided Stepper Workflow</h3>
              <span className="text-[10px] text-brand-400 font-bold">Step {workflowStep} of 17</span>
            </div>

            <div className="space-y-4">
              
              {/* Step 1: Start Work */}
              {workflowStep === 1 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-500">Clock into shift to start operations logging.</p>
                  <Button variant="success" className="w-full font-bold" onClick={handleStartWork}>Start Work</Button>
                </div>
              )}

              {/* Step 2: Confirm Truck & Trailer */}
              {workflowStep === 2 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <div className="p-3 bg-white/60 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Truck Assigned</span>
                      <strong className="text-slate-900 block font-mono">{activeLoad.vehicle}</strong>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="xs" variant="primary" onClick={() => { setTruckConfirmed(true); triggerToast('Truck confirmed.'); }}>Confirm Truck</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Truck change requested.')}>Change Truck</Button>
                    </div>
                  </div>

                  <div className="p-3 bg-white/60 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Trailer Assigned</span>
                      <strong className="text-slate-900 block font-mono">{activeLoad.trailer}</strong>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="xs" variant="primary" onClick={() => { setTrailerConfirmed(true); triggerToast('Trailer confirmed.'); }}>Confirm Trailer</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Trailer change requested.')}>Change Trailer</Button>
                    </div>
                  </div>

                  <Button variant="primary" className="w-full font-bold mt-2" disabled={!truckConfirmed || !trailerConfirmed} onClick={() => setWorkflowStep(3)}>
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 3: Upload Odometer Photo */}
              {workflowStep === 3 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <p className="text-slate-500">Upload odometer proof photo. AI model will auto-read values.</p>
                  
                  <div className="flex gap-2">
                    <TextInput label="Odometer mileage value" value={odometerReading} onChange={(e) => setOdometerReading(e.target.value)} className="flex-1" />
                    <div className="pt-5">
                      <Button size="sm" variant="outline" onClick={() => {
                        setOdometerPhotoUrl('https://hero-mock-storage.s3.amazonaws.com/odometer_run_1.jpg');
                        triggerToast('Odometer photo uploaded.');
                      }}>
                        {odometerPhotoUrl ? 'Photo Uploaded ✓' : 'Upload Odometer Photo'}
                      </Button>
                    </div>
                  </div>

                  {odometerPhotoUrl && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <span className="text-[9px] text-brand-400 font-bold block uppercase">AI Reader Match Result</span>
                      <p className="font-mono text-slate-900 text-xs">Extracted value: 124,500 mi (99% confidence)</p>
                      <Button size="xs" variant="success" className="w-full" onClick={() => {
                        triggerToast('AI odometer reading confirmed.');
                        setWorkflowStep(4);
                      }}>Confirm AI Odometer Reading</Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Complete Compliance */}
              {workflowStep === 4 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <p className="text-slate-450">Select safety checkpoints pre-trip checklist.</p>
                  <div className="space-y-2">
                    {Object.entries(complianceChecks).map(([k, v]) => (
                      <label key={k} className="flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <input type="checkbox" checked={v} onChange={(e) => setComplianceChecks({ ...complianceChecks, [k]: e.target.checked })} className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5" />
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => triggerToast('Compliance checks validated.')}>Complete Compliance</Button>
                    <Button variant="primary" size="sm" className="w-full" onClick={handleComplianceSubmit}>Submit Compliance</Button>
                  </div>
                </div>
              )}

              {/* Step 5: Accept Job */}
              {workflowStep === 5 && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <p className="text-slate-500">Review load manifest details and confirm accept.</p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="block text-slate-900 font-bold">{activeLoad.cargo}</span>
                    <span className="block text-slate-500">{activeLoad.route} | {activeLoad.weight}</span>
                  </div>
                  <Button variant="primary" className="w-full font-black" onClick={handleAcceptJob}>Accept Job</Button>
                </div>
              )}

              {/* Step 6: Navigate */}
              {workflowStep === 6 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-500">Launch Google Maps route for Stop #{currentStop.sequence}.</p>
                  <Button variant="primary" icon={Navigation} className="w-full font-bold" onClick={handleNavigate}>Navigate</Button>
                </div>
              )}

              {/* Step 7: Arrive at Stop */}
              {workflowStep === 7 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-200 rounded-xl">
                    <span className="text-[9px] text-brand-400 font-bold block uppercase mb-1">Target Stop #{currentStop.sequence}</span>
                    <strong className="text-slate-900 block">{currentStop.address}</strong>
                    <span className="text-slate-450 block mt-1">{currentStop.notes}</span>
                  </div>
                  
                  {/* Customer Instructions Checklist acknowledgment */}
                  {(() => {
                    const matching = (customerInstructions || []).filter(ins => {
                      const scope = ins.scope.toLowerCase();
                      return scope.includes(activeLoad.customerName?.toLowerCase() || '') || scope.includes(currentStop.address.toLowerCase());
                    });
                    if (matching.length === 0) return null;
                    return (
                      <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-1.5">
                        <span className="text-[9px] text-brand-400 font-bold uppercase block">Special Stop Directions</span>
                        {matching.map((ins, idx) => (
                          <p key={idx} className="italic text-[10px] text-slate-700">"{ins.text}"</p>
                        ))}
                      </div>
                    );
                  })()}

                  <Button variant="success" className="w-full font-bold" onClick={handleArrived}>Arrived</Button>
                </div>
              )}

              {/* Step 8: Start Pickup */}
              {workflowStep === 8 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-500">Verify cargo loading list manifest at pickup stop.</p>
                  <Button variant="primary" className="w-full font-bold" onClick={handleStartPickup}>Start Pickup</Button>
                </div>
              )}

              {/* Step 9: Scan Cargo Items (Per-Stop Item Isolation) */}
              {workflowStep === 9 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Scan Stop Items ({currentStopItems.length} listed)</span>
                  
                  <div className="space-y-2">
                    {currentStopItems.map(item => (
                      <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900 block">{item.name}</strong>
                          <span className="text-[9px] text-slate-500">{item.weight}</span>
                        </div>
                        <Button 
                          size="xs" 
                          variant={scannedItems[item.id] ? 'success' : 'primary'} 
                          onClick={() => handleScanItem(item.id)}
                        >
                          {scannedItems[item.id] ? 'Scanned ✓' : 'Scan Item'}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full font-bold mt-2" 
                    disabled={currentStopItems.some(i => !scannedItems[i.id])} 
                    onClick={() => setWorkflowStep(10)}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 10: Add Photo */}
              {workflowStep === 10 && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <p className="text-slate-500">Capture stop offload status photo or POD proof.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={handleAddPhoto}>Add Photo</Button>
                    <Button variant="secondary" className="w-full" disabled={!stopPhotoUploaded} onClick={() => setWorkflowStep(11)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 11: Mark Damage */}
              {workflowStep === 11 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <p className="text-slate-500">Report cargo damage exceptions if detected.</p>
                  
                  {damageMarked ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl space-y-1">
                      <strong>Exception Flagged</strong>
                      <p className="text-[10px]">{damageNotes}</p>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={handleMarkDamage}>Mark Damage</Button>
                  )}
                  
                  <Button variant="primary" className="w-full" onClick={() => setWorkflowStep(12)}>Continue</Button>
                </div>
              )}

              {/* Step 12: Capture Signature */}
              {workflowStep === 12 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <p className="text-slate-500">Obtain receiver name and signature.</p>
                  <TextInput label="Receiver Name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Type name..." />
                  
                  <div className="h-28 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center relative cursor-pointer" onClick={() => setSignatureCaptured(true)}>
                    <PenTool className="h-5 w-5 text-slate-500" />
                    <span className="text-[10px] text-slate-500 absolute bottom-2">Draw Signature Here</span>
                    {signatureCaptured && <div className="absolute inset-0 bg-brand-500/5 flex items-center justify-center text-brand-400 font-bold font-mono">Signature Saved ✓</div>}
                  </div>

                  <Button variant="primary" className="w-full font-bold" disabled={!receiverName || !signatureCaptured} onClick={handleCaptureSignature}>
                    Capture Signature
                  </Button>
                </div>
              )}

              {/* Step 13: Complete Stop */}
              {workflowStep === 13 && (
                <div className="space-y-2.5 animate-fade-in text-xs">
                  <p className="text-slate-500">Mark Stop #{currentStop.sequence} completed and depart.</p>
                  <Button variant="success" className="w-full font-black" onClick={handleCompleteStop}>Complete Stop</Button>
                </div>
              )}

              {/* Step 14: Start Delivery */}
              {workflowStep === 14 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-500">Verify cargo unloading checklist manifest at dropoff stop.</p>
                  <Button variant="primary" className="w-full font-bold" onClick={() => {
                    setDeliveryStarted(true);
                    triggerToast('Unloading active.');
                    setWorkflowStep(9);
                  }}>Start Delivery</Button>
                </div>
              )}

              {/* Step 15: Final photos / signature */}
              {workflowStep === 15 && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <p className="text-slate-500">Confirm payment cashout receipt or tap validation.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => triggerToast('Tap payment completed successfully.')}>Take Tap Payment</Button>
                    <Button variant="secondary" size="sm" onClick={() => triggerToast('PDF Receipt sent to customer.')}>Send Receipt</Button>
                  </div>
                  <Button variant="primary" className="w-full mt-2 font-bold" onClick={() => setWorkflowStep(16)}>Continue</Button>
                </div>
              )}

              {/* Step 16: Complete Load */}
              {workflowStep === 16 && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <p className="text-slate-500">Close load manifest docket. Logs will sync to dispatch overview.</p>
                  <Button variant="success" className="w-full font-black" onClick={() => {
                    dispatch(updateLoadStatus({ id: activeLoad.id, status: 'Closed' }));
                    triggerToast('Shipment closed.');
                    setWorkflowStep(17);
                  }}>Complete Load</Button>
                </div>
              )}

              {/* Step 17: Finish Work */}
              {workflowStep === 17 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-500">Clock out shift. Sync hours logged report.</p>
                  <Button variant="danger" className="w-full font-bold" onClick={handleFinishWork}>Finish Work</Button>
                </div>
              )}

            </div>
          </div>

          {/* Mobile navigation quick access grid */}
          <div className="grid grid-cols-3 gap-3">
            <Button size="xs" variant="secondary" onClick={() => setWorkflowStep(5)}>Jobs</Button>
            <Button size="xs" variant="outline" onClick={() => setWorkflowStep(3)}>Upload Odometer Photo</Button>
            <Button size="xs" variant="outline" onClick={() => setWorkflowStep(4)}>Submit Compliance</Button>
            <Button size="xs" variant="secondary" onClick={() => triggerToast('Expense module opened.')}>Add Expense</Button>
            <Button size="xs" variant="outline" onClick={() => triggerToast('Tap transaction loaded.')}>Take Tap Payment</Button>
            <Button size="xs" variant="outline" onClick={() => triggerToast('Job chat window active.')}>Open Job Chat</Button>
          </div>

        </div>
      )}

      {/* CREATE DRAFT LOAD TAB */}
      {activeTab === 'create-draft-load' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Create Draft Shipment</h3>
          <p className="text-xs text-slate-500">Submit a cargo draft to dispatcher registry for review and assignment.</p>
          <div className="space-y-3 text-xs">
            <TextInput label="Shipper Customer Name" value={draftCustomer} onChange={(e) => setDraftCustomer(e.target.value)} placeholder="e.g. Vance Refrigeration" />
            <TextInput label="Route Details (Origin ➔ Destination)" value={draftRoute} onChange={(e) => setDraftRoute(e.target.value)} placeholder="e.g. Chicago ➔ Boston" />
            
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="w-full font-bold" onClick={handleCreateDraftLoad}>
                Create Draft Load
              </Button>
              <Button variant="success" className="w-full font-bold" onClick={handleSubmitDraftReview}>
                Submit Draft for Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE TAB */}
      {activeTab === 'add-expense' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Log Trip Expense</h3>
          <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
            <TextInput label="Expense Amount spent (USD)" type="number" step="0.01" required value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="150" />
            
            <SelectInput label="Expense Category" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} options={[
              { value: 'Fuel', label: 'Diesel Fuel purchase' },
              { value: 'Tolls', label: 'Highway Toll pass' },
              { value: 'Meals', label: 'Meals / Layovers rest' }
            ]} />

            <div className="p-4 bg-slate-900 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer" onClick={() => {
              setExpenseReceiptUrl('https://hero-mock-storage.s3.amazonaws.com/receipt.jpg');
              triggerToast('Receipt file uploaded.');
            }}>
              <Upload className="h-5 w-5 mx-auto text-slate-500 mb-1" />
              <span className="text-[10px] text-slate-500 font-bold block">
                {expenseReceiptUrl ? 'Receipt Uploaded ✓' : 'Upload Receipt Image'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="w-full font-bold">Add Expense</Button>
              <Button type="button" variant="outline" className="w-full font-bold" onClick={() => triggerToast('Receipt photo attached.')}>Upload Receipt</Button>
            </div>
          </form>

          {/* AI Ingestion confirmation check */}
          {aiQueue.receipts.filter(item => item.status === 'pending').map((item) => (
            <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div>
                <span className="text-[9px] text-brand-400 font-bold uppercase block">AI Receipt Reader Extract</span>
                <strong className="text-slate-900 text-xs block mt-0.5">Expense detected: {item.data.amount}</strong>
                <span className="text-[9px] text-slate-500 font-mono block">Source: {item.source}</span>
              </div>
              <div className="flex gap-1.5 text-[9px] font-bold">
                <button type="button" onClick={() => triggerToast('Showing raw receipt...')} className="bg-white hover:bg-slate-700 px-3 py-1 rounded">Review AI Result</button>
                <button type="button" onClick={() => {
                  resolveAiItem('receipts', item.id, 'confirmed');
                  setExpenses([{ id: Date.now(), category: 'Fuel', amount: item.data.amount, status: 'Approved', date: new Date().toLocaleDateString() }, ...expenses]);
                  triggerToast('Expense confirmed and saved.');
                }} className="bg-brand-500 text-slate-950 px-3 py-1 rounded">Confirm</button>
                <button type="button" onClick={() => triggerToast('Opening invoice editor...')} className="bg-white hover:bg-slate-700 px-3 py-1 rounded">Edit</button>
                <button type="button" onClick={() => {
                  resolveAiItem('receipts', item.id, 'rejected');
                  triggerToast('AI Receipt rejected.');
                }} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}

          {/* Expense registry logs */}
          <div className="border-t border-slate-200 pt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Logged Expenses history</span>
            <DataTable 
              tableName="driver_expenses_history"
              columns={[
                { key: 'category', label: 'Category', render: (row) => <span className="text-slate-900">{row.category}</span> },
                { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono text-slate-500">{row.amount}</span> },
                { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={expenses} />
          </div>
        </div>
      )}

      {/* MY PAY TAB */}
      {activeTab === 'earnings' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="Daily Payout" value="$245.00" description="Completed runs today" progress={100} />
            <StatCard title="Weekly Payout" value="$1,250.00" description="Weekly accumulated pay" progress={80} />
            <StatCard title="Monthly Payout" value="$4,820.00" description="Monthly baseline earnings" progress={92} />
            <StatCard title="Awaiting Payroll" value="$1,420.00" description="Awaiting billing run" progress={100} />
          </div>
          
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-left space-y-2">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wide block">Bonus Summary Overview</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-slate-900 border border-slate-200/45 rounded-lg">
                <span className="text-slate-500 block">Safety Performance Bonus</span>
                <span className="text-emerald-400 font-extrabold font-mono text-xs mt-0.5">+$150.00</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-200/45 rounded-lg">
                <span className="text-slate-500 block">On-Time Dispatch Bonus</span>
                <span className="text-emerald-400 font-extrabold font-mono text-xs mt-0.5">+$200.00</span>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Settlement History & Payments Log</h3>
            <DataTable 
              tableName="driver_payouts_log"
              columns={[
                { key: 'period', label: 'Pay Period', render: (row) => <span className="font-extrabold text-slate-900">{row.period}</span> },
                { key: 'hours', label: 'Logged Hours', render: (row) => <span className="font-mono">{row.hours} hrs</span> },
                { key: 'amount', label: 'Payout', render: (row) => <span className="font-mono text-brand-400 font-black">{row.amount}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={[
                { period: 'Jun 01 - Jun 15, 2026', hours: 82, amount: '$3,690.00', status: 'Paid' },
                { period: 'May 16 - May 31, 2026', hours: 78, amount: '$3,510.00', status: 'Paid' }
              ]} />
          </div>
        </div>
      )}

      {/* CONTACT DISPATCH TAB */}
      {activeTab === 'chat' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left flex flex-col justify-between h-[480px] animate-fade-in text-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Dispatch Communication Chat</h3>
            <p className="text-[10px] text-slate-500">Live chat thread connected directly to dispatch team.</p>
          </div>

          <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1 scrollbar-none">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`p-2.5 border rounded-xl text-xs max-w-[85%] ${
                msg.sender === 'driver' 
                  ? 'bg-brand-500 text-slate-950 ml-auto font-semibold border-brand-600' 
                  : 'bg-white/80 border-slate-200/50 text-slate-500 mr-auto'
              }`}>
                <div className="flex justify-between items-center mb-1 text-[8px] font-extrabold uppercase opacity-80">
                  <span>{msg.sender === 'driver' ? 'You' : 'Dispatcher'}</span>
                  <span>{msg.time}</span>
                </div>
                <div>{msg.text}</div>
                {msg.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-200/65 max-h-36">
                    <img src={msg.imageUrl} alt="Shared attachment" className="w-full h-auto object-cover" />
                  </div>
                )}
                {msg.sender === 'driver' && (
                  <div className="text-right text-[8px] mt-0.5 opacity-90">
                    Read ✓✓
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex flex-col gap-2 border-t border-slate-200/45 pt-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type dispatch update..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black cursor-pointer"
              >
                Send
              </button>
            </div>
            
            <div className="flex gap-2 text-[10px]">
              <button 
                type="button" 
                onClick={handleShareImageInChat}
                className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <Plus className="h-3 w-3" /> Share Image
              </button>
              <button 
                type="button" 
                onClick={handleShareVoiceInChat}
                className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <Mic className="h-3 w-3" /> Voice Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEARBY SERVICES TAB */}
      {activeTab === 'nearby-services' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl text-left">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <MapPin className="h-4 w-4 text-brand-500" /> Nearby Services
            </h3>
            <p className="text-[10px] text-slate-500">Locate crucial driver amenities along your active route.</p>
          </div>

          <div className="space-y-3">
            {[
              { type: 'Fuel Station', name: 'Loves Travel Stop #342', desc: 'Diesel lanes, scale, showers, parking', dist: '1.2 miles away', status: 'Open' },
              { type: 'Workshop', name: 'TA Truck Service Garage', desc: 'Brake repair, trailer mechanics, tire swap', dist: '3.5 miles away', status: 'Open' },
              { type: 'Parking', name: 'Public Truck Parking Area', desc: '15 overnight spaces remaining', dist: '4.8 miles away', status: 'Open' },
              { type: 'Rest Area', name: 'Illinois State Rest Stop', desc: 'Restrooms, picnic tables, vending', dist: '7.1 miles away', status: 'Open' }
            ].map((service, index) => (
              <div key={index} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-left">
                <div>
                  <span className="text-[8px] font-bold text-brand-400 uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">{service.type}</span>
                  <h4 className="text-xs font-black text-slate-900 mt-1.5">{service.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{service.desc}</p>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">{service.dist} · {service.status}</span>
                </div>
                <Button size="xs" variant="primary" icon={Navigation} onClick={() => triggerToast(`Routing path to ${service.name} loaded.`)}>Route</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRIVER NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl text-left flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
                <Bell className="h-4 w-4 text-brand-500" /> Dispatch Alerts
              </h3>
              <p className="text-[10px] text-slate-500">Driver logs and assignments notifications queue.</p>
            </div>
            {notificationsList.some(n => !n.read) && (
              <Button size="xs" variant="outline" onClick={() => {
                setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
                triggerToast('All notifications marked as read.');
              }}>Mark All Read</Button>
            )}
          </div>

          <div className="space-y-2.5">
            {notificationsList.map(n => (
              <div key={n.id} className={`p-3 border rounded-xl flex justify-between items-start text-left transition-all ${
                n.read ? 'bg-white/40 border-slate-200 text-slate-500' : 'bg-white border-brand-500/20 text-slate-700'
              }`}>
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 block" />}
                    <h4 className="text-xs font-black text-slate-900">{n.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{n.body}</p>
                  <span className="text-[9px] text-slate-500 mt-1 block font-mono">{n.time}</span>
                </div>
                <div className="flex gap-1.5 text-[10px]">
                  {!n.read && (
                    <button onClick={() => {
                      setNotificationsList(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                      triggerToast('Notification marked read.');
                    }} className="text-brand-400 hover:text-brand-300 font-bold text-[10px]">Read</button>
                  )}
                  <button onClick={() => {
                    setNotificationsList(prev => prev.filter(item => item.id !== n.id));
                    triggerToast('Notification cleared.');
                  }} className="text-red-400 hover:text-red-300 font-bold text-[10px] ml-1">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRIVER DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl text-left">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <FileText className="h-4 w-4 text-brand-500" /> Driver Credentials
            </h3>
            <p className="text-[10px] text-slate-500">Keep FMCSA & DOT compliance documents updated.</p>
          </div>

          <div className="space-y-3">
            {driverDocuments.map(doc => (
              <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{doc.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Expires: {doc.expiry}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    doc.status === 'Valid' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  }`}>{doc.status}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/50">
                  <span className="text-[9px] text-slate-450 italic">
                    {doc.status === 'Valid' ? '✅ Document compliant' : '⚠️ Action required soon'}
                  </span>
                  <Button size="xs" variant="primary" onClick={() => {
                    setSelectedDocType(doc.type);
                    setNewDocExpiry('');
                    setDocModalOpen(true);
                  }}>Renew / Upload</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEAVE MANAGEMENT TAB */}
      {activeTab === 'leave-management' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl text-left">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <Calendar className="h-4 w-4 text-brand-500" /> Leave Management
            </h3>
            <p className="text-[10px] text-slate-500">Request vacation or medical rest logs.</p>
          </div>

          <form onSubmit={handleApplyLeave} className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Request Time Off</span>
            
            <SelectInput label="Leave Category Type" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} options={[
              { value: 'Annual Leave', label: 'Annual / Vacation Leave' },
              { value: 'Sick Leave', label: 'Medical / Sick Leave' },
              { value: 'Emergency Leave', label: 'Emergency Leave' }
            ]} />

            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Start Date" type="date" required value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} />
              <TextInput label="End Date" type="date" required value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} />
            </div>

            <TextInput label="Reason Details" placeholder="Describe leave justification..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />

            <Button type="submit" variant="primary" className="w-full font-black">Submit Leave Request</Button>
          </form>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase block text-left">Leave Request History</span>
            <DataTable 
              tableName="driver_leave_history"
              columns={[
                { key: 'type', label: 'Type', render: (row) => <span className="text-slate-900 font-bold">{row.type}</span> },
                { key: 'dates', label: 'Dates', render: (row) => <span className="font-mono">{row.start} - {row.end}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={leaveRequests} />
          </div>
        </div>
      )}

      {/* INCIDENT REPORTING TAB */}
      {activeTab === 'incidents' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl text-left">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="h-4 w-4 text-brand-500" /> Incident Logger
            </h3>
            <p className="text-[10px] text-slate-500">File digital accident reports and cargo/trailer defect logs.</p>
          </div>

          <form onSubmit={handleReportIncident} className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Log New Incident Report</span>

            <SelectInput label="Incident Category Type" value={incidentType} onChange={(e) => setIncidentType(e.target.value)} options={[
              { value: 'Accident', label: 'Highway Road Accident' },
              { value: 'Vehicle Damage', label: 'Truck / Trailer Defects' },
              { value: 'Cargo Damage', label: 'Cargo Damage Exception' }
            ]} />

            <TextInput label="Incident Description" required placeholder="Type incident crash/exception details..." value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)} />

            <div className="p-4 bg-slate-900 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer" onClick={() => {
              setIncidentPhoto('https://hero-mock-storage.s3.amazonaws.com/incident_crash_1.jpg');
              triggerToast('Incident proof photo attached.');
            }}>
              <Upload className="h-5 w-5 mx-auto text-slate-500 mb-1" />
              <span className="text-[10px] text-slate-500 font-bold block">
                {incidentPhoto ? 'Photo Attached ✓' : 'Attach Incident Photos'}
              </span>
            </div>

            <Button type="submit" variant="danger" className="w-full font-black">Submit Incident Report</Button>
          </form>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase block text-left">Incident Log Registry</span>
            <DataTable 
              tableName="driver_incidents_history"
              columns={[
                { key: 'type', label: 'Category', render: (row) => <span className="text-slate-900 font-bold">{row.type}</span> },
                { key: 'date', label: 'Logged Date', render: (row) => <span className="font-mono">{row.date}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={incidentsList} />
          </div>
        </div>
      )}

      {/* MAINTENANCE REQUEST TAB */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 bg-slate-50 border border-brand-500/30 rounded-2xl text-left">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <Truck className="h-4 w-4 text-brand-500" /> Maintenance Request
            </h3>
            <p className="text-[10px] text-slate-500">Report vehicle malfunctions directly to fleet garage desks.</p>
          </div>

          <form onSubmit={handleReportMaintenance} className="p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Report Vehicle Defect</span>

            <TextInput label="Issue / Malfunction details" required placeholder="e.g. Engine oil leak or brake noise..." value={maintenanceDesc} onChange={(e) => setMaintenanceDesc(e.target.value)} />

            <SelectInput label="Safety Severity Priority" value={maintenanceSeverity} onChange={(e) => setMaintenanceSeverity(e.target.value)} options={[
              { value: 'Minor', label: 'Minor - Driveable issue' },
              { value: 'Moderate', label: 'Moderate - Needs repair soon' },
              { value: 'Critical', label: 'Critical - Out of Service (Red tag)' }
            ]} />

            <div className="p-4 bg-slate-900 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer" onClick={() => {
              setMaintenancePhoto('https://hero-mock-storage.s3.amazonaws.com/maint_leak.jpg');
              triggerToast('Defect photo attached.');
            }}>
              <Upload className="h-5 w-5 mx-auto text-slate-500 mb-1" />
              <span className="text-[10px] text-slate-500 font-bold block">
                {maintenancePhoto ? 'Photo Attached ✓' : 'Attach Malfunction Photos'}
              </span>
            </div>

            <Button type="submit" variant="primary" className="w-full font-black">Submit Maintenance Log</Button>
          </form>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase block text-left">Defect Logs History</span>
            <DataTable 
              tableName="driver_maintenance_history"
              columns={[
                { key: 'issue', label: 'Reported Issue', render: (row) => <span className="text-slate-900 font-bold">{row.issue}</span> },
                { key: 'severity', label: 'Severity', render: (row) => <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  row.severity === 'Critical' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : (row.severity === 'Moderate' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-slate-500/10 border border-slate-500/20 text-slate-500')
                }`}>{row.severity}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={maintenanceList} />
          </div>
        </div>
      )}

      {/* FLOATING ACTION COMMUNICATION BUTTON (FAB) & EMERGENCY SOS TRIGGER */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 text-xs">
        <button 
          onClick={() => setSosModalOpen(true)}
          className="w-12 h-12 bg-red-650 hover:bg-red-700 text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform focus:outline-none z-50 cursor-pointer animate-pulse font-extrabold text-[10px] border border-red-500/30"
        >
          SOS
        </button>

        {fabOpen && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl shadow-xl space-y-2 flex flex-col min-w-[150px] text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Hotline Shortcuts</span>
            <button onClick={() => { setFabOpen(false); triggerToast('Dialing hotline: Call Dispatch...'); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 py-1">
              <Phone className="h-3.5 w-3.5" /> Call Dispatch
            </button>
            <button onClick={() => { setFabOpen(false); triggerToast('Message dispatch thread opened.'); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 py-1">
              <MessageSquare className="h-3.5 w-3.5" /> Message Dispatch
            </button>
            
            <button 
              onClick={() => {
                setVoiceRecording(!voiceRecording);
                if (!voiceRecording) {
                  triggerToast('Simulating recording voice note... Tap again to stop.');
                } else {
                  triggerToast('Voice note recorded. Dispatch alerted.');
                }
              }}
              className={`flex items-center gap-2 py-1 ${voiceRecording ? 'text-red-400 font-bold animate-pulse' : 'text-slate-355 hover:text-slate-900'}`}
            >
              <Mic className="h-3.5 w-3.5" /> {voiceRecording ? 'Recording...' : 'Voice Note'}
            </button>

            <button 
              onClick={() => {
                setVoiceText('Driver en route to stop sequence 2.');
                triggerToast('Transcribed: "Driver en route to stop sequence 2."');
              }}
              className="flex items-center gap-2 text-slate-355 hover:text-slate-900 py-1 border-t border-slate-200 pt-1.5"
            >
              <PenTool className="h-3.5 w-3.5" /> Voice-to-Text
            </button>

            {voiceText && (
              <div className="p-2 bg-slate-900 border border-slate-200 rounded text-[10px] text-brand-400 italic">
                {voiceText}
              </div>
            )}
          </div>
        )}

        <button 
          onClick={() => setFabOpen(!fabOpen)}
          className="w-12 h-12 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-full flex items-center justify-center shadow-lg transition-transform focus:outline-none z-50 cursor-pointer"
        >
          {fabOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>

      {/* SOS Panel Modal */}
      <Modal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} title="Emergency Dispatch SOS Panel">
        <div className="space-y-4 text-xs text-left">
          <p className="text-slate-500">Triggering an emergency alerts the dispatch operations center immediately and logs active tracking.</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleTriggerSOS('Panic Button Alert')} className="p-4 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-center cursor-pointer group flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
              <strong className="text-slate-900 font-extrabold text-xs">Panic Button</strong>
            </button>
            <button onClick={() => handleTriggerSOS('Vehicle Breakdown')} className="p-4 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl text-center cursor-pointer group flex flex-col items-center justify-center gap-2">
              <Truck className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
              <strong className="text-slate-900 font-extrabold text-xs">Breakdown</strong>
            </button>
            <button onClick={() => handleTriggerSOS('Road Accident')} className="p-4 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-center cursor-pointer group flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
              <strong className="text-slate-900 font-extrabold text-xs">Accident</strong>
            </button>
            <button onClick={() => handleTriggerSOS('Medical Emergency')} className="p-4 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-center cursor-pointer group flex flex-col items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-red-400 group-hover:scale-110 transition-transform" />
              <strong className="text-slate-900 font-extrabold text-xs">Medical</strong>
            </button>
          </div>

          <div className="space-y-3.5 border-t border-slate-200 pt-4">
            <label className="flex justify-between items-center cursor-pointer">
              <span>Share Live GPS Tracking</span>
              <input type="checkbox" checked={shareGps} onChange={(e) => setShareGps(e.target.checked)} className="rounded text-brand-500" />
            </label>
            <label className="flex justify-between items-center cursor-pointer">
              <span>Auto-Notify Dispatch Center</span>
              <input type="checkbox" checked={notifyDispatcherState} onChange={(e) => setNotifyDispatcherState(e.target.checked)} className="rounded text-brand-500" />
            </label>
          </div>
        </div>
      </Modal>

      {/* Renew Document Modal */}
      <Modal isOpen={docModalOpen} onClose={() => setDocModalOpen(false)} title={`Renew Driver ${selectedDocType} Document`}>
        <div className="space-y-4 text-xs text-left">
          <TextInput label="New Expiration Date" type="date" required value={newDocExpiry} onChange={(e) => setNewDocExpiry(e.target.value)} />
          
          <div className="p-6 bg-slate-900 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer" onClick={() => triggerToast('Scanned document copy attached.')}>
            <Upload className="h-6 w-6 mx-auto text-slate-500 mb-1.5" />
            <strong className="text-slate-900 block">Upload Credentials Scan</strong>
            <span className="text-[10px] text-slate-500 block">PDF or JPEG file format</span>
          </div>

          <Button variant="primary" className="w-full font-black" onClick={() => {
            if (!newDocExpiry) {
              triggerToast('Please select expiration date.', 'error');
              return;
            }
            setDriverDocuments(prev => prev.map(d => d.type === selectedDocType ? { ...d, expiry: newDocExpiry, status: 'Valid' } : d));
            setDocModalOpen(false);
            triggerToast(`${selectedDocType} credentials updated successfully.`);
          }}>Update Document</Button>
        </div>
      </Modal>

      {/* Finish Shift Modal */}
      <Modal isOpen={finishShiftModalOpen} onClose={() => setFinishShiftModalOpen(false)} title="Finalize Shift & Clock-Out">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!dvirPostTripChecked) {
            triggerToast('Please verify post-trip DVIR checklist.', 'error');
            return;
          }
          if (routeStep !== 'Delivered' && !confirm('Shipment delivery is not finalized. Are you sure you want to finish shift?')) {
            return;
          }
          setStartShiftActive(false);
          setDutyStatus('Off Duty');
          setRouteStep('Idle');
          setOnBreak(false);
          setShiftDuration(0);
          setFinishShiftModalOpen(false);
          addDriverAuditLog('Shift End', `Shift closed. Final Odometer: ${finishOdometer} mi. Fuel: ${finishFuel}%. Defects logged: ${finishDefects || 'None'}.`);
          triggerToast('Shift completed successfully. Logs offloaded to dispatch.');
        }} className="space-y-4 text-xs text-left">
          
          <TextInput 
            label="Final Odometer Reading (miles)" 
            type="number"
            required
            value={finishOdometer} 
            onChange={(e) => setFinishOdometer(e.target.value)}
          />

          <TextInput 
            label="Final Fuel Level (%)" 
            type="number"
            min="0"
            max="100"
            required
            value={finishFuel} 
            onChange={(e) => setFinishFuel(e.target.value)}
          />

          <TextInput 
            label="Post-Trip Vehicle Defects Notes" 
            placeholder="Describe any vehicle issues noticed..."
            value={finishDefects} 
            onChange={(e) => setFinishDefects(e.target.value)}
          />

          <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
            <span className="font-bold text-slate-500">Confirm Post-Trip DVIR completed</span>
            <input 
              type="checkbox" 
              checked={dvirPostTripChecked} 
              onChange={(e) => setDvirPostTripChecked(e.target.checked)} 
              className="rounded text-brand-500 h-4.5 w-4.5"
            />
          </label>

          {routeStep !== 'Delivered' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold">
              ⚠️ Warning: Active shipment delivery has not been finalized yet.
            </div>
          )}

          <Button type="submit" variant="danger" className="w-full font-black">
            Submit DVIR & Clock-Out
          </Button>
        </form>
      </Modal>
    </div>
  );
}
