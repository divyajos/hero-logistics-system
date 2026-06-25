import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import TopNavbar from '../components/common/TopNavbar';
import NotificationCenter from '../components/common/NotificationCenter';
import CommandCenter from '../components/common/CommandCenter';
import { useSelector } from 'react-redux';

import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';
import SalesDashboard from '../components/dashboards/SalesDashboard';
import CompanyAdminDashboard from '../components/dashboards/CompanyAdminDashboard';
import DispatchDashboard from '../components/dashboards/DispatchDashboard';
import DriverDashboard from '../components/dashboards/DriverDashboard';
import WarehouseDashboard from '../components/dashboards/WarehouseDashboard';
import YardAttendantDashboard from '../components/dashboards/YardAttendantDashboard';
import AccountsDashboard from '../components/dashboards/AccountsDashboard';
import CustomerDashboard from '../components/dashboards/CustomerDashboard';
import ReportsDashboard from '../components/dashboards/ReportsDashboard';
import AiCenterDashboard from '../components/dashboards/AiCenterDashboard';
import SettingsPanels from '../components/dashboards/SettingsPanels';
import SearchResultsDashboard from '../components/dashboards/SearchResultsDashboard';

export default function DashboardLayout({ role: roleProp }) {
  const { user } = useAuth();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!user) return null;

  // Use role from route prop, fallback to user.role
  const activeRole = roleProp || user.role;

  // Render role dashboard component
  const renderDashboard = (role, tab) => {
    if (tab === 'reports') return <ReportsDashboard activeTab={tab} />;
    if (tab === 'ai-center') return <AiCenterDashboard activeTab={tab} />;
    if (tab === 'settings') return <SettingsPanels activeTab={tab} />;
    if (tab === 'tax') return <AccountsDashboard activeTab={tab} />;
    if (tab === 'rates') return <AccountsDashboard activeTab={tab} />;
    if (tab === 'instructions') return <CompanyAdminDashboard activeTab={tab} />;
    if (tab === 'search-results') return <SearchResultsDashboard activeTab={tab} setActiveTab={setActiveTab} />;

    switch (role) {
      case 'Super Admin': return <SuperAdminDashboard activeTab={tab} setActiveTab={setActiveTab} />;
      case 'Sales': return <SalesDashboard activeTab={tab} />;
      case 'Company Admin': return <CompanyAdminDashboard activeTab={tab} />;
      case 'Dispatcher': return <DispatchDashboard activeTab={tab} />;
      case 'Driver': return <DriverDashboard activeTab={tab} />;
      case 'Warehouse Manager': return <WarehouseDashboard activeTab={tab} />;
      case 'Yard Attendant': return <YardAttendantDashboard activeTab={tab} />;
      case 'Accounts': return <AccountsDashboard activeTab={tab} />;
      case 'Customer': return <CustomerDashboard activeTab={tab} />;
      default:
        return <div className="p-8 text-center text-slate-400">Select a section from the sidebar.</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-slate-100">
      <CommandCenter setActiveTab={setActiveTab} />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-xs z-45 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <TopNavbar 
          onNotificationClick={() => setNotificationsOpen(!notificationsOpen)} 
          notificationCount={unreadCount}
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Global Notifications Tray */}
        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full animate-fade-in">
          {renderDashboard(activeRole, activeTab)}
        </main>
      </div>
    </div>
  );
}
