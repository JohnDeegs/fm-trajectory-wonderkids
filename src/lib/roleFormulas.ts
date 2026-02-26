import type { Attrs } from '../types';
import type { TrajectoryCategory } from './trajectoryData';

type A = Partial<Attrs> & Record<string, number>;

function score(key: number, green: number, blue: number, divisor: number): number {
  return Math.round(((key * 5) + (green * 3) + (blue * 1)) / divisor * 10) / 10;
}

function g(a: A, ...keys: string[]): number {
  return keys.reduce((sum, k) => sum + (a[k] ?? 0), 0);
}

export interface RoleDef {
  key: string;
  label: string;
  category: TrajectoryCategory;
  calc: (a: A) => number;
}

export const ROLES: RoleDef[] = [
  // ── GOALKEEPERS ──────────────────────────────────────────────────────────
  { key: 'gkd',  label: 'Goalkeeper - Defend',        category: 'GK',
    calc: a => score(g(a,'Agi','Ref'), g(a,'Aer','Cmd','Han','Kic','Cnt','Pos'), g(a,'1v1','Thr','Ant','Dec'), 32) },
  { key: 'skd',  label: 'Sweeper Keeper - Defend',    category: 'GK',
    calc: a => score(g(a,'Agi','Ref'), g(a,'Cmd','Kic','1v1','Ant','Cnt','Pos'), g(a,'Aer','Fir','Han','Pas','TRO','Dec','Vis','Acc'), 36) },
  { key: 'sks',  label: 'Sweeper Keeper - Support',   category: 'GK',
    calc: a => score(g(a,'Agi','Ref'), g(a,'Cmd','Kic','1v1','Ant','Cnt','Pos'), g(a,'Aer','Fir','Han','Pas','TRO','Dec','Vis','Acc'), 36) },
  { key: 'ska',  label: 'Sweeper Keeper - Attack',    category: 'GK',
    calc: a => score(g(a,'Agi','Ref'), g(a,'Cmd','Kic','1v1','Ant','Cnt','Pos'), g(a,'Aer','Fir','Han','Pas','TRO','Dec','Vis','Acc'), 36) },

  // ── DEFENDERS ────────────────────────────────────────────────────────────
  { key: 'bpdd', label: 'Ball Playing Def - Defend',  category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Mar','Pas','Tck','Pos','Str'), g(a,'Fir','Tec','Agg','Ant','Bra','Cnt','Dec','Vis'), 46) },
  { key: 'bpds', label: 'Ball Playing Def - Stopper', category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Pas','Tck','Pos','Str','Agg','Bra','Dec'), g(a,'Fir','Tec','Ant','Cnt','Vis','Mar'), 50) },
  { key: 'bpdc', label: 'Ball Playing Def - Cover',   category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Mar','Pas','Tck','Pos','Ant','Cnt','Dec'), g(a,'Fir','Tec','Bra','Vis','Str','Hea'), 47) },
  { key: 'cdd',  label: 'Central Def - Defend',       category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Mar','Tck','Pos','Str'), g(a,'Agg','Ant','Bra','Cnt','Dec'), 40) },
  { key: 'cds',  label: 'Central Def - Stopper',      category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Tck','Agg','Bra','Dec','Pos','Str'), g(a,'Mar','Ant','Cnt'), 44) },
  { key: 'cdc',  label: 'Central Def - Cover',        category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Mar','Tck','Ant','Cnt','Dec','Pos'), g(a,'Hea','Bra','Str'), 41) },
  { key: 'cwbs', label: 'Complete Wing Back - Support', category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Tec','OtB','Tea'), g(a,'Fir','Mar','Pas','Tck','Ant','Dec','Fla','Pos','Agi','Bal'), 45) },
  { key: 'cwba', label: 'Complete Wing Back - Attack',  category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Tec','Fla','OtB','Tea'), g(a,'Fir','Mar','Pas','Tck','Ant','Dec','Pos','Agi','Bal'), 47) },
  { key: 'fbd',  label: 'Full Back - Defend',         category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Mar','Tck','Ant','Cnt','Pos','Pos'), g(a,'Cro','Pas','Dec','Tea'), 42) },
  { key: 'fbs',  label: 'Full Back - Support',        category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Mar','Tck','Ant','Cnt','Pos','Tea'), g(a,'Cro','Dri','Pas','Tec','Dec'), 43) },
  { key: 'fba',  label: 'Full Back - Attack',         category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Mar','Tck','Ant','Pos','Tea'), g(a,'Dri','Fir','Pas','Tec','Cnt','Dec','OtB','Agi'), 46) },
  { key: 'ifbd', label: 'Inverted Full Back - Defend', category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Hea','Mar','Tck','Pos','Str'), g(a,'Dri','Fir','Pas','Tec','Agg','Ant','Bra','Cmp','Cnt','Dec','Agi','Jum'), 47) },
  { key: 'iwbd', label: 'Inverted Wing Back - Defend', category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Pas','Tck','Ant','Dec','Pos','Tea'), g(a,'Fir','Mar','Tec','Cmp','Cnt','OtB','Agi'), 45) },
  { key: 'iwbs', label: 'Inverted Wing Back - Support', category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tck','Cmp','Dec','Tea'), g(a,'Mar','Tec','Ant','Cnt','OtB','Pos','Vis','Agi'), 46) },
  { key: 'iwba', label: 'Inverted Wing Back - Attack',  category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tck','Tec','Cmp','Dec','OtB','Tea','Vis'), g(a,'Cro','Dri','Lon','Mar','Ant','Cnt','Fla','Pos','Agi'), 56) },
  { key: 'ld',   label: 'Libero - Defend',            category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Fir','Hea','Mar','Pas','Tck','Tec','Dec','Pos','Tea','Str'), g(a,'Ant','Bra','Cnt','Sta'), 54) },
  { key: 'ls',   label: 'Libero - Support',           category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Fir','Hea','Mar','Pas','Tck','Tec','Dec','Pos','Tea','Str'), g(a,'Dri','Ant','Bra','Cnt','Vis','Sta'), 56) },
  { key: 'ncbd', label: 'No-Nonsense CB - Defend',    category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Mar','Tck','Pos','Str'), g(a,'Agg','Ant','Bra','Cnt'), 39) },
  { key: 'ncbs', label: 'No-Nonsense CB - Stopper',   category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Tck','Agg','Bra','Pos','Str'), g(a,'Mar','Ant','Cnt'), 41) },
  { key: 'ncbc', label: 'No-Nonsense CB - Cover',     category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Mar','Tck','Ant','Cnt','Pos'), g(a,'Hea','Bra','Str'), 38) },
  { key: 'nfbd', label: 'No-Nonsense FB - Defend',    category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Mar','Tck','Ant','Pos','Str'), g(a,'Hea','Agg','Bra','Cnt','Tea'), 40) },
  { key: 'wcbd', label: 'Wide CB - Defend',           category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Hea','Mar','Tck','Pos','Str'), g(a,'Dri','Fir','Pas','Tec','Agg','Ant','Bra','Cnt','Dec','Wor','Agi'), 46) },
  { key: 'wcbs', label: 'Wide CB - Support',          category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Dri','Hea','Mar','Tck','Pos','Str'), g(a,'Cro','Fir','Pas','Tec','Agg','Ant','Bra','Cnt','Dec','OtB','Wor','Agi','Sta'), 51) },
  { key: 'wcba', label: 'Wide CB - Attack',           category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Jum','Cmp'), g(a,'Cro','Dri','Hea','Mar','Tck','OtB','Sta','Str'), g(a,'Fir','Pas','Tec','Agg','Ant','Bra','Cnt','Dec','Pos','Wor','Agi'), 55) },
  { key: 'wbd',  label: 'Wing Back - Defend',         category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Mar','Tck','Ant','Pos','Tea'), g(a,'Cro','Dri','Fir','Pas','Tec','Cnt','Dec','OtB','Agi','Bal'), 45) },
  { key: 'wbs',  label: 'Wing Back - Support',        category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Mar','Tck','OtB','Tea'), g(a,'Fir','Pas','Tec','Ant','Cnt','Dec','Pos','Agi','Bal'), 47) },
  { key: 'wba',  label: 'Wing Back - Attack',         category: 'DEF',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Tck','Tec','OtB','Tea'), g(a,'Fir','Mar','Pas','Ant','Cnt','Dec','Fla','Pos','Agi','Bal'), 48) },

  // ── MIDFIELDERS ──────────────────────────────────────────────────────────
  { key: 'aps',  label: 'Advanced Playmaker - Support', category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tec','Cmp','Dec','OtB','Tea','Vis'), g(a,'Dri','Ant','Fla','Agi'), 48) },
  { key: 'apa',  label: 'Advanced Playmaker - Attack',  category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tec','Cmp','Dec','OtB','Tea','Vis'), g(a,'Dri','Ant','Fla','Agi'), 48) },
  { key: 'ad',   label: 'Anchor - Defend',            category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Mar','Tck','Ant','Cnt','Dec','Pos'), g(a,'Cmp','Tea','Str'), 41) },
  { key: 'ams',  label: 'Attacking Mid - Support',    category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Lon','Pas','Tec','Ant','Dec','Fla','OtB'), g(a,'Dri','Cmp','Vis','Agi'), 48) },
  { key: 'ama',  label: 'Attacking Mid - Attack',     category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Dri','Fir','Lon','Pas','Tec','Ant','Dec','Fla','OtB'), g(a,'Fin','Cmp','Vis','Agi'), 51) },
  { key: 'bwmd', label: 'Ball Winning Mid - Defend',  category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Tck','Agg','Ant','Tea'), g(a,'Mar','Bra','Cnt','Pos','Agi','Str'), 38) },
  { key: 'bwms', label: 'Ball Winning Mid - Support', category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Tck','Agg','Ant','Tea'), g(a,'Mar','Pas','Bra','Cnt','Agi','Str'), 38) },
  { key: 'b2bs', label: 'Box to Box Mid - Support',  category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Pas','Tck','OtB','Tea'), g(a,'Dri','Fin','Fir','Lon','Tec','Agg','Ant','Cmp','Dec','Pos','Bal','Str'), 44) },
  { key: 'cars', label: 'Carrilero - Support',        category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Fir','Pas','Tck','Dec','Pos','Tea'), g(a,'Tec','Ant','Cmp','Cnt','OtB','Vis'), 44) },
  { key: 'cmd',  label: 'Central Mid - Defend',       category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Tck','Cnt','Dec','Pos','Tea'), g(a,'Fir','Mar','Pas','Tec','Agg','Ant','Cmp'), 42) },
  { key: 'cms',  label: 'Central Mid - Support',      category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tck','Dec','Tea'), g(a,'Tec','Ant','Cmp','Cnt','OtB','Vis'), 41) },
  { key: 'cma',  label: 'Central Mid - Attack',       category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Dec','OtB'), g(a,'Lon','Tck','Tec','Ant','Cmp','Tea','Vis'), 39) },
  { key: 'dlpd', label: 'Deep Lying Playmaker - Defend', category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Fir','Pas','Tec','Cmp','Dec','Tea','Vis'), g(a,'Tck','Ant','Pos','Bal'), 45) },
  { key: 'dlps', label: 'Deep Lying Playmaker - Support', category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Fir','Pas','Tec','Cmp','Dec','Tea','Vis'), g(a,'Ant','OtB','Pos','Bal'), 45) },
  { key: 'dmd',  label: 'Defensive Mid - Defend',     category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Tck','Ant','Cnt','Pos','Tea'), g(a,'Mar','Pas','Agg','Cmp','Str','Dec'), 41) },
  { key: 'dms',  label: 'Defensive Mid - Support',    category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Tck','Ant','Cnt','Pos','Tea'), g(a,'Fir','Mar','Pas','Agg','Cmp','Dec','Str'), 42) },
  { key: 'dwd',  label: 'Defensive Winger - Defend',  category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Tec','Ant','OtB','Pos','Tea'), g(a,'Cro','Dri','Fir','Mar','Tck','Agg','Cnt','Dec'), 43) },
  { key: 'dws',  label: 'Defensive Winger - Support', category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Pas','Tec','OtB','Tea'), g(a,'Dri','Fir','Mar','Pas','Tck','Agg','Ant','Cmp','Cnt','Dec','Pos'), 46) },
  { key: 'engs', label: 'Enganche - Support',         category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tec','Cmp','Dec','Vis'), g(a,'Dri','Ant','Fla','OtB','Tea','Agi'), 44) },
  { key: 'hbd',  label: 'Half Back - Defend',         category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Mar','Tck','Ant','Cmp','Cnt','Dec','Pos','Tea'), g(a,'Fir','Pas','Agg','Bra','Jum','Str'), 50) },
  { key: 'ifs',  label: 'Inside Forward - Support',   category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Dri','Fin','Fir','Tec','OtB','Agi'), g(a,'Lon','Pas','Ant','Cmp','Fla','Vis','Bal'), 45) },
  { key: 'ifa',  label: 'Inside Forward - Attack',    category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Dri','Fin','Fir','Tec','Ant','OtB','Agi'), g(a,'Lon','Pas','Cmp','Fla','Bal'), 46) },
  { key: 'iws',  label: 'Inverted Winger - Support',  category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Pas','Tec','Agi'), g(a,'Fir','Lon','Cmp','Dec','OtB','Vis','Bal'), 42) },
  { key: 'iwa',  label: 'Inverted Winger - Attack',   category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Pas','Tec','Agi'), g(a,'Fir','Lon','Ant','Cmp','Dec','Fla','OtB','Vis','Bal'), 44) },
  { key: 'mezs', label: 'Mezzala - Support',          category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Pas','Tec','Dec','OtB'), g(a,'Dri','Fir','Lon','Tck','Ant','Cmp','Vis','Bal'), 40) },
  { key: 'meza', label: 'Mezzala - Attack',           category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Dri','Pas','Tec','Dec','OtB','Vis'), g(a,'Fin','Fir','Lon','Ant','Cmp','Fla','Bal'), 45) },
  { key: 'raua', label: 'Raumdeuter - Attack',        category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fin','Ant','Cmp','Cnt','Dec','OtB','Bal'), g(a,'Fir','Tec'), 43) },
  { key: 'regs', label: 'Regista - Support',          category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Fir','Pas','Tec','Cmp','Dec','Fla','OtB','Tea','Vis'), g(a,'Dri','Lon','Ant','Bal'), 51) },
  { key: 'rps',  label: 'Roaming Playmaker - Support', category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tec','Ant','Cmp','Dec','OtB','Tea','Vis'), g(a,'Dri','Lon','Cnt','Pos','Agi','Bal'), 53) },
  { key: 'svs',  label: 'Segundo Volante - Support',  category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Mar','Pas','Tck','OtB','Pos'), g(a,'Fin','Fir','Lon','Ant','Cmp','Cnt','Dec','Bal','Str'), 44) },
  { key: 'sva',  label: 'Segundo Volante - Attack',   category: 'MID',
    calc: a => score(g(a,'Wor','Sta','Acc','Pac'), g(a,'Fin','Lon','Pas','Tck','Ant','OtB','Pos'), g(a,'Fir','Mar','Cmp','Cnt','Dec','Bal'), 47) },
  { key: 'ssa',  label: 'Shadow Striker - Attack',    category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Dri','Fin','Fir','Ant','Cmp','OtB'), g(a,'Pas','Tec','Cnt','Dec','Agi','Bal'), 44) },
  { key: 'wmd',  label: 'Wide Mid - Defend',          category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Pas','Tck','Cnt','Dec','Pos','Tea'), g(a,'Cro','Fir','Mar','Tec','Ant','Cmp'), 44) },
  { key: 'wms',  label: 'Wide Mid - Support',         category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Pas','Tck','Dec','Tea'), g(a,'Cro','Fir','Tec','Ant','Cmp','Cnt','OtB','Pos','Vis'), 41) },
  { key: 'wma',  label: 'Wide Mid - Attack',          category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Fir','Pas','Dec','Tea'), g(a,'Tck','Tec','Ant','Cmp','OtB','Vis'), 41) },
  { key: 'wps',  label: 'Wide Playmaker - Support',   category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Fir','Pas','Tec','Cmp','Dec','Tea','Vis'), g(a,'Dri','OtB','Agi'), 44) },
  { key: 'wpa',  label: 'Wide Playmaker - Attack',    category: 'MID',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Dri','Fir','Pas','Tec','Cmp','Dec','OtB','Tea','Vis'), g(a,'Ant','Fla','Agi'), 50) },

  // ── ATTACKERS ────────────────────────────────────────────────────────────
  { key: 'wtfs', label: 'Wide Target Forward - Support', category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Hea','Bra','Tea','Jum','Str'), g(a,'Cro','Fir','Ant','OtB','Bal'), 40) },
  { key: 'wtfa', label: 'Wide Target Forward - Attack',  category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Hea','Bra','OtB','Jum','Str'), g(a,'Cro','Fin','Fir','Ant','Tea','Bal'), 41) },
  { key: 'ws',   label: 'Winger - Support',           category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Tec','Agi'), g(a,'Fir','Pas','OtB','Bal'), 36) },
  { key: 'wa',   label: 'Winger - Attack',            category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Sta','Wor'), g(a,'Cro','Dri','Tec','Agi'), g(a,'Fir','Pas','Ant','Fla','OtB','Bal'), 38) },
  { key: 'afa',  label: 'Advanced Forward - Attack',  category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Dri','Fir','Tec','Cmp','OtB'), g(a,'Pas','Ant','Dec','Wor','Agi','Bal','Sta'), 37) },
  { key: 'cfs',  label: 'Complete Forward - Support', category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Dri','Fir','Hea','Lon','Pas','Tec','Ant','Cmp','Dec','OtB','Vis','Agi','Str'), g(a,'Tea','Wor','Bal','Jum','Sta'), 59) },
  { key: 'cfa',  label: 'Complete Forward - Attack',  category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Dri','Fir','Hea','Tec','Ant','Cmp','OtB','Agi','Str'), g(a,'Lon','Pas','Dec','Tea','Vis','Wor','Bal','Jum','Sta'), 51) },
  { key: 'dlfs', label: 'Deep Lying Forward - Support', category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Fir','Pas','Tec','Cmp','Dec','OtB','Tea'), g(a,'Ant','Fla','Vis','Bal','Str'), 41) },
  { key: 'dlfa', label: 'Deep Lying Forward - Attack',  category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Fir','Pas','Tec','Cmp','Dec','OtB','Tea'), g(a,'Dri','Ant','Fla','Vis','Bal','Str'), 42) },
  { key: 'f9s',  label: 'False Nine - Support',       category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Dri','Fir','Pas','Tec','Cmp','Dec','OtB','Vis','Agi'), g(a,'Ant','Fla','Tea','Bal'), 46) },
  { key: 'pa',   label: 'Poacher - Attack',           category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Ant','Cmp','OtB'), g(a,'Fir','Hea','Tec','Dec'), 28) },
  { key: 'pfd',  label: 'Pressing Forward - Defend',  category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Agg','Ant','Bra','Dec','Tea','Wor','Sta'), g(a,'Fir','Cmp','Cnt','Agi','Bal','Str'), 42) },
  { key: 'pfs',  label: 'Pressing Forward - Support', category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Agg','Ant','Bra','Dec','Tea','Wor','Sta'), g(a,'Fir','Pas','Cmp','Cnt','OtB','Agi','Bal','Str'), 44) },
  { key: 'pfa',  label: 'Pressing Forward - Attack',  category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Agg','Ant','Bra','OtB','Tea','Wor','Sta'), g(a,'Fir','Cmp','Cnt','Dec','Agi','Bal','Str'), 43) },
  { key: 'tfs',  label: 'Target Forward - Support',   category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Hea','Bra','Tea','Bal','Jum','Str'), g(a,'Fir','Agg','Ant','Cmp','Dec','OtB'), 39) },
  { key: 'tfa',  label: 'Target Forward - Attack',    category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Hea','Bra','Cmp','OtB','Bal','Jum','Str'), g(a,'Fir','Agg','Ant','Dec','Tea'), 41) },
  { key: 'trea', label: 'Trequartista - Attack',      category: 'ATT',
    calc: a => score(g(a,'Acc','Pac','Fin'), g(a,'Dri','Fir','Pas','Tec','Cmp','Dec','Fla','OtB','Vis'), g(a,'Ant','Agi','Bal'), 45) },
];

export const ROLE_MAP: Record<string, RoleDef> = Object.fromEntries(ROLES.map(r => [r.key, r]));

const ROLE_ALIASES: Record<string, string[]> = {
  'striker':    ['advanced forward','complete forward','poacher','centre forward','deep lying forward','pressing forward','target man','false nine'],
  'af':         ['advanced forward'],
  'cf':         ['centre forward','complete forward'],
  'poa':        ['poacher'],
  'dlf':        ['deep lying forward'],
  'pf':         ['pressing forward'],
  'tm':         ['target man'],
  'f9':         ['false nine'],
  'ss':         ['shadow striker'],
  'treq':       ['trequartista'],
  'am':         ['advanced midfielder'],
  'ap':         ['advanced playmaker'],
  'cm':         ['central midfielder'],
  'b2b':        ['box to box midfielder'],
  'box to box': ['box to box midfielder'],
  'mez':        ['mezzala'],
  'car':        ['carrilero'],
  'dm':         ['defensive midfielder','anchor man','ball winning midfielder','half back'],
  'cdm':        ['defensive midfielder'],
  'bwm':        ['ball winning midfielder'],
  'rp':         ['roaming playmaker'],
  'vol':        ['volante'],
  'wp':         ['wide playmaker'],
  'if':         ['inside forward'],
  'iw':         ['inverted winger'],
  'w':          ['winger'],
  'wb':         ['wing back'],
  'cwb':        ['complete wing back'],
  'fb':         ['full back'],
  'bpd':        ['ball playing def'],
  'cd':         ['central def'],
  'cb':         ['central def','ball playing def'],
  'sk':         ['sweeper keeper'],
  'gk':         ['goalkeeper'],
};

/** Returns all role variants whose base label matches words in the query. */
export function findRolesByQuery(query: string): RoleDef[] {
  const q = query.toLowerCase();
  const aliasedBases = new Set<string>();
  for (const [alias, bases] of Object.entries(ROLE_ALIASES)) {
    // Use word-boundary matching to prevent 'w' matching inside "forwards", etc.
    if (new RegExp(`\\b${alias}\\b`).test(q)) bases.forEach(b => aliasedBases.add(b));
  }
  return ROLES.filter(r => {
    const base = r.label
      .replace(/\s*-\s*(Attack|Support|Defend|Stopper|Cover|Auto)\s*$/i, '')
      .toLowerCase()
      .trim();
    return aliasedBases.size > 0 ? aliasedBases.has(base) : q.includes(base);
  });
}
