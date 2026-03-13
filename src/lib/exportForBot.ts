import type { Player } from '../types';

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

export function exportForBot(players: Player[]): void {
  const compact: BotPlayer[] = players.map(p => ({
    uid: p.uid,
    name: p.name,
    age: p.age,
    position: p.position,
    club: p.club,
    nationality: p.nationality,
    positionCategory: p.positionCategory,
    bestRole: p.bestRole,
    bestRoleLabel: p.bestRoleLabel,
    bestRoleScore: p.bestRoleScore,
    trajectoryPct: p.trajectoryPct,
    projectedPeak: p.projectedPeak,
    playStyles: p.playStyles.map(s => ({ id: s.id, label: s.label, tier: s.tier })),
    attrs: {
      Acc: p.attrs.Acc,
      Pac: p.attrs.Pac,
      Fin: p.attrs.Fin,
      Pas: p.attrs.Pas,
      Tec: p.attrs.Tec,
      Str: p.attrs.Str,
      Sta: p.attrs.Sta,
    },
  }));

  const json = JSON.stringify(compact);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fm-export-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
