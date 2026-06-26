import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../api/apiClient';
import { fetchTenants, createAuditLog } from '../../store/slices/companySlice';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import SearchInput from '../common/SearchInput';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import Drawer from '../common/Drawer';
import {
  Layers, Key, Check, Plus, Trash2, Edit2, Copy, RotateCcw,
  Activity, FileText, Settings, DollarSign, AlertCircle, Calendar,
  ArrowLeftRight, Download, Percent, Briefcase, CreditCard, Lock,
  Shield, TrendingUp, CheckSquare, Eye, RefreshCw, Sparkles, Filter, ChevronDown, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'Platform', 'Operations', 'Fleet', 'Drivers', 'Dispatch', 'Loads',
  'Warehouse', 'Accounting', 'Finance', 'Billing', 'CRM', 'Customer Portal',
  'Tracking', 'GPS', 'Maps', 'Notifications', 'AI Features', 'Reports',
  'Analytics', 'Integrations', 'Security', 'Administration', 'API', 'Developer Tools'
];

const LICENSING_TYPES = [
  'Core', 'Premium', 'Add-on', 'Beta', 'Hidden', 'Internal', 'Deprecated', 'Trial', 'Enterprise Only', 'Region Based'
];

const STATUSES = ['Enabled', 'Disabled', 'Trial', 'Suspended', 'Archived', 'Deprecated'];

export default function FeatureAccess({ tenants = [], logAuditAction, triggerToast }) {
  const dispatch = useDispatch();

  // Core state arrays
  const [features, setFeatures] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab controls
  const [activeSubTab, setActiveSubTab] = useState('matrix'); // matrix, analytics, audits

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLicensingType, setFilterLicensingType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Collapsible categories mapping (category -> boolean, true = collapsed)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Dynamic column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    description: true,
    starter: true,
    professional: true,
    enterprise: true,
    customEnterprise: true,
    addon: true,
    licensingType: true,
    status: true,
    usage: true,
    companies: true,
    actions: true
  });
  const [showColDropdown, setShowColDropdown] = useState(false);

  // Bulk operations states
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('Enable');
  const [bulkPlan, setBulkPlan] = useState('Starter');
  const [bulkValue, setBulkValue] = useState(true);

  // Detail Config Drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [detailTab, setDetailTab] = useState('metadata'); // metadata, overrides, analytics, versioning

  // Overrides widget form
  const [overrideForm, setOverrideForm] = useState({
    companyId: '',
    status: 'Enabled',
    type: 'Manual Override',
    reason: ''
  });

  // Version bump form
  const [versionFormOpen, setVersionFormOpen] = useState(false);
  const [newVersionStr, setNewVersionStr] = useState('');
  const [newVersionLog, setNewVersionLog] = useState('');

  // Compare version modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareV1, setCompareV1] = useState('');
  const [compareV2, setCompareV2] = useState('');

  // Create Feature wizard modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createForm, setCreateForm] = useState({
    name: '',
    id: '',
    description: '',
    category: 'Platform',
    dependencies: [],
    requiredModules: '',
    apiUsage: '20000',
    storageUsage: '2.0',
    performanceImpact: 'Low',
    licensingType: 'Core',
    releaseVersion: '1.0.0',
    visibility: 'Public',
    start: true,
    pro: true,
    ent: true,
    customEnt: true
  });

  // Dependency warning confirmation dialog
  const [depConfirmOpen, setDepConfirmOpen] = useState(false);
  const [depConfirmAction, setDepConfirmAction] = useState(null); // callback to run if confirmed

  // Fetch from mock API
  const fetchData = async () => {
    try {
      setLoading(true);
      const resFeats = await apiClient.get('features');
      const resAudits = await apiClient.get('feature-audits');
      setFeatures(resFeats.data || []);
      setAudits(resAudits.data || []);
    } catch (e) {
      console.error(e);
      triggerToast('Failed to retrieve SaaS feature licensing parameters.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Log audit helper
  const logFeatureAudit = async (action, detail, reason = 'Administrative update') => {
    try {
      const newAudit = await apiClient.post('feature-audits', { action, detail, reason });
      setAudits(prev => [newAudit.data, ...prev]);
      logAuditAction(action, detail);
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic KPI calculations
  const totalFeatures = features.length;
  const activeFeatures = features.filter(f => f.status === 'Enabled').length;
  const disabledFeatures = features.filter(f => f.status === 'Disabled').length;
  const premiumFeatures = features.filter(f => f.licensingType === 'Premium').length;
  const enterpriseFeatures = features.filter(f => f.licensingType === 'Enterprise Only').length;
  const companiesUsingPremium = tenants.filter(t => t.plan === 'Enterprise' || t.plan === 'Professional').length;

  // Toggle single category expand/collapse
  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Dynamic Filter & Sort lists
  const getFilteredFeatures = () => {
    return features.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || f.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
      const matchesLicensingType = filterLicensingType === 'All' || f.licensingType === filterLicensingType;
      return matchesSearch && matchesCategory && matchesStatus && matchesLicensingType;
    });
  };

  const filteredFeatures = getFilteredFeatures();

  // Column Visibility toggle
  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Dependency Resolution Engine (Cascade deactivation checking)
  const checkDependenciesBeforeDisable = (featureId, nextState, onConfirm) => {
    if (nextState === false || nextState === 'Disabled') {
      // Find features that depend on this one
      const dependents = features.filter(f => f.status === 'Enabled' && f.dependencies?.includes(featureId));
      if (dependents.length > 0) {
        setDepConfirmAction({
          title: `Disable Feature Cascade`,
          message: `Deactivating "${features.find(f => f.id === featureId)?.name}" will automatically disable dependent features: ${dependents.map(d => `"${d.name}"`).join(', ')}.`,
          execute: async () => {
            try {
              // Update target feature
              await apiClient.put(`features/${featureId}`, { status: 'Disabled' });
              // Update dependent features
              for (const dep of dependents) {
                await apiClient.put(`features/${dep.id}`, { status: 'Disabled' });
                await logFeatureAudit('Feature Disabled Cascade', `Cascaded deactivation to dependent feature "${dep.name}" (${dep.id}).`, 'Parent feature disabled.');
              }
              triggerToast(`Deactivated feature and its ${dependents.length} dependents.`, 'warning');
              await logFeatureAudit('Feature Deactivated', `Deactivated feature "${features.find(f => f.id === featureId)?.name}" (${featureId}).`);
              setDepConfirmOpen(false);
              fetchData();
            } catch (err) {
              console.error(err);
            }
          }
        });
        setDepConfirmOpen(true);
        return false; // blocks immediate toggle
      }
    }
    return true; // proceed directly
  };

  // Toggle permission level for a plan tier
  const handleTogglePlanAccess = async (feature, tierKey) => {
    const nextVal = !feature[tierKey];
    try {
      await apiClient.put(`features/${feature.id}`, { [tierKey]: nextVal });
      triggerToast(`Plan "${tierKey.toUpperCase()}" default updated for "${feature.name}".`, 'success');
      logFeatureAudit('Plan Access Toggled', `Toggled "${tierKey.toUpperCase()}" access default to ${nextVal ? 'enabled' : 'disabled'} for feature "${feature.name}".`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle feature status
  const handleToggleFeatureStatus = async (feature, nextStatus) => {
    const shouldProceed = checkDependenciesBeforeDisable(feature.id, nextStatus);
    if (!shouldProceed) return;

    try {
      await apiClient.put(`features/${feature.id}`, { status: nextStatus });
      triggerToast(`Feature status set to "${nextStatus}".`, nextStatus === 'Enabled' ? 'success' : 'warning');
      logFeatureAudit('Feature Status Changed', `Set feature "${feature.name}" status parameters to "${nextStatus}".`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic company overrides configuration
  const handleAddOverride = async (e) => {
    e.preventDefault();
    if (!overrideForm.companyId || !overrideForm.reason) {
      triggerToast('Please specify target company and override reason.', 'danger');
      return;
    }
    const company = tenants.find(t => String(t.id) === String(overrideForm.companyId));
    if (!company) return;

    const newOverridesList = [
      ...(selectedFeature.overrides || []),
      {
        companyId: company.id,
        companyName: company.name,
        status: overrideForm.status,
        type: overrideForm.type,
        reason: overrideForm.reason,
        date: new Date().toLocaleDateString()
      }
    ];

    try {
      const res = await apiClient.put(`features/${selectedFeature.id}`, { overrides: newOverridesList });
      setSelectedFeature(res.data);
      triggerToast(`Assigned override for "${company.name}" successfully.`, 'success');
      logFeatureAudit('Company Override Created', `Added override for "${company.name}" under feature "${selectedFeature.name}" status: "${overrideForm.status}".`, overrideForm.reason);
      setOverrideForm({ companyId: '', status: 'Enabled', type: 'Manual Override', reason: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveOverride = async (companyId) => {
    const filtered = (selectedFeature.overrides || []).filter(o => o.companyId !== companyId);
    try {
      const res = await apiClient.put(`features/${selectedFeature.id}`, { overrides: filtered });
      setSelectedFeature(res.data);
      triggerToast('Company override rule removed.', 'info');
      logFeatureAudit('Company Override Deleted', `Removed override access rule for company ID ${companyId} on feature "${selectedFeature.name}".`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk operations handler
  const executeBulkAction = async () => {
    if (selectedFeatureIds.length === 0) return;
    try {
      let updateData = {};
      if (bulkAction === 'Enable') updateData = { status: 'Enabled' };
      else if (bulkAction === 'Disable') updateData = { status: 'Disabled' };
      else if (bulkAction === 'Archive') updateData = { status: 'Archived' };
      else if (bulkAction === 'Assign') {
        const planKey = bulkPlan === 'Starter' ? 'start' : (bulkPlan === 'Professional' ? 'pro' : (bulkPlan === 'Enterprise' ? 'ent' : 'customEnt'));
        updateData = { [planKey]: bulkValue };
      }

      await apiClient.post('features/bulk-update', { ids: selectedFeatureIds, updateData });
      triggerToast(`Bulk operation "${bulkAction}" completed on ${selectedFeatureIds.length} features.`, 'success');
      logFeatureAudit('Bulk Features Action', `Executed bulk feature status update: "${bulkAction}" on ${selectedFeatureIds.length} assets.`);
      setSelectedFeatureIds([]);
      setBulkModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Feature Cloning
  const handleCloneFeature = async (featureId, name) => {
    try {
      const res = await apiClient.post(`features/${featureId}/clone`);
      triggerToast(`Feature "${name}" successfully cloned as draft copy.`, 'success');
      logFeatureAudit('Feature Cloned', `Cloned feature "${name}" to copy "${res.data.name}".`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Feature Delete
  const handleDeleteFeature = async (featureId, name) => {
    if (!window.confirm(`Permanently delete feature "${name}"?`)) return;
    try {
      await apiClient.delete(`features/${featureId}`);
      triggerToast(`Feature "${name}" successfully deleted.`, 'success');
      logFeatureAudit('Feature Deleted', `Permanently deleted feature config template "${name}" (${featureId}).`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Version controls
  const handleVersionBump = async (e) => {
    e.preventDefault();
    if (!newVersionStr || !newVersionLog) {
      triggerToast('Specify target version and change log.', 'danger');
      return;
    }
    try {
      const res = await apiClient.post(`features/${selectedFeature.id}/version`, {
        version: newVersionStr,
        changeLog: newVersionLog
      });
      setSelectedFeature(res.data);
      triggerToast(`Bumped version to v${newVersionStr}.`, 'success');
      logFeatureAudit('Feature Version Bumped', `Bumped feature "${selectedFeature.name}" version mapping to v${newVersionStr}.`);
      setNewVersionStr('');
      setNewVersionLog('');
      setVersionFormOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRollbackVersion = async (version) => {
    if (!window.confirm(`Rollback feature configurations to version v${version}?`)) return;
    try {
      const res = await apiClient.post(`features/${selectedFeature.id}/rollback`, { version });
      setSelectedFeature(res.data);
      triggerToast(`Rolled back feature to version v${version}.`, 'success');
      logFeatureAudit('Feature Version Rolled Back', `Rolled back configurations of feature "${selectedFeature.name}" to version v${version}.`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Create wizard controllers
  const handleCreateSubmit = async () => {
    if (!createForm.name || !createForm.id) {
      triggerToast('Feature Name and Feature ID keys are mandatory.', 'danger');
      return;
    }
    const payload = {
      ...createForm,
      apiUsage: Number(createForm.apiUsage),
      storageUsage: Number(createForm.storageUsage),
      dependencies: typeof createForm.dependencies === 'string' 
        ? createForm.dependencies.split(',').map(s => s.trim()).filter(Boolean)
        : createForm.dependencies
    };
    try {
      await apiClient.post('features', payload);
      triggerToast(`Successfully registered licensed feature: "${payload.name}".`, 'success');
      logFeatureAudit('Feature Registered', `Registered new SaaS feature "${payload.name}" under category "${payload.category}".`);
      setCreateModalOpen(false);
      setCreateForm({
        name: '', id: '', description: '', category: 'Platform', dependencies: [],
        requiredModules: '', apiUsage: '20000', storageUsage: '2.0', performanceImpact: 'Low',
        licensingType: 'Core', releaseVersion: '1.0.0', visibility: 'Public',
        start: true, pro: true, ent: true, customEnt: true
      });
      setCreateStep(1);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Feature ID,Feature Name,Category,Licensing Type,Status,Starter,Professional,Enterprise,Custom,Usage Count\n';
    features.forEach(f => {
      csvContent += `"${f.id}","${f.name}","${f.category}","${f.licensingType}","${f.status}",${f.start},${f.pro},${f.ent},${f.customEnt},${f.usageCount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SaaS_Features_Licensing_Matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Features licensing matrix spreadsheet CSV exported.', 'success');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 8 Enterprise Dashboard KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Licensed Features</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">{totalFeatures}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">+2 templates added today</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Features</span>
          <strong className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 block">{activeFeatures}</strong>
          <span className="text-[9px] font-semibold text-slate-500 block mt-1.5">{disabledFeatures} features inactive</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Premium Tier Modules</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">{premiumFeatures}</strong>
          <span className="text-[9px] font-semibold text-brand-400 block mt-1.5">{enterpriseFeatures} Enterprise only</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Premium License Adopters</span>
          <strong className="text-xl sm:text-2xl font-black text-brand-400 mt-2 block">{companiesUsingPremium} Companies</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">CAC Payback: 10.4 months</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Beta Modules</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">
            {features.filter(f => f.licensingType === 'Beta').length}
          </strong>
          <span className="text-[9px] font-semibold text-amber-500 block mt-1.5">Feedback loops operational</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">License Utilization</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">88.2%</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">Optimal subscription density</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned Today</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">4 Actions</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">Zero provisioning failures</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Updated This Month</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">6 Features</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">SaaS registry version: v2.4.0</span>
        </div>
      </div>

      {/* Main Feature Workspace Tab Panels */}
      <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
        
        {/* Sub Navigation tabs */}
        <div className="flex gap-1.5 border-b border-[#23324C]/45 pb-3 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'matrix', label: 'Dynamic Features Matrix', icon: Shield },
            { id: 'analytics', label: 'Feature Usage Analytics', icon: Activity },
            { id: 'audits', label: 'Security & Audit Center', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-brand-500 border-brand-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 border-[#23324C]/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dynamic Feature Matrix */}
        {activeSubTab === 'matrix' && (
          <div className="space-y-4">
            
            {/* Search, Filter, Sort and Column Toggles */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search features name or ID..."
                  className="w-full sm:max-w-[220px]"
                />

                {/* Filter Sidebar trigger */}
                <Button size="sm" variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                  Filter Matrix
                </Button>

                {/* Column Visibility selector */}
                <div className="relative">
                  <Button size="sm" variant="secondary" icon={ChevronDown} iconPosition="right" onClick={() => setShowColDropdown(!showColDropdown)}>
                    Columns Visibility
                  </Button>
                  {showColDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowColDropdown(false)}></div>
                      <div className="absolute left-0 mt-1 w-48 bg-[#161F30] border border-[#23324C] rounded-xl shadow-2xl p-2 z-40 text-xs text-slate-350">
                        {Object.keys(visibleColumns).map(col => (
                          <label key={col} className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800/40 rounded-lg cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={visibleColumns[col]} 
                              onChange={() => toggleColumn(col)}
                              className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-3.5 w-3.5" 
                            />
                            <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button size="sm" variant="outline" icon={Download} onClick={handleExportCSV}>Export CSV</Button>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreateModalOpen(true)}>Create Feature</Button>
              </div>
            </div>

            {/* Advanced Filters Block */}
            {showFilters && (
              <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end animate-fade-in">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Feature Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Licensing Type</label>
                  <select
                    value={filterLicensingType}
                    onChange={(e) => setFilterLicensingType(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="All">All Licensing Types</option>
                    {LICENSING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Operational Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => { setFilterCategory('All'); setFilterLicensingType('All'); setFilterStatus('All'); setSearchQuery(''); }}>Reset</Button>
                  <Button size="sm" variant="primary" className="w-full" onClick={() => setShowFilters(false)}>Close</Button>
                </div>
              </div>
            )}

            {/* Bulk actions drawer */}
            {selectedFeatureIds.length > 0 && (
              <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3 flex justify-between items-center text-xs animate-fade-in">
                <span className="text-brand-400 font-bold">{selectedFeatureIds.length} features selected for batch update</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setBulkAction('Enable'); setBulkModalOpen(true); }}>Bulk Enable</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setBulkAction('Disable'); setBulkModalOpen(true); }}>Bulk Disable</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setBulkAction('Assign'); setBulkModalOpen(true); }}>Bulk Assign Tier</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setBulkAction('Archive'); setBulkModalOpen(true); }}>Bulk Archive</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedFeatureIds([])}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Matrix registry table grouped by Collapsible Category */}
            <div className="space-y-4">
              {CATEGORIES.map(category => {
                const categoryFeats = filteredFeatures.filter(f => f.category === category);
                if (categoryFeats.length === 0) return null;

                const isCollapsed = collapsedCategories[category];

                return (
                  <div key={category} className="border border-[#23324C] rounded-2xl overflow-hidden bg-[#161F30]/10">
                    
                    {/* Collapsible header */}
                    <button 
                      onClick={() => toggleCategoryCollapse(category)}
                      className="w-full bg-[#161F30]/60 px-4 py-3 flex justify-between items-center text-xs font-bold border-b border-[#23324C]/60 hover:bg-[#161F30]/80 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-white" />}
                        <span className="text-white tracking-wide uppercase font-black">{category} Category</span>
                        <span className="bg-[#111827] px-2 py-0.5 rounded-full text-[9px] text-slate-400 font-bold">{categoryFeats.length} features</span>
                      </div>
                      <span className="text-[10px] text-brand-400 hover:underline">Toggle Panel</span>
                    </button>

                    {/* Table contents */}
                    {!isCollapsed && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse text-xs">
                          <thead className="bg-[#161F30]/40 border-b border-[#23324C]/40 text-[9px] font-bold tracking-wider uppercase text-slate-450">
                            <tr>
                              <th className="p-3 w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={categoryFeats.every(f => selectedFeatureIds.includes(f.id))}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedFeatureIds(prev => [...prev, ...categoryFeats.map(f => f.id).filter(id => !prev.includes(id))]);
                                    } else {
                                      setSelectedFeatureIds(prev => prev.filter(id => !categoryFeats.map(f => f.id).includes(id)));
                                    }
                                  }}
                                  className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                                />
                              </th>
                              {visibleColumns.name && <th className="p-3">Feature Name</th>}
                              {visibleColumns.description && <th className="p-3">Description</th>}
                              {visibleColumns.starter && <th className="p-3 text-center">Starter</th>}
                              {visibleColumns.professional && <th className="p-3 text-center">Pro</th>}
                              {visibleColumns.enterprise && <th className="p-3 text-center">Enterprise</th>}
                              {visibleColumns.customEnterprise && <th className="p-3 text-center">Custom</th>}
                              {visibleColumns.addon && <th className="p-3 text-center">Add-on</th>}
                              {visibleColumns.licensingType && <th className="p-3">Licensing</th>}
                              {visibleColumns.status && <th className="p-3">Status</th>}
                              {visibleColumns.usage && <th className="p-3 text-center">Usage Count</th>}
                              {visibleColumns.companies && <th className="p-3 text-center">Companies</th>}
                              {visibleColumns.actions && <th className="p-3 text-right">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#23324C]/25 text-slate-350">
                            {categoryFeats.map(feat => {
                              const isSelected = selectedFeatureIds.includes(feat.id);
                              return (
                                <tr key={feat.id} className={`transition-colors hover:bg-slate-800/10 ${isSelected ? 'bg-brand-500/5' : ''}`}>
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedFeatureIds(prev => [...prev, feat.id]);
                                        } else {
                                          setSelectedFeatureIds(prev => prev.filter(id => id !== feat.id));
                                        }
                                      }}
                                      className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                                    />
                                  </td>
                                  {visibleColumns.name && (
                                    <td className="p-3 font-extrabold text-white">
                                      <button 
                                        onClick={() => { setSelectedFeature(feat); setDetailTab('metadata'); setDetailDrawerOpen(true); }}
                                        className="text-left hover:text-brand-400 transition-colors focus:outline-none"
                                      >
                                        {feat.name}
                                        <span className="block text-[8px] text-slate-500 font-mono mt-0.5">{feat.id} v{feat.releaseVersion}</span>
                                      </button>
                                    </td>
                                  )}
                                  {visibleColumns.description && (
                                    <td className="p-3 text-slate-450 max-w-xs truncate leading-relaxed">
                                      {feat.description}
                                      {feat.dependencies?.length > 0 && (
                                        <span className="block text-[8px] text-amber-500 font-bold mt-1">Depends: {feat.dependencies.join(', ')}</span>
                                      )}
                                    </td>
                                  )}
                                  
                                  {/* Starter Toggle */}
                                  {visibleColumns.starter && (
                                    <td className="p-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={feat.start}
                                        onChange={() => handleTogglePlanAccess(feat, 'start')}
                                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                                      />
                                    </td>
                                  )}
                                  {/* Pro Toggle */}
                                  {visibleColumns.professional && (
                                    <td className="p-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={feat.pro}
                                        onChange={() => handleTogglePlanAccess(feat, 'pro')}
                                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                                      />
                                    </td>
                                  )}
                                  {/* Enterprise Toggle */}
                                  {visibleColumns.enterprise && (
                                    <td className="p-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={feat.ent}
                                        onChange={() => handleTogglePlanAccess(feat, 'ent')}
                                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                                      />
                                    </td>
                                  )}
                                  {/* Custom Toggle */}
                                  {visibleColumns.customEnterprise && (
                                    <td className="p-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={feat.customEnt}
                                        onChange={() => handleTogglePlanAccess(feat, 'customEnt')}
                                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                                      />
                                    </td>
                                  )}

                                  {/* Addon Badge */}
                                  {visibleColumns.addon && (
                                    <td className="p-3 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                        feat.licensingType === 'Add-on' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-600'
                                      }`}>
                                        {feat.licensingType === 'Add-on' ? 'Add-on' : 'No'}
                                      </span>
                                    </td>
                                  )}

                                  {/* Licensing tag */}
                                  {visibleColumns.licensingType && (
                                    <td className="p-3 font-semibold text-[10px] text-slate-400">
                                      {feat.licensingType}
                                    </td>
                                  )}

                                  {/* Status Select dropdown */}
                                  {visibleColumns.status && (
                                    <td className="p-3">
                                      <select
                                        value={feat.status}
                                        onChange={(e) => handleToggleFeatureStatus(feat, e.target.value)}
                                        className={`bg-[#0B0F19] border border-[#23324C] rounded-lg p-1 text-[10px] font-bold outline-none cursor-pointer ${
                                          feat.status === 'Enabled' ? 'text-emerald-400' :
                                          feat.status === 'Disabled' ? 'text-red-400' :
                                          feat.status === 'Archived' ? 'text-slate-500' : 'text-amber-500'
                                        }`}
                                      >
                                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                                      </select>
                                    </td>
                                  )}

                                  {/* Usage Stats */}
                                  {visibleColumns.usage && <td className="p-3 text-center font-mono font-bold text-white">{feat.usageCount}</td>}
                                  {visibleColumns.companies && (
                                    <td className="p-3 text-center font-mono font-bold text-slate-400">
                                      {feat.overrides?.length > 0 ? (
                                        <span className="text-brand-400 underline cursor-pointer" onClick={() => { setSelectedFeature(feat); setDetailTab('overrides'); setDetailDrawerOpen(true); }}>
                                          {feat.companiesUsing} (+{feat.overrides.length} rules)
                                        </span>
                                      ) : (
                                        feat.companiesUsing
                                      )}
                                    </td>
                                  )}

                                  {/* Actions */}
                                  {visibleColumns.actions && (
                                    <td className="p-3 text-right">
                                      <div className="flex gap-1 justify-end">
                                        <Button size="sm" variant="secondary" onClick={() => { setSelectedFeature(feat); setDetailTab('metadata'); setDetailDrawerOpen(true); }}>Configure</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleCloneFeature(feat.id, feat.name)}>Clone</Button>
                                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeleteFeature(feat.id, feat.name)} />
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Feature Usage Analytics */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Adoption Chart */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-4">
                <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">Dynamic Feature Adoption Rates</h4>
                <div className="space-y-3">
                  {features.slice(0, 6).map(feat => {
                    const rate = feat.analytics?.adoptionRate || 50;
                    return (
                      <div key={feat.id} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">{feat.name}</span>
                          <span className="text-brand-400">{rate}% adoption</span>
                        </div>
                        <div className="w-full bg-[#0B0F19] rounded-full h-2">
                          <div className="bg-brand-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* License utilization rates */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-4">
                <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">License Utilization Index</h4>
                <div className="space-y-3">
                  {features.slice(6, 12).map(feat => {
                    const util = feat.analytics?.licenseUtilization || 60;
                    return (
                      <div key={feat.id} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">{feat.name}</span>
                          <span className="text-emerald-400">{util}% utilization</span>
                        </div>
                        <div className="w-full bg-[#0B0F19] rounded-full h-2">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${util}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inactive features table warning panel */}
            <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3 text-xs">
              <h4 className="text-white font-extrabold uppercase tracking-wide">Unused or Deprecated SaaS Features</h4>
              <p className="text-[10px] text-slate-500">The following modules have zero active usage and are recommended for deprecation scans.</p>
              
              <div className="border border-[#23324C] rounded-xl overflow-hidden bg-slate-900/40">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-950/60 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-2.5">Feature</th>
                      <th className="p-2.5">Licensing Type</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-center">Usage Count</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23324C]/30 text-slate-300 font-semibold">
                    {features.filter(f => f.usageCount === 0 || f.status === 'Deprecated').map(f => (
                      <tr key={f.id} className="hover:bg-slate-800/10">
                        <td className="p-2.5 text-white">{f.name}</td>
                        <td className="p-2.5">{f.licensingType}</td>
                        <td className="p-2.5">{f.category}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-red-400">{f.usageCount}</td>
                        <td className="p-2.5">
                          <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{f.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Audit Center */}
        {activeSubTab === 'audits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-450 font-bold uppercase tracking-widest">Feature Modification Logs</span>
              <Button size="sm" variant="outline" icon={Download} onClick={() => triggerToast('Audit logs CSV exported.', 'success')}>Export Audits</Button>
            </div>

            <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30 text-xs">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Audit Details</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40 text-slate-350 font-semibold">
                  {audits.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/10">
                      <td className="p-3 text-white font-extrabold">{log.action}</td>
                      <td className="p-3 text-slate-400">{log.detail}</td>
                      <td className="p-3 italic text-[11px] text-amber-500">{log.reason || 'None specified'}</td>
                      <td className="p-3 font-mono">{log.time}</td>
                      <td className="p-3 text-brand-400">{log.user}</td>
                      <td className="p-3 font-mono text-[10px]">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Feature Details drawer */}
      <Drawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={selectedFeature ? `Licensing Policy: ${selectedFeature.name}` : ''}
        size="md"
      >
        {selectedFeature && (
          <div className="space-y-6 text-slate-300 text-xs text-left p-4 h-full overflow-y-auto">
            
            {/* Tab indicators */}
            <div className="flex gap-2 border-b border-[#23324C]/60 pb-2.5 font-bold">
              {[
                { id: 'metadata', label: 'Overview' },
                { id: 'overrides', label: 'Company Overrides' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'versioning', label: 'Versioning' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] cursor-pointer ${
                    detailTab === t.id
                      ? 'bg-brand-500 border-brand-500 text-slate-950 font-black'
                      : 'bg-slate-900 border-[#23324C] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Tab 1: Metadata Overview */}
            {detailTab === 'metadata' && (
              <div className="space-y-4">
                <div className="space-y-1 bg-[#111827] border border-[#23324C] p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Description</span>
                  <p className="text-white leading-relaxed">{selectedFeature.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Licensing Category</span>
                    <strong className="text-white text-xs">{selectedFeature.category}</strong>
                  </div>
                  <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Required Modules</span>
                    <strong className="text-white text-xs">{selectedFeature.requiredModules?.join(', ') || 'None'}</strong>
                  </div>
                  <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Monthly API Load</span>
                    <strong className="text-brand-400 text-xs font-mono">{selectedFeature.apiUsage?.toLocaleString()} requests</strong>
                  </div>
                  <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Storage Capacity Size</span>
                    <strong className="text-emerald-400 text-xs font-mono">{selectedFeature.storageUsage} GB</strong>
                  </div>
                  <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Performance Footprint</span>
                    <strong className={`text-xs ${selectedFeature.performanceImpact === 'High' ? 'text-red-400' : 'text-slate-200'}`}>
                      {selectedFeature.performanceImpact}
                    </strong>
                  </div>
                  <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Licensing Tier Type</span>
                    <strong className="text-white text-xs font-mono">{selectedFeature.licensingType}</strong>
                  </div>
                </div>

                <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Feature Dependencies Matrix</span>
                  {selectedFeature.dependencies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedFeature.dependencies.map(d => (
                        <span key={d} className="bg-slate-900 border border-[#23324C] px-2 py-0.5 rounded font-mono text-[9px] text-white">
                          🔗 {d}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic block">No active dependencies mapped.</span>
                  )}
                </div>
              </div>
            )}

            {/* Drawer Tab 2: Company Overrides */}
            {detailTab === 'overrides' && (
              <div className="space-y-4">
                
                {/* Override list */}
                <div className="space-y-2.5">
                  <h5 className="font-extrabold uppercase text-[10px] text-slate-400">Assigned Company Manual Overrides</h5>
                  {selectedFeature.overrides?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedFeature.overrides.map(override => (
                        <div key={override.companyId} className="bg-[#111827] border border-[#23324C] p-3 rounded-xl flex justify-between items-center">
                          <div>
                            <strong className="text-white block font-extrabold">{override.companyName}</strong>
                            <span className="text-[9px] text-slate-450 block mt-0.5">{override.type} • Status: <span className="text-brand-400 font-bold">{override.status}</span></span>
                            <span className="text-[9px] text-amber-500 block italic mt-0.5">Reason: "{override.reason}"</span>
                          </div>
                          <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleRemoveOverride(override.companyId)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic block">No company override rules active for this feature.</span>
                  )}
                </div>

                {/* Override Form */}
                <form onSubmit={handleAddOverride} className="bg-slate-900/60 p-4 border border-[#23324C] rounded-2xl space-y-4 pt-3">
                  <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Create Tenant Access Override</h5>
                  
                  <SelectInput
                    label="Target Company Workspace"
                    value={overrideForm.companyId}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, companyId: e.target.value }))}
                    options={tenants.map(t => ({ value: String(t.id), label: t.name }))}
                    placeholder="-- Select Tenant Workspace --"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <SelectInput
                      label="Override Access State"
                      value={overrideForm.status}
                      onChange={(e) => setOverrideForm(prev => ({ ...prev, status: e.target.value }))}
                      options={[
                        { value: 'Enabled', label: 'Force Enabled' },
                        { value: 'Disabled', label: 'Force Disabled' },
                        { value: 'Trial', label: 'Trial Mode' }
                      ]}
                    />
                    <SelectInput
                      label="Override Type"
                      value={overrideForm.type}
                      onChange={(e) => setOverrideForm(prev => ({ ...prev, type: e.target.value }))}
                      options={[
                        { value: 'Manual Override', label: 'Manual Admin Override' },
                        { value: 'Plan Override', label: 'Plan Override' },
                        { value: 'Global Override', label: 'Global Override' }
                      ]}
                    />
                  </div>

                  <TextInput
                    label="Override Rationale"
                    placeholder="e.g., Billing exception, Beta tester group..."
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  />

                  <Button type="submit" variant="primary" className="w-full">Create Override Rule</Button>
                </form>
              </div>
            )}

            {/* Drawer Tab 3: Analytics */}
            {detailTab === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#111827] border border-[#23324C] p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block">Adoption</span>
                    <strong className="text-white text-sm font-mono mt-1 block">{selectedFeature.analytics?.adoptionRate}%</strong>
                  </div>
                  <div className="bg-[#111827] border border-[#23324C] p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block">MoM Growth</span>
                    <strong className="text-brand-400 text-sm font-mono mt-1 block">+{selectedFeature.analytics?.monthlyGrowth}%</strong>
                  </div>
                  <div className="bg-[#111827] border border-[#23324C] p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block">Utilization</span>
                    <strong className="text-emerald-400 text-sm font-mono mt-1 block">{selectedFeature.analytics?.licenseUtilization}%</strong>
                  </div>
                </div>

                <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Feature Revenue</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Monthly Yield:</span>
                    <strong className="text-white font-mono text-sm">${((selectedFeature.companiesUsing || 0) * (selectedFeature.licensingType === 'Premium' ? 120 : 40)).toLocaleString()}</strong>
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono">Calculated as: Companies Using x weighted premium features value.</span>
                </div>
              </div>
            )}

            {/* Drawer Tab 4: Versioning */}
            {detailTab === 'versioning' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-extrabold uppercase text-[10px] text-slate-400">Release Version Logs</h5>
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => setVersionFormOpen(true)}>Bump Version</Button>
                </div>

                {versionFormOpen && (
                  <form onSubmit={handleVersionBump} className="p-3 bg-slate-900 border border-[#23324C] rounded-xl space-y-3">
                    <TextInput label="Target Version String" placeholder="e.g. 1.2.0" value={newVersionStr} onChange={(e) => setNewVersionStr(e.target.value)} required />
                    <TextInput label="Change Log Description" placeholder="e.g. Bug fixes and performance boost..." value={newVersionLog} onChange={(e) => setNewVersionLog(e.target.value)} required />
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setVersionFormOpen(false)}>Cancel</Button>
                      <Button size="sm" type="submit" variant="primary">Bump Version</Button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {selectedFeature.versionHistory?.map(history => (
                    <div key={history.version} className="bg-[#111827] border border-[#23324C] p-3 rounded-xl flex justify-between items-start text-xs">
                      <div>
                        <strong className="text-white">Version v{history.version}</strong>
                        <span className="block text-[9px] text-slate-500 font-mono mt-0.5">Published by {history.updatedBy} on {history.date}</span>
                        <p className="text-slate-400 leading-relaxed mt-1 text-[10px]">{history.changeLog}</p>
                      </div>
                      {history.version !== selectedFeature.releaseVersion && (
                        <Button size="sm" variant="outline" onClick={() => handleRollbackVersion(history.version)}>Rollback</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Dependency Cascading confirmation dialog */}
      <Modal
        isOpen={depConfirmOpen}
        onClose={() => setDepConfirmOpen(false)}
        title={depConfirmAction?.title || 'Validation Warning'}
      >
        <div className="space-y-4 text-xs text-left p-2">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <h5 className="font-extrabold">Active Dependencies Detected</h5>
              <p className="leading-relaxed font-semibold">{depConfirmAction?.message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDepConfirmOpen(false)}>Cancel Action</Button>
            <Button size="sm" variant="danger" onClick={depConfirmAction?.execute}>Deactivate Cascade</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Modify Features Matrix">
        <div className="space-y-4 text-left text-xs p-2">
          <p className="text-slate-400">Apply batch update settings parameters across the {selectedFeatureIds.length} selected features.</p>
          
          {bulkAction === 'Assign' ? (
            <div className="space-y-3">
              <SelectInput
                label="Target Subscription Plan level"
                value={bulkPlan}
                onChange={(e) => setBulkPlan(e.target.value)}
                options={[
                  { value: 'Starter', label: 'Starter Default' },
                  { value: 'Professional', label: 'Professional Default' },
                  { value: 'Enterprise', label: 'Enterprise Default' },
                  { value: 'Custom', label: 'Custom Enterprise Default' }
                ]}
              />
              <SelectInput
                label="Plan Permission State"
                value={String(bulkValue)}
                onChange={(e) => setBulkValue(e.target.value === 'true')}
                options={[
                  { value: 'true', label: 'Enable Plan Access' },
                  { value: 'false', label: 'Disable Plan Access' }
                ]}
              />
            </div>
          ) : (
            <p className="font-bold text-white uppercase tracking-wider">Action: Bulk {bulkAction} features.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={executeBulkAction}>Confirm Bulk Action</Button>
          </div>
        </div>
      </Modal>

      {/* Create Feature wizard modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register SaaS Licensed Feature">
        <div className="space-y-4 text-xs text-left p-1">
          
          {/* Step indicator */}
          <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-extrabold border-b border-[#23324C]/60 pb-2">
            <span>Step {createStep} of 3</span>
            <span>{createStep === 1 ? 'Metadata' : createStep === 2 ? 'Dependencies' : 'Review'}</span>
          </div>

          {createStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Feature Name" required placeholder="e.g. Real-Time Tracking" value={createForm.name} onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))} />
                <TextInput label="Unique Feature ID" required placeholder="e.g. feat-gps-tracking" value={createForm.id} onChange={(e) => setCreateForm(prev => ({ ...prev, id: e.target.value }))} />
              </div>
              <TextInput label="Feature Description" placeholder="Detailed purpose description of feature..." value={createForm.description} onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))} />
              
              <div className="grid grid-cols-2 gap-3">
                <SelectInput label="Category" value={createForm.category} onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                <SelectInput label="Licensing Type" value={createForm.licensingType} onChange={(e) => setCreateForm(prev => ({ ...prev, licensingType: e.target.value }))} options={LICENSING_TYPES.map(t => ({ value: t, label: t }))} />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={() => setCreateStep(2)}>Next Step</Button>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-3">
              <TextInput label="Dependencies (comma-separated IDs)" placeholder="e.g. feat-gps-pings, feat-rbac" value={createForm.dependencies} onChange={(e) => setCreateForm(prev => ({ ...prev, dependencies: e.target.value }))} />
              <TextInput label="Required Modules" placeholder="e.g. Operations, Tracking" value={createForm.requiredModules} onChange={(e) => setCreateForm(prev => ({ ...prev, requiredModules: e.target.value }))} />
              
              <div className="grid grid-cols-3 gap-3">
                <TextInput label="Est. API Usage" type="number" value={createForm.apiUsage} onChange={(e) => setCreateForm(prev => ({ ...prev, apiUsage: e.target.value }))} />
                <TextInput label="Est. Storage (GB)" type="number" value={createForm.storageUsage} onChange={(e) => setCreateForm(prev => ({ ...prev, storageUsage: e.target.value }))} />
                <SelectInput label="Performance Footprint" value={createForm.performanceImpact} onChange={(e) => setCreateForm(prev => ({ ...prev, performanceImpact: e.target.value }))} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]} />
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => setCreateStep(1)}>Previous</Button>
                <Button size="sm" variant="primary" onClick={() => setCreateStep(3)}>Next Step</Button>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl space-y-2">
                <h5 className="font-extrabold uppercase text-[10px] text-slate-500">Form Submission Review</h5>
                <p><strong>Name:</strong> {createForm.name} ({createForm.id})</p>
                <p><strong>Category:</strong> {createForm.category}</p>
                <p><strong>Licensing Type:</strong> {createForm.licensingType}</p>
                <p><strong>Description:</strong> {createForm.description}</p>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => setCreateStep(2)}>Previous</Button>
                <Button size="sm" variant="success" onClick={handleCreateSubmit}>Register & Publish Feature</Button>
              </div>
            </div>
          )}

        </div>
      </Modal>

    </div>
  );
}
