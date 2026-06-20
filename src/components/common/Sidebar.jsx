import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Truck, Briefcase, FileText, Settings, 
  ShieldAlert, BarChart3, Navigation, Shield, LogOut, ChevronLeft, 
  ChevronRight, MapPin, Layers, Key, Home, HelpCircle, Calendar,
  Bell, FileSignature, DollarSign, Activity, AlertTriangle, QrCode
} from 'lucide-react';
import heroLogo from '../../assets/hero.png';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  // Determine menu items by role matching Phase 4A roadmap
  const getMenuItems = (role) => {
    switch (role) {
      case 'Super Admin':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'companies', label: 'Companies', icon: Users },
          { id: 'plans', label: 'Subscription Plans', icon: Layers },
          { id: 'white-label', label: 'White Label', icon: Settings },
          { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
          { id: 'reports', label: 'Reports Center', icon: FileText },
          { id: 'support', label: 'Support Tickets', icon: FileText }
        ];
      case 'Sales':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'leads', label: 'Lead List', icon: Users },
          { id: 'kanban', label: 'Pipeline Kanban', icon: Layers },
          { id: 'scheduler', label: 'Demo Scheduler', icon: Calendar },
          { id: 'calendar', label: 'Follow-Up Calendar', icon: Calendar },
          { id: 'reports', label: 'Sales Reports', icon: BarChart3 }
        ];
      case 'Company Admin':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'branches', label: 'Branches Setup', icon: MapPin },
          { id: 'customers', label: 'Customers', icon: Briefcase },
          { id: 'drivers', label: 'Driver Registry', icon: Users },
          { id: 'fleet', label: 'Fleet Register', icon: Truck },
          { id: 'trailers', label: 'Trailer Spots', icon: Layers },
          { id: 'workforce', label: 'Workforce Leaves', icon: Users },
          { id: 'assets', label: 'Asset Register', icon: Shield },
          { id: 'reports', label: 'Reports Center', icon: BarChart3 }
        ];
      case 'Dispatcher':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'loads', label: 'Loads Control', icon: Layers },
          { id: 'planning-board', label: 'Planning Board', icon: Layers },
          { id: 'route-planner', label: 'Route Planner', icon: Navigation },
          { id: 'calendar', label: 'Dispatch Calendar', icon: Calendar },
          { id: 'tracking', label: 'Live Tracking', icon: Navigation }
        ];
      case 'Driver':
        return [
          { id: 'overview', label: 'My Loads', icon: LayoutDashboard },
          { id: 'pickup-delivery', label: 'Pickup & Delivery', icon: Navigation },
          { id: 'pod', label: 'POD Upload', icon: FileSignature },
          { id: 'expenses', label: 'Toll Expenses', icon: DollarSign },
          { id: 'compliance', label: 'Compliance Forms', icon: Shield },
          { id: 'earnings', label: 'My Earnings', icon: BarChart3 }
        ];
      case 'Warehouse Manager':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inbound', label: 'Inbound Queue', icon: Bell },
          { id: 'outbound', label: 'Outbound Queue', icon: Bell },
          { id: 'stock', label: 'Current Stock', icon: Layers },
          { id: 'yard-map', label: 'Yard Map', icon: MapPin },
          { id: 'load-lanes', label: 'Load Lanes', icon: Layers }
        ];
      case 'Yard Attendant':
        return [
          { id: 'overview', label: 'Task Queue', icon: LayoutDashboard },
          { id: 'move-asset', label: 'Move Asset', icon: Truck },
          { id: 'scan', label: 'Gate Scan In/Out', icon: QrCode },
          { id: 'inspections', label: 'Damage Reports', icon: AlertTriangle }
        ];
      case 'Accounts':
        return [
          { id: 'overview', label: 'Ledger Dashboard', icon: LayoutDashboard },
          { id: 'invoices', label: 'Shipper Invoices', icon: FileText },
          { id: 'payroll', label: 'Driver Payroll', icon: Users },
          { id: 'expenses', label: 'Expenses Manager', icon: DollarSign },
          { id: 'profitability', label: 'Vehicle Margins', icon: BarChart3 },
          { id: 'reports', label: 'Reports Center', icon: FileText }
        ];
      case 'Customer':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'my-loads', label: 'My Loads', icon: Layers },
          { id: 'tracking', label: 'Live Tracking', icon: Navigation },
          { id: 'documents', label: 'Documents Center', icon: FileText },
          { id: 'invoices', label: 'Invoices & Bills', icon: DollarSign },
          { id: 'support', label: 'Support Tickets', icon: FileText }
        ];
      default:
        return [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const menuItems = getMenuItems(user.role);

  return (
    <aside className={`
      bg-[#1F1F1F] border-r border-[#2E2E2E] h-screen flex flex-col justify-between
      fixed md:sticky top-0 bottom-0 left-0 transition-all duration-300 z-50
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      
      {/* Top Brand Logo */}
      <div>
        <div className="flex items-center justify-between p-4.5 border-b border-[#2E2E2E]/60 h-16">
          <div className="flex items-center overflow-hidden">
            <div className="mr-3 px-2 py-1 bg-neutral-900 border border-[#2E2E2E] rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 transition-transform duration-300">
              <img src={heroLogo} alt="Hero Logistics Logo" className="h-8 w-auto object-contain" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-md tracking-tight text-white whitespace-nowrap animate-fade-in">
                HERO<span className="text-brand-500 font-medium">LOGISTICS</span>
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="p-3.5 space-y-1.5 flex-grow overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`w-full flex items-center p-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-brand-500 text-slate-950 font-black shadow-lg shadow-brand-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!collapsed && <span className="ml-3 animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Details */}
      <div className="border-t border-[#23324C]/60 p-3.5 bg-[#0f1624]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center font-bold text-sm text-brand-400 flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden animate-fade-in">
                <h5 className="text-xs font-extrabold text-white truncate">{user.name}</h5>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">{user.role}</span>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-500/15 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

    </aside>
  );
}
