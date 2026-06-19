import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import TopNavbar from '../components/common/TopNavbar';
import NotificationCenter from '../components/common/NotificationCenter';
import CommandCenter from '../components/common/CommandCenter';
import { useSelector } from 'react-redux';

// Dashboards imports
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

export default function DashboardLayout() {
  const { user } = useAuth();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!user) return null;

  // Render role dashboard component
  const renderDashboardContent = (role, tab) => {
    if (tab === 'reports') return <ReportsDashboard activeTab={tab} />;

    switch (role) {
      case 'Super Admin':
        return <SuperAdminDashboard activeTab={tab} />;
      case 'Sales':
        return <SalesDashboard activeTab={tab} />;
      case 'Company Admin':
        return <CompanyAdminDashboard activeTab={tab} />;
      case 'Dispatcher':
        return <DispatchDashboard activeTab={tab} />;
      case 'Driver':
        return <DriverDashboard activeTab={tab} />;
      case 'Warehouse Manager':
        return <WarehouseDashboard activeTab={tab} />;
      case 'Yard Attendant':
        return <YardAttendantDashboard activeTab={tab} />;
      case 'Accounts':
        return <AccountsDashboard activeTab={tab} />;
      case 'Customer':
        return <CustomerDashboard activeTab={tab} />;
      default:
        return (
          <div className="p-8 text-center text-slate-400">
            Select an action from the navigation sidebar.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-slate-100">
      <CommandCenter setActiveTab={setActiveTab} />
      
      {/* Mobile Sidebar backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-xs z-39 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Nav */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <TopNavbar 
          onNotificationClick={() => setNotificationsOpen(!notificationsOpen)} 
          notificationCount={unreadCount}
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Global Notifications Tray */}
          <NotificationCenter
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />

        {/* Scrollable Body Canvas */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full animate-fade-in">
          {renderDashboardContent(user.role, activeTab)}
        </main>

      </div>
    </div>
  );
}
