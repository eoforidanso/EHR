import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function formatAppt(r) {
  return {
    id: r.id, patientId: r.patient_id, patientName: r.patient_name,
    provider: r.provider, providerName: r.provider_name,
    date: r.date, time: r.time, duration: r.duration, type: r.type,
    status: r.status, reason: r.reason, visitType: r.visit_type, room: r.room,
  };
}

// GET /api/appointments
router.get('/', (req, res) => {
  const { date, provider, status, startDate, endDate } = req.query;
  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];

  if (date) { query += ' AND date = ?'; params.push(date); }
  if (provider) { query += ' AND provider = ?'; params.push(provider); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (startDate) { query += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { query += ' AND date <= ?'; params.push(endDate); }
  query += ' ORDER BY date ASC, time ASC';

  const rows = db.prepare(query).all(...params);
  res.json(rows.map(formatAppt));
});

// POST /api/appointments
router.post('/', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO appointments (id, patient_id, patient_name, provider, provider_name, date, time, duration, type, status, reason, visit_type, room) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
    id, b.patientId || null, b.patientName || '', b.provider || '', b.providerName || '', b.date, b.time, b.duration || 30, b.type || 'Office Visit', b.status || 'Scheduled', b.reason || '', b.visitType || 'In-Person', b.room || ''
  );
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  res.status(201).json(formatAppt(row));
});

// PUT /api/appointments/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  const b = req.body;
  db.prepare(`UPDATE appointments SET patient_id=?, patient_name=?, provider=?, provider_name=?, date=?, time=?, duration=?, type=?, status=?, reason=?, visit_type=?, room=?, updated_at=datetime('now') WHERE id=?`).run(
    b.patientId ?? existing.patient_id, b.patientName ?? existing.patient_name, b.provider ?? existing.provider, b.providerName ?? existing.provider_name, b.date ?? existing.date, b.time ?? existing.time, b.duration ?? existing.duration, b.type ?? existing.type, b.status ?? existing.status, b.reason ?? existing.reason, b.visitType ?? existing.visit_type, b.room ?? existing.room, req.params.id
  );

  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  res.json(formatAppt(row));
});

// DELETE /api/appointments/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── BLOCKED DAYS ─────────────────────────────────────────────

// GET /api/appointments/blocked-days
router.get('/blocked-days/list', (req, res) => {
  const { provider } = req.query;
  let query = 'SELECT * FROM blocked_days';
  const params = [];
  if (provider) { query += ' WHERE provider = ?'; params.push(provider); }
  query += ' ORDER BY date ASC';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(r => ({ id: r.id, provider: r.provider, date: r.date, blockType: r.block_type, reason: r.reason })));
});

// POST /api/appointments/blocked-days
router.post('/blocked-days', (req, res) => {
  const b = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO blocked_days (id, provider, date, block_type, reason) VALUES (?,?,?,?,?)').run(
    id, b.provider, b.date, b.blockType || 'full', b.reason || ''
  );
  res.status(201).json({ id, ...b });
});

// DELETE /api/appointments/blocked-days/:id
router.delete('/blocked-days/:id', (req, res) => {
  db.prepare('DELETE FROM blocked_days WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
