import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/messaging/channels
router.get('/channels', (req, res) => {
  const channels = db.prepare('SELECT * FROM staff_channels ORDER BY name').all();
  res.json(channels.map(c => ({ id: c.id, name: c.name, type: c.type })));
});

// GET /api/messaging/channels/:channelId/messages
router.get('/channels/:channelId/messages', (req, res) => {
  const { limit } = req.query;
  let query = 'SELECT * FROM staff_messages WHERE channel_id = ? ORDER BY timestamp ASC';
  if (limit) query += ` LIMIT ${parseInt(limit, 10)}`;
  const rows = db.prepare(query).all(req.params.channelId);
  res.json(rows.map(r => ({
    id: r.id, channelId: r.channel_id, userId: r.user_id, userName: r.user_name,
    content: r.content, timestamp: r.timestamp, reactions: JSON.parse(r.reactions || '{}'),
  })));
});

// POST /api/messaging/channels/:channelId/messages
router.post('/channels/:channelId/messages', (req, res) => {
  const b = req.body;
  const id = uuidv4();
  const userName = `${req.user.first_name} ${req.user.last_name}`.trim() || req.user.username;

  db.prepare('INSERT INTO staff_messages (id, channel_id, user_id, user_name, content, reactions) VALUES (?,?,?,?,?,?)').run(
    id, req.params.channelId, req.user.id, userName, b.content, JSON.stringify(b.reactions || {})
  );

  const row = db.prepare('SELECT * FROM staff_messages WHERE id = ?').get(id);
  res.status(201).json({
    id: row.id, channelId: row.channel_id, userId: row.user_id, userName: row.user_name,
    content: row.content, timestamp: row.timestamp, reactions: JSON.parse(row.reactions || '{}'),
  });
});

// PUT /api/messaging/messages/:messageId/reactions
router.put('/messages/:messageId/reactions', (req, res) => {
  const { reactions } = req.body;
  db.prepare('UPDATE staff_messages SET reactions = ? WHERE id = ?').run(JSON.stringify(reactions), req.params.messageId);
  res.json({ success: true });
});

export default router;
