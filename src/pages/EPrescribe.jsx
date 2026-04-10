import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';
import { medicationDatabase, pharmacies } from '../data/mockData';

export default function EPrescribe() {
  const { currentUser, verifyEPCS, generateEPCSOTP, verifyEPCSOTP } = useAuth();
  const { patients, selectedPatient, selectPatient, addMedication, addOrder } = usePatient();

  const [step, setStep] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [medSearch, setMedSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [prescriptionPatient, setPrescriptionPatient] = useState(selectedPatient);

  // Keep in sync if selectedPatient changes (e.g. navigated from chart)
  useEffect(() => {
    if (selectedPatient) {
      setPrescriptionPatient(selectedPatient);
      setPatientSearch('');
    }
  }, [selectedPatient?.id]);
  const [rx, setRx] = useState({
    dose: '',
    frequency: 'Once daily',
    quantity: '30',
    refills: '0',
    sig: '',
    pharmacy: '',
    notes: '',
    daw: false,
  });
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [showPharmacyDropdown, setShowPharmacyDropdown] = useState(false);

  // EPCS two-factor state
  const [epcsPhase, setEpcsPhase] = useState(1);        // 1 = PIN, 2 = OTP
  const [epcsPin, setEpcsPin] = useState(['', '', '', '']);
  const [epcsOtpInputs, setEpcsOtpInputs] = useState(['', '', '', '', '', '']);
  const [epcsError, setEpcsError] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');  // shown to demo user
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const otpTimerRef = useRef(null);

  const filteredMeds = medSearch.length > 1
    ? medicationDatabase.filter(m =>
        m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
        m.class.toLowerCase().includes(medSearch.toLowerCase())
      )
    : medicationDatabase;

  const filteredPatients = patientSearch.length > 1
    ? patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.mrn.toLowerCase().includes(patientSearch.toLowerCase())
      )
    : patients;

  const handleSelectMed = (med) => {
    setSelectedMed(med);
    setRx({ ...rx, dose: med.doses[0] });
    setStep(2);
  };

  const handleSelectPatient = (p) => {
    setPrescriptionPatient(p);
    selectPatient(p.id);
    setPatientSearch('');
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    const newPin = [...epcsPin];
    newPin[index] = value;
    setEpcsPin(newPin);
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  // Phase 1: Verify PIN → generate OTP and advance to phase 2
  const handleVerifyPin = () => {
    const pin = epcsPin.join('');
    if (verifyEPCS(pin)) {
      const otp = generateEPCSOTP();
      setGeneratedOTP(otp);
      setOtpExpiry(Date.now() + 30000);
      setOtpCountdown(30);
      setEpcsError('');
      setEpcsPhase(2);
      // Countdown timer
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(otpTimerRef.current);
            setEpcsError('One-time code expired. Please start again.');
            setEpcsPhase(1);
            setEpcsPin(['', '', '', '']);
            setEpcsOtpInputs(['', '', '', '', '', '']);
            setGeneratedOTP('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setEpcsError('Incorrect EPCS PIN. Verify your credentials and try again.');
      setEpcsPin(['', '', '', '']);
      document.getElementById('pin-0')?.focus();
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;
    const next = [...epcsOtpInputs];
    next[index] = value;
    setEpcsOtpInputs(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Phase 2: Verify OTP → submit prescription
  const handleVerifyOTP = () => {
    clearInterval(otpTimerRef.current);
    const code = epcsOtpInputs.join('');
    if (verifyEPCSOTP(code)) {
      setEpcsError('');
      handleSubmitPrescription(true);
    } else {
      setEpcsError('Invalid one-time code. Please start the authentication process again.');
      setEpcsOtpInputs(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const resetEPCS = () => {
    clearInterval(otpTimerRef.current);
    setEpcsPhase(1);
    setEpcsPin(['', '', '', '']);
    setEpcsOtpInputs(['', '', '', '', '', '']);
    setEpcsError('');
    setGeneratedOTP('');
    setStep(2);
  };

  const handleSubmitPrescription = (epcsVerified = false) => {
    if (!prescriptionPatient || !selectedMed) return;

    if (selectedMed.isControlled && !epcsVerified) {
      setStep(3);
      return;
    }

    const newMed = {
      name: selectedMed.name,
      dose: rx.dose,
      route: selectedMed.routes[0],
      frequency: rx.frequency,
      startDate: new Date().toISOString().split('T')[0],
      prescriber: `${currentUser.credentials ? currentUser.credentials + ' ' : ''}${currentUser.firstName} ${currentUser.lastName}`,
      status: 'Active',
      refillsLeft: parseInt(rx.refills) || 0,
      isControlled: selectedMed.isControlled,
      schedule: selectedMed.schedule || null,
      pharmacy: rx.pharmacy || 'Default Pharmacy',
      lastFilled: '',
      sig: rx.sig || `Take ${rx.dose} by ${selectedMed.routes[0].toLowerCase()} ${rx.frequency.toLowerCase()}`,
    };

    addMedication(prescriptionPatient.id, newMed);
    addOrder(prescriptionPatient.id, {
      type: 'Prescription',
      description: `${selectedMed.name} ${rx.dose} - ${rx.frequency}`,
      status: selectedMed.isControlled ? 'Completed (EPCS Verified)' : 'Sent to Pharmacy',
      orderedDate: new Date().toISOString().split('T')[0],
      orderedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      priority: 'Routine',
      notes: rx.notes || `Qty: ${rx.quantity}, Refills: ${rx.refills}${selectedMed.isControlled ? ' [EPCS Authenticated]' : ''}`,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setStep(1);
      setSelectedMed(null);
      setMedSearch('');
      setRx({ dose: '', frequency: 'Once daily', quantity: '30', refills: '0', sig: '', pharmacy: '', notes: '', daw: false });
      setPharmacySearch('');
      setShowPharmacyDropdown(false);
      setEpcsPin(['', '', '', '']);
      setEpcsOtpInputs(['', '', '', '', '', '']);
      setEpcsPhase(1);
      setGeneratedOTP('');
    }, 3000);
  };

  if (showSuccess) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Prescription Sent Successfully</h2>
        <p className="text-secondary">
          {selectedMed?.name} {rx.dose} has been sent to {rx.pharmacy || 'the pharmacy'}
          {selectedMed?.isControlled && ' (EPCS Verified)'}
        </p>
        <p className="text-muted mt-2">
          Patient: {prescriptionPatient?.firstName} {prescriptionPatient?.lastName}
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>💊 E-Prescribe</h1>
        <p>Electronic prescribing with EPCS authentication for controlled substances</p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        {['Select Medication', 'Prescription Details', 'EPCS Authentication'].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '10px 16px',
            background: step > i ? 'var(--primary)' : step === i + 1 ? 'var(--primary-light)' : 'var(--bg)',
            color: step > i ? 'white' : step === i + 1 ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: step === i + 1 ? 700 : 500,
            fontSize: 13,
            textAlign: 'center',
            borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
          }}>
            Step {i + 1}: {s}
          </div>
        ))}
      </div>

      {/* Patient Selection */}
      <div className="card mb-4">
        <div className="card-header">
          <h2>👤 Patient</h2>
        </div>
        <div className="card-body">
          {prescriptionPatient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {prescriptionPatient.firstName[0]}{prescriptionPatient.lastName[0]}
              </div>
              <div>
                <div className="font-bold">{prescriptionPatient.lastName}, {prescriptionPatient.firstName}</div>
                <div className="text-sm text-muted">{prescriptionPatient.mrn} · DOB: {prescriptionPatient.dob}</div>
              </div>
              <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setPrescriptionPatient(null)}>
                Change
              </button>
            </div>
          ) : (
            <div>
              <input
                className="form-input"
                placeholder="Search patient by name or MRN..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {patientSearch.length > 1 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginTop: 4, maxHeight: 200, overflowY: 'auto' }}>
                  {filteredPatients.map((p) => (
                    <div key={p.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }} onClick={() => handleSelectPatient(p)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <strong>{p.lastName}, {p.firstName}</strong> — {p.mrn}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Select Medication */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2>💊 Select Medication</h2>
          </div>
          <div className="card-body">
            <input
              className="form-input mb-3"
              placeholder="Search medications by name or class..."
              value={medSearch}
              onChange={(e) => setMedSearch(e.target.value)}
              autoFocus
              style={{ fontSize: 16, padding: '12px 16px' }}
            />
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Medication</th><th>Class</th><th>Available Doses</th><th>Route</th><th>Controlled</th><th></th></tr>
                </thead>
                <tbody>
                  {filteredMeds.map((m, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{m.name}</td>
                      <td><span className="badge badge-gray">{m.class}</span></td>
                      <td className="text-sm">{m.doses.join(', ')}</td>
                      <td>{m.routes.join(', ')}</td>
                      <td>
                        {m.isControlled ? (
                          <span className="badge badge-warning">🔒 {m.schedule}</span>
                        ) : (
                          <span className="text-muted">No</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => handleSelectMed(m)}>
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Prescription Details */}
      {step === 2 && selectedMed && (
        <div className="card">
          <div className="card-header">
            <h2>📝 Prescription Details — {selectedMed.name}</h2>
            <button className="btn btn-sm btn-secondary" onClick={() => { setStep(1); setSelectedMed(null); }}>
              ← Back
            </button>
          </div>
          <div className="card-body">
            {!prescriptionPatient && (
              <div className="alert alert-warning mb-4">
                <strong>⚠️ No patient selected.</strong> Please select a patient above before sending this prescription.
              </div>
            )}

            {selectedMed.isControlled && (
              <div className="alert alert-warning mb-4">
                <strong>⚠️ Controlled Substance ({selectedMed.schedule}):</strong> This medication requires EPCS (Electronic Prescribing for Controlled Substances) authentication with two-factor verification before it can be sent to the pharmacy.
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dose *</label>
                <select className="form-select" value={rx.dose} onChange={(e) => setRx({ ...rx, dose: e.target.value })}>
                  {selectedMed.doses.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Route</label>
                <input className="form-input" value={selectedMed.routes[0]} readOnly style={{ background: '#f1f5f9' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency *</label>
                <select className="form-select" value={rx.frequency} onChange={(e) => setRx({ ...rx, frequency: e.target.value })}>
                  <option>Once daily</option>
                  <option>Once daily in the morning</option>
                  <option>Once daily at bedtime</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Four times daily</option>
                  <option>Every 4 hours</option>
                  <option>Every 6 hours</option>
                  <option>Every 8 hours</option>
                  <option>Every 12 hours</option>
                  <option>As needed</option>
                  <option>Once weekly</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" value={rx.quantity} onChange={(e) => setRx({ ...rx, quantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Refills</label>
                <select className="form-select" value={rx.refills} onChange={(e) => setRx({ ...rx, refills: e.target.value })}>
                  {selectedMed.isControlled && selectedMed.schedule === 'Schedule II' ? (
                    <option value="0">0 (Schedule II - No refills allowed)</option>
                  ) : (
                    <>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Pharmacy *</label>
                {rx.pharmacy ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                    <span style={{ flex: 1 }}>🏥 <strong>{rx.pharmacy}</strong></span>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }} onClick={() => { setRx({ ...rx, pharmacy: '' }); setPharmacySearch(''); }}>×</button>
                  </div>
                ) : (
                  <>
                    <input className="form-input" value={pharmacySearch}
                      onChange={(e) => { setPharmacySearch(e.target.value); setShowPharmacyDropdown(true); }}
                      onFocus={() => setShowPharmacyDropdown(true)}
                      placeholder="Search pharmacy by name, chain, or city..." />
                    {showPharmacyDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-white)', boxShadow: 'var(--shadow-md)' }}>
                        {pharmacies.filter(p =>
                          !pharmacySearch || p.name.toLowerCase().includes(pharmacySearch.toLowerCase()) || p.chain.toLowerCase().includes(pharmacySearch.toLowerCase()) || p.city.toLowerCase().includes(pharmacySearch.toLowerCase()) || p.address.toLowerCase().includes(pharmacySearch.toLowerCase())
                        ).slice(0, 15).map(p => (
                          <div key={p.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', fontSize: 12 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}
                            onClick={() => { setRx({ ...rx, pharmacy: `${p.name} — ${p.address}, ${p.city}` }); setPharmacySearch(''); setShowPharmacyDropdown(false); }}>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{p.address}, {p.city}, {p.state} {p.zip} · {p.phone}</div>
                          </div>
                        ))}
                        {pharmacies.filter(p => !pharmacySearch || p.name.toLowerCase().includes(pharmacySearch.toLowerCase()) || p.chain.toLowerCase().includes(pharmacySearch.toLowerCase()) || p.city.toLowerCase().includes(pharmacySearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No pharmacies found</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">SIG (Directions)</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={rx.sig}
                onChange={(e) => setRx({ ...rx, sig: e.target.value })}
                placeholder={`Take ${rx.dose} by ${selectedMed.routes[0].toLowerCase()} ${rx.frequency.toLowerCase()}`}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" rows={2} value={rx.notes} onChange={(e) => setRx({ ...rx, notes: e.target.value })} placeholder="Additional notes..." />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={rx.daw} onChange={(e) => setRx({ ...rx, daw: e.target.checked })} />
                <span className="text-sm font-medium">Dispense as Written (DAW) — No substitutions</span>
              </label>
            </div>

            {/* Prescription Preview */}
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 'var(--radius-lg)', marginTop: 20, border: '2px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Prescription Preview</h3>
              <div className="grid-2">
                <div><span className="text-muted text-xs">Medication:</span><div className="font-bold">{selectedMed.name} {rx.dose}</div></div>
                <div><span className="text-muted text-xs">Patient:</span><div className="font-bold">{prescriptionPatient?.lastName}, {prescriptionPatient?.firstName}</div></div>
                <div><span className="text-muted text-xs">SIG:</span><div>{rx.sig || `Take ${rx.dose} by ${selectedMed.routes[0].toLowerCase()} ${rx.frequency.toLowerCase()}`}</div></div>
                <div><span className="text-muted text-xs">Qty / Refills:</span><div>{rx.quantity} / {rx.refills}</div></div>
                <div><span className="text-muted text-xs">Prescriber:</span><div>{currentUser?.credentials} {currentUser?.firstName} {currentUser?.lastName} | NPI: {currentUser?.npi}</div></div>
                <div><span className="text-muted text-xs">DEA:</span><div>{currentUser?.deaNumber}</div></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setSelectedMed(null); }}>Cancel</button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => handleSubmitPrescription()}
                disabled={!prescriptionPatient}
                title={!prescriptionPatient ? 'Select a patient above first' : ''}
              >
                {selectedMed.isControlled ? '🔒 Proceed to EPCS Authentication' : '📤 Send to Pharmacy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: EPCS Two-Factor Authentication */}
      {step === 3 && (
        <div className="card">
          <div className="card-body epcs-modal" style={{ padding: 40 }}>
            <div className="lock-icon">🔐</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>EPCS Two-Factor Authentication</h2>
            <p className="text-secondary" style={{ marginBottom: 4 }}>
              Controlled Substance: <strong>{selectedMed?.name} ({selectedMed?.schedule})</strong>
            </p>
            <p className="text-secondary" style={{ marginBottom: 20 }}>
              Patient: <strong>{prescriptionPatient?.firstName} {prescriptionPatient?.lastName}</strong>
            </p>

            {/* DEA Compliance Badge */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ background: '#1e3a8a', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                🏛️ DEA 21 CFR Part 1311
              </span>
              <span style={{ background: '#065f46', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                🔒 Two-Factor Required
              </span>
              <span style={{ background: '#92400e', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                ⚠️ {selectedMed?.schedule}
              </span>
            </div>

            {/* Phase indicator */}
            <div style={{ display: 'flex', gap: 0, maxWidth: 400, margin: '0 auto 28px', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {['Factor 1: Knowledge (PIN)', 'Factor 2: Possession (OTP)'].map((label, i) => (
                <div key={i} style={{
                  flex: 1, padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600,
                  background: epcsPhase > i ? 'var(--success)' : epcsPhase === i + 1 ? 'var(--primary)' : 'var(--bg)',
                  color: epcsPhase >= i + 1 ? 'white' : 'var(--text-muted)',
                }}>
                  {epcsPhase > i ? '✓ ' : `${i + 1}. `}{label}
                </div>
              ))}
            </div>

            {epcsError && (
              <div className="alert alert-danger" style={{ maxWidth: 480, margin: '0 auto 20px', textAlign: 'left' }}>
                🚫 {epcsError}
              </div>
            )}

            {/* ── Phase 1: PIN ── */}
            {epcsPhase === 1 && (
              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
                  <strong>🔑 Step 1 of 2 — Knowledge Factor</strong><br />
                  Enter your 4-digit EPCS PIN to verify your identity.
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Prescriber: <strong>{currentUser?.credentials} {currentUser?.firstName} {currentUser?.lastName}</strong><br />
                  DEA: <strong>{currentUser?.deaNumber}</strong> | NPI: <strong>{currentUser?.npi}</strong>
                </p>
                {/* Demo hint */}
                <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: 8, padding: '8px 14px', marginBottom: 16, fontSize: 12, textAlign: 'center' }}>
                  🧪 <strong>Demo Mode</strong> — Your mock EPCS PIN: <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 900, letterSpacing: 4, color: '#92400e' }}>{currentUser?.epcsPin}</span>
                </div>
                <div className="pin-input" style={{ justifyContent: 'center', marginBottom: 20 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      id={`pin-${i}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={epcsPin[i]}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !epcsPin[i] && i > 0) document.getElementById(`pin-${i - 1}`)?.focus();
                        if (e.key === 'Enter' && epcsPin.every(p => p)) handleVerifyPin();
                      }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={resetEPCS}>← Back</button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleVerifyPin}
                    disabled={epcsPin.some(p => !p)}
                  >
                    Verify PIN & Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Phase 2: OTP ── */}
            {epcsPhase === 2 && (
              <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
                  <strong>📱 Step 2 of 2 — Possession Factor</strong><br />
                  A one-time passcode has been sent to your registered authenticator device.<br />
                  <span style={{ color: 'var(--text-muted)' }}>This code expires in <strong style={{ color: otpCountdown <= 10 ? '#dc2626' : 'var(--success)' }}>{otpCountdown}s</strong>.</span>
                </div>

                {/* Demo OTP display — in production this would come from a hardware/software token */}
                <div style={{ textAlign: 'center', background: '#0c1222', borderRadius: 12, padding: '16px 24px', marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, letterSpacing: 1 }}>SOFT TOKEN — DEMO MODE</div>
                  <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 12, color: otpCountdown <= 10 ? '#f87171' : '#34d399', fontFamily: 'monospace' }}>
                    {generatedOTP}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>MindCare Authenticator · {new Date().toLocaleTimeString()}</div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>
                  Enter the 6-digit code shown on your authenticator app:
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={epcsOtpInputs[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !epcsOtpInputs[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
                        if (e.key === 'Enter' && epcsOtpInputs.every(p => p)) handleVerifyOTP();
                      }}
                      autoFocus={i === 0}
                      style={{
                        width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800,
                        border: '2px solid var(--border)', borderRadius: 10, outline: 'none',
                        fontFamily: 'monospace', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={resetEPCS}>← Start Over</button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleVerifyOTP}
                    disabled={epcsOtpInputs.some(p => !p)}
                    style={{ minWidth: 220 }}
                  >
                    🔓 Authenticate & Sign Prescription
                  </button>
                </div>
                <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                  DEA 21 CFR §1311.115 — Logical Access Credential Verified
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
