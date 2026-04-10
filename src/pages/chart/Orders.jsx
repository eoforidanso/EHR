import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePatient } from '../../contexts/PatientContext';
import { labOrderDatabase, labFacilities, users } from '../../data/mockData';

export default function Orders({ patientId }) {
  const { currentUser } = useAuth();
  const { orders, addOrder, addInboxMessage } = usePatient();
  const [showAdd, setShowAdd] = useState(false);
  const [orderType, setOrderType] = useState('Lab');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ type: 'Lab', description: '', priority: 'Routine', notes: '' });
  const [labFacilitySearch, setLabFacilitySearch] = useState('');
  const [selectedLabFacility, setSelectedLabFacility] = useState(null);
  const [labFacilityFocused, setLabFacilityFocused] = useState(false);
  const [forwardTo, setForwardTo] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const providers = users.filter(u => u.role === 'prescriber');

  const patientOrders = orders[patientId] || [];

  const filteredLabs = search.length > 0
    ? labOrderDatabase.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search))
    : labOrderDatabase;

  const handleAdd = () => {
    if (!form.description.trim()) return;
    if (isAdmin && !forwardTo) return;

    const forwardProvider = isAdmin ? providers.find(p => p.id === forwardTo) : null;

    addOrder(patientId, {
      ...form,
      labFacility: form.type === 'Lab' && selectedLabFacility ? `${selectedLabFacility.name} — ${selectedLabFacility.city}` : '',
      status: isAdmin ? 'Pending Provider Review' : 'Pending',
      orderedDate: new Date().toISOString().split('T')[0],
      orderedBy: isAdmin
        ? `${currentUser.firstName} ${currentUser.lastName} → ${forwardProvider.firstName} ${forwardProvider.lastName}`
        : `${currentUser.firstName} ${currentUser.lastName}`,
      forwardedTo: forwardProvider ? `${forwardProvider.firstName} ${forwardProvider.lastName}` : null,
    });

    if (isAdmin && forwardProvider) {
      addInboxMessage({
        type: 'Order Forward',
        from: `${currentUser.firstName} ${currentUser.lastName} (Admin)`,
        subject: `Order Forwarded: ${form.type} — ${form.description}`,
        body: `Admin ${currentUser.firstName} ${currentUser.lastName} has forwarded a ${form.priority} ${form.type} order for your review and signature.\n\nOrder: ${form.description}\nPriority: ${form.priority}\nNotes: ${form.notes || 'None'}\n\nPlease review and sign this order in the patient's chart.`,
        patient: patientId,
        date: new Date().toISOString().split('T')[0],
        status: 'Unread',
        urgent: form.priority === 'STAT',
      });
    }

    setForm({ type: 'Lab', description: '', priority: 'Routine', notes: '' });
    setSelectedLabFacility(null);
    setLabFacilitySearch('');
    setForwardTo('');
    setShowAdd(false);
  };

  const selectLabOrder = (lab) => {
    setForm({ ...form, description: form.description ? `${form.description}, ${lab.name}` : lab.name, type: 'Lab' });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>📝 Orders ({patientOrders.length})</h2>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAdd(!showAdd)}>
            + New Order
          </button>
        </div>

        {showAdd && (
          <div className="card-body" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Order Type</label>
                <select className="form-select" value={form.type} onChange={(e) => { setForm({ ...form, type: e.target.value }); setOrderType(e.target.value); }}>
                  <option>Lab</option><option>Imaging</option><option>Referral</option><option>Prescription</option><option>Procedure</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Routine</option><option>Urgent</option><option>STAT</option>
                </select>
              </div>
            </div>

            {form.type === 'Lab' && (
              <>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Lab Facility</label>
                  {selectedLabFacility ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 'var(--radius)', fontSize: 12 }}>
                      <span style={{ flex: 1 }}>🧪 <strong>{selectedLabFacility.name}</strong> — {selectedLabFacility.address}, {selectedLabFacility.city}</span>
                      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)' }} onClick={() => { setSelectedLabFacility(null); setLabFacilitySearch(''); }}>×</button>
                    </div>
                  ) : (
                    <>
                      <input
                        className="form-input"
                        value={labFacilitySearch}
                        onChange={(e) => setLabFacilitySearch(e.target.value)}
                        onFocus={() => setLabFacilityFocused(true)}
                        onBlur={() => setTimeout(() => setLabFacilityFocused(false), 200)}
                        placeholder="Search or browse all Illinois labs (Quest, LabCorp…)"
                      />
                      {labFacilityFocused && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-white)', boxShadow: 'var(--shadow-md)' }}>
                          {labFacilities.filter(f =>
                            !labFacilitySearch ||
                            f.name.toLowerCase().includes(labFacilitySearch.toLowerCase()) ||
                            f.chain.toLowerCase().includes(labFacilitySearch.toLowerCase()) ||
                            f.city.toLowerCase().includes(labFacilitySearch.toLowerCase()) ||
                            f.address.toLowerCase().includes(labFacilitySearch.toLowerCase())
                          ).map(f => (
                            <div key={f.id} style={{ padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', fontSize: 12 }}
                              onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
                              onMouseLeave={e => e.currentTarget.style.background = ''}
                              onClick={() => { setSelectedLabFacility(f); setLabFacilitySearch(''); setLabFacilityFocused(false); }}>
                              <div style={{ fontWeight: 600 }}>{f.name}</div>
                              <div style={{ color: 'var(--text-muted)' }}>{f.address}, {f.city} {f.zip} · {f.phone}</div>
                            </div>
                          ))}
                          {labFacilities.filter(f =>
                            !labFacilitySearch ||
                            f.name.toLowerCase().includes(labFacilitySearch.toLowerCase()) ||
                            f.chain.toLowerCase().includes(labFacilitySearch.toLowerCase()) ||
                            f.city.toLowerCase().includes(labFacilitySearch.toLowerCase())
                          ).length === 0 && (
                            <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No labs found</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Search Lab Orders</label>
                  <input className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search labs..." />
                  <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginTop: 4 }}>
                    {filteredLabs.map((lab) => (
                      <div
                        key={lab.code}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}
                        onClick={() => selectLabOrder(lab)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      >
                        <span>{lab.name}</span>
                        <span className="text-muted text-xs">{lab.code} · {lab.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Order Description *</label>
              <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the order..." />
            </div>
            <div className="form-group">
              <label className="form-label">Clinical Notes</label>
              <textarea className="form-textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
            {isAdmin && (
              <div className="form-group">
                <label className="form-label">Forward to Provider *</label>
                <select className="form-select" value={forwardTo} onChange={(e) => setForwardTo(e.target.value)}>
                  <option value="">— Select a provider —</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}{p.credentials ? `, ${p.credentials}` : ''} — {p.specialty}</option>
                  ))}
                </select>
                {!forwardTo && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Admin staff cannot place orders directly. Select a provider to forward this order for review and signature.</span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={handleAdd} disabled={isAdmin && !forwardTo}>
                {isAdmin ? '📨 Forward to Provider' : 'Place Order'}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card-body no-pad">
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Description</th><th>Status</th><th>Date</th><th>Ordered By</th><th>Priority</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {patientOrders.map((o) => (
                <tr key={o.id}>
                  <td><span className={`badge ${o.type === 'Lab' ? 'badge-info' : o.type === 'Referral' ? 'badge-purple' : o.type === 'Imaging' ? 'badge-warning' : 'badge-gray'}`}>{o.type}</span></td>
                  <td className="font-medium">{o.description}</td>
                  <td>
                    <span className={`badge ${
                      o.status === 'Completed' ? 'badge-success' :
                      o.status === 'Pending' ? 'badge-warning' :
                      o.status === 'Pending EPCS Auth' ? 'badge-danger' :
                      o.status === 'Pending Provider Review' ? 'badge-purple' :
                      o.status === 'Active' ? 'badge-info' : 'badge-gray'
                    }`}>{o.status}</span>
                  </td>
                  <td className="text-sm">{o.orderedDate}</td>
                  <td className="text-sm">{o.orderedBy}</td>
                  <td><span className={`badge ${o.priority === 'Urgent' || o.priority === 'STAT' ? 'badge-danger' : 'badge-gray'}`}>{o.priority}</span></td>
                  <td className="text-sm text-muted">{o.notes}</td>
                </tr>
              ))}
              {patientOrders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
