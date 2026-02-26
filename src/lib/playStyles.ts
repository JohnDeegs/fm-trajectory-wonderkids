import type { AttrKey, Attrs } from '../types';

export type PlayStyleTier = 'plus' | 'standard';

export interface PlayStyleResult {
  id: string;
  label: string;
  tier: PlayStyleTier;
}

interface PlayStyleDef {
  id: string;
  label: string;
  /** SVG path d-attribute (24×24 viewBox, white fill/stroke on transparent bg) */
  iconPath: string;
  primary: AttrKey[];
  support: AttrKey[];
}

export const PLAY_STYLE_DEFS: PlayStyleDef[] = [
  // ── Scoring ──────────────────────────────────────────────────────────────
  {
    id: 'finesse_shot', label: 'Finesse Shot',
    iconPath: 'M4 18 Q6 6 14 8 Q18 9 19 13',
    primary: ['Fin', 'Tec'], support: ['Cmp'],
  },
  {
    id: 'power_shot', label: 'Power Shot',
    iconPath: 'M13 2L5 11H11L9 22L19 9H13L13 2Z',
    primary: ['Lon', 'Fin'], support: ['Str'],
  },
  {
    id: 'gamechanger', label: 'Gamechanger',
    iconPath: 'M12 2L13.9 8.6H21L15.5 12.7L17.4 19.3L12 15.3L6.6 19.3L8.5 12.7L3 8.6H10.1L12 2Z',
    primary: ['Fla', 'Tec'], support: ['Fin'],
  },
  {
    id: 'precision_header', label: 'Precision Header',
    iconPath: 'M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 11v9M8 17l4 4 4-4',
    primary: ['Hea', 'Bra'], support: ['Jum'],
  },
  {
    id: 'dead_ball', label: 'Dead Ball',
    iconPath: 'M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2ZM12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7ZM12 10a2 2 0 1 1 0 4A2 2 0 0 1 12 10Z',
    primary: ['Cor', 'Lon'], support: ['Tec'],
  },

  // ── Passing & Playmaking ──────────────────────────────────────────────────
  {
    id: 'incisive_pass', label: 'Incisive Pass',
    iconPath: 'M3 12H15M11 7L17 12L11 17M17 5V9M17 15V19',
    primary: ['Vis', 'Pas'], support: ['Dec'],
  },
  {
    id: 'pinged_pass', label: 'Pinged Pass',
    iconPath: 'M2 9H11M7 5L11 9L7 13M11 15H20M16 11L20 15L16 19',
    primary: ['Pas', 'Tec'], support: ['Bal'],
  },
  {
    id: 'inventive', label: 'Inventive',
    iconPath: 'M12 2Q18 5 17 12Q16 17 10 18Q7 15 9 12Q11 9 15 10Q17 12 14 15',
    primary: ['Vis', 'Fla'], support: ['Pas'],
  },
  {
    id: 'whipped_pass', label: 'Whipped Pass',
    iconPath: 'M4 18 Q4 4 18 4M14 2L18 4L16 8',
    primary: ['Cro', 'Tec'], support: ['Agi'],
  },
  {
    id: 'tiki_taka', label: 'Tiki-Taka',
    iconPath: 'M6 12a6 6 0 1 0 12 0M18 12a6 6 0 1 0-12 0M18 8l-2-3M6 16l2 3',
    primary: ['Fir', 'Pas'], support: ['Cmp'],
  },

  // ── Defending & Physical ──────────────────────────────────────────────────
  {
    id: 'anticipate', label: 'Anticipate',
    iconPath: 'M2 12S6 4 12 4s10 8 10 8-4 8-10 8S2 12 2 12ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
    primary: ['Ant', 'Pos'], support: ['Cnt'],
  },
  {
    id: 'intercept', label: 'Intercept',
    iconPath: 'M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z',
    primary: ['Mar', 'Agg'], support: ['Pac'],
  },
  {
    id: 'bruiser', label: 'Bruiser',
    iconPath: 'M5 5L19 19M19 5L5 19',
    primary: ['Str', 'Bra'], support: ['Wor'],
  },
  {
    id: 'aerial_fortress', label: 'Aerial Fortress',
    iconPath: 'M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2ZM12 8V16M8 12L12 8L16 12',
    primary: ['Jum', 'Str'], support: ['Hea'],
  },
  {
    id: 'enforcer', label: 'Enforcer',
    iconPath: 'M3 6H21V10H3ZM3 14H21V18H3Z',
    primary: ['Bal', 'Str'], support: ['Agg'],
  },

  // ── Ball Control & Speed ──────────────────────────────────────────────────
  {
    id: 'quick_step', label: 'Quick Step',
    iconPath: 'M2 17L7 7L12 17L17 7L22 17',
    primary: ['Acc', 'Agi'], support: ['Fir'],
  },
  {
    id: 'rapid', label: 'Rapid',
    iconPath: 'M3 8H13M5 12H17M3 16H13M17 9L21 12L17 15',
    primary: ['Pac', 'Dri'], support: ['Bal'],
  },
  {
    id: 'technical', label: 'Technical',
    iconPath: 'M4 17L8 7L12 14L15 9L18 14M20 9L18 14',
    primary: ['Dri', 'Tec'], support: ['Agi'],
  },
  {
    id: 'press_proven', label: 'Press Proven',
    iconPath: 'M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2ZM8 12L11 15L16 9',
    primary: ['Cmp', 'Bal'], support: ['Dec'],
  },
];

function avg(attrs: Attrs, keys: AttrKey[]): number {
  return keys.reduce((s, k) => s + (attrs[k] ?? 0), 0) / keys.length;
}

export function calculatePlayStyles(attrs: Attrs): PlayStyleResult[] {
  return PLAY_STYLE_DEFS.flatMap((ps): PlayStyleResult[] => {
    const p = avg(attrs, ps.primary);
    const s = avg(attrs, ps.support);
    if (p > 17.5 && s > 15.5) return [{ id: ps.id, label: ps.label, tier: 'plus' }];
    if (p > 15.5 && s > 15.5) return [{ id: ps.id, label: ps.label, tier: 'standard' }];
    return [];
  });
}
