# FM Trajectory Wonderkids

A Football Manager 24 scouting tool that identifies wonderkids on track to become world-class players, using trajectory analysis across 85 role formulas.

## What it does

Upload your FM24 HTML player export and the app scores every player across 85 roles, calculates their trajectory percentage relative to age-specific benchmarks, and surfaces players on a 110–120%+ path to elite performance.

**Core workflow:**
1. Export your squad/shortlist from FM24 as an HTML file
2. Upload it in the app
3. Each player is scored across all 85 role formulas; the best-fit role for their position category is selected
4. Trajectory % = `(best role score / benchmark at age) × 100`
5. Browse, filter, sort, and search results — save favourites to shortlists

## Features

- **85 role formulas** ported from FM24 role scoring logic (GK through striker), using weighted key/green/blue attribute sums
- **Age-adjusted benchmarks** — 7 known trajectory curves (skd, wbs, bpdd, sva, b2bs, ifa, afa) plus category averages for all other roles
- **Play style detection** — badges for detected styles (e.g. press, dribbler, aerial)
- **Natural language search** — powered by Gemini 2.5 Flash; describe what you're looking for in plain English
- **Favourites** — save players to named shortlists, isolated per save game tab
- **Player detail modal** — full attribute breakdown in FM24 layout style
- **Sort/filter bar** — by trajectory %, position, age, club, nationality, and more
- **Export for bot** — export your player data for use with the Telegram bot

All state is client-side. No backend, no accounts. Favourites persist in `localStorage`.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Vitest + jsdom for tests
- Gemini API (user-supplied key, stored in `localStorage`)

## Getting started

```bash
npm install
npm run dev
```

Open the app, go to Settings, and enter your Gemini API key (needed for natural language search only). Then upload an FM24 HTML export.

### Exporting from FM24

In FM24, go to any player list view, select all players, and use the export to HTML option. The app expects the standard column layout from an FM24 HTML export.

## Commands

```bash
npm run dev          # dev server with hot reload
npm run build        # production build (tsc + Vite)
npm run lint         # ESLint
npm run test         # run all tests once
npm run test:watch   # watch mode
```

## Telegram bot

A companion Telegram bot lives in `bot/` — a separate Node.js service deployable to Railway.

```bash
cd bot
npm install
npm run dev    # ts-node (requires .env with BOT_TOKEN and DATABASE_URL)
npm run build  # compile to dist/
npm start      # run compiled bot
```

The bot accepts FM24 HTML exports via `/upload`, stores player data in PostgreSQL (per chat ID), and responds to natural language queries using the same Gemini-powered search.

## Trajectory system

```
trajectory% = (player_role_score / benchmark_at_age) × 100
projected_peak = trajectory% × plateau_value_for_role
```

| Category | Plateau |
|----------|---------|
| GK       | ~13.5   |
| DEF      | ~13.45  |
| MID      | ~13.55  |
| ATT      | ~14.5   |

Players at 110%+ are on track to reach world-class. 120%+ is elite wonderkid territory.

## Project structure

```
src/
  lib/
    parseHtml.ts           # FM24 HTML export parser
    roleFormulas.ts        # 85 role scoring formulas
    calculateTrajectory.ts # scoring orchestration + best-role selection
    trajectoryData.ts      # age curve benchmarks
    geminiSearch.ts        # natural language search via Gemini
    playStyles.ts          # play style detection
    youthData.ts           # nation/club youth ratings, nationality lookup
    exportForBot.ts        # compact export shape for the Telegram bot
  components/
    UploadPanel.tsx
    ResultsGrid.tsx
    PlayerModal.tsx
    FavouritesPanel.tsx
    SearchBar.tsx
    SortBar.tsx
    SettingsPanel.tsx
    PlayStyleBadge.tsx
  store/
    useStore.ts            # single state hook, all localStorage keys prefixed fm-traj-
bot/
  bot.ts                   # Telegraf long-polling
  search.ts                # Gemini search (youth-focused variant)
  storage.ts               # PostgreSQL via pg
  format.ts                # Telegram markdown formatter
```
