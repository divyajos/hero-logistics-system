import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads, updateLoadStatus } from '../../store/slices/loadsSlice';
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

  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Fuel');
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState('');

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

  // Active Job states
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [podUploaded, setPodUploaded] = useState(false);

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchLoads());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Find active driver load
  const activeLoad = loads.find(l => l.status === 'Transit' || l.status === 'Scheduled') || loads[0] || {
    id: 1,
    loadId: 'LD-9411',
    cargo: 'Automotive Components (Flatbed)',
    route: 'Chicago IL ➔ Dallas TX',
    driver: 'John D.',
    weight: '42,000 lbs',
    status: 'Transit',
    eta: '3 hours'
  };

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
        </div>
      )}

      {activeTab === 'pickup-delivery' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
          <h3 className="text-sm font-extrabold text-white">Pickup / Delivery Steps</h3>
          
          <div className="space-y-4">
            {/* Step 1: Pickup */}
            <div className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <strong className="text-white text-xs block">1. Confirm Cargo Pickup</strong>
                <span className="text-[10px] text-slate-400">Log terminal gates departure</span>
              </div>
              {pickupConfirmed ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Logged</span>
              ) : (
                <Button size="sm" variant="primary" onClick={handleConfirmPickup}>Confirm</Button>
              )}
            </div>

            {/* Step 2: Delivery */}
            <div className={`p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl flex items-center justify-between gap-4 ${!pickupConfirmed ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-0.5">
                <strong className="text-white text-xs block">2. Confirm Cargo Delivery</strong>
                <span className="text-[10px] text-slate-400">Log terminal dropoff gates arrival</span>
              </div>
              {deliveryConfirmed ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Logged</span>
              ) : (
                <Button size="sm" variant="primary" onClick={handleConfirmDelivery}>Confirm</Button>
              )}
            </div>
          </div>
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
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="This Month Earnings" value="$4,820" description="Completed runs payouts" progress={92} />
            <StatCard title="Awaiting Payroll Cashout" value="$1,420" description="Awaiting billing run" progress={100} />
          </div>
          
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
            <h3 className="text-sm font-extrabold text-white mb-3">Weekly Hours Logged timeline</h3>
            <MiniChart type="line" data={[32, 40, 38, 42, 45, 40]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
          </div>
        </div>
      )}

    </div>
  );
}
