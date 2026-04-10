import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { users } from '../data/mockData';

const ROLE_ICONS = {
  prescriber: '🩺',
  front_desk: '🏥',
  nurse: '💉',
  admin: '🔑',
};

const ROLE_LABELS = {
  prescriber: 'Provider',
  front_desk: 'Front Desk',
  nurse: 'Nurse / MA',
  admin: 'Administrator',
};

export default function LoginPage() {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(username, password);
      if (success) navigate('/dashboard');
      setLoading(false);
    }, 300);
  };

  const handleDemoLogin = (u) => {
    setUsername(u.username);
    setPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />
      <div className="login-container">
        <div className="login-header">
          <div className="logo-icon">🧠</div>
          <h1>MindCare EHR</h1>
          <p>Outpatient Behavioral Health Platform</p>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['HIPAA Compliant', 'EPCS Certified', 'ONC Certified', '42 CFR Part 2'].map((cert, i) => (
              <span key={cert} style={{
                fontSize: 9.5, padding: '3px 10px', borderRadius: 20,
                background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 700,
                border: '1px solid rgba(59,130,246,0.15)',
                animation: `fadeInUp 0.4s var(--ease) ${0.2 + i * 0.1}s both`,
              }}>
                {cert}
              </span>
            ))}
          </div>
        </div>

        <div className="login-card">
          {loginError && (
            <div className="login-error">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-demo">
            <h3>Quick Access — Demo Accounts</h3>
            {users.filter(u => u.role !== 'patient').map((u, idx) => (
              <div
                key={u.id}
                className="login-demo-account"
                onClick={() => handleDemoLogin(u)}
                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: u.role === 'prescriber' ? 'linear-gradient(135deg,#3b82f6,#6366f1)' :
                               u.role === 'nurse' ? 'linear-gradient(135deg,#10b981,#059669)' :
                               u.role === 'front_desk' ? 'linear-gradient(135deg,#f59e0b,#d97706)' :
                               'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, flexShrink: 0,
                  }}>
                    {ROLE_ICONS[u.role] || '👤'}
                  </span>
                  <span>
                    <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{u.firstName} {u.lastName}</span>
                    {u.credentials && <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 11 }}>{u.credentials}</span>}
                  </span>
                </span>
                <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 500 }}>
                  {u.role === 'prescriber' ? u.specialty : ROLE_LABELS[u.role] || u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            Are you a patient?{' '}
            <a href="/patient-portal-login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to the Patient Portal →
            </a>
          </p>
          <p style={{ color: '#64748b', fontSize: 11, fontWeight: 500 }}>
            © {new Date().getFullYear()} MindCare Health System — Academic Medical Center
          </p>
          <p style={{ color: '#475569', fontSize: 10, marginTop: 6, opacity: 0.6 }}>
            Authorized use only · All access is monitored and logged · v2.4.1
          </p>
        </div>
      </div>
    </div>
  );
}
