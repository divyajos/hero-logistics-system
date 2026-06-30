import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, Package, Network, Briefcase, DollarSign, 
  Shield, MessageSquare, Settings, LogOut, ChevronDown, 
  ChevronRight, Crosshair
} from 'lucide-react';
import heroLogo from '../../assets/hero.png';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // 👇 Change these values to resize the sidebar
  const SIDEBAR_WIDTH = "w-64";        // expanded width
  const SIDEBAR_WIDTH_COLLAPSED = "w-16"; // collapsed width
  const LOGO_WIDTH = "6.5rem";          // logo size
  
  const [openMenus, setOpenMenus] = useState({
    operations: true,
    settings: true
  });

  if (!user) return null;

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutGrid },
    { id: 'loads', label: 'Loads', icon: Package },
    { id: 'vehicles', label: 'Vehicles', icon: Network },
    { 
      id: 'operations', 
      label: 'Operations', 
      icon: Briefcase,
      subItems: [
        { id: 'branches', label: 'Branches' },
        { id: 'drivers', label: 'Drivers' },
        { id: 'customers', label: 'Customers' },
        { id: 'asset-inventory', label: 'Asset Inventory' },
        { id: 'safety-checklists', label: 'Safety Checklists' },
        { id: 'delivery-issues', label: 'Delivery Issues' },
      ]
    },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'user-roles', label: 'User Roles', icon: Shield },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      subItems: [
        { id: 'company-settings', label: 'Company Settings' },
        { id: 'subscription-billing', label: 'Subscription & Billing' },
        { id: 'my-profile', label: 'My Profile' },
      ]
    }
  ];

  return (
    <aside className={`
      bg-[#0F0F0F] border-r border-[#1F1F1F] h-screen flex flex-col justify-between
      fixed md:sticky top-0 bottom-0 left-0 transition-all duration-300 z-50 select-none
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      ${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
    `}>
      
      <div className="flex flex-col h-full overflow-hidden bg-[#0F0F0F]">
        
        {/* Top Header/Logo Area */}
        <div className="flex flex-col items-start justify-center pt-5 pb-3.5 pl-3.5 pr-4.5 relative bg-[#0F0F0F] flex-shrink-0">
          <img 
            src={heroLogo} 
            alt="Hero Logo" 
            style={{ width: collapsed ? '2.25rem' : LOGO_WIDTH }}
            className="object-contain transition-all duration-300"
          />

       
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-3 top-5 p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : null}
          </button>
          
          {!collapsed && (
            <div className="flex items-center text-[#FF5A00] uppercase tracking-[0.2em] font-bold text-[10px] mt-3">
              <Crosshair className="w-2 h-2 mr-1" strokeWidth={1.5} />
              <span>ADMIN PORTAL</span>
            </div>
          )}
        </div>

        <div className="border-b border-[#1F1F1F]/60 mx-4 flex-shrink-0"></div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-0.5 flex-grow overflow-y-auto bg-[#0F0F0F] scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isMainActive = activeTab === item.id;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isMenuOpen = openMenus[item.id];
            
            const hasActiveChild = hasSubItems && item.subItems.some(sub => activeTab === sub.id);
            
            return (
              <div key={item.id} className="flex flex-col bg-[#0F0F0F] mb-1">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      toggleMenu(item.id);
                    } else {
                      setActiveTab(item.id);
                      if (setMobileOpen) setMobileOpen(false);
                    }
                  }}
                  className={`group w-full flex items-center justify-between p-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer ${
                    isMainActive && !hasSubItems
                      ? 'bg-gradient-to-r from-yellow-400/10 to-[#ffa726]/5 border-l-4 border-yellow-400 text-yellow-400 font-semibold shadow-xs' 
                      : hasActiveChild
                        ? 'sidebar-link-white font-semibold'
                        : 'sidebar-link-gray font-medium hover:bg-white/5 hover:sidebar-link-white rounded-xl'
                  }`}
                  style={{
                    backgroundColor: isMainActive && !hasSubItems ? 'rgba(250, 204, 21, 0.08)' : 'transparent',
                    borderColor: isMainActive && !hasSubItems ? '#facc15' : 'transparent'
                  }}
                >
                  <div className="flex items-center">
                    <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      (isMainActive && !hasSubItems) 
                        ? 'text-yellow-400' 
                        : hasActiveChild 
                          ? 'text-[#FF8A00]' 
                          : 'sidebar-link-gray group-hover:sidebar-link-white'
                    }`} />
                    {!collapsed && <span className="ml-3 tracking-wide">{item.label}</span>}
                  </div>
                  
                  {!collapsed && hasSubItems && (
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 text-[#8ba3b8] opacity-75 ${isMenuOpen ? '' : '-rotate-90'}`} />
                  )}
                </button>

                {/* Sub-menu Items Wrapper */}
                {!collapsed && hasSubItems && isMenuOpen && (
                  <div className="mt-1 mb-1 pl-4 flex flex-col space-y-1 bg-[#0F0F0F] border-l border-white/10 ml-5.5">
                    {item.subItems.map((subItem) => {
                      const isSubActive = activeTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setActiveTab(subItem.id);
                            if (setMobileOpen) setMobileOpen(false);
                          }}
                          className={`w-full text-left pl-4 py-2 pr-3 rounded-lg text-[13px] flex items-center gap-2 transition-all duration-300 cursor-pointer border border-transparent focus:outline-none ${
                            isSubActive
                              ? 'text-yellow-400 font-semibold bg-white/5'
                              : 'sidebar-link-gray font-medium hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {/* Premium Bullet Indicator */}
                          <span 
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              isSubActive 
                                ? 'bg-yellow-400 scale-125 shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                                : 'bg-white/30 group-hover:bg-white/60'
                            }`}
                          />
                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign Out Area */}
      <div className="border-t border-[#1F1F1F] p-4 bg-[#0F0F0F] flex-shrink-0">
        {!collapsed ? (
          <button 
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded-lg transition-colors cursor-pointer font-bold tracking-wide text-sm"
          >
            <LogOut className="h-5 w-5 mr-3" />
            SIGN OUT
          </button>
        ) : (
          <button 
            onClick={logout}
            className="mx-auto flex justify-center p-2 text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

    </aside>
  );
}