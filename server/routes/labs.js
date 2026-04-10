import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function formatLabResult(row) {
  const tests = db.prepare('SELECT * FROM lab_result_tests WHERE lab_result_id = ?').all(row.id);
  return {
    id: row.id,
    orderDate: row.order_date,
    resultDate: row.result_date,
    orderedBy: row.ordered_by,
    status: row.status,
    tests: tests.map(t => {
      const components = db.prepare('SELECT * FROM lab_result_components WHERE test_id = ?').all(t.id);
      return {
        name: t.name,
        results: components.map(c => ({
          component: c.component, value: c.value, unit: c.unit, range: c.range, flag: c.flag,
        })),
      };
    }),
  };
}

// GET /api/patients/:patientId/labs
router.get('/:patientId/labs', (req, res) => {
  const rows = db.prepare('SELECT * FROM lab_results WHERE patient_id = ? ORDER BY order_date DESC').all(req.params.patientId);
  res.json(rows.map(formatLabResult));
});

// GET /api/patients/:patientId/labs/:labId
router.get('/:patientId/labs/:labId', (req, res) => {
  const row = db.prepare('SELECT * FROM lab_results WHERE id = ? AND patient_id = ?').get(req.params.labId, req.params.patientId);
  if (!row) return res.status(404).json({ error: 'Lab result not found' });
  res.json(formatLabResult(row));
});

// POST /api/patients/:patientId/labs
router.post('/:patientId/labs', (req, res) => {
  const b = req.body;
  const id = b.id || uuidv4();

  db.prepare('INSERT INTO lab_results (id, patient_id, order_date, result_date, ordered_by, status) VALUES (?,?,?,?,?,?)').run(
    id, req.params.patientId, b.orderDate, b.resultDate || null, b.orderedBy || '', b.status || 'Pending'
  );

  if (b.tests) {
    const insertTest = db.prepare('INSERT INTO lab_result_tests (id, lab_result_id, name) VALUES (?,?,?)');
    const insertComp = db.prepare('INSERT INTO lab_result_components (id, test_id, component, value, unit, range, flag) VALUES (?,?,?,?,?,?,?)');
    for (const test of b.tests) {
      const testId = uuidv4();
      insertTest.run(testId, id, test.name);
      if (test.results) {
        for (const r of test.results) {
          insertComp.run(uuidv4(), testId, r.component, r.value || '', r.unit || '', r.range || '', r.flag || '');
        }
      }
    }
  }

  const row = db.prepare('SELECT * FROM lab_results WHERE id = ?').get(id);
  res.status(201).json(formatLabResult(row));
});

export default router;
