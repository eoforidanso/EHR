import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('prescriber'));

// GET /api/eprescribe/medication-database
router.get('/medication-database', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM medication_database';
  const params = [];
  if (search) {
    query += ' WHERE name LIKE ? OR class LIKE ?';
    const s = `%${search}%`;
    params.push(s, s);
  }
  query += ' ORDER BY name';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(r => ({
    id: r.id, name: r.name, class: r.class,
    doses: JSON.parse(r.doses || '[]'), routes: JSON.parse(r.routes || '[]'),
    isControlled: !!r.is_controlled, schedule: r.schedule,
  })));
});

// POST /api/eprescribe/prescribe
router.post('/prescribe', (req, res) => {
  const b = req.body;
  const medId = uuidv4();
  const userName = `${req.user.first_name} ${req.user.last_name}`.trim();

  // Create the medication
  db.prepare(`INSERT INTO medications (id, patient_id, name, dose, route, frequency, start_date, prescriber, status, refills_left, is_controlled, schedule, pharmacy, last_filled, sig) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    medId, b.patientId, b.name, b.dose, b.route || 'Oral', b.frequency, new Date().toISOString().split('T')[0], userName, 'Active', b.refills || 0, b.isControlled ? 1 : 0, b.schedule || null, b.pharmacy || '', new Date().toISOString().split('T')[0], b.sig || ''
  );

  // Create rx history entry
  db.prepare('INSERT INTO medication_rx_history (id, medication_id, date, prescribed_by, pharmacy, qty, refill_number, type, note) VALUES (?,?,?,?,?,?,?,?,?)').run(
    uuidv4(), medId, new Date().toISOString().split('T')[0], userName, b.pharmacy || '', b.quantity || 0, 0, 'New Prescription', b.notes || ''
  );

  // Create order record
  db.prepare('INSERT INTO orders (id, patient_id, type, description, status, ordered_date, ordered_by, priority, notes) VALUES (?,?,?,?,?,?,?,?,?)').run(
    uuidv4(), b.patientId, 'Prescription', `${b.name} ${b.dose} - ${b.frequency}`, b.isControlled ? 'Pending EPCS Auth' : 'Active', new Date().toISOString().split('T')[0], userName, 'Routine', b.notes || ''
  );

  // Create inbox notification
  db.prepare('INSERT INTO inbox_messages (id, type, from_name, to_user, patient_id, patient_name, subject, body, date, time, priority, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(
    uuidv4(), 'Prescription Sent', 'System', req.user.id, b.patientId, b.patientName || '', `New Rx: ${b.name} ${b.dose}`, `Prescription for ${b.name} ${b.dose} ${b.frequency} sent to ${b.pharmacy}`, new Date().toISOString().split('T')[0], new Date().toTimeString().slice(0, 5), 'Normal', 'Completed'
  );

  res.status(201).json({ success: true, medicationId: medId });
});

export default router;
