import type { Player } from '../types';
import { ROLES } from './roleFormulas';
import { getBenchmark, getPlateau } from './trajectoryData';
import type { TrajectoryCategory } from './trajectoryData';
import { calculatePlayStyles } from './playStyles';

function inferCategory(position: string): TrajectoryCategory {
  const p = position.toUpperCase();
  if (p.startsWith('GK')) return 'GK';
  if (/\bST\b/.test(p) && !/[DM]/.test(p.replace('ST', ''))) return 'ATT';
  if (/\bAM\b/.test(p) && !/[D]/.test(p.replace(/AM.*/, ''))) return 'ATT';
  if (/\b(D|WB|SW)\b/.test(p) && !/\b(M|AM|ST)\b/.test(p)) return 'DEF';
  if (/\b(DM|M)\b/.test(p)) return 'MID';
  if (/\bAM\b/.test(p)) return 'MID';
  if (/\b(ST)\b/.test(p)) return 'ATT';
  return 'MID';
}

export function scorePlayer(player: Player): Player {
  const a = player.attrs as Record<string, number>;
  const roleScores: Record<string, number> = {};

  for (const role of ROLES) {
    roleScores[role.key] = role.calc(a);
  }

  // Find the best role (highest score)
  let bestRole = ROLES[0];
  let bestScore = 0;
  for (const role of ROLES) {
    if (roleScores[role.key] > bestScore) {
      bestScore = roleScores[role.key];
      bestRole = role;
    }
  }

  // Use position-inferred category for trajectory benchmarking
  // (avoids a GK being benchmarked as an ATT just because their GK scores are low)
  const posCategory = inferCategory(player.position);

  // Pick the best role within the player's position category for trajectory
  let bestCatRole = bestRole;
  let bestCatScore = 0;
  for (const role of ROLES) {
    if (role.category === posCategory && roleScores[role.key] > bestCatScore) {
      bestCatScore = roleScores[role.key];
      bestCatRole = role;
    }
  }

  // If no role in position category found, fall back to overall best
  if (bestCatScore === 0) {
    bestCatRole = bestRole;
    bestCatScore = bestScore;
  }

  const benchmark = getBenchmark(bestCatRole.key, bestCatRole.category, player.age);
  const plateau   = getPlateau(bestCatRole.key, bestCatRole.category);

  const trajectoryPct = benchmark > 0 ? Math.round((bestCatScore / benchmark) * 1000) / 10 : 0;
  const projectedPeak = Math.round((trajectoryPct / 100) * plateau * 10) / 10;

  return {
    ...player,
    roleScores,
    bestRole: bestCatRole.key,
    bestRoleLabel: bestCatRole.label,
    bestRoleScore: bestCatScore,
    trajectoryPct,
    projectedPeak,
    positionCategory: posCategory,
    playStyles: calculatePlayStyles(player.attrs),
  };
}

export function scoreAllPlayers(players: Player[]): Player[] {
  return players.map(scorePlayer);
}

export function getTrajectoryColour(pct: number): string {
  if (pct >= 120) return '#a78bfa'; // purple - elite
  if (pct >= 110) return '#4ade80'; // green - wonderkid
  if (pct >= 100) return '#facc15'; // yellow - decent
  if (pct >= 90)  return '#fb923c'; // orange - below average
  return '#f87171';                  // red - poor
}

export function getTrajectoryLabel(pct: number, age?: number): string {
  if (pct >= 120) return 'Elite';
  if (pct >= 110) return (age !== undefined && age >= 24) ? 'Excellent' : 'Wonderkid';
  if (pct >= 100) return 'Decent';
  if (pct >= 90)  return 'Below Avg';
  return 'Poor';
}

export function getAttrColour(val: number): string {
  if (val >= 17) return '#86efac';
  if (val >= 13) return '#4ade80';
  if (val >= 9)  return '#facc15';
  return '#f87171';
}
