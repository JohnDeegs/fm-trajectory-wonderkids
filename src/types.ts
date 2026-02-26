export type AttrKey =
  | '1v1' | 'Acc' | 'Aer' | 'Agg' | 'Agi' | 'Ant' | 'Bal' | 'Bra'
  | 'Cmd' | 'Cnt' | 'Cmp' | 'Cro' | 'Dec' | 'Det' | 'Dri' | 'Fin'
  | 'Fir' | 'Fla' | 'Han' | 'Hea' | 'Jum' | 'Kic' | 'Ldr' | 'Lon'
  | 'Mar' | 'OtB' | 'Pac' | 'Pas' | 'Pos' | 'Ref' | 'Sta' | 'Str'
  | 'Tck' | 'Tea' | 'Tec' | 'Thr' | 'TRO' | 'Vis' | 'Wor' | 'Cor';

export type Attrs = Record<AttrKey, number>;

export type PlayStyleTier = 'plus' | 'standard';

export interface PlayStyleResult {
  id: string;
  label: string;
  tier: PlayStyleTier;
}

export interface Player {
  uid: string;
  name: string;
  age: number;
  club: string;
  nationality: string;
  nationality2: string;
  position: string;
  personality: string;
  mediaHandling: string;
  avgRating: number | null;
  leftFoot: string;
  rightFoot: string;
  height: string;
  wage: string;
  transferValue: string;
  inf: string;
  attrs: Attrs;
  // Computed after scoring
  roleScores: Record<string, number>;
  bestRole: string;
  bestRoleLabel: string;
  bestRoleScore: number;
  trajectoryPct: number;
  projectedPeak: number;
  positionCategory: 'GK' | 'DEF' | 'MID' | 'ATT';
  playStyles: PlayStyleResult[];
}

export interface SaveGame {
  id: string;
  name: string;
}

export interface Shortlist {
  id: string;
  name: string;
  playerUids: string[];
  saveGameId?: string;
}

export interface AppStore {
  players: Player[];
  favourites: string[];
  shortlists: Shortlist[];
  saveGames: SaveGame[];
  geminiKey: string;
  searchResults: Player[];
  lastQuery: string;
}
