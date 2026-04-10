import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      credentials: user.credentials,
      specialty: user.specialty,
      npi: user.npi,
      deaNumber: user.dea_number,
      email: user.email,
      twoFactorEnabled: !!user.two_factor_enabled,
      patientId: user.patient_id,
    },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/verify-epcs-pin
router.post('/verify-epcs-pin', authenticate, (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  const user = db.prepare('SELECT epcs_pin_hash FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.epcs_pin_hash) {
    return res.status(400).json({ error: 'EPCS not configured for this user' });
  }

  const valid = bcrypt.compareSync(pin, user.epcs_pin_hash);
  res.json({ valid });
});

// POST /api/auth/generate-epcs-otp
router.post('/generate-epcs-otp', authenticate, (req, res) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = bcrypt.hashSync(otp, 10);
  const expiresAt = new Date(Date.now() + 30000).toISOString(); // 30 seconds

  // Invalidate previous OTPs
  db.prepare('UPDATE epcs_otps SET used = 1 WHERE user_id = ? AND used = 0').run(req.user.id);

  // Store new OTP
  db.prepare('INSERT INTO epcs_otps (id, user_id, otp_hash, expires_at) VALUES (?, ?, ?, ?)').run(
    uuidv4(), req.user.id, otpHash, expiresAt
  );

  // In production, this would be sent via authenticator app / SMS
  // For development, return it directly
  res.json({ otp, expiresAt, message: 'OTP generated (shown for development only)' });
});

// POST /api/auth/verify-epcs-otp
router.post('/verify-epcs-otp', authenticate, (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ error: 'OTP is required' });

  const otpRecord = db.prepare(
    'SELECT * FROM epcs_otps WHERE user_id = ? AND used = 0 ORDER BY created_at DESC LIMIT 1'
  ).get(req.user.id);

  if (!otpRecord) {
    return res.json({ valid: false, error: 'No active OTP found' });
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    db.prepare('UPDATE epcs_otps SET used = 1 WHERE id = ?').run(otpRecord.id);
    return res.json({ valid: false, error: 'OTP has expired' });
  }

  const valid = bcrypt.compareSync(otp, otpRecord.otp_hash);
  if (valid) {
    db.prepare('UPDATE epcs_otps SET used = 1 WHERE id = ?').run(otpRecord.id);
  }

  res.json({ valid });
});

export default router;
