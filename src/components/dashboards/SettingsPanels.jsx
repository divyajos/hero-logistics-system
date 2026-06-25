import React, { useState } from 'react';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import Toast from '../common/Toast';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { 
  Settings, Key, Compass, Database, Bell, FileText, 
  RefreshCw, Check, CheckCircle2, ShieldAlert, Cpu
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-brand-500" /> Settings
          </h2>
          <p className="text-xs text-slate-400 font-medium">Configure company defaults, connect ELD/accounting APIs, and view security audit registries.</p>
        </div>
      </div>

      {/* Settings Sub-tabs */}
      <div className="flex flex-wrap border-b border-[#23324C]/40 pb-px text-xs font-bold gap-4">
        {[
          { id: 'profile', label: 'Company Profile', icon: Settings },
          { id: 'niche', label: 'Niche Configuration', icon: Cpu },
          { id: 'gps', label: 'GPS Providers', icon: Compass },
          { id: 'accounting', label: 'Accounting Integration', icon: Database },
          { id: 'templates', label: 'Notifications Templates', icon: Bell },
          { id: 'audit', label: 'System Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 pb-3 cursor-pointer transition-colors ${
                isActive ? 'text-brand-500 border-b-2 border-brand-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-white">Company Profile Settings</h3>
          <div className="space-y-4">
            <TextInput label="Registered Company Name" defaultValue="Hero Logistics Ltd" />
            <TextInput label="Corporate Registration Number" defaultValue="ABN 48 901 029 421" />
            <TextInput label="Corporate Admin Email" defaultValue="admin@herologistics.com" />
            
            <div className="p-4 bg-[#111827]/40 border border-[#23324C] rounded-xl text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Platform Membership Subscription</span>
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Enterprise Tier Plan</span>
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

      {/* Niche Configuration Settings */}
      {activeSubTab === 'niche' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-white">Logistics Niche Configurations</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Configure active niches. Toggling off a niche hides related fields and tables across all dispatch dashboards.</p>
          
          <div className="space-y-3.5">
            <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] rounded-xl cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Car Carrying & Transport</span>
                <span className="text-[10px] text-slate-500 block">Enables VIN / Rego details, holding yard lanes, and asset registers</span>
              </div>
              <input 
                type="checkbox" 
                checked={nicheSettings.carCarryingEnabled} 
                onChange={(e) => setNicheSettings({ ...nicheSettings, carCarryingEnabled: e.target.checked })} 
                className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] rounded-xl cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">General Freight</span>
                <span className="text-[10px] text-slate-500 block">Enables Pallet Count, dimensions, cargo weight, and dry bins</span>
              </div>
              <input 
                type="checkbox" 
                checked={nicheSettings.generalFreightEnabled} 
                onChange={(e) => setNicheSettings({ ...nicheSettings, generalFreightEnabled: e.target.checked })} 
                className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] rounded-xl cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Dangerous Goods (HAZMAT)</span>
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">GPS Providers & ELD Integrations</h3>
          
          <div className="space-y-4">
            {gpsConfigs.map((config) => (
              <div key={config.id} className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <strong className="text-white text-xs block font-bold">{config.provider}</strong>
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
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-bold transition-colors cursor-pointer"
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Cloud Accounting Integrations</h3>
          
          <div className="space-y-4">
            {accountingConfigs.map((config) => (
              <div key={config.id} className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <strong className="text-white text-xs block font-bold">{config.provider}</strong>
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">System SMS & Email Notification Templates</h3>
          
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-white text-xs font-bold">{template.name}</strong>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase text-[9px]">
                    {template.type}
                  </span>
                </div>
                
                {template.subject && (
                  <p className="text-slate-500 font-semibold">Subject: <span className="text-slate-300 font-normal">{template.subject}</span></p>
                )}
                {template.body && (
                  <p className="text-slate-500 font-semibold">Body: <span className="text-slate-300 font-normal font-mono">{template.body}</span></p>
                )}
                
                <div className="flex gap-2 pt-2 border-t border-[#23324C]/35">
                  <button 
                    onClick={() => triggerToast('Template editor loaded.')}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg font-bold cursor-pointer transition-colors"
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
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Company SaaS Security Audit Logs</h3>
          
          <DataTable columns={[
            { key: 'date', label: 'Timestamp', render: (row) => <span className="font-mono text-[10px] text-slate-450">{row.date}</span> },
            { key: 'user', label: 'User Node', render: (row) => <span className="text-slate-250 font-bold">{row.user}</span> },
            { key: 'action', label: 'Event Action Description', render: (row) => <span className="font-semibold text-white">{row.action}</span> },
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
