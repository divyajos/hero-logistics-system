import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, Search, XCircle, Filter, FileText } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import SelectInput from '../common/SelectInput';
import Pagination from '../common/Pagination';
import StatCard from '../common/StatCard';
import Toast from '../common/Toast';
import Modal from '../common/Modal';
import TextInput from '../common/TextInput';
import Button from '../common/Button';
import { useLogistics } from '../../context/LogisticsContext';

export default function AlertsReminders({ globalSearchQuery = '', addAlertModalOpen, setAddAlertModalOpen }) {
  const { triggerToast } = useLogistics();
  const [isSavingAlert, setIsSavingAlert] = React.useState(false);
  const [editingAlertId, setEditingAlertId] = React.useState(null);
  const [newAlert, setNewAlert] = React.useState({
    title: '', category: 'Expense', desc: '', priority: 'Medium', assignTo: 'Company', relatedItem: '', dueDate: '', reminderDate: '', status: 'Pending', actionRequired: 'Review', notes: ''
  });

  // Expanded dummy data covering the requested categories
  const defaultAlerts = [
    { id: 1, category: 'Expense Reminders', type: 'fuel', title: 'Fuel Payment Due', desc: 'Fuel invoice #FL-9021 from Pilot Flying J due. Vehicle: VH-1102.', amount: 4200, dueDate: 'In 2 days', status: 'Pending', severity: 'warning' },
    { id: 2, category: 'Fuel Payment Due', type: 'toll', title: 'Toll Account Auto-Refill', desc: 'E-ZPass Toll account balance low ($25). Auto-refill scheduled.', amount: 250, dueDate: 'Tomorrow', status: 'Pending', severity: 'warning' },
    { id: 3, category: 'Driver Reimbursement Requests', type: 'reimbursement', title: 'Driver Reimbursement Request', desc: 'Reimbursement request #RE-8821 for driver Sarah K. (fuel + parking).', amount: 340, dueDate: 'Immediate', status: 'Pending', severity: 'critical' },
    { id: 4, category: 'Vehicle Maintenance Due', type: 'maintenance', title: 'Vehicle Maintenance Expense', desc: 'Preventative B-service maintenance scheduled for Vehicle VH-1044.', amount: 1200, dueDate: 'In 5 days', status: 'Pending', severity: 'warning' },
    { id: 5, category: 'Insurance Renewal', type: 'insurance', title: 'Insurance Premium', desc: 'Monthly fleet liability insurance premium payment due today.', amount: 8500, dueDate: 'Overdue', status: 'Overdue', severity: 'critical' },
    { id: 6, category: 'Driver License Expiry', type: 'license', title: 'CDL Expiry Alert', desc: 'John Doe CDL expires in 14 days.', amount: null, dueDate: 'In 14 days', status: 'Pending', severity: 'warning' },
    { id: 7, category: 'Compliance Alerts', type: 'compliance', title: 'DOT Inspection Due', desc: 'Annual DOT inspection due for Trailer TR-442.', amount: null, dueDate: 'Tomorrow', status: 'Pending', severity: 'critical' },
    { id: 8, category: 'Customer Invoice Due', type: 'invoice', title: 'Global Retail Corp Invoice', desc: 'Invoice #INV-9099 overdue by 5 days.', amount: 12400, dueDate: 'Overdue', status: 'Overdue', severity: 'critical' },
  ];

  const [alerts, setAlerts] = React.useState(() => {
    const saved = localStorage.getItem('hero_alerts_data');
    return saved ? JSON.parse(saved) : defaultAlerts;
  });

  React.useEffect(() => {
    localStorage.setItem('hero_alerts_data', JSON.stringify(alerts));
  }, [alerts]);

  // Remove local search since we use globalSearchQuery
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 10;

  // Derived states
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || a.desc.toLowerCase().includes(globalSearchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');
  const criticalAlerts = alerts.filter(a => a.status !== 'Resolved' && (a.severity === 'critical' || a.status === 'Overdue'));

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const displayedAlerts = filteredAlerts.slice((currentPage - 1) * alertsPerPage, currentPage * alertsPerPage);

  const getIconForType = (type) => {
    switch(type) {
      case 'fuel': return '⛽';
      case 'toll': return '🛣️';
      case 'reimbursement': return '💵';
      case 'maintenance': return '🔧';
      case 'insurance': return '📄';
      case 'license': return '🪪';
      case 'compliance': return '🚨';
      case 'invoice': return '🧾';
      default: return '⚠️';
    }
  };

  const handleAction = (id, action, alertObj = null) => {
    if (action === 'resolve') {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
      triggerToast(`Resolved: ${alertObj?.title || 'Alert'}`);
    } else if (action === 'delay') {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, dueDate: 'Postponed', status: 'Postponed' } : a));
      triggerToast(`Postponed: ${alertObj?.title || 'Alert'}`);
    } else if (action === 'dismiss') {
      setAlerts(prev => prev.filter(a => a.id !== id));
      triggerToast(`Dismissed alert.`);
    } else if (action === 'edit' && alertObj) {
      setEditingAlertId(id);
      setNewAlert({
        title: alertObj.title,
        category: alertObj.category,
        desc: alertObj.desc,
        priority: alertObj.severity === 'critical' ? 'Critical' : alertObj.severity === 'warning' ? 'High' : 'Medium',
        assignTo: 'Company',
        relatedItem: '',
        dueDate: alertObj.dueDate === 'Overdue' || alertObj.dueDate === 'Immediate' || alertObj.dueDate === 'Tomorrow' || alertObj.dueDate.startsWith('In ') ? '' : alertObj.dueDate,
        reminderDate: '',
        status: alertObj.status,
        actionRequired: 'Review',
        notes: ''
      });
      setAddAlertModalOpen(true);
    }
  };

  const handleSaveAlert = (e) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.category || !newAlert.desc || !newAlert.dueDate) {
      triggerToast('Please complete all required fields.', 'error');
      return;
    }
    
    setIsSavingAlert(true);
    
    setTimeout(() => {
      const typeMapping = {
        'Expense': 'reimbursement',
        'Fleet': 'fuel',
        'Maintenance': 'maintenance',
        'Insurance': 'insurance',
        'Driver': 'license',
        'Compliance': 'compliance',
        'Customer': 'invoice',
        'Payroll': 'reimbursement',
        'Document': 'insurance',
        'Other': 'alert'
      };
      
      const alertData = {
        category: newAlert.category,
        type: typeMapping[newAlert.category] || 'alert',
        title: newAlert.title,
        desc: newAlert.desc,
        amount: null,
        dueDate: newAlert.dueDate,
        status: newAlert.status,
        severity: newAlert.priority === 'Critical' ? 'critical' : newAlert.priority === 'High' ? 'warning' : 'info'
      };

      if (editingAlertId) {
        setAlerts(alerts.map(a => a.id === editingAlertId ? { ...a, ...alertData } : a));
        triggerToast(`Alert updated: ${newAlert.title}`);
      } else {
        const newAlertItem = { id: Date.now(), ...alertData };
        setAlerts([newAlertItem, ...alerts]);
        triggerToast(`Alert created: ${newAlert.title}`);
      }

      setIsSavingAlert(false);
      setAddAlertModalOpen(false);
      setEditingAlertId(null);
      
      // Reset form
      setNewAlert({
        title: '', category: 'Expense', desc: '', priority: 'Medium', assignTo: 'Company', relatedItem: '', dueDate: '', reminderDate: '', status: 'Pending', actionRequired: 'Review', notes: ''
      });
    }, 600);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-brand-500" />
            Alerts & Reminders
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage all operational reminders and critical alerts across the company.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Active Alerts" value={activeAlerts.length} icon={<Bell className="text-brand-400 h-5 w-5" />} trend="+2" />
        <StatCard title="Critical / Overdue" value={criticalAlerts.length} icon={<AlertTriangle className="text-red-400 h-5 w-5" />} trend="High Priority" isNegative={criticalAlerts.length > 0} />
        <StatCard title="Pending Action" value={activeAlerts.length - criticalAlerts.length} icon={<Clock className="text-amber-400 h-5 w-5" />} trend="Requires review" />
      </div>

      <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64 flex items-center h-full">
              {/* Local search removed in favor of the global search bar in the header */}
              <span className="text-xs text-slate-500 font-medium">Use the global search bar above to filter by keyword.</span>
            </div>
            <div className="w-full sm:w-48">
              <SelectInput 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                options={[
                  'All', 'Expense Reminders', 'Fuel Payment Due', 'Driver Reimbursement Requests', 
                  'Vehicle Maintenance Due', 'Insurance Renewal', 'Driver License Expiry',
                  'Compliance Alerts', 'Customer Invoice Due'
                ]}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-red-400 self-end sm:self-auto">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold">
              {activeAlerts.length} Active Alerts
            </span>
          </div>
        </div>
        
        {/* Alerts Grid (Same styling as requested) */}
        {displayedAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">No alerts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {displayedAlerts.map(rem => (
              <div key={rem.id} className={`p-3.5 border rounded-xl flex flex-col justify-between space-y-3 transition-all ${
                rem.status === 'Resolved' 
                  ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60' 
                  : rem.status === 'Overdue' || rem.severity === 'critical'
                  ? 'border-red-500/30 bg-red-500/5 shadow-md shadow-red-500/5'
                  : 'border-[#23324C]/60 bg-slate-900/40 hover:border-brand-500/20'
              }`}>
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-lg">
                      {getIconForType(rem.type)}
                    </span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      rem.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                      rem.status === 'Overdue' ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse' :
                      'bg-brand-500/10 text-brand-400 border-brand-500/25'
                    }`}>
                      {rem.dueDate}
                    </span>
                  </div>
                  <strong className="block text-slate-200 text-xs truncate mt-1">{rem.title}</strong>
                  <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 h-7">{rem.desc}</p>
                  {rem.amount !== null && (
                    <strong className="block text-white text-xs mt-1 font-mono">${rem.amount.toLocaleString()}</strong>
                  )}
                </div>
                
                {rem.status !== 'Resolved' ? (
                  <div className="flex gap-1.5 pt-1.5 border-t border-[#23324C]/30 mt-1 text-[9px]">
                    <button 
                      type="button"
                      onClick={() => handleAction(rem.id, 'resolve', rem)}
                      className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg cursor-pointer hover:bg-emerald-600 transition-all text-center border-none"
                    >
                      {rem.type === 'fuel' || rem.type === 'reimbursement' || rem.type === 'maintenance' || rem.type === 'toll' || rem.type === 'insurance' ? 'Pay' : 'Resolve'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAction(rem.id, 'edit', rem)}
                      className="py-1.5 px-2 bg-slate-800 text-slate-300 font-bold rounded-lg cursor-pointer hover:bg-slate-700 transition-all border border-[#23324C]"
                    >
                      Edit
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAction(rem.id, 'delay', rem)}
                      className="py-1.5 px-2 bg-slate-800 text-slate-300 font-bold rounded-lg cursor-pointer hover:bg-slate-700 transition-all border border-[#23324C]"
                    >
                      Delay
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAction(rem.id, 'dismiss', rem)}
                      className="py-1.5 px-2 bg-slate-800/40 text-slate-500 hover:text-red-400 font-bold rounded-lg cursor-pointer hover:bg-red-500/5 transition-all border border-[#23324C]/40"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="py-1.5 bg-[#1F2937]/20 text-slate-500 text-[10px] font-bold rounded-lg text-center select-none border border-[#23324C]/25">
                    ✓ Resolved
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pt-4 border-t border-[#23324C]/40 flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>

      <Modal isOpen={addAlertModalOpen} onClose={() => setAddAlertModalOpen(false)} title="Create New Alert">
        <form onSubmit={handleSaveAlert} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
          
          <div className="space-y-4 bg-[#111827]/40 p-4 rounded-xl border border-[#23324C]/60">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-[#23324C]/60 pb-1">General</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput label="Alert Title" required value={newAlert.title} onChange={e => setNewAlert({...newAlert, title: e.target.value})} placeholder="e.g. DOT Inspection Due" />
              <SelectInput label="Alert Category" required value={newAlert.category} onChange={e => setNewAlert({...newAlert, category: e.target.value})} options={[
                { value: 'Expense', label: 'Expense' },
                { value: 'Fleet', label: 'Fleet' },
                { value: 'Driver', label: 'Driver' },
                { value: 'Payroll', label: 'Payroll' },
                { value: 'Compliance', label: 'Compliance' },
                { value: 'Customer', label: 'Customer' },
                { value: 'Document', label: 'Document' },
                { value: 'Insurance', label: 'Insurance' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Other', label: 'Other' },
              ]} />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Description *</label>
              <textarea required className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-500 min-h-[60px]" placeholder="Details of the alert..." value={newAlert.desc} onChange={e => setNewAlert({...newAlert, desc: e.target.value})}></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#111827]/40 p-4 rounded-xl border border-[#23324C]/60">
            <SelectInput label="Priority" value={newAlert.priority} onChange={e => setNewAlert({...newAlert, priority: e.target.value})} options={[
              { value: 'Critical', label: 'Critical' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]} />
            <SelectInput label="Action Required" value={newAlert.actionRequired} onChange={e => setNewAlert({...newAlert, actionRequired: e.target.value})} options={[
              { value: 'Resolve', label: 'Resolve' },
              { value: 'Review', label: 'Review' },
              { value: 'Approve', label: 'Approve' },
              { value: 'Payment', label: 'Payment' },
              { value: 'Renewal', label: 'Renewal' },
              { value: 'Inspection', label: 'Inspection' },
            ]} />
          </div>

          <div className="space-y-4 bg-[#111827]/40 p-4 rounded-xl border border-[#23324C]/60">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-[#23324C]/60 pb-1">Assignment & Dates</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput label="Assign To" value={newAlert.assignTo} onChange={e => setNewAlert({...newAlert, assignTo: e.target.value})} options={[
                { value: 'Company', label: 'Company' },
                { value: 'Branch', label: 'Branch' },
                { value: 'Driver', label: 'Driver' },
                { value: 'Vehicle', label: 'Vehicle' },
                { value: 'Employee', label: 'Employee' },
                { value: 'Customer', label: 'Customer' },
              ]} />
              <TextInput label="Related Item" value={newAlert.relatedItem} onChange={e => setNewAlert({...newAlert, relatedItem: e.target.value})} placeholder="e.g. TR-1002" />
              <TextInput label="Due Date" type="date" required value={newAlert.dueDate} onChange={e => setNewAlert({...newAlert, dueDate: e.target.value})} />
              <TextInput label="Reminder Date" type="date" value={newAlert.reminderDate} onChange={e => setNewAlert({...newAlert, reminderDate: e.target.value})} />
              <SelectInput label="Status" value={newAlert.status} onChange={e => setNewAlert({...newAlert, status: e.target.value})} options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Active', label: 'Active' },
                { value: 'Completed', label: 'Completed' },
              ]} />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Internal Notes</label>
              <textarea className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-500 min-h-[50px]" placeholder="Optional internal notes..." value={newAlert.notes} onChange={e => setNewAlert({...newAlert, notes: e.target.value})}></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#23324C]/40">
            <Button type="button" variant="secondary" onClick={() => setAddAlertModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSavingAlert || !newAlert.title || !newAlert.category || !newAlert.desc || !newAlert.dueDate}>
              {isSavingAlert ? 'Saving...' : 'Save Alert'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
