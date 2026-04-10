import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PatientPortalLogin() {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) {
        navigate('/patient-portal', { replace: true });
      } else {
        setLocalError('Invalid username or password. Please try again.');
      }
    }, 400);
  };

  const demoAccounts = [
    { name: 'James Anderson', username: 'james.anderson' },
    { name: 'Maria Garcia',   username: 'maria.garcia' },
    { name: 'Robert Chen',    username: 'robert.chen' },
    { name: 'Ashley Kim',     username: 'ashley.kim' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#f0f4f8',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Left brand panel */}
      <div style={{
        width: 420, background: 'linear-gradient(160deg, #0d2444 0%, #1b3d6e 60%, #0060b6 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 40px', flexShrink: 0,
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, border: '1px solid rgba(255,255,255,0.2)',
            }}>🏥</div>
            <div>
              <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>MindCare</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px' }}>Patient Portal</div>
            </div>
          </div>

          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 14 }}>
            Your health,<br />your connection.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7 }}>
            Securely message your care team, request prescription refills, and stay connected with your provider — anytime.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['💬', 'Message your provider directly'],
              ['💊', 'Request medication refills'],
              ['📅', 'View upcoming appointments'],
              ['📋', 'Review your medications'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.09)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                }}>{icon}</div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
          🔒 HIPAA-compliant secure messaging &nbsp;·&nbsp; 256-bit encryption
        </div>
      </div>

      {/* Right login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0e1e30', letterSpacing: '-0.4px' }}>
              Sign in to your account
            </h1>
            <p style={{ color: '#6b7ea0', fontSize: 13, marginTop: 6 }}>
              Use the credentials provided by your care team.
            </p>
          </div>

          {(localError || loginError) && (
            <div style={{
              padding: '10px 14px', borderRadius: 7, fontSize: 13, marginBottom: 18,
              background: '#fdeaea', color: '#a81f1f', border: '1px solid rgba(201,43,43,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {localError || loginError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#445568', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. james.anderson"
                required
                autoFocus
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 6,
                  border: '1.5px solid #d8dfe8', fontSize: 14, outline: 'none',
                  background: '#fff', color: '#0e1e30', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0060b6'}
                onBlur={(e) => e.target.style.borderColor = '#d8dfe8'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#445568', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6,
                    border: '1.5px solid #d8dfe8', fontSize: 14, outline: 'none',
                    background: '#fff', color: '#0e1e30', boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0060b6'}
                  onBlur={(e) => e.target.style.borderColor = '#d8dfe8'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#8a9bb0', fontSize: 15,
                }}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 6, fontWeight: 700, fontSize: 14,
              background: loading ? '#cce0f5' : 'linear-gradient(180deg, #1872c8 0%, #0055a8 100%)',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,85,168,0.25)', transition: 'all 0.13s',
              letterSpacing: '0.1px',
            }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{
            marginTop: 28, paddingTop: 20, borderTop: '1px solid #e4e9f0',
          }}>
            <p style={{ fontSize: 11, color: '#8a9bb0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              Demo patient accounts (password: Patient1!)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {demoAccounts.map((a) => (
                <button key={a.username}
                  onClick={() => { setUsername(a.username); setPassword('Patient1!'); }}
                  style={{
                    padding: '7px 10px', textAlign: 'left', border: '1px solid #e4e9f0',
                    borderRadius: 6, background: '#f7f9fc', cursor: 'pointer',
                    fontSize: 11.5, color: '#445568', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e7f1fb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f7f9fc'}
                >
                  <div style={{ fontWeight: 700, color: '#0e1e30', fontSize: 12 }}>{a.name}</div>
                  <div style={{ color: '#8a9bb0', fontSize: 10.5 }}>{a.username}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Link back to staff login */}
          <p style={{ marginTop: 24, fontSize: 12, color: '#8a9bb0', textAlign: 'center' }}>
            Staff?{' '}
            <a href="/login" style={{ color: '#0060b6', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to the clinical portal →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
