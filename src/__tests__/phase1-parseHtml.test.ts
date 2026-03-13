import { describe, it, expect } from 'vitest';
import { parseHtmlExport } from '../lib/parseHtml';

// ── Test HTML builder ──────────────────────────────────────────────────────

const ALL_HEADERS = [
  'Reg', 'Inf', 'Name', 'Age', 'Wage', 'Transfer Value', 'Nat', '2nd Nat',
  'Position', 'Personality', 'Media Handling', 'Av Rat', 'Left Foot', 'Right Foot',
  'Height', '1v1', 'Acc', 'Aer', 'Agg', 'Agi', 'Ant', 'Bal', 'Bra', 'Cmd', 'Cnt',
  'Cmp', 'Cro', 'Dec', 'Det', 'Dri', 'Fin', 'Fir', 'Fla', 'Han', 'Hea', 'Jum',
  'Kic', 'Ldr', 'Lon', 'Mar', 'OtB', 'Pac', 'Pas', 'Pos', 'Ref', 'Sta', 'Str',
  'Tck', 'Tea', 'Tec', 'Thr', 'TRO', 'Vis', 'Wor', 'UID', 'Cor', 'Club',
];

const ATTR_KEYS = [
  '1v1', 'Acc', 'Aer', 'Agg', 'Agi', 'Ant', 'Bal', 'Bra', 'Cmd', 'Cnt',
  'Cmp', 'Cro', 'Dec', 'Det', 'Dri', 'Fin', 'Fir', 'Fla', 'Han', 'Hea',
  'Jum', 'Kic', 'Ldr', 'Lon', 'Mar', 'OtB', 'Pac', 'Pas', 'Pos', 'Ref',
  'Sta', 'Str', 'Tck', 'Tea', 'Tec', 'Thr', 'TRO', 'Vis', 'Wor', 'Cor',
];

function defaultRow(overrides: Record<string, string> = {}): Record<string, string> {
  const attrs: Record<string, string> = {};
  ATTR_KEYS.forEach(k => { attrs[k] = '10'; });
  return {
    'Reg': '', 'Inf': 'S', 'Name': 'Test Player', 'Age': '18',
    'Wage': '£1,000 p/w', 'Transfer Value': '£100K', 'Nat': 'ENG',
    '2nd Nat': '', 'Position': 'M (C)', 'Personality': 'Determined',
    'Media Handling': 'Evasive', 'Av Rat': '7.00', 'Left Foot': 'Average',
    'Right Foot': 'Strong', 'Height': '180 cm',
    'UID': 'test-uid-1', 'Club': 'Test FC',
    ...attrs,
    ...overrides,
  };
}

function makeHtml(rows: Record<string, string>[]): string {
  const headerRow = `<tr>${ALL_HEADERS.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const dataRows = rows.map(data =>
    `<tr>${ALL_HEADERS.map(h => `<td>${data[h] ?? ''}</td>`).join('')}</tr>`
  ).join('');
  return `<table>${headerRow}${dataRows}</table>`;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Phase 1 — HTML Parser', () => {
  describe('basic parsing', () => {
    it('returns empty array for empty string', () => {
      expect(parseHtmlExport('')).toEqual([]);
    });

    it('returns empty array when only a header row is present', () => {
      expect(parseHtmlExport(makeHtml([]))).toHaveLength(0);
    });

    it('parses a single player row', () => {
      expect(parseHtmlExport(makeHtml([defaultRow()]))).toHaveLength(1);
    });

    it('parses multiple player rows', () => {
      const html = makeHtml([
        defaultRow({ Name: 'Alice', UID: 'uid-1' }),
        defaultRow({ Name: 'Bob',   UID: 'uid-2' }),
        defaultRow({ Name: 'Carol', UID: 'uid-3' }),
      ]);
      expect(parseHtmlExport(html)).toHaveLength(3);
    });
  });

  describe('field extraction', () => {
    it('extracts player name', () => {
      const html = makeHtml([defaultRow({ Name: 'Kylian Mbappé' })]);
      expect(parseHtmlExport(html)[0].name).toBe('Kylian Mbappé');
    });

    it('extracts age as integer', () => {
      const html = makeHtml([defaultRow({ Age: '17' })]);
      expect(parseHtmlExport(html)[0].age).toBe(17);
    });

    it('extracts uid', () => {
      const html = makeHtml([defaultRow({ UID: 'abc-123' })]);
      expect(parseHtmlExport(html)[0].uid).toBe('abc-123');
    });

    it('extracts nationality', () => {
      const html = makeHtml([defaultRow({ Nat: 'BRA' })]);
      expect(parseHtmlExport(html)[0].nationality).toBe('BRA');
    });

    it('extracts position', () => {
      const html = makeHtml([defaultRow({ Position: 'ST (C)' })]);
      expect(parseHtmlExport(html)[0].position).toBe('ST (C)');
    });

    it('extracts club', () => {
      const html = makeHtml([defaultRow({ Club: 'FC Barcelona' })]);
      expect(parseHtmlExport(html)[0].club).toBe('FC Barcelona');
    });

    it('extracts numeric attributes', () => {
      const html = makeHtml([defaultRow({ Pac: '18', Acc: '17', Fin: '15' })]);
      const p = parseHtmlExport(html)[0];
      expect(p.attrs.Pac).toBe(18);
      expect(p.attrs.Acc).toBe(17);
      expect(p.attrs.Fin).toBe(15);
    });

    it('parses avgRating as float', () => {
      const html = makeHtml([defaultRow({ 'Av Rat': '7.23' })]);
      expect(parseHtmlExport(html)[0].avgRating).toBeCloseTo(7.23);
    });

    it('returns null for avgRating when value is a dash', () => {
      const html = makeHtml([defaultRow({ 'Av Rat': '-' })]);
      expect(parseHtmlExport(html)[0].avgRating).toBeNull();
    });

    it('returns null for avgRating when value is empty', () => {
      const html = makeHtml([defaultRow({ 'Av Rat': '' })]);
      expect(parseHtmlExport(html)[0].avgRating).toBeNull();
    });
  });

  describe('name cleaning', () => {
    it('strips (U) suffix', () => {
      const html = makeHtml([defaultRow({ Name: 'João Silva (U)' })]);
      expect(parseHtmlExport(html)[0].name).toBe('João Silva');
    });

    it('strips (S) suffix', () => {
      const html = makeHtml([defaultRow({ Name: 'Pedro Costa (S)' })]);
      expect(parseHtmlExport(html)[0].name).toBe('Pedro Costa');
    });

    it('strips (GK) suffix', () => {
      const html = makeHtml([defaultRow({ Name: 'Manuel Neuer (GK)' })]);
      expect(parseHtmlExport(html)[0].name).toBe('Manuel Neuer');
    });

    it('does not alter names without status suffixes', () => {
      const html = makeHtml([defaultRow({ Name: 'Erling Haaland' })]);
      expect(parseHtmlExport(html)[0].name).toBe('Erling Haaland');
    });
  });

  describe('edge cases', () => {
    it('skips rows with non-numeric age', () => {
      const html = makeHtml([defaultRow({ Age: 'N/A' })]);
      expect(parseHtmlExport(html)).toHaveLength(0);
    });

    it('generates a fallback uid from name and age when UID is empty', () => {
      const html = makeHtml([defaultRow({ Name: 'Test Player', Age: '20', UID: '' })]);
      const players = parseHtmlExport(html);
      expect(players).toHaveLength(1);
      expect(players[0].uid).toBe('test_player_20');
    });

    it('treats non-numeric attribute values as 0', () => {
      const html = makeHtml([defaultRow({ Pac: '-', Acc: '' })]);
      const p = parseHtmlExport(html)[0];
      expect(p.attrs.Pac).toBe(0);
      expect(p.attrs.Acc).toBe(0);
    });

    it('initialises computed fields to their zero values', () => {
      const html = makeHtml([defaultRow()]);
      const p = parseHtmlExport(html)[0];
      expect(p.roleScores).toEqual({});
      expect(p.bestRole).toBe('');
      expect(p.trajectoryPct).toBe(0);
      expect(p.projectedPeak).toBe(0);
      expect(p.playStyles).toEqual([]);
    });
  });
});
