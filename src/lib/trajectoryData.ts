// Trajectory benchmark data from squirrel_plays research.
// Each entry maps age -> expected role score for a player on a 100% (Premier League) trajectory.
// Ages below 15 use the age-15 value; ages above plateau use the plateau value.

export type TrajectoryCategory = 'GK' | 'DEF' | 'MID' | 'ATT';

// Specific role curves (from trajectories.png)
const KNOWN_CURVES: Record<string, Record<number, number>> = {
  skd:  { 15:10.1, 16:10.5, 17:10.9, 18:11.1, 19:11.5, 20:11.8, 21:12.1, 22:12.0, 23:12.3, 24:12.6, 25:13.1, 26:13.3, 27:13.5 },
  wbs:  { 15:10.5, 16:11.0, 17:11.5, 18:12.0, 19:12.6, 20:13.2, 21:13.4, 22:13.5, 23:13.5, 24:13.5 },
  bpdd: { 15: 9.3, 16:10.0, 17:10.8, 18:11.6, 19:11.8, 20:12.1, 21:12.2, 22:12.2, 23:12.7, 24:13.4 },
  sva:  { 15:10.2, 16:10.6, 17:11.0, 18:11.8, 19:12.1, 20:12.4, 21:12.8, 22:13.1, 23:13.3, 24:13.5 },
  b2bs: { 15:10.6, 16:11.1, 17:11.6, 18:12.2, 19:12.6, 20:12.9, 21:13.1, 22:13.5, 23:13.6, 24:13.6 },
  ifa:  { 15:10.8, 16:11.5, 17:12.2, 18:12.7, 19:13.4, 20:13.6, 21:14.1, 22:14.3, 23:14.5, 24:14.5 },
  afa:  { 15:10.4, 16:11.1, 17:11.8, 18:12.6, 19:13.1, 20:13.3, 21:13.7, 22:14.0, 23:14.3, 24:14.5 },
};

// Category default curves (averages of known roles)
const CATEGORY_CURVES: Record<TrajectoryCategory, Record<number, number>> = {
  GK:  KNOWN_CURVES.skd,
  // avg(wbs, bpdd)
  DEF: { 15: 9.9, 16:10.5, 17:11.15, 18:11.8, 19:12.2, 20:12.65, 21:12.8, 22:12.85, 23:13.1, 24:13.45 },
  // avg(sva, b2bs)
  MID: { 15:10.4, 16:10.85, 17:11.3, 18:12.0, 19:12.35, 20:12.65, 21:12.95, 22:13.3, 23:13.45, 24:13.55 },
  // avg(ifa, afa)
  ATT: { 15:10.6, 16:11.3, 17:12.0, 18:12.65, 19:13.25, 20:13.45, 21:13.9, 22:14.15, 23:14.4, 24:14.5 },
};

// Plateau value = the maximum a 100% player reaches (the highest value in each curve)
export const PLATEAU: Record<TrajectoryCategory, number> = {
  GK:  13.5,
  DEF: 13.45,
  MID: 13.55,
  ATT: 14.5,
};

// Role-specific plateaus for the 7 known roles
const KNOWN_PLATEAUS: Record<string, number> = {
  skd: 13.5, wbs: 13.5, bpdd: 13.4, sva: 13.5, b2bs: 13.6, ifa: 14.5, afa: 14.5,
};

function getBenchmarkFromCurve(curve: Record<number, number>, age: number): number {
  const minAge = Math.min(...Object.keys(curve).map(Number));
  const maxAge = Math.max(...Object.keys(curve).map(Number));
  const clampedAge = Math.max(minAge, Math.min(maxAge, age));
  return curve[clampedAge] ?? curve[maxAge];
}

/** Returns the 100% benchmark score for a given role key and age. */
export function getBenchmark(roleKey: string, category: TrajectoryCategory, age: number): number {
  if (KNOWN_CURVES[roleKey]) {
    return getBenchmarkFromCurve(KNOWN_CURVES[roleKey], age);
  }
  return getBenchmarkFromCurve(CATEGORY_CURVES[category], age);
}

/** Returns the plateau (100% full-potential score) for a role. */
export function getPlateau(roleKey: string, category: TrajectoryCategory): number {
  if (KNOWN_PLATEAUS[roleKey] !== undefined) return KNOWN_PLATEAUS[roleKey];
  return PLATEAU[category];
}
