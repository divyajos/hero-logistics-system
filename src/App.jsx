import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import AuthPages from './components/AuthPages';
import OnboardingWizard from './components/OnboardingWizard';
import DashboardLayout from './layouts/DashboardLayout';

// Public Layout containing Navbar and Footer
function PublicLayout() {
  React.useEffect(() => {
    const root = window.document.documentElement;
    const wasLight = localStorage.getItem('theme') === 'light';
    
    // Force dark mode for the public landing website
    const timer = setTimeout(() => {
      root.classList.add('dark');
      root.classList.remove('light');
    }, 0);
    
    return () => {
      clearTimeout(timer);
      // Restore dashboard theme state when leaving public views
      if (wasLight) {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0B0F19] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

import { LogisticsProvider } from './context/LogisticsContext';

function App() {
  return (
    <AuthProvider>
      <LogisticsProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<AuthPages view="login" />} />
          <Route path="/register" element={<AuthPages view="register" />} />
          <Route path="/forgot-password" element={<AuthPages view="forgot-password" />} />
          <Route path="/reset-password" element={<AuthPages view="reset-password" />} />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={['Company Admin']}>
                <OnboardingWizard />
              </ProtectedRoute>
            }
          />

          {/* All 9 Dashboard Routes */}
          <Route
            path="/super-admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <DashboardLayout role="Super Admin" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Sales']}>
                <DashboardLayout role="Sales" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Company Admin']}>
                <DashboardLayout role="Company Admin" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispatch/*"
            element={
              <ProtectedRoute allowedRoles={['Dispatcher']}>
                <DashboardLayout role="Dispatcher" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Driver']}>
                <DashboardLayout role="Driver" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Warehouse Manager']}>
                <DashboardLayout role="Warehouse Manager" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/yard-attendant-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Yard Attendant']}>
                <DashboardLayout role="Yard Attendant" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Accounts']}>
                <DashboardLayout role="Accounts" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <DashboardLayout role="Customer" />
              </ProtectedRoute>
            }
          />

          {/* Legacy /dashboard fallback */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </LogisticsProvider>
    </AuthProvider>
  );
}

export default App;
