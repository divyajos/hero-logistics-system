import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, HelpCircle, ChevronDown, User, LogOut, Shield, Loader, FileText, Truck, ArrowRight, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLogistics } from '../../context/LogisticsContext';

export default function TopNavbar({ onNotificationClick, notificationCount = 3, onMenuClick, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { 
    selectedNiche, 
    setSelectedNiche, 
    shiftState, 
    startWork, 
    finishWork 
  } = useLogistics();

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Client-side search data covering all requirements.txt specs
  const mockSearchData = [
    { type: 'Load', title: 'LD-9411', desc: 'Chicago ➔ Dallas (Scheduled)', keys: ['ld-9411', 'dallas', 'chicago', 'john d.'] },
    { type: 'Load', title: 'LD-4022', desc: 'Los Angeles ➔ Seattle (Transit)', keys: ['ld-4022', 'seattle', 'la', 'sarah r.'] },
    { type: 'Vehicle', title: 'Truck TX-ROAD88', desc: 'Rego: 88A-92B • VIN: 1YV1HP82A81920', keys: ['rego: 88a-92b', 'vin: 1yv1hp82a81920', 'tx-road88', '1yv1hp82a81920', '88a-92b'] },
    { type: 'Vehicle', title: 'Trailer TR-4022', desc: 'Rego: 22X-91Y • Stock: STK-8820', keys: ['rego: 22x-91y', 'stk-8820', 'tr-4022', '22x-91y', 'stk-8820'] },
    { type: 'Customer', title: 'Global Retail Corp', desc: 'Ref: PO-10294 • Suburb: 60601', keys: ['global retail', 'po-10294', '60601', 'chicago'] },
    { type: 'Driver', title: 'John D.', desc: 'Active • Location: Memphis TN', keys: ['john d.', 'memphis', 'active'] },
    { type: 'Driver', title: 'Sarah R.', desc: 'Off-Duty • Location: Los Angeles CA', keys: ['sarah r.', 'la', 'off-duty'] }
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const q = searchQuery.toLowerCase().trim();
      const matches = mockSearchData.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) ||
        item.keys.some(k => k.toLowerCase().includes(q))
      );
      setSearchResults(matches);
      setSearchLoading(false);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    if (setActiveTab) {
      localStorage.setItem('hero_global_search_query', searchQuery);
      setActiveTab('search-results');
      setSearchFocused(false);
    }
  };

  const handleSelectResult = (title) => {
    if (setActiveTab) {
      localStorage.setItem('hero_global_search_query', title);
      
      try {
        const saved = localStorage.getItem('hero_recent_searches');
        const recent = saved ? JSON.parse(saved) : [];
        const updated = [title, ...recent.filter(t => t !== title)].slice(0, 5);
        localStorage.setItem('hero_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      setActiveTab('search-results');
      setSearchFocused(false);
    }
  };

  if (!user) return null;

  const isDispatcher = user.role === 'Dispatcher';
  const displayInitials = isDispatcher ? 'SM' : (user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U');

  return (
    <header className="bg-white border-b border-slate-200/80 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden mr-2 transition-all cursor-pointer flex items-center justify-center"
          title="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isDispatcher ? (
          <div className="text-left select-none animate-fade-in hidden md:block">
            <span className="text-[9px] text-gray-405 font-bold tracking-widest uppercase block leading-none">
              DISPATCHER
            </span>
            <span className="text-xs text-gray-950 font-black tracking-widest uppercase block mt-1">
              LIVE DISPATCH OPERATIONS
            </span>
          </div>
        ) : (
          <div className="text-left font-black tracking-wide text-xs text-slate-700 select-none">
            {user.company || 'HERO LOGISTICS'}
          </div>
        )}
      </div>

      {/* Middle: Centered Search Input */}
      <div className="flex-grow max-w-sm mx-4 relative">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            {searchLoading ? (
              <Loader className="h-3.5 w-3.5 animate-spin text-[#FFB200]" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
            placeholder={isDispatcher ? "Quick Search..." : "Search loads, drivers, or fleet plates..."}
            className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FFB200] text-slate-800 text-xs rounded-xl focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-medium font-sans"
          />
          {isDispatcher && (
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] font-black text-gray-400 bg-white border border-gray-200/80 px-1.5 py-0.5 rounded-md my-2">
              ⌘ K
            </span>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {searchFocused && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-[#161F30] border border-[#23324C] rounded-2xl shadow-2xl py-3 z-50 animate-fade-in text-xs space-y-1 max-h-80 overflow-y-auto">
            <div className="px-4 pb-2 border-b border-[#23324C]/60 flex justify-between items-center">
              <span className="text-[10px] text-slate-550 uppercase font-black tracking-wider">Search Results</span>
              <span className="text-[9px] text-slate-400 font-mono">{searchResults.length} matches</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400 text-[11px]">
                No matching logistics files resolved.
              </div>
            ) : (
              <div className="divide-y divide-[#23324C]/30">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectResult(item.title)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#0B0F19]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.type === 'Vehicle' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-[#FFB200]/10 text-[#FFB200] border border-[#FFB200]/20'
                      }`}>
                        {item.type === 'Vehicle' ? <Truck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-white block">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center space-x-3.5">
        
        {/* Help Link */}
        <a 
          href="#docs" 
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all hidden sm:block"
          title="Documentation"
        >
          <HelpCircle className="h-4.5 w-4.5" />
        </a>

        {/* Notifications Trigger */}
        <button
          onClick={onNotificationClick}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl relative transition-all cursor-pointer"
          title="System Logs"
        >
          <Bell className="h-4.5 w-4.5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FFB200] border-2 border-white rounded-full"></span>
          )}
        </button>

        <div className="h-5 w-[1px] bg-slate-200"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 text-left cursor-pointer group p-1 hover:bg-slate-50 rounded-xl transition-all"
          >
            {isDispatcher ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-wider">
                    SARAH MITCHELL
                  </h5>
                  <span className="text-[9px] text-slate-500 font-extrabold tracking-wider block mt-0.5">
                    DISPATCHER
                  </span>
                </div>
                <div className="w-8.5 h-8.5 rounded-full bg-[#FFB200] text-black flex items-center justify-center font-extrabold text-xs shadow-sm hover:scale-105 transition-transform">
                  {displayInitials}
                </div>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-[#FFB200]/10 border border-[#FFB200]/20 text-[#FFB200] flex items-center justify-center font-bold text-xs">
                  {displayInitials.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <h5 className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
                    {user.role === 'Super Admin' ? 'Role: Super Admin' : user.name}
                  </h5>
                  <span className="text-[9px] text-slate-550 font-semibold uppercase">
                    {user.role === 'Super Admin' ? 'Platform Owner' : user.role}
                  </span>
                </div>
              </>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-650 transition-transform" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-52 bg-[#161F30] border border-[#23324C] rounded-xl shadow-xl shadow-black/40 py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2 border-b border-[#23324C]/60 mb-2">
                  <span className="text-slate-550 font-bold block text-[10px] uppercase">My Workspace</span>
                  <span className="text-slate-300 font-semibold truncate block">{user.company}</span>
                </div>

                <a 
                  href="#profile" 
                  onClick={(e) => { e.preventDefault(); setProfileOpen(false); if (setActiveTab) setActiveTab('profile'); }}
                  className="flex items-center px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <User className="h-4 w-4 mr-2.5 text-slate-550" />
                  My Profile
                </a>
                
                <a 
                  href="#settings" 
                  onClick={(e) => { e.preventDefault(); setProfileOpen(false); if (setActiveTab) setActiveTab('company-settings'); }}
                  className="flex items-center px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-2.5 text-slate-550" />
                  Company Settings
                </a>

                <div className="border-t border-[#23324C]/60 my-2"></div>
                
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2.5" />
                  Log Out Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
