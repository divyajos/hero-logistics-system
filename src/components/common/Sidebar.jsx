import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Truck, Briefcase, FileText, Settings, 
  ShieldAlert, BarChart3, Navigation, Shield, LogOut, ChevronLeft, 
  ChevronRight, MapPin, Layers, Key, Home, HelpCircle, Calendar,
  Bell, FileSignature, DollarSign, Activity, AlertTriangle, QrCode, Cpu,
  MessageSquare, Clock, Plus
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
          { id: 'overview', label: 'Platform Dashboard', icon: LayoutDashboard },
          { id: 'companies', label: 'Companies', icon: Users },
          { id: 'subscriptions', label: 'Subscriptions', icon: Key },
          { id: 'plans', label: 'Membership Plans', icon: Layers },
          { id: 'feature-access', label: 'Feature Access', icon: Shield },
          { id: 'white-label', label: 'White Label', icon: Settings },
          { id: 'support', label: 'Support Tickets', icon: FileText },
          { id: 'billing', label: 'Billing', icon: DollarSign },
          { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
          { id: 'transfers', label: 'Inter-Company Transfers', icon: Activity },
          { id: 'ai-controls', label: 'AI Controls', icon: Cpu },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
      case 'Sales':
        return [
          { id: 'overview', label: 'Sales Dashboard', icon: LayoutDashboard },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'kanban', label: 'Pipeline Board', icon: Layers },
          { id: 'scheduler', label: 'Demo Bookings', icon: Calendar },
          { id: 'trials', label: 'Trial Companies', icon: Users },
          { id: 'proposals', label: 'Proposals', icon: FileText },
          { id: 'calendar', label: 'Follow-Ups', icon: Calendar },
          { id: 'onboarding', label: 'Onboarding Handover', icon: Briefcase },
          { id: 'reports', label: 'Sales Reports', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
      case 'Company Admin':
        return [
          { id: 'overview', label: 'Company Dashboard', icon: LayoutDashboard },
          { id: 'branches', label: 'Branches', icon: MapPin },
          { id: 'loads', label: 'Loads', icon: Layers },
          { id: 'dispatch', label: 'Dispatch', icon: Navigation },
          { id: 'customers', label: 'Customers', icon: Briefcase },
          { id: 'drivers', label: 'Drivers / Staff', icon: Users },
          { id: 'fleet', label: 'Vehicles', icon: Truck },
          { id: 'trailers', label: 'Trailers', icon: Layers },
          { id: 'warehouse-yard', label: 'Warehouse / Yard', icon: Home },
          { id: 'workforce', label: 'Workforce / Rostering', icon: Users },
          { id: 'availability', label: 'Availability / Leave', icon: Calendar },
          { id: 'accounts', label: 'Accounts', icon: DollarSign },
          { id: 'payroll', label: 'Payroll', icon: Users },
          { id: 'expenses', label: 'Expenses', icon: DollarSign },
          { id: 'assets', label: 'Asset Register', icon: Shield },
          { id: 'instructions', label: 'Customer Instructions', icon: FileText },
          { id: 'transfers', label: 'Inter-Company Transfers', icon: AlertTriangle },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'permissions', label: 'Permissions', icon: Key },
          { id: 'settings', label: 'Settings – Profile, Subscriptions', icon: Settings }
        ];
      case 'Dispatcher':
        return [
          { id: 'overview', label: 'Dispatch Dashboard', icon: LayoutDashboard },
          { id: 'create-load', label: 'Create Load', icon: Plus },
          { id: 'ai-inbox', label: 'Load Inbox', icon: QrCode },
          { id: 'active-loads', label: 'Active Loads', icon: Layers },
          { id: 'planning-board', label: 'Planning Board', icon: Layers },
          { id: 'tracking', label: 'Live GPS Map', icon: Navigation },
          { id: 'drivers', label: 'Drivers', icon: Users },
          { id: 'vehicles-trailers', label: 'Vehicles / Trailers', icon: Truck },
          { id: 'customers', label: 'Customers', icon: Briefcase },
          { id: 'yard-warehouse', label: 'Yard / Warehouse', icon: Home },
          { id: 'workforce-availability', label: 'Workforce Availability', icon: Calendar },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'reports', label: 'Reports', icon: BarChart3 }
        ];
      case 'Driver':
        return [
          { id: 'start-finish', label: 'Start Work / Finish Work', icon: Clock },
          { id: 'overview', label: 'Jobs', icon: LayoutDashboard },
          { id: 'nearby-services', label: 'Nearby Services', icon: MapPin },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'create-draft-load', label: 'Create Draft Load', icon: Plus },
          { id: 'add-expense', label: 'Add Expense', icon: DollarSign },
          { id: 'earnings', label: 'My Pay', icon: BarChart3 },
          { id: 'chat', label: 'Contact Dispatch', icon: MessageSquare },
          { id: 'leave-management', label: 'Leave Management', icon: Calendar },
          { id: 'incidents', label: 'Incident Reporting', icon: ShieldAlert },
          { id: 'maintenance', label: 'Maintenance Request', icon: Truck }
        ];
      case 'Warehouse Manager':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inbound', label: 'Inbound', icon: Bell },
          { id: 'outbound', label: 'Outbound', icon: Bell },
          { id: 'stock', label: 'Current Stock', icon: Layers },
          { id: 'yard-map', label: 'Yard / Warehouse Map', icon: MapPin },
          { id: 'holding-areas', label: 'Holding Areas', icon: Home },
          { id: 'load-lanes', label: 'Load Lanes', icon: Layers },
          { id: 'scanning', label: 'Scanning', icon: QrCode },
          { id: 'labels', label: 'Labels', icon: QrCode },
          { id: 'movements', label: 'Movements', icon: Activity },
          { id: 'reports', label: 'Reports', icon: BarChart3 }
        ];
      case 'Yard Attendant':
        return [
          { id: 'start-finish', label: 'Start Work / Finish Work', icon: Clock },
          { id: 'overview', label: 'Assigned tasks', icon: LayoutDashboard },
          { id: 'scan-btn', label: 'Scan button', icon: QrCode },
          { id: 'move-asset', label: 'Move item', icon: Truck },
          { id: 'scan-in', label: 'Scan into location', icon: QrCode },
          { id: 'scan-out', label: 'Scan out of location', icon: QrCode },
          { id: 'lane-assignment', label: 'Load lane assignment', icon: Layers },
          { id: 'inspections', label: 'Report issue', icon: AlertTriangle }
        ];
      case 'Accounts':
        return [
          { id: 'overview', label: 'Accounts Dashboard', icon: LayoutDashboard },
          { id: 'invoice-review', label: 'Invoice Review', icon: FileText },
          { id: 'sent-invoices', label: 'Sent Invoices', icon: FileText },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'payroll', label: 'Payroll', icon: Users },
          { id: 'contractor-pay', label: 'Contractor Pay', icon: DollarSign },
          { id: 'employee-pay', label: 'Employee Pay', icon: Users },
          { id: 'expenses', label: 'Expenses', icon: DollarSign },
          { id: 'tax', label: 'GST / PAYG', icon: FileText },
          { id: 'p-l', label: 'P&L', icon: BarChart3 },
          { id: 'profitability', label: 'Vehicle Costs', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: FileText }
        ];
      case 'Customer':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'my-loads', label: 'My Loads', icon: Layers },
          { id: 'tracking', label: 'Track Delivery', icon: Navigation },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'invoices', label: 'Invoices', icon: DollarSign },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'load-requests', label: 'Load Requests', icon: Plus },
          { id: 'support', label: 'Support', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings }
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
                <h5 className="text-xs font-extrabold text-white truncate">
                  {user.role === 'Super Admin' ? 'Role: Super Admin' : user.name}
                </h5>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                  {user.role === 'Super Admin' ? 'Platform Owner' : user.role}
                </span>
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
