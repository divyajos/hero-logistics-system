import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import { fetchTenants } from '../../store/slices/companySlice';
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
  Shield, TrendingUp, CheckSquare, Eye, RefreshCw, Sparkles, Filter, ChevronDown
} from 'lucide-react';

export default function MembershipPlans({ tenants = [], logAuditAction, triggerToast }) {
  const dispatch = useDispatch();

  // Primary states
  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [gateways, setGateways] = useState({});
  const [planAudits, setPlanAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout states
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly or annual
  const [activeSubTab, setActiveSubTab] = useState('registry'); // registry, matrix, coupons, trials, revenue, overages, gateways, migration, audits, ledger

  // Search, Filter, Sort and Pagination states (Registry)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    version: true,
    status: true,
    pricing: true,
    trialDays: true,
    subscribers: true,
    revenue: true,
    createdBy: true,
    lastUpdated: true,
    actions: true
  });
  const [showColDropdown, setShowColDropdown] = useState(false);

  // Registry Filter Dropdown
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Modals & Wizard states
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEditingPlanId, setWizardEditingPlanId] = useState(null);

  // Wizard Form state
  const [planForm, setPlanForm] = useState({
    name: '',
    version: '1.0.0',
    status: 'Draft',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    trialDays: '14',
    setupFee: '0',
    cancellationFee: '0',
    autoRenewal: true,
    limits: {
      users: '10',
      drivers: '20',
      vehicles: '20',
      branches: '3',
      storage: '50',
      apiCalls: '50000'
    },
    features: {
      dispatch: true,
      fleet: true,
      gps: true,
      driverApp: true,
      accounting: false,
      ai: false,
      reporting: false,
      api: false,
      customerPortal: false,
      integrations: false
    },
    overages: {
      users: '10',
      drivers: '15',
      vehicles: '20',
      branches: '50',
      storage: '5',
      apiCalls: '0.05'
    }
  });

  // Version History Drawer
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState('');
  const [compareVersion2, setCompareVersion2] = useState('');

  // Coupons states
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'Percentage Discount',
    discount: '',
    campaign: '',
    expiryDate: '',
    redemptionLimit: '100'
  });
  const [couponSearch, setCouponSearch] = useState('');

  // Gateway form states
  const [gatewayForm, setGatewayForm] = useState({
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalSecretKey: '',
    achEnabled: false,
    achRoutingNumber: '',
    achAccountNumber: '',
    wireEnabled: false,
    wireBankName: '',
    wireSwiftCode: '',
    wireAccountNumber: '',
    manualEnabled: false,
    manualBillingInstructions: ''
  });

  // Migration wizard states
  const [migrationSource, setMigrationSource] = useState('');
  const [migrationTarget, setMigrationTarget] = useState('');
  const [migratedTenants, setMigratedTenants] = useState([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationValidation, setMigrationValidation] = useState([]);
  const [migrationRollbackList, setMigrationRollbackList] = useState(null);

  // Billing ledger states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('All');
  const [invoiceDetailsModal, setInvoiceDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Lifecycle confirmation modal
  const [transitionConfirmOpen, setTransitionConfirmOpen] = useState(false);
  const [transitionTargetState, setTransitionTargetState] = useState('');
  const [transitionPlan, setTransitionPlan] = useState(null);

  // Audit search
  const [auditSearch, setAuditSearch] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const resPlans = await apiClient.get('plans');
      const resCoupons = await apiClient.get('coupons');
      const resGateways = await apiClient.get('gateways');
      const resAudits = await apiClient.get('plan-audits');

      setPlans(resPlans.data || []);
      setCoupons(resCoupons.data || []);
      setPlanAudits(resAudits.data || []);

      const g = resGateways.data || {};
      setGateways(g);
      setGatewayForm({
        stripeEnabled: g.stripe?.enabled || false,
        stripePublishableKey: g.stripe?.publishableKey || '',
        stripeSecretKey: g.stripe?.secretKey || '',
        paypalEnabled: g.paypal?.enabled || false,
        paypalClientId: g.paypal?.clientId || '',
        paypalSecretKey: g.paypal?.secretKey || '',
        achEnabled: g.ach?.enabled || false,
        achRoutingNumber: g.ach?.routingNumber || '',
        achAccountNumber: g.ach?.accountNumber || '',
        wireEnabled: g.wire?.enabled || false,
        wireBankName: g.wire?.bankName || '',
        wireSwiftCode: g.wire?.swiftCode || '',
        wireAccountNumber: g.wire?.accountNumber || '',
        manualEnabled: g.manual?.enabled || false,
        manualBillingInstructions: g.manual?.billingInstructions || ''
      });
    } catch (e) {
      console.error(e);
      triggerToast('Failed to retrieve SaaS licensing configs.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync back-end helper
  const logPlanAudit = async (action, detail) => {
    try {
      const newAudit = await apiClient.post('plan-audits', { action, detail });
      setPlanAudits(prev => [newAudit.data, ...prev]);
      logAuditAction(action, detail);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Dynamic Metric Calculations
  const activeSubscribersCount = tenants.filter(t => t.status === 'Active').length;
  const trialSubscribersCount = tenants.filter(t => t.plan === 'Starter' && t.status === 'Active').length;
  const calculatedMrrVal = tenants
    .filter(t => t.status === 'Active')
    .reduce((acc, t) => {
      const planRate = t.plan === 'Starter' ? 199 : (t.plan === 'Professional' ? 499 : (t.plan === 'Enterprise' ? 1299 : 2999));
      return acc + (t.revenue !== undefined ? t.revenue : planRate);
    }, 0);
  const calculatedArrVal = calculatedMrrVal * 12;

  // Plan-specific subscriber & revenue metrics calculations
  const getPlanMetrics = (planName) => {
    const subs = tenants.filter(t => t.plan === planName && t.status === 'Active');
    const revenue = subs.reduce((acc, t) => {
      const planRate = planName === 'Starter' ? 199 : (planName === 'Professional' ? 499 : (planName === 'Enterprise' ? 1299 : 2999));
      return acc + (t.revenue !== undefined ? t.revenue : planRate);
    }, 0);
    return {
      subscribers: subs.length,
      revenue
    };
  };

  // Plan transitions handler
  const handleTransitionClick = (plan, targetState) => {
    setTransitionPlan(plan);
    setTransitionTargetState(targetState);
    setTransitionConfirmOpen(true);
  };

  const executeTransition = async () => {
    if (!transitionPlan) return;
    try {
      const res = await apiClient.post(`plans/${transitionPlan.id}/transition`, { status: transitionTargetState });
      triggerToast(`State transitioned for plan "${transitionPlan.name}" from ${res.data.prevStatus} to ${transitionTargetState}.`, 'success');
      logPlanAudit('Plan State Transited', `Plan "${transitionPlan.name}" transitioned from ${res.data.prevStatus} to ${transitionTargetState}.`);
      setTransitionConfirmOpen(false);
      setTransitionPlan(null);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Plan state transition failed.', 'danger');
    }
  };

  // Plan Cloning
  const handleClonePlan = async (planId, name) => {
    try {
      const res = await apiClient.post(`plans/${planId}/clone`);
      triggerToast(`Plan "${name}" successfully cloned as draft copy.`, 'success');
      logPlanAudit('Plan Cloned', `Cloned plan "${name}" to create draft copy "${res.data.name}".`);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Plan cloning failed.', 'danger');
    }
  };

  // Plan Delete
  const handleDeletePlan = async (planId, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete plan "${name}"? This action cannot be undone.`)) return;
    try {
      await apiClient.delete(`plans/${planId}`);
      triggerToast(`Plan "${name}" deleted successfully.`, 'success');
      logPlanAudit('Plan Deleted', `Permanently deleted plan config "${name}".`);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Plan deletion failed.', 'danger');
    }
  };

  // Wizard Handlers
  const handleOpenCreateWizard = () => {
    setWizardEditingPlanId(null);
    setPlanForm({
      name: '',
      version: '1.0.0',
      status: 'Draft',
      description: '',
      monthlyPrice: '',
      annualPrice: '',
      trialDays: '14',
      setupFee: '0',
      cancellationFee: '0',
      autoRenewal: true,
      limits: {
        users: '5',
        drivers: '10',
        vehicles: '10',
        branches: '1',
        storage: '20',
        apiCalls: '20000'
      },
      features: {
        dispatch: true,
        fleet: true,
        gps: true,
        driverApp: true,
        accounting: false,
        ai: false,
        reporting: false,
        api: false,
        customerPortal: false,
        integrations: false
      },
      overages: {
        users: '10',
        drivers: '15',
        vehicles: '20',
        branches: '50',
        storage: '5',
        apiCalls: '0.05'
      }
    });
    setWizardStep(1);
    setWizardOpen(true);
  };

  const handleOpenEditWizard = (plan) => {
    setWizardEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      version: plan.version,
      status: plan.status,
      description: plan.description || '',
      monthlyPrice: String(plan.monthlyPrice),
      annualPrice: String(plan.annualPrice),
      trialDays: String(plan.trialDays),
      setupFee: String(plan.setupFee || 0),
      cancellationFee: String(plan.cancellationFee || 0),
      autoRenewal: plan.autoRenewal !== false,
      limits: {
        users: String(plan.limits.users),
        drivers: String(plan.limits.drivers),
        vehicles: String(plan.limits.vehicles),
        branches: String(plan.limits.branches || 1),
        storage: String(plan.limits.storage || 10),
        apiCalls: String(plan.limits.apiCalls || 10000)
      },
      features: {
        dispatch: plan.features.dispatch || false,
        fleet: plan.features.fleet || false,
        gps: plan.features.gps || false,
        driverApp: plan.features.driverApp || false,
        accounting: plan.features.accounting || false,
        ai: plan.features.ai || false,
        reporting: plan.features.reporting || false,
        api: plan.features.api || false,
        customerPortal: plan.features.customerPortal || false,
        integrations: plan.features.integrations || false
      },
      overages: {
        users: String(plan.overages?.users || 10),
        drivers: String(plan.overages?.drivers || 15),
        vehicles: String(plan.overages?.vehicles || 20),
        branches: String(plan.overages?.branches || 50),
        storage: String(plan.overages?.storage || 5),
        apiCalls: String(plan.overages?.apiCalls || 0.05)
      }
    });
    setWizardStep(1);
    setWizardOpen(true);
  };

  const handleWizardSubmit = async () => {
    // Validations
    if (!planForm.name || !planForm.monthlyPrice || !planForm.annualPrice) {
      triggerToast('Please complete all required fields.', 'danger');
      return;
    }

    const payload = {
      name: planForm.name,
      version: planForm.version,
      status: planForm.status,
      description: planForm.description,
      monthlyPrice: Number(planForm.monthlyPrice),
      annualPrice: Number(planForm.annualPrice),
      trialDays: Number(planForm.trialDays),
      setupFee: Number(planForm.setupFee),
      cancellationFee: Number(planForm.cancellationFee),
      autoRenewal: planForm.autoRenewal,
      limits: {
        users: planForm.limits.users === 'Unlimited' ? 'Unlimited' : Number(planForm.limits.users),
        drivers: planForm.limits.drivers === 'Unlimited' ? 'Unlimited' : Number(planForm.limits.drivers),
        vehicles: planForm.limits.vehicles === 'Unlimited' ? 'Unlimited' : Number(planForm.limits.vehicles),
        branches: planForm.limits.branches === 'Unlimited' ? 'Unlimited' : Number(planForm.limits.branches),
        storage: planForm.limits.storage === 'Unlimited' ? 'Unlimited' : Number(planForm.limits.storage),
        apiCalls: planForm.limits.apiCalls === 'Unlimited' ? 'Unlimited' : Number(planForm.limits.apiCalls)
      },
      features: { ...planForm.features },
      overages: {
        users: Number(planForm.overages.users),
        drivers: Number(planForm.overages.drivers),
        vehicles: Number(planForm.overages.vehicles),
        branches: Number(planForm.overages.branches),
        storage: Number(planForm.overages.storage),
        apiCalls: Number(planForm.overages.apiCalls)
      }
    };

    try {
      if (wizardEditingPlanId) {
        // Edit
        await apiClient.put(`plans/${wizardEditingPlanId}`, payload);
        // Also log new version history entry automatically if limits or features updated
        await apiClient.post(`plans/${wizardEditingPlanId}/version`, {
          version: payload.version,
          changeLog: 'Plan limits or feature matrix configurations revised.',
          limits: payload.limits
        });
        triggerToast(`Licensing plan "${payload.name}" updated successfully.`, 'success');
        logPlanAudit('Plan Config Updated', `Revised configurations of licensing plan "${payload.name}" to version v${payload.version}.`);
      } else {
        // Create
        await apiClient.post('plans', payload);
        triggerToast(`New licensing plan "${payload.name}" provisioned.`, 'success');
        logPlanAudit('Plan Config Created', `Created and published new licensing plan tier "${payload.name}" (v1.0.0).`);
      }
      setWizardOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Failed to save plan configs.', 'danger');
    }
  };

  // Version Control Handlers
  const handleRollbackVersion = async (version) => {
    if (!selectedPlan) return;
    if (!window.confirm(`Are you sure you want to rollback plan "${selectedPlan.name}" from v${selectedPlan.version} to v${version}? This will update the active resource limits configuration immediately.`)) return;
    try {
      await apiClient.post(`plans/${selectedPlan.id}/rollback`, { version });
      triggerToast(`Plan "${selectedPlan.name}" rolled back to version v${version}.`, 'success');
      logPlanAudit('Plan Version Rolled Back', `Rolled back plan "${selectedPlan.name}" configurations to version v${version}.`);
      setVersionDrawerOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Rollback failed.', 'danger');
    }
  };

  const handleCompareSubmit = (e) => {
    e.preventDefault();
    if (!compareVersion1 || !compareVersion2) {
      triggerToast('Please select two versions to compare.', 'danger');
      return;
    }
    setCompareModalOpen(true);
  };

  // Coupons Handlers
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discount) {
      triggerToast('Please provide Code and discount value.', 'danger');
      return;
    }
    try {
      await apiClient.post('coupons', couponForm);
      triggerToast(`Coupon campaign code "${couponForm.code.toUpperCase()}" launched successfully.`, 'success');
      logPlanAudit('Coupon Campaign Created', `Launched promotion coupon code "${couponForm.code.toUpperCase()}" (${couponForm.type}: ${couponForm.discount}).`);
      setCouponModalOpen(false);
      setCouponForm({ code: '', type: 'Percentage Discount', discount: '', campaign: '', expiryDate: '', redemptionLimit: '100' });
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Failed to create coupon.', 'danger');
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`Permanently remove coupon code "${code}"?`)) return;
    try {
      await apiClient.delete(`coupons/${code}`);
      triggerToast(`Coupon "${code}" deprecated & removed.`, 'warning');
      logPlanAudit('Coupon Terminated', `Terminated coupon promotional campaign "${code}".`);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Coupon deletion failed.', 'danger');
    }
  };

  // Trial actions
  const handleExtendTrial = async (tenant) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 14); // extend 14 days
    const nextRenewalStr = newDate.toLocaleDateString();
    try {
      await apiClient.put(`subscriptions/${tenant.id}/settings`, { nextRenewalDate: nextRenewalStr, autoRenewal: tenant.autoRenewal !== false });
      triggerToast(`Extended trial evaluation window for ${tenant.name} by 14 days. New Expiry: ${nextRenewalStr}.`, 'success');
      logPlanAudit('Trial Evaluation Extended', `Granted 14-day trial extension for ${tenant.name} workspace instance.`);
      dispatch(fetchTenants());
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvertTrial = async (tenant, targetPlanName = 'Professional') => {
    try {
      await apiClient.put(`subscriptions/${tenant.id}/assign-plan`, { plan: targetPlanName });
      triggerToast(`Converted ${tenant.name} from Trial account to paying ${targetPlanName} tier contract.`, 'success');
      logPlanAudit('Trial Converted', `Successfully converted trial account for ${tenant.name} to paying ${targetPlanName} subscription.`);
      dispatch(fetchTenants());
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelTrial = async (tenant) => {
    if (!window.confirm(`Are you sure you want to cancel the trial and suspend license keys for ${tenant.name}?`)) return;
    try {
      await apiClient.put(`subscriptions/${tenant.id}/pause`);
      triggerToast(`Trial suspended and workspace account marked Hold for ${tenant.name}.`, 'warning');
      logPlanAudit('Trial Terminated', `Suspended trial evaluation and held workspace license keys for ${tenant.name}.`);
      dispatch(fetchTenants());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTrialReminder = async (tenant) => {
    try {
      await apiClient.post(`subscriptions/${tenant.id}/reminder`);
      triggerToast(`Renewal reminder invoice dispatch successfully queued to administrative email of ${tenant.name}.`, 'success');
      logPlanAudit('Trial Reminder Notice Sent', `Dispatched impending trial expiry notification to account manager of ${tenant.name}.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Gateway Settings Handlers
  const handleGatewaySave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        stripe: { enabled: gatewayForm.stripeEnabled, publishableKey: gatewayForm.stripePublishableKey, secretKey: gatewayForm.stripeSecretKey },
        paypal: { enabled: gatewayForm.paypalEnabled, clientId: gatewayForm.paypalClientId, secretKey: gatewayForm.paypalSecretKey },
        razorpay: { enabled: gatewayForm.razorpayEnabled, keyId: gatewayForm.razorpayKeyId, secretKey: gatewayForm.razorpaySecretKey },
        ach: { enabled: gatewayForm.achEnabled, routingNumber: gatewayForm.achRoutingNumber, accountNumber: gatewayForm.achAccountNumber },
        wire: { enabled: gatewayForm.wireEnabled, bankName: gatewayForm.wireBankName, swiftCode: gatewayForm.wireSwiftCode, accountNumber: gatewayForm.wireAccountNumber },
        manual: { enabled: gatewayForm.manualEnabled, billingInstructions: gatewayForm.manualBillingInstructions }
      };
      await apiClient.put('gateways', payload);
      triggerToast('Gateway credentials and encryption parameters saved successfully.', 'success');
      logPlanAudit('Gateway Settings Edited', 'Updated global payment gateway endpoints credentials configurations.');
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Failed to save gateway parameters.', 'danger');
    }
  };

  // Bulk tenant migration wizard
  const runMigrationValidation = () => {
    if (!migrationSource || !migrationTarget) {
      triggerToast('Please select source and target plan levels.', 'danger');
      return;
    }
    const cohort = tenants.filter(t => t.plan === migrationSource);
    const targetPlan = plans.find(p => p.name === migrationTarget);
    const targetLimits = targetPlan?.limits || { users: 15, drivers: 30, vehicles: 30 };

    const warnings = [];
    cohort.forEach(tenant => {
      const violations = [];
      const users = tenant.users || 0;
      const drivers = tenant.drivers || 0;
      const vehicles = tenant.vehicles || 0;

      if (targetLimits.users !== 'Unlimited' && users > Number(targetLimits.users)) violations.push(`Users (${users}/${targetLimits.users})`);
      if (targetLimits.drivers !== 'Unlimited' && drivers > Number(targetLimits.drivers)) violations.push(`Drivers (${drivers}/${targetLimits.drivers})`);
      if (targetLimits.vehicles !== 'Unlimited' && vehicles > Number(targetLimits.vehicles)) violations.push(`Vehicles (${vehicles}/${targetLimits.vehicles})`);

      if (violations.length > 0) {
        warnings.push({
          tenantName: tenant.name,
          violations
        });
      }
    });

    setMigrationValidation(warnings);
    triggerToast(`Cohort size: ${cohort.length} accounts analyzed. ${warnings.length} capacity conflicts identified.`, warnings.length > 0 ? 'warning' : 'success');
  };

  const handleMigrateExecute = async () => {
    const cohort = tenants.filter(t => t.plan === migrationSource);
    if (cohort.length === 0) {
      triggerToast('No active tenant accounts match source plan tier.', 'danger');
      return;
    }
    if (migrationValidation.length > 0) {
      if (!window.confirm(`Warning: ${migrationValidation.length} tenants will exceed resource limits defined by the target plan. Exceeding limits will trigger administrative overage billing. Do you still want to execute the migration?`)) return;
    }

    try {
      setIsMigrating(true);
      const tenantIds = cohort.map(c => c.id);
      await apiClient.post('plans/migrate', {
        sourcePlan: migrationSource,
        targetPlan: migrationTarget,
        tenantIds
      });

      // Track rollback checkpoint
      setMigrationRollbackList({
        source: migrationSource,
        target: migrationTarget,
        tenantIds
      });

      triggerToast(`Successfully migrated ${cohort.length} tenants from ${migrationSource} to ${migrationTarget} plan level.`, 'success');
      logPlanAudit('Bulk Cohort Migration Execute', `Migrated ${cohort.length} tenants from "${migrationSource}" plan to "${migrationTarget}" plan level.`);

      // Re-fetch global lists
      dispatch(fetchTenants());
      setMigrationSource('');
      setMigrationTarget('');
      setMigrationValidation([]);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Migration execution failed.', 'danger');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRollbackMigration = async () => {
    if (!migrationRollbackList) return;
    if (!window.confirm(`Revert the last migration? This will return the migrated tenants back to the "${migrationRollbackList.source}" plan tier.`)) return;

    try {
      setIsMigrating(true);
      await apiClient.post('plans/migrate', {
        sourcePlan: migrationRollbackList.target,
        targetPlan: migrationRollbackList.source,
        tenantIds: migrationRollbackList.tenantIds
      });

      triggerToast(`Reverted migration checkout. Restored ${migrationRollbackList.tenantIds.length} tenants back to "${migrationRollbackList.source}".`, 'success');
      logPlanAudit('Cohort Migration Rolled Back', `Restored ${migrationRollbackList.tenantIds.length} tenants back to "${migrationRollbackList.source}" plan.`);

      setMigrationRollbackList(null);
      dispatch(fetchTenants());
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Migration rollback failed.', 'danger');
    } finally {
      setIsMigrating(false);
    }
  };

  // Overage Invoicing scan
  const handleOverageInvoicingScan = async () => {
    try {
      let scanCount = 0;
      let invoiceCreated = 0;
      let totalValue = 0;

      for (const tenant of tenants) {
        const plan = plans.find(p => p.name === tenant.plan);
        if (!plan || plan.name === 'Enterprise') continue;

        scanCount++;
        const limits = plan.limits;
        const overageRates = plan.overages || { users: 10, drivers: 15, vehicles: 20, branches: 50, storage: 5 };

        const usersUsed = tenant.users || 0;
        const driversUsed = tenant.drivers || 0;
        const vehiclesUsed = tenant.vehicles || 0;

        let overageAmt = 0;
        const overageItems = [];

        if (limits.users !== 'Unlimited' && usersUsed > Number(limits.users)) {
          const diff = usersUsed - Number(limits.users);
          const cost = diff * (overageRates.users || 10);
          overageAmt += cost;
          overageItems.push(`${diff} extra users @ $${overageRates.users}/ea`);
        }
        if (limits.drivers !== 'Unlimited' && driversUsed > Number(limits.drivers)) {
          const diff = driversUsed - Number(limits.drivers);
          const cost = diff * (overageRates.drivers || 15);
          overageAmt += cost;
          overageItems.push(`${diff} extra drivers @ $${overageRates.drivers}/ea`);
        }
        if (limits.vehicles !== 'Unlimited' && vehiclesUsed > Number(limits.vehicles)) {
          const diff = vehiclesUsed - Number(limits.vehicles);
          const cost = diff * (overageRates.vehicles || 20);
          overageAmt += cost;
          overageItems.push(`${diff} extra vehicles @ $${overageRates.vehicles}/ea`);
        }

        if (overageAmt > 0) {
          // Generate Overage invoice in system mock database
          await apiClient.post(`subscriptions/${tenant.id}/invoices`, {
            amount: overageAmt,
            period: `SaaS Overages Audit Invoices: ${overageItems.join(', ')}`
          });
          invoiceCreated++;
          totalValue += overageAmt;
        }
      }

      triggerToast(`Limits scan completed. Evaluated: ${scanCount} workspaces. Invoiced: ${invoiceCreated} overage violations. Value: $${totalValue.toLocaleString()}`, 'success');
      logPlanAudit('Overage Billing Scan Run', `Overage scan completed. Processed ${scanCount} tenants, generated ${invoiceCreated} invoices for $${totalValue}.`);
      dispatch(fetchTenants());
    } catch (e) {
      console.error(e);
      triggerToast('Overage invoice scan run failed.', 'danger');
    }
  };

  // Column Visibility Handlers
  const toggleColumn = (colKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  // CSV/PDF Exports Registry
  const exportRegistryCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Plan ID,Plan Name,Version,Status,Monthly Price,Annual Price,Trial Days,Subscribers,Revenue,Last Updated\n';

    plans.forEach(plan => {
      const metrics = getPlanMetrics(plan.name);
      csvContent += `"${plan.id}","${plan.name}","${plan.version}","${plan.status}",$${plan.monthlyPrice},$${plan.annualPrice},${plan.trialDays},${metrics.subscribers},${metrics.revenue},"${plan.lastUpdated}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SaaS_Licensing_Plans_Registry.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Plans Registry spreadsheet CSV exported.', 'success');
  };

  // Bulk Actions
  const handleBulkStateChange = async (targetState) => {
    if (selectedPlanIds.length === 0) return;
    if (!window.confirm(`Bulk transition the selected ${selectedPlanIds.length} plans to "${targetState}"?`)) return;

    try {
      for (const id of selectedPlanIds) {
        const plan = plans.find(p => p.id === id);
        if (plan) {
          await apiClient.post(`plans/${id}/transition`, { status: targetState });
          logPlanAudit('Bulk Plan State Transited', `Plan "${plan.name}" bulk transitioned to status ${targetState}.`);
        }
      }
      triggerToast(`State transitioned for ${selectedPlanIds.length} plans to ${targetState}.`, 'success');
      setSelectedPlanIds([]);
      fetchData();
    } catch (e) {
      console.error(e);
      triggerToast('Bulk action execution failed.', 'danger');
    }
  };

  // Filter and Sort Plan lists
  const getFilteredPlansList = () => {
    return plans.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

      const price = billingPeriod === 'monthly' ? p.monthlyPrice : p.annualPrice;
      const matchesMinPrice = !priceMin || price >= Number(priceMin);
      const matchesMaxPrice = !priceMax || price <= Number(priceMax);

      return matchesSearch && matchesStatus && matchesMinPrice && matchesMaxPrice;
    });
  };

  const getSortedPlansList = () => {
    const filtered = getFilteredPlansList();
    return filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Custom fields checks
      if (sortField === 'monthlyPrice' || sortField === 'annualPrice' || sortField === 'trialDays') {
        valA = Number(a[sortField]);
        valB = Number(b[sortField]);
      } else if (sortField === 'subscribers') {
        valA = getPlanMetrics(a.name).subscribers;
        valB = getPlanMetrics(b.name).subscribers;
      } else if (sortField === 'revenue') {
        valA = getPlanMetrics(a.name).revenue;
        valB = getPlanMetrics(b.name).revenue;
      } else if (sortField === 'lastUpdated') {
        valA = new Date(a.lastUpdated).getTime();
        valB = new Date(b.lastUpdated).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedPlans = getSortedPlansList();
  const totalRegistryPages = Math.ceil(sortedPlans.length / pageSize);
  const paginatedPlans = sortedPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Compare Versions helper
  const p1HistoryLimits = selectedPlan?.versionHistory?.find(h => h.version === compareVersion1)?.limits;
  const p2HistoryLimits = selectedPlan?.versionHistory?.find(h => h.version === compareVersion2)?.limits;

  // Extract Invoice billing ledger list
  const getBillingLedgerList = () => {
    const invoices = [];
    tenants.forEach(tenant => {
      if (tenant.invoices) {
        tenant.invoices.forEach(inv => {
          invoices.push({
            id: inv.id,
            company: tenant.name,
            plan: tenant.plan,
            period: inv.period,
            amount: inv.amount,
            date: inv.date,
            status: inv.status,
            paymentMethod: tenant.payments?.find(p => p.date === inv.date)?.method || 'Stripe Gateway Gateway API'
          });
        });
      }
    });

    return invoices.filter(i => {
      const matchesSearch = i.company.toLowerCase().includes(ledgerSearch.toLowerCase()) || i.id.toLowerCase().includes(ledgerSearch.toLowerCase()) || i.period.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesStatus = ledgerStatusFilter === 'All' || i.status === ledgerStatusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const billingInvoices = getBillingLedgerList();

  return (
    <div className="space-y-6 text-left">
      
      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Licensing Plans</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">{plans.length}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">+1 added version v1.2</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Subscribers</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">{activeSubscribersCount}</strong>
          <span className="text-[9px] font-semibold text-brand-400 block mt-1.5">{tenants.filter(t => t.status === 'Hold').length} suspended instances held</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Trial Subscribers</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">{trialSubscribersCount}</strong>
          <span className="text-[9px] font-semibold text-amber-500 block mt-1.5">3 trial expiries soon</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Monthly Revenue (MRR)</span>
          <strong className="text-xl sm:text-2xl font-black text-brand-400 mt-2 block">${calculatedMrrVal.toLocaleString()}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">ARR projected: ${calculatedArrVal.toLocaleString()}</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Upgrade Rate</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">12.5%</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">+2.1% upgrade speed</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Downgrade Rate</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">1.8%</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">Stable vs Q1 limits</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Churn Rate</span>
          <strong className="text-xl sm:text-2xl font-black text-red-400 mt-2 block">2.4%</strong>
          <span className="text-[9px] font-semibold text-emerald-400 block mt-1.5">Historical low</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Growth Index</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2 block">94.8%</strong>
          <span className="text-[9px] font-semibold text-brand-400 block mt-1.5">SaaS scale health: Excellent</span>
        </div>
      </div>

      {/* Subscription Pricing Grid */}
      <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#23324C]/40 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Active Licensing Plans Overview</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Toggle billing terms and manage configurations of operational plan tires.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Monthly / Annual Toggle */}
            <div className="bg-[#0B0F19] border border-[#23324C] p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  billingPeriod === 'monthly' ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  billingPeriod === 'annual' ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual Billing (Save 15%)
              </button>
            </div>
            
            <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenCreateWizard}>
              Create Plan
            </Button>
          </div>
        </div>

        {/* 4 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.slice(0, 4).map(plan => {
            const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const periodLabel = billingPeriod === 'monthly' ? 'mo' : 'yr';
            const metrics = getPlanMetrics(plan.name);

            return (
              <div 
                key={plan.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between h-[360px] transition-all relative overflow-hidden group hover:scale-[1.01] ${
                  plan.status === 'Published' 
                    ? 'bg-brand-500/5 border-brand-500/25 hover:border-brand-500/40' 
                    : 'bg-[#111827]/40 border-[#23324C]/60 hover:border-[#23324C]/90'
                }`}
              >
                {/* Decorative glow */}
                {plan.status === 'Published' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 blur-xl rounded-full -mr-6 -mt-6"></div>
                )}
                
                <div>
                  <div className="flex justify-between items-start border-b border-[#23324C]/45 pb-3">
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-wide">{plan.name}</h4>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Version v{plan.version} • {plan.status}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      plan.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>{plan.status}</span>
                  </div>

                  <div className="mt-3.5 space-y-1 text-slate-400 text-[10px]">
                    <div className="flex justify-between"><span>Active Users:</span><strong className="text-white">{plan.limits.users}</strong></div>
                    <div className="flex justify-between"><span>Drivers capacity:</span><strong className="text-white">{plan.limits.drivers}</strong></div>
                    <div className="flex justify-between"><span>Fleet Vehicles:</span><strong className="text-white">{plan.limits.vehicles}</strong></div>
                    <div className="flex justify-between"><span>Cloud Storage:</span><strong className="text-white">{plan.limits.storage} GB</strong></div>
                    <div className="flex justify-between"><span>Trial Days:</span><strong className="text-white">{plan.trialDays} Days</strong></div>
                  </div>

                  <div className="mt-3.5 border-t border-[#23324C]/30 pt-3">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Key Modules</span>
                    <div className="flex flex-wrap gap-1 text-[8px] font-bold text-slate-300">
                      {plan.features.dispatch && <span className="bg-[#111827] border border-[#23324C] px-1.5 py-0.5 rounded">Dispatch</span>}
                      {plan.features.fleet && <span className="bg-[#111827] border border-[#23324C] px-1.5 py-0.5 rounded">Fleet</span>}
                      {plan.features.gps && <span className="bg-[#111827] border border-[#23324C] px-1.5 py-0.5 rounded">GPS</span>}
                      {plan.features.driverApp && <span className="bg-[#111827] border border-[#23324C] px-1.5 py-0.5 rounded">Driver App</span>}
                      {plan.features.ai && <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-1.5 py-0.5 rounded">AI dispatch</span>}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#23324C]/35 pt-4 mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h5 className="text-lg font-black text-brand-400">${price.toLocaleString()}<span className="text-[10px] text-slate-450 font-semibold">/{periodLabel}</span></h5>
                      <span className="text-[8px] text-slate-500 font-bold block">{metrics.subscribers} paying • ${metrics.revenue.toLocaleString()}/mo</span>
                    </div>
                    <span className="text-[8px] font-bold text-emerald-400">+5.4% growth</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleOpenEditWizard(plan)}>Configure</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleClonePlan(plan.id, plan.name)}>Clone Plan</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Navigation Panels Tabs */}
      <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
        
        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 border-b border-[#23324C]/45 pb-3 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'registry', label: 'Plan Registry', icon: Layers },
            { id: 'matrix', label: 'Feature Matrix', icon: Shield },
            { id: 'coupons', label: 'Promos & Coupons', icon: Percent },
            { id: 'trials', label: 'Trial Management', icon: Calendar },
            { id: 'revenue', label: 'Revenue Intelligence', icon: TrendingUp },
            { id: 'overages', label: 'Overage Billing', icon: AlertCircle },
            { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
            { id: 'migration', label: 'Bulk Migration', icon: ArrowLeftRight },
            { id: 'ledger', label: 'Billing Ledger', icon: DollarSign },
            { id: 'audits', label: 'Audit Center', icon: FileText }
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

        {/* Tab 1: Plan Management Registry */}
        {activeSubTab === 'registry' && (
          <div className="space-y-4">
            
            {/* Search & Actions Control row */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search plans name or ID..."
                  className="w-full sm:max-w-[220px]"
                />
                
                {/* Advanced Filters Trigger */}
                <div className="relative">
                  <Button size="sm" variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                    Filters
                  </Button>
                </div>

                {/* Column Visibility dropdown */}
                <div className="relative">
                  <Button size="sm" variant="secondary" icon={ChevronDown} iconPosition="right" onClick={() => setShowColDropdown(!showColDropdown)}>
                    Columns
                  </Button>
                  {showColDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowColDropdown(false)}></div>
                      <div className="absolute left-0 mt-1 w-48 bg-[#161F30] border border-[#23324C] rounded-xl shadow-2xl p-2 z-40 text-xs text-slate-300">
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
                <Button size="sm" variant="outline" icon={Download} onClick={exportRegistryCSV}>CSV Export</Button>
                <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenCreateWizard}>Create Plan</Button>
              </div>
            </div>

            {/* Price Ranges filters subbar */}
            {showFilters && (
              <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end animate-fade-in">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">State Lifecycle</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="All">All States</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Deprecated">Deprecated</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <TextInput label="Min Price ($)" type="number" placeholder="e.g. 100" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                </div>
                <div>
                  <TextInput label="Max Price ($)" type="number" placeholder="e.g. 2000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => { setPriceMin(''); setPriceMax(''); setFilterStatus('All'); }}>Reset</Button>
                  <Button size="sm" variant="primary" className="w-full" onClick={() => setShowFilters(false)}>Apply</Button>
                </div>
              </div>
            )}

            {/* Bulk actions drawer */}
            {selectedPlanIds.length > 0 && (
              <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3 flex justify-between items-center text-xs animate-fade-in">
                <span className="text-brand-400 font-bold">{selectedPlanIds.length} plans selected</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => handleBulkStateChange('Published')}>Bulk Publish</Button>
                  <Button size="sm" variant="purple" onClick={() => handleBulkStateChange('Deprecated')}>Bulk Deprecate</Button>
                  <Button size="sm" variant="danger" onClick={() => handleBulkStateChange('Archived')}>Bulk Archive</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedPlanIds([])}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Plans Table */}
            <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30">
              <table className="min-w-full text-left border-collapse text-xs">
                <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPlanIds.length === paginatedPlans.length && paginatedPlans.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlanIds(paginatedPlans.map(p => p.id));
                          } else {
                            setSelectedPlanIds([]);
                          }
                        }}
                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                      />
                    </th>
                    {visibleColumns.id && (
                      <th className="p-3">
                        <button onClick={() => { setSortField('id'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none">
                          Plan ID{sortField === 'id' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th className="p-3">
                        <button onClick={() => { setSortField('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none">
                          Plan Name{sortField === 'name' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.version && <th className="p-3">Version</th>}
                    {visibleColumns.status && <th className="p-3">Status</th>}
                    {visibleColumns.pricing && (
                      <th className="p-3">
                        <button onClick={() => { setSortField(billingPeriod === 'monthly' ? 'monthlyPrice' : 'annualPrice'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none">
                          Pricing{sortField === (billingPeriod === 'monthly' ? 'monthlyPrice' : 'annualPrice') && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.trialDays && <th className="p-3">Trial Days</th>}
                    {visibleColumns.subscribers && (
                      <th className="p-3">
                        <button onClick={() => { setSortField('subscribers'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none">
                          Subscribers{sortField === 'subscribers' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.revenue && (
                      <th className="p-3">
                        <button onClick={() => { setSortField('revenue'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none">
                          Revenue (MRR){sortField === 'revenue' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.createdBy && <th className="p-3">Created By</th>}
                    {visibleColumns.lastUpdated && (
                      <th className="p-3">
                        <button onClick={() => { setSortField('lastUpdated'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 font-extrabold text-slate-400 hover:text-white focus:outline-none">
                          Last Updated{sortField === 'lastUpdated' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.actions && <th className="p-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40">
                  {paginatedPlans.map((plan) => {
                    const metrics = getPlanMetrics(plan.name);
                    const isSelected = selectedPlanIds.includes(plan.id);

                    return (
                      <tr key={plan.id} className={`transition-colors hover:bg-slate-800/10 ${isSelected ? 'bg-brand-500/5' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlanIds(prev => [...prev, plan.id]);
                              } else {
                                setSelectedPlanIds(prev => prev.filter(id => id !== plan.id));
                              }
                            }}
                            className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                          />
                        </td>
                        {visibleColumns.id && <td className="p-3 font-mono text-slate-400">{plan.id}</td>}
                        {visibleColumns.name && <td className="p-3 text-white font-extrabold">{plan.name}</td>}
                        {visibleColumns.version && <td className="p-3 font-mono">v{plan.version}</td>}
                        {visibleColumns.status && (
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              plan.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' :
                              plan.status === 'Draft' ? 'bg-amber-500/10 text-amber-400' :
                              plan.status === 'Archived' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                            }`}>{plan.status}</span>
                          </td>
                        )}
                        {visibleColumns.pricing && (
                          <td className="p-3 font-bold font-mono">
                            {billingPeriod === 'monthly' ? `$${plan.monthlyPrice}/mo` : `$${plan.annualPrice}/yr`}
                          </td>
                        )}
                        {visibleColumns.trialDays && <td className="p-3 font-mono">{plan.trialDays} days</td>}
                        {visibleColumns.subscribers && <td className="p-3 font-mono font-bold text-white">{metrics.subscribers}</td>}
                        {visibleColumns.revenue && <td className="p-3 font-bold font-mono text-emerald-400">${metrics.revenue.toLocaleString()}</td>}
                        {visibleColumns.createdBy && <td className="p-3 text-slate-400 font-medium">{plan.createdBy}</td>}
                        {visibleColumns.lastUpdated && <td className="p-3 text-slate-400 font-mono">{plan.lastUpdated}</td>}
                        {visibleColumns.actions && (
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              <Button size="sm" variant="secondary" onClick={() => handleOpenEditWizard(plan)}>Configure</Button>
                              <Button size="sm" variant="secondary" onClick={() => { setSelectedPlan(plan); setVersionDrawerOpen(true); }}>Versioning</Button>
                              
                              {plan.status === 'Draft' && (
                                <Button size="sm" variant="success" onClick={() => handleTransitionClick(plan, 'Published')}>Publish</Button>
                              )}
                              {plan.status === 'Published' && (
                                <Button size="sm" variant="purple" onClick={() => handleTransitionClick(plan, 'Deprecated')}>Deprecate</Button>
                              )}
                              {plan.status === 'Deprecated' && (
                                <Button size="sm" variant="danger" onClick={() => handleTransitionClick(plan, 'Archived')}>Archive</Button>
                              )}
                              {plan.status === 'Archived' && (
                                <Button size="sm" variant="success" onClick={() => handleTransitionClick(plan, 'Draft')}>Restore Draft</Button>
                              )}
                              <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeletePlan(plan.id, plan.name)} />
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalRegistryPages} onPageChange={setCurrentPage} />
          </div>
        )}

        {/* Tab 2: Feature Matrix */}
        {activeSubTab === 'matrix' && (
          <div className="space-y-4 text-slate-300">
            <div className="border border-[#23324C] rounded-2xl overflow-hidden">
              <table className="min-w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    <th className="p-3 w-1/3">Service Module Feature</th>
                    {plans.map(p => <th key={p.id} className="p-3 text-center text-white">{p.name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40 font-semibold">
                  {[
                    { key: 'dispatch', label: 'Route Dispatch & Booking Console' },
                    { key: 'fleet', label: 'Fleet Asset Maintenance Logs' },
                    { key: 'gps', label: 'Live GPS Coordinates Geofences' },
                    { key: 'driverApp', label: 'Digital ELD Driver Mobile App' },
                    { key: 'accounting', label: 'Carrier Expense Factoring Rules' },
                    { key: 'ai', label: 'AI Optimization Autopiloting Dispatch' },
                    { key: 'reporting', label: 'Global Business Intelligence Reports' },
                    { key: 'api', label: 'Granular Developers API Integration Sandbox' },
                    { key: 'customerPortal', label: 'White-Label Shipper Portal Gateway' },
                    { key: 'integrations', label: 'Third-Party Brokers TMS Integration Connectors' }
                  ].map(row => (
                    <tr key={row.key} className="hover:bg-slate-800/10">
                      <td className="p-3 text-white">{row.label}</td>
                      {plans.map(plan => {
                        const enabled = plan.features[row.key];
                        return (
                          <td key={plan.id} className="p-3 text-center">
                            {enabled ? (
                              <Check className="h-4.5 w-4.5 text-emerald-400 mx-auto" />
                            ) : (
                              <span className="text-slate-600 font-mono text-[9px]">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Usage capacity matrix rows */}
                  <tr className="bg-[#161F30]/20 font-black"><td className="p-3 text-brand-400 uppercase tracking-widest text-[9px]" colSpan={plans.length + 1}>Capacity Allocation Thresholds</td></tr>
                  {['users', 'drivers', 'vehicles', 'branches', 'storage', 'apiCalls'].map(lim => (
                    <tr key={lim} className="hover:bg-slate-800/10 text-slate-400">
                      <td className="p-3 text-white capitalize">{lim.replace(/([A-Z])/g, ' $1')} Limit</td>
                      {plans.map(plan => (
                        <td key={plan.id} className="p-3 text-center font-mono font-bold text-white">
                          {plan.limits[lim]} {lim === 'storage' ? 'GB' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Coupons Engine */}
        {activeSubTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <SearchInput 
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                onClear={() => setCouponSearch('')}
                placeholder="Search codes or campaigns..."
                className="w-full sm:max-w-[220px]"
              />
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setCouponModalOpen(true)}>
                Add Coupon Code
              </Button>
            </div>

            <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30 text-xs">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Promo Code</th>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Discount Value</th>
                    <th className="p-3">Redemptions</th>
                    <th className="p-3">Redemption Limit</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40">
                  {coupons
                    .filter(c => c.code.toLowerCase().includes(couponSearch.toLowerCase()) || c.campaign.toLowerCase().includes(couponSearch.toLowerCase()))
                    .map(coupon => {
                      const pct = Math.min((coupon.usageCount / coupon.redemptionLimit) * 100, 100);
                      return (
                        <tr key={coupon.id} className="hover:bg-slate-800/10 text-slate-300">
                          <td className="p-3 font-mono font-black text-brand-400">{coupon.code}</td>
                          <td className="p-3 font-semibold text-white">{coupon.campaign}</td>
                          <td className="p-3 font-medium text-slate-400">{coupon.type}</td>
                          <td className="p-3 font-bold font-mono">
                            {coupon.type === 'Percentage Discount' ? `${coupon.discount}% off` : 
                             coupon.type === 'Trial Extension' ? `${coupon.discount} extra days` : `$${coupon.discount} off`}
                          </td>
                          <td className="p-3 font-mono">
                            <div className="flex items-center gap-2">
                              <span>{coupon.usageCount}</span>
                              <div className="w-16 bg-slate-900 rounded-full h-1">
                                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono">{coupon.redemptionLimit} max</td>
                          <td className="p-3 font-mono">{coupon.expiryDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              coupon.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>{coupon.status}</span>
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeleteCoupon(coupon.code)} />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Trial Management */}
        {activeSubTab === 'trials' && (
          <div className="space-y-4">
            <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30 text-xs">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Tenant Company</th>
                    <th className="p-3">Workspace Admin</th>
                    <th className="p-3">Trial Expiry Date</th>
                    <th className="p-3">Days Remaining</th>
                    <th className="p-3">Limits Violations</th>
                    <th className="p-3">Redemption Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40">
                  {tenants.filter(t => t.plan === 'Starter').map(tenant => {
                    const expiry = new Date(tenant.trialExpiry || '07/15/2026');
                    const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isExpiring = diffDays <= 7;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-800/10 text-slate-300">
                        <td className="p-3 font-extrabold text-white">{tenant.name}</td>
                        <td className="p-3">{tenant.manager || 'admin@trial.com'}</td>
                        <td className="p-3 font-mono font-bold">{tenant.trialExpiry || '07/15/2026'}</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={isExpiring ? 'text-red-400 animate-pulse' : 'text-slate-350'}>
                            {diffDays > 0 ? `${diffDays} Days` : 'Expired'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-semibold font-mono text-slate-400">
                            Users: {tenant.users}/3 • Drivers: {tenant.drivers}/5
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            tenant.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>{tenant.status === 'Active' ? 'Active trial' : 'Held / Inactive'}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="success" onClick={() => handleConvertTrial(tenant, 'Professional')}>Convert to Paid</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleExtendTrial(tenant)}>Extend (+14d)</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleSendTrialReminder(tenant)}>Notify</Button>
                            <Button size="sm" variant="danger" onClick={() => handleCancelTrial(tenant)}>Cancel</Button>
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

        {/* Tab 5: Revenue Intelligence */}
        {activeSubTab === 'revenue' && (
          <div className="space-y-6 text-slate-300 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* MRR Trend Chart Container */}
              <div className="lg:col-span-8 bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-extrabold">Dynamic MRR Expansion Timeline (USD)</h4>
                  <span className="text-[9px] font-bold text-slate-500 font-mono">Q1-Q2 Audited cash flow</span>
                </div>
                
                {/* SVG Line Chart */}
                <div className="h-60 w-full relative pt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="50" y1="30" x2="480" y2="30" stroke="#23324C" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="50" y1="80" x2="480" y2="80" stroke="#23324C" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="50" y1="130" x2="480" y2="130" stroke="#23324C" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="50" y1="180" x2="480" y2="180" stroke="#23324C" strokeWidth="1" />
                    
                    {/* Area fill */}
                    <path d="M 50 180 L 50 140 Q 120 120 190 100 T 330 60 T 470 40 L 470 180 Z" fill="url(#chart-grad)" />
                    
                    {/* Stroke line */}
                    <path d="M 50 140 Q 120 120 190 100 T 330 60 T 470 40" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
                    
                    {/* Data dots */}
                    <circle cx="50" cy="140" r="4.5" fill="#0ea5e9" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="190" cy="100" r="4.5" fill="#0ea5e9" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="330" cy="60" r="4.5" fill="#0ea5e9" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="470" cy="40" r="4.5" fill="#0ea5e9" stroke="#0B0F19" strokeWidth="1.5" />
                    
                    {/* Axis Labels */}
                    <text x="50" y="195" fill="#64748b" fontSize="8" textAnchor="middle">Jan</text>
                    <text x="190" y="195" fill="#64748b" fontSize="8" textAnchor="middle">Mar</text>
                    <text x="330" y="195" fill="#64748b" fontSize="8" textAnchor="middle">May</text>
                    <text x="470" y="195" fill="#64748b" fontSize="8" textAnchor="middle">Jun</text>
                    
                    <text x="40" y="140" fill="#64748b" fontSize="8" textAnchor="end" dominantBaseline="middle">$10k</text>
                    <text x="40" y="100" fill="#64748b" fontSize="8" textAnchor="end" dominantBaseline="middle">$25k</text>
                    <text x="40" y="60" fill="#64748b" fontSize="8" textAnchor="end" dominantBaseline="middle">$42k</text>
                  </svg>
                </div>
              </div>

              {/* Plans Subscriber Breakdown */}
              <div className="lg:col-span-4 bg-[#111827] border border-[#23324C] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-extrabold mb-1">Subscriber Mix Analytics</h4>
                  <p className="text-[10px] text-slate-500">Distribution index of operational licensing accounts.</p>
                </div>

                <div className="my-4 flex justify-center relative">
                  {/* SVG Pie Chart Mock */}
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#23324C" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="62.8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <strong className="text-white text-sm font-black">{tenants.length}</strong>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Tenants</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[9px] font-bold">
                  <div className="flex justify-between items-center text-slate-350">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span> Professional Plan</div>
                    <span className="font-mono">40% mix</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-350">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Starter Plan</div>
                    <span className="font-mono">40% mix</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-350">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Enterprise Plan</div>
                    <span className="font-mono">20% mix</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Revenue Intelligence Metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Customer Lifetime Value (LTV)</span>
                <strong className="text-lg font-black text-white mt-1 block">$18,450.00</strong>
                <span className="text-[9px] text-emerald-400 block mt-0.5">LTV to CAC ratio: 4.8x (Excellent)</span>
              </div>
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Customer Acquisition Cost (CAC)</span>
                <strong className="text-lg font-black text-white mt-1 block">$3,840.00</strong>
                <span className="text-[9px] text-brand-400 block mt-0.5">Payback period: 7.8 months</span>
              </div>
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Revenue Churn Rate (MRR Churn)</span>
                <strong className="text-lg font-black text-red-400 mt-1 block">1.4% / mo</strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Net Revenue Retention (NRR): 108.5%</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Overage Billing Engine */}
        {activeSubTab === 'overages' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-wide">Usage Limit Violations & Overage Auditor</h4>
                <p className="text-[10px] text-slate-450 mt-0.5">Real-time scan to identify overages and automatically queue invoices to the billing ledger.</p>
              </div>
              
              <Button size="sm" variant="primary" icon={Activity} onClick={handleOverageInvoicingScan}>
                Scan & Generate Overage Invoices
              </Button>
            </div>

            <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30 text-xs">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Company Workspace</th>
                    <th className="p-3">Plan Level</th>
                    <th className="p-3">Users (Limit)</th>
                    <th className="p-3">Drivers (Limit)</th>
                    <th className="p-3">Vehicles (Limit)</th>
                    <th className="p-3">Overage Status</th>
                    <th className="p-3">Calculated Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40">
                  {tenants.map(tenant => {
                    const plan = plans.find(p => p.name === tenant.plan);
                    if (!plan) return null;
                    const limits = plan.limits;
                    
                    const userLimit = limits.users;
                    const driverLimit = limits.drivers;
                    const vehicleLimit = limits.vehicles;
                    
                    const usersOver = userLimit !== 'Unlimited' && tenant.users > Number(userLimit);
                    const driversOver = driverLimit !== 'Unlimited' && tenant.drivers > Number(driverLimit);
                    const vehiclesOver = vehicleLimit !== 'Unlimited' && tenant.vehicles > Number(vehicleLimit);
                    const hasOverage = usersOver || driversOver || vehiclesOver;

                    // Calculate overage costs
                    const overageRates = plan.overages || { users: 10, drivers: 15, vehicles: 20 };
                    let cost = 0;
                    if (usersOver) cost += (tenant.users - Number(userLimit)) * overageRates.users;
                    if (driversOver) cost += (tenant.drivers - Number(driverLimit)) * overageRates.drivers;
                    if (vehiclesOver) cost += (tenant.vehicles - Number(vehicleLimit)) * overageRates.vehicles;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-800/10 text-slate-300">
                        <td className="p-3 font-extrabold text-white">{tenant.name}</td>
                        <td className="p-3">{tenant.plan}</td>
                        <td className={`p-3 font-mono font-bold ${usersOver ? 'text-red-400 font-black' : ''}`}>
                          {tenant.users} / {userLimit}
                        </td>
                        <td className={`p-3 font-mono font-bold ${driversOver ? 'text-red-400 font-black' : ''}`}>
                          {tenant.drivers || 0} / {driverLimit}
                        </td>
                        <td className={`p-3 font-mono font-bold ${vehiclesOver ? 'text-red-400 font-black' : ''}`}>
                          {tenant.vehicles || 0} / {vehicleLimit}
                        </td>
                        <td className="p-3">
                          {hasOverage ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">Overage alert</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400">Within limits</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {cost > 0 ? (
                            <span className="text-red-400">+${cost.toLocaleString()}/mo</span>
                          ) : (
                            <span className="text-slate-500">$0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Payment Gateway Configurations */}
        {activeSubTab === 'gateways' && (
          <form onSubmit={handleGatewaySave} className="space-y-6 text-xs text-left max-w-2xl">
            <h4 className="text-white text-xs font-black uppercase tracking-wide border-b border-[#23324C]/40 pb-2">Global Payment Gateways Credentials</h4>
            
            <div className="space-y-4">
              {/* Stripe Config */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3.5">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 font-extrabold text-white cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={gatewayForm.stripeEnabled} 
                      onChange={(e) => setGatewayForm(prev => ({ ...prev, stripeEnabled: e.target.checked }))}
                      className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                    />
                    Stripe Credit Card Gateway Integration
                  </label>
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded">Core Payment Node</span>
                </div>
                {gatewayForm.stripeEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                    <TextInput label="Stripe Publishable API Key" type="password" value={gatewayForm.stripePublishableKey} onChange={(e) => setGatewayForm(prev => ({ ...prev, stripePublishableKey: e.target.value }))} />
                    <TextInput label="Stripe Secret Signature Key" type="password" value={gatewayForm.stripeSecretKey} onChange={(e) => setGatewayForm(prev => ({ ...prev, stripeSecretKey: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* PayPal Config */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3.5">
                <label className="flex items-center gap-2 font-extrabold text-white cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={gatewayForm.paypalEnabled} 
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, paypalEnabled: e.target.checked }))}
                    className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                  />
                  PayPal Checkout Express
                </label>
                {gatewayForm.paypalEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                    <TextInput label="PayPal Sandbox Client ID" type="password" value={gatewayForm.paypalClientId} onChange={(e) => setGatewayForm(prev => ({ ...prev, paypalClientId: e.target.value }))} />
                    <TextInput label="PayPal API Secret Signature Key" type="password" value={gatewayForm.paypalSecretKey} onChange={(e) => setGatewayForm(prev => ({ ...prev, paypalSecretKey: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* ACH Config */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3.5">
                <label className="flex items-center gap-2 font-extrabold text-white cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={gatewayForm.achEnabled} 
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, achEnabled: e.target.checked }))}
                    className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                  />
                  ACH Electronic Direct Bank Deposit (Plaid Secure Node)
                </label>
                {gatewayForm.achEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                    <TextInput label="ACH Clearing Routing Transit Number" value={gatewayForm.achRoutingNumber} onChange={(e) => setGatewayForm(prev => ({ ...prev, achRoutingNumber: e.target.value }))} />
                    <TextInput label="ACH Corporate Depositors Account Number" type="password" value={gatewayForm.achAccountNumber} onChange={(e) => setGatewayForm(prev => ({ ...prev, achAccountNumber: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Wire Transfer Config */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3.5">
                <label className="flex items-center gap-2 font-extrabold text-white cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={gatewayForm.wireEnabled} 
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, wireEnabled: e.target.checked }))}
                    className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                  />
                  Corporate Wire Bank Transfer
                </label>
                {gatewayForm.wireEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                    <TextInput label="Wire Bank Name" value={gatewayForm.wireBankName} onChange={(e) => setGatewayForm(prev => ({ ...prev, wireBankName: e.target.value }))} />
                    <TextInput label="SWIFT/BIC routing code" value={gatewayForm.wireSwiftCode} onChange={(e) => setGatewayForm(prev => ({ ...prev, wireSwiftCode: e.target.value }))} />
                    <TextInput label="Wire Account number" type="password" value={gatewayForm.wireAccountNumber} onChange={(e) => setGatewayForm(prev => ({ ...prev, wireAccountNumber: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Manual Billing instructions */}
              <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-2">
                <label className="flex items-center gap-2 font-extrabold text-white cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={gatewayForm.manualEnabled} 
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, manualEnabled: e.target.checked }))}
                    className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                  />
                  Manual Invoicing & Purchase Order Terms
                </label>
                {gatewayForm.manualEnabled && (
                  <div className="pt-2 animate-fade-in">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">Default Net Payment Terms Instructions</label>
                    <textarea 
                      value={gatewayForm.manualBillingInstructions}
                      onChange={(e) => setGatewayForm(prev => ({ ...prev, manualBillingInstructions: e.target.value }))}
                      className="block w-full px-4 py-3 bg-[#111827]/80 text-slate-200 text-xs rounded-xl focus:outline-none transition-all border border-[#23324C] focus:border-brand-500" 
                      rows={2} 
                    />
                  </div>
                )}
              </div>

            </div>

            <Button type="submit" variant="primary" className="w-full">
              Save Gateway configurations
            </Button>
          </form>
        )}

        {/* Tab 8: Bulk Tenant Migration Wizard */}
        {activeSubTab === 'migration' && (
          <div className="space-y-6 text-xs text-left max-w-3xl">
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-wide">Bulk Subscriber Plan Migrator</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Move cohorts of active subscribers between plan tiers. Reallocation triggers automated validations, overage reviews, and ledger updates.</p>
            </div>

            {/* Migration wizard steps UI */}
            <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-5 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput 
                  label="Select Source Plan Level" 
                  value={migrationSource}
                  onChange={(e) => setMigrationSource(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Plan --' },
                    { value: 'Starter', label: 'Starter Tier' },
                    { value: 'Professional', label: 'Professional Tier' },
                    { value: 'Enterprise', label: 'Enterprise Tier' }
                  ]}
                />
                
                <SelectInput 
                  label="Select Target Destination Plan Level" 
                  value={migrationTarget}
                  onChange={(e) => setMigrationTarget(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Plan --' },
                    { value: 'Starter', label: 'Starter Tier' },
                    { value: 'Professional', label: 'Professional Tier' },
                    { value: 'Enterprise', label: 'Enterprise Tier' }
                  ]}
                />
              </div>

              {migrationSource && migrationTarget && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={Activity} onClick={runMigrationValidation}>
                      Validate Capacity & Run Simulation Check
                    </Button>
                    {migrationRollbackList && (
                      <Button size="sm" variant="outline" icon={RotateCcw} onClick={handleRollbackMigration} loading={isMigrating}>
                        Revert Last Migration
                      </Button>
                    )}
                  </div>

                  {/* Validation results logs */}
                  <div className="bg-slate-900 border border-[#23324C] p-3 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block border-b border-[#23324C]/45 pb-1">Capacity Verification Check Report</span>
                    {migrationValidation.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                          <AlertCircle className="h-4 w-4" /> Usage overflow warning: {migrationValidation.length} accounts will exceed limits on target plan level.
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 pl-5 list-disc text-slate-350">
                          {migrationValidation.map((warn, i) => (
                            <div key={i}>
                              <strong>{warn.tenantName}</strong>: current usage exceeds limits for {warn.violations.join(', ')}.
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Check className="h-4 w-4" /> Capacity verification passed: All tenants fit resource allocations of the target plan.
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-[#23324C]/35 pt-4 flex justify-between items-center">
                    <div className="text-slate-400">
                      Cohort size matched: <strong className="text-white">{tenants.filter(t => t.plan === migrationSource).length} active accounts</strong>.
                    </div>
                    <Button variant="primary" onClick={handleMigrateExecute} loading={isMigrating}>
                      Execute Cohort Migration
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Tab 9: Billing Ledger */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <SearchInput 
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                onClear={() => setLedgerSearch('')}
                placeholder="Search invoices by company or ID..."
                className="w-full sm:max-w-[220px]"
              />
              
              <div className="flex items-center gap-2 justify-end">
                <span className="text-slate-450 font-bold">Status Filter:</span>
                <select
                  value={ledgerStatusFilter}
                  onChange={(e) => setLedgerStatusFilter(e.target.value)}
                  className="bg-[#0B0F19] border border-[#23324C] text-slate-200 p-2 rounded-xl focus:outline-none cursor-pointer text-xs"
                >
                  <option value="All">All Invoices</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="border border-[#23324C] rounded-2xl overflow-x-auto bg-[#161F30]/30">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#161F30] border-b border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Company Workspace</th>
                    <th className="p-3">Plan Level</th>
                    <th className="p-3">Billing Period</th>
                    <th className="p-3">Issued Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/40">
                  {billingInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/10 text-slate-300">
                      <td className="p-3 font-mono font-bold text-slate-400">{inv.id}</td>
                      <td className="p-3 font-extrabold text-white">{inv.company}</td>
                      <td className="p-3 font-medium text-slate-350">{inv.plan}</td>
                      <td className="p-3 text-slate-400 truncate max-w-[180px]" title={inv.period}>{inv.period}</td>
                      <td className="p-3 font-mono">{inv.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>{inv.status}</span>
                      </td>
                      <td className="p-3 text-[10px] text-slate-450">{inv.paymentMethod}</td>
                      <td className="p-3 font-mono font-bold text-white">${inv.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <Button size="sm" variant="secondary" onClick={() => { setSelectedInvoice(inv); setInvoiceDetailsModal(true); }}>
                          Inspect Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 10: Plan Audits Log */}
        {activeSubTab === 'audits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-3">
              <SearchInput 
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                onClear={() => setAuditSearch('')}
                placeholder="Search audit actions or descriptions..."
                className="w-full sm:max-w-[260px]"
              />
              <span className="text-[10px] text-slate-500 font-mono font-bold">{planAudits.length} ledger operations logged</span>
            </div>

            <div className="border border-[#23324C] rounded-2xl p-4 bg-[#161F30]/30 max-h-[380px] overflow-y-auto divide-y divide-[#23324C]/35 text-xs text-left">
              {planAudits
                .filter(log => log.action.toLowerCase().includes(auditSearch.toLowerCase()) || log.detail.toLowerCase().includes(auditSearch.toLowerCase()))
                .map((log) => (
                  <div key={log.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <strong className="text-white block font-bold">{log.action}</strong>
                        <p className="text-slate-400 mt-0.5 leading-normal">{log.detail}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-slate-500 font-mono mt-1">
                      <span>Operator: {log.user || 'Super Admin'}</span>
                      <span>IP Address: {log.ip || '192.168.1.1'}</span>
                    </div>
                  </div>
                ))}
              {planAudits.length === 0 && (
                <div className="p-8 text-center text-slate-500 italic">No plan audits logged.</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* --- WIZARD / DRAWERS MODALS --- */}
      {/* 5-Step Create Plan Wizard Modal */}
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title={wizardEditingPlanId ? "Configure Plan Licensing Rules" : "SaaS License Provisioning Wizard"}>
        <div className="space-y-5 text-left text-xs text-slate-300">
          
          {/* Progress bar steps */}
          <div className="flex justify-between items-center border-b border-[#23324C]/45 pb-3">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="flex items-center gap-1 font-bold">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  wizardStep === step ? 'bg-brand-500 text-slate-950 font-black' : 
                  wizardStep > step ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 border border-[#23324C] text-slate-500'
                }`}>
                  {step}
                </span>
                <span className={`hidden sm:inline ${wizardStep === step ? 'text-white' : 'text-slate-500'}`}>
                  {step === 1 ? 'Info' : step === 2 ? 'Limits' : step === 3 ? 'Features' : step === 4 ? 'Billing' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <div className="min-h-[220px]">
            {/* Step 1: Info */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <TextInput label="Plan Tier Name" required placeholder="e.g. Premium Plus" value={planForm.name} onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))} />
                  <TextInput label="Version" placeholder="e.g. 1.0.0" value={planForm.version} onChange={(e) => setPlanForm(prev => ({ ...prev, version: e.target.value }))} />
                </div>
                <SelectInput 
                  label="Initial Lifecycle Status" 
                  value={planForm.status} 
                  onChange={(e) => setPlanForm(prev => ({ ...prev, status: e.target.value }))}
                  options={[
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Published', label: 'Published' },
                    { value: 'Scheduled', label: 'Scheduled' }
                  ]}
                />
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">Description</label>
                  <textarea 
                    value={planForm.description}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide description outline of licensing rules..."
                    className="block w-full px-4 py-3 bg-[#111827]/80 text-slate-200 text-xs rounded-xl focus:outline-none transition-all border border-[#23324C] focus:border-brand-500" 
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Limits */}
            {wizardStep === 2 && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <TextInput label="Max Users Limit" placeholder="e.g. 10 or Unlimited" value={planForm.limits.users} onChange={(e) => setPlanForm(prev => ({ ...prev, limits: { ...prev.limits, users: e.target.value } }))} />
                <TextInput label="Max Drivers Limit" placeholder="e.g. 20 or Unlimited" value={planForm.limits.drivers} onChange={(e) => setPlanForm(prev => ({ ...prev, limits: { ...prev.limits, drivers: e.target.value } }))} />
                <TextInput label="Max Vehicles Limit" placeholder="e.g. 20 or Unlimited" value={planForm.limits.vehicles} onChange={(e) => setPlanForm(prev => ({ ...prev, limits: { ...prev.limits, vehicles: e.target.value } }))} />
                <TextInput label="Max Branches Limit" placeholder="e.g. 3 or Unlimited" value={planForm.limits.branches} onChange={(e) => setPlanForm(prev => ({ ...prev, limits: { ...prev.limits, branches: e.target.value } }))} />
                <TextInput label="Cloud Storage Limit (GB)" placeholder="e.g. 100 or Unlimited" value={planForm.limits.storage} onChange={(e) => setPlanForm(prev => ({ ...prev, limits: { ...prev.limits, storage: e.target.value } }))} />
                <TextInput label="API Calls Limit / day" placeholder="e.g. 50000 or Unlimited" value={planForm.limits.apiCalls} onChange={(e) => setPlanForm(prev => ({ ...prev, limits: { ...prev.limits, apiCalls: e.target.value } }))} />
              </div>
            )}

            {/* Step 3: Feature bundle checklist */}
            {wizardStep === 3 && (
              <div className="grid grid-cols-2 gap-2 animate-fade-in text-xs font-semibold">
                {Object.keys(planForm.features).map(feat => (
                  <label key={feat} className="flex items-center gap-2 p-2 hover:bg-slate-900/40 rounded-xl cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={planForm.features[feat]} 
                      onChange={(e) => setPlanForm(prev => ({ ...prev, features: { ...prev.features, [feat]: e.target.checked } }))}
                      className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer" 
                    />
                    <span className="capitalize">{feat.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Step 4: Billing & Overages Rules */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <TextInput label="Monthly Price ($)" required placeholder="e.g. 199" value={planForm.monthlyPrice} onChange={(e) => setPlanForm(prev => ({ ...prev, monthlyPrice: e.target.value }))} />
                  <TextInput label="Annual Price ($)" required placeholder="e.g. 1990" value={planForm.annualPrice} onChange={(e) => setPlanForm(prev => ({ ...prev, annualPrice: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <TextInput label="Trial Days" placeholder="e.g. 14" value={planForm.trialDays} onChange={(e) => setPlanForm(prev => ({ ...prev, trialDays: e.target.value }))} />
                  <TextInput label="Setup Fee ($)" placeholder="e.g. 0" value={planForm.setupFee} onChange={(e) => setPlanForm(prev => ({ ...prev, setupFee: e.target.value }))} />
                  <TextInput label="Cancellation Fee ($)" placeholder="e.g. 0" value={planForm.cancellationFee} onChange={(e) => setPlanForm(prev => ({ ...prev, cancellationFee: e.target.value }))} />
                </div>
                
                {/* Overages definitions */}
                <div className="border-t border-[#23324C]/45 pt-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Granular Overage Rates ($ / unit / mo)</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <TextInput label="User Overage" value={planForm.overages.users} onChange={(e) => setPlanForm(prev => ({ ...prev, overages: { ...prev.overages, users: e.target.value } }))} />
                    <TextInput label="Driver Overage" value={planForm.overages.drivers} onChange={(e) => setPlanForm(prev => ({ ...prev, overages: { ...prev.overages, drivers: e.target.value } }))} />
                    <TextInput label="Vehicle Overage" value={planForm.overages.vehicles} onChange={(e) => setPlanForm(prev => ({ ...prev, overages: { ...prev.overages, vehicles: e.target.value } }))} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Publish */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3.5 space-y-2">
                  <h5 className="font-extrabold text-white text-sm uppercase">{planForm.name}</h5>
                  <p className="text-slate-400 italic">"{planForm.description || 'No plan description provided.'}"</p>
                  
                  <div className="border-t border-[#23324C]/35 pt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-350">
                    <div>Pricing: <strong className="text-white">${planForm.monthlyPrice}/mo or ${planForm.annualPrice}/yr</strong></div>
                    <div>Trial Days: <strong className="text-white">{planForm.trialDays} days</strong></div>
                    <div>Status: <strong className="text-brand-400">{planForm.status}</strong></div>
                    <div>Version: <strong className="text-white">v{planForm.version}</strong></div>
                  </div>
                </div>

                <div className="bg-[#111827] border border-[#23324C]/45 rounded-xl p-3.5 space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Capacity allocations</span>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div>Users: <strong className="text-slate-200">{planForm.limits.users}</strong></div>
                    <div>Drivers: <strong className="text-slate-200">{planForm.limits.drivers}</strong></div>
                    <div>Vehicles: <strong className="text-slate-200">{planForm.limits.vehicles}</strong></div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action buttons controls */}
          <div className="flex gap-2 justify-end border-t border-[#23324C]/40 pt-4">
            {wizardStep > 1 && (
              <Button variant="secondary" onClick={() => setWizardStep(prev => prev - 1)}>Back</Button>
            )}
            {wizardStep < 5 ? (
              <Button variant="primary" onClick={() => setWizardStep(prev => prev + 1)}>Next Step</Button>
            ) : (
              <Button variant="success" onClick={handleWizardSubmit}>
                {wizardEditingPlanId ? "Save Configurations" : "Provision Plan"}
              </Button>
            )}
          </div>

        </div>
      </Modal>

      {/* Plan Version History Drawer */}
      <Drawer isOpen={versionDrawerOpen} onClose={() => setVersionDrawerOpen(false)} title="Version Control Center">
        {selectedPlan && (
          <div className="space-y-6 text-slate-300 text-left text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/50 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-base font-black text-white">{selectedPlan.name}</h4>
                <span className="text-[10px] font-mono text-slate-400">Current version v{selectedPlan.version}</span>
              </div>
              <span className="bg-brand-500/10 text-brand-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full">{selectedPlan.status}</span>
            </div>

            {/* Version rollbacks registry log */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block">Version Updates Log</span>
              
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {(selectedPlan.versionHistory || []).map((history, i) => (
                  <div key={i} className="bg-[#111827] border border-[#23324C]/45 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-white block font-bold">Version v{history.version}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{history.changeLog}</span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">{history.date} • {history.updatedBy}</span>
                    </div>
                    {history.version !== selectedPlan.version && (
                      <Button size="sm" variant="secondary" onClick={() => handleRollbackVersion(history.version)}>
                        Rollback
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Version comparison wizard */}
            <form onSubmit={handleCompareSubmit} className="border-t border-[#23324C]/40 pt-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block">Compare Versions side-by-side</span>
              <div className="grid grid-cols-2 gap-3">
                <SelectInput 
                  label="Version A" 
                  value={compareVersion1}
                  onChange={(e) => setCompareVersion1(e.target.value)}
                  options={[
                    { value: '', label: '-- Select A --' },
                    ...(selectedPlan.versionHistory || []).map(h => ({ value: h.version, label: `v${h.version}` }))
                  ]}
                />
                
                <SelectInput 
                  label="Version B" 
                  value={compareVersion2}
                  onChange={(e) => setCompareVersion2(e.target.value)}
                  options={[
                    { value: '', label: '-- Select B --' },
                    ...(selectedPlan.versionHistory || []).map(h => ({ value: h.version, label: `v${h.version}` }))
                  ]}
                />
              </div>
              
              <Button type="submit" variant="primary" className="w-full">
                Compare Selected Versions
              </Button>
            </form>

          </div>
        )}
      </Drawer>

      {/* Compare version side-by-side Modal */}
      <Modal isOpen={compareModalOpen} onClose={() => setCompareModalOpen(false)} title={`Compare Versions: ${selectedPlan?.name}`}>
        <div className="grid grid-cols-2 gap-4 text-xs text-left text-slate-300">
          <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3">
            <h4 className="text-white text-sm font-black uppercase text-center border-b border-[#23324C]/40 pb-2">Version v{compareVersion1}</h4>
            {p1HistoryLimits ? (
              <div className="space-y-1 font-semibold text-[11px]">
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Users Limit:</span><strong className="text-white">{p1HistoryLimits.users}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Drivers Limit:</span><strong className="text-white">{p1HistoryLimits.drivers}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Vehicles Limit:</span><strong className="text-white">{p1HistoryLimits.vehicles}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Branches Limit:</span><strong className="text-white">{p1HistoryLimits.branches}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Storage Limit:</span><strong className="text-white">{p1HistoryLimits.storage} GB</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>API Limit:</span><strong className="text-white">{p1HistoryLimits.apiCalls}</strong></div>
              </div>
            ) : (
              <div className="text-center text-slate-500 italic py-8">Select version.</div>
            )}
          </div>

          <div className="bg-[#111827] border border-[#23324C] rounded-2xl p-4 space-y-3">
            <h4 className="text-white text-sm font-black uppercase text-center border-b border-[#23324C]/40 pb-2">Version v{compareVersion2}</h4>
            {p2HistoryLimits ? (
              <div className="space-y-1 font-semibold text-[11px]">
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Users Limit:</span><strong className="text-white">{p2HistoryLimits.users}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Drivers Limit:</span><strong className="text-white">{p2HistoryLimits.drivers}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Vehicles Limit:</span><strong className="text-white">{p2HistoryLimits.vehicles}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Branches Limit:</span><strong className="text-white">{p2HistoryLimits.branches}</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>Storage Limit:</span><strong className="text-white">{p2HistoryLimits.storage} GB</strong></div>
                <div className="flex justify-between border-b border-[#23324C]/25 py-1"><span>API Limit:</span><strong className="text-white">{p2HistoryLimits.apiCalls}</strong></div>
              </div>
            ) : (
              <div className="text-center text-slate-500 italic py-8">Select version.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Coupon Modal */}
      <Modal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} title="Launch Coupon Promotional Campaign">
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-left text-xs">
          <TextInput label="Coupon Promo Code" required placeholder="e.g. OFF50PCT" value={couponForm.code} onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))} />
          
          <SelectInput 
            label="Promotion Coupon Type" 
            value={couponForm.type}
            onChange={(e) => setCouponForm(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'Percentage Discount', label: 'Percentage Off (%)' },
              { value: 'Fixed Discount', label: 'Fixed Cash Credit ($)' },
              { value: 'Trial Extension', label: 'Trial Extension (Days)' }
            ]}
          />
          
          <TextInput label="Discount value / extension days" required placeholder="e.g. 10 or 30" type="number" value={couponForm.discount} onChange={(e) => setCouponForm(prev => ({ ...prev, discount: e.target.value }))} />
          <TextInput label="Promo Campaign Name" placeholder="e.g. Winter Sales Kickoff" value={couponForm.campaign} onChange={(e) => setCouponForm(prev => ({ ...prev, campaign: e.target.value }))} />
          <TextInput label="Campaign Expiration Date" type="date" value={couponForm.expiryDate} onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))} />
          <TextInput label="Redemption limits usage" placeholder="e.g. 100" type="number" value={couponForm.redemptionLimit} onChange={(e) => setCouponForm(prev => ({ ...prev, redemptionLimit: e.target.value }))} />
          
          <Button type="submit" variant="primary" className="w-full">
            Launch Promotional Code
          </Button>
        </form>
      </Modal>

      {/* Invoice details Receipt Modal */}
      <Modal isOpen={invoiceDetailsModal} onClose={() => setInvoiceDetailsModal(false)} title="Billing Invoice Audit Receipt">
        {selectedInvoice && (
          <div className="space-y-5 text-xs text-slate-300 text-left">
            <div className="border-b border-[#23324C]/45 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black bg-[#111827] px-2 py-0.5 rounded text-slate-450 border border-[#23324C]/60 uppercase tracking-widest">SaaS Invoice Ledger Receipt</span>
                <h4 className="text-white text-base font-extrabold mt-2">{selectedInvoice.company}</h4>
                <span className="text-[10px] text-slate-455 block mt-1">Invoice ID: #{selectedInvoice.id} • Issued: {selectedInvoice.date}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedInvoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>{selectedInvoice.status}</span>
            </div>

            {/* Calculations items receipt */}
            <div className="bg-[#111827] border border-[#23324C]/45 p-4 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Line Items billing</span>
              <div className="space-y-2.5 font-semibold">
                <div className="flex justify-between">
                  <span>SaaS licensing base subscription ({selectedInvoice.plan} plan)</span>
                  <strong>${selectedInvoice.amount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-450 font-medium">
                  <span>Administrative Tax (0.0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-slate-450 font-medium">
                  <span>Negotiated Campaign discounts Applied</span>
                  <span>-$0.00</span>
                </div>
                
                <div className="border-t border-[#23324C]/35 pt-2 flex justify-between text-white font-extrabold text-sm">
                  <span>Total Amount Invoiced</span>
                  <span className="text-brand-400">${selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Gateway Payment details receipt */}
            <div className="space-y-1.5 text-[10px]">
              <div>Integration Node: <strong className="text-white">{selectedInvoice.paymentMethod}</strong></div>
              <div>Period billing duration: <span className="text-slate-400 font-semibold">{selectedInvoice.period}</span></div>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => triggerToast(`Receipt INV-${selectedInvoice.id} download initiated.`)}>
              <Download className="h-4 w-4 mr-1" /> Download PDF Receipt Archive
            </Button>
          </div>
        )}
      </Modal>

      {/* Lifecycle transition confirmation Modal */}
      <Modal isOpen={transitionConfirmOpen} onClose={() => setTransitionConfirmOpen(false)} title="Validate State Lifecycle Transition">
        {transitionPlan && (
          <div className="space-y-4 text-xs text-slate-300 text-left">
            <div className="bg-brand-500/5 border border-brand-500/20 p-3 rounded-xl space-y-1">
              <strong className="text-white block font-bold">Lifecycle State Transition Validation Rule Check</strong>
              <p className="text-[11px] text-slate-400">
                You are transitioning licensing plan level <strong>"{transitionPlan.name}"</strong> to state <strong>"{transitionTargetState}"</strong>.
              </p>
            </div>

            <p className="text-slate-400 leading-relaxed font-semibold">
              This transition will update the plan state across all registry nodes and is tracked under audit log history. Are you sure you wish to continue?
            </p>

            <div className="flex gap-2 justify-end border-t border-[#23324C]/40 pt-3.5">
              <Button variant="secondary" onClick={() => setTransitionConfirmOpen(false)}>Cancel</Button>
              <Button variant="success" onClick={executeTransition}>Confirm Transition</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
