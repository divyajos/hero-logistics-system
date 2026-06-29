import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../api/apiClient';
import {
  Settings, Layout, Globe, Mail, MessageSquare, FileText, Lock, Smartphone, Shield,
  Database, RefreshCw, CheckCircle, AlertTriangle, Play, Clock, Search, Folder,
  Eye, Save, Plus, Trash2, Edit, Check, Copy, Sliders, HelpCircle, CheckSquare,
  PlusCircle, List, Activity, ChevronDown, ChevronRight, Upload, Download, Undo, EyeOff
} from 'lucide-react';

const FONTS = ['Inter', 'Roboto', 'Outfit', 'Montserrat', 'Poppins', 'Open Sans', 'Lato'];
const TYPOGRAPHY_STYLING = ['Modern Sans', 'Elegant Serif', 'Compact Mono', 'Vibrant Geometrical'];
const RADIUS_OPTIONS = ['0px (Sharp)', '4px (Subtle)', '8px (Standard)', '12px (Smooth)', '16px (Glassmorphic)', '24px (Pill)'];
const BUTTON_STYLES = ['Solid Fill', 'Gradient Accent', 'Glow Border', 'Glassmorphism Blur', 'Minimalist Flat'];
const THEME_MODES = ['Light Theme Only', 'Dark Theme Only', 'System Synchronized (Auto)'];

export default function WhiteLabelManagement({ tenants = [], logAuditAction, triggerToast }) {
  const dispatch = useDispatch();

  // Loading and configs states
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({});
  const [tempConfig, setTempConfig] = useState({});
  const [deployments, setDeployments] = useState([]);
  const [audits, setAudits] = useState([]);
  const [themes, setThemes] = useState([]);
  const [domains, setDomains] = useState([]);

  // Active navigation controllers
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, branding, theme, domain, email, pdf, login, assets, deployment, security, integrations
  const [activePreview, setActivePreview] = useState('portal'); // portal, email, pdf, login
  const [activeEmailTemplate, setActiveEmailTemplate] = useState('welcome'); // welcome, reset, driver, company

  // Form inputs & wizards
  const [newThemeName, setNewThemeName] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('theme-1');
  const [newDomainStr, setNewDomainStr] = useState('');
  const [newSubdomainStr, setNewSubdomainStr] = useState('');
  const [newRedirectRule, setNewRedirectRule] = useState('Force HTTPS');
  const [selectedAssetFolder, setSelectedAssetFolder] = useState('Logos');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('All');
  
  // Custom Email Templates edit bindings
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: {
      subject: 'Welcome to your Logistics Ecosystem',
      title: 'Initialize your Tenant Admin Workspace',
      body: 'Your tenant credentials have been provisioned on the secure isolated White Label node. Click the verification button below to set up your master authentication password and configure your dispatcher fleet layout details.'
    },
    reset: {
      subject: 'Reset Password Request',
      title: 'Recover your Security Credentials',
      body: 'We received a password reset request for your platform account. Click the recovery button below to initialize a secure credentials configuration. This request will expire in 30 minutes.'
    },
    driver: {
      subject: 'Driver Portal Invitation',
      title: 'Configure your Driver ELD Account',
      body: 'You have been added as an authorized driver to the company fleet database registry. Download the mobile driver app and log in using your telemetry key code parameters to synchronize active dispatch logs.'
    },
    company: {
      subject: 'Authorized Administrator Credentials invitation',
      title: 'Access your Logistics Administration Panel',
      body: 'Your carrier company profile has been verified and registered on the main routing switch node. Access the dashboard to configure routes, fleet vehicle registries, and manage billing invoices.'
    }
  });

  // Integrations status state
  const [integrations, setIntegrations] = useState({
    cloudflare: { enabled: true, zoneId: 'zone_8829a102bc', status: 'Connected', health: 'Healthy' },
    s3: { enabled: true, bucketName: 'hero-white-label-cdn', status: 'Connected', health: 'Healthy' },
    sendgrid: { enabled: true, senderName: 'Mailer Engine', status: 'Verified', health: 'Healthy' },
    twilio: { enabled: true, number: '+18005550199', status: 'Operational', health: 'Healthy' },
    stripe: { enabled: true, keyId: 'pk_live_...', status: 'Active', health: 'Healthy' },
    firebase: { enabled: false, projectId: '', status: 'Not Connected', health: 'Unknown' }
  });
  const [testingIntegrationKey, setTestingIntegrationKey] = useState(null);

  // Security policies configuration
  const [securityMfa, setSecurityMfa] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.1, 10.0.0.45, 172.16.23.10');
  const [sessionTimeout, setSessionTimeout] = useState('30 Minutes');
  const [appApprovalRequired, setAppApprovalRequired] = useState(true);
  const [apiKeys, setApiKeys] = useState([
    { name: 'Production Backend secret key', key: 'hl_sec_live_9921820bc7102e3a58d11e0f', created: '06/20/2026', visible: false },
    { name: 'Webhook dispatch triggers token', key: 'hl_sec_webhook_88319e09d110', created: '06/25/2026', visible: false }
  ]);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  // Version management variables and diff viewer modal
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [diffVersionSelected, setDiffVersionSelected] = useState('');
  const [diffDetails, setDiffDetails] = useState(null);

  // Build deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [deploymentChangeLog, setDeploymentChangeLog] = useState('');
  const [buildValidationWarnings, setBuildValidationWarnings] = useState([]);

  // Assets mockup registry list with deleted items stack
  const [assetsList, setAssetsList] = useState([
    { name: 'logo-light.png', type: 'Logo Image', size: '24 KB', folder: 'Logos', date: '06/24/2026', deleted: false },
    { name: 'logo-dark.png', type: 'Logo Image', size: '28 KB', folder: 'Logos', date: '06/24/2026', deleted: false },
    { name: 'favicon.ico', type: 'Icon File', size: '4 KB', folder: 'Icons', date: '06/23/2026', deleted: false },
    { name: 'mobile-icon.png', type: 'Icon File', size: '42 KB', folder: 'Icons', date: '06/25/2026', deleted: false },
    { name: 'login-bg.jpg', type: 'Background Asset', size: '1.2 MB', folder: 'Backgrounds', date: '06/25/2026', deleted: false },
    { name: 'dashboard-bg.jpg', type: 'Background Asset', size: '840 KB', folder: 'Backgrounds', date: '06/20/2026', deleted: false },
    { name: 'welcome_illustration.png', type: 'Illustration Vector', size: '320 KB', folder: 'Illustrations', date: '06/10/2026', deleted: false },
    { name: 'Inter-Regular.woff2', type: 'Font Asset', size: '98 KB', folder: 'Fonts', date: '06/01/2026', deleted: false },
    { name: 'email-header-banner.png', type: 'Email Image', size: '145 KB', folder: 'Email Images', date: '06/18/2026', deleted: false },
    { name: 'invoice-footer-signature.png', type: 'Invoice Image', size: '18 KB', folder: 'Invoice Images', date: '06/25/2026', deleted: false }
  ]);
  const [showTrashBin, setShowTrashBin] = useState(false);

  // Communications Test form
  const [testEmailAddress, setTestEmailAddress] = useState('admin@falconcarriers.com');
  const [testPhoneAddress, setTestPhoneAddress] = useState('+1 555-0199');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testSmsLoading, setTestSmsLoading] = useState(false);

  // DNS validation states
  const [dnsCheckLoading, setDnsCheckLoading] = useState(false);
  const [dnsRecordStatus, setDnsRecordStatus] = useState(null);

  // Fetch initial config and logs
  const getWhiteLabelData = async () => {
    try {
      setLoading(true);
      const resConfig = await apiClient.get('white-label');
      const resDeployments = await apiClient.get('white-label/deployments');
      const resAudits = await apiClient.get('white-label/audits');
      const resThemes = await apiClient.get('white-label/themes');
      const resDomains = await apiClient.get('white-label/domains');
      
      setConfig(resConfig.data);
      setTempConfig({ ...resConfig.data });
      setDeployments(resDeployments.data);
      setAudits(resAudits.data);
      setThemes(resThemes.data);
      setDomains(resDomains.data);

      // Perform validation check to construct build warnings
      validateBrandingAssets(resConfig.data, resDomains.data);
    } catch (e) {
      console.error(e);
      triggerToast('Failed to retrieve White Label configurations.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWhiteLabelData();
  }, []);

  // Validation Checks
  const validateBrandingAssets = (wlConf, currentDomains) => {
    const warnings = [];
    if (!wlConf.platformName) warnings.push('Platform Name is empty.');
    if (!wlConf.portalName) warnings.push('Portal Name is empty.');
    if (!wlConf.logoLight || !wlConf.logoLight.startsWith('http')) warnings.push('Missing or invalid logoLight URL link.');
    if (!wlConf.logoDark || !wlConf.logoDark.startsWith('http')) warnings.push('Missing or invalid logoDark URL link.');
    if (!wlConf.favicon) warnings.push('Missing favicon asset shortcut.');
    
    // Hex Color validations
    const hexPattern = /^#([0-9a-f]{3}){1,2}$/i;
    if (!hexPattern.test(wlConf.accentColor)) warnings.push(`Invalid Hex format accentColor: "${wlConf.accentColor}". Must begin with #.`);
    if (!hexPattern.test(wlConf.gradientStart)) warnings.push(`Invalid Hex format gradientStart: "${wlConf.gradientStart}".`);
    if (!hexPattern.test(wlConf.gradientEnd)) warnings.push(`Invalid Hex format gradientEnd: "${wlConf.gradientEnd}".`);

    // DNS mapping warning check
    if (currentDomains.length === 0) warnings.push('No custom domains configured for redirect mapping.');
    setBuildValidationWarnings(warnings);
  };

  const handleInputChange = (field, val) => {
    setTempConfig(prev => {
      const updated = { ...prev, [field]: val };
      validateBrandingAssets(updated, domains);
      return updated;
    });
  };

  const handleSmsTemplateChange = (key, val) => {
    setTempConfig(prev => ({
      ...prev,
      smsTemplates: {
        ...prev.smsTemplates,
        [key]: val
      }
    }));
  };

  const handleEmailTemplateChange = (field, val) => {
    setEmailTemplates(prev => ({
      ...prev,
      [activeEmailTemplate]: {
        ...prev[activeEmailTemplate],
        [field]: val
      }
    }));
  };

  // Log white label audits helper
  const logBrandingAudit = async (action, detail) => {
    try {
      const res = await apiClient.post('white-label/audits', { action, detail });
      setAudits(prev => [res.data, ...prev]);
      if (logAuditAction) {
        logAuditAction(action, detail);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Config Changes
  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    
    // Validations before save
    const hexPattern = /^#([0-9a-f]{3}){1,2}$/i;
    if (!hexPattern.test(tempConfig.accentColor) || !hexPattern.test(tempConfig.gradientStart) || !hexPattern.test(tempConfig.gradientEnd)) {
      triggerToast('Validation Failure: Primary and Accent colors must be valid CSS Hex color formats (e.g. #0ea5e9).', 'danger');
      return;
    }

    try {
      const changedFields = [];
      Object.keys(tempConfig).forEach(key => {
        if (JSON.stringify(tempConfig[key]) !== JSON.stringify(config[key])) {
          changedFields.push(key);
        }
      });

      if (changedFields.length === 0) {
        triggerToast('No changes detected in customizer configuration.', 'info');
        return;
      }

      const res = await apiClient.put('white-label', tempConfig);
      setConfig(res.data);
      triggerToast('White Label customization settings saved successfully.', 'success');
      
      await logBrandingAudit(
        'Customizer Configuration Saved', 
        `Updated variables: ${changedFields.join(', ')}. Status updated to Draft pending deployment.`
      );
      getWhiteLabelData();
    } catch (err) {
      console.error(err);
      triggerToast('Error saving white label configurations.', 'danger');
    }
  };

  // Create theme
  const handleCreateTheme = async (e) => {
    e.preventDefault();
    if (!newThemeName.trim()) return;

    try {
      const payload = {
        name: newThemeName,
        sidebarBg: tempConfig.sidebarBg,
        headerBg: tempConfig.headerBg,
        accentColor: tempConfig.accentColor,
        gradientStart: tempConfig.gradientStart,
        gradientEnd: tempConfig.gradientEnd,
        cardRadius: tempConfig.cardRadius,
        buttonStyle: tempConfig.buttonStyle,
        brandFont: tempConfig.brandFont,
        typography: tempConfig.typography,
        status: 'Draft'
      };

      const res = await apiClient.post('white-label/themes', payload);
      setThemes(prev => [...prev, res.data]);
      setNewThemeName('');
      triggerToast(`Theme "${payload.name}" successfully created.`, 'success');
      logBrandingAudit('Theme Created', `Registered new theme skin custom templates: "${payload.name}".`);
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Error creating theme.', 'danger');
    }
  };

  // Clone/Duplicate Theme
  const handleCloneTheme = async (theme) => {
    try {
      const payload = {
        name: `${theme.name} (Copy)`,
        sidebarBg: theme.sidebarBg,
        headerBg: theme.headerBg,
        accentColor: theme.accentColor,
        gradientStart: theme.gradientStart,
        gradientEnd: theme.gradientEnd,
        cardRadius: theme.cardRadius,
        buttonStyle: theme.buttonStyle,
        brandFont: theme.brandFont,
        typography: theme.typography,
        status: 'Draft'
      };

      const res = await apiClient.post('white-label/themes', payload);
      setThemes(prev => [...prev, res.data]);
      triggerToast(`Theme duplicated: "${payload.name}"`, 'success');
      logBrandingAudit('Theme Cloned', `Duplicated theme template "${theme.name}" as "${payload.name}".`);
    } catch (e) {
      console.error(e);
      triggerToast('Error duplication theme asset.', 'danger');
    }
  };

  // Publish theme
  const handlePublishTheme = async (themeId) => {
    try {
      const updatedThemes = themes.map(t => {
        if (t.id === themeId) {
          // Set to active config
          setTempConfig(prev => ({
            ...prev,
            sidebarBg: t.sidebarBg,
            headerBg: t.headerBg,
            accentColor: t.accentColor,
            gradientStart: t.gradientStart,
            gradientEnd: t.gradientEnd,
            cardRadius: t.cardRadius,
            buttonStyle: t.buttonStyle,
            brandFont: t.brandFont,
            typography: t.typography
          }));
          return { ...t, status: 'Published' };
        }
        return { ...t, status: 'Archived' };
      });

      const target = themes.find(t => t.id === themeId);
      await apiClient.put(`white-label/themes/${themeId}`, { status: 'Published' });
      setThemes(updatedThemes);
      setSelectedThemeId(themeId);
      triggerToast(`Theme "${target.name}" published as system active design skin.`, 'success');
      logBrandingAudit('Theme Published', `Published styling theme skin "${target.name}" to tenant portals layout.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete theme
  const handleDeleteTheme = async (themeId, name) => {
    if (themes.length <= 1) {
      triggerToast('Cannot delete last remaining system theme.', 'warning');
      return;
    }
    try {
      await apiClient.delete(`white-label/themes/${themeId}`);
      setThemes(prev => prev.filter(t => t.id !== themeId));
      triggerToast(`Theme "${name}" removed.`, 'info');
      logBrandingAudit('Theme Deleted', `Removed theme skin "${name}" (${themeId}) from template index.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Custom Domain
  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomainStr.trim()) return;

    try {
      const payload = {
        domain: newDomainStr,
        subdomain: newSubdomainStr || `portal.${newDomainStr}`,
        redirectRules: newRedirectRule
      };

      const res = await apiClient.post('white-label/domains', payload);
      setDomains(prev => [...prev, res.data]);
      setNewDomainStr('');
      setNewSubdomainStr('');
      triggerToast(`Custom domain ${payload.domain} registered.`, 'success');
      logBrandingAudit('Domain Registered', `Mapped CNAME alias redirect rule for: ${payload.domain}`);
      getWhiteLabelData();
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Error configuring custom domain mapping.', 'danger');
    }
  };

  // Trigger CNAME and DNS validation checks
  const runDnsValidation = () => {
    setDnsCheckLoading(true);
    setDnsRecordStatus(null);
    setTimeout(() => {
      setDnsCheckLoading(false);
      setDnsRecordStatus({
        cnameMatch: true,
        txtVerify: true,
        cloudflareSync: true,
        sslBound: true,
        ipAddress: '104.21.82.90',
        message: 'DNS CNAME records checks passed! Mapping properly routes packets to ssl.herologistics.com.'
      });
      triggerToast('Domain verification successful. Edge routing synchronizations operational.', 'success');
      logBrandingAudit('DNS Check Triggered', `Validated CNAME zone record matches for ${tempConfig.customDomain}.`);
    }, 1200);
  };

  // Send Test Mail SMTP validation
  const triggerTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const res = await apiClient.post('white-label/test-email', { email: testEmailAddress });
      triggerToast(res.data.message, 'success');
      logBrandingAudit('SMTP Test Email Sent', `Dispatched testing mail package to ${testEmailAddress}`);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'SMTP transmission failure.', 'danger');
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Send Test SMS Twilio validation
  const triggerTestSms = async () => {
    setTestSmsLoading(true);
    try {
      const res = await apiClient.post('white-label/test-sms', { phone: testPhoneAddress });
      triggerToast(res.data.message, 'success');
      logBrandingAudit('Twilio SMS Test Dispatched', `Dispatched SMS payload check to ${testPhoneAddress}`);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'SMS relay transmission failure.', 'danger');
    } finally {
      setTestSmsLoading(false);
    }
  };

  // Execute Build Deploy branding pipeline
  const runBuildDeployment = async () => {
    if (buildValidationWarnings.length > 0) {
      const confirm = window.confirm(`Build contains ${buildValidationWarnings.length} validation issues. Proceed anyway?\n\n- ${buildValidationWarnings.join('\n- ')}`);
      if (!confirm) return;
    }

    if (!deploymentChangeLog.trim()) {
      triggerToast('Please provide a release summary details context for this branding compilation.', 'danger');
      return;
    }

    setIsDeploying(true);
    setDeploymentLogs([]);
    
    const steps = [
      'Bootstrapping white label compiler module container...',
      'Mapping parameters: accentColor=' + tempConfig.accentColor + ' bg=' + tempConfig.bgColor + ' cardRadius=' + tempConfig.cardRadius + '...',
      'Scaling light and dark logo images files into web-optimized WebP formats...',
      'Confirming DNS CNAME routing sync indicators with Cloudflare DNS services...',
      'Pushing assets and static stylesheets to AWS S3 storage buckets (cdn link active)...',
      'Flushing Cloudflare edge gateway caching layers...',
      'Recording release notes revision commit logs...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setDeploymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
    }

    try {
      const res = await apiClient.post('white-label/deploy', {
        changeLog: deploymentChangeLog,
        environment: 'Production',
        publishedBy: 'Super Admin'
      });

      if (res.data.success) {
        setDeploymentLogs(prev => [...prev, `\n[BUILD SUCCESS] Static branding build version ${res.data.version} is now LIVE on S3 CDN.`]);
        triggerToast(`Build revision ${res.data.version} compiled and published successfully!`, 'success');
        setDeploymentChangeLog('');
        getWhiteLabelData();
        setTimeout(() => {
          setIsDeploying(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Compilation pipeline builder encountered fatal errors.', 'danger');
      setIsDeploying(false);
    }
  };

  // Rollback to specific deployment build
  const triggerRollback = async (dep) => {
    try {
      const res = await apiClient.post('white-label/rollback', { version: dep.version });
      if (res.data.success) {
        triggerToast(`Branding configuration variables rolled back to version ${dep.version}!`, 'success');
        getWhiteLabelData();
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error executing deployment rollback.', 'danger');
    }
  };

  // Compare versions logic (Active Config vs Selected Version)
  const openDiffViewer = (depVersion) => {
    const historicalDep = deployments.find(d => d.version === depVersion);
    if (!historicalDep) return;

    setDiffVersionSelected(depVersion);
    
    // Simulate reading different properties for comparisons
    setDiffDetails([
      { property: 'Active Version', current: config.version, historical: depVersion },
      { property: 'Last Compiled Time', current: config.lastDeployed, historical: historicalDep.time },
      { property: 'Primary Accent Color', current: config.accentColor, historical: depVersion === '1.3.0' ? '#2563eb' : '#0ea5e9' },
      { property: 'Button Radii', current: config.cardRadius, historical: depVersion === '1.3.0' ? '8px' : '16px' },
      { property: 'SMTP Sender Domain', current: config.smtpSenderEmail, historical: 'mailer@herologistics.com' }
    ]);
    setIsDiffModalOpen(true);
  };

  // Test Integrations Connection Toggles
  const handleTestIntegration = (key) => {
    setTestingIntegrationKey(key);
    setTimeout(() => {
      setTestingIntegrationKey(null);
      setIntegrations(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'Active',
          health: 'Healthy'
        }
      }));
      triggerToast(`Integration Connection Test Success: ${key.toUpperCase()} handshake complete.`, 'success');
      logBrandingAudit('Integration Tested', `Executed secure API ping test for gateway: ${key.toUpperCase()}`);
    }, 1000);
  };

  // API Key creation
  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!newApiKeyName.trim()) return;

    const newKey = {
      name: newApiKeyName,
      key: `hl_sec_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      created: new Date().toLocaleDateString(),
      visible: false
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewApiKeyName('');
    triggerToast(`Registered API Key: "${newKey.name}"`, 'success');
    logBrandingAudit('API Key Registered', `Created developer API key mapping: ${newKey.name}`);
  };

  const toggleApiKeyVisibility = (index) => {
    setApiKeys(prev => prev.map((k, i) => i === index ? { ...k, visible: !k.visible } : k));
  };

  const handleDeleteApiKey = (index, name) => {
    setApiKeys(prev => prev.filter((_, i) => i !== index));
    triggerToast(`Deleted API Key: "${name}"`, 'info');
    logBrandingAudit('API Key Revoked', `Revoked developer credentials authorization: ${name}`);
  };

  // Asset Deletions
  const handleDeleteAsset = (name) => {
    setAssetsList(prev => prev.map(a => a.name === name ? { ...a, deleted: true } : a));
    triggerToast(`File "${name}" moved to CDN Trash Bin.`, 'info');
    logBrandingAudit('Asset Moved to Trash', `Flagged CDN file: /${selectedAssetFolder}/${name} as deleted.`);
  };

  const handleRestoreAsset = (name) => {
    setAssetsList(prev => prev.map(a => a.name === name ? { ...a, deleted: false } : a));
    triggerToast(`File "${name}" successfully restored.`, 'success');
    logBrandingAudit('Asset Restored', `Restored deleted CDN asset: /${selectedAssetFolder}/${name}`);
  };

  // CSV Export Audits
  const handleExportAuditsCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Audit ID,Action,Detail,Operator,Time,IP Address,Browser UserAgent\n';
    audits.forEach(a => {
      csvContent += `"${a.id}","${a.action}","${a.detail}","${a.user}","${a.time}","${a.ip}","${a.browser || 'Chrome 126'}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'White_Label_Administrative_Audits.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Audits logs exported as CSV file.', 'success');
  };

  // Calculated Dashboard metrics
  const activeWhiteLabelClients = tenants.filter(t => t.status === 'Active').length;
  const activeDomainsCount = domains.length;
  const pendingDeploymentsCount = buildValidationWarnings.length;
  const brandingHealthScore = buildValidationWarnings.length === 0 ? '100%' : '92.4%';
  const failedDeploymentsCount = deployments.filter(d => !d.success).length;
  const todayDateStr = new Date().toLocaleDateString();
  const auditsTodayCount = audits.filter(a => a.time.includes(todayDateStr)).length + 2;

  // Filter Audits
  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || a.detail.toLowerCase().includes(auditSearchQuery.toLowerCase());
    const matchesAction = auditActionFilter === 'All' || a.action === auditActionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-xs">
      
      {/* Active Branding variables check warning overlay alerts */}
      {buildValidationWarnings.length > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <strong className="block font-bold">White Label System Config Warnings ({buildValidationWarnings.length})</strong>
            <p className="text-[11px] leading-relaxed text-slate-500">Fix these configuration parameters before running the static S3 CDN compiler deployment pipeline:</p>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-0.5">
              {buildValidationWarnings.map((w, idx) => <li key={idx}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Header section with status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-400" />
            Enterprise White Label Platform
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize branding layers, email SMTP relays, custom domains, and visual interfaces dynamically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold mr-1.5">Active Version:</span>
            <strong className="text-brand-400 font-black">{config.version}</strong>
          </div>
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold mr-1.5">Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              config.approvalStatus === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {config.approvalStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Dashboard Executive KPI Cards (9 Detailed stats matching PRD request) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Active WL Clients</span>
          <strong className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{activeWhiteLabelClients}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">100% active coverage</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Active Custom Domains</span>
          <strong className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{activeDomainsCount}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">SSL secure handshakes active</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Pending Deployments</span>
          <strong className="text-xl sm:text-2xl font-black text-amber-500 mt-2">{pendingDeploymentsCount}</strong>
          <span className="text-[9px] font-semibold text-slate-500 mt-1.5">Warnings pending review</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Branding Health Score</span>
          <strong className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">{brandingHealthScore}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">All formats valid check</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">SSL Status</span>
          <strong className="text-xl sm:text-2xl font-black text-slate-900 mt-2">Active</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">Edge sync verified</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Active Theme Version</span>
          <strong className="text-xl sm:text-2xl font-black text-brand-400 mt-2">v{config.version}</strong>
          <span className="text-[9px] font-semibold text-slate-500 mt-1.5">Skin: Dark Glassmorphic</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Last Deployment</span>
          <strong className="text-sm font-black text-slate-900 mt-2 truncate">{config.lastDeployed}</strong>
          <span className="text-[9px] font-semibold text-slate-500 mt-1.5">By Super Admin</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Failed Deployments</span>
          <strong className="text-xl sm:text-2xl font-black text-red-400 mt-2">{failedDeploymentsCount}</strong>
          <span className="text-[9px] font-semibold text-slate-500 mt-1.5">0 pipeline compiler errors</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all lg:col-span-2">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Audit Events Today</span>
          <strong className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{auditsTodayCount} Logs</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">All administrative modifications recorded</span>
        </div>
      </div>

      {/* Workspace Split Layout: Forms Left / Previews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Navigation Tab Sidebar and Section Form Configuration Containers */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Navigation Tabs Header */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 text-xs">
            {[
              { id: 'dashboard', label: 'Overview', icon: Layout },
              { id: 'branding', label: 'Brand Config', icon: Sliders },
              { id: 'theme', label: 'Theme Builder', icon: Layout },
              { id: 'domain', label: 'Domain Manager', icon: Globe },
              { id: 'email', label: 'Communications', icon: Mail },
              { id: 'pdf', label: 'PDF Customizer', icon: FileText },
              { id: 'login', label: 'Login & Override', icon: Lock },
              { id: 'assets', label: 'Asset Library', icon: Folder },
              { id: 'deployment', label: 'Deployment Timeline', icon: RefreshCw },
              { id: 'security', label: 'Security & Access', icon: Shield },
              { id: 'integrations', label: 'API Integrations', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">White Label Overview</h3>
                <p className="text-xs text-slate-500 mt-1">Status indicator reports, theme adoption charts, and platform security tools.</p>
              </div>

              {/* Adoption and Distribution Mini charts using styled divs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Chart 1: Theme Distribution */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Theme Distribution</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-500">
                        <span>Dark Theme</span>
                        <span className="font-bold">60%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-500">
                        <span>Light Theme</span>
                        <span className="font-bold">30%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-500">
                        <span>Auto System sync</span>
                        <span className="font-bold">10%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-purple-400 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Domain verification Compliance */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Branding Adoption By Platform</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-500">
                        <span>Company Portal</span>
                        <span className="font-bold">100%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-500">
                        <span>Driver Mobile ELD</span>
                        <span className="font-bold">85%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-500">
                        <span>Shipper Customer Portal</span>
                        <span className="font-bold">90%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Deployment Timeline visual CSS list */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Branding Build Releases History</span>
                <div className="space-y-3 font-mono text-[10px]">
                  {deployments.slice(0, 3).map((dep, idx) => (
                    <div key={idx} className="flex gap-3 items-start border-l border-slate-200 pl-3.5 relative">
                      <div className="absolute left-[-4px] top-[4px] h-2 w-2 rounded-full bg-brand-500"></div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center text-slate-900">
                          <span>Build version {dep.version} ({dep.build})</span>
                          <span className="text-slate-500">{dep.time}</span>
                        </div>
                        <p className="text-slate-500 text-[10px]">{dep.changeLog}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BRAND CONFIGURATION */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Branding Config Identity</h3>
                <p className="text-xs text-slate-500 mt-1">Configure company name details, light/dark brand logos, typography, fonts, loader files and borders.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <label className="block text-slate-500 mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={tempConfig.platformName}
                    onChange={(e) => handleInputChange('platformName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Portal Name</label>
                  <input
                    type="text"
                    value={tempConfig.portalName}
                    onChange={(e) => handleInputChange('portalName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Short Name abbreviation</label>
                  <input
                    type="text"
                    value={tempConfig.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Loader Animation GIF (URL)</label>
                  <input
                    type="text"
                    value={tempConfig.loadingScreen}
                    onChange={(e) => handleInputChange('loadingScreen', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>

                {/* Logo URLs inputs */}
                <div>
                  <label className="block text-slate-500 mb-1">Company Logo (Light Theme URL)</label>
                  <input
                    type="text"
                    value={tempConfig.logoLight}
                    onChange={(e) => handleInputChange('logoLight', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Company Logo (Dark Theme URL)</label>
                  <input
                    type="text"
                    value={tempConfig.logoDark}
                    onChange={(e) => handleInputChange('logoDark', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Favicon shortcut (URL)</label>
                  <input
                    type="text"
                    value={tempConfig.favicon}
                    onChange={(e) => handleInputChange('favicon', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Login Screen Background URL</label>
                  <input
                    type="text"
                    value={tempConfig.loginBg}
                    onChange={(e) => handleInputChange('loginBg', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Dashboard Background URL</label>
                  <input
                    type="text"
                    value={tempConfig.dashboardBg}
                    onChange={(e) => handleInputChange('dashboardBg', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                
                {/* Branding specific document logos */}
                <div>
                  <label className="block text-slate-500 mb-1">Email Branding Logo URL</label>
                  <input
                    type="text"
                    value={tempConfig.emailLogo}
                    onChange={(e) => handleInputChange('emailLogo', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Invoice Branding Logo URL</label>
                  <input
                    type="text"
                    value={tempConfig.invoiceLogo}
                    onChange={(e) => handleInputChange('invoiceLogo', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Manifest Branding Logo URL</label>
                  <input
                    type="text"
                    value={tempConfig.pdfLogo}
                    onChange={(e) => handleInputChange('pdfLogo', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>

                {/* Typography configurations */}
                <div>
                  <label className="block text-slate-500 mb-1">Brand Font Family</label>
                  <select
                    value={tempConfig.brandFont}
                    onChange={(e) => handleInputChange('brandFont', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  >
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Typography Style</label>
                  <select
                    value={tempConfig.typography}
                    onChange={(e) => handleInputChange('typography', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  >
                    {TYPOGRAPHY_STYLING.map(ts => <option key={ts}>{ts}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Button Radius Option</label>
                  <select
                    value={tempConfig.cardRadius}
                    onChange={(e) => handleInputChange('cardRadius', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  >
                    {RADIUS_OPTIONS.map(ro => <option key={ro} value={ro.split(' ')[0]}>{ro}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-slate-200 text-xs font-bold text-slate-450 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Branding Configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: THEME BUILDER */}
          {activeTab === 'theme' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">System Theme Builder</h3>
                <p className="text-xs text-slate-500 mt-1">Design unlimited platform themes, clone designs, and compare version layout variables.</p>
              </div>

              {/* Themes list matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themes.map((t, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 text-xs">{t.name}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          t.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white text-slate-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-slate-500 font-mono">
                        <div>Accent: <span style={{ color: t.accentColor }}>{t.accentColor}</span></div>
                        <div>Sidebar: {t.sidebarBg}</div>
                        <div>Header: {t.headerBg}</div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleCloneTheme(t)}
                        className="px-2 py-1 bg-slate-900 border border-slate-200 hover:text-slate-900 rounded text-[9px] font-bold"
                      >
                        Clone/Duplicate
                      </button>
                      {t.status !== 'Published' && (
                        <button
                          onClick={() => handlePublishTheme(t.id)}
                          className="px-2 py-1 bg-brand-500 text-slate-950 rounded text-[9px] font-extrabold hover:bg-brand-400"
                        >
                          Publish System
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTheme(t.id, t.name)}
                        className="px-1.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create new theme block */}
              <form onSubmit={handleCreateTheme} className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 space-y-3">
                <span className="text-xs text-slate-900 font-extrabold block border-b border-slate-200 pb-2">Register Custom Theme Skin</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                    placeholder="Enter custom theme name (e.g. Amber Minimalist)..."
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register Theme
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: DOMAIN MANAGER */}
          {activeTab === 'domain' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Domain & Routing Management</h3>
                <p className="text-xs text-slate-500 mt-1">Assign custom enterprise CNAME mappings, domain aliases, redirect paths, and activate SSL handshakes.</p>
              </div>

              {/* Domains list */}
              <div className="space-y-3">
                {domains.map((dom, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/45 flex justify-between items-center text-slate-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{dom.domain}</strong>
                        <span className="text-slate-500 font-mono">CNAME maps to ssl.herologistics.com</span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-slate-500">
                        <span>SSL: <strong className="text-emerald-400">{dom.sslStatus}</strong> (Expires: {dom.sslExpiry})</span>
                        <span>DNS Check: <strong className="text-emerald-400">{dom.dnsVerified ? 'Passed' : 'Pending'}</strong></span>
                        <span>Health: <strong className="text-emerald-400">{dom.health}</strong></span>
                        <span>Rules: <strong>{dom.redirectRules}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={runDnsValidation}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-200 hover:text-slate-900 rounded font-bold text-[10px]"
                    >
                      Renew SSL Certificate
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Domain Form */}
              <form onSubmit={handleAddDomain} className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 space-y-4">
                <span className="text-xs text-slate-900 font-extrabold block border-b border-slate-200 pb-2">Add Custom Domain Record</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-550 mb-1">Enter Custom Domain</label>
                    <input
                      type="text"
                      value={newDomainStr}
                      onChange={(e) => setNewDomainStr(e.target.value)}
                      placeholder="e.g. tms.falconcarriers.com"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-550 mb-1">Enter Fallback Subdomain (Optional)</label>
                    <input
                      type="text"
                      value={newSubdomainStr}
                      onChange={(e) => setNewSubdomainStr(e.target.value)}
                      placeholder="e.g. portal.falconcarriers.com"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-550 mb-1">Routing Redirect Rule</label>
                    <select
                      value={newRedirectRule}
                      onChange={(e) => setNewRedirectRule(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    >
                      <option>Force HTTPS</option>
                      <option>Force HTTPS with WWW redirect</option>
                      <option>Allow HTTP plain checks</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register Domain
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 5: COMMUNICATIONS BRANDING */}
          {activeTab === 'email' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Communications Engine Customizer</h3>
                <p className="text-xs text-slate-500 mt-1">Configure SMTP credentials and edit templates for invitations, dispatch notifications and welcome envelopes.</p>
              </div>

              {/* Template selection tab */}
              <div className="flex gap-1.5 border-b border-slate-200 pb-2 text-[11px] font-bold">
                {[
                  { id: 'welcome', label: 'Welcome Email' },
                  { id: 'reset', label: 'Reset Password' },
                  { id: 'driver', label: 'Driver Invitation' },
                  { id: 'company', label: 'Company Invitation' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveEmailTemplate(t.id)}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                      activeEmailTemplate === t.id
                        ? 'bg-[#1e293b] text-brand-400 border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Template customizer fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Email Subject Header</label>
                    <input
                      type="text"
                      value={emailTemplates[activeEmailTemplate].subject}
                      onChange={(e) => handleEmailTemplateChange('subject', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Greeting Headline</label>
                    <input
                      type="text"
                      value={emailTemplates[activeEmailTemplate].title}
                      onChange={(e) => handleEmailTemplateChange('title', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">HTML Message Content Body</label>
                    <textarea
                      value={emailTemplates[activeEmailTemplate].body}
                      onChange={(e) => handleEmailTemplateChange('body', e.target.value)}
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Email Test Dispatch Form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 flex flex-col sm:flex-row gap-3 items-end text-xs">
                  <div className="flex-1">
                    <label className="block text-slate-500 mb-1">Enter Test Email Target Address</label>
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <button
                    onClick={triggerTestEmail}
                    disabled={testEmailLoading}
                    className="px-4 py-2 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1 text-[11px] disabled:opacity-50 cursor-pointer"
                  >
                    {testEmailLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    Send Test Envelope
                  </button>
                </div>

                {/* SMS Test Dispatch Form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 flex flex-col sm:flex-row gap-3 items-end text-xs">
                  <div className="flex-1">
                    <label className="block text-slate-500 mb-1">Enter Test SMS Target Telephone</label>
                    <input
                      type="text"
                      value={testPhoneAddress}
                      onChange={(e) => setTestPhoneAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <button
                    onClick={triggerTestSms}
                    disabled={testSmsLoading}
                    className="px-4 py-2 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1 text-[11px] disabled:opacity-50 cursor-pointer"
                  >
                    {testSmsLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    Send Test SMS
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: PDF REPORTS CUSTOMIZER */}
          {activeTab === 'pdf' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">PDF Document customizer</h3>
                <p className="text-xs text-slate-500 mt-1">Design header, footers, logos, signature boxes, and QR codes placement parameters on documents.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs text-slate-500">
                <div>
                  <label className="block text-slate-500 mb-1">PDF Document Custom Header Text</label>
                  <input
                    type="text"
                    value={tempConfig.pdfHeader}
                    onChange={(e) => handleInputChange('pdfHeader', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">PDF Document Custom Footer Text (Variables: {'{page}'}, {'{total}'})</label>
                  <input
                    type="text"
                    value={tempConfig.pdfFooter}
                    onChange={(e) => handleInputChange('pdfFooter', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/45 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-900 block">Document Watermark</span>
                      <span className="text-[10px] text-slate-500">Inject watermark on PODs & receipts.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempConfig.pdfWatermarkEnabled}
                      onChange={(e) => handleInputChange('pdfWatermarkEnabled', e.target.checked)}
                      className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/45 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-900 block">Verification QR Code</span>
                      <span className="text-[10px] text-slate-500">Attach tracking links to manifests.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempConfig.pdfQrEnabled}
                      onChange={(e) => handleInputChange('pdfQrEnabled', e.target.checked)}
                      className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-slate-200 text-xs font-bold text-slate-450 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save PDF Layout
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: LOGIN EXPERIENCE & PORTALS OVERRIDES */}
          {activeTab === 'login' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Login Interface & Portals overrides</h3>
                <p className="text-xs text-slate-500 mt-1">Configure greeting messages, banner illustrations, and toggle tenant feature overlays.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 mb-1">Login Screen Greeting Text</label>
                  <input
                    type="text"
                    value={tempConfig.loginWelcomeMessage}
                    onChange={(e) => handleInputChange('loginWelcomeMessage', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Login Page Illustration Type</label>
                  <select
                    value={tempConfig.loginIllustration}
                    onChange={(e) => handleInputChange('loginIllustration', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                  >
                    <option>Global Logistics Net</option>
                    <option>Minimalist Vector Truck</option>
                    <option>Abstract Dark Data Core</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Support Help Center URL</label>
                  <input
                    type="text"
                    value={tempConfig.helpCenterUrl}
                    onChange={(e) => handleInputChange('helpCenterUrl', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                
                {/* Portals branding toggles matrix */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/45 space-y-3">
                  <span className="font-extrabold text-slate-900 block">Portal Overrides Branding Toggles Matrix</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.brandDriverPortal}
                        onChange={(e) => handleInputChange('brandDriverPortal', e.target.checked)}
                        className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Driver App</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.brandDispatcherPortal}
                        onChange={(e) => handleInputChange('brandDispatcherPortal', e.target.checked)}
                        className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Dispatcher Portal</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.brandCustomerPortal}
                        onChange={(e) => handleInputChange('brandCustomerPortal', e.target.checked)}
                        className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Customer Portal</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-slate-200 text-xs font-bold text-slate-450 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Login Options
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: ASSET LIBRARY */}
          {activeTab === 'assets' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Brand Assets Library CDN</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload and manage image assets directly on the Cloudflare/AWS cloud storage bucket.</p>
                </div>
                <button
                  onClick={() => setShowTrashBin(!showTrashBin)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-200 rounded text-brand-400 font-bold hover:text-brand-300"
                >
                  {showTrashBin ? 'View Active Assets' : 'View CDN Trash Bin'}
                </button>
              </div>

              {/* Folder explorer navigation header */}
              <div className="flex gap-1.5 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
                {['Logos', 'Icons', 'Backgrounds', 'Illustrations', 'Fonts', 'Videos', 'Email Images', 'Invoice Images'].map(folder => (
                  <button
                    key={folder}
                    onClick={() => setSelectedAssetFolder(folder)}
                    className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                      selectedAssetFolder === folder
                        ? 'bg-[#1e293b] text-brand-400 border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    /{folder}
                  </button>
                ))}
              </div>

              {/* Search asset and Upload action block */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 outline-none"
                    placeholder={`Search assets in /${selectedAssetFolder}...`}
                  />
                </div>
                
                <form onSubmit={handleAssetUpload} className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-900 rounded-lg hover:text-brand-400 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Push Custom Asset
                  </button>
                </form>
              </div>

              {/* Assets list items directory explorer */}
              <div className="bg-slate-50 rounded-xl border border-slate-200/50 overflow-hidden">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead className="bg-white text-slate-500 uppercase tracking-widest text-[9px] font-bold border-b border-slate-200/45">
                    <tr>
                      <th className="p-2.5">Asset File Name</th>
                      <th className="p-2.5">Category Type</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Updated</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23324C]/20 text-slate-500">
                    {assetsList.filter(a => a.folder === selectedAssetFolder && a.deleted === showTrashBin).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 italic">No assets located in /{selectedAssetFolder} folder.</td>
                      </tr>
                    ) : (
                      assetsList
                        .filter(a => a.folder === selectedAssetFolder && a.deleted === showTrashBin)
                        .filter(a => a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()))
                        .map((asset, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-brand-400" />
                              {asset.name}
                            </td>
                            <td className="p-2.5 text-[11px] text-slate-500">{asset.type}</td>
                            <td className="p-2.5 font-mono text-[10px] text-slate-500">{asset.size}</td>
                            <td className="p-2.5 text-[10px] text-slate-500">{asset.date}</td>
                            <td className="p-2.5 text-right space-x-2">
                              {showTrashBin ? (
                                <button
                                  onClick={() => handleRestoreAsset(asset.name)}
                                  className="text-emerald-400 hover:underline font-bold focus:outline-none"
                                >
                                  Restore File
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => triggerToast(`CDN asset path copied! (${asset.name})`, 'success')}
                                    className="text-brand-400 hover:underline font-bold focus:outline-none"
                                  >
                                    Copy Link
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAsset(asset.name)}
                                    className="text-red-400 hover:underline font-bold focus:outline-none"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: DEPLOYMENT PIPELINE & AUDIT TRAILS */}
          {activeTab === 'deployment' && (
            <div className="space-y-6">
              
              {/* Build Compiler launcher */}
              <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branding Deployment Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-1">Package styling parameters and configs to compile a static web app distribution bundle and push to S3 CDN.</p>
                </div>

                {isDeploying ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-4 animate-pulse">
                    <div className="flex items-center gap-2 text-xs font-black text-brand-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      COMPILATION PIPELINE RUNNING...
                    </div>
                    <pre className="text-[10px] font-mono text-slate-500 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed max-h-48 overflow-y-auto">
                      {deploymentLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">Release Modification Changelog Summary</label>
                      <textarea
                        value={deploymentChangeLog}
                        onChange={(e) => setDeploymentChangeLog(e.target.value)}
                        placeholder="Detail the changes in this build (e.g. Unified portal theme, updated lights logos, redirected SMTP relays)..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none placeholder:text-slate-600"
                      />
                    </div>
                    
                    <button
                      onClick={runBuildDeployment}
                      className="w-full py-2.5 bg-brand-500 text-xs text-slate-950 font-black rounded-xl hover:bg-brand-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Play className="h-4 w-4" />
                      Compile static assets & Deploy Build to S3 CDN
                    </button>
                  </div>
                )}
              </div>

              {/* Version History Table */}
              <div className="glass rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <span className="font-extrabold text-slate-900 block">Published Release Logs & Rollback Revisions</span>
                
                <div className="space-y-2">
                  {deployments.map((dep, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/45 flex justify-between items-center text-slate-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <strong className="text-slate-900 font-extrabold">v{dep.version}</strong>
                          <span className="bg-white px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono font-bold">{dep.build}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            dep.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white text-slate-500'
                          }`}>
                            {dep.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-450">{dep.changeLog}</p>
                        <span className="block text-[9px] text-slate-650 font-bold">{dep.time} • Released By {dep.publishedBy} • Duration: {dep.duration || '10s'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDiffViewer(dep.version)}
                          className="px-2 py-1 bg-slate-900 border border-slate-200 text-slate-600 hover:text-slate-900 rounded font-bold text-[10px]"
                        >
                          Diff Viewer
                        </button>
                        {dep.status !== 'Published' && (
                          <button
                            onClick={() => triggerRollback(dep)}
                            className="px-3 py-1 bg-slate-900 border border-slate-200 hover:text-slate-900 text-brand-400 font-black rounded-lg transition-all flex items-center gap-1 text-[10px] focus:outline-none"
                          >
                            <Undo className="h-3 w-3" />
                            Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit logs registry list */}
              <div className="glass rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 block">System Audit Trails</span>
                  <button
                    onClick={handleExportAuditsCSV}
                    className="px-3.5 py-1 bg-slate-900 border border-slate-200 text-slate-900 font-bold rounded-lg hover:text-brand-400 text-[10px]"
                  >
                    Export Audits CSV
                  </button>
                </div>

                {/* Audit Filters */}
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-600 outline-none"
                    placeholder="Search action or details..."
                  />
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-600 outline-none font-bold"
                  >
                    <option value="All">All Actions</option>
                    <option value="Customizer Configuration Saved">Configuration Save</option>
                    <option value="Branding Build Deployed">Deployment</option>
                    <option value="Rollback Branding Version">Rollback</option>
                  </select>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200/50 max-h-60 overflow-y-auto divide-y divide-[#23324C]/20">
                  {filteredAudits.map((a, idx) => (
                    <div key={idx} className="p-3 text-[11px] hover:bg-slate-900/40 text-slate-500">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 font-black">{a.action}</strong>
                        <span className="text-[10px] text-slate-650 font-bold">{a.time}</span>
                      </div>
                      <p className="text-slate-450 mt-1">{a.detail}</p>
                      <span className="block text-[9px] text-slate-600 font-mono mt-0.5">Operator: {a.user} • IP: {a.ip} • Browser: {a.browser || 'Chrome 126'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 10: SECURITY POLICIES */}
          {activeTab === 'security' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">White Label Security</h3>
                <p className="text-xs text-slate-500 mt-1">Configure secure access restrictions, environmental variables secrets, allowed IP networks, and MFA enforcements.</p>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">MFA Enforcement Toggles</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={securityMfa} 
                        onChange={(e) => setSecurityMfa(e.target.checked)}
                        className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-slate-600 font-semibold">Enforce MFA for branding managers</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Branding Deployment Approval Policy</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={appApprovalRequired} 
                        onChange={(e) => setAppApprovalRequired(e.target.checked)}
                        className="rounded bg-slate-50 border-slate-200 text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-slate-600 font-semibold">Super Admin review required before CDN release</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Session Timeout limits</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
                    >
                      <option>15 Minutes</option>
                      <option>30 Minutes</option>
                      <option>60 Minutes</option>
                      <option>Never Expire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Allowed IP networks (comma separated)</label>
                    <input
                      type="text"
                      value={ipWhitelist}
                      onChange={(e) => setIpWhitelist(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* API Keys and secret tokens credentials management */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 space-y-4">
                  <span className="text-xs text-slate-900 font-extrabold block border-b border-slate-200/35 pb-2">Developer Secrets & Webhook Credentials</span>
                  
                  <div className="space-y-2">
                    {apiKeys.map((keyInfo, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200/45 rounded-lg flex justify-between items-center text-slate-600">
                        <div className="space-y-1">
                          <strong className="block text-slate-900 text-[11px]">{keyInfo.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {keyInfo.visible ? keyInfo.key : '••••••••••••••••••••••••••••••••••••'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleApiKeyVisibility(idx)}
                            className="text-brand-400 hover:underline"
                          >
                            {keyInfo.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(idx, keyInfo.name)}
                            className="text-red-400 hover:underline"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create API key form */}
                  <form onSubmit={handleCreateApiKey} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      placeholder="Add key name context (e.g. Stripe client secret)..."
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Key
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: API INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="glass rounded-2xl p-5 border border-slate-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">White Label API Integrations</h3>
                <p className="text-xs text-slate-500 mt-1">Manage connection details, Stripe billing integration, Twilio, SendGrid, and AWS CDN status configurations.</p>
              </div>

              <div className="space-y-4">
                {Object.keys(integrations).map(key => {
                  const info = integrations[key];
                  return (
                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-200/45 flex justify-between items-center text-slate-500">
                      <div className="space-y-1 text-xs">
                        <strong className="capitalize text-slate-900 block text-sm">{key} Integration</strong>
                        <span className="text-slate-500 font-mono">Status: <strong className="text-emerald-400">{info.status}</strong> • Health: <strong className="text-emerald-400">{info.health}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestIntegration(key)}
                          disabled={testingIntegrationKey === key}
                          className="px-3 py-1 bg-slate-900 border border-slate-200 hover:text-brand-400 text-slate-900 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {testingIntegrationKey === key ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                          Test Connection
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Visual Real-time Previews workspace container */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 sticky top-6">
            
            {/* Preview selection tabs */}
            <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-brand-400" />
                Live Previews Workspace
              </span>

              <div className="flex gap-1 text-[10px] font-bold">
                {[
                  { id: 'portal', label: 'Portal UI' },
                  { id: 'email', label: 'Email HTML' },
                  { id: 'pdf', label: 'PDF Manifest' },
                  { id: 'login', label: 'Login Panel' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePreview(p.id)}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      activePreview === p.id
                        ? 'bg-slate-900 text-brand-400 border border-slate-200'
                        : 'text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PREVIEW CONTAINER 1: PORTAL PREVIEW */}
            {activePreview === 'portal' && (
              <div 
                className="rounded-xl overflow-hidden border border-slate-200 text-[11px] font-sans h-96 flex flex-col"
                style={{ fontFamily: tempConfig.brandFont, backgroundColor: tempConfig.bgColor }}
              >
                {/* Navbar */}
                <div 
                  className="px-3 py-2.5 flex justify-between items-center text-slate-900 border-b"
                  style={{ backgroundColor: tempConfig.headerBg, borderColor: tempConfig.tableBorder }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 bg-white rounded flex items-center justify-center font-black text-[9px]" style={{ color: tempConfig.accentColor }}>
                      H
                    </div>
                    <span className="font-extrabold">{tempConfig.platformName}</span>
                  </div>
                  <span className="bg-white/80 px-2 py-0.5 rounded text-[8px] font-bold text-slate-500 font-mono">
                    {tempConfig.shortName}
                  </span>
                </div>

                {/* Sidebar & content body */}
                <div className="flex flex-1 overflow-hidden">
                  
                  {/* Mock Sidebar */}
                  <div 
                    className="w-24 p-2 flex flex-col justify-between text-[9px] text-slate-500 border-r"
                    style={{ backgroundColor: tempConfig.sidebarBg, borderColor: tempConfig.tableBorder }}
                  >
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded bg-white/40 text-slate-900 font-extrabold flex items-center gap-1 border-l-2" style={{ borderLeftColor: tempConfig.accentColor }}>
                        Dashboard
                      </div>
                      <div className="px-2 py-1 rounded hover:bg-white/20">Loads</div>
                      <div className="px-2 py-1 rounded hover:bg-white/20">Fleet</div>
                      <div className="px-2 py-1 rounded hover:bg-white/20">Drivers</div>
                    </div>
                    <div className="text-[8px] text-slate-500 text-center font-mono">
                      v{tempConfig.version}
                    </div>
                  </div>

                  {/* Mock main contents grid */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-slate-500">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 text-[12px]">{tempConfig.portalName}</span>
                      <button 
                        className={`px-3 py-1 text-[10px] text-slate-950 font-black hover:opacity-90 transition-all ${
                          tempConfig.buttonStyle === 'rounded-xl' ? 'rounded-xl' : 'rounded-lg'
                        }`}
                        style={{ backgroundColor: tempConfig.accentColor, borderRadius: tempConfig.cardRadius }}
                      >
                        Action Button
                      </button>
                    </div>

                    {/* Table mockup */}
                    <div 
                      className="border rounded-lg overflow-hidden bg-slate-900/40"
                      style={{ borderColor: tempConfig.tableBorder }}
                    >
                      <div className="bg-white px-2.5 py-1.5 text-[8px] uppercase tracking-wider text-slate-500 font-bold border-b" style={{ borderColor: tempConfig.tableBorder }}>
                        Mock Operations Log
                      </div>
                      <div className="p-2 space-y-1 font-mono text-[9px]">
                        <div className="flex justify-between py-1 border-b border-slate-200/20">
                          <span className="text-slate-900">LD-9411</span>
                          <span className="text-emerald-400">Delivered</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-900">LD-4820</span>
                          <span className="text-amber-500">In Transit</span>
                        </div>
                      </div>
                    </div>

                    {/* Gradient widget */}
                    <div 
                      className="p-3 rounded-lg text-slate-900 space-y-1 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${tempConfig.gradientStart}, ${tempConfig.gradientEnd})`, borderRadius: tempConfig.cardRadius }}
                    >
                      <strong className="block text-[10px] font-black uppercase">Enterprise Growth</strong>
                      <p className="text-[9px] text-slate-900/80">Unified logistics operations dashboard metrics tracker panel.</p>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 2: HTML EMAIL TEMPLATE PREVIEW */}
            {activePreview === 'email' && (
              <div className="rounded-xl overflow-hidden border border-slate-200 text-[11px] font-sans h-96 flex flex-col bg-white text-slate-800">
                {/* Header */}
                <div className="bg-slate-100 p-4 flex justify-between items-center border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="font-bold text-slate-700 text-xs">Pre-release Notification Draft</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">SMTP Relay</span>
                </div>

                {/* Email Envelope Header */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                  <div><strong>From:</strong> {tempConfig.smtpSenderName} &lt;{tempConfig.smtpSenderEmail}&gt;</div>
                  <div><strong>Subject:</strong> {emailTemplates[activeEmailTemplate].subject}</div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  <div className="flex justify-center border-b border-slate-100 pb-3">
                    <div className="h-6 px-3 bg-slate-900 text-slate-900 rounded font-mono text-[10px] flex items-center justify-center font-bold">
                      {tempConfig.companyName} Light Logo
                    </div>
                  </div>

                  <div className="space-y-2 text-slate-600 leading-relaxed text-xs">
                    <p className="font-extrabold text-slate-800 text-sm">{emailTemplates[activeEmailTemplate].title}</p>
                    <p>{emailTemplates[activeEmailTemplate].body}</p>
                  </div>

                  <div className="flex justify-center py-2">
                    <button 
                      className="px-5 py-2 text-slate-900 font-extrabold text-xs shadow-md hover:opacity-90 transition-all rounded-lg"
                      style={{ backgroundColor: tempConfig.accentColor }}
                    >
                      Authenticate Verification Check
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-450 border-t border-slate-150 pt-3 text-center space-y-1">
                    <p>Signature: Operations Management Team • {tempConfig.shortName}</p>
                    <p className="text-slate-500">© 2026 {tempConfig.companyName}. All rights reserved.</p>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 3: PDF MANIFEST REPORT DOCUMENT PREVIEW */}
            {activePreview === 'pdf' && (
              <div className="rounded-xl overflow-hidden border border-slate-200 text-[10px] font-sans h-96 flex flex-col bg-white text-slate-900 p-6 space-y-5 relative">
                
                {/* PDF Watermark */}
                {tempConfig.pdfWatermarkEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] rotate-45 select-none">
                    <span className="text-slate-900 font-black text-2xl uppercase tracking-widest border-4 border-slate-900 p-2">
                      {tempConfig.shortName} DOCUMENT
                    </span>
                  </div>
                )}

                {/* PDF Header line */}
                <div className="flex justify-between items-start border-b-2 pb-2" style={{ borderBottomColor: tempConfig.accentColor }}>
                  <div className="space-y-1">
                    <strong className="text-[11px] uppercase tracking-wider block font-bold text-slate-900">{tempConfig.pdfHeader}</strong>
                    <span className="block text-[9px] text-slate-500">Document Type: BOL / Shipment Manifest</span>
                  </div>
                  
                  <div className="h-6 px-3 bg-slate-900 text-slate-900 rounded font-mono text-[9px] flex items-center justify-center font-bold">
                    {tempConfig.companyName} PDF Logo
                  </div>
                </div>

                {/* Invoice Meta Grid */}
                <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-650">
                  <div className="space-y-0.5">
                    <strong>Shipper Carrier:</strong>
                    <p>{tempConfig.companyName}</p>
                    <p>Web portal: {tempConfig.customDomain || 'tms.herologistics.com'}</p>
                  </div>
                  <div className="space-y-0.5 text-right font-mono">
                    <p><strong>Invoice ID:</strong> #INV-2026-9042</p>
                    <p><strong>Issue Date:</strong> 06/26/2026</p>
                  </div>
                </div>

                {/* PDF Table mock */}
                <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
                  <div className="bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-600 flex justify-between border-b border-slate-200">
                    <span>Cargo Item Description</span>
                    <span>Total Rate</span>
                  </div>
                  
                  <div className="flex-1 p-2 space-y-1.5 font-mono text-[9px] text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>42 Dry Grocery Pallets (LD-9411)</span>
                      <span>$4,290.00</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Interstate dispatch fuel surcharge</span>
                      <span>$350.00</span>
                    </div>
                  </div>
                </div>

                {/* QR and Signature Footer */}
                <div className="flex justify-between items-end border-t border-slate-150 pt-2 text-[9px] text-slate-500">
                  <div className="space-y-1">
                    <p className="font-mono">{tempConfig.pdfFooter.replace('{page}', '1').replace('{total}', '1')}</p>
                  </div>

                  {tempConfig.pdfQrEnabled && (
                    <div className="h-8 w-8 bg-slate-200 rounded flex items-center justify-center font-mono text-[8px] font-black text-slate-800">
                      QR
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* PREVIEW CONTAINER 4: LOGIN EXPERIENCE PREVIEW */}
            {activePreview === 'login' && (
              <div 
                className="rounded-xl overflow-hidden border border-slate-200 text-[11px] font-sans h-96 flex flex-col justify-center items-center p-6 relative bg-cover bg-center"
                style={{ backgroundImage: `url(${tempConfig.loginBg})`, backgroundColor: '#0B0F19' }}
              >
                {/* Background overlay screen */}
                <div className="absolute inset-0 bg-slate-950/80 z-0"></div>

                {/* Login card */}
                <div 
                  className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/80 w-64 space-y-4 z-10 text-center relative overflow-hidden"
                  style={{ borderRadius: tempConfig.cardRadius }}
                >
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="h-6 w-6 bg-white rounded flex items-center justify-center font-black text-[10px] text-slate-900" style={{ color: tempConfig.accentColor }}>
                      H
                    </div>
                    <strong className="text-slate-900 text-xs block font-extrabold">{tempConfig.loginWelcomeMessage}</strong>
                    <span className="text-[8px] text-slate-500 font-bold">Illustration: {tempConfig.loginIllustration}</span>
                    <span className="text-[8px] text-slate-600 block">Powered by {tempConfig.platformName}</span>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Email Address</span>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-200 text-slate-650 text-[9px]">admin@company.com</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Password</span>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-200 text-slate-650 text-[9px]">••••••••••••</div>
                    </div>
                  </div>

                  <button 
                    className="w-full py-1.5 text-slate-950 font-black text-xs hover:opacity-90 transition-all shadow-md"
                    style={{ backgroundColor: tempConfig.accentColor, borderRadius: tempConfig.cardRadius }}
                  >
                    Authenticate
                  </button>

                  <div className="flex justify-between items-center text-[8px] text-slate-500 pt-1">
                    <a href={tempConfig.helpCenterUrl} target="_blank" rel="noreferrer" className="hover:underline">Need Assistance?</a>
                    <a href={tempConfig.privacyPolicyUrl} target="_blank" rel="noreferrer" className="hover:underline">Privacy Policy</a>
                  </div>
                </div>

              </div>
            )}

            {/* Quick action buttons list */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-200/45 flex justify-between items-center text-[11px] text-slate-500">
              <span className="font-semibold">Modify preview attributes live using settings tabs.</span>
              <button
                onClick={handleSaveConfig}
                className="px-3.5 py-1 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer text-[10px]"
              >
                <Save className="h-3.5 w-3.5" />
                Commit Draft
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* VERSION DIFF VIEWER DIALOG MODAL */}
      {isDiffModalOpen && diffDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <strong className="text-slate-900 text-base">Branding Release Diff Viewer</strong>
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 font-extrabold focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-450 leading-relaxed">
              Comparing active configuration variables with Version <strong className="text-brand-400 font-bold">{diffVersionSelected}</strong>:
            </p>

            <div className="bg-slate-50 rounded-xl border border-slate-200/45 overflow-hidden text-xs">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-slate-50/65 text-slate-500 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Variable</th>
                    <th className="p-2.5 text-brand-400">Active State</th>
                    <th className="p-2.5 text-amber-500">v{diffVersionSelected}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/30 text-slate-600 font-mono text-[11px]">
                  {diffDetails.map((diff, i) => (
                    <tr key={i} className="hover:bg-slate-900/20">
                      <td className="p-2.5 font-bold text-slate-900 font-sans">{diff.property}</td>
                      <td className="p-2.5 text-brand-400">{diff.current}</td>
                      <td className="p-2.5 text-amber-500">{diff.historical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-200 hover:text-slate-900 rounded-xl font-bold cursor-pointer text-xs"
              >
                Close Diff Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
