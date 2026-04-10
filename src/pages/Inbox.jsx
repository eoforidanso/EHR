import React, { useState, useMemo, useEffect } from 'react';
import { usePatient } from '../contexts/PatientContext';
import { useAuth } from '../contexts/AuthContext';

const TYPE_ICONS = {
  'Rx Refill Request': '💊',
  'Lab Result': '🧪',
  'Patient Message': '✉️',
  'Prior Auth': '📋',
  'Staff Message': '👥',
  'Check-in Alert': '🔔',
  'Referral Response': '🔗',
};

const TYPE_COLORS = {
  'Rx Refill Request': 'badge-warning',
  'Lab Result': 'badge-info',
  'Patient Message': 'badge-primary',
  'Prior Auth': 'badge-danger',
  'Staff Message': 'badge-success',
  'Check-in Alert': 'badge-info',
  'Referral Response': 'badge-primary',
};

export default function Inbox() {
  const { inboxMessages, updateMessageStatus, patients } = usePatient();
  const { currentUser } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  // Extract unique patients with messages and compute stats
  const patientList = useMemo(() => {
    const ptMap = new Map();
    
    inboxMessages.forEach((msg) => {
      // Skip non-patient messages
      if (!msg.patient || !msg.patientName) return;
      
      if (!ptMap.has(msg.patient)) {
        const pt = patients?.find(p => p.id === msg.patient);
        ptMap.set(msg.patient, {
          id: msg.patient,
          name: msg.patientName,
          mrn: pt?.mrn || '',
          photo: pt?.photo || null,
          unreadCount: 0,
          totalCount: 0,
          lastMessageDate: msg.date,
        });
      }
      
      const entry = ptMap.get(msg.patient);
      entry.totalCount += 1;
      if (msg.status === 'Unread') entry.unreadCount += 1;
      // Update last message date if newer
      if (new Date(msg.date) > new Date(entry.lastMessageDate)) {
        entry.lastMessageDate = msg.date;
      }
    });

    return Array.from(ptMap.values()).sort((a, b) => 
      new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
    );
  }, [inboxMessages, patients]);

  const filteredMessages = useMemo(() => {
    let msgs = [...inboxMessages];

    // Role-based filtering
    if (currentUser?.role === 'front_desk') {
      msgs = msgs.filter(m => ['Check-in Alert', 'Patient Message', 'Staff Message'].includes(m.type));
    }

    // Filter by selected patient if one is chosen
    if (selectedPatientId) {
      msgs = msgs.filter(m => m.patient === selectedPatientId);
    }

    if (filterType !== 'All') {
      msgs = msgs.filter(m => m.type === filterType);
    }
    if (filterStatus === 'Unread') {
      msgs = msgs.filter(m => m.status === 'Unread');
    } else if (filterStatus === 'Read') {
      msgs = msgs.filter(m => m.status === 'Read');
    }

    return msgs.sort((a, b) => {
      if (a.status === 'Unread' && b.status !== 'Unread') return -1;
      if (a.status !== 'Unread' && b.status === 'Unread') return 1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [inboxMessages, filterType, filterStatus, currentUser, selectedPatientId]);

  const selectedMessage = inboxMessages.find(m => m.id === selectedId);
  const unreadCount = inboxMessages.filter(m => m.status === 'Unread').length;
  const messageTypes = [...new Set(inboxMessages.map(m => m.type))];

  // Auto-populate: select first patient with unread messages on mount
  useEffect(() => {
    if (!selectedPatientId && patientList.length > 0) {
      const firstUnread = patientList.find(p => p.unreadCount > 0);
      if (firstUnread) {
        setSelectedPatientId(firstUnread.id);
      } else if (patientList.length > 0) {
        setSelectedPatientId(patientList[0].id);
      }
    }
  }, [patientList, selectedPatientId]);

  const handleSelectMessage = (msg) => {
    setSelectedId(msg.id);
    setShowReply(false);
    setReplyText('');
    if (msg.status === 'Unread') {
      updateMessageStatus(msg.id, 'Read');
    }
  };

  const handleMarkUnread = (id) => {
    updateMessageStatus(id, 'Unread');
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📥 Clinical Inbox</h1>
        <p>{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''} requiring attention` : 'All caught up — no unread messages'}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 180 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="All">All Types</option>
          {messageTypes.map(t => (
            <option key={t} value={t}>{TYPE_ICONS[t] || '📩'} {t}</option>
          ))}
        </select>
        <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Unread">Unread</option>
          <option value="Read">Read</option>
        </select>
        <span className="text-muted text-sm">{filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Three-Column Inbox Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', height: '70vh', border: '1px solid var(--border)' }}>
        
        {/* Patient List Column */}
        <div style={{ background: 'var(--bg-sidebar)', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
            Patients ({patientList.length})
          </div>
          {patientList.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
              No patient messages
            </div>
          ) : (
            patientList.map((pt) => (
              <div
                key={pt.id}
                onClick={() => setSelectedPatientId(pt.id)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  background: selectedPatientId === pt.id ? 'rgba(255,255,255,0.13)' : 'transparent',
                  borderLeft: selectedPatientId === pt.id ? '3px solid #60a5fa' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (selectedPatientId !== pt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = selectedPatientId === pt.id ? 'rgba(255,255,255,0.13)' : 'transparent'; }}
              >
                {/* Avatar + Name */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {pt.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#e8f0fa' }}>
                      {pt.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pt.mrn}
                    </div>
                  </div>
                </div>
                
                {/* Message Count + Unread Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{pt.totalCount} msg{pt.totalCount !== 1 ? 's' : ''}</span>
                  {pt.unreadCount > 0 && (
                    <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                      {pt.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message List Column */}
        <div style={{ background: 'white', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
          {filteredMessages.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              {selectedPatientId ? 'No messages for this patient' : 'No messages match your filters'}
            </div>
          )}
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`inbox-item ${selectedId === msg.id ? 'active' : ''} ${msg.status === 'Unread' ? 'unread' : ''}`}
              onClick={() => handleSelectMessage(msg)}
              style={{
                borderBottom: '1px solid var(--border)',
                borderRight: 'none',
                borderRadius: '0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span className={`badge ${TYPE_COLORS[msg.type] || 'badge-info'}`} style={{ fontSize: 11 }}>
                  {TYPE_ICONS[msg.type] || '📩'} {msg.type}
                </span>
                {msg.urgent && <span className="badge badge-danger" style={{ fontSize: 10 }}>URGENT</span>}
              </div>
              <div style={{ fontWeight: msg.status === 'Unread' ? 700 : 500, fontSize: 14, marginBottom: 2 }}>
                {msg.subject}
              </div>
              <div className="text-muted text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{msg.from}</span>
                <span>{msg.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail Column */}
        <div style={{ background: 'white', overflowY: 'auto' }}>
          {!selectedMessage ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>📬</div>
                <h3 style={{ marginBottom: 4 }}>Select a message</h3>
                <p className="text-sm">Choose a message from the list to view details</p>
              </div>
            </div>
          ) : (
            <div style={{ padding: 24 }}>
              {/* Message Header */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>{selectedMessage.subject}</h2>
                  <div className="flex gap-2">
                    {selectedMessage.urgent && <span className="badge badge-danger">⚠️ URGENT</span>}
                    <span className={`badge ${TYPE_COLORS[selectedMessage.type] || 'badge-info'}`}>
                      {TYPE_ICONS[selectedMessage.type]} {selectedMessage.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted" style={{ flexWrap: 'wrap' }}>
                  <span><strong>From:</strong> {selectedMessage.from}</span>
                  <span><strong>Date:</strong> {selectedMessage.date}</span>
                  {selectedMessage.patientName && <span><strong>Patient:</strong> {selectedMessage.patientName}</span>}
                </div>
              </div>

              {/* Message Body */}
              <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.body}
              </div>

              {/* Actions */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowReply(!showReply)}>
                    ↩️ Reply
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleMarkUnread(selectedMessage.id)}>
                    📩 Mark Unread
                  </button>
                  {selectedMessage.type === 'Rx Refill Request' && (
                    <>
                      <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'white' }}>✅ Approve Refill</button>
                      <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }}>❌ Deny Refill</button>
                    </>
                  )}
                  {selectedMessage.type === 'Prior Auth' && (
                    <button className="btn btn-sm" style={{ background: 'var(--warning)', color: 'white' }}>📋 Open PA Form</button>
                  )}
                  {selectedMessage.type === 'Lab Result' && (
                    <button className="btn btn-sm btn-outline">📊 View Full Results</button>
                  )}
                </div>

                {/* Reply Form */}
                {showReply && (
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button className="btn btn-primary btn-sm" onClick={handleSendReply}>Send Reply</button>
                      <button className="btn btn-outline btn-sm" onClick={() => { setShowReply(false); setReplyText(''); }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
