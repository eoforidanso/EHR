import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import PatientBanner from '../components/PatientBanner';
import BTGGuard from '../components/BTGGuard';

import ChartSummary from './chart/ChartSummary';
import Demographics from './chart/Demographics';
import Allergies from './chart/Allergies';
import ProblemList from './chart/ProblemList';
import Vitals from './chart/Vitals';
import Medications from './chart/Medications';
import Orders from './chart/Orders';
import Assessments from './chart/Assessments';
import Immunizations from './chart/Immunizations';
import LabResults from './chart/LabResults';
import Encounters from './chart/Encounters';

const chartTabs = [
  { key: 'summary', label: '📋 Summary', component: ChartSummary },
  { key: 'encounters', label: '🗒️ Encounters', component: Encounters },
  { key: 'demographics', label: '👤 Demographics', component: Demographics },
  { key: 'allergies', label: '⚠️ Allergies', component: Allergies },
  { key: 'problems', label: '🩺 Problems', component: ProblemList },
  { key: 'vitals', label: '💓 Vitals', component: Vitals },
  { key: 'medications', label: '💊 Medications', component: Medications },
  { key: 'orders', label: '📝 Orders', component: Orders },
  { key: 'assessments', label: '📊 Assessments', component: Assessments },
  { key: 'immunizations', label: '💉 Immunizations', component: Immunizations },
  { key: 'labs', label: '🔬 Labs', component: LabResults },
];

export default function ChartPage() {
  const { patientId, tab } = useParams();
  const { selectPatient, selectedPatient } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (patientId) {
      selectPatient(patientId);
    }
  }, [patientId, selectPatient]);

  if (!selectedPatient) {
    return (
      <div className="empty-state">
        <h3>No Patient Selected</h3>
        <p>Search for a patient to open their chart.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/patients')}>
          Search Patients
        </button>
      </div>
    );
  }

  const activeTab = tab || 'summary';
  const ActiveComponent = chartTabs.find((t) => t.key === activeTab)?.component || ChartSummary;

  return (
    <div style={{ margin: '-24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))' }}>
      <PatientBanner />

      <div style={{ padding: '12px 24px 0' }}>
        <div className="chart-nav">
          {chartTabs.map((t) => (
            <button
              key={t.key}
              className={`chart-nav-btn ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => navigate(`/chart/${patientId}/${t.key}`)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}>
        <BTGGuard patientId={patientId}>
          <ActiveComponent patientId={patientId} />
        </BTGGuard>
      </div>
    </div>
  );
}
