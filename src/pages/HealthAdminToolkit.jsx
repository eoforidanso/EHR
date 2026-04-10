import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';
import { users } from '../data/mockData';

// ── All sendable forms catalog ──────────────────────────────
const FORMS_CATALOG = [
  // HIPAA / Legal
  { id: 'hipaa-npp',       category: 'HIPAA & Legal',      icon: '🔒', name: 'HIPAA Notice of Privacy Practices',         description: 'Acknowledgment of receipt of NPP — required at first visit.',              tag: 'Required' },
  { id: 'hipaa-roi',       category: 'HIPAA & Legal',      icon: '🔒', name: 'HIPAA Authorization – Release of Records',   description: 'Authorize disclosure of PHI to a third party.',                            tag: 'Required' },
  { id: 'hipaa-restrict',  category: 'HIPAA & Legal',      icon: '🔒', name: 'Request for Restriction of PHI',             description: 'Patient request to restrict use/disclosure of health information.',        tag: '' },
  { id: 'hipaa-amend',     category: 'HIPAA & Legal',      icon: '🔒', name: 'Request to Amend Health Record',             description: 'Request to correct or amend information in the medical record.',           tag: '' },
  { id: 'hipaa-access',    category: 'HIPAA & Legal',      icon: '🔒', name: 'Request for Access to Health Records',       description: 'Patient request to inspect or obtain a copy of their records.',            tag: '' },
  { id: 'consent-tx',      category: 'HIPAA & Legal',      icon: '📋', name: 'Consent for Treatment',                      description: 'General informed consent for outpatient psychiatric treatment.',           tag: 'Required' },
  { id: 'consent-telehealth',category: 'HIPAA & Legal',    icon: '📋', name: 'Telehealth Informed Consent',                description: 'Consent and acknowledgment for telehealth services per state regulations.',tag: 'Required' },
  { id: 'consent-photo',   category: 'HIPAA & Legal',      icon: '📋', name: 'Photography / Recording Consent',             description: 'Consent to photograph or record for educational or clinical purposes.',   tag: '' },
  { id: 'fin-assign',      category: 'HIPAA & Legal',      icon: '💰', name: 'Assignment of Benefits',                     description: 'Assigns insurance benefits directly to the practice.',                    tag: 'Required' },
  { id: 'fin-policy',      category: 'HIPAA & Legal',      icon: '💰', name: 'Financial Policy & Billing Agreement',        description: 'Practice billing policy, co-pay, and cancellation agreement.',            tag: 'Required' },

  // Intake & Demographic
  { id: 'intake-new',      category: 'Intake & Registration', icon: '📝', name: 'New Patient Intake Form',                 description: 'Demographics, contact, emergency contact, insurance, PCP.',               tag: 'New Patient' },
  { id: 'intake-demo',     category: 'Intake & Registration', icon: '📝', name: 'Demographic Update Form',                 description: 'Update address, phone, emergency contact, and insurance.',                tag: '' },
  { id: 'intake-insurance',category: 'Intake & Registration', icon: '📝', name: 'Insurance Verification Form',             description: 'Primary and secondary insurance information collection.',                 tag: '' },
  { id: 'intake-pharmacy', category: 'Intake & Registration', icon: '📝', name: 'Preferred Pharmacy Designation',          description: "Patient's preferred pharmacy for prescription routing.",                  tag: '' },
  { id: 'intake-social',   category: 'Intake & Registration', icon: '📝', name: 'Social & Family History Questionnaire',   description: 'Social determinants of health, family psychiatric history.',               tag: 'New Patient' },
  { id: 'intake-sleep',    category: 'Intake & Registration', icon: '📝', name: 'Sleep & Lifestyle Questionnaire',         description: 'Sleep habits, exercise, diet, substance use history.',                    tag: '' },

  // Psychiatric / Clinical
  { id: 'psych-intake',    category: 'Psychiatric Forms',  icon: '🧠', name: 'Psychiatric Intake / Chief Complaint',       description: 'Chief complaint, history of present illness, prior hospitalizations.',    tag: 'New Patient' },
  { id: 'psych-hx',        category: 'Psychiatric Forms',  icon: '🧠', name: 'Psychiatric History Form',                   description: 'Full psychiatric history, past diagnoses, prior medications.',             tag: 'New Patient' },
  { id: 'psych-sx',        category: 'Psychiatric Forms',  icon: '🧠', name: 'Symptom Checklist (SCL-90-R)',               description: 'Comprehensive 90-item symptom checklist across 9 domains.',               tag: '' },
  { id: 'psych-mood',      category: 'Psychiatric Forms',  icon: '🧠', name: 'Daily Mood Tracking Diary',                  description: 'Self-monitoring mood, energy, sleep, and medication adherence.',           tag: '' },
  { id: 'psych-safety',    category: 'Psychiatric Forms',  icon: '🚨', name: 'Safety Planning Worksheet',                  description: 'Collaborative safety plan for patients with suicidal ideation.',           tag: 'Crisis' },
  { id: 'psych-crisis',    category: 'Psychiatric Forms',  icon: '🚨', name: 'Crisis Response Plan',                       description: 'Warning signs, coping strategies, support contacts, 988 Lifeline.',       tag: 'Crisis' },
  { id: 'psych-meds',      category: 'Psychiatric Forms',  icon: '💊', name: 'Current Medications List',                   description: 'Patient self-reported medication reconciliation form.',                   tag: '' },
  { id: 'psych-allergy',   category: 'Psychiatric Forms',  icon: '⚠️', name: 'Allergy & Adverse Reactions Form',          description: 'Self-reported medication allergies and adverse reactions.',               tag: '' },
  { id: 'psych-advance',   category: 'Psychiatric Forms',  icon: '📋', name: 'Advance Directive / Psychiatric Directive',  description: 'Patient preferences for psychiatric treatment during incapacity.',         tag: '' },

  // Assessments – Psych Scales
  { id: 'phq9',            category: 'Assessments & Scales', icon: '📊', name: 'PHQ-9 — Patient Health Questionnaire',     description: 'Depression severity screening. 9 items, 0–27 scale.',                    tag: 'Depression' },
  { id: 'phq2',            category: 'Assessments & Scales', icon: '📊', name: 'PHQ-2 — Brief Depression Screen',          description: 'Ultra-brief 2-item depression pre-screen.',                              tag: 'Depression' },
  { id: 'gad7',            category: 'Assessments & Scales', icon: '📊', name: 'GAD-7 — Generalized Anxiety Disorder',     description: 'Anxiety severity screening. 7 items, 0–21 scale.',                       tag: 'Anxiety' },
  { id: 'gad2',            category: 'Assessments & Scales', icon: '📊', name: 'GAD-2 — Brief Anxiety Screen',             description: 'Ultra-brief 2-item anxiety pre-screen.',                                  tag: 'Anxiety' },
  { id: 'pcl5',            category: 'Assessments & Scales', icon: '📊', name: 'PCL-5 — PTSD Checklist (DSM-5)',           description: 'PTSD symptom severity. 20 items, 0–80 scale.',                           tag: 'PTSD' },
  { id: 'cssrs',           category: 'Assessments & Scales', icon: '🚨', name: 'C-SSRS — Columbia Suicide Severity',       description: 'Suicidal ideation and behavior rating scale.',                            tag: 'Safety' },
  { id: 'mdq',             category: 'Assessments & Scales', icon: '📊', name: 'MDQ — Mood Disorder Questionnaire',        description: 'Bipolar spectrum screening. 13 symptom items.',                          tag: 'Bipolar' },
  { id: 'ymrs',            category: 'Assessments & Scales', icon: '📊', name: 'YMRS — Young Mania Rating Scale',          description: 'Clinician-rated mania severity. 11 items.',                              tag: 'Bipolar' },
  { id: 'asrs',            category: 'Assessments & Scales', icon: '📊', name: 'ASRS v1.1 — Adult ADHD Self-Report',       description: 'WHO adult ADHD screening. 18-item symptom checklist.',                   tag: 'ADHD' },
  { id: 'audit',           category: 'Assessments & Scales', icon: '📊', name: 'AUDIT-C — Alcohol Use Disorders',          description: 'Alcohol use disorder screening. 3 items.',                               tag: 'Substance' },
  { id: 'dast10',          category: 'Assessments & Scales', icon: '📊', name: 'DAST-10 — Drug Abuse Screening Test',      description: 'Drug use disorder screening. 10 yes/no items.',                          tag: 'Substance' },
  { id: 'cage',            category: 'Assessments & Scales', icon: '📊', name: 'CAGE Questionnaire',                       description: 'Brief alcohol misuse screening. 4 yes/no items.',                        tag: 'Substance' },
  { id: 'moca',            category: 'Assessments & Scales', icon: '📊', name: 'MoCA — Montreal Cognitive Assessment',     description: 'Cognitive impairment screening. 30-point scale.',                        tag: 'Cognitive' },
  { id: 'mmse',            category: 'Assessments & Scales', icon: '📊', name: 'MMSE — Mini Mental State Exam',            description: 'Cognitive function screening for dementia. 30-point scale.',              tag: 'Cognitive' },
  { id: 'epds',            category: 'Assessments & Scales', icon: '📊', name: 'EPDS — Edinburgh Postnatal Depression',    description: 'Perinatal depression screening. 10 items.',                              tag: 'Perinatal' },
  { id: 'bdi',             category: 'Assessments & Scales', icon: '📊', name: 'BDI-II — Beck Depression Inventory',       description: 'Depression symptom severity. 21 items.',                                 tag: 'Depression' },
  { id: 'bai',             category: 'Assessments & Scales', icon: '📊', name: 'BAI — Beck Anxiety Inventory',             description: 'Anxiety symptom severity. 21 somatic/cognitive items.',                  tag: 'Anxiety' },
  { id: 'ptsd-child',      category: 'Assessments & Scales', icon: '📊', name: 'CPSS — Child PTSD Symptom Scale',          description: 'PTSD symptom screening for ages 8–18.',                                  tag: 'Pediatric' },
  { id: 'scared',          category: 'Assessments & Scales', icon: '📊', name: 'SCARED — Child Anxiety Scale',             description: 'Anxiety screening for children and adolescents. 41 items.',               tag: 'Pediatric' },

  // Medication-Specific
  { id: 'med-cloz',        category: 'Medication Monitoring', icon: '💊', name: 'Clozapine Consent & Monitoring',          description: 'REMS consent and ANC monitoring agreement for clozapine.',               tag: 'REMS' },
  { id: 'med-lithium',     category: 'Medication Monitoring', icon: '💊', name: 'Lithium Therapy Agreement',               description: 'Lab monitoring schedule and toxicity education for lithium.',             tag: '' },
  { id: 'med-controlled',  category: 'Medication Monitoring', icon: '🔒', name: 'Controlled Substance Agreement',          description: 'Opioid/stimulant treatment agreement, urine drug screen consent.',        tag: 'EPCS' },
  { id: 'med-tardive',     category: 'Medication Monitoring', icon: '💊', name: 'AIMS — Abnormal Involuntary Movement',    description: 'Tardive dyskinesia monitoring scale for antipsychotic users.',             tag: '' },
  { id: 'med-metabolic',   category: 'Medication Monitoring', icon: '💊', name: 'Metabolic Monitoring Consent',            description: 'Metabolic panel monitoring agreement for antipsychotic therapy.',          tag: '' },
];

const TAG_BADGE = {
  'Required':    'badge-danger',
  'New Patient': 'badge-info',
  'Crisis':      'badge-warning',
  'REMS':        'badge-warning',
  'EPCS':        'badge-info',
  'Depression':  'badge-success',
  'Anxiety':     'badge-success',
  'PTSD':        'badge-success',
  'Bipolar':     'badge-success',
  'ADHD':        'badge-success',
  'Substance':   'badge-gray',
  'Cognitive':   'badge-gray',
  'Safety':      'badge-warning',
  'Perinatal':   'badge-gray',
  'Pediatric':   'badge-gray',
};

const ROLE_LABELS = {
  prescriber: 'Prescriber',
  nurse: 'Nurse',
  front_desk: 'Front Desk',
  admin: 'Admin',
};

const ROLE_BADGE = {
  prescriber: 'badge-info',
  nurse: 'badge-success',
  front_desk: 'badge-gray',
  admin: 'badge-warning',
};

export default function HealthAdminToolkit() {
  const { currentUser } = useAuth();
  const { patients, appointments, btgAuditLog, inboxMessages, selectedPatient } = usePatient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Forms tab state
  const [formSearch, setFormSearch] = useState('');
  const [formCategory, setFormCategory] = useState('All');
  const [sendModal, setSendModal] = useState(null); // { form }
  const [sendPatient, setSendPatient] = useState('');
  const [sendMethod, setSendMethod] = useState('email');
  const [sendContact, setSendContact] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [sentSuccess, setSentSuccess] = useState(null);
  const [patientDropdown, setPatientDropdown] = useState([]);

  const isAdmin = currentUser?.role === 'admin';

  const totalAppts = appointments.length;
  const todayAppts = appointments.filter(
    (a) => a.date === new Date().toISOString().slice(0, 10)
  ).length;
  const activePatients = patients.filter((p) => p.isActive).length;
  const unreadMessages = inboxMessages.filter((m) => !m.read).length;

  const tabs = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'forms',     label: '📋 Forms & Outreach' },
    { id: 'users',     label: '👥 Staff' },
    { id: 'patients',  label: '🧑‍⚕️ Patients' },
    { id: 'reports',   label: '📈 Reports' },
    { id: 'settings',  label: '⚙️ Settings' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🗂️ Admin Toolkit</h1>
        <p>Practice management, staff oversight, and reporting · MindCare Health</p>
      </div>

      {!isAdmin && (
        <div className="alert alert-warning mb-4">
          <strong>⚠️ Limited Access:</strong> Some settings are restricted to admin users only. Contact your administrator for full access.
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-cards mb-4">
        <div className="stat-card">
          <span className="stat-label">Active Patients</span>
          <span className="stat-value">{activePatients}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today's Appointments</span>
          <span className="stat-value">{todayAppts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Appointments</span>
          <span className="stat-value">{totalAppts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unread Messages</span>
          <span className="stat-value">{unreadMessages}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">BTG Events</span>
          <span className="stat-value">{btgAuditLog.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Staff Members</span>
          <span className="stat-value">{users.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-4" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0, overflowX: 'auto', flexWrap: 'nowrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn btn-ghost${activeTab === t.id ? ' active' : ''}`}
            style={{
              borderRadius: '6px 6px 0 0',
              borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === t.id ? 700 : 400,
              fontSize: 13,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Send Form Modal ─────────────────────────────────── */}
      {sendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>📤 Send Form to Patient</h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{sendModal.name}</p>
              </div>
              <button onClick={() => { setSendModal(null); setSentSuccess(null); setSendPatient(''); setSendContact(''); setSendNote(''); setPatientDropdown([]); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            {sentSuccess ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Form Sent!</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                  <strong>{sendModal.name}</strong> was sent to{' '}
                  <strong>{sentSuccess.patient}</strong> via {sentSuccess.method === 'email' ? '📧 email' : '📱 SMS'} at <strong>{sentSuccess.contact}</strong>.
                </p>
                <button className="btn btn-primary mt-4" onClick={() => { setSendModal(null); setSentSuccess(null); setSendPatient(''); setSendContact(''); setSendNote(''); setPatientDropdown([]); }}>Done</button>
              </div>
            ) : (
              <div style={{ padding: '18px 20px' }}>
                {/* Patient search */}
                <div className="form-group mb-3">
                  <label className="form-label">Patient *</label>
                  <input
                    className="form-input"
                    placeholder="Search patient by name or MRN..."
                    value={sendPatient}
                    onChange={(e) => {
                      setSendPatient(e.target.value);
                      const q = e.target.value.toLowerCase();
                      setPatientDropdown(q.length > 1 ? patients.filter(p =>
                        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
                      ).slice(0, 6) : []);
                    }}
                  />
                  {patientDropdown.length > 0 && (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 6, maxHeight: 160, overflowY: 'auto', marginTop: 2 }}>
                      {patientDropdown.map((p) => (
                        <div key={p.id}
                          style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border-light)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                          onClick={() => {
                            setSendPatient(`${p.firstName} ${p.lastName} (${p.mrn})`);
                            setSendContact(sendMethod === 'email' ? (p.email || '') : (p.cellPhone || p.phone || ''));
                            setPatientDropdown([]);
                          }}
                        >
                          <strong>{p.lastName}, {p.firstName}</strong> — {p.mrn}
                          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{p.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send method */}
                <div className="form-group mb-3">
                  <label className="form-label">Send Via</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[{ id: 'email', icon: '📧', label: 'Email' }, { id: 'sms', icon: '📱', label: 'SMS / Text' }].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setSendMethod(m.id); setSendContact(''); }}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          border: sendMethod === m.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: sendMethod === m.id ? 'var(--primary-light)' : 'var(--bg)',
                          color: sendMethod === m.id ? 'var(--primary)' : 'var(--text-primary)',
                        }}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="form-group mb-3">
                  <label className="form-label">{sendMethod === 'email' ? 'Email Address *' : 'Mobile Number *'}</label>
                  <input
                    className="form-input"
                    type={sendMethod === 'email' ? 'email' : 'tel'}
                    placeholder={sendMethod === 'email' ? 'patient@email.com' : '(555) 000-0000'}
                    value={sendContact}
                    onChange={(e) => setSendContact(e.target.value)}
                  />
                </div>

                {/* Optional note */}
                <div className="form-group mb-4">
                  <label className="form-label">Message to Patient (optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder={`Please complete this form before your upcoming appointment. If you have any questions, call our office at (555) 800-1234.`}
                    value={sendNote}
                    onChange={(e) => setSendNote(e.target.value)}
                  />
                </div>

                <div className="alert alert-info mb-3" style={{ fontSize: 12 }}>
                  <strong>ℹ️ Demo mode:</strong> No actual message is transmitted. In production this would integrate with your patient messaging platform (Klara, Spruce, Luma Health, etc.).
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => { setSendModal(null); setSendPatient(''); setSendContact(''); setSendNote(''); setPatientDropdown([]); }}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={!sendPatient.trim() || !sendContact.trim()}
                    onClick={() => setSentSuccess({ patient: sendPatient, method: sendMethod, contact: sendContact })}
                  >
                    {sendMethod === 'email' ? '📧 Send Email' : '📱 Send SMS'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Forms & Outreach Tab ─────────────────────────────── */}
      {activeTab === 'forms' && (() => {
        const categories = ['All', ...Array.from(new Set(FORMS_CATALOG.map(f => f.category)))];
        const filtered = FORMS_CATALOG.filter(f => {
          const matchCat = formCategory === 'All' || f.category === formCategory;
          const q = formSearch.toLowerCase();
          const matchQ = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.tag.toLowerCase().includes(q);
          return matchCat && matchQ;
        });
        return (
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: 220 }}
                placeholder="🔍 Search forms..."
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
              />
              <select className="form-select" style={{ width: 220 }} value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} form{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Forms by category */}
            {categories.filter(c => c !== 'All' && (formCategory === 'All' || formCategory === c)).map((cat) => {
              const catForms = filtered.filter(f => f.category === cat);
              if (!catForms.length) return null;
              return (
                <div key={cat} className="mb-4">
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 2 }}>
                    {cat}
                  </div>
                  <div className="card">
                    <div className="card-body no-pad">
                      {catForms.map((form, idx) => (
                        <div key={form.id} style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                          borderBottom: idx < catForms.length - 1 ? '1px solid var(--border-light)' : 'none',
                        }}>
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{form.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {form.name}
                              {form.tag && <span className={`badge ${TAG_BADGE[form.tag] || 'badge-gray'}`} style={{ marginLeft: 8, fontSize: 10 }}>{form.tag}</span>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{form.description}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              title="Preview form"
                              onClick={() => alert(`Preview: ${form.name}\n\nIn production, this would open a PDF viewer or form preview panel.`)}
                            >
                              👁 Preview
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                const initPatient = selectedPatient
                                  ? `${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.mrn})`
                                  : '';
                                const initContact = selectedPatient
                                  ? (selectedPatient.email || selectedPatient.phone || '')
                                  : '';
                                setSendModal(form);
                                setSentSuccess(null);
                                setSendPatient(initPatient);
                                setSendContact(initContact);
                                setSendNote('');
                                setPatientDropdown([]);
                              }}
                            >
                              📤 Send
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Overview Tab */}
      {activeTab === 'overview' && (        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>⚡ Quick Actions</h2></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: '📅', label: 'View Schedule',    action: () => navigate('/schedule') },
                  { icon: '🔍', label: 'Find Patient',     action: () => navigate('/patients') },
                  { icon: '📬', label: 'Inbox',            action: () => navigate('/inbox') },
                  { icon: '🔓', label: 'BTG Audit Log',    action: () => navigate('/btg-audit') },
                  { icon: '📋', label: 'Forms & Outreach', action: () => setActiveTab('forms') },
                  { icon: '📊', label: 'Staff Report',     action: () => setActiveTab('reports') },
                ].map((a) => (
                  <button
                    key={a.label}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', fontSize: 12, padding: '7px 10px', gap: 7 }}
                    onClick={a.action}
                  >
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Info */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>🏥 Practice Info</h2></div>
            <div className="card-body">
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Practice Name', 'MindCare Health'],
                    ['Specialty', 'Outpatient Mental Health'],
                    ['NPI (Practice)', '1122334455'],
                    ['Address', '400 Wellness Blvd, Springfield, IL 62704'],
                    ['Phone', '(555) 800-1234'],
                    ['Fax', '(555) 800-1235'],
                    ['EHR Version', '1.0.0'],
                    ['Logged In As', `${currentUser?.firstName} ${currentUser?.lastName} (${ROLE_LABELS[currentUser?.role] || currentUser?.role})`],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 4px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</td>
                      <td style={{ padding: '6px 4px' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Summary */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><h2 style={{ fontSize: 13 }}>🛡️ Compliance Summary</h2></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'HIPAA Training', status: 'Current', badge: 'badge-success' },
                  { label: 'BTG Policy', status: 'Active', badge: 'badge-success' },
                  { label: 'Audit Log', status: `${btgAuditLog.length} events`, badge: 'badge-info' },
                  { label: 'DEA Compliance', status: 'Review Due', badge: 'badge-warning' },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.label}</div>
                    <span className={`badge ${item.badge}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 13 }}>👥 Staff Directory</h2>
            {isAdmin && (
              <button className="btn btn-sm btn-primary" disabled title="Feature coming soon">
                + Add Staff
              </button>
            )}
          </div>
          <div className="card-body no-pad">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Specialty</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>NPI</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>2FA</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>
                      {u.firstName} {u.lastName}
                      {u.credentials && <span style={{ color: 'var(--text-secondary)', marginLeft: 4, fontWeight: 400 }}>{u.credentials}</span>}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{u.specialty || '—'}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12 }}>{u.npi || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {u.twoFactorEnabled
                        ? <span className="badge badge-success">On</span>
                        : <span className="badge badge-gray">Off</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 13 }}>🧑‍⚕️ Patient Roster ({patients.length})</h2>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/patients')}>
              Full Search →
            </button>
          </div>
          <div className="card-body no-pad">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>MRN</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>DOB</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Provider</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Last Visit</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const provider = users.find((u) => u.id === p.assignedProvider);
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => navigate(`/chart/${p.id}/summary`)}
                    >
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>
                        {p.firstName} {p.lastName}
                        {p.isBTG && <span className="badge badge-danger" style={{ marginLeft: 6 }}>BTG</span>}
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12 }}>{p.mrn}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{p.dob}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                        {provider ? `${provider.firstName} ${provider.lastName}` : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{p.lastVisit || '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>📋 Appointment Summary</h2></div>
            <div className="card-body">
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Total Appointments', appointments.length],
                    ['Today', todayAppts],
                    ['Completed', appointments.filter((a) => a.status === 'Completed').length],
                    ['In-Person', appointments.filter((a) => a.visitType === 'In-Person').length],
                    ['Telehealth', appointments.filter((a) => a.visitType === 'Telehealth').length],
                    ['New Patient', appointments.filter((a) => a.type === 'New Patient').length],
                  ].map(([label, val]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>{label}</td>
                      <td style={{ padding: '8px 4px', fontWeight: 700, textAlign: 'right' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>👥 Provider Workload</h2></div>
            <div className="card-body">
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 600 }}>Provider</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>Appts</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>Today</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter((u) => u.role === 'prescriber').map((u) => {
                    const provAppts = appointments.filter((a) => a.provider === u.id);
                    const provToday = provAppts.filter((a) => a.date === new Date().toISOString().slice(0, 10));
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 4px' }}>{u.firstName} {u.lastName} <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{u.credentials}</span></td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{provAppts.length}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{provToday.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><h2 style={{ fontSize: 13 }}>🔓 BTG Access Report</h2></div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {btgAuditLog.length} break-the-glass events on record. 
                Review the full audit trail for HIPAA compliance.
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/btg-audit')}>
                View Full Log →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>⚙️ System Settings</h2></div>
            <div className="card-body">
              {[
                { label: 'Two-Factor Authentication', value: 'Required for prescribers', enabled: true },
                { label: 'Break-the-Glass', value: 'Enabled with audit logging', enabled: true },
                { label: 'EPCS (E-Prescribing)', value: 'Active — DEA compliant', enabled: true },
                { label: 'Telehealth Integration', value: 'Active', enabled: true },
                { label: 'Auto-logout Timeout', value: '15 minutes', enabled: true },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.value}</div>
                  </div>
                  <span className={`badge ${s.enabled ? 'badge-success' : 'badge-gray'}`}>
                    {s.enabled ? 'On' : 'Off'}
                  </span>
                </div>
              ))}
              {!isAdmin && (
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  🔒 Admin privileges required to modify settings.
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>🔔 Notification Settings</h2></div>
            <div className="card-body">
              {[
                { label: 'Appointment Reminders', value: '24h before — SMS + Email' },
                { label: 'Lab Result Alerts', value: 'Immediate — In-app + Email' },
                { label: 'Prescription Requests', value: 'Immediate — In-app' },
                { label: 'BTG Access Alerts', value: 'Immediate — Admin email' },
                { label: 'Message Notifications', value: 'Real-time — In-app' },
              ].map((n) => (
                <div key={n.label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{n.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
