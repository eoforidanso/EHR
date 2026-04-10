import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function formatEncounter(row) {
  return {
    id: row.id, date: row.date, time: row.time, provider: row.provider,
    providerName: row.provider_name, credentials: row.credentials,
    visitType: row.visit_type, cptCode: row.cpt_code, icdCode: row.icd_code,
    reason: row.reason, duration: row.duration, chiefComplaint: row.chief_complaint,
    hpi: row.hpi, intervalNote: row.interval_note, mse: row.mse,
    assessment: row.assessment, plan: row.plan,
    safety: {
      siLevel: row.safety_si_level, hiLevel: row.safety_hi_level,
      selfHarm: !!row.safety_self_harm, substanceUse: !!row.safety_substance_use,
      safetyPlanUpdated: !!row.safety_plan_updated, crisisResources: !!row.safety_crisis_resources,
      safetyNotes: row.safety_notes,
    },
    followUp: row.follow_up, disposition: row.disposition,
  };
}

// GET /api/patients/:patientId/encounters
router.get('/:patientId/encounters', (req, res) => {
  const rows = db.prepare('SELECT * FROM encounters WHERE patient_id = ? ORDER BY date DESC').all(req.params.patientId);
  res.json(rows.map(formatEncounter));
});

// GET /api/patients/:patientId/encounters/:encId
router.get('/:patientId/encounters/:encId', (req, res) => {
  const row = db.prepare('SELECT * FROM encounters WHERE id = ? AND patient_id = ?').get(req.params.encId, req.params.patientId);
  if (!row) return res.status(404).json({ error: 'Encounter not found' });
  res.json(formatEncounter(row));
});

// POST /api/patients/:patientId/encounters
router.post('/:patientId/encounters', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  const safety = b.safety || {};

  db.prepare(`INSERT INTO encounters (id, patient_id, date, time, provider, provider_name, credentials, visit_type, cpt_code, icd_code, reason, duration, chief_complaint, hpi, interval_note, mse, assessment, plan, safety_si_level, safety_hi_level, safety_self_harm, safety_substance_use, safety_plan_updated, safety_crisis_resources, safety_notes, follow_up, disposition) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, req.params.patientId, b.date, b.time || '', b.provider || '', b.providerName || '', b.credentials || '', b.visitType || '', b.cptCode || '', b.icdCode || '', b.reason || '', b.duration || '', b.chiefComplaint || '', b.hpi || '', b.intervalNote || '', b.mse || '', b.assessment || '', b.plan || '', safety.siLevel || 'None', safety.hiLevel || 'None', safety.selfHarm ? 1 : 0, safety.substanceUse ? 1 : 0, safety.safetyPlanUpdated ? 1 : 0, safety.crisisResources ? 1 : 0, safety.safetyNotes || '', b.followUp || '', b.disposition || ''
  );

  const row = db.prepare('SELECT * FROM encounters WHERE id = ?').get(id);
  res.status(201).json(formatEncounter(row));
});

// PUT /api/patients/:patientId/encounters/:encId
router.put('/:patientId/encounters/:encId', (req, res) => {
  const existing = db.prepare('SELECT * FROM encounters WHERE id = ? AND patient_id = ?').get(req.params.encId, req.params.patientId);
  if (!existing) return res.status(404).json({ error: 'Encounter not found' });

  const b = req.body;
  const safety = b.safety || {};
  db.prepare(`UPDATE encounters SET date=?, time=?, provider=?, provider_name=?, credentials=?, visit_type=?, cpt_code=?, icd_code=?, reason=?, duration=?, chief_complaint=?, hpi=?, interval_note=?, mse=?, assessment=?, plan=?, safety_si_level=?, safety_hi_level=?, safety_self_harm=?, safety_substance_use=?, safety_plan_updated=?, safety_crisis_resources=?, safety_notes=?, follow_up=?, disposition=?, updated_at=datetime('now') WHERE id=?`).run(
    b.date ?? existing.date, b.time ?? existing.time, b.provider ?? existing.provider, b.providerName ?? existing.provider_name, b.credentials ?? existing.credentials, b.visitType ?? existing.visit_type, b.cptCode ?? existing.cpt_code, b.icdCode ?? existing.icd_code, b.reason ?? existing.reason, b.duration ?? existing.duration, b.chiefComplaint ?? existing.chief_complaint, b.hpi ?? existing.hpi, b.intervalNote ?? existing.interval_note, b.mse ?? existing.mse, b.assessment ?? existing.assessment, b.plan ?? existing.plan, safety.siLevel ?? existing.safety_si_level, safety.hiLevel ?? existing.safety_hi_level, safety.selfHarm !== undefined ? (safety.selfHarm ? 1 : 0) : existing.safety_self_harm, safety.substanceUse !== undefined ? (safety.substanceUse ? 1 : 0) : existing.safety_substance_use, safety.safetyPlanUpdated !== undefined ? (safety.safetyPlanUpdated ? 1 : 0) : existing.safety_plan_updated, safety.crisisResources !== undefined ? (safety.crisisResources ? 1 : 0) : existing.safety_crisis_resources, safety.safetyNotes ?? existing.safety_notes, b.followUp ?? existing.follow_up, b.disposition ?? existing.disposition, req.params.encId
  );

  const row = db.prepare('SELECT * FROM encounters WHERE id = ?').get(req.params.encId);
  res.json(formatEncounter(row));
});

export default router;
