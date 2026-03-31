# FM Trajectory Wonderkids — Task Breakdown

*Phase-by-phase tasks for building the app from scratch.*

---

## Phase 0 — Project Setup

- [ ] Scaffold project with Vite + React + TypeScript: `npm create vite@latest`
- [ ] Install and configure Tailwind CSS
- [ ] Set up `src/` directory structure: `lib/`, `components/`, `store/`
- [ ] Create `src/types.ts` — define `Player`, `Attrs`, `SaveGame`, `Shortlist`, `Favourite`, `PlayStyle` types
- [ ] Add `example_html_export.html` and `trajectories.png` to project root for reference
- [ ] Confirm dev server runs: `npm run dev`

---

## Phase 1 — HTML Parser

**Goal:** Parse an FM24 HTML scouting export into a typed `Player[]`.

- [ ] Create `src/lib/parseHtml.ts`
- [ ] Use `DOMParser` to parse the HTML string into a document
- [ ] Select the scouting table (`table` element) and iterate rows
- [ ] Map column indices to fields — hardcode the fixed column order:
  - 0: Reg, 1: Inf, 2: Name, 3: Age, 4: Wage, 5: Transfer Value, 6: Nat, 7: 2nd Nat, 8: Position, 9: Personality, 10: Media Handling, 11: Av Rat, 12: Left Foot, 13: Right Foot, 14: Height
  - 15–54: 40 attributes in alphabetical order (1v1, Acc, Aer, … Wor)
  - 55: UID, 56: Cor, 57: Club
- [ ] Parse age as integer (`parseInt`)
- [ ] Extract attributes into an `Attrs` object keyed by short name
- [ ] Skip header row and any rows with missing name or UID
- [ ] Export `parseHtml(html: string): Player[]`
- [ ] Manual verification: run against `example_html_export.html`, check name/age/attrs for a known player

---

## Phase 2 — Role Formula Engine

**Goal:** Score a player across all 85 roles and identify their best role.

- [ ] Create `src/lib/roleFormulas.ts`
- [ ] Define the formula type: `{ key: string[], green: string[], blue: string[], divisor: number }`
- [ ] Transcribe all 85 role formulas from `calculate_role_score.txt` into the `ROLE_FORMULAS` record
  - Work position family by position family (GK, DEF, MID, ATT) to stay organised
  - Double-check attribute short names match the parser's `Attrs` keys exactly
- [ ] Implement `scoreRole(attrs: Attrs, formula): number`:
  - `((sum(key) × 5) + (sum(green) × 3) + (sum(blue) × 1)) / divisor`
- [ ] Implement `scoreAllRoles(attrs: Attrs): Record<string, number>`
- [ ] Implement `getBestRole(attrs: Attrs): { role: string, score: number }`
- [ ] Manual verification: use a player with known role scores, assert outputs match

---

## Phase 3 — Trajectory Engine + Benchmark Data

**Goal:** Convert role scores into trajectory percentages and projected peaks.

- [ ] Create `src/lib/trajectoryData.ts`
  - Transcribe the 7 known age curves from `trajectories.png`: `skd`, `wbs`, `bpdd`, `sva`, `b2bs`, `ifa`, `afa`
  - Each curve is a `Record<age, benchmarkScore>` covering ages 15–35 (or whatever the image shows)
  - Derive the 4 category fallback curves:
    - GK: skd
    - DEF: avg(wbs, bpdd) per age
    - MID: avg(sva, b2bs) per age
    - ATT: avg(ifa, afa) per age
  - Define plateau values: `{ GK: 13.5, DEF: 13.45, MID: 13.55, ATT: 14.5 }`
  - Map each of the 85 roles to their benchmark curve (role-specific where known, category fallback otherwise)

- [ ] Create `src/lib/calculateTrajectory.ts`
  - `getPositionCategory(position: string): 'GK' | 'DEF' | 'MID' | 'ATT'`
    - Parse FM24 position strings: "GK", "D (C)", "D/WB (R)", "M/AM (C)", etc.
  - `getBenchmarkAtAge(role: string, age: number): number`
  - `calculateTrajectory(player: Omit<Player, 'trajectoryPct' | 'projectedPeak' | 'bestRole' | ...>): Player`
    - Score all roles, find best role, get benchmark, compute `trajectoryPct` and `projectedPeak`

- [ ] Wire parser output through trajectory engine in a test script
- [ ] Sanity check: a known 16-year-old top prospect should be at 130%+; a mediocre 22-year-old should be sub-90%

---

## Phase 4 — Play Style Detection

**Goal:** Detect FM24 play style badges from attribute combinations.

- [ ] Research the FM24 play style badge conditions (from game UI or community sources)
- [ ] Create `src/lib/playStyles.ts`
  - Define `PLAY_STYLE_RULES`: each entry maps a `PlayStyle` name to its attribute thresholds
  - Implement `detectPlayStyles(attrs: Attrs): PlayStyle[]`
- [ ] Create `src/components/PlayStyleBadge.tsx`
  - Renders the appropriate icon/label for a given `PlayStyle`
- [ ] Verify a few known players produce expected badges

---

## Phase 5 — State Hook + Persistence

**Goal:** Single source of truth for all app state with localStorage persistence.

- [ ] Create `src/store/useStore.ts`
- [ ] State slices:
  - `players: Player[]` — loaded from import (session only, not persisted)
  - `saveGames: SaveGame[]` — persisted
  - `shortlists: Shortlist[]` — persisted, scoped by `saveGameId`
  - `favourites: Favourite[]` — persisted as `{ uid, saveGameId }[]` (NOT a flat uid list)
  - `geminiApiKey: string` — persisted
  - `activeSaveGameId: string | null` — persisted
- [ ] On mount: load all persisted slices from localStorage with `JSON.parse` inside try/catch
- [ ] On mutation: write updated state to localStorage, catching and `console.warn`-ing any write failures
- [ ] Expose actions:
  - `importPlayers(html: string): void` — parse + score pipeline
  - `addSaveGame / renameSaveGame / deleteSaveGame`
  - `addShortlist / renameShortlist / deleteShortlist / addPlayerToShortlist / removePlayerFromShortlist`
  - `toggleFavourite(uid, saveGameId)`
  - `setGeminiApiKey(key: string)`
  - `setActiveSaveGame(id: string)`

---

## Phase 6 — Core UI

**Goal:** File import, browsable player grid, sort/filter, player detail modal.

### UploadPanel
- [ ] Create `src/components/UploadPanel.tsx`
- [ ] File picker input (`accept=".html"`) + drag-and-drop zone
- [ ] On file select: read as text, call `importPlayers()` from store
- [ ] Show loading state during parse + score
- [ ] Show result: "Loaded 847 players" or error message
- [ ] Consider: move parse + score to a web worker to avoid blocking UI on large exports

### SortBar
- [ ] Create `src/components/SortBar.tsx`
- [ ] Toggle buttons for sort dimension: Trajectory %, Current Rating, Projected Peak
- [ ] Text input for name filter
- [ ] Emit sort/filter state up to parent (or write directly to store)

### ResultsGrid
- [ ] Create `src/components/ResultsGrid.tsx`
- [ ] Accept `players: Player[]`, apply sort + filter, paginate at 25 per page
- [ ] Each card shows: name, age, position, best role, trajectory%, projected peak, nationality, club, play style badges, copy-name button
- [ ] Clicking a card opens PlayerModal
- [ ] Pagination controls (prev/next, current page indicator)

### PlayerModal
- [ ] Create `src/components/PlayerModal.tsx`
- [ ] Full attribute display in FM24 layout style (grouped: Technical, Mental, Physical, Goalkeeping)
- [ ] Header: name, age, position, nationality, club
- [ ] Trajectory section: best role, trajectory%, projected peak, all role scores ranked
- [ ] Play style badges
- [ ] Copy-name button
- [ ] Close on backdrop click or Escape key

### App Layout
- [ ] Create `src/App.tsx`
- [ ] Tab bar: Players | Favourites | Settings
- [ ] Players tab: UploadPanel (if no players loaded) → SortBar + ResultsGrid (once loaded)
- [ ] Wire up PlayerModal overlay

---

## Phase 7 — Favourites + Shortlists + Settings

### FavouritesPanel
- [ ] Create `src/components/FavouritesPanel.tsx`
- [ ] Tabs per save game + "All" tab
- [ ] Within each tab: list shortlists, each collapsible, showing player cards
- [ ] Favourite toggle on player cards (heart icon)
- [ ] Add-to-shortlist dropdown on player cards
- [ ] Empty state when no save game selected or no favourites yet

### SettingsPanel
- [ ] Create `src/components/SettingsPanel.tsx`
- [ ] Gemini API key input (masked, with show/hide toggle)
- [ ] Save game management: add, rename, delete (delete warns it will remove associated favourites/shortlists)
- [ ] Shortlist management: create new shortlist under active save game

### App.tsx wiring
- [ ] Wire Favourites tab → FavouritesPanel
- [ ] Wire Settings tab → SettingsPanel
- [ ] Show active save game name in tab bar or header

---

## Phase 8 — Gemini AI Search

**Goal:** Natural language player search using Gemini 2.5 Flash.

- [ ] Create `src/lib/geminiSearch.ts`
- [ ] Input sanitisation: strip quotes from query, cap at 500 chars
- [ ] Pre-filter player pool before API call:
  - Sort all players by trajectory% descending
  - Take top 500
  - Where the query contains position/nation/academy hints, pre-filter further to stay within token budget
- [ ] Build prompt: include pre-filtered player data as JSON + user query
- [ ] Call Gemini 2.5 Flash with `thinkingBudget: 0` (prevents reasoning preamble truncating output)
- [ ] Extract JSON array from response using `indexOf('[')` / `lastIndexOf(']')` (handles markdown code fences)
- [ ] Wrap `JSON.parse` in try/catch; on failure return empty array with logged error
- [ ] Map returned UIDs back to `Player[]` using a pre-built `playerMap` (cache at module level, not rebuilt per call)
- [ ] Return top 10 matches

- [ ] Create `src/components/SearchBar.tsx`
  - Text input + search button
  - Loading spinner while awaiting Gemini response
  - Error state for quota exhaustion or API key missing
  - On success: pass results to ResultsGrid

- [ ] Add nationality lookup support: `src/lib/youthData.ts`
  - `NATIONALITY_COUNTRY_NAMES` map (3-letter code → country name)
  - `getNationalitySearchTerms(code): string[]` — returns code + full name for richer matching

- [ ] Wire SearchBar into App.tsx Players tab (above SortBar)
- [ ] When search results are active, show a "clear search" button to return to full list

---

## Phase 9 — Telegram Bot (Mobile Access)

**Goal:** Query saved player data from a phone via Telegram using the same pre-filter + Gemini search logic as the web app.

### Web app — Export

- [ ] Create `src/lib/exportForBot.ts`
  - Export function `exportForBot(players: Player[]): void`
  - Build compact player array keeping only: `uid`, `name`, `age`, `position`, `club`, `nationality`, `positionCategory`, `bestRole`, `bestRoleLabel`, `bestRoleScore`, `trajectoryPct`, `projectedPeak`, `playStyles`
  - Keep 7 key attrs only: `Acc`, `Pac`, `Fin`, `Pas`, `Tec`, `Str`, `Sta` (same ones used in Gemini summaries)
  - Drop: full `attrs`, all 85 `roleScores`, `personality`, `mediaHandling`, `wage`, `transferValue`, `inf`, `leftFoot`, `rightFoot`, `height`, `avgRating`
  - Trigger a JSON file download (`fm-export-<date>.json`)
- [ ] Modify `src/components/SettingsPanel.tsx`
  - Add `players: Player[]` prop
  - Add "Export for Telegram" button below the Gemini key section
  - Only render button when `players.length > 0`
  - On click: call `exportForBot(players)`
- [ ] Wire `players` prop through in `App.tsx` where `SettingsPanel` is rendered
- [ ] Manual verification: export a loaded player set, open the JSON, confirm compact shape and reasonable file size

### Bot — Setup

- [ ] Create `bot/` directory in project root
- [ ] Create `bot/package.json`
  - Dependencies: `telegraf`, `pg`, `@google/generative-ai`, `dotenv`
  - Dev dependencies: `typescript`, `ts-node`, `@types/node`, `@types/pg`
  - Scripts: `"start": "node dist/bot.js"`, `"build": "tsc"`, `"dev": "ts-node bot.ts"`
- [ ] Create `bot/tsconfig.json`
  - Target: ES2022, module: CommonJS, outDir: `dist/`, rootDir: `.`
  - Strict mode on
- [ ] Create `bot/.env.example`
  - `BOT_TOKEN=` — from @BotFather on Telegram
  - `DATABASE_URL=` — auto-set by Railway PostgreSQL plugin
  - `GEMINI_KEY=` — Gemini API key for bot searches
- [ ] Run `npm install` in `bot/`

### Bot — Storage

- [ ] Create `bot/storage.ts`
  - Connect to PostgreSQL using `DATABASE_URL` env var
  - On init: run `CREATE TABLE IF NOT EXISTS player_data (chat_id BIGINT PRIMARY KEY, players JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())`
  - Export `savePlayers(chatId: number, players: BotPlayer[]): Promise<void>` — upsert on chat_id
  - Export `loadPlayers(chatId: number): Promise<BotPlayer[] | null>` — returns null if no data yet
  - Define `BotPlayer` type: compact player shape (same fields as the export)
- [ ] Manual verification: write a small test script that saves and retrieves a dummy player array

### Bot — Search

- [ ] Create `bot/search.ts`
  - Port pre-filter logic from `src/lib/geminiSearch.ts` — copy `preFilter()` and `buildPlayerSummary()`
  - Copy nationality/nation tier helpers from `src/lib/youthData.ts` into `bot/lib/youthData.ts`
  - Adjust cap: `BOT_PLAYER_CAP = 300` (tighter than web's 500)
  - Add age pre-filter: if query includes `young|wonderkid|youth|u21|u-21` → filter to age ≤ 21 before sorting
  - Export `botSearch(query: string, players: BotPlayer[], apiKey: string): Promise<BotPlayer[]>`
  - Return top 5 results (not 30)
  - Reuse same Gemini prompt structure and JSON extraction logic (`indexOf('[')` / `lastIndexOf(']')`)

### Bot — Formatting

- [ ] Create `bot/format.ts`
  - Export `formatResults(query: string, results: BotPlayer[], preFilteredCount: number, matchedCount: number): string`
  - Header line: `🔍 <query>  (<preFilteredCount> pre-filtered, <matchedCount> matched)`
  - Each result (numbered):
    - Line 1: `<n>. *<name>* (<age>) · <position> · <club>`
    - Line 2: `   <bestRoleLabel>  <emoji><trajectoryPct>% → peak <projectedPeak>`
    - Line 3: `   Acc <x> · Pac <x> · Fin <x> · Tec <x>`
  - Trajectory emoji: 🟣 ≥120%, 🟢 ≥110%, 🟡 ≥100%, 🟠 ≥90%, 🔴 <90%
  - Export `formatNoData(): string` — message when no players loaded yet
  - Export `formatTop(players: BotPlayer[], n: number): string` — same card format, no query header

### Bot — Main

- [ ] Create `bot/bot.ts`
  - Initialise Telegraf with `BOT_TOKEN`, pg storage, dotenv
  - Call storage init (create table) on startup
  - `/start` handler — welcome message explaining the 3 commands
  - `/help` handler — list all commands with brief descriptions
  - `/upload` handler:
    - Reply "Send me your FM export JSON file"
    - Set an in-memory flag `awaitingUpload.add(chatId)`
  - Document (file) message handler:
    - If `awaitingUpload` has the chat ID: download file via Telegram file API, parse JSON, validate it has `uid`/`name`/`trajectoryPct` fields, call `savePlayers()`, reply with player count
    - Otherwise: ignore
    - Remove chat ID from `awaitingUpload` set either way
  - `/search <query>` handler:
    - Load players from DB; if null, reply with `formatNoData()`
    - Run `botSearch()`, reply with `formatResults()`
    - Handle errors: Gemini quota, missing key, empty results
  - `/top [n]` handler:
    - Load players from DB; if null, reply with `formatNoData()`
    - Parse optional `n` arg (default 10, clamp to 20)
    - Sort by trajectoryPct desc, slice, reply with `formatTop()`
  - Start bot with long-polling: `bot.launch()`
  - Graceful shutdown on SIGINT/SIGTERM
- [ ] Manual end-to-end test:
  - Set `BOT_TOKEN`, `DATABASE_URL` (local Postgres), `GEMINI_KEY` in a local `.env`
  - Run `ts-node bot.ts`
  - `/upload` → send the exported JSON → confirm player count reply
  - `/top 5` → confirm 5 players returned with correct formatting
  - `/search fast young strikers` → confirm results returned

---

## Phase 10 — Backend API (Auth + Cloud Shortlists)

**Goal:** Railway-hosted Express API with secure auth and per-user shortlist storage in PostgreSQL.

### Setup
- [ ] Create `api/` directory in project root
- [ ] `api/package.json` — dependencies: `express`, `pg`, `bcrypt`, `jsonwebtoken`, `express-rate-limit`, `cors`, `dotenv`; devDeps: `typescript`, `ts-node`, `@types/*`
- [ ] `api/tsconfig.json` — ES2022, CommonJS, strict
- [ ] `api/.env.example` — `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`

### Database
- [ ] `api/db.ts` — pg pool, `initDb()` creates all tables if not exist:
  - `users (id SERIAL PK, email TEXT UNIQUE, password_hash TEXT, telegram_chat_id BIGINT UNIQUE, created_at TIMESTAMPTZ)`
  - `refresh_tokens (id SERIAL PK, user_id INT REFS users, token_hash TEXT UNIQUE, expires_at TIMESTAMPTZ, used_at TIMESTAMPTZ)`
  - `shortlists (id SERIAL PK, user_id INT REFS users, save_game_id TEXT, name TEXT, created_at TIMESTAMPTZ)`
  - `shortlist_players (id SERIAL PK, shortlist_id INT REFS shortlists ON DELETE CASCADE, uid TEXT, player_data JSONB)`
  - `user_preferences (id SERIAL PK, user_id INT UNIQUE REFS users, preferences JSONB, updated_at TIMESTAMPTZ)`
  - `conversation_history (id SERIAL PK, user_id INT REFS users, role TEXT, content TEXT, created_at TIMESTAMPTZ)`

### Auth
- [ ] `api/auth.ts` — router mounted at `/auth`
  - `POST /register` — validate email/password, bcrypt hash (cost 12), insert user, return tokens
  - `POST /login` — verify password, issue access token (15 min JWT) + refresh token (7 days, hashed in DB)
  - `POST /refresh` — verify refresh token hash, mark used, issue new pair (rotation)
  - `POST /logout` — mark refresh token as used
- [ ] `api/middleware/auth.ts` — JWT verify middleware; attaches `req.userId`
- [ ] `api/middleware/rateLimit.ts` — strict limit on `/auth/register` and `/auth/login` (10 req/15 min per IP)

### Shortlists
- [ ] `api/shortlists.ts` — router mounted at `/shortlists`, all routes require auth middleware
  - `GET /` — return all shortlists for user (with player count)
  - `POST /` — create shortlist (`{ saveGameId, name }`)
  - `PUT /:id` — rename
  - `DELETE /:id` — delete (cascade handled by DB)
  - `POST /:id/players` — upsert player JSONB by uid
  - `DELETE /:id/players/:uid` — remove player

### Wiring
- [ ] `api/index.ts` — Express app, CORS, JSON body parser, mount routers, call `initDb()`, listen on `$PORT`
- [ ] Add Railway service for `api/` directory pointing at shared PostgreSQL
- [ ] Set `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` as Railway env vars
- [ ] End-to-end test: register → login → create shortlist → add player → refresh token → logout

---

## Phase 11 — Web App Accounts

**Goal:** Login/register UI and API-backed shortlist persistence for logged-in users.

- [ ] `src/lib/apiClient.ts` — thin fetch wrapper; reads JWT from localStorage, attaches `Authorization` header, handles 401 by attempting token refresh
- [ ] `src/components/AuthModal.tsx` — login / register tabs; email + password fields; calls API; stores access + refresh tokens in localStorage on success
- [ ] Add auth state to `useStore.ts`: `currentUser: { id, email } | null`, `login()`, `logout()`
- [ ] Header: show login button when logged out; show email + logout when logged in
- [ ] Shortlist mutations in `useStore.ts`: when logged in, call API in addition to (or instead of) localStorage; when logged out, localStorage only
- [ ] On login: fetch shortlists from API and merge with any local ones (prompt user if conflicts)
- [ ] `src/components/LinkTelegramModal.tsx` — shows a one-time 6-digit code (generated by API `POST /auth/telegram-link-code`); instructs user to send `/link <code>` to the bot
- [ ] Add "Link Telegram" button in SettingsPanel for logged-in users

---

## Phase 12 — AI Scouting Agent (Telegram)

**Goal:** Replace the current query bot with a Claude-powered scouting agent that learns user preferences over time.

### Account linking
- [ ] `api/auth.ts` — add `POST /auth/telegram-link-code` (auth required): generates a short-lived 6-digit code stored in DB against `user_id`
- [ ] Bot `/link <code>` handler: validates code against DB, writes `telegram_chat_id` onto the user row, confirms to user

### Agent core
- [ ] `bot/agent.ts` — main agent loop:
  - Load last 20 conversation turns from `conversation_history` for this user
  - Load `user_preferences` JSONB
  - Load shortlist summary (player count + top 5 by trajectory from API)
  - Call Claude claude-sonnet-4-6 with tool use (tools below)
  - Stream response back to Telegram
  - Persist user + assistant turns to `conversation_history`

### Tools
- [ ] `get_shortlist` — fetch full shortlist from API for this user
- [ ] `search_players` — query player data stored in DB (port of `bot/search.ts`)
- [ ] `update_preferences` — write structured preferences back to `user_preferences` JSONB
- [ ] `compare_players` — head-to-head attribute breakdown for 2–4 players
- [ ] `scout_recommendation` — surface top N players matching preference profile

### Commands
- [ ] `/link <code>` — connect Telegram to web account
- [ ] `/scout <query>` — invoke agent with scouting intent
- [ ] `/shortlist` — agent summarises saved players
- [ ] `/preferences` — agent reports what it has learned about user tastes
- [ ] Free-form messages — routed to agent directly
- [ ] Remove old `/search` and `/top` handlers (agent replaces them)

### Preferences schema
- [ ] Define TypeScript type for `UserPreferences`:
  ```ts
  {
    preferred_roles: string[]
    age_range: [number, number]
    min_trajectory: number
    preferred_leagues: string[]
    preferred_nationalities: string[]
    budget_notes: string
  }
  ```
- [ ] `update_preferences` tool merges partial updates into existing JSONB (no full overwrite)

---

## Phase 13 — Polish + Hardening

- [ ] Audit all `JSON.parse` calls — every one should be wrapped in try/catch
- [ ] Audit all `localStorage.setItem` calls — every one should warn on failure
- [ ] Cache `playerMap` at module level in `geminiSearch.ts` (not rebuilt on every call)
- [ ] Test on a large export (1000+ players) — check for UI blocking, scroll performance
- [ ] Test save game deletion cleans up all associated favourites and shortlists
- [ ] Test name filter is case-insensitive
- [ ] Test Gemini error states: no API key, quota exhausted, malformed response
- [ ] Responsive layout check — usable on a laptop screen at minimum
- [ ] Final review of player modal attribute layout against FM24 reference screenshots

---

## Commit Checkpoints

```
feat: phase 0 — project scaffold + types
feat: phase 1 — HTML parser
feat: phase 2 — role formula engine (85 roles)
feat: phase 3 — trajectory engine + benchmark data
feat: phase 4 — play style detection
feat: phase 5 — state hook + localStorage persistence
feat: phase 6 — core UI (upload, grid, sort bar, player modal)
feat: phase 7 — favourites panel + settings
feat: phase 8 — Gemini AI search
feat: phase 9 — Telegram bot (export + Railway bot)
feat: phase 10 — backend API (auth + cloud shortlists)
feat: phase 11 — web app accounts + API integration
feat: phase 12 — AI scouting agent (Claude-powered Telegram bot)
fix:  phase 13 — polish and hardening pass
```
