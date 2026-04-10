import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';

export default function GoToSession() {
  const { aptId } = useParams();
  const { appointments, selectPatient } = usePatient();
  const navigate = useNavigate();

  useEffect(() => {
    const apt = appointments.find((a) => a.id === aptId);
    if (apt && apt.patientId) {
      selectPatient(apt.patientId);
      navigate(`/chart/${apt.patientId}/summary`, { replace: true });
    } else {
      navigate('/schedule', { replace: true });
    }
  }, [aptId, appointments, selectPatient, navigate]);

  return (
    <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading session…</p>
    </div>
  );
}
