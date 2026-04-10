import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// ─── ALLERGIES ────────────────────────────────────────────────

router.get('/:patientId/allergies', (req, res) => {
  const rows = db.prepare('SELECT * FROM allergies WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.patientId);
  res.json(rows.map(r => ({
    id: r.id, allergen: r.allergen, type: r.type, reaction: r.reaction,
    severity: r.severity, status: r.status, onsetDate: r.onset_date, source: r.source,
  })));
});

router.post('/:patientId/allergies', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO allergies (id, patient_id, allergen, type, reaction, severity, status, onset_date, source) VALUES (?,?,?,?,?,?,?,?,?)').run(
    id, req.params.patientId, b.allergen, b.type, b.reaction || '', b.severity || '', b.status || 'Active', b.onsetDate || '', b.source || ''
  );
  res.status(201).json({ id, ...b });
});

router.put('/:patientId/allergies/:allergyId', (req, res) => {
  const b = req.body;
  db.prepare('UPDATE allergies SET allergen=?, type=?, reaction=?, severity=?, status=?, onset_date=?, source=? WHERE id=? AND patient_id=?').run(
    b.allergen, b.type, b.reaction, b.severity, b.status, b.onsetDate, b.source, req.params.allergyId, req.params.patientId
  );
  res.json({ id: req.params.allergyId, ...b });
});

router.delete('/:patientId/allergies/:allergyId', (req, res) => {
  db.prepare('DELETE FROM allergies WHERE id = ? AND patient_id = ?').run(req.params.allergyId, req.params.patientId);
  res.json({ success: true });
});

// ─── PROBLEMS ─────────────────────────────────────────────────

router.get('/:patientId/problems', (req, res) => {
  const rows = db.prepare('SELECT * FROM problems WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.patientId);
  res.json(rows.map(r => ({
    id: r.id, code: r.code, description: r.description, status: r.status,
    onsetDate: r.onset_date, diagnosedBy: r.diagnosed_by,
  })));
});

router.post('/:patientId/problems', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO problems (id, patient_id, code, description, status, onset_date, diagnosed_by) VALUES (?,?,?,?,?,?,?)').run(
    id, req.params.patientId, b.code, b.description, b.status || 'Active', b.onsetDate || '', b.diagnosedBy || ''
  );
  res.status(201).json({ id, ...b });
});

router.put('/:patientId/problems/:problemId', (req, res) => {
  const b = req.body;
  db.prepare('UPDATE problems SET code=?, description=?, status=?, onset_date=?, diagnosed_by=? WHERE id=? AND patient_id=?').run(
    b.code, b.description, b.status, b.onsetDate, b.diagnosedBy, req.params.problemId, req.params.patientId
  );
  res.json({ id: req.params.problemId, ...b });
});

// ─── VITALS ───────────────────────────────────────────────────

router.get('/:patientId/vitals', (req, res) => {
  const rows = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY date DESC, time DESC').all(req.params.patientId);
  res.json(rows.map(r => ({
    id: r.id, date: r.date, time: r.time, bp: r.bp, hr: r.hr, rr: r.rr,
    temp: r.temp, spo2: r.spo2, weight: r.weight, height: r.height,
    bmi: r.bmi, pain: r.pain, takenBy: r.taken_by,
  })));
});

router.post('/:patientId/vitals', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO vitals (id, patient_id, date, time, bp, hr, rr, temp, spo2, weight, height, bmi, pain, taken_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
    id, req.params.patientId, b.date, b.time, b.bp || '', b.hr, b.rr, b.temp, b.spo2, b.weight, b.height, b.bmi, b.pain, b.takenBy || ''
  );
  res.status(201).json({ id, ...b });
});

// ─── IMMUNIZATIONS ────────────────────────────────────────────

router.get('/:patientId/immunizations', (req, res) => {
  const rows = db.prepare('SELECT * FROM immunizations WHERE patient_id = ? ORDER BY date DESC').all(req.params.patientId);
  res.json(rows.map(r => ({
    id: r.id, vaccine: r.vaccine, date: r.date, site: r.site, route: r.route,
    lot: r.lot, manufacturer: r.manufacturer, administeredBy: r.administered_by, nextDue: r.next_due,
  })));
});

router.post('/:patientId/immunizations', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO immunizations (id, patient_id, vaccine, date, site, route, lot, manufacturer, administered_by, next_due) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    id, req.params.patientId, b.vaccine, b.date, b.site || '', b.route || '', b.lot || '', b.manufacturer || '', b.administeredBy || '', b.nextDue || null
  );
  res.status(201).json({ id, ...b });
});

// ─── ASSESSMENTS ──────────────────────────────────────────────

router.get('/:patientId/assessments', (req, res) => {
  const rows = db.prepare('SELECT * FROM assessments WHERE patient_id = ? ORDER BY date DESC').all(req.params.patientId);
  res.json(rows.map(r => ({
    id: r.id, tool: r.tool, score: r.score, interpretation: r.interpretation,
    date: r.date, administeredBy: r.administered_by, answers: JSON.parse(r.answers || '[]'),
  })));
});

router.post('/:patientId/assessments', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO assessments (id, patient_id, tool, score, interpretation, date, administered_by, answers) VALUES (?,?,?,?,?,?,?,?)').run(
    id, req.params.patientId, b.tool, b.score, b.interpretation || '', b.date, b.administeredBy || '', JSON.stringify(b.answers || [])
  );
  res.status(201).json({ id, ...b });
});

export default router;
