import React, { useState } from 'react';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import Toast from '../common/Toast';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { 
  Settings, Key, Compass, Database, Bell, FileText, 
  RefreshCw, Check, CheckCircle2, ShieldAlert, Cpu,
  Palette, Clock, CreditCard, Layout
} from 'lucide-react';

export default function SettingsPanels({ activeTab = 'settings' }) {
  const [activeSubTab, setActiveSubTab] = useState('profile'); // profile, niche, gps, accounting, templates, audit
  
  // Niche Configurations State
  const [nicheSettings, setNicheSettings] = useState({
    carCarryingEnabled: true,
    generalFreightEnabled: true,
    dangerousGoodsEnabled: true,
    defaultNiche: 'car_carrying'
  });

  // GPS Providers State
  const [gpsConfigs, setGpsConfigs] = useState([
    { id: 'gps-1', provider: 'Trakka Telematics', apiKey: '••••••••••••••••3981', status: 'Connected' },
    { id: 'gps-2', provider: 'Geotab ELD API', apiKey: '••••••••••••••••7742', status: 'Connected' },
    { id: 'gps-3', provider: 'Teletrac Navman', apiKey: '', status: 'Disconnected' }
  ]);

  // Accounting Integrations State
  const [accountingConfigs, setAccountingConfigs] = useState([
    { id: 'acc-1', provider: 'Xero Accounting', status: 'Connected', lastSync: '10 min ago' },
    { id: 'acc-2', provider: 'QuickBooks Online', status: 'Disconnected', lastSync: 'Never' }
  ]);

  // Email & SMS Templates State
  const [templates, setTemplates] = useState([
    { id: 't-1', name: 'Shipper Invoice Receipt Email', type: 'Email', subject: 'Hero Logistics Invoice [Invoice ID] for [Customer]' },
    { id: 't-2', name: 'Driver Job Dispatch SMS', type: 'SMS', body: 'Hero Alert: New Job [Load ID] assigned to you. Report to [Pickup].' },
    { id: 't-3', name: 'POD Confirmation Email', type: 'Email', subject: 'Hero Proof-of-Delivery: Job [Load ID] complete.' }
  ]);

  // SaaS Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 'AUD-801', date: '06/23/2026 21:04:12', user: 'Company Admin', action: 'Update Driver Permissions', ip: '192.168.1.45', status: 'Success' },
    { id: 'AUD-802', date: '06/23/2026 20:30:19', user: 'Dispatcher John', action: 'Relocate Trailer TR-9410', ip: '192.168.1.112', status: 'Success' },
    { id: 'AUD-803', date: '06/23/2026 19:42:01', user: 'Driver Sarah', action: 'Auth Login Success', ip: '10.0.8.22', status: 'Success' }
  ]);

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleTestGpsConnection = (providerName) => {
    triggerToast(`GPS connection initialized: verified link with ${providerName} ELD servers.`);
  };

  const handleSyncAccounting = (providerName) => {
    triggerToast(`Accounting sync initialized: exported outstanding invoices to ${providerName}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-brand-500" /> Settings
          </h2>
          <p className="text-xs text-slate-500 font-medium">Configure company defaults, connect ELD/accounting APIs, and view security audit registries.</p>
        </div>
      </div>

      {/* Settings Sub-tabs */}
      <div className="flex flex-wrap border-b border-slate-200 pb-px text-xs font-bold gap-4">
        {[
          { id: 'profile', label: 'Company Profile', icon: Settings },
          { id: 'branding', label: 'Branding & Theme', icon: Palette },
          { id: 'business-hours', label: 'Business Hours', icon: Clock },
          { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
          { id: 'white-label', label: 'White Labeling', icon: Layout },
          { id: 'niche', label: 'Niche Configuration', icon: Cpu },
          { id: 'gps', label: 'GPS Providers', icon: Compass },
          { id: 'accounting', label: 'Accounting Integration', icon: Database },
          { id: 'templates', label: 'Notification Templates', icon: Bell },
          { id: 'audit', label: 'System Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 pb-3 cursor-pointer transition-colors ${
                isActive ? 'text-brand-500 border-b-2 border-brand-500 font-extrabold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Company Profile Settings */}
      {activeSubTab === 'profile' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-slate-900">Company Profile Settings</h3>
          <div className="space-y-4">
            <TextInput label="Registered Company Name" defaultValue="Hero Logistics Ltd" />
            <TextInput label="Corporate Registration Number" defaultValue="ABN 48 901 029 421" />
            <TextInput label="Corporate Admin Email" defaultValue="admin@herologistics.com" />
            
            <div className="p-4 bg-white/40 border border-slate-200 rounded-xl text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Platform Membership Subscription</span>
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">Enterprise Tier Plan</span>
                <span className="text-emerald-450 font-bold font-mono">Active</span>
              </div>
              <p className="text-slate-500 text-[10px]">Your next billing cycle date: 07/20/2026 (Monthly invoice card: visa-8812)</p>
            </div>

            <Button type="button" variant="primary" className="w-full" onClick={() => triggerToast('Profile details updated successfully.')}>
              Save Profile Settings
            </Button>
          </div>
        </div>
      )}

      {/* Branding & Themes Settings */}
      {activeSubTab === 'branding' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 max-w-xl animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Company Branding & Custom Theme</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Customize the workspace color palette, layout mode, and upload your official company logo.</p>
          
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Primary Workspace Theme Color</span>
              <div className="flex gap-2.5">
                {[
                  { name: 'Brand Cyan', hex: 'bg-brand-500', label: 'Default' },
                  { name: 'Sleek Purple', hex: 'bg-purple-600', label: 'Purple' },
                  { name: 'Forest Green', hex: 'bg-emerald-500', label: 'Green' },
                  { name: 'Vibrant Orange', hex: 'bg-orange-500', label: 'Orange' },
                  { name: 'Deep Blue', hex: 'bg-blue-600', label: 'Blue' }
                ].map((color, i) => (
                  <button 
                    key={i} 
                    onClick={() => triggerToast(`Workspace color theme changed to: ${color.name}`)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                    type="button"
                  >
                    <span className={`w-8 h-8 rounded-xl ${color.hex} border border-slate-700 group-hover:scale-105 transition-all shadow-md`} />
                    <span className="text-[9px] text-slate-500 font-semibold">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200/35 pt-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Company Logo Upload</span>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => triggerToast('Logo file selection window opened.')}>
                <div className="text-xl">🏢</div>
                <p className="text-xs font-bold text-slate-500 mt-1">Click or drag logo file here</p>
                <p className="text-[9px] text-slate-500">Supports SVG, PNG, JPG up to 5MB</p>
              </div>
            </div>

            <Button type="button" variant="primary" className="w-full mt-2" onClick={() => triggerToast('Branding settings saved successfully.')}>
              Apply Branding & Themes
            </Button>
          </div>
        </div>
      )}

      {/* Business Hours Settings */}
      {activeSubTab === 'business-hours' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 max-w-xl animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Default Terminal Business Hours</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Establish base operating hours across company depots. Individual depots can override these in Branch Settings.</p>
          
          <div className="space-y-3.5">
            {[
              { day: 'Monday - Friday', active: true, hours: '08:00 AM - 06:00 PM' },
              { day: 'Saturday', active: true, hours: '09:00 AM - 02:00 PM' },
              { day: 'Sunday', active: false, hours: 'Closed' }
            ].map((b, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{b.day}</span>
                  <span className="text-[10px] font-mono text-slate-450">{b.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${b.active ? 'text-emerald-450' : 'text-red-400'}`}>{b.active ? 'Open' : 'Closed'}</span>
                  <button 
                    onClick={() => triggerToast(`Toggled business hours for ${b.day}`)}
                    className={`w-9 h-4.5 rounded-full transition-all relative cursor-pointer ${b.active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    type="button"
                  >
                    <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${b.active ? 'left-4.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="primary" className="w-full mt-2" onClick={() => triggerToast('Default depot business hours updated.')}>
              Save Default Hours
            </Button>
          </div>
        </div>
      )}

      {/* Billing & Subscriptions Settings */}
      {activeSubTab === 'billing' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Billing & Subscription Management</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Manage plan subscription levels, invoices, and active payment cards.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold font-mono">Enterprise Tier</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Card */}
            <div className="p-4 bg-white/40 border border-slate-200 rounded-2xl text-xs space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Payment Method</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">Visa</div>
                <div>
                  <strong className="text-slate-900 block font-bold text-xs">Visa ending in 8812</strong>
                  <span className="text-[10px] text-slate-550 font-mono">Expires 09/2029</span>
                </div>
              </div>
              <button 
                onClick={() => triggerToast('Update credit card payment form loaded.')}
                className="text-[10px] text-brand-400 font-bold hover:underline cursor-pointer"
                type="button"
              >
                Update Card Details →
              </button>
            </div>

            {/* Plan Usage */}
            <div className="p-4 bg-white/40 border border-slate-200 rounded-2xl text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Subscription Usage</span>
              <div className="flex justify-between">
                <span className="text-slate-500">depots count</span>
                <span className="text-slate-900 font-bold">2 / Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">users count</span>
                <span className="text-slate-900 font-bold">12 / Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">monthly invoice value</span>
                <span className="text-brand-400 font-bold font-mono">$499.00 / mo</span>
              </div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Billing Invoices Registry</span>
            <div className="space-y-2">
              {[
                { inv: 'INV-89112', date: 'Jun 20, 2026', amt: '$499.00', status: 'Paid' },
                { inv: 'INV-88029', date: 'May 20, 2026', amt: '$499.00', status: 'Paid' },
                { inv: 'INV-87002', date: 'Apr 20, 2026', amt: '$499.00', status: 'Paid' }
              ].map((row, i) => (
                <div key={i} className="p-3 bg-slate-900/50 border border-slate-200/35 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Invoice #{row.inv}</span>
                    <span className="text-[9.5px] text-slate-500 font-mono">{row.date}</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="font-bold font-mono text-slate-900 block">{row.amt}</span>
                      <span className="text-[9px] text-emerald-450 font-bold uppercase">{row.status}</span>
                    </div>
                    <button 
                      onClick={() => triggerToast(`Downloading Invoice PDF: ${row.inv}...`)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-750 border border-slate-200 rounded text-[10px] font-bold cursor-pointer"
                      type="button"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* White Label Settings */}
      {activeSubTab === 'white-label' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 max-w-xl animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">White Label & Domain Setup</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Customize the system workspace to match your own brand name and host it on your custom domain URL hostname.</p>
          
          <div className="space-y-3.5">
            <TextInput label="Custom Domain Hostname" defaultValue="logistics.herologistics.com" placeholder="e.g. logistics.yourcompany.com" />
            <TextInput label="Login Screen Welcome Header Title" defaultValue="Hero Logistics Operate System" />
            
            <div className="space-y-2 border-t border-slate-200/35 pt-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Brand Theme Options</span>
              <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-200 rounded-xl cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Hide Hero Logistics branding labels</span>
                  <span className="text-[10px] text-slate-500 block">Hides all logo footers and help links in dispatcher & driver dashboards</span>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={true}
                  className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
                  onChange={() => triggerToast('White label branding filter toggled.')}
                />
              </label>
            </div>

            <Button type="button" variant="primary" className="w-full mt-2" onClick={() => triggerToast('White label settings and DNS hostname configured successfully.')}>
              Save White Labeling Setup
            </Button>
          </div>
        </div>
      )}

      {/* Niche Configuration Settings */}
      {activeSubTab === 'niche' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-slate-900">Logistics Niche Configurations</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Configure active niches. Toggling off a niche hides related fields and tables across all dispatch dashboards.</p>
          
          <div className="space-y-3.5">
            <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-200 rounded-xl cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">Car Carrying & Transport</span>
                <span className="text-[10px] text-slate-500 block">Enables VIN / Rego details, holding yard lanes, and asset registers</span>
              </div>
              <input 
                type="checkbox" 
                checked={nicheSettings.carCarryingEnabled} 
                onChange={(e) => setNicheSettings({ ...nicheSettings, carCarryingEnabled: e.target.checked })} 
                className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-200 rounded-xl cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">General Freight</span>
                <span className="text-[10px] text-slate-500 block">Enables Pallet Count, dimensions, cargo weight, and dry bins</span>
              </div>
              <input 
                type="checkbox" 
                checked={nicheSettings.generalFreightEnabled} 
                onChange={(e) => setNicheSettings({ ...nicheSettings, generalFreightEnabled: e.target.checked })} 
                className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-200 rounded-xl cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">Dangerous Goods (HAZMAT)</span>
                <span className="text-[10px] text-slate-500 block">Enables UN Class, Hazchem chemical codes, and trailer placards</span>
              </div>
              <input 
                type="checkbox" 
                checked={nicheSettings.dangerousGoodsEnabled} 
                onChange={(e) => setNicheSettings({ ...nicheSettings, dangerousGoodsEnabled: e.target.checked })} 
                className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
              />
            </label>

            <SelectInput 
              label="Default Niche Selection" 
              value={nicheSettings.defaultNiche} 
              onChange={(e) => setNicheSettings({ ...nicheSettings, defaultNiche: e.target.value })} 
              options={[
                { value: 'car_carrying', label: 'Car Carrying' },
                { value: 'general_freight', label: 'General Freight' },
                { value: 'dangerous_goods', label: 'Dangerous Goods' }
              ]} 
            />

            <Button type="button" variant="primary" className="w-full mt-2" onClick={() => triggerToast('Niche configuration mappings saved.')}>
              Save Niche Setup
            </Button>
          </div>
        </div>
      )}

      {/* GPS Providers Settings */}
      {activeSubTab === 'gps' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">GPS Providers & ELD Integrations</h3>
          
          <div className="space-y-4">
            {gpsConfigs.map((config) => (
              <div key={config.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <strong className="text-slate-900 text-xs block font-bold">{config.provider}</strong>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      config.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {config.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">API Key: {config.apiKey || 'No API key configured'}</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => triggerToast('Configuration edit modal opened.')}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-700 text-slate-700 text-xs rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Edit API Key
                  </button>
                  {config.status === 'Connected' && (
                    <button 
                      onClick={() => handleTestGpsConnection(config.provider)}
                      className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-colors cursor-pointer"
                    >
                      Test Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounting Integration Settings */}
      {activeSubTab === 'accounting' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Cloud Accounting Integrations</h3>
          
          <div className="space-y-4">
            {accountingConfigs.map((config) => (
              <div key={config.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <strong className="text-slate-900 text-xs block font-bold">{config.provider}</strong>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      config.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {config.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">Last synced ledger logs: {config.lastSync}</p>
                </div>
                
                <div className="flex gap-2">
                  {config.status === 'Connected' ? (
                    <>
                      <button 
                        onClick={() => handleSyncAccounting(config.provider)}
                        className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-colors cursor-pointer"
                      >
                        Sync Invoices Now
                      </button>
                      <button 
                        onClick={() => triggerToast('Connection terminated.', 'warning')}
                        className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => triggerToast(`OAuth connection initialized with ${config.provider}.`)}
                      className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-colors cursor-pointer"
                    >
                      Authenticate Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Templates Settings */}
      {activeTab === 'settings' && activeSubTab === 'templates' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">System SMS & Email Notification Templates</h3>
          
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 text-xs font-bold">{template.name}</strong>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-500 font-bold uppercase text-[9px]">
                    {template.type}
                  </span>
                </div>
                
                {template.subject && (
                  <p className="text-slate-500 font-semibold">Subject: <span className="text-slate-600 font-normal">{template.subject}</span></p>
                )}
                {template.body && (
                  <p className="text-slate-500 font-semibold">Body: <span className="text-slate-600 font-normal font-mono">{template.body}</span></p>
                )}
                
                <div className="flex gap-2 pt-2 border-t border-slate-200/35">
                  <button 
                    onClick={() => triggerToast('Template editor loaded.')}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-white text-slate-700 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    Edit Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Audit Logs Settings */}
      {activeSubTab === 'audit' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Company SaaS Security Audit Logs</h3>
          
          <DataTable columns={[
            { key: 'date', label: 'Timestamp', render: (row) => <span className="font-mono text-[10px] text-slate-450">{row.date}</span> },
            { key: 'user', label: 'User Node', render: (row) => <span className="text-slate-250 font-bold">{row.user}</span> },
            { key: 'action', label: 'Event Action Description', render: (row) => <span className="font-semibold text-slate-900">{row.action}</span> },
            { key: 'ip', label: 'IP Address', render: (row) => <span className="font-mono text-[10px] text-slate-500">{row.ip}</span> },
            { key: 'status', label: 'Auth Status', render: (row) => (
              <span className="text-emerald-450 font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Success
              </span>
            ) }
          ]} data={auditLogs} />
        </div>
      )}
    </div>
  );
}
