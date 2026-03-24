import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { geminiSearch } from '../lib/geminiSearch';
import type { Player, Attrs } from '../types';

function makeAttrs(value: number): Attrs {
  const keys = [
    '1v1','Acc','Aer','Agg','Agi','Ant','Bal','Bra','Cmd','Cnt','Cmp',
    'Cro','Dec','Det','Dri','Fin','Fir','Fla','Han','Hea','Jum','Kic','Ldr','Lon',
    'Mar','OtB','Pac','Pas','Pos','Ref','Sta','Str','Tck','Tea','Tec','Thr','TRO',
    'Vis','Wor','Cor',
  ];
  return Object.fromEntries(keys.map(k => [k, value])) as Attrs;
}

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    uid: 'test-uid',
    name: 'Test Player',
    age: 18,
    club: 'Test FC',
    nationality: 'ENG',
    nationality2: '',
    position: 'ST (C)',
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
    bestRole: 'afa',
    bestRoleLabel: 'Advanced Forward - Attack',
    bestRoleScore: 10.5,
    trajectoryPct: 130,
    projectedPeak: 14.2,
    positionCategory: 'ATT',
    playStyles: [],
    ...overrides,
  };
}

function mockGeminiResponse(text: string) {
  return {
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
  };
}

describe('Phase 8 — Gemini Search', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('input validation', () => {
    it('throws when API key is an empty string', async () => {
      await expect(geminiSearch('fast strikers', [makePlayer()], ''))
        .rejects.toThrow('No Gemini API key');
    });

    it('throws when API key is only whitespace', async () => {
      await expect(geminiSearch('fast strikers', [makePlayer()], '   '))
        .rejects.toThrow('No Gemini API key');
    });

    it('throws when no players are loaded', async () => {
      await expect(geminiSearch('fast strikers', [], 'valid-key'))
        .rejects.toThrow('No player data loaded');
    });
  });

  describe('successful response', () => {
    it('returns players matching the UIDs returned by Gemini', async () => {
      const players = [
        makePlayer({ uid: 'p1', trajectoryPct: 130 }),
        makePlayer({ uid: 'p2', trajectoryPct: 120 }),
        makePlayer({ uid: 'p3', trajectoryPct: 110 }),
      ];
      mockFetch.mockResolvedValue(mockGeminiResponse('["p1","p3"]'));

      const results = await geminiSearch('fast strikers', players, 'key');
      expect(results).toHaveLength(2);
      expect(results[0].uid).toBe('p1');
      expect(results[1].uid).toBe('p3');
    });

    it('handles response where JSON is wrapped in markdown code fences', async () => {
      const players = [makePlayer({ uid: 'p1', trajectoryPct: 130 })];
      mockFetch.mockResolvedValue(mockGeminiResponse('```json\n["p1"]\n```'));

      const results = await geminiSearch('query', players, 'key');
      expect(results).toHaveLength(1);
      expect(results[0].uid).toBe('p1');
    });

    it('silently drops UIDs that do not match any loaded player', async () => {
      const players = [makePlayer({ uid: 'p1', trajectoryPct: 130 })];
      mockFetch.mockResolvedValue(mockGeminiResponse('["p1","ghost-uid"]'));

      const results = await geminiSearch('query', players, 'key');
      expect(results).toHaveLength(1);
      expect(results[0].uid).toBe('p1');
    });

    it('returns an empty array when Gemini returns no matching UIDs', async () => {
      const players = [makePlayer({ uid: 'p1', trajectoryPct: 130 })];
      mockFetch.mockResolvedValue(mockGeminiResponse('[]'));

      const results = await geminiSearch('query', players, 'key');
      expect(results).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('throws a descriptive error on non-OK HTTP response', async () => {
      const players = [makePlayer()];
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(geminiSearch('query', players, 'key'))
        .rejects.toThrow('Gemini API error 429');
    });

    it('throws "Gemini unexpected format" when response contains no JSON array', async () => {
      const players = [makePlayer()];
      mockFetch.mockResolvedValue(mockGeminiResponse('I cannot help with that request.'));

      await expect(geminiSearch('query', players, 'key'))
        .rejects.toThrow('Gemini unexpected format');
    });

    it('throws "Gemini returned malformed JSON" when array content is invalid', async () => {
      const players = [makePlayer()];
      // Has [ and ] but the content between them is not valid JSON
      mockFetch.mockResolvedValue(mockGeminiResponse('[invalid json content!!!]'));

      await expect(geminiSearch('query', players, 'key'))
        .rejects.toThrow('Gemini returned malformed JSON');
    });
  });

  describe('query sanitisation and request format', () => {
    it('replaces double quotes in the query with apostrophes', async () => {
      const players = [makePlayer()];
      mockFetch.mockResolvedValue(mockGeminiResponse('[]'));

      await geminiSearch('find "fast" strikers', players, 'my-key');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.contents[0].parts[0].text).toContain("'fast'");
    });

    it('sends the API key in the request URL', async () => {
      const players = [makePlayer()];
      mockFetch.mockResolvedValue(mockGeminiResponse('[]'));

      await geminiSearch('query', players, 'super-secret-key');

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('super-secret-key');
    });

    it('uses POST method', async () => {
      const players = [makePlayer()];
      mockFetch.mockResolvedValue(mockGeminiResponse('[]'));

      await geminiSearch('query', players, 'key');

      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });

    it('sets thinkingBudget to 0 to prevent response truncation', async () => {
      const players = [makePlayer()];
      mockFetch.mockResolvedValue(mockGeminiResponse('[]'));

      await geminiSearch('query', players, 'key');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.generationConfig.thinkingConfig.thinkingBudget).toBe(0);
    });
  });
});
