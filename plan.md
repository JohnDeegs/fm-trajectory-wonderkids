# FM Trajectory Wonderkids — Project Plan

*A tool for FM24 players to identify wonderkids by calculating trajectory percentages from scouting exports.*

---

## Goal

Import an FM24 HTML scouting export, score every player across 85 role formulas, and compare each score against an age-based benchmark curve to derive a **trajectory percentage**. Players at 110–120%+ trajectory are on pace to become world-class for their best role.

No backend. No accounts. Everything in localStorage.

*Phase 9 extends this with a Railway-hosted Telegram bot for mobile access.*

---

## Data Model (design first)

Before writing any UI, define the core types:

```ts
Player {
  uid: string
  name: string
  age: number
  nationality: string
  position: string
  club: string
  attrs: Attrs          // 40 attributes keyed by short name
  bestRole: string
  bestScore: number
  trajectoryPct: number
  projectedPeak: number
  positionCategory: 'GK' | 'DEF' | 'MID' | 'ATT'
  playStyles: PlayStyle[]
}

SaveGame {
  id: string
  name: string
}

Shortlist {
  id: string
  saveGameId: string
  name: string
  playerUids: string[]
}

Favourite {
  uid: string
  saveGameId: string    // favourites are save-game scoped
}
```

Getting `Favourite` right upfront avoids the retrofit pain of a flat uid list bleeding across save games.

---

## Phases

### Phase 1 — HTML Parser

Parse FM24's HTML scouting export into `Player[]`.

- DOM-based parser (DOMParser API, no dependencies)
- Column order is fixed — map by index, not by header name search
- Column layout: Reg, Inf, Name, Age, Wage, Transfer Value, Nat, 2nd Nat, Position, Personality, Media Handling, Av Rat, Left Foot, Right Foot, Height, then 40 attributes alphabetically
- Age is an integer
- Extract UID from the penultimate column
- Return raw attribute objects; scoring happens separately

Verification: parse `example_html_export.html`, assert known player names and attribute values match.

### Phase 2 — Role Formula Engine

Port 85 role scoring formulas from `calculate_role_score.txt` (Python) to TypeScript.

Formula pattern:
```
score = ((key_attrs_sum × 5) + (green_attrs_sum × 3) + (blue_attrs_sum × 1)) / divisor
```

- One entry per role: `{ key: string[], green: string[], blue: string[], divisor: number }`
- `scoreAllRoles(attrs)` → `Record<roleName, number>`
- `getBestRole(attrs)` → `{ role, score }`

Verification: for a player with known scores, assert formula outputs match expected values.

### Phase 3 — Trajectory Engine

Convert role scores into trajectory percentages using age-based benchmark curves.

Benchmark data from `trajectories.png` — 7 known roles with full age curves:
- `skd`, `wbs`, `bpdd`, `sva`, `b2bs`, `ifa`, `afa`

For the remaining 78 roles, use category-averaged fallbacks:
- GK → skd curve
- DEF → avg(wbs, bpdd)
- MID → avg(sva, b2bs)
- ATT → avg(ifa, afa)

```
trajectoryPct = (playerScore / benchmarkAtAge) × 100
projectedPeak = trajectoryPct × plateauValueForRole
```

Plateau values: GK ~13.5, DEF ~13.45, MID ~13.55, ATT ~14.5

Output per player: `trajectoryPct`, `projectedPeak`, `bestRole`, `positionCategory`.

### Phase 4 — Play Style Detection

Detect FM24 play style badges from attribute combinations.

- Each play style maps to a threshold condition across 2–4 attributes
- `detectPlayStyles(attrs): PlayStyle[]`
- Badge component renders the icon per detected style

### Phase 5 — State + Persistence

Single custom hook `useStore` managing all app state with localStorage persistence.

- Players loaded from import (session only — not persisted)
- Save games: `SaveGame[]`
- Shortlists: `Shortlist[]` (save-game scoped)
- Favourites: `{ uid, saveGameId }[]` (save-game scoped — **not** a flat uid list)
- Gemini API key
- Active save game selection

Wrap all `localStorage.setItem` in try/catch and warn on failure.

### Phase 6 — Core UI

Build the main layout and player browsing experience.

**UploadPanel** — drag/drop or file picker for the HTML export; triggers parse → score → store pipeline. Consider a web worker to avoid blocking the main thread on large exports.

**ResultsGrid** — paginated player card grid (25 per page), default sorted by trajectory% descending. Each card shows: name, age, best role, trajectory%, projected peak, nationality, play style badges, copy-name button.

**SortBar** — sort dimension toggle (trajectory%, current rating, projected peak) + name filter input.

**PlayerModal** — full player detail on click. FM24-style attribute layout grouped by category (Technical, Mental, Physical, Goalkeeping). Copy-name button.

### Phase 7 — Favourites + Shortlists

**FavouritesPanel** — tabbed by save game. Each tab shows favourited players for that save. Players can be added to named shortlists within a save game. Removing a save game removes its associated favourites and shortlists.

**SettingsPanel** — Gemini API key input, save game CRUD.

### Phase 8 — Gemini AI Search

Natural language search over the scored player pool via Gemini 2.5 Flash.

Pre-processing before the API call:
1. Cap pool at 500 players, sorted by trajectory% (most relevant first)
2. Pre-filter by position category, nation tier, and academy quality where detectable from the query
3. Sanitise the user query: strip quotes, cap at 500 chars

API call:
- `thinkingBudget: 0` — avoids reasoning preamble eating into output
- Response extraction: `indexOf('[')` / `lastIndexOf(']')` — robust to markdown code fences
- Wrap JSON.parse in try/catch

Return top 10 matching players from the pool.

**SearchBar** component triggers search, shows loading state, renders results in the main grid.

### Phase 9 — Telegram Bot (Mobile Access)

Query saved player data from a phone via Telegram, without needing to be at the computer.

**Architecture:**
```
Web app → "Export for Telegram" button → compact JSON download
User sends JSON file to Telegram bot → stored in Railway PostgreSQL (per chat ID)
User sends query → bot pre-filters → Gemini search → formatted results on phone
```

**Web app changes (`src/`):**

`src/lib/exportForBot.ts` — builds a compact player export, stripping fields the bot doesn't need:
- Keep: `uid`, `name`, `age`, `position`, `club`, `nationality`, `positionCategory`, `bestRole`, `bestRoleLabel`, `bestRoleScore`, `trajectoryPct`, `projectedPeak`, `playStyles`
- Keep 7 key attrs only: `Acc`, `Pac`, `Fin`, `Pas`, `Tec`, `Str`, `Sta`
- Drop: full `attrs`, all 85 `roleScores`, metadata fields
- Reduces ~50MB full export to ~7MB for 50k players

`src/components/SettingsPanel.tsx` — add "Export for Telegram" button, shown only when players are loaded.

**Bot (`bot/`):**

```
bot/
  bot.ts       — Telegraf setup, command handlers
  search.ts    — pre-filter + Gemini (ported from geminiSearch.ts)
  storage.ts   — PostgreSQL store/load per chat ID
  format.ts    — format results as Telegram messages
  package.json — telegraf, pg, @google/generative-ai
  tsconfig.json
  .env.example — BOT_TOKEN, DATABASE_URL, GEMINI_KEY
```

Commands:
- `/start` — welcome + instructions
- `/upload` — prompt to send the exported JSON file
- `/search <query>` — natural language search via Gemini
- `/top [n]` — top N players by trajectory% (default 10, max 20)
- `/help` — list commands

Storage: single PostgreSQL table, one row per chat ID with players as JSONB.

Search differences from web version:
- Tighter Gemini cap: 300 players (vs 500) — handles large datasets on free tier
- Age pre-filter: queries containing "young/wonderkid/youth/U21" → age ≤ 21
- Returns top 5 results (phone-appropriate, not 30)

Result format:
```
🔍 fast young strikers (47 pre-filtered, 12 matched)

1. Lamine Yamal (16) · AMR · Barcelona 🇪🇸
   Inside Forward Att  🟣 142% → peak 15.3
   Acc 18 · Pac 17 · Fin 14 · Tec 15
```
Trajectory tiers: 🟣 ≥120% · 🟢 ≥110% · 🟡 ≥100% · 🟠 ≥90% · 🔴 <90%

**Railway deployment:**
- Node.js service from `bot/` directory
- Railway PostgreSQL plugin (DATABASE_URL auto-injected)
- Long-polling (no webhook URL config needed)
- `GEMINI_KEY` set as Railway env var (single shared key for personal bot)

---

## Commit Strategy

Each phase above should be its own commit. Don't batch everything into an initial commit — it makes bisecting much harder.

```
feat: phase 1 — HTML parser
feat: phase 2 — role formula engine
feat: phase 3 — trajectory engine + benchmark data
feat: phase 4 — play style detection
feat: phase 5 — state hook + localStorage persistence
feat: phase 6 — core UI (upload, results grid, sort bar, player modal)
feat: phase 7 — favourites panel + settings
feat: phase 8 — Gemini AI search
feat: phase 9 — Telegram bot (export + Railway bot)
```

---

## Things to Get Right Upfront

- **`Favourite` must carry `saveGameId`** — a flat uid list bleeds across saves
- **`thinkingBudget: 0` for Gemini** — thinking preamble truncates JSON output
- **JSON extraction by bracket index, not regex** — handles markdown-wrapped responses
- **Web worker for import pipeline** — parse + score on a large export blocks the UI
- **Sanitise Gemini input** — strip quotes and cap length to reduce prompt injection surface

---

### Phase 10 — Backend API (Auth + Cloud Shortlists)

Railway-hosted Express + TypeScript API service. Shared PostgreSQL with the bot.

**Auth:**
- `POST /auth/register` — email + password (bcrypt, cost 12)
- `POST /auth/login` — returns short-lived JWT access token (15 min) + refresh token (7 days)
- `POST /auth/refresh` — rotate refresh token (single-use, stored in DB)
- `POST /auth/logout` — invalidate refresh token
- Rate limiting on all auth endpoints

**Shortlists:**
- `GET /shortlists` — all shortlists for authenticated user
- `POST /shortlists` — create shortlist
- `PUT /shortlists/:id` — rename
- `DELETE /shortlists/:id` — delete + cascade players
- `POST /shortlists/:id/players` — add player (full `Player` JSON stored as JSONB)
- `DELETE /shortlists/:id/players/:uid` — remove player

**Schema:**
```sql
users (id, email, password_hash, telegram_chat_id, created_at)
refresh_tokens (id, user_id, token_hash, expires_at, used_at)
shortlists (id, user_id, save_game_id, name, created_at)
shortlist_players (id, shortlist_id, uid, player_data JSONB)
user_preferences (id, user_id, preferences JSONB, updated_at)
conversation_history (id, user_id, role, content, created_at)
```

Deployed as a second Railway service pointing at the shared PostgreSQL instance.

### Phase 11 — Web App Accounts

Add login/register UI and replace localStorage shortlist calls with API calls.

- Login/register modal (email + password)
- JWT stored in `localStorage`; attached as `Authorization: Bearer` header on all API calls
- Shortlist reads/writes go to API when logged in; fall back to localStorage when not
- "Link Telegram" flow — generates a one-time code the user sends to the bot to connect accounts

### Phase 12 — AI Scouting Agent (Telegram)

Replace the current query-and-respond bot with a Claude-powered scouting agent. Users link their Telegram account to their web account via `/link <code>`.

**Agent architecture:**
- Each message loads: last N conversation turns from DB + user preferences + shortlist summary
- Claude claude-sonnet-4-6 with tool use
- Tools:
  - `get_shortlist` — fetch user's saved players from API
  - `search_players` — query uploaded player data
  - `update_preferences` — write learned preferences back to `user_preferences`
  - `compare_players` — head-to-head attribute comparison
  - `scout_recommendation` — proactively surface players matching preference profile
- Conversation history persisted in `conversation_history` table → memory across sessions
- Preferences stored as structured JSONB, updated by the agent as it learns:
  ```json
  {
    "preferred_roles": ["Pressing Forward"],
    "age_range": [16, 21],
    "min_trajectory": 110,
    "preferred_leagues": ["Premier League"]
  }
  ```

**Commands:**
- `/link <code>` — connect Telegram to web account
- `/scout <query>` — agent responds with scouting recommendations
- `/shortlist` — summarise saved players
- `/preferences` — show what the agent has learned about your tastes
- All other messages — free-form conversation with the agent

---

## Out of Scope (MVP)

- Per-role trajectory curves (78 roles use category fallbacks — acceptable for MVP)
- ~~Tests (would add confidence to the formula port; worth adding in a follow-up)~~
- ~~Backend / accounts / cloud sync~~ (addressed in Phases 10–11)
- Multi-game comparison views
