# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Web app
npm run dev          # dev server (Vite, hot reload)
npm run build        # tsc + Vite production build
npm run lint         # ESLint
npm run test         # run all tests once (Vitest + jsdom)
npm run test:watch   # watch mode

# Run a single test file
npx vitest run src/__tests__/phase2-roleFormulas.test.ts

# Bot (run from bot/ directory after npm install)
npm run dev          # ts-node bot.ts (requires .env)
npm run build        # tsc → dist/
npm start            # node dist/bot.js
```

## Architecture

### Web app (`src/`)

Pure frontend — no backend, no build-time env vars. All state lives in localStorage via a single custom hook.

**Data flow:**
1. User uploads FM24 HTML export → `parseHtmlExport()` extracts `Player[]` from the table
2. `scoreAllPlayers()` runs all 85 role formulas per player, selects best role for the player's position category, and calculates `trajectoryPct` and `projectedPeak`
3. Scored players are held in React state; favourite `Player` objects are also persisted to localStorage under `fm-traj-saved-players`

**Key invariants:**
- `trajectoryPct = (bestCategoryRoleScore / benchmarkAtAge) × 100` — the benchmark is age-specific and role/category-specific
- Best role selection is position-category-scoped (a striker won't be evaluated as a goalkeeper even if GK formulas score higher)
- Favourites use a separate `favouriteSaveGames` map (`uid → saveGameId`) to isolate across save game tabs — not a flat uid list

**Lib modules:**
- `parseHtml.ts` — DOM-based parser; column order is fixed (not header-searched)
- `roleFormulas.ts` — 85 `ROLES`, each with `calc(attrs)` function using weighted key/green/blue attribute sums divided by a normalising divisor
- `trajectoryData.ts` — 7 known age curves (`skd`, `wbs`, `bpdd`, `sva`, `b2bs`, `ifa`, `afa`); other roles use category averages
- `calculateTrajectory.ts` — orchestrates scoring, best-role selection, trajectory calculation, play style detection
- `geminiSearch.ts` — pre-filters to top 500 by trajectory, builds one-line player summaries, calls Gemini 2.5 Flash with `thinkingBudget: 0`, extracts JSON array using `indexOf('[')` / `lastIndexOf(']')`, caches `playerMap` at module level
- `youthData.ts` — nation youth ratings, club recruitment tiers, nationality code → country name lookup

**State (`store/useStore.ts`):** Single hook, all localStorage keys prefixed `fm-traj-`. Players are session-only (not persisted); favourite full `Player` objects are persisted under `fm-traj-saved-players`.

### Telegram bot (`bot/`)

Railway-hosted Node.js service. Separate `package.json` — install and run independently from the web app.

- `storage.ts` — PostgreSQL via `pg`; single `player_data` table (chat_id → JSONB); call `initDb()` on startup
- `search.ts` — port of `geminiSearch.ts` with cap reduced to 300, adds age ≤ 21 pre-filter for youth queries, returns top 5
- `format.ts` — formats `BotPlayer[]` as Telegram markdown; trajectory tier emojis 🟣🟢🟡🟠🔴
- `bot.ts` — Telegraf long-polling; `/upload` sets an in-memory `awaitingUpload` set, next document message is treated as the player export

**Bot player shape (`BotPlayer`):** Compact subset of `Player` — no `attrs` (only 7 key attrs kept), no `roleScores`. Exported from web app via `src/lib/exportForBot.ts`.

### Tests (`src/__tests__/`)

Vitest with jsdom. Test files are named `phase<n>-<module>.test.ts`. Tests use real data shapes (not mocks of core logic).

## Reference files

- `calculate_role_score.txt` — original Python source for all 85 role formulas (ground truth for formula port)
- `trajectories.png` — benchmark age curve table (7 known roles); source of truth for `trajectoryData.ts`
- `example_html_export.html` — sample FM24 HTML export for parser testing
