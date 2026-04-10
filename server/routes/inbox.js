import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function formatMsg(r) {
  return {
    id: r.id, type: r.type, from: r.from_name, to: r.to_user,
    patient: r.patient_id, patientName: r.patient_name,
    subject: r.subject, body: r.body, date: r.date, time: r.time,
    read: !!r.read, priority: r.priority, status: r.status, urgent: !!r.urgent,
  };
}

// GET /api/inbox
router.get('/', (req, res) => {
  const { userId, type, status, priority } = req.query;
  let query = 'SELECT * FROM inbox_messages WHERE 1=1';
  const params = [];

  if (userId) { query += ' AND to_user = ?'; params.push(userId); }
  if (type) { query += ' AND type = ?'; params.push(type); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (priority) { query += ' AND priority = ?'; params.push(priority); }
  query += ' ORDER BY date DESC, time DESC';

  const rows = db.prepare(query).all(...params);
  res.json(rows.map(formatMsg));
});

// POST /api/inbox
router.post('/', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO inbox_messages (id, type, from_name, to_user, patient_id, patient_name, subject, body, date, time, read, priority, status, urgent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
    id, b.type, b.from, b.to, b.patient || null, b.patientName || '', b.subject || '', b.body || '', b.date || new Date().toISOString().split('T')[0], b.time || new Date().toTimeString().slice(0, 5), b.read ? 1 : 0, b.priority || 'Normal', b.status || 'Unread', b.urgent ? 1 : 0
  );
  const row = db.prepare('SELECT * FROM inbox_messages WHERE id = ?').get(id);
  res.status(201).json(formatMsg(row));
});

// PUT /api/inbox/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM inbox_messages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Message not found' });

  const b = req.body;
  db.prepare(`UPDATE inbox_messages SET read=?, status=?, priority=?, updated_at=datetime('now') WHERE id=?`).run(
    b.read !== undefined ? (b.read ? 1 : 0) : existing.read,
    b.status ?? existing.status,
    b.priority ?? existing.priority,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM inbox_messages WHERE id = ?').get(req.params.id);
  res.json(formatMsg(row));
});

// PUT /api/inbox/:id/status  (convenience endpoint)
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  db.prepare(`UPDATE inbox_messages SET status=?, read=1, updated_at=datetime('now') WHERE id=?`).run(status, req.params.id);
  const row = db.prepare('SELECT * FROM inbox_messages WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Message not found' });
  res.json(formatMsg(row));
});

export default router;
