import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import { useAuth } from '../contexts/AuthContext';

const VISIT_TYPES = [
  'Follow-Up', 'Office Visit', 'Telehealth', 'Walk-In',
  'Psychiatric Evaluation', 'Medication Management',
  'Crisis Intervention', 'Urgent Care', 'Initial Evaluation',
];

export default function PatientSearch() {
  const { patients, selectPatient, addEncounter } = usePatient();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // New encounter modal state
  const [encounterModal, setEncounterModal] = useState(null); // patient object | null
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);
  const [encForm, setEncForm] = useState({});

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.dob && p.dob.includes(q))
    );
  });

  const handleSelect = (patient) => {
    selectPatient(patient.id);
    navigate(`/chart/${patient.id}/summary`);
  };

  const openEncounterModal = (e, patient) => {
    e.stopPropagation();
    selectPatient(patient.id);
    setEncForm({
      date: today,
      time: nowTime,
      type: 'Follow-Up',
      chiefComplaint: '',
      status: 'In Progress',
      provider: currentUser?.id || '',
      providerName: currentUser?.name || '',
      subjective: '', objective: '', assessment: '', plan: '',
      diagnoses: [],
    });
    setEncounterModal(patient);
  };

  const saveEncounter = () => {
    if (!encForm.chiefComplaint.trim()) return;
    addEncounter(encounterModal.id, encForm);
    setEncounterModal(null);
    navigate(`/chart/${encounterModal.id}/encounters`);
  };

  const cancelEncounter = () => {
    setEncounterModal(null);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔍 Patient Search</h1>
        <p>Search and select a patient to open their chart · <strong>{patients.length}</strong> patients in system</p>
      </div>

      <div className="card mb-4" style={{ overflow: 'visible' }}>
        <div className="card-body" style={{ padding: '14px 16px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4, pointerEvents: 'none' }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              placeholder="Search by name, MRN, or date of birth..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 15, padding: '12px 16px 12px 42px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '2px solid var(--border)', transition: 'all var(--t)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-hover)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''} {search ? `for "${search}"` : ''}</span>
            {search && <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSearch('')}>Clear search</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body no-pad">
          {search && filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <span className="icon">🔍</span>
              <h3>No patients found</h3>
              <p>Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              {!search && filtered.length > 0 && (
                <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Showing all {filtered.length} patients
                </div>
              )}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>MRN</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>Insurance</th>
                    <th>Last Visit</th>
                    <th>Flags</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => handleSelect(p)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 11, flexShrink: 0,
                        }}>
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.lastName}, {p.firstName}</div>
                          <div className="text-xs text-muted">{p.phone || p.cellPhone || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.mrn}</td>
                    <td>{p.dob}</td>
                    <td>{p.gender}</td>
                    <td className="text-sm">{p.insurance?.primary?.name || '—'}</td>
                    <td className="text-sm">{p.lastVisit || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.isBTG && <span className="badge badge-danger" style={{ fontSize: 10 }}>🔒 BTG</span>}
                        {p.flags?.filter(f => f !== 'BTG Protected').map((f, i) => (
                          <span key={i} className={`badge ${f.includes('Suicide') || f.includes('Safety') ? 'badge-danger' : f.includes('Substance') ? 'badge-warning' : f === 'VIP' ? 'badge-purple' : 'badge-info'}`} style={{ fontSize: 10 }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); handleSelect(p); }}>
                          Open Chart
                        </button>
                        <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'white', border: 'none' }}
                          onClick={(e) => openEncounterModal(e, p)}>
                          + Encounter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
      </div>

      {/* New Encounter Modal */}
      {encounterModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 680,
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>📝 New Encounter</div>
                <div className="text-sm text-muted">
                  {encounterModal.lastName}, {encounterModal.firstName} · MRN {encounterModal.mrn}
                </div>
              </div>
              <button onClick={cancelEncounter}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px' }}>
              {/* Date / Time / Type / Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={encForm.date}
                    onChange={(e) => setEncForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={encForm.time}
                    onChange={(e) => setEncForm((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Visit Type</label>
                  <select className="form-input" value={encForm.type}
                    onChange={(e) => setEncForm((p) => ({ ...p, type: e.target.value }))}>
                    {VISIT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={encForm.status}
                    onChange={(e) => setEncForm((p) => ({ ...p, status: e.target.value }))}>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Pending Co-Sign</option>
                  </select>
                </div>
              </div>

              {/* Chief Complaint */}
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Chief Complaint <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-input" type="text"
                  placeholder="e.g., Follow-up — medication management"
                  value={encForm.chiefComplaint}
                  onChange={(e) => setEncForm((p) => ({ ...p, chiefComplaint: e.target.value }))} />
              </div>

              {/* SOAP notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'S — Subjective', key: 'subjective', ph: "Patient's reported symptoms, history..." },
                  { label: 'O — Objective', key: 'objective', ph: 'Exam findings, vitals, test results...' },
                  { label: 'A — Assessment', key: 'assessment', ph: 'Clinical impression / diagnoses...' },
                  { label: 'P — Plan', key: 'plan', ph: 'Treatment plan, orders, follow-up...' },
                ].map(({ label, key, ph }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <textarea className="form-input" rows={4} placeholder={ph}
                      value={encForm[key]}
                      onChange={(e) => setEncForm((p) => ({ ...p, [key]: e.target.value }))}
                      style={{ resize: 'vertical' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              position: 'sticky', bottom: 0, background: 'var(--surface)',
            }}>
              <button className="btn" onClick={cancelEncounter}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEncounter}
                disabled={!encForm.chiefComplaint?.trim()}>
                💾 Save &amp; Open Encounter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
