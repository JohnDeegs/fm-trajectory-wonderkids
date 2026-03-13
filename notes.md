# FM Trajectory Wonderkids — Build Notes

*A post-build retrospective on what was built, how it went, and what I'd do differently.*

---

## What We Built

A pure-frontend React/TypeScript/Vite app that helps FM24 players identify wonderkids. The core idea: import the FM24 HTML scouting export, score every player across 85 role formulas, and compare each score against an age-based benchmark curve to derive a **trajectory percentage**. A player at 120%+ trajectory is on course to become world-class for their best role. No backend, no accounts — everything lives in localStorage.

Key features:
- **HTML parser** — reads FM24's scouting export table, extracts attributes and metadata
- **85 role formulas** — ported from Python source into TypeScript (roleFormulas.ts)
- **Trajectory engine** — scores each player, finds their best role, calculates trajectory% and projected peak
- **Play style detection** — identifies FM24 play style badges from attribute combinations
- **Sort/filter bar** — sort all players by trajectory, current rating, or projected peak; filter by name
- **Gemini AI search** — natural language queries ("fast young strikers from top academies") via Gemini 2.5 Flash
- **Favourites + shortlists** — save players with optional save-game isolation
- **Player detail modal** — full attribute layout in FM24 style with copy-name button

---

## The Story

### Initial Commit (Feb 26)
The first commit was massive — the entire app scaffolded in one go. The hardest part was the role formula translation: 85 formulas, each with a specific set of key/green/blue attributes and a custom divisor. These had to be transcribed faithfully from Python, with no room for off-by-one errors or wrong attribute names.

The trajectory benchmark data came from a reference image (`trajectories.png`) showing known curves for 7 roles. For the other 78 roles, we derived sensible defaults by grouping into GK/DEF/MID/ATT categories and averaging the known curves per position family. This was a pragmatic call — the alternative (manually deriving 85 curves) would have been weeks of work.

The initial app also set up:
- Favourites persisted to localStorage
- Shortlists with save game tabs
- A player modal styled after FM24's attribute layout
- Play style detection and badges

### Second Commit — Sort/Filter, Save Game Isolation, Nationality Lookup (Mar 1, 22:00)
Several interconnected issues surfaced from real usage:

**Save game isolation for favourites was broken.** The original implementation stored favourites as a flat list of UIDs with no save-game association. This meant favourites bled across all save game tabs. The fix was a separate `favouriteSaveGames` map (`uid → saveGameId`) persisted independently to localStorage.

**All players were shown capped at 50.** The initial page had a hard cap of 50 results on load. This was replaced with a paginated view showing 25 per page, with all players available sorted by trajectory descending.

**Nationality lookup was missing.** Gemini's player summaries included 3-letter nationality codes but no country names. A `NATIONALITY_COUNTRY_NAMES` lookup table was added alongside a `getNationalitySearchTerms` helper.

**Sort bar added.** A `SortBar` component gave the user control over the sort dimension (trajectory %, current rating, projected peak) and a name filter input — crucial for quickly checking a specific player.

### Third Commit — Gemini Fixes, Copy Buttons, Prefiltering (Mar 1, 23:10)
Gemini was proving unreliable in two ways:

1. **Output truncation.** The default Gemini 2.5 Flash config was using a thinking budget, which caused the model to produce a reasoning preamble that ate into the output and sometimes truncated the JSON array mid-response. Disabling the thinking budget (`thinkingBudget: 0`) fixed this immediately.

2. **JSON parsing brittleness.** Using a regex to extract the JSON array failed whenever Gemini wrapped its response in markdown code fences. Replacing with `indexOf('[') / lastIndexOf(']')` made it robust to any surrounding text.

**Player pool size.** Sending all players to Gemini was hitting the free-tier token limits. The fix was to cap the pool at 500 players pre-sorted by trajectory% (the most relevant ones) and to pre-filter by position category, nation tier, and academy quality before the API call. This cut token usage dramatically while improving search quality.

**Copy buttons** were added to player cards and the modal — small but frequently needed when cross-referencing in FM.

### Fourth Commit — Security and Performance (Mar 1, 23:22)
A cleanup pass before merging:
- `try-catch` around all `JSON.parse` calls for Gemini responses
- `playerMap` cached at module level (previously rebuilt on every search call — O(n) allocation per query)
- User query sanitised: quotes stripped, capped at 500 chars to reduce prompt injection surface
- `localStorage.setItem` failures surfaced with `console.warn` instead of silent swallow

### Phase 9 — Telegram Bot (Mar 13)
**Status: fully implemented, not yet end-to-end tested against live Telegram/Railway.**

**Web app changes:**
- `src/lib/exportForBot.ts` — `exportForBot(players)` builds a compact `BotPlayer[]` (pre-computed trajectory fields + 7 key attrs only) and triggers a JSON download. The 7 attrs kept (`Acc`, `Pac`, `Fin`, `Pas`, `Tec`, `Str`, `Sta`) are exactly those used in `buildPlayerSummary()` in `geminiSearch.ts` — not arbitrary, they're the Gemini context attrs.
- `src/components/SettingsPanel.tsx` — "Export for Telegram Bot" button added, only shown when players are loaded.
- `src/App.tsx` — `players` prop wired through to SettingsPanel.

**Bot (`bot/`):**
- `storage.ts` — PostgreSQL via `pg`; `player_data` table (chat_id → JSONB); `savePlayers` / `loadPlayers` with upsert.
- `search.ts` — port of `geminiSearch.ts` with cap 300, age ≤ 21 pre-filter for youth queries, returns top 5.
- `format.ts` — Telegram markdown formatting; trajectory tier emojis 🟣🟢🟡🟠🔴.
- `bot.ts` — Telegraf long-polling; `/start`, `/help`, `/upload`, `/search`, `/top` commands; in-memory `awaitingUpload` set.
- `package.json` / `tsconfig.json` / `.env.example` — standalone Node.js service.

**Next step:** Manual end-to-end test (requires `BOT_TOKEN`, `DATABASE_URL`, `GEMINI_KEY` in `bot/.env`), then Phase 10 polish.

---

## What Went Well

**The role formula port was solid.** Getting 85 formulas right in one pass, then verifying the outputs looked reasonable against known player data, was satisfying. The formula structure is consistent enough that a pattern emerged quickly.

**localStorage as the only persistence layer kept things simple.** No auth, no backend, no deployment complexity. Everything is local to the user's browser, which is appropriate for a tool that works with personal save data.

**Gemini as a search layer was a good call.** Natural language queries over 500 pre-scored players is genuinely useful and hard to replicate with a traditional filter UI. The pre-filtering step to reduce token usage was the key insight that made it reliable on the free tier.

**The trajectory% concept translates well.** It's intuitive — over 100% means ahead of pace, under means behind. Users can immediately grasp why a 16-year-old at 140% is more exciting than a 19-year-old at 95%.

---

## What Didn't Go Well

**Save game isolation was an afterthought.** The original favourites model didn't account for the fact that a player's scouted data is save-specific. Having to retrofit a `favouriteSaveGames` join map was messier than designing it correctly upfront. The data model should have included save game context from the start.

**The trajectory benchmark data is sparse.** We only have confirmed curves for 7 out of 85 roles. The rest use category-averaged fallbacks. For roles that diverge significantly from the category average (e.g. a GK-specific outfield role, or a highly physical attacker vs. a technical one), the trajectory% can be misleading. Ideally each role would have its own curve.

**Gemini reliability was unpredictable.** The thinking budget issue wasn't obvious until we hit it. More generally, building on a free-tier AI API means you're one quota exhaustion or model update away from a broken feature. The pre-filter + cap helps, but it's inherently fragile.

**No tests.** Everything was developed iteratively against the live app. A test for the HTML parser (given a known export, expect known player attributes) and for the role formula engine (given known attributes, expect known scores) would have caught regressions much faster and made the formula port more verifiable.

**The initial commit was too large.** Everything in one go made it hard to bisect if something was wrong. Features should have been staged more incrementally, even for a solo build.

---

## What I'd Do Differently

1. **Design the data model first.** Sketch out `Player`, `SaveGame`, `Favourite` and their relationships before writing a line of UI. The save game isolation bug would have been caught at design time.

2. **Port role formulas with tests.** Write a small test harness that runs each formula against a player with known scores and asserts the output. Would have made the formula transcription faster and safer.

3. **Trajectory curves per role from the start.** Even rough per-role curves (GK, WB, CB, CM, AM, ST subtypes) would be more accurate than four blunt category averages. The benchmark table in `trajectories.png` is the single weakest link in the whole system.

4. **Commit smaller.** Each logical chunk (parser, formulas, trajectory engine, UI components) should have been its own commit. The initial commit was effectively the whole app.

5. **Abstract the Gemini layer behind a search interface.** The `geminiSearch` function is directly called from the UI. If you wanted to swap it for a different model or a local embedding search, you'd need to touch multiple files. A thin `search(query, players): Player[]` interface would decouple it.

6. **Consider a web worker for the parse + score step.** Parsing and scoring a large HTML export (thousands of players) blocks the main thread. Moving it to a worker would keep the UI responsive during import.

---

## Architecture at a Glance

```
src/
  lib/
    parseHtml.ts        — DOM-based parser for FM24 HTML export
    roleFormulas.ts     — 85 role scoring formulas
    calculateTrajectory.ts — trajectory%, projected peak, position category, play styles
    trajectoryData.ts   — benchmark age curves (7 known roles + category defaults)
    playStyles.ts       — play style detection logic
    youthData.ts        — nation youth ratings, academy tiers, nationality lookup
    geminiSearch.ts     — Gemini API search (pre-filter → prompt → parse → return players)
    exportForBot.ts     — compact BotPlayer[] JSON download for Telegram bot
  components/
    UploadPanel.tsx     — file import UI
    SortBar.tsx         — sort + name filter bar
    SearchBar.tsx       — Gemini AI search input
    ResultsGrid.tsx     — paginated player card grid
    PlayerModal.tsx     — full player detail modal
    FavouritesPanel.tsx — favourites + shortlists, save game tabs
    SettingsPanel.tsx   — Gemini API key, save game management, bot export button
    PlayStyleBadge.tsx  — play style icon badge
  store/
    useStore.ts         — all state + localStorage persistence (single custom hook)
  __tests__/            — Vitest tests for phases 1–5, 8
  App.tsx               — layout, tab routing, import → score pipeline
  types.ts              — Player, Attrs, Shortlist, SaveGame, PlayStyle types
bot/
  bot.ts                — Telegraf entry point; /start /help /upload /search /top handlers
  storage.ts            — PostgreSQL via pg; player_data table (chat_id → JSONB)
  search.ts             — port of geminiSearch.ts; cap 300, top 5, youth age filter
  format.ts             — Telegram markdown formatter; trajectory tier emojis
  package.json          — standalone Node service (telegraf, pg, @google/generative-ai)
  tsconfig.json         — ES2022, CommonJS, strict
  .env.example          — BOT_TOKEN, DATABASE_URL, GEMINI_KEY
```

The entire app state lives in one custom hook (`useStore`). For this scope that's fine, but if features grew significantly it would benefit from being split.

---

*Written March 2026.*
