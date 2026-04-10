import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import PatientSearch from './pages/PatientSearch';
import ChartPage from './pages/ChartPage';
import EPrescribe from './pages/EPrescribe';
import Telehealth from './pages/Telehealth';
import Inbox from './pages/Inbox';
import SmartPhrases from './pages/SmartPhrases';
import BTGAuditLog from './pages/BTGAuditLog';
import HealthAdminToolkit from './pages/HealthAdminToolkit';
import GoToSession from './pages/GoToSession';
import PatientChat from './pages/PatientChat';
import Analytics from './pages/Analytics';
import CareGaps from './pages/CareGaps';
import StaffMessaging from './pages/StaffMessaging';
import PatientPortalLogin from './pages/PatientPortalLogin';
import PatientPortal from './pages/PatientPortal';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <PatientProvider>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <Header />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </PatientProvider>
  );
}

function LoginRoute() {
  const { isAuthenticated, currentUser } = useAuth();
  if (isAuthenticated && currentUser?.role === 'patient') return <Navigate to="/patient-portal" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function PatientPortalLoginRoute() {
  const { isAuthenticated, currentUser } = useAuth();
  if (isAuthenticated && currentUser?.role === 'patient') return <Navigate to="/patient-portal" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <PatientPortalLogin />;
}

function PatientPortalRoute() {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return <Navigate to="/patient-portal-login" replace />;
  if (currentUser?.role !== 'patient') return <Navigate to="/dashboard" replace />;
  return (
    <PatientProvider>
      <PatientPortal />
    </PatientProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/EHR">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/patient-portal-login" element={<PatientPortalLoginRoute />} />
          <Route path="/patient-portal" element={<PatientPortalRoute />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/patients" element={<PatientSearch />} />
            <Route path="/chart/:patientId/:tab" element={<ChartPage />} />
            <Route path="/chart/:patientId" element={<Navigate to="summary" replace />} />
            <Route path="/prescribe" element={<EPrescribe />} />
            <Route path="/telehealth" element={<Telehealth />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/smart-phrases" element={<SmartPhrases />} />
            <Route path="/btg-audit" element={<BTGAuditLog />} />
            <Route path="/admin-toolkit" element={<HealthAdminToolkit />} />
            <Route path="/patient-chat" element={<PatientChat />} />
            <Route path="/session/:aptId" element={<GoToSession />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/care-gaps" element={<CareGaps />} />
            <Route path="/staff-messaging" element={<StaffMessaging />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
