import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { appointments, inboxMessages, patients, selectPatient, updateAppointmentStatus } = usePatient();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todayAppts = useMemo(() => appointments.filter(
    (a) => a.provider === currentUser?.id || currentUser?.role === 'front_desk' || currentUser?.role === 'admin'
  ), [appointments, currentUser]);

  const myUnread = useMemo(() => inboxMessages.filter(
    (m) => !m.read && (m.to === currentUser?.id || currentUser?.role === 'admin')
  ), [inboxMessages, currentUser]);

  const checkedIn     = todayAppts.filter((a) => a.status === 'Checked In').length;
  const inProgress    = todayAppts.filter((a) => a.status === 'In Progress').length;
  const completed     = todayAppts.filter((a) => a.status === 'Completed').length;
  const telehealthCnt = todayAppts.filter((a) => a.visitType === 'Telehealth').length;
  const remaining     = todayAppts.filter((a) => a.status !== 'Completed').length;

  const statusClass = (status) => {
    if (status === 'Checked In')  return 'status-checked-in';
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Confirmed')   return 'status-confirmed';
    if (status === 'Completed')   return 'status-completed';
    return '';
  };

  const statusBadge = (status) => {
    const m = {
      'Checked In':  'badge-success',
      'Confirmed':   'badge-info',
      'In Progress': 'badge-warning',
      'Completed':   'badge-gray',
      'Scheduled':   'badge-gray',
    };
    return m[status] || 'badge-gray';
  };

  const goToPatient = (apt) => {
    if (apt.patientId) {
      selectPatient(apt.patientId);
      navigate(`/chart/${apt.patientId}/summary`);
    }
  };

  const handleGoToSession = (apt) => {
    if (apt.patientId) selectPatient(apt.patientId);
    navigate(`/session/${apt.id}`);
  };

  const stats = [
    { icon: '📅', value: todayAppts.length, label: "Today's Appts",   color: 'blue' },
    { icon: '✅', value: checkedIn,          label: 'Checked In',      color: 'green' },
    { icon: '⚡', value: inProgress,         label: 'In Session',      color: 'yellow' },
    { icon: '📹', value: telehealthCnt,      label: 'Telehealth',      color: 'teal' },
    { icon: '📬', value: myUnread.length,    label: 'Inbox',           color: 'red' },
  ];

  // Urgent messages for attention banner
  const urgentMessages = myUnread.filter(m => m.urgent);

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>
            {greeting}, {currentUser?.firstName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {remaining > 0 && <span style={{ marginLeft: 8, color: 'var(--primary)', fontWeight: 600 }}>· {remaining} remaining today</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/patients')}>🔍 Find Patient</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/schedule')}>📅 Full Schedule</button>
        </div>
      </div>

      {/* Urgent attention banner */}
      {urgentMessages.length > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/inbox')}>
          <div>
            <strong>⚠️ {urgentMessages.length} urgent message{urgentMessages.length > 1 ? 's' : ''} require attention</strong>
            <span style={{ marginLeft: 8, opacity: 0.8, fontSize: 12 }}>{urgentMessages[0]?.subject}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>View →</span>
        </div>
      )}

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className={`stat-card row ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid: 3-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'start' }}>

        {/* Left: Schedule timeline */}
        <div className="card">
          <div className="card-header">
            <h2>📅 Today's Schedule</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {completed > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{completed}/{todayAppts.length} completed</span>
              )}
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/schedule')}>View All →</button>
            </div>
          </div>
          <div className="card-body no-pad" style={{ maxHeight: 480, overflowY: 'auto' }}>
            {todayAppts.length === 0 ? (
              <div className="empty-state">
                <span className="icon">📅</span>
                <h3>No appointments today</h3>
                <p>Your schedule is clear</p>
              </div>
            ) : (
              todayAppts.map((apt) => (
                <div
                  key={apt.id}
                  className={`appt-row ${statusClass(apt.status)}`}
                  onClick={() => goToPatient(apt)}
                >
                  <div className="appt-time">{apt.time}</div>
                  <div className="appt-patient-avatar">
                    {apt.patientName ? apt.patientName.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
                  </div>
                  <div className="appt-info" style={{ flex: 1 }}>
                    <div className="appt-name">
                      {apt.patientName}
                      {apt.visitType === 'Telehealth' && (
                        <span className="badge badge-teal" style={{ marginLeft: 6, fontSize: 10 }}>📹 TH</span>
                      )}
                    </div>
                    <div className="appt-type">{apt.type} · {apt.duration || 30} min</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span className={`badge ${statusBadge(apt.status)}`}>{apt.status}</span>
                    {(apt.status === 'In Progress' || apt.status === 'Checked In') && (
                      <button
                        className="btn btn-sm btn-success"
                        style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={(e) => { e.stopPropagation(); handleGoToSession(apt); }}
                      >
                        🩺 Session
                      </button>
                    )}
                    {(apt.status === 'Scheduled' || apt.status === 'Confirmed') && (
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Checked In'); if (apt.patientId) selectPatient(apt.patientId); navigate(`/session/${apt.id}`); }}
                      >
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Inbox preview */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 13 }}>
                📬 Inbox
                {myUnread.length > 0 && (
                  <span className="badge badge-danger" style={{ marginLeft: 8 }}>{myUnread.length}</span>
                )}
              </h2>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/inbox')}>View all</button>
            </div>
            <div className="card-body no-pad">
              {myUnread.length === 0 ? (
                <div className="empty-state" style={{ padding: '28px 16px' }}>
                  <span className="icon" style={{ fontSize: 28 }}>✉️</span>
                  <h3 style={{ fontSize: 13 }}>All caught up!</h3>
                  <p>No unread messages</p>
                </div>
              ) : (
                myUnread.slice(0, 4).map((msg) => (
                  <div
                    key={msg.id}
                    className="inbox-item unread"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/inbox')}
                  >
                    <div className="item-header">
                      <span className="item-from" style={{ fontSize: 12 }}>
                        {msg.urgent && <span style={{ color: 'var(--danger)', marginRight: 4 }}>●</span>}
                        {msg.from}
                      </span>
                      <span className="item-time">{msg.time || msg.date}</span>
                    </div>
                    <div className="item-subject">{msg.subject}</div>
                    <div className="item-preview">{msg.body?.substring(0, 55)}…</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 13 }}>⚡ Quick Actions</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: '🔍', label: 'Find Patient',  path: '/patients' },
                  { icon: '📬', label: 'Inbox',          path: '/inbox' },
                  { icon: '📹', label: 'Telehealth',     path: '/telehealth' },
                  { icon: '💊', label: 'E-Prescribe',    path: '/prescribe' },
                  { icon: '⚡', label: 'Smart Phrases',  path: '/smart-phrases' },
                  { icon: '🗂️', label: 'Admin Tools',   path: '/admin-toolkit' },
                ].map((a) => (
                  <button
                    key={a.path}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', fontSize: 12, padding: '7px 10px', gap: 7 }}
                    onClick={() => navigate(a.path)}
                  >
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress for the day */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 13 }}>📊 Day Progress</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Patients seen</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{completed}/{todayAppts.length}</span>
              </div>
              <div className="score-bar" style={{ height: 8, borderRadius: 4 }}>
                <div
                  className="fill"
                  style={{
                    width: `${todayAppts.length > 0 ? (completed / todayAppts.length) * 100 : 0}%`,
                    background: 'var(--primary)',
                    borderRadius: 4,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>🟢 Checked in: {checkedIn}</span>
                <span>🟡 In session: {inProgress}</span>
                <span>✅ Done: {completed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

