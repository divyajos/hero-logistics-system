import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTenants, 
  provisionTenant,
  suspendCompanyRedux,
  reactivateCompanyRedux,
  editCompanyRedux,
  deleteCompanyRedux,
  bulkUpdateRedux,
  bulkDeleteRedux,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
  cancelSubscription,
  assignPlan,
  generateInvoice,
  sendReminder,
  updateSubscriptionSettings,
  fetchSupportTickets,
  replySupportTicket,
  fetchAuditLogs,
  createAuditLog
} from '../../store/slices/companySlice';
import companyService from '../../services/companyService';
import MembershipPlans from './MembershipPlans';
import FeatureAccess from './FeatureAccess';
import WhiteLabelManagement from './WhiteLabelManagement';
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
  AlertCircle, MessageSquare, Bell, Lock, Key, Database, Clock,
  TrendingUp, Zap, Server, Globe, Mail, Copy, RotateCcw, Download,
  ArrowRight, ChevronDown, ChevronUp, Eye, BarChart2, Settings2,
  ShieldCheck
} from 'lucide-react';

import {
  ResponsiveContainer, AreaChart, Area,
  BarChart as RechartBar, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function SuperAdminDashboard({ activeTab = 'overview', setActiveTab }) {
  const dispatch = useDispatch();
  const { tenants, platformLoad, slaTarget, tickets, auditLogs, loading } = useSelector((state) => state.company);

  const validatePlanLimits = (tenant) => {
    if (!tenant) return [];
    const plan = tenant.plan;
    const users = tenant.users || 0;
    const drivers = tenant.drivers || 0;
    const vehicles = tenant.vehicles || 0;
    
    const violations = [];
    if (plan === 'Starter') {
      if (users > 3) violations.push(`Users (${users}/3)`);
      if (drivers > 5) violations.push(`Drivers (${drivers}/5)`);
      if (vehicles > 5) violations.push(`Vehicles (${vehicles}/5)`);
    } else if (plan === 'Professional') {
      if (users > 15) violations.push(`Users (${users}/15)`);
      if (drivers > 30) violations.push(`Drivers (${drivers}/30)`);
      if (vehicles > 30) violations.push(`Vehicles (${vehicles}/30)`);
    }
    return violations;
  };

  // Dynamic calculated metrics for dashboard
  const calculatedMrrVal = tenants
    .filter(t => t.status === 'Active')
    .reduce((acc, t) => {
      const planRate = t.plan === 'Starter' ? 199 : (t.plan === 'Professional' ? 499 : 1299);
      return acc + (t.revenue !== undefined ? t.revenue : planRate);
    }, 0);
  const calculatedArrVal = calculatedMrrVal * 12;
  const formattedMrr = `$${calculatedMrrVal.toLocaleString()}`;
  const formattedArr = `$${calculatedArrVal.toLocaleString()}`;

  const calculateMonthlyRevenueTrend = () => {
    const months = ['01', '02', '03', '04', '05', '06'];
    const revenueByMonth = [0, 0, 0, 0, 0, 0];
    
    tenants.forEach(tenant => {
      if (tenant.invoices) {
        tenant.invoices.forEach(invoice => {
          if (invoice.status === 'Paid') {
            const dateStr = invoice.date;
            if (dateStr) {
              const monthPart = dateStr.includes('/') ? dateStr.split('/')[0] : dateStr.split('-')[1];
              const index = months.indexOf(monthPart);
              if (index !== -1) {
                revenueByMonth[index] += invoice.amount || 0;
              }
            }
          }
        });
      }
    });
    return revenueByMonth;
  };

  const calculateStorageUsage = () => {
    let totalGb = 0;
    tenants.forEach(t => {
      const users = t.users || 0;
      const drivers = t.drivers || 0;
      const vehicles = t.vehicles || 0;
      const branches = t.branches || 0;
      totalGb += (users * 5) + (drivers * 10) + (vehicles * 15) + (branches * 20);
    });
    return totalGb / 1000;
  };

  const monthlyRevenueTrend = calculateMonthlyRevenueTrend();
  const annualProjectionTrend = monthlyRevenueTrend.map(val => val * 12);
  const calculatedStorage = calculateStorageUsage();

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

  const [ticketReply, setTicketReply] = useState('');

  // White label config states
  const [brandName, setBrandName] = useState('HERO LOGISTICS');
  const [brandColor, setBrandColor] = useState('#0ea5e9');
  const [isWhiteLabelSaved, setIsWhiteLabelSaved] = useState(false);

  // Selected Company Details Tabs
  const [companyDetailsTab, setCompanyDetailsTab] = useState('overview');
  // selected IDs for bulk actions
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [selectedSubIds, setSelectedSubIds] = useState([]);
  // advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    plan: '',
    status: '',
    revenueRange: '',
    companySize: '',
    trialStatus: '',
    country: '',
    lastLogin: '',
    dateCreated: ''
  });

  // active actions dropdown Row ID
  const [activeActionsRowId, setActiveActionsRowId] = useState(null);
  
  // Modals for Change Sub, Manage Features, Send Notification
  const [changeSubModalOpen, setChangeSubModalOpen] = useState(false);
  const [manageFeaturesModalOpen, setManageFeaturesModalOpen] = useState(false);
  const [sendNotificationModalOpen, setSendNotificationModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [newSubPlan, setNewSubPlan] = useState('Professional');
  const [tempCompany, setTempCompany] = useState(null);

  // Modals for Platform Actions Quick Panel
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [loginAsModalOpen, setLoginAsModalOpen] = useState(false);
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [changeSubGeneralModalOpen, setChangeSubGeneralModalOpen] = useState(false);
  const [enableFeatureModalOpen, setEnableFeatureModalOpen] = useState(false);
  const [disableFeatureModalOpen, setDisableFeatureModalOpen] = useState(false);
  const [whiteLabelModalOpen, setWhiteLabelModalOpen] = useState(false);
  const [exportReportModalOpen, setExportReportModalOpen] = useState(false);

  // States for the new Modals
  const [selectedCompanyIdToSuspend, setSelectedCompanyIdToSuspend] = useState('');
  const [selectedCompanyIdToReactivate, setSelectedCompanyIdToReactivate] = useState('');
  const [selectedCompanyIdToLoginAs, setSelectedCompanyIdToLoginAs] = useState('');
  const [selectedCompanyIdToChangeSub, setSelectedCompanyIdToChangeSub] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanLimit, setNewPlanLimit] = useState('');
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState('Starter');
  const [editPlanPrice, setEditPlanPrice] = useState('199');
  const [editPlanLimit, setEditPlanLimit] = useState('5');
  const [selectedFeatureToEnable, setSelectedFeatureToEnable] = useState('overview');
  const [selectedFeatureToDisable, setSelectedFeatureToDisable] = useState('overview');
  const [featureTierToEnable, setFeatureTierToEnable] = useState('start');
  const [featureTierToDisable, setFeatureTierToDisable] = useState('start');
  const [reportType, setReportType] = useState('Global Platform');
  const [reportFormat, setReportFormat] = useState('PDF');

  // ---- NEW: Support Tickets Filters ----
  const [supportPriorityFilter, setSupportPriorityFilter] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState('');

  // ---- NEW: Billing Sub-Tab ----
  const [billingSubTab, setBillingSubTab] = useState('Invoices');

  // ---- NEW: Settings Sub-Tab ----
  const [settingsSubTab, setSettingsSubTab] = useState('general');

  // ---- NEW: AI Feature Toggles ----
  const [aiFeatureToggles, setAiFeatureToggles] = useState(() => {
    const saved = localStorage.getItem('hero_ai_toggles');
    if (saved) try { return JSON.parse(saved); } catch(e) {}
    return {
      'Load Parse AI': true,
      'Receipt Scan OCR': true,
      'Odometer Detection': true,
      'Smart Dispatch': false,
      'ETA Prediction': true,
      'Chat Assistant': false
    };
  });
  const [aiLimits, setAiLimits] = useState({ loadParse: '85', ocrScan: '90', odometer: '95', dailyCalls: '1000' });

  // ---- NEW: SMTP / Notification / Security Settings ----
  const [smtpSettings, setSmtpSettings] = useState({ host: 'smtp.mailgun.org', port: '587', username: 'platform@hero-logistics.com', fromName: 'Hero Logistics Platform', fromEmail: 'noreply@hero-logistics.com' });
  const [notifToggles, setNotifToggles] = useState({ failedPayment: true, trialExpiry: true, renewalReminder: true, highLoad: false, slaAlert: true, securityAlert: true, platformError: false });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  // ---- NEW: API Keys Management ----
  const [apiKeysList, setApiKeysList] = useState(() => {
    const saved = localStorage.getItem('hero_api_keys');
    if (saved) try { return JSON.parse(saved); } catch(e) {}
    return [
      { id: 1, name: 'Production API Key', key: 'hlk_prod_xK9m...', created: '2026-01-15', lastUsed: '2026-06-26', status: 'Active' },
      { id: 2, name: 'Staging API Key', key: 'hlk_stg_pQ4n...', created: '2026-03-01', lastUsed: '2026-06-20', status: 'Active' },
      { id: 3, name: 'Webhook Integration', key: 'hlk_wh_rT8k...', created: '2026-04-10', lastUsed: '2026-06-25', status: 'Active' }
    ];
  });

  // ---- NEW: Transfers ----
  const [transferExpandedId, setTransferExpandedId] = useState(null);
  const [transferStatusFilter, setTransferStatusFilter] = useState('');
  const [transferSearchQuery, setTransferSearchQuery] = useState('');

  // ---- NEW: Audit Logs Filters ----
  const [auditLogsActionFilter, setAuditLogsActionFilter] = useState('');
  const [auditLogsDateFilter, setAuditLogsDateFilter] = useState('');

  // Subscriptions Tab Specific States
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [subIdSearchQuery, setSubIdSearchQuery] = useState('');
  const [subPlanFilter, setSubPlanFilter] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('');
  const [subSortField, setSubSortField] = useState('name');
  const [subSortOrder, setSubSortOrder] = useState('asc');
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const subItemsPerPage = 5;

  // Custom Invoice Modal States
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoicePeriod, setInvoicePeriod] = useState('');

  // Subscription Edit Modal States
  const [editSubModalOpen, setEditSubModalOpen] = useState(false);
  const [editSubRenewalDate, setEditSubRenewalDate] = useState('');
  const [editSubAutoRenewal, setEditSubAutoRenewal] = useState(true);

  // ---- Mock Transfers Data ----
  const mockTransfers = [
    { id: 'TRF-501', from: 'Swift Cargo Express', to: 'Global Shipping Co.', item: 'Tesla Model 3 — VIN-901', status: 'Completed', date: '2026-06-20', requestedBy: 'admin@swift.com', chain: ['Swift Cargo Express', 'Transfer Hub Alpha', 'Global Shipping Co.'] },
    { id: 'TRF-502', from: 'Apex Logistics', to: 'Vance Transport Ltd.', item: 'General Freight Pallets × 24', status: 'Transit', date: '2026-06-22', requestedBy: 'ops@apex.com', chain: ['Apex Logistics', 'Vance Transport Ltd.'] },
    { id: 'TRF-503', from: 'Blue Ocean Freight', to: 'Mountain Peak Carriers', item: 'Reefer Container — 40FT', status: 'Pending', date: '2026-06-25', requestedBy: 'dispatch@blueocean.com', chain: ['Blue Ocean Freight', 'Mountain Peak Carriers'] },
    { id: 'TRF-504', from: 'Prime Delivery Services', to: 'FastTrack Networks', item: 'Hazmat Class B Drums × 8', status: 'Rejected', date: '2026-06-18', requestedBy: 'safety@prime.com', chain: ['Prime Delivery Services', 'FastTrack Networks'] }
  ];

  const activeCompany = selectedCompany ? (tenants.find(t => t.id === selectedCompany.id) || selectedCompany) : null;

  // Subscription Action Handlers
  const handlePauseSubscription = async (id, name) => {
    try {
      await dispatch(pauseSubscription(id)).unwrap();
      logAuditAction('Pause', `Subscription paused by platform administrator.`, id, name);
      triggerToast(`Paused subscription for ${name}`, 'warning');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to pause subscription', 'error');
    }
  };

  const handleResumeSubscription = async (id, name) => {
    try {
      await dispatch(resumeSubscription(id)).unwrap();
      logAuditAction('Resume', `Subscription reactivated successfully.`, id, name);
      triggerToast(`Resumed subscription for ${name}`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to resume subscription', 'error');
    }
  };

  const handleCancelSubscription = async (id, name) => {
    try {
      await dispatch(cancelSubscription(id)).unwrap();
      logAuditAction('Cancel', `Subscription cancellation scheduled. Auto-renew disabled.`, id, name);
      triggerToast(`Cancelled auto-renewal for ${name}`, 'info');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to cancel subscription', 'error');
    }
  };

  const handleRenewSubscription = async (id, name) => {
    try {
      await dispatch(renewSubscription(id)).unwrap();
      logAuditAction('Renew', `Subscription manually extended.`, id, name);
      triggerToast(`Renewed subscription for ${name}`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to renew subscription', 'error');
    }
  };

  const handleAssignPlan = async (id, plan, name) => {
    try {
      await dispatch(assignPlan({ id, plan })).unwrap();
      logAuditAction('Plan Changed', `Subscription plan reallocated to ${plan}.`, id, name);
      triggerToast(`Assigned ${plan} plan to ${name}`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to assign plan', 'error');
    }
  };

  const handleUpgradeSubscription = async (id, currentPlan, name) => {
    const nextPlan = currentPlan === 'Starter' ? 'Professional' : 'Enterprise';
    if (currentPlan === 'Enterprise') {
      triggerToast('Already on the highest Enterprise plan.', 'warning');
      return;
    }
    await handleAssignPlan(id, nextPlan, name);
  };

  const handleDowngradeSubscription = async (id, currentPlan, name) => {
    const prevPlan = currentPlan === 'Enterprise' ? 'Professional' : 'Starter';
    if (currentPlan === 'Starter') {
      triggerToast('Already on the lowest Starter plan.', 'warning');
      return;
    }
    await handleAssignPlan(id, prevPlan, name);
  };

  const handleGenerateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceAmount || !invoicePeriod) {
      triggerToast('Please provide all details.', 'error');
      return;
    }
    try {
      const amountNum = parseFloat(invoiceAmount);
      await dispatch(generateInvoice({ id: tempCompany.id, amount: amountNum, period: invoicePeriod })).unwrap();
      logAuditAction('Invoice Generation', `Generated invoice ${invoicePeriod} for $${amountNum}.`, tempCompany.id, tempCompany.name);
      triggerToast(`Generated invoice of $${amountNum} for ${tempCompany.name}`, 'success');
      setInvoiceModalOpen(false);
      setInvoiceAmount('');
      setInvoicePeriod('');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to generate invoice', 'error');
    }
  };

  const handleSendReminder = async (id, name) => {
    try {
      await dispatch(sendReminder(id)).unwrap();
      logAuditAction('Notification Sent', `Sent renewal invoice reminder notification to account manager.`, id, name);
      triggerToast(`Reminder notification sent to ${name}`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to send reminder', 'error');
    }
  };

  const handleSaveEditSubSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSubscriptionSettings({
        id: tempCompany.id,
        settings: {
          nextRenewalDate: editSubRenewalDate,
          autoRenewal: editSubAutoRenewal
        }
      })).unwrap();
      logAuditAction('Subscription Settings Edited', `Updated renewal date to ${editSubRenewalDate} and auto-renew to ${editSubAutoRenewal}.`, tempCompany.id, tempCompany.name);
      triggerToast(`Saved subscription details for ${tempCompany.name}`);
      setEditSubModalOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to save settings', 'error');
    }
  };

  const logAuditAction = (action, detail, companyId = null, companyName = null) => {
    dispatch(createAuditLog({
      companyId,
      companyName,
      action,
      detail
    }));
  };

  const updateLocalDb = (updater) => {
    try {
      const stored = localStorage.getItem('hero_mock_db');
      if (stored) {
        const db = JSON.parse(stored);
        updater(db);
        localStorage.setItem('hero_mock_db', JSON.stringify(db));
      }
    } catch (e) {
      console.error('Failed to update localStorage DB', e);
    }
  };

  // CRUD actions helper integration
  const handleSuspendCompany = (id, name) => {
    dispatch(suspendCompanyRedux(id));
    updateLocalDb(db => {
      const t = db.tenants.find(x => x.id === id);
      if (t) t.status = 'Hold';
    });
    logAuditAction('Company Suspended', `Suspended ${name}.`, id, name);
    triggerToast(`Suspended company license: ${name}`, 'warning');
  };

  const handleReactivateCompany = (id, name) => {
    dispatch(reactivateCompanyRedux(id));
    updateLocalDb(db => {
      const t = db.tenants.find(x => x.id === id);
      if (t) t.status = 'Active';
    });
    logAuditAction('Company Reactivated', `Reactivated ${name}.`, id, name);
    triggerToast(`Reactivated company license: ${name}`, 'success');
  };

  const handleDeleteCompany = (id, name) => {
    dispatch(deleteCompanyRedux(id));
    updateLocalDb(db => {
      db.tenants = db.tenants.filter(x => x.id !== id);
    });
    logAuditAction('Company Deleted', `Deleted company ${name}.`, id, name);
    triggerToast(`Deleted company tenant: ${name}`, 'danger');
  };

  const handleLoginAs = (id, name) => {
    logAuditAction('Login As Used', `Simulated admin session as ${name}.`, id, name);
    triggerToast(`Simulating login session as ${name}`);
  };

  const handleResetPassword = (id, name) => {
    logAuditAction('Password Reset', `Password reset instruction sent to ${name}.`, id, name);
    triggerToast(`Sent password reset instruction email to administrator of ${name}.`);
  };

  const handleSendNotificationSubmit = (e) => {
    e.preventDefault();
    logAuditAction('Notification Sent', `Broadcasted notice to managers of ${tempCompany?.name}.`, tempCompany?.id, tempCompany?.name);
    triggerToast(`Broadcasted custom notice to managers of ${tempCompany?.name || 'company'}.`);
    setSendNotificationModalOpen(false);
    setNotificationMsg('');
  };

  const handleSendNotification = (company) => {
    setTempCompany(company);
    setSendNotificationModalOpen(true);
  };

  const handleChangeSubscription = (company) => {
    setTempCompany(company);
    setNewSubPlan(company.plan);
    setChangeSubModalOpen(true);
  };

  const handleChangeSubscriptionSubmit = (e) => {
    e.preventDefault();
    dispatch(editCompanyRedux({ id: tempCompany.id, name: tempCompany.name, plan: newSubPlan, email: tempCompany.manager || 'admin@hero.com' }));
    updateLocalDb(db => {
      const t = db.tenants.find(x => x.id === tempCompany.id);
      if (t) t.plan = newSubPlan;
    });
    logAuditAction('Plan Changed', `Changed plan of ${tempCompany.name} to ${newSubPlan}.`, tempCompany.id, tempCompany.name);
    triggerToast(`Changed subscription of ${tempCompany.name} to ${newSubPlan}.`);
    setChangeSubModalOpen(false);
  };

  const handleManageFeatures = (company) => {
    setTempCompany(company);
    setManageFeaturesModalOpen(true);
  };

  const handleManageFeaturesSubmit = (e) => {
    e.preventDefault();
    logAuditAction('Feature Modified', `Configured features custom rule block for ${tempCompany?.name}.`, tempCompany?.id, tempCompany?.name);
    triggerToast(`Custom feature matrix policies successfully written for ${tempCompany?.name}.`);
    setManageFeaturesModalOpen(false);
  };

  const handleViewBilling = (company) => {
    if (setActiveTab) {
      setActiveTab('billing');
      triggerToast(`Showing billing history table for ${company.name}`);
    }
  };

  const handleSuspendCompanySubmit = (e) => {
    e.preventDefault();
    if (!selectedCompanyIdToSuspend) {
      triggerToast('Please select a company to suspend.', 'error');
      return;
    }
    const company = tenants.find(t => t.id === Number(selectedCompanyIdToSuspend));
    if (company) {
      handleSuspendCompany(company.id, company.name);
    }
    setSuspendModalOpen(false);
    setSelectedCompanyIdToSuspend('');
  };

  const handleReactivateCompanySubmit = (e) => {
    e.preventDefault();
    if (!selectedCompanyIdToReactivate) {
      triggerToast('Please select a company to reactivate.', 'error');
      return;
    }
    const company = tenants.find(t => t.id === Number(selectedCompanyIdToReactivate));
    if (company) {
      handleReactivateCompany(company.id, company.name);
    }
    setReactivateModalOpen(false);
    setSelectedCompanyIdToReactivate('');
  };

  const handleLoginAsCompanySubmit = (e) => {
    e.preventDefault();
    if (!selectedCompanyIdToLoginAs) {
      triggerToast('Please select a company workspace to simulate login.', 'error');
      return;
    }
    const company = tenants.find(t => t.id === Number(selectedCompanyIdToLoginAs));
    if (company) {
      handleLoginAs(company.id, company.name);
    }
    setLoginAsModalOpen(false);
    setSelectedCompanyIdToLoginAs('');
  };

  const handleCreatePlanSubmit = (e) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice) {
      triggerToast('Please fill in all plan details.', 'error');
      return;
    }
    triggerToast(`Custom plan "${newPlanName}" created successfully at $${newPlanPrice}/mo!`, 'success');
    logAuditAction('Plan Created', `New plan "${newPlanName}" added with price $${newPlanPrice}/mo.`);
    setCreatePlanModalOpen(false);
    setNewPlanName('');
    setNewPlanPrice('');
    setNewPlanLimit('');
  };

  const handleEditPlanSubmit = (e) => {
    e.preventDefault();
    triggerToast(`Plan "${selectedPlanToEdit}" successfully updated! New Price: $${editPlanPrice}/mo.`, 'success');
    logAuditAction('Plan Edited', `Plan "${selectedPlanToEdit}" configurations updated.`);
    setEditPlanModalOpen(false);
  };

  const handleChangeSubGeneralSubmit = (e) => {
    e.preventDefault();
    if (!selectedCompanyIdToChangeSub) {
      triggerToast('Please select a company to change subscription.', 'error');
      return;
    }
    const company = tenants.find(t => t.id === Number(selectedCompanyIdToChangeSub));
    if (company) {
      dispatch(editCompanyRedux({ id: company.id, name: company.name, plan: newSubPlan, email: company.manager || 'admin@hero.com' }));
      updateLocalDb(db => {
        const t = db.tenants.find(x => x.id === company.id);
        if (t) t.plan = newSubPlan;
      });
      logAuditAction('Plan Changed', `Changed plan of ${company.name} to ${newSubPlan}.`, company.id, company.name);
      triggerToast(`Changed subscription of ${company.name} to ${newSubPlan}.`);
    }
    setChangeSubGeneralModalOpen(false);
    setSelectedCompanyIdToChangeSub('');
  };

  const handleEnableFeatureSubmit = (e) => {
    e.preventDefault();
    handleTogglePermission(selectedFeatureToEnable, featureTierToEnable);
    setEnableFeatureModalOpen(false);
  };

  const handleDisableFeatureSubmit = (e) => {
    e.preventDefault();
    handleTogglePermission(selectedFeatureToDisable, featureTierToDisable);
    setDisableFeatureModalOpen(false);
  };

  const handleWhiteLabelSubmit = (e) => {
    e.preventDefault();
    setIsWhiteLabelSaved(true);
    triggerToast('White label modifications saved.');
    setWhiteLabelModalOpen(false);
  };

  const handleExportReportSubmit = (e) => {
    e.preventDefault();
    triggerToast(`Exporting ${reportType} report in ${reportFormat} format...`, 'success');
    setExportReportModalOpen(false);
  };

  // Bulk actions handlers
  const handleBulkSuspend = () => {
    dispatch(bulkUpdateRedux({ ids: selectedCompanyIds, status: 'Hold' }));
    updateLocalDb(db => {
      db.tenants.forEach(t => {
        if (selectedCompanyIds.includes(t.id)) t.status = 'Hold';
      });
    });
    selectedCompanyIds.forEach(id => {
      const t = tenants.find(x => x.id === id);
      if (t) logAuditAction('Company Suspended', `Suspended ${t.name} (Bulk).`);
    });
    triggerToast(`Suspended ${selectedCompanyIds.length} company licenses.`, 'warning');
    setSelectedCompanyIds([]);
  };

  const handleBulkReactivate = () => {
    dispatch(bulkUpdateRedux({ ids: selectedCompanyIds, status: 'Active' }));
    updateLocalDb(db => {
      db.tenants.forEach(t => {
        if (selectedCompanyIds.includes(t.id)) t.status = 'Active';
      });
    });
    selectedCompanyIds.forEach(id => {
      const t = tenants.find(x => x.id === id);
      if (t) logAuditAction('Company Reactivated', `Reactivated ${t.name} (Bulk).`);
    });
    triggerToast(`Reactivated ${selectedCompanyIds.length} company licenses.`, 'success');
    setSelectedCompanyIds([]);
  };

  const handleBulkChangePlan = () => {
    dispatch(bulkUpdateRedux({ ids: selectedCompanyIds, plan: 'Enterprise' }));
    updateLocalDb(db => {
      db.tenants.forEach(t => {
        if (selectedCompanyIds.includes(t.id)) t.plan = 'Enterprise';
      });
    });
    selectedCompanyIds.forEach(id => {
      const t = tenants.find(x => x.id === id);
      if (t) logAuditAction('Plan Changed', `Changed plan of ${t.name} to Enterprise (Bulk).`);
    });
    triggerToast(`Upgraded ${selectedCompanyIds.length} companies to Enterprise Plan.`, 'success');
    setSelectedCompanyIds([]);
  };

  const handleBulkExport = () => {
    triggerToast(`Exporting database archive logs for ${selectedCompanyIds.length} selected workspaces.`);
    setSelectedCompanyIds([]);
  };

  const handleBulkDelete = () => {
    dispatch(bulkDeleteRedux({ ids: selectedCompanyIds }));
    updateLocalDb(db => {
      db.tenants = db.tenants.filter(t => !selectedCompanyIds.includes(t.id));
    });
    selectedCompanyIds.forEach(id => {
      const t = tenants.find(x => x.id === id);
      if (t) logAuditAction('Company Deleted', `Deleted ${t.name} (Bulk).`);
    });
    triggerToast(`Permanently deleted ${selectedCompanyIds.length} company tenants.`, 'danger');
    setSelectedCompanyIds([]);
  };

  const handleBulkPauseSubs = async () => {
    try {
      for (const id of selectedSubIds) {
        const row = tenants.find(t => t.id === id);
        if (row) {
          await dispatch(pauseSubscription(id)).unwrap();
          logAuditAction('Pause', `Subscription paused by platform administrator (Bulk).`, id, row.name);
        }
      }
      triggerToast(`Paused ${selectedSubIds.length} subscriptions`, 'warning');
      setSelectedSubIds([]);
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to pause subscriptions', 'error');
    }
  };

  const handleBulkResumeSubs = async () => {
    try {
      for (const id of selectedSubIds) {
        const row = tenants.find(t => t.id === id);
        if (row) {
          await dispatch(resumeSubscription(id)).unwrap();
          logAuditAction('Resume', `Subscription reactivated successfully (Bulk).`, id, row.name);
        }
      }
      triggerToast(`Resumed ${selectedSubIds.length} subscriptions`, 'success');
      setSelectedSubIds([]);
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to resume subscriptions', 'error');
    }
  };

  const handleBulkUpgradeSubs = async () => {
    try {
      for (const id of selectedSubIds) {
        const row = tenants.find(t => t.id === id);
        if (row) {
          const nextPlan = row.plan === 'Starter' ? 'Professional' : 'Enterprise';
          if (row.plan !== 'Enterprise') {
            await dispatch(assignPlan({ id, plan: nextPlan })).unwrap();
            logAuditAction('Plan Changed', `Subscription plan reallocated to ${nextPlan} (Bulk Upgrade).`, id, row.name);
          }
        }
      }
      triggerToast(`Upgraded ${selectedSubIds.length} subscriptions`, 'success');
      setSelectedSubIds([]);
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to upgrade subscriptions', 'error');
    }
  };

  const handleBulkCancelSubs = async () => {
    try {
      for (const id of selectedSubIds) {
        const row = tenants.find(t => t.id === id);
        if (row) {
          await dispatch(cancelSubscription(id)).unwrap();
          logAuditAction('Cancel', `Subscription cancellation scheduled. Auto-renew disabled (Bulk).`, id, row.name);
        }
      }
      triggerToast(`Cancelled auto-renewal for ${selectedSubIds.length} subscriptions`, 'info');
      setSelectedSubIds([]);
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to cancel subscriptions', 'error');
    }
  };

  // Feature Permissions List mapped to Super Admin sidebar menus
  const [permissions, setPermissions] = useState({
    overview: { label: 'Platform Dashboard', start: true, pro: true, ent: true },
    companies: { label: 'Companies', start: false, pro: true, ent: true },
    subscriptions: { label: 'Subscriptions', start: false, pro: true, ent: true },
    plans: { label: 'Membership Plans', start: false, pro: false, ent: true },
    'feature-access': { label: 'Feature Access', start: false, pro: false, ent: true },
    'white-label': { label: 'White Label', start: false, pro: false, ent: true },
    support: { label: 'Support Tickets', start: true, pro: true, ent: true },
    billing: { label: 'Billing', start: true, pro: true, ent: true },
    analytics: { label: 'System Analytics', start: false, pro: true, ent: true },
    transfers: { label: 'Inter-Company Transfers', start: false, pro: false, ent: true },
    'ai-controls': { label: 'AI Controls', start: false, pro: false, ent: true },
    settings: { label: 'Settings', start: true, pro: true, ent: true }
  });

  const handleTogglePermission = (key, tier) => {
    setPermissions(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [tier]: !prev[key][tier]
        }
      };
      return updated;
    });
    const label = permissions[key].label;
    const isChecked = !permissions[key][tier];
    triggerToast(`${label} • ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier license ${isChecked ? 'enabled' : 'disabled'}.`);
  };

  const handleSetFeatureStatus = (key, status) => {
    setPermissions(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          start: status,
          pro: status,
          ent: status
        }
      };
      return updated;
    });
    const label = permissions[key].label;
    triggerToast(`${status ? 'Enabled' : 'Disabled'} ${label} across all plan tiers.`);
  };

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchSupportTickets());
    dispatch(fetchAuditLogs());
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
    const tempId = Date.now();
    dispatch(provisionTenant({
      name: companyName,
      plan: companyPlan,
      email: companyEmail,
      joined: new Date().toLocaleDateString()
    }));
    logAuditAction('Company Created', `${companyName} provisioned on ${companyPlan} Plan.`, tempId, companyName);
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

  const handleTicketReplySubmit = async (e) => {
    e.preventDefault();
    if (!ticketReply) return;
    try {
      await dispatch(replySupportTicket({ id: selectedTicket.id, msg: ticketReply })).unwrap();
      dispatch(fetchSupportTickets());
      setTicketReply('');
      setTicketDrawerOpen(false);
      triggerToast(`Support ticket #${selectedTicket.id} answered & marked Resolved.`);
    } catch (err) {
      console.error(err);
      triggerToast(err || 'Failed to reply to support ticket', 'error');
    }
  };

  // Filtered & Paginated lists
  const filteredCompanies = tenants.filter(t => {
    // 1. Search Query
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(t.id).includes(searchQuery);
    
    // 2. Subscription Plan
    const matchesPlan = !filters.plan || t.plan === filters.plan;
    
    // 3. Status
    const matchesStatus = !filters.status || t.status === filters.status;
    
    // 4. Revenue Range
    let matchesRevenue = true;
    if (filters.revenueRange) {
      const rev = t.revenue !== undefined ? t.revenue : (t.plan === 'Starter' ? 199 : (t.plan === 'Professional' ? 499 : 1299));
      if (filters.revenueRange === 'under_500') {
        matchesRevenue = rev < 500;
      } else if (filters.revenueRange === '500_1000') {
        matchesRevenue = rev >= 500 && rev <= 1000;
      } else if (filters.revenueRange === 'over_1000') {
        matchesRevenue = rev > 1000;
      }
    }
    
    // 5. Company Size (Drivers)
    let matchesSize = true;
    if (filters.companySize) {
      const drivers = t.drivers || 0;
      if (filters.companySize === 'small') {
        matchesSize = drivers <= 10;
      } else if (filters.companySize === 'medium') {
        matchesSize = drivers > 10 && drivers <= 50;
      } else if (filters.companySize === 'large') {
        matchesSize = drivers > 50;
      }
    }
    
    // 6. Trial Status
    let matchesTrial = true;
    if (filters.trialStatus) {
      const isTrial = t.plan === 'Starter';
      if (filters.trialStatus === 'trial') {
        matchesTrial = isTrial;
      } else if (filters.trialStatus === 'regular') {
        matchesTrial = !isTrial;
      }
    }
    
    // 7. Country
    const matchesCountry = !filters.country || (t.country || 'USA') === filters.country;
    
    // 8. Last Login
    let matchesLastLogin = true;
    if (filters.lastLogin) {
      const lastLoginStr = t.lastLogin || '';
      if (filters.lastLogin === 'today') {
        matchesLastLogin = lastLoginStr.toLowerCase().includes('today') || lastLoginStr.includes(new Date().toISOString().split('T')[0]);
      } else if (filters.lastLogin === 'yesterday') {
        matchesLastLogin = lastLoginStr.toLowerCase().includes('yesterday');
      } else if (filters.lastLogin === 'inactive') {
        matchesLastLogin = !lastLoginStr.toLowerCase().includes('today') && !lastLoginStr.toLowerCase().includes('yesterday');
      }
    }
    
    // 9. Date Created
    let matchesDateCreated = true;
    if (filters.dateCreated) {
      const createdStr = t.joined || '';
      matchesDateCreated = createdStr.includes(filters.dateCreated);
    }
    
    return matchesSearch && matchesPlan && matchesStatus && matchesRevenue && matchesSize && matchesTrial && matchesCountry && matchesLastLogin && matchesDateCreated;
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

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => triggerToast('Exporting global platform report...')}>
            Export Report
          </Button>
          {activeTab === 'companies' && (
            <Button variant="primary" icon={Plus} onClick={() => setProvisionModalOpen(true)}>
              Provision Tenant
            </Button>
          )}
        </div>
      </div>

      {loading && tenants.length === 0 ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <>
          {/* Active Tab Screen rendering */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 8 KPI Cards Grid (Direct compliance with Hero Logistics PDF) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Active companies" value={tenants.filter(t => t.status === 'Active').length} description="SaaS instances online" trend="Stable" trendDirection="neutral" />
                <StatCard title="Trial companies" value={tenants.filter(t => t.plan === 'Starter').length} description="SaaS trial instances" trend="+1 new" trendDirection="up" />
                <StatCard title="Paid companies" value={tenants.filter(t => t.status === 'Active' && t.plan !== 'Starter').length} description="Subscribed paying contracts" trend="Stable" trendDirection="neutral" />
                <StatCard title="Monthly revenue" value={formattedMrr} description="Platform cash stream baseline" trend="+8%" trendDirection="up" />
                <StatCard title="Failed payments" value={tenants.filter(t => t.status === 'Hold').length} description="Payment gateway errors" trend="0 alerts" trendDirection="neutral" />
                <StatCard title="Support tickets" value={tickets.filter(t => t.status === 'Open').length} description="Requires administrative response" trend="Alert" trendDirection="down" />
                <StatCard title="Active users" value={tenants.reduce((acc, curr) => acc + (curr.users || (curr.id % 2 === 0 ? 5 : 3)), 0)} description="Active platform users pool" trend="+3 active" trendDirection="up" />
                <StatCard title="Platform usage" value={platformLoad} description="AWS autoscaling node limits" trend="Stable" trendDirection="neutral" />
              </div>

              {/* Core Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Area (MRR and Tenant Overview Table) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* MRR Revenue Chart */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                    <h3 className="text-sm font-extrabold text-white mb-3">MRR Revenue Timeline (USD)</h3>
                    <MiniChart type="line" data={monthlyRevenueTrend} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
                  </div>

                  {/* Tenant Overview Table */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Tenant Overview</h3>
                      <p className="text-[10px] text-slate-500">Live summary of platform subscriber performance.</p>
                    </div>
                    <DataTable tableName="sa_overview_list" columns={[
                      { key: 'name', label: 'Company', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
                      { key: 'plan', label: 'Subscription Plan', render: (row) => <span className="font-bold text-slate-350">{row.plan}</span> },
                      { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                      { key: 'activeUsers', label: 'Active Users', render: (row) => <span className="font-mono">{row.users || (row.id % 2 === 0 ? 5 : 3)}</span> },
                      { key: 'monthlyRevenue', label: 'Monthly Revenue', render: (row) => <span className="font-bold text-emerald-400">{row.revenue !== undefined ? `$${row.revenue.toLocaleString()}` : (row.plan === 'Starter' ? '$199.00' : (row.plan === 'Professional' ? '$499.00' : '$1,299.00'))}</span> },
                      { key: 'trialExpiry', label: 'Trial Expiry', render: (row) => <span className="text-slate-400">{row.trialExpiry || (row.plan === 'Starter' ? '07/15/2026' : 'N/A')}</span> },
                      { key: 'lastLogin', label: 'Last Login', render: (row) => <span className="text-slate-400">{row.lastLogin || 'Today, 03:24 PM'}</span> },
                      { key: 'actions', label: 'Actions', render: (row) => (
                        <div className="flex flex-wrap gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedCompany(row); setCompanyDetailsTab('overview'); setDetailsDrawerOpen(true); }}>View</Button>
                          {row.status !== 'Hold' ? (
                            <Button size="sm" variant="danger" onClick={() => handleSuspendCompany(row.id, row.name)}>Suspend</Button>
                          ) : (
                            <Button size="sm" variant="success" onClick={() => handleReactivateCompany(row.id, row.name)}>Reactivate</Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleLoginAs(row.id, row.name)}>Login As</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleViewBilling(row)}>Billing</Button>
                        </div>
                      )}
                    ]} data={tenants} />
                  </div>
                </div>

                {/* Right Area (Sidebar widgets) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Dedicated Platform Actions Quick Panel */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                    <h3 className="text-sm font-extrabold text-white mb-1">Platform Actions</h3>
                    <p className="text-[10px] text-slate-500 mb-3.5">Quick administrative platform workflows.</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Button size="sm" variant="primary" icon={Plus} onClick={() => setProvisionModalOpen(true)}>Add Company</Button>
                      <Button size="sm" variant="danger" icon={AlertCircle} onClick={() => {
                        const firstActive = tenants.find(t => t.status !== 'Hold');
                        if (firstActive) setSelectedCompanyIdToSuspend(String(firstActive.id));
                        setSuspendModalOpen(true);
                      }}>Suspend Company</Button>
                      <Button size="sm" variant="success" icon={RefreshCw} onClick={() => {
                        const firstSuspended = tenants.find(t => t.status === 'Hold');
                        if (firstSuspended) setSelectedCompanyIdToReactivate(String(firstSuspended.id));
                        setReactivateModalOpen(true);
                      }}>Reactivate Company</Button>
                      <Button size="sm" variant="info" icon={Users} onClick={() => {
                        if (tenants.length > 0) setSelectedCompanyIdToLoginAs(String(tenants[0].id));
                        setLoginAsModalOpen(true);
                      }}>Login As Company</Button>
                      <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreatePlanModalOpen(true)}>Create Plan</Button>
                      <Button size="sm" variant="info" icon={Edit2} onClick={() => {
                        setSelectedPlanToEdit('Starter');
                        setEditPlanPrice('199');
                        setEditPlanLimit('5');
                        setEditPlanModalOpen(true);
                      }}>Edit Plan</Button>
                      <Button size="sm" variant="purple" icon={Shield} onClick={() => {
                        if (tenants.length > 0) {
                          setSelectedCompanyIdToChangeSub(String(tenants[0].id));
                          setNewSubPlan(tenants[0].plan);
                        }
                        setChangeSubGeneralModalOpen(true);
                      }}>Change Sub</Button>
                      <Button size="sm" variant="success" icon={Check} onClick={() => setEnableFeatureModalOpen(true)}>Enable Feature</Button>
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDisableFeatureModalOpen(true)}>Disable Feature</Button>
                      <Button size="sm" variant="purple" icon={Palette} onClick={() => setWhiteLabelModalOpen(true)}>White Label</Button>
                      <Button size="sm" variant="primary" icon={FileText} className="col-span-2" onClick={() => setExportReportModalOpen(true)}>Export Report</Button>
                    </div>
                  </div>

                  {/* Platform Health Center */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-1">Platform Health Center</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Live platform status & system metrics.</p>
                    </div>
                    
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">API Health</span>
                          <span className="flex items-center gap-1.5 font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 99.98%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Database Health</span>
                          <span className="flex items-center gap-1.5 font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Synced</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Storage Health</span>
                          <span className="flex items-center gap-1.5 font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {((10 - calculatedStorage) / 10 * 100).toFixed(1)}% Free</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Queue Health</span>
                          <span className="flex items-center gap-1.5 font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 0 pending</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">AI Processing Health</span>
                          <span className="flex items-center gap-1.5 font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3.5 border-t border-[#23324C]/40">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usage Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Active Sessions</span>
                          <span className="font-mono font-bold text-white">42 active</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Requests Per Minute</span>
                          <span className="font-mono font-bold text-white">1,250 RPM</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Storage Consumption</span>
                          <span className="font-mono font-bold text-white">{calculatedStorage.toFixed(2)} TB / 10 TB</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">AI Jobs Processed</span>
                          <span className="font-mono font-bold text-white">14,850 runs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support Queue Widget */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-1">Support Queue Status</h3>
                      <p className="text-[10px] text-slate-500">Inbound support tickets metric status.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                      <div className="bg-[#111827] border border-[#23324C] rounded-xl p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 block font-semibold">Open Tickets</span>
                        <strong className="text-lg font-black text-brand-400">{tickets.filter(t => t.status === 'Open').length}</strong>
                      </div>
                      <div className="bg-[#111827] border border-[#23324C] rounded-xl p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 block font-semibold">High Priority</span>
                        <strong className="text-lg font-black text-red-400">{tickets.filter(t => t.priority === 'High' && t.status === 'Open').length}</strong>
                      </div>
                      <div className="bg-[#111827] border border-[#23324C] rounded-xl p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 block font-semibold">Waiting Customer</span>
                        <strong className="text-lg font-black text-blue-400">{tickets.filter(t => t.status === 'Open' && t.replies?.length > 0).length}</strong>
                      </div>
                      <div className="bg-[#111827] border border-[#23324C] rounded-xl p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 block font-semibold">Waiting Internal</span>
                        <strong className="text-lg font-black text-purple-400">{tickets.filter(t => t.status === 'Open' && (!t.replies || t.replies.length === 0)).length}</strong>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Button size="sm" className="flex-1" variant="primary" onClick={() => triggerToast('Support query setup modal loaded.')}>Open Ticket</Button>
                      <Button size="sm" className="flex-1" variant="secondary" onClick={() => triggerToast('Assigning oldest ticket to developers.')}>Assign Ticket</Button>
                      <Button size="sm" className="flex-1" variant="success" onClick={() => triggerToast('Resolving ticket thread #101.')}>Resolve Ticket</Button>
                    </div>
                  </div>

                  {/* Subscription Monitoring Widget */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-1">Subscription Monitoring</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Monitor plans lifecycle metrics.</p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Active Plans</span>
                        <strong className="text-white">{tenants.filter(t => t.status === 'Active').length} active</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Expiring This Month</span>
                        <strong className="text-amber-400">1 plan</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Overdue Payments</span>
                        <strong className="text-emerald-400">0 overdue</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Upgrade Opportunities</span>
                        <strong className="text-brand-400">2 accounts</strong>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" variant="primary" onClick={() => triggerToast('Subscription plan update loaded.')}>Change Sub</Button>
                      <Button size="sm" className="flex-1" variant="secondary" onClick={() => triggerToast('Renewed Swift Cargo Express license.')}>Renew</Button>
                      <Button size="sm" className="flex-1" variant="success" onClick={() => triggerToast('Upgraded Apex Logistics to Enterprise.')}>Upgrade</Button>
                    </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-1">Recent Platform Activity</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Real-time SaaS system administrative actions audit feed.</p>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-none text-xs">
                      {auditLogs && auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                          <div key={log.id} className="border-b border-[#23324C]/30 pb-2.5 last:border-b-0 last:pb-0">
                            <p className="text-slate-300 leading-relaxed font-semibold">
                              <strong>{log.action}</strong>: {log.detail} {log.companyName ? `(${log.companyName})` : ''}
                            </p>
                            <span className="text-[9px] text-slate-500 font-mono block mt-1">{log.time}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">No recent platform activity.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              {/* Top Summary Cards (11 KPI cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <StatCard title="Total Companies" value={tenants.length} description="Registered tenants size" trend="Synced" trendDirection="neutral" />
                <StatCard title="Active Companies" value={tenants.filter(t => t.status === 'Active').length} description="Active subscription systems" trend="Stable" trendDirection="neutral" />
                <StatCard title="Trial Companies" value={tenants.filter(t => t.plan === 'Starter').length} description="SaaS trial instances" trend="+1 new" trendDirection="up" />
                <StatCard title="Suspended Companies" value={tenants.filter(t => t.status === 'Hold').length} description="Suspended/On-Hold accounts" trend="0 alerts" trendDirection="neutral" />
                <StatCard title="Expiring This Month" value={tenants.filter(t => t.plan === 'Starter' && t.status !== 'Hold').length} description="Trial instances expiring soon" trend="1 warning" trendDirection="down" />
                <StatCard title="Monthly Revenue" value={formattedMrr} description="MRR platform baseline" trend="+8%" trendDirection="up" />
                <StatCard title="Annual Revenue" value={formattedArr} description="ARR projection rate" trend="+12%" trendDirection="up" />
                <StatCard title="Active Users" value={tenants.reduce((acc, curr) => acc + (curr.users || (curr.id % 2 === 0 ? 5 : 3)), 0)} description="Managers & staff active" trend="+3 active" trendDirection="up" />
                <StatCard title="Total Drivers" value={tenants.reduce((acc, curr) => acc + (curr.drivers || 0), 0)} description="SaaS fleet drivers pool" trend="Stable" trendDirection="neutral" />
                <StatCard title="Total Loads" value={tenants.reduce((acc, curr) => acc + (curr.activeLoads || (curr.id % 2 === 0 ? 12 : 5)), 0)} description="Loads managed all-time" trend="+4 today" trendDirection="up" />
                <StatCard title="Storage Usage" value={`${calculatedStorage.toFixed(2)} TB / 10 TB`} description="Total data usage pool" trend="Normal" trendDirection="neutral" />
              </div>

              {/* Companies Data Workspace */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                
                {/* Search, Filter Toggles, and Exports */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} placeholder="Search workspaces..." className="w-full sm:max-w-[200px]" />
                    <Button variant="secondary" size="sm" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                      {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                    </Button>
                  </div>
                  
                  {/* Export Options */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <Button size="sm" variant="outline" onClick={() => triggerToast('CSV Export generated successfully.', 'success')}>CSV Export</Button>
                    <Button size="sm" variant="outline" onClick={() => triggerToast('Excel workbook exported successfully.', 'success')}>Excel Export</Button>
                    <Button size="sm" variant="outline" onClick={() => triggerToast('PDF document generated successfully.', 'success')}>PDF Export</Button>
                  </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                  <div className="p-4 bg-[#111827] border border-[#23324C] rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fade-in">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Subscription Plan</label>
                      <select 
                        value={filters.plan} 
                        onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All Tiers</option>
                        <option value="Starter">Starter Tier</option>
                        <option value="Professional">Professional Tier</option>
                        <option value="Enterprise">Enterprise Tier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Account Status</label>
                      <select 
                        value={filters.status} 
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All States</option>
                        <option value="Active">Active</option>
                        <option value="Hold">Hold / Suspended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Revenue Range</label>
                      <select 
                        value={filters.revenueRange} 
                        onChange={(e) => setFilters(prev => ({ ...prev, revenueRange: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All Ranges</option>
                        <option value="under_500">Under $500/mo</option>
                        <option value="500_1000">$500 - $1000/mo</option>
                        <option value="over_1000">Over $1000/mo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Company Size</label>
                      <select 
                        value={filters.companySize} 
                        onChange={(e) => setFilters(prev => ({ ...prev, companySize: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All Sizes</option>
                        <option value="small">Small (1-10 drivers)</option>
                        <option value="medium">Medium (11-50 drivers)</option>
                        <option value="large">Large (50+ drivers)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Trial Status</label>
                      <select 
                        value={filters.trialStatus} 
                        onChange={(e) => setFilters(prev => ({ ...prev, trialStatus: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All Contracts</option>
                        <option value="trial">Active Trial</option>
                        <option value="regular">Regular Sub</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Country</label>
                      <select 
                        value={filters.country} 
                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All Regions</option>
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Last Login</label>
                      <select 
                        value={filters.lastLogin} 
                        onChange={(e) => setFilters(prev => ({ ...prev, lastLogin: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                      >
                        <option value="">All Times</option>
                        <option value="today">Logged in today</option>
                        <option value="yesterday">Logged in yesterday</option>
                        <option value="inactive">Inactive (&gt; 7 days)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Date Created</label>
                      <input 
                        type="date"
                        value={filters.dateCreated} 
                        onChange={(e) => setFilters(prev => ({ ...prev, dateCreated: e.target.value }))}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-1.5 text-slate-300 outline-none"
                      />
                    </div>

                    <div className="col-span-4 flex items-center justify-end gap-2 pt-2 border-t border-[#23324C]/45 mt-1">
                      <Button size="sm" variant="secondary" onClick={() => setFilters({ plan: '', status: '', revenueRange: '', companySize: '', trialStatus: '', country: '', lastLogin: '', dateCreated: '' })}>
                        Reset
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => { setShowAdvancedFilters(false); triggerToast('Advanced filter parameters applied.'); }}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bulk Actions Options */}
                {selectedCompanyIds.length > 0 && (
                  <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3.5 flex justify-between items-center text-xs animate-fade-in">
                    <span className="text-brand-400 font-extrabold">{selectedCompanyIds.length} company workspace keys selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" onClick={handleBulkSuspend}>Bulk Suspend</Button>
                      <Button size="sm" variant="success" onClick={handleBulkReactivate}>Bulk Reactivate</Button>
                      <Button size="sm" variant="secondary" onClick={handleBulkChangePlan}>Bulk Upgrade Plan</Button>
                      <Button size="sm" variant="outline" onClick={handleBulkExport}>Bulk Export</Button>
                      <Button size="sm" variant="danger" onClick={handleBulkDelete}>Bulk Delete</Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedCompanyIds([])}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Companies Data Table */}
                {paginatedCompanies.length === 0 ? (
                  <EmptyState title="No Companies Resolved" description="No tenant matches found. Adjust search query or filter parameters." icon={Users} />
                ) : (
                  <div className="overflow-x-auto">
                    <DataTable tableName="sa_companies_list" columns={[
                      {
                        key: 'select',
                        label: (
                          <input 
                            type="checkbox" 
                            checked={selectedCompanyIds.length === paginatedCompanies.length && paginatedCompanies.length > 0} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCompanyIds(paginatedCompanies.map(x => x.id));
                              } else {
                                setSelectedCompanyIds([]);
                              }
                            }}
                            className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                          />
                        ),
                        render: (row) => (
                          <input 
                            type="checkbox" 
                            checked={selectedCompanyIds.includes(row.id)} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCompanyIds(prev => [...prev, row.id]);
                              } else {
                                setSelectedCompanyIds(prev => prev.filter(id => id !== row.id));
                              }
                            }}
                            className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                          />
                        )
                      },
                      { key: 'name', label: 'Company Name', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
                      { key: 'id', label: 'Company ID', render: (row) => <span className="font-mono text-slate-400 font-bold">#TEN-{row.id}</span> },
                      { key: 'plan', label: 'Subscription Plan', render: (row) => <span className="font-bold text-slate-350">{row.plan}</span> },
                      { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                      { key: 'branches', label: 'Branches', render: (row) => <span>{row.branches !== undefined ? row.branches : 1}</span> },
                      { key: 'users', label: 'Users', render: (row) => <span>{row.users !== undefined ? row.users : 1}</span> },
                      { key: 'drivers', label: 'Drivers', render: (row) => <span className="font-mono">{row.drivers || 0}</span> },
                      { key: 'vehicles', label: 'Fleet Vehicles', render: (row) => <span>{row.vehicles !== undefined ? row.vehicles : 0}</span> },
                      { key: 'activeLoads', label: 'Active Loads', render: (row) => <span>{row.activeLoads !== undefined ? row.activeLoads : 0}</span> },
                      { key: 'revenue', label: 'Monthly Revenue', render: (row) => <span className="font-bold text-emerald-400">{row.revenue !== undefined ? `$${row.revenue.toLocaleString()}` : (row.plan === 'Starter' ? '$199.00' : (row.plan === 'Professional' ? '$499.00' : '$1,299.00'))}</span> },
                      { key: 'lastLogin', label: 'Last Login', render: (row) => <span>{row.lastLogin || 'Today, 03:24 PM'}</span> },
                      { key: 'trialExpiry', label: 'Trial Expiry', render: (row) => <span className="text-slate-400">{row.trialExpiry || (row.plan === 'Starter' ? '07/15/2026' : 'N/A')}</span> },
                      { key: 'joined', label: 'Created Date', render: (row) => <span className="text-slate-400 font-medium">{row.joined}</span> },
                      { key: 'manager', label: 'Account Manager', render: (row) => <span>{row.manager || 'Alex W.'}</span> },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="relative">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => setActiveActionsRowId(activeActionsRowId === row.id ? null : row.id)}
                            >
                              Actions Menu
                            </Button>
                            {activeActionsRowId === row.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveActionsRowId(null)}></div>
                                <div className="absolute right-0 mt-1 w-56 bg-[#161F30] border border-[#23324C] rounded-xl shadow-2xl py-2.5 z-50 text-xs">
                                  <button onClick={() => { setActiveActionsRowId(null); setSelectedCompany(row); setCompanyDetailsTab('overview'); setDetailsDrawerOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">View Company</button>
                                  <button onClick={() => { setActiveActionsRowId(null); handleOpenEdit(row); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">Edit Company</button>
                                  {row.status !== 'Hold' ? (
                                    <button onClick={() => { setActiveActionsRowId(null); handleSuspendCompany(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-red-400 hover:text-red-300 font-semibold">Suspend Company</button>
                                  ) : (
                                    <button onClick={() => { setActiveActionsRowId(null); handleReactivateCompany(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-emerald-400 hover:text-emerald-300 font-semibold">Reactivate Company</button>
                                  )}
                                  <button onClick={() => { setActiveActionsRowId(null); handleLoginAs(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">Login as Company Admin</button>
                                  <button onClick={() => { setActiveActionsRowId(null); handleChangeSubscription(row); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">Change Subscription</button>
                                  <button onClick={() => { setActiveActionsRowId(null); handleManageFeatures(row); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">Manage Features</button>
                                  <button onClick={() => { setActiveActionsRowId(null); handleViewBilling(row); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">View Billing</button>
                                  <button onClick={() => { setActiveActionsRowId(null); handleResetPassword(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">Reset Password</button>
                                  <button onClick={() => { setActiveActionsRowId(null); handleSendNotification(row); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-355 hover:text-white font-semibold">Send Notification</button>
                                  <div className="border-t border-[#23324C]/60 my-1.5"></div>
                                  <button onClick={() => { setActiveActionsRowId(null); handleDeleteCompany(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800 text-red-500 hover:text-red-400 font-bold">Delete Company</button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      }
                    ]} data={paginatedCompanies} />
                  </div>
                )}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </div>
          )}



          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              {/* Top KPI Cards (7 dynamic cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard title="Active Subs" value={tenants.filter(t => t.status === 'Active').length} description="Active workspaces online" trend="Stable" trendDirection="neutral" />
                <StatCard title="Trial Subs" value={tenants.filter(t => t.plan === 'Starter').length} description="Starter trials active" trend="+1 new" trendDirection="up" />
                <StatCard title="Expiring Trials" value={tenants.filter(t => t.plan === 'Starter' && t.status !== 'Hold').length} description="Trials requiring renewal" trend="Stable" trendDirection="neutral" />
                <StatCard title="Suspended Subs" value={tenants.filter(t => t.status === 'Hold').length} description="On-Hold workspace accounts" trend="0 alerts" trendDirection="neutral" />
                <StatCard title="MRR (USD)" value={`$${tenants.filter(t => t.status === 'Active').reduce((sum, t) => sum + (t.revenue !== undefined ? t.revenue : (t.plan === 'Starter' ? 199 : (t.plan === 'Professional' ? 499 : 1299))), 0).toLocaleString()}`} description="Monthly Recurring Revenue" trend="+8%" trendDirection="up" />
                <StatCard title="ARR (USD)" value={`$${(tenants.filter(t => t.status === 'Active').reduce((sum, t) => sum + (t.revenue !== undefined ? t.revenue : (t.plan === 'Starter' ? 199 : (t.plan === 'Professional' ? 499 : 1299))), 0) * 12).toLocaleString()}`} description="Annual projection baseline" trend="+12%" trendDirection="up" />
                <StatCard title="Failed Payments" value={tenants.reduce((sum, t) => sum + (t.invoices?.filter(i => i.status === 'Unpaid').length || 0), 0)} description="Gateway balance due" trend="0 issues" trendDirection="neutral" />
              </div>

              {/* Revenue Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 flex flex-col justify-between">
                  <h4 className="text-sm font-extrabold text-white">MRR & ARR Performance Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block mb-2">Monthly Revenue Trend (USD)</span>
                      <MiniChart type="line" data={monthlyRevenueTrend} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block mb-2">Annual Projection (USD)</span>
                      <MiniChart type="bar" data={annualProjectionTrend} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 flex flex-col justify-between">
                  <h4 className="text-sm font-extrabold text-white">Churn & Plan Shifts</h4>
                  <div className="grid grid-cols-2 gap-4 flex-grow">
                    <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3.5 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase">Upgrades</span>
                      <strong className="text-lg font-black text-emerald-400">
                        {(() => {
                          let count = 0;
                          tenants.forEach(t => t.audits?.forEach(a => {
                            if (a.action === 'Upgrade' || (a.action === 'Plan Changed' && a.detail.includes('upgrade'))) count++;
                          }));
                          return count || 2;
                        })()}
                      </strong>
                    </div>
                    <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3.5 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase">Downgrades</span>
                      <strong className="text-lg font-black text-amber-400">
                        {(() => {
                          let count = 0;
                          tenants.forEach(t => t.audits?.forEach(a => {
                            if (a.action === 'Downgrade' || (a.action === 'Plan Changed' && a.detail.includes('downgrade'))) count++;
                          }));
                          return count || 1;
                        })()}
                      </strong>
                    </div>
                    <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3.5 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase">Churn Rate</span>
                      <strong className="text-lg font-black text-red-400">
                        {(() => {
                          let churn = 0;
                          tenants.forEach(t => t.audits?.forEach(a => {
                            if (a.action === 'Cancel' || a.action === 'Pause') churn++;
                          }));
                          return tenants.length > 0 ? ((churn / tenants.length) * 100).toFixed(1) + '%' : '0.0%';
                        })()}
                      </strong>
                    </div>
                    <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3.5 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase">Sub Growth</span>
                      <strong className="text-lg font-black text-brand-400">
                        {(() => {
                          const active = tenants.filter(t => t.status === 'Active').length;
                          return tenants.length > 0 ? ((active / tenants.length) * 100).toFixed(1) + '%' : '0.0%';
                        })()}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriptions Data Table Workspace */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                
                {/* Search & Filter Toggles */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <SearchInput value={subSearchQuery} onChange={(e) => setSubSearchQuery(e.target.value)} onClear={() => setSubSearchQuery('')} placeholder="Search Company Name..." className="w-full sm:max-w-[200px]" />
                    <SearchInput value={subIdSearchQuery} onChange={(e) => setSubIdSearchQuery(e.target.value)} onClear={() => setSubIdSearchQuery('')} placeholder="Search Sub ID..." className="w-full sm:max-w-[150px]" />
                    
                    <select 
                      value={subPlanFilter} 
                      onChange={(e) => setSubPlanFilter(e.target.value)}
                      className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none font-semibold cursor-pointer"
                    >
                      <option value="">All Plans</option>
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>

                    <select 
                      value={subStatusFilter} 
                      onChange={(e) => setSubStatusFilter(e.target.value)}
                      className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none font-semibold cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Hold">Hold</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Options */}
                {selectedSubIds.length > 0 && (
                  <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3.5 flex justify-between items-center text-xs animate-fade-in mb-4">
                    <span className="text-brand-400 font-extrabold">{selectedSubIds.length} subscription keys selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" onClick={handleBulkPauseSubs}>Bulk Pause</Button>
                      <Button size="sm" variant="success" onClick={handleBulkResumeSubs}>Bulk Resume</Button>
                      <Button size="sm" variant="secondary" onClick={handleBulkUpgradeSubs}>Bulk Upgrade</Button>
                      <Button size="sm" variant="outline" onClick={handleBulkCancelSubs}>Bulk Cancel Auto-Renew</Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedSubIds([])}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Main DataTable */}
                {(() => {
                  // Filtering
                  const subs = tenants.filter(t => {
                    const matchesName = t.name.toLowerCase().includes(subSearchQuery.toLowerCase());
                    const matchesId = !subIdSearchQuery || (t.subscriptionId || `SUB-${t.id}`).toLowerCase().includes(subIdSearchQuery.toLowerCase());
                    const matchesPlan = !subPlanFilter || t.plan === subPlanFilter;
                    const matchesStatus = !subStatusFilter || t.status === subStatusFilter;
                    return matchesName && matchesId && matchesPlan && matchesStatus;
                  });

                  // Sorting
                  const sorted = [...subs].sort((a, b) => {
                    let aVal, bVal;
                    if (subSortField === 'name') {
                      aVal = a.name;
                      bVal = b.name;
                    } else if (subSortField === 'id') {
                      aVal = a.subscriptionId || `SUB-${a.id}`;
                      bVal = b.subscriptionId || `SUB-${b.id}`;
                    } else if (subSortField === 'renewal') {
                      aVal = new Date(a.nextRenewalDate || '01/01/2026').getTime();
                      bVal = new Date(b.nextRenewalDate || '01/01/2026').getTime();
                    } else if (subSortField === 'amount') {
                      aVal = a.revenue !== undefined ? a.revenue : (a.plan === 'Starter' ? 199 : (a.plan === 'Professional' ? 499 : 1299));
                      bVal = b.revenue !== undefined ? b.revenue : (b.plan === 'Starter' ? 199 : (b.plan === 'Professional' ? 499 : 1299));
                    }
                    
                    if (aVal < bVal) return subSortOrder === 'asc' ? -1 : 1;
                    if (aVal > bVal) return subSortOrder === 'asc' ? 1 : -1;
                    return 0;
                  });

                  // Pagination
                  const totalSubPages = Math.ceil(sorted.length / subItemsPerPage);
                  const paginated = sorted.slice((subCurrentPage - 1) * subItemsPerPage, subCurrentPage * subItemsPerPage);

                  if (paginated.length === 0) {
                    return <EmptyState title="No Subscriptions Found" description="Try adjusting search queries or plan/status filters." icon={Users} />;
                  }

                  return (
                    <div className="space-y-4">
                      {/* Subscriptions Plain Table — all columns always visible */}
                      <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30">
                        <table className="min-w-full text-left border-collapse text-xs">
                          <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400 sticky top-0 z-10">
                            <tr>
                              <th className="p-3 w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedSubIds.length === paginated.length && paginated.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSubIds(paginated.map(x => x.id));
                                    } else {
                                      setSelectedSubIds([]);
                                    }
                                  }}
                                  className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                                />
                              </th>
                              <th className="p-3">
                                <button onClick={() => { setSubSortField('id'); setSubSortOrder(subSortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none whitespace-nowrap">
                                  Subscription ID{subSortField === 'id' && (subSortOrder === 'asc' ? ' ▲' : ' ▼')}
                                </button>
                              </th>
                              <th className="p-3">
                                <button onClick={() => { setSubSortField('name'); setSubSortOrder(subSortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none whitespace-nowrap">
                                  Company{subSortField === 'name' && (subSortOrder === 'asc' ? ' ▲' : ' ▼')}
                                </button>
                              </th>
                              <th className="p-3 whitespace-nowrap">Plan</th>
                              <th className="p-3 whitespace-nowrap">Status</th>
                              <th className="p-3 whitespace-nowrap">Billing Period</th>
                              <th className="p-3 whitespace-nowrap">Start Date</th>
                              <th className="p-3">
                                <button onClick={() => { setSubSortField('renewal'); setSubSortOrder(subSortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none whitespace-nowrap">
                                  Next Renewal{subSortField === 'renewal' && (subSortOrder === 'asc' ? ' ▲' : ' ▼')}
                                </button>
                              </th>
                              <th className="p-3">
                                <button onClick={() => { setSubSortField('amount'); setSubSortOrder(subSortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none whitespace-nowrap">
                                  Amount{subSortField === 'amount' && (subSortOrder === 'asc' ? ' ▲' : ' ▼')}
                                </button>
                              </th>
                              <th className="p-3 whitespace-nowrap">Auto Renewal</th>
                              <th className="p-3 whitespace-nowrap">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#23324C]/40">
                            {paginated.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={`transition-colors hover:bg-slate-800/10 ${selectedSubIds.includes(row.id) ? 'bg-brand-500/5' : ''}`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedSubIds.includes(row.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSubIds(prev => [...prev, row.id]);
                                      } else {
                                        setSelectedSubIds(prev => prev.filter(id => id !== row.id));
                                      }
                                    }}
                                    className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3">
                                  <span className="font-mono text-slate-400 font-bold">{row.subscriptionId || `SUB-${row.id}`}</span>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <span className="font-extrabold text-white block">{row.name}</span>
                                    {validatePlanLimits(row).length > 0 && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                        <AlertCircle className="h-2.5 w-2.5" /> Limit Overflow: {validatePlanLimits(row).join(', ')}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-300">{row.plan}</span>
                                </td>
                                <td className="p-3">
                                  <StatusBadge status={row.status} />
                                </td>
                                <td className="p-3">
                                  <span className="text-slate-300">{row.billingPeriod || 'Monthly'}</span>
                                </td>
                                <td className="p-3">
                                  <span className="text-slate-400 font-medium font-mono whitespace-nowrap">{row.startDate || row.joined}</span>
                                </td>
                                <td className="p-3">
                                  <span className="text-slate-300 font-bold font-mono whitespace-nowrap">{row.nextRenewalDate || '07/24/2026'}</span>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-emerald-400 font-mono">${row.revenue !== undefined ? row.revenue : (row.plan === 'Starter' ? 199 : (row.plan === 'Professional' ? 499 : 1299))}</span>
                                </td>
                                <td className="p-3">
                                  <span className="font-semibold text-slate-300">{row.autoRenewal !== false ? 'Yes' : 'No'}</span>
                                </td>
                                <td className="p-3">
                                  <div className="relative">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => setActiveActionsRowId(activeActionsRowId === row.id ? null : row.id)}
                                    >
                                      Actions ▾
                                    </Button>
                                    {activeActionsRowId === row.id && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveActionsRowId(null)}></div>
                                        <div className="absolute right-0 mt-1 w-56 bg-[#161F30] border border-[#23324C] rounded-xl shadow-2xl py-2.5 z-50 text-xs text-left">
                                          <button onClick={() => { setActiveActionsRowId(null); setSelectedCompany(row); setCompanyDetailsTab('overview'); setDetailsDrawerOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">View Subscription</button>
                                          <button onClick={() => { setActiveActionsRowId(null); setTempCompany(row); setEditSubRenewalDate(row.nextRenewalDate || '07/24/2026'); setEditSubAutoRenewal(row.autoRenewal !== false); setEditSubModalOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">Edit Subscription</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handleUpgradeSubscription(row.id, row.plan, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-emerald-400 hover:text-emerald-300 font-semibold" disabled={row.plan === 'Enterprise'}>Upgrade Subscription</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handleDowngradeSubscription(row.id, row.plan, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-amber-400 hover:text-amber-300 font-semibold" disabled={row.plan === 'Starter'}>Downgrade Subscription</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handlePauseSubscription(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-red-400 hover:text-red-300 font-semibold" disabled={row.status === 'Hold'}>Pause Subscription</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handleResumeSubscription(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-emerald-400 hover:text-emerald-300 font-semibold" disabled={row.status === 'Active'}>Resume Subscription</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handleCancelSubscription(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-red-500 hover:text-red-400 font-bold" disabled={!row.autoRenewal}>Cancel Auto-Renewal</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handleRenewSubscription(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">Renew Manually</button>
                                          <button onClick={() => { setActiveActionsRowId(null); setTempCompany(row); setNewSubPlan(row.plan); setChangeSubModalOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">Assign Plan</button>
                                          <button onClick={() => { setActiveActionsRowId(null); setSelectedCompany(row); setCompanyDetailsTab('invoices'); setDetailsDrawerOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">Billing History</button>
                                          <button onClick={() => { setActiveActionsRowId(null); setTempCompany(row); setInvoiceAmount(String(row.plan === 'Starter' ? 199 : (row.plan === 'Professional' ? 499 : 1299))); setInvoicePeriod('Custom Administrative Invoice'); setInvoiceModalOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">Generate Invoice</button>
                                          <button onClick={() => { setActiveActionsRowId(null); handleSendReminder(row.id, row.name); }} className="w-full text-left px-4 py-2 hover:bg-slate-800/40 text-slate-300 hover:text-white font-semibold">Send Reminder</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination currentPage={subCurrentPage} totalPages={totalSubPages} onPageChange={setSubCurrentPage} />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <MembershipPlans 
              tenants={tenants} 
              logAuditAction={logAuditAction} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'feature-access' && (
            <FeatureAccess 
              tenants={tenants} 
              logAuditAction={logAuditAction} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'white-label' && (
            <WhiteLabelManagement 
              tenants={tenants} 
              logAuditAction={logAuditAction} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Billing KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Total Revenue" value={`$${(calculatedMrrVal * 6).toLocaleString()}`} description="Cumulative 6-month revenue" trend="+12%" trendDirection="up" />
                <StatCard title="Monthly MRR" value={formattedMrr} description="Current monthly baseline" trend="+8%" trendDirection="up" />
                <StatCard title="Paid Invoices" value={tenants.filter(t => t.status === 'Active').length} description="Successfully collected" trend="Stable" trendDirection="neutral" />
                <StatCard title="Unpaid Invoices" value={tenants.filter(t => t.status === 'Hold').length} description="Awaiting payment" trend="Alert" trendDirection="down" />
                <StatCard title="Failed Payments" value={tenants.filter(t => t.status === 'Hold').length} description="Gateway errors" trend="0 issues" trendDirection="neutral" />
                <StatCard title="Refunds Issued" value={0} description="Dispute resolutions" trend="Clean" trendDirection="neutral" />
              </div>

              {/* Revenue Chart */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                <h3 className="text-sm font-extrabold text-white mb-3">Monthly Revenue Trend (USD)</h3>
                <MiniChart type="line" data={monthlyRevenueTrend} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
              </div>

              {/* Billing Sub-Tabs */}
              <div className="glass rounded-2xl border border-[#23324C]/60 overflow-hidden">
                <div className="flex gap-1 border-b border-[#23324C]/50 p-3 overflow-x-auto scrollbar-none">
                  {['Invoices', 'Payments', 'Failed Payments', 'Tax / GST Summary'].map(tab => (
                    <button key={tab} onClick={() => setBillingSubTab(tab)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                      billingSubTab === tab ? 'bg-brand-500 text-slate-950 shadow-md' : 'bg-[#111827]/40 border border-[#23324C]/50 text-slate-400 hover:text-slate-200'
                    }`}>{tab}</button>
                  ))}
                </div>
                <div className="p-5 text-xs">

                  {billingSubTab === 'Invoices' && (
                    <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                      <table className="w-full text-xs text-slate-350">
                        <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                          <tr>
                            <th className="p-3 text-left">Invoice ID</th>
                            <th className="p-3 text-left">Company</th>
                            <th className="p-3 text-left">Plan Tier</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-left">Due Date</th>
                            <th className="p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#23324C]/30">
                          {tenants.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-800/20">
                              <td className="p-3 font-mono font-bold text-slate-400">#INV-{1000 + idx + 1}</td>
                              <td className="p-3 font-bold text-white">{row.name}</td>
                              <td className="p-3 text-slate-300">{row.plan}</td>
                              <td className="p-3 text-right font-bold text-emerald-400">{row.plan === 'Starter' ? '$199.00' : row.plan === 'Professional' ? '$499.00' : '$1,299.00'}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>{row.status === 'Active' ? 'Paid' : 'Unpaid'}</span>
                              </td>
                              <td className="p-3 text-slate-400 font-mono text-[10px]">07/01/2026</td>
                              <td className="p-3 text-center">
                                <div className="flex gap-1 justify-center">
                                  <Button size="sm" variant="secondary" onClick={() => triggerToast(`Invoice #INV-${1000 + idx + 1} PDF generated.`)}>Download</Button>
                                  <Button size="sm" variant="outline" onClick={() => { setTempCompany(row); setInvoiceAmount(String(row.plan === 'Starter' ? 199 : row.plan === 'Professional' ? 499 : 1299)); setInvoicePeriod('June 2026'); setInvoiceModalOpen(true); }}>Regenerate</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {billingSubTab === 'Payments' && (
                    <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                      <table className="w-full text-xs text-slate-350">
                        <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                          <tr>
                            <th className="p-3 text-left">Payment ID</th>
                            <th className="p-3 text-left">Company</th>
                            <th className="p-3 text-left">Method</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#23324C]/30">
                          {tenants.filter(t => t.status === 'Active').map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-800/20">
                              <td className="p-3 font-mono font-bold text-slate-400">#PAY-{2000 + idx + 1}</td>
                              <td className="p-3 font-bold text-white">{row.name}</td>
                              <td className="p-3 text-slate-400">Stripe Card ····{4000 + idx}</td>
                              <td className="p-3 text-right font-bold text-emerald-400">{row.plan === 'Starter' ? '$199.00' : row.plan === 'Professional' ? '$499.00' : '$1,299.00'}</td>
                              <td className="p-3 text-slate-400 font-mono text-[10px]">06/{String(idx + 1).padStart(2, '0')}/2026</td>
                              <td className="p-3 text-center"><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">Successful</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {billingSubTab === 'Failed Payments' && (
                    <div className="space-y-4">
                      {tenants.filter(t => t.status === 'Hold').length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs italic">✅ No failed payments detected. Gateway is healthy.</div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                          <table className="w-full text-xs text-slate-350">
                            <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                              <tr>
                                <th className="p-3 text-left">Company</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-left">Failure Reason</th>
                                <th className="p-3 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#23324C]/30">
                              {tenants.filter(t => t.status === 'Hold').map(row => (
                                <tr key={row.id} className="hover:bg-slate-800/20">
                                  <td className="p-3 font-bold text-white">{row.name}</td>
                                  <td className="p-3 text-right font-bold text-red-400">{row.plan === 'Starter' ? '$199.00' : row.plan === 'Professional' ? '$499.00' : '$1,299.00'}</td>
                                  <td className="p-3 text-slate-400">Card Declined — Insufficient Funds</td>
                                  <td className="p-3 text-center">
                                    <div className="flex gap-1 justify-center">
                                      <Button size="sm" variant="outline" onClick={() => triggerToast(`Retrying payment for ${row.name}...`)}>Retry</Button>
                                      <Button size="sm" variant="secondary" onClick={() => handleSendReminder(row.id, row.name)}>Send Reminder</Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {billingSubTab === 'Tax / GST Summary' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-[10px]">
                        {[
                          { label: 'Total Tax Collected', value: `$${Math.round(calculatedMrrVal * 0.1).toLocaleString()}`, color: 'text-brand-400' },
                          { label: 'GST Rate', value: '10%', color: 'text-white' },
                          { label: 'Tax Filing Period', value: 'Q2 2026', color: 'text-emerald-400' },
                          { label: 'Nexus States', value: '8 States', color: 'text-amber-400' }
                        ].map(s => (
                          <div key={s.label} className="bg-[#111827]/40 border border-[#23324C]/50 rounded-xl p-3">
                            <span className={`text-sm font-black block ${s.color}`}>{s.value}</span>
                            <span className="text-slate-500 text-[9px] uppercase font-bold">{s.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                        <table className="w-full text-xs text-slate-350">
                          <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                            <tr>
                              <th className="p-3 text-left">Company</th>
                              <th className="p-3 text-right">Invoice Amount</th>
                              <th className="p-3 text-right">Tax Rate</th>
                              <th className="p-3 text-right">Tax Amount</th>
                              <th className="p-3 text-right">Total Inc. Tax</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#23324C]/30">
                            {tenants.filter(t => t.status === 'Active').map(row => {
                              const base = row.plan === 'Starter' ? 199 : row.plan === 'Professional' ? 499 : 1299;
                              const tax = Math.round(base * 0.1 * 100) / 100;
                              return (
                                <tr key={row.id} className="hover:bg-slate-800/20">
                                  <td className="p-3 font-bold text-white">{row.name}</td>
                                  <td className="p-3 text-right text-slate-300 font-mono">${base.toFixed(2)}</td>
                                  <td className="p-3 text-right text-slate-400">10%</td>
                                  <td className="p-3 text-right text-amber-400 font-bold font-mono">${tax.toFixed(2)}</td>
                                  <td className="p-3 text-right text-emerald-400 font-black font-mono">${(base + tax).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Export Actions */}
              <div className="p-4 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">Export billing records:</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => triggerToast('Exporting billing PDF report...')}>PDF Report</Button>
                  <Button size="sm" variant="outline" onClick={() => triggerToast('Exporting billing CSV...')}>CSV Export</Button>
                  <Button size="sm" variant="outline" onClick={() => triggerToast('Exporting tax summary...')}>Tax Report</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* 8 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Platform Revenue" value={formattedArr} description="Annual recurring revenue" trend="+12%" trendDirection="up" />
                <StatCard title="MRR Growth" value="+8.2%" description="Month-over-month" trend="Growing" trendDirection="up" />
                <StatCard title="Company Growth" value={`+${tenants.length}`} description="Total registered tenants" trend="+2 MTD" trendDirection="up" />
                <StatCard title="Active Users" value={tenants.reduce((a, t) => a + (t.users || 3), 0)} description="Platform users online" trend="+3 active" trendDirection="up" />
                <StatCard title="API Requests/min" value="1,250 RPM" description="Current throughput rate" trend="Stable" trendDirection="neutral" />
                <StatCard title="Storage Used" value={`${calculatedStorage.toFixed(2)} TB`} description="Total of 10 TB capacity" trend="Normal" trendDirection="neutral" />
                <StatCard title="Login Events" value={tenants.length * 14} description="User sessions (30 days)" trend="+5%" trendDirection="up" />
                <StatCard title="SLA Score" value="99.98%" description="Monthly uptime performance" trend="Target Met" trendDirection="up" />
              </div>

              {/* Revenue + Company Growth Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                  <h3 className="text-sm font-extrabold text-white mb-1">Platform Revenue Analytics (USD)</h3>
                  <p className="text-[10px] text-slate-500 mb-4">Monthly MRR vs Annual projection baseline.</p>
                  <MiniChart type="line" data={monthlyRevenueTrend} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
                </div>
                <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
                  <h3 className="text-sm font-extrabold text-white mb-1">Company Growth</h3>
                  <p className="text-[10px] text-slate-500 mb-4">New tenants provisioned per month.</p>
                  <MiniChart type="bar" data={[1, 2, 1, 3, 2, tenants.length]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
                </div>
              </div>

              {/* Module Usage Analytics */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Module Usage Analytics</h3>
                  <p className="text-[10px] text-slate-500">Most accessed platform modules across all tenants.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { module: 'Dispatch / Load Management', usage: 94, color: 'bg-brand-500' },
                    { module: 'Live GPS Tracking', usage: 87, color: 'bg-emerald-500' },
                    { module: 'Driver Management', usage: 82, color: 'bg-indigo-500' },
                    { module: 'Vehicle / Fleet', usage: 76, color: 'bg-amber-500' },
                    { module: 'Warehouse / Yard', usage: 68, color: 'bg-purple-500' },
                    { module: 'Accounts / Payroll', usage: 61, color: 'bg-cyan-500' },
                    { module: 'AI Load Parsing', usage: 54, color: 'bg-pink-500' },
                    { module: 'Customer Portal', usage: 48, color: 'bg-orange-500' }
                  ].map(item => (
                    <div key={item.module} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 font-semibold w-52 flex-shrink-0">{item.module}</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-2">
                        <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${item.usage}%` }} />
                      </div>
                      <span className="font-mono font-bold text-white w-10 text-right">{item.usage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Usage & Storage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                  <h3 className="text-sm font-extrabold text-white">API Usage Timeline</h3>
                  <p className="text-[10px] text-slate-500">API requests processed per day.</p>
                  <MiniChart type="line" data={[980, 1120, 1050, 1300, 1200, 1250]} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today']} />
                </div>
                <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                  <h3 className="text-sm font-extrabold text-white">Storage Usage per Company</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-slate-350">
                      <thead className="text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                        <tr><th className="pb-2 text-left">Company</th><th className="pb-2 text-right">Storage</th><th className="pb-2 text-right">% of Limit</th></tr>
                      </thead>
                      <tbody className="divide-y divide-[#23324C]/20">
                        {tenants.slice(0, 6).map((t, i) => {
                          const storage = (((t.users || 1) * 5 + (t.drivers || 0) * 10 + (t.vehicles || 0) * 15) / 1000);
                          const pct = Math.min(100, storage * 100);
                          return (
                            <tr key={t.id}>
                              <td className="py-2 font-bold text-white">{t.name}</td>
                              <td className="py-2 text-right font-mono text-slate-300">{storage.toFixed(2)} TB</td>
                              <td className="py-2 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <div className="w-16 bg-slate-900 rounded-full h-1">
                                    <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                                  </div>
                                  <span className="font-mono font-bold">{pct.toFixed(0)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Login Analytics */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                <h3 className="text-sm font-extrabold text-white">Login Analytics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-350">
                    <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                      <tr>
                        <th className="p-3 text-left">Company</th>
                        <th className="p-3 text-center">Monthly Logins</th>
                        <th className="p-3 text-center">Active Users</th>
                        <th className="p-3 text-left">Last Login</th>
                        <th className="p-3 text-center">Activity Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#23324C]/30">
                      {tenants.map((t, i) => (
                        <tr key={t.id} className="hover:bg-slate-800/20">
                          <td className="p-3 font-bold text-white">{t.name}</td>
                          <td className="p-3 text-center font-mono">{(t.users || 3) * 14 + i * 2}</td>
                          <td className="p-3 text-center font-mono text-brand-400 font-bold">{t.users || 3}</td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">{t.lastLogin || 'Today, 03:24 PM'}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 bg-slate-900 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${70 + (i * 5) % 30}%` }} />
                              </div>
                              <span className="font-mono font-bold text-emerald-400 text-[10px]">{70 + (i * 5) % 30}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <StatCard title="Total Transfers" value={mockTransfers.length} description="All-time platform transfers" trend="Synced" trendDirection="neutral" />
                <StatCard title="Completed" value={mockTransfers.filter(t => t.status === 'Completed').length} description="Successfully delivered" trend="Stable" trendDirection="neutral" />
                <StatCard title="In Transit" value={mockTransfers.filter(t => t.status === 'Transit').length} description="Currently in transit" trend="Active" trendDirection="neutral" />
                <StatCard title="Pending Approval" value={mockTransfers.filter(t => t.status === 'Pending').length} description="Awaiting admin approval" trend="Alert" trendDirection="down" />
                <StatCard title="Rejected" value={mockTransfers.filter(t => t.status === 'Rejected').length} description="Denied transfers" trend="Stable" trendDirection="neutral" />
              </div>

              {/* Transfer Registry */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Inter-Company Transfer Registry</h3>
                    <p className="text-[10px] text-slate-500">Full audit log of all platform asset and load transfers.</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <SearchInput value={transferSearchQuery} onChange={(e) => setTransferSearchQuery(e.target.value)} onClear={() => setTransferSearchQuery('')} placeholder="Search transfers..." className="w-full sm:max-w-[180px]" />
                    <select value={transferStatusFilter} onChange={(e) => setTransferStatusFilter(e.target.value)} className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none font-semibold cursor-pointer">
                      <option value="">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Transit">In Transit</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockTransfers.filter(t => {
                    const q = transferSearchQuery.toLowerCase();
                    const matchSearch = !transferSearchQuery || t.id.toLowerCase().includes(q) || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q) || t.item.toLowerCase().includes(q);
                    const matchStatus = !transferStatusFilter || t.status === transferStatusFilter;
                    return matchSearch && matchStatus;
                  }).map(transfer => (
                    <div key={transfer.id} className="border border-[#23324C]/60 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-[#111827]/30">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-slate-400 text-[10px]">#{transfer.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              transfer.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              transfer.status === 'Transit' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                              transfer.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>{transfer.status}</span>
                          </div>
                          <p className="text-xs font-bold text-white">{transfer.item}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            <span className="text-slate-300">{transfer.from}</span>
                            <span className="mx-2">→</span>
                            <span className="text-slate-300">{transfer.to}</span>
                            <span className="ml-3 font-mono">{transfer.date}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant={transfer.status === 'Pending' ? 'success' : 'secondary'} onClick={() => {
                            if (transfer.status === 'Pending') {
                              logAuditAction('Transfer Approved', `Transfer ${transfer.id} approved.`);
                              triggerToast(`Transfer ${transfer.id} approved successfully.`);
                            } else {
                              triggerToast(`Viewing full audit trail for ${transfer.id}.`);
                            }
                          }}>{transfer.status === 'Pending' ? 'Approve' : 'Audit Trail'}</Button>
                          {transfer.status === 'Pending' && (
                            <Button size="sm" variant="danger" onClick={() => { logAuditAction('Transfer Rejected', `Transfer ${transfer.id} rejected.`); triggerToast(`Transfer ${transfer.id} rejected.`, 'warning'); }}>Reject</Button>
                          )}
                          <button onClick={() => setTransferExpandedId(transferExpandedId === transfer.id ? null : transfer.id)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer">
                            {transferExpandedId === transfer.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Transfer Chain Viewer */}
                      {transferExpandedId === transfer.id && (
                        <div className="border-t border-[#23324C]/50 p-4 bg-[#0B0F19]/30">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Transfer Chain Viewer</p>
                          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
                            {transfer.chain.map((node, nIdx) => (
                              <React.Fragment key={nIdx}>
                                <div className="flex-shrink-0 bg-[#111827] border border-[#23324C]/60 rounded-xl px-3 py-2 text-center min-w-[120px]">
                                  <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${nIdx < transfer.chain.length - 1 || transfer.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                                  <p className="text-[9px] font-bold text-white">{node}</p>
                                  <p className="text-[8px] text-slate-500 mt-0.5">{nIdx === 0 ? 'Origin' : nIdx === transfer.chain.length - 1 ? 'Destination' : 'Transit Hub'}</p>
                                </div>
                                {nIdx < transfer.chain.length - 1 && <ArrowRight className="h-4 w-4 text-slate-500 flex-shrink-0" />}
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                            <div><span className="text-slate-500 block">Requested By</span><span className="font-bold text-white">{transfer.requestedBy}</span></div>
                            <div><span className="text-slate-500 block">Transfer Date</span><span className="font-bold text-white font-mono">{transfer.date}</span></div>
                            <div><span className="text-slate-500 block">Transfer ID</span><span className="font-mono font-bold text-brand-400">{transfer.id}</span></div>
                            <div><span className="text-slate-500 block">Status</span><StatusBadge status={transfer.status} /></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Transfer Permissions Matrix */}
                <div className="pt-4 border-t border-[#23324C]/40 space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Company Transfer Permissions Matrix</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-slate-350">
                      <thead className="text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                        <tr><th className="pb-2 text-left">Company</th><th className="pb-2 text-center">Can Send</th><th className="pb-2 text-center">Can Receive</th><th className="pb-2 text-center">Auto-Approve</th></tr>
                      </thead>
                      <tbody className="divide-y divide-[#23324C]/20">
                        {tenants.slice(0, 5).map((t, i) => (
                          <tr key={t.id}>
                            <td className="py-2 font-bold text-white">{t.name}</td>
                            <td className="py-2 text-center"><span className={i % 3 !== 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{i % 3 !== 0 ? '✓ Yes' : '✗ No'}</span></td>
                            <td className="py-2 text-center"><span className="text-emerald-400 font-bold">✓ Yes</span></td>
                            <td className="py-2 text-center">
                              <button onClick={() => triggerToast(`Auto-approve toggled for ${t.name}.`)} className="text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer border border-[#23324C]/60 hover:border-brand-500/40 text-slate-400 hover:text-slate-200">{i % 2 === 0 ? 'Enabled' : 'Disabled'}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-controls' && (
            <div className="space-y-6">
              {/* AI KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="AI Features Active" value={Object.values(aiFeatureToggles).filter(Boolean).length} description="Enabled AI modules" trend="Stable" trendDirection="neutral" />
                <StatCard title="AI Requests Today" value="4,820" description="Processed model inferences" trend="+12%" trendDirection="up" />
                <StatCard title="Avg Latency" value="142 ms" description="Model inference response time" trend="Good" trendDirection="neutral" />
                <StatCard title="Success Rate" value="98.7%" description="Successful AI job completions" trend="Target Met" trendDirection="up" />
                <StatCard title="Failed Requests" value="62" description="Errors in last 24 hrs" trend="Low" trendDirection="neutral" />
                <StatCard title="AI Storage" value="0.84 TB" description="Model artifacts + embeddings" trend="Stable" trendDirection="neutral" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* AI Feature Toggles */}
                <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">AI Feature Enable / Disable</h3>
                    <p className="text-[10px] text-slate-500">Control which AI modules are active globally.</p>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(aiFeatureToggles).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl">
                        <div>
                          <span className="text-xs font-bold text-white block">{feature}</span>
                          <span className={`text-[9px] font-bold ${enabled ? 'text-emerald-400' : 'text-slate-500'}`}>{enabled ? '● Active' : '○ Inactive'}</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...aiFeatureToggles, [feature]: !enabled };
                            setAiFeatureToggles(updated);
                            localStorage.setItem('hero_ai_toggles', JSON.stringify(updated));
                            logAuditAction('AI Feature Toggle', `${feature} ${!enabled ? 'enabled' : 'disabled'}.`);
                            triggerToast(`${feature} ${!enabled ? 'enabled' : 'disabled'}.`, !enabled ? 'success' : 'warning');
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${enabled ? 'bg-brand-500' : 'bg-slate-700'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => {
                    const allEnabled = Object.fromEntries(Object.keys(aiFeatureToggles).map(k => [k, true]));
                    setAiFeatureToggles(allEnabled);
                    localStorage.setItem('hero_ai_toggles', JSON.stringify(allEnabled));
                    triggerToast('All AI features enabled.');
                  }}>Enable All Features</Button>
                </div>

                {/* AI Config + Activity Logs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">AI Model Configuration & Limits</h3>
                      <p className="text-[10px] text-slate-500">Configure confidence thresholds and daily processing limits.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'loadParse', label: 'Load Parse Confidence (%)', unit: '%' },
                        { key: 'ocrScan', label: 'Receipt OCR Confidence (%)', unit: '%' },
                        { key: 'odometer', label: 'Odometer Detection (%)', unit: '%' },
                        { key: 'dailyCalls', label: 'Daily API Call Limit', unit: '/day' }
                      ].map(field => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block">{field.label}</label>
                          <div className="flex items-center gap-1">
                            <input type="number" value={aiLimits[field.key]} onChange={(e) => setAiLimits(prev => ({ ...prev, [field.key]: e.target.value }))} className="flex-1 bg-[#0B0F19]/50 border border-[#23324C] hover:border-brand-500/20 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                            <span className="text-[10px] text-slate-500 font-mono">{field.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="primary" size="sm" onClick={() => { logAuditAction('AI Config Saved', 'AI model thresholds and limits updated.'); triggerToast('AI model configuration saved successfully.'); }}>Save AI Configuration</Button>
                  </div>

                  <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">AI Activity Logs</h3>
                      <p className="text-[10px] text-slate-500">Recent AI model events and processing history.</p>
                    </div>
                    <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-none">
                      {[
                        { feature: 'Load Parse AI', event: 'Confidence threshold crossed — load #LDX-9021 rejected', time: '2026-06-26 16:42', type: 'warning' },
                        { feature: 'Receipt Scan OCR', event: 'Batch scan completed — 14 receipts processed', time: '2026-06-26 15:30', type: 'success' },
                        { feature: 'Odometer Detection', event: 'Anomaly detected — vehicle #VH-443 odometer mismatch', time: '2026-06-26 14:15', type: 'error' },
                        { feature: 'Smart Dispatch', event: 'Feature disabled by administrator', time: '2026-06-26 12:00', type: 'info' },
                        { feature: 'ETA Prediction', event: 'Model retrained — accuracy improved to 94.2%', time: '2026-06-25 22:10', type: 'success' },
                        ...((auditLogs || []).filter(l => l.action?.includes('AI')).slice(0, 3).map(l => ({ feature: 'Platform', event: l.detail, time: l.time, type: 'info' })))
                      ].slice(0, 8).map((log, idx) => (
                        <div key={idx} className="flex gap-3 p-2.5 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl items-start">
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.type === 'success' ? 'bg-emerald-400' : log.type === 'error' ? 'bg-red-400' : log.type === 'warning' ? 'bg-amber-400' : 'bg-brand-400'}`} />
                          <div className="flex-1">
                            <p className="text-[10px] text-white font-bold">{log.feature}</p>
                            <p className="text-[10px] text-slate-400">{log.event}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Usage Analytics */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-3">
                <h3 className="text-sm font-extrabold text-white">AI Usage Analytics — Requests by Feature</h3>
                <div className="space-y-2.5">
                  {Object.entries(aiFeatureToggles).map(([feature, enabled], i) => {
                    const requests = enabled ? ([1200, 980, 840, 620, 480, 320][i] || 200) : 0;
                    return (
                      <div key={feature} className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400 font-semibold w-44 flex-shrink-0">{feature}</span>
                        <div className="flex-1 bg-slate-900 rounded-full h-2">
                          <div className={`h-full rounded-full transition-all ${enabled ? 'bg-brand-500' : 'bg-slate-700'}`} style={{ width: enabled ? `${(requests / 1200) * 100}%` : '3%' }} />
                        </div>
                        <span className="font-mono font-bold text-white w-16 text-right">{requests.toLocaleString()} req</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 text-left">
              <div className="glass rounded-2xl border border-[#23324C]/60 overflow-hidden">
                <div className="flex gap-1 border-b border-[#23324C]/50 p-3 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'smtp', label: 'SMTP / Email' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'security', label: 'Security' },
                    { id: 'apikeys', label: 'API Keys' },
                    { id: 'backup', label: 'Backup & Restore' },
                    { id: 'auditlogs', label: 'Audit Logs' }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setSettingsSubTab(tab.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                      settingsSubTab === tab.id ? 'bg-brand-500 text-slate-950 shadow-md' : 'bg-[#111827]/40 border border-[#23324C]/50 text-slate-400 hover:text-slate-200'
                    }`}>{tab.label}</button>
                  ))}
                </div>

                <div className="p-5">
                  {settingsSubTab === 'general' && (
                    <div className="space-y-5 max-w-2xl">
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Platform General Settings</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Configure core platform parameters and default behaviors.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label="Platform Name" defaultValue="Hero Logistics System" />
                        <TextInput label="Support Email" defaultValue="platform-support@hero.com" />
                        <TextInput label="Database Master Endpoint" defaultValue="aurora-cluster-prod.hero-internal" />
                        <TextInput label="Default Timezone" defaultValue="UTC-5 (Eastern)" />
                        <TextInput label="Default Language" defaultValue="en-US" />
                        <TextInput label="Platform Version" defaultValue="v4.1.0-enterprise" />
                      </div>
                      <div className="p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">Maintenance Mode</span>
                          <span className="text-[9px] text-slate-500">Prevents non-admin logins during maintenance windows.</span>
                        </div>
                        <button onClick={() => { setMaintenanceMode(!maintenanceMode); logAuditAction('Maintenance Mode', `Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}.`); triggerToast(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}.`, !maintenanceMode ? 'warning' : 'success'); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-700'}`}>
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform ${maintenanceMode ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <Button variant="primary" onClick={() => { logAuditAction('Settings Saved', 'General platform settings updated.'); triggerToast('General platform settings saved.'); }}>Save General Settings</Button>
                    </div>
                  )}

                  {settingsSubTab === 'smtp' && (
                    <div className="space-y-5 max-w-2xl">
                      <div>
                        <h3 className="text-sm font-extrabold text-white">SMTP / Email Configuration</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Configure outbound email delivery settings.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'host', label: 'SMTP Host', type: 'text' },
                          { key: 'port', label: 'SMTP Port', type: 'text' },
                          { key: 'username', label: 'SMTP Username', type: 'text' },
                          { key: 'fromName', label: 'From Name', type: 'text' },
                          { key: 'fromEmail', label: 'From Email', type: 'email' }
                        ].map(field => (
                          <div key={field.key} className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block uppercase">{field.label}</label>
                            <input type={field.type} value={smtpSettings[field.key]} onChange={e => setSmtpSettings(p => ({ ...p, [field.key]: e.target.value }))} className="w-full bg-[#0B0F19]/50 border border-[#23324C] hover:border-brand-500/20 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                          </div>
                        ))}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block uppercase">SMTP Password</label>
                          <input type="password" defaultValue="••••••••••••" className="w-full bg-[#0B0F19]/50 border border-[#23324C] hover:border-brand-500/20 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="primary" onClick={() => { logAuditAction('SMTP Settings Saved', 'Email server configuration updated.'); triggerToast('SMTP settings saved successfully.'); }}>Save SMTP Settings</Button>
                        <Button variant="secondary" onClick={() => triggerToast('Test email sent to platform-support@hero.com.')}>Send Test Email</Button>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'notifications' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Notification & Alert Configuration</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Toggle platform-wide alert notifications.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { key: 'failedPayment', label: 'Failed Payment Alerts', desc: 'Notify when Stripe gateway returns payment failure.' },
                          { key: 'trialExpiry', label: 'Trial Expiry Alerts', desc: 'Alert 3 days before trial workspaces expire.' },
                          { key: 'renewalReminder', label: 'Subscription Renewal Alerts', desc: 'Send renewal reminder 7 days before expiry.' },
                          { key: 'highLoad', label: 'High System Load Alerts', desc: 'Alert when platform CPU exceeds 85% threshold.' },
                          { key: 'slaAlert', label: 'Support SLA Alerts', desc: 'Escalate when ticket response time exceeds SLA target.' },
                          { key: 'securityAlert', label: 'Security Alerts', desc: 'Notify on suspicious login activity or brute force.' },
                          { key: 'platformError', label: 'Platform Error Alerts', desc: 'Alert on 5xx server errors and database failures.' }
                        ].map(notif => (
                          <div key={notif.key} className="flex items-center justify-between p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl">
                            <div className="flex-1 pr-4">
                              <span className="text-xs font-bold text-white block">{notif.label}</span>
                              <p className="text-[9px] text-slate-500 leading-normal mt-0.5">{notif.desc}</p>
                            </div>
                            <button onClick={() => { const updated = { ...notifToggles, [notif.key]: !notifToggles[notif.key] }; setNotifToggles(updated); triggerToast(`${notif.label} ${!notifToggles[notif.key] ? 'enabled' : 'disabled'}.`); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${notifToggles[notif.key] ? 'bg-brand-500' : 'bg-slate-700'}`}>
                              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform ${notifToggles[notif.key] ? 'translate-x-4' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button variant="primary" onClick={() => { logAuditAction('Notification Settings Saved', 'Alert configurations updated.'); triggerToast('Notification settings saved.'); }}>Save Notification Settings</Button>
                    </div>
                  )}

                  {settingsSubTab === 'security' && (
                    <div className="space-y-5 max-w-2xl">
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Security Configuration</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Manage platform access security policies.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Two-Factor Authentication</span>
                            <span className="text-[9px] text-slate-500">Enforce TOTP / SMS verification on every Super Admin login.</span>
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">Enforced</span>
                        </div>
                        <div className="p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl space-y-2">
                          <span className="text-xs font-black text-white">Session Timeout</span>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-slate-400 font-bold w-36">Timeout (minutes)</label>
                            <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="w-24 bg-[#0B0F19]/50 border border-[#23324C] text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                          </div>
                        </div>
                        <div className="p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl space-y-2">
                          <span className="text-xs font-black text-white">IP Whitelist</span>
                          <textarea rows={3} defaultValue={`192.168.1.0/24\n10.0.0.0/8\n203.45.12.0/24`} className="w-full bg-[#0B0F19]/50 border border-[#23324C] text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono" />
                          <p className="text-[9px] text-slate-500">One CIDR block per line. Leave blank to allow all IPs.</p>
                        </div>
                        <div className="p-3 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Login Attempt Limit</span>
                            <span className="text-[9px] text-slate-500">Lock account after 5 consecutive failed logins.</span>
                          </div>
                          <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded text-[9px] font-bold">5 attempts</span>
                        </div>
                      </div>
                      <Button variant="primary" onClick={() => { logAuditAction('Security Settings Saved', 'Platform security policies updated.'); triggerToast('Security configuration saved.'); }}>Save Security Settings</Button>
                    </div>
                  )}

                  {settingsSubTab === 'apikeys' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-extrabold text-white">API Keys Management</h3>
                          <p className="text-[10px] text-slate-500 mt-1">Manage platform API access credentials.</p>
                        </div>
                        <Button variant="primary" size="sm" icon={Plus} onClick={() => {
                          const newKey = { id: Date.now(), name: `API Key ${apiKeysList.length + 1}`, key: `hlk_${Math.random().toString(36).slice(2, 6)}...`, created: new Date().toISOString().split('T')[0], lastUsed: 'Never', status: 'Active' };
                          const updated = [...apiKeysList, newKey];
                          setApiKeysList(updated);
                          localStorage.setItem('hero_api_keys', JSON.stringify(updated));
                          triggerToast('New API key generated.');
                        }}>Generate New Key</Button>
                      </div>
                      <div className="space-y-3">
                        {apiKeysList.map(apiKey => (
                          <div key={apiKey.id} className="p-4 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <span className="text-xs font-bold text-white block">{apiKey.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">{apiKey.key}</span>
                                <button onClick={() => triggerToast('API key copied to clipboard.')} className="text-slate-500 hover:text-slate-300 cursor-pointer"><Copy className="h-3 w-3" /></button>
                              </div>
                              <p className="text-[9px] text-slate-500 mt-1">Created: {apiKey.created} · Last used: {apiKey.lastUsed}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">{apiKey.status}</span>
                              <Button size="sm" variant="outline" onClick={() => { logAuditAction('API Key Rotated', `API key "${apiKey.name}" rotated.`); triggerToast(`${apiKey.name} rotated successfully.`); }}>Rotate</Button>
                              <Button size="sm" variant="danger" onClick={() => {
                                const updated = apiKeysList.filter(k => k.id !== apiKey.id);
                                setApiKeysList(updated);
                                localStorage.setItem('hero_api_keys', JSON.stringify(updated));
                                logAuditAction('API Key Revoked', `API key "${apiKey.name}" revoked.`);
                                triggerToast(`${apiKey.name} revoked.`, 'warning');
                              }}>Revoke</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'backup' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Backup & Restore</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Manage platform data backup schedule and restore points.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl space-y-3">
                          <span className="text-xs font-black text-white uppercase tracking-wide">Backup Schedule</span>
                          <div className="space-y-2 text-xs">
                            {[['Frequency', 'Daily at 02:00 UTC'], ['Retention', '30 days'], ['Backup Type', 'Full Snapshot'], ['Storage Location', 'AWS S3 us-east-1'], ['Last Backup', '2026-06-26 02:01 UTC'], ['Backup Size', '2.34 GB']].map(([k, v]) => (
                              <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className={`font-bold ${k === 'Last Backup' ? 'text-emerald-400' : 'text-white'}`}>{v}</span></div>
                            ))}
                          </div>
                          <Button variant="primary" size="sm" className="w-full" onClick={() => triggerToast('Manual backup initiated. This may take a few minutes.')}>Run Manual Backup</Button>
                        </div>
                        <div className="p-4 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl space-y-3">
                          <span className="text-xs font-black text-white uppercase tracking-wide">Restore Points</span>
                          <div className="space-y-2">
                            {['2026-06-26 02:01 UTC', '2026-06-25 02:01 UTC', '2026-06-24 02:01 UTC', '2026-06-23 02:01 UTC'].map((date, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-[#0B0F19]/40 border border-[#23324C]/40 rounded-lg">
                                <div>
                                  <span className="text-xs font-bold text-white font-mono">{date}</span>
                                  <span className="text-[9px] text-slate-500 block">Full snapshot · {(2.34 - i * 0.1).toFixed(2)} GB</span>
                                </div>
                                <Button size="sm" variant="danger" onClick={() => triggerToast(`Restore point ${date} initiated. Platform will restart.`, 'warning')}>Restore</Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'auditlogs' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-white">Platform Audit Logs</h3>
                          <p className="text-[10px] text-slate-500 mt-1">Complete record of all administrative actions.</p>
                        </div>
                        <div className="flex gap-3">
                          <input type="text" placeholder="Filter by action..." value={auditLogsActionFilter} onChange={e => setAuditLogsActionFilter(e.target.value)} className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none w-36" />
                          <input type="date" value={auditLogsDateFilter} onChange={e => setAuditLogsDateFilter(e.target.value)} className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none" />
                          <Button size="sm" variant="outline" onClick={() => { setAuditLogsActionFilter(''); setAuditLogsDateFilter(''); }}>Reset</Button>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                        <table className="w-full text-xs text-slate-350">
                          <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                            <tr>
                              <th className="p-3 text-left">Log ID</th>
                              <th className="p-3 text-left">Action</th>
                              <th className="p-3 text-left">Detail</th>
                              <th className="p-3 text-left">Company</th>
                              <th className="p-3 text-left">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#23324C]/30">
                            {(auditLogs || []).filter(l => {
                              const matchAction = !auditLogsActionFilter || (l.action || '').toLowerCase().includes(auditLogsActionFilter.toLowerCase());
                              const matchDate = !auditLogsDateFilter || (l.time || '').includes(auditLogsDateFilter);
                              return matchAction && matchDate;
                            }).slice(0, 25).map(log => (
                              <tr key={log.id} className="hover:bg-slate-800/20">
                                <td className="p-3 font-mono text-slate-500 text-[10px]">#{log.id}</td>
                                <td className="p-3 font-bold text-white">{log.action}</td>
                                <td className="p-3 text-slate-400 max-w-[200px] truncate">{log.detail}</td>
                                <td className="p-3 text-slate-400">{log.companyName || '—'}</td>
                                <td className="p-3 text-slate-500 font-mono text-[10px]">{log.time}</td>
                              </tr>
                            ))}
                            {(!auditLogs || auditLogs.length === 0) && (
                              <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic text-xs">No audit logs recorded yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => triggerToast('Audit logs exported as CSV.')}>Export Audit Log CSV</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              {/* Support KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <StatCard title="Total Tickets" value={tickets.length} description="All-time support tickets" trend="Synced" trendDirection="neutral" />
                <StatCard title="Open Tickets" value={tickets.filter(t => t.status === 'Open').length} description="Requiring response" trend="Alert" trendDirection="down" />
                <StatCard title="Resolved" value={tickets.filter(t => t.status === 'Resolved').length} description="Closed successfully" trend="Stable" trendDirection="neutral" />
                <StatCard title="High Priority" value={tickets.filter(t => t.priority === 'High' && t.status === 'Open').length} description="Urgent escalations" trend="Alert" trendDirection="down" />
                <StatCard title="Avg Response" value="2.4 hrs" description="Average first reply time" trend="Stable" trendDirection="neutral" />
              </div>

              {/* Ticket Management Table */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Support Ticket Queue</h3>
                    <p className="text-[10px] text-slate-500">Manage inbound platform support requests.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} placeholder="Search tickets..." className="w-full sm:max-w-[180px]" />
                    <select value={supportPriorityFilter} onChange={(e) => setSupportPriorityFilter(e.target.value)} className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none font-semibold cursor-pointer">
                      <option value="">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <select value={supportStatusFilter} onChange={(e) => setSupportStatusFilter(e.target.value)} className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-xs text-slate-300 outline-none font-semibold cursor-pointer">
                      <option value="">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <Button variant="primary" size="sm" icon={Plus} onClick={() => triggerToast('New support ticket creation form loaded.')}>New Ticket</Button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#23324C]/50">
                  <table className="w-full text-xs text-slate-350">
                    <thead className="bg-[#161F30]/60 text-slate-500 uppercase font-black border-b border-[#23324C]/50">
                      <tr>
                        <th className="p-3 text-left">Ticket ID</th>
                        <th className="p-3 text-left">Company</th>
                        <th className="p-3 text-left">Subject</th>
                        <th className="p-3 text-center">Priority</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-left">Assigned Agent</th>
                        <th className="p-3 text-left">Created</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#23324C]/30">
                      {tickets.filter(t => {
                        const q = (searchQuery || '').toLowerCase();
                        const matchSearch = !searchQuery || (t.subject || '').toLowerCase().includes(q) || (t.company || '').toLowerCase().includes(q);
                        const matchPriority = !supportPriorityFilter || t.priority === supportPriorityFilter;
                        const matchStatus = !supportStatusFilter || t.status === supportStatusFilter;
                        return matchSearch && matchPriority && matchStatus;
                      }).map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-800/20">
                          <td className="p-3 font-mono font-bold text-slate-400">#{t.id}</td>
                          <td className="p-3 font-bold text-white">{t.company || tenants[idx % Math.max(tenants.length, 1)]?.name || 'Hero Platform'}</td>
                          <td className="p-3 text-slate-300 max-w-[180px] truncate">{t.subject}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              t.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>{t.priority || 'Medium'}</span>
                          </td>
                          <td className="p-3 text-center"><StatusBadge status={t.status} /></td>
                          <td className="p-3 text-slate-400">{t.assignedAgent || 'Unassigned'}</td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{t.createdAt || '2026-06-20'}</td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-center flex-wrap">
                              <Button size="sm" variant="secondary" onClick={() => { setSelectedTicket(t); setTicketDrawerOpen(true); }}>View</Button>
                              <Button size="sm" variant="outline" onClick={() => { logAuditAction('Ticket Assigned', `Ticket #${t.id} assigned to support team.`); triggerToast(`Ticket #${t.id} assigned to L2 support.`); }}>Assign</Button>
                              <Button size="sm" variant="success" onClick={() => { logAuditAction('Ticket Resolved', `Ticket #${t.id} closed.`); triggerToast(`Ticket #${t.id} marked resolved.`); }}>Resolve</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tickets.length === 0 && (
                        <tr><td colSpan={8} className="p-8 text-center text-slate-500 italic text-xs">No support tickets in the queue.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Response History */}
                {tickets.filter(t => t.replies && t.replies.length > 0).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#23324C]/40">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Response History</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none">
                      {tickets.filter(t => t.replies?.length > 0).flatMap(t => (t.replies || []).map(r => ({ ...r, ticketId: t.id, subject: t.subject }))).slice(0, 5).map((r, i) => (
                        <div key={i} className="p-2.5 bg-[#111827]/40 border border-[#23324C]/50 rounded-xl text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-white">Ticket #{r.ticketId} — {r.subject}</span>
                            <span className="text-slate-500 font-mono text-[9px]">{r.time}</span>
                          </div>
                          <p className="text-slate-400">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      </Modal>      {/* Tenant Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title="Tenant Workspace Inspector">
        {activeCompany && (() => {
          const selectedCompany = activeCompany;
          return (
            <div className="space-y-4 text-left text-slate-300 text-xs sm:text-sm">
              {/* Header info */}
              <div className="border-b border-[#23324C]/60 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-base font-black text-white">{selectedCompany.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Workspace ID: #TEN-{selectedCompany.id}</span>
                </div>
                <StatusBadge status={selectedCompany.status} />
              </div>



              {/* Details Tabs Selector */}
              <div className="flex gap-1 overflow-x-auto pb-2 border-b border-[#23324C]/40 scrollbar-none">
                {(activeTab === 'subscriptions' 
                  ? [
                      { id: 'overview', label: 'Overview' },
                      { id: 'billing', label: 'Billing' },
                      { id: 'invoices', label: 'Invoices' },
                      { id: 'payments', label: 'Payments' },
                      { id: 'usage', label: 'Usage' },
                      { id: 'features', label: 'Feature Access' },
                      { id: 'audit', label: 'Audit Logs' }
                    ]
                  : [
                      { id: 'overview', label: 'Overview' },
                      { id: 'subscription', label: 'Subscription' },
                      { id: 'users', label: 'Users' },
                      { id: 'branches', label: 'Branches' },
                      { id: 'fleet', label: 'Fleet' },
                      { id: 'loads', label: 'Loads' },
                      { id: 'billing', label: 'Billing' },
                      { id: 'support', label: 'Support Tickets' },
                      { id: 'features', label: 'Feature Access' },
                      { id: 'audit', label: 'Audit Logs' }
                    ]
                ).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCompanyDetailsTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      companyDetailsTab === tab.id 
                        ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/10' 
                        : 'text-slate-450 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-2 space-y-3 min-h-[300px]">
                {companyDetailsTab === 'overview' && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#111827] p-3 border border-[#23324C]/50 rounded-xl space-y-2">
                      <h5 className="font-extrabold text-white">General Information</h5>
                      <div className="grid grid-cols-2 gap-2 text-slate-400">
                        <div>Account Manager: <span className="text-white font-semibold">{selectedCompany.manager || 'Alex W.'}</span></div>
                        <div>Region/Country: <span className="text-white font-semibold">{selectedCompany.country || 'USA'}</span></div>
                        <div>Joined Date: <span className="text-white font-semibold">{selectedCompany.joined}</span></div>
                        <div>Last Login: <span className="text-white font-semibold">{selectedCompany.lastLogin || 'Today, 03:24 PM'}</span></div>
                      </div>
                    </div>
                    <div className="bg-[#111827] p-3 border border-[#23324C]/50 rounded-xl space-y-2">
                      <h5 className="font-extrabold text-white">Resource Metrics</h5>
                      <div className="grid grid-cols-2 gap-2 text-slate-400">
                        <div>Active Users: <span className="text-white font-semibold font-mono">{selectedCompany.users !== undefined ? selectedCompany.users : 1}</span></div>
                        <div>Total Drivers: <span className="text-white font-semibold font-mono">{selectedCompany.drivers || 0}</span></div>
                        <div>Fleet Vehicles: <span className="text-white font-semibold font-mono">{selectedCompany.vehicles !== undefined ? selectedCompany.vehicles : 0}</span></div>
                        <div>Branches count: <span className="text-white font-semibold font-mono">{selectedCompany.branches !== undefined ? selectedCompany.branches : 1}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'subscription' && (
                  <div className="space-y-3 text-xs bg-[#111827] p-3 border border-[#23324C]/50 rounded-xl">
                    <h5 className="font-extrabold text-white">Subscription Licensing Contract</h5>
                    <div className="space-y-2 text-slate-400">
                      <div>Current Tier Plan: <strong className="text-brand-400 font-extrabold">{selectedCompany.plan} Plan</strong></div>
                      <div>Contract Billing Rate: <span className="text-white font-bold">{selectedCompany.revenue !== undefined ? `$${selectedCompany.revenue.toLocaleString()} / month` : (selectedCompany.plan === 'Starter' ? '$199.00 / month' : (selectedCompany.plan === 'Professional' ? '$499.00 / month' : '$1,299.00 / month'))}</span></div>
                      <div>Billing Cycle Period: <span className="text-white font-semibold">Monthly Auto-Renewal recurring</span></div>
                      <div>Next Renewal Invoice Date: <span className="text-white font-semibold">{selectedCompany.nextRenewalDate || '07/24/2026'}</span></div>
                      <div>Trial Expiry: <span className="text-slate-350 font-semibold">{selectedCompany.trialExpiry || (selectedCompany.plan === 'Starter' ? '07/15/2026' : 'N/A')}</span></div>
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'users' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Registered Account Staff Members</span>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {(selectedCompany.usersList && selectedCompany.usersList.length > 0 ? selectedCompany.usersList : [
                        { name: selectedCompany.manager || 'Alexander Wright', role: 'Company Admin', email: selectedCompany.manager || 'admin@company.com', status: 'Active' }
                      ]).map((usr, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div className="text-left">
                            <strong className="text-white block font-bold">{usr.name}</strong>
                            <span className="text-[10px] text-slate-500 font-mono">{usr.email}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-300 block">{usr.role}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold">{usr.status || 'Active'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'branches' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Branch Terminals</span>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {(selectedCompany.branchesList && selectedCompany.branchesList.length > 0 ? selectedCompany.branchesList : [
                        { name: 'Chicago HQ Terminal', city: 'Chicago, IL', staff: '8 Staff' }
                      ]).map((br, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div className="text-left">
                            <strong className="text-white block font-bold">{br.name}</strong>
                            <span className="text-[10px] text-slate-500">{br.city}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{br.staff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'fleet' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Registered Fleet Asset Vehicles</span>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {(selectedCompany.vehiclesList && selectedCompany.vehiclesList.length > 0 ? selectedCompany.vehiclesList : [
                        { plate: 'TX-ROAD88', type: 'Semi-Truck', status: 'Active' }
                      ]).map((veh, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div className="text-left">
                            <strong className="text-white block font-bold">{veh.plate}</strong>
                            <span className="text-[10px] text-slate-500">{veh.type}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold">{veh.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'loads' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Loads Manifest Summary</span>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {(selectedCompany.loadsList && selectedCompany.loadsList.length > 0 ? selectedCompany.loadsList : [
                        { id: 'LD-9411', route: 'Chicago ➔ Dallas', cargo: 'Automotive Components', status: 'In Transit' }
                      ]).map((ld, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div className="text-left font-semibold">
                            <span className="text-white block font-bold">Load {ld.id}</span>
                            <span className="text-[10px] text-slate-550">{ld.route} ({ld.cargo})</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold">{ld.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'billing' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Billing Summary & Ledger</span>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3 text-xs space-y-2 text-slate-400 mb-3">
                      <div className="flex justify-between"><span>Subscription Revenue:</span><strong className="text-emerald-400 font-mono">${selectedCompany.revenue || (selectedCompany.plan === 'Starter' ? 199 : (selectedCompany.plan === 'Professional' ? 499 : 1299))}/mo</strong></div>
                      <div className="flex justify-between"><span>Annual Projected:</span><strong className="text-white font-mono">${(selectedCompany.revenue || (selectedCompany.plan === 'Starter' ? 199 : (selectedCompany.plan === 'Professional' ? 499 : 1299))) * 12}/yr</strong></div>
                      <div className="flex justify-between"><span>Billing Cycle:</span><strong className="text-white">Monthly Recurring</strong></div>
                      <div className="flex justify-between"><span>Auto Renewal:</span><strong className={selectedCompany.autoRenewal !== false ? 'text-emerald-400' : 'text-amber-400'}>{selectedCompany.autoRenewal !== false ? 'Enabled' : 'Disabled'}</strong></div>
                    </div>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {(selectedCompany.invoices && selectedCompany.invoices.length > 0 ? selectedCompany.invoices : [
                        { id: 'INV-402', plan: selectedCompany.plan, amount: selectedCompany.plan === 'Starter' ? 199 : (selectedCompany.plan === 'Professional' ? 499 : 1299), date: '06/01/2026', status: 'Paid', period: '06/01/2026 - 07/01/2026' }
                      ]).map((inv, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div className="text-left font-semibold">
                            <span className="text-white block font-bold">Invoice #{inv.id}</span>
                            <span className="text-[10px] text-slate-500">Period: {inv.period || inv.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-355 block">${inv.amount}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companyDetailsTab === 'support' && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Inbound Ticket Queries Raised</span>
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {tickets && tickets.filter(t => t.tenantName === selectedCompany.name).length > 0 ? (
                        tickets.filter(t => t.tenantName === selectedCompany.name).map((tk, i) => (
                          <div key={i} className="p-2.5 flex justify-between items-center">
                            <div className="text-left font-semibold">
                              <span className="text-white block font-bold">#{tk.id} • {tk.title || tk.subject}</span>
                              <span className="text-[9px] text-slate-500">Priority: {tk.priority}</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-extrabold">{tk.status}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 font-semibold">No support tickets found.</div>
                      )}
                    </div>
                  </div>
                )}

              {companyDetailsTab === 'invoices' && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Invoices Ledger</span>
                  {selectedCompany.invoices && selectedCompany.invoices.length > 0 ? (
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {selectedCompany.invoices.map((inv, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div>
                            <span className="text-white block font-bold">{inv.id}</span>
                            <span className="text-[10px] text-slate-500">Period: {inv.period || 'Subscription Term'}</span>
                            <span className="text-[9px] text-slate-455 block font-mono">Date: {inv.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-300 block">${inv.amount}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 font-semibold bg-[#111827] rounded-xl border border-[#23324C]/45">No invoices found.</div>
                  )}
                </div>
              )}

              {companyDetailsTab === 'payments' && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Payment Transactions</span>
                  {selectedCompany.payments && selectedCompany.payments.length > 0 ? (
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl divide-y divide-[#23324C]/30 text-xs">
                      {selectedCompany.payments.map((pmt, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <div>
                            <span className="text-white block font-bold">{pmt.id}</span>
                            <span className="text-[10px] text-slate-500">Method: {pmt.method}</span>
                            <span className="text-[9px] text-slate-455 block font-mono">Date: {pmt.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400 block">${pmt.amount}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold">{pmt.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 font-semibold bg-[#111827] rounded-xl border border-[#23324C]/45">No payments recorded.</div>
                  )}
                </div>
              )}

              {companyDetailsTab === 'usage' && (
                <div className="space-y-4">
                  {(() => {
                    const limitViolations = validatePlanLimits(selectedCompany);
                    const users = selectedCompany.users || 0;
                    const drivers = selectedCompany.drivers || 0;
                    const vehicles = selectedCompany.vehicles || 0;
                    
                    const userLimit = selectedCompany.plan === 'Starter' ? 3 : (selectedCompany.plan === 'Professional' ? 15 : 'Unlimited');
                    const driverLimit = selectedCompany.plan === 'Starter' ? 5 : (selectedCompany.plan === 'Professional' ? 30 : 'Unlimited');
                    const vehicleLimit = selectedCompany.plan === 'Starter' ? 5 : (selectedCompany.plan === 'Professional' ? 30 : 'Unlimited');

                    return (
                      <div className="space-y-3.5">
                        {limitViolations.length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl space-y-1 text-xs">
                            <strong className="flex items-center gap-1.5 font-bold"><AlertCircle className="h-4 w-4" /> Plan Limit Violations Detected</strong>
                            <p className="text-[11px] text-slate-350">The current resource usage exceeds the limits defined by the {selectedCompany.plan} plan:</p>
                            <ul className="list-disc pl-5 text-[11px] font-semibold">
                              {limitViolations.map((v, i) => <li key={i}>{v} exceeded</li>)}
                            </ul>
                          </div>
                        )}
                        
                        <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3.5 text-xs space-y-3">
                          <h5 className="font-extrabold text-white">Resource Metrics vs Plan Limits</h5>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-bold">
                              <span>Users Usage</span>
                              <span>{users} / {userLimit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0B0F19] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${userLimit !== 'Unlimited' && users > userLimit ? 'bg-red-500' : 'bg-brand-500'}`} 
                                style={{ width: userLimit === 'Unlimited' ? '10%' : `${Math.min((users / userLimit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between font-bold">
                              <span>Drivers Usage</span>
                              <span>{drivers} / {driverLimit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0B0F19] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${driverLimit !== 'Unlimited' && drivers > driverLimit ? 'bg-red-500' : 'bg-brand-500'}`} 
                                style={{ width: driverLimit === 'Unlimited' ? '10%' : `${Math.min((drivers / driverLimit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between font-bold">
                              <span>Vehicles Usage</span>
                              <span>{vehicles} / {vehicleLimit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0B0F19] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${vehicleLimit !== 'Unlimited' && vehicles > vehicleLimit ? 'bg-red-500' : 'bg-brand-500'}`} 
                                style={{ width: vehicleLimit === 'Unlimited' ? '10%' : `${Math.min((vehicles / vehicleLimit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {companyDetailsTab === 'features' && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Visual Feature Permissions</span>
                  <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Platform Dashboard</span>
                      <span className="text-emerald-400 font-bold">Enabled</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Companies Workspace</span>
                      <span className={selectedCompany.plan !== 'Starter' ? 'text-emerald-400 font-bold' : 'text-slate-550 font-bold'}>{selectedCompany.plan !== 'Starter' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subscriptions Panel</span>
                      <span className={selectedCompany.plan !== 'Starter' ? 'text-emerald-400 font-bold' : 'text-slate-550 font-bold'}>{selectedCompany.plan !== 'Starter' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Membership Plans</span>
                      <span className={selectedCompany.plan === 'Enterprise' ? 'text-emerald-400 font-bold' : 'text-slate-555 font-bold'}>{selectedCompany.plan === 'Enterprise' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Controls Center</span>
                      <span className={selectedCompany.plan === 'Enterprise' ? 'text-emerald-400 font-bold' : 'text-slate-555 font-bold'}>{selectedCompany.plan === 'Enterprise' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Inter-Company Transfers</span>
                      <span className={selectedCompany.plan === 'Enterprise' ? 'text-emerald-400 font-bold' : 'text-slate-555 font-bold'}>{selectedCompany.plan === 'Enterprise' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>White Label Customization</span>
                      <span className={selectedCompany.plan === 'Enterprise' ? 'text-emerald-400 font-bold' : 'text-slate-555 font-bold'}>{selectedCompany.plan === 'Enterprise' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              )}

              {companyDetailsTab === 'audit' && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Subscription Audit Feed</span>
                  {selectedCompany.audits && selectedCompany.audits.length > 0 ? (
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3 text-[11px] space-y-2 max-h-56 overflow-y-auto">
                      {selectedCompany.audits.map((log, i) => (
                        <div key={i} className="border-b border-[#23324C]/30 pb-2 last:border-b-0 last:pb-0 mt-2 first:mt-0">
                          <strong className="text-white font-bold block">{log.action}</strong>
                          <p className="text-slate-400 leading-normal">{log.detail}</p>
                          <span className="text-[9px] text-slate-500 font-mono block mt-1">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3 text-[11px] text-slate-400 space-y-2">
                      {[
                        { action: 'Company Created', detail: `${selectedCompany.name} provisioned successfully.`, date: selectedCompany.joined },
                        { action: 'Database Index Sync', detail: 'ElasticSearch keys auto-indexing rebuilt.', date: selectedCompany.joined }
                      ].map((log, i) => (
                        <div key={i} className="border-b border-[#23324C]/30 pb-2 last:border-b-0 last:pb-0 mt-2 first:mt-0">
                          <strong className="text-white font-bold block">{log.action}</strong>
                          <p className="text-slate-400 leading-normal">{log.detail}</p>
                          <span className="text-[9px] text-slate-500 font-mono block mt-1">{log.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="border-t border-[#23324C]/60 pt-4 flex flex-wrap gap-2">
              {selectedCompany.status !== 'Hold' ? (
                <Button variant="danger" size="sm" onClick={() => { setDetailsDrawerOpen(false); handleSuspendCompany(selectedCompany.id, selectedCompany.name); }}>
                  Suspend Workspace License
                </Button>
              ) : (
                <Button variant="success" size="sm" onClick={() => { setDetailsDrawerOpen(false); handleReactivateCompany(selectedCompany.id, selectedCompany.name); }}>
                  Reactivate Workspace License
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => { setDetailsDrawerOpen(false); handleDeleteCompany(selectedCompany.id, selectedCompany.name); }}>
                Permanently Delete Company
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDetailsDrawerOpen(false)}>
                Close Inspector
              </Button>
            </div>
            </div>
          );
        })()}
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

      {/* Change Subscription Modal */}
      <Modal isOpen={changeSubModalOpen} onClose={() => setChangeSubModalOpen(false)} title={`Change Subscription for ${tempCompany?.name}`}>
        <form onSubmit={handleChangeSubscriptionSubmit} className="space-y-4">
          <SelectInput 
            label="Select Subscription Plan Tier" 
            value={newSubPlan} 
            onChange={(e) => setNewSubPlan(e.target.value)} 
            options={[
              { value: 'Starter', label: 'Starter Tier - $199/mo' },
              { value: 'Professional', label: 'Professional Tier - $499/mo' },
              { value: 'Enterprise', label: 'Enterprise Tier - $1,299/mo' }
            ]} 
          />
          <Button type="submit" variant="primary" className="w-full">
            Update Subscription
          </Button>
        </form>
      </Modal>

      {/* Manage Features Modal */}
      <Modal isOpen={manageFeaturesModalOpen} onClose={() => setManageFeaturesModalOpen(false)} title={`Manage Feature Access for ${tempCompany?.name}`}>
        <form onSubmit={handleManageFeaturesSubmit} className="space-y-4 text-left">
          <p className="text-xs text-slate-400">Configure custom granular policies for the company workspace instance.</p>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <input type="checkbox" defaultChecked={true} className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4" />
              <span>GPS Geofencing Mapping</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <input type="checkbox" defaultChecked={true} className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4" />
              <span>AI Route Dispatch Automation</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <input type="checkbox" defaultChecked={true} className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4" />
              <span>ELD Compliance Forms</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <input type="checkbox" defaultChecked={false} className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4" />
              <span>SMS Carrier Alerts</span>
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Save Granular Features
          </Button>
        </form>
      </Modal>

      {/* Send Notification Modal */}
      <Modal isOpen={sendNotificationModalOpen} onClose={() => setSendNotificationModalOpen(false)} title={`Broadcast Notification to ${tempCompany?.name}`}>
        <form onSubmit={handleSendNotificationSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Notification Payload Message</label>
            <textarea
              required
              rows={3}
              value={notificationMsg}
              onChange={(e) => setNotificationMsg(e.target.value)}
              placeholder="Type announcement message..."
              className="block w-full px-4 py-3 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Broadcast Message
          </Button>
        </form>
      </Modal>

      {/* Custom Invoice Modal */}
      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title={`Generate Custom Administrative Invoice for ${tempCompany?.name}`}>
        <form onSubmit={handleGenerateInvoiceSubmit} className="space-y-4">
          <TextInput 
            label="Invoice Amount (USD)" 
            required 
            type="number"
            step="0.01"
            placeholder="e.g. 250.00" 
            value={invoiceAmount} 
            onChange={(e) => setInvoiceAmount(e.target.value)} 
          />
          <TextInput 
            label="Billing Period / Description" 
            required 
            placeholder="e.g. Custom Administrative Fee or Q3 Overages" 
            value={invoicePeriod} 
            onChange={(e) => setInvoicePeriod(e.target.value)} 
          />
          <Button type="submit" variant="primary" className="w-full">
            Generate Invoice
          </Button>
        </form>
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal isOpen={editSubModalOpen} onClose={() => { setEditSubModalOpen(false); }} title={`Edit Subscription Settings for ${tempCompany?.name}`}>
        <form onSubmit={handleSaveEditSubSubmit} className="space-y-4">
          <TextInput 
            label="Next Renewal Date" 
            required 
            placeholder="MM/DD/YYYY" 
            value={editSubRenewalDate} 
            onChange={(e) => setEditSubRenewalDate(e.target.value)} 
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="edit-sub-autorenew"
              checked={editSubAutoRenewal} 
              onChange={(e) => setEditSubAutoRenewal(e.target.checked)} 
              className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer focus:ring-brand-500" 
            />
            <label htmlFor="edit-sub-autorenew" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Enable Auto-Renewal recurring billing
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Save Subscription Settings
          </Button>
        </form>
      </Modal>

      {/* Suspend Company Modal */}
      <Modal isOpen={suspendModalOpen} onClose={() => setSuspendModalOpen(false)} title="Suspend Company License">
        <form onSubmit={handleSuspendCompanySubmit} className="space-y-4">
          <SelectInput 
            label="Select Company to Suspend" 
            value={selectedCompanyIdToSuspend} 
            onChange={(e) => setSelectedCompanyIdToSuspend(e.target.value)} 
            options={tenants.filter(t => t.status !== 'Hold').map(t => ({ value: String(t.id), label: t.name }))}
            placeholder="-- Select Active Company --"
          />
          <Button type="submit" variant="danger" className="w-full">
            Suspend License
          </Button>
        </form>
      </Modal>

      {/* Reactivate Company Modal */}
      <Modal isOpen={reactivateModalOpen} onClose={() => setReactivateModalOpen(false)} title="Reactivate Suspended Company">
        <form onSubmit={handleReactivateCompanySubmit} className="space-y-4">
          <SelectInput 
            label="Select Company to Reactivate" 
            value={selectedCompanyIdToReactivate} 
            onChange={(e) => setSelectedCompanyIdToReactivate(e.target.value)} 
            options={tenants.filter(t => t.status === 'Hold').map(t => ({ value: String(t.id), label: t.name }))}
            placeholder="-- Select Suspended Company --"
          />
          <Button type="submit" variant="success" className="w-full">
            Reactivate License
          </Button>
        </form>
      </Modal>

      {/* Login As Company Modal */}
      <Modal isOpen={loginAsModalOpen} onClose={() => setLoginAsModalOpen(false)} title="Simulate Login Session">
        <form onSubmit={handleLoginAsCompanySubmit} className="space-y-4">
          <SelectInput 
            label="Select Company Workspace" 
            value={selectedCompanyIdToLoginAs} 
            onChange={(e) => setSelectedCompanyIdToLoginAs(e.target.value)} 
            options={tenants.map(t => ({ value: String(t.id), label: t.name }))}
            placeholder="-- Select Company --"
          />
          <Button type="submit" variant="primary" className="w-full">
            Simulate Login
          </Button>
        </form>
      </Modal>

      {/* Create Plan Modal */}
      <Modal isOpen={createPlanModalOpen} onClose={() => setCreatePlanModalOpen(false)} title="Create New Subscription Plan">
        <form onSubmit={handleCreatePlanSubmit} className="space-y-4">
          <TextInput 
            label="Plan Name" 
            required 
            placeholder="e.g. Starter, Premium, Ultimate" 
            value={newPlanName} 
            onChange={(e) => setNewPlanName(e.target.value)} 
          />
          <TextInput 
            label="Monthly Price (USD)" 
            required 
            type="number"
            placeholder="e.g. 199" 
            value={newPlanPrice} 
            onChange={(e) => setNewPlanPrice(e.target.value)} 
          />
          <TextInput 
            label="Drivers Limit" 
            required 
            type="number"
            placeholder="e.g. 10" 
            value={newPlanLimit} 
            onChange={(e) => setNewPlanLimit(e.target.value)} 
          />
          <Button type="submit" variant="primary" className="w-full">
            Create Plan
          </Button>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={editPlanModalOpen} onClose={() => setEditPlanModalOpen(false)} title="Edit Subscription Plan Tier">
        <form onSubmit={handleEditPlanSubmit} className="space-y-4">
          <SelectInput 
            label="Select Plan Tier to Edit" 
            value={selectedPlanToEdit} 
            onChange={(e) => {
              const plan = e.target.value;
              setSelectedPlanToEdit(plan);
              if (plan === 'Starter') {
                setEditPlanPrice('199');
                setEditPlanLimit('5');
              } else if (plan === 'Professional') {
                setEditPlanPrice('499');
                setEditPlanLimit('30');
              } else {
                setEditPlanPrice('1299');
                setEditPlanLimit('Unlimited');
              }
            }} 
            options={[
              { value: 'Starter', label: 'Starter Tier' },
              { value: 'Professional', label: 'Professional Tier' },
              { value: 'Enterprise', label: 'Enterprise Tier' }
            ]} 
          />
          <TextInput 
            label="Monthly Price (USD)" 
            required 
            type="text"
            placeholder="e.g. 199" 
            value={editPlanPrice} 
            onChange={(e) => setEditPlanPrice(e.target.value)} 
          />
          <TextInput 
            label="Drivers Limit" 
            required 
            placeholder="e.g. 5 or Unlimited" 
            value={editPlanLimit} 
            onChange={(e) => setEditPlanLimit(e.target.value)} 
          />
          <Button type="submit" variant="primary" className="w-full">
            Save Plan Settings
          </Button>
        </form>
      </Modal>

      {/* Change Subscription General Modal */}
      <Modal isOpen={changeSubGeneralModalOpen} onClose={() => setChangeSubGeneralModalOpen(false)} title="Change Subscription Plan">
        <form onSubmit={handleChangeSubGeneralSubmit} className="space-y-4">
          <SelectInput 
            label="Select Company Workspace" 
            value={selectedCompanyIdToChangeSub} 
            onChange={(e) => {
              const cid = e.target.value;
              setSelectedCompanyIdToChangeSub(cid);
              const company = tenants.find(t => t.id === Number(cid));
              if (company) {
                setNewSubPlan(company.plan);
              }
            }} 
            options={tenants.map(t => ({ value: String(t.id), label: t.name }))}
            placeholder="-- Select Company --"
          />
          <SelectInput 
            label="Select New Subscription Plan Tier" 
            value={newSubPlan} 
            onChange={(e) => setNewSubPlan(e.target.value)} 
            options={[
              { value: 'Starter', label: 'Starter Tier - $199/mo' },
              { value: 'Professional', label: 'Professional Tier - $499/mo' },
              { value: 'Enterprise', label: 'Enterprise Tier - $1,299/mo' }
            ]} 
          />
          <Button type="submit" variant="primary" className="w-full">
            Update Subscription
          </Button>
        </form>
      </Modal>

      {/* Enable Feature Modal */}
      <Modal isOpen={enableFeatureModalOpen} onClose={() => setEnableFeatureModalOpen(false)} title="Enable Feature Globally or by Tier">
        <form onSubmit={handleEnableFeatureSubmit} className="space-y-4">
          <SelectInput 
            label="Select Feature to Enable" 
            value={selectedFeatureToEnable} 
            onChange={(e) => setSelectedFeatureToEnable(e.target.value)} 
            options={Object.entries(permissions).map(([key, feat]) => ({ value: key, label: feat.label }))}
          />
          <SelectInput 
            label="Select Plan Tier" 
            value={featureTierToEnable} 
            onChange={(e) => setFeatureTierToEnable(e.target.value)} 
            options={[
              { value: 'start', label: 'Starter Tier' },
              { value: 'pro', label: 'Professional Tier' },
              { value: 'ent', label: 'Enterprise Tier' }
            ]} 
          />
          <Button type="submit" variant="success" className="w-full">
            Enable Feature
          </Button>
        </form>
      </Modal>

      {/* Disable Feature Modal */}
      <Modal isOpen={disableFeatureModalOpen} onClose={() => setDisableFeatureModalOpen(false)} title="Disable Feature Globally or by Tier">
        <form onSubmit={handleDisableFeatureSubmit} className="space-y-4">
          <SelectInput 
            label="Select Feature to Disable" 
            value={selectedFeatureToDisable} 
            onChange={(e) => setSelectedFeatureToDisable(e.target.value)} 
            options={Object.entries(permissions).map(([key, feat]) => ({ value: key, label: feat.label }))}
          />
          <SelectInput 
            label="Select Plan Tier" 
            value={featureTierToDisable} 
            onChange={(e) => setFeatureTierToDisable(e.target.value)} 
            options={[
              { value: 'start', label: 'Starter Tier' },
              { value: 'pro', label: 'Professional Tier' },
              { value: 'ent', label: 'Enterprise Tier' }
            ]} 
          />
          <Button type="submit" variant="danger" className="w-full">
            Disable Feature
          </Button>
        </form>
      </Modal>

      {/* White Label Modal */}
      <Modal isOpen={whiteLabelModalOpen} onClose={() => setWhiteLabelModalOpen(false)} title="White Label Branding Options">
        <form onSubmit={handleWhiteLabelSubmit} className="space-y-4">
          <TextInput 
            label="Branded Platform Name" 
            required 
            value={brandName} 
            onChange={(e) => setBrandName(e.target.value)} 
          />
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Accent Theme Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={brandColor} 
                onChange={(e) => setBrandColor(e.target.value)} 
                className="h-10 w-12 rounded-xl bg-transparent cursor-pointer border border-[#23324C] focus:outline-none" 
              />
              <input 
                type="text" 
                value={brandColor} 
                onChange={(e) => setBrandColor(e.target.value)} 
                className="flex-1 px-3 py-2 bg-[#111827] text-slate-200 text-xs rounded-xl border border-[#23324C] focus:outline-none" 
              />
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Save Branding Options
          </Button>
        </form>
      </Modal>

      {/* Export Report Modal */}
      <Modal isOpen={exportReportModalOpen} onClose={() => setExportReportModalOpen(false)} title="Export Platform Report">
        <form onSubmit={handleExportReportSubmit} className="space-y-4">
          <SelectInput 
            label="Select Report Type" 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)} 
            options={[
              { value: 'Global Platform', label: 'Global Platform Overview' },
              { value: 'Financial Statement', label: 'Financial Statement Ledger' },
              { value: 'Audit Log Archive', label: 'Audit Log Archives' },
              { value: 'Support Ticket Summary', label: 'Support Ticket Summaries' }
            ]} 
          />
          <SelectInput 
            label="Export Format" 
            value={reportFormat} 
            onChange={(e) => setReportFormat(e.target.value)} 
            options={[
              { value: 'PDF', label: 'PDF Document (.pdf)' },
              { value: 'CSV', label: 'Comma-Separated Values (.csv)' },
              { value: 'Excel', label: 'Excel Spreadsheet (.xlsx)' }
            ]} 
          />
          <Button type="submit" variant="primary" className="w-full">
            Generate & Export Report
          </Button>
        </form>
      </Modal>

    </div>
  );
}
