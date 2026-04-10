import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

// ── Gap severity colors ─────────────────────────────────────────────
const SEV = {
  Critical: { color: 'var(--danger)',  bg: 'var(--danger-light)',  badge: 'badge-danger' },
  High:     { color: 'var(--warning)', bg: '#fff7ed',             badge: 'badge-warning' },
  Moderate: { color: 'var(--info)',    bg: 'var(--info-light)',    badge: 'badge-info' },
  Low:      { color: 'var(--text-muted)', bg: 'var(--bg)',        badge: 'badge-gray' },
};

// ── Gap categories ──────────────────────────────────────────────────
const CATEGORIES = [
  'All',
  'Screening / Assessment',
  'Preventive Care',
  'Chronic Disease',
  'Medication Safety',
  'Follow-up',
  'Immunization',
  'Lab / Monitoring',
  'Academic / Trainee',
];

// ── Mini progress ring ──────────────────────────────────────────────
function ProgressRing({ pct, size = 44, stroke = 5, color = 'var(--primary)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" style={{ fontSize: 11, fontWeight: 800, fill: 'var(--text-primary)' }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function CareGaps() {
  const { currentUser } = useAuth();
  const { patients, meds, labResults, immunizations, assessmentScores, vitalSigns, appointments } = usePatient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [resolvedGaps, setResolvedGaps] = useState(new Set());

  // ── Build care gaps per patient ──────────────────────────────────
  const patientGaps = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return patients.filter(p => p.isActive).map(patient => {
      const pid = patient.id;
      const gaps = [];
      const patMeds = meds[pid] || [];
      const patLabs = labResults[pid] || [];
      const patImmunizations = immunizations[pid] || [];
      const patAssessments = assessmentScores[pid] || [];
      const patVitals = vitalSigns[pid] || [];
      const patAppts = appointments.filter(a => a.patientId === pid);
      const age = patient.age || 0;

      // ── Screening / Assessment ─────────────────────────────────
      const hasPHQ9Recent = patAssessments.some(a => (a.tool === 'PHQ-9' || a.name === 'PHQ-9') && a.date >= sixMonthsAgo.toISOString().slice(0, 10));
      if (!hasPHQ9Recent) {
        gaps.push({
          id: `${pid}-phq9`,
          category: 'Screening / Assessment',
          severity: 'High',
          gap: 'PHQ-9 Depression Screening Overdue',
          detail: 'No PHQ-9 completed in the last 6 months. USPSTF recommends routine depression screening for all adults.',
          action: 'Administer PHQ-9 at next visit',
          measure: 'CMS 2v13 / NQF 0418',
        });
      }

      const hasGAD7Recent = patAssessments.some(a => (a.tool === 'GAD-7' || a.name === 'GAD-7') && a.date >= sixMonthsAgo.toISOString().slice(0, 10));
      if (!hasGAD7Recent) {
        gaps.push({
          id: `${pid}-gad7`,
          category: 'Screening / Assessment',
          severity: 'Moderate',
          gap: 'GAD-7 Anxiety Screening Overdue',
          detail: 'No GAD-7 completed in the last 6 months.',
          action: 'Administer GAD-7 at next visit',
          measure: 'Institutional Quality Metric',
        });
      }

      // Suicide risk for flagged patients
      if (patient.flags?.some(f => f.toLowerCase().includes('suicide'))) {
        const hasC_SSRS = patAssessments.some(a => (a.tool === 'C-SSRS' || a.name === 'C-SSRS' || a.tool === 'Columbia Suicide Severity') && a.date >= sixMonthsAgo.toISOString().slice(0, 10));
        if (!hasC_SSRS) {
          gaps.push({
            id: `${pid}-cssrs`,
            category: 'Screening / Assessment',
            severity: 'Critical',
            gap: 'Suicide Risk Assessment Overdue',
            detail: 'Patient flagged as suicide risk. No C-SSRS documented in the last 6 months.',
            action: 'Administer C-SSRS immediately',
            measure: 'Joint Commission NPSG 15.01.01',
          });
        }
      }

      // Substance use screening
      if (patient.flags?.some(f => f.toLowerCase().includes('substance'))) {
        const hasDASTorAUDIT = patAssessments.some(a => {
          const tool = (a.tool || a.name || '').toLowerCase();
          return (tool.includes('dast') || tool.includes('audit') || tool.includes('cage')) && a.date >= oneYearAgo.toISOString().slice(0, 10);
        });
        if (!hasDASTorAUDIT) {
          gaps.push({
            id: `${pid}-sbirt`,
            category: 'Screening / Assessment',
            severity: 'High',
            gap: 'Substance Use Screening Overdue',
            detail: 'Patient has substance use history. No AUDIT/DAST/CAGE documented in the past year.',
            action: 'Complete SBIRT screening',
            measure: 'CMS 431v2',
          });
        }
      }

      // ── Vitals ─────────────────────────────────────────────────
      const recentVitals = patVitals[0];
      if (!recentVitals || recentVitals.date < oneYearAgo.toISOString().slice(0, 10)) {
        gaps.push({
          id: `${pid}-vitals`,
          category: 'Preventive Care',
          severity: 'Moderate',
          gap: 'Vitals Not Documented in Past Year',
          detail: 'No vital signs recorded in the last 12 months.',
          action: 'Obtain vitals at next visit',
          measure: 'CMS 69v12',
        });
      }

      // BMI
      const hasBMI = recentVitals && recentVitals.bmi;
      if (!hasBMI) {
        gaps.push({
          id: `${pid}-bmi`,
          category: 'Preventive Care',
          severity: 'Low',
          gap: 'BMI Not Documented',
          detail: 'Body Mass Index not found in most recent vitals.',
          action: 'Calculate and document BMI',
          measure: 'CMS 69v12 / NQF 0421',
        });
      }

      // Elevated BP
      if (recentVitals) {
        const sys = parseInt(recentVitals.systolic || recentVitals.bp?.split('/')[0]);
        const dia = parseInt(recentVitals.diastolic || recentVitals.bp?.split('/')[1]);
        if (sys >= 140 || dia >= 90) {
          gaps.push({
            id: `${pid}-htn`,
            category: 'Chronic Disease',
            severity: 'High',
            gap: 'Uncontrolled Hypertension',
            detail: `Last BP: ${recentVitals.bp || `${sys}/${dia}`}. Target < 140/90 mmHg.`,
            action: 'Review antihypertensive regimen; consider titration',
            measure: 'CMS 165v12 / NQF 0018',
          });
        }
      }

      // ── Lab Monitoring ─────────────────────────────────────────
      // Lithium level monitoring
      const onLithium = patMeds.some(m => m.name?.toLowerCase().includes('lithium'));
      if (onLithium) {
        const hasLithiumLab = patLabs.some(l => (l.test || l.name || '').toLowerCase().includes('lithium') && l.date >= sixMonthsAgo.toISOString().slice(0, 10));
        if (!hasLithiumLab) {
          gaps.push({
            id: `${pid}-lithium`,
            category: 'Lab / Monitoring',
            severity: 'Critical',
            gap: 'Lithium Level Monitoring Overdue',
            detail: 'Patient is on Lithium. No serum lithium level in the last 6 months. Risk of toxicity.',
            action: 'Order serum lithium level, BMP, and TSH',
            measure: 'APA Practice Guideline',
          });
        }
      }

      // Valproic acid monitoring
      const onValproate = patMeds.some(m => {
        const n = (m.name || '').toLowerCase();
        return n.includes('valproic') || n.includes('depakote') || n.includes('divalproex');
      });
      if (onValproate) {
        const hasVPALevel = patLabs.some(l => (l.test || l.name || '').toLowerCase().includes('valproic') && l.date >= sixMonthsAgo.toISOString().slice(0, 10));
        if (!hasVPALevel) {
          gaps.push({
            id: `${pid}-vpa`,
            category: 'Lab / Monitoring',
            severity: 'High',
            gap: 'Valproic Acid Level Overdue',
            detail: 'Patient on Valproic Acid. No drug level in the last 6 months.',
            action: 'Order valproic acid level, CBC, and hepatic panel',
            measure: 'APA Practice Guideline',
          });
        }
      }

      // Clozapine ANC monitoring
      const onClozapine = patMeds.some(m => (m.name || '').toLowerCase().includes('clozapine'));
      if (onClozapine) {
        const hasCBC = patLabs.some(l => {
          const t = (l.test || l.name || '').toLowerCase();
          return (t.includes('cbc') || t.includes('anc') || t.includes('neutrophil'));
        });
        if (!hasCBC) {
          gaps.push({
            id: `${pid}-clozapine`,
            category: 'Lab / Monitoring',
            severity: 'Critical',
            gap: 'Clozapine ANC Monitoring Missing',
            detail: 'Patient on Clozapine (REMS program). ANC monitoring is mandatory to prevent agranulocytosis.',
            action: 'Order CBC with ANC immediately per REMS schedule',
            measure: 'Clozapine REMS Program / FDA',
          });
        }
      }

      // Metabolic monitoring for antipsychotics
      const onAntipsychotic = patMeds.some(m => (m.class || '').toLowerCase().includes('antipsychotic'));
      if (onAntipsychotic) {
        const hasMetabolicPanel = patLabs.some(l => {
          const t = (l.test || l.name || '').toLowerCase();
          return (t.includes('glucose') || t.includes('hba1c') || t.includes('metabolic') || t.includes('lipid'));
        });
        if (!hasMetabolicPanel) {
          gaps.push({
            id: `${pid}-metabolic`,
            category: 'Lab / Monitoring',
            severity: 'High',
            gap: 'Metabolic Monitoring Due (Antipsychotic)',
            detail: 'Patient on antipsychotic. No metabolic panel (glucose/HbA1c/lipids) found. AAP/ADA guidelines recommend regular monitoring.',
            action: 'Order fasting glucose or HbA1c, lipid panel',
            measure: 'ADA/APA Consensus Guidelines',
          });
        }
      }

      // Controlled substance – UDS monitoring
      const onControlled = patMeds.some(m => m.isControlled && (m.schedule === 'Schedule II' || m.schedule === 'Schedule III'));
      if (onControlled) {
        const hasUDS = patLabs.some(l => (l.test || l.name || '').toLowerCase().includes('drug screen'));
        if (!hasUDS) {
          gaps.push({
            id: `${pid}-uds`,
            category: 'Medication Safety',
            severity: 'Moderate',
            gap: 'Urine Drug Screen Not Documented',
            detail: 'Patient is on Schedule II/III controlled substance. No UDS found in chart.',
            action: 'Order urine drug screen per institutional policy',
            measure: 'Institutional Controlled Substance Policy',
          });
        }
      }

      // ── Medication Safety ──────────────────────────────────────
      // Medication reconciliation
      const lastEncounterDate = Object.values(patAppts).filter(a => a.status === 'Completed').sort((a, b) => b.date > a.date ? 1 : -1)[0]?.date;
      if (patMeds.length >= 5) {
        gaps.push({
          id: `${pid}-medrec`,
          category: 'Medication Safety',
          severity: 'Low',
          gap: 'Polypharmacy Review Recommended',
          detail: `Patient has ${patMeds.length} active medications. Consider medication reconciliation and deprescribing assessment.`,
          action: 'Review for drug interactions, duplications, and deprescribing opportunities',
          measure: 'CMS 68v13 / NQF 0553',
        });
      }

      // ── Immunizations ──────────────────────────────────────────
      const hasFlu = patImmunizations.some(imm => (imm.vaccine || imm.name || '').toLowerCase().includes('influenza') && imm.date >= oneYearAgo.toISOString().slice(0, 10));
      if (!hasFlu) {
        gaps.push({
          id: `${pid}-flu`,
          category: 'Immunization',
          severity: 'Moderate',
          gap: 'Influenza Vaccine Overdue',
          detail: 'No flu vaccine documented in the current/last season.',
          action: 'Offer influenza vaccination',
          measure: 'CMS 147v13 / NQF 0041',
        });
      }

      // COVID
      const hasCovid = patImmunizations.some(imm => (imm.vaccine || imm.name || '').toLowerCase().includes('covid'));
      if (!hasCovid) {
        gaps.push({
          id: `${pid}-covid`,
          category: 'Immunization',
          severity: 'Low',
          gap: 'COVID-19 Vaccination Status Unknown',
          detail: 'No COVID-19 vaccine recorded in the system.',
          action: 'Verify vaccination status; offer updated vaccine',
          measure: 'CDC ACIP Recommendation',
        });
      }

      // Tdap for adults
      const hasTdap = patImmunizations.some(imm => {
        const n = (imm.vaccine || imm.name || '').toLowerCase();
        return n.includes('tdap') || n.includes('tetanus');
      });
      if (!hasTdap && age >= 19) {
        gaps.push({
          id: `${pid}-tdap`,
          category: 'Immunization',
          severity: 'Low',
          gap: 'Tdap Vaccination Not Documented',
          detail: 'No Tdap vaccine on record. ACIP recommends one Tdap dose for all adults, then Td booster every 10 years.',
          action: 'Offer Tdap if not received',
          measure: 'CDC ACIP',
        });
      }

      // Shingrix for 50+
      if (age >= 50) {
        const hasShingrix = patImmunizations.some(imm => (imm.vaccine || imm.name || '').toLowerCase().includes('shingr'));
        if (!hasShingrix) {
          gaps.push({
            id: `${pid}-shingrix`,
            category: 'Immunization',
            severity: 'Low',
            gap: 'Shingles Vaccine (Shingrix) Not Documented',
            detail: 'Recommended for adults ≥ 50. Two-dose series.',
            action: 'Offer Shingrix vaccine',
            measure: 'CDC ACIP',
          });
        }
      }

      // PCV20 for 65+
      if (age >= 65) {
        const hasPneumo = patImmunizations.some(imm => {
          const n = (imm.vaccine || imm.name || '').toLowerCase();
          return n.includes('pneumo') || n.includes('prevnar') || n.includes('pneumovax');
        });
        if (!hasPneumo) {
          gaps.push({
            id: `${pid}-pneumo`,
            category: 'Immunization',
            severity: 'Moderate',
            gap: 'Pneumococcal Vaccine Not Documented',
            detail: 'ACIP recommends PCV20 for adults ≥ 65.',
            action: 'Offer PCV20 (Prevnar 20)',
            measure: 'CDC ACIP / CMS 127v12',
          });
        }
      }

      // ── Follow-up ──────────────────────────────────────────────
      const lastVisit = patient.lastVisit;
      const daysSinceVisit = lastVisit ? Math.floor((today - new Date(lastVisit)) / 86400000) : 999;

      // High-risk patients without recent follow-up
      const isHighRisk = patient.flags?.some(f => f.toLowerCase().includes('suicide') || f.toLowerCase().includes('substance'));
      if (isHighRisk && daysSinceVisit > 30) {
        gaps.push({
          id: `${pid}-followup`,
          category: 'Follow-up',
          severity: 'Critical',
          gap: 'High-Risk Patient – Follow-up Overdue',
          detail: `Last visit was ${daysSinceVisit} days ago. High-risk patients should be seen within 30 days.`,
          action: 'Schedule follow-up appointment within 7 days',
          measure: 'CMS 177v12 / HEDIS FUH',
        });
      } else if (daysSinceVisit > 90) {
        gaps.push({
          id: `${pid}-routine-fu`,
          category: 'Follow-up',
          severity: 'Moderate',
          gap: 'Routine Follow-up Overdue',
          detail: `No visit in ${daysSinceVisit} days. Consider recall.`,
          action: 'Send patient recall / schedule follow-up',
          measure: 'Institutional Policy',
        });
      }

      // ── Academic / Trainee ─────────────────────────────────────
      // If patient is assigned to a resident, check for attending co-sign
      // (simulated: just flag patients not assigned to u1/u2/u3 main attendings)

      return {
        patient,
        gaps: gaps.filter(g => !resolvedGaps.has(g.id)),
        totalGaps: gaps.length,
        resolvedCount: gaps.filter(g => resolvedGaps.has(g.id)).length,
      };
    }).filter(pg => pg.gaps.length > 0 || pg.resolvedCount > 0);
  }, [patients, meds, labResults, immunizations, assessmentScores, vitalSigns, appointments, resolvedGaps]);

  // ── All gaps flattened ───────────────────────────────────────────
  const allGaps = patientGaps.flatMap(pg => pg.gaps.map(g => ({ ...g, patient: pg.patient })));

  // ── Filtered ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allGaps;
    if (filter !== 'All') list = list.filter(g => g.category === filter);
    if (severity !== 'All') list = list.filter(g => g.severity === severity);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.gap.toLowerCase().includes(q) ||
        g.patient.firstName.toLowerCase().includes(q) ||
        g.patient.lastName.toLowerCase().includes(q) ||
        g.patient.mrn.toLowerCase().includes(q)
      );
    }
    // Sort: Critical > High > Moderate > Low
    const ord = { Critical: 0, High: 1, Moderate: 2, Low: 3 };
    return list.sort((a, b) => (ord[a.severity] ?? 4) - (ord[b.severity] ?? 4));
  }, [allGaps, filter, severity, search]);

  // ── Summary counts ───────────────────────────────────────────────
  const sevCounts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
  allGaps.forEach(g => { sevCounts[g.severity] = (sevCounts[g.severity] || 0) + 1; });

  const categoryCounts = useMemo(() => {
    const map = {};
    allGaps.forEach(g => { map[g.category] = (map[g.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allGaps]);

  const totalResolved = patientGaps.reduce((s, pg) => s + pg.resolvedCount, 0);
  const totalAll = allGaps.length + totalResolved;
  const closureRate = totalAll ? Math.round((totalResolved / totalAll) * 100) : 0;

  const handleResolve = (gapId) => {
    setResolvedGaps(prev => new Set([...prev, gapId]));
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>🩺 Care Gaps &amp; Quality Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
            Population health management &amp; evidence-based gap identification
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ProgressRing pct={closureRate} size={44} color={closureRate >= 70 ? 'var(--success)' : closureRate >= 40 ? 'var(--warning)' : 'var(--danger)'} />
          <div style={{ fontSize: 11, lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700 }}>Closure Rate</div>
            <div style={{ color: 'var(--text-muted)' }}>{totalResolved}/{totalAll} resolved</div>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { icon: '🚨', value: sevCounts.Critical, label: 'Critical', color: 'red' },
          { icon: '⚠️', value: sevCounts.High, label: 'High', color: 'yellow' },
          { icon: 'ℹ️', value: sevCounts.Moderate, label: 'Moderate', color: 'blue' },
          { icon: '📋', value: sevCounts.Low, label: 'Low', color: 'teal' },
          { icon: '✅', value: totalResolved, label: 'Resolved', color: 'green' },
        ].map(s => (
          <div
            key={s.label}
            className={`stat-card row ${s.color}`}
            style={{ cursor: 'pointer', border: severity === s.label ? '2px solid var(--primary)' : undefined }}
            onClick={() => setSeverity(severity === s.label ? 'All' : s.label === 'Resolved' ? 'All' : s.label)}
          >
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <input
            className="form-input"
            placeholder="Search patient, MRN, or gap…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13 }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.5 }}>🔍</span>
        </div>
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: 13, maxWidth: 220 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value)} style={{ fontSize: 13, maxWidth: 160 }}>
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Moderate">Moderate</option>
          <option value="Low">Low</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {allGaps.length} gaps across <strong>{patientGaps.length}</strong> patients
        </div>
      </div>

      {/* ── Main content: 2 columns ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

        {/* Left: Gap list */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 13 }}>📋 Active Care Gaps</h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sorted by severity</span>
          </div>
          <div className="card-body no-pad" style={{ maxHeight: 600, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <span className="icon" style={{ fontSize: 36 }}>🎉</span>
                <h3>No care gaps found</h3>
                <p>All quality measures are met for the current filter.</p>
              </div>
            ) : (
              filtered.map(gap => {
                const sev = SEV[gap.severity] || SEV.Low;
                return (
                  <div
                    key={gap.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: `3px solid ${sev.color}`,
                      background: expandedPatient === gap.id ? 'var(--bg)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => setExpandedPatient(expandedPatient === gap.id ? null : gap.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge ${sev.badge}`} style={{ fontSize: 10, flexShrink: 0 }}>{gap.severity}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{gap.gap}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                          <span
                            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                            onClick={e => { e.stopPropagation(); navigate(`/chart/${gap.patient.id}/summary`); }}
                          >
                            {gap.patient.lastName}, {gap.patient.firstName}
                          </span>
                          <span style={{ margin: '0 6px', color: 'var(--border)' }}>|</span>
                          <span>MRN {gap.patient.mrn}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{gap.category}</span>
                    </div>

                    {expandedPatient === gap.id && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12 }}>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{gap.detail}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span className="badge badge-info" style={{ fontSize: 10 }}>📏 {gap.measure}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
                          <span style={{ fontWeight: 700, fontSize: 11 }}>⚡ Recommended Action:</span>
                          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{gap.action}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={e => { e.stopPropagation(); navigate(`/chart/${gap.patient.id}/summary`); }}
                          >
                            📂 Open Chart
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={e => { e.stopPropagation(); handleResolve(gap.id); }}
                          >
                            ✅ Mark Resolved
                          </button>
                          {gap.category === 'Screening / Assessment' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={e => { e.stopPropagation(); navigate(`/chart/${gap.patient.id}/assessments`); }}
                            >
                              📊 Go to Assessments
                            </button>
                          )}
                          {gap.category === 'Lab / Monitoring' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={e => { e.stopPropagation(); navigate(`/chart/${gap.patient.id}/orders`); }}
                            >
                              📝 Go to Orders
                            </button>
                          )}
                          {gap.category === 'Immunization' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={e => { e.stopPropagation(); navigate(`/chart/${gap.patient.id}/immunizations`); }}
                            >
                              💉 Go to Immunizations
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Summary sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* By Category */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>📊 Gaps by Category</h2></div>
            <div className="card-body">
              {categoryCounts.map(([cat, count], i) => {
                const colors = ['var(--danger)', 'var(--warning)', 'var(--primary)', 'var(--teal)', 'var(--purple)', 'var(--success)', 'var(--orange)', '#6366f1'];
                return (
                  <div
                    key={cat}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6, cursor: 'pointer', opacity: filter === cat ? 1 : 0.8 }}
                    onClick={() => setFilter(filter === cat ? 'All' : cat)}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{cat}</span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patients at Risk */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>🚨 Patients by Gap Count</h2></div>
            <div className="card-body no-pad" style={{ maxHeight: 280, overflowY: 'auto' }}>
              {patientGaps
                .sort((a, b) => b.gaps.length - a.gaps.length)
                .map(pg => {
                  const critCount = pg.gaps.filter(g => g.severity === 'Critical').length;
                  return (
                    <div
                      key={pg.patient.id}
                      style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}
                      onClick={() => navigate(`/chart/${pg.patient.id}/summary`)}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: critCount > 0 ? 'var(--danger-light)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: critCount > 0 ? 'var(--danger)' : 'var(--text-secondary)', flexShrink: 0 }}>
                        {pg.gaps.length}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{pg.patient.lastName}, {pg.patient.firstName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>MRN {pg.patient.mrn}</div>
                      </div>
                      {critCount > 0 && (
                        <span className="badge badge-danger" style={{ fontSize: 9 }}>{critCount} critical</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Evidence / Guidelines */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 13 }}>📚 Guidelines &amp; Measures</h2></div>
            <div className="card-body" style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Active Measure Sets:</strong>
              </div>
              {[
                { code: 'HEDIS', label: 'Healthcare Effectiveness Data & Information Set' },
                { code: 'MIPS', label: 'Merit-based Incentive Payment System' },
                { code: 'CMS eCQM', label: 'Electronic Clinical Quality Measures' },
                { code: 'ACIP', label: 'Advisory Committee on Immunization Practices' },
                { code: 'APA', label: 'American Psychiatric Association Guidelines' },
                { code: 'USPSTF', label: 'US Preventive Services Task Force' },
                { code: 'REMS', label: 'Risk Evaluation & Mitigation Strategies' },
                { code: 'Joint Commission', label: 'National Patient Safety Goals' },
                { code: 'ACGME', label: 'Accreditation Council for GME' },
              ].map(g => (
                <div key={g.code} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span className="badge badge-gray" style={{ fontSize: 9, flexShrink: 0 }}>{g.code}</span>
                  <span style={{ fontSize: 11 }}>{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '16px 0 4px' }}>
        Care gaps are computed from active patient data against evidence-based guidelines. For demonstration and teaching purposes only.
      </div>
    </div>
  );
}
