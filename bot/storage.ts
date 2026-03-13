import { Pool } from 'pg';

export interface BotPlayer {
  uid: string;
  name: string;
  age: number;
  position: string;
  club: string;
  nationality: string;
  positionCategory: 'GK' | 'DEF' | 'MID' | 'ATT';
  bestRole: string;
  bestRoleLabel: string;
  bestRoleScore: number;
  trajectoryPct: number;
  projectedPeak: number;
  playStyles: { id: string; label: string; tier: 'plus' | 'standard' }[];
  attrs: {
    Acc: number;
    Pac: number;
    Fin: number;
    Pas: number;
    Tec: number;
    Str: number;
    Sta: number;
  };
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initStorage(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS player_data (
      chat_id BIGINT PRIMARY KEY,
      players JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function savePlayers(chatId: number, players: BotPlayer[]): Promise<void> {
  await pool.query(
    `INSERT INTO player_data (chat_id, players, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (chat_id) DO UPDATE
       SET players = EXCLUDED.players, updated_at = NOW()`,
    [chatId, JSON.stringify(players)]
  );
}

export async function loadPlayers(chatId: number): Promise<BotPlayer[] | null> {
  const result = await pool.query<{ players: BotPlayer[] }>(
    'SELECT players FROM player_data WHERE chat_id = $1',
    [chatId]
  );
  return result.rows.length > 0 ? result.rows[0].players : null;
}
