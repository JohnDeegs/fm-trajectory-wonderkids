import { Router, Response } from 'express';
import { pool } from './db';
import { requireAuth, AuthRequest } from './middleware/auth';

const router = Router();

// All shortlist routes require auth
router.use(requireAuth);

// GET /shortlists — all shortlists for authenticated user, with player count
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await pool.query<{
    id: number;
    save_game_id: string;
    name: string;
    created_at: Date;
    player_count: string;
  }>(
    `SELECT s.id, s.save_game_id, s.name, s.created_at,
            COUNT(sp.id)::text AS player_count
     FROM shortlists s
     LEFT JOIN shortlist_players sp ON sp.shortlist_id = s.id
     WHERE s.user_id = $1
     GROUP BY s.id
     ORDER BY s.created_at ASC`,
    [req.userId],
  );

  res.json(result.rows.map(r => ({ ...r, playerCount: parseInt(r.player_count, 10) })));
});

// POST /shortlists — create shortlist
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { saveGameId, name } = req.body ?? {};

  if (typeof saveGameId !== 'string' || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'saveGameId and name are required' });
    return;
  }

  const result = await pool.query<{ id: number; save_game_id: string; name: string; created_at: Date }>(
    'INSERT INTO shortlists (user_id, save_game_id, name) VALUES ($1, $2, $3) RETURNING id, save_game_id, name, created_at',
    [req.userId, saveGameId, name.trim()],
  );

  res.status(201).json(result.rows[0]);
});

// PUT /shortlists/:id — rename
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const result = await pool.query<{ id: number }>(
    'UPDATE shortlists SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
    [name.trim(), req.params.id, req.userId],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Shortlist not found' });
    return;
  }
  res.json({ ok: true });
});

// DELETE /shortlists/:id — delete (players cascade via FK)
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await pool.query(
    'DELETE FROM shortlists WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Shortlist not found' });
    return;
  }
  res.json({ ok: true });
});

// POST /shortlists/:id/players — upsert player JSONB by uid
router.post('/:id/players', async (req: AuthRequest, res: Response): Promise<void> => {
  const { uid, playerData } = req.body ?? {};

  if (typeof uid !== 'string' || !uid || typeof playerData !== 'object' || playerData === null) {
    res.status(400).json({ error: 'uid and playerData are required' });
    return;
  }

  // Verify shortlist belongs to user
  const check = await pool.query('SELECT id FROM shortlists WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  if (check.rowCount === 0) {
    res.status(404).json({ error: 'Shortlist not found' });
    return;
  }

  await pool.query(
    `INSERT INTO shortlist_players (shortlist_id, uid, player_data)
     VALUES ($1, $2, $3)
     ON CONFLICT (shortlist_id, uid) DO UPDATE SET player_data = EXCLUDED.player_data`,
    [req.params.id, uid, JSON.stringify(playerData)],
  );

  res.status(201).json({ ok: true });
});

// DELETE /shortlists/:id/players/:uid — remove player
router.delete('/:id/players/:uid', async (req: AuthRequest, res: Response): Promise<void> => {
  // Verify shortlist belongs to user
  const check = await pool.query('SELECT id FROM shortlists WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  if (check.rowCount === 0) {
    res.status(404).json({ error: 'Shortlist not found' });
    return;
  }

  const result = await pool.query(
    'DELETE FROM shortlist_players WHERE shortlist_id = $1 AND uid = $2',
    [req.params.id, req.params.uid],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Player not found in shortlist' });
    return;
  }
  res.json({ ok: true });
});

export default router;
