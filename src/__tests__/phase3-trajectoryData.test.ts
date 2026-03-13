import { describe, it, expect } from 'vitest';
import { getBenchmark, getPlateau, PLATEAU } from '../lib/trajectoryData';

describe('Phase 3a — Trajectory Benchmark Data', () => {
  describe('PLATEAU constants', () => {
    it('has the correct category plateau values', () => {
      expect(PLATEAU.GK).toBe(13.5);
      expect(PLATEAU.DEF).toBe(13.45);
      expect(PLATEAU.MID).toBe(13.55);
      expect(PLATEAU.ATT).toBe(14.5);
    });
  });

  describe('getBenchmark — known role curves', () => {
    it('returns the exact skd value at age 16', () => {
      expect(getBenchmark('skd', 'GK', 16)).toBe(10.5);
    });

    it('returns the exact skd value at age 25', () => {
      expect(getBenchmark('skd', 'GK', 25)).toBe(13.1);
    });

    it('returns the exact ifa value at age 20', () => {
      expect(getBenchmark('ifa', 'MID', 20)).toBe(13.6);
    });

    it('returns the exact bpdd value at age 18', () => {
      expect(getBenchmark('bpdd', 'DEF', 18)).toBe(11.6);
    });

    it('returns the exact afa value at age 15', () => {
      expect(getBenchmark('afa', 'ATT', 15)).toBe(10.4);
    });

    it('clamps ages below 15 to the age-15 value', () => {
      expect(getBenchmark('skd', 'GK', 10)).toBe(getBenchmark('skd', 'GK', 15));
      expect(getBenchmark('ifa', 'MID', 5)).toBe(getBenchmark('ifa', 'MID', 15));
    });

    it('clamps ages above the curve max to the plateau value', () => {
      // skd max age is 27
      expect(getBenchmark('skd', 'GK', 30)).toBe(getBenchmark('skd', 'GK', 27));
      expect(getBenchmark('skd', 'GK', 99)).toBe(getBenchmark('skd', 'GK', 27));
    });

    it('returns values that increase with age (growth curve)', () => {
      const ages = [15, 16, 17, 18, 19, 20];
      for (let i = 1; i < ages.length; i++) {
        expect(getBenchmark('ifa', 'MID', ages[i])).toBeGreaterThan(
          getBenchmark('ifa', 'MID', ages[i - 1])
        );
      }
    });
  });

  describe('getBenchmark — category fallback', () => {
    it('uses the ATT category curve for unknown ATT roles', () => {
      // ATT category at age 20 = 13.45 (avg of ifa@20=13.6 and afa@20=13.3)
      expect(getBenchmark('unknown_role', 'ATT', 20)).toBe(13.45);
    });

    it('uses the MID category curve at age 15', () => {
      // MID at 15 = avg(sva@15=10.2, b2bs@15=10.6) = 10.4
      expect(getBenchmark('unknown_mid', 'MID', 15)).toBe(10.4);
    });

    it('uses the DEF category curve at age 15', () => {
      // DEF at 15 = avg(wbs@15=10.5, bpdd@15=9.3) = 9.9
      expect(getBenchmark('unknown_def', 'DEF', 15)).toBe(9.9);
    });

    it('uses the GK category curve (same as skd) for unknown GK roles', () => {
      expect(getBenchmark('unknown_gk', 'GK', 16)).toBe(getBenchmark('skd', 'GK', 16));
    });
  });

  describe('getPlateau', () => {
    it('returns the known plateau for skd (13.5)', () => {
      expect(getPlateau('skd', 'GK')).toBe(13.5);
    });

    it('returns the known plateau for ifa (14.5)', () => {
      expect(getPlateau('ifa', 'ATT')).toBe(14.5);
    });

    it('returns the known plateau for bpdd (13.4)', () => {
      expect(getPlateau('bpdd', 'DEF')).toBe(13.4);
    });

    it('returns the known plateau for b2bs (13.6)', () => {
      expect(getPlateau('b2bs', 'MID')).toBe(13.6);
    });

    it('falls back to category plateau for unknown roles', () => {
      expect(getPlateau('unknown_role', 'ATT')).toBe(PLATEAU.ATT);
      expect(getPlateau('unknown_role', 'DEF')).toBe(PLATEAU.DEF);
      expect(getPlateau('unknown_role', 'MID')).toBe(PLATEAU.MID);
      expect(getPlateau('unknown_role', 'GK')).toBe(PLATEAU.GK);
    });
  });
});
