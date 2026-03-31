import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from './db';
import { authRateLimit } from './middleware/rateLimit';
import { requireAuth, AuthRequest } from './middleware/auth';

const router = Router();

const BCRYPT_COST = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;

function generateAccessToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_TTL });
}

async function generateRefreshToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt],
  );

  return token;
}

// POST /auth/register
router.post('/register', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  let userId: number;
  try {
    const result = await pool.query<{ id: number }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email.toLowerCase(), passwordHash],
    );
    userId = result.rows[0].id;
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    throw err;
  }

  const accessToken = generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);

  res.status(201).json({ accessToken, refreshToken });
});

// POST /auth/login
router.post('/login', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const result = await pool.query<{ id: number; password_hash: string }>(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()],
  );

  const user = result.rows[0];
  // Always run bcrypt to avoid timing attacks even if user not found
  const hashToCheck = user?.password_hash ?? '$2b$12$invalidhashthatisnevervalid000000000000000000000';
  const match = await bcrypt.compare(password, hashToCheck);

  if (!user || !match) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  res.json({ accessToken, refreshToken });
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body ?? {};

  if (typeof refreshToken !== 'string') {
    res.status(400).json({ error: 'refreshToken is required' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const result = await pool.query<{ id: number; user_id: number; expires_at: Date; used_at: Date | null }>(
    'SELECT id, user_id, expires_at, used_at FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash],
  );

  const row = result.rows[0];

  if (!row) {
    res.status(401).json({ error: 'Invalid refresh token' });
    return;
  }
  if (row.used_at) {
    // Token reuse detected — invalidate all tokens for this user
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [row.user_id]);
    res.status(401).json({ error: 'Refresh token already used' });
    return;
  }
  if (new Date() > row.expires_at) {
    res.status(401).json({ error: 'Refresh token expired' });
    return;
  }

  // Mark old token as used
  await pool.query('UPDATE refresh_tokens SET used_at = NOW() WHERE id = $1', [row.id]);

  const accessToken = generateAccessToken(row.user_id);
  const newRefreshToken = await generateRefreshToken(row.user_id);

  res.json({ accessToken, refreshToken: newRefreshToken });
});

// POST /auth/logout
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body ?? {};

  if (typeof refreshToken === 'string') {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await pool.query('UPDATE refresh_tokens SET used_at = NOW() WHERE token_hash = $1 AND used_at IS NULL', [tokenHash]);
  }

  res.json({ ok: true });
});

export default router;
