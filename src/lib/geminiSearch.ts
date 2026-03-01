import type { Player } from '../types';
import { getNationYouthRating, getNationTier, getClubRecruitment } from './youthData';

// Module-level cache — rebuilt only when a new player file is loaded
let _playerMapCache: Map<string, Player> | null = null;
let _playerMapRef: Player[] | null = null;
function getPlayerMap(players: Player[]): Map<string, Player> {
  if (players !== _playerMapRef) {
    _playerMapCache = new Map(players.map(p => [p.uid, p]));
    _playerMapRef = players;
  }
  return _playerMapCache!;
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text?: string; thought?: boolean }> }
  }>;
}

function buildPlayerSummary(p: Player): string {
  const plus = p.playStyles.filter(s => s.tier === 'plus').map(s => s.label).join(',');
  const std  = p.playStyles.filter(s => s.tier === 'standard').map(s => s.label).join(',');
  const psStr = [plus && `ps+:${plus}`, std && `ps:${std}`].filter(Boolean).join('|');
  const rating = getNationYouthRating(p.nationality);
  const tier = rating ? getNationTier(rating) : null;
  const natStr = tier ? `${p.nationality}(${tier})` : p.nationality;
  const clubRec = getClubRecruitment(p.club);
  const clubStr = clubRec ? `${p.club}(${clubRec}Academy)` : p.club;
  return `[${p.uid}] name:${p.name}|age:${p.age}|pos:${p.position}|club:${clubStr}|nat:${natStr}|role:${p.bestRoleLabel}|traj:${p.trajectoryPct}%|peak:${p.projectedPeak}|acc:${p.attrs.Acc}|pac:${p.attrs.Pac}|fin:${p.attrs.Fin}|pas:${p.attrs.Pas}|tec:${p.attrs.Tec}|str:${p.attrs.Str}|sta:${p.attrs.Sta}${psStr ? '|' + psStr : ''}`;
}

const GEMINI_PLAYER_CAP = 500;

function preFilter(players: Player[], query: string): Player[] {
  const q = query.toLowerCase();
  const posHints: Record<string, string[]> = {
    'GK':  ['goalkeeper', 'keeper', 'gk'],
    'DEF': ['defender', 'centre-back', 'center-back', 'cb', 'full-back', 'fullback', 'wingback', 'wing-back', 'def'],
    'MID': ['midfielder', 'mid', 'cm', 'dm', 'box-to-box', 'b2b', 'regista', 'playmaker'],
    'ATT': ['striker', 'forward', 'winger', 'attacker', 'st', 'cf', 'am', 'ss'],
  };

  let pool = players;

  // Position filter
  for (const [cat, keywords] of Object.entries(posHints)) {
    if (keywords.some(kw => q.includes(kw))) {
      const filtered = players.filter(p => p.positionCategory === cat);
      if (filtered.length > 100) { pool = filtered; break; }
    }
  }

  // Nation tier filter
  if (q.includes('exceptional nation')) {
    const filtered = pool.filter(p => {
      const r = getNationYouthRating(p.nationality);
      return r !== null && getNationTier(r) === 'Exceptional';
    });
    if (filtered.length > 20) pool = filtered;
  } else if (q.includes('excellent nation') || q.includes('top nation')) {
    const filtered = pool.filter(p => getNationYouthRating(p.nationality) !== null);
    if (filtered.length > 20) pool = filtered;
  }

  // Academy filter
  if (q.includes('exceptional academy') || q.includes('exceptional academies')) {
    const filtered = pool.filter(p => getClubRecruitment(p.club) === 'Exceptional');
    if (filtered.length > 20) pool = filtered;
  } else if (
    q.includes('academy') || q.includes('academies') ||
    q.includes('top academy') || q.includes('youth academy')
  ) {
    const filtered = pool.filter(p => getClubRecruitment(p.club) !== null);
    if (filtered.length > 20) pool = filtered;
  }

  return [...pool]
    .sort((a, b) => b.trajectoryPct - a.trajectoryPct)
    .slice(0, GEMINI_PLAYER_CAP);
}

export async function geminiSearch(
  query: string,
  players: Player[],
  apiKey: string
): Promise<Player[]> {
  if (!apiKey.trim()) throw new Error('No Gemini API key set. Add it in Settings.');
  if (players.length === 0) throw new Error('No player data loaded.');

  const summaries = preFilter(players, query).map(buildPlayerSummary).join('\n');

  // Sanitize query — strip quotes to prevent prompt injection
  const safeQuery = query.replace(/"/g, "'").slice(0, 500);

  const prompt = `You are an FM24 scout analyst. Given the following player data, return the IDs of the 30 most relevant players for this query: "${safeQuery}"

Player data (one per line, ID is in square brackets at the start):
${summaries}

Rules:
- Return ONLY a valid JSON array of exactly up to 30 player IDs (the value inside the square brackets), ordered by relevance.
- Example: ["player-5","player-12","player-31"]
- No explanation, no markdown, no code fences, just the raw JSON array on a single line.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data: GeminiResponse = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map(p => p.text ?? '').join('');

  // Find the JSON array by locating the first [ and last ] — ignores code fences
  const arrayStart = text.indexOf('[');
  const arrayEnd = text.lastIndexOf(']');
  if (arrayStart === -1 || arrayEnd <= arrayStart) {
    throw new Error(`Gemini unexpected format. parts=${parts.length} text=${JSON.stringify(text).slice(0, 300)}`);
  }
  let uids: string[];
  try {
    uids = JSON.parse(text.slice(arrayStart, arrayEnd + 1));
  } catch {
    throw new Error(`Gemini returned malformed JSON. text=${JSON.stringify(text).slice(0, 200)}`);
  }
  const playerMap = getPlayerMap(players);

  return uids
    .map(uid => playerMap.get(uid.replace(/^uid:/, '')))
    .filter((p): p is Player => p !== undefined)
    .slice(0, 30);
}
