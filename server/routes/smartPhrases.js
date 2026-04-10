import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/smart-phrases
router.get('/', (req, res) => {
  const userId = req.query.userId || req.user.id;
  const category = req.query.category;
  let query = 'SELECT * FROM smart_phrases WHERE (created_by = ? OR created_by IS NULL)';
  const params = [userId];
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  query += ' ORDER BY name';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(r => ({
    id: r.id, name: r.name, triggerText: r.trigger_text,
    content: r.content, category: r.category, userId: r.created_by,
  })));
});

// POST /api/smart-phrases
router.post('/', (req, res) => {
  const { name, triggerText, content, category } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO smart_phrases (id, created_by, name, trigger_text, content, category) VALUES (?,?,?,?,?,?)').run(
    id, req.user.id, name, triggerText, content, category || 'General'
  );
  res.status(201).json({ id, name, triggerText, content, category: category || 'General', userId: req.user.id });
});

// PUT /api/smart-phrases/:id
router.put('/:id', (req, res) => {
  const { name, triggerText, content, category } = req.body;
  const existing = db.prepare('SELECT * FROM smart_phrases WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Smart phrase not found' });
  db.prepare('UPDATE smart_phrases SET name=?, trigger_text=?, content=?, category=? WHERE id=?').run(
    name ?? existing.name, triggerText ?? existing.trigger_text, content ?? existing.content, category ?? existing.category, req.params.id
  );
  res.json({ id: req.params.id, name: name ?? existing.name, triggerText: triggerText ?? existing.trigger_text, content: content ?? existing.content, category: category ?? existing.category, userId: req.user.id });
});

// DELETE /api/smart-phrases/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM smart_phrases WHERE id = ? AND created_by = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Smart phrase not found' });
  res.json({ success: true });
});

export default router;
