import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const { currentUser } = useAuth();
  const {
    openChart, selectedPatient, allergies, problemList, vitalSigns, meds,
    immunizations, labResults, assessmentScores, orders, addOrder, encounters,
    inboxMessages, appointments,
  } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'quickview' | 'ordergroup' | 'export' | 'forms'
  const menuRef = useRef(null);

  // ── Order group state ────────────────────────────────────
  const [orderGroupName, setOrderGroupName] = useState('');
  const [orderGroupItems, setOrderGroupItems] = useState([{ type: 'Lab', description: '', priority: 'Routine', notes: '' }]);
  const [orderGroupSaved, setOrderGroupSaved] = useState(false);
  const [showPatientLetter, setShowPatientLetter] = useState(false);
  const [patientLetter, setPatientLetter] = useState({ subject: '', body: '', delivery: 'portal' });
  const [letterTemplateOpen, setLetterTemplateOpen] = useState(false);

  // ── Sample letter templates ──────────────────────────────
  const getLetterTemplates = () => {
    const providerName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}${currentUser?.credentials ? ', ' + currentUser.credentials : ''}`;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const patName = `${p.firstName} ${p.lastName}`;
    const patDOB = p.dob;
    const patProbs = patProblems.map(pr => pr.name || pr.problem).join(', ') || 'N/A';
    const patMedsList = patMeds.map(m => `${m.name} ${m.dose || ''}`).join(', ') || 'N/A';

    return [
      {
        id: 'accommodation',
        icon: '♿',
        label: 'Accommodation Letter',
        subject: 'Accommodation Letter',
        body: `${today}\n\nTo Whom It May Concern,\n\nI am writing on behalf of my patient, ${patName} (DOB: ${patDOB}), who is currently under my care for the treatment of a mental health condition.\n\nBased on my clinical evaluation and ongoing treatment, ${p.firstName} has a condition that substantially limits one or more major life activities. In accordance with the Americans with Disabilities Act (ADA) and/or Section 504 of the Rehabilitation Act, I am recommending the following reasonable accommodations:\n\n• [Accommodation 1]\n• [Accommodation 2]\n• [Accommodation 3]\n\nThese accommodations are medically necessary and directly related to ${p.firstName}'s condition. They will enable ${p.firstName} to perform essential functions and participate fully in their activities.\n\nPlease do not hesitate to contact our office if you require additional information.\n\nSincerely,\n${providerName}\n[NPI Number]\n[Practice Name & Address]\n[Phone Number]`,
      },
      {
        id: 'return-school',
        icon: '🎓',
        label: 'Return to School Letter',
        subject: 'Return to School Authorization',
        body: `${today}\n\nTo Whom It May Concern,\n\nThis letter is to certify that ${patName} (DOB: ${patDOB}) has been under my psychiatric/medical care.\n\n${p.firstName} was unable to attend school/classes from [Start Date] through [End Date] due to a medical/mental health condition requiring treatment.\n\nI am pleased to confirm that ${p.firstName} is now medically cleared to return to school effective [Return Date].\n\nRecommendations for transition back:\n• [Any academic accommodations needed]\n• [Gradual return schedule if applicable]\n• [Follow-up appointment scheduled for: Date]\n\nPlease provide any attendance or academic make-up accommodations as needed during this transition period.\n\nIf you have any questions or need additional information, please contact our office.\n\nSincerely,\n${providerName}\n[Practice Name & Address]\n[Phone Number]`,
      },
      {
        id: 'esa',
        icon: '🐾',
        label: 'Emotional Support Animal',
        subject: 'Emotional Support Animal Letter',
        body: `${today}\n\nTo Whom It May Concern,\n\nI am writing to confirm that ${patName} (DOB: ${patDOB}) is a patient currently under my care. I am a licensed mental health provider and have been treating ${p.firstName} for a diagnosed mental health condition.\n\nBased on my professional assessment, ${p.firstName} has a disability-related need for an Emotional Support Animal (ESA). The presence of an ESA is a critical component of ${p.firstName}'s treatment plan and provides therapeutic benefit by alleviating one or more identified symptoms of their condition, including but not limited to:\n\n• Reduction of anxiety and panic symptoms\n• Mitigation of depressive episodes\n• Improvement in overall emotional regulation\n• Enhanced sense of security and stability\n\nUnder the Fair Housing Act (FHA), ${p.firstName} is entitled to reasonable accommodation to keep an emotional support animal in their residence, even in housing with a "no pets" policy, without being charged additional pet fees or deposits.\n\nThis letter is valid for one year from the date of issuance. Please feel free to contact me if you have any questions.\n\nSincerely,\n${providerName}\nLicense #: [License Number]\n[Practice Name & Address]\n[Phone Number]`,
      },
      {
        id: 'encounter-summary',
        icon: '📋',
        label: 'Encounter Summary',
        subject: 'Visit Summary',
        body: `${today}\n\nDear ${p.firstName},\n\nThank you for your visit on ${today}. Below is a summary of your appointment:\n\nPATIENT: ${patName} (DOB: ${patDOB}, MRN: ${p.mrn})\n\nDIAGNOSES:\n${patProblems.length > 0 ? patProblems.map(pr => `  • ${pr.name || pr.problem}${pr.icd10 ? ' (' + pr.icd10 + ')' : ''}`).join('\n') : '  • See chart for details'}\n\nCURRENT MEDICATIONS:\n${patMeds.length > 0 ? patMeds.map(m => `  • ${m.name} ${m.dose || ''} ${m.route || ''} ${m.frequency || ''}`).join('\n') : '  • No active medications'}\n\nPLAN:\n• [Treatment plan details]\n• [Medication changes if any]\n• [Follow-up instructions]\n\nNEXT APPOINTMENT: ${p.nextAppointment || '[To be scheduled]'}\n\nIf you experience any worsening symptoms, side effects, or have questions about your treatment plan, please contact our office immediately.\n\nFor emergencies, call 911 or go to your nearest emergency room.\nSuicide & Crisis Lifeline: 988\n\nSincerely,\n${providerName}\n[Practice Name & Address]`,
      },
      {
        id: 'spravato',
        icon: '💉',
        label: 'Spravato Letter',
        subject: 'Spravato (Esketamine) Treatment Authorization',
        body: `${today}\n\nTo Whom It May Concern,\n\nRE: ${patName} (DOB: ${patDOB})\n\nI am writing to document the medical necessity for Spravato® (esketamine) nasal spray treatment for my patient, ${patName}.\n\nCLINICAL JUSTIFICATION:\n${p.firstName} has been diagnosed with Treatment-Resistant Depression (TRD). ${p.firstName} has had an inadequate response to at least two adequate trials of oral antidepressant medications, including:\n\n• [Medication 1, dose, duration, response]\n• [Medication 2, dose, duration, response]\n\nCurrent psychiatric medications:\n${patMedsList}\n\nSPRAVATO TREATMENT PLAN:\n• Induction Phase (Weeks 1-4): 56 mg or 84 mg intranasally, twice weekly\n• Maintenance Phase: Once weekly or every 2 weeks, based on response\n• All treatments administered in a certified healthcare setting with 2-hour post-dose monitoring per REMS requirements\n\nThe patient has been enrolled in the Spravato REMS program and meets all eligibility criteria.\n\nPlease contact our office for any additional clinical documentation needed for prior authorization.\n\nSincerely,\n${providerName}\nDEA #: [DEA Number]\n[Practice Name & Address]\n[Phone Number]`,
      },
      {
        id: 'thank-you',
        icon: '💛',
        label: 'Thank You Letter',
        subject: 'Thank You for Your Visit',
        body: `${today}\n\nDear ${p.firstName},\n\nThank you for choosing our practice for your mental health care. It was a pleasure seeing you at your recent appointment.\n\nYour health and well-being are our top priority, and we value the trust you place in our team. We are committed to supporting you on your wellness journey.\n\nAs a reminder:\n• Your next appointment is: ${p.nextAppointment || '[Please call to schedule]'}\n• Continue taking all medications as prescribed\n• Don't hesitate to reach out if you have any questions or concerns between visits\n\nWe encourage you to use the patient portal for:\n• Secure messaging with your care team\n• Reviewing your visit summaries and lab results\n• Requesting prescription refills\n• Scheduling appointments\n\nThank you again for trusting us with your care. We look forward to seeing you at your next visit.\n\nWarm regards,\n${providerName}\n[Practice Name & Address]\n[Phone Number]`,
      },
      {
        id: 'discharge',
        icon: '📤',
        label: 'Discharge from Practice',
        subject: 'Notice of Discharge from Practice',
        body: `${today}\n\nDear ${p.firstName},\n\nVIA CERTIFIED MAIL / RETURN RECEIPT REQUESTED\n\nRE: Notification of Termination of Provider-Patient Relationship\n\nI am writing to inform you that I will no longer be able to serve as your healthcare provider, effective [Date — typically 30 days from letter date].\n\nREASON: [Select one: Non-compliance with treatment plan / Missed appointments / Other — specify]\n\nUntil the effective date, I will continue to provide necessary care. To ensure continuity of your treatment, I recommend the following:\n\n1. FIND A NEW PROVIDER: Contact your insurance company for a list of in-network mental health providers in your area, or visit psychologytoday.com.\n\n2. PRESCRIPTION COVERAGE: I will provide a [30/60/90]-day supply of your current medications to bridge until you establish care with a new provider.\n\nCurrent medications:\n${patMedsList}\n\n3. MEDICAL RECORDS: You may request a copy of your records by submitting a signed release of information to our office.\n\n4. CRISIS RESOURCES:\n   • 988 Suicide & Crisis Lifeline: Call or text 988\n   • Crisis Text Line: Text HOME to 741741\n   • Nearest Emergency Room\n\nThis letter will be retained in your medical record.\n\nSincerely,\n${providerName}\n[Practice Name & Address]`,
      },
      {
        id: 'problem-list',
        icon: '🩺',
        label: 'Patient Problem List',
        subject: 'Patient Problem List Summary',
        body: `${today}\n\nPATIENT PROBLEM LIST\n${'═'.repeat(40)}\n\nPatient: ${patName}\nDOB: ${patDOB}\nMRN: ${p.mrn}\nGenerated by: ${providerName}\n\nACTIVE PROBLEMS:\n${patProblems.length > 0 ? patProblems.map((pr, i) => `  ${i + 1}. ${pr.name || pr.problem}${pr.icd10 ? '  [' + pr.icd10 + ']' : ''}${pr.onset ? '  (Onset: ' + pr.onset + ')' : ''}${pr.status ? '  Status: ' + pr.status : ''}`).join('\n') : '  No active problems documented.'}\n\nCURRENT MEDICATIONS:\n${patMeds.length > 0 ? patMeds.map((m, i) => `  ${i + 1}. ${m.name} ${m.dose || ''} ${m.route || ''} ${m.frequency || ''} ${m.prescriber ? '— Prescribed by: ' + m.prescriber : ''}`).join('\n') : '  No active medications.'}\n\nALLERGIES:\n${patAllergies.length > 0 ? patAllergies.map(a => `  • ${a.allergen || a.name || a} — ${a.reaction || 'Reaction not specified'} (${a.severity || 'Severity unknown'})`).join('\n') : '  NKDA (No Known Drug Allergies)'}\n\nThis summary was generated from the electronic health record and is current as of the date listed above.\n\n— ${providerName}`,
      },
    ];
  };

  // ── Forms state ──────────────────────────────────────────
  const [formDelivery, setFormDelivery] = useState('portal');
  const [formsSent, setFormsSent] = useState(false);
  const [selectedForms, setSelectedForms] = useState([]);

  // ── Export state ─────────────────────────────────────────
  const [exportSections, setExportSections] = useState(['demographics', 'problems', 'medications', 'allergies', 'vitals', 'labs', 'assessments', 'immunizations']);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [exportStarted, setExportStarted] = useState(false);

  useEffect(() => {
    if (patientId) {
      openChart(patientId);
    }
  }, [patientId, openChart]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const p = selectedPatient;
  const activeTab = tab || 'summary';
  const ActiveComponent = chartTabs.find((t) => t.key === activeTab)?.component || ChartSummary;

  const patAllergies = allergies[patientId] || [];
  const patProblems = problemList[patientId] || [];
  const patVitals = vitalSigns[patientId] || [];
  const patMeds = meds[patientId] || [];
  const patLabs = labResults[patientId] || [];
  const patAssessments = assessmentScores[patientId] || [];
  const patImmunizations = immunizations[patientId] || [];
  const patOrders = orders[patientId] || [];
  const patEncounters = encounters[patientId] || [];

  const openPanel = (panel) => {
    setActivePanel(panel);
    setMenuOpen(false);
    setOrderGroupSaved(false);
    setFormsSent(false);
    setExportStarted(false);
  };

  const closePanel = () => setActivePanel(null);

  // ── Order Group handlers ─────────────────────────────────
  const addOrderGroupItem = () => {
    setOrderGroupItems(prev => [...prev, { type: 'Lab', description: '', priority: 'Routine', notes: '' }]);
  };
  const updateOrderGroupItem = (index, field, value) => {
    setOrderGroupItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };
  const removeOrderGroupItem = (index) => {
    setOrderGroupItems(prev => prev.filter((_, i) => i !== index));
  };
  const submitOrderGroup = () => {
    const validItems = orderGroupItems.filter(i => i.description.trim());
    if (validItems.length === 0) return;
    validItems.forEach(item => {
      addOrder(patientId, {
        ...item,
        groupName: orderGroupName || 'Untitled Group',
        status: 'Pending',
        orderedDate: new Date().toISOString().split('T')[0],
        orderedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      });
    });
    setOrderGroupSaved(true);
    setTimeout(() => { setOrderGroupItems([{ type: 'Lab', description: '', priority: 'Routine', notes: '' }]); setOrderGroupName(''); setShowPatientLetter(false); setPatientLetter({ subject: '', body: '', delivery: 'portal' }); }, 1500);
  };

  // ── Export handler ───────────────────────────────────────
  const handleExport = () => {
    setExportStarted(true);
    // Build text content for export
    const lines = [`Chart Export — ${p.lastName}, ${p.firstName} (MRN ${p.mrn})`, `Generated: ${new Date().toLocaleString()}`, `Format: ${exportFormat}`, ''];
    if (exportSections.includes('demographics')) {
      lines.push('══ DEMOGRAPHICS ══', `Name: ${p.lastName}, ${p.firstName}`, `DOB: ${p.dob} | Age: ${p.age} | Gender: ${p.gender}`, `Phone: ${p.phone || '—'} | Email: ${p.email || '—'}`, `Insurance: ${p.insurance?.primary?.name || '—'}`, '');
    }
    if (exportSections.includes('allergies')) {
      lines.push('══ ALLERGIES ══');
      patAllergies.length ? patAllergies.forEach(a => lines.push(`  • ${a.allergen || a.name || a} (${a.severity || 'Unknown severity'}) — ${a.reaction || '—'}`)) : lines.push('  NKDA');
      lines.push('');
    }
    if (exportSections.includes('problems')) {
      lines.push('══ PROBLEM LIST ══');
      patProblems.length ? patProblems.forEach(pr => lines.push(`  • ${pr.name || pr.problem} (${pr.status || 'Active'})`)) : lines.push('  No active problems');
      lines.push('');
    }
    if (exportSections.includes('medications')) {
      lines.push('══ MEDICATIONS ══');
      patMeds.length ? patMeds.forEach(m => lines.push(`  • ${m.name} ${m.dose || ''} ${m.route || ''} ${m.frequency || ''}`)) : lines.push('  No active medications');
      lines.push('');
    }
    if (exportSections.includes('vitals')) {
      lines.push('══ VITALS (most recent) ══');
      const v = patVitals[0];
      v ? lines.push(`  Date: ${v.date} | BP: ${v.bp} | HR: ${v.hr} | Temp: ${v.temp}°F | SpO2: ${v.spo2}% | BMI: ${v.bmi}`) : lines.push('  No vitals recorded');
      lines.push('');
    }
    if (exportSections.includes('labs')) {
      lines.push('══ LAB RESULTS (recent) ══');
      patLabs.slice(0, 10).forEach(l => lines.push(`  • ${l.test || l.name} — ${l.result || '—'} ${l.unit || ''} (${l.date})`));
      if (!patLabs.length) lines.push('  No lab results');
      lines.push('');
    }
    if (exportSections.includes('assessments')) {
      lines.push('══ ASSESSMENTS ══');
      patAssessments.slice(0, 10).forEach(a => lines.push(`  • ${a.tool || a.name}: Score ${a.score} — ${a.interpretation} (${a.date})`));
      if (!patAssessments.length) lines.push('  No assessments');
      lines.push('');
    }
    if (exportSections.includes('immunizations')) {
      lines.push('══ IMMUNIZATIONS ══');
      patImmunizations.forEach(i => lines.push(`  • ${i.vaccine || i.name} (${i.date})`));
      if (!patImmunizations.length) lines.push('  No immunizations');
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart_export_${p.mrn}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Forms & screeners ────────────────────────────────────
  const availableForms = [
    { id: 'phq9', name: 'PHQ-9 (Depression)', icon: '📊' },
    { id: 'gad7', name: 'GAD-7 (Anxiety)', icon: '📊' },
    { id: 'cssrs', name: 'C-SSRS (Suicide Risk)', icon: '🚨' },
    { id: 'auditc', name: 'AUDIT-C (Alcohol)', icon: '📊' },
    { id: 'dast10', name: 'DAST-10 (Drug Abuse)', icon: '📊' },
    { id: 'pcl5', name: 'PCL-5 (PTSD)', icon: '📊' },
    { id: 'mdq', name: 'MDQ (Bipolar Screening)', icon: '📊' },
    { id: 'consent', name: 'Informed Consent for Treatment', icon: '📝' },
    { id: 'hipaa', name: 'HIPAA Acknowledgment', icon: '📝' },
    { id: 'roi', name: 'Release of Information', icon: '📝' },
    { id: 'intake', name: 'New Patient Intake Form', icon: '📝' },
    { id: 'telehealth-consent', name: 'Telehealth Consent', icon: '📝' },
    { id: 'safety-plan', name: 'Safety Plan Template', icon: '🛡️' },
    { id: 'med-history', name: 'Medication History Form', icon: '💊' },
    { id: 'social-det', name: 'Social Determinants of Health', icon: '🏠' },
  ];
  const toggleForm = (id) => {
    setSelectedForms(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };
  const handleSendForms = () => {
    if (selectedForms.length === 0) return;
    setFormsSent(true);
    setTimeout(() => { setSelectedForms([]); }, 2000);
  };

  // ── Shared panel styles ──────────────────────────────────
  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000,
    display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.15s ease',
  };
  const panelStyle = {
    width: 480, maxWidth: '95vw', background: '#ffffff', height: '100%',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
    animation: 'slideInRight 0.2s ease',
  };
  const panelHeaderStyle = {
    padding: '18px 20px 14px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };
  const panelBodyStyle = { flex: 1, overflow: 'auto', padding: '16px 20px' };

  // ── Toggle export sections ───────────────────────────────
  const toggleExportSection = (sec) => {
    setExportSections(prev => prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]);
  };

  return (
    <div style={{ margin: '-24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))' }}>
      <PatientBanner />

      <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div className="chart-nav" style={{ flex: 1, minWidth: 0 }}>
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

        {/* Hamburger menu */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0, marginTop: 3 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title="Chart actions"
            style={{
              width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
              background: menuOpen ? 'var(--primary)' : 'var(--bg-white)', color: menuOpen ? 'white' : 'var(--text-primary)',
              cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            ☰
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 240, background: '#ffffff',
              border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              zIndex: 999, overflow: 'hidden', animation: 'fadeIn 0.12s ease',
            }}>
              {[
                { key: 'quickview', icon: '👁️', label: 'Quick View', desc: 'At-a-glance chart snapshot' },
                { key: 'ordergroup', icon: '📦', label: 'Create Order Group', desc: 'Batch multiple orders' },
                { key: 'export', icon: '📤', label: 'Chart Export', desc: 'Download chart sections' },
                { key: 'forms', icon: '📨', label: 'Send Forms & Screeners', desc: 'Send to patient for completion' },
              ].map((item, i) => (
                <div
                  key={item.key}
                  onClick={() => openPanel(item.key)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}>
        <BTGGuard patientId={patientId}>
          <ActiveComponent patientId={patientId} />
        </BTGGuard>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SLIDE-OUT PANELS
          ═══════════════════════════════════════════════════════ */}

      {/* ── Quick View ──────────────────────────────────────── */}
      {activePanel === 'quickview' && (
        <div style={overlayStyle} onClick={closePanel}>
          <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={panelHeaderStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>👁️ Quick View — {p.lastName}, {p.firstName}</h3>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={panelBodyStyle}>
              {/* Demographics snapshot */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demographics</div>
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> {p.dob}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Age:</span> {p.age}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Sex:</span> {p.gender}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Pronouns:</span> {p.pronouns || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {p.phone || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {p.email || '—'}</div>
                    <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--text-muted)' }}>Insurance:</span> {p.insurance?.primary?.name || '—'} ({p.insurance?.primary?.memberId || '—'})</div>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Allergies ({patAllergies.length})</div>
                <div className="card" style={{ padding: 12 }}>
                  {patAllergies.length === 0 ? (
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✅ NKDA</span>
                  ) : patAllergies.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '3px 0', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge ${a.severity === 'Severe' ? 'badge-danger' : a.severity === 'Moderate' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: 9 }}>{a.severity || '?'}</span>
                      <span style={{ fontWeight: 600 }}>{a.allergen || a.name || a}</span>
                      {a.reaction && <span style={{ color: 'var(--text-muted)' }}>— {a.reaction}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Problems */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Problems ({patProblems.length})</div>
                <div className="card" style={{ padding: 12 }}>
                  {patProblems.length === 0 ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active problems</span> : patProblems.map((pr, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '3px 0' }}>
                      <span style={{ fontWeight: 600 }}>{pr.name || pr.problem}</span>
                      {pr.icd10 && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 10 }}>({pr.icd10})</span>}
                      {pr.onset && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 10 }}>since {pr.onset}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Medications ({patMeds.length})</div>
                <div className="card" style={{ padding: 12 }}>
                  {patMeds.length === 0 ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active medications</span> : patMeds.map((m, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '3px 0' }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{m.dose} {m.route} {m.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Vitals */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Latest Vitals</div>
                <div className="card" style={{ padding: 12 }}>
                  {patVitals.length === 0 ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No vitals recorded</span> : (() => {
                    const v = patVitals[0];
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 12px', fontSize: 12 }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>BP:</span> <strong>{v.bp}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>HR:</span> <strong>{v.hr}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Temp:</span> <strong>{v.temp}°F</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>SpO2:</span> <strong>{v.spo2}%</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>BMI:</span> <strong>{v.bmi}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Pain:</span> <strong>{v.pain}/10</strong></div>
                        <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>Recorded {v.date} at {v.time} by {v.takenBy}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Recent Assessments */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Recent Assessments</div>
                <div className="card" style={{ padding: 12 }}>
                  {patAssessments.length === 0 ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No assessments</span> : patAssessments.slice(0, 6).map((a, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-info" style={{ fontSize: 9, flexShrink: 0 }}>{a.tool || a.name}</span>
                      <span style={{ fontWeight: 700 }}>{a.score}</span>
                      <span style={{ color: 'var(--text-muted)' }}>— {a.interpretation}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>{a.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Upcoming</div>
                <div className="card" style={{ padding: 12, fontSize: 12 }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Next Appointment:</span> <strong>{p.nextAppointment || '—'}</strong></div>
                  <div style={{ marginTop: 4 }}><span style={{ color: 'var(--text-muted)' }}>PCP:</span> {p.pcp || '—'}</div>
                  <div style={{ marginTop: 4 }}><span style={{ color: 'var(--text-muted)' }}>Pending Orders:</span> {patOrders.filter(o => o.status === 'Pending').length}</div>
                </div>
              </div>

              {/* Messaging */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>💬 Messaging</div>
                <div className="card" style={{ padding: 12 }}>
                  {(() => {
                    const patMessages = inboxMessages.filter(m => m.patient === patientId).sort((a, b) => b.date > a.date ? 1 : -1);
                    const unread = patMessages.filter(m => !m.read);
                    if (patMessages.length === 0) return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No messages for this patient</span>;
                    return (
                      <>
                        {unread.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '6px 8px', background: 'var(--danger-light)', borderRadius: 6 }}>
                            <span className="badge badge-danger" style={{ fontSize: 10 }}>{unread.length} Unread</span>
                            <span style={{ fontSize: 11, color: 'var(--danger)' }}>Requires attention</span>
                          </div>
                        )}
                        {patMessages.slice(0, 4).map((msg, i) => (
                          <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: i < Math.min(patMessages.length, 4) - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ fontSize: 9, flexShrink: 0, marginTop: 2 }}>{!msg.read ? '🔴' : '✅'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`badge ${msg.type === 'Patient Message' ? 'badge-info' : msg.type === 'Lab Result' ? 'badge-success' : msg.type === 'Prior Authorization' ? 'badge-warning' : 'badge-gray'}`} style={{ fontSize: 8, flexShrink: 0 }}>{msg.type}</span>
                                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</span>
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{msg.from} · {msg.date}</div>
                            </div>
                          </div>
                        ))}
                        {patMessages.length > 4 && (
                          <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 6, cursor: 'pointer', fontWeight: 600 }} onClick={() => { closePanel(); navigate('/inbox'); }}>
                            View all {patMessages.length} messages →
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Scheduling */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>📅 Scheduling</div>
                <div className="card" style={{ padding: 12 }}>
                  {(() => {
                    const today = new Date().toISOString().slice(0, 10);
                    const patAppts = appointments.filter(a => a.patientId === patientId).sort((a, b) => a.date > b.date ? 1 : -1);
                    const past = patAppts.filter(a => a.date < today || a.status === 'Completed').slice(-3).reverse();
                    const upcoming = patAppts.filter(a => a.date >= today && a.status !== 'Completed');
                    const noShows = patAppts.filter(a => a.status === 'No Show').length;
                    const cancelled = patAppts.filter(a => a.status === 'Cancelled').length;
                    return (
                      <>
                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                          <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'var(--bg)', borderRadius: 6 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{upcoming.length}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Upcoming</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'var(--bg)', borderRadius: 6 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)' }}>{patAppts.filter(a => a.status === 'Completed').length}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Completed</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: noShows > 0 ? 'var(--danger-light)' : 'var(--bg)', borderRadius: 6 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: noShows > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{noShows}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>No-Shows</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'var(--bg)', borderRadius: 6 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: cancelled > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{cancelled}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Cancelled</div>
                          </div>
                        </div>

                        {/* Upcoming appointments */}
                        {upcoming.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Upcoming</div>
                            {upcoming.slice(0, 3).map((apt, i) => (
                              <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: i < Math.min(upcoming.length, 3) - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>{apt.visitType === 'Telehealth' ? '📹' : '🏥'}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600 }}>{apt.date} at {apt.time}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{apt.type} · {apt.duration}min · {apt.providerName} · {apt.room}</div>
                                </div>
                                <span className={`badge ${apt.status === 'Confirmed' ? 'badge-success' : apt.status === 'Checked In' ? 'badge-info' : 'badge-gray'}`} style={{ fontSize: 8 }}>{apt.status}</span>
                              </div>
                            ))}
                            {upcoming.length > 3 && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>+{upcoming.length - 3} more upcoming</div>}
                          </>
                        )}

                        {/* Past appointments */}
                        {past.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, marginTop: 8, color: 'var(--text-secondary)' }}>Recent Visits</div>
                            {past.map((apt, i) => (
                              <div key={i} style={{ fontSize: 12, padding: '4px 0', opacity: 0.7 }}>
                                <span>{apt.date}</span>
                                <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{apt.type} · {apt.providerName} · {apt.reason}</span>
                              </div>
                            ))}
                          </>
                        )}

                        <div
                          style={{ fontSize: 11, color: 'var(--primary)', marginTop: 8, cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => { closePanel(); navigate('/schedule'); }}
                        >
                          Open full schedule →
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Billing */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>💳 Billing</div>
                <div className="card" style={{ padding: 12 }}>
                  {/* Insurance info */}
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Insurance</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, marginBottom: 10 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Primary:</span> <strong>{p.insurance?.primary?.name || '—'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Member ID:</span> {p.insurance?.primary?.memberId || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Group #:</span> {p.insurance?.primary?.groupNumber || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Copay:</span> <strong>${p.insurance?.primary?.copay || '—'}</strong></div>
                    {p.insurance?.secondary && (
                      <>
                        <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', paddingTop: 4, marginTop: 4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Secondary:</span> <strong>{p.insurance.secondary.name}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Billing codes summary */}
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Common Billing Codes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {(() => {
                      const patAppts = appointments.filter(a => a.patientId === patientId);
                      const hasNewPatient = patAppts.some(a => a.type === 'New Patient');
                      const hasTelehealth = patAppts.some(a => a.visitType === 'Telehealth');
                      const codes = [];
                      if (hasNewPatient) codes.push({ code: '99205', label: 'New Patient Eval (60 min)' });
                      codes.push({ code: '99214', label: 'Established - Moderate' });
                      codes.push({ code: '99215', label: 'Established - High' });
                      if (hasTelehealth) codes.push({ code: '99214-95', label: 'Telehealth Modifier' });
                      codes.push({ code: '90833', label: 'Psychotherapy Add-On (30 min)' });
                      codes.push({ code: '90834', label: 'Psychotherapy (45 min)' });
                      codes.push({ code: '96127', label: 'Screening (PHQ-9/GAD-7)' });
                      return codes.map(c => (
                        <span key={c.code} className="badge badge-gray" style={{ fontSize: 9, cursor: 'default' }} title={c.label}>
                          {c.code}
                        </span>
                      ));
                    })()}
                  </div>

                  {/* Account snapshot */}
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Account Snapshot</div>
                  {(() => {
                    const completed = appointments.filter(a => a.patientId === patientId && a.status === 'Completed').length;
                    const estimatedCharges = completed * (p.insurance?.primary?.copay || 30);
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, fontSize: 12 }}>
                        <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)' }}>${estimatedCharges}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Copays Collected</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>{completed}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Billed Visits</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>$0</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Balance Due</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Prior auth alerts */}
                  {(() => {
                    const paMessages = inboxMessages.filter(m => m.patient === patientId && m.type === 'Prior Authorization');
                    if (paMessages.length === 0) return null;
                    return (
                      <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--warning-light, #fff7ed)', borderRadius: 6, border: '1px solid var(--warning)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', marginBottom: 2 }}>⚠️ Prior Authorization Alerts</div>
                        {paMessages.map((pm, i) => (
                          <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {pm.subject} — <span className={`badge ${pm.status === 'Completed' ? 'badge-success' : pm.status === 'In Progress' ? 'badge-warning' : 'badge-gray'}`} style={{ fontSize: 8 }}>{pm.status}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Order Group ──────────────────────────────── */}
      {activePanel === 'ordergroup' && (
        <div style={overlayStyle} onClick={closePanel}>
          <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={panelHeaderStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📦 Create Order Group</h3>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={panelBodyStyle}>
              {orderGroupSaved ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <span style={{ fontSize: 36 }}>✅</span>
                  <h3>Order Group Submitted</h3>
                  <p>{orderGroupItems.filter(i => i.description.trim()).length} orders placed for {p.lastName}, {p.firstName}</p>
                  {showPatientLetter && patientLetter.body.trim() && (
                    <p style={{ color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>📧 Patient letter sent via {patientLetter.delivery === 'portal' ? 'Patient Portal' : patientLetter.delivery === 'email' ? 'Email' : patientLetter.delivery === 'print' ? 'Print' : 'SMS'}</p>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Group Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Quarterly Monitoring, New Patient Workup…"
                      value={orderGroupName}
                      onChange={e => setOrderGroupName(e.target.value)}
                    />
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Orders ({orderGroupItems.length})</div>

                  {orderGroupItems.map((item, i) => (
                    <div key={i} className="card" style={{ padding: 12, marginBottom: 10, background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
                        <select className="form-select" value={item.type} onChange={e => updateOrderGroupItem(i, 'type', e.target.value)} style={{ fontSize: 12, flex: '0 0 100px' }}>
                          <option>Lab</option>
                          <option>Imaging</option>
                          <option>Referral</option>
                          <option>Procedure</option>
                          <option>Consult</option>
                        </select>
                        <select className="form-select" value={item.priority} onChange={e => updateOrderGroupItem(i, 'priority', e.target.value)} style={{ fontSize: 12, flex: '0 0 90px' }}>
                          <option>Routine</option>
                          <option>Urgent</option>
                          <option>STAT</option>
                        </select>
                        {orderGroupItems.length > 1 && (
                          <button onClick={() => removeOrderGroupItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--danger)', marginLeft: 'auto' }}>🗑️</button>
                        )}
                      </div>
                      <input className="form-input" placeholder="Order description…" value={item.description} onChange={e => updateOrderGroupItem(i, 'description', e.target.value)} style={{ fontSize: 12, marginBottom: 6 }} />
                      <input className="form-input" placeholder="Notes (optional)" value={item.notes} onChange={e => updateOrderGroupItem(i, 'notes', e.target.value)} style={{ fontSize: 12 }} />
                    </div>
                  ))}

                  <button className="btn btn-sm btn-secondary" onClick={addOrderGroupItem} style={{ width: '100%', marginBottom: 12 }}>
                    + Add Another Order
                  </button>

                  {/* ── Patient Letter Toggle ────────────────── */}
                  {!showPatientLetter ? (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowPatientLetter(true)}
                      style={{ width: '100%', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Patient Letter
                    </button>
                  ) : (
                    <div className="card" style={{ padding: 14, marginBottom: 16, background: 'var(--bg)', borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>✉️</span> Patient Letter
                        </div>
                        <button
                          onClick={() => { setShowPatientLetter(false); setPatientLetter({ subject: '', body: '', delivery: 'portal' }); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--danger)' }}
                          title="Remove letter"
                        >🗑️</button>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Delivery Method</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[
                            { key: 'portal', label: '🌐 Portal' },
                            { key: 'email', label: '✉️ Email' },
                            { key: 'sms', label: '📱 SMS' },
                            { key: 'print', label: '🖨️ Print' },
                          ].map(d => (
                            <button
                              key={d.key}
                              className={`btn btn-sm ${patientLetter.delivery === d.key ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => setPatientLetter(prev => ({ ...prev, delivery: d.key }))}
                              style={{ fontSize: 11, padding: '3px 8px' }}
                            >{d.label}</button>
                          ))}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                          {patientLetter.delivery === 'portal' && `Letter will appear in ${p.firstName}'s portal inbox`}
                          {patientLetter.delivery === 'email' && `Sending to: ${p.email || 'No email on file'}`}
                          {patientLetter.delivery === 'sms' && `Sending to: ${p.cellPhone || p.phone || 'No phone on file'}`}
                          {patientLetter.delivery === 'print' && 'Letter will be generated for printing'}
                        </div>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Letter Template</label>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setLetterTemplateOpen(!letterTemplateOpen)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, padding: '7px 10px' }}
                        >
                          <span>📄 Choose a sample letter…</span>
                          <span style={{ fontSize: 9, opacity: 0.6 }}>{letterTemplateOpen ? '▲' : '▼'}</span>
                        </button>
                        {letterTemplateOpen && (
                          <div style={{ marginTop: 4, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', maxHeight: 240, overflowY: 'auto', background: '#ffffff' }}>
                            {getLetterTemplates().map(t => (
                              <div
                                key={t.id}
                                onClick={() => {
                                  setPatientLetter(prev => ({ ...prev, subject: t.subject, body: t.body }));
                                  setLetterTemplateOpen(false);
                                }}
                                style={{
                                  padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                  borderBottom: '1px solid var(--border)', fontSize: 12, transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <span style={{ fontSize: 16, width: 24, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600 }}>{t.label}</div>
                                </div>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Use →</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Subject</label>
                        <input
                          className="form-input"
                          placeholder="e.g. Your Lab Results, Follow-up Instructions…"
                          value={patientLetter.subject}
                          onChange={e => setPatientLetter(prev => ({ ...prev, subject: e.target.value }))}
                          style={{ fontSize: 12 }}
                        />
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Letter Body</label>
                        <textarea
                          className="form-input"
                          placeholder={`Dear ${p.firstName},\n\nYour provider has placed the following orders...\n\nPlease contact our office if you have any questions.`}
                          value={patientLetter.body}
                          onChange={e => setPatientLetter(prev => ({ ...prev, body: e.target.value }))}
                          style={{ fontSize: 12, minHeight: 120, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Quick insert:</span>
                        {[
                          { label: 'Greeting', text: `Dear ${p.firstName},\n\n` },
                          { label: 'Order Summary', text: `The following orders have been placed on your behalf:\n${orderGroupItems.filter(i => i.description.trim()).map(i => `  • ${i.type}: ${i.description}`).join('\n')}\n\n` },
                          { label: 'Follow-up', text: 'Please follow up with our office if you have any questions or concerns.\n' },
                          { label: 'Signature', text: `\nSincerely,\n${currentUser?.firstName} ${currentUser?.lastName}${currentUser?.credentials ? ', ' + currentUser.credentials : ''}\n` },
                        ].map(t => (
                          <button
                            key={t.label}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: 10, padding: '2px 7px' }}
                            onClick={() => setPatientLetter(prev => ({ ...prev, body: prev.body + t.text }))}
                          >{t.label}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="btn btn-primary" onClick={submitOrderGroup} style={{ width: '100%' }}>
                    Submit Order Group ({orderGroupItems.filter(i => i.description.trim()).length} orders{showPatientLetter && patientLetter.body.trim() ? ' + letter' : ''})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Chart Export ─────────────────────────────────────── */}
      {activePanel === 'export' && (
        <div style={overlayStyle} onClick={closePanel}>
          <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={panelHeaderStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📤 Chart Export — {p.lastName}, {p.firstName}</h3>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={panelBodyStyle}>
              {exportStarted ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <span style={{ fontSize: 36 }}>📤</span>
                  <h3>Export Downloaded</h3>
                  <p>Chart export has been generated with {exportSections.length} sections.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setExportStarted(false)} style={{ marginTop: 12 }}>Export Again</button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Format</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['PDF', 'CCD/CDA', 'FHIR Bundle', 'Plain Text'].map(f => (
                        <button
                          key={f}
                          className={`btn btn-sm ${exportFormat === f ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setExportFormat(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Select Sections</div>
                  {[
                    { key: 'demographics', label: '👤 Demographics' },
                    { key: 'allergies', label: '⚠️ Allergies' },
                    { key: 'problems', label: '🩺 Problem List' },
                    { key: 'medications', label: '💊 Medications' },
                    { key: 'vitals', label: '💓 Vitals' },
                    { key: 'labs', label: '🔬 Lab Results' },
                    { key: 'assessments', label: '📊 Assessments' },
                    { key: 'immunizations', label: '💉 Immunizations' },
                    { key: 'encounters', label: '🗒️ Encounters' },
                    { key: 'orders', label: '📝 Orders' },
                  ].map(sec => (
                    <label key={sec.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={exportSections.includes(sec.key)}
                        onChange={() => toggleExportSection(sec.key)}
                      />
                      {sec.label}
                    </label>
                  ))}

                  <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    ⚠️ Export contains PHI. Handle per HIPAA/institutional policy. Audit log entry will be created.
                  </div>

                  <button className="btn btn-primary" onClick={handleExport} style={{ width: '100%', marginTop: 16 }}>
                    📤 Download Export ({exportSections.length} sections)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Send Forms & Screeners ──────────────────────────── */}
      {activePanel === 'forms' && (
        <div style={overlayStyle} onClick={closePanel}>
          <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={panelHeaderStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📨 Send Forms & Screeners</h3>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={panelBodyStyle}>
              {formsSent ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <span style={{ fontSize: 36 }}>✅</span>
                  <h3>Forms Sent</h3>
                  <p>{selectedForms.length} form(s) sent to {p.firstName} {p.lastName} via {formDelivery === 'portal' ? 'Patient Portal' : formDelivery === 'email' ? 'Email' : 'SMS'}.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Delivery Method</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { key: 'portal', label: '🌐 Patient Portal' },
                        { key: 'email', label: '✉️ Email' },
                        { key: 'sms', label: '📱 SMS' },
                      ].map(d => (
                        <button
                          key={d.key}
                          className={`btn btn-sm ${formDelivery === d.key ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setFormDelivery(d.key)}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {formDelivery === 'portal' && `Will appear in ${p.firstName}'s portal inbox`}
                      {formDelivery === 'email' && `Sending to: ${p.email || 'No email on file'}`}
                      {formDelivery === 'sms' && `Sending to: ${p.cellPhone || p.phone || 'No phone on file'}`}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Screeners</div>
                  <div style={{ marginBottom: 16 }}>
                    {availableForms.filter(f => f.icon === '📊' || f.icon === '🚨').map(form => (
                      <label
                        key={form.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 13,
                          cursor: 'pointer', borderRadius: 8, marginBottom: 2,
                          background: selectedForms.includes(form.id) ? 'var(--primary-light)' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        <input type="checkbox" checked={selectedForms.includes(form.id)} onChange={() => toggleForm(form.id)} />
                        <span>{form.icon}</span>
                        <span style={{ fontWeight: selectedForms.includes(form.id) ? 700 : 400 }}>{form.name}</span>
                      </label>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Forms & Consents</div>
                  <div style={{ marginBottom: 16 }}>
                    {availableForms.filter(f => f.icon !== '📊' && f.icon !== '🚨').map(form => (
                      <label
                        key={form.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 13,
                          cursor: 'pointer', borderRadius: 8, marginBottom: 2,
                          background: selectedForms.includes(form.id) ? 'var(--primary-light)' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        <input type="checkbox" checked={selectedForms.includes(form.id)} onChange={() => toggleForm(form.id)} />
                        <span>{form.icon}</span>
                        <span style={{ fontWeight: selectedForms.includes(form.id) ? 700 : 400 }}>{form.name}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSendForms}
                    disabled={selectedForms.length === 0}
                    style={{ width: '100%', opacity: selectedForms.length === 0 ? 0.5 : 1 }}
                  >
                    📨 Send {selectedForms.length} Form{selectedForms.length !== 1 ? 's' : ''} to {p.firstName}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframes for slide panel animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
