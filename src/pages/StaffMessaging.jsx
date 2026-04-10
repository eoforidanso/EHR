import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { users as allUsers } from '../data/mockData';

const STAFF = allUsers.filter(u => u.role !== 'patient');

const CHANNELS = [
  { id: 'ch-general', name: 'General', icon: '💬', description: 'General announcements & updates' },
  { id: 'ch-clinical', name: 'Clinical', icon: '🩺', description: 'Clinical discussions & consults' },
  { id: 'ch-urgent', name: 'Urgent', icon: '🚨', description: 'Urgent matters requiring immediate attention' },
  { id: 'ch-front-desk', name: 'Front Desk', icon: '🏥', description: 'Front desk communications' },
  { id: 'ch-teaching', name: 'Teaching', icon: '🎓', description: 'Academic & training discussions' },
  { id: 'ch-pharmacy', name: 'Pharmacy', icon: '💊', description: 'Pharmacy coordination & prior auths' },
];

const INITIAL_MESSAGES = {
  'ch-general': [
    { id: 'm1', from: 'u5', text: 'Reminder: Staff meeting at 12:30 PM today in Conference Room B. Lunch will be provided.', time: '2026-04-10T08:15:00', reactions: { '👍': ['u1', 'u4'], '✅': ['u2'] } },
    { id: 'm2', from: 'u4', text: 'The new patient intake forms are live in the portal. Please direct patients to complete them before their first visit.', time: '2026-04-10T08:42:00', reactions: {} },
    { id: 'm3', from: 'u1', text: 'Great work team on the Q1 quality measures — we exceeded targets on PHQ-9 screening compliance. 🎉', time: '2026-04-10T09:05:00', reactions: { '🎉': ['u2', 'u3', 'u4', 'u5'] } },
  ],
  'ch-clinical': [
    { id: 'm4', from: 'u2', text: 'Quick consult request: Patient on clozapine with WBC at 3200. Current protocol says hold and recheck in 48h. Does anyone want to weigh in?', time: '2026-04-10T07:30:00', reactions: {} },
    { id: 'm5', from: 'u1', text: 'WBC 3200 is in the yellow range for REMS. I agree — hold dose, repeat CBC in 48h, and document in REMS registry. If it drops below 3000, we need to discontinue.', time: '2026-04-10T07:45:00', reactions: { '👍': ['u2'] } },
    { id: 'm6', from: 'u3', text: 'Also consider checking ANC — if ANC >1500, we may be able to continue with close monitoring per the updated 2025 guidelines.', time: '2026-04-10T08:00:00', reactions: { '💡': ['u1', 'u2'] } },
    { id: 'm7', from: 'u4', text: 'I\'ll draw the repeat labs and add it to the schedule. Patient is in the AM slot on Monday.', time: '2026-04-10T08:10:00', reactions: { '✅': ['u2'] } },
  ],
  'ch-urgent': [
    { id: 'm8', from: 'u4', text: '⚠️ Room 3 patient reporting active SI with plan. Dr. Chris has been paged. Safety protocol initiated.', time: '2026-04-10T09:22:00', reactions: {} },
    { id: 'm9', from: 'u1', text: 'On my way. Kelly, please stay with patient. Irina — can you cover my 9:45 med management?', time: '2026-04-10T09:23:00', reactions: {} },
    { id: 'm10', from: 'u3', text: 'Covering your 9:45. I\'ll pull up their chart now.', time: '2026-04-10T09:24:00', reactions: { '🙏': ['u1'] } },
  ],
  'ch-front-desk': [
    { id: 'm11', from: 'u5', text: 'Insurance verification pending for 3 patients this afternoon. Working on it now.', time: '2026-04-10T08:30:00', reactions: {} },
    { id: 'm12', from: 'u4', text: 'Room 2 is ready for the next patient. Vitals are in the chart.', time: '2026-04-10T09:00:00', reactions: { '👍': ['u5'] } },
  ],
  'ch-teaching': [
    { id: 'm13', from: 'u1', text: 'Grand Rounds this Friday: "Psychedelic-Assisted Therapy: Current Evidence & Legal Framework" — Auditorium at 8 AM. CME credit available.', time: '2026-04-09T16:00:00', reactions: { '🎓': ['u2', 'u3'], '👍': ['u4'] } },
    { id: 'm14', from: 'u2', text: 'Shared a new article on treatment-resistant depression protocols in the shared drive. Great read for anyone interested.', time: '2026-04-10T07:15:00', reactions: {} },
    { id: 'm15', from: 'u3', text: 'NP students start their clinical rotation next Monday. I\'ll be precepting — please be welcoming and available for questions!', time: '2026-04-10T08:20:00', reactions: { '✅': ['u1', 'u4', 'u5'] } },
  ],
  'ch-pharmacy': [
    { id: 'm16', from: 'u2', text: 'Prior auth approved for patient Garcia\'s Spravato. She can start next week.', time: '2026-04-10T09:10:00', reactions: { '🎉': ['u1'] } },
    { id: 'm17', from: 'u3', text: 'FYI — generic lamotrigine XR now on backorder at CVS. Patients may need to switch to immediate-release with divided dosing temporarily.', time: '2026-04-10T09:30:00', reactions: { '📝': ['u2', 'u4'] } },
  ],
};

const DM_MESSAGES = {};

function getStaffName(userId) {
  const u = STAFF.find(s => s.id === userId);
  if (!u) return 'Unknown';
  return `${u.firstName} ${u.lastName}`.trim();
}

function getStaffInitials(userId) {
  const u = STAFF.find(s => s.id === userId);
  if (!u) return '?';
  return `${u.firstName[0]}${(u.lastName || u.firstName)[0]}`.toUpperCase();
}

function getStaffRole(userId) {
  const u = STAFF.find(s => s.id === userId);
  if (!u) return '';
  const labels = { prescriber: u.credentials || 'Provider', nurse: 'RN', front_desk: 'Front Desk', admin: 'Admin' };
  return labels[u.role] || u.role;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
];

function getAvatarColor(userId) {
  const idx = STAFF.findIndex(s => s.id === userId);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export default function StaffMessaging() {
  const { currentUser } = useAuth();
  const [activeChannel, setActiveChannel] = useState('ch-general');
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [dmMessages, setDmMessages] = useState(DM_MESSAGES);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('channels'); // 'channels' | 'dms'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const otherStaff = STAFF.filter(s => s.id !== currentUser?.id && s.role !== 'patient');

  const currentMessages = useMemo(() => {
    if (activeDM) {
      const key = [currentUser?.id, activeDM].sort().join('-');
      return dmMessages[key] || [];
    }
    return messages[activeChannel] || [];
  }, [activeDM, activeChannel, messages, dmMessages, currentUser]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return currentMessages;
    const q = searchQuery.toLowerCase();
    return currentMessages.filter(m =>
      m.text.toLowerCase().includes(q) || getStaffName(m.from).toLowerCase().includes(q)
    );
  }, [currentMessages, searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChannel, activeDM]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      from: currentUser?.id,
      text: input.trim(),
      time: new Date().toISOString(),
      reactions: {},
    };

    if (activeDM) {
      const key = [currentUser?.id, activeDM].sort().join('-');
      setDmMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), newMsg] }));
    } else {
      setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newMsg] }));
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const addReaction = (msgId, emoji) => {
    const uid = currentUser?.id;
    if (activeDM) {
      const key = [currentUser?.id, activeDM].sort().join('-');
      setDmMessages(prev => {
        const ch = [...(prev[key] || [])];
        const msg = ch.find(m => m.id === msgId);
        if (!msg) return prev;
        const r = { ...msg.reactions };
        if (!r[emoji]) r[emoji] = [];
        if (r[emoji].includes(uid)) r[emoji] = r[emoji].filter(id => id !== uid);
        else r[emoji] = [...r[emoji], uid];
        if (r[emoji].length === 0) delete r[emoji];
        msg.reactions = r;
        return { ...prev, [key]: ch };
      });
    } else {
      setMessages(prev => {
        const ch = [...(prev[activeChannel] || [])];
        const msg = ch.find(m => m.id === msgId);
        if (!msg) return prev;
        const r = { ...msg.reactions };
        if (!r[emoji]) r[emoji] = [];
        if (r[emoji].includes(uid)) r[emoji] = r[emoji].filter(id => id !== uid);
        else r[emoji] = [...r[emoji], uid];
        if (r[emoji].length === 0) delete r[emoji];
        msg.reactions = r;
        return { ...prev, [activeChannel]: ch };
      });
    }
    setShowEmojiPicker(null);
  };

  const quickEmojis = ['👍', '❤️', '😂', '🎉', '💡', '✅', '🙏', '👀'];

  const channelInfo = CHANNELS.find(c => c.id === activeChannel);
  const dmUser = activeDM ? STAFF.find(s => s.id === activeDM) : null;
  const headerTitle = activeDM ? getStaffName(activeDM) : channelInfo?.name;
  const headerDesc = activeDM ? getStaffRole(activeDM) : channelInfo?.description;

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - var(--header-height) - 40px)' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        background: 'var(--bg-white)', boxShadow: 'var(--shadow)',
      }}>
        {/* Left Panel — Channels & DMs */}
        <div style={{ background: '#0f172a', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Workspace header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.3, display: 'flex', alignItems: 'center', gap: 8 }}>
              💬 Staff Chat
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
              {STAFF.filter(s => s.role !== 'patient').length} team members
            </div>
          </div>

          {/* Toggle tabs */}
          <div style={{ display: 'flex', gap: 2, padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => { setView('channels'); setActiveDM(null); }}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: view === 'channels' ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: view === 'channels' ? '#93c5fd' : '#64748b',
                transition: 'all 0.15s',
              }}
            >Channels</button>
            <button
              onClick={() => setView('dms')}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: view === 'dms' ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: view === 'dms' ? '#93c5fd' : '#64748b',
                transition: 'all 0.15s',
              }}
            >Direct Messages</button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {view === 'channels' && CHANNELS.map(ch => {
              const count = (messages[ch.id] || []).length;
              const isActive = !activeDM && activeChannel === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => { setActiveChannel(ch.id); setActiveDM(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', cursor: 'pointer',
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16, width: 28, textAlign: 'center', flexShrink: 0 }}>{ch.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? '#93c5fd' : '#94a3b8' }}>
                      {ch.name}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: '#475569', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 10 }}>
                    {count}
                  </span>
                </div>
              );
            })}

            {view === 'dms' && otherStaff.map(s => {
              const key = [currentUser?.id, s.id].sort().join('-');
              const count = (dmMessages[key] || []).length;
              const isActive = activeDM === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => { setActiveDM(s.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', cursor: 'pointer',
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(s.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>
                    {getStaffInitials(s.id)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? '#93c5fd' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getStaffName(s.id)}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{getStaffRole(s.id)}</div>
                  </div>
                  {count > 0 && (
                    <span style={{ fontSize: 10, color: '#475569', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 10 }}>
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current user */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(currentUser?.id),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 10, fontWeight: 700,
            }}>
              {currentUser ? `${currentUser.firstName[0]}${(currentUser.lastName || currentUser.firstName)[0]}` : '?'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{currentUser?.firstName} {currentUser?.lastName}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 4 }} />
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Channel header */}
          <div style={{
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #fafbfc, #f8fafc)',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeDM ? (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: getAvatarColor(activeDM),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 9, fontWeight: 700,
                  }}>{getStaffInitials(activeDM)}</div>
                ) : (
                  <span>{channelInfo?.icon}</span>
                )}
                {headerTitle}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{headerDesc}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    padding: '5px 10px 5px 28px', border: '1px solid var(--border)', borderRadius: 6,
                    background: 'var(--bg)', fontSize: 11.5, width: 180, outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 2px var(--primary-ring)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, opacity: 0.4 }}>🔍</span>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {filteredMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {searchQuery ? 'No messages match your search' : 'No messages yet'}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {searchQuery ? 'Try a different search term' : 'Start the conversation!'}
                </div>
              </div>
            )}

            {filteredMessages.map((msg, i) => {
              const isMe = msg.from === currentUser?.id;
              const showAvatar = i === 0 || filteredMessages[i - 1]?.from !== msg.from;
              const showTime = i === 0 || (new Date(msg.time) - new Date(filteredMessages[i-1]?.time)) > 300000;
              return (
                <div key={msg.id}>
                  {showTime && (
                    <div style={{ textAlign: 'center', margin: '16px 0 8px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {isToday(msg.time) ? `Today at ${formatTime(msg.time)}` : new Date(msg.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${formatTime(msg.time)}`}
                    </div>
                  )}
                  <div style={{
                    display: 'flex', gap: 10, marginBottom: showAvatar && i < filteredMessages.length - 1 && filteredMessages[i+1]?.from !== msg.from ? 12 : 3,
                    alignItems: 'flex-start',
                  }}>
                    {showAvatar ? (
                      <div title={getStaffName(msg.from)} style={{
                        width: 32, height: 32, borderRadius: '50%', background: getAvatarColor(msg.from),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>{getStaffInitials(msg.from)}</div>
                    ) : (
                      <div style={{ width: 32, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {showAvatar && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: isMe ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {isMe ? 'You' : getStaffName(msg.from)}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{getStaffRole(msg.from)}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(msg.time)}</span>
                        </div>
                      )}
                      <div style={{
                        fontSize: 13, lineHeight: 1.55, color: 'var(--text-primary)',
                        padding: '6px 10px', borderRadius: 8,
                        background: isMe ? 'var(--primary-light)' : 'var(--bg)',
                        maxWidth: '85%', wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>
                      {/* Reactions */}
                      {Object.keys(msg.reactions).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(msg.id, emoji)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px',
                                borderRadius: 10, border: users.includes(currentUser?.id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                                background: users.includes(currentUser?.id) ? 'var(--primary-light)' : 'var(--bg-white)',
                                cursor: 'pointer', fontSize: 11, transition: 'all 0.1s',
                              }}
                            >
                              <span>{emoji}</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Emoji add button */}
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          style={{
                            opacity: 0.3, fontSize: 12, padding: '2px 4px', cursor: 'pointer',
                            background: 'none', border: 'none', transition: 'opacity 0.1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                        >😀+</button>
                        {showEmojiPicker === msg.id && (
                          <div style={{
                            position: 'absolute', bottom: '100%', left: 0, padding: 6,
                            background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 8,
                            boxShadow: 'var(--shadow-md)', display: 'flex', gap: 2, zIndex: 10,
                            animation: 'scaleIn 0.1s ease both',
                          }}>
                            {quickEmojis.map(e => (
                              <button key={e} onClick={() => addReaction(msg.id, e)}
                                style={{ fontSize: 16, padding: '4px 5px', cursor: 'pointer', background: 'none', border: 'none', borderRadius: 4, transition: 'background 0.1s' }}
                                onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                              >{e}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-end',
              background: 'var(--bg-white)', border: '1.5px solid var(--border)', borderRadius: 10,
              padding: '8px 12px', transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={`Message ${activeDM ? getStaffName(activeDM) : `#${channelInfo?.name || ''}`}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none', background: 'transparent',
                  fontSize: 13, lineHeight: 1.5, minHeight: 20, maxHeight: 120, fontFamily: 'var(--font)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  background: input.trim() ? 'var(--primary)' : 'var(--bg)',
                  color: input.trim() ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.15s', flexShrink: 0, fontSize: 15,
                }}
              >
                ➤
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Press Enter to send, Shift+Enter for new line</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
