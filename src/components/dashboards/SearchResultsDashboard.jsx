import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, FileText, Users, Truck, Briefcase, MapPin, 
  DollarSign, ArrowLeftRight, Clock, ArrowRight, X, ChevronRight 
} from 'lucide-react';
import Toast from '../common/Toast';
import { crmRepository } from '../../services/crmRepository';

export default function SearchResultsDashboard({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('hero_global_search_query') || '';
  });
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const inputRef = useRef(null);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('hero_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Extensive dataset matching requirements compiled dynamically
  const mockSearchData = useMemo(() => {
    const base = [
      // Loads
      { id: 'LD-9411', category: 'Loads', title: 'Load #LD-9411', desc: 'Chicago HQ ➔ Dallas Depot', status: 'In Transit', detail: 'Cargo: Industrial Machinery • Weight: 18,500 lbs • Driver: John D.', keys: 'machinery john d dallas chicago' },
      { id: 'LD-4022', category: 'Loads', title: 'Load #LD-4022', desc: 'Los Angeles Terminal ➔ Seattle Hub', status: 'Pending', detail: 'Cargo: Electronics Parts • Weight: 12,000 lbs • Driver: Sarah R.', keys: 'electronics sarah r seattle la' },
      { id: 'LD-7519', category: 'Loads', title: 'Load #LD-7519', desc: 'Atlanta Terminal ➔ Miami Port', status: 'Delivered', detail: 'Cargo: Fresh Produce • Temp: 3.5°C • Driver: Donald S.', keys: 'produce donald s miami atlanta' },
      
      // Drivers
      { id: 'DRV-01', category: 'Drivers', title: 'John D. (Driver)', desc: 'Active duty • CA-90 Route', status: 'On Duty', detail: 'ELD Hours: 6.5h worked • Truck: TX-ROAD88 • License: Class A Double/Triple', keys: 'john d active road88' },
      { id: 'DRV-02', category: 'Drivers', title: 'Sarah R. (Driver)', desc: 'Rest period • Los Angeles CA', status: 'Off Duty', detail: 'ELD Hours: 0h • Next shift starts: 8h • Medical Cert: Active', keys: 'sarah r off duty la' },
      { id: 'DRV-03', category: 'Drivers', title: 'Donald S. (Driver)', desc: 'Rest period • Atlanta GA', status: 'Off Duty', detail: 'ELD Hours: 2.0h • Vehicle: FL-HAUL99 • Medical Cert: Active', keys: 'donald s off duty atlanta' },
      
      // Vehicles
      { id: 'TX-ROAD88', category: 'Vehicles', title: 'Semi Truck TX-ROAD88', desc: 'Rego: 88A-92B • VIN: 1YV1HP82A81920', status: 'Active', detail: 'Status: Good • Maintenance: Next in 4,200 km • Odometer: 142,890 km', keys: '88a-92b 1yv1hp82a81920 road88' },
      { id: 'TR-4022', category: 'Vehicles', title: 'Reefer Trailer TR-4022', desc: 'Rego: 22X-91Y • Stock: STK-8820', status: 'Active', detail: 'Type: 53ft Refrigerated • Temp Sensor: Active • Temp: -18°C', keys: '22x-91y stk-8820 tr-4022' },
      
      // Customers
      { id: 'CUST-01', category: 'Customers', title: 'Global Retail Corp', desc: 'Account Type: Enterprise Shipper', status: 'Active', detail: 'Active Contracts: 3 • Billing Terms: Net-30 • Billing Suburb: 60601', keys: 'global retail 60601 chicago po-10294' },
      { id: 'CUST-02', category: 'Customers', title: 'Vance Refrigeration', desc: 'Account Type: Regional Shipper', status: 'Active', detail: 'Active Contracts: 1 • Billing Terms: Net-15 • Billing Suburb: 18505', keys: 'vance refrigeration' },
      
      // Warehouses
      { id: 'WH-CHI', category: 'Warehouses', title: 'Chicago HQ Terminal', desc: 'Address: 400 W Logistics Way, Chicago IL', status: 'Operating', detail: 'Capacity: 84% • Holding Bays: 12 • Active Staff: 18', keys: 'chicago hq terminal logistics' },
      { id: 'WH-DAL', category: 'Warehouses', title: 'Dallas Depot Terminal', desc: 'Address: 88 Logistics Blvd, Dallas TX', status: 'Operating', detail: 'Capacity: 62% • Holding Bays: 8 • Active Staff: 9', keys: 'dallas depot logistics' },
      
      // Invoices
      { id: 'INV-8812', category: 'Invoices', title: 'Invoice #INV-8812', desc: 'Shipper: Global Retail Corp', status: 'Paid', detail: 'Amount: $4,290.00 • Issue Date: 2026-06-10 • Paid: 2026-06-15', keys: 'inv-8812 global retail paid' },
      { id: 'INV-8813', category: 'Invoices', title: 'Invoice #INV-8813', desc: 'Shipper: Vance Refrigeration', status: 'Overdue', detail: 'Amount: $1,850.00 • Issue Date: 2026-05-20 • Balance Due: $1,850.00', keys: 'inv-8813 vance overdue' },
      
      // Transfers
      { id: 'TX-702', category: 'Transfers', title: 'Transfer Custody #TX-702', desc: 'Hero Logistics ➔ Super Freight Services', status: 'Completed', detail: 'Assets: Trailer TR-4022 • Gate: North Gate • Time: 2026-06-23 14:30', keys: 'tx-702 trailer custody super freight' }
    ];

    try {
      const crmData = crmRepository.getCrmDatabase();
      if (crmData.leads) {
        crmData.leads.forEach(l => {
          base.push({
            id: `LEAD-${l.id}`,
            category: 'Customers',
            title: `${l.company} (Lead)`,
            desc: `Contact: ${l.name} • Rep: ${l.rep} • Niche: ${l.niche}`,
            status: l.status,
            detail: `Email: ${l.email} • Phone: ${l.phone} • Fleet: ${l.fleetSize} Trucks • Stage: ${l.stage}`,
            keys: `${l.name} ${l.company} ${l.email} ${l.phone} lead`
          });
        });
      }
      if (crmData.proposals) {
        crmData.proposals.forEach(p => {
          base.push({
            id: `PROP-${p.id}`,
            category: 'Invoices',
            title: `${p.title} (Proposal)`,
            desc: `Proposed MRR: $${p.total.toLocaleString()} • Discount: ${p.discount}%`,
            status: p.status === 'Accepted' ? 'Paid' : 'Pending',
            detail: `Validity: ${p.validity} • Value: $${p.value.toLocaleString()} • Tax: ${p.tax}%`,
            keys: `${p.title} ${p.company} prop-${p.id} proposal`
          });
        });
      }
      if (crmData.demos) {
        crmData.demos.forEach(d => {
          base.push({
            id: `DEMO-${d.id}`,
            category: 'Loads',
            title: `Demo Scheduled with ${d.company}`,
            desc: `Presenter: ${d.presenter} • Date: ${d.date} at ${d.time}`,
            status: d.status,
            detail: `Meeting Link: ${d.meetingLink} • Timezone: ${d.timezone} • Notes: ${d.notes}`,
            keys: `${d.company} ${d.presenter} demo zoom`
          });
        });
      }
    } catch (e) {
      console.error('Error merging CRM data in search results', e);
    }
    return base;
  }, []);

  // Save query to localStorage to persist search text
  useEffect(() => {
    localStorage.setItem('hero_global_search_query', searchQuery);
  }, [searchQuery]);

  // Sync recent searches helper
  const addRecentSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(t => t !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('hero_recent_searches', JSON.stringify(updated));
  };

  const filteredResults = mockSearchData.filter(item => {
    const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.detail.toLowerCase().includes(q) ||
      item.keys.toLowerCase().includes(q)
    );
  });

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, activeFilter]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleAction(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      inputRef.current?.focus();
    }
  };

  const handleAction = (item) => {
    addRecentSearch(item.title);
    
    const isLead = item.id.startsWith('LEAD-');
    const isProposal = item.id.startsWith('PROP-');
    const isDemo = item.id.startsWith('DEMO-');
    
    if ((isLead || isProposal || isDemo) && setActiveTab) {
      let leadId = null;
      let subTab = 'Overview';
      
      const db = crmRepository.getCrmDatabase();
      
      if (isLead) {
        leadId = item.id.replace('LEAD-', '');
        subTab = 'Overview';
      } else if (isProposal) {
        const propId = item.id.replace('PROP-', '');
        const prop = db.proposals.find(p => String(p.id) === String(propId));
        leadId = prop ? prop.leadId : null;
        subTab = 'Proposals';
      } else if (isDemo) {
        const demoId = item.id.replace('DEMO-', '');
        const demo = db.demos.find(d => String(d.id) === String(demoId));
        leadId = demo ? demo.leadId : null;
        subTab = 'Demos';
      }
      
      if (leadId) {
        localStorage.setItem('hero_sales_selected_lead_id', String(leadId));
        localStorage.setItem('hero_sales_selected_lead_subtab', subTab);
        setActiveTab('leads');
        
        // Dispatch custom event for immediate response if already on the Leads dashboard
        window.dispatchEvent(new CustomEvent('hero-open-lead-drawer', {
          detail: { leadId, subTab }
        }));
        return;
      }
    }
    
    triggerToast(`Viewing details for ${item.title} (${item.id})`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Loads': return FileText;
      case 'Drivers': return Users;
      case 'Vehicles': return Truck;
      case 'Customers': return Briefcase;
      case 'Warehouses': return MapPin;
      case 'Invoices': return DollarSign;
      case 'Transfers': return ArrowLeftRight;
      default: return Search;
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Search className="h-6 w-6 text-brand-500" /> Enterprise Global Search
          </h2>
          <p className="text-xs text-slate-500">Search across Loads, Drivers, Vehicles, Customers, Warehouses, Invoices, and Custody Transfers.</p>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
        {/* Search Bar */}
        <div className="relative flex items-center gap-3">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search VIN/rego, driver name, invoice, transfer ID..."
            className="w-full pl-11 pr-12 py-3 bg-slate-50/60 border border-slate-200 hover:border-brand-500/30 text-slate-700 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories filters */}
        <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none text-[10px] font-black uppercase tracking-wider text-slate-500">
          {['All', 'Loads', 'Drivers', 'Vehicles', 'Customers', 'Warehouses', 'Invoices', 'Transfers'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer border ${
                activeFilter === f 
                  ? 'bg-brand-500 border-brand-500 text-slate-950 font-black' 
                  : 'bg-slate-900/40 border-slate-200 hover:bg-white text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="text-left flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-bold">
            <span>Recent searches:</span>
            {recentSearches.map((term, idx) => (
              <button 
                key={idx}
                onClick={() => setSearchQuery(term)}
                className="px-2.5 py-1 bg-slate-900/60 hover:bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors text-[10px] font-mono cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-200/45 pb-2">
          <span>Found {filteredResults.length} records</span>
          <span className="text-[10px] font-mono text-slate-500">Use ↑↓ keys and ↵ Enter to navigate</span>
        </div>

        <div className="space-y-2.5">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm font-semibold italic">
              No matching records resolved. Try searching other identifiers.
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const Icon = getCategoryIcon(item.category);
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => handleAction(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-brand-500/10 border-brand-500 shadow-md shadow-brand-500/5' 
                      : 'bg-white/40 border-slate-200 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      isSelected 
                        ? 'bg-brand-500/25 border-brand-500 text-brand-400' 
                        : 'bg-slate-900 border-slate-200 text-slate-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{item.title}</span>
                        <span className="text-[9px] font-mono font-bold bg-white/80 text-slate-500 px-2 py-0.5 rounded border border-slate-200/50 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.status === 'In Transit' || item.status === 'Active' || item.status === 'Operating' || item.status === 'On Duty'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'Overdue' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{item.desc}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{item.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button 
                      className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-md shadow-brand-500/10 font-black' 
                          : 'bg-white hover:bg-slate-700 text-slate-700 border border-slate-200'
                      }`}
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
