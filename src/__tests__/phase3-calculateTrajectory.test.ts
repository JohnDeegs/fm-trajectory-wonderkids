import { describe, it, expect } from 'vitest';
import { ROLES } from '../lib/roleFormulas';
import {
  scorePlayer,
  scoreAllPlayers,
  getTrajectoryColour,
  getTrajectoryLabel,
  getAttrColour,
} from '../lib/calculateTrajectory';
import type { Player, Attrs } from '../types';

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

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    uid: 'test-uid',
    name: 'Test Player',
    age: 20,
    club: 'Test FC',
    nationality: 'ENG',
    nationality2: '',
    position: 'M (C)',
    personality: 'Determined',
    mediaHandling: 'Evasive',
    avgRating: null,
    leftFoot: 'Average',
    rightFoot: 'Strong',
    height: '180 cm',
    wage: '',
    transferValue: '',
    inf: '',
    attrs: makeAttrs(10),
    roleScores: {},
    bestRole: '',
    bestRoleLabel: '',
    bestRoleScore: 0,
    trajectoryPct: 0,
    projectedPeak: 0,
    positionCategory: 'MID',
    playStyles: [],
    ...overrides,
  };
}

describe('Phase 3b — Trajectory Engine', () => {
  describe('getTrajectoryColour', () => {
    it('returns purple (#a78bfa) for 120+', () => {
      expect(getTrajectoryColour(120)).toBe('#a78bfa');
      expect(getTrajectoryColour(150)).toBe('#a78bfa');
    });

    it('returns green (#4ade80) for 110–119', () => {
      expect(getTrajectoryColour(110)).toBe('#4ade80');
      expect(getTrajectoryColour(119)).toBe('#4ade80');
    });

    it('returns yellow (#facc15) for 100–109', () => {
      expect(getTrajectoryColour(100)).toBe('#facc15');
      expect(getTrajectoryColour(109)).toBe('#facc15');
    });

    it('returns orange (#fb923c) for 90–99', () => {
      expect(getTrajectoryColour(90)).toBe('#fb923c');
      expect(getTrajectoryColour(99)).toBe('#fb923c');
    });

    it('returns red (#f87171) for below 90', () => {
      expect(getTrajectoryColour(89)).toBe('#f87171');
      expect(getTrajectoryColour(0)).toBe('#f87171');
    });
  });

  describe('getTrajectoryLabel', () => {
    it('returns "Elite" for 120+', () => {
      expect(getTrajectoryLabel(120)).toBe('Elite');
      expect(getTrajectoryLabel(150)).toBe('Elite');
    });

    it('returns "Wonderkid" for 110+ when player is under 24', () => {
      expect(getTrajectoryLabel(110, 20)).toBe('Wonderkid');
      expect(getTrajectoryLabel(119, 18)).toBe('Wonderkid');
    });

    it('returns "Excellent" for 110+ when player is 24 or older', () => {
      expect(getTrajectoryLabel(110, 24)).toBe('Excellent');
      expect(getTrajectoryLabel(115, 30)).toBe('Excellent');
    });

    it('returns "Wonderkid" for 110+ when no age is provided', () => {
      expect(getTrajectoryLabel(115)).toBe('Wonderkid');
    });

    it('returns "Decent" for 100–109', () => {
      expect(getTrajectoryLabel(100)).toBe('Decent');
      expect(getTrajectoryLabel(109)).toBe('Decent');
    });

    it('returns "Below Avg" for 90–99', () => {
      expect(getTrajectoryLabel(90)).toBe('Below Avg');
      expect(getTrajectoryLabel(99)).toBe('Below Avg');
    });

    it('returns "Poor" for below 90', () => {
      expect(getTrajectoryLabel(89)).toBe('Poor');
      expect(getTrajectoryLabel(0)).toBe('Poor');
    });
  });

  describe('getAttrColour', () => {
    it('returns light green (#86efac) for 17+', () => {
      expect(getAttrColour(17)).toBe('#86efac');
      expect(getAttrColour(20)).toBe('#86efac');
    });

    it('returns green (#4ade80) for 13–16', () => {
      expect(getAttrColour(13)).toBe('#4ade80');
      expect(getAttrColour(16)).toBe('#4ade80');
    });

    it('returns yellow (#facc15) for 9–12', () => {
      expect(getAttrColour(9)).toBe('#facc15');
      expect(getAttrColour(12)).toBe('#facc15');
    });

    it('returns red (#f87171) for below 9', () => {
      expect(getAttrColour(8)).toBe('#f87171');
      expect(getAttrColour(0)).toBe('#f87171');
    });
  });

  describe('scorePlayer', () => {
    it('populates roleScores with all 85 roles', () => {
      const p = scorePlayer(makePlayer());
      expect(Object.keys(p.roleScores)).toHaveLength(85);
    });

    it('sets bestRole, bestRoleLabel, bestRoleScore', () => {
      const p = scorePlayer(makePlayer());
      expect(p.bestRole).toBeTruthy();
      expect(p.bestRoleLabel).toBeTruthy();
      expect(p.bestRoleScore).toBeGreaterThan(0);
    });

    it('sets trajectoryPct and projectedPeak as positive numbers', () => {
      const p = scorePlayer(makePlayer());
      expect(p.trajectoryPct).toBeGreaterThan(0);
      expect(p.projectedPeak).toBeGreaterThan(0);
    });

    it('infers GK category for "GK" position', () => {
      expect(scorePlayer(makePlayer({ position: 'GK' })).positionCategory).toBe('GK');
    });

    it('infers ATT category for "ST (C)" position', () => {
      expect(scorePlayer(makePlayer({ position: 'ST (C)' })).positionCategory).toBe('ATT');
    });

    it('infers DEF category for "D (C)" position', () => {
      expect(scorePlayer(makePlayer({ position: 'D (C)' })).positionCategory).toBe('DEF');
    });

    it('infers MID category for "M (C)" position', () => {
      expect(scorePlayer(makePlayer({ position: 'M (C)' })).positionCategory).toBe('MID');
    });

    it('infers DEF category for "WB (RL)" position', () => {
      expect(scorePlayer(makePlayer({ position: 'WB (RL)' })).positionCategory).toBe('DEF');
    });

    it('a younger player with all-10 attrs at GK age 15 scores ~99% trajectory', () => {
      // gkd (first GK role) scores 10.0; GK benchmark at 15 = skd[15] = 10.1
      // trajectoryPct = round((10.0 / 10.1) * 1000) / 10 = 99.0
      const p = scorePlayer(makePlayer({ position: 'GK', age: 15 }));
      expect(p.trajectoryPct).toBe(99.0);
    });

    it('higher attribute values produce higher trajectory percentage', () => {
      const base    = scorePlayer(makePlayer({ position: 'ST (C)', age: 16 }));
      const boosted = scorePlayer(makePlayer({ position: 'ST (C)', age: 16, attrs: makeAttrs(15) }));
      expect(boosted.trajectoryPct).toBeGreaterThan(base.trajectoryPct);
    });

    it('bestRole is scoped to the player\'s position category', () => {
      const gkPlayer  = scorePlayer(makePlayer({ position: 'GK' }));
      const attPlayer = scorePlayer(makePlayer({ position: 'ST (C)' }));
      expect(gkPlayer.positionCategory).toBe('GK');
      expect(attPlayer.positionCategory).toBe('ATT');
      // Best role category should match position category
      const gkRole  = ROLES.find((r) => r.key === gkPlayer.bestRole);
      const attRole = ROLES.find((r) => r.key === attPlayer.bestRole);
      expect(gkRole?.category).toBe('GK');
      expect(attRole?.category).toBe('ATT');
    });

    it('preserves uid and other metadata from the source player', () => {
      const p = scorePlayer(makePlayer({ uid: 'my-uid', name: 'Lionel', age: 19 }));
      expect(p.uid).toBe('my-uid');
      expect(p.name).toBe('Lionel');
      expect(p.age).toBe(19);
    });
  });

  describe('scoreAllPlayers', () => {
    it('returns the same count as input', () => {
      const players = [makePlayer({ uid: 'p1' }), makePlayer({ uid: 'p2' }), makePlayer({ uid: 'p3' })];
      expect(scoreAllPlayers(players)).toHaveLength(3);
    });

    it('scores every player in the array', () => {
      const players = [makePlayer({ uid: 'p1' }), makePlayer({ uid: 'p2' })];
      const scored = scoreAllPlayers(players);
      scored.forEach(p => {
        expect(Object.keys(p.roleScores)).toHaveLength(85);
        expect(p.trajectoryPct).toBeGreaterThan(0);
      });
    });

    it('returns an empty array for empty input', () => {
      expect(scoreAllPlayers([])).toEqual([]);
    });
  });
});
