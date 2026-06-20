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
import { Layers, MapPin, Database, Award, Check, Truck, QrCode, AlertTriangle } from 'lucide-react';

export default function YardAttendantDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const gateLogs = useSelector((state) => state.warehouse.gateLogs);

  // Form Fields
  const [trailerPlate, setTrailerPlate] = useState('');
  const [gateActionType, setGateActionType] = useState('Gate-In');
  const [driverName, setDriverName] = useState('');

  // Move Asset Form
  const [relocateTrailer, setRelocateTrailer] = useState('');
  const [relocateOrigin, setRelocateOrigin] = useState('Chicago A-2');
  const [relocateDest, setRelocateDest] = useState('Gate 4 Dock');

  // Inspection Report Forms
  const [issueType, setIssueType] = useState('Damage'); // Damage, Missing Item
  const [inspectedTrailer, setInspectedTrailer] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('Medium');

  // Local lists states
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Spot Trailer TR-9410 to Gate 4', desc: 'Dock unloading request from warehouse team', status: 'Pending' },
    { id: 2, title: 'Audit Seal locks for TR-1102', desc: 'Verify container security codes before departure', status: 'Pending' },
    { id: 3, title: 'Check damage report for TR-4809', desc: 'Verify reported rear bumper dent specs', status: 'Completed' }
  ]);

  const [reports, setReports] = useState([
    { id: 1, type: 'Damage', trailer: 'TR-7712', details: 'Rear container door seal torn. Water leak risk.', severity: 'High', date: '06/19/2026' },
    { id: 2, type: 'Missing Item', trailer: 'TR-1102', details: 'Load securing chains missing from rear locker box.', severity: 'Low', date: '06/18/2026' }
  ]);

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Task Complete
  const handleCompleteTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
    triggerToast('Attendant task logged as completed.');
  };

  // Move Trailer
  const handleMoveTrailer = (e) => {
    e.preventDefault();
    if (!relocateTrailer) return;
    triggerToast(`Trailer ${relocateTrailer} relocated from ${relocateOrigin} to ${relocateDest}.`);
    setRelocateTrailer('');
  };

  // Gate Scan In/Out
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

    setTrailerPlate('');
    setDriverName('');
    triggerToast(`Gate Container logged: ${gateActionType} registered.`);
  };

  // Safety inspection reports
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
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Yard Attendant • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Perform gate checks, inspect trailers, and log spotted containers.</p>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Trailers Spotted" value="14 Container Units" description="Active parking grid layout" progress={56} />
            <StatCard title="Gate events today" value={gateLogs.length} description="Gate Inward/Outward logs" trend="+2 checks" trendDirection="up" />
            <StatCard title="Yard capacity" value="56%" description="Parking slots occupied" progress={56} />
            <StatCard title="Pending Tasks" value={tasks.filter(t => t.status === 'Pending').length} description="Queue checklists active" trend="Action item" trendDirection="neutral" />
          </div>

          {/* Task Queue list */}
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Spotted Relocator Task Queue</h3>
            <div className="divide-y divide-[#23324C]/40">
              {tasks.map(task => (
                <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <strong className="text-white text-xs block">{task.title}</strong>
                    <p className="text-slate-400 text-xs">{task.desc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={task.status} />
                    {task.status === 'Pending' && (
                      <Button size="sm" variant="secondary" icon={Check} onClick={() => handleCompleteTask(task.id)}>
                        Complete Task
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Move Asset Screen */}
      {activeTab === 'move-asset' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Relocate spotted container</h3>
            <form onSubmit={handleMoveTrailer} className="space-y-4">
              <TextInput label="Trailer Container plate ID" required placeholder="e.g. TR-9410" value={relocateTrailer} onChange={(e) => setRelocateTrailer(e.target.value)} />
              <TextInput label="Origin Spot Lane" required value={relocateOrigin} onChange={(e) => setRelocateOrigin(e.target.value)} />
              <TextInput label="Destination Spot Lane" required value={relocateDest} onChange={(e) => setRelocateDest(e.target.value)} />
              
              <Button type="submit" variant="primary" className="w-full">
                Relocate spotted container
              </Button>
            </form>
          </div>

          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[360px] lg:h-auto min-h-[300px]">
            <div>
              <h3 className="text-sm font-extrabold text-white mb-1">Visual Spotting Map Preview</h3>
              <p className="text-[10px] text-slate-500">Live container parking grid zones.</p>
            </div>
            <div className="flex-grow bg-[#0B0F19] border border-[#23324C] rounded-xl flex items-center justify-center my-4 relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              <div className="absolute top-10 left-10 p-2.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 font-mono text-[9px] font-bold rounded-lg select-none">
                TR-9410 (Dock 4)
              </div>
              <div className="absolute bottom-10 right-10 p-2.5 bg-[#161F30] border border-[#23324C] text-slate-400 font-mono text-[9px] font-bold rounded-lg select-none">
                TR-1102 (Spotted A-2)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gate scan screens */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Scan forms */}
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Log Gate container event</h3>
            
            <form onSubmit={handleGateScanAction} className="space-y-4">
              <TextInput label="Trailer Container plate ID" required placeholder="e.g. TR-9410" value={trailerPlate} onChange={(e) => setTrailerPlate(e.target.value)} />
              <TextInput label="Hauling Driver Name" required placeholder="e.g. John D." value={driverName} onChange={(e) => setDriverName(e.target.value)} />
              <SelectInput label="Gate Event Action" value={gateActionType} onChange={(e) => setGateActionType(e.target.value)} options={[
                { value: 'Gate-In', label: 'Gate-In Container Log' },
                { value: 'Gate-Out', label: 'Gate-Out Container Log' }
              ]} />
              
              <Button type="submit" variant="primary" className="w-full">
                Save Gate Entry
              </Button>
            </form>
          </div>

          {/* Gate Logs list */}
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

      {/* Safety Damage and missing item reports */}
      {activeTab === 'inspections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Add inspection report form */}
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
              <FileUploader label="Upload Inspections photo evidence" />
              
              <Button type="submit" variant="primary" className="w-full">
                Log Safety Report
              </Button>
            </form>
          </div>

          {/* safety logs list */}
          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Active Safety Issues Index</h3>
            
            <div className="divide-y divide-[#23324C]/40">
              {reports.map(rep => (
                <div key={rep.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-4">
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        rep.type === 'Damage' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {rep.type}
                      </span>
                      <strong className="text-white">Trailer: {rep.trailer}</strong>
                    </div>
                    <p className="text-slate-400">{rep.details}</p>
                    <span className="text-[9px] text-slate-500 font-semibold font-mono block">Logged date: {rep.date}</span>
                  </div>

                  <span className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border ${
                    rep.severity === 'High' 
                      ? 'border-red-500/30 text-red-400 bg-red-500/5' 
                      : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                  }`}>
                    {rep.severity} Severity
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
