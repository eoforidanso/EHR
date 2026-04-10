import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// POST /api/btg/request-access
router.post('/request-access', (req, res) => {
  const { patientId, reason } = req.body;
  if (!patientId || !reason) {
    return res.status(400).json({ error: 'Patient ID and reason are required' });
  }
  if (reason.length < 10) {
    return res.status(400).json({ error: 'Reason must be at least 10 characters' });
  }

  const patient = db.prepare('SELECT first_name, last_name FROM patients WHERE id = ?').get(patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const patientName = `${patient.first_name} ${patient.last_name}`;
  const userName = `${req.user.first_name} ${req.user.last_name}`.trim();

  // Log the access
  const logId = uuidv4();
  db.prepare('INSERT INTO btg_audit_log (id, patient_id, patient_name, accessed_by, accessed_by_name, reason, approved) VALUES (?,?,?,?,?,?,?)').run(
    logId, patientId, patientName, req.user.id, userName, reason, 1
  );

  // Grant temporary access (expires after 4 hours)
  const accessId = uuidv4();
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO btg_access (id, patient_id, user_id, expires_at) VALUES (?,?,?,?)').run(
    accessId, patientId, req.user.id, expiresAt
  );

  res.json({ success: true, logId, accessId, expiresAt });
});

// GET /api/btg/check-access/:patientId
router.get('/check-access/:patientId', (req, res) => {
  const access = db.prepare(
    'SELECT * FROM btg_access WHERE patient_id = ? AND user_id = ? AND expires_at > datetime("now")'
  ).get(req.params.patientId, req.user.id);

  res.json({ hasAccess: !!access });
});

// GET /api/btg/audit-log
router.get('/audit-log', (req, res) => {
  const { patientId, userId, startDate, endDate } = req.query;
  let query = 'SELECT * FROM btg_audit_log WHERE 1=1';
  const params = [];

  if (patientId) { query += ' AND patient_id = ?'; params.push(patientId); }
  if (userId) { query += ' AND accessed_by = ?'; params.push(userId); }
  if (startDate) { query += ' AND timestamp >= ?'; params.push(startDate); }
  if (endDate) { query += ' AND timestamp <= ?'; params.push(endDate); }
  query += ' ORDER BY timestamp DESC';

  const rows = db.prepare(query).all(...params);
  res.json(rows.map(r => ({
    id: r.id, patientId: r.patient_id, patientName: r.patient_name,
    accessedBy: r.accessed_by, accessedByName: r.accessed_by_name,
    reason: r.reason, timestamp: r.timestamp, approved: !!r.approved,
  })));
});

export default router;
