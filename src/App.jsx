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
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
