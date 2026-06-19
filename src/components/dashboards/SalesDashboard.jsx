import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesDashboard } from '../../store/slices/companySlice';
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
import MiniChart from '../common/MiniChart';
import { KpiGridSkeleton, TableSkeleton } from '../common/Skeletons';
import { 
  Mail, Phone, Calendar, User, UserPlus, BarChart, ShieldCheck, 
  Plus, Check, ArrowRight, ArrowLeft, Trash2, Edit, FileText, ChevronRight
} from 'lucide-react';

export default function SalesDashboard() {
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  const dispatch = useDispatch();
  const reduxCompany = useSelector((state) => state.company);

  // Core CRM Leads State
  const [leadsList, setLeadsList] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inspectDrawerOpen, setInspectDrawerOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  // Selection
  const [selectedLead, setSelectedLead] = useState(null);

  // Forms
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadStatus, setLeadStatus] = useState('Pending');
  const [leadMessage, setLeadMessage] = useState('');
  const [proposalPrice, setProposalPrice] = useState('1500');

  // Scheduler Form
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [scheduleLeadId, setScheduleLeadId] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchSalesDashboard());
  }, [dispatch]);

  // Sync redux leads to local state once loaded
  useEffect(() => {
    if (reduxCompany.leads && reduxCompany.leads.length > 0) {
      setLeadsList(reduxCompany.leads);
      setLoadingLocal(false);
    }
  }, [reduxCompany.leads]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Add Lead
  const handleAddLead = (e) => {
    e.preventDefault();
    if (!leadName || !leadCompany || !leadEmail) {
      triggerToast('Please complete all form fields.', 'error');
      return;
    }
    const newL = {
      id: Date.now(),
      name: leadName,
      company: leadCompany,
      email: leadEmail,
      phone: leadPhone || '555-0100',
      status: leadStatus,
      msg: leadMessage || 'Inbound trial request'
    };
    setLeadsList([newL, ...leadsList]);
    setAddModalOpen(false);
    // Reset forms
    setLeadName('');
    setLeadCompany('');
    setLeadEmail('');
    setLeadPhone('');
    setLeadMessage('');
    triggerToast(`Lead ${leadName} registered successfully!`);
  };

  // Edit Lead
  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setLeadName(lead.name);
    setLeadCompany(lead.company);
    setLeadEmail(lead.email);
    setLeadPhone(lead.phone);
    setLeadStatus(lead.status);
    setLeadMessage(lead.msg);
    setEditModalOpen(true);
  };

  const handleSaveEditLead = (e) => {
    e.preventDefault();
    setLeadsList(leadsList.map(l => l.id === selectedLead.id ? {
      ...l,
      name: leadName,
      company: leadCompany,
      email: leadEmail,
      phone: leadPhone,
      status: leadStatus,
      msg: leadMessage
    } : l));
    setEditModalOpen(false);
    triggerToast(`Lead credentials for ${leadName} updated.`);
  };

  // Pipeline movement
  const moveLeadPipeline = (id, direction) => {
    const statuses = ['Pending', 'Demo Scheduled', 'Completed', 'Delayed'];
    setLeadsList(leadsList.map(l => {
      if (l.id === id) {
        const currentIdx = statuses.indexOf(l.status);
        let nextIdx = currentIdx + direction;
        if (nextIdx >= 0 && nextIdx < statuses.length) {
          return { ...l, status: statuses[nextIdx] };
        }
      }
      return l;
    }));
    triggerToast('Pipeline status advanced.');
  };

  // Schedule Demo
  const handleBookDemo = (e) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleLeadId) {
      triggerToast('Select date and lead target.', 'error');
      return;
    }
    const targetLead = leadsList.find(l => l.id === parseInt(scheduleLeadId));
    if (targetLead) {
      setLeadsList(leadsList.map(l => l.id === targetLead.id ? { ...l, status: 'Demo Scheduled' } : l));
      triggerToast(`Live demo booked with ${targetLead.name} on ${scheduleDate} at ${scheduleTime}.`);
      setScheduleDate('');
    }
  };

  // Filters & Page logic
  const filteredLeads = leadsList.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === '' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: 'company', label: 'Company Name', render: (row) => <span className="font-extrabold text-white">{row.company}</span> },
    { key: 'name', label: 'Contact', render: (row) => <span className="text-slate-300 font-semibold">{row.name}</span> },
    { key: 'status', label: 'CRM Pipeline Stage', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'email', label: 'Email Address', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.email}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={Edit} onClick={() => handleOpenEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setSelectedLead(row); setInspectDrawerOpen(true); }}>
            Inspect
          </Button>
        </div>
      )
    }
  ];

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
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Sales CRM • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Nurture incoming logistics leads, run demo calls, and review monthly conversion margins.</p>
        </div>

        {activeTab === 'leads' && (
          <Button variant="primary" icon={Plus} onClick={() => setAddModalOpen(true)}>
            Add New Lead
          </Button>
        )}
      </div>

      {loadingLocal ? (
        <TableSkeleton rows={4} cols={4} />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Leads Pool" value={leadsList.length} description="Active business leads" trend="+18% week" trendDirection="up" />
                <StatCard title="Demos Completed" value={reduxCompany.salesDemos} description="Scheduled slot walkthroughs" trend="+4" trendDirection="up" />
                <StatCard title="Active SaaS Trials" value={reduxCompany.salesActiveTrials} description="Evaluation sandbox logs" trend="Steady" trendDirection="neutral" />
                <StatCard title="Sales Conversions" value={reduxCompany.salesConversions} description="Trial to paying account ratio" trend="+2.1%" trendDirection="up" />
              </div>

              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                <h3 className="text-sm font-extrabold text-white mb-3">Weekly Inbound Lead Acquisition Volume</h3>
                <MiniChart type="bar" data={[12, 18, 15, 24, 20, 28]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">Active leads index</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} placeholder="Search leads..." className="max-w-[200px]" />
                  <SelectInput value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
                    { value: '', label: 'All Pipelines' },
                    { value: 'Pending', label: 'Pending Inquiry' },
                    { value: 'Demo Scheduled', label: 'Demo Scheduled' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Delayed', label: 'Delayed Follow Up' }
                  ]} className="max-w-[150px]" />
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <EmptyState title="No leads match" description="Search index empty. Provision a sales pipeline card." icon={UserPlus} actionLabel="Create Lead" onAction={() => setAddModalOpen(true)} />
              ) : (
                <>
                  <DataTable columns={columns} data={paginatedLeads} />
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch min-h-[450px]">
              {['Pending', 'Demo Scheduled', 'Completed', 'Delayed'].map((status) => {
                const columnLeads = leadsList.filter(l => l.status === status);
                return (
                  <div key={status} className="bg-[#111827]/40 border border-[#23324C]/40 rounded-2xl p-4 flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b border-[#23324C]/50 pb-2">
                      <span className="text-[11px] uppercase font-black text-white tracking-wide">{status}</span>
                      <span className="bg-[#161F30] px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono font-bold">
                        {columnLeads.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] scrollbar-none">
                      {columnLeads.map((lead) => (
                        <div key={lead.id} className="glass rounded-xl p-3.5 border border-[#23324C]/60 text-left space-y-3 shadow-md hover:border-brand-500/30 transition-all">
                          <div>
                            <strong className="text-white text-xs block font-bold truncate">{lead.company}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{lead.name}</span>
                          </div>
                          
                          <div className="flex justify-between items-center border-t border-[#23324C]/40 pt-2.5">
                            <span className="text-[9px] font-mono text-slate-500">{lead.phone}</span>
                            <div className="flex gap-1.5">
                              {status !== 'Pending' && (
                                <button onClick={() => moveLeadPipeline(lead.id, -1)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer" title="Move Back">
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                              )}
                              {status !== 'Delayed' && (
                                <button onClick={() => moveLeadPipeline(lead.id, 1)} className="p-1 hover:bg-slate-800 rounded text-brand-400 hover:text-white cursor-pointer" title="Advance Pipeline">
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {columnLeads.length === 0 && (
                        <div className="text-[10px] text-slate-500 text-center py-10 font-medium">Column Empty</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'scheduler' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Book slot form */}
              <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Book Demo Presentation Slot</h3>
                
                <form onSubmit={handleBookDemo} className="space-y-4">
                  <SelectInput label="Select Lead Target" value={scheduleLeadId} onChange={(e) => setScheduleLeadId(e.target.value)} placeholder="Choose active lead..." options={
                    leadsList.map(l => ({ value: l.id.toString(), label: `${l.company} (${l.name})` }))
                  } />
                  <DatePicker label="Proposed Presentation Date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                  <SelectInput label="Select Time Block" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} options={[
                    { value: '10:00 AM', label: '10:00 AM EST' },
                    { value: '01:00 PM', label: '01:00 PM EST' },
                    { value: '03:30 PM', label: '03:30 PM EST' }
                  ]} />
                  <Button type="submit" variant="primary" className="w-full">
                    Schedule Zoom Demo Walkthrough
                  </Button>
                </form>
              </div>

              {/* Scheduled list */}
              <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Upcoming Confirmed Walkthroughs</h3>
                <div className="space-y-3.5">
                  {leadsList.filter(l => l.status === 'Demo Scheduled').map(lead => (
                    <div key={lead.id} className="p-3 bg-[#111827]/60 border border-[#23324C] rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block font-bold">{lead.company}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Presenter contact: {lead.name} ({lead.email})</span>
                      </div>
                      <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1.5 rounded-lg font-bold font-mono text-[10px]">
                        Pending Schedule Call
                      </span>
                    </div>
                  ))}
                  {leadsList.filter(l => l.status === 'Demo Scheduled').length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs">No demos scheduled on pipeline calendars.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Sales Follow-Up Calendar Calendar</h3>
                <span className="text-xs font-mono font-bold text-slate-400">June 2026</span>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 border-b border-[#23324C]/40 pb-2">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
              </div>

              <div className="grid grid-cols-7 gap-2 items-stretch text-left">
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const hasEvent = day === 19 || day === 22 || day === 25;
                  
                  return (
                    <div key={day} className={`min-h-[70px] p-1.5 border rounded-xl flex flex-col justify-between ${
                      day === 19 
                        ? 'bg-brand-500/5 border-brand-500/40' 
                        : 'border-[#23324C]/40 hover:border-brand-500/20 bg-[#111827]/20 transition-all'
                    }`}>
                      <span className="text-[10px] font-mono font-bold text-slate-500">{day}</span>
                      {hasEvent && (
                        <div className="bg-brand-500 text-white rounded p-1 text-[8px] font-extrabold font-sans leading-tight truncate" title="Follow up call scheduled.">
                          Follow Up
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                <h3 className="text-sm font-extrabold text-white mb-3">SaaS Client Sandbox Subscriptions</h3>
                <MiniChart type="line" data={[8, 11, 14, 18, 22, 28]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
              </div>
              
              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">CRM Funnel Analytics</h3>
                  <p className="text-[10px] text-slate-500">Pipeline rates breakdown.</p>
                </div>
                <div className="space-y-4 my-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Inbound Leads Inquiry</span>
                      <strong>100%</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1">
                      <div className="bg-[#23324C] h-full rounded-full w-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Scheduled Demo Walkthroughs</span>
                      <strong>64%</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1">
                      <div className="bg-brand-500 h-full rounded-full w-[64%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>SaaS Subscription Paid Contract</span>
                      <strong>14.8%</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1">
                      <div className="bg-emerald-500 h-full rounded-full w-[14.8%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Lead Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Inbound Business Lead">
        <form onSubmit={handleAddLead} className="space-y-4">
          <TextInput label="Contact Person Name" required placeholder="e.g. Robert Vance" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
          <TextInput label="Company Legal Entity" required placeholder="e.g. Vance Refrigeration" value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} />
          <TextInput label="Business Email" required type="email" placeholder="e.g. rvance@vance.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
          <TextInput label="Phone Number" placeholder="e.g. 555-0912" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
          <SelectInput label="Pipeline Category Status" value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)} options={[
            { value: 'Pending', label: 'Pending Inquiry' },
            { value: 'Demo Scheduled', label: 'Demo Scheduled' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Delayed', label: 'Delayed Follow Up' }
          ]} />
          <TextInput label="Message Inquiry Specifications" placeholder="e.g. Flatbed rates" value={leadMessage} onChange={(e) => setLeadMessage(e.target.value)} />
          
          <Button type="submit" variant="primary" className="w-full">
            Create Pipeline Card
          </Button>
        </form>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Modify Lead Credentials">
        <form onSubmit={handleSaveEditLead} className="space-y-4">
          <TextInput label="Contact Name" required value={leadName} onChange={(e) => setLeadName(e.target.value)} />
          <TextInput label="Company" required value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} />
          <TextInput label="Email Address" required type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
          <TextInput label="Phone" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
          <SelectInput label="Pipeline Status" value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)} options={[
            { value: 'Pending', label: 'Pending Inquiry' },
            { value: 'Demo Scheduled', label: 'Demo Scheduled' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Delayed', label: 'Delayed Follow Up' }
          ]} />
          <TextInput label="Message" value={leadMessage} onChange={(e) => setLeadMessage(e.target.value)} />
          
          <Button type="submit" variant="primary" className="w-full">
            Save Modifications
          </Button>
        </form>
      </Modal>

      {/* Inspect Drawer */}
      <Drawer isOpen={inspectDrawerOpen} onClose={() => setInspectDrawerOpen(false)} title="CRM Lead Details Audit">
        {selectedLead && (
          <div className="space-y-6 text-left text-slate-300 text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/60 pb-3">
              <h4 className="text-base font-extrabold text-white mb-1">{selectedLead.company}</h4>
              <StatusBadge status={selectedLead.status} />
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-brand-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Contact Name</span>
                  <strong className="text-white text-xs">{selectedLead.name}</strong>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Email</span>
                  <span className="text-xs font-mono">{selectedLead.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Phone</span>
                  <span className="text-xs">{selectedLead.phone}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#23324C]/60 pt-4 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Inquiry Specifications</span>
              <p className="p-3 bg-[#0B0F19] border border-[#23324C] rounded-xl text-slate-300 leading-relaxed text-xs">
                "{selectedLead.msg}"
              </p>
            </div>

            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4">
              <Button variant="primary" size="sm" onClick={() => { setInspectDrawerOpen(false); setProposalModalOpen(true); }}>
                Issue Contract Proposal
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setInspectDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Contract Proposal Modal */}
      <Modal isOpen={proposalModalOpen} onClose={() => setProposalModalOpen(false)} title="Generate SaaS Contract Proposal">
        <div className="space-y-4 text-left text-xs">
          <p className="text-slate-400">Specify contract rate parameters for this client workspace.</p>
          <TextInput label="Proposal Price (USD/mo)" value={proposalPrice} onChange={(e) => setProposalPrice(e.target.value)} type="number" />
          
          <Button variant="primary" className="w-full" onClick={() => { setProposalModalOpen(false); triggerToast('Proposal PDF dispatched via email.'); }}>
            Dispatched Proposal Mailer
          </Button>
        </div>
      </Modal>

    </div>
  );
}
