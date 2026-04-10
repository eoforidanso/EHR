import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { inboxMessages, selectedPatient, appointments } = usePatient();
  const location = useLocation();
  const navigate = useNavigate();
  const [chartExpanded, setChartExpanded] = useState(true);

  const unreadCount = inboxMessages.filter(
    (m) => !m.read && (m.to === currentUser?.id || currentUser?.role === 'admin')
  ).length;

  const todayApptCount = appointments.filter(
    (a) => (a.provider === currentUser?.id || currentUser?.role === 'front_desk' || currentUser?.role === 'admin') && a.status !== 'Completed'
  ).length;

  const isPrescriber = currentUser?.role === 'prescriber';
  const isNurse = currentUser?.role === 'nurse';
  const isAdmin = currentUser?.role === 'admin';

  const initials = currentUser
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : '';

  const roleLabel = {
    prescriber: currentUser?.credentials || 'Prescriber',
    front_desk: 'Front Desk',
    nurse: 'Nurse / MA',
    admin: 'Administrator',
  };

  const navItem = (to, icon, label, badge) => (
    <li key={to}>
      <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="sidebar-nav-icon">{icon}</span>
        {label}
        {badge != null && badge > 0 && <span className="nav-badge">{badge}</span>}
      </NavLink>
    </li>
  );

  const chartActive = (seg) => location.pathname.includes(seg) ? 'active' : '';

  const chartLinks = [
    { key: 'summary',       icon: '📋', label: 'Chart Summary' },
    { key: 'encounters',    icon: '🗒️', label: 'Encounters' },
    { key: 'demographics',  icon: '👤', label: 'Demographics' },
    { key: 'allergies',     icon: '⚠️', label: 'Allergies' },
    { key: 'problems',      icon: '🩺', label: 'Problem List' },
    { key: 'vitals',        icon: '💓', label: 'Vitals' },
    { key: 'medications',   icon: '💊', label: 'Medications' },
    { key: 'orders',        icon: '📝', label: 'Orders' },
    { key: 'assessments',   icon: '📊', label: 'Assessments' },
    { key: 'immunizations', icon: '💉', label: 'Immunizations' },
    { key: 'labs',          icon: '🔬', label: 'Lab Results' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="logo-mark">🧠</div>
          <div className="logo-text">
            <h1>MindCare</h1>
            <span>Outpatient EHR</span>
          </div>
        </div>
      </div>

      {/* Active patient context */}
      {selectedPatient && (
        <div
          className="sidebar-patient-ctx"
          onClick={() => navigate(`/chart/${selectedPatient.id}/summary`)}
          title="Go to chart"
        >
          <div className="sidebar-patient-ctx-label">📌 Active Patient</div>
          <div className="sidebar-patient-ctx-name">
            {selectedPatient.lastName}, {selectedPatient.firstName}
          </div>
          <div className="sidebar-patient-ctx-detail">
            MRN {selectedPatient.mrn} · DOB {selectedPatient.dob}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Navigation</div>
        <ul className="sidebar-nav">
          {navItem('/dashboard', '📊', 'Dashboard')}
          {navItem('/schedule',  '📅', 'Schedule', todayApptCount)}
          {navItem('/inbox',     '📬', 'Clinical Inbox', unreadCount)}
          {navItem('/patients',  '🔍', 'Patient Search')}
        </ul>
      </div>

      {/* Chart - expandable */}
      {selectedPatient && (
        <div className="sidebar-section">
          <div
            className="sidebar-section-title"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
            onClick={() => setChartExpanded(!chartExpanded)}
          >
            <span>Chart</span>
            <span style={{ fontSize: 9, opacity: 0.6, transition: 'transform 0.15s' }}>
              {chartExpanded ? '▼' : '▶'}
            </span>
          </div>
          {chartExpanded && (
            <ul className="sidebar-nav">
              {chartLinks.map(({ key, icon, label }) => (
                <li key={key}>
                  <NavLink
                    to={`/chart/${selectedPatient.id}/${key}`}
                    className={chartActive(`/${key}`)}
                  >
                    <span className="sidebar-nav-icon">{icon}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Clinical Tools */}
      {(isPrescriber || isNurse) && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">Clinical Tools</div>
          <ul className="sidebar-nav">
            {navItem('/telehealth',   '📹', 'Telehealth')}
            {isPrescriber && navItem('/prescribe', '💊', 'E-Prescribe')}
            {navItem('/smart-phrases','⚡', 'Smart Phrases')}
            {navItem('/patient-chat', '💬', 'Patient Chat')}
          </ul>
        </div>
      )}

      {/* Admin Toolkit — all roles */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Administration</div>
        <ul className="sidebar-nav">
          {navItem('/admin-toolkit','🗂️', 'Admin Toolkit')}
          {isAdmin && navItem('/btg-audit', '🔓', 'BTG Audit Log')}
        </ul>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">
              {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <div className="sidebar-user-role">
              {roleLabel[currentUser?.role] || currentUser?.role}
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-sign-out"
            title="Sign Out"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
