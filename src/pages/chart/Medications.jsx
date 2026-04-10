import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../contexts/PatientContext';
import { useAuth } from '../../contexts/AuthContext';

// ── confirmation modal ─────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmClass = 'btn-danger', onConfirm, onCancel, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 24,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
        </div>
        <div style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {message}
          {children}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-sm ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── detail panel ───────────────────────────────────────────────────────
function MedDetail({ med, patientId, onClose }) {
  const { updateMedication, removeMedication, addInboxMessage } = usePatient();
  const { currentUser } = useAuth();

  const [confirm, setConfirm] = useState(null); // 'refill' | 'delete'
  const [refillQty, setRefillQty] = useState(30);
  const [refillNote, setRefillNote] = useState('');
  const [toast, setToast] = useState(null);
  const [detailTab, setDetailTab] = useState('details');

  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── refill ─────────────────────────────────────────────────────────
  const handleRefill = () => {
    const today = new Date().toISOString().slice(0, 10);
    const time = new Date().toTimeString().slice(0, 5);

    const newEntry = {
      date: today,
      prescribedBy: currentUser?.name || 'Provider',
      pharmacy: med.pharmacy || 'Pharmacy on file',
      qty: refillQty,
      refillNumber: (med.rxHistory || []).filter(h => h.type === 'Refill' || h.type === 'Written Rx').length + 1,
      type: med.isControlled ? 'Written Rx' : 'Refill',
      note: refillNote || '',
    };

    updateMedication(patientId, med.id, {
      refillsLeft: (med.refillsLeft || 0) + 1,
      lastFilled: today,
      rxHistory: [newEntry, ...(med.rxHistory || [])],
    });

    // send to inbox as Rx Refill Request
    addInboxMessage({
      type: 'Rx Refill Request',
      from: `${currentUser?.name || 'Provider'} (System)`,
      to: currentUser?.id || 'u1',
      patient: patientId,
      patientName: null, // resolved in Inbox via patientId
      subject: `Refill Authorized: ${med.name} ${med.dose}`,
      body: `Refill authorized by ${currentUser?.name || 'Provider'}.\nMedication: ${med.name} ${med.dose}\nSIG: ${med.sig || ''}\nQty: #${refillQty}\nPharmacy: ${med.pharmacy || 'On file'}${refillNote ? `\nNote: ${refillNote}` : ''}`,
      date: today,
      time,
      priority: med.isControlled ? 'High' : 'Normal',
    });

    setConfirm(null);
    flash(`✅ Refill authorized for ${med.name}. Sent to Clinical Inbox.`);
  };

  // ── delete ─────────────────────────────────────────────────────────
  const handleDelete = () => {
    removeMedication(patientId, med.id);
    setConfirm(null);
    onClose();
  };

  // ── discontinue (soft-delete / status change) ──────────────────────
  const handleDiscontinue = () => {
    updateMedication(patientId, med.id, { status: 'Discontinued' });
    setConfirm(null);
    flash(`${med.name} marked as Discontinued.`);
  };

  const rows = [
    { label: 'Medication', val: med.name },
    { label: 'Dose', val: med.dose },
    { label: 'Route', val: med.route },
    { label: 'Frequency', val: med.frequency },
    { label: 'SIG', val: med.sig },
    { label: 'Prescriber', val: med.prescriber },
    { label: 'Start Date', val: med.startDate },
    { label: 'Pharmacy', val: med.pharmacy },
    { label: 'Last Filled', val: med.lastFilled || '—' },
    { label: 'Refills Remaining', val: med.refillsLeft ?? '—' },
    { label: 'Status', val: med.status },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 900 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--surface)', zIndex: 910, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', borderLeft: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>💊 {med.name}</div>
            <div className="text-sm text-muted" style={{ marginTop: 3 }}>{med.dose} · {med.frequency}</div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>✕</button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            margin: '10px 16px 0', padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: toast.type === 'success' ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.1)',
            color: toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.2)'}`,
          }}>
            {toast.msg}
          </div>
        )}

        {/* Badges */}
        <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          <span className={`badge ${med.status === 'Active' ? 'badge-success' : 'badge-gray'}`}>{med.status}</span>
          {med.isControlled && <span className="badge badge-warning">🔒 Controlled — {med.schedule}</span>}
          {med.refillsLeft === 0 && <span className="badge badge-danger">⚠️ No Refills</span>}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, marginTop: 8 }}>
          {[['details', '📋 Details'], ['history', '📜 Rx History']].map(([key, label]) => (
            <button key={key} onClick={() => setDetailTab(key)} style={{
              flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700,
              background: 'none', border: 'none', cursor: 'pointer',
              color: detailTab === key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${detailTab === key ? 'var(--primary)' : 'transparent'}`,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{label}</button>
          ))}
        </div>

        {/* Details */}
        {detailTab === 'details' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map(({ label, val }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', gap: 12,
                paddingBottom: 9, borderBottom: '1px solid var(--border)', fontSize: 13,
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{val ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Rx History */}
        {detailTab === 'history' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {(med.rxHistory || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No prescription history recorded.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(med.rxHistory || []).map((entry, i) => (
                <div key={i} style={{
                  padding: '11px 14px', borderRadius: 8, fontSize: 13,
                  border: `1px solid ${entry.type === 'New Prescription' ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                  background: entry.type === 'New Prescription' ? 'rgba(59,130,246,0.05)' : 'var(--bg)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: entry.type === 'New Prescription' ? 'var(--primary)' : 'var(--text)' }}>
                      {entry.type === 'New Prescription' ? '🆕 ' : '🔄 '}{entry.type}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{entry.date}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div><span style={{ fontWeight: 600 }}>Prescriber: </span>{entry.prescribedBy}</div>
                    <div><span style={{ fontWeight: 600 }}>Pharmacy: </span>{entry.pharmacy}</div>
                    <div><span style={{ fontWeight: 600 }}>Qty: </span>#{entry.qty} &nbsp;·&nbsp; <span style={{ fontWeight: 600 }}>Refill #: </span>{entry.refillNumber}</div>
                    {entry.note && <div style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--text-muted)' }}>"{entry.note}"</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0,
        }}>
          {/* Refill */}
          {med.status === 'Active' && (
            <button className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setConfirm('refill')}>
              🔄 Authorize Refill
            </button>
          )}

          {/* Discontinue */}
          {med.status === 'Active' && (
            <button className="btn"
              style={{ width: '100%', background: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.3)' }}
              onClick={() => setConfirm('discontinue')}>
              ⛔ Discontinue Medication
            </button>
          )}

          {/* Delete */}
          <button className="btn"
            style={{ width: '100%', background: 'rgba(220,38,38,0.07)', color: 'var(--danger)', border: '1px solid rgba(220,38,38,0.2)' }}
            onClick={() => setConfirm('delete')}>
            🗑️ Delete Medication Record
          </button>
        </div>
      </div>

      {/* ── Refill confirmation ── */}
      {confirm === 'refill' && (
        <ConfirmModal
          title="🔄 Authorize Refill"
          confirmLabel="✅ Confirm Refill"
          confirmClass="btn-primary"
          onConfirm={handleRefill}
          onCancel={() => setConfirm(null)}
          message={`You are authorizing a refill for:`}
        >
          <div style={{
            margin: '10px 0', padding: '10px 12px', borderRadius: 8,
            background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13,
          }}>
            <div style={{ fontWeight: 700 }}>{med.name} {med.dose}</div>
            <div className="text-muted text-sm">{med.frequency} · {med.pharmacy || 'Pharmacy on file'}</div>
            {med.isControlled && (
              <div className="badge badge-warning" style={{ marginTop: 6, display: 'inline-block' }}>
                ⚠️ Controlled Substance — {med.schedule}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Qty to dispense</label>
              <input className="form-input" type="number" min={1} max={365}
                value={refillQty} onChange={(e) => setRefillQty(Number(e.target.value))}
                style={{ fontSize: 13 }} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="form-label" style={{ fontSize: 12 }}>Note (optional)</label>
            <input className="form-input" type="text" placeholder="e.g., 90-day supply, send to CVS..."
              value={refillNote} onChange={(e) => setRefillNote(e.target.value)}
              style={{ fontSize: 13 }} />
          </div>
        </ConfirmModal>
      )}

      {/* ── Discontinue confirmation ── */}
      {confirm === 'discontinue' && (
        <ConfirmModal
          title="⛔ Discontinue Medication"
          message={`Mark ${med.name} ${med.dose} as discontinued? It will move to the inactive medications list and will not be available for new prescriptions. This can be reversed by editing the record.`}
          confirmLabel="Discontinue"
          confirmClass="btn-warning"
          onConfirm={handleDiscontinue}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Delete confirmation ── */}
      {confirm === 'delete' && (
        <ConfirmModal
          title="🗑️ Delete Medication Record"
          message={`Permanently delete ${med.name} ${med.dose} from this patient's medication list? This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          confirmClass="btn-danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

// ── main component ─────────────────────────────────────────────────────
export default function Medications({ patientId }) {
  const { meds } = usePatient();
  const navigate = useNavigate();

  const [selectedMed, setSelectedMed] = useState(null);

  const patientMeds = meds[patientId] || [];
  const active = patientMeds.filter(m => m.status === 'Active');
  const inactive = patientMeds.filter(m => m.status !== 'Active');

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>💊 Medications ({active.length} active)</h2>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/prescribe')}>
            + New Prescription
          </button>
        </div>
        <div className="card-body no-pad">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dose</th>
                <th>SIG</th>
                <th>Prescriber</th>
                <th>Start Date</th>
                <th>Pharmacy</th>
                <th>Refills</th>
                <th>Status</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.map((m) => (
                <tr key={m.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedMed(m)}
                >
                  <td>
                    <div className="font-semibold">{m.name}</div>
                    {m.isControlled && (
                      <span className="badge badge-warning" style={{ marginTop: 4, fontSize: 10 }}>
                        🔒 {m.schedule}
                      </span>
                    )}
                  </td>
                  <td className="font-medium">{m.dose}</td>
                  <td className="text-sm" style={{ maxWidth: 200 }}>{m.sig}</td>
                  <td className="text-sm">{m.prescriber}</td>
                  <td className="text-sm">{m.startDate}</td>
                  <td className="text-sm">{m.pharmacy}</td>
                  <td>
                    <span className={m.refillsLeft === 0 ? 'text-danger font-bold' : ''}>
                      {m.refillsLeft ?? '—'}
                    </span>
                  </td>
                  <td><span className="badge badge-success">{m.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary"
                      style={{ fontSize: 11 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedMed(m); }}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}

              {inactive.length > 0 && (
                <>
                  <tr>
                    <td colSpan={9} style={{ background: 'var(--bg)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>
                      Inactive / Discontinued Medications
                    </td>
                  </tr>
                  {inactive.map((m) => (
                    <tr key={m.id}
                      style={{ opacity: 0.6, cursor: 'pointer' }}
                      onClick={() => setSelectedMed(m)}
                    >
                      <td>{m.name}</td>
                      <td>{m.dose}</td>
                      <td className="text-sm">{m.sig}</td>
                      <td className="text-sm">{m.prescriber}</td>
                      <td className="text-sm">{m.startDate}</td>
                      <td className="text-sm">{m.pharmacy}</td>
                      <td>{m.refillsLeft ?? '—'}</td>
                      <td><span className="badge badge-gray">{m.status}</span></td>
                      <td>
                        <button className="btn btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedMed(m); }}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {patientMeds.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state" style={{ padding: 32 }}>
                      <span className="icon">💊</span>
                      <p>No medications on file</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMed && (
        <MedDetail
          med={patientMeds.find(m => m.id === selectedMed.id) || selectedMed}
          patientId={patientId}
          onClose={() => setSelectedMed(null)}
        />
      )}
    </div>
  );
}

