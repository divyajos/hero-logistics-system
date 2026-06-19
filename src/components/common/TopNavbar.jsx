import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, HelpCircle, ChevronDown, User, LogOut, Shield, Loader, FileText, Truck, ArrowRight, Sun, Moon, Menu } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';

export default function TopNavbar({ onNotificationClick, notificationCount = 3, onMenuClick }) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setSearchLoading(true);
      apiClient.get('search', { params: { q: searchQuery } })
        .then(response => {
          setSearchResults(response.data?.results || []);
          setSearchLoading(false);
        })
        .catch(err => {
          console.error('Search query failed:', err);
          setSearchLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!user) return null;

  return (
    <header className="bg-[#161F30] border-b border-[#23324C] h-16 flex items-center justify-between px-6 sticky top-0 z-35">
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
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
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
              <h5 className="text-xs font-bold text-slate-200 group-hover:text-white">{user.name}</h5>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">{user.role}</span>
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
