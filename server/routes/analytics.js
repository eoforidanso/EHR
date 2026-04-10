import { Router } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/analytics/summary
router.get('/summary', (req, res) => {
  const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
  const activePatients = db.prepare("SELECT COUNT(*) as count FROM patients WHERE is_active = 1").get().count;

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(today).count;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const weekAppts = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date BETWEEN ? AND ?').get(weekAgo, today).count;

  // Visit type breakdown
  const visitTypes = db.prepare('SELECT type, COUNT(*) as count FROM appointments GROUP BY type').all();

  // Provider workload (appointments by provider)
  const providerWorkload = db.prepare(`SELECT provider, COUNT(*) as count, COUNT(CASE WHEN date = ? THEN 1 END) as today FROM appointments GROUP BY provider`).all(today);

  // Appointment status distribution
  const apptStatuses = db.prepare('SELECT status, COUNT(*) as count FROM appointments GROUP BY status').all();

  // Inbox volume
  const pendingInbox = db.prepare("SELECT COUNT(*) as count FROM inbox_messages WHERE status IN ('New','Pending')").get().count;
  const inboxByType = db.prepare('SELECT type, COUNT(*) as count FROM inbox_messages GROUP BY type').all();

  // Medication stats
  const totalMeds = db.prepare('SELECT COUNT(*) as count FROM medications').get().count;
  const activeMeds = db.prepare("SELECT COUNT(*) as count FROM medications WHERE status = 'Active'").get().count;
  const controlledMeds = db.prepare('SELECT COUNT(*) as count FROM medications WHERE is_controlled = 1').get().count;

  // Assessment trends
  const assessmentCounts = db.prepare('SELECT tool as type, COUNT(*) as count FROM assessments GROUP BY tool').all();
  const recentAssessments = db.prepare('SELECT tool as type, score, date FROM assessments ORDER BY date DESC LIMIT 20').all();

  // Problem distribution
  const problemsByStatus = db.prepare('SELECT status, COUNT(*) as count FROM problems GROUP BY status').all();

  // Demographics
  const genderDist = db.prepare('SELECT gender, COUNT(*) as count FROM patients GROUP BY gender').all();

  res.json({
    patients: { total: totalPatients, active: activePatients, genderDistribution: genderDist },
    appointments: { today: todayAppts, thisWeek: weekAppts, byType: visitTypes, byStatus: apptStatuses },
    providers: providerWorkload,
    inbox: { pending: pendingInbox, byType: inboxByType },
    medications: { total: totalMeds, active: activeMeds, controlled: controlledMeds },
    assessments: { byType: assessmentCounts, recent: recentAssessments },
    problems: { byStatus: problemsByStatus },
  });
});

// GET /api/analytics/patient/:id — per-patient analytics
router.get('/patient/:id', (req, res) => {
  const pid = req.params.id;
  const encCount = db.prepare('SELECT COUNT(*) as count FROM encounters WHERE patient_id = ?').get(pid).count;
  const medCount = db.prepare("SELECT COUNT(*) as count FROM medications WHERE patient_id = ? AND status = 'Active'").get(pid).count;
  const assessments = db.prepare('SELECT tool as type, score, date FROM assessments WHERE patient_id = ? ORDER BY date DESC').all(pid);
  const appts = db.prepare('SELECT date, type, status FROM appointments WHERE patient_id = ? ORDER BY date DESC LIMIT 10').all(pid);
  const vitals = db.prepare('SELECT date, bp, hr, weight FROM vitals WHERE patient_id = ? ORDER BY date DESC LIMIT 10').all(pid);

  res.json({
    encounters: encCount,
    activeMedications: medCount,
    assessments,
    recentAppointments: appts,
    vitalsTrend: vitals.map(v => ({
      date: v.date, bp: v.bp, heartRate: v.hr, weight: v.weight,
    })),
  });
});

export default router;
