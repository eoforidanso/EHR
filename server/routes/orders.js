import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/patients/:patientId/orders
router.get('/:patientId/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE patient_id = ? ORDER BY ordered_date DESC').all(req.params.patientId);
  res.json(rows.map(r => ({
    id: r.id, type: r.type, description: r.description, status: r.status,
    orderedDate: r.ordered_date, orderedBy: r.ordered_by, priority: r.priority,
    notes: r.notes, labFacility: r.lab_facility,
  })));
});

// POST /api/patients/:patientId/orders
router.post('/:patientId/orders', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare('INSERT INTO orders (id, patient_id, type, description, status, ordered_date, ordered_by, priority, notes, lab_facility) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    id, req.params.patientId, b.type, b.description, b.status || 'Pending', b.orderedDate || new Date().toISOString().split('T')[0], b.orderedBy || '', b.priority || 'Routine', b.notes || '', b.labFacility || null
  );
  res.status(201).json({ id, ...b });
});

// PUT /api/patients/:patientId/orders/:orderId
router.put('/:patientId/orders/:orderId', (req, res) => {
  const b = req.body;
  const existing = db.prepare('SELECT * FROM orders WHERE id = ? AND patient_id = ?').get(req.params.orderId, req.params.patientId);
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  db.prepare(`UPDATE orders SET status=?, notes=?, updated_at=datetime('now') WHERE id=?`).run(
    b.status ?? existing.status, b.notes ?? existing.notes, req.params.orderId
  );
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  res.json({ id: row.id, type: row.type, description: row.description, status: row.status, orderedDate: row.ordered_date, orderedBy: row.ordered_by, priority: row.priority, notes: row.notes, labFacility: row.lab_facility });
});

export default router;
