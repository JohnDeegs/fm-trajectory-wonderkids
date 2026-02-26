import type { Player } from '../types';

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text?: string; thought?: boolean }> }
  }>;
}

function buildPlayerSummary(p: Player): string {
  const plus = p.playStyles.filter(s => s.tier === 'plus').map(s => s.label).join(',');
  const std  = p.playStyles.filter(s => s.tier === 'standard').map(s => s.label).join(',');
  const psStr = [plus && `ps+:${plus}`, std && `ps:${std}`].filter(Boolean).join('|');
  return `[${p.uid}] name:${p.name}|age:${p.age}|pos:${p.position}|club:${p.club}|nat:${p.nationality}|role:${p.bestRoleLabel}|traj:${p.trajectoryPct}%|peak:${p.projectedPeak}|acc:${p.attrs.Acc}|pac:${p.attrs.Pac}|fin:${p.attrs.Fin}|pas:${p.attrs.Pas}|tec:${p.attrs.Tec}|str:${p.attrs.Str}|sta:${p.attrs.Sta}${psStr ? '|' + psStr : ''}`;
}

export async function geminiSearch(
  query: string,
  players: Player[],
  apiKey: string
): Promise<Player[]> {
  if (!apiKey.trim()) throw new Error('No Gemini API key set. Add it in Settings.');
  if (players.length === 0) throw new Error('No player data loaded.');

  const summaries = players.map(buildPlayerSummary).join('\n');

  const prompt = `You are an FM24 scout analyst. Given the following player data, return the IDs of the 30 most relevant players for this query: "${query}"

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
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data: GeminiResponse = await res.json();
  // Filter out thinking parts (thought:true) — 2.5-flash returns thinking + answer parts
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter(p => !p.thought).map(p => p.text ?? '').join('');

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Gemini unexpected format. parts=${parts.length} text=${JSON.stringify(text).slice(0, 300)}`);

  const uids: string[] = JSON.parse(match[0]);
  const playerMap = new Map(players.map(p => [p.uid, p]));

  return uids
    .map(uid => playerMap.get(uid.replace(/^uid:/, '')))
    .filter((p): p is Player => p !== undefined)
    .slice(0, 30);
}
