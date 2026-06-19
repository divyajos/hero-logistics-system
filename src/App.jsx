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
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routing */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPages view="login" />} />
            <Route path="/register" element={<AuthPages view="register" />} />
            <Route path="/forgot-password" element={<AuthPages view="forgot-password" />} />
            <Route path="/reset-password" element={<AuthPages view="reset-password" />} />
          </Route>

          {/* SaaS Onboarding protected for newly registered Company Admin */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute allowedRoles={['Company Admin']}>
                <OnboardingWizard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Dashboards Routing */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
