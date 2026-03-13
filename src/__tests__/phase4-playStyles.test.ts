import { describe, it, expect } from 'vitest';
import { calculatePlayStyles, PLAY_STYLE_DEFS } from '../lib/playStyles';
import type { Attrs } from '../types';

function makeAttrs(value: number, overrides: Partial<Attrs> = {}): Attrs {
  const keys = [
    '1v1','Acc','Aer','Agg','Agi','Ant','Bal','Bra','Cmd','Cnt','Cmp',
    'Cro','Dec','Det','Dri','Fin','Fir','Fla','Han','Hea','Jum','Kic','Ldr','Lon',
    'Mar','OtB','Pac','Pas','Pos','Ref','Sta','Str','Tck','Tea','Tec','Thr','TRO',
    'Vis','Wor','Cor',
  ];
  const base = Object.fromEntries(keys.map(k => [k, value])) as Attrs;
  return { ...base, ...overrides };
}

describe('Phase 4 — Play Style Detection', () => {
  describe('PLAY_STYLE_DEFS registry', () => {
    it('defines exactly 19 play styles', () => {
      expect(PLAY_STYLE_DEFS).toHaveLength(19);
    });

    it('each style has id, label, iconPath, primary attrs, and support attrs', () => {
      for (const ps of PLAY_STYLE_DEFS) {
        expect(ps.id).toBeTypeOf('string');
        expect(ps.id.length).toBeGreaterThan(0);
        expect(ps.label).toBeTypeOf('string');
        expect(ps.iconPath).toBeTypeOf('string');
        expect(ps.primary.length).toBeGreaterThan(0);
        expect(ps.support.length).toBeGreaterThan(0);
      }
    });

    it('all style ids are unique', () => {
      const ids = PLAY_STYLE_DEFS.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('calculatePlayStyles thresholds', () => {
    it('returns empty array when all attributes are 0', () => {
      expect(calculatePlayStyles(makeAttrs(0))).toHaveLength(0);
    });

    it('returns empty array for mediocre attributes (all 10)', () => {
      // primary avg = 10 < 15.5 threshold
      expect(calculatePlayStyles(makeAttrs(10))).toHaveLength(0);
    });

    it('returns empty array when primary is high but support is too low', () => {
      // finesse_shot: primary=[Fin,Tec], support=[Cmp]
      const attrs = makeAttrs(0, { Fin: 18, Tec: 18, Cmp: 10 } as Partial<Attrs>);
      const result = calculatePlayStyles(attrs);
      expect(result.find(s => s.id === 'finesse_shot')).toBeUndefined();
    });

    it('returns empty array when support is high but primary is too low', () => {
      const attrs = makeAttrs(0, { Fin: 10, Tec: 10, Cmp: 18 } as Partial<Attrs>);
      const result = calculatePlayStyles(attrs);
      expect(result.find(s => s.id === 'finesse_shot')).toBeUndefined();
    });
  });

  describe('finesse_shot — primary: [Fin, Tec], support: [Cmp]', () => {
    it('returns "plus" tier when avg(Fin,Tec) > 17.5 and avg(Cmp) > 15.5', () => {
      const attrs = makeAttrs(0, { Fin: 18, Tec: 18, Cmp: 16 } as Partial<Attrs>);
      const style = calculatePlayStyles(attrs).find(s => s.id === 'finesse_shot');
      expect(style).toBeDefined();
      expect(style?.tier).toBe('plus');
    });

    it('returns "standard" tier when avg(Fin,Tec) is 15.5–17.5 and avg(Cmp) > 15.5', () => {
      const attrs = makeAttrs(0, { Fin: 16, Tec: 16, Cmp: 16 } as Partial<Attrs>);
      const style = calculatePlayStyles(attrs).find(s => s.id === 'finesse_shot');
      expect(style).toBeDefined();
      expect(style?.tier).toBe('standard');
    });

    it('is absent when primary avg is exactly at the lower threshold', () => {
      // avg(15.5, 15.5) = 15.5 — NOT strictly > 15.5
      const attrs = makeAttrs(0, { Fin: 15.5, Tec: 15.5, Cmp: 16 } as Partial<Attrs>);
      expect(calculatePlayStyles(attrs).find(s => s.id === 'finesse_shot')).toBeUndefined();
    });
  });

  describe('rapid — primary: [Pac, Dri], support: [Bal]', () => {
    it('returns "plus" tier when Pac=18, Dri=18, Bal=16', () => {
      const attrs = makeAttrs(0, { Pac: 18, Dri: 18, Bal: 16 } as Partial<Attrs>);
      const style = calculatePlayStyles(attrs).find(s => s.id === 'rapid');
      expect(style).toBeDefined();
      expect(style?.tier).toBe('plus');
    });
  });

  describe('bruiser — primary: [Str, Bra], support: [Wor]', () => {
    it('returns "plus" tier when Str=18, Bra=18, Wor=16', () => {
      const attrs = makeAttrs(0, { Str: 18, Bra: 18, Wor: 16 } as Partial<Attrs>);
      const style = calculatePlayStyles(attrs).find(s => s.id === 'bruiser');
      expect(style).toBeDefined();
      expect(style?.tier).toBe('plus');
    });
  });

  describe('all styles at once', () => {
    it('returns all 19 styles as "plus" when all attributes are 18', () => {
      const result = calculatePlayStyles(makeAttrs(18));
      expect(result).toHaveLength(19);
      result.forEach(s => expect(s.tier).toBe('plus'));
    });

    it('returned results have id, label, and tier fields', () => {
      const result = calculatePlayStyles(makeAttrs(18));
      for (const s of result) {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('label');
        expect(s).toHaveProperty('tier');
        expect(['plus', 'standard']).toContain(s.tier);
      }
    });
  });
});
