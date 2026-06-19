import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTenants, provisionTenant } from '../../store/slices/companySlice';
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
import { KpiGridSkeleton, TableSkeleton, ListSkeleton } from '../common/Skeletons';
import { 
  Shield, Users, Activity, BarChart, Plus, Check, Edit2, 
  Trash2, Sliders, Palette, FileText, CheckCircle, RefreshCw,
  AlertCircle, MessageSquare
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  const dispatch = useDispatch();
  const { tenants, mrr, platformLoad, slaTarget, loading } = useSelector((state) => state.company);

  // Modals & Drawers
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [ticketDrawerOpen, setTicketDrawerOpen] = useState(false);

  // Active items
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Forms states
  const [companyName, setCompanyName] = useState('');
  const [companyPlan, setCompanyPlan] = useState('Professional');
  const [companyEmail, setCompanyEmail] = useState('');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Support Tickets Mock State
  const [tickets, setTickets] = useState([
    { id: 101, sender: 'Swift Cargo', subject: 'Invoice Integration Lag', priority: 'High', status: 'Open', date: '06/19/2026', message: 'Factoring automatic webhook returns timeout. Need audit validation.' },
    { id: 102, sender: 'Global Shipping', subject: 'GPS Geofence Breach Delay', priority: 'Medium', status: 'Resolved', date: '06/18/2026', message: 'Route planner is showing 10 min ETA drift on geofences. Refactored.' },
    { id: 103, sender: 'Falcon Logistics', subject: 'Add Dispatcher Seat License', priority: 'Low', status: 'Open', date: '06/19/2026', message: 'Need to add 3 active dispatcher keys. Plan upgrade inquiry.' }
  ]);
  const [ticketReply, setTicketReply] = useState('');

  // White label config states
  const [brandName, setBrandName] = useState('HERO LOGISTICS');
  const [brandColor, setBrandColor] = useState('#0ea5e9');
  const [isWhiteLabelSaved, setIsWhiteLabelSaved] = useState(false);

  // Feature Permissions List
  const [permissions, setPermissions] = useState({
    geofencing: true,
    dispatchAutomation: true,
    eldCompliance: true,
    smsNotifications: false,
    factoringFinancing: true
  });

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // CRUD handlers
  const handleProvisionCompany = (e) => {
    e.preventDefault();
    if (!companyName || !companyEmail) {
      triggerToast('Please complete all form credentials.', 'error');
      return;
    }
    dispatch(provisionTenant({
      name: companyName,
      plan: companyPlan,
      email: companyEmail,
      joined: new Date().toLocaleDateString()
    }));
    setCompanyName('');
    setCompanyEmail('');
    setProvisionModalOpen(false);
    triggerToast(`Tenant ${companyName} provisioned successfully!`);
  };

  const handleOpenEdit = (company) => {
    setSelectedCompany(company);
    setCompanyName(company.name);
    setCompanyPlan(company.plan);
    setCompanyEmail(company.manager || `${company.name.toLowerCase().replace(/\s+/g, '')}@hero.com`);
    setEditModalOpen(true);
  };

  const handleSaveEditCompany = (e) => {
    e.preventDefault();
    triggerToast(`Tenant ${companyName} configurations saved.`);
    setEditModalOpen(false);
  };

  const handleTicketReplySubmit = (e) => {
    e.preventDefault();
    if (!ticketReply) return;
    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'Resolved' } : t));
    setTicketReply('');
    setTicketDrawerOpen(false);
    triggerToast(`Support ticket #${selectedTicket.id} answered & marked Resolved.`);
  };

  // Filtered & Paginated lists
  const filteredCompanies = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === '' || t.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: 'name', label: 'Company Workspace', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
    { key: 'plan', label: 'Plan Level', render: (row) => <span className="font-bold text-slate-300">{row.plan}</span> },
    { key: 'status', label: 'Account State', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'drivers', label: 'Fleet Drivers', render: (row) => <span className="font-mono">{row.drivers || 0}</span> },
    { key: 'joined', label: 'Date Joined', render: (row) => <span className="text-slate-400 font-medium">{row.joined}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={Edit2} onClick={() => handleOpenEdit(row)}>
            Configure
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setSelectedCompany(row); setDetailsDrawerOpen(true); }}>
            Inspect
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast floating notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Super Admin • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Configure global licensing rules, audit tenant margins, and resolve support tickets.</p>
        </div>

        {activeTab === 'companies' && (
          <Button variant="primary" icon={Plus} onClick={() => setProvisionModalOpen(true)}>
            Provision Tenant
          </Button>
        )}
      </div>

      {loading && tenants.length === 0 ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <>
          {/* Active Tab Screen rendering */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Tenants" value={tenants.length} description="Workspace tenants active" trend="+1 new" trendDirection="up" />
                <StatCard title="SaaS Cash Flow" value={mrr} description="Monthly recurring revenue" trend="+12%" trendDirection="up" />
                <StatCard title="Platform Node Load" value={platformLoad} description="AWS auto-scale limits" trend="Stable" trendDirection="neutral" />
                <StatCard title="Active Tickets" value={tickets.filter(t => t.status === 'Open').length} description="Requires response" trend="Alert" trendDirection="down" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                  <h3 className="text-sm font-extrabold text-white mb-3">MRR Revenue Timeline (USD)</h3>
                  <MiniChart type="line" data={[24000, 29000, 31000, 35000, 38000, 42910]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
                </div>
                <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-1">Infrastructure Health</h3>
                    <p className="text-[10px] text-slate-500">Live platform staging nodes diagnostics.</p>
                  </div>
                  <div className="space-y-3.5 my-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Database Master Replication</span>
                      <StatusBadge status="Completed" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">ElasticSearch Index Sync</span>
                      <StatusBadge status="Active" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">S3 File Delivery Webhooks</span>
                      <StatusBadge status="Active" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">Registered Tenant workspaces</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} placeholder="Search workspaces..." className="max-w-[200px]" />
                  <SelectInput value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} options={[
                    { value: '', label: 'All Tiers' },
                    { value: 'Starter', label: 'Starter Tier' },
                    { value: 'Professional', label: 'Professional Tier' },
                    { value: 'Enterprise', label: 'Enterprise Tier' }
                  ]} className="max-w-[150px]" />
                </div>
              </div>

              {filteredCompanies.length === 0 ? (
                <EmptyState title="No Companies Resolved" description="No tenant matches found. Create a new tenant key." icon={Users} actionLabel="Provision Tenant" onAction={() => setProvisionModalOpen(true)} />
              ) : (
                <>
                  <DataTable columns={columns} data={paginatedCompanies} />
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Plans Tier Grid */}
              <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Subscription Licensing Plans</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#111827] border border-[#23324C] rounded-xl flex flex-col justify-between h-48">
                    <div>
                      <strong className="text-white text-xs block font-extrabold uppercase tracking-wide">Starter Tier</strong>
                      <span className="text-[10px] text-slate-500 block mt-1">Up to 5 drivers register</span>
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-brand-400">$199<span className="text-xs text-slate-400 font-medium">/mo</span></h5>
                      <Button size="sm" variant="secondary" className="w-full mt-3">Edit pricing</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl flex flex-col justify-between h-48">
                    <div>
                      <strong className="text-white text-xs block font-extrabold uppercase tracking-wide">Professional Tier</strong>
                      <span className="text-[10px] text-slate-500 block mt-1">Up to 30 drivers register</span>
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-brand-400">$499<span className="text-xs text-slate-400 font-medium">/mo</span></h5>
                      <Button size="sm" variant="primary" className="w-full mt-3">Edit pricing</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-[#111827] border border-[#23324C] rounded-xl flex flex-col justify-between h-48">
                    <div>
                      <strong className="text-white text-xs block font-extrabold uppercase tracking-wide">Enterprise Tier</strong>
                      <span className="text-[10px] text-slate-500 block mt-1">Unlimited driver seats</span>
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-brand-400">$1,299<span className="text-xs text-slate-400 font-medium">/mo</span></h5>
                      <Button size="sm" variant="secondary" className="w-full mt-3">Edit pricing</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Permissions Checkbox Panel */}
              <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Global Feature Permissions</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">Turn features on/off instantly across the SaaS network database limit tiers.</p>
                
                <div className="space-y-3 pt-2">
                  {Object.entries(permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-3.5 bg-[#111827]/60 border border-[#23324C] hover:border-brand-500/20 rounded-xl cursor-pointer transition-colors text-xs font-semibold text-slate-200 select-none">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => {
                          setPermissions({ ...permissions, [key]: e.target.checked });
                          triggerToast(`Feature toggle ${key} updated.`);
                        }}
                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'white-label' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* White Label Settings */}
              <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
                <h3 className="text-sm font-extrabold text-white">Enterprise White-Label Customization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Set custom logos and branding parameters for company workspaces.</p>

                <div className="space-y-4">
                  <TextInput label="Platform Portal Brand Name" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. HERO LOGISTICS" />
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Accent Theme Color Color Picker</label>
                    <div className="flex gap-2">
                      <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 w-12 rounded-xl bg-transparent cursor-pointer border border-[#23324C] focus:outline-none" />
                      <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="flex-1 px-4 py-2.5 bg-[#111827]/80 text-slate-200 text-xs rounded-xl border border-[#23324C] focus:outline-none focus:border-brand-500" />
                    </div>
                  </div>

                  <Button variant="primary" onClick={() => { setIsWhiteLabelSaved(true); triggerToast('White label modifications saved.'); }}>
                    Save Customizations
                  </Button>
                </div>
              </div>

              {/* Branding Preview */}
              <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Branded Live Portal Mockup</h3>
                  <p className="text-[10px] text-slate-500">Live preview matching configured settings parameters.</p>
                </div>

                <div className="flex-grow flex items-center justify-center my-6">
                  <div className="w-full max-w-sm bg-[#0B0F19] rounded-2xl border border-[#23324C] p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: brandColor }}>
                          HL
                        </div>
                        <span className="text-[10px] font-black text-white tracking-tight">{brandName}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">v1.2</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-800/40 rounded-full w-2/3" />
                      <div className="h-2 bg-slate-800/40 rounded-full w-full" />
                      <div className="h-2 bg-slate-800/40 rounded-full w-5/6" />
                    </div>
                    <button className="w-full py-2 text-[10px] font-extrabold text-white rounded-lg" style={{ backgroundColor: brandColor }}>
                      Live Button Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Platform Bandwidth" value="4.2 TB/mo" description="Data load limits" progress={42} />
                <StatCard title="API Ingestion Response" value="45 ms" description="Latency statistics" progress={12} />
                <StatCard title="Monthly SLA Target" value="99.98%" description="Target threshold uptime" progress={99} />
              </div>
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                <h3 className="text-sm font-extrabold text-white mb-3">Live Platform SLA Uptime timeline (%)</h3>
                <MiniChart type="line" data={[99.9, 99.95, 99.98, 99.92, 99.99, 99.98]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Inbound Customer Support Queries</h3>
              
              <div className="divide-y divide-[#23324C]/40">
                {tickets.map(t => (
                  <div key={t.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">#{t.id}</span>
                        <strong className="text-white text-xs">{t.subject}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          t.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate max-w-lg">{t.message}</p>
                      <div className="text-[10px] text-slate-500 font-semibold font-mono">
                        From: {t.sender} • {t.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={t.status} />
                      <Button size="sm" variant="secondary" icon={MessageSquare} onClick={() => { setSelectedTicket(t); setTicketDrawerOpen(true); }}>
                        Open Ticket
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Provision Modal */}
      <Modal isOpen={provisionModalOpen} onClose={() => setProvisionModalOpen(false)} title="Provision New SaaS Tenant">
        <form onSubmit={handleProvisionCompany} className="space-y-4">
          <TextInput label="Tenant Company Name" required placeholder="e.g. Titan Freightlines LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <TextInput label="Workspace Manager Email" required type="email" placeholder="e.g. admin@titan.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          <SelectInput label="License Plan Tier" value={companyPlan} onChange={(e) => setCompanyPlan(e.target.value)} options={[
            { value: 'Starter', label: 'Starter Tier' },
            { value: 'Professional', label: 'Professional Tier' },
            { value: 'Enterprise', label: 'Enterprise Tier' }
          ]} />
          <Button type="submit" variant="primary" className="w-full">
            <Check className="h-4 w-4 mr-1" /> Finalize Setup
          </Button>
        </form>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Configure Tenant Workspace Settings">
        <form onSubmit={handleSaveEditCompany} className="space-y-4">
          <TextInput label="Company Name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <TextInput label="Administrator Email" required value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          <SelectInput label="Subscription Tier Level" value={companyPlan} onChange={(e) => setCompanyPlan(e.target.value)} options={[
            { value: 'Starter', label: 'Starter Tier' },
            { value: 'Professional', label: 'Professional Tier' },
            { value: 'Enterprise', label: 'Enterprise Tier' }
          ]} />
          <Button type="submit" variant="primary" className="w-full">
            <Check className="h-4 w-4 mr-1" /> Save Configurations
          </Button>
        </form>
      </Modal>

      {/* Tenant Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title="Tenant workspace audit Inspector">
        {selectedCompany && (
          <div className="space-y-5 text-left text-slate-300 text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/60 pb-3">
              <h4 className="text-base font-extrabold text-white mb-1">{selectedCompany.name}</h4>
              <StatusBadge status={selectedCompany.status} />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 block">Workspace License Plan</span>
                <strong className="text-white text-xs">{selectedCompany.plan}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Registered Drivers Size</span>
                <span className="font-mono text-xs">{selectedCompany.drivers || 0} active drivers</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Provision Date Timestamp</span>
                <span className="text-xs">{selectedCompany.joined}</span>
              </div>
            </div>
            
            <div className="border-t border-[#23324C]/60 pt-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Workspace Controls</span>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => { setDetailsDrawerOpen(false); triggerToast(`Workspace ${selectedCompany.name} suspended.`, 'warning'); }}>
                  Suspend License
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDetailsDrawerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Ticket Drawer */}
      <Drawer isOpen={ticketDrawerOpen} onClose={() => setTicketDrawerOpen(false)} title="Support Ticket Responder">
        {selectedTicket && (
          <div className="space-y-5 text-left text-slate-300 text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/60 pb-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">Ticket #{selectedTicket.id}</span>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <h4 className="text-base font-extrabold text-white mt-1">{selectedTicket.subject}</h4>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Query details</span>
              <p className="p-3 bg-[#0B0F19] border border-[#23324C] rounded-xl text-slate-300 leading-relaxed text-xs">
                "{selectedTicket.message}"
              </p>
            </div>

            {selectedTicket.status === 'Open' ? (
              <form onSubmit={handleTicketReplySubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Reply Message Payload</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketReply}
                    onChange={(e) => setTicketReply(e.target.value)}
                    placeholder="Provide developer / administrative instructions..."
                    className="block w-full px-4 py-3 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  Submit Resolution
                </Button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl text-center">
                This ticket has been resolved.
              </div>
            )}
          </div>
        )}
      </Drawer>

    </div>
  );
}
