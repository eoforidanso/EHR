import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function formatMed(row) {
  const rxHistory = db.prepare('SELECT * FROM medication_rx_history WHERE medication_id = ? ORDER BY date DESC').all(row.id);
  return {
    id: row.id, name: row.name, dose: row.dose, route: row.route, frequency: row.frequency,
    startDate: row.start_date, prescriber: row.prescriber, status: row.status,
    refillsLeft: row.refills_left, isControlled: !!row.is_controlled, schedule: row.schedule,
    pharmacy: row.pharmacy, lastFilled: row.last_filled, sig: row.sig,
    rxHistory: rxHistory.map(rx => ({
      date: rx.date, prescribedBy: rx.prescribed_by, pharmacy: rx.pharmacy,
      qty: rx.qty, refillNumber: rx.refill_number, type: rx.type, note: rx.note,
    })),
  };
}

// GET /api/patients/:patientId/medications
router.get('/:patientId/medications', (req, res) => {
  const rows = db.prepare('SELECT * FROM medications WHERE patient_id = ? ORDER BY status ASC, name ASC').all(req.params.patientId);
  res.json(rows.map(formatMed));
});

// POST /api/patients/:patientId/medications
router.post('/:patientId/medications', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();
  db.prepare(`INSERT INTO medications (id, patient_id, name, dose, route, frequency, start_date, prescriber, status, refills_left, is_controlled, schedule, pharmacy, last_filled, sig) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, req.params.patientId, b.name, b.dose || '', b.route || 'Oral', b.frequency || '', b.startDate || '', b.prescriber || '', b.status || 'Active', b.refillsLeft || 0, b.isControlled ? 1 : 0, b.schedule || null, b.pharmacy || '', b.lastFilled || '', b.sig || ''
  );

  // Add initial rx history entry
  if (b.rxHistory && b.rxHistory.length) {
    const insertRx = db.prepare('INSERT INTO medication_rx_history (id, medication_id, date, prescribed_by, pharmacy, qty, refill_number, type, note) VALUES (?,?,?,?,?,?,?,?,?)');
    for (const rx of b.rxHistory) {
      insertRx.run(uuidv4(), id, rx.date, rx.prescribedBy || '', rx.pharmacy || '', rx.qty || 0, rx.refillNumber || 0, rx.type || 'New Prescription', rx.note || '');
    }
  }

  const row = db.prepare('SELECT * FROM medications WHERE id = ?').get(id);
  res.status(201).json(formatMed(row));
});

// PUT /api/patients/:patientId/medications/:medId
router.put('/:patientId/medications/:medId', (req, res) => {
  const b = req.body;
  const existing = db.prepare('SELECT * FROM medications WHERE id = ? AND patient_id = ?').get(req.params.medId, req.params.patientId);
  if (!existing) return res.status(404).json({ error: 'Medication not found' });

  db.prepare(`UPDATE medications SET name=?, dose=?, route=?, frequency=?, prescriber=?, status=?, refills_left=?, pharmacy=?, last_filled=?, sig=?, updated_at=datetime('now') WHERE id=?`).run(
    b.name ?? existing.name, b.dose ?? existing.dose, b.route ?? existing.route, b.frequency ?? existing.frequency, b.prescriber ?? existing.prescriber, b.status ?? existing.status, b.refillsLeft ?? existing.refills_left, b.pharmacy ?? existing.pharmacy, b.lastFilled ?? existing.last_filled, b.sig ?? existing.sig, req.params.medId
  );

  const row = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.medId);
  res.json(formatMed(row));
});

// DELETE /api/patients/:patientId/medications/:medId
router.delete('/:patientId/medications/:medId', (req, res) => {
  db.prepare('DELETE FROM medications WHERE id = ? AND patient_id = ?').run(req.params.medId, req.params.patientId);
  res.json({ success: true });
});

// POST /api/patients/:patientId/medications/:medId/rx-history
router.post('/:patientId/medications/:medId/rx-history', (req, res) => {
  const b = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO medication_rx_history (id, medication_id, date, prescribed_by, pharmacy, qty, refill_number, type, note) VALUES (?,?,?,?,?,?,?,?,?)').run(
    id, req.params.medId, b.date, b.prescribedBy || '', b.pharmacy || '', b.qty || 0, b.refillNumber || 0, b.type || 'Refill', b.note || ''
  );
  res.status(201).json({ id, ...b });
});

export default router;
