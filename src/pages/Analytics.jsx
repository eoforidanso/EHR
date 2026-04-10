import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

// ── Mini bar chart ─────────────────────────────────────────────────────
function MiniBar({ label, value, max, color = 'var(--primary)' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

// ── Donut chart (SVG) ──────────────────────────────────────────────────
function Donut({ segments, size = 120, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = total ? seg.value / total : 0;
        const dash = pct * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" style={{ fontSize: 22, fontWeight: 800, fill: 'var(--text-primary)' }}>
        {total}
      </text>
    </svg>
  );
}

// ── Sparkline (SVG) ────────────────────────────────────────────────────
function Sparkline({ data, width = 140, height = 36, color = 'var(--primary)' }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── period helpers ─────────────────────────────────────────────────────
function monthLabel(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default function Analytics() {
  const { currentUser } = useAuth();
  const { patients, appointments, inboxMessages, encounters, meds, orders, labResults, assessmentScores } = usePatient();

  const [period, setPeriod] = useState('month'); // week | month | quarter | year

  // ── Derived metrics ──────────────────────────────────────────────────
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.isActive).length;

  // Appointment metrics
  const totalAppts = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'Completed').length;
  const noShowAppts = appointments.filter(a => a.status === 'No Show').length;
  const telehealthAppts = appointments.filter(a => a.visitType === 'Telehealth').length;
  const inPersonAppts = totalAppts - telehealthAppts;
  const completionRate = totalAppts ? Math.round((completedAppts / totalAppts) * 100) : 0;
  const noShowRate = totalAppts ? Math.round((noShowAppts / totalAppts) * 100) : 0;

  // Visit type breakdown
  const visitTypes = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      const t = a.type || 'Other';
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [appointments]);

  // Provider workload
  const providerLoad = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      map[a.provider] = (map[a.provider] || 0) + 1;
    });
    return map;
  }, [appointments]);

  // Encounter volume (by type)
  const encounterByType = useMemo(() => {
    const map = {};
    Object.values(encounters).flat().forEach(e => {
      const t = e.type || 'Office Visit';
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [encounters]);

  // Inbox volume by type
  const inboxByType = useMemo(() => {
    const map = {};
    inboxMessages.forEach(m => {
      const t = m.type || 'General';
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [inboxMessages]);

  // Total meds prescribed across all patients
  const totalMedCount = Object.values(meds).flat().length;
  const controlledMeds = Object.values(meds).flat().filter(m => m.isControlled).length;

  // Med class breakdown
  const medClasses = useMemo(() => {
    const map = {};
    Object.values(meds).flat().forEach(m => {
      const c = m.class || 'Other';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [meds]);

  // Order volume
  const totalOrders = Object.values(orders).flat().length;
  const pendingOrders = Object.values(orders).flat().filter(o => o.status === 'Pending').length;
  const completedOrders = Object.values(orders).flat().filter(o => o.status === 'Completed' || o.status === 'Resulted').length;

  // Lab turnaround
  const totalLabs = Object.values(labResults).flat().length;
  const abnormalLabs = Object.values(labResults).flat().filter(l => l.flag === 'H' || l.flag === 'L' || l.flag === 'Critical' || l.abnormal).length;

  // Assessment scores distribution
  const assessmentTypes = useMemo(() => {
    const map = {};
    Object.values(assessmentScores).flat().forEach(a => {
      const t = a.tool || a.name || 'Other';
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [assessmentScores]);

  // Patient demographics
  const genderDist = useMemo(() => {
    const map = {};
    patients.forEach(p => { map[p.gender] = (map[p.gender] || 0) + 1; });
    return map;
  }, [patients]);

  const ageBuckets = useMemo(() => {
    const buckets = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0 };
    patients.forEach(p => {
      const a = p.age;
      if (a <= 25) buckets['18-25']++;
      else if (a <= 35) buckets['26-35']++;
      else if (a <= 45) buckets['36-45']++;
      else if (a <= 55) buckets['46-55']++;
      else if (a <= 65) buckets['56-65']++;
      else buckets['65+']++;
    });
    return buckets;
  }, [patients]);

  const insuranceDist = useMemo(() => {
    const map = {};
    patients.forEach(p => {
      const ins = p.insurance?.primary?.name || 'Unknown';
      map[ins] = (map[ins] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [patients]);

  // Fake sparkline data for trend cards (12 months)
  const apptTrend = [18, 22, 19, 25, 28, 24, 30, 27, 31, 35, 33, totalAppts];
  const patientTrend = [3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, totalPatients];
  const noShowTrend = [3, 2, 4, 1, 3, 2, 1, 2, 3, 1, 2, noShowAppts];

  // Donut colors
  const donutColors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--purple)', 'var(--teal)', 'var(--orange)', '#6366f1', '#ec4899', '#14b8a6'];

  // ── Quality / Academic metrics ───────────────────────────────────────
  const avgPanelSize = activePatients;
  const residentColors = ['var(--primary)', 'var(--success)', 'var(--teal)', 'var(--purple)'];

  // Teaching metrics (simulated for academic facility)
  const teachingMetrics = {
    residentEncounters: 42,
    attendingCosigns: 38,
    cosignComplianceRate: 90,
    averageNoteTime: '18 min',
    medStudentEncounters: 15,
    supervisedProcedures: 8,
    didacticHours: 12,
  };

  const qualityMetrics = [
    { label: 'Depression Screening (PHQ-9)', target: 90, actual: 83, unit: '%' },
    { label: 'Anxiety Screening (GAD-7)', target: 85, actual: 78, unit: '%' },
    { label: 'Substance Use Screening', target: 80, actual: 71, unit: '%' },
    { label: 'Suicide Risk Assessment', target: 95, actual: 92, unit: '%' },
    { label: 'BMI Documented (Last 12mo)', target: 90, actual: 85, unit: '%' },
    { label: 'Blood Pressure Documented', target: 95, actual: 91, unit: '%' },
    { label: 'Medication Reconciliation', target: 95, actual: 88, unit: '%' },
    { label: 'Follow-up within 7 days (high risk)', target: 90, actual: 82, unit: '%' },
  ];

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>📈 Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
            Academic facility performance metrics &amp; population insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod(p)}
              style={{ textTransform: 'capitalize', fontSize: 12 }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: '👥', value: activePatients, label: 'Active Patients', color: 'blue', trend: patientTrend },
          { icon: '📅', value: totalAppts, label: 'Appointments', color: 'teal', trend: apptTrend },
          { icon: '✅', value: `${completionRate}%`, label: 'Completion Rate', color: 'green', trend: null },
          { icon: '🚫', value: `${noShowRate}%`, label: 'No-Show Rate', color: 'red', trend: noShowTrend },
          { icon: '📹', value: telehealthAppts, label: 'Telehealth Visits', color: 'purple', trend: null },
        ].map(s => (
          <div key={s.label} className={`stat-card row ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info" style={{ flex: 1 }}>
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
            {s.trend && (
              <div style={{ marginLeft: 'auto' }}>
                <Sparkline data={s.trend} color={s.color === 'red' ? 'var(--danger)' : 'var(--primary)'} width={72} height={28} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Row 1: Appointments + Visit Types ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>

        {/* Visit Type Breakdown */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>📊 Visit Type Breakdown</h2></div>
          <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Donut
              size={110}
              strokeWidth={14}
              segments={visitTypes.slice(0, 6).map(([label, value], i) => ({ value, color: donutColors[i] }))}
            />
            <div style={{ flex: 1 }}>
              {visitTypes.slice(0, 6).map(([label, count], i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: donutColors[i], flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modality Split */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>📹 Modality Split</h2></div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 12 }}>
              <Donut
                size={110}
                strokeWidth={14}
                segments={[
                  { value: inPersonAppts, color: 'var(--primary)' },
                  { value: telehealthAppts, color: 'var(--teal)' },
                ]}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                  <span>In-Person</span>
                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{inPersonAppts}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
                  <span>Telehealth</span>
                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{telehealthAppts}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              Telehealth utilization: <strong>{totalAppts ? Math.round((telehealthAppts / totalAppts) * 100) : 0}%</strong>
            </div>
          </div>
        </div>

        {/* Inbox Volume */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>📬 Inbox Volume by Type</h2></div>
          <div className="card-body">
            {inboxByType.slice(0, 6).map(([type, count], i) => (
              <MiniBar key={type} label={type} value={count} max={Math.max(...inboxByType.map(t => t[1]))} color={donutColors[i % donutColors.length]} />
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              Total messages: <strong>{inboxMessages.length}</strong> · Unread: <strong>{inboxMessages.filter(m => !m.read).length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Medications + Orders + Labs ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>

        {/* Medication Summary */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>💊 Medication Summary</h2></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{totalMedCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Active Rxs</div>
              </div>
              <div style={{ background: 'var(--danger-light)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{controlledMeds}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Controlled</div>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Top Drug Classes</div>
            {medClasses.slice(0, 5).map(([cls, count], i) => (
              <MiniBar key={cls} label={cls} value={count} max={medClasses[0]?.[1]} color={donutColors[i % donutColors.length]} />
            ))}
          </div>
        </div>

        {/* Orders Summary */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>📝 Orders Overview</h2></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{totalOrders}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{pendingOrders}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pending</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{completedOrders}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Completed</div>
              </div>
            </div>
            {pendingOrders > 0 && (
              <div className="alert alert-warning" style={{ fontSize: 12, padding: '8px 12px', marginBottom: 0 }}>
                ⚠️ {pendingOrders} order(s) awaiting review/result
              </div>
            )}
          </div>
        </div>

        {/* Lab Results Summary */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>🔬 Lab Results Summary</h2></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{totalLabs}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Results</div>
              </div>
              <div style={{ background: abnormalLabs > 0 ? 'var(--danger-light)' : 'var(--success-light)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: abnormalLabs > 0 ? 'var(--danger)' : 'var(--success)' }}>{abnormalLabs}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Abnormal</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Abnormal rate: <strong>{totalLabs ? Math.round((abnormalLabs / totalLabs) * 100) : 0}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Quality Measures + Teaching + Demographics ────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>

        {/* Quality Measures */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 13 }}>🏆 Quality Measures</h2>
            <span className="badge badge-info" style={{ fontSize: 10 }}>HEDIS / MIPS</span>
          </div>
          <div className="card-body no-pad">
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Measure</th>
                  <th style={{ width: 70, textAlign: 'center' }}>Target</th>
                  <th style={{ width: 70, textAlign: 'center' }}>Actual</th>
                  <th style={{ width: 70, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {qualityMetrics.map(q => {
                  const met = q.actual >= q.target;
                  const close = q.actual >= q.target - 5;
                  return (
                    <tr key={q.label}>
                      <td>{q.label}</td>
                      <td style={{ textAlign: 'center' }}>{q.target}{q.unit}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: met ? 'var(--success)' : close ? 'var(--warning)' : 'var(--danger)' }}>
                        {q.actual}{q.unit}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${met ? 'badge-success' : close ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                          {met ? '✓ Met' : close ? '⚠ Close' : '✗ Gap'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic / Teaching Metrics */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 13 }}>🎓 Academic &amp; Teaching Metrics</h2>
            <span className="badge badge-purple" style={{ fontSize: 10 }}>Academic</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { icon: '🩺', label: 'Resident Encounters', value: teachingMetrics.residentEncounters, color: 'var(--primary)' },
                { icon: '✍️', label: 'Attending Co-Signs', value: teachingMetrics.attendingCosigns, color: 'var(--success)' },
                { icon: '🎒', label: 'Med Student Encounters', value: teachingMetrics.medStudentEncounters, color: 'var(--teal)' },
                { icon: '🔧', label: 'Supervised Procedures', value: teachingMetrics.supervisedProcedures, color: 'var(--purple)' },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.icon} {m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: teachingMetrics.cosignComplianceRate >= 90 ? 'var(--success)' : 'var(--warning)' }}>
                  {teachingMetrics.cosignComplianceRate}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Co-sign Compliance</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{teachingMetrics.averageNoteTime}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Note Time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--teal)' }}>{teachingMetrics.didacticHours}h</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Didactic Hours</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
              💡 ACGME requires direct observation of patient encounters and timely co-signature of trainee notes within 24 hours.
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Demographics ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Gender */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>👥 Gender Distribution</h2></div>
          <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Donut
              size={100}
              strokeWidth={14}
              segments={Object.entries(genderDist).map(([g, v], i) => ({ value: v, color: donutColors[i] }))}
            />
            <div>
              {Object.entries(genderDist).map(([g, v], i) => (
                <div key={g} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: donutColors[i] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{g}</span>
                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>🎂 Age Distribution</h2></div>
          <div className="card-body">
            {Object.entries(ageBuckets).map(([range, count]) => (
              <MiniBar key={range} label={range} value={count} max={Math.max(...Object.values(ageBuckets))} color="var(--primary)" />
            ))}
          </div>
        </div>

        {/* Insurance */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontSize: 13 }}>🏥 Insurance Mix</h2></div>
          <div className="card-body">
            {insuranceDist.map(([name, count], i) => (
              <MiniBar key={name} label={name} value={count} max={insuranceDist[0]?.[1]} color={donutColors[i % donutColors.length]} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '12px 0 4px' }}>
        Data reflects current mock dataset for demonstration and teaching purposes. In production, metrics would be drawn from the live clinical data warehouse.
      </div>
    </div>
  );
}
