import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Truck, Users, Compass, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CommandCenter({ setActiveTab }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);

  // Toggle command palette on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!user) return null;

  // Search items database
  const pages = [
    { id: 'overview', title: 'Overview Dashboard', category: 'Pages' },
    { id: 'companies', title: 'Provisioned Companies Directory', category: 'Pages', role: 'Super Admin' },
    { id: 'plans', title: 'Edit Licensing & Plans', category: 'Pages', role: 'Super Admin' },
    { id: 'white-label', title: 'White Label Theme Settings', category: 'Pages', role: 'Super Admin' },
    { id: 'analytics', title: 'System Health & Analytics', category: 'Pages', role: 'Super Admin' },
    { id: 'support', title: 'Customer Support Tickets Panel', category: 'Pages', role: 'Super Admin' },
    { id: 'leads', title: 'Sales Leads CRM CRM', category: 'Pages', role: 'Sales' },
    { id: 'kanban', title: 'Pipeline Kanban Board View', category: 'Pages', role: 'Sales' },
    { id: 'loads', title: 'Loads Management desk', category: 'Pages', role: 'Dispatcher' },
    { id: 'planning-board', title: 'Carrier Planning Board', category: 'Pages', role: 'Dispatcher' },
    { id: 'route-planner', title: 'Route GIS Optimal Planner', category: 'Pages', role: 'Dispatcher' },
    { id: 'tracking', title: 'Active Driver live GPS tracks', category: 'Pages', role: 'Dispatcher' },
    { id: 'inbound', title: 'Warehouse Inbound Receiving Queue', category: 'Pages', role: 'Warehouse Manager' },
    { id: 'stock', title: 'Warehouse Stock Ledger inventory', category: 'Pages', role: 'Warehouse Manager' },
    { id: 'yard-map', title: 'Yard Dock Spotting Map Layout', category: 'Pages', role: 'Warehouse Manager' },
    { id: 'invoices', title: 'Accounts Shipper billing invoices', category: 'Pages', role: 'Accounts' },
    { id: 'payroll', title: 'Accounts Driver payout runs', category: 'Pages', role: 'Accounts' }
  ].filter(p => !p.role || p.role === user.role);

  const dataRecords = [
    { id: 'sarah', title: 'Sarah R. (Driver - Active Route CA-90)', category: 'Drivers', icon: Users },
    { id: 'john', title: 'John D. (Driver - ELD Hours: 2.5h)', category: 'Drivers', icon: Users },
    { id: 'donald', title: 'Donald S. (Driver - Off-Duty)', category: 'Drivers', icon: Users },
    { id: 'vance', title: 'Vance Refrigeration (Acquired Client)', category: 'Customers', icon: Users },
    { id: 'dunder', title: 'Dunder Mifflin Paper Co. (Active Client)', category: 'Customers', icon: Users },
    { id: 'initech', title: 'Initech Corp (Trial Shipper Tenant)', category: 'Customers', icon: Users },
    { id: 'ld9411', title: 'Load #LD-9411 (Cargo: Machinery - Transit)', category: 'Loads', icon: FileText },
    { id: 'ld4822', title: 'Load #LD-4822 (Cargo: Paper roll - Delivered)', category: 'Loads', icon: FileText },
    { id: 'ld7519', title: 'Load #LD-7519 (Cargo: Electronics - Pending)', category: 'Loads', icon: FileText },
    { id: 'tx88', title: 'Semi Truck CA-ROAD88 (Plate CA88-TX)', category: 'Vehicles', icon: Truck },
    { id: 'ca77', title: 'Reefer Trailer TR-HAUL77 (Temps monitored)', category: 'Vehicles', icon: Truck }
  ];

  const searchItems = [...pages, ...dataRecords];

  // Fuzzy filter results matching search text
  const filteredResults = searchItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  }).slice(0, 8);

  const handleSelect = (item) => {
    if (item.category === 'Pages') {
      setActiveTab(item.id);
    } else {
      alert(`Inspecting database record: ${item.title}`);
    }
    setIsOpen(false);
  };

  // Keyboard navigation listeners
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0F19]/80 dark:bg-black/75 backdrop-blur-xs transition-opacity" 
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Main Command Box Panel */}
      <div className="bg-white dark:bg-[#161F30] border border-slate-200 dark:border-[#23324C] rounded-2xl w-full max-w-xl shadow-2xl relative z-10 animate-fade-in overflow-hidden">
        
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-[#23324C]/60 bg-slate-50 dark:bg-[#0f1624]/40">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search record (e.g. loads, drivers, vehicles)..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <span className="text-[10px] font-bold font-mono text-slate-400 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-lg select-none flex-shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="p-2.5 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/20">
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
              No matching records resolved.
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const CategoryIcon = item.icon || Compass;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer select-none gap-4 ${
                    isSelected 
                      ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/15' 
                      : 'hover:bg-slate-50 dark:hover:bg-[#0b0f19]/40 text-slate-700 dark:text-slate-300'
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className={`h-4.5 w-4.5 flex-shrink-0 ${
                      isSelected ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'
                    }`} />
                    <div className="text-xs">
                      <span className="font-extrabold block leading-tight">{item.title}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected 
                      ? 'bg-slate-950/15 text-slate-950' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Shortcuts Hints Footer */}
        <div className="border-t border-slate-200 dark:border-[#23324C]/60 bg-slate-50 dark:bg-[#0f1624]/40 p-3 px-4 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 select-none font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Ctrl + K Toggle Palette</span>
        </div>

      </div>
    </div>
  );
}
