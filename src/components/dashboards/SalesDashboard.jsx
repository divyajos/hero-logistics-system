import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesDashboard } from '../../store/slices/companySlice';
import { crmRepository } from '../../services/crmRepository';
import { crmStore } from '../../services/crmStore';
import { crmMetricsEngine, crmActivityEngine, crmWorkflowEngine } from '../../services/crmEngines';
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

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import {
  Bell, Mail, Phone, Calendar, User, UserPlus, BarChart3, ShieldCheck,
  Plus, Check, ArrowRight, ArrowLeft, Trash2, Edit, FileText, ChevronRight,
  Filter, Settings, Search, Sliders, X, Briefcase, Clock, Activity,
  FileSpreadsheet, Play, CheckSquare, Square, AlertTriangle, Layers,
  Download, Send, UserCheck, MoreVertical, Sparkles, TrendingUp, CheckCircle2,
  Lock, Copy, FilePlus2, CheckSquare2, FileDown, Eye, RefreshCw, MessageSquare,
  AlertCircle, ShieldAlert, Award, FileSpreadsheet as SheetIcon, CheckSquare as CheckIcon,
  HelpCircle, Sparkle, Zap, ShieldAlert as RiskIcon
} from 'lucide-react';

// ============================================================================
// GLOBAL CONSTANTS
// ============================================================================
const stages = [
  'New Lead', 'Contacted', 'Demo Booked', 'Demo Completed', 
  'Trial Started', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'
];

export default function SalesDashboard({ activeTab = 'overview' }) {
  // --- STATE FOR DATABASE (Unified CRM Store) ---
  const [crmDb, setCrmDb] = useState(() => crmRepository.getCrmDatabase());

  useEffect(() => {
    const handleStoreUpdate = () => {
      setCrmDb(crmRepository.getCrmDatabase());
    };
    const unsubscribe = crmStore.subscribe(handleStoreUpdate);
    return () => unsubscribe();
  }, []);


  // --- SHORTCUT ROUTING PARAMETER CHECK & DRAWER TRIGGERS ---
  useEffect(() => {
    const handleOpenDrawerEvent = (e) => {
      const { leadId, subTab } = e.detail || {};
      const targetLeadId = leadId || e.detail; // fallback
      const targetSubTab = subTab || 'Overview';
      
      const lead = crmDb.leads.find(l => String(l.id) === String(targetLeadId));
      if (lead) {
        setSelectedLead(lead);
        setInspectDrawerOpen(true);
        setDrawerActiveTab(targetSubTab);
      }
    };

    window.addEventListener('hero-open-lead-drawer', handleOpenDrawerEvent);

    const targetLeadId = localStorage.getItem('hero_sales_selected_lead_id');
    const targetSubTab = localStorage.getItem('hero_sales_selected_lead_subtab') || 'Overview';
    if (targetLeadId && activeTab === 'leads') {
      const lead = crmDb.leads.find(l => String(l.id) === String(targetLeadId));
      if (lead) {
        setSelectedLead(lead);
        setInspectDrawerOpen(true);
        setDrawerActiveTab(targetSubTab);
      }
      localStorage.removeItem('hero_sales_selected_lead_id');
      localStorage.removeItem('hero_sales_selected_lead_subtab');
    }

    return () => {
      window.removeEventListener('hero-open-lead-drawer', handleOpenDrawerEvent);
    };
  }, [activeTab, crmDb.leads]);

  // --- METRICS & KPIs ---
  const kpis = useMemo(() => crmMetricsEngine.calculateKpis(), [crmDb]);
  const sourcesData = useMemo(() => crmMetricsEngine.calculateAcquisitionSources(), [crmDb]);
  const repPerformanceData = useMemo(() => crmMetricsEngine.calculateRepPerformance(), [crmDb]);

  // --- PERMISSION SYSTEM STATE ---
  const [permissionRole, setPermissionRole] = useState(() => {
    return localStorage.getItem('hero_crm_permission_role') || 'Sales Director';
  });

  const changePermissionRole = (role) => {
    setPermissionRole(role);
    localStorage.setItem('hero_crm_permission_role', role);
    triggerToast(`Switched simulation perspective to: ${role}`);
  };

  // Check if operation is allowed
  const verifyPermission = (action, isSilentlyChecked = false) => {
    if (permissionRole === 'Sales Director') return true;
    
    // Restrictions for Sales Agent
    const restrictedActions = [
      'delete_lead',
      'deactivate_trial',
      'extend_trial_over_30',
      'approve_high_discount',
      'reset_trial_database',
      'modify_role_permissions'
    ];

    if (restrictedActions.includes(action)) {
      if (!isSilentlyChecked) {
        triggerToast(`Access Denied: Requires Sales Director permission clearance.`, 'error');
      }
      return false;
    }
    return true;
  };

  // --- MODALS & DRAWERS STATE ---
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [editLeadModalOpen, setEditLeadModalOpen] = useState(false);
  const [inspectDrawerOpen, setInspectDrawerOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalPreviewModalOpen, setProposalPreviewModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [onboardingTaskModalOpen, setOnboardingTaskModalOpen] = useState(false);
  const [onboardingTaskForm, setOnboardingTaskForm] = useState({ name: '' });
  const [onboardingHandoverModalOpen, setOnboardingHandoverModalOpen] = useState(false);
  const [onboardingHandoverForm, setOnboardingHandoverForm] = useState({ notes: '', repName: 'Alex Wright' });
  const [dragConfirmModalOpen, setDragConfirmModalOpen] = useState(false);
  const [extendTrialModalOpen, setExtendTrialModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [previewDocModalOpen, setPreviewDocModalOpen] = useState(false);
  const [conversionWizardOpen, setConversionWizardOpen] = useState(false);
  const [crmNotificationsOpen, setCrmNotificationsOpen] = useState(false);
  const [recommendPlanModalOpen, setRecommendPlanModalOpen] = useState(false);

  // --- CRM CONFIGS, REVISIONS, AND REPORT STATES ---
  const [revisingProposalId, setRevisingProposalId] = useState(null);
  const [selectedSubReport, setSelectedSubReport] = useState('Leads');
  
  const [customTemplates, setCustomTemplates] = useState(() => {
    const saved = localStorage.getItem('hero_crm_templates');
    if (saved) return JSON.parse(saved);
    return {
      'Welcome Sandbox Invite': 'Hi {{contact_name}},\n\nYour 14-day evaluation sandbox for {{company_name}} is provisioned. Please download your platform access keys here: https://hero-telematics.com/keys.\n\nBest,\n{{rep_name}}',
      'Pricing Proposal Followup': 'Hi {{contact_name}},\n\nFollowing up on the SaaS License Core Agreement we dispatched. We can offer a corporate discount options alignment discussion. Let us lock a zoom block.\n\nRegards,\n{{rep_name}}',
      'Demo Presentation Confirmation': 'Hi {{contact_name}},\n\nThank you for booking product demo slot with Hero Logistics. Zoom link details: https://zoom.us/j/9812903. Focus points will telematics dispatch.\n\nBest,\n{{rep_name}}'
    };
  });

  const [pipelineStages, setPipelineStages] = useState(() => {
    const saved = localStorage.getItem('hero_crm_stages');
    if (saved) return JSON.parse(saved);
    return [
      'New Lead', 'Contacted', 'Demo Booked', 'Demo Completed', 
      'Trial Started', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'
    ];
  });

  const [leadSources, setLeadSources] = useState(() => {
    const saved = localStorage.getItem('hero_crm_lead_sources');
    if (saved) return JSON.parse(saved);
    return ['Google Search', 'LinkedIn', 'Partner Referral', 'Cold Call', 'Other'];
  });

  // Settings sub-state
  const [settingsActiveTemplate, setSettingsActiveTemplate] = useState('Welcome Sandbox Invite');
  const [settingsTemplateSubject, setSettingsTemplateSubject] = useState('Welcome to Hero Logistics System Trial!');
  const [settingsTemplateBody, setSettingsTemplateBody] = useState('');
  const [newStageInput, setNewStageInput] = useState('');
  const [newLeadSourceInput, setNewLeadSourceInput] = useState('');

  // Shadow global stages constant with state-driven stages
  const stages = pipelineStages;

  // Synchronize template body editor when template selection changes
  useEffect(() => {
    setSettingsTemplateBody(customTemplates[settingsActiveTemplate] || '');
  }, [settingsActiveTemplate, customTemplates]);

  // --- SELECTED ENTITIES ---
  const [selectedLead, setSelectedLead] = useState(null);
  const [overviewSelectedLeadId, setOverviewSelectedLeadId] = useState(() => {
    const db = crmRepository.getCrmDatabase();
    return db.leads[0]?.id || null;
  });
  const overviewSelectedLead = useMemo(() => {
    return crmDb.leads.find(l => String(l.id) === String(overviewSelectedLeadId)) || crmDb.leads[0];
  }, [crmDb.leads, overviewSelectedLeadId]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);
  const [targetDragStage, setTargetDragStage] = useState('');
  
  // Drawer tab control
  const [drawerActiveTab, setDrawerActiveTab] = useState('Overview');
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // --- TOAST AND UNDO LOGIC ---
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [undoHistory, setUndoHistory] = useState(null);

  const triggerToast = (msg, type = 'success', undoPayload = null) => {
    setToastMessage(msg);
    setToastType(type);
    setUndoHistory(undoPayload);
  };

  const executeUndo = () => {
    if (undoHistory) {
      crmStore.updateDb(() => undoHistory);
      triggerToast('Last stage transition successfully undone.', 'success');
      setUndoHistory(null);
    }
  };

  const handleSaveTemplate = () => {
    const updatedTemplates = {
      ...customTemplates,
      [settingsActiveTemplate]: settingsTemplateBody
    };
    setCustomTemplates(updatedTemplates);
    localStorage.setItem('hero_crm_templates', JSON.stringify(updatedTemplates));
    triggerToast(`Email template "${settingsActiveTemplate}" updated successfully!`);
  };

  const handleAddStage = () => {
    if (!newStageInput.trim()) return;
    if (pipelineStages.includes(newStageInput.trim())) {
      triggerToast('Stage already exists.', 'warning');
      return;
    }
    const updatedStages = [...pipelineStages, newStageInput.trim()];
    setPipelineStages(updatedStages);
    localStorage.setItem('hero_crm_stages', JSON.stringify(updatedStages));
    setNewStageInput('');
    triggerToast(`Pipeline stage "${newStageInput.trim()}" added.`);
  };

  const handleDeleteStage = (stageToDelete) => {
    if (['New Lead', 'Won', 'Lost'].includes(stageToDelete)) {
      triggerToast('Core stages (New Lead, Won, Lost) cannot be deleted.', 'warning');
      return;
    }
    const updatedStages = pipelineStages.filter(s => s !== stageToDelete);
    setPipelineStages(updatedStages);
    localStorage.setItem('hero_crm_stages', JSON.stringify(updatedStages));
    triggerToast(`Stage "${stageToDelete}" deleted.`);
  };

  const handleAddLeadSource = () => {
    if (!newLeadSourceInput.trim()) return;
    if (leadSources.includes(newLeadSourceInput.trim())) {
      triggerToast('Source already exists.', 'warning');
      return;
    }
    const updatedSources = [...leadSources, newLeadSourceInput.trim()];
    setLeadSources(updatedSources);
    localStorage.setItem('hero_crm_lead_sources', JSON.stringify(updatedSources));
    setNewLeadSourceInput('');
    triggerToast(`Lead source "${newLeadSourceInput.trim()}" added.`);
  };

  const handleDeleteLeadSource = (sourceToDelete) => {
    if (leadSources.length <= 1) {
      triggerToast('At least one lead source is required.', 'warning');
      return;
    }
    const updatedSources = leadSources.filter(s => s !== sourceToDelete);
    setLeadSources(updatedSources);
    localStorage.setItem('hero_crm_lead_sources', JSON.stringify(updatedSources));
    triggerToast(`Lead source "${sourceToDelete}" deleted.`);
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Contact Name', 'Email', 'Phone', 'Stage', 'Revenue', 'Rep', 'Priority', 'Niche'];
    const rows = crmDb.leads.map(l => [
      l.company,
      l.name,
      l.email,
      l.phone,
      l.stage,
      l.revenue,
      l.rep,
      l.priority,
      l.niche
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hero_Logistics_CRM_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("CSV Export downloaded successfully!");
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Hero Logistics - CRM Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { border-bottom: 2px solid #FFD400; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Hero Logistics System - CRM Leads Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Stage</th>
                <th>Rep</th>
                <th>Est. Value</th>
              </tr>
            </thead>
            <tbody>
              ${crmDb.leads.map(l => `
                <tr>
                  <td><strong>${l.company}</strong></td>
                  <td>${l.name}</td>
                  <td>${l.email}</td>
                  <td>${l.stage}</td>
                  <td>${l.rep}</td>
                  <td>$${l.revenue}/mo</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    triggerToast("PDF print dialog opened.");
  };

  // --- ADD LEAD FORM STATE ---
  const [leadForm, setLeadForm] = useState({
    company: '', name: '', email: '', phone: '', website: '',
    fleetSize: '25', niche: 'General Freight', currentSoftware: 'Spreadsheets (Excel)',
    leadSource: 'Google Search', painPoints: 'Manual routing takes hours',
    revenue: '2500', country: 'USA', state: 'IL', address: '12 Logistics Center',
    priority: 'Medium', tags: 'SaaS Inbound', rep: 'Alex Wright', notes: '',
    nextFollowup: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // --- MOCK FORM STATES ---
  const [demoForm, setDemoForm] = useState({ date: '', time: '10:00 AM', presenter: 'Alex Wright', notes: '' });
  const [followupForm, setFollowupForm] = useState({ type: 'Call', priority: 'Medium', dueDate: '', dueTime: '10:00 AM', notes: '' });

  const handleOpenAddLeadModal = () => {
    setLeadForm({
      company: '', name: '', email: '', phone: '', website: '',
      fleetSize: '25', niche: 'General Freight', currentSoftware: 'Spreadsheets (Excel)',
      leadSource: 'Google Search', painPoints: 'Manual routing takes hours',
      revenue: '2500', country: 'USA', state: 'IL', address: '12 Logistics Center',
      priority: 'Medium', tags: 'SaaS Inbound', rep: 'Alex Wright', notes: '',
      nextFollowup: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setAddLeadModalOpen(true);
  };

  const handleAddLeadSubmit = (e, andBookDemo = false) => {
    e.preventDefault();
    if (!leadForm.company || !leadForm.name || !leadForm.email) {
      triggerToast('Company, Contact Name, and Email are mandatory fields.', 'error');
      return;
    }

    const newLead = crmRepository.createLead({
      company: leadForm.company,
      name: leadForm.name,
      phone: leadForm.phone,
      email: leadForm.email,
      fleetSize: leadForm.fleetSize,
      niche: leadForm.niche,
      currentSoftware: leadForm.currentSoftware,
      painPoints: leadForm.painPoints,
      priority: leadForm.priority,
      rep: leadForm.rep,
      revenue: leadForm.revenue,
      notes: leadForm.notes,
      tags: leadForm.tags,
      nextFollowup: leadForm.nextFollowup,
      stage: andBookDemo ? 'Demo Booked' : 'New Lead'
    });

    if (andBookDemo && newLead) {
      crmRepository.scheduleDemo(newLead.id, {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00 AM',
        presenter: leadForm.rep,
        notes: `Immediate demo walkthrough registered during lead creation.`
      });
    }

    setAddLeadModalOpen(false);
    triggerToast(`Lead for ${leadForm.company} created successfully!`);
  };

  // --- EDIT LEAD STATE ---
  const handleEditLeadOpen = (lead) => {
    setSelectedLead(lead);
    setLeadForm({
      company: lead.company,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website || '',
      fleetSize: String(lead.fleetSize),
      niche: lead.niche,
      currentSoftware: lead.currentSoftware,
      leadSource: lead.leadSource || 'LinkedIn',
      painPoints: lead.painPoints,
      revenue: String(lead.revenue),
      country: lead.country || 'USA',
      state: lead.state || 'IL',
      address: lead.address || '',
      priority: lead.priority,
      tags: lead.tags || '',
      rep: lead.rep,
      notes: lead.notes?.[0]?.text || '',
      nextFollowup: lead.nextFollowup || ''
    });
    setEditLeadModalOpen(true);
  };

  const handleEditLeadSave = (e) => {
    e.preventDefault();
    crmRepository.updateLead(selectedLead.id, {
      company: leadForm.company,
      name: leadForm.name,
      email: leadForm.email,
      phone: leadForm.phone,
      fleetSize: leadForm.fleetSize,
      niche: leadForm.niche,
      currentSoftware: leadForm.currentSoftware,
      painPoints: leadForm.painPoints,
      revenue: leadForm.revenue,
      priority: leadForm.priority,
      rep: leadForm.rep,
      tags: leadForm.tags,
      nextFollowup: leadForm.nextFollowup
    });

    const firstNoteText = selectedLead.notes?.[0]?.text || '';
    if (leadForm.notes && leadForm.notes !== firstNoteText) {
      crmRepository.addNote(selectedLead.id, leadForm.notes, permissionRole);
    }

    crmActivityEngine.logMutation(selectedLead.id, permissionRole, 'Lead Updated', 'Core information fields modified.', 'None', 'Updated');
    
    setEditLeadModalOpen(false);
    triggerToast(`Lead details updated for ${leadForm.company}`);
  };

  // --- DELETE LEAD ---
  const handleDeleteLead = (leadId) => {
    if (!verifyPermission('delete_lead')) return;

    const originalDb = JSON.parse(JSON.stringify(crmStore.getDb()));
    const targetLeadName = crmDb.leads.find(l => l.id === leadId)?.company || 'Lead';
    
    crmRepository.deleteLead(leadId);
    
    setInspectDrawerOpen(false);
    triggerToast(`Lead card ${targetLeadName} deleted successfully.`, 'warning', originalDb);
  };

  // --- TRANSITIONS / WORKFLOW INTEGRATIONS ---

  // Book a Demo
  const handleOpenDemoModal = (lead) => {
    setSelectedLead(lead);
    setDemoForm({
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      presenter: lead.rep,
      notes: `Walkthrough showcasing fleet telematics and factoring automation.`
    });
    setDemoModalOpen(true);
  };

  const handleBookDemoSubmit = (e) => {
    e.preventDefault();
    crmRepository.scheduleDemo(selectedLead.id, {
      date: demoForm.date,
      time: demoForm.time,
      presenter: demoForm.presenter,
      notes: demoForm.notes
    });

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'Demo Booked',
      `Product walkthrough assigned to ${demoForm.presenter} for ${demoForm.date}.`,
      selectedLead.stage,
      'Demo Booked'
    );

    setDemoModalOpen(false);
    triggerToast(`Demo Presentation scheduled for ${selectedLead.company}!`);
  };
  
  const handleCreateFollowup = (e) => {
    e.preventDefault();
    if (!followupForm.dueDate) {
      triggerToast('Due date is required.', 'error');
      return;
    }
    crmRepository.createFollowup(selectedLead.id, {
      type: followupForm.type,
      priority: followupForm.priority,
      dueDate: followupForm.dueDate,
      dueTime: followupForm.dueTime,
      notes: followupForm.notes
    });
    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'Followup Scheduled',
      `Scheduled ${followupForm.type} follow-up on ${followupForm.dueDate} at ${followupForm.dueTime}. Notes: ${followupForm.notes}`,
      'None',
      'Scheduled'
    );
    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    setFollowupModalOpen(false);
    triggerToast(`Follow-up scheduled with ${selectedLead.company}!`);
  };

  // Completed Demo
  const handleMarkDemoCompleted = (demo) => {
    crmRepository.completeDemo(demo.id);

    crmActivityEngine.logMutation(
      demo.leadId,
      permissionRole,
      'Demo Completed',
      `Product presentation successfully completed by ${demo.presenter}.`,
      'Demo Booked',
      'Demo Completed'
    );

    triggerToast(`Demo with ${demo.company} completed. Recommending Trial Startup!`);
  };

  // Start Trial
  const handleStartTrial = (lead) => {
    const exists = crmDb.trials.some(t => t.leadId === lead.id);
    if (exists) {
      triggerToast(`Sandbox trial workspace already active for ${lead.company}.`, 'warning');
      return;
    }

    crmRepository.startTrial(lead.id, { plan: 'Professional' });

    crmActivityEngine.logMutation(
      lead.id,
      permissionRole,
      'Trial Started',
      `14-Day evaluation workspace created on the Professional Plan.`,
      lead.stage,
      'Trial Started'
    );

    triggerToast(`Trial Sandbox provisioned for ${lead.company}!`);
  };

  // Generate Proposal
  const [proposalBuilder, setProposalBuilder] = useState({
    title: '', items: [{ name: 'Enterprise Fleet Core Platform License', price: 1500, qty: 1 }],
    discount: 0, tax: 10, validity: '30 Days'
  });

  const handleOpenProposalModal = (lead) => {
    setSelectedLead(lead);
    setProposalBuilder({
      title: `Hero Logistics SaaS License - ${lead.company}`,
      items: [
        { name: 'Enterprise License Tier base', price: lead.revenue, qty: 1 },
        { name: 'GPS Fleet Tracking Modules API', price: Math.round(lead.revenue * 0.15), qty: 1 }
      ],
      discount: 0,
      tax: 10,
      validity: '30 Days'
    });
    setProposalModalOpen(true);
  };

  const handleAddProposalItem = () => {
    setProposalBuilder({
      ...proposalBuilder,
      items: [...proposalBuilder.items, { name: 'Add-on module license', price: 299, qty: 1 }]
    });
  };

  const handleSaveProposalSubmit = (e) => {
    e.preventDefault();
    const coreValue = proposalBuilder.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmt = (coreValue * (proposalBuilder.discount / 100));
    
    if (proposalBuilder.discount > 20 && !verifyPermission('approve_high_discount')) {
      return;
    }

    const totalVal = Math.round((coreValue - discountAmt) * (1 + (proposalBuilder.tax / 100)));

    if (revisingProposalId) {
      crmRepository.reviseProposal(revisingProposalId, {
        title: proposalBuilder.title,
        value: coreValue,
        discount: proposalBuilder.discount,
        tax: proposalBuilder.tax,
        total: totalVal,
        validity: proposalBuilder.validity,
        items: proposalBuilder.items
      });

      crmActivityEngine.logMutation(
        selectedLead.id,
        permissionRole,
        'Proposal Revised',
        `Proposal revised to new version. Total: $${totalVal} total MRR.`,
        selectedLead.stage,
        'Proposal Sent'
      );

      const db = crmRepository.getCrmDatabase();
      const updatedProp = db.proposals.find(p => p.id === revisingProposalId);
      setSelectedProposal(updatedProp);
      setRevisingProposalId(null);
      setProposalModalOpen(false);
      triggerToast(`SaaS contract proposal revised successfully!`);
    } else {
      crmRepository.createProposal(selectedLead.id, {
        title: proposalBuilder.title,
        value: coreValue,
        discount: proposalBuilder.discount,
        tax: proposalBuilder.tax,
        total: totalVal,
        validity: proposalBuilder.validity,
        items: proposalBuilder.items
      });

      crmActivityEngine.logMutation(
        selectedLead.id,
        permissionRole,
        'Proposal Sent',
        `Proposal generated: $${totalVal} total MRR (inclusive of ${proposalBuilder.discount}% discount).`,
        selectedLead.stage,
        'Proposal Sent'
      );

      setProposalModalOpen(false);
      triggerToast(`SaaS contract proposal V1 dispatched for ${selectedLead.company}!`);
    }
  };

  // Accept Proposal
  const handleProposalAccept = (prop) => {
    crmRepository.updateProposal(prop.id, { status: 'Accepted' });

    crmWorkflowEngine.handleStageChange(prop.leadId, 'Won', 'Proposal accepted by client', permissionRole);

    const lead = crmRepository.getLeadById(prop.leadId);
    setSelectedLead(lead);
    setConversionWizardOpen(true);
    triggerToast(`Contract Accepted! Initiating Company Conversion Wizard...`);
  };

  // --- KANBAN BOARD DRAG & DROP HANDLERS ---
  const handleDragStart = (e, lead) => {
    e.dataTransfer.setData('leadId', String(lead.id));
    setDraggedLead(lead);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const leadIdStr = e.dataTransfer.getData('leadId');
    if (!leadIdStr) return;

    const lead = crmDb.leads.find(l => String(l.id) === String(leadIdStr));
    if (!lead) return;

    if (lead.stage === targetStage) return;

    setTargetDragStage(targetStage);
    setDraggedLead(lead);
    setTransitionNote(`Updating lead lifecycle to stage: ${targetStage}.`);
    setDragConfirmModalOpen(true);
  };

  const [transitionNote, setTransitionNote] = useState('');
  const handleConfirmStageTransition = () => {
    const originalDb = JSON.parse(JSON.stringify(crmStore.getDb()));
    
    crmWorkflowEngine.handleStageChange(draggedLead.id, targetDragStage, transitionNote, permissionRole);

    setDragConfirmModalOpen(false);
    triggerToast(`Lead moved to: ${targetDragStage}.`, 'success', originalDb);

    if (targetDragStage === 'Won') {
      const updatedLead = crmRepository.getLeadById(draggedLead.id);
      setSelectedLead(updatedLead);
      setConversionWizardOpen(true);
    }
  };

  // --- MULTIPLE CONTACTS CRUD ---
  const [contactForm, setContactForm] = useState({ name: '', role: 'Operations Manager', email: '', phone: '', isPrimary: false });
  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) {
      triggerToast('Name and Email are required.', 'error');
      return;
    }

    if (selectedContact) {
      crmRepository.updateContact(selectedContact.id, {
        name: contactForm.name,
        role: contactForm.role,
        email: contactForm.email,
        phone: contactForm.phone,
        isPrimary: contactForm.isPrimary
      });
    } else {
      crmRepository.addContact(selectedLead.id, {
        name: contactForm.name,
        role: contactForm.role,
        email: contactForm.email,
        phone: contactForm.phone,
        isPrimary: contactForm.isPrimary
      });
    }

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      selectedContact ? 'Contact Updated' : 'Contact Added',
      `${contactForm.name} registered as ${contactForm.role}.`,
      'None',
      'Updated'
    );

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    setContactModalOpen(false);
    triggerToast(selectedContact ? 'Contact updated.' : 'New contact registered.');
  };

  // --- SALES ACTIVITIES LOGGER ---
  const [activityForm, setActivityForm] = useState({ type: 'Phone Call', date: '', time: '10:00 AM', outcome: 'Connected', priority: 'Medium', notes: '' });
  const handleLogActivity = (e) => {
    e.preventDefault();
    crmRepository.logActivity(selectedLead.id, {
      type: activityForm.type,
      date: activityForm.date,
      time: activityForm.time,
      user: permissionRole,
      outcome: activityForm.outcome,
      notes: activityForm.notes
    });

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'Activity Logged',
      `${activityForm.type} - Outcome: ${activityForm.outcome}. Notes: ${activityForm.notes}`,
      'None',
      'Updated'
    );

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    setActivityModalOpen(false);
    triggerToast(`Logged new activity touchpoint!`);
  };

  // --- EMAIL CENTER ---
  const [emailForm, setEmailForm] = useState({ subject: '', template: 'Welcome Sandbox Invite', body: '', status: 'Sent' });

  useEffect(() => {
    if (selectedLead && emailForm) {
      const parsed = customTemplates[emailForm.template]
        ?.replace(/{{contact_name}}/g, selectedLead.name)
        ?.replace(/{{company_name}}/g, selectedLead.company)
        ?.replace(/{{rep_name}}/g, selectedLead.rep) || '';
      setEmailForm(prev => {
        if (!prev) return prev;
        if (prev.body === parsed && prev.subject === emailForm.template) return prev;
        return { ...prev, body: parsed, subject: emailForm.template };
      });
    }
  }, [emailForm?.template, selectedLead, customTemplates]);

  const handleSendEmail = (e) => {
    e.preventDefault();
    crmRepository.logEmail(selectedLead.id, {
      subject: emailForm.subject,
      body: emailForm.body,
      template: emailForm.template,
      status: emailForm.status,
      user: permissionRole
    });

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'Email Logged',
      `Dispatched template: ${emailForm.template}. Status: ${emailForm.status}`,
      'None',
      'Updated'
    );

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    setEmailModalOpen(false);
    triggerToast(emailForm.status === 'Sent' ? 'Email sent successfully!' : `Email saved as ${emailForm.status}.`);
  };

  // --- CALL LOGS AND WORK STATION AUDIOS ---
  const [callForm, setCallForm] = useState({ duration: '2m 15s', outcome: 'Connected', notes: '' });
  const handleLogCall = (e) => {
    e.preventDefault();
    crmRepository.logCall(selectedLead.id, {
      type: 'Outgoing',
      duration: callForm.duration,
      outcome: callForm.outcome,
      notes: callForm.notes,
      user: permissionRole
    });

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'Call Logged',
      `Logged call: ${callForm.outcome} (${callForm.duration}). Notes: ${callForm.notes}`,
      'None',
      'Updated'
    );

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    setCallModalOpen(false);
    triggerToast(`Logged telephone check-in.`);
  };

  // Call waveform play preview simulation
  const [playingCallId, setPlayingCallId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const playTimer = useRef(null);

  const togglePlayCall = (callId) => {
    if (playingCallId === callId) {
      clearInterval(playTimer.current);
      setPlayingCallId(null);
    } else {
      clearInterval(playTimer.current);
      setPlayingCallId(callId);
      setPlayProgress(0);
      playTimer.current = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            clearInterval(playTimer.current);
            setPlayingCallId(null);
            return 0;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  // --- TASK MANAGER ---
  const [taskForm, setTaskForm] = useState({ title: '', type: 'Call', dueDate: '', priority: 'Medium' });
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title) {
      triggerToast('Task title is required.', 'error');
      return;
    }

    crmRepository.createTask(selectedLead.id, {
      title: taskForm.title,
      type: taskForm.type,
      dueDate: taskForm.dueDate || new Date().toISOString().split('T')[0],
      priority: taskForm.priority
    });

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'Task Assigned',
      `Due: ${taskForm.dueDate || new Date().toISOString().split('T')[0]}. Type: ${taskForm.type}. Priority: ${taskForm.priority}`,
      'None',
      'Updated'
    );

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    setTaskModalOpen(false);
    triggerToast(`Added task: ${taskForm.title}`);
  };

  const handleToggleTaskStatus = (taskId) => {
    crmRepository.toggleTask(taskId);
    
    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    triggerToast(`Task checklist updated.`);
  };

  // --- DOCUMENT CENTER ---
  const handlePreviewDocument = (doc) => {
    setSelectedDocument(doc);
    setPreviewDocModalOpen(true);
  };

  const handleDeleteDocument = (docId) => {
    crmRepository.deleteDocument(docId);

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    triggerToast(`Document deleted successfully.`);
  };

  // Mock Document replace upload
  const handleReplaceDocument = (docId) => {
    crmStore.updateDb((db) => {
      const doc = (db.crmDocuments || []).find(d => d.id === docId);
      if (doc) {
        doc.name = `Replaced_${doc.name}`;
        doc.date = new Date().toISOString().split('T')[0];
      }
    });

    crmActivityEngine.logMutation(
      selectedLead.id,
      permissionRole,
      'File Uploaded',
      `Replaced files checklists.`,
      'None',
      'Updated'
    );

    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
    setSelectedLead(leadNewObj);
    triggerToast(`File replaced successfully with mockup upload!`);
  };

  // --- FILTER STATES & MEMOIZED LISTS ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNiche, setFilterNiche] = useState('All');
  const [filterSize, setFilterSize] = useState('All');
  const [leadsCurrentPage, setLeadsCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const filteredLeadsList = useMemo(() => {
    return crmDb.leads.filter(l => {
      const matchesSearch = searchQuery
        ? [l.company, l.name, l.email, l.phone, l.rep]
            .some(val => val && val.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      const matchesNiche = filterNiche === 'All' || l.niche === filterNiche;
      let matchesSize = true;
      if (filterSize === 'Starter') {
        matchesSize = l.fleetSize < 35;
      } else if (filterSize === 'Mid') {
        matchesSize = l.fleetSize >= 35 && l.fleetSize <= 100;
      } else if (filterSize === 'Enterprise') {
        matchesSize = l.fleetSize > 100;
      }
      return matchesSearch && matchesNiche && matchesSize;
    });
  }, [crmDb.leads, searchQuery, filterNiche, filterSize]);

  // --- SAVED FILTERS TABS CONTROLLER ---
  const [currentFilterTab, setCurrentFilterTab] = useState('All'); // All, My Leads, High Value, Hot Leads, Demo Pending, Proposal Pending, Won, Lost

  const activeFilteredLeadsList = useMemo(() => {
    return filteredLeadsList.filter(l => {
      if (currentFilterTab === 'My Leads') return l.rep === 'Alex Wright';
      if (currentFilterTab === 'High Value') return l.revenue > 8000;
      if (currentFilterTab === 'Hot Leads') return l.score > 80;
      if (currentFilterTab === 'Demo Pending') return l.stage === 'Contacted';
      if (currentFilterTab === 'Proposal Pending') return l.stage === 'Trial Started';
      if (currentFilterTab === 'Won') return l.stage === 'Won';
      if (currentFilterTab === 'Lost') return l.stage === 'Lost';
      return true;
    });
  }, [filteredLeadsList, currentFilterTab]);

  const totalPagesCount = Math.ceil(activeFilteredLeadsList.length / leadsPerPage);
  const activePaginatedLeadsList = useMemo(() => {
    const start = (leadsCurrentPage - 1) * leadsPerPage;
    return activeFilteredLeadsList.slice(start, start + leadsPerPage);
  }, [activeFilteredLeadsList, leadsCurrentPage]);

  // --- BULK OPERATIONS TOOLBAR ---
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkRepVal, setBulkRepVal] = useState('Alex Wright');
  const [bulkStatusVal, setBulkStatusVal] = useState('Contacted');

  const toggleSelectLead = (id) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAllLeads = () => {
    if (selectedLeadIds.length === activePaginatedLeadsList.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(activePaginatedLeadsList.map(l => l.id));
    }
  };

  const handleBulkRepAssign = () => {
    crmStore.updateDb((db) => {
      db.leads.forEach(l => {
        if (selectedLeadIds.includes(l.id)) {
          l.rep = bulkRepVal;
        }
      });
    });
    setSelectedLeadIds([]);
    triggerToast(`Assigned ${selectedLeadIds.length} leads to ${bulkRepVal}.`);
  };

  const handleBulkStatusChange = () => {
    crmStore.updateDb((db) => {
      db.leads.forEach(l => {
        if (selectedLeadIds.includes(l.id)) {
          l.stage = bulkStatusVal;
          l.lastContact = new Date().toISOString().split('T')[0];
        }
      });
    });
    setSelectedLeadIds([]);
    triggerToast(`Moved ${selectedLeadIds.length} leads to ${bulkStatusVal}.`);
  };

  const handleBulkDelete = () => {
    if (!verifyPermission('delete_lead')) return;
    crmStore.updateDb((db) => {
      db.leads = db.leads.filter(l => !selectedLeadIds.includes(l.id));
      selectedLeadIds.forEach(id => {
        db.crmContacts = (db.crmContacts || []).filter(c => c.leadId !== id);
        db.crmDemos = (db.crmDemos || []).filter(d => d.leadId !== id);
        db.crmProposals = (db.crmProposals || []).filter(p => p.leadId !== id);
        db.crmTrials = (db.crmTrials || []).filter(t => t.leadId !== id);
        db.crmTasks = (db.crmTasks || []).filter(t => t.leadId !== id);
        db.crmDocuments = (db.crmDocuments || []).filter(d => d.leadId !== id);
        db.crmActivities = (db.crmActivities || []).filter(a => a.leadId !== id);
        db.crmNotes = (db.crmNotes || []).filter(n => n.leadId !== id);
        db.crmTimeline = (db.crmTimeline || []).filter(t => t.leadId !== id);
        db.crmAuditLogs = (db.crmAuditLogs || []).filter(a => a.leadId !== id);
        db.crmEmails = (db.crmEmails || []).filter(e => e.leadId !== id);
        db.crmCalls = (db.crmCalls || []).filter(c => c.leadId !== id);
        db.crmFollowups = (db.crmFollowups || []).filter(f => f.leadId !== id);
        db.crmOnboarding = (db.crmOnboarding || []).filter(o => o.leadId !== id);
      });
    });
    setSelectedLeadIds([]);
    triggerToast(`Bulk deleted ${selectedLeadIds.length} leads.`, 'warning');
  };

  // --- COMPANY CONVERSION WIZARD STATE ---
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    tier: 'Professional',
    frequency: 'Monthly',
    legalName: '',
    dotNumber: '',
    taxId: '',
    adminName: '',
    adminEmail: '',
    branch: 'Chicago HQ Terminal'
  });

  useEffect(() => {
    if (selectedLead) {
      setWizardForm(prev => ({
        ...prev,
        legalName: selectedLead.company,
        adminName: selectedLead.name,
        adminEmail: selectedLead.email,
        dotNumber: `DOT-${Math.floor(100000 + Math.random() * 900000)}`,
        taxId: `TX-${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000000 + Math.random() * 9000000)}`
      }));
    }
  }, [selectedLead, conversionWizardOpen]);

  const [provisioningLoading, setProvisioningLoading] = useState(false);
  const [provisioningStatusText, setProvisioningStatusText] = useState('');
  
  const handleProceedWizard = () => {
    if (wizardStep < 5) {
      setWizardStep(prev => prev + 1);
    } else if (wizardStep === 5) {
      setWizardStep(6);
      setProvisioningLoading(true);
      
      const statuses = [
        'Connecting subscription credentials...',
        'Provisioning secure SaaS database tables...',
        'Registering terminal depot nodes...',
        'Creating company administrator keys...',
        'Database synchronisation complete!'
      ];

      let count = 0;
      setProvisioningStatusText(statuses[0]);
      const timer = setInterval(() => {
        count++;
        if (count < statuses.length) {
          setProvisioningStatusText(statuses[count]);
        } else {
          clearInterval(timer);
          setProvisioningLoading(false);
          
          crmWorkflowEngine.handleConvertLeadToCompany(selectedLead.id, {
            legalName: wizardForm.legalName,
            tier: wizardForm.tier,
            frequency: wizardForm.frequency,
            adminName: wizardForm.adminName,
            adminEmail: wizardForm.adminEmail,
            revenue: selectedLead.revenue
          });
        }
      }, 900);
    }
  };

  // Convert/Login Direct takeover
  const handleWizardLoginAsCompany = () => {
    window.location.href = '/company-admin-dashboard';
  };

  // Onboarding enhancements
  const handleCompleteOnboardingTask = (oId, idx) => {
    crmRepository.completeOnboardingTask(oId, idx);
    const db = crmRepository.getCrmDatabase();
    setSelectedOnboarding(db.onboarding.find(item => item.id === oId));
    triggerToast('Onboarding checklist updated.');
  };

  const handleCreateOnboardingTask = (e) => {
    e.preventDefault();
    if (!onboardingTaskForm.name.trim()) {
      triggerToast('Task name is required.', 'error');
      return;
    }
    crmRepository.addOnboardingTask(selectedOnboarding.id, onboardingTaskForm.name.trim());
    const db = crmRepository.getCrmDatabase();
    setSelectedOnboarding(db.onboarding.find(o => o.id === selectedOnboarding.id));
    setOnboardingTaskModalOpen(false);
    triggerToast(`Added onboarding task: ${onboardingTaskForm.name}`);
  };

  const handleSendOnboardingHandover = (e) => {
    e.preventDefault();
    if (!onboardingHandoverForm.notes.trim()) {
      triggerToast('Handover notes are required.', 'error');
      return;
    }
    
    crmStore.updateDb(db => {
      const onboard = db.crmOnboarding.find(o => o.id === selectedOnboarding.id);
      if (onboard) {
        const exists = onboard.checklist.some(item => item.name === 'Onboarding Handover Package Dispatched');
        if (!exists) {
          onboard.checklist.push({
            name: 'Onboarding Handover Package Dispatched',
            completed: true
          });
        } else {
          onboard.checklist.forEach(item => {
            if (item.name === 'Onboarding Handover Package Dispatched') {
              item.completed = true;
            }
          });
        }
        const allCompleted = onboard.checklist.every(c => c.completed);
        onboard.status = allCompleted ? 'Completed' : 'In Progress';
      }
    });
    
    crmActivityEngine.logMutation(
      selectedOnboarding.leadId,
      permissionRole,
      'Handover Dispatched',
      `Onboarding handover checklist and documents dispatched. Notes: ${onboardingHandoverForm.notes}`,
      'Onboarding',
      'Handover Sent'
    );
    
    const db = crmRepository.getCrmDatabase();
    setSelectedOnboarding(db.onboarding.find(o => o.id === selectedOnboarding.id));
    setOnboardingHandoverModalOpen(false);
    triggerToast(`Handover package sent to Operations Team successfully!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-xl px-4 py-3 text-xs font-semibold">
            <span>{toastMessage}</span>
            {undoHistory && (
              <button 
                onClick={executeUndo}
                className="text-brand-400 hover:text-brand-350 cursor-pointer font-bold border-l border-slate-700 pl-3 uppercase tracking-wider text-[10px]"
              >
                Undo
              </button>
            )}
            <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white cursor-pointer ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5 text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize flex items-center gap-2">
            Hero Sales CRM Console <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Enterprise Logistics</span>
          </h2>
          <p className="text-xs text-slate-400">Complete end-to-end client conversion console backed by secure localStorage registry tables.</p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="bg-[#111827]/60 border border-[#23324C]/50 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-350 font-mono font-bold">Shift: Sales Active</span>
          </div>

          <div className="bg-[#161F30]/80 border border-[#23324C]/60 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
            <Lock className="h-3 w-3 text-brand-400" />
            <span className="text-[10px] text-slate-400 font-bold">Role:</span>
            <select
              value={permissionRole}
              onChange={(e) => changePermissionRole(e.target.value)}
              className="bg-transparent text-slate-200 text-[10px] font-black focus:outline-none cursor-pointer"
            >
              <option value="Sales Director" className="bg-[#161F30]">Sales Director (Full Access)</option>
              <option value="Sales Representative" className="bg-[#161F30]">Sales Representative (Restricted)</option>
            </select>
          </div>

          {/* CRM Notification Center Trigger */}
          <button
            onClick={() => setCrmNotificationsOpen(true)}
            className="relative p-2 bg-[#161F30]/80 border border-[#23324C]/60 rounded-xl text-slate-400 hover:text-white cursor-pointer hover:border-brand-500/40 transition-all duration-200"
            title="CRM Activity Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {crmDb.crmNotifications?.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black animate-pulse">
                {crmDb.crmNotifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          <Button variant="primary" icon={Plus} onClick={handleOpenAddLeadModal}>
            Add New Lead
          </Button>
        </div>
      </div>

      {/* ============================================================================
          TAB 1: CRM OVERVIEW DASHBOARD
          ============================================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-left">
          
          {/* Top Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <StatCard title="New Leads" value={kpis.newLeadsStageCount} description="Stage: New Lead" trend={`${kpis.newLeadsStageCount} pending`} trendDirection="neutral" />
            <StatCard title="Demos Booked" value={kpis.demosBooked} description="Upcoming demos" trend="Zoom slots ready" trendDirection="up" />
            <StatCard title="Trials Active" value={kpis.trialsActive} description="Active sandboxes" trend="Usage monitored" trendDirection="up" />
            <StatCard title="Proposals Sent" value={kpis.proposalsSent} description="Negotiation contracts" trend="Awaiting signature" trendDirection="neutral" />
            <StatCard title="Deals Won" value={kpis.dealsWon} description="Closed won accounts" trend="Syncing onboarding" trendDirection="up" />
            <StatCard title="Deals Lost" value={kpis.dealsLost} description="Closed lost accounts" trend="Needs re-engagement" trendDirection="down" />
            <StatCard title="Total Pipeline Value" value={`$${kpis.totalPipelineValue.toLocaleString()}`} description="Value of active leads" trend="Potential monthly MRR" trendDirection="up" />
          </div>

          {/* Main Grid for Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Widget 1 & 2: Pipeline and Selected Lead Details Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Widget 1: Kanban Sales Pipeline Indicator */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
                <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-3">
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Pipeline Stage Distribution Matrix</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{crmDb.leads.length} Leads Active</span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                  {stages.map(stage => {
                    const count = crmDb.leads.filter(l => l.stage === stage).length;
                    return (
                      <div key={stage} className="p-2 bg-[#111827]/40 border border-[#23324C]/45 rounded-xl text-center space-y-1 hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => {
                        // Switch to leads tab
                        window.dispatchEvent(new CustomEvent('hero-switch-tab', { detail: 'leads' }));
                      }}>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block truncate">{stage}</span>
                        <strong className="text-white text-sm block font-mono">{count}</strong>
                        <div className="w-full bg-slate-900 rounded-full h-1">
                          <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.min(100, (count / (crmDb.leads.length || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Widget 2: Selected Lead Details Panel */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
                <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Selected Lead details Workspace</span>
                    <select
                      value={overviewSelectedLeadId || ''}
                      onChange={(e) => setOverviewSelectedLeadId(e.target.value)}
                      className="bg-[#0B0F19] border border-[#23324C]/60 text-slate-200 text-[10px] font-bold px-2 py-1 rounded focus:outline-none cursor-pointer"
                    >
                      {crmDb.leads.map(l => (
                        <option key={l.id} value={l.id}>{l.company} ({l.name})</option>
                      ))}
                    </select>
                  </div>
                  {overviewSelectedLead && (
                    <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      {overviewSelectedLead.stage}
                    </span>
                  )}
                </div>

                {overviewSelectedLead ? (
                  <div className="space-y-4">
                    {/* Stats table */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#111827]/40 border border-[#23324C]/45 rounded-xl p-3.5 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Fleet Size</span>
                        <strong className="text-white block mt-0.5">{overviewSelectedLead.fleetSize} Trucks</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Transport Niche</span>
                        <strong className="text-white block mt-0.5">{overviewSelectedLead.niche}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Current Software</span>
                        <strong className="text-white block mt-0.5 truncate" title={overviewSelectedLead.currentSoftware}>{overviewSelectedLead.currentSoftware}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Estimated Value</span>
                        <strong className="text-brand-400 block mt-0.5 font-black">${overviewSelectedLead.revenue.toLocaleString()}/mo</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#111827]/25 border border-[#23324C]/40 rounded-xl p-3">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Core Pain Points</span>
                        <p className="text-slate-300 mt-1 italic">"{overviewSelectedLead.painPoints || 'No pain points recorded.'}"</p>
                      </div>
                      <div className="bg-[#111827]/25 border border-[#23324C]/40 rounded-xl p-3">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Next Follow-Up Target</span>
                        <div className="flex justify-between items-center mt-1">
                          <strong className="text-white">{overviewSelectedLead.nextFollowup || 'None Scheduled'}</strong>
                          <button
                            onClick={() => {
                              setSelectedLead(overviewSelectedLead);
                              setFollowupForm({
                                type: 'Call',
                                priority: 'Medium',
                                dueDate: overviewSelectedLead.nextFollowup || new Date().toISOString().split('T')[0],
                                dueTime: '10:00 AM',
                                notes: 'Follow-up regarding telematics setup.'
                              });
                              setFollowupModalOpen(true);
                            }}
                            className="text-brand-400 hover:text-brand-300 text-[9px] font-bold uppercase cursor-pointer"
                          >
                            Schedule
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes area */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Internal Notes / Log Comment</span>
                      <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3 max-h-20 overflow-y-auto space-y-1.5">
                        {overviewSelectedLead.notes?.map(note => (
                          <div key={note.id} className="border-b border-[#23324C]/30 pb-1.5 last:border-b-0 text-[10px]">
                            <p className="text-slate-300 font-medium">{note.text}</p>
                            <span className="text-[8px] text-slate-500 block text-right font-mono">- {note.author} on {note.date}</span>
                          </div>
                        )) || <span className="text-slate-500 italic">No internal notes logged.</span>}
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="border-t border-[#23324C]/45 pt-3 space-y-3">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">CRM Direct Dispatch Actions</span>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Assign rep */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-[#23324C]/60 rounded-xl px-2 py-1">
                          <User className="h-3 w-3 text-brand-400" />
                          <span className="text-[9px] text-slate-400 font-bold">Rep:</span>
                          <select
                            value={overviewSelectedLead.rep}
                            onChange={(e) => {
                              crmRepository.assignRep(overviewSelectedLead.id, e.target.value);
                              triggerToast(`Re-assigned representative to ${e.target.value}`);
                            }}
                            className="bg-transparent text-slate-200 text-[9px] font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="Alex Wright" className="bg-[#161F30]">Alex Wright</option>
                            <option value="Sarah K." className="bg-[#161F30]">Sarah K.</option>
                            <option value="Michael Scott" className="bg-[#161F30]">Michael Scott</option>
                            <option value="Jan Levinson" className="bg-[#161F30]">Jan Levinson</option>
                          </select>
                        </div>

                        {/* Recommend Plan */}
                        <button
                          onClick={() => {
                            setSelectedLead(overviewSelectedLead);
                            setRecommendPlanModalOpen(true);
                          }}
                          className="bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" /> Recommend Plan
                        </button>

                        <button
                          onClick={() => handleOpenDemoModal(overviewSelectedLead)}
                          className="bg-brand-500 hover:bg-brand-600 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 animate-pulse"
                        >
                          <Calendar className="h-3 w-3" /> Book Demo
                        </button>

                        <button
                          onClick={() => handleStartTrial(overviewSelectedLead)}
                          className="bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" /> Start Trial
                        </button>

                        <button
                          onClick={() => handleOpenProposalModal(overviewSelectedLead)}
                          className="bg-slate-900 hover:bg-slate-800 border border-[#23324C] text-slate-200 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" /> Send Proposal
                        </button>

                        <button
                          onClick={() => {
                            crmWorkflowEngine.handleStageChange(overviewSelectedLead.id, 'Won', 'Marked won from overview actions panel', permissionRole);
                            triggerToast(`Marked ${overviewSelectedLead.company} as Won!`);
                          }}
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Mark Won
                        </button>

                        <button
                          onClick={() => {
                            crmWorkflowEngine.handleStageChange(overviewSelectedLead.id, 'Lost', 'Marked lost from overview actions panel', permissionRole);
                            triggerToast(`Marked ${overviewSelectedLead.company} as Lost.`, 'warning');
                          }}
                          className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <X className="h-3 w-3" /> Mark Lost
                        </button>

                        {overviewSelectedLead.stage === 'Won' && (
                          <button
                            onClick={() => {
                              setSelectedLead(overviewSelectedLead);
                              setConversionWizardOpen(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                          >
                            <UserCheck className="h-3 w-3" /> Convert to Company
                          </button>
                        )}
                      </div>

                      {/* Communication Integration buttons */}
                      <div className="flex gap-2 items-center flex-wrap pt-1.5 border-t border-[#23324C]/30">
                        <button
                          onClick={() => {
                            setSelectedLead(overviewSelectedLead);
                            setEmailForm({ subject: 'Welcome Sandbox Invite', template: 'Welcome Sandbox Invite', body: '', status: 'Sent' });
                            setEmailModalOpen(true);
                          }}
                          className="p-2 bg-slate-900 border border-[#23324C]/65 hover:border-brand-500/25 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                          title="Send Email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedLead(overviewSelectedLead);
                            setCallForm({ duration: '2m 15s', outcome: 'Connected', notes: '' });
                            setCallModalOpen(true);
                          }}
                          className="p-2 bg-slate-900 border border-[#23324C]/65 hover:border-brand-500/25 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                          title="Log Call"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedLead(overviewSelectedLead);
                            setFollowupForm({
                              type: 'Call',
                              priority: 'Medium',
                              dueDate: new Date().toISOString().split('T')[0],
                              dueTime: '10:00 AM',
                              notes: 'Urgent follow-up touchpoint.'
                            });
                            setFollowupModalOpen(true);
                          }}
                          className="p-2 bg-slate-900 border border-[#23324C]/65 hover:border-brand-500/25 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                          title="Schedule Follow-up"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>

                        <input
                          type="text"
                          placeholder="Quick write note and press Enter..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              crmRepository.addNote(overviewSelectedLead.id, e.target.value, permissionRole);
                              triggerToast('Internal note saved!');
                              e.target.value = '';
                            }
                          }}
                          className="bg-[#0B0F19] border border-[#23324C]/60 text-slate-200 text-[10px] px-3 py-2 rounded-xl flex-grow focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-10 text-center text-xs">No active leads selected.</div>
                )}
              </div>
            </div>

            {/* Widget 3 & 4: Upcoming Follow-ups & Recent Activity Timeline */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Widget 3: Upcoming Follow-up Tasks */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Upcoming Follow-Up Tasks</span>
                    <button
                      onClick={() => {
                        setSelectedLead(crmDb.leads[0]);
                        setTaskForm({ title: 'General followup Call', type: 'Call', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
                        setTaskModalOpen(true);
                      }}
                      className="text-brand-400 hover:text-brand-350 text-[9px] font-bold uppercase cursor-pointer"
                    >
                      + Add Task
                    </button>
                  </div>
                  <div className="space-y-3 my-3 max-h-[160px] overflow-y-auto pr-1">
                    {crmDb.followups.filter(f => f.status === 'Pending').slice(0, 5).map(f => {
                      const isOverdue = new Date(f.dueDate) < new Date(new Date().toISOString().split('T')[0]);
                      return (
                        <div key={f.id} className="p-2.5 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl flex items-center justify-between text-xs hover:border-brand-500/25 transition-all">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white block font-bold">{f.company}</strong>
                              {isOverdue && (
                                <span className="bg-red-500/10 border border-red-500/25 text-red-400 text-[7px] font-black uppercase px-1 rounded font-mono">Overdue</span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Due: {f.dueDate} at {f.dueTime}</span>
                            <span className="text-[9px] text-brand-400 block mt-0.5">Task: {f.type} • {f.notes}</span>
                          </div>
                          <button
                            onClick={() => {
                              crmRepository.completeFollowup(f.id);
                              triggerToast(`Completed ${f.type} followup with ${f.contact}`);
                            }}
                            className="p-1 bg-slate-900 border border-[#23324C] hover:bg-slate-800 text-slate-200 rounded-lg cursor-pointer"
                            title="Complete"
                          >
                            <Check className="h-3 w-3 text-emerald-400" />
                          </button>
                        </div>
                      );
                    })}
                    {crmDb.followups.filter(f => f.status === 'Pending').length === 0 && (
                      <span className="text-slate-500 italic block py-4 text-center">No upcoming follow-ups scheduled.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Widget 4: Recent Sales Activity Timeline */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recent Activity Timeline</span>
                    <Activity className="h-3.5 w-3.5 text-brand-400" />
                  </div>
                  <div className="space-y-3.5 my-3 max-h-[220px] overflow-y-auto pr-1">
                    {(() => {
                      const allEvents = crmDb.leads.flatMap(l => 
                        (l.timeline || []).map(t => ({
                          ...t,
                          company: l.company,
                          rep: l.rep
                        }))
                      ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

                      return allEvents.map((ev, idx) => (
                        <div key={idx} className="flex gap-2.5 text-left text-xs border-b border-[#23324C]/20 pb-2 last:border-0">
                          <div className="mt-1 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white text-[11px]">{ev.company}</strong>
                              <span className="text-[8px] bg-slate-900 border border-[#23324C]/50 text-slate-400 px-1 rounded">{ev.date}</span>
                            </div>
                            <span className="text-[10px] text-slate-350 block mt-0.5">{ev.event}: {ev.detail}</span>
                            <span className="text-[8px] text-slate-500 block font-mono">User: {ev.user}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Widgets 5 & 6: Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Widget 5: Monthly Sales Analytics */}
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-white">Monthly Sales Analytics</h4>
                <p className="text-[10px] text-slate-500">Pipeline growth performance forecast.</p>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', pipeline: 12000, won: 4500 },
                    { month: 'Feb', pipeline: 18500, won: 6200 },
                    { month: 'Mar', pipeline: 24000, won: 11000 },
                    { month: 'Apr', pipeline: 31000, won: 18000 },
                    { month: 'May', pipeline: 48000, won: 26000 },
                    { month: 'Jun', pipeline: kpis.totalPipelineValue, won: kpis.mrr }
                  ]} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD400" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#FFD400" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#23324C" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#161F30', borderColor: '#23324C', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Area type="monotone" dataKey="pipeline" name="Pipeline Value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPipeline)" />
                    <Area type="monotone" dataKey="won" name="Won MRR" stroke="#FFD400" strokeWidth={2} fillOpacity={1} fill="url(#colorWon)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Widget 6: Conversion Rate Chart */}
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-white">Conversion Rate Chart</h4>
                <p className="text-[10px] text-slate-500">Funnel efficiency progression across stages.</p>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { stage: 'Leads', count: crmDb.leads.length },
                    { stage: 'Demos', count: crmDb.demos.length },
                    { stage: 'Trials', count: crmDb.trials.length },
                    { stage: 'Proposals', count: crmDb.proposals.length },
                    { stage: 'Won', count: kpis.dealsWon }
                  ]} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#23324C" opacity={0.2} />
                    <XAxis dataKey="stage" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#161F30', borderColor: '#23324C', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="count" name="Entities Pool" fill="#6366F1" radius={[4, 4, 0, 0]}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][idx]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================================
          TAB 2: LEADS AND SAVED FILTERS TABS
          ============================================================================ */}
      {activeTab === 'leads' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 relative">
          
          {/* Saved filters tabs bar */}
          <div className="flex gap-2 border-b border-[#23324C]/45 pb-3 overflow-x-auto scrollbar-none">
            {['All', 'My Leads', 'High Value', 'Hot Leads', 'Demo Pending', 'Proposal Pending', 'Won', 'Lost'].map(tab => (
              <button
                key={tab}
                onClick={() => { setCurrentFilterTab(tab); setLeadsCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold uppercase tracking-wide transition-all cursor-pointer border ${
                  currentFilterTab === tab
                    ? 'bg-brand-500 border-brand-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 border-[#23324C]/65 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Controls row */}
          <div className="flex flex-col xl:flex-row gap-4 items-stretch justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onClear={() => setSearchQuery('')} 
                placeholder="Search contact details..." 
                className="w-full md:max-w-[200px]" 
              />
              
              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="bg-[#0B0F19]/60 border border-[#23324C] text-slate-350 text-[11px] font-bold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="All">All Transport Niches</option>
                <option value="Car Carrying">🚗 Car Carrying</option>
                <option value="General Freight">📦 General Freight</option>
                <option value="Dangerous Goods">☣️ Dangerous Goods</option>
                <option value="Refrigerated">❄️ Refrigerated</option>
                <option value="Flatbed">🏗️ Flatbed</option>
                <option value="Container">🚢 Container</option>
              </select>

              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="bg-[#0B0F19]/60 border border-[#23324C] text-slate-350 text-[11px] font-bold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="All">All Fleet Sizes</option>
                <option value="Starter">Starter (&lt; 35 Trucks)</option>
                <option value="Mid">Mid-Tier (35 - 100 Trucks)</option>
                <option value="Enterprise">Enterprise (&gt; 100 Trucks)</option>
              </select>
            </div>
          </div>

          {/* Table index */}
          {activeFilteredLeadsList.length === 0 ? (
            <EmptyState title="No leads matched query" description="Clean filter options or compose a manual lead entry." icon={UserPlus} />
          ) : (
            <>
              <div className="overflow-x-auto border border-[#23324C]/60 rounded-xl relative">
                <table className="w-full text-[11px] text-slate-350 text-left border-collapse">
                  <thead>
                    <tr className="bg-[#161F30]/65 text-slate-400 font-bold uppercase border-b border-[#23324C]/60">
                      <th className="p-3 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedLeadIds.length === activePaginatedLeadsList.length} 
                          onChange={toggleSelectAllLeads}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Primary Contact</th>
                      <th className="p-3">Niche / Fleet</th>
                      <th className="p-3">Estimated Revenue</th>
                      <th className="p-3">Health / Score</th>
                      <th className="p-3">Aging (Days)</th>
                      <th className="p-3">Lifecycle Stage</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23324C]/40">
                    {activePaginatedLeadsList.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      return (
                        <tr 
                          key={lead.id} 
                          className="hover:bg-slate-800/25 transition-colors cursor-pointer group"
                          onClick={() => { setSelectedLead(lead); setDrawerActiveTab('Overview'); setInspectDrawerOpen(true); }}
                        >
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => toggleSelectLead(lead.id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="p-3 font-extrabold text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{lead.company}</span>
                              {lead.score > 80 && <Sparkle className="h-3 w-3 text-brand-400 animate-pulse" />}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-200 block">{lead.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{lead.email}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-300 block">{lead.niche}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{lead.fleetSize} Trucks</span>
                          </td>
                          <td className="p-3 font-black text-slate-200">${lead.revenue.toLocaleString()}/mo</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                lead.riskLevel === 'Low' ? 'bg-emerald-500' : (lead.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-500')
                              }`} />
                              <span>{lead.score} score</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono">
                            <span className={lead.stageDays > 14 ? 'text-red-400 font-extrabold' : 'text-slate-400'}>
                              {lead.stageDays} Days
                            </span>
                          </td>
                          <td className="p-3 font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${
                              lead.stage === 'Won' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : (lead.stage === 'Lost' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-brand-500/5 border-brand-500/25 text-brand-400')
                            }`}>{lead.stage}</span>
                          </td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleEditLeadOpen(lead)}
                                className="p-1.5 bg-slate-900 border border-[#23324C] hover:border-brand-500/30 rounded-lg text-slate-450 hover:text-white cursor-pointer"
                                title="Edit Info"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteLead(lead.id)}
                                className={`p-1.5 rounded-lg border cursor-pointer ${
                                  verifyPermission('delete_lead', true)
                                    ? 'bg-slate-900 border-[#23324C] text-red-450 hover:text-red-400 hover:border-red-500/30'
                                    : 'bg-slate-900/40 border-slate-850 text-slate-600 cursor-not-allowed'
                                }`}
                                title={verifyPermission('delete_lead', true) ? "Delete lead" : "Locked to Director"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination currentPage={leadsCurrentPage} totalPages={totalPagesCount} onPageChange={setLeadsCurrentPage} />
            </>
          )}

          {/* Floating Bulk Operations Drawer */}
          {selectedLeadIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl px-6 py-4 flex flex-wrap items-center gap-4 z-40 animate-slide-in text-xs font-semibold">
              <span className="text-brand-400 font-bold border-r border-slate-700 pr-4">{selectedLeadIds.length} Selected</span>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Rep:</span>
                <select 
                  value={bulkRepVal} 
                  onChange={(e) => setBulkRepVal(e.target.value)}
                  className="bg-[#0B0F19] border border-[#23324C] text-slate-200 px-2 py-1 rounded focus:outline-none cursor-pointer"
                >
                  <option value="Alex Wright">Alex Wright</option>
                  <option value="Sarah K.">Sarah K.</option>
                  <option value="Michael Scott">Michael Scott</option>
                </select>
                <button onClick={handleBulkRepAssign} className="bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1 rounded cursor-pointer">
                  Assign
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <select 
                  value={bulkStatusVal} 
                  onChange={(e) => setBulkStatusVal(e.target.value)}
                  className="bg-[#0B0F19] border border-[#23324C] text-slate-200 px-2 py-1 rounded focus:outline-none cursor-pointer"
                >
                  {stages.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <button onClick={handleBulkStatusChange} className="bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1 rounded cursor-pointer">
                  Move
                </button>
              </div>

              <button onClick={handleBulkDelete} className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1 rounded cursor-pointer">
                Delete
              </button>
              
              <button onClick={() => setSelectedLeadIds([])} className="text-slate-450 hover:text-white cursor-pointer ml-2">
                Cancel
              </button>
            </div>
          )}

        </div>
      )}

      {/* ============================================================================
          TAB 3: PIPELINE KANBAN BOARD WITH DRAG & DROP
          ============================================================================ */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="bg-[#111827]/40 border border-[#23324C]/60 rounded-xl p-3 text-left">
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">Carrier Lifecycle Pipeline</span>
            <p className="text-[9px] text-slate-500 mt-1">Drag and drop prospect cards to transition lifecycle workflows. Shifting lanes will trigger intermediate confirmation dialogs.</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 items-stretch min-h-[500px] scrollbar-thin">
            {stages.map(stage => {
              const laneLeads = crmDb.leads.filter(l => l.stage === stage);
              return (
                <div 
                  key={stage}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                  className="bg-[#111827]/25 border border-[#23324C]/35 rounded-2xl p-3 flex flex-col space-y-3 min-w-[240px] max-w-[240px]"
                >
                  <div className="flex items-center justify-between border-b border-[#23324C]/50 pb-2">
                    <span className="text-[10px] uppercase font-black text-white tracking-wide">{stage}</span>
                    <span className="bg-[#161F30] px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono font-bold">
                      {laneLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] scrollbar-none">
                    {laneLeads.map((lead) => (
                      <div 
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onClick={() => { setSelectedLead(lead); setDrawerActiveTab('Overview'); setInspectDrawerOpen(true); }}
                        className="glass rounded-xl p-3.5 border border-[#23324C]/60 text-left space-y-3 shadow-md hover:border-brand-500/35 transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01]"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <strong className="text-white text-xs block font-bold truncate max-w-[150px]">{lead.company}</strong>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            lead.priority === 'High' ? 'bg-red-500/10 text-red-400' : (lead.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-450')
                          }`}>{lead.priority}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-450 block">{lead.name}</span>
                          <span className="text-[10px] text-slate-200 font-black block">${lead.revenue.toLocaleString()}/mo</span>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#23324C]/35 pt-2 text-[9px] text-slate-500">
                          <span>👤 {lead.rep?.split(' ')[0] || 'Unassigned'}</span>
                          <span className="font-mono">🚛 {lead.fleetSize} Trk</span>
                        </div>
                      </div>
                    ))}
                    {laneLeads.length === 0 && (
                      <div className="text-[9px] text-slate-500 text-center py-16 font-medium border border-dashed border-[#23324C]/30 rounded-xl">Drop Cards Here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================================
          TAB 4: DEMO BOOKINGS
          ============================================================================ */}
      {activeTab === 'scheduler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          
          {/* Calendar visual column */}
          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
            <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white">Product Demo Walkthroughs Schedule</h3>
                <p className="text-[10px] text-slate-500">Date-wise booking distribution (June 2026).</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#111827] px-3 py-1 rounded text-slate-400 border border-[#23324C]/50">June 2026</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-500 border-b border-[#23324C]/40 pb-2">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-stretch">
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const dayStr = `2026-06-${day.toString().padStart(2, '0')}`;
                const dayDemos = crmDb.demos.filter(d => d.date === dayStr);

                return (
                  <div 
                    key={day} 
                    className="min-h-[85px] p-2 border border-[#23324C]/40 hover:border-brand-500/20 bg-[#111827]/20 rounded-xl flex flex-col justify-between transition-all"
                  >
                    <span className="text-[9px] font-mono font-bold text-slate-500">{day}</span>
                    <div className="space-y-1 mt-1">
                      {dayDemos.map(d => (
                        <div 
                          key={d.id} 
                          onClick={() => {
                            const lead = crmDb.leads.find(l => l.id === d.leadId);
                            if (lead) { setSelectedLead(lead); setDrawerActiveTab('Meetings'); setInspectDrawerOpen(true); }
                          }}
                          className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold truncate cursor-pointer ${
                            d.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : (d.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400')
                          }`}
                          title={`Presenter: ${d.presenter} • ${d.time}`}
                        >
                          {d.company.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduling list and feedback sidebar column */}
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-grow overflow-y-auto max-h-[500px] pr-1">
              <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-2">
                <h3 className="text-sm font-extrabold text-white">Upcoming Slots Walkthrough</h3>
                <Button size="sm" variant="primary" onClick={() => handleOpenDemoModal(crmDb.leads[0])}>
                  + Book Demo
                </Button>
              </div>

              <div className="space-y-3.5">
                {crmDb.demos.map(d => (
                  <div key={d.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white text-xs block">{d.company}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Presenter: {d.presenter} • {d.date} at {d.time} {d.timezone}</span>
                        {d.feedback && (
                          <div className="mt-1.5 p-2 bg-[#0B0F19]/60 rounded border border-[#23324C]/35 text-[9px] text-slate-350">
                            <span className="font-bold text-slate-400 block">Feedback (Rating: {d.rating}/5 ⭐)</span>
                            "{d.feedback}"
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <select
                          value={d.status}
                          onChange={(e) => {
                            crmRepository.updateDemo(d.id, { status: e.target.value });
                            triggerToast(`Updated demo status to ${e.target.value}`);
                          }}
                          className="bg-[#0B0F19] border border-[#23324C]/60 text-slate-200 text-[9px] px-1 py-0.5 rounded cursor-pointer font-bold focus:outline-none"
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1.5 border-t border-[#23324C]/30 justify-between items-center">
                      <div className="flex gap-1.5">
                        {d.status === 'Upcoming' && (
                          <a href={d.meetingLink} target="_blank" rel="noreferrer" className="bg-brand-500 hover:bg-brand-600 text-slate-950 text-[9px] font-black px-2.5 py-1.5 rounded-lg text-center cursor-pointer flex items-center gap-1">
                            <Play className="h-3 w-3" /> Join Zoom
                          </a>
                        )}
                        {d.status === 'Upcoming' && (
                          <button 
                            onClick={() => {
                              crmRepository.completeDemo(d.id);
                              triggerToast(`Demo presentation complete.`);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        {/* Send Demo Reminder notification */}
                        <button
                          onClick={() => {
                            crmActivityEngine.logMutation(
                              d.leadId,
                              permissionRole,
                              'Demo Reminder Sent',
                              `Walkthrough reminder alert dispatched for Zoom link details to host/client: ${d.meetingLink}`,
                              'None',
                              'Sent'
                            );
                            triggerToast("Demo reminder notification successfully dispatched to attendees!");
                          }}
                          className="text-[9px] text-brand-400 hover:text-brand-300 font-bold uppercase cursor-pointer"
                        >
                          Send Reminder
                        </button>

                        {/* Feedback Logger */}
                        <button
                          onClick={() => {
                            const feedbackText = prompt("Log presentation summary & carrier feedback:") || '';
                            const rating = parseInt(prompt("Log rating (1-5 ⭐):") || '5') || 5;
                            crmRepository.logDemoFeedback(d.id, feedbackText, rating);
                            triggerToast("Demo feedback logs registered.");
                          }}
                          className="text-[9px] text-slate-400 hover:text-slate-250 font-bold uppercase cursor-pointer border-l border-[#23324C] pl-2"
                        >
                          Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================================
          TAB 5: TRIAL COMPANIES
          ============================================================================ */}
      {activeTab === 'trials' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-white">SaaS Trial Workspace Quotas</h3>
              <p className="text-[10px] text-slate-500">Track Sandbox active evaluations and limits.</p>
            </div>
            
            {/* Conversion Metrics Headers */}
            <div className="flex gap-4 text-xs">
              <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[9px] text-slate-400 block font-bold">ACTIVE TRIALS</span>
                <strong className="text-white text-sm font-mono">{crmDb.trials.filter(t => t.status === 'Active').length}</strong>
              </div>
              <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[9px] text-slate-400 block font-bold">CONVERSION RATE</span>
                <strong className="text-brand-400 text-sm font-mono">
                  {Math.round((crmDb.leads.filter(l => l.stage === 'Won').length / (crmDb.leads.length || 1)) * 100)}%
                </strong>
              </div>
              <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[9px] text-slate-400 block font-bold">EXPIRED PORTALS</span>
                <strong className="text-red-400 text-sm font-mono">{crmDb.trials.filter(t => t.status === 'Expired').length}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crmDb.trials.map(t => {
              const expiringSoon = t.status === 'Active' && t.daysRemaining <= 3;
              return (
                <div key={t.id} className={`p-4 rounded-xl space-y-4 border transition-all ${
                  expiringSoon 
                    ? 'bg-red-500/5 border-red-500/30' 
                    : 'bg-[#111827]/40 border-[#23324C]/60 hover:border-brand-500/25'
                }`}>
                  
                  <div className="flex justify-between items-start border-b border-[#23324C]/30 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-white text-xs font-black">{t.company}</h4>
                        {expiringSoon && (
                          <span className="bg-red-500 text-white text-[7px] font-black uppercase px-1 rounded animate-pulse">EXPIRING SOON</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-450 block mt-0.5">Admin: {t.admin}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>{t.status}</span>
                  </div>

                  {expiringSoon && (
                    <div className="bg-red-950/20 border border-red-900/30 text-red-400 text-[9px] p-2 rounded-lg font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Action Required: sandbox term expires in {t.daysRemaining} days ({t.expiryDate})!</span>
                    </div>
                  )}

                  <div className="space-y-3 text-[10px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Days Remaining</span>
                        <strong className="text-white">{t.daysRemaining} / 14 Days</strong>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1">
                        <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.min(100, (t.daysRemaining / 14) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-450">
                      <span>Term Period:</span>
                      <strong className="text-slate-200">{t.startDate} to {t.expiryDate}</strong>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Most Used Module:</span>
                      <strong className="text-white text-right">{t.mostUsedModule}</strong>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Quota limits:</span>
                      <strong className="text-white">{t.activeUsers} Users • {t.storage}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#23324C]/30">
                    <button 
                      onClick={() => triggerToast(`Impersonating admin session takeover context for ${t.company}...`)}
                      className="flex-1 bg-brand-500 hover:bg-brand-600 text-slate-950 text-[10px] font-black py-1.5 rounded-lg cursor-pointer"
                    >
                      Login As Company
                    </button>
                    <button 
                      onClick={() => { setSelectedTrial(t); setExtendTrialModalOpen(true); }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold py-1.5 rounded-lg cursor-pointer"
                    >
                      Extend Trial
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================================
          TAB 6: CONTRACT PROPOSALS
          ============================================================================ */}
      {activeTab === 'proposals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
            <h3 className="text-sm font-extrabold text-white">Issued Licensing Agreements</h3>
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto scrollbar-none">
              {crmDb.proposals.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProposal(p)}
                  className={`p-3 border rounded-xl space-y-2 cursor-pointer transition-all ${
                    selectedProposal?.id === p.id 
                      ? 'bg-brand-500/10 border-brand-500 shadow-md' 
                      : 'bg-[#111827]/40 border-[#23324C]/60 hover:bg-[#111827]/85'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-white text-xs block">{p.company}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Value: ${p.total.toLocaleString()}/mo • Validity: {p.validity}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      p.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : (p.status === 'Rejected' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400')
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between">
            {selectedProposal ? (
              <div className="space-y-6">
                
                <div className="border-b border-[#23324C]/50 pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-[#111827] px-2.5 py-1 rounded text-slate-450 border border-[#23324C]/60 uppercase tracking-widest">SaaS License Proposal</span>
                    <h4 className="text-white text-base font-extrabold mt-2">{selectedProposal.title}</h4>
                    <span className="text-[10px] text-slate-455 block mt-1">Proposal ID: PROP-{selectedProposal.id} • Issued: {selectedProposal.createdDate} • Version: {selectedProposal.version || 'V1'}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setProposalPreviewModalOpen(true);
                      }}
                      className="p-2 bg-slate-900 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
                      title="Print / PDF Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => triggerToast(`SaaS license agreement contract PDF generated for PROP-${selectedProposal.id}.`)}
                      className="p-2 bg-slate-900 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Proposal Calculations */}
                <div className="space-y-4 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contract Pricing Details</span>
                  <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Base platform license core</span>
                      <strong className="text-slate-200">${selectedProposal.value.toLocaleString()} / mo</strong>
                    </div>
                    {selectedProposal.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Negotiated Discount ({selectedProposal.discount}%)</span>
                        <strong>-${(selectedProposal.value * selectedProposal.discount / 100).toLocaleString()} / mo</strong>
                      </div>
                    )}
                    <div className="border-t border-[#23324C]/35 pt-2.5 flex justify-between text-white font-extrabold text-sm">
                      <span>Total Proposed MRR</span>
                      <span className="text-brand-400">${selectedProposal.total.toLocaleString()} / mo</span>
                    </div>
                  </div>
                </div>

                {/* Features included list */}
                <div className="space-y-3.5 text-xs text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Included Service Modules</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-350">
                    {(selectedProposal.features || []).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical versions list */}
                {selectedProposal.versionsList && selectedProposal.versionsList.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Proposal Revision History</span>
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3.5 space-y-2">
                      {selectedProposal.versionsList.map((ver, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] text-slate-355 border-b border-[#23324C]/20 pb-2 last:border-0 last:pb-0">
                          <div>
                            <span className="text-white font-extrabold">Version {ver.version}</span>
                            <span className="text-slate-500 ml-2">({ver.date})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-brand-400 font-black">${ver.total.toLocaleString()} / mo</span>
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] ${
                              ver.status === 'Accepted' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>{ver.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-[#23324C]/45 pt-4">
                  {selectedProposal.status === 'Sent' && (
                    <button 
                      onClick={() => handleProposalAccept(selectedProposal)}
                      className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black py-2 rounded-lg cursor-pointer"
                    >
                      Accept Contract & Convert
                    </button>
                  )}
                  {selectedProposal.status === 'Sent' && (
                    <button 
                      onClick={() => {
                        crmRepository.updateProposal(selectedProposal.id, { status: 'Rejected' });
                        crmWorkflowEngine.handleStageChange(selectedProposal.leadId, 'Lost', 'Proposal rejected by client', permissionRole);
                        triggerToast(`Proposal for ${selectedProposal.company} marked Rejected.`);
                      }}
                      className="px-4 bg-slate-800 hover:bg-red-500/10 text-slate-350 hover:text-red-400 border border-[#23324C] hover:border-red-500/20 text-[11px] font-bold py-2 rounded-lg cursor-pointer"
                    >
                      Reject Contract
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setRevisingProposalId(selectedProposal.id);
                      setSelectedLead(crmDb.leads.find(l => l.id === selectedProposal.leadId));
                      
                      setProposalBuilder({
                        title: selectedProposal.title,
                        items: selectedProposal.items || [
                          { name: 'Enterprise License Tier base', price: selectedProposal.value, qty: 1 }
                        ],
                        discount: selectedProposal.discount,
                        tax: selectedProposal.tax,
                        validity: selectedProposal.validity
                      });
                      setProposalModalOpen(true);
                    }}
                    className="flex-grow bg-brand-500/10 border border-brand-500/30 hover:bg-brand-500/20 text-brand-400 hover:text-brand-300 text-[11px] font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Revise Proposal (Draft {selectedProposal.version ? `V${parseInt(selectedProposal.version.replace('V', '')) + 1}` : 'V2'})
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 text-xs italic">Select a proposal from the list.</div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================
          TAB 7: FOLLOW-UPS
          ============================================================================ */}
      {activeTab === 'calendar' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">Sales Follow-Up Tasks Agenda</h3>
              <p className="text-[10px] text-slate-500">Track pending calls, touchpoint emails, and administrative check-ins.</p>
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              icon={Plus}
              onClick={() => {
                setSelectedLead(crmDb.leads[0]);
                setTaskForm({ title: '', type: 'Call', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
                setTaskModalOpen(true);
              }}
            >
              Log Touchpoint Task
            </Button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto scrollbar-none">
            {crmDb.followups.map(f => (
              <div key={f.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl flex items-center justify-between gap-4">
                
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    f.type === 'Call' 
                      ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                      : (f.type === 'Email' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400')
                  }`}>
                    {f.type === 'Call' ? <Phone className="h-4.5 w-4.5" /> : (f.type === 'Email' ? <Mail className="h-4.5 w-4.5" /> : <Calendar className="h-4.5 w-4.5" />)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-xs">{f.company}</strong>
                      <span className="text-[9px] bg-slate-900 border border-[#23324C]/50 px-1.5 py-0.2 rounded font-mono text-slate-450">{f.dueDate} • {f.dueTime}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Contact: {f.contact} • Task: {f.notes}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                    f.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : (f.status === 'Pending' ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400')
                  }`}>{f.status}</span>
                  {f.status === 'Pending' && (
                    <button 
                      onClick={() => {
                        crmRepository.completeFollowup(f.id);
                        triggerToast(`Touchpoint followup call completed with ${f.contact}.`);
                      }}
                      className="p-1 hover:bg-slate-800 text-slate-450 hover:text-white rounded cursor-pointer"
                      title="Mark Completed"
                    >
                      <Check className="h-4 w-4 text-emerald-400" />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================================
          TAB 8: ONBOARDING HANDOVER CHECKLISTS
          ============================================================================ */}
      {activeTab === 'onboarding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
            <h3 className="text-sm font-extrabold text-white">Won Carrier Workspace Handovers</h3>
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto scrollbar-none">
              {crmDb.onboarding.map(o => {
                const completeCount = o.checklist.filter(c => c.completed).length;
                const percent = Math.round((completeCount / o.checklist.length) * 100);

                return (
                  <div 
                    key={o.id}
                    onClick={() => setSelectedOnboarding(o)}
                    className={`p-3 border rounded-xl space-y-3 cursor-pointer transition-all ${
                      selectedOnboarding?.id === o.id
                        ? 'bg-brand-500/10 border-brand-500 shadow-md'
                        : 'bg-[#111827]/40 border-[#23324C]/60 hover:bg-[#111827]/85'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white text-xs block">{o.company}</strong>
                        <span className="text-[9px] text-slate-450 block mt-0.5">Owner: {o.owner} • Target: {o.dueDate}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        percent === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'
                      }`}>{percent}% Complete</span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-1.5">
                      <div className="bg-brand-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between">
            {selectedOnboarding ? (
              <div className="space-y-6">
                
                <div className="border-b border-[#23324C]/50 pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-[#111827] px-2.5 py-1 rounded text-slate-450 border border-[#23324C]/60 uppercase tracking-widest">Setup Handover Stepper</span>
                    <div className="flex items-center gap-3">
                      <h4 className="text-white text-base font-extrabold mt-2">{selectedOnboarding.company} setup Checklist</h4>
                      <button
                        onClick={() => {
                          setOnboardingTaskForm({ name: '' });
                          setOnboardingTaskModalOpen(true);
                        }}
                        className="mt-2 text-brand-400 hover:text-brand-300 font-bold text-[10px] uppercase cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-455 block mt-1">Responsible Owner: {selectedOnboarding.owner} • Due Target Date: {selectedOnboarding.dueDate}</span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase ${
                    selectedOnboarding.risk === 'High' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : (selectedOnboarding.risk === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30')
                  }`}>
                    Risk: {selectedOnboarding.risk}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-left">
                  {selectedOnboarding.checklist.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleCompleteOnboardingTask(selectedOnboarding.id, idx)}
                      className="flex items-center gap-3 p-2 bg-[#111827]/40 border border-[#23324C]/35 rounded-xl cursor-pointer hover:border-brand-500/25 transition-all"
                    >
                      <button className="text-slate-450 hover:text-white cursor-pointer flex-shrink-0">
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-600" />
                        )}
                      </button>
                      <span className={`font-semibold ${item.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.name}</span>
                    </div>
                  ))}
                </div>

                {selectedOnboarding.checklist.every(item => item.completed) ? (
                  <div className="border-t border-[#23324C]/50 pt-4 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-white font-extrabold text-sm">Onboarding checklist 100% Completed!</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Tenant setup criteria validated. Click below to provision the production workspace.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const lead = crmDb.leads.find(l => l.id === selectedOnboarding.leadId);
                        if (lead) {
                          setSelectedLead(lead);
                          setWizardStep(1);
                          setConversionWizardOpen(true);
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2 px-6 rounded-xl text-xs cursor-pointer inline-flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" /> Convert to Active Company Workspace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setOnboardingHandoverForm({ notes: '', repName: selectedOnboarding.owner || 'Alex Wright' });
                        setOnboardingHandoverModalOpen(true);
                      }}
                      className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs font-bold py-2 px-6 rounded-xl cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" /> Send Handover Package
                    </button>

                    {selectedOnboarding.pendingDocuments && selectedOnboarding.pendingDocuments.length > 0 && (
                      <div className="border-t border-[#23324C]/50 pt-4 space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Pending Legal Documents Checklist</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                          {selectedOnboarding.pendingDocuments.map((doc, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2 p-2 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg font-bold">
                              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 text-xs italic">Select onboarding company.</div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================
          TAB 9: SALES REPORTS & ANALYTICS
          ============================================================================ */}
      {activeTab === 'reports' && (
        <div className="space-y-6 text-left">
          
          {/* Sub-Reports Navigation Tabs */}
          <div className="glass rounded-2xl border border-[#23324C]/60 overflow-hidden">
            <div className="flex gap-1 border-b border-[#23324C]/50 p-3 overflow-x-auto scrollbar-none">
              {['Leads', 'Conversions', 'Revenue', 'Demos', 'Trials', 'Proposals', 'Rep Performance', 'Activities'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedSubReport(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubReport === tab
                      ? 'bg-brand-500 text-slate-950 shadow-md'
                      : 'bg-[#111827]/40 border border-[#23324C]/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 text-xs text-left">
              {/* Leads Sub-Report */}
              {selectedSubReport === 'Leads' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">Leads Report — All Pipeline Records</span>
                    <span className="text-[10px] text-slate-500 font-mono">{crmDb.leads.length} Total Leads</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center text-[10px]">
                    {[
                      { label: 'New Leads', value: kpis.newLeadsStageCount, color: 'text-brand-400' },
                      { label: 'Active Pipeline', value: crmDb.leads.filter(l => !['Won','Lost'].includes(l.stage)).length, color: 'text-indigo-400' },
                      { label: 'Won', value: kpis.dealsWon, color: 'text-emerald-400' },
                      { label: 'Lost', value: kpis.dealsLost, color: 'text-red-400' }
                    ].map(s => (
                      <div key={s.label} className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                        <span className={`text-xl font-black block ${s.color}`}>{s.value}</span>
                        <span className="text-slate-500 text-[9px] uppercase font-bold">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                    <table className="w-full text-[10px] text-slate-350">
                      <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                        <tr>
                          <th className="p-2.5 text-left">Company</th>
                          <th className="p-2.5 text-left">Rep</th>
                          <th className="p-2.5 text-left">Niche</th>
                          <th className="p-2.5 text-right">Revenue</th>
                          <th className="p-2.5 text-center">Stage</th>
                          <th className="p-2.5 text-center">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#23324C]/30">
                        {crmDb.leads.slice(0, 8).map(l => (
                          <tr key={l.id} className="hover:bg-slate-800/20">
                            <td className="p-2.5 font-bold text-white">{l.company}</td>
                            <td className="p-2.5 text-slate-400">{l.rep}</td>
                            <td className="p-2.5 text-slate-400">{l.niche}</td>
                            <td className="p-2.5 text-right text-brand-400 font-black">${l.revenue?.toLocaleString()}</td>
                            <td className="p-2.5 text-center"><span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded text-[8px] font-bold">{l.stage}</span></td>
                            <td className="p-2.5 text-center font-mono font-bold">{l.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conversions Sub-Report */}
              {selectedSubReport === 'Conversions' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Conversions Funnel Report</span>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { stage: 'New Lead', count: crmDb.leads.filter(l => l.stage === 'New Lead').length },
                        { stage: 'Demo', count: crmDb.demos.length },
                        { stage: 'Trial', count: crmDb.trials.length },
                        { stage: 'Proposal', count: crmDb.proposals.length },
                        { stage: 'Won', count: kpis.dealsWon }
                      ]} margin={{ left: -10, right: 5, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#23324C" opacity={0.2} />
                        <XAxis dataKey="stage" stroke="#94a3b8" fontSize={8} />
                        <YAxis stroke="#94a3b8" fontSize={8} />
                        <Tooltip contentStyle={{ backgroundColor: '#161F30', borderColor: '#23324C', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                        <Bar dataKey="count" name="Count" fill="#6366F1" radius={[4,4,0,0]}>
                          {[0,1,2,3,4].map(i => (
                            <Cell key={i} fill={['#6366F1','#3B82F6','#10B981','#F59E0B','#10B981'][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[10px] text-center">
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                      <span className="text-xl font-black block text-brand-400">{Math.round((kpis.dealsWon / (crmDb.leads.length || 1)) * 100)}%</span>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">Conversion Rate</span>
                    </div>
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                      <span className="text-xl font-black block text-emerald-400">{Math.round((crmDb.demos.filter(d => d.status === 'Completed').length / (crmDb.demos.length || 1)) * 100)}%</span>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">Demo → Trial Rate</span>
                    </div>
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                      <span className="text-xl font-black block text-amber-400">{Math.round((crmDb.proposals.filter(p => p.status === 'Accepted').length / (crmDb.proposals.length || 1)) * 100)}%</span>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">Proposal Accept Rate</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Sub-Report */}
              {selectedSubReport === 'Revenue' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Revenue Analytics Report</span>
                  <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                      <span className="text-sm font-black block text-brand-400">${kpis.mrr.toLocaleString()}</span>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">Monthly MRR</span>
                    </div>
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                      <span className="text-sm font-black block text-emerald-400">${(kpis.mrr * 12).toLocaleString()}</span>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">Annual ARR</span>
                    </div>
                    <div className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                      <span className="text-sm font-black block text-amber-400">${kpis.totalPipelineValue.toLocaleString()}</span>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">Pipeline Value</span>
                    </div>
                  </div>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stages.filter(s => !['Won','Lost'].includes(s)).map(s => ({
                        stage: s,
                        value: crmDb.leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.revenue || 0), 0)
                      }))} margin={{ left: -10, right: 5, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#23324C" opacity={0.2} />
                        <XAxis dataKey="stage" stroke="#94a3b8" fontSize={7} />
                        <YAxis stroke="#94a3b8" fontSize={8} />
                        <Tooltip contentStyle={{ backgroundColor: '#161F30', borderColor: '#23324C', borderRadius: '12px', fontSize: '11px', color: '#fff' }} formatter={(v) => [`$${v.toLocaleString()}`, 'Pipeline $']} />
                        <Bar dataKey="value" name="Pipeline $" fill="#FFD400" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Demos Sub-Report */}
              {selectedSubReport === 'Demos' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Demo Bookings Report</span>
                  <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                    {[
                      { label: 'Total Demos', value: crmDb.demos.length, color: 'text-white' },
                      { label: 'Upcoming', value: crmDb.demos.filter(d => d.status === 'Upcoming').length, color: 'text-brand-400' },
                      { label: 'Completed', value: crmDb.demos.filter(d => d.status === 'Completed').length, color: 'text-emerald-400' }
                    ].map(s => (
                      <div key={s.label} className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                        <span className={`text-xl font-black block ${s.color}`}>{s.value}</span>
                        <span className="text-slate-500 text-[9px] uppercase font-bold">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                    <table className="w-full text-[10px] text-slate-350">
                      <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                        <tr>
                          <th className="p-2.5 text-left">Company</th>
                          <th className="p-2.5 text-left">Presenter</th>
                          <th className="p-2.5 text-left">Date</th>
                          <th className="p-2.5 text-left">Time</th>
                          <th className="p-2.5 text-center">Status</th>
                          <th className="p-2.5 text-center">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#23324C]/30">
                        {crmDb.demos.map(d => (
                          <tr key={d.id} className="hover:bg-slate-800/20">
                            <td className="p-2.5 font-bold text-white">{d.company}</td>
                            <td className="p-2.5 text-slate-400">{d.presenter}</td>
                            <td className="p-2.5 text-mono">{d.date}</td>
                            <td className="p-2.5">{d.time}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${d.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400'}`}>{d.status}</span>
                            </td>
                            <td className="p-2.5 text-center font-mono">{d.rating ? `${d.rating}/5 ⭐` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Trials Sub-Report */}
              {selectedSubReport === 'Trials' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Trial Workspaces Report</span>
                  <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                    {[
                      { label: 'Active Trials', value: crmDb.trials.filter(t => t.status === 'Active').length, color: 'text-emerald-400' },
                      { label: 'Expired', value: crmDb.trials.filter(t => t.status === 'Expired').length, color: 'text-red-400' },
                      { label: 'Expiring Soon', value: crmDb.trials.filter(t => t.status === 'Active' && t.daysRemaining <= 3).length, color: 'text-amber-400' }
                    ].map(s => (
                      <div key={s.label} className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                        <span className={`text-xl font-black block ${s.color}`}>{s.value}</span>
                        <span className="text-slate-500 text-[9px] uppercase font-bold">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {crmDb.trials.map(t => (
                      <div key={t.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <strong className="text-white text-xs block">{t.company}</strong>
                          <span className="text-[9px] text-slate-450 block mt-0.5">Admin: {t.admin} • Plan: {t.currentPlan}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px]">
                          <div className="w-24">
                            <div className="flex justify-between text-slate-500 mb-1"><span>Days Left</span><span className="font-mono font-bold text-white">{t.daysRemaining}</span></div>
                            <div className="w-full bg-slate-900 rounded-full h-1">
                              <div className={`h-full rounded-full ${t.daysRemaining <= 3 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, (t.daysRemaining / 14) * 100)}%` }} />
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposals Sub-Report */}
              {selectedSubReport === 'Proposals' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Proposal Issuances Report</span>
                  <div className="grid grid-cols-4 gap-3 text-center text-[10px]">
                    {[
                      { label: 'Total', value: crmDb.proposals.length, color: 'text-white' },
                      { label: 'Sent', value: crmDb.proposals.filter(p => p.status === 'Sent').length, color: 'text-brand-400' },
                      { label: 'Accepted', value: crmDb.proposals.filter(p => p.status === 'Accepted').length, color: 'text-emerald-400' },
                      { label: 'Rejected', value: crmDb.proposals.filter(p => p.status === 'Rejected').length, color: 'text-red-400' }
                    ].map(s => (
                      <div key={s.label} className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                        <span className={`text-xl font-black block ${s.color}`}>{s.value}</span>
                        <span className="text-slate-500 text-[9px] uppercase font-bold">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                    <table className="w-full text-[10px] text-slate-350">
                      <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                        <tr>
                          <th className="p-2.5 text-left">Company</th>
                          <th className="p-2.5 text-left">Title</th>
                          <th className="p-2.5 text-right">Value</th>
                          <th className="p-2.5 text-center">Version</th>
                          <th className="p-2.5 text-center">Status</th>
                          <th className="p-2.5 text-left">Validity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#23324C]/30">
                        {crmDb.proposals.map(p => (
                          <tr key={p.id} className="hover:bg-slate-800/20">
                            <td className="p-2.5 font-bold text-white">{p.company}</td>
                            <td className="p-2.5 text-slate-400 truncate max-w-[160px]">{p.title}</td>
                            <td className="p-2.5 text-right text-brand-400 font-black">${p.total?.toLocaleString()}</td>
                            <td className="p-2.5 text-center font-mono font-bold">{p.version || 'V1'}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${p.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'Rejected' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400'}`}>{p.status}</span>
                            </td>
                            <td className="p-2.5">{p.validity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rep Performance Sub-Report */}
              {selectedSubReport === 'Rep Performance' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Sales Representatives Performance Scorecard</span>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={repPerformanceData} margin={{ left: -10, right: 5, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#23324C" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={8} />
                        <Tooltip contentStyle={{ backgroundColor: '#161F30', borderColor: '#23324C', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                        <Bar dataKey="won" name="Deals Won" fill="#10B981" radius={[4,4,0,0]} />
                        <Bar dataKey="revenue" name="Revenue" fill="#FFD400" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                    <table className="w-full text-[10px] text-slate-350">
                      <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                        <tr>
                          <th className="p-2.5 text-left">Rep Name</th>
                          <th className="p-2.5 text-center">Leads Assigned</th>
                          <th className="p-2.5 text-center">Deals Won</th>
                          <th className="p-2.5 text-right">Revenue Generated</th>
                          <th className="p-2.5 text-center">Win Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#23324C]/30">
                        {repPerformanceData.map(rep => {
                          const assigned = crmDb.leads.filter(l => l.rep === rep.name).length;
                          const winRate = assigned > 0 ? Math.round((rep.won / assigned) * 100) : 0;
                          return (
                            <tr key={rep.name} className="hover:bg-slate-800/20">
                              <td className="p-2.5 font-bold text-white">{rep.name}</td>
                              <td className="p-2.5 text-center font-mono">{assigned}</td>
                              <td className="p-2.5 text-center font-mono text-emerald-400 font-black">{rep.won}</td>
                              <td className="p-2.5 text-right text-brand-400 font-black">${rep.revenue?.toLocaleString()}</td>
                              <td className="p-2.5 text-center">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-900 rounded-full h-1">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${winRate}%` }} />
                                  </div>
                                  <span className="font-mono font-bold">{winRate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Activities Sub-Report */}
              {selectedSubReport === 'Activities' && (
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">Sales Activities &amp; Touchpoints Log</span>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-none">
                    {crmDb.leads.flatMap(l => 
                      (l.timeline || []).map(t => ({ ...t, company: l.company, rep: l.rep }))
                    ).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 20).map((ev, idx) => (
                      <div key={idx} className="flex gap-3 p-2.5 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl items-start">
                        <div className="mt-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-white text-[11px]">{ev.company}</strong>
                            <span className="text-[8px] bg-slate-900 border border-[#23324C]/50 text-slate-400 px-1.5 py-0.5 rounded font-mono">{ev.date}</span>
                            <span className="text-[8px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-1.5 py-0.5 rounded font-bold">{ev.event}</span>
                          </div>
                          <p className="text-[10px] text-slate-450 mt-0.5 truncate">{ev.detail}</p>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono flex-shrink-0">By: {ev.user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold">Export complete report decks:</span>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="px-3.5 py-2 bg-slate-900 border border-[#23324C]/65 hover:border-brand-500/40 rounded-xl text-[10px] font-black uppercase text-slate-350 hover:text-white cursor-pointer">
                Export PDF
              </button>
              <button onClick={handleExportCSV} className="px-3.5 py-2 bg-slate-900 border border-[#23324C]/65 hover:border-brand-500/40 rounded-xl text-[10px] font-black uppercase text-slate-350 hover:text-white cursor-pointer">
                Export CSV / Excel
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================================
          TAB 10: SETTINGS PANELS CONFIGURATION
          ============================================================================ */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left animate-fade-in">
          
          {/* Panel 1: Template Manager */}
          <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-white">Email & Touchpoint Templates</h3>
                <p className="text-[10px] text-slate-500">Configure pre-formatted messages for demo slots and trial invites.</p>
              </div>

              <div className="space-y-3">
                <SelectInput 
                  label="Select Target Template" 
                  value={settingsActiveTemplate} 
                  onChange={(e) => setSettingsActiveTemplate(e.target.value)}
                  options={Object.keys(customTemplates).map(k => ({ value: k, label: k }))}
                />
                
                <TextInput 
                  label="Subject Line Lineup" 
                  value={settingsTemplateSubject} 
                  onChange={(e) => setSettingsTemplateSubject(e.target.value)} 
                />

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Body Editor</label>
                  <textarea
                    rows={6}
                    value={settingsTemplateBody}
                    onChange={(e) => setSettingsTemplateBody(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C]/60 text-slate-200 text-xs p-3.5 rounded-xl focus:outline-none focus:border-brand-500/50 font-mono resize-none"
                  />
                  <span className="text-[8px] text-slate-500 block">Available merge tags: <code>{"{{contact_name}}"}</code>, <code>{"{{company_name}}"}</code>, <code>{"{{rep_name}}"}</code></span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveTemplate}
              className="mt-4 bg-brand-500 hover:bg-brand-600 text-slate-950 font-black py-2 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" /> Save Template Configuration
            </button>
          </div>

          {/* Panel 2 & 3: Stages & Lead Sources */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Pipeline Stage Editor */}
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Pipeline Stages</h3>
                  <p className="text-[10px] text-slate-500">Add or manage stages defining your sales pipeline columns.</p>
                </div>

                <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {pipelineStages.map((stage) => (
                    <div key={stage} className="flex justify-between items-center bg-[#111827]/40 border border-[#23324C]/50 rounded-xl px-3 py-1.5 text-xs">
                      <span className="text-white font-semibold">{stage}</span>
                      {!['New Lead', 'Won', 'Lost'].includes(stage) && (
                        <button onClick={() => handleDeleteStage(stage)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="New stage title..."
                  value={newStageInput}
                  onChange={(e) => setNewStageInput(e.target.value)}
                  className="bg-[#0B0F19] border border-[#23324C]/60 text-slate-200 text-xs px-3.5 py-2 rounded-xl flex-grow focus:outline-none"
                />
                <button 
                  onClick={handleAddStage}
                  className="px-4 bg-slate-900 border border-[#23324C]/65 text-brand-400 hover:text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Lead Sources Editor */}
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Lead Acquisition Sources</h3>
                  <p className="text-[10px] text-slate-500">Track and filter where inbound carrier queries originate.</p>
                </div>

                <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {leadSources.map((source) => (
                    <div key={source} className="flex justify-between items-center bg-[#111827]/40 border border-[#23324C]/50 rounded-xl px-3 py-1.5 text-xs">
                      <span className="text-white font-semibold">{source}</span>
                      <button onClick={() => handleDeleteLeadSource(source)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="New acquisition source..."
                  value={newLeadSourceInput}
                  onChange={(e) => setNewLeadSourceInput(e.target.value)}
                  className="bg-[#0B0F19] border border-[#23324C]/60 text-slate-200 text-xs px-3.5 py-2 rounded-xl flex-grow focus:outline-none"
                />
                <button 
                  onClick={handleAddLeadSource}
                  className="px-4 bg-slate-900 border border-[#23324C]/65 text-brand-400 hover:text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================================
          CRM DRAWERS & INTERACTIVE DIALOGS
          ============================================================================ */}

      {/* 1. Add Lead Modal */}
      <Modal isOpen={addLeadModalOpen} onClose={() => setAddLeadModalOpen(false)} title="Register Inbound Carrier Lead">
        <form onSubmit={(e) => handleAddLeadSubmit(e, false)} className="space-y-4 text-left text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Company Legal Name" 
              required 
              placeholder="e.g. Vance Refrigeration" 
              value={leadForm.company} 
              onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} 
            />
            <TextInput 
              label="Contact Person Name" 
              required 
              placeholder="e.g. Robert Vance" 
              value={leadForm.name} 
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Contact Email" 
              required 
              type="email"
              placeholder="e.g. rvance@vance.com" 
              value={leadForm.email} 
              onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} 
            />
            <TextInput 
              label="Contact Phone" 
              placeholder="e.g. 555-9021" 
              value={leadForm.phone} 
              onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Fleet Size (Trucks)" 
              type="number"
              value={leadForm.fleetSize} 
              onChange={(e) => setLeadForm({ ...leadForm, fleetSize: e.target.value })} 
            />
            <SelectInput 
              label="Transport Niche" 
              value={leadForm.niche} 
              onChange={(e) => setLeadForm({ ...leadForm, niche: e.target.value })}
              options={[
                { value: 'Car Carrying', label: '🚗 Car Carrying' },
                { value: 'General Freight', label: '📦 General Freight' },
                { value: 'Dangerous Goods', label: '☣️ Dangerous Goods' },
                { value: 'Refrigerated', label: '❄️ Refrigerated' },
                { value: 'Flatbed', label: '🏗️ Flatbed' },
                { value: 'Container', label: '🚢 Container' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Revenue Estimate ($/mo)" 
              type="number"
              value={leadForm.revenue} 
              onChange={(e) => setLeadForm({ ...leadForm, revenue: e.target.value })} 
            />
            <SelectInput
              label="Assigned Agent Rep"
              value={leadForm.rep}
              onChange={(e) => setLeadForm({ ...leadForm, rep: e.target.value })}
              options={[
                { value: 'Alex Wright', label: 'Alex Wright' },
                { value: 'Sarah K.', label: 'Sarah K.' },
                { value: 'Michael Scott', label: 'Michael Scott' },
                { value: 'Jan Levinson', label: 'Jan Levinson' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Current Software" 
              placeholder="e.g. Excel, competitor TMS" 
              value={leadForm.currentSoftware} 
              onChange={(e) => setLeadForm({ ...leadForm, currentSoftware: e.target.value })} 
            />
            <TextInput 
              label="Pain Points" 
              placeholder="e.g. High dispatch latency" 
              value={leadForm.painPoints} 
              onChange={(e) => setLeadForm({ ...leadForm, painPoints: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectInput
              label="Priority"
              value={leadForm.priority}
              onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
              options={[
                { value: 'Low', label: '🟢 Low' },
                { value: 'Medium', label: '🟡 Medium' },
                { value: 'High', label: '🔴 High' }
              ]}
            />
            <TextInput 
              label="Tags" 
              placeholder="e.g. SaaS Inbound, Hot Lead" 
              value={leadForm.tags} 
              onChange={(e) => setLeadForm({ ...leadForm, tags: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Next Follow-Up Date"
              value={leadForm.nextFollowup}
              onChange={(e) => setLeadForm({ ...leadForm, nextFollowup: e.target.value })}
            />
            <TextInput 
              label="Message Details / Notes" 
              placeholder="e.g. Needs net-15 factoring options..." 
              value={leadForm.notes} 
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} 
            />
          </div>

          <div className="flex gap-2 pt-2 pb-4">
            <Button type="submit" variant="primary" className="flex-grow">
              Save Lead Card
            </Button>
            <button 
              type="button"
              onClick={(e) => handleAddLeadSubmit(e, true)}
              className="flex-grow bg-slate-800 hover:bg-slate-700 text-slate-200 border border-[#23324C] text-[11px] font-black py-2 rounded-xl text-center cursor-pointer"
            >
              Save & Book Demo
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Lead Modal */}
      <Modal isOpen={editLeadModalOpen} onClose={() => setEditLeadModalOpen(false)} title="Modify Prospect Credentials">
        <form onSubmit={handleEditLeadSave} className="space-y-4 text-left text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Company" required value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} />
            <TextInput label="Contact Name" required value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Email Address" required type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
            <TextInput label="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Fleet Size" type="number" value={leadForm.fleetSize} onChange={(e) => setLeadForm({ ...leadForm, fleetSize: e.target.value })} />
            <SelectInput 
              label="Niche" 
              value={leadForm.niche} 
              onChange={(e) => setLeadForm({ ...leadForm, niche: e.target.value })}
              options={[
                { value: 'Car Carrying', label: '🚗 Car Carrying' },
                { value: 'General Freight', label: '📦 General Freight' },
                { value: 'Dangerous Goods', label: '☣️ Dangerous Goods' },
                { value: 'Refrigerated', label: '❄️ Refrigerated' },
                { value: 'Flatbed', label: '🏗️ Flatbed' },
                { value: 'Container', label: '🚢 Container' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Revenue Estimate ($/mo)" 
              type="number"
              value={leadForm.revenue} 
              onChange={(e) => setLeadForm({ ...leadForm, revenue: e.target.value })} 
            />
            <SelectInput
              label="Assigned Agent Rep"
              value={leadForm.rep}
              onChange={(e) => setLeadForm({ ...leadForm, rep: e.target.value })}
              options={[
                { value: 'Alex Wright', label: 'Alex Wright' },
                { value: 'Sarah K.', label: 'Sarah K.' },
                { value: 'Michael Scott', label: 'Michael Scott' },
                { value: 'Jan Levinson', label: 'Jan Levinson' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput 
              label="Current Software" 
              value={leadForm.currentSoftware} 
              onChange={(e) => setLeadForm({ ...leadForm, currentSoftware: e.target.value })} 
            />
            <TextInput 
              label="Pain Points" 
              value={leadForm.painPoints} 
              onChange={(e) => setLeadForm({ ...leadForm, painPoints: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectInput
              label="Priority"
              value={leadForm.priority}
              onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
              options={[
                { value: 'Low', label: '🟢 Low' },
                { value: 'Medium', label: '🟡 Medium' },
                { value: 'High', label: '🔴 High' }
              ]}
            />
            <TextInput 
              label="Tags" 
              value={leadForm.tags} 
              onChange={(e) => setLeadForm({ ...leadForm, tags: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Next Follow-Up Date"
              value={leadForm.nextFollowup}
              onChange={(e) => setLeadForm({ ...leadForm, nextFollowup: e.target.value })}
            />
            <TextInput 
              label="Message Details / Notes" 
              value={leadForm.notes} 
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} 
            />
          </div>

          <div className="pt-2 pb-4">
            <Button type="submit" variant="primary" className="w-full">
              Save Modifications
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Demo Booking Modal */}
      <Modal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} title="Schedule ZOOM Product Walkthrough">
        {selectedLead && (
          <form onSubmit={handleBookDemoSubmit} className="space-y-4 text-left text-xs">
            <p className="text-slate-400">Locking a demo schedule for {selectedLead.company}.</p>
            
            <DatePicker 
              label="Select Date" 
              value={demoForm.date} 
              onChange={(e) => setDemoForm({ ...demoForm, date: e.target.value })} 
            />

            <SelectInput 
              label="Select Time Block" 
              value={demoForm.time} 
              onChange={(e) => setDemoForm({ ...demoForm, time: e.target.value })}
              options={[
                { value: '09:00 AM', label: '09:00 AM EST' },
                { value: '11:00 AM', label: '11:00 AM EST' },
                { value: '02:00 PM', label: '02:00 PM EST' },
                { value: '04:30 PM', label: '04:30 PM EST' }
              ]}
            />

            <TextInput 
              label="Meeting Agenda / Host Notes" 
              value={demoForm.notes} 
              onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })} 
            />

            <Button type="submit" variant="primary" className="w-full">
              Confirm Zoom Schedule
            </Button>
          </form>
        )}
      </Modal>

      {/* 4. Proposal Modal */}
      <Modal isOpen={proposalModalOpen} onClose={() => setProposalModalOpen(false)} title="Issue Licensing Agreement Proposal">
        {selectedLead && (
          <form onSubmit={handleSaveProposalSubmit} className="space-y-4 text-left text-xs">
            <TextInput 
              label="Proposal Title Document" 
              value={proposalBuilder.title} 
              onChange={(e) => setProposalBuilder({ ...proposalBuilder, title: e.target.value })} 
            />

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Line Items</span>
              {proposalBuilder.items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <TextInput 
                    required 
                    placeholder="Description" 
                    value={item.name} 
                    onChange={(e) => {
                      const updated = proposalBuilder.items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it);
                      setProposalBuilder({ ...proposalBuilder, items: updated });
                    }} 
                    className="flex-grow"
                  />
                  <TextInput 
                    required 
                    type="number"
                    placeholder="Price" 
                    value={String(item.price)} 
                    onChange={(e) => {
                      const updated = proposalBuilder.items.map((it, i) => i === idx ? { ...it, price: parseInt(e.target.value) || 0 } : it);
                      setProposalBuilder({ ...proposalBuilder, items: updated });
                    }} 
                    className="w-20"
                  />
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddProposalItem}
                className="text-[10px] text-brand-400 font-bold hover:text-brand-300 cursor-pointer block mt-1"
              >
                + Add Custom Add-on item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextInput 
                label="Corporate Discount (%)" 
                type="number"
                value={String(proposalBuilder.discount)} 
                onChange={(e) => setProposalBuilder({ ...proposalBuilder, discount: parseInt(e.target.value) || 0 })} 
              />
              <SelectInput
                label="Proposal Validity Term"
                value={proposalBuilder.validity}
                onChange={(e) => setProposalBuilder({ ...proposalBuilder, validity: e.target.value })}
                options={[
                  { value: '15 Days', label: '15 Days validity' },
                  { value: '30 Days', label: '30 Days validity' },
                  { value: '60 Days', label: '60 Days validity' }
                ]}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Dispatched Proposal Email
            </Button>
          </form>
        )}
      </Modal>

      {/* 5. Drag Confirm Stage transition modal */}
      <Modal isOpen={dragConfirmModalOpen} onClose={() => setDragConfirmModalOpen(false)} title="Confirm Stage transition">
        {draggedLead && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-slate-350">You are dragging lead <strong>{draggedLead.company}</strong> to the stage <strong>{targetDragStage}</strong>.</p>
            
            <TextInput 
              label="Transition Reason / Action Note" 
              required
              placeholder="e.g. Client requested sandbox login..."
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
            />

            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleConfirmStageTransition}
                className="flex-grow bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] font-black py-2 rounded-xl text-center cursor-pointer"
              >
                Confirm Stage Shift
              </button>
              <button 
                onClick={() => setDragConfirmModalOpen(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2 rounded-xl text-center cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. Trial Extend Modal */}
      <Modal isOpen={extendTrialModalOpen} onClose={() => setExtendTrialModalOpen(false)} title="Extend Trial Workspace Term">
        {selectedTrial && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-slate-355">Extend evaluation sandbox period for <strong>{selectedTrial.company}</strong>.</p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  crmRepository.extendTrial(selectedTrial.id, 7);
                  crmActivityEngine.logMutation(selectedTrial.leadId, permissionRole, 'Trial Extended', 'Sandbox period extended by 7 days.', 'None', 'Extended');
                  setExtendTrialModalOpen(false);
                  triggerToast(`Extension complete (+7 days) for ${selectedTrial.company}`);
                }}
                className="flex-grow bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] font-black py-2.5 rounded-xl cursor-pointer"
              >
                Extend +7 Days
              </button>
              
              <button 
                onClick={() => {
                  if (!verifyPermission('extend_trial_over_30')) return;
                  crmRepository.extendTrial(selectedTrial.id, 30);
                  crmActivityEngine.logMutation(selectedTrial.leadId, permissionRole, 'Trial Extended', 'Sandbox period extended by 30 days.', 'None', 'Extended');
                  setExtendTrialModalOpen(false);
                  triggerToast(`Extension complete (+30 days) for ${selectedTrial.company}`);
                }}
                className={`flex-grow bg-slate-800 text-slate-200 text-[11px] font-bold py-2.5 rounded-xl cursor-pointer border border-[#23324C] ${
                  verifyPermission('extend_trial_over_30', true) ? 'hover:bg-slate-750' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                {verifyPermission('extend_trial_over_30', true) ? "Extend +30 Days" : "🔒 Needs Director for +30 Days"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. Contacts CRUD Modal */}
      <Modal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} title={selectedContact ? "Edit Contact" : "Add New Contact"}>
        {selectedLead && (
          <form onSubmit={handleSaveContact} className="space-y-4 text-left text-xs">
            <TextInput label="Full Name" required value={contactForm.name} onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))} />
            <SelectInput 
              label="Company Role" 
              value={contactForm.role} 
              onChange={(e) => setContactForm(prev => ({ ...prev, role: e.target.value }))}
              options={[
                { value: 'Owner', label: 'Owner / Executive' },
                { value: 'Operations Manager', label: 'Operations Manager' },
                { value: 'Accounts Manager', label: 'Accounts Manager' },
                { value: 'Dispatch Manager', label: 'Dispatch Manager' },
                { value: 'Warehouse Manager', label: 'Warehouse Manager' },
                { value: 'Primary Contact', label: 'Primary Contact' }
              ]}
            />
            <TextInput label="Email Address" required type="email" value={contactForm.email} onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))} />
            <TextInput label="Phone Number" value={contactForm.phone} onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))} />
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="contactPrimaryCheck" 
                checked={contactForm.isPrimary} 
                onChange={(e) => setContactForm(prev => ({ ...prev, isPrimary: e.target.checked }))} 
                className="cursor-pointer"
              />
              <label htmlFor="contactPrimaryCheck" className="text-slate-350 cursor-pointer select-none">Set as Primary contact person</label>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Save Contact
            </Button>
          </form>
        )}
      </Modal>

      {/* 8. Activity Modal */}
      <Modal isOpen={activityModalOpen} onClose={() => setActivityModalOpen(false)} title="Log Sales Activity Touchpoint">
        {selectedLead && (
          <form onSubmit={handleLogActivity} className="space-y-4 text-left text-xs">
            <div className="grid grid-cols-2 gap-3">
              <SelectInput 
                label="Activity Type" 
                value={activityForm.type} 
                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                options={[
                  { value: 'Phone Call', label: '📞 Phone Call' },
                  { value: 'Email', label: '✉️ Email' },
                  { value: 'Meeting', label: '🤝 Meeting' },
                  { value: 'Video Demo', label: '🎥 Video Demo' },
                  { value: 'WhatsApp', label: '💬 WhatsApp Message' },
                  { value: 'Internal Note', label: '📝 Internal Note' },
                  { value: 'Reminder', label: '⏰ Reminder' }
                ]}
              />
              <TextInput label="Outcome / Status" required value={activityForm.outcome} onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DatePicker label="Activity Date" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} />
              <TextInput label="Time" value={activityForm.time} onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })} />
            </div>

            <TextInput label="Action Notes" required value={activityForm.notes} onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })} />
            
            <Button type="submit" variant="primary" className="w-full">
              Log Activity touchpoint
            </Button>
          </form>
        )}
      </Modal>

      {/* 9. Email Composer Modal */}
      <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Compose Email Touchpoint">
        {selectedLead && (
          <form onSubmit={handleSendEmail} className="space-y-4 text-left text-xs">
            <SelectInput 
              label="Select Template Layout" 
              value={emailForm.template} 
              onChange={(e) => setEmailForm({ ...emailForm, template: e.target.value })}
              options={[
                { value: 'Welcome Sandbox Invite', label: 'Welcome Sandbox Invite' },
                { value: 'Pricing Proposal Followup', label: 'Pricing Proposal Followup' },
                { value: 'Demo Presentation Confirmation', label: 'Demo Presentation Confirmation' }
              ]}
            />
            <TextInput label="Email Subject" required value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} />
            
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Message Body</label>
              <textarea 
                rows={6} 
                value={emailForm.body} 
                onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                className="w-full bg-[#0B0F19]/50 border border-[#23324C] text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectInput 
                label="Email Status" 
                value={emailForm.status} 
                onChange={(e) => setEmailForm({ ...emailForm, status: e.target.value })}
                options={[
                  { value: 'Sent', label: 'Send Immediately' },
                  { value: 'Draft', label: 'Save Draft' },
                  { value: 'Scheduled', label: 'Schedule Tomorrow' }
                ]}
              />
              <Button type="submit" variant="primary" className="w-full mt-4 h-10">
                Process Mail
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 10. Call Center Logger Modal */}
      <Modal isOpen={callModalOpen} onClose={() => setCallModalOpen(false)} title="Log Outgoing / Incoming Phone call">
        {selectedLead && (
          <form onSubmit={handleLogCall} className="space-y-4 text-left text-xs">
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Call Duration" placeholder="e.g. 5m 12s" value={callForm.duration} onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })} />
              <SelectInput 
                label="Outcome" 
                value={callForm.outcome} 
                onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                options={[
                  { value: 'Connected', label: 'Connected' },
                  { value: 'Left Voicemail', label: 'Left Voicemail' },
                  { value: 'Busy', label: 'Busy' },
                  { value: 'No Answer', label: 'No Answer' }
                ]}
              />
            </div>
            
            <TextInput label="Call Notes" required value={callForm.notes} onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })} />
            
            <Button type="submit" variant="primary" className="w-full">
              Save Call Entry
            </Button>
          </form>
        )}
      </Modal>

      {/* 11. Add Task Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create New Task">
        {selectedLead && (
          <form onSubmit={handleCreateTask} className="space-y-4 text-left text-xs">
            <TextInput label="Task Title" required placeholder="e.g. Verify DOT registrations" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            
            <div className="grid grid-cols-3 gap-3">
              <SelectInput 
                label="Task Type" 
                value={taskForm.type} 
                onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                options={[
                  { value: 'Call', label: 'Phone Call' },
                  { value: 'Meeting', label: 'Meeting' },
                  { value: 'Email', label: 'Email' },
                  { value: 'Proposal', label: 'Proposal' },
                  { value: 'Follow-up', label: 'Follow-up' },
                  { value: 'Training', label: 'Training' }
                ]}
              />
              <DatePicker label="Due Date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <SelectInput 
                label="Priority" 
                value={taskForm.priority} 
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                options={[
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' }
                ]}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Create Task checklist
            </Button>
          </form>
        )}
      </Modal>

      {/* 12. Preview Document Modal */}
      <Modal isOpen={previewDocModalOpen} onClose={() => setPreviewDocModalOpen(false)} title={selectedDocument ? `Document Preview - ${selectedDocument.name}` : 'Document Preview'}>
        {selectedDocument && (
          <div className="space-y-4 text-left text-xs bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center border-b border-slate-750 pb-2">
              <strong className="text-white text-sm">{selectedDocument.name}</strong>
              <span className="text-[10px] text-slate-500 font-mono">Format: PDF • Size: {selectedDocument.size}</span>
            </div>
            
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              This represents a secure sandbox mockup visualization of the document <strong>{selectedDocument.name}</strong>. Inside a production CRM environment, the system displays PDF confirming records, DOT certificate files, and W-9 tax documents directly inline inside a web worker wrapper.
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-slate-750 text-[10px]">
              <span className="text-slate-500">Uploaded: {selectedDocument.date}</span>
              <button 
                onClick={() => triggerToast(`Downloaded ${selectedDocument.name}.`)}
                className="bg-brand-500 text-slate-950 font-black py-1.5 px-4 rounded-xl cursor-pointer"
              >
                Download File
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 13. Company Conversion Wizard Modal */}
      <Modal isOpen={conversionWizardOpen} onClose={() => setConversionWizardOpen(false)} title="Company Conversion Wizard">
        {selectedLead && (
          <div className="space-y-6 text-left text-xs">
            
            {/* Stepper Progress bar */}
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-[#23324C]/60 pb-3">
              <span className={wizardStep === 1 ? 'text-brand-400 font-black' : ''}>1. Tier</span>
              <span className={wizardStep === 2 ? 'text-brand-400 font-black' : ''}>2. Company</span>
              <span className={wizardStep === 3 ? 'text-brand-400 font-black' : ''}>3. Admin</span>
              <span className={wizardStep === 4 ? 'text-brand-400 font-black' : ''}>4. Depot</span>
              <span className={wizardStep === 5 ? 'text-brand-400 font-black' : ''}>5. Review</span>
              <span className={wizardStep === 6 ? 'text-brand-400 font-black' : ''}>6. Sync</span>
            </div>

            {/* Steps details */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Choose Subscription License</span>
                <div className="grid grid-cols-3 gap-3">
                  {['Starter', 'Professional', 'Enterprise'].map(tier => (
                    <div 
                      key={tier} 
                      onClick={() => setWizardForm({ ...wizardForm, tier })}
                      className={`p-3 border rounded-xl cursor-pointer text-center space-y-2 ${
                        wizardForm.tier === tier ? 'bg-brand-500/10 border-brand-500' : 'bg-slate-900 border-[#23324C]'
                      }`}
                    >
                      <strong className="text-white text-xs block">{tier}</strong>
                      <span className="text-[10px] text-slate-400">${tier === 'Starter' ? '199' : (tier === 'Professional' ? '499' : '1,299')}/mo</span>
                    </div>
                  ))}
                </div>
                <SelectInput 
                  label="Billing Frequency" 
                  value={wizardForm.frequency} 
                  onChange={(e) => setWizardForm({ ...wizardForm, frequency: e.target.value })}
                  options={[{ value: 'Monthly', label: 'Monthly' }, { value: 'Yearly', label: 'Yearly (20% Discount)' }]}
                />
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Legal Information</span>
                <TextInput label="Legal Company Name" value={wizardForm.legalName} onChange={(e) => setWizardForm({ ...wizardForm, legalName: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput label="DOT Registry Number" value={wizardForm.dotNumber} onChange={(e) => setWizardForm({ ...wizardForm, dotNumber: e.target.value })} />
                  <TextInput label="Corporate Tax ID" value={wizardForm.taxId} onChange={(e) => setWizardForm({ ...wizardForm, taxId: e.target.value })} />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Define System Administrator Workspace Profile</span>
                <TextInput label="Admin Full Name" value={wizardForm.adminName} onChange={(e) => setWizardForm({ ...wizardForm, adminName: e.target.value })} />
                <TextInput label="Admin Login Email" type="email" value={wizardForm.adminEmail} onChange={(e) => setWizardForm({ ...wizardForm, adminEmail: e.target.value })} />
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assign Regional Branch terminal</span>
                <SelectInput 
                  label="Depot Location" 
                  value={wizardForm.branch} 
                  onChange={(e) => setWizardForm({ ...wizardForm, branch: e.target.value })}
                  options={[
                    { value: 'Chicago HQ Terminal', label: 'Chicago HQ Terminal' },
                    { value: 'Los Angeles Depot', label: 'Los Angeles Depot' },
                    { value: 'New York Bay Terminal', label: 'New York Bay Terminal' },
                    { value: 'Atlanta Depot', label: 'Atlanta Depot' }
                  ]}
                />
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Review Workspace Specifications</span>
                <div className="bg-[#111827]/40 border border-[#23324C]/60 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subscription:</span>
                    <strong className="text-white">{wizardForm.tier} Plan ({wizardForm.frequency})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <strong className="text-white">{wizardForm.legalName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Admin User:</span>
                    <strong className="text-white">{wizardForm.adminName} ({wizardForm.adminEmail})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Depot Allocation:</span>
                    <strong className="text-white">{wizardForm.branch}</strong>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 6 && (
              <div className="py-8 text-center space-y-4">
                {provisioningLoading ? (
                  <div className="space-y-3.5">
                    <div className="w-10 h-10 border-t-2 border-brand-500 rounded-full animate-spin mx-auto"></div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">{provisioningStatusText}</span>
                  </div>
                ) : (
                  <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-white text-base font-extrabold">Company Workspace Provision Complete!</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Tenant profile successfully registered inside global administrative databases.</p>
                    </div>
                    <button 
                      onClick={handleWizardLoginAsCompany}
                      className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-black py-2.5 px-6 rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-brand-500/10"
                    >
                      <UserCheck className="h-4 w-4" /> Takeover Admin Session & Open Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}

            {wizardStep < 6 && (
              <div className="flex gap-2 border-t border-[#23324C]/60 pt-4">
                <button 
                  onClick={handleProceedWizard}
                  className="flex-grow bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] font-black py-2 rounded-xl text-center cursor-pointer"
                >
                  {wizardStep === 5 ? 'Provision Workspace' : 'Continue'}
                </button>
                {wizardStep > 1 && (
                  <button 
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2 rounded-xl text-center cursor-pointer"
                  >
                    Back
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* 14. Full Inspect Drawer Upgraded to Lead 360° */}
      <Drawer isOpen={inspectDrawerOpen} onClose={() => setInspectDrawerOpen(false)} title="Lead 360° Profile Inspector">
        {selectedLead && (
          <div className="space-y-6 text-left text-slate-300 text-xs sm:text-sm h-full flex flex-col justify-between">
            
            {/* Header info */}
            <div className="border-b border-[#23324C]/60 pb-3 flex justify-between items-start gap-4">
              <div>
                <h4 className="text-base font-extrabold text-white mb-1">{selectedLead.company}</h4>
                <div className="flex flex-wrap gap-1.5 items-center mt-1">
                  <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">{selectedLead.stage}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    selectedLead.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : (selectedLead.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')
                  }`}>Risk: {selectedLead.riskLevel}</span>
                </div>
              </div>
              
              <div className="flex gap-1.5">
                <button onClick={() => handleOpenDemoModal(selectedLead)} className="p-1.5 bg-slate-900 border border-[#23324C]/60 rounded-lg cursor-pointer" title="Book Demo"><Calendar className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleStartTrial(selectedLead)} className="p-1.5 bg-slate-900 border border-[#23324C]/60 rounded-lg cursor-pointer" title="Start Trial"><Play className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleOpenProposalModal(selectedLead)} className="p-1.5 bg-slate-900 border border-[#23324C]/60 rounded-lg cursor-pointer" title="Send Proposal"><FileText className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Scrollable sub-tabs horizontal bar */}
            <div className="flex gap-2 border-b border-[#23324C]/45 pb-2 overflow-x-auto scrollbar-none text-[10px] uppercase font-black tracking-wider text-slate-400">
              {['Overview', 'Timeline', 'Contacts', 'Meetings', 'Calls', 'Emails', 'Tasks', 'Notes', 'Documents', 'Demos', 'Trial', 'Proposals', 'Audits'].map(t => (
                <button
                  key={t}
                  onClick={() => setDrawerActiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    drawerActiveTab === t ? 'bg-brand-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
              
              {drawerActiveTab === 'Overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs bg-[#111827]/45 border border-[#23324C]/50 rounded-xl p-3.5">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Primary Evaluator</span>
                      <strong className="text-slate-200 block mt-1">{selectedLead.name}</strong>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{selectedLead.email}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{selectedLead.phone}</span>
                      
                      {/* Rep assignment dropdown inside Drawer */}
                      <div className="mt-3 flex items-center gap-1 bg-slate-900 border border-[#23324C]/60 rounded-xl px-2 py-1 w-max">
                        <User className="h-3 w-3 text-brand-400" />
                        <span className="text-[8px] text-slate-400 font-bold">Rep:</span>
                        <select
                          value={selectedLead.rep}
                          onChange={(e) => {
                            crmRepository.assignRep(selectedLead.id, e.target.value);
                            crmActivityEngine.logMutation(
                              selectedLead.id,
                              permissionRole,
                              'Representative Assigned',
                              `Lead assigned to representative: ${e.target.value}`,
                              selectedLead.rep,
                              e.target.value
                            );
                            setSelectedLead(crmRepository.getLeadById(selectedLead.id));
                            triggerToast(`Re-assigned representative to ${e.target.value}`);
                          }}
                          className="bg-transparent text-slate-200 text-[9px] font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Alex Wright" className="bg-[#161F30]">Alex Wright</option>
                          <option value="Sarah K." className="bg-[#161F30]">Sarah K.</option>
                          <option value="Michael Scott" className="bg-[#161F30]">Michael Scott</option>
                          <option value="Jan Levinson" className="bg-[#161F30]">Jan Levinson</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Estimated Contract Value</span>
                      <strong className="text-brand-400 text-sm block mt-1">${selectedLead.revenue.toLocaleString()} <span className="text-[9px] text-slate-450">/ mo</span></strong>
                      <span className="text-[9px] text-slate-450 block mt-1">Niche: {selectedLead.niche}</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">Fleet Size: {selectedLead.fleetSize} Trucks</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-[#23324C]/45 rounded-xl p-3 space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Sales Aging Parameters</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-450 block">Days in Current Stage:</span>
                        <strong className="text-slate-200">{selectedLead.stageDays} Days</strong>
                      </div>
                      <div>
                        <span className="text-slate-450 block">Last Contact:</span>
                        <strong className="text-slate-200">{selectedLead.lastContact}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Client pain point details</span>
                    <p className="p-3 bg-slate-900/60 border border-[#23324C]/45 rounded-xl text-slate-300 italic leading-relaxed">
                      "{selectedLead.painPoints}"
                    </p>
                  </div>

                  <div className="border-t border-[#23324C]/45 pt-3 space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Lead Direct Actions</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(selectedLead);
                          setRecommendPlanModalOpen(true);
                        }}
                        className="bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-xl cursor-pointer"
                      >
                        Recommend Plan
                      </button>
                      <button
                        onClick={() => {
                          crmWorkflowEngine.handleStageChange(selectedLead.id, 'Won', 'Marked won from drawer actions', permissionRole);
                          triggerToast(`Marked ${selectedLead.company} as Won!`);
                          setSelectedLead(crmRepository.getLeadById(selectedLead.id));
                        }}
                        className="bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-xl cursor-pointer"
                      >
                        Mark Won
                      </button>
                      <button
                        onClick={() => {
                          crmWorkflowEngine.handleStageChange(selectedLead.id, 'Lost', 'Marked lost from drawer actions', permissionRole);
                          triggerToast(`Marked ${selectedLead.company} as Lost.`, 'warning');
                          setSelectedLead(crmRepository.getLeadById(selectedLead.id));
                        }}
                        className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-[10px] font-bold px-2.5 py-1 rounded-xl cursor-pointer"
                      >
                        Mark Lost
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(selectedLead);
                          setFollowupForm({
                            type: 'Call',
                            priority: 'Medium',
                            dueDate: selectedLead.nextFollowup || new Date().toISOString().split('T')[0],
                            dueTime: '10:00 AM',
                            notes: 'Follow-up touchpoint check-in.'
                          });
                          setFollowupModalOpen(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-[#23324C] text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-xl cursor-pointer"
                      >
                        Schedule Follow-Up
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Timeline' && (
                <div className="space-y-3.5 pr-1">
                  {selectedLead.timeline.map((t, idx) => (
                    <div key={idx} className="flex gap-3 text-left">
                      <div className="mt-1 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-200">{t.event}</strong>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded font-mono">{t.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-normal">{t.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerActiveTab === 'Contacts' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Multiple Contacts List</span>
                    <button 
                      onClick={() => {
                        setSelectedContact(null);
                        setContactForm({ name: '', role: 'Operations Manager', email: '', phone: '', isPrimary: false });
                        setContactModalOpen(true);
                      }}
                      className="text-brand-400 hover:text-brand-300 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      + Add contact person
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(selectedLead.contacts || []).map(c => (
                      <div key={c.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-white font-bold">{c.name}</strong>
                            <span className="text-[9px] bg-slate-900 text-slate-450 border border-[#23324C]/60 px-1 py-0.2 rounded font-mono">{c.role}</span>
                            {c.isPrimary && <span className="bg-brand-500/10 text-brand-400 text-[8px] font-bold px-1 rounded">Primary</span>}
                          </div>
                          <span className="text-[10px] text-slate-455 block mt-0.5">{c.email} • {c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedLead(selectedLead);
                              setCallForm({ duration: '2m', outcome: 'Connected', notes: `Call with ${c.name} regarding roster changes.` });
                              setCallModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                            title="Call Contact"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedLead(selectedLead);
                              setEmailModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                            title="Email Contact"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedContact(c);
                              setContactForm({ name: c.name, role: c.role, email: c.email, phone: c.phone, isPrimary: c.isPrimary });
                              setContactModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Meetings' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Scheduled Zoom Demos & Calls</span>
                    <button onClick={() => handleOpenDemoModal(selectedLead)} className="text-brand-400 hover:text-brand-300 font-bold text-[10px] uppercase cursor-pointer">
                      + Schedule Meeting
                    </button>
                  </div>
                  <div className="space-y-2">
                    {crmDb.demos.filter(d => d.leadId === selectedLead.id).map(d => (
                      <div key={d.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/65 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-white block">{d.date} at {d.time}</strong>
                          <span className="text-[10px] text-slate-450 block mt-0.5">Presenter: {d.presenter} • Notes: {d.notes}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          d.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'
                        }`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Calls' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Call Logging Ledger</span>
                    <button onClick={() => setCallModalOpen(true)} className="text-brand-400 hover:text-brand-300 font-bold text-[10px] uppercase cursor-pointer">
                      + Log New Call
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(selectedLead.calls || []).map(c => {
                      const isPlaying = playingCallId === c.id;
                      return (
                        <div key={c.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-2">
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <strong className="text-white font-bold block">{c.type} Call - {c.outcome}</strong>
                              <span className="text-[9px] text-slate-450 block mt-0.5">{c.date} at {c.time} • Duration: {c.duration}</span>
                            </div>
                            
                            <button 
                              onClick={() => togglePlayCall(c.id)}
                              className="p-1 text-brand-400 hover:text-brand-300 cursor-pointer flex items-center gap-1.5 text-[9px] uppercase font-bold"
                            >
                              {isPlaying ? 'Pause' : 'Play Record'}
                            </button>
                          </div>
                          
                          {/* Simulated audio waveform */}
                          {isPlaying && (
                            <div className="space-y-2 bg-[#0B0F19] rounded-lg p-2.5 flex items-center gap-2">
                              <div className="flex gap-0.5 flex-1 items-center h-4">
                                {Array.from({ length: 24 }).map((_, waveIdx) => {
                                  const heights = [10, 16, 24, 8, 12, 28, 16, 20, 32, 10, 14, 22, 18, 26, 8, 16, 24, 12, 14, 28, 10, 12, 16, 8];
                                  return (
                                    <div 
                                      key={waveIdx} 
                                      className={`w-1 rounded-full ${
                                        waveIdx * 4 <= playProgress ? 'bg-brand-500 animate-pulse' : 'bg-slate-700'
                                      }`}
                                      style={{ height: `${heights[waveIdx % heights.length]}px` }}
                                    />
                                  );
                                })}
                              </div>
                              <span className="font-mono text-[8px] text-slate-400">00:0{Math.floor(playProgress / 20)} / 00:05</span>
                            </div>
                          )}

                          <p className="text-[10px] text-slate-400 italic">"{c.notes}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Emails' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Email Conversational Log</span>
                    <button onClick={() => setEmailModalOpen(true)} className="text-brand-400 hover:text-brand-300 font-bold text-[10px] uppercase cursor-pointer">
                      + Compose Email
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(selectedLead.emails || []).map(em => (
                      <div key={em.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-1">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <strong className="text-white block">{em.subject}</strong>
                            <span className="text-[9px] text-slate-450 block mt-0.5">{em.date} at {em.time}</span>
                          </div>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold uppercase">{em.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-sans pt-1 border-t border-[#23324C]/30 whitespace-pre-wrap">{em.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Tasks' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Assigned Tasks checklist</span>
                    <button onClick={() => setTaskModalOpen(true)} className="text-brand-400 hover:text-brand-300 font-bold text-[10px] uppercase cursor-pointer">
                      + Create Task
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(selectedLead.tasks || []).map(tk => (
                      <div 
                        key={tk.id} 
                        onClick={() => handleToggleTaskStatus(tk.id)}
                        className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-500/25 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <button className="text-slate-500">
                            {tk.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Square className="h-5 w-5 text-slate-650" />}
                          </button>
                          <div>
                            <span className={`font-semibold ${tk.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{tk.title}</span>
                            <span className="text-[9px] text-slate-450 block mt-0.5">Due: {tk.dueDate} • Type: {tk.type}</span>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          tk.priority === 'High' ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-slate-800 text-slate-400'
                        }`}>{tk.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Notes' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block">Lead Internal Notes</span>
                  <div className="space-y-2">
                    {(selectedLead.notes || []).map(n => (
                      <div key={n.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-1">
                        <p className="text-slate-300 leading-normal font-sans text-xs">"{n.text}"</p>
                        <span className="text-[9px] text-slate-450 block text-right font-mono font-bold">- {n.author} on {n.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Documents' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block">Lead Attachments</span>
                  <div className="space-y-2">
                    {(selectedLead.documents || []).map(doc => (
                      <div key={doc.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/65 rounded-xl flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-brand-400" />
                          <div>
                            <strong className="text-white font-bold block">{doc.name}</strong>
                            <span className="text-[9px] text-slate-450 block font-mono">Format: PDF • Size: {doc.size}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handlePreviewDocument(doc)} className="text-brand-400 hover:text-brand-300 font-bold text-[9px] uppercase cursor-pointer">Preview</button>
                          <button onClick={() => handleReplaceDocument(doc.id)} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase cursor-pointer">Replace</button>
                          <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-400/80 hover:text-red-400 font-bold text-[9px] uppercase cursor-pointer">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Demos' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block">Scheduled presentation history</span>
                  <div className="space-y-2">
                    {crmDb.demos.filter(d => d.leadId === selectedLead.id).map(d => (
                      <div key={d.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/65 rounded-xl flex justify-between items-center">
                        <div>
                          <strong className="text-white text-xs block">{d.date} at {d.time}</strong>
                          <span className="text-[9px] text-slate-450 block mt-0.5">Presenter: {d.presenter} • Zoom meeting link setup</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                          d.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'
                        }`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Trial' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block">SaaS Trial Sandbox Usage logs</span>
                  {crmDb.trials.find(t => t.leadId === selectedLead.id) ? (
                    (() => {
                      const t = crmDb.trials.find(tr => tr.leadId === selectedLead.id);
                      return (
                        <div className="p-3 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">Expiration:</span>
                            <strong className="text-white">{t.daysRemaining} Days left (Expires {t.expiryDate})</strong>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Storage Utilization</span>
                              <span>{t.storage} ({t.usage}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1">
                              <div className="bg-brand-500 h-full rounded-full" style={{ width: `${t.usage}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-10 text-slate-500 italic">No sandbox workspace registered for this lead.</div>
                  )}
                </div>
              )}

              {drawerActiveTab === 'Proposals' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block">Issued Licensing Proposals & Versions</span>
                  <div className="space-y-2">
                    {crmDb.proposals.filter(p => p.leadId === selectedLead.id).map(p => (
                      <div key={p.id} className="p-3 bg-[#111827]/40 border border-[#23324C]/65 rounded-xl space-y-3">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <strong className="text-white font-extrabold block">{p.title}</strong>
                            <span className="text-[9px] text-slate-450 block mt-0.5">Total proposed: ${p.total.toLocaleString()}/mo • Validity: {p.validity}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            p.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'
                          }`}>{p.status}</span>
                        </div>

                        {/* Versions checklist */}
                        {p.versionsList && (
                          <div className="space-y-1.5 border-t border-[#23324C]/35 pt-2 text-[9px] text-slate-450 font-bold">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">Proposal History Versions</span>
                            {p.versionsList.map((ver, vIdx) => (
                              <div key={vIdx} className="flex justify-between items-center p-1 bg-slate-900/60 rounded border border-[#23324C]/30">
                                <span>Version {ver.version} - Value: ${ver.total.toLocaleString()}/mo ({ver.date})</span>
                                <span className={`text-[7px] font-mono px-1 rounded ${
                                  ver.status === 'Accepted' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                }`}>{ver.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerActiveTab === 'Audits' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block">Row Modification Audit Log</span>
                  <div className="space-y-2">
                    {(selectedLead.auditLogs || []).map((audit, idx) => (
                      <div key={idx} className="p-2.5 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl text-[10px] text-slate-400 font-semibold space-y-1">
                        <div className="flex justify-between items-center text-white">
                          <strong>{audit.action}</strong>
                          <span className="font-mono text-[9px] font-normal text-slate-500">{audit.date} at {audit.time}</span>
                        </div>
                        <div className="flex gap-2 font-mono">
                          <span className="text-red-400 text-[9px]">- Old: {audit.oldValue}</span>
                          <span className="text-emerald-400 text-[9px]">+ New: {audit.newValue}</span>
                        </div>
                        <span className="block text-slate-550 text-[9px] text-right font-medium">Logged user: {audit.user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Note logging bar */}
            <div className="border-t border-[#23324C]/60 pt-3 flex gap-2">
              <input 
                type="text" 
                placeholder="Log activity details inside timeline..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const text = e.target.value;
                    crmRepository.addNote(selectedLead.id, text, permissionRole);
                    crmActivityEngine.logMutation(
                      selectedLead.id,
                      permissionRole,
                      'Activity Logged',
                      `Note: ${text}`,
                      'None',
                      'Updated'
                    );
                    const leadNewObj = crmRepository.getLeadById(selectedLead.id);
                    setSelectedLead(leadNewObj);
                    e.target.value = '';
                    triggerToast('Added activity note.');
                  }
                }}
                className="flex-grow bg-[#0B0F19]/50 border border-[#23324C] text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 border-t border-[#23324C]/50 pt-3">
              {selectedLead.stage === 'Won' && (
                <button 
                  onClick={() => {
                    setConversionWizardOpen(true);
                    setInspectDrawerOpen(false);
                  }}
                  className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black py-2 rounded-lg cursor-pointer"
                >
                  Convert to Company Account
                </button>
              )}
              <button onClick={() => setInspectDrawerOpen(false)} className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2 rounded-lg cursor-pointer">Close</button>
            </div>

          </div>
        )}
      </Drawer>

      {/* 15. CRM Notification Center Drawer */}
      <Drawer isOpen={crmNotificationsOpen} onClose={() => setCrmNotificationsOpen(false)} title="CRM Real-Time Activity Log">
        <div className="space-y-4 text-left text-slate-300 text-xs h-full flex flex-col justify-between">
          <div className="space-y-4 flex-grow overflow-y-auto pr-2 scrollbar-none">
            <div className="flex justify-between items-center border-b border-[#23324C]/60 pb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Touchpoint Actions & System Triggers</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    crmStore.updateDb(db => {
                      (db.crmNotifications || []).forEach(n => n.isRead = true);
                    });
                    triggerToast('All notifications marked as read.');
                  }}
                  className="text-brand-400 hover:text-brand-350 text-[9px] font-black uppercase cursor-pointer"
                >
                  Mark All Read
                </button>
                <span className="text-[#23324C]">|</span>
                <button
                  onClick={() => {
                    crmStore.updateDb(db => {
                      db.crmNotifications = [];
                    });
                    triggerToast('Notification feed cleared.');
                  }}
                  className="text-red-400 hover:text-red-350 text-[9px] font-black uppercase cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-none">
              {(crmDb.crmNotifications || []).map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => {
                    crmStore.updateDb(db => {
                      const n = (db.crmNotifications || []).find(x => x.id === notif.id);
                      if (n) n.isRead = true;
                    });
                    if (notif.leadId) {
                      const lead = crmDb.leads.find(l => String(l.id) === String(notif.leadId));
                      if (lead) {
                        setSelectedLead(lead);
                        setInspectDrawerOpen(true);
                        setDrawerActiveTab('Overview');
                        setCrmNotificationsOpen(false);
                      }
                    }
                  }}
                  className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all duration-200 ${
                    notif.isRead 
                      ? 'bg-[#111827]/30 border-[#23324C]/40 hover:bg-[#111827]/50' 
                      : 'bg-brand-500/5 border-brand-500/35 hover:bg-brand-500/10'
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${notif.isRead ? 'bg-slate-700' : 'bg-brand-500 animate-pulse'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] bg-slate-900 border border-[#23324C]/40 px-1 rounded text-slate-400 font-mono">{notif.time || 'Just now'}</span>
                      {!notif.isRead && <span className="text-[8px] bg-brand-500 text-slate-950 font-black px-1.5 rounded uppercase tracking-wider">New</span>}
                    </div>
                    <p className="text-white text-xs font-semibold mt-1">{notif.message}</p>
                    <span className="text-[8px] text-slate-500 block mt-1 font-mono uppercase tracking-widest">{notif.type}</span>
                  </div>
                </div>
              ))}
              {(crmDb.crmNotifications || []).length === 0 && (
                <div className="text-center py-20 text-slate-500 italic">No activity notifications registered yet.</div>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* 16. Recommend Plan Modal */}
      <Modal isOpen={recommendPlanModalOpen} onClose={() => setRecommendPlanModalOpen(false)} title="Interactive License Tier Recommendation">
        {selectedLead && (
          <div className="space-y-6 text-left text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lead Diagnosis</span>
              <h4 className="text-white font-extrabold text-sm mt-1">{selectedLead.company}</h4>
              <p className="text-slate-400 mt-1">Fleet Size: <strong>{selectedLead.fleetSize} Trucks</strong> • Current Software: <strong>{selectedLead.currentSoftware}</strong></p>
            </div>

            <div className="space-y-3.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available License Plan Tiers</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    tier: 'Starter',
                    price: 199,
                    desc: 'For small operators < 35 trucks',
                    checks: ['Core Dispatching', 'Basic Driver App', 'GPS Tracking (hourly)', 'Email Support'],
                    isRec: selectedLead.fleetSize < 35
                  },
                  {
                    tier: 'Professional',
                    price: 499,
                    desc: 'For growing fleets 35 - 100 trucks',
                    checks: ['Dynamic Dispatching', 'Factor Integration APIs', 'GPS Tracking (live HMR)', 'Priority Support'],
                    isRec: selectedLead.fleetSize >= 35 && selectedLead.fleetSize <= 100
                  },
                  {
                    tier: 'Enterprise',
                    price: 1299,
                    desc: 'For logistics giants > 100 trucks',
                    checks: ['AI CommandCenter Router', 'Custom Billing Rules', 'Unlimited Drivers/HQ Nodes', 'Dedicated SLA Custom Support'],
                    isRec: selectedLead.fleetSize > 100
                  }
                ].map(plan => (
                  <div 
                    key={plan.tier}
                    className={`p-4 border rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                      plan.isRec 
                        ? 'bg-brand-500/5 border-brand-500 shadow-lg shadow-brand-500/5 scale-102 ring-1 ring-brand-500/30' 
                        : 'bg-slate-900 border-[#23324C] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <strong className="text-white text-sm block font-extrabold">{plan.tier}</strong>
                        {plan.isRec && (
                          <span className="bg-brand-500 text-slate-950 text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">Recommended</span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10px] block mt-1">{plan.desc}</span>
                      <div className="my-3 text-white">
                        <span className="text-base font-black">${plan.price}</span>
                        <span className="text-[10px] text-slate-500 font-bold">/mo</span>
                      </div>
                      <ul className="space-y-1.5 text-[9px] text-slate-400 font-semibold border-t border-[#23324C]/40 pt-2.5">
                        {plan.checks.map((c, cIdx) => (
                          <li key={cIdx} className="flex items-center gap-1.5">
                            <Check className="h-2.5 w-2.5 text-brand-400" />
                            <span className="truncate">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        crmRepository.updateLead(selectedLead.id, {
                          revenue: plan.price
                        });
                        crmActivityEngine.logMutation(
                          selectedLead.id,
                          permissionRole,
                          'Plan Recommended',
                          `Selected plan: ${plan.tier} ($${plan.price}/mo) recommended for fleet size ${selectedLead.fleetSize}.`,
                          selectedLead.revenue,
                          plan.price
                        );
                        setSelectedLead(crmRepository.getLeadById(selectedLead.id));
                        setRecommendPlanModalOpen(false);
                        triggerToast(`Recommended ${plan.tier} Plan applied to ${selectedLead.company}!`);
                      }}
                      className={`w-full mt-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                        plan.isRec 
                          ? 'bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-md shadow-brand-500/10' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      Apply {plan.tier} Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 17. Schedule Follow-Up Modal */}
      <Modal isOpen={followupModalOpen} onClose={() => setFollowupModalOpen(false)} title="Schedule Follow-Up Touchpoint">
        {selectedLead && (
          <form onSubmit={handleCreateFollowup} className="space-y-4 text-left text-xs">
            <p className="text-slate-400">Scheduling a follow-up action for prospect <strong>{selectedLead.company}</strong>.</p>
            
            <div className="grid grid-cols-2 gap-3">
              <SelectInput 
                label="Follow-Up Action Type" 
                value={followupForm.type} 
                onChange={(e) => setFollowupForm({ ...followupForm, type: e.target.value })}
                options={[
                  { value: 'Call', label: '📞 Phone Call' },
                  { value: 'Email', label: '✉️ Email Outreach' },
                  { value: 'Meeting', label: '🤝 In-Person / Zoom Meeting' },
                  { value: 'Demo', label: '🎥 Product Demo' },
                  { value: 'Contract Check', label: '📄 Proposal Review' }
                ]}
              />
              <SelectInput 
                label="Priority Tier" 
                value={followupForm.priority} 
                onChange={(e) => setFollowupForm({ ...followupForm, priority: e.target.value })}
                options={[
                  { value: 'Low', label: '🟢 Low' },
                  { value: 'Medium', label: '🟡 Medium' },
                  { value: 'High', label: '🔴 High' }
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DatePicker 
                label="Target Date" 
                value={followupForm.dueDate} 
                onChange={(e) => setFollowupForm({ ...followupForm, dueDate: e.target.value })} 
              />
              <TextInput 
                label="Time Slot" 
                placeholder="e.g. 10:30 AM" 
                value={followupForm.dueTime} 
                onChange={(e) => setFollowupForm({ ...followupForm, dueTime: e.target.value })} 
              />
            </div>

            <TextInput 
              label="Follow-Up Memo / Action Notes" 
              required
              placeholder="e.g. Discuss custom flatbed lane volume integration..." 
              value={followupForm.notes} 
              onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })} 
            />

            <Button type="submit" variant="primary" className="w-full">
              Schedule Follow-Up Task
            </Button>
          </form>
        )}
      </Modal>

      {/* 18. Onboarding Task Modal */}
      <Modal isOpen={onboardingTaskModalOpen} onClose={() => setOnboardingTaskModalOpen(false)} title="Create Onboarding Task">
        {selectedOnboarding && (
          <form onSubmit={handleCreateOnboardingTask} className="space-y-4 text-left text-xs">
            <p className="text-slate-400">Add a custom task to the onboarding checklist for <strong>{selectedOnboarding.company}</strong>.</p>
            
            <TextInput 
              label="Task Name" 
              required
              placeholder="e.g. Set up custom factoring rules" 
              value={onboardingTaskForm.name} 
              onChange={(e) => setOnboardingTaskForm({ name: e.target.value })} 
            />

            <Button type="submit" variant="primary" className="w-full">
              Add Onboarding Task
            </Button>
          </form>
        )}
      </Modal>

      {/* 19. Onboarding Handover Modal */}
      <Modal isOpen={onboardingHandoverModalOpen} onClose={() => setOnboardingHandoverModalOpen(false)} title="Onboarding Handover package dispatch">
        {selectedOnboarding && (
          <form onSubmit={handleSendOnboardingHandover} className="space-y-4 text-left text-xs">
            <p className="text-slate-400">Dispatch legal details and setup parameters to the logistics operations desk for <strong>{selectedOnboarding.company}</strong>.</p>
            
            <SelectInput 
              label="Target Representative" 
              value={onboardingHandoverForm.repName} 
              onChange={(e) => setOnboardingHandoverForm({ ...onboardingHandoverForm, repName: e.target.value })}
              options={[
                { value: 'Alex Wright', label: 'Alex Wright (Inside Sales)' },
                { value: 'Sarah K.', label: 'Sarah K. (Account Management)' },
                { value: 'Michael Scott', label: 'Michael Scott (Regional Coordinator)' },
                { value: 'Jan Levinson', label: 'Jan Levinson (Operations Lead)' }
              ]}
            />

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Handover Notes / Instructions</label>
              <textarea 
                rows={4} 
                required
                placeholder="Provide billing integration info, special customer SLA rules..." 
                value={onboardingHandoverForm.notes} 
                onChange={(e) => setOnboardingHandoverForm({ ...onboardingHandoverForm, notes: e.target.value })}
                className="w-full bg-[#0B0F19]/50 border border-[#23324C] text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Confirm & Dispatch Handover Package
            </Button>
          </form>
        )}
      </Modal>

    </div>
  );
}
