import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import { useAuth } from '../contexts/AuthContext';

// ── helpers ────────────────────────────────────────────────────────────
function timeAgo(dateStr, timeStr) {
  const dt = new Date(`${dateStr}T${timeStr || '00:00'}`);
  const diff = Date.now() - dt.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return dt.toLocaleDateString();
}

const QUICK_MESSAGES = [
  "I'd like to schedule an appointment.",
  "I have a question about my medication.",
  "I'm experiencing a new symptom.",
  "I need a prior authorization.",
  "Can I get my test results?",
  "I'm feeling worse since my last visit.",
];

// ── main component ─────────────────────────────────────────────────────
export default function PatientChat() {
  const { selectedPatient, meds, inboxMessages, addInboxMessage, appointments } = usePatient();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ── compose state
  const [mode, setMode] = useState('message'); // 'message' | 'refill'
  const [messageText, setMessageText] = useState('');
  const [messagePriority, setMessagePriority] = useState('Normal');
  const [sent, setSent] = useState(null); // { type, text }

  // ── refill form state
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [pharmacyNote, setPharmacyNote] = useState('');
  const [refillNote, setRefillNote] = useState('');

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  if (!selectedPatient) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <h1>💬 Patient Chat</h1>
          <p>Send messages and refill requests to your care team</p>
        </div>
        <div className="empty-state">
          <span className="icon">👤</span>
          <h3>No Patient Selected</h3>
          <p>Search for a patient first to open their chat session.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/patients')}>
            Search Patients
          </button>
        </div>
      </div>
    );
  }

  const p = selectedPatient;
  const patientName = `${p.firstName} ${p.lastName}`;

  // ── derive provider from appointments or use current user
  const providerFromApt = appointments.find((a) => a.patientId === p.id && a.provider);
  const toProvider = providerFromApt?.provider || currentUser?.id || 'u1';
  const toProviderName = providerFromApt?.providerName || currentUser?.name || 'Your Provider';

  // ── chat history: inbox messages for this patient, newest last
  const chatHistory = useMemo(() =>
    inboxMessages
      .filter((m) => m.patient === p.id)
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || '00:00'}`);
        const db = new Date(`${b.date}T${b.time || '00:00'}`);
        return da - db;
      }),
    [inboxMessages, p.id]
  );

  const activeMeds = (meds[p.id] || []).filter((m) => m.status === 'Active');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, sent]);

  // ── send message ───────────────────────────────────────────────────
  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text) return;
    const now = new Date();
    addInboxMessage({
      type: 'Patient Message',
      from: patientName,
      to: toProvider,
      patient: p.id,
      patientName,
      subject: text.length > 60 ? text.slice(0, 60) + '…' : text,
      body: text,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      priority: messagePriority,
    });
    setSent({ type: 'message', text });
    setMessageText('');
    setMessagePriority('Normal');
    setTimeout(() => setSent(null), 4000);
  };

  // ── send refill request ────────────────────────────────────────────
  const handleSendRefill = () => {
    if (selectedMeds.length === 0) return;
    const now = new Date();
    const medLines = selectedMeds
      .map((id) => {
        const m = activeMeds.find((x) => x.id === id);
        return m ? `• ${m.name} ${m.dose} — Last filled: ${m.lastFilled || 'unknown'}, Refills left: ${m.refillsLeft ?? '?'}` : '';
      })
      .filter(Boolean)
      .join('\n');

    const pharmacyLine = pharmacyNote ? `\nPreferred pharmacy: ${pharmacyNote}` : '';
    const noteLine = refillNote ? `\nPatient note: ${refillNote}` : '';
    const body = `Patient is requesting a refill for the following medication(s):\n${medLines}${pharmacyLine}${noteLine}`;

    addInboxMessage({
      type: 'Rx Refill Request',
      from: patientName,
      to: toProvider,
      patient: p.id,
      patientName,
      subject: `Refill Request: ${selectedMeds.map((id) => activeMeds.find((x) => x.id === id)?.name).join(', ')}`,
      body,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      priority: selectedMeds.some((id) => activeMeds.find((x) => x.id === id)?.isControlled) ? 'High' : 'Normal',
    });

    setSent({ type: 'refill', text: `Refill requested for ${selectedMeds.length} medication(s)` });
    setSelectedMeds([]);
    setPharmacyNote('');
    setRefillNote('');
    setTimeout(() => setSent(null), 4000);
  };

  const toggleMed = (id) => {
    setSelectedMeds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── chat bubble style ──────────────────────────────────────────────
  const isPatientMsg = (msg) =>
    msg.type === 'Patient Message' || msg.type === 'Rx Refill Request';

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>💬 Patient Chat</h1>
          <p>
            {patientName} · MRN {p.mrn} &nbsp;|&nbsp; Provider: {toProviderName}
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => navigate(`/chart/${p.id}/summary`)}>
          📋 Open Chart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>

        {/* ── Left: Chat thread ── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '72vh' }}>
          {/* Thread header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>
              {p.firstName[0]}{p.lastName[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{patientName}</div>
              <div className="text-xs text-muted">MRN {p.mrn} · DOB {p.dob}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <span className="badge badge-success" style={{ fontSize: 11 }}>🟢 Active Session</span>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                <div style={{ fontWeight: 600 }}>No messages yet</div>
                <div className="text-sm">Send a message or request a refill below.</div>
              </div>
            )}

            {chatHistory.map((msg) => {
              const fromPatient = isPatientMsg(msg);
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: fromPatient ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '78%',
                    background: fromPatient
                      ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                      : 'var(--bg)',
                    color: fromPatient ? 'white' : 'var(--text-primary)',
                    borderRadius: fromPatient ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    border: fromPatient ? 'none' : '1px solid var(--border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    {/* Type badge */}
                    {msg.type === 'Rx Refill Request' && (
                      <div style={{
                        fontSize: 11, fontWeight: 700, marginBottom: 5,
                        opacity: fromPatient ? 0.85 : 1,
                        color: fromPatient ? 'rgba(255,255,255,0.9)' : 'var(--warning)',
                      }}>
                        💊 Rx Refill Request
                      </div>
                    )}
                    {msg.type === 'Lab Result' && (
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--info)' }}>
                        🧪 Lab Result
                      </div>
                    )}
                    {msg.type === 'Staff Message' && (
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--success)' }}>
                        👥 Staff Message
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{msg.subject}</div>
                    <div style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      opacity: fromPatient ? 0.92 : 0.85,
                    }}>
                      {msg.body}
                    </div>
                    {msg.priority === 'High' && (
                      <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: fromPatient ? 'rgba(255,200,150,0.95)' : 'var(--danger)' }}>
                        ⚠️ HIGH PRIORITY
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                    {fromPatient ? patientName : (msg.from || 'Care Team')} · {timeAgo(msg.date, msg.time)}
                  </div>
                </div>
              );
            })}

            {/* Optimistic "sent" flash */}
            {sent && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{
                  maxWidth: '78%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white',
                  borderRadius: '16px 16px 4px 16px',
                  padding: '10px 14px',
                  fontSize: 13,
                  opacity: 0.7,
                }}>
                  {sent.type === 'refill' ? '💊 ' : ''}{sent.text}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, paddingRight: 4 }}>
                  Sending… ✓
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Compose bar ── */}
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {/* Mode tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setMode('message')}
                style={{
                  flex: 1, padding: '9px 12px', fontSize: 13, fontWeight: 600,
                  background: mode === 'message' ? 'var(--primary)' : 'var(--bg)',
                  color: mode === 'message' ? 'white' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                ✉️ Send Message
              </button>
              <button
                onClick={() => setMode('refill')}
                style={{
                  flex: 1, padding: '9px 12px', fontSize: 13, fontWeight: 600,
                  background: mode === 'refill' ? 'var(--warning, #d97706)' : 'var(--bg)',
                  color: mode === 'refill' ? 'white' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderLeft: '1px solid var(--border)',
                }}
              >
                💊 Request Refill
              </button>
            </div>

            {/* Message compose */}
            {mode === 'message' && (
              <div style={{ padding: '12px 14px' }}>
                <textarea
                  ref={textareaRef}
                  className="form-input"
                  rows={3}
                  placeholder={`Message to ${toProviderName}…`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{ resize: 'none', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label className="form-label" style={{ margin: 0, fontSize: 12 }}>Priority:</label>
                    <select className="form-input" style={{ width: 110, padding: '4px 8px', fontSize: 12 }}
                      value={messagePriority} onChange={(e) => setMessagePriority(e.target.value)}>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="text-xs text-muted">Ctrl+Enter to send</span>
                    <button className="btn btn-primary btn-sm"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}>
                      Send ↑
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Refill compose */}
            {mode === 'refill' && (
              <div style={{ padding: '12px 14px' }}>
                {activeMeds.length === 0 ? (
                  <div className="text-muted text-sm" style={{ padding: '8px 0' }}>
                    No active medications on file.
                  </div>
                ) : (
                  <div style={{ marginBottom: 10 }}>
                    <div className="form-label" style={{ marginBottom: 6 }}>Select medication(s) to refill:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 130, overflowY: 'auto' }}>
                      {activeMeds.map((m) => (
                        <label key={m.id} style={{
                          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                          padding: '5px 8px', borderRadius: 6,
                          background: selectedMeds.includes(m.id) ? 'rgba(79,70,229,0.07)' : 'transparent',
                          border: selectedMeds.includes(m.id) ? '1px solid var(--primary)' : '1px solid transparent',
                          fontSize: 12,
                        }}>
                          <input type="checkbox" checked={selectedMeds.includes(m.id)}
                            onChange={() => toggleMed(m.id)} style={{ accentColor: 'var(--primary)' }} />
                          <span style={{ fontWeight: 600 }}>{m.name}</span>
                          <span className="text-muted">{m.dose}</span>
                          {m.isControlled && <span className="badge badge-warning" style={{ fontSize: 10 }}>⚠️ Controlled</span>}
                          <span className="text-muted" style={{ marginLeft: 'auto' }}>
                            {m.refillsLeft != null ? `${m.refillsLeft} refill${m.refillsLeft !== 1 ? 's' : ''} left` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <input className="form-input" type="text" placeholder="Preferred pharmacy (optional)"
                  value={pharmacyNote} onChange={(e) => setPharmacyNote(e.target.value)}
                  style={{ marginBottom: 6, fontSize: 12 }} />
                <input className="form-input" type="text" placeholder="Note to provider (optional)"
                  value={refillNote} onChange={(e) => setRefillNote(e.target.value)}
                  style={{ marginBottom: 8, fontSize: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm"
                    style={{ background: 'var(--warning, #d97706)', color: 'white', border: 'none' }}
                    onClick={handleSendRefill}
                    disabled={selectedMeds.length === 0}>
                    💊 Send Refill Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Quick actions + info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Quick message suggestions */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>⚡ Quick Messages</h3>
            </div>
            <div className="card-body" style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_MESSAGES.map((q, i) => (
                  <button key={i}
                    style={{
                      textAlign: 'left', padding: '7px 10px', background: 'var(--bg)',
                      border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer',
                      fontSize: 12, color: 'var(--text-primary)', transition: 'all 0.12s',
                    }}
                    onClick={() => { setMode('message'); setMessageText(q); textareaRef.current?.focus(); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,70,229,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient info card */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>👤 Patient Info</h3>
            </div>
            <div className="card-body" style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                {[
                  { label: 'Name', val: patientName },
                  { label: 'MRN', val: p.mrn },
                  { label: 'DOB', val: p.dob },
                  { label: 'Phone', val: p.cellPhone || p.phone || '—' },
                  { label: 'Insurance', val: p.insurance?.primary?.name || '—' },
                  { label: 'Provider', val: toProviderName },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="text-muted">{label}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active medications quick list */}
          {activeMeds.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>💊 Active Medications</h3>
              </div>
              <div className="card-body" style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeMeds.map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div className="text-muted">{m.dose} · {m.frequency}</div>
                      </div>
                      <button
                        className="btn btn-sm"
                        style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 5 }}
                        onClick={() => {
                          setMode('refill');
                          if (!selectedMeds.includes(m.id)) toggleMed(m.id);
                        }}
                      >
                        Refill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Crisis line notice */}
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
            fontSize: 12,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>🆘 Crisis Resources</div>
            <div className="text-muted" style={{ lineHeight: 1.6 }}>
              If you are in crisis, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline).<br />
              Text <strong>HOME</strong> to <strong>741741</strong> for Crisis Text Line.<br />
              For emergencies, call <strong>911</strong> or go to the nearest ER.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
