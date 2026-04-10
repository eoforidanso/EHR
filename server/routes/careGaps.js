import { Router } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// GET /api/care-gaps
router.get('/', (req, res) => {
  const patients = db.prepare("SELECT * FROM patients WHERE is_active = 1").all();
  const gaps = [];

  for (const p of patients) {
    const pid = p.id;
    const age = calculateAge(p.dob);
    const patientName = `${p.first_name} ${p.last_name}`;
    const patientGaps = [];

    // PHQ-9 screening gap (every 90 days for active patients)
    const lastPHQ = db.prepare("SELECT date FROM assessments WHERE patient_id = ? AND tool = 'PHQ-9' ORDER BY date DESC LIMIT 1").get(pid);
    if (!lastPHQ || daysSince(lastPHQ.date) > 90) {
      patientGaps.push({ type: 'Screening', gap: 'PHQ-9 Depression Screening', lastDate: lastPHQ?.date || null, dueIn: lastPHQ ? Math.max(0, 90 - daysSince(lastPHQ.date)) : 0, priority: 'High' });
    }

    // GAD-7 screening gap (every 90 days)
    const lastGAD = db.prepare("SELECT date FROM assessments WHERE patient_id = ? AND tool = 'GAD-7' ORDER BY date DESC LIMIT 1").get(pid);
    if (!lastGAD || daysSince(lastGAD.date) > 90) {
      patientGaps.push({ type: 'Screening', gap: 'GAD-7 Anxiety Screening', lastDate: lastGAD?.date || null, dueIn: lastGAD ? Math.max(0, 90 - daysSince(lastGAD.date)) : 0, priority: 'High' });
    }

    // Columbia Suicide Severity (every 30 days for high-risk or per encounter)
    const lastCSS = db.prepare("SELECT date FROM assessments WHERE patient_id = ? AND tool = 'Columbia Suicide Severity' ORDER BY date DESC LIMIT 1").get(pid);
    if (!lastCSS || daysSince(lastCSS.date) > 30) {
      patientGaps.push({ type: 'Safety', gap: 'Columbia Suicide Severity Rating', lastDate: lastCSS?.date || null, dueIn: lastCSS ? Math.max(0, 30 - daysSince(lastCSS.date)) : 0, priority: 'Critical' });
    }

    // AUDIT-C for substance use (every 180 days)
    const lastAudit = db.prepare("SELECT date FROM assessments WHERE patient_id = ? AND tool = 'AUDIT-C' ORDER BY date DESC LIMIT 1").get(pid);
    if (!lastAudit || daysSince(lastAudit.date) > 180) {
      patientGaps.push({ type: 'Screening', gap: 'AUDIT-C Substance Use Screening', lastDate: lastAudit?.date || null, dueIn: lastAudit ? Math.max(0, 180 - daysSince(lastAudit.date)) : 0, priority: 'Medium' });
    }

    // Vitals check (every 180 days)
    const lastVitals = db.prepare("SELECT date FROM vitals WHERE patient_id = ? ORDER BY date DESC LIMIT 1").get(pid);
    if (!lastVitals || daysSince(lastVitals.date) > 180) {
      patientGaps.push({ type: 'Preventive', gap: 'Vital Signs', lastDate: lastVitals?.date || null, dueIn: lastVitals ? Math.max(0, 180 - daysSince(lastVitals.date)) : 0, priority: 'Medium' });
    }

    // Metabolic monitoring for antipsychotic patients (every 365 days)
    const onAntipsychotic = db.prepare("SELECT id FROM medications WHERE patient_id = ? AND status = 'Active' AND (name LIKE '%Quetiapine%' OR name LIKE '%Olanzapine%' OR name LIKE '%Aripiprazole%' OR name LIKE '%Risperidone%' OR name LIKE '%Ziprasidone%' OR name LIKE '%Clozapine%')").get(pid);
    if (onAntipsychotic) {
      const lastMetabolic = db.prepare("SELECT date FROM lab_results WHERE patient_id = ? AND (name LIKE '%Metabolic%' OR name LIKE '%Lipid%' OR name LIKE '%A1C%') ORDER BY date DESC LIMIT 1").get(pid);
      if (!lastMetabolic || daysSince(lastMetabolic.date) > 365) {
        patientGaps.push({ type: 'Lab Monitoring', gap: 'Metabolic Panel (Antipsychotic)', lastDate: lastMetabolic?.date || null, dueIn: lastMetabolic ? Math.max(0, 365 - daysSince(lastMetabolic.date)) : 0, priority: 'High' });
      }
    }

    // Lithium/valproate level monitoring (every 180 days)
    const onMoodStabilizer = db.prepare("SELECT id FROM medications WHERE patient_id = ? AND status = 'Active' AND (name LIKE '%Lithium%' OR name LIKE '%Valproate%' OR name LIKE '%Depakote%')").get(pid);
    if (onMoodStabilizer) {
      const lastLevel = db.prepare("SELECT date FROM lab_results WHERE patient_id = ? AND (name LIKE '%Lithium%' OR name LIKE '%Valproat%') ORDER BY date DESC LIMIT 1").get(pid);
      if (!lastLevel || daysSince(lastLevel.date) > 180) {
        patientGaps.push({ type: 'Lab Monitoring', gap: 'Mood Stabilizer Level', lastDate: lastLevel?.date || null, dueIn: lastLevel ? Math.max(0, 180 - daysSince(lastLevel.date)) : 0, priority: 'High' });
      }
    }

    // Follow-up gap (no appointment in last 30 days and none scheduled)
    const lastEncounter = db.prepare("SELECT date FROM encounters WHERE patient_id = ? ORDER BY date DESC LIMIT 1").get(pid);
    const futureAppt = db.prepare("SELECT date FROM appointments WHERE patient_id = ? AND date >= ? AND status != 'Cancelled' LIMIT 1").get(pid, new Date().toISOString().split('T')[0]);
    if ((!lastEncounter || daysSince(lastEncounter.date) > 30) && !futureAppt) {
      patientGaps.push({ type: 'Follow-up', gap: 'No Follow-up Scheduled', lastDate: lastEncounter?.date || null, dueIn: 0, priority: 'High' });
    }

    // Immunization gap — flu vaccine annually
    const lastFlu = db.prepare("SELECT date FROM immunizations WHERE patient_id = ? AND vaccine LIKE '%Influenza%' ORDER BY date DESC LIMIT 1").get(pid);
    if (!lastFlu || daysSince(lastFlu.date) > 365) {
      patientGaps.push({ type: 'Immunization', gap: 'Influenza Vaccine', lastDate: lastFlu?.date || null, dueIn: lastFlu ? Math.max(0, 365 - daysSince(lastFlu.date)) : 0, priority: 'Low' });
    }

    if (patientGaps.length > 0) {
      gaps.push({ patientId: pid, patientName, age, gapCount: patientGaps.length, gaps: patientGaps });
    }
  }

  // Sort by total gap count descending
  gaps.sort((a, b) => b.gapCount - a.gapCount);
  res.json(gaps);
});

export default router;
