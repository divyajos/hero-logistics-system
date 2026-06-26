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
  DollarSign, ShieldAlert, Plus, Upload, Heart, Lock, Phone, MessageSquare, Mic, PenTool, Check, Truck, X
} from 'lucide-react';

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
    const newE = {
      id: Date.now(),
      category: expenseCategory,
      amount: `$${parseFloat(expenseAmount).toFixed(2)}`,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };
    setExpenses([newE, ...expenses]);
    setExpenseAmount('');
    triggerToast('Expense logged successfully.');
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
    <div className="space-y-6 max-w-md mx-auto text-left pb-16 relative bg-[#0B0F19] text-slate-200 min-h-screen p-4">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Driver Title Header */}
      <div className="flex items-center justify-between border-b border-[#23324C]/60 pb-4">
        <div>
          <h2 className="text-lg font-black text-white">Driver Portal • {activeTab.replace('-', ' ')}</h2>
          <p className="text-[10px] text-slate-400">ELD & logistics operations controls.</p>
        </div>
        <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
          <Compass className="h-5 w-5 animate-spin-slow" />
        </div>
      </div>

      {/* MOBILE HOME LAYOUT (Overview tab) */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Top card */}
          <div className="p-4 bg-gradient-to-br from-[#161F30] to-[#111827] border border-brand-500/20 rounded-2xl space-y-3.5 shadow-xl">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>CURRENT JOB: <span className="text-white font-mono font-black">{activeLoad.loadId}</span></span>
              <StatusBadge status={activeLoad.status} />
            </div>

            <div className="border-t border-[#23324C]/50 pt-2.5">
              <strong className="text-white text-sm block font-black leading-snug">{activeLoad.cargo}</strong>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-brand-500" />
                Route: {activeLoad.route}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#0B0F19]/40 p-2.5 rounded-xl border border-[#23324C]/35">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[8px]">Next Destination</span>
                <span className="text-slate-200 truncate block font-bold">{currentStop?.address || 'Dallas'}</span>
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

            <div className="flex justify-between items-center text-[10px] text-slate-450 pt-1 border-t border-[#23324C]/45">
              <span>Next Job: <span className="text-slate-200 font-bold">LD-1102 (Grocery Pallets)</span></span>
              <span className="font-mono text-brand-500 font-bold">ETA: {activeLoad.eta}</span>
            </div>
          </div>

          {/* Chronological 17-Step Guided Workflow Timeline Panel */}
          <div className="glass rounded-2xl p-4 border border-[#23324C]/60 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Guided Stepper Workflow</h3>
              <span className="text-[10px] text-brand-400 font-bold">Step {workflowStep} of 17</span>
            </div>

            <div className="space-y-4">
              
              {/* Step 1: Start Work */}
              {workflowStep === 1 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-400">Clock into shift to start operations logging.</p>
                  <Button variant="success" className="w-full font-bold" onClick={handleStartWork}>Start Work</Button>
                </div>
              )}

              {/* Step 2: Confirm Truck & Trailer */}
              {workflowStep === 2 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <div className="p-3 bg-[#111827]/60 border border-[#23324C] rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Truck Assigned</span>
                      <strong className="text-white block font-mono">{activeLoad.vehicle}</strong>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="xs" variant="primary" onClick={() => { setTruckConfirmed(true); triggerToast('Truck confirmed.'); }}>Confirm Truck</Button>
                      <Button size="xs" variant="outline" onClick={() => triggerToast('Truck change requested.')}>Change Truck</Button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#111827]/60 border border-[#23324C] rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Trailer Assigned</span>
                      <strong className="text-white block font-mono">{activeLoad.trailer}</strong>
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
                  <p className="text-slate-400">Upload odometer proof photo. AI model will auto-read values.</p>
                  
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
                    <div className="p-3 bg-[#111827] border border-[#23324C]/60 rounded-xl space-y-2">
                      <span className="text-[9px] text-brand-400 font-bold block uppercase">AI Reader Match Result</span>
                      <p className="font-mono text-white text-xs">Extracted value: 124,500 mi (99% confidence)</p>
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
                      <label key={k} className="flex justify-between items-center p-2.5 bg-[#111827] border border-[#23324C] rounded-xl cursor-pointer">
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
                  <p className="text-slate-400">Review load manifest details and confirm accept.</p>
                  <div className="p-3 bg-[#0B0F19] border border-[#23324C] rounded-xl space-y-1">
                    <span className="block text-white font-bold">{activeLoad.cargo}</span>
                    <span className="block text-slate-400">{activeLoad.route} | {activeLoad.weight}</span>
                  </div>
                  <Button variant="primary" className="w-full font-black" onClick={handleAcceptJob}>Accept Job</Button>
                </div>
              )}

              {/* Step 6: Navigate */}
              {workflowStep === 6 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-400">Launch Google Maps route for Stop #{currentStop.sequence}.</p>
                  <Button variant="primary" icon={Navigation} className="w-full font-bold" onClick={handleNavigate}>Navigate</Button>
                </div>
              )}

              {/* Step 7: Arrive at Stop */}
              {workflowStep === 7 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <div className="p-3 bg-slate-900 border border-[#23324C] rounded-xl">
                    <span className="text-[9px] text-brand-400 font-bold block uppercase mb-1">Target Stop #{currentStop.sequence}</span>
                    <strong className="text-white block">{currentStop.address}</strong>
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
                          <p key={idx} className="italic text-[10px] text-slate-200">"{ins.text}"</p>
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
                  <p className="text-xs text-slate-400">Verify cargo loading list manifest at pickup stop.</p>
                  <Button variant="primary" className="w-full font-bold" onClick={handleStartPickup}>Start Pickup</Button>
                </div>
              )}

              {/* Step 9: Scan Cargo Items (Per-Stop Item Isolation) */}
              {workflowStep === 9 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Scan Stop Items ({currentStopItems.length} listed)</span>
                  
                  <div className="space-y-2">
                    {currentStopItems.map(item => (
                      <div key={item.id} className="p-3 bg-[#111827] border border-[#23324C]/60 rounded-xl flex justify-between items-center">
                        <div>
                          <strong className="text-white block">{item.name}</strong>
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
                  <p className="text-slate-400">Capture stop offload status photo or POD proof.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={handleAddPhoto}>Add Photo</Button>
                    <Button variant="secondary" className="w-full" disabled={!stopPhotoUploaded} onClick={() => setWorkflowStep(11)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 11: Mark Damage */}
              {workflowStep === 11 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <p className="text-slate-400">Report cargo damage exceptions if detected.</p>
                  
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
                  <p className="text-slate-400">Obtain receiver name and signature.</p>
                  <TextInput label="Receiver Name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Type name..." />
                  
                  <div className="h-28 bg-[#111827] border border-dashed border-[#23324C] rounded-xl flex items-center justify-center relative cursor-pointer" onClick={() => setSignatureCaptured(true)}>
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
                  <p className="text-slate-400">Mark Stop #{currentStop.sequence} completed and depart.</p>
                  <Button variant="success" className="w-full font-black" onClick={handleCompleteStop}>Complete Stop</Button>
                </div>
              )}

              {/* Step 14: Start Delivery */}
              {workflowStep === 14 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-400">Verify cargo unloading checklist manifest at dropoff stop.</p>
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
                  <p className="text-slate-400">Confirm payment cashout receipt or tap validation.</p>
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
                  <p className="text-slate-400">Close load manifest docket. Logs will sync to dispatch overview.</p>
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
                  <p className="text-xs text-slate-400">Clock out shift. Sync hours logged report.</p>
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-white">Create Draft Shipment</h3>
          <p className="text-xs text-slate-400">Submit a cargo draft to dispatcher registry for review and assignment.</p>
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-white">Log Trip Expense</h3>
          <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
            <TextInput label="Expense Amount spent (USD)" type="number" step="0.01" required value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="150" />
            
            <SelectInput label="Expense Category" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} options={[
              { value: 'Fuel', label: 'Diesel Fuel purchase' },
              { value: 'Tolls', label: 'Highway Toll pass' },
              { value: 'Meals', label: 'Meals / Layovers rest' }
            ]} />

            <div className="p-4 bg-slate-900 border border-dashed border-[#23324C] rounded-xl text-center cursor-pointer" onClick={() => {
              setExpenseReceiptUrl('https://hero-mock-storage.s3.amazonaws.com/receipt.jpg');
              triggerToast('Receipt file uploaded.');
            }}>
              <Upload className="h-5 w-5 mx-auto text-slate-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold block">
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
            <div key={item.id} className="p-4 bg-[#111827] border border-[#23324C] rounded-xl space-y-3">
              <div>
                <span className="text-[9px] text-brand-400 font-bold uppercase block">AI Receipt Reader Extract</span>
                <strong className="text-white text-xs block mt-0.5">Expense detected: {item.data.amount}</strong>
                <span className="text-[9px] text-slate-500 font-mono block">Source: {item.source}</span>
              </div>
              <div className="flex gap-1.5 text-[9px] font-bold">
                <button type="button" onClick={() => triggerToast('Showing raw receipt...')} className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">Review AI Result</button>
                <button type="button" onClick={() => {
                  resolveAiItem('receipts', item.id, 'confirmed');
                  setExpenses([{ id: Date.now(), category: 'Fuel', amount: item.data.amount, status: 'Approved', date: new Date().toLocaleDateString() }, ...expenses]);
                  triggerToast('Expense confirmed and saved.');
                }} className="bg-brand-500 text-slate-950 px-3 py-1 rounded">Confirm</button>
                <button type="button" onClick={() => triggerToast('Opening invoice editor...')} className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">Edit</button>
                <button type="button" onClick={() => {
                  resolveAiItem('receipts', item.id, 'rejected');
                  triggerToast('AI Receipt rejected.');
                }} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}

          {/* Expense registry logs */}
          <div className="border-t border-[#23324C]/60 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Logged Expenses history</span>
            <DataTable 
              tableName="driver_expenses_history"
              columns={[
                { key: 'category', label: 'Category', render: (row) => <span className="text-white">{row.category}</span> },
                { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono text-slate-350">{row.amount}</span> },
                { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={expenses} />
          </div>
        </div>
      )}

      {/* MY PAY TAB */}
      {activeTab === 'earnings' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="This Month Payout" value="$4,820" description="Completed runs pay" progress={92} />
            <StatCard title="Awaiting Payroll" value="$1,420" description="Awaiting billing run" progress={100} />
          </div>
          
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Settlement History & Payments Log</h3>
            <DataTable 
              tableName="driver_payouts_log"
              columns={[
                { key: 'period', label: 'Pay Period', render: (row) => <span className="font-extrabold text-white">{row.period}</span> },
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[450px] animate-fade-in">
          <div>
            <h3 className="text-sm font-extrabold text-white mb-1">Dispatch Communication Chat</h3>
            <p className="text-[10px] text-slate-500">Live chat thread connected directly to dispatch team.</p>
          </div>

          <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1 scrollbar-none">
            <div className="p-3 bg-[#111827]/80 border border-[#23324C]/50 rounded-xl text-xs max-w-[85%] text-slate-350">
              <span className="text-[9px] text-slate-500 font-bold block mb-1">Dispatcher (Ops Desk)</span>
              John, please confirm trailer change at Chicago Gate 4. LD-9411 is scheduled for immediate departure.
            </div>
            <div className="p-3 bg-brand-500 text-slate-950 rounded-xl text-xs max-w-[85%] ml-auto font-semibold">
              <span className="text-[9px] text-slate-800 font-extrabold block mb-1">You</span>
              Copy that, logs updated and trailer verified. Rolling out now.
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#23324C]/45 pt-3">
            <input 
              type="text" 
              placeholder="Type dispatch update..." 
              id="driver-chat-msg"
              className="flex-grow px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none"
            />
            <button 
              onClick={() => {
                const val = document.getElementById('driver-chat-msg').value;
                if (!val) return;
                triggerToast('Message sent to dispatch desk.');
                document.getElementById('driver-chat-msg').value = '';
              }}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION COMMUNICATION BUTTON (FAB) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 text-xs">
        {fabOpen && (
          <div className="bg-[#161F30] border border-[#23324C] p-3 rounded-2xl shadow-xl space-y-2 flex flex-col min-w-[150px] text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Hotline Shortcuts</span>
            <button onClick={() => { setFabOpen(false); triggerToast('Dialing hotline: Call Dispatch...'); }} className="flex items-center gap-2 text-slate-350 hover:text-white py-1">
              <Phone className="h-3.5 w-3.5" /> Call Dispatch
            </button>
            <button onClick={() => { setFabOpen(false); triggerToast('Message dispatch thread opened.'); }} className="flex items-center gap-2 text-slate-350 hover:text-white py-1">
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
              className={`flex items-center gap-2 py-1 ${voiceRecording ? 'text-red-400 font-bold animate-pulse' : 'text-slate-355 hover:text-white'}`}
            >
              <Mic className="h-3.5 w-3.5" /> {voiceRecording ? 'Recording...' : 'Voice Note'}
            </button>

            <button 
              onClick={() => {
                setVoiceText('Driver en route to stop sequence 2.');
                triggerToast('Transcribed: "Driver en route to stop sequence 2."');
              }}
              className="flex items-center gap-2 text-slate-355 hover:text-white py-1 border-t border-[#23324C]/40 pt-1.5"
            >
              <PenTool className="h-3.5 w-3.5" /> Voice-to-Text
            </button>

            {voiceText && (
              <div className="p-2 bg-slate-900 border border-[#23324C] rounded text-[10px] text-brand-400 italic">
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

    </div>
  );
}
