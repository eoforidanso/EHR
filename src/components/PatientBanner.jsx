import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';

export default function PatientBanner() {
  const { selectedPatient } = usePatient();
  const navigate = useNavigate();

  if (!selectedPatient) return null;

  const p = selectedPatient;
  const initials = `${p.firstName[0]}${p.lastName[0]}`;

  const flagStyle = (f) => {
    if (f.toLowerCase().includes('suicid'))   return 'badge-danger';
    if (f.toLowerCase().includes('substance')) return 'badge-warning';
    if (f === 'VIP')                           return 'badge-purple';
    return 'badge-info';
  };

  const hasAllergy = p.allergies && p.allergies.length > 0;

  return (
    <div className="patient-banner">
      {/* Top row: avatar + identity + flags + actions */}
      <div className="patient-banner-main">
        <div className="patient-banner-avatar">{initials}</div>

        <div className="patient-banner-identity">
          <div className="patient-banner-name">
            {p.lastName}, {p.firstName}
            <span className="patient-banner-mrn">MRN {p.mrn}</span>
            {p.isBTG && <span className="badge badge-danger">🔒 BTG</span>}
          </div>
          <div className="patient-banner-chips">
            {p.flags && p.flags.map((f, i) => (
              <span key={i} className={`badge ${flagStyle(f)}`}>{f}</span>
            ))}
          </div>
        </div>

        <div className="patient-banner-actions">
          <button className="pba-btn" onClick={() => navigate(`/chart/${p.id}/summary`)}>📋 Chart</button>
          <button className="pba-btn" onClick={() => navigate(`/chart/${p.id}/encounters`)}>📝 Encounter</button>
          <button className="pba-btn" onClick={() => navigate('/patient-chat')}>💬 Patient Chat</button>
          <button className="pba-btn" onClick={() => navigate(`/chart/${p.id}/medications`)}>💊 Meds</button>
          <button className="pba-btn" onClick={() => navigate('/schedule')}>📅 Schedule</button>
          <button className="pba-btn" onClick={() => navigate(`/chart/${p.id}/orders`)}>⚡ Orders</button>
        </div>
      </div>

      {/* Bottom strip: key clinical data */}
      <div className="patient-banner-strip">
        <div className="pbs-item">
          <span className="pbs-label">DOB</span>
          <span className="pbs-value">{p.dob}</span>
        </div>
        <div className="pbs-item">
          <span className="pbs-label">Age</span>
          <span className="pbs-value">{p.age}</span>
        </div>
        <div className="pbs-item">
          <span className="pbs-label">Sex</span>
          <span className="pbs-value">{p.gender}</span>
        </div>
        {p.pronouns && (
          <div className="pbs-item">
            <span className="pbs-label">Pronouns</span>
            <span className="pbs-value">{p.pronouns}</span>
          </div>
        )}
        <div className="pbs-item">
          <span className="pbs-label">Insurance</span>
          <span className="pbs-value">{p.insurance?.primary?.name || '—'}</span>
        </div>
        <div className="pbs-item">
          <span className="pbs-label">PCP</span>
          <span className="pbs-value">{p.pcp || '—'}</span>
        </div>
        <div className="pbs-item">
          <span className="pbs-label">Allergies</span>
          <span className={`pbs-value ${hasAllergy ? 'critical' : ''}`}>
            {hasAllergy ? `⚠️ ${p.allergies.map(a => a.allergen || a).join(', ')}` : 'NKDA'}
          </span>
        </div>
        {p.nextAppointment && (
          <div className="pbs-item">
            <span className="pbs-label">Next Appt</span>
            <span className="pbs-value">{p.nextAppointment}</span>
          </div>
        )}
      </div>
    </div>
  );
}

