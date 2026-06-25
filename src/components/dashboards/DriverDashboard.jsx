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
  DollarSign, ShieldAlert, Plus, Upload, Heart, Lock
} from 'lucide-react';

export default function DriverDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { items: loads } = useSelector((state) => state.loads);
  const { user } = useSelector((state) => state.auth);
  const { fleet } = useSelector((state) => state.vehicles);
  const { customerInstructions } = useSelector((state) => state.customers);
  const { permissions, aiQueue, resolveAiItem } = useLogistics();

  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Fuel');
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState('');
  const [odometerReading, setOdometerReading] = useState('124,500');
  const [odometerPhotoUrl, setOdometerPhotoUrl] = useState('');

  // Local DB lists states
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Fuel', amount: '$320.00', status: 'Approved', date: '06/18/2026' },
    { id: 2, category: 'Tolls', amount: '$42.50', status: 'Pending', date: '06/19/2026' }
  ]);

  const [complianceChecks, setComplianceChecks] = useState({
    brakeInspection: true,
    tirePressure: true,
    loadStrapsSecured: false,
    hazardKitVerified: true
  });

  // Active Job & Stop-wise States
  const [stopArrived, setStopArrived] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState({});
  const [stopPhotoUploaded, setStopPhotoUploaded] = useState(false);
  const [stopSignature, setStopSignature] = useState('');
  const [podUploaded, setPodUploaded] = useState(false);
  const [acknowledgedIns, setAcknowledgedIns] = useState({});

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

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
  const activeLoad = loads.find(l => l.status === 'Assigned' || l.status === 'Accepted' || l.status === 'Transit' || l.status === 'Scheduled') || loads[0] || {
    id: 1,
    loadId: 'LD-9411',
    cargo: 'Automotive Components (Flatbed)',
    route: 'Chicago IL ➔ Dallas TX',
    driver: 'John D.',
    weight: '42,000 lbs',
    status: 'Transit',
    eta: '3 hours'
  };

  const stops = activeLoad.stops && activeLoad.stops.length > 0 ? activeLoad.stops : [
    { id: 1, address: activeLoad.pickupAddress || 'Chicago Origin', type: 'Pickup', itemIds: (activeLoad.items || []).map(i => i.id), status: 'Pending', sequence: 1, notes: 'Log origin terminal departure.' },
    { id: 2, address: activeLoad.deliveryAddress || 'Dallas Destination', type: 'Delivery', itemIds: (activeLoad.items || []).map(i => i.id), status: 'Pending', sequence: 2, notes: 'Drop off and verify cargo seals.' }
  ];

  const currentStopIndex = stops.findIndex(s => s.status !== 'Completed');
  const currentStop = currentStopIndex !== -1 ? stops[currentStopIndex] : null;

  useEffect(() => {
    setStopArrived(false);
    setVerifiedItems({});
    setStopPhotoUploaded(false);
    setStopSignature('');
    setAcknowledgedIns({});
  }, [currentStopIndex]);

  // Triggers
  const handleConfirmPickup = () => {
    setPickupConfirmed(true);
    triggerToast('Pickup departure logged to dispatcher.');
  };

  const handleConfirmDelivery = () => {
    setDeliveryConfirmed(true);
    dispatch(updateLoadStatus({ id: activeLoad.id, status: 'Delivered' }));
    triggerToast('Delivery cargo dropped off.');
  };

  const handlePodUploadSuccess = (url) => {
    setPodUploaded(true);
    dispatch(updateLoadStatus({ id: activeLoad.id, status: 'Delivered' }));
    triggerToast('POD Document uploaded. Cargo status closed.');
  };

  const handleComplianceSubmit = () => {
    if (!odometerReading.trim()) {
      triggerToast('Please provide an odometer reading.', 'error');
      return;
    }
    dispatch(updateLoadStatus({
      id: activeLoad.id,
      complianceChecked: true,
      complianceCompletedAt: new Date().toISOString(),
      complianceChecklist: complianceChecks,
      odometerReading,
      odometerPhoto: odometerPhotoUrl || 'https://hero-mock-storage.s3.amazonaws.com/uploads/default_odometer.jpg',
      statusNote: 'Pre-trip compliance checks completed by driver.'
    }));

    const vehicleObj = fleet.find(v => v.plate === activeLoad.vehicle);
    if (vehicleObj) {
      dispatch(updateVehicle({
        id: vehicleObj.id,
        odometer: odometerReading,
        odometerPhoto: odometerPhotoUrl || 'https://hero-mock-storage.s3.amazonaws.com/uploads/default_odometer.jpg',
        complianceChecked: true,
        complianceCompletedAt: new Date().toISOString(),
        complianceChecklist: complianceChecks
      }));
    }
    triggerToast('Compliance logs submitted and synced successfully.');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
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
    triggerToast('Expense receipt uploaded for approval.');
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-left pb-12">
      
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Driver Title */}
      <div className="flex items-center justify-between border-b border-[#23324C]/60 pb-4">
        <div>
          <h2 className="text-lg font-black text-white">Driver Portal • {activeTab.replace('-', ' ')}</h2>
          <p className="text-[10px] text-slate-400">ELD & logistics operations controls.</p>
        </div>
        <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
          <Compass className="h-5 w-5 animate-spin-slow" />
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Completed Trips" value="48 Runs" description="Monthly target" progress={80} />
            <StatCard title="Active Duty ELD" value="6.5 hrs" description="Drive time limit" progress={65} />
          </div>

          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">My Active Job Target</span>
              <StatusBadge status={activeLoad.status} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                {activeLoad.loadId || `LD-${activeLoad.id}`} • {activeLoad.cargo}
              </h3>
              <p className="text-slate-400 text-xs mt-1">Route Path: {activeLoad.route} • {activeLoad.weight}</p>
            </div>
            
            <div className="border-t border-[#23324C]/60 pt-3 flex gap-2">
              <MapPin className="h-4.5 w-4.5 text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block">Deliver to Terminal Dropoff</span>
                <span className="text-slate-300 font-semibold text-xs">{activeLoad.route.split('➔')[1] || 'Dallas Terminal'}</span>
              </div>
            </div>
          </div>

          {/* Create Draft Load Button - Permission-based */}
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-center space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Driver Dispatch Submission</h4>
            {permissions.driverCreateDraftLoad ? (
              <button 
                onClick={() => triggerToast('Draft load creation form opened (Simulated).')}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Create Draft Load
              </button>
            ) : (
              <button 
                disabled 
                className="w-full py-2.5 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" /> Create Draft Load (Permission Blocked)
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'start-finish' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-center space-y-4">
            <h3 className="text-sm font-extrabold text-white">Start / Finish Work Shift</h3>
            <p className="text-xs text-slate-400">Clock in/out of active duty shift to sync with company payroll sheets.</p>
            <div className="flex gap-2">
              <Button variant="success" className="w-full font-bold" onClick={() => triggerToast('Clock-in shift registered.')}>
                Start Work
              </Button>
              <Button variant="danger" className="w-full font-bold" onClick={() => triggerToast('Clock-out shift registered.')}>
                Finish Work
              </Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Truck & Trailer Pre-Trip Verification</h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#111827]/40 border border-[#23324C] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned Truck</span>
                  <strong className="text-white text-xs">TX-ROAD88 (Semi-Truck)</strong>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="primary" onClick={() => triggerToast('Truck TX-ROAD88 confirmed.')}>Confirm Truck</Button>
                  <Button size="xs" variant="outline" onClick={() => triggerToast('Change Truck requested.')}>Change Truck</Button>
                </div>
              </div>
              <div className="p-3 bg-[#111827]/40 border border-[#23324C] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned Trailer</span>
                  <strong className="text-white text-xs">TR-4022 (Dry Van)</strong>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="primary" onClick={() => triggerToast('Trailer TR-4022 confirmed.')}>Confirm Trailer</Button>
                  <Button size="xs" variant="outline" onClick={() => triggerToast('Change Trailer requested.')}>Change Trailer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create-draft-load' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Create Draft Shipment</h3>
          <div className="space-y-3">
            <TextInput label="Shipper Name" required placeholder="Vance Refrigeration" id="dr-draft-cust" />
            <TextInput label="Route Path Details" required placeholder="Chicago ➔ Dallas" id="dr-draft-route" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="w-full" onClick={() => triggerToast('Draft shipment registered.')}>
                Create Draft Load
              </Button>
              <Button variant="success" className="w-full" onClick={() => triggerToast('Draft load submitted to dispatcher review.')}>
                Submit Draft for Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'add-expense' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Add Toll / Fuel Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <TextInput label="Amount Spent (USD)" required type="number" placeholder="150" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
            <SelectInput label="Expense Category" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} options={[
              { value: 'Fuel', label: 'Fuel Purchase' },
              { value: 'Tolls', label: 'Tolls/Highway charges' },
              { value: 'Meals', label: 'Meals / Layovers' }
            ]} />
            <div className="p-4 bg-slate-900 border border-dashed border-[#23324C] rounded-xl text-center cursor-pointer" onClick={() => triggerToast('Mock Receipt file uploaded.')}>
              <Upload className="h-5 w-5 mx-auto text-slate-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold block">Upload Receipt Image</span>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Add Expense
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'pickup-delivery' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Sequential Stops Route</h3>
            <span className="text-[10px] text-slate-450 font-bold font-mono">
              Stop {currentStopIndex !== -1 ? currentStopIndex + 1 : stops.length} of {stops.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pb-4 border-b border-[#23324C]/40">
            {activeLoad.status === 'Assigned' ? (
              <Button size="xs" variant="success" onClick={() => {
                dispatch(updateLoadStatus({
                  id: activeLoad.id,
                  status: 'Accepted',
                  acceptedBy: user?.name || activeLoad.driver || 'John D.',
                  acceptedAt: new Date().toISOString(),
                  statusNote: 'Driver accepted job.'
                }));
                triggerToast('Job accepted. Status set to Accepted.');
              }}>Accept Job</Button>
            ) : activeLoad.status === 'Accepted' ? (
              <Button size="xs" variant="success" disabled>Job Accepted</Button>
            ) : null}
            <Button size="xs" variant="primary" onClick={() => triggerToast('Navigation instructions loaded...')}>Navigate</Button>
            <Button size="xs" variant="secondary" onClick={() => triggerToast('Pickup sequence started.')}>Start Pickup</Button>
            <Button size="xs" variant="danger" onClick={() => triggerToast('Damage exception form loaded.')}>Mark Damage</Button>
            <Button size="xs" variant="secondary" onClick={() => triggerToast('Delivery leg started.')}>Start Delivery</Button>
            <Button size="xs" variant="outline" onClick={() => triggerToast('Job chat console opened.')}>Open Job Chat</Button>
            <Button size="xs" variant="outline" onClick={() => triggerToast('Message driver flow opened.')}>Message Driver</Button>
          </div>
          
          {currentStop ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-wide">
                    Stop #{currentStop.sequence} • {currentStop.type}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">In Progress</span>
                </div>
                
                <div>
                  <strong className="text-white text-xs block font-bold">{currentStop.address}</strong>
                  {currentStop.notes && <p className="text-[10px] text-slate-450 mt-1">{currentStop.notes}</p>}
                </div>

                {/* Linked Customer Instructions Alert */}
                {(() => {
                  const matching = (customerInstructions || []).filter(ins => {
                    if (!currentStop) return false;
                    const scopeLower = ins.scope.toLowerCase();
                    
                    if (activeLoad.customerName && scopeLower.includes(activeLoad.customerName.toLowerCase())) {
                      return true;
                    }
                    if (activeLoad.loadId && scopeLower.includes(activeLoad.loadId.toLowerCase())) {
                      return true;
                    }
                    if (currentStop.address && scopeLower.includes(currentStop.address.toLowerCase())) {
                      return true;
                    }
                    
                    const match = ins.scope.match(/\(([^)]+)\)/);
                    if (match && match[1]) {
                      const scopeVal = match[1].toLowerCase();
                      if (currentStop.address && currentStop.address.toLowerCase().includes(scopeVal)) return true;
                    }
                    return false;
                  });

                  if (matching.length === 0) return null;

                  return (
                    <div className="mt-3 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-2.5">
                      <span className="text-[9px] font-black text-brand-400 uppercase tracking-wider block">Special Stop Instructions</span>
                      <div className="space-y-2 text-xs">
                        {matching.map((ins) => (
                          <div key={ins.id} className={`border-b border-[#23324C]/25 pb-2 last:border-0 last:pb-0 ${
                            ins.isCritical ? 'p-2 bg-red-500/10 border border-red-500/25 rounded-lg' : ''
                          }`}>
                            <div className="flex justify-between items-center text-[8px] text-slate-450 font-bold mb-0.5">
                              <span className={ins.isCritical ? 'text-red-400 font-extrabold' : 'text-slate-400'}>
                                {ins.isCritical ? '⚠️ CRITICAL ACTION REQUIRED' : ins.type}
                              </span>
                              <span className="font-mono text-slate-500">{ins.scope}</span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${ins.isCritical ? 'text-red-200 font-black' : 'text-slate-200'}`}>"{ins.text}"</p>
                            
                            {ins.isCritical && (
                              <label className="flex items-center gap-2 mt-2 p-1.5 bg-[#0b0f19]/80 border border-red-500/20 rounded-md cursor-pointer select-none text-[9px] font-bold text-red-455 transition-colors hover:bg-[#111827]">
                                <input
                                  type="checkbox"
                                  checked={!!acknowledgedIns[ins.id]}
                                  onChange={(e) => setAcknowledgedIns({ ...acknowledgedIns, [ins.id]: e.target.checked })}
                                  className="rounded border-red-500/40 text-red-500 focus:ring-red-500 h-3.5 w-3.5 cursor-pointer"
                                />
                                <span>I have read and acknowledge this critical instruction.</span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 1. Stop Arrival Check-in */}
                <div className="border-t border-[#23324C]/45 pt-3.5">
                  {(() => {
                    const unacknowledgedCritical = (customerInstructions || []).some(ins => {
                      if (!currentStop) return false;
                      const scopeLower = ins.scope.toLowerCase();
                      
                      let isMatch = false;
                      if (activeLoad.customerName && scopeLower.includes(activeLoad.customerName.toLowerCase())) isMatch = true;
                      if (activeLoad.loadId && scopeLower.includes(activeLoad.loadId.toLowerCase())) isMatch = true;
                      if (currentStop.address && scopeLower.includes(currentStop.address.toLowerCase())) isMatch = true;
                      
                      const match = ins.scope.match(/\(([^)]+)\)/);
                      if (match && match[1]) {
                        const scopeVal = match[1].toLowerCase();
                        if (currentStop.address && currentStop.address.toLowerCase().includes(scopeVal)) isMatch = true;
                      }
                      
                      return isMatch && ins.isCritical && !acknowledgedIns[ins.id];
                    });

                    return (
                      <>
                        <label className={`flex items-center justify-between p-2.5 bg-[#161F30]/40 border border-[#23324C]/60 hover:border-brand-500/15 rounded-xl cursor-pointer select-none text-xs font-semibold text-slate-300 transition-all ${unacknowledgedCritical ? 'opacity-40 pointer-events-none' : ''}`}>
                          <span>Arrived & Checked-in at Stop</span>
                          <input
                            type="checkbox"
                            checked={stopArrived}
                            disabled={unacknowledgedCritical}
                            onChange={(e) => setStopArrived(e.target.checked)}
                            className="rounded border-[#23324C] text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer"
                          />
                        </label>
                        {unacknowledgedCritical && (
                          <p className="text-[9px] text-red-400 font-bold mt-1 text-center">
                            ⚠️ Acknowledge all critical instructions above to check in.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* 2. Stop Items checklist */}
                <div className="border-t border-[#23324C]/45 pt-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Verify Cargo Items / Assets</span>
                  
                  {/* Filter items for current stop */}
                  {(activeLoad.items || []).filter(item => (currentStop.itemIds || []).includes(item.id)).length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic py-1 pl-1">No items to verify at this stop.</p>
                  ) : (
                    (activeLoad.items || []).filter(item => (currentStop.itemIds || []).includes(item.id)).map(item => (
                      <label key={item.id} className={`flex items-center justify-between p-2.5 bg-slate-900 border border-[#23324C]/40 hover:border-brand-500/10 rounded-xl cursor-pointer select-none text-[11px] font-semibold text-slate-200 transition-all ${!stopArrived ? 'opacity-40 pointer-events-none' : ''}`}>
                        <span>{item.name} ({item.weight || 'N/A'})</span>
                        <input
                          type="checkbox"
                          checked={!!verifiedItems[item.id]}
                          disabled={!stopArrived}
                          onChange={(e) => setVerifiedItems({ ...verifiedItems, [item.id]: e.target.checked })}
                          className="rounded border-[#23324C] text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                        />
                      </label>
                    ))
                  )}
                </div>

                {/* 3. Damage Photo Capture */}
                <div className={`border-t border-[#23324C]/45 pt-3 space-y-1.5 ${!stopArrived ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Stop Photo Verification (POD / Exception)</span>
                  <Button
                    type="button"
                    variant={stopPhotoUploaded ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full text-[11px] font-bold"
                    disabled={!stopArrived}
                    onClick={() => {
                      setStopPhotoUploaded(true);
                      triggerToast('Stop cargo photo uploaded.');
                    }}
                  >
                    {stopPhotoUploaded ? 'Photo Uploaded ✓' : 'Upload Stop Photo'}
                  </Button>
                </div>

                {/* 4. Signature Capture */}
                <div className={`border-t border-[#23324C]/45 pt-3 space-y-1.5 ${!stopArrived ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Stop Digital Signature Sign-off</span>
                  <TextInput
                    placeholder="Type receiver's name..."
                    value={stopSignature}
                    disabled={!stopArrived}
                    onChange={(e) => setStopSignature(e.target.value)}
                    className="!py-2 text-xs"
                  />
                </div>

                {/* Complete Stop Button */}
                <Button
                  type="button"
                  variant="primary"
                  className="w-full py-2.5 text-xs font-black capitalize mt-2 shadow-lg cursor-pointer"
                  disabled={
                    !stopArrived || 
                    (activeLoad.items || []).filter(item => (currentStop.itemIds || []).includes(item.id)).some(item => !verifiedItems[item.id]) ||
                    !stopSignature.trim()
                  }
                  onClick={() => {
                    const updatedStops = stops.map(s => s.id === currentStop.id ? { ...s, status: 'Completed' } : s);
                    const allCompleted = updatedStops.every(s => s.status === 'Completed');
                    
                    if (allCompleted) {
                      dispatch(updateLoadStatus({
                        id: activeLoad.id,
                        status: 'Delivered',
                        stops: updatedStops,
                        statusNote: `All stops completed sequentially. Signature collected from ${stopSignature}.`
                      }));
                      setPodUploaded(true);
                      triggerToast('Load completed and Delivered successfully!');
                    } else {
                      dispatch(updateLoadStatus({
                        id: activeLoad.id,
                        stops: updatedStops,
                        statusNote: `Stop #${currentStop.sequence} completed. Signed by: ${stopSignature}.`
                      }));
                      triggerToast(`Stop #${currentStop.sequence} completed.`);
                    }
                  }}
                >
                  Complete Stop #{currentStop.sequence}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl text-center space-y-4">
              <CheckCircle className="h-6 w-6 mx-auto mb-1" />
              <p>All stops have been completed sequentially.</p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono">Load Status: {activeLoad.status}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="primary" className="w-full" onClick={() => triggerToast('Tap-to-pay transaction successful.')}>
                  Take Tap Payment
                </Button>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => triggerToast('Receipt successfully sent to customer.')}>
                  Send Receipt
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pod' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Proof of Delivery (POD)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Upload signed BOL or delivery receipts to close this load manifest.</p>
          
          {podUploaded ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
              <CheckCircle className="h-4.5 w-4.5" /> POD Document uploaded successfully.
            </div>
          ) : (
            <FileUploader onUploadSuccess={handlePodUploadSuccess} label="Upload Receipts / signed BOLs" />
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Uploader Form */}
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Log Trip Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <TextInput label="Expense Amount (USD)" required type="number" step="0.01" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
              <SelectInput label="Expense Category" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} options={[
                { value: 'Fuel', label: 'Diesel Fuel Payout' },
                { value: 'Tolls', label: 'Interstate Tolls' },
                { value: 'Meals', label: 'Meals & Food' }
              ]} />
              <FileUploader label="Expense Receipt Attachment" onUploadSuccess={(url) => setExpenseReceiptUrl(url)} />
              <Button type="submit" variant="primary" className="w-full">
                Upload Expense File
              </Button>
            </form>
          </div>

          {/* AI Receipt confirmation widget */}
          {aiQueue.receipts.filter(item => item.status === 'pending').map((item) => (
            <div key={item.id} className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3.5">
              <div>
                <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wide block">AI Receipt Reader Results</span>
                <strong className="text-white text-xs block mt-1">Detected Expense: {item.data.amount} ({item.data.gallons})</strong>
                <span className="text-[9px] text-slate-500">Source: {item.source}</span>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px]">
                <button 
                  type="button"
                  onClick={() => triggerToast('Displaying raw fuel receipt image.')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Review AI Result
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    resolveAiItem('receipts', item.id, 'confirmed');
                    setExpenses([{ id: Date.now(), category: 'Fuel', amount: item.data.amount, status: 'Approved', date: new Date().toLocaleDateString() }, ...expenses]);
                    triggerToast('AI Receipt Confirmed & Approved.');
                  }}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-lg font-black transition-all cursor-pointer"
                >
                  Confirm
                </button>
                <button 
                  type="button"
                  onClick={() => triggerToast('Editing receipt values.')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    resolveAiItem('receipts', item.id, 'rejected');
                    triggerToast('AI Receipt Rejected.', 'warning');
                  }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}

          {/* Expense Log list */}
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
            <h3 className="text-sm font-extrabold text-white mb-3">Expense Log history</h3>
            <DataTable columns={[
              { key: 'category', label: 'Category', render: (row) => <span className="font-extrabold text-white">{row.category}</span> },
              { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono text-xs">{row.amount}</span> },
              { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
            ]} data={expenses} />
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">ELD Safety Inspection Checklist</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Complete daily vehicle inspection checklist before interstate logging runs.</p>
          <div className="p-4 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Odometer Reading Capture</span>
            <div className="flex gap-2 items-center">
              <TextInput 
                label="Odometer Mileage Reading" 
                placeholder="e.g. 124,500" 
                value={odometerReading} 
                onChange={(e) => setOdometerReading(e.target.value)} 
                className="flex-1"
              />
              <div className="pt-5">
                <Button size="sm" variant="outline" onClick={() => {
                  setOdometerPhotoUrl('https://hero-mock-storage.s3.amazonaws.com/uploads/odometer_upload_' + Date.now() + '.jpg');
                  triggerToast('Odometer photo uploaded successfully.');
                }}>
                  {odometerPhotoUrl ? 'Photo Uploaded ✓' : 'Upload Photo'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(complianceChecks).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-3 bg-[#111827]/60 border border-[#23324C] hover:border-brand-500/20 rounded-xl cursor-pointer transition-colors text-xs font-semibold text-slate-200">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => {
                    setComplianceChecks({ ...complianceChecks, [key]: e.target.checked });
                    triggerToast(`Checklist flag ${key} updated.`);
                  }}
                  className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div className="flex gap-2 border-t border-[#23324C]/45 pt-3.5">
            <Button variant="success" className="w-full font-bold text-xs" onClick={handleComplianceSubmit}>
              Complete Compliance
            </Button>
            <Button variant="primary" className="w-full font-bold text-xs" onClick={handleComplianceSubmit}>
              Submit Compliance
            </Button>
          </div>

          {/* AI Odometer confirmation widget */}
          {aiQueue.odometer.filter(item => item.status === 'pending').map((item) => (
            <div key={item.id} className="mt-4 p-4 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
              <div>
                <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wide block">AI Odometer Reading</span>
                <strong className="text-white text-xs block mt-1">Detected Reading: {item.data.detectedValue}</strong>
                <span className="text-[9px] text-slate-500">Source: {item.source}</span>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px]">
                <button 
                  type="button"
                  onClick={() => triggerToast(`Reviewing odometer photo: ${item.data.detectedValue}`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Review AI Result
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    resolveAiItem('odometer', item.id, 'confirmed');
                    triggerToast('Odometer reading Confirmed & Saved.');
                  }}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-lg font-black transition-all cursor-pointer"
                >
                  Confirm
                </button>
                <button 
                  type="button"
                  onClick={() => triggerToast('Editing detected value.')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    resolveAiItem('odometer', item.id, 'rejected');
                    triggerToast('Odometer reading Rejected.', 'warning');
                  }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Earnings & Settlement History (Priority 2) */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="This Month Earnings" value="$4,820" description="Completed runs payouts" progress={92} />
            <StatCard title="Awaiting Payroll Cashout" value="$1,420" description="Awaiting billing run" progress={100} />
          </div>
          
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Settlement History & Payments Log</h3>
            <DataTable columns={[
              { key: 'period', label: 'Pay Period', render: (row) => <span className="font-extrabold text-white">{row.period}</span> },
              { key: 'hours', label: 'Logged Hours', render: (row) => <span className="font-mono">{row.hours} hrs</span> },
              { key: 'amount', label: 'Settled Payout', render: (row) => <span className="font-mono font-bold text-brand-400">{row.amount}</span> },
              { key: 'date', label: 'Payment Date', render: (row) => <span className="text-slate-400 font-mono text-xs">{row.date}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
            ]} data={[
              { period: 'Jun 01 - Jun 15, 2026', hours: 82, amount: '$3,690.00', date: '06/15/2026', status: 'Paid' },
              { period: 'May 16 - May 31, 2026', hours: 78, amount: '$3,510.00', date: '05/31/2026', status: 'Paid' }
            ]} />
          </div>

          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
            <h3 className="text-sm font-extrabold text-white mb-3">Weekly Hours Logged timeline</h3>
            <MiniChart type="line" data={[32, 40, 38, 42, 45, 40]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
          </div>
        </div>
      )}

      {/* Driver Dispatch Chat Screen (Priority 2) */}
      {activeTab === 'chat' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="text-sm font-extrabold text-white mb-1">Dispatch Communication Chat</h3>
            <p className="text-[10px] text-slate-500">Live chat thread connected directly to dispatch team.</p>
          </div>

          <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
            <div className="p-3 bg-[#111827]/80 border border-[#23324C]/50 rounded-xl text-xs max-w-[85%] text-slate-350">
              <span className="text-[9px] text-slate-500 font-bold block mb-1">Dispatcher (Ops Desk)</span>
              Sarah, please confirm trailer change at Chicago Gate 4. LD-9411 is scheduled for immediate departure.
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

      {/* Driver Compliance Documents Vault (Priority 2) */}
      {activeTab === 'documents' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-white">Driver Document Vault</h3>
            <p className="text-xs text-slate-400">Keep standard licenses, medical clearances, and certificates up to date.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload form */}
            <div className="bg-[#111827]/60 border border-[#23324C] p-4.5 rounded-2xl space-y-4">
              <strong className="text-xs text-slate-200 block">Upload Verification Document</strong>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase mb-1 font-semibold">Document Category</label>
                  <select id="doc-type-sel" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none">
                    <option value="CDL License">Commercial Driver License (CDL)</option>
                    <option value="Medical Certificate">Medical Assessment Clearance</option>
                    <option value="Dangerous Goods Cert">Dangerous Goods Permit Badge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase mb-1 font-semibold">Expiry Date</label>
                  <input type="date" id="doc-exp-date" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none" />
                </div>
                <FileUploader onUploadSuccess={() => triggerToast('License document uploaded.')} />
              </div>
              <button 
                onClick={() => {
                  const t = document.getElementById('doc-type-sel').value;
                  const e = document.getElementById('doc-exp-date').value;
                  if (!e) { triggerToast('Please select expiry date.', 'error'); return; }
                  triggerToast(`Uploaded: ${t}. Expiration registered: ${e}`);
                }}
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black cursor-pointer"
              >
                Register Document
              </button>
            </div>

            {/* List of uploaded documents */}
            <div className="space-y-3">
              <strong className="text-xs text-slate-200 block">Active Verified Credentials</strong>
              {[
                { name: 'Commercial CDL Class A', exp: '2027-12-30', state: 'Valid' },
                { name: 'FAA Medical Certificate', exp: '2026-09-18', state: 'Valid' },
                { name: 'HAZMAT Endorsement Badge', exp: '2026-07-02', state: 'Expiring Soon' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 border border-[#23324C]/45 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-white block font-bold">{doc.name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Expires: {doc.exp}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    doc.state === 'Valid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'
                  }`}>{doc.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
