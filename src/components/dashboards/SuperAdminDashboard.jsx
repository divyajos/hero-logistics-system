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
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Subscription Licensing Plans</h3>
                <Button size="sm" variant="primary" onClick={() => triggerToast('Create Plan form loaded.')}>
                  Create Plan
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#111827] border border-[#23324C] rounded-xl flex flex-col justify-between h-48">
                  <div>
                    <strong className="text-white text-xs block font-extrabold uppercase tracking-wide">Starter Tier</strong>
                    <span className="text-[10px] text-slate-500 block mt-1">Up to 5 drivers register</span>
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-brand-400">$199<span className="text-xs text-slate-400 font-medium">/mo</span></h5>
                    <Button size="sm" variant="secondary" className="w-full mt-3" onClick={() => triggerToast('Edit Plan Starter Tier modal triggered')}>Edit Plan</Button>
                  </div>
                </div>
                <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl flex flex-col justify-between h-48">
                  <div>
                    <strong className="text-white text-xs block font-extrabold uppercase tracking-wide">Professional Tier</strong>
                    <span className="text-[10px] text-slate-500 block mt-1">Up to 30 drivers register</span>
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-brand-400">$499<span className="text-xs text-slate-400 font-medium">/mo</span></h5>
                    <Button size="sm" variant="primary" className="w-full mt-3" onClick={() => triggerToast('Edit Plan Pro Tier modal triggered')}>Edit Plan</Button>
                  </div>
                </div>
                <div className="p-4 bg-[#111827] border border-[#23324C] rounded-xl flex flex-col justify-between h-48">
                  <div>
                    <strong className="text-white text-xs block font-extrabold uppercase tracking-wide">Enterprise Tier</strong>
                    <span className="text-[10px] text-slate-500 block mt-1">Unlimited driver seats</span>
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-brand-400">$1,299<span className="text-xs text-slate-400 font-medium">/mo</span></h5>
                    <Button size="sm" variant="secondary" className="w-full mt-3" onClick={() => triggerToast('Edit Plan Enterprise Tier modal triggered')}>Edit Plan</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feature-access' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Visual Feature Permission Matrix</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">Map feature access permissions globally across platform plan licenses.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-[#23324C]/60 text-slate-400 font-extrabold">
                      <th className="py-2 text-left">Feature Key</th>
                      <th className="py-2 text-center">Start</th>
                      <th className="py-2 text-center">Pro</th>
                      <th className="py-2 text-center">Ent</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23324C]/30 font-semibold">
                    {Object.entries(permissions).map(([key, feat]) => (
                      <tr key={key} className="hover:bg-slate-900/40">
                        <td className="py-2.5 text-left text-white">{feat.label}</td>
                        <td className="py-2.5 text-center">
                          <input 
                            type="checkbox" 
                            checked={feat.start} 
                            onChange={() => handleTogglePermission(key, 'start')} 
                            className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer focus:ring-brand-500" 
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <input 
                            type="checkbox" 
                            checked={feat.pro} 
                            onChange={() => handleTogglePermission(key, 'pro')} 
                            className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer focus:ring-brand-500" 
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <input 
                            type="checkbox" 
                            checked={feat.ent} 
                            onChange={() => handleTogglePermission(key, 'ent')} 
                            className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer focus:ring-brand-500" 
                          />
                        </td>
                        <td className="py-2.5 text-right space-x-1">
                          <Button size="sm" variant="success" onClick={() => handleSetFeatureStatus(key, true)}>Enable Feature</Button>
                          <Button size="sm" variant="danger" onClick={() => handleSetFeatureStatus(key, false)}>Disable Feature</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'white-label' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
                <h3 className="text-sm font-extrabold text-white">Enterprise White-Label Customization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Configure brand details, logo files, and custom templates for your tenant portal.</p>

                <div className="space-y-4">
                  <TextInput label="Platform Portal Brand Name" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. HERO LOGISTICS" />
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Upload Branding Logo</label>
                    <div 
                      onClick={() => triggerToast('Logo file selected successfully.')}
                      className="border border-dashed border-[#23324C] hover:border-brand-500/40 p-4 rounded-xl text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/60 transition-all text-xs text-slate-450"
                    >
                      Drag & Drop brand logo here, or <span className="text-brand-400 font-bold">Browse</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Accent Theme Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 w-12 rounded-xl bg-transparent cursor-pointer border border-[#23324C] focus:outline-none" />
                        <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="flex-1 px-3 py-2 bg-[#111827]/80 text-slate-200 text-xs rounded-xl border border-[#23324C] focus:outline-none" />
                      </div>
                    </div>
                    <TextInput label="Login Welcome Greeting" defaultValue="Welcome to Logistics OS" id="brand-greeting-input" />
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => { setIsWhiteLabelSaved(true); triggerToast('White label modifications saved.'); }}>
                    Manage White Label
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-6 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Branded Live Portal Preview</h3>
                  <p className="text-[10px] text-slate-500">Live preview matching configured settings parameters.</p>
                </div>
                <div className="flex-grow flex items-center justify-center my-2">
                  <div className="w-full max-w-sm bg-[#0B0F19] rounded-2xl border border-[#23324C] p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: brandColor }}>HL</div>
                        <span className="text-[10px] font-black text-white tracking-tight">{brandName}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 text-[10px] font-extrabold text-white rounded-lg" style={{ backgroundColor: brandColor }}>Live Button Preview</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Billing History & Invoices</h3>
              <DataTable tableName="sa_billing_list" columns={[
                { key: 'id', label: 'Invoice ID', render: (row) => <span>#INV-{row.id}</span> },
                { key: 'company', label: 'Company Name', render: (row) => <span>{row.name}</span> },
                { key: 'plan', label: 'Tier Plan', render: (row) => <span>{row.plan}</span> },
                { key: 'amount', label: 'Monthly Invoiced', render: (row) => <span>{row.plan === 'Starter' ? '$199.00' : row.plan === 'Professional' ? '$499.00' : '$1,299.00'}</span> },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (row) => (
                    <Button size="sm" variant="secondary" onClick={() => triggerToast(`Billing history details open for ${row.name}`)}>
                      View Billing
                    </Button>
                  )
                }
              ]} data={tenants} />
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

          {activeTab === 'transfers' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Inter-Company Transfers Audit Logs</h3>
              <DataTable tableName="sa_transfers_list" columns={[
                { key: 'id', label: 'Transfer ID', render: (row) => <span>#{row.id}</span> },
                { key: 'from', label: 'Origin Company', render: (row) => <span>{row.from}</span> },
                { key: 'to', label: 'Target Company', render: (row) => <span>{row.to}</span> },
                { key: 'item', label: 'Item Manifest', render: (row) => <span>{row.item}</span> },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (row) => (
                    <Button size="sm" variant="secondary" onClick={() => triggerToast(`Transfer Chain Audit Trail: ${row.id}`)}>
                      View Transfer Chain
                    </Button>
                  )
                }
              ]} data={[
                { id: 'TRF-501', from: 'Swift Cargo', to: 'Global Shipping', item: 'Tesla Model 3 VIN-901', status: 'Completed' },
                { id: 'TRF-502', from: 'Apex Logistics', to: 'Vance Transport', item: 'General Freight Pallets x 24', status: 'Transit' }
              ]} />
            </div>
          )}

          {activeTab === 'ai-controls' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Global Platform AI Configurations</h3>
              <div className="space-y-4 max-w-md">
                <TextInput label="Load Parse Confidence threshold (%)" defaultValue="85" />
                <TextInput label="Receipt Scan OCR Confidence threshold (%)" defaultValue="90" />
                <TextInput label="Odometer Image Confidence threshold (%)" defaultValue="95" />
                <Button variant="primary" onClick={() => triggerToast('Global AI confidence settings saved.')}>
                  Save AI Controls
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Super Admin Settings Profile</h3>
              <div className="space-y-4 max-w-md">
                <TextInput label="Support Email" defaultValue="platform-support@hero.com" />
                <TextInput label="Database Master Endpoint" defaultValue="aurora-cluster-prod.hero-internal" />
                <Button variant="primary" onClick={() => triggerToast('Platform server connection values updated.')}>
                  Save Settings
                </Button>
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
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={t.status} />
                      <Button size="sm" variant="secondary" onClick={() => { setSelectedTicket(t); setTicketDrawerOpen(true); }}>
                        View Support Ticket
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
