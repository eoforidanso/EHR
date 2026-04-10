import React, { useState } from 'react';
import { usePatient } from '../../contexts/PatientContext';
import { useAuth } from '../../contexts/AuthContext';

// ── Constants ──────────────────────────────────────────────────────────────────
const VISIT_TYPES = [
  'Follow-Up','Office Visit','Telehealth','Walk-In',
  'Psychiatric Evaluation','Medication Management',
  'Crisis Intervention','Urgent Care','Initial Evaluation','Discharge Follow-Up',
];

const STATUS_BADGE = {
  'In Progress': 'badge-warning',
  'Completed': 'badge-success',
  'Pending Co-Sign': 'badge-info',
  'Cancelled': 'badge-danger',
};

const MSE_OPTIONS = {
  appearance:       ['Well-Groomed','Disheveled','Casually Dressed','Poorly Groomed','Unusually Dressed','Fair'],
  behavior:         ['Cooperative','Guarded','Agitated','Hostile','Withdrawn','Pleasant','Restless','Other'],
  psychomotor:      ['Normal','Increased / Restless','Decreased / Slowed','Psychomotor Retardation','Tremors Noted'],
  eyeContact:       ['Good','Fair','Avoided','Poor','Intense / Piercing'],
  speech:           ['Normal Rate, Rhythm & Volume','Pressured','Slowed','Loud','Soft / Quiet','Monotone','Dysarthric','Circumstantial'],
  affect:           ['Euthymic','Depressed','Anxious','Irritable','Labile','Flat','Blunted','Constricted','Elevated / Expansive','Dysphoric'],
  affectCongruent:  ['Congruent with Mood','Incongruent with Mood'],
  thoughtProcess:   ['Linear & Goal-Directed','Tangential','Circumstantial','Flight of Ideas','Loosening of Associations','Disorganized','Perseverative'],
  thoughtContent:   ['No SI/HI — Future-Oriented','Passive SI (No Plan/Intent)','Active SI with Plan','Active SI with Intent','Homicidal Ideation Present','Paranoid Ideation','Delusions Present','Obsessions Noted'],
  suicidalIdeation: ['Denied / None','Passive Ideation Only','Active — No Plan','Active — With Plan','Active — With Plan & Intent'],
  homicidalIdeation:['Denied / None','Passive Ideation','Active — No Plan','Active — With Plan'],
  perceptions:      ['WNL — No Hallucinations','Auditory Hallucinations','Visual Hallucinations','Tactile Hallucinations','Olfactory Hallucinations','Illusions'],
  orientation:      ['Alert & Oriented x4 (Person, Place, Time, Situation)','Alert & Oriented x3','Alert & Oriented x2','Confused / Disoriented'],
  memory:           ['Intact — Recent & Remote','Mild Impairment','Moderate Impairment','Significant Impairment'],
  concentration:    ['Intact','Mildly Impaired','Moderately Impaired','Severely Impaired'],
  insight:          ['Good','Fair','Poor','Absent'],
  judgment:         ['Good','Fair','Poor','Impaired'],
};

const CPT_CODES = [
  { code: '99213', desc: 'Office Visit — Low Complexity, Established' },
  { code: '99214', desc: 'Office Visit — Moderate Complexity, Established' },
  { code: '99215', desc: 'Office Visit — High Complexity, Established' },
  { code: '90791', desc: 'Psychiatric Diagnostic Evaluation' },
  { code: '90792', desc: 'Psychiatric Diagnostic Eval w/ Medical Services' },
  { code: '90832', desc: 'Psychotherapy 16–37 min' },
  { code: '90834', desc: 'Psychotherapy 38–52 min' },
  { code: '90837', desc: 'Psychotherapy 53+ min' },
  { code: '90833', desc: 'Psychotherapy Add-On to E&M 16–37 min' },
  { code: '90836', desc: 'Psychotherapy Add-On to E&M 38–52 min' },
  { code: '90838', desc: 'Psychotherapy Add-On to E&M 53+ min' },
  { code: '90839', desc: 'Crisis Psychotherapy — First 60 min' },
  { code: '90840', desc: 'Crisis Psychotherapy — Add-On 30 min' },
  { code: '96127', desc: 'Brief Behavioral / Emotional Assessment' },
  { code: '99354', desc: 'Prolonged Service — First 30–74 min Add-On' },
];

const PLACE_OF_SERVICE = [
  '11 — Office',
  '02 — Telehealth (Patient Home)',
  '22 — On-Campus Outpatient Hospital',
  '23 — Emergency Room',
  '72 — Rural Health Clinic',
];

// ── Common psychiatric ICD-10 quick-add library ────────────────────────────────
const ICD_COMMON = [
  { cat: 'Depressive', color: '#4f46e5', icon: '😔', codes: [
    { code: 'F32.0',  desc: 'MDD, Single Episode, Mild' },
    { code: 'F32.1',  desc: 'MDD, Single Episode, Moderate' },
    { code: 'F32.2',  desc: 'MDD, Single Episode, Severe w/o Psychosis' },
    { code: 'F32.3',  desc: 'MDD, Single Episode, Severe with Psychosis' },
    { code: 'F32.4',  desc: 'MDD, Single Episode, In Partial Remission' },
    { code: 'F32.5',  desc: 'MDD, Single Episode, In Full Remission' },
    { code: 'F32.9',  desc: 'MDD, Single Episode, Unspecified' },
    { code: 'F33.0',  desc: 'MDD, Recurrent, Mild' },
    { code: 'F33.1',  desc: 'MDD, Recurrent, Moderate' },
    { code: 'F33.2',  desc: 'MDD, Recurrent, Severe w/o Psychosis' },
    { code: 'F33.3',  desc: 'MDD, Recurrent, Severe with Psychosis' },
    { code: 'F33.40', desc: 'MDD, Recurrent, In Remission, Unspecified' },
    { code: 'F33.41', desc: 'MDD, Recurrent, In Partial Remission' },
    { code: 'F33.42', desc: 'MDD, Recurrent, In Full Remission' },
    { code: 'F34.1',  desc: 'Persistent Depressive Disorder (Dysthymia)' },
    { code: 'F32.81', desc: 'Premenstrual Dysphoric Disorder (PMDD)' },
    { code: 'F06.31', desc: 'Depressive Disorder Due to Medical Condition' },
    { code: 'F06.32', desc: 'Depressive Disorder Due to Substance/Medication' },
  ]},
  { cat: 'Anxiety', color: '#d97706', icon: '😰', codes: [
    { code: 'F41.1',  desc: 'Generalized Anxiety Disorder (GAD)' },
    { code: 'F41.0',  desc: 'Panic Disorder' },
    { code: 'F40.10', desc: 'Social Anxiety Disorder, Unspecified' },
    { code: 'F40.11', desc: 'Social Anxiety Disorder, Generalized' },
    { code: 'F41.9',  desc: 'Anxiety Disorder, Unspecified' },
    { code: 'F41.3',  desc: 'Other Mixed Anxiety Disorders' },
    { code: 'F40.00', desc: 'Agoraphobia without Panic Disorder' },
    { code: 'F40.01', desc: 'Agoraphobia with Panic Disorder' },
    { code: 'F93.0',  desc: 'Separation Anxiety Disorder' },
    { code: 'F40.218',desc: 'Specific Phobia, Other' },
    { code: 'F40.232',desc: 'Specific Phobia — Fear of Flying' },
    { code: 'F40.241',desc: 'Specific Phobia — Fear of Spiders' },
    { code: 'F40.248',desc: 'Specific Phobia — Fear of Other Animals' },
    { code: 'F06.4',  desc: 'Anxiety Disorder Due to Medical Condition' },
  ]},
  { cat: 'Bipolar', color: '#7c3aed', icon: '🔃', codes: [
    { code: 'F31.9',  desc: 'Bipolar Disorder, Unspecified' },
    { code: 'F31.0',  desc: 'Bipolar I — Current Episode Hypomanic' },
    { code: 'F31.10', desc: 'Bipolar I — Manic, Unspecified' },
    { code: 'F31.11', desc: 'Bipolar I — Manic, Mild' },
    { code: 'F31.12', desc: 'Bipolar I — Manic, Moderate' },
    { code: 'F31.13', desc: 'Bipolar I — Manic, Severe w/o Psychosis' },
    { code: 'F31.2',  desc: 'Bipolar I — Manic, Severe with Psychosis' },
    { code: 'F31.30', desc: 'Bipolar I — Depressed, Unspecified' },
    { code: 'F31.31', desc: 'Bipolar I — Depressed, Mild' },
    { code: 'F31.32', desc: 'Bipolar I — Depressed, Moderate' },
    { code: 'F31.4',  desc: 'Bipolar I — Depressed, Severe w/o Psychosis' },
    { code: 'F31.5',  desc: 'Bipolar I — Depressed, Severe with Psychosis' },
    { code: 'F31.60', desc: 'Bipolar I — Mixed, Unspecified' },
    { code: 'F31.70', desc: 'Bipolar I — In Remission, Unspecified' },
    { code: 'F31.78', desc: 'Bipolar I — In Full Remission, Unspecified' },
    { code: 'F31.81', desc: 'Bipolar II Disorder' },
    { code: 'F34.0',  desc: 'Cyclothymia' },
  ]},
  { cat: 'ADHD', color: '#0891b2', icon: '⚡', codes: [
    { code: 'F90.0',  desc: 'ADHD — Predominantly Inattentive' },
    { code: 'F90.1',  desc: 'ADHD — Predominantly Hyperactive-Impulsive' },
    { code: 'F90.2',  desc: 'ADHD — Combined Type' },
    { code: 'F90.8',  desc: 'ADHD, Other' },
    { code: 'F90.9',  desc: 'ADHD, Unspecified' },
    { code: 'F81.0',  desc: 'Specific Learning Disorder — Reading (Dyslexia)' },
    { code: 'F81.2',  desc: 'Specific Learning Disorder — Mathematics' },
    { code: 'F81.81', desc: 'Specific Learning Disorder — Written Expression' },
    { code: 'F82',    desc: 'Developmental Coordination Disorder (DCD)' },
    { code: 'R41.3',  desc: 'Other Amnesia / Concentration Difficulties' },
  ]},
  { cat: 'Trauma / PTSD', color: '#c2410c', icon: '🧩', codes: [
    { code: 'F43.0',  desc: 'Acute Stress Reaction' },
    { code: 'F43.10', desc: 'PTSD, Unspecified' },
    { code: 'F43.11', desc: 'PTSD, Acute' },
    { code: 'F43.12', desc: 'PTSD, Chronic' },
    { code: 'F43.20', desc: 'Adjustment Disorder, Unspecified' },
    { code: 'F43.21', desc: 'Adjustment Disorder w/ Depressed Mood' },
    { code: 'F43.22', desc: 'Adjustment Disorder w/ Anxiety' },
    { code: 'F43.23', desc: 'Adjustment Disorder w/ Mixed Mood & Anxiety' },
    { code: 'F43.24', desc: 'Adjustment Disorder w/ Conduct Disturbance' },
    { code: 'F43.25', desc: 'Adjustment Disorder w/ Mixed Disturbance of Emotions & Conduct' },
    { code: 'F43.29', desc: 'Adjustment Disorder, Other' },
    { code: 'F62.0',  desc: 'Enduring Personality Change After Catastrophic Experience' },
    { code: 'Z91.410',desc: 'Personal History of Childhood Physical Abuse' },
    { code: 'Z91.411',desc: 'Personal History of Childhood Psychological Abuse' },
    { code: 'Z91.412',desc: 'Personal History of Childhood Neglect' },
    { code: 'Z91.49', desc: 'Personal History of Other Adult Psychological Trauma' },
  ]},
  { cat: 'OCD / Related', color: '#1a7f4b', icon: '🔁', codes: [
    { code: 'F42.0',  desc: 'OCD — Predominantly Obsessive Thoughts' },
    { code: 'F42.1',  desc: 'OCD — Predominantly Compulsive Acts' },
    { code: 'F42.2',  desc: 'OCD — Mixed Obsessions & Compulsions' },
    { code: 'F42.4',  desc: 'Hoarding Disorder' },
    { code: 'F42.8',  desc: 'OCD, Other' },
    { code: 'F42.9',  desc: 'OCD, Unspecified' },
    { code: 'F45.22', desc: 'Body Dysmorphic Disorder (BDD)' },
    { code: 'F63.3',  desc: 'Trichotillomania (Hair-Pulling Disorder)' },
    { code: 'L98.1',  desc: 'Dermatillomania (Excoriation / Skin-Picking Disorder)' },
    { code: 'F63.9',  desc: 'Impulse Control Disorder, Unspecified' },
  ]},
  { cat: 'Psychotic', color: '#be185d', icon: '🌀', codes: [
    { code: 'F20.0',  desc: 'Paranoid Schizophrenia' },
    { code: 'F20.1',  desc: 'Disorganized Schizophrenia' },
    { code: 'F20.2',  desc: 'Catatonic Schizophrenia' },
    { code: 'F20.5',  desc: 'Residual Schizophrenia' },
    { code: 'F20.9',  desc: 'Schizophrenia, Unspecified' },
    { code: 'F21',    desc: 'Schizotypal Disorder' },
    { code: 'F22',    desc: 'Delusional Disorder' },
    { code: 'F23',    desc: 'Brief Psychotic Disorder' },
    { code: 'F25.0',  desc: 'Schizoaffective Disorder, Bipolar Type' },
    { code: 'F25.1',  desc: 'Schizoaffective Disorder, Depressive Type' },
    { code: 'F25.9',  desc: 'Schizoaffective Disorder, Unspecified' },
    { code: 'F28',    desc: 'Other Specified Psychotic Disorder' },
    { code: 'F29',    desc: 'Unspecified Psychosis' },
    { code: 'F06.2',  desc: 'Psychotic Disorder Due to Medical Condition' },
  ]},
  { cat: 'Sleep', color: '#0a7ea4', icon: '😴', codes: [
    { code: 'G47.00', desc: 'Insomnia, Unspecified' },
    { code: 'G47.01', desc: 'Insomnia Due to Medical Condition' },
    { code: 'G47.09', desc: 'Other Insomnia' },
    { code: 'F51.01', desc: 'Primary Insomnia' },
    { code: 'F51.05', desc: 'Insomnia Due to Other Mental Disorder' },
    { code: 'G47.10', desc: 'Hypersomnia, Unspecified' },
    { code: 'G47.19', desc: 'Other Hypersomnia' },
    { code: 'G47.30', desc: 'Sleep Apnea, Unspecified' },
    { code: 'G47.33', desc: 'Obstructive Sleep Apnea' },
    { code: 'G47.411',desc: 'Narcolepsy with Cataplexy' },
    { code: 'G47.419',desc: 'Narcolepsy without Cataplexy' },
    { code: 'G47.61', desc: 'REM Sleep Behavior Disorder' },
    { code: 'F51.3',  desc: 'Sleepwalking (Somnambulism)' },
    { code: 'F51.4',  desc: 'Sleep Terrors (Night Terrors)' },
    { code: 'G47.63', desc: 'Restless Legs Syndrome' },
  ]},
  { cat: 'Substance Use', color: '#92400e', icon: '💊', codes: [
    { code: 'F10.10',  desc: 'Alcohol Use Disorder, Mild' },
    { code: 'F10.20',  desc: 'Alcohol Use Disorder, Moderate/Severe' },
    { code: 'F10.21',  desc: 'Alcohol Use Disorder, Moderate, In Remission' },
    { code: 'F11.10',  desc: 'Opioid Use Disorder, Mild' },
    { code: 'F11.20',  desc: 'Opioid Use Disorder, Moderate/Severe' },
    { code: 'F11.20',  desc: 'Opioid Use Disorder, Moderate/Severe' },
    { code: 'F12.10',  desc: 'Cannabis Use Disorder, Mild' },
    { code: 'F12.20',  desc: 'Cannabis Use Disorder, Moderate/Severe' },
    { code: 'F13.10',  desc: 'Sedative/Hypnotic Use Disorder, Mild' },
    { code: 'F14.10',  desc: 'Cocaine Use Disorder, Mild' },
    { code: 'F14.20',  desc: 'Cocaine Use Disorder, Moderate/Severe' },
    { code: 'F15.10',  desc: 'Stimulant (Amphetamine) Use Disorder, Mild' },
    { code: 'F15.20',  desc: 'Stimulant (Amphetamine) Use Disorder, Moderate/Severe' },
    { code: 'F16.10',  desc: 'Hallucinogen Use Disorder, Mild' },
    { code: 'F17.210', desc: 'Nicotine Dependence, Cigarettes' },
    { code: 'F17.220', desc: 'Nicotine Dependence, Chewing Tobacco' },
    { code: 'F18.10',  desc: 'Inhalant Use Disorder, Mild' },
    { code: 'F19.10',  desc: 'Multi-substance Use Disorder, Mild' },
    { code: 'F19.20',  desc: 'Multi-substance Use Disorder, Moderate/Severe' },
  ]},
  { cat: 'Personality', color: '#6d28d9', icon: '🪞', codes: [
    { code: 'F60.0',  desc: 'Paranoid Personality Disorder' },
    { code: 'F60.1',  desc: 'Schizoid Personality Disorder' },
    { code: 'F60.2',  desc: 'Antisocial Personality Disorder (ASPD)' },
    { code: 'F60.3',  desc: 'Borderline Personality Disorder (BPD)' },
    { code: 'F60.4',  desc: 'Histrionic Personality Disorder' },
    { code: 'F60.5',  desc: 'Obsessive-Compulsive Personality Disorder (OCPD)' },
    { code: 'F60.6',  desc: 'Avoidant Personality Disorder' },
    { code: 'F60.7',  desc: 'Dependent Personality Disorder' },
    { code: 'F60.81', desc: 'Narcissistic Personality Disorder (NPD)' },
    { code: 'F60.89', desc: 'Other Personality Disorder' },
    { code: 'F60.9',  desc: 'Personality Disorder, Unspecified' },
    { code: 'F21',    desc: 'Schizotypal Personality Disorder' },
  ]},
  { cat: 'Eating', color: '#b45309', icon: '🍽️', codes: [
    { code: 'F50.00', desc: 'Anorexia Nervosa, Restricting Type' },
    { code: 'F50.01', desc: 'Anorexia Nervosa, Binge-Eating/Purging Type' },
    { code: 'F50.02', desc: 'Anorexia Nervosa, Unspecified' },
    { code: 'F50.2',  desc: 'Bulimia Nervosa' },
    { code: 'F50.81', desc: 'Binge Eating Disorder (BED)' },
    { code: 'F50.82', desc: 'Avoidant/Restrictive Food Intake Disorder (ARFID)' },
    { code: 'F50.89', desc: 'Other Specified Feeding or Eating Disorder' },
    { code: 'F50.9',  desc: 'Eating Disorder, Unspecified' },
    { code: 'F98.3',  desc: 'Pica' },
  ]},
  { cat: 'Neurodevelopmental', color: '#0f766e', icon: '🧠', codes: [
    { code: 'F84.0',  desc: 'Autism Spectrum Disorder (ASD)' },
    { code: 'F84.5',  desc: "Asperger's Syndrome" },
    { code: 'F84.9',  desc: 'Pervasive Developmental Disorder, Unspecified' },
    { code: 'F70',    desc: 'Intellectual Disability, Mild' },
    { code: 'F71',    desc: 'Intellectual Disability, Moderate' },
    { code: 'F80.0',  desc: 'Speech Sound Disorder (Phonological)' },
    { code: 'F80.1',  desc: 'Expressive Language Disorder' },
    { code: 'F80.2',  desc: 'Mixed Receptive-Expressive Language Disorder' },
    { code: 'F80.81', desc: 'Childhood-Onset Fluency Disorder (Stuttering)' },
    { code: 'F95.1',  desc: 'Chronic Motor or Vocal Tic Disorder' },
    { code: 'F95.2',  desc: "Tourette's Disorder" },
    { code: 'F98.5',  desc: 'Adult Onset Fluency Disorder' },
  ]},
  { cat: 'Medical / Other', color: '#475569', icon: '🏥', codes: [
    { code: 'F45.0',  desc: 'Somatization Disorder' },
    { code: 'F45.1',  desc: 'Undifferentiated Somatic Symptom Disorder' },
    { code: 'F45.20', desc: 'Hypochondriasis, Unspecified' },
    { code: 'F45.41', desc: 'Pain Disorder w/ Both Psychological & Medical Factors' },
    { code: 'F45.8',  desc: 'Other Somatoform Disorders' },
    { code: 'F06.0',  desc: 'Psychotic Disorder Due to Medical Condition' },
    { code: 'F06.1',  desc: 'Catatonic Disorder Due to Medical Condition' },
    { code: 'F06.8',  desc: 'Other Mental Disorders Due to Medical Condition' },
    { code: 'F07.0',  desc: 'Personality Change Due to Brain Damage / Disease' },
    { code: 'G30.9',  desc: "Alzheimer's Disease, Unspecified" },
    { code: 'F02.80', desc: "Dementia Due to Alzheimer\u2019s Disease" },
    { code: 'F03.90', desc: 'Unspecified Dementia, Unspecified Severity' },
    { code: 'Z09',    desc: 'Psychiatric Follow-Up After Completed Treatment' },
    { code: 'Z13.89', desc: 'Encounter for Screening, Other Disorder' },
    { code: 'Z91.19', desc: 'Non-compliance with Medical Treatment' },
  ]},
];

// ── CPT suggestions by visit type ─────────────────────────────────────────────
const CPT_BY_VISIT = {
  'Follow-Up':             ['99213','99214','99215'],
  'Office Visit':          ['99213','99214','99215'],
  'Medication Management': ['99213','99214','99215'],
  'Telehealth':            ['99213','99214','99215'],
  'Initial Evaluation':    ['90791','90792'],
  'Psychiatric Evaluation':['90791','90792'],
  'Crisis Intervention':   ['90839','90840','90215'],
  'Urgent Care':           ['99213','99214','99215'],
  'Walk-In':               ['99213','99214'],
  'Discharge Follow-Up':   ['99213','99214'],
};

const today = new Date().toISOString().slice(0, 10);
const nowTime = new Date().toTimeString().slice(0, 5);

function blankEncounter(currentUser) {
  const creds = currentUser?.credentials ? `, ${currentUser.credentials}` : '';
  return {
    date: today,
    time: nowTime,
    type: 'Follow-Up',
    provider: currentUser?.id || '',
    providerName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}${creds}`.trim(),
    status: 'In Progress',
    chiefComplaint: '',
    subjective: '',
    mse: {
      appearance: 'Well-Groomed',
      behavior: 'Cooperative',
      psychomotor: 'Normal',
      eyeContact: 'Good',
      speech: 'Normal Rate, Rhythm & Volume',
      mood: '',
      affect: 'Euthymic',
      affectCongruent: 'Congruent with Mood',
      thoughtProcess: 'Linear & Goal-Directed',
      thoughtContent: 'No SI/HI — Future-Oriented',
      suicidalIdeation: 'Denied / None',
      homicidalIdeation: 'Denied / None',
      perceptions: 'WNL — No Hallucinations',
      orientation: 'Alert & Oriented x4 (Person, Place, Time, Situation)',
      memory: 'Intact — Recent & Remote',
      concentration: 'Intact',
      insight: 'Good',
      judgment: 'Good',
      additionalNotes: '',
    },
    assessment: '',
    plan: '',
    diagnoses: [],
    cptCodes: [],
    placeOfService: '11 — Office',
    timeSpentMinutes: '',
    billingNotes: '',
    supportivePsychNotes: '',
    cbtNotes: '',
    isTelehealth: false,
    telehealthNote: "Today's exam was a real-time audiovisual visit using HIPAA-compliant technology. There were no technical difficulties. The patient agreed to this format. They confirmed they were in Illinois where I am licensed.",
    patientLocation: '',
    followUp: { needed: false, date: '', time: '', duration: 30, note: '' },
    signedBy: '',
    signedAt: null,
  };
}

// ── Small reusable sub-components ─────────────────────────────────────────────

function PsychTherapyTabs({ d, setD }) {
  const [psychTab, setPsychTab] = React.useState('supportive');
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#445568', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        Psychotherapy Documentation
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 10 }}>
        {[{ key: 'supportive', label: 'Supportive Psychotherapy & Reflective Listening' }, { key: 'cbt', label: 'CBT' }].map(t => (
          <button key={t.key} onClick={() => setPsychTab(t.key)}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
              borderBottom: psychTab === t.key ? '2px solid #1a7f4b' : '2px solid transparent',
              marginBottom: -2,
              background: psychTab === t.key ? 'rgba(26,127,75,0.07)' : 'transparent',
              color: psychTab === t.key ? '#1a7f4b' : 'var(--text-secondary)',
              borderRadius: '4px 4px 0 0',
            }}>
            {t.label}
          </button>
        ))}
      </div>
      {psychTab === 'supportive' && (
        <textarea className="form-input" rows={4}
          placeholder="Document supportive psychotherapy techniques, reflective listening, therapeutic alliance, emotional validation, empathic responses..."
          value={d.supportivePsychNotes || ''}
          onChange={(e) => setD((p) => ({ ...p, supportivePsychNotes: e.target.value }))}
          style={{ resize: 'vertical' }} />
      )}
      {psychTab === 'cbt' && (
        <textarea className="form-input" rows={4}
          placeholder="Document CBT interventions: cognitive restructuring, behavioral activation, thought records, exposure work, homework assignments..."
          value={d.cbtNotes || ''}
          onChange={(e) => setD((p) => ({ ...p, cbtNotes: e.target.value }))}
          style={{ resize: 'vertical' }} />
      )}
    </div>
  );
}

function SectionHeader({ icon, title, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', background: '#f0f3f7',
      borderBottom: '1px solid var(--border)',
      borderLeft: `3px solid ${color || 'var(--primary)'}`,
      marginBottom: 14,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#2a3a50' }}>
        {title}
      </span>
    </div>
  );
}

function MseSelect({ label, field, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>
        {label}
      </label>
      <select className="form-input" value={value}
        onChange={(e) => onChange(field, e.target.value)}
        style={{ fontSize: 12 }}>
        {(MSE_OPTIONS[field] || []).map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DetailBlock({ title, color, content }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 4 }}>
      <div style={{ padding: '7px 12px', background: '#f7f9fc', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 12, color, borderLeft: `3px solid ${color}` }}>
        {title}
      </div>
      <div style={{ padding: '10px 12px', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-secondary)', minHeight: 48 }}>
        {content || <span className="text-muted">—</span>}
      </div>
    </div>
  );
}

// ── Follow-up mini-calendar ────────────────────────────────────────────────────
function FollowUpScheduler({ value, onChange }) {
  const base = ['8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const slots15 = base.flatMap((s) => {
    const [h, m] = s.split(':').map(Number);
    const m2 = m + 15;
    return [s, `${m2 >= 60 ? h+1 : h}:${m2 >= 60 ? '00' : String(m2).padStart(2,'0')}`];
  });
  const slots30 = base;
  const slots60 = base.filter((_, i) => i % 2 === 0);
  const slots = value.duration === 15 ? slots15 : value.duration === 60 ? slots60 : slots30;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <input type="checkbox" checked={value.needed}
            onChange={(e) => onChange({ ...value, needed: e.target.checked, date: '', time: '' })}
            style={{ width: 16, height: 16, cursor: 'pointer' }} />
          Schedule Follow-Up Appointment
        </label>
      </div>

      {value.needed && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Duration selector */}
          <div style={{ padding: '10px 14px', background: '#f7f9fc', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginRight: 4 }}>SLOT DURATION:</span>
            {[15, 30, 60].map((d) => (
              <button key={d} type="button"
                onClick={() => onChange({ ...value, duration: d, time: '' })}
                style={{
                  padding: '4px 14px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: '1.5px solid var(--primary)',
                  background: value.duration === d ? 'var(--primary)' : '#fff',
                  color: value.duration === d ? '#fff' : 'var(--primary)',
                }}>
                {d} min
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr' }}>
            {/* Date picker */}
            <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border)', background: '#fafbfc' }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                📅 Date
              </label>
              <input type="date" className="form-input"
                value={value.date} min={today}
                onChange={(e) => onChange({ ...value, date: e.target.value, time: '' })}
                style={{ fontSize: 12.5 }} />
              {value.date && value.time && (
                <div style={{
                  marginTop: 10, padding: '8px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  border: '1px solid rgba(0,96,182,0.2)',
                }}>
                  ✅ {value.date} at {value.time}
                  <br />
                  <span style={{ fontWeight: 400, fontSize: 11 }}>({value.duration}-min slot)</span>
                </div>
              )}
            </div>

            {/* Time slot grid */}
            <div style={{ padding: '12px 14px' }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
                🕐 Select Time Slot
              </label>
              {!value.date ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
                  Pick a date to view available slots
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(62px, 1fr))', gap: 5, maxHeight: 180, overflowY: 'auto' }}>
                  {slots.map((slot) => (
                    <button key={slot} type="button"
                      onClick={() => onChange({ ...value, time: slot })}
                      style={{
                        padding: '5px 4px', borderRadius: 5, fontSize: 11.5, fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid',
                        background: value.time === slot ? 'var(--primary)' : '#fff',
                        color: value.time === slot ? '#fff' : 'var(--text-secondary)',
                        borderColor: value.time === slot ? 'var(--primary)' : 'var(--border)',
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note to scheduler */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
              Note to Scheduler (optional)
            </label>
            <input type="text" className="form-input"
              placeholder="e.g., Patient prefers mornings, verify insurance prior to visit..."
              value={value.note}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              style={{ fontSize: 12.5 }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Diagnoses editor — chip-toggle + manual entry ────────────────────────────
function DiagnosesEditor({ diagnoses, onChange }) {
  const [activeCat, setActiveCat] = useState(ICD_COMMON[0].cat);

  const isAdded = (code) => diagnoses.some((d) => d.code === code);

  const toggleChip = (code, desc) => {
    if (isAdded(code)) {
      onChange(diagnoses.filter((d) => d.code !== code));
    } else {
      onChange([...diagnoses, { code, description: desc }]);
    }
  };

  const catData = ICD_COMMON.find((c) => c.cat === activeCat) || ICD_COMMON[0];
  const allInCatAdded = catData.codes.every(({ code }) => isAdded(code));

  const toggleAllInCat = () => {
    if (allInCatAdded) {
      // Remove all in this category
      const catCodes = new Set(catData.codes.map((c) => c.code));
      onChange(diagnoses.filter((d) => !catCodes.has(d.code)));
    } else {
      // Add all missing in this category
      const toAdd = catData.codes
        .filter(({ code }) => !isAdded(code))
        .map(({ code, desc }) => ({ code, description: desc }));
      onChange([...diagnoses, ...toAdd]);
    }
  };

  return (
    <div>
      {/* Category tab strip */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
        {ICD_COMMON.map((cat) => {
          const addedInCat = cat.codes.filter((c) => isAdded(c.code)).length;
          const active = activeCat === cat.cat;
          return (
            <button key={cat.cat} type="button"
              onClick={() => setActiveCat(cat.cat)}
              style={{
                padding: '5px 11px', borderRadius: 20, fontSize: 11.5, fontWeight: active ? 700 : 500,
                cursor: 'pointer', border: `1.5px solid ${active ? cat.color : 'var(--border)'}`,
                background: active ? cat.color : addedInCat > 0 ? `${cat.color}14` : '#fff',
                color: active ? '#fff' : addedInCat > 0 ? cat.color : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              <span>{cat.icon}</span>
              {cat.cat}
              {addedInCat > 0 && (
                <span style={{
                  background: active ? 'rgba(255,255,255,0.3)' : cat.color,
                  color: active ? '#fff' : '#fff',
                  borderRadius: 10, fontSize: 10, fontWeight: 700,
                  padding: '0 5px', lineHeight: '16px',
                }}>{addedInCat}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chip grid for active category */}
      <div style={{
        border: `1.5px solid ${catData.color}30`,
        borderRadius: 8, padding: '10px 12px', marginBottom: 12,
        background: `${catData.color}06`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: catData.color }}>
            {catData.icon} {catData.cat} — click to add / remove
          </div>
          <button type="button" onClick={toggleAllInCat}
            style={{
              padding: '3px 11px', borderRadius: 14, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', border: `1.5px solid ${catData.color}`,
              background: allInCatAdded ? catData.color : 'transparent',
              color: allInCatAdded ? '#fff' : catData.color,
              display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>
            {allInCatAdded ? '✕ Remove All' : '＋ Add All'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {catData.codes.map(({ code, desc }) => {
            const added = isAdded(code);
            return (
              <button key={code} type="button" onClick={() => toggleChip(code, desc)}
                title={desc}
                style={{
                  padding: '5px 10px', borderRadius: 5, fontSize: 11.5, fontWeight: 700,
                  cursor: 'pointer', border: `1.5px solid ${added ? catData.color : 'var(--border)'}`,
                  background: added ? catData.color : '#fff',
                  color: added ? '#fff' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.12s',
                }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{code}</span>
                {added && <span style={{ fontSize: 10 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Added diagnoses list */}
      {diagnoses.length === 0
        ? <p className="text-muted text-sm">No diagnoses added — select from the chips above.</p>
        : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
            {diagnoses.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
                borderBottom: i < diagnoses.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: 13,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '1px 7px', borderRadius: 4, fontSize: 11.5, flexShrink: 0 }}>
                  {d.code}
                </span>
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                  {d.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
                </span>
                <button type="button" onClick={() => onChange(diagnoses.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 14, padding: '0 4px' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── CPT code editor — auto-suggested by visit type + expand all + manual ──────
function CptEditor({ cptCodes, onChange, visitType }) {
  const [showAll, setShowAll] = useState(false);
  const [allSelected, setAllSelected] = useState('');

  const suggestedCodes = CPT_BY_VISIT[visitType] || ['99213','99214','99215'];
  const suggestedItems = CPT_CODES.filter((c) => suggestedCodes.includes(c.code));
  const otherItems    = CPT_CODES.filter((c) => !suggestedCodes.includes(c.code));

  const isAdded = (code) => cptCodes.some((c) => c.code === code);

  const toggleChip = (code, desc) => {
    if (isAdded(code)) {
      onChange(cptCodes.filter((c) => c.code !== code));
    } else {
      onChange([...cptCodes, { code, desc, units: 1 }]);
    }
  };

  const addFromDropdown = () => {
    if (!allSelected) return;
    const found = CPT_CODES.find((c) => c.code === allSelected);
    if (found && !isAdded(found.code)) {
      onChange([...cptCodes, { code: found.code, desc: found.desc, units: 1 }]);
    }
    setAllSelected('');
  };

  return (
    <div>
      {/* Suggested chips */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#1a7f4b', marginBottom: 8 }}>
          ⚡ Suggested for "{visitType || 'Follow-Up'}" — click to add / remove
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {suggestedItems.map(({ code, desc }) => {
            const added = isAdded(code);
            return (
              <button key={code} type="button" onClick={() => toggleChip(code, desc)}
                title={desc}
                style={{
                  padding: '7px 13px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', border: `1.5px solid ${added ? '#1a7f4b' : 'var(--border)'}`,
                  background: added ? '#1a7f4b' : '#fff',
                  color: added ? '#fff' : 'var(--text-secondary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  minWidth: 72, transition: 'all 0.12s',
                }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{code}</span>
                <span style={{ fontSize: 9.5, fontWeight: 500, opacity: 0.8, textAlign: 'center', lineHeight: 1.2 }}>
                  {desc.replace(/^Office Visit — /, '').replace(/^Psychotherapy /, 'Tx ').substring(0, 28)}
                </span>
                {added && <span style={{ fontSize: 9.5, marginTop: 1 }}>✓ Added</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expand all codes */}
      <div style={{ marginBottom: showAll ? 10 : 14 }}>
        <button type="button"
          onClick={() => setShowAll((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1.5px dashed var(--border)', borderRadius: 6,
            padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}>
          {showAll ? '▲ Show less' : '＋ All CPT Codes'}
        </button>
      </div>

      {showAll && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select className="form-input" value={allSelected}
            onChange={(e) => setAllSelected(e.target.value)}
            style={{ flex: 1, minWidth: 280, fontSize: 12.5 }}>
            <option value="">— Select additional CPT code —</option>
            {otherItems.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.desc}</option>
            ))}
          </select>
          <button type="button" className="btn btn-sm btn-primary" onClick={addFromDropdown} disabled={!allSelected}>
            + Add
          </button>
        </div>
      )}

      {/* Selected codes list */}
      {cptCodes.length === 0
        ? <p className="text-muted text-sm">No CPT codes added — click chips above to add.</p>
        : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
            {cptCodes.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
                borderBottom: i < cptCodes.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: 13,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1a7f4b', background: 'rgba(26,127,75,0.08)', padding: '1px 7px', borderRadius: 4, fontSize: 11.5, flexShrink: 0 }}>
                  {c.code}
                </span>
                <span style={{ flex: 1, color: 'var(--text-secondary)', fontSize: 12.5 }}>{c.desc}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Units:</span>
                  <input type="number" min={1} max={9} value={c.units}
                    onChange={(e) => onChange(cptCodes.map((x, j) => j === i ? { ...x, units: Number(e.target.value) } : x))}
                    style={{ width: 44, padding: '2px 5px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, textAlign: 'center' }} />
                </div>
                <button type="button" onClick={() => onChange(cptCodes.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 14, padding: '0 4px' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── Section tabs config ───────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'subjective', label: 'Chief Complaint & Subjective' },
  { id: 'mse',        label: 'Mental Status Exam' },
  { id: 'assessment', label: 'Assessment & Plan' },
  { id: 'diagnoses',  label: 'Diagnoses & ICD-10' },
  { id: 'billing',    label: 'CPT & Billing' },
  { id: 'followup',   label: 'Follow-Up' },
];

// ── Main Encounters component ──────────────────────────────────────────────────
export default function Encounters({ patientId }) {
  const { encounters, addEncounter, updateEncounter } = usePatient();
  const { currentUser } = useAuth();

  const patientEncounters = (encounters[patientId] || []).slice().sort(
    (a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
  );

  const [selectedId, setSelectedId] = useState(patientEncounters[0]?.id || null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('subjective');
  const [billingError, setBillingError] = useState(false);

  const selected = patientEncounters.find((e) => e.id === selectedId) || null;

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const startNew = () => {
    setDraft(blankEncounter(currentUser));
    setCreating(true);
    setSelectedId(null);
    setActiveSection('subjective');
  };
  const cancelNew = () => {
    setCreating(false);
    setDraft(null);
    setSelectedId(patientEncounters[0]?.id || null);
  };
  const saveNew = () => {
    if (!draft.chiefComplaint.trim()) return;
    setBillingError(false);
    addEncounter(patientId, draft);
    setCreating(false);
    setDraft(null);
    flash();
  };

  const closeNew = () => {
    if (!draft.chiefComplaint.trim()) return;
    if (!draft.cptCodes || draft.cptCodes.length === 0) {
      setBillingError(true);
      setActiveSection('billing');
      return;
    }
    setBillingError(false);
    const creds = currentUser?.credentials ? `, ${currentUser.credentials}` : '';
    const closed = {
      ...draft,
      status: 'Completed',
      signedBy: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}${creds}`.trim(),
      signedAt: new Date().toISOString(),
    };
    addEncounter(patientId, closed);
    setCreating(false);
    setDraft(null);
    flash();
  };

  const startEdit = (enc) => {
    setEditDraft(JSON.parse(JSON.stringify(enc)));
    setEditing(true);
    setActiveSection('subjective');
  };
  const cancelEdit = () => { setEditing(false); setEditDraft(null); };
  const saveEdit = () => {
    if (!editDraft.chiefComplaint.trim()) return;
    setBillingError(false);
    updateEncounter(patientId, editDraft.id, editDraft);
    setEditing(false);
    setEditDraft(null);
    flash();
  };

  const closeEdit = () => {
    if (!editDraft.chiefComplaint.trim()) return;
    if (!editDraft.cptCodes || editDraft.cptCodes.length === 0) {
      setBillingError(true);
      setActiveSection('billing');
      return;
    }
    setBillingError(false);
    const creds = currentUser?.credentials ? `, ${currentUser.credentials}` : '';
    updateEncounter(patientId, editDraft.id, {
      ...editDraft,
      status: 'Completed',
      signedBy: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}${creds}`.trim(),
      signedAt: new Date().toISOString(),
    });
    setEditing(false);
    setEditDraft(null);
    flash();
  };

  const signEncounter = (enc) => {
    const creds = currentUser?.credentials ? `, ${currentUser.credentials}` : '';
    updateEncounter(patientId, enc.id, {
      status: 'Completed',
      signedBy: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}${creds}`.trim(),
      signedAt: new Date().toISOString(),
    });
    flash();
  };

  // ── Shared form renderer ────────────────────────────────
  const renderForm = (d, setD, onSave, onCancel, titleLabel, onClose) => {
    const mse = d.mse || {};
    const setMseField = (field, val) =>
      setD((prev) => ({ ...prev, mse: { ...prev.mse, [field]: val } }));

    return (
      <div className="fade-in">
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg-white)',
          borderBottom: '1px solid var(--border)', padding: '10px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>📝 {titleLabel}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {d.date} · {d.type} · {d.providerName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
            <button className="btn btn-sm btn-primary" onClick={onSave} disabled={!d.chiefComplaint.trim()}>
              💾 Save Encounter
            </button>
            <button className="btn btn-sm btn-success" onClick={onClose} disabled={!d.chiefComplaint.trim()}
              title={(d.cptCodes || []).length === 0 ? 'Add at least one CPT code in the Billing tab to close' : 'Save & close encounter as Completed'}
              style={{ background: '#1a7f4b', borderColor: '#1a7f4b', opacity: d.chiefComplaint.trim() ? 1 : 0.5 }}>
              ✅ Close Encounter
            </button>
          </div>
        </div>

        {/* Metadata bar */}
        <div style={{ padding: '10px 18px', background: '#f7f9fc', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 130px' }}>
            <label className="form-label" style={{ fontSize: 10 }}>Date</label>
            <input className="form-input" type="date" value={d.date}
              onChange={(e) => setD((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div style={{ flex: '0 0 110px' }}>
            <label className="form-label" style={{ fontSize: 10 }}>Time</label>
            <input className="form-input" type="time" value={d.time}
              onChange={(e) => setD((p) => ({ ...p, time: e.target.value }))} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label" style={{ fontSize: 10 }}>Visit Type</label>
            <select className="form-input" value={d.type}
              onChange={(e) => setD((p) => ({ ...p, type: e.target.value }))}>
              {VISIT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 0 160px' }}>
            <label className="form-label" style={{ fontSize: 10 }}>Status</label>
            <select className="form-input" value={d.status}
              onChange={(e) => setD((p) => ({ ...p, status: e.target.value }))}>
              {Object.keys(STATUS_BADGE).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Section tab bar */}
        <div style={{ display: 'flex', background: '#eef1f5', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
              style={{
                padding: '7px 15px', fontSize: 11.5, fontWeight: activeSection === s.id ? 700 : 500,
                background: activeSection === s.id ? '#fff' : 'transparent',
                color: activeSection === s.id ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none', borderBottom: activeSection === s.id ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s',
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ─ Section content ─ */}
        <div style={{ padding: '18px' }}>

          {/* CHIEF COMPLAINT & SUBJECTIVE */}
          {activeSection === 'subjective' && (
            <div className="fade-in">
              <SectionHeader icon="🗣️" title="Chief Complaint" color="#0060b6" />
              <div style={{ marginBottom: 18 }}>
                <label className="form-label">
                  Chief Complaint <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input className="form-input" type="text"
                  placeholder="e.g., Medication management — depression follow-up"
                  value={d.chiefComplaint}
                  onChange={(e) => setD((p) => ({ ...p, chiefComplaint: e.target.value }))} />
              </div>
              <SectionHeader icon="📖" title="Subjective — Patient History & Report" color="#4f46e5" />
              <div>
                <label className="form-label">History of Present Illness / Patient's Report</label>
                <textarea className="form-input" rows={10}
                  placeholder="Document patient's subjective report — symptoms, duration, onset, quality, severity, context, modifying factors, associated signs/symptoms, relevant history, medications reviewed, compliance..."
                  value={d.subjective}
                  onChange={(e) => setD((p) => ({ ...p, subjective: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* MSE */}
          {activeSection === 'mse' && (
            <div className="fade-in">
              <SectionHeader icon="🧠" title="Mental Status Examination (MSE)" color="#7c3aed" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <MseSelect label="Appearance" field="appearance" value={mse.appearance || ''} onChange={setMseField} />
                <MseSelect label="Behavior" field="behavior" value={mse.behavior || ''} onChange={setMseField} />
                <MseSelect label="Psychomotor Activity" field="psychomotor" value={mse.psychomotor || ''} onChange={setMseField} />
                <MseSelect label="Eye Contact" field="eyeContact" value={mse.eyeContact || ''} onChange={setMseField} />
                <MseSelect label="Speech" field="speech" value={mse.speech || ''} onChange={setMseField} />
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>
                    Mood (Patient's Own Words)
                  </label>
                  <input className="form-input" type="text" placeholder='e.g., "I feel anxious and tired"'
                    value={mse.mood || ''}
                    onChange={(e) => setD((p) => ({ ...p, mse: { ...p.mse, mood: e.target.value } }))}
                    style={{ fontSize: 12 }} />
                </div>
                <MseSelect label="Affect" field="affect" value={mse.affect || ''} onChange={setMseField} />
                <MseSelect label="Affect Congruence" field="affectCongruent" value={mse.affectCongruent || ''} onChange={setMseField} />
                <MseSelect label="Thought Process" field="thoughtProcess" value={mse.thoughtProcess || ''} onChange={setMseField} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c92b2b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                  ⚠️ Safety Assessment
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <MseSelect label="Thought Content" field="thoughtContent" value={mse.thoughtContent || ''} onChange={setMseField} />
                  <MseSelect label="Suicidal Ideation (SI)" field="suicidalIdeation" value={mse.suicidalIdeation || ''} onChange={setMseField} />
                  <MseSelect label="Homicidal Ideation (HI)" field="homicidalIdeation" value={mse.homicidalIdeation || ''} onChange={setMseField} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#445568', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                  Cognition & Insight
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <MseSelect label="Perceptions" field="perceptions" value={mse.perceptions || ''} onChange={setMseField} />
                  <MseSelect label="Orientation" field="orientation" value={mse.orientation || ''} onChange={setMseField} />
                  <MseSelect label="Memory" field="memory" value={mse.memory || ''} onChange={setMseField} />
                  <MseSelect label="Concentration & Attention" field="concentration" value={mse.concentration || ''} onChange={setMseField} />
                  <MseSelect label="Insight" field="insight" value={mse.insight || ''} onChange={setMseField} />
                  <MseSelect label="Judgment" field="judgment" value={mse.judgment || ''} onChange={setMseField} />
                </div>
              </div>

              <div>
                <label className="form-label">Additional MSE Notes</label>
                <textarea className="form-input" rows={4}
                  placeholder="Any additional clinical observations not captured in the dropdowns above..."
                  value={mse.additionalNotes || ''}
                  onChange={(e) => setD((p) => ({ ...p, mse: { ...p.mse, additionalNotes: e.target.value } }))}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* ASSESSMENT & PLAN */}
          {activeSection === 'assessment' && (
            <div className="fade-in">
              <SectionHeader icon="📊" title="Assessment / Clinical Impression" color="#d97706" />
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Assessment</label>
                <textarea className="form-input" rows={8}
                  placeholder="Provider's clinical assessment — synthesis of subjective/objective findings, diagnostic reasoning, changes from previous visit, risk assessment summary..."
                  value={d.assessment}
                  onChange={(e) => setD((p) => ({ ...p, assessment: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <SectionHeader icon="📋" title="Plan" color="#16a34a" />
              <div>
                <label className="form-label">Treatment Plan & Orders</label>
                <textarea className="form-input" rows={10}
                  placeholder="Medication changes, new prescriptions, lab orders, referrals, therapy plan, safety plan, psychoeducation provided, patient instructions, follow-up instructions..."
                  value={d.plan}
                  onChange={(e) => setD((p) => ({ ...p, plan: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* DIAGNOSES */}
          {activeSection === 'diagnoses' && (
            <div className="fade-in">
              <SectionHeader icon="🔖" title="Diagnoses — ICD-10 Codes" color="#0891b2" />
              <DiagnosesEditor
                diagnoses={d.diagnoses || []}
                onChange={(diags) => setD((p) => ({ ...p, diagnoses: diags }))} />
            </div>
          )}

          {/* CPT & BILLING */}
          {activeSection === 'billing' && (
            <div className="fade-in">
              <SectionHeader icon="💳" title="CPT Codes & Billing" color="#1a7f4b" />
              {billingError && (
                <div style={{
                  marginBottom: 14, padding: '10px 14px', borderRadius: 6,
                  background: 'rgba(201,43,43,0.07)', border: '1.5px solid rgba(201,43,43,0.35)',
                  color: '#c92b2b', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  ⚠️ At least one CPT code is required to close the encounter. Please add a billing code below.
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <CptEditor
                  cptCodes={d.cptCodes || []}
                  visitType={d.type}
                  onChange={(codes) => setD((p) => ({ ...p, cptCodes: codes }))} />
              </div>
              {/* Place of Service + Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Place of Service</label>
                  <select className="form-input" value={d.placeOfService}
                    onChange={(e) => setD((p) => ({ ...p, placeOfService: e.target.value }))}>
                    {PLACE_OF_SERVICE.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Total Psychotherapy Time Spent (minutes)</label>
                  <input className="form-input" type="number" min={1} max={480}
                    placeholder="e.g., 45"
                    value={d.timeSpentMinutes}
                    onChange={(e) => setD((p) => ({ ...p, timeSpentMinutes: e.target.value }))} />
                </div>
              </div>

              {/* Psychotherapy Sub-tabs */}
              <PsychTherapyTabs d={d} setD={setD} />

              {/* Telehealth */}
              <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: d.isTelehealth ? 10 : 0 }}>
                  <input type="checkbox" checked={!!d.isTelehealth}
                    onChange={(e) => setD((p) => ({ ...p, isTelehealth: e.target.checked }))}
                    style={{ width: 15, height: 15, accentColor: '#0060b6', cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>📹 Telehealth Visit</span>
                </label>
                {d.isTelehealth && (
                  <div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#445568' }}>Patient Location:</span>
                      {[{ val: 'home', label: '🏠 Home' }, { val: 'outside_home', label: '📍 Outside Home' }].map(loc => (
                        <label key={loc.val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="radio" name={`patLoc-${d.id || 'new'}`}
                            checked={d.patientLocation === loc.val}
                            onChange={() => setD((p) => ({ ...p, patientLocation: loc.val }))}
                            style={{ accentColor: '#0060b6' }} />
                          <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{loc.label}</span>
                        </label>
                      ))}
                    </div>
                    <label className="form-label" style={{ marginBottom: 4 }}>Telehealth Attestation</label>
                    <textarea className="form-input" rows={3}
                      value={d.telehealthNote || ''}
                      onChange={(e) => setD((p) => ({ ...p, telehealthNote: e.target.value }))}
                      style={{ resize: 'vertical', fontSize: 12.5 }} />
                  </div>
                )}
              </div>

              {/* Billing Notes */}
              <div>
                <label className="form-label">Billing Notes / Authorization</label>
                <textarea className="form-input" rows={3}
                  placeholder="Insurance authorization number, medical necessity, prior auth, copay collected..."
                  value={d.billingNotes}
                  onChange={(e) => setD((p) => ({ ...p, billingNotes: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* FOLLOW-UP */}
          {activeSection === 'followup' && (
            <div className="fade-in">
              <SectionHeader icon="📅" title="Follow-Up Scheduling" color="#0a8a7e" />
              <FollowUpScheduler
                value={d.followUp || { needed: false, date: '', time: '', duration: 30, note: '' }}
                onChange={(fu) => setD((p) => ({ ...p, followUp: fu }))} />
            </div>
          )}
        </div>

        {/* Bottom save bar */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: '#f7f9fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-sm btn-primary" onClick={onSave} disabled={!d.chiefComplaint.trim()}>
              💾 Save Encounter
            </button>
            <button className="btn btn-sm" onClick={onClose} disabled={!d.chiefComplaint.trim()}
              title={(d.cptCodes || []).length === 0 ? 'Add at least one CPT code in the Billing tab to close' : 'Save & close encounter as Completed'}
              style={{
                background: '#1a7f4b', color: '#fff', border: '1px solid #1a7f4b',
                opacity: d.chiefComplaint.trim() ? 1 : 0.5,
                fontWeight: 700,
              }}>
              ✅ Close Encounter
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Read-only detail view ────────────────────────────────
  const renderDetail = (enc) => {
    const mse = enc.mse || {};
    const hasMse = Object.values(mse).some((v) => v && v !== '');

    return (
      <div className="card fade-in" style={{ overflow: 'hidden' }}>
        {/* Detail header */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: '#f7f9fc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              {enc.type}
              <span className={`badge ${STATUS_BADGE[enc.status] || 'badge-info'}`} style={{ fontSize: 10.5 }}>{enc.status}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              {enc.date}{enc.time ? ` · ${enc.time}` : ''} · {enc.providerName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm" onClick={() => startEdit(enc)}>✏️ Edit</button>
            {enc.status !== 'Completed' && (
              <button className="btn btn-sm btn-primary" onClick={() => signEncounter(enc)}>✍️ Sign & Complete</button>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 18px', overflowY: 'auto' }}>
          {/* Chief complaint banner */}
          <div style={{ marginBottom: 18, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 6, borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--primary)', marginBottom: 3 }}>Chief Complaint</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{enc.chiefComplaint || <span className="text-muted">—</span>}</div>
          </div>

          {/* Subjective */}
          {enc.subjective && <DetailBlock title="Subjective" color="#4f46e5" content={enc.subjective} />}

          {/* MSE summary */}
          {hasMse && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#7c3aed', marginBottom: 8 }}>
                🧠 Mental Status Examination
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
                {[
                  ['Appearance', mse.appearance], ['Behavior', mse.behavior], ['Psychomotor', mse.psychomotor],
                  ['Eye Contact', mse.eyeContact], ['Speech', mse.speech], ['Mood', mse.mood],
                  ['Affect', mse.affect], ['Affect Congruence', mse.affectCongruent], ['Thought Process', mse.thoughtProcess],
                  ['Thought Content', mse.thoughtContent], ['SI', mse.suicidalIdeation], ['HI', mse.homicidalIdeation],
                  ['Perceptions', mse.perceptions], ['Orientation', mse.orientation], ['Memory', mse.memory],
                  ['Concentration', mse.concentration], ['Insight', mse.insight], ['Judgment', mse.judgment],
                ].filter(([, v]) => v).map(([label, val]) => {
                  const risk = ['SI','HI','Thought Content'].includes(label)
                    && val && !val.toLowerCase().startsWith('denied') && !val.toLowerCase().startsWith('no si');
                  return (
                    <div key={label} style={{
                      padding: '5px 9px', borderRadius: 6,
                      background: risk ? 'rgba(201,43,43,0.06)' : '#f7f9fc',
                      border: `1px solid ${risk ? 'rgba(201,43,43,0.25)' : 'var(--border-light)'}`,
                    }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: risk ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: risk ? 'var(--danger)' : 'var(--text-primary)', marginTop: 2 }}>
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
              {mse.additionalNotes && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#f7f9fc', borderRadius: 6, fontSize: 12.5, borderLeft: '3px solid #7c3aed' }}>
                  {mse.additionalNotes}
                </div>
              )}
            </div>
          )}

          {/* Assessment & Plan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            {enc.assessment && <DetailBlock title="Assessment" color="#d97706" content={enc.assessment} />}
            {enc.plan && <DetailBlock title="Plan" color="#16a34a" content={enc.plan} />}
          </div>

          {/* Diagnoses */}
          {(enc.diagnoses || []).length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0891b2', marginBottom: 8 }}>
                🔖 ICD-10 Diagnoses
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
                {enc.diagnoses.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 12px', borderBottom: i < enc.diagnoses.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: 13, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '1px 7px', borderRadius: 4, fontSize: 11.5 }}>
                      {d.code}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{d.description || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CPT & Billing */}
          {((enc.cptCodes || []).length > 0 || enc.timeSpentMinutes || enc.billingNotes || enc.supportivePsychNotes || enc.cbtNotes || enc.isTelehealth) && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#1a7f4b', marginBottom: 8 }}>
                💳 CPT & Billing
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8, fontSize: 12.5 }}>
                {enc.placeOfService && <span><strong>POS:</strong> {enc.placeOfService}</span>}
                {enc.timeSpentMinutes && <span><strong>Psychotherapy Time:</strong> {enc.timeSpentMinutes} min</span>}
              </div>
              {(enc.cptCodes || []).length > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden', marginBottom: 8 }}>
                  {enc.cptCodes.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 12px', borderBottom: i < enc.cptCodes.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: 13, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1a7f4b', background: 'rgba(26,127,75,0.08)', padding: '1px 7px', borderRadius: 4, fontSize: 11.5 }}>
                        {c.code}
                      </span>
                      <span style={{ flex: 1, color: 'var(--text-secondary)', fontSize: 12.5 }}>{c.desc}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Units: {c.units}</span>
                    </div>
                  ))}
                </div>
              )}
              {enc.supportivePsychNotes && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1a7f4b', marginBottom: 3 }}>
                    Supportive Psychotherapy & Reflective Listening
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: '8px 12px', background: '#f7f9fc', borderRadius: 6, borderLeft: '3px solid #1a7f4b' }}>
                    {enc.supportivePsychNotes}
                  </div>
                </div>
              )}
              {enc.cbtNotes && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1a7f4b', marginBottom: 3 }}>
                    CBT
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: '8px 12px', background: '#f7f9fc', borderRadius: 6, borderLeft: '3px solid #1a7f4b' }}>
                    {enc.cbtNotes}
                  </div>
                </div>
              )}
              {enc.isTelehealth && (
                <div style={{ marginBottom: 8, padding: '10px 14px', background: 'rgba(0,96,182,0.05)', borderRadius: 6, border: '1px solid rgba(0,96,182,0.2)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', marginBottom: 4 }}>
                    📹 Telehealth Visit
                    {enc.patientLocation && (
                      <span style={{ marginLeft: 8, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                        — Patient Location: {enc.patientLocation === 'home' ? '🏠 Home' : '📍 Outside Home'}
                      </span>
                    )}
                  </div>
                  {enc.telehealthNote && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{enc.telehealthNote}</div>}
                </div>
              )}
              {enc.billingNotes && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{enc.billingNotes}</div>}
            </div>
          )}

          {/* Follow-up */}
          {enc.followUp?.needed && enc.followUp.date && (
            <div style={{ marginBottom: 18, padding: '12px 16px', background: 'rgba(10,138,126,0.06)', border: '1px solid rgba(10,138,126,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0a8a7e', marginBottom: 6 }}>
                📅 Follow-Up Scheduled
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                {enc.followUp.date}{enc.followUp.time ? ` at ${enc.followUp.time}` : ''} &nbsp;·&nbsp;
                <span style={{ fontWeight: 500, fontSize: 13 }}>{enc.followUp.duration}-minute slot</span>
              </div>
              {enc.followUp.note && <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--text-secondary)' }}>{enc.followUp.note}</div>}
            </div>
          )}

          {/* Signature */}
          {enc.signedBy && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', padding: '8px 14px', background: '#f7f9fc', borderRadius: 7, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Electronically Signed</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{enc.signedBy}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{enc.signedAt ? new Date(enc.signedAt).toLocaleString() : ''}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Main layout ──────────────────────────────────────────
  return (
    <div className="fade-in" style={{ paddingTop: 16 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>📋 Encounter Notes</h2>
          <p className="text-muted text-sm" style={{ marginTop: 2 }}>
            {patientEncounters.length} encounter{patientEncounters.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={startNew} disabled={creating}>
          + New Encounter
        </button>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: 12 }}>
          ✅ Encounter saved successfully.
        </div>
      )}

      {/* New encounter form — full width above list */}
      {creating && draft && (
        <div className="card" style={{ overflow: 'visible', marginBottom: 16 }}>
          {renderForm(draft, setDraft, saveNew, cancelNew, 'New Encounter', closeNew)}
        </div>
      )}

      {/* Two-panel list + detail */}
      {!creating && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14 }}>
          {/* Encounter list */}
          <div className="card" style={{ overflow: 'hidden', alignSelf: 'start' }}>
            <div className="card-header" style={{ padding: '8px 12px' }}>
              <h3 style={{ margin: 0, fontSize: 11.5 }}>History</h3>
            </div>
            <div className="card-body no-pad">
              {patientEncounters.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <span className="icon">📋</span>
                  <p style={{ fontSize: 12 }}>No encounters yet</p>
                  <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={startNew}>+ New</button>
                </div>
              ) : (
                patientEncounters.map((enc) => (
                  <div key={enc.id}
                    onClick={() => { setSelectedId(enc.id); setEditing(false); setEditDraft(null); }}
                    style={{
                      padding: '10px 12px', borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      background: selectedId === enc.id ? 'var(--primary-light)' : 'transparent',
                      borderLeft: `3px solid ${selectedId === enc.id ? 'var(--primary)' : 'transparent'}`,
                      transition: 'background 0.1s',
                    }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: selectedId === enc.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {enc.date}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 1 }}>{enc.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {enc.chiefComplaint}
                    </div>
                    <div style={{ marginTop: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <span className={`badge ${STATUS_BADGE[enc.status] || 'badge-info'}`} style={{ fontSize: 9.5 }}>
                        {enc.status}
                      </span>
                      {(enc.diagnoses || []).length > 0 && (
                        <span className="badge badge-gray" style={{ fontSize: 9.5 }}>{enc.diagnoses.length} dx</span>
                      )}
                      {(enc.cptCodes || []).length > 0 && (
                        <span className="badge badge-success" style={{ fontSize: 9.5 }}>{enc.cptCodes.length} CPT</span>
                      )}
                      {enc.followUp?.needed && enc.followUp.date && (
                        <span className="badge" style={{ fontSize: 9.5, background: 'rgba(10,138,126,0.12)', color: '#0a8a7e', border: '1px solid rgba(10,138,126,0.3)' }}>
                          F/U {enc.followUp.date}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detail / Edit panel */}
          <div>
            {!selected && !editing && (
              <div className="card">
                <div className="empty-state" style={{ padding: 48 }}>
                  <span className="icon">📋</span>
                  <h3>Select an Encounter</h3>
                  <p>Choose from the list or create a new encounter.</p>
                </div>
              </div>
            )}

            {selected && !editing && renderDetail(selected)}

            {selected && editing && editDraft && (
              <div className="card" style={{ overflow: 'visible' }}>
                {renderForm(editDraft, setEditDraft, saveEdit, cancelEdit, `Edit — ${selected.date} · ${selected.type}`, closeEdit)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


