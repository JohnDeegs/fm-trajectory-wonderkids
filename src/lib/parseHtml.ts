import type { Attrs, Player } from '../types';

// Column order in FM24 HTML export (after the non-attribute columns)
const ATTR_COLS = [
  '1v1','Acc','Aer','Agg','Agi','Ant','Bal','Bra','Cmd','Cnt','Cmp',
  'Cro','Dec','Det','Dri','Fin','Fir','Fla','Han','Hea','Jum','Kic',
  'Ldr','Lon','Mar','OtB','Pac','Pas','Pos','Ref','Sta','Str','Tck',
  'Tea','Tec','Thr','TRO','Vis','Wor','UID','Cor','Club',
] as const;

function parseNum(val: string): number {
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? 0 : n;
}

function cleanName(raw: string): string {
  // Remove status suffixes like (U), (S), (F), (L), (GK) from player names
  return raw.replace(/\s*\([A-Z]+\)\s*$/, '').trim();
}

export function parseHtmlExport(html: string): Player[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = Array.from(doc.querySelectorAll('table tr'));

  if (rows.length < 2) return [];

  // Get headers from first row
  const headerRow = rows[0];
  const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent?.trim() ?? '');

  // Build column index map from actual headers
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => { colIndex[h] = i; });

  const players: Player[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].querySelectorAll('td')).map(td => td.textContent?.trim() ?? '');
    if (cells.length < 20) continue;

    const getName = (h: string) => cells[colIndex[h]] ?? '';

    const attrs: Partial<Attrs> = {};
    for (const attrKey of ATTR_COLS) {
      if (attrKey === 'UID' || attrKey === 'Club') continue;
      const idx = colIndex[attrKey];
      if (idx !== undefined) {
        attrs[attrKey as keyof Attrs] = parseNum(cells[idx]);
      }
    }

    const age = parseInt(getName('Age'), 10);
    if (isNaN(age)) continue;
    const uidRaw = getName('UID');
    const safeId = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const uid = uidRaw || `${safeId(getName('Name'))}_${age}`;

    const avgRatRaw = getName('Av Rat');
    const avgRating = avgRatRaw === '-' || !avgRatRaw ? null : parseFloat(avgRatRaw);

    players.push({
      uid,
      name: cleanName(getName('Name')),
      age,
      club: getName('Club'),
      nationality: getName('Nat'),
      nationality2: getName('2nd Nat'),
      position: getName('Position'),
      personality: getName('Personality'),
      mediaHandling: getName('Media Handling'),
      avgRating,
      leftFoot: getName('Left Foot'),
      rightFoot: getName('Right Foot'),
      height: getName('Height'),
      wage: getName('Wage'),
      transferValue: getName('Transfer Value'),
      inf: getName('Inf'),
      attrs: attrs as Attrs,
      // Computed fields (filled in by calculateTrajectory)
      roleScores: {},
      bestRole: '',
      bestRoleLabel: '',
      bestRoleScore: 0,
      trajectoryPct: 0,
      projectedPeak: 0,
      positionCategory: 'MID',
      playStyles: [],
    });
  }

  return players;
}
