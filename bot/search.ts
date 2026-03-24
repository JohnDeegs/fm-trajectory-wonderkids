import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BotPlayer } from './storage';

// ── Nation / Club tier data (subset ported from src/lib/youthData.ts) ─────────

const NATION_YOUTH_RATINGS: Record<string, number> = {
  'BRA': 163, 'FRA': 155, 'GER': 155, 'ESP': 144, 'ITA': 144,
  'ARG': 140, 'ENG': 135, 'POR': 134, 'NED': 132, 'EGY': 125,
  'TUR': 124, 'BEL': 120, 'MEX': 120, 'NGA': 120, 'NIG': 120,
  'COL': 117, 'JPN': 112, 'USA': 110, 'IRN': 110, 'IRI': 110,
  'UKR': 110, 'KOR': 110, 'CIV': 105, 'CVI': 105, 'KSA': 105,
  'SAU': 105, 'QAT': 105, 'IRQ': 103, 'ALG': 102, 'COD': 101,
  'DRC': 101, 'MAR': 100, 'SRB': 100, 'CMR': 100, 'GHA': 99,
  'CRO': 98, 'HRV': 98, 'PER': 97, 'RSA': 97, 'ZAF': 97,
  'UAE': 97, 'SCO': 97, 'IRL': 95, 'REP': 95, 'TUN': 95,
  'NOR': 94, 'POL': 94, 'CZE': 94, 'GRE': 94, 'ECU': 94,
  'SEN': 94, 'CHI': 93, 'CHL': 93, 'AUT': 93, 'DEN': 91,
  'SVK': 91, 'ROM': 91, 'ROU': 91,
};

const EXCEPTIONAL_CLUBS = new Set([
  'Barcelona', 'Manchester City', 'Man City', 'FC Liefering',
  'Independiente del Valle', 'Defensor Sporting', 'Red Bull Salzburg',
  'RB Salzburg', 'FC Basel', 'Basel', 'FC Copenhagen', 'FC København',
  'Nacional', 'Benfica', 'SL Benfica', 'Vålerenga', 'Valerenga',
  'Red Star Belgrade', 'Crvena zvezda', 'Legia Warszawa', 'Legia',
  'Lech Poznań', 'Lech Poznan', 'Lech', 'Farul Constanta',
  'FC Midtjylland', 'Midtjylland',
]);

function getNationTier(nat: string): 'Exceptional' | 'Excellent' | null {
  const r = NATION_YOUTH_RATINGS[nat];
  if (!r) return null;
  if (r > 110) return 'Exceptional';
  if (r > 90) return 'Excellent';
  return null;
}

const BOT_PLAYER_CAP = 300;

const YOUTH_QUERY_RE = /\b(young|wonderkid|youth|u21|u-21)\b/i;

function buildPlayerSummary(p: BotPlayer): string {
  const natTier = getNationTier(p.nationality);
  const natStr = natTier ? `${p.nationality}(${natTier})` : p.nationality;
  const isExc = EXCEPTIONAL_CLUBS.has(p.club);
  const clubStr = isExc ? `${p.club}(ExceptionalAcademy)` : p.club;
  const psPlus = p.playStyles.filter(s => s.tier === 'plus').map(s => s.label).join(',');
  const psStd  = p.playStyles.filter(s => s.tier === 'standard').map(s => s.label).join(',');
  const psStr  = [psPlus && `ps+:${psPlus}`, psStd && `ps:${psStd}`].filter(Boolean).join('|');
  return (
    `[${p.uid}] name:${p.name}|age:${p.age}|pos:${p.position}|club:${clubStr}` +
    `|nat:${natStr}|role:${p.bestRoleLabel}|traj:${p.trajectoryPct}%|peak:${p.projectedPeak}` +
    `|acc:${p.attrs.Acc}|pac:${p.attrs.Pac}|fin:${p.attrs.Fin}` +
    `|pas:${p.attrs.Pas}|tec:${p.attrs.Tec}|str:${p.attrs.Str}|sta:${p.attrs.Sta}` +
    (psStr ? `|${psStr}` : '')
  );
}

function preFilter(players: BotPlayer[], query: string): BotPlayer[] {
  const q = query.toLowerCase();

  const posHints: Record<string, string[]> = {
    'GK':  ['goalkeeper', 'keeper', 'gk'],
    'DEF': ['defender', 'centre-back', 'center-back', 'cb', 'full-back', 'fullback', 'wingback', 'wing-back', 'def'],
    'MID': ['midfielder', 'mid', 'cm', 'dm', 'box-to-box', 'b2b', 'regista', 'playmaker'],
    'ATT': ['striker', 'forward', 'winger', 'attacker', 'st', 'cf', 'am', 'ss'],
  };

  let pool: BotPlayer[] = players;

  // Age filter for youth queries
  if (YOUTH_QUERY_RE.test(query)) {
    const young = players.filter(p => p.age <= 21);
    if (young.length > 20) pool = young;
  }

  // Position filter
  for (const [cat, keywords] of Object.entries(posHints)) {
    if (keywords.some(kw => q.includes(kw))) {
      const filtered = pool.filter(p => p.positionCategory === cat);
      if (filtered.length > 100) { pool = filtered; break; }
    }
  }

  // Nation tier filter
  if (q.includes('exceptional nation')) {
    const filtered = pool.filter(p => getNationTier(p.nationality) === 'Exceptional');
    if (filtered.length > 20) pool = filtered;
  } else if (q.includes('excellent nation') || q.includes('top nation')) {
    const filtered = pool.filter(p => getNationTier(p.nationality) !== null);
    if (filtered.length > 20) pool = filtered;
  }

  // Academy filter
  if (q.includes('exceptional academy') || q.includes('exceptional academies')) {
    const filtered = pool.filter(p => EXCEPTIONAL_CLUBS.has(p.club));
    if (filtered.length > 20) pool = filtered;
  } else if (q.includes('academy') || q.includes('academies') || q.includes('top academy')) {
    const filtered = pool.filter(p => EXCEPTIONAL_CLUBS.has(p.club));
    if (filtered.length > 20) pool = filtered;
  }

  return [...pool]
    .sort((a, b) => b.trajectoryPct - a.trajectoryPct)
    .slice(0, BOT_PLAYER_CAP);
}

export async function botSearch(
  query: string,
  players: BotPlayer[],
  apiKey: string
): Promise<{ results: BotPlayer[]; preFilteredCount: number }> {
  const filtered = preFilter(players, query);
  const preFilteredCount = filtered.length;

  const summaries = filtered.map(buildPlayerSummary).join('\n');
  const safeQuery = query.replace(/"/g, "'").slice(0, 500);

  const prompt =
    `You are an FM24 scout analyst. Given the following player data, return the IDs of the 5 most relevant players for this query: "${safeQuery}"\n\n` +
    `Player data (one per line, ID is in square brackets at the start):\n${summaries}\n\n` +
    `Rules:\n` +
    `- Return ONLY a valid JSON array of exactly up to 5 player IDs (the value inside the square brackets), ordered by relevance.\n` +
    `- Example: ["player-5","player-12","player-31"]\n` +
    `- No explanation, no markdown, no code fences, just the raw JSON array on a single line.`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
      // @ts-expect-error thinkingConfig not yet in typedefs
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const response = await model.generateContent(prompt);
  const text = response.response.text();

  const arrayStart = text.indexOf('[');
  const arrayEnd = text.lastIndexOf(']');
  if (arrayStart === -1 || arrayEnd <= arrayStart) {
    console.error('Gemini unexpected format:', text.slice(0, 300));
    return { results: [], preFilteredCount };
  }

  let uids: string[];
  try {
    uids = JSON.parse(text.slice(arrayStart, arrayEnd + 1));
  } catch {
    console.error('Gemini malformed JSON:', text.slice(0, 200));
    return { results: [], preFilteredCount };
  }

  const playerMap = new Map(filtered.map(p => [p.uid, p]));
  const results = uids
    .map(uid => playerMap.get(uid.replace(/^uid:/, '')))
    .filter((p): p is BotPlayer => p !== undefined)
    .slice(0, 5);

  return { results, preFilteredCount };
}
