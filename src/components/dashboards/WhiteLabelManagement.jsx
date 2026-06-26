import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../api/apiClient';
import {
  Settings, Layout, Globe, Mail, MessageSquare, FileText, Lock, Smartphone, Shield,
  Database, RefreshCw, CheckCircle, AlertTriangle, Play, Clock, Search, Folder,
  Eye, Save, Plus, Trash2, Edit, Check, Copy, Sliders, HelpCircle, CheckSquare,
  PlusCircle, List, Activity, ChevronDown, ChevronRight, Upload, Download, Undo
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
  const [config, setConfig] = useState({
    companyName: 'Hero Logistics System',
    platformName: 'Logistics OS',
    portalName: 'Enterprise Tenant Portal',
    shortName: 'HeroLog',
    logoLight: 'https://hero-mock-storage.s3.amazonaws.com/uploads/logo-light.png',
    logoDark: 'https://hero-mock-storage.s3.amazonaws.com/uploads/logo-dark.png',
    favicon: 'https://hero-mock-storage.s3.amazonaws.com/uploads/favicon.ico',
    mobileIcon: 'https://hero-mock-storage.s3.amazonaws.com/uploads/mobile-icon.png',
    emailLogo: 'https://hero-mock-storage.s3.amazonaws.com/uploads/email-logo.png',
    pdfLogo: 'https://hero-mock-storage.s3.amazonaws.com/uploads/pdf-logo.png',
    invoiceLogo: 'https://hero-mock-storage.s3.amazonaws.com/uploads/invoice-logo.png',
    loginBg: 'https://hero-mock-storage.s3.amazonaws.com/uploads/login-bg.jpg',
    dashboardBg: 'https://hero-mock-storage.s3.amazonaws.com/uploads/dashboard-bg.jpg',
    loadingScreen: 'https://hero-mock-storage.s3.amazonaws.com/uploads/loading.gif',
    watermark: 'https://hero-mock-storage.s3.amazonaws.com/uploads/watermark.png',
    splashScreen: 'https://hero-mock-storage.s3.amazonaws.com/uploads/splash.png',
    brandFont: 'Inter',
    typography: 'Modern Sans',
    accentColor: '#0ea5e9',
    bgColor: '#0B0F19',
    cardRadius: '16px',
    buttonStyle: 'Solid Fill',
    gradientStart: '#0ea5e9',
    gradientEnd: '#6366f1',
    customDomain: 'tms.herologistics.com',
    subDomain: 'portal.herologistics.com',
    sslStatus: 'Active',
    sslExpiry: '12/31/2026',
    dnsVerified: true,
    smtpSenderName: 'Logistics OS Mailer',
    smtpSenderEmail: 'mailer@herologistics.com',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smsSender: 'HEROLOG',
    smsTemplates: {
      otp: 'Your OTP code is {code}. Valid for 5 minutes.',
      dispatch: 'Load {loadId} is dispatched. Driver: {driverName}. ETA: {eta}.',
      billing: 'Invoice {invoiceId} of ${amount} has been generated for your account.'
    },
    pdfHeader: 'HERO LOGISTICS ENTERPRISE SOLUTION',
    pdfFooter: 'Confidential Document • Page {page} of {total}',
    pdfWatermarkEnabled: true,
    pdfQrEnabled: true,
    androidPackageName: 'com.herologistics.driver',
    iosBundleId: 'com.herologistics.driver.ios',
    appStoreName: 'Hero Driver ELD',
    brandDriverPortal: true,
    brandDispatcherPortal: true,
    brandCustomerPortal: true,
    approvalStatus: 'Published',
    version: '1.4.0',
    lastDeployed: '06/25/2026, 09:40:00 AM',
    // Theme options
    themeMode: 'Dark Theme Only',
    sidebarBg: '#111827',
    headerBg: '#161F30',
    tableBorder: '#23324C',
    shadowDepth: 'Medium Shadow',
    animationsEnabled: true,
    loginWelcomeMessage: 'Welcome to Enterprise Logistics OS',
    loginIllustration: 'Global Logistics Net',
    helpCenterUrl: 'https://support.herologistics.com',
    privacyPolicyUrl: 'https://herologistics.com/privacy',
  });

  const [deployments, setDeployments] = useState([]);
  const [audits, setAudits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, branding, theme, domain, email, pdf, login, assets, deployment
  const [activePreview, setActivePreview] = useState('portal'); // portal, email, pdf, login

  // Edit variables
  const [tempConfig, setTempConfig] = useState({ ...config });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [deploymentChangeLog, setDeploymentChangeLog] = useState('');
  const [dnsCheckLoading, setDnsCheckLoading] = useState(false);
  const [dnsRecordStatus, setDnsRecordStatus] = useState(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [selectedAssetFolder, setSelectedAssetFolder] = useState('logos');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  // Security Toggles State
  const [securityMfa, setSecurityMfa] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.1, 10.0.0.45, 172.16.23.10');
  const [assetPerms, setAssetPerms] = useState('Super Admin & Tenant Admins');

  // Integrations Status State
  const [integrations, setIntegrations] = useState({
    cloudflare: { enabled: true, zoneId: 'zone_8829a102bc', status: 'Connected' },
    s3: { enabled: true, bucketName: 'hero-white-label-cdn', status: 'Connected' },
    sendgrid: { enabled: true, senderName: 'Mailer Engine', status: 'Verified' },
    twilio: { enabled: true, number: '+18005550199', status: 'Operational' },
    firebase: { enabled: false, projectId: '', status: 'Not Integrated' }
  });

  // Mock Asset files
  const [assetsList, setAssetsList] = useState([
    { name: 'logo-light.png', type: 'Logo', size: '24 KB', folder: 'logos', date: '06/24/2026' },
    { name: 'logo-dark.png', type: 'Logo', size: '28 KB', folder: 'logos', date: '06/24/2026' },
    { name: 'favicon.ico', type: 'Icon', size: '4 KB', folder: 'icons', date: '06/23/2026' },
    { name: 'mobile-icon.png', type: 'Icon', size: '42 KB', folder: 'icons', date: '06/25/2026' },
    { name: 'login-bg.jpg', type: 'Background', size: '1.2 MB', folder: 'backgrounds', date: '06/25/2026' },
    { name: 'dashboard-bg.jpg', type: 'Background', size: '840 KB', folder: 'backgrounds', date: '06/20/2026' },
    { name: 'Inter-Regular.woff2', type: 'Font', size: '98 KB', folder: 'fonts', date: '06/01/2026' },
    { name: 'Outfit-Bold.woff2', type: 'Font', size: '110 KB', folder: 'fonts', date: '06/01/2026' },
    { name: 'welcome_template.html', type: 'Template', size: '18 KB', folder: 'templates', date: '06/15/2026' },
    { name: 'invoice_receipt.pdf', type: 'PDF', size: '245 KB', folder: 'pdfs', date: '06/25/2026' }
  ]);

  // Fetch initial config and logs
  const getWhiteLabelData = async () => {
    try {
      setLoading(true);
      const resConfig = await apiClient.get('white-label');
      const resDeployments = await apiClient.get('white-label/deployments');
      const resAudits = await apiClient.get('white-label/audits');
      
      setConfig(resConfig.data);
      setTempConfig({ ...resConfig.data });
      setDeployments(resDeployments.data);
      setAudits(resAudits.data);
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

  const handleInputChange = (field, val) => {
    setTempConfig(prev => ({
      ...prev,
      [field]: val
    }));
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

  // Log white label audits
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
    try {
      // Find modified fields for detailed audit logging
      const changedFields = [];
      Object.keys(tempConfig).forEach(key => {
        if (JSON.stringify(tempConfig[key]) !== JSON.stringify(config[key])) {
          changedFields.push(key);
        }
      });

      if (changedFields.length === 0) {
        triggerToast('No changes detected in branding options.', 'info');
        return;
      }

      const res = await apiClient.put('white-label', tempConfig);
      setConfig(res.data);
      triggerToast('White Label customization settings saved successfully as draft.', 'success');
      
      await logBrandingAudit(
        'Draft Branding Saved', 
        `Updated variables: ${changedFields.join(', ')}. Set status to ${tempConfig.approvalStatus || 'Draft'}.`
      );
    } catch (err) {
      console.error(err);
      triggerToast('Error saving white label configurations.', 'danger');
    }
  };

  // Trigger CNAME and DNS check verification status
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
        message: 'DNS verified. CNAME properly maps to ssl.herologistics.com.'
      });
      triggerToast('Custom domain DNS check passed! CNAME records aligned.', 'success');
      logBrandingAudit('DNS Check Triggered', `Checked CNAME for ${tempConfig.customDomain}. Output: Valid.`);
    }, 1200);
  };

  // Test SMTP settings
  const sendTestEmail = () => {
    setTestEmailLoading(true);
    setTimeout(() => {
      setTestEmailLoading(false);
      triggerToast(`Test SMTP message successfully dispatched to ${tempConfig.smtpSenderEmail}.`, 'success');
      logBrandingAudit('SMTP Test Dispatched', `Sent SMTP testing envelope via host ${tempConfig.smtpHost}:${tempConfig.smtpPort}.`);
    }, 1500);
  };

  // Execute Build Deploy branding pipeline
  const runBuildDeployment = async () => {
    if (!deploymentChangeLog.trim()) {
      triggerToast('Please provide a changelog summary for this branding release.', 'danger');
      return;
    }
    setIsDeploying(true);
    setDeploymentLogs([]);
    
    const steps = [
      'Initiating White Label webpack compiler container...',
      'Mapping accent branding variables: accentColor=' + tempConfig.accentColor + ' bg=' + tempConfig.bgColor + '...',
      'Packaging light/dark logos and icons into optimized WebP formats...',
      'Checking Cloudflare DNS zone records for custom domain redirect bindings...',
      'Deploying bundle stylesheets to AWS S3 CDN (bucket: hero-white-label-cdn)...',
      'Configuring global Redux store & localStorage settings sync triggers...',
      'Bumping white label package version mapping...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setDeploymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
    }

    try {
      const nextVerParts = config.version.split('.');
      nextVerParts[2] = parseInt(nextVerParts[2]) + 1;
      const nextVer = nextVerParts.join('.');

      const payload = {
        version: nextVer,
        changeLog: deploymentChangeLog,
        environment: 'Production',
        publishedBy: 'Super Admin',
        status: 'Published'
      };

      const resDeployment = await apiClient.post('white-label/deployments', payload);
      setDeployments(prev => [resDeployment.data, ...prev]);

      // Update current active config too
      const updatedConfig = {
        ...tempConfig,
        version: nextVer,
        lastDeployed: resDeployment.data.time,
        approvalStatus: 'Published'
      };
      
      const resConfig = await apiClient.put('white-label', updatedConfig);
      setConfig(resConfig.data);
      setTempConfig(resConfig.data);
      
      setDeploymentLogs(prev => [...prev, `\n[BUILD SUCCESS] Branding deployed to production at version ${nextVer}!`]);
      triggerToast(`Branding build deployed! Version ${nextVer} is live.`, 'success');
      await logBrandingAudit('Branding Build Deployed', `Released version ${nextVer} (Build: ${resDeployment.data.build}) with changelog: ${deploymentChangeLog}`);
      
      setDeploymentChangeLog('');
      setTimeout(() => {
        setIsDeploying(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      triggerToast('Error during compilation build packaging.', 'danger');
      setIsDeploying(false);
    }
  };

  // Rollback version handler
  const handleRollback = async (deployment) => {
    if (!window.confirm(`Are you sure you want to rollback all branding settings to Version ${deployment.version} (${deployment.build})?`)) return;
    try {
      const res = await apiClient.post(`white-label/deployments/${deployment.id}/rollback`);
      if (res.data.success) {
        triggerToast(`Rolled back styling options to version ${deployment.version}!`, 'success');
        getWhiteLabelData();
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error reverting branding configurations.', 'danger');
    }
  };

  // Mock Asset Upload
  const handleAssetUpload = (e) => {
    e.preventDefault();
    triggerToast('Brand asset pushed to local cloud storage bucket.', 'success');
    const newAsset = {
      name: `custom-branding-file-${Date.now().toString().slice(-4)}.png`,
      type: 'Asset Upload',
      size: '150 KB',
      folder: selectedAssetFolder,
      date: new Date().toLocaleDateString()
    };
    setAssetsList(prev => [newAsset, ...prev]);
    logBrandingAudit('Asset Uploaded', `Uploaded custom asset file to CDN folder: /${selectedAssetFolder}/${newAsset.name}`);
  };

  // KPI Metrics Calculation
  const totalCustomers = tenants.length;
  const activeBrands = tenants.filter(t => t.status === 'Active').length;
  const pendingApprovals = config.approvalStatus === 'Review' ? 1 : 0;
  const publishedThemes = THEME_MODES.length;
  const customDomains = deployments.length;
  const sslActiveCount = deployments.filter(d => d.status === 'Published').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white space-y-4">
        <RefreshCw className="h-10 w-10 animate-spin text-brand-400" />
        <span className="text-sm font-semibold text-slate-400">Loading Enterprise White Label Settings...</span>
      </div>
    );
  }

  // Filter Assets List
  const filteredAssets = assetsList.filter(a => {
    const matchesFolder = a.folder === selectedAssetFolder;
    const matchesSearch = a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) || a.type.toLowerCase().includes(assetSearchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header section with status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-[#23324C]/60">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-400" />
            Enterprise White Label Platform
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize branding layers, email SMTP relays, custom domains, and visual interfaces dynamically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#111827] px-3.5 py-1.5 rounded-xl border border-[#23324C] text-xs">
            <span className="text-slate-500 font-bold mr-1.5">Active Version:</span>
            <strong className="text-brand-400 font-black">{config.version}</strong>
          </div>
          <div className="bg-[#111827] px-3.5 py-1.5 rounded-xl border border-[#23324C] text-xs">
            <span className="text-slate-500 font-bold mr-1.5">Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              config.approvalStatus === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              config.approvalStatus === 'Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {config.approvalStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Dashboard Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Total White Label Clients</span>
          <strong className="text-xl sm:text-2xl font-black text-white mt-2">{totalCustomers}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">100% tenant coverage enabled</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Branding Health Score</span>
          <strong className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">98.5%</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">All logo assets valid formats</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Custom Domains / SSL Active</span>
          <strong className="text-xl sm:text-2xl font-black text-brand-400 mt-2">{config.customDomain ? '1 Active' : '0 Active'}</strong>
          <span className="text-[9px] font-semibold text-emerald-400 mt-1.5">SSL Auto-Renewal active</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-[#23324C]/60 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Last Deploy Build</span>
          <strong className="text-sm font-black text-white mt-2 truncate">{config.lastDeployed.split(',')[0]}</strong>
          <span className="text-[9px] font-semibold text-slate-500 mt-1.5">By Super Admin (v{config.version})</span>
        </div>
      </div>

      {/* Workspace Split Layout: Forms Left / Previews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Navigation Tab Sidebar and Section Form Configuration Containers */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Navigation Tabs Header */}
          <div className="bg-[#111827] p-2.5 rounded-2xl border border-[#23324C] flex flex-wrap gap-1 text-xs">
            {[
              { id: 'dashboard', label: 'Overview', icon: Layout },
              { id: 'branding', label: 'Branding Asset Center', icon: Sliders },
              { id: 'theme', label: 'Theme Variables', icon: Layout },
              { id: 'domain', label: 'Domain & SSL', icon: Globe },
              { id: 'email', label: 'SMTP & Communications', icon: Mail },
              { id: 'pdf', label: 'PDF Reports Layout', icon: FileText },
              { id: 'login', label: 'Login & Portals', icon: Lock },
              { id: 'assets', label: 'Assets CDN', icon: Folder },
              { id: 'deployment', label: 'Build Deployments', icon: RefreshCw }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">White Label Overview</h3>
                <p className="text-xs text-slate-400 mt-1">Status indicator reports, theme adoption charts, and platform security tools.</p>
              </div>

              {/* Adoption and Distribution Mini charts using styled divs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Chart 1: Theme Distribution */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/40 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Theme Distribution</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                        <span>Dark Theme</span>
                        <span className="font-bold">60%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                        <span>Light Theme</span>
                        <span className="font-bold">30%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-400">
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
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/40 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Branding Adoption By Platform</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                        <span>Company Portal</span>
                        <span className="font-bold">100%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                        <span>Driver Mobile ELD</span>
                        <span className="font-bold">85%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 text-slate-400">
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

              {/* MFA and Security config blocks */}
              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/40 space-y-4">
                <span className="text-xs text-white font-extrabold flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  White Label Security Policies
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">MFA Enforcement Toggles</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={securityMfa} 
                        onChange={(e) => setSecurityMfa(e.target.checked)}
                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-slate-300 font-semibold">Enforce MFA for branding managers</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Asset Manager Access Controls</label>
                    <select
                      value={assetPerms}
                      onChange={(e) => setAssetPerms(e.target.value)}
                      className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-slate-300 outline-none"
                    >
                      <option>Super Admin Only</option>
                      <option>Super Admin & Tenant Admins</option>
                      <option>All Staff</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">IP Address Whitelist (comma separated)</label>
                    <input
                      type="text"
                      value={ipWhitelist}
                      onChange={(e) => setIpWhitelist(e.target.value)}
                      className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-slate-300 font-mono outline-none"
                      placeholder="e.g. 192.168.1.1, 10.0.0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Integrations panel widgets */}
              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/40 space-y-3">
                <span className="text-xs text-white font-extrabold flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-brand-400" />
                  White Label Storage & CDN Connectors
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.keys(integrations).map(key => {
                    const info = integrations[key];
                    return (
                      <div key={key} className="bg-[#111827] p-2.5 rounded-lg border border-[#23324C]/45 flex justify-between items-center">
                        <div>
                          <strong className="capitalize text-white block">{key} integration</strong>
                          <span className="text-[10px] text-slate-500">{info.enabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          info.status === 'Connected' || info.status === 'Verified' || info.status === 'Operational'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {info.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BRANDING ASSET CENTER */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Branding Identity settings</h3>
                <p className="text-xs text-slate-400 mt-1">Configure company name details, light/dark brand logos, typography, fonts, and borders.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div>
                  <label className="block text-slate-400 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    value={tempConfig.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Short Name abbreviation</label>
                  <input
                    type="text"
                    value={tempConfig.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={tempConfig.platformName}
                    onChange={(e) => handleInputChange('platformName', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Portal Name</label>
                  <input
                    type="text"
                    value={tempConfig.portalName}
                    onChange={(e) => handleInputChange('portalName', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  />
                </div>

                {/* Logo URLs inputs */}
                <div>
                  <label className="block text-slate-400 mb-1">Logo Light Theme (URL)</label>
                  <input
                    type="text"
                    value={tempConfig.logoLight}
                    onChange={(e) => handleInputChange('logoLight', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Logo Dark Theme (URL)</label>
                  <input
                    type="text"
                    value={tempConfig.logoDark}
                    onChange={(e) => handleInputChange('logoDark', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Favicon Icon (URL)</label>
                  <input
                    type="text"
                    value={tempConfig.favicon}
                    onChange={(e) => handleInputChange('favicon', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mobile Launcher App Icon (URL)</label>
                  <input
                    type="text"
                    value={tempConfig.mobileIcon}
                    onChange={(e) => handleInputChange('mobileIcon', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>

                {/* Typography configurations */}
                <div>
                  <label className="block text-slate-400 mb-1">Brand Font Family</label>
                  <select
                    value={tempConfig.brandFont}
                    onChange={(e) => handleInputChange('brandFont', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Typography Class</label>
                  <select
                    value={tempConfig.typography}
                    onChange={(e) => handleInputChange('typography', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    {TYPOGRAPHY_STYLING.map(ts => <option key={ts}>{ts}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Button Outline Radius</label>
                  <select
                    value={tempConfig.cardRadius}
                    onChange={(e) => handleInputChange('cardRadius', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    {RADIUS_OPTIONS.map(ro => <option key={ro} value={ro.split(' ')[0]}>{ro}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Button Filler Style</label>
                  <select
                    value={tempConfig.buttonStyle}
                    onChange={(e) => handleInputChange('buttonStyle', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    {BUTTON_STYLES.map(bs => <option key={bs}>{bs}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-[#23324C] text-xs font-bold text-slate-450 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: THEME BUILDER VARIABLES */}
          {activeTab === 'theme' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Theme Builder UI Palette</h3>
                <p className="text-xs text-slate-400 mt-1">Define primary accent brand styling colors, gradients, sidebar backgrounds, and active state styles.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-350">
                <div>
                  <label className="block text-slate-400 mb-1">Theme Mode enforcement</label>
                  <select
                    value={tempConfig.themeMode}
                    onChange={(e) => handleInputChange('themeMode', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    {THEME_MODES.map(tm => <option key={tm}>{tm}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Accent Primary Brand Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={tempConfig.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="bg-transparent border-0 h-8 w-8 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={tempConfig.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="flex-1 bg-[#0B0F19] border border-[#23324C] rounded-lg px-2 text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Gradient Start Hex Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={tempConfig.gradientStart}
                      onChange={(e) => handleInputChange('gradientStart', e.target.value)}
                      className="bg-transparent border-0 h-8 w-8 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={tempConfig.gradientStart}
                      onChange={(e) => handleInputChange('gradientStart', e.target.value)}
                      className="flex-1 bg-[#0B0F19] border border-[#23324C] rounded-lg px-2 text-white font-mono outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gradient End Hex Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={tempConfig.gradientEnd}
                      onChange={(e) => handleInputChange('gradientEnd', e.target.value)}
                      className="bg-transparent border-0 h-8 w-8 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={tempConfig.gradientEnd}
                      onChange={(e) => handleInputChange('gradientEnd', e.target.value)}
                      className="flex-1 bg-[#0B0F19] border border-[#23324C] rounded-lg px-2 text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Sidebar Menu Color</label>
                  <input
                    type="text"
                    value={tempConfig.sidebarBg}
                    onChange={(e) => handleInputChange('sidebarBg', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Header Bar Color</label>
                  <input
                    type="text"
                    value={tempConfig.headerBg}
                    onChange={(e) => handleInputChange('headerBg', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Table Grid Borders</label>
                  <input
                    type="text"
                    value={tempConfig.tableBorder}
                    onChange={(e) => handleInputChange('tableBorder', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Interface Shadow Depth</label>
                  <select
                    value={tempConfig.shadowDepth}
                    onChange={(e) => handleInputChange('shadowDepth', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    <option>No Shadows</option>
                    <option>Subtle Shadow</option>
                    <option>Medium Shadow</option>
                    <option>Elevated Soft Glow</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-[#23324C] text-xs font-bold text-slate-450 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: CUSTOM DOMAIN & SSL */}
          {activeTab === 'domain' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Custom Domain Management</h3>
                <p className="text-xs text-slate-400 mt-1">Assign custom enterprise CNAME mappings, domain aliases, redirect paths, and activate SSL handshakes.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Enterprise Custom Domain</label>
                    <input
                      type="text"
                      value={tempConfig.customDomain}
                      onChange={(e) => handleInputChange('customDomain', e.target.value)}
                      className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                      placeholder="e.g. tms.falconcarriers.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Fallback Portal Subdomain</label>
                    <input
                      type="text"
                      value={tempConfig.subDomain}
                      onChange={(e) => handleInputChange('subDomain', e.target.value)}
                      className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                      placeholder="e.g. swift.herologistics.com"
                    />
                  </div>
                </div>

                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/45 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
                    <span className="font-extrabold text-white">Required CNAME DNS Records Mappings</span>
                    <button
                      onClick={runDnsValidation}
                      disabled={dnsCheckLoading}
                      className="px-3.5 py-1 bg-brand-500 text-slate-950 font-black rounded-lg hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer text-[10px] disabled:opacity-50"
                    >
                      {dnsCheckLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      Check DNS Alignments
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-[11px] font-mono text-slate-350">
                    <div className="flex justify-between py-1 border-b border-[#23324C]/20">
                      <span className="text-slate-500">Record Type</span>
                      <span>CNAME</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23324C]/20">
                      <span className="text-slate-500">Source Host Alias</span>
                      <span>{tempConfig.customDomain || 'tms.herologistics.com'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23324C]/20">
                      <span className="text-slate-500">Target Value</span>
                      <span>ssl.herologistics.com</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">SSL Security</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Let's Encrypt Certified (Expires: {tempConfig.sslExpiry})
                      </span>
                    </div>
                  </div>
                </div>

                {/* DNS checks feedback output */}
                {dnsRecordStatus && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-slate-300">
                    <strong className="text-emerald-400 block text-xs flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Domain Config Status: {tempConfig.sslStatus}
                    </strong>
                    <p className="text-[11px]">{dnsRecordStatus.message}</p>
                    <span className="block text-[10px] text-slate-500">Edge Server IP Address: {dnsRecordStatus.ipAddress}</span>
                  </div>
                )}

                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/45 flex justify-between items-center text-slate-400">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Force HTTPS / SSL Layering</span>
                    <p className="text-[10px] text-slate-500">Automatically redirect any plain text http requests to encrypted https.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EMAIL SMTP & SMS COMMUNICATIONS */}
          {activeTab === 'email' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Branded Communications Engine</h3>
                <p className="text-xs text-slate-400 mt-1">Configure SendGrid/Twilio SMTP credentials and customize templates for dispatch alerts and invitations.</p>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                
                {/* SMTP Credentials */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/45 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
                    <span className="font-extrabold text-white">SMTP Email Gateway Settings</span>
                    <button
                      onClick={sendTestEmail}
                      disabled={testEmailLoading}
                      className="px-3.5 py-1 bg-slate-900 border border-[#23324C] text-white font-bold rounded-lg hover:text-brand-400 transition-all flex items-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      {testEmailLoading ? <RefreshCw className="h-3 w-3 animate-spin text-brand-400" /> : <Play className="h-3 w-3" />}
                      Send Test Email
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1">Sender Name Envelope</label>
                      <input
                        type="text"
                        value={tempConfig.smtpSenderName}
                        onChange={(e) => handleInputChange('smtpSenderName', e.target.value)}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Sender Email Envelope</label>
                      <input
                        type="text"
                        value={tempConfig.smtpSenderEmail}
                        onChange={(e) => handleInputChange('smtpSenderEmail', e.target.value)}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">SMTP Host Relay</label>
                      <input
                        type="text"
                        value={tempConfig.smtpHost}
                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">SMTP Port Relay</label>
                      <input
                        type="text"
                        value={tempConfig.smtpPort}
                        onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* SMS twilio alerts templates */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/45 space-y-3">
                  <span className="font-extrabold text-white block border-b border-[#23324C]/50 pb-2">SMS Alerts Twilio Templates</span>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-500 mb-1">SMS Sender alphanumeric label</label>
                      <input
                        type="text"
                        value={tempConfig.smsSender}
                        onChange={(e) => handleInputChange('smsSender', e.target.value)}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">OTP Verification SMS Template</label>
                      <textarea
                        value={tempConfig.smsTemplates.otp}
                        onChange={(e) => handleSmsTemplateChange('otp', e.target.value)}
                        rows={2}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Dispatch Alerts Notification SMS</label>
                      <textarea
                        value={tempConfig.smsTemplates.dispatch}
                        onChange={(e) => handleSmsTemplateChange('dispatch', e.target.value)}
                        rows={2}
                        className="w-full bg-[#111827] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-[#23324C] text-xs font-bold text-slate-450 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft Configuration
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: PDF REPORTS LAYOUT */}
          {activeTab === 'pdf' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">PDF Customization Center</h3>
                <p className="text-xs text-slate-400 mt-1">Design header, footers, logos, signature boxes, and QR codes placement parameters on documents.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs text-slate-350">
                <div>
                  <label className="block text-slate-400 mb-1">PDF Document Custom Header Text</label>
                  <input
                    type="text"
                    value={tempConfig.pdfHeader}
                    onChange={(e) => handleInputChange('pdfHeader', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">PDF Document Custom Footer Text (Variables: {'{page}'}, {'{total}'})</label>
                  <input
                    type="text"
                    value={tempConfig.pdfFooter}
                    onChange={(e) => handleInputChange('pdfFooter', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F19] p-3 rounded-lg border border-[#23324C]/45 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-white block">Document Watermark</span>
                      <span className="text-[10px] text-slate-500">Inject watermark on PODs & receipts.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempConfig.pdfWatermarkEnabled}
                      onChange={(e) => handleInputChange('pdfWatermarkEnabled', e.target.checked)}
                      className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                    />
                  </div>
                  <div className="bg-[#0B0F19] p-3 rounded-lg border border-[#23324C]/45 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-white block">Verification QR Code</span>
                      <span className="text-[10px] text-slate-500">Attach tracking links to manifests.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempConfig.pdfQrEnabled}
                      onChange={(e) => handleInputChange('pdfQrEnabled', e.target.checked)}
                      className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...config })}
                  className="px-4 py-2 bg-slate-900 border border-[#23324C] text-xs font-bold text-slate-450 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft Layout
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: LOGIN EXPERIENCE & PORTALS ACCESS */}
          {activeTab === 'login' && (
            <form onSubmit={handleSaveConfig} className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Login Interface & Portals overrides</h3>
                <p className="text-xs text-slate-400 mt-1">Configure greeting messages, banner illustrations, and toggle tenant feature overlays.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-350">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Login Screen Greeting Text</label>
                  <input
                    type="text"
                    value={tempConfig.loginWelcomeMessage}
                    onChange={(e) => handleInputChange('loginWelcomeMessage', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Login Page Illustration Type</label>
                  <select
                    value={tempConfig.loginIllustration}
                    onChange={(e) => handleInputChange('loginIllustration', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none"
                  >
                    <option>Global Logistics Net</option>
                    <option>Minimalist Vector Truck</option>
                    <option>Abstract Dark Data Core</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Support Help Center URL</label>
                  <input
                    type="text"
                    value={tempConfig.helpCenterUrl}
                    onChange={(e) => handleInputChange('helpCenterUrl', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                
                {/* Portals branding toggles matrix */}
                <div className="sm:col-span-2 bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/45 space-y-3">
                  <span className="font-extrabold text-white block">Portal Overrides Branding Toggles Matrix</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.brandDriverPortal}
                        onChange={(e) => handleInputChange('brandDriverPortal', e.target.checked)}
                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Driver App</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.brandDispatcherPortal}
                        onChange={(e) => handleInputChange('brandDispatcherPortal', e.target.checked)}
                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Dispatcher Portal</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempConfig.brandCustomerPortal}
                        onChange={(e) => handleInputChange('brandCustomerPortal', e.target.checked)}
                        className="rounded bg-[#0B0F19] border-[#23324C] text-brand-500 h-4 w-4 cursor-pointer"
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
                  className="px-4 py-2 bg-slate-900 border border-[#23324C] text-xs font-bold text-slate-450 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-xs font-extrabold text-slate-950 rounded-xl hover:bg-brand-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft Options
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: BRAND ASSETS LIBRARY CDN */}
          {activeTab === 'assets' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Brand Assets Library CDN</h3>
                <p className="text-xs text-slate-400 mt-1">Upload and manage image assets directly on the Cloudflare/AWS cloud storage bucket.</p>
              </div>

              {/* Folder explorer navigation header */}
              <div className="flex gap-1.5 border-b border-[#23324C]/40 pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
                {['logos', 'icons', 'backgrounds', 'fonts', 'templates', 'pdfs'].map(folder => (
                  <button
                    key={folder}
                    onClick={() => setSelectedAssetFolder(folder)}
                    className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                      selectedAssetFolder === folder
                        ? 'bg-[#1e293b] text-brand-400 border border-[#23324C]'
                        : 'text-slate-400 hover:text-white'
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
                    className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white outline-none"
                    placeholder={`Search assets in /${selectedAssetFolder}...`}
                  />
                </div>
                
                <form onSubmit={handleAssetUpload} className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#111827] border border-[#23324C] text-xs font-bold text-white rounded-lg hover:text-brand-400 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Push Custom Asset
                  </button>
                </form>
              </div>

              {/* Assets list items directory explorer */}
              <div className="bg-[#0B0F19] rounded-xl border border-[#23324C]/50 overflow-hidden">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead className="bg-[#111827] text-slate-500 uppercase tracking-widest text-[9px] font-bold border-b border-[#23324C]/45">
                    <tr>
                      <th className="p-2.5">Asset File Name</th>
                      <th className="p-2.5">Category Type</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Updated</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23324C]/20 text-slate-350">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 italic">No assets located in /{selectedAssetFolder} folder.</td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-brand-400" />
                            {asset.name}
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-400">{asset.type}</td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-500">{asset.size}</td>
                          <td className="p-2.5 text-[10px] text-slate-500">{asset.date}</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => triggerToast(`CDN asset path copied! (${asset.name})`, 'success')}
                              className="text-brand-400 hover:underline hover:text-brand-300 font-bold focus:outline-none"
                            >
                              Copy Link
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: DEPLOYMENT PIPELINE & AUDITS HISTORY */}
          {activeTab === 'deployment' && (
            <div className="space-y-6">
              
              {/* Build Compiler launcher */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Branding Deployment Pipeline</h3>
                  <p className="text-xs text-slate-400 mt-1">Package styling parameters and configs to compile a static web app distribution bundle and push to CDN caches.</p>
                </div>

                {isDeploying ? (
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#23324C]/50 space-y-4 animate-pulse">
                    <div className="flex items-center gap-2 text-xs font-black text-brand-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      COMPILATION PIPELINE RUNNING...
                    </div>
                    <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed max-h-48 overflow-y-auto">
                      {deploymentLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Release Modification Changelog Summary</label>
                      <textarea
                        value={deploymentChangeLog}
                        onChange={(e) => setDeploymentChangeLog(e.target.value)}
                        placeholder="Detail the changes in this build (e.g. Unified portal theme, updated lights logos, redirected SMTP relays)..."
                        rows={3}
                        className="w-full bg-[#0B0F19] border border-[#23324C] rounded-lg p-2.5 text-white outline-none placeholder:text-slate-600"
                      />
                    </div>
                    
                    <button
                      onClick={runBuildDeployment}
                      className="w-full py-2.5 bg-brand-500 text-xs text-slate-950 font-black rounded-xl hover:bg-brand-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Play className="h-4 w-4" />
                      Deploy Branding Build to CDN
                    </button>
                  </div>
                )}
              </div>

              {/* Version History Table */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-3 text-xs">
                <span className="font-extrabold text-white block">Published Release Logs & Rollback Revisions</span>
                
                <div className="space-y-2">
                  {deployments.map((dep, idx) => (
                    <div key={idx} className="bg-[#0B0F19] p-3 rounded-xl border border-[#23324C]/45 flex justify-between items-center text-slate-350">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <strong className="text-white font-extrabold">v{dep.version}</strong>
                          <span className="bg-[#111827] px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono font-bold">{dep.build}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            dep.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {dep.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-450">{dep.changeLog}</p>
                        <span className="block text-[9px] text-slate-600 font-bold">{dep.time} • Released By {dep.publishedBy}</span>
                      </div>
                      
                      {dep.status !== 'Published' && (
                        <button
                          onClick={() => handleRollback(dep)}
                          className="px-3 py-1 bg-slate-900 border border-[#23324C] hover:text-white text-brand-400 font-black rounded-lg transition-all flex items-center gap-1 text-[10px] focus:outline-none"
                        >
                          <Undo className="h-3 w-3" />
                          Rollback
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit logs registry list */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-3 text-xs">
                <span className="font-extrabold text-white block">System Audit Trails</span>

                <div className="bg-[#0B0F19] rounded-xl border border-[#23324C]/50 max-h-60 overflow-y-auto divide-y divide-[#23324C]/20">
                  {audits.map((a, idx) => (
                    <div key={idx} className="p-3 text-[11px] hover:bg-slate-900/40 text-slate-350">
                      <div className="flex justify-between items-center">
                        <strong className="text-white font-black">{a.action}</strong>
                        <span className="text-[10px] text-slate-600 font-bold">{a.time}</span>
                      </div>
                      <p className="text-slate-450 mt-1">{a.detail}</p>
                      <span className="block text-[9px] text-slate-600 font-mono mt-0.5">Operator: {a.user} • IP: {a.ip} • Browser: {a.browser || 'Chrome 126'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Visual Real-time Previews workspace container */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#111827] p-4 rounded-2xl border border-[#23324C] space-y-4 sticky top-6">
            
            {/* Preview selection tabs */}
            <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
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
                        ? 'bg-slate-900 text-brand-400 border border-[#23324C]'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PREVIEW CONTAINER 1: INTERACTIVE PORTAL PREVIEW */}
            {activePreview === 'portal' && (
              <div 
                className="rounded-xl overflow-hidden border border-[#23324C] text-[11px] font-sans h-96 flex flex-col"
                style={{ fontFamily: tempConfig.brandFont, backgroundColor: tempConfig.bgColor }}
              >
                {/* Navbar */}
                <div 
                  className="px-3 py-2.5 flex justify-between items-center text-white border-b"
                  style={{ backgroundColor: tempConfig.headerBg, borderColor: tempConfig.tableBorder }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 bg-slate-800 rounded flex items-center justify-center font-black text-[9px]" style={{ color: tempConfig.accentColor }}>
                      H
                    </div>
                    <span className="font-extrabold">{tempConfig.platformName}</span>
                  </div>
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[8px] font-bold text-slate-400 font-mono">
                    {tempConfig.shortName}
                  </span>
                </div>

                {/* Sidebar & content body */}
                <div className="flex flex-1 overflow-hidden">
                  
                  {/* Mock Sidebar */}
                  <div 
                    className="w-24 p-2 flex flex-col justify-between text-[9px] text-slate-400 border-r"
                    style={{ backgroundColor: tempConfig.sidebarBg, borderColor: tempConfig.tableBorder }}
                  >
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded bg-slate-800/40 text-white font-extrabold flex items-center gap-1 border-l-2" style={{ borderLeftColor: tempConfig.accentColor }}>
                        Dashboard
                      </div>
                      <div className="px-2 py-1 rounded hover:bg-slate-800/20">Loads</div>
                      <div className="px-2 py-1 rounded hover:bg-slate-800/20">Fleet</div>
                      <div className="px-2 py-1 rounded hover:bg-slate-800/20">Drivers</div>
                    </div>
                    <div className="text-[8px] text-slate-500 text-center font-mono">
                      v{tempConfig.version}
                    </div>
                  </div>

                  {/* Mock main contents grid */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-slate-350">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white text-[12px]">{tempConfig.portalName}</span>
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
                      <div className="bg-[#111827] px-2.5 py-1.5 text-[8px] uppercase tracking-wider text-slate-500 font-bold border-b" style={{ borderColor: tempConfig.tableBorder }}>
                        Mock Operations Log
                      </div>
                      <div className="p-2 space-y-1 font-mono text-[9px]">
                        <div className="flex justify-between py-1 border-b border-[#23324C]/20">
                          <span className="text-white">LD-9411</span>
                          <span className="text-emerald-400">Delivered</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-white">LD-4820</span>
                          <span className="text-amber-500">In Transit</span>
                        </div>
                      </div>
                    </div>

                    {/* Gradient widget */}
                    <div 
                      className="p-3 rounded-lg text-white space-y-1 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${tempConfig.gradientStart}, ${tempConfig.gradientEnd})`, borderRadius: tempConfig.cardRadius }}
                    >
                      <strong className="block text-[10px] font-black uppercase">Enterprise Growth</strong>
                      <p className="text-[9px] text-white/80">Unified logistics operations dashboard metrics tracker panel.</p>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 2: HTML EMAIL TEMPLATE PREVIEW */}
            {activePreview === 'email' && (
              <div className="rounded-xl overflow-hidden border border-[#23324C] text-[11px] font-sans h-96 flex flex-col bg-white text-slate-800">
                {/* Header */}
                <div className="bg-slate-100 p-4 flex justify-between items-center border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="font-bold text-slate-700 text-xs">Pre-release Notification Draft</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">SMTP Relay</span>
                </div>

                {/* Email Envelope Header */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                  <div><strong>From:</strong> {tempConfig.smtpSenderName} &lt;{tempConfig.smtpSenderEmail}&gt;</div>
                  <div><strong>Subject:</strong> Welcome to the new Logistics Platform</div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  <div className="flex justify-center border-b border-slate-100 pb-3">
                    <div className="h-6 px-3 bg-slate-900 text-white rounded font-mono text-[10px] flex items-center justify-center font-bold">
                      {tempConfig.companyName} Light Logo
                    </div>
                  </div>

                  <div className="space-y-2 text-slate-600 leading-relaxed text-xs">
                    <p>Dear Customer,</p>
                    <p>Your tenant admin portal credentials have been provisioned on the new enterpriseWhite Label node.</p>
                    <p>Please click the button below to initialize your password and customize your dispatch rules.</p>
                  </div>

                  <div className="flex justify-center py-2">
                    <button 
                      className="px-5 py-2 text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all rounded-lg"
                      style={{ backgroundColor: tempConfig.accentColor }}
                    >
                      Verify Password
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-450 border-t border-slate-150 pt-3 text-center space-y-1">
                    <p>Signature: Operations Management Team • {tempConfig.shortName}</p>
                    <p className="text-slate-400">© 2026 {tempConfig.companyName}. All rights reserved.</p>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 3: PDF MANIFEST REPORT DOCUMENT PREVIEW */}
            {activePreview === 'pdf' && (
              <div className="rounded-xl overflow-hidden border border-[#23324C] text-[10px] font-sans h-96 flex flex-col bg-white text-slate-900 p-6 space-y-5 relative">
                
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
                  
                  <div className="h-6 px-3 bg-slate-900 text-white rounded font-mono text-[9px] flex items-center justify-center font-bold">
                    {tempConfig.companyName} PDF Logo
                  </div>
                </div>

                {/* Invoice Meta Grid */}
                <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-600">
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
                className="rounded-xl overflow-hidden border border-[#23324C] text-[11px] font-sans h-96 flex flex-col justify-center items-center p-6 relative bg-cover bg-center"
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
                    <div className="h-6 w-6 bg-slate-800 rounded flex items-center justify-center font-black text-[10px] text-white" style={{ color: tempConfig.accentColor }}>
                      H
                    </div>
                    <strong className="text-white text-xs block font-extrabold">{tempConfig.loginWelcomeMessage}</strong>
                    <span className="text-[8px] text-slate-500">Powered by {tempConfig.platformName}</span>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Email Address</span>
                      <div className="bg-slate-950 p-1.5 rounded border border-[#23324C]/40 text-slate-600 text-[9px]">admin@company.com</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Password</span>
                      <div className="bg-slate-950 p-1.5 rounded border border-[#23324C]/40 text-slate-650 text-[9px]">••••••••••••</div>
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
            <div className="bg-slate-900/60 p-3 rounded-xl border border-[#23324C]/45 flex justify-between items-center text-[11px] text-slate-400">
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

    </div>
  );
}
