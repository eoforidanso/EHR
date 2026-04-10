import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

/* ── PHQ-9 & GAD-7 question banks ─────────────────────────── */
const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things, such as reading',
  'Moving or speaking so slowly that other people could have noticed',
  'Thoughts that you would be better off dead or of hurting yourself',
];
const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it\'s hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
];
const CSSRS_QUESTIONS = [
  'Have you wished you were dead or wished you could go to sleep and not wake up?',
  'Have you actually had any thoughts of killing yourself?',
  'Have you been thinking about how you might do this?',
  'Have you had these thoughts and had some intention of acting on them?',
  'Have you started to work out or worked out the details of how to kill yourself?',
  'Have you ever done anything, started to do anything, or prepared to do anything to end your life?',
];
const CSSRS_OPTIONS = [
  { value: 0, label: 'No' },
  { value: 1, label: 'Yes' },
];
const PCL5_QUESTIONS = [
  'Repeated, disturbing, and unwanted memories of the stressful experience?',
  'Repeated, disturbing dreams of the stressful experience?',
  'Suddenly feeling or acting as if the stressful experience were actually happening again?',
  'Feeling very upset when something reminded you of the stressful experience?',
  'Having strong physical reactions when reminded (heart pounding, trouble breathing, sweating)?',
  'Avoiding memories, thoughts, or feelings related to the stressful experience?',
  'Avoiding external reminders (people, places, conversations, activities, objects, situations)?',
  'Trouble remembering important parts of the stressful experience?',
  'Having strong negative beliefs about yourself, other people, or the world?',
  'Blaming yourself or someone else for the stressful experience or what happened after it?',
  'Having strong negative feelings such as fear, horror, anger, guilt, or shame?',
  'Loss of interest in activities you used to enjoy?',
  'Feeling distant or cut off from other people?',
  'Trouble experiencing positive feelings?',
  'Irritable behavior, angry outbursts, or acting aggressively?',
  'Taking too many risks or doing things that could cause you harm?',
  'Being "superalert" or watchful or on guard?',
  'Feeling jumpy or easily startled?',
  'Having difficulty concentrating?',
  'Trouble falling or staying asleep?',
];
const PCL5_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'A little bit' },
  { value: 2, label: 'Moderately' },
  { value: 3, label: 'Quite a bit' },
  { value: 4, label: 'Extremely' },
];
const AUDITC_QUESTIONS = [
  'How often do you have a drink containing alcohol?',
  'How many drinks containing alcohol do you have on a typical day when you are drinking?',
  'How often do you have 6 or more drinks on one occasion?',
];
const AUDITC_OPTIONS = [
  [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Monthly or less' },
    { value: 2, label: '2–4 times/month' },
    { value: 3, label: '2–3 times/week' },
    { value: 4, label: '4+ times/week' },
  ],
  [
    { value: 0, label: '1–2' },
    { value: 1, label: '3–4' },
    { value: 2, label: '5–6' },
    { value: 3, label: '7–9' },
    { value: 4, label: '10+' },
  ],
  [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Less than monthly' },
    { value: 2, label: 'Monthly' },
    { value: 3, label: 'Weekly' },
    { value: 4, label: 'Daily or almost' },
  ],
];
const DAST10_QUESTIONS = [
  'Have you used drugs other than those required for medical reasons?',
  'Do you abuse more than one drug at a time?',
  'Are you always able to stop using drugs when you want to? (If never used drugs, answer "No")',
  'Have you had "blackouts" or "flashbacks" as a result of drug use?',
  'Do you ever feel bad or guilty about your drug use? (If never used drugs, answer "No")',
  'Does your spouse (or parents) ever complain about your involvement with drugs?',
  'Have you neglected your family because of your use of drugs?',
  'Have you engaged in illegal activities in order to obtain drugs?',
  'Have you ever experienced withdrawal symptoms when you stopped taking drugs?',
  'Have you had medical problems as a result of your drug use?',
];
const DAST10_OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' },
];
const ASRS_QUESTIONS = [
  'How often do you have trouble wrapping up the final details of a project?',
  'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
  'How often do you have problems remembering appointments or obligations?',
  'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
  'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
  'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
];
const ASRS_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very Often' },
];
const MDQ_QUESTIONS = [
  'Has there ever been a period of time when you were not your usual self and you felt so good or hyper that others thought you were not your normal self?',
  '… you were so irritable that you shouted at people or started fights or arguments?',
  '… you felt much more self-confident than usual?',
  '… you got much less sleep than usual and found you didn\'t really miss it?',
  '… you were much more talkative or spoke faster than usual?',
  '… thoughts raced through your head and you couldn\'t slow your mind down?',
  '… you were so easily distracted by things around you that you had trouble concentrating?',
  '… you had much more energy than usual?',
  '… you were much more active or did many more things than usual?',
  '… you were much more social or outgoing, like telephoning friends in the middle of the night?',
  '… you were much more interested in sex than usual?',
  '… you did things that were unusual for you or others might have thought were excessive, foolish, or risky?',
  '… spending money got you or your family in trouble?',
];
const MDQ_OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' },
];
const MOCA_CATEGORIES = [
  { name: 'Visuospatial / Executive', maxScore: 5, description: 'Trail-making, cube copy, clock drawing' },
  { name: 'Naming', maxScore: 3, description: 'Animal naming (lion, rhino, camel)' },
  { name: 'Attention', maxScore: 6, description: 'Digit span, serial 7s, tapping task' },
  { name: 'Language', maxScore: 3, description: 'Sentence repetition, verbal fluency' },
  { name: 'Abstraction', maxScore: 2, description: 'Similarity tasks' },
  { name: 'Delayed Recall', maxScore: 5, description: '5-word recall after delay' },
  { name: 'Orientation', maxScore: 6, description: 'Date, place, city, month, year, day' },
];

/* ── Assessment tool registry ──────────────────────────────── */
const ASSESSMENT_TOOLS = {
  phq9:  { key: 'phq9',  tool: 'PHQ-9',  name: 'PHQ-9 — Patient Health Questionnaire',  category: 'Depression',  questions: PHQ9_QUESTIONS,  maxScore: 27, color: '#0066cc', bg: '#eff6ff',  icon: '📋', description: 'A 9-item validated instrument for screening, diagnosing, and measuring the severity of depression.',  required: true },
  gad7:  { key: 'gad7',  tool: 'GAD-7',  name: 'GAD-7 — Generalized Anxiety Disorder',   category: 'Anxiety',     questions: GAD7_QUESTIONS,  maxScore: 21, color: '#7c3aed', bg: '#f5f3ff',  icon: '📋', description: 'A 7-item validated instrument for screening and measuring the severity of generalized anxiety disorder.', required: true },
  cssrs: { key: 'cssrs', tool: 'Columbia Suicide Severity Rating', name: 'C-SSRS — Columbia Suicide Severity Rating Scale', category: 'Safety',  questions: CSSRS_QUESTIONS, maxScore: 6,  color: '#dc2626', bg: '#fef2f2', icon: '🛡️', description: 'A structured interview to assess suicidal ideation and behavior. Used at every visit for safety screening.' },
  pcl5:  { key: 'pcl5',  tool: 'PCL-5',  name: 'PCL-5 — PTSD Checklist',                 category: 'Trauma',      questions: PCL5_QUESTIONS,  maxScore: 80, color: '#ea580c', bg: '#fff7ed', icon: '📋', description: 'A 20-item self-report measure for PTSD symptom severity based on DSM-5 criteria. Cutoff 31-33.' },
  auditc:{ key: 'auditc',tool: 'AUDIT-C', name: 'AUDIT-C — Alcohol Use Disorders Test',   category: 'Substance',   questions: AUDITC_QUESTIONS,maxScore: 12, color: '#0891b2', bg: '#ecfeff', icon: '🍷', description: 'A 3-item alcohol screening tool to identify hazardous drinking or active alcohol use disorders.' },
  dast10:{ key: 'dast10',tool: 'DAST-10', name: 'DAST-10 — Drug Abuse Screening Test',    category: 'Substance',   questions: DAST10_QUESTIONS,maxScore: 10, color: '#4f46e5', bg: '#eef2ff', icon: '💊', description: 'A 10-item screening instrument for drug use (excluding alcohol and tobacco).' },
  asrs:  { key: 'asrs',  tool: 'ASRS v1.1',name: 'ASRS v1.1 — Adult ADHD Self-Report Scale',category: 'ADHD',      questions: ASRS_QUESTIONS,  maxScore: 24, color: '#059669', bg: '#ecfdf5', icon: '🧠', description: 'A 6-question screener developed with the WHO for adult Attention-Deficit/Hyperactivity Disorder.' },
  mdq:   { key: 'mdq',   tool: 'MDQ',     name: 'MDQ — Mood Disorder Questionnaire',      category: 'Bipolar',     questions: MDQ_QUESTIONS,   maxScore: 13, color: '#d97706', bg: '#fffbeb', icon: '🌗', description: 'A 13-item Yes/No self-report screening instrument for bipolar spectrum disorders.' },
  moca:  { key: 'moca',  tool: 'MoCA',    name: 'MoCA — Montreal Cognitive Assessment',    category: 'Cognition',   questions: MOCA_CATEGORIES.map(c => c.name), maxScore: 30, color: '#64748b', bg: '#f8fafc', icon: '🧩', description: 'A cognitive screening tool for Mild Cognitive Impairment (MCI). Normal score ≥ 26/30. Requires clinician administration.' },
};

const RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const PHARMACIES = [
  'CVS Pharmacy - Main St',
  'Walgreens - Downtown',
  'Rite Aid - Springfield',
  "Walmart Pharmacy - East Side",
  'Costco Pharmacy',
  'Hospital Outpatient Pharmacy',
  'MindCare Specialty Pharmacy',
  'Express Scripts Mail Order',
];

const LABS = [
  'Quest Diagnostics - Springfield',
  'LabCorp - Downtown Medical Center',
  'MindCare Hospital Lab',
  'BioReference Laboratories',
  'University Clinical Lab',
];

const TABS = [
  { key: 'home', icon: '🏠', label: 'Home' },
  { key: 'messages', icon: '💬', label: 'Messages' },
  { key: 'medications', icon: '💊', label: 'Medications' },
  { key: 'appointments', icon: '📅', label: 'Appointments' },
  { key: 'assessments', icon: '📊', label: 'Assessments' },
  { key: 'insurance', icon: '🏥', label: 'Insurance' },
  { key: 'telehealth', icon: '📹', label: 'Telehealth' },
];

export default function PatientPortal() {
  const { currentUser, logout } = useAuth();
  const { patients, meds, appointments, assessmentScores, addInboxMessage, inboxMessages } = usePatient();

  const [activeTab, setActiveTab] = useState('home');
  const patientId = currentUser?.patientId;
  const patient = patients.find(p => p.id === patientId);

  /* ── Patient-level data ──────────────────────────────────── */
  const patMeds = (meds[patientId] || []).filter(m => m.status === 'Active');
  const patAppts = useMemo(() =>
    appointments.filter(a => a.patientId === patientId).sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`);
      const db = new Date(`${b.date}T${b.time}`);
      return da - db;
    }),
  [appointments, patientId]);
  const futureAppts = patAppts.filter(a => new Date(`${a.date}T${a.time}`) >= new Date() && a.status !== 'Completed');
  const nextAppt = futureAppts[0];
  const patAssessments = assessmentScores[patientId] || [];

  /* ── Preferences (pharmacy, lab) local state ─────────────── */
  const [preferredPharmacy, setPreferredPharmacy] = useState(() => patMeds[0]?.pharmacy || PHARMACIES[0]);
  const [preferredLab, setPreferredLab] = useState(LABS[0]);
  const [prefSaved, setPrefSaved] = useState(false);

  /* ── Messaging ───────────────────────────────────────────── */
  const [messages, setMessages] = useState(() => {
    const providerName = patient?.assignedProvider === 'u1' ? 'Dr. Chris L.' : patient?.assignedProvider === 'u2' ? 'Joseph (NP)' : 'Your Provider';
    return [
      { id: 1, from: 'provider', name: providerName, text: `Hi ${currentUser?.firstName}, just checking in. How are you feeling on your current medication regimen? Any side effects?`, time: '2026-04-08 09:15', read: true },
      { id: 2, from: 'patient', name: currentUser?.firstName, text: 'Hi! I\'m doing okay. I think the Sertraline is helping but I\'ve been having some trouble sleeping.', time: '2026-04-08 10:32', read: true },
      { id: 3, from: 'provider', name: providerName, text: 'Thank you for letting me know. We can discuss adjusting your Trazodone dose at your next appointment. In the meantime, try to avoid screens an hour before bed and keep a consistent sleep schedule.', time: '2026-04-08 14:20', read: true },
      { id: 4, from: 'system', name: 'MindCare', text: '📋 Reminder: Your PHQ-9 and GAD-7 assessments are due before your next appointment. Please complete them under the Assessments tab.', time: '2026-04-09 08:00', read: false },
    ];
  });
  const [msgInput, setMsgInput] = useState('');
  const msgEndRef = useRef(null);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeTab]);

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), from: 'patient', name: currentUser?.firstName,
      text: msgInput.trim(), time: new Date().toISOString().replace('T', ' ').slice(0, 16), read: true,
    }]);
    // Also post to clinical inbox
    addInboxMessage({
      type: 'Patient Message',
      from: `${currentUser?.firstName} ${currentUser?.lastName} (Patient Portal)`,
      subject: `Message from ${currentUser?.firstName} ${currentUser?.lastName}`,
      body: msgInput.trim(),
      patient: patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
      date: new Date().toISOString().split('T')[0],
      status: 'Unread',
      urgent: false,
    });
    setMsgInput('');
  };

  /* ── Refill request ──────────────────────────────────────── */
  const [refillRequested, setRefillRequested] = useState({});
  const requestRefill = (med) => {
    setRefillRequested(prev => ({ ...prev, [med.id]: true }));
    addInboxMessage({
      type: 'Rx Refill Request',
      from: `${currentUser?.firstName} ${currentUser?.lastName} (Patient Portal)`,
      subject: `Refill Request: ${med.name} ${med.dose}`,
      body: `Patient ${currentUser?.firstName} ${currentUser?.lastName} is requesting a refill of ${med.name} ${med.dose} (${med.frequency}). Preferred pharmacy: ${preferredPharmacy}. Refills remaining: ${med.refillsLeft ?? 'Unknown'}.`,
      patient: patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
      date: new Date().toISOString().split('T')[0],
      status: 'Unread',
      urgent: false,
    });
  };

  /* ── Insurance editing ────────────────────────────────────── */
  const [insuranceForm, setInsuranceForm] = useState({
    primaryName: patient?.insurance?.primary?.name || '',
    primaryMemberId: patient?.insurance?.primary?.memberId || '',
    primaryGroup: patient?.insurance?.primary?.groupNumber || '',
    primaryCopay: patient?.insurance?.primary?.copay || '',
    secondaryName: patient?.insurance?.secondary?.name || '',
    secondaryMemberId: patient?.insurance?.secondary?.memberId || '',
    secondaryGroup: patient?.insurance?.secondary?.groupNumber || '',
  });
  const [insuranceSaved, setInsuranceSaved] = useState(false);
  const saveInsurance = () => { setInsuranceSaved(true); setTimeout(() => setInsuranceSaved(false), 3000); };

  /* ── Assessment taking ────────────────────────────────────── */
  const [assessmentMode, setAssessmentMode] = useState(null); // key from ASSESSMENT_TOOLS
  const [assessmentAnswers, setAssessmentAnswers] = useState([]);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState({});

  const startAssessment = (type) => {
    const toolDef = ASSESSMENT_TOOLS[type];
    if (!toolDef) return;
    if (type === 'moca') {
      // MoCA uses category-based scoring
      setAssessmentAnswers(new Array(MOCA_CATEGORIES.length).fill(-1));
    } else {
      setAssessmentAnswers(new Array(toolDef.questions.length).fill(-1));
    }
    setAssessmentMode(type);
  };
  const setAnswer = (idx, val) => {
    setAssessmentAnswers(prev => { const n = [...prev]; n[idx] = val; return n; });
  };
  const getInterpretation = (type, total) => {
    switch (type) {
      case 'phq9':
        return total <= 4 ? 'Minimal Depression' : total <= 9 ? 'Mild Depression' : total <= 14 ? 'Moderate Depression' : total <= 19 ? 'Moderately Severe Depression' : 'Severe Depression';
      case 'gad7':
        return total <= 4 ? 'Minimal Anxiety' : total <= 9 ? 'Mild Anxiety' : total <= 14 ? 'Moderate Anxiety' : 'Severe Anxiety';
      case 'cssrs':
        return total === 0 ? 'No Suicidal Ideation' : total <= 2 ? 'Low Risk — Passive Ideation' : total <= 4 ? 'Moderate Risk — Active Ideation' : 'High Risk — Active Ideation with Plan';
      case 'pcl5':
        return total < 31 ? 'Below PTSD Threshold' : total <= 33 ? 'Borderline PTSD' : 'Probable PTSD';
      case 'auditc':
        return total <= 2 ? 'Low Risk' : total <= 3 ? 'Moderate Risk' : 'Positive for Alcohol Misuse';
      case 'dast10':
        return total === 0 ? 'No Problems Reported' : total <= 2 ? 'Low Level' : total <= 5 ? 'Moderate Level' : total <= 8 ? 'Substantial Level' : 'Severe Level';
      case 'asrs':
        return total >= 14 ? 'Highly Consistent with ADHD' : total >= 10 ? 'Possible ADHD' : 'Low Likelihood of ADHD';
      case 'mdq':
        return total >= 7 ? 'Positive for Bipolar Spectrum' : 'Negative Screen';
      case 'moca':
        return total >= 26 ? 'Normal Cognition' : total >= 18 ? 'Mild Cognitive Impairment' : 'Possible Dementia';
      default: return '';
    }
  };
  const submitAssessment = () => {
    const total = assessmentAnswers.reduce((sum, v) => sum + (v >= 0 ? v : 0), 0);
    const toolDef = ASSESSMENT_TOOLS[assessmentMode];
    const interpretation = getInterpretation(assessmentMode, total);
    addInboxMessage({
      type: 'Patient Message',
      from: `${currentUser?.firstName} ${currentUser?.lastName} (Patient Portal)`,
      subject: `${toolDef.tool} Assessment Completed — Score: ${total}`,
      body: `Patient completed ${toolDef.tool} via Patient Portal.\n\nScore: ${total}/${toolDef.maxScore}\nInterpretation: ${interpretation}\nAnswers: [${assessmentAnswers.join(', ')}]\nDate: ${new Date().toLocaleDateString()}`,
      patient: patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
      date: new Date().toISOString().split('T')[0],
      status: 'Unread',
      urgent: (assessmentMode === 'cssrs' && total >= 3) || (assessmentMode === 'phq9' && total >= 20),
    });
    setAssessmentSubmitted(prev => ({ ...prev, [assessmentMode]: { score: total, maxScore: toolDef.maxScore, interpretation, date: new Date().toLocaleDateString() } }));
    setAssessmentMode(null);
  };

  /* ── Telehealth ────────────────────────────────────────────── */
  const teleAppts = futureAppts.filter(a => a.visitType === 'Telehealth');

  if (!patient) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Patient record not found</h2>
          <p style={{ color: '#6b7ea0', marginTop: 8 }}>Please contact your care team for portal access.</p>
          <button onClick={logout} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 8, background: '#0066cc', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>
    );
  }

  const providerName = patient.assignedProvider === 'u1' ? 'Dr. Chris L., MD PhD' : patient.assignedProvider === 'u2' ? 'Joseph, PMHNP-BC' : patient.assignedProvider === 'u3' ? 'Dr. Irina S., MD' : 'Your Provider';

  /* ── Styles ──────────────────────────────────────────────── */
  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' };
  const cardHeaderStyle = (icon) => ({ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', letterSpacing: '-0.2px' });
  const sectionLabel = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── Top Navigation Bar ─────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #0d2444 0%, #1b3d6e 100%)',
        padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px' }}>MindCare</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px' }}>Patient Portal</div>
          </div>
        </div>

        {/* Tab Nav */}
        <nav style={{ display: 'flex', gap: 2, height: '100%' }}>
          {TABS.map(t => {
            const isActive = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '0 16px', background: 'none', border: 'none', cursor: 'pointer',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: isActive ? 700 : 500,
                display: 'flex', alignItems: 'center', gap: 5, position: 'relative',
                borderBottom: isActive ? '2px solid #60a5fa' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{currentUser?.firstName} {currentUser?.lastName}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>MRN {patient.mrn}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800,
          }}>
            {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
          </div>
          <button onClick={logout} style={{
            padding: '6px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>Sign Out</button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 48px' }}>

        {/* ════════════ HOME TAB ════════════ */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Welcome banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1b3d6e 0%, #0055a8 100%)',
              borderRadius: 14, padding: '28px 32px', marginBottom: 24, color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>
                  Welcome back, {currentUser?.firstName}
                </h1>
                <p style={{ opacity: 0.7, fontSize: 13 }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {nextAppt && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 8, width: 'fit-content' }}>
                    <span style={{ fontSize: 16 }}>📅</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>Next Appointment: {new Date(nextAppt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {nextAppt.time}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{nextAppt.type} with {nextAppt.providerName} · {nextAppt.visitType}</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => setActiveTab('messages')} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>💬 Message Provider</button>
                <button onClick={() => setActiveTab('assessments')} style={{ padding: '8px 18px', borderRadius: 8, background: '#f59e0b', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📊 Complete Assessments</button>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { icon: '💊', label: 'Active Meds', value: patMeds.length, color: '#3b82f6', onClick: () => setActiveTab('medications') },
                { icon: '📅', label: 'Upcoming Appts', value: futureAppts.length, color: '#8b5cf6', onClick: () => setActiveTab('appointments') },
                { icon: '💬', label: 'Messages', value: messages.filter(m => !m.read).length || 0, color: '#10b981', onClick: () => setActiveTab('messages') },
                { icon: '📊', label: 'Assessments Due', value: (assessmentSubmitted.phq9 ? 0 : 1) + (assessmentSubmitted.gad7 ? 0 : 1), color: '#f59e0b', onClick: () => setActiveTab('assessments') },
              ].map(s => (
                <div key={s.label} onClick={s.onClick} style={{
                  ...cardStyle, cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Two-column: Provider info + Preferences */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
              {/* Care Team */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle()}>🩺 Your Care Team</div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>
                      {providerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{providerName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Psychiatry · Primary Provider</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
                    <div><strong>PCP:</strong> {patient.pcp || '—'}</div>
                    <div><strong>Phone:</strong> (555) 100-2000</div>
                    <div><strong>After Hours:</strong> Call 988 (Suicide & Crisis Lifeline)</div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle()}>⚙️ My Preferences</div>
                <div style={{ padding: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={sectionLabel}>Preferred Pharmacy</label>
                    <select value={preferredPharmacy} onChange={e => { setPreferredPharmacy(e.target.value); setPrefSaved(false); }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 12, background: '#fff', cursor: 'pointer' }}>
                      {PHARMACIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={sectionLabel}>Preferred Lab</label>
                    <select value={preferredLab} onChange={e => { setPreferredLab(e.target.value); setPrefSaved(false); }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 12, background: '#fff', cursor: 'pointer' }}>
                      {LABS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { setPrefSaved(true); setTimeout(() => setPrefSaved(false), 3000); }}
                    style={{ padding: '7px 18px', borderRadius: 6, background: '#0066cc', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    {prefSaved ? '✅ Saved' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>

            {/* Medications preview */}
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={{ ...cardHeaderStyle(), justifyContent: 'space-between' }}>
                <span>💊 Current Medications</span>
                <button onClick={() => setActiveTab('medications')} style={{ background: 'none', border: 'none', color: '#0066cc', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All →</button>
              </div>
              <div style={{ padding: 0 }}>
                {patMeds.slice(0, 4).map(m => (
                  <div key={m.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{m.dose} · {m.frequency}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8' }}>
                      Last filled: {m.lastFilled || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crisis resources */}
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#991b1b', marginBottom: 6 }}>🚨 Crisis Resources</div>
              <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.7 }}>
                <strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988 · <strong>Crisis Text Line:</strong> Text HOME to 741741 · <strong>Emergency:</strong> Call 911
              </div>
            </div>
          </div>
        )}

        {/* ════════════ MESSAGES TAB ════════════ */}
        {activeTab === 'messages' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            <div style={{ ...cardStyle, height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...cardHeaderStyle(), justifyContent: 'space-between' }}>
                <span>💬 Messages with Your Care Team</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Provider: {providerName}</span>
              </div>

              {/* Message thread */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                {messages.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', justifyContent: m.from === 'patient' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '70%', padding: '10px 14px', borderRadius: 12,
                      background: m.from === 'patient' ? '#0066cc' : m.from === 'system' ? '#fef3c7' : '#fff',
                      color: m.from === 'patient' ? '#fff' : '#1e293b',
                      border: m.from === 'system' ? '1px solid #fde68a' : m.from === 'provider' ? '1px solid #e2e8f0' : 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: m.from === 'patient' ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: 4 }}>
                        {m.from === 'system' ? '⚙️ System' : m.name} · {m.time.split(' ')[1] || m.time}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.55 }}>{m.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>

              {/* Compose */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, background: '#fff' }}>
                <input
                  type="text"
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message to your provider..."
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
                <button onClick={sendMessage} disabled={!msgInput.trim()} style={{
                  padding: '10px 20px', borderRadius: 8, background: msgInput.trim() ? '#0066cc' : '#cbd5e1',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: msgInput.trim() ? 'pointer' : 'not-allowed',
                }}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ MEDICATIONS TAB ════════════ */}
        {activeTab === 'medications' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Pharmacy + Lab info bar */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ ...cardStyle, flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>🏪</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Pharmacy</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{preferredPharmacy}</div>
                </div>
              </div>
              <div style={{ ...cardStyle, flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>🔬</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Lab</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{preferredLab}</div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ ...cardHeaderStyle(), justifyContent: 'space-between' }}>
                <span>💊 My Medications ({patMeds.length} active)</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Click "Request Refill" to send to your provider</span>
              </div>
              <div>
                {patMeds.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
                    <div style={{ fontWeight: 700 }}>No active medications</div>
                  </div>
                ) : patMeds.map(m => {
                  const lastHistory = m.rxHistory?.[0];
                  return (
                    <div key={m.id} style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: m.isControlled ? '#fef3c7' : '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                      }}>
                        {m.isControlled ? '⚠️' : '💊'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                          {m.isControlled && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#fef3c7', color: '#92400e' }}>Schedule {m.schedule}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                          <strong>{m.dose}</strong> · {m.route} · {m.frequency}
                        </div>
                        {m.sig && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>Sig: {m.sig}</div>}
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span>📅 Last filled: <strong>{m.lastFilled || '—'}</strong></span>
                          <span>🔄 Refills remaining: <strong>{m.refillsLeft ?? '—'}</strong></span>
                          <span>👨‍⚕️ Prescriber: {m.prescriber}</span>
                          <span>🏪 Pharmacy: {m.pharmacy}</span>
                        </div>
                        {lastHistory && (
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                            Last Rx: {lastHistory.type} on {lastHistory.date} · Qty: {lastHistory.qty} · #{lastHistory.refillNumber}
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {m.isControlled ? (
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, padding: '6px 12px', background: '#fef3c7', borderRadius: 6 }}>
                            Contact office
                          </div>
                        ) : refillRequested[m.id] ? (
                          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 700, padding: '6px 12px', background: '#dcfce7', borderRadius: 6 }}>
                            ✅ Requested
                          </div>
                        ) : (
                          <button onClick={() => requestRefill(m)} style={{
                            padding: '6px 14px', borderRadius: 6, background: '#0066cc', color: '#fff',
                            border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}>Request Refill</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ APPOINTMENTS TAB ════════════ */}
        {activeTab === 'appointments' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            <div style={cardStyle}>
              <div style={cardHeaderStyle()}>📅 My Appointments</div>
              <div>
                {futureAppts.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                    <div style={{ fontWeight: 700 }}>No upcoming appointments</div>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Contact your care team to schedule.</p>
                  </div>
                ) : futureAppts.map((a, idx) => {
                  const dt = new Date(a.date + 'T00:00:00');
                  const isNext = idx === 0;
                  return (
                    <div key={a.id} style={{
                      padding: '16px 18px', borderBottom: '1px solid #f1f5f9',
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: isNext ? '#eff6ff' : 'transparent',
                    }}>
                      {/* Date block */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 10, flexShrink: 0, textAlign: 'center',
                        background: isNext ? '#0066cc' : '#f1f5f9',
                        color: isNext ? '#fff' : '#1e293b',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>
                          {dt.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{dt.getDate()}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                          {a.type}
                          {isNext && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#065f46', marginLeft: 8 }}>NEXT</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {a.time} · {a.duration || 30} min · {a.providerName}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{a.reason}</div>
                      </div>
                      <div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 10,
                          background: a.visitType === 'Telehealth' ? '#f5f3ff' : '#eff6ff',
                          color: a.visitType === 'Telehealth' ? '#5b21b6' : '#1d4ed8',
                        }}>
                          {a.visitType === 'Telehealth' ? '📹 Telehealth' : '🏥 In-Person'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ASSESSMENTS TAB ════════════ */}
        {activeTab === 'assessments' && !assessmentMode && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Due assessments alert */}
            {(!assessmentSubmitted.phq9 || !assessmentSubmitted.gad7) && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>Assessments Due Before Your Next Appointment</div>
                  <div style={{ fontSize: 12, color: '#92400e', opacity: 0.8 }}>Please complete your PHQ-9 and GAD-7 screenings below.</div>
                </div>
              </div>
            )}

            {/* ── Required Assessments ── */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>!</span>
                Required Assessments
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {Object.values(ASSESSMENT_TOOLS).filter(t => t.required).map(t => (
                  <div key={t.key} style={cardStyle}>
                    <div style={{ ...cardHeaderStyle(), background: t.bg }}>
                      <span>{t.icon} {t.name}</span>
                    </div>
                    <div style={{ padding: 18 }}>
                      <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>{t.description}</p>
                      {assessmentSubmitted[t.key] ? (
                        <div style={{ background: '#dcfce7', borderRadius: 8, padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#065f46', fontSize: 13 }}>✅ Completed</div>
                          <div style={{ fontSize: 12, color: '#065f46', marginTop: 4 }}>
                            Score: {assessmentSubmitted[t.key].score}/{assessmentSubmitted[t.key].maxScore || t.maxScore} — {assessmentSubmitted[t.key].interpretation}
                          </div>
                          <div style={{ fontSize: 10, color: '#059669', marginTop: 4 }}>{assessmentSubmitted[t.key].date}</div>
                        </div>
                      ) : (
                        <button onClick={() => startAssessment(t.key)} style={{
                          width: '100%', padding: '10px', borderRadius: 8, background: t.color, color: '#fff',
                          border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}>Begin {t.tool} Assessment</button>
                      )}
                      {patAssessments.filter(a => a.tool === t.tool).length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <div style={sectionLabel}>Previous Scores</div>
                          {patAssessments.filter(a => a.tool === t.tool).slice(0, 3).map(a => (
                            <div key={a.id} style={{ fontSize: 11, color: '#64748b', padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{a.date}</span>
                              <span style={{ fontWeight: 700 }}>Score: {a.score} — {a.interpretation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Assessment Resource Library ── */}
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📚</span> Assessment Resource Library
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Additional screening tools available for self-assessment. Results are sent to your care team for review.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignItems: 'stretch' }}>
                {Object.values(ASSESSMENT_TOOLS).filter(t => !t.required).map(t => {
                  const prevScores = patAssessments.filter(a => a.tool === t.tool);
                  const submitted = assessmentSubmitted[t.key];
                  return (
                    <div key={t.key} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                      {/* Fixed-height header */}
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, minHeight: 64 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, background: t.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                        }}>{t.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', lineHeight: 1.3 }}>{t.tool}</div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: t.color, padding: '1px 6px', borderRadius: 6, background: t.bg, display: 'inline-block', marginTop: 2 }}>{t.category}</span>
                        </div>
                      </div>
                      {/* Body — flex column to push button to bottom */}
                      <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, marginBottom: 12, flex: 1, minHeight: 48 }}>{t.description}</p>
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10 }}>
                            {t.questions.length} items · Max score: {t.maxScore}
                          </div>
                          {submitted ? (
                            <div style={{ background: '#dcfce7', borderRadius: 6, padding: '8px 10px', fontSize: 11 }}>
                              <span style={{ fontWeight: 700, color: '#065f46' }}>✅ Score: {submitted.score}/{submitted.maxScore || t.maxScore}</span>
                              <div style={{ color: '#059669', fontSize: 10, marginTop: 2 }}>{submitted.interpretation} · {submitted.date}</div>
                            </div>
                          ) : t.key === 'moca' ? (
                            <button onClick={() => startAssessment(t.key)} style={{
                              width: '100%', padding: '7px', borderRadius: 6, background: '#f8fafc', color: t.color,
                              border: `1.5px solid ${t.color}30`, fontWeight: 700, fontSize: 11, cursor: 'pointer',
                            }}>Self-Rate (Clinician Preferred)</button>
                          ) : (
                            <button onClick={() => startAssessment(t.key)} style={{
                              width: '100%', padding: '7px', borderRadius: 6, background: t.color, color: '#fff',
                              border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                            }}>Take {t.tool}</button>
                          )}
                          {prevScores.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              {prevScores.slice(0, 2).map(a => (
                                <div key={a.id} style={{ fontSize: 10, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                  <span>{a.date}</span>
                                  <span style={{ fontWeight: 600 }}>{a.score} — {a.interpretation}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Assessment questionnaire mode ── */}
        {activeTab === 'assessments' && assessmentMode && (() => {
          const toolDef = ASSESSMENT_TOOLS[assessmentMode];
          const isCSSRS = assessmentMode === 'cssrs';
          const isDAST = assessmentMode === 'dast10';
          const isMDQ = assessmentMode === 'mdq';
          const isAUDITC = assessmentMode === 'auditc';
          const isMoCA = assessmentMode === 'moca';
          const isPCL5 = assessmentMode === 'pcl5';
          const isASRS = assessmentMode === 'asrs';

          const getOptionsForQ = (qi) => {
            if (isCSSRS) return CSSRS_OPTIONS;
            if (isDAST) return DAST10_OPTIONS;
            if (isMDQ) return MDQ_OPTIONS;
            if (isAUDITC) return AUDITC_OPTIONS[qi];
            if (isPCL5) return PCL5_OPTIONS;
            if (isASRS) return ASRS_OPTIONS;
            if (isMoCA) return Array.from({ length: MOCA_CATEGORIES[qi].maxScore + 1 }, (_, i) => ({ value: i, label: String(i) }));
            return RESPONSE_OPTIONS; // PHQ-9, GAD-7
          };

          const questions = isMoCA ? MOCA_CATEGORIES.map(c => `${c.name}: ${c.description}`) : toolDef.questions;

          return (
            <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
              <div style={cardStyle}>
                <div style={{
                  padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: toolDef.bg,
                }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                      {toolDef.icon} {toolDef.name}
                    </h2>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      {isCSSRS ? 'Please answer honestly. Your responses help ensure your safety.' :
                       isAUDITC ? 'Please answer regarding your alcohol use.' :
                       isDAST ? 'Please answer regarding your drug use (excluding alcohol and tobacco).' :
                       isMDQ ? 'Has there ever been a period of time when you were not your usual self and...' :
                       isMoCA ? 'Rate your performance in each cognitive domain. Ideally administered by a clinician.' :
                       isPCL5 ? 'In the past month, how much were you bothered by:' :
                       isASRS ? 'How often do you experience the following?' :
                       <>Over the <strong>last 2 weeks</strong>, how often have you been bothered by the following problems?</>}
                    </p>
                  </div>
                  <button onClick={() => setAssessmentMode(null)} style={{
                    background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 12px',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#64748b',
                  }}>✕ Cancel</button>
                </div>
                <div style={{ padding: 20 }}>
                  {questions.map((q, qi) => (
                    <div key={qi} style={{
                      padding: '16px 0', borderBottom: qi < questions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#1e293b' }}>
                        <span style={{ color: '#94a3b8', marginRight: 6 }}>{qi + 1}.</span> {q}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {getOptionsForQ(qi).map(opt => (
                          <button key={opt.value} onClick={() => setAnswer(qi, opt.value)} style={{
                            flex: isMoCA ? 'none' : 1, minWidth: isMoCA ? 40 : 'auto',
                            padding: isMoCA ? '8px 12px' : '8px 6px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.12s',
                            background: assessmentAnswers[qi] === opt.value ? toolDef.color : '#f8fafc',
                            color: assessmentAnswers[qi] === opt.value ? '#fff' : '#475569',
                            border: assessmentAnswers[qi] === opt.value ? 'none' : '1px solid #e2e8f0',
                          }}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Score preview + submit */}
                  <div style={{ marginTop: 20, padding: '16px', background: '#f8fafc', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Current score</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: toolDef.color }}>
                        {assessmentAnswers.reduce((s, v) => s + (v >= 0 ? v : 0), 0)} / {toolDef.maxScore}
                      </div>
                    </div>
                    <button
                      onClick={submitAssessment}
                      disabled={assessmentAnswers.some(a => a < 0)}
                      style={{
                        padding: '10px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: assessmentAnswers.some(a => a < 0) ? 'not-allowed' : 'pointer',
                        background: assessmentAnswers.some(a => a < 0) ? '#cbd5e1' : '#10b981',
                        color: '#fff', border: 'none',
                      }}
                    >
                      {assessmentAnswers.some(a => a < 0) ? `Answer all ${questions.length} questions` : 'Submit Assessment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ════════════ INSURANCE TAB ════════════ */}
        {activeTab === 'insurance' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            <div style={cardStyle}>
              <div style={cardHeaderStyle()}>🏥 Insurance Information</div>
              <div style={{ padding: 20 }}>
                {insuranceSaved && (
                  <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
                    ✅ Insurance information update submitted. Our billing team will review and confirm.
                  </div>
                )}

                {/* Primary */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#0066cc', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>1</span>
                    Primary Insurance
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={sectionLabel}>Insurance Company</label>
                      <input value={insuranceForm.primaryName} onChange={e => setInsuranceForm(p => ({ ...p, primaryName: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={sectionLabel}>Member ID</label>
                      <input value={insuranceForm.primaryMemberId} onChange={e => setInsuranceForm(p => ({ ...p, primaryMemberId: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={sectionLabel}>Group Number</label>
                      <input value={insuranceForm.primaryGroup} onChange={e => setInsuranceForm(p => ({ ...p, primaryGroup: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={sectionLabel}>Copay ($)</label>
                      <input value={insuranceForm.primaryCopay} onChange={e => setInsuranceForm(p => ({ ...p, primaryCopay: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                  </div>
                </div>

                {/* Secondary */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#64748b', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>2</span>
                    Secondary Insurance <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>(optional)</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={sectionLabel}>Insurance Company</label>
                      <input value={insuranceForm.secondaryName} onChange={e => setInsuranceForm(p => ({ ...p, secondaryName: e.target.value }))}
                        placeholder="e.g. Medicaid, Medicare"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={sectionLabel}>Member ID</label>
                      <input value={insuranceForm.secondaryMemberId} onChange={e => setInsuranceForm(p => ({ ...p, secondaryMemberId: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={sectionLabel}>Group Number</label>
                      <input value={insuranceForm.secondaryGroup} onChange={e => setInsuranceForm(p => ({ ...p, secondaryGroup: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={saveInsurance} style={{
                    padding: '10px 24px', borderRadius: 8, background: '#0066cc', color: '#fff',
                    border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>Submit Insurance Update</button>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Changes will be reviewed by our billing department.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ TELEHEALTH TAB ════════════ */}
        {activeTab === 'telehealth' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Next telehealth appointment */}
            {teleAppts.length > 0 ? (
              <>
                <div style={{
                  ...cardStyle, marginBottom: 20, overflow: 'visible',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff', padding: '28px 32px', borderRadius: 14,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', opacity: 0.7, marginBottom: 8 }}>Your Next Telehealth Visit</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                        {new Date(teleAppts[0].date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {teleAppts[0].time}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>
                        {teleAppts[0].type} with {teleAppts[0].providerName} · {teleAppts[0].duration || 30} min
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{teleAppts[0].reason}</div>
                    </div>
                    <button style={{
                      padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.2)',
                      color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 14,
                      cursor: 'pointer', backdropFilter: 'blur(8px)',
                    }}>
                      📹 Join Session
                    </button>
                  </div>
                </div>

                {/* All upcoming telehealth */}
                {teleAppts.length > 1 && (
                  <div style={cardStyle}>
                    <div style={cardHeaderStyle()}>📹 All Upcoming Telehealth Appointments</div>
                    <div>
                      {teleAppts.slice(1).map(a => (
                        <div key={a.id} style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>
                              {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {a.time}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{a.type} · {a.providerName}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 10, background: '#f5f3ff', color: '#5b21b6' }}>Scheduled</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ ...cardStyle, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
                <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>No Upcoming Telehealth Visits</h3>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>You don't have any telehealth appointments scheduled. Contact your care team to schedule one.</p>
              </div>
            )}

            {/* Telehealth info */}
            <div style={{ ...cardStyle, marginTop: 20 }}>
              <div style={cardHeaderStyle()}>ℹ️ Telehealth Information</div>
              <div style={{ padding: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>Before Your Visit</div>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>Find a quiet, private location</li>
                      <li>Test your camera and microphone</li>
                      <li>Use Chrome or Safari for best results</li>
                      <li>Have your medication list ready</li>
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>Technical Requirements</div>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>Stable internet connection (5+ Mbps)</li>
                      <li>Webcam and microphone enabled</li>
                      <li>Updated web browser</li>
                      <li>Join 5 minutes before your appointment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
