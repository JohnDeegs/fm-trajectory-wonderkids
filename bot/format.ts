import type { BotPlayer } from './storage';

function trajectoryEmoji(pct: number): string {
  if (pct >= 120) return '🟣';
  if (pct >= 110) return '🟢';
  if (pct >= 100) return '🟡';
  if (pct >= 90)  return '🟠';
  return '🔴';
}

function playerCard(p: BotPlayer, n: number): string {
  const emoji = trajectoryEmoji(p.trajectoryPct);
  return (
    `${n}. *${p.name}* (${p.age}) · ${p.position} · ${p.club}\n` +
    `   ${p.bestRoleLabel}  ${emoji}${p.trajectoryPct}% → peak ${p.projectedPeak}\n` +
    `   Acc ${p.attrs.Acc} · Pac ${p.attrs.Pac} · Fin ${p.attrs.Fin} · Tec ${p.attrs.Tec}`
  );
}

export function formatResults(
  query: string,
  results: BotPlayer[],
  preFilteredCount: number,
  matchedCount: number
): string {
  if (results.length === 0) {
    return `🔍 *${query}*\n\nNo matching players found.`;
  }
  const header = `🔍 *${query}*  (${preFilteredCount} pre\\-filtered, ${matchedCount} matched)`;
  const cards = results.map((p, i) => playerCard(p, i + 1)).join('\n\n');
  return `${header}\n\n${cards}`;
}

export function formatNoData(): string {
  return (
    'No player data loaded yet\\.\n\n' +
    'Use /upload to send your FM export JSON file\\.'
  );
}

export function formatTop(players: BotPlayer[], n: number): string {
  const top = [...players]
    .sort((a, b) => b.trajectoryPct - a.trajectoryPct)
    .slice(0, n);
  if (top.length === 0) return 'No players found\\.';
  const header = `🏆 *Top ${top.length} by Trajectory %*`;
  const cards = top.map((p, i) => playerCard(p, i + 1)).join('\n\n');
  return `${header}\n\n${cards}`;
}
