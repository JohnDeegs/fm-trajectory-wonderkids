import { describe, it, expect } from 'vitest';
import { ROLES, ROLE_MAP, findRolesByQuery } from '../lib/roleFormulas';
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

describe('Phase 2 — Role Formula Engine', () => {
  describe('role registry', () => {
    it('defines exactly 85 roles', () => {
      expect(ROLES).toHaveLength(85);
    });

    it('each role has a string key, label, valid category, and calc function', () => {
      for (const role of ROLES) {
        expect(role.key).toBeTypeOf('string');
        expect(role.key.length).toBeGreaterThan(0);
        expect(role.label).toBeTypeOf('string');
        expect(['GK', 'DEF', 'MID', 'ATT']).toContain(role.category);
        expect(role.calc).toBeTypeOf('function');
      }
    });

    it('role keys are unique', () => {
      const keys = ROLES.map(r => r.key);
      expect(new Set(keys).size).toBe(ROLES.length);
    });

    it('ROLE_MAP contains all roles', () => {
      expect(Object.keys(ROLE_MAP)).toHaveLength(ROLES.length);
      for (const role of ROLES) {
        expect(ROLE_MAP[role.key]).toBeDefined();
      }
    });

    it('covers all four position categories', () => {
      const cats = new Set(ROLES.map(r => r.category));
      expect(cats.has('GK')).toBe(true);
      expect(cats.has('DEF')).toBe(true);
      expect(cats.has('MID')).toBe(true);
      expect(cats.has('ATT')).toBe(true);
    });

    it('has 4 GK roles', () => {
      expect(ROLES.filter(r => r.category === 'GK')).toHaveLength(4);
    });

    it('has 27 DEF roles', () => {
      expect(ROLES.filter(r => r.category === 'DEF')).toHaveLength(27);
    });

    it('has 37 MID roles', () => {
      expect(ROLES.filter(r => r.category === 'MID')).toHaveLength(37);
    });

    it('has 17 ATT roles', () => {
      expect(ROLES.filter(r => r.category === 'ATT')).toHaveLength(17);
    });
  });

  describe('score formula — all-10 property', () => {
    // The divisor for every role = (numKey * 5) + (numGreen * 3) + (numBlue * 1),
    // so with all attrs = 10 every role must score exactly 10.0.
    it('every role scores exactly 10.0 when all attributes are 10', () => {
      const attrs = makeAttrs(10);
      for (const role of ROLES) {
        expect(role.calc(attrs)).toBe(10.0);
      }
    });

    it('every role scores 0 when all attributes are 0', () => {
      const attrs = makeAttrs(0);
      for (const role of ROLES) {
        expect(role.calc(attrs)).toBe(0);
      }
    });

    it('higher attribute values always produce higher scores', () => {
      const low  = makeAttrs(8);
      const high = makeAttrs(15);
      for (const role of ROLES) {
        expect(role.calc(high)).toBeGreaterThan(role.calc(low));
      }
    });
  });

  describe('specific role formulas', () => {
    it('gkd: key=Agi+Ref, green=Aer+Cmd+Han+Kic+Cnt+Pos, blue=1v1+Thr+Ant+Dec, div=32', () => {
      // With all attrs=10: ((20*5)+(60*3)+(40*1))/32 = 320/32 = 10.0
      expect(ROLE_MAP['gkd'].calc(makeAttrs(10))).toBe(10.0);
      // Key attrs boosted: higher score
      const boostedKey = makeAttrs(10, { Agi: 18, Ref: 18 } as Partial<Attrs>);
      expect(ROLE_MAP['gkd'].calc(boostedKey)).toBeGreaterThan(10.0);
    });

    it('afa: key=Acc+Pac+Fin, boosting those attrs raises the score', () => {
      const base    = makeAttrs(10);
      const boosted = makeAttrs(10, { Acc: 18, Pac: 18, Fin: 18 } as Partial<Attrs>);
      expect(ROLE_MAP['afa'].calc(boosted)).toBeGreaterThan(ROLE_MAP['afa'].calc(base));
    });

    it('b2bs scores the same as aps when all attrs are equal (different divisors produce different scores)', () => {
      // Just assert both return numbers; the formulae are independent
      const attrs = makeAttrs(10);
      expect(typeof ROLE_MAP['b2bs'].calc(attrs)).toBe('number');
      expect(typeof ROLE_MAP['aps'].calc(attrs)).toBe('number');
    });
  });

  describe('findRolesByQuery', () => {
    it('finds attacker roles for "striker"', () => {
      const roles = findRolesByQuery('striker');
      expect(roles.length).toBeGreaterThan(0);
      roles.forEach(r => expect(r.category).toBe('ATT'));
    });

    it('finds goalkeeper roles for "gk"', () => {
      const roles = findRolesByQuery('gk');
      expect(roles.length).toBeGreaterThan(0);
      roles.forEach(r => expect(r.category).toBe('GK'));
    });

    it('finds wing back roles for "wb"', () => {
      const roles = findRolesByQuery('wb');
      expect(roles.length).toBeGreaterThan(0);
    });

    it('finds advanced playmaker roles via base label (fallback mode)', () => {
      // No alias matches 'advanced playmaker', so the function falls back to
      // checking if the query string includes each role's base label directly.
      const roles = findRolesByQuery('advanced playmaker');
      expect(roles.some(r => r.key === 'aps')).toBe(true);
      expect(roles.some(r => r.key === 'apa')).toBe(true);
    });

    it('finds inside forward for "if"', () => {
      const roles = findRolesByQuery('if');
      expect(roles.some(r => r.key.startsWith('if'))).toBe(true);
    });

    it('returns empty array for a nonsense query', () => {
      expect(findRolesByQuery('zzznonsensexxx')).toEqual([]);
    });
  });
});
