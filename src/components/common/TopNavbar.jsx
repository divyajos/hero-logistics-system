import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, HelpCircle, ChevronDown, User, LogOut, Shield, Loader, FileText, Truck, ArrowRight, Sun, Moon, Menu, Clock, Briefcase } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLogistics } from '../../context/LogisticsContext';

export default function TopNavbar({ onNotificationClick, notificationCount = 3, onMenuClick, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
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

  // Format shift elapsed timer HH:MM:SS
  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

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
      
      // Add to recent searches
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

  return (
    <header className="bg-[#161F30] border-b border-[#23324C] h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Mobile Sidebar Hamburger Toggle */}
      <button
        onClick={onMenuClick}
        className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden mr-2 transition-all cursor-pointer flex items-center justify-center"
        title="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search Header Bar */}
      <div className="flex-grow max-w-md hidden md:block relative">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            {searchLoading ? (
              <Loader className="h-4 w-4 animate-spin text-brand-400" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
            placeholder="Search loads, drivers, or fleet plates..."
            className="w-full pl-9 pr-4 py-2 bg-[#0B0F19]/50 border border-[#23324C] hover:border-brand-500/30 text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-500 font-sans"
          />
        </div>

        {/* Global Search Results Dropdown Dropdown */}
        {searchFocused && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-[#161F30] border border-[#23324C] rounded-2xl shadow-2xl py-3 z-50 animate-fade-in text-xs space-y-1 max-h-80 overflow-y-auto">
            <div className="px-4 pb-2 border-b border-[#23324C]/60 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Search Results</span>
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
                          : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
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

      <div className="flex-1 md:hidden"></div>

      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        {/* Niche Selector */}
        {user.role !== 'Super Admin' && (
          <div className="flex items-center space-x-1.5 bg-[#0B0F19]/40 border border-[#23324C] rounded-xl px-2.5 py-1.5">
            <Briefcase className="h-3.5 w-3.5 text-brand-400" />
            <select 
              value={selectedNiche} 
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="bg-transparent text-slate-300 text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              <option value="car_carrying" className="bg-[#161F30]">🚗 Car Carrying</option>
              <option value="general_freight" className="bg-[#161F30]">📦 General Freight</option>
              <option value="dangerous_goods" className="bg-[#161F30]">☣️ Dangerous Goods</option>
            </select>
          </div>
        )}

        {/* Start / Finish Work Widget */}
        {user.role !== 'Super Admin' && (
          <div className="flex items-center space-x-2">
            {shiftState.isWorking ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl">
                <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-mono font-bold">
                  {formatTimer(shiftState.totalSeconds)}
                </span>
                <button 
                  onClick={() => finishWork(user.role)}
                  className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-extrabold transition-colors cursor-pointer"
                >
                  Finish Work
                </button>
              </div>
            ) : (
              <button 
                onClick={() => startWork(user.role)}
                className="bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-brand-500/10"
              >
                <Clock className="h-3.5 w-3.5" />
                Start Work
              </button>
            )}
          </div>
        )}

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-indigo-400" />
          )}
        </button>

        {/* Help docs link */}
        <a 
          href="#docs" 
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl transition-all hidden sm:block"
          title="Documentation"
        >
          <HelpCircle className="h-4.5 w-4.5" />
        </a>

        {/* Notifications Trigger */}
        <button
          onClick={onNotificationClick}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl relative transition-all cursor-pointer"
          title="System Logs"
        >
          <Bell className="h-4.5 w-4.5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 border-2 border-[#161F30] rounded-full"></span>
          )}
        </button>

        <div className="h-5 w-[1px] bg-[#23324C]"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 text-left cursor-pointer group p-1.5 hover:bg-slate-800/30 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <h5 className="text-xs font-bold text-slate-200 group-hover:text-white">
                {user.role === 'Super Admin' ? 'Role: Super Admin' : user.name}
              </h5>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">
                {user.role === 'Super Admin' ? 'Platform Owner' : user.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
          </button>

          {profileOpen && (
            <>
              {/* Overlay to close profile */}
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
              
              <div className="absolute right-0 mt-2.5 w-52 bg-[#161F30] border border-[#23324C] rounded-xl shadow-xl shadow-black/40 py-2.5 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2 border-b border-[#23324C]/60 mb-2">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">My Workspace</span>
                  <span className="text-slate-300 font-semibold truncate block">{user.company}</span>
                </div>

                <a 
                  href="#profile" 
                  onClick={(e) => { e.preventDefault(); setProfileOpen(false); }}
                  className="flex items-center px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <User className="h-4 w-4 mr-2.5 text-slate-500" />
                  My Settings
                </a>
                
                <a 
                  href="#security" 
                  onClick={(e) => { e.preventDefault(); setProfileOpen(false); }}
                  className="flex items-center px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-2.5 text-slate-500" />
                  2FA & Auditing
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
