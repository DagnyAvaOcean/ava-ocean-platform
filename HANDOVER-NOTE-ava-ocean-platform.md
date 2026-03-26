# Ava Ocean Platform — Handover Note
## Date: 26 March 2026
## Session: dashboard.html drill-down + research-dashboard.html build

---

## Owner
- **Dagny** — Chief Impact Officer at Ava Ocean
- PhD student at NTNU (Nærings-ph.d. program) focused on seabed habitat impact assessment
- GitHub repo: `https://github.com/DagnyAvaOcean/ava-ocean-platform`
- Deployed via **Vercel** (auto-deploys from GitHub main branch)
- Editing done **directly on GitHub** (pencil icon in browser)
- Dagny has limited coding experience — all instructions must be step-by-step with exact commit messages
- Works on **Lenovo PC (Windows)** — use Ctrl shortcuts, not Cmd

---

## Platform Overview

### Files in repo
| File | Purpose |
|---|---|
| `index.html` | Landing page — links to all tools |
| `captain.html` | Mobile data collection for captain at sea |
| `research.html` | Mobile data collection for research sessions (BACI, control, commercial) |
| `dashboard.html` | Operational dashboard — CPUE, activities, tow log, bycatch, factory, AI insights |
| `research-dashboard.html` | PhD research dashboard — BACI, diversity, size distribution, damage index |
| `factory.html` | Factory shift sample entry |
| `api/ai.js` | Vercel serverless function for Claude AI (used by dashboard.html AI Insights tab) |
| `vercel.json` | Vercel config |

### Design system (shared across all files)
- **Fonts**: ABCFavorit (bold headers) + ProtoGrotesk (body) — loaded via `@font-face` from `.woff2` files in repo root
- **Colours**: `--deep:#2C262E` bg · `--accent:#D9FFAC` lime · `--warn:#FF8C69` · `--scallop:#E6D2C5` · `--research:#88C8FF` blue (research files only)
- **Logo**: `ava-ocean-logo-mark-lime-purple-master.png` (icon only) and `ava-ocean-logo-lime-purple-master-with-text.png` (full logo, used on index)

### Infrastructure
- **Supabase**: `hpfxkamqbsbaohrwbppa.supabase.co`
- **Accounts**: `captain@avaocean.no`, `dagny@avaocean.no`, `management@avaocean.no`
- **AI tab**: only visible to `dagny@avaocean.no` and `management@avaocean.no`

---

## Database Schema (key tables)

### Operational tables
- `trip_registry` → `site_registry(site_name)` — trips with departure/return dates, processed_meat_kg, trip_closed flag
- `activity_log` → trip — 5 types: `fishing`, `steaming`, `wow`, `downtime_harvester`, `downtime_factory`
- `tow_log` → activity, trip — harvester_fill_pct, GPS start/end, depth_m, speed_knots
- `bycatch_report` → tow, trip — species counts by size (small/medium/large)
- `daily_log` → trip — kg_landed per date (manually entered by captain)
- `factory_sample_log` → trip — gram_per_muskel, andel_muskel_pct, pct_ho, pct_han, andel_skadet_pct, gj_snitt_cont_per_pound
- `site_registry` — Bjørnøya, Concordia, Kveithola

### Research tables
- `research_session` → trip — session_type (commercial/baci/control), session_date, sampling_occasion, completed_at
- `research_transect` → session — baci_designation (impact/control), before_after, GPS, substrate_type, epifaunal_cover
- `research_catch_sample` → transect, session — extrapolation_factor, subsample volumes
- `research_species_record` → sample — catch_count, catch_weight_g, total_count_extrapolated, vulnerability, catch_category
- `research_scallop_measurement` → sample — width_mm, height_mm, damage_index (0/1/2), recruitment_attached
- `research_size_sample` → sample — measured_shells_weight_g, empty_shells_weight_g, scallop_weight_g, stone_weight_g, stone_count, total_sample_weight_g
- `research_video_log` → session — video_type, GPS, depth, ROV fields
- `research_photo_log` → session/sample
- `control_site` — 30 control polygons (10 per site), columns: site_name, control_id, vertex_order, latitude, longitude, center_lat, center_lon
- `species_reference` — common_name, scientific_name, vulnerability (A–F), catch_category, is_active
- `fishing_ground` — fishing ground polygons
- `daily_summary_log` — (separate from daily_log — check which is actively used)

### Constants
- Harvester width: 12m
- Basket volume at 100%: 28,000 litres (28 m³)
- Subsample basket: 40 litres per basket
- HFO emission factor: 3.114 kg CO₂/litre

---

## What Was Built This Session

### 1. dashboard.html — Drill-down on Overview tab
The Overview tab now has a full drill-down section below the existing stat cards and charts. No existing tabs were changed.

**How the drill-down works:**
- **Trip cards** — all trips shown as clickable cards (code, site, dates, tow count, avg fill %)
- **Date table** — click a trip → see each day with: tow count, avg fill %, kg landed, harvest hours, WOW/downtime
- **Date detail** — click a date row → expands to show:
  - 6 summary stat cards (tows, avg fill, kg, harvest time, fuel, avg g/meat)
  - Full 17-column daily summary table (same as CPUE tab daily table, one row)
  - Per-tow table with track/area/CPUE calculations
- **Map** — all tows for selected trip coloured by fill % (red→amber→lime gradient). Selected date's tows highlight bright; other tows fade to 35% opacity
- **Breadcrumb** — always shows where you are in the hierarchy; click to go back up

**Key functions added:**
- `renderDrillOverview()` — renders trip cards
- `drillSelectTrip(tripId)` — drills into a trip
- `drillSelectDate(tripId, date)` — drills into a date
- `renderDrillTowDetail(tripId, date)` — renders the 17-col table + tow table
- `renderDrillMap(tripId, selectedDate)` — renders the fill-coloured map
- `fillColor(pct)` — returns rgb colour for a fill % value (red→amber→lime)
- State variables: `drillSelectedTripId`, `drillSelectedDate`, `drillMap` (separate Leaflet instance from the Tow Map tab)

### 2. research-dashboard.html — New file, PhD research dashboard
Completely new file. Same design system as dashboard.html but with blue research accent (`#88C8FF`). Full bilingual (NO/EN) with 149 translated elements.

**6 tabs:**
1. **Oversikt** — 8 PhD key metrics, 3 charts, per-site summary table
2. **BACI** — 2×2 Before/After × Impact/Control matrix, auto-calculated BACI effect (ΔImpact − ΔControl) with interpretation text, 3 charts, Leaflet map of control site polygons + impact transects
3. **Diversitet** — Shannon H' per site, vulnerability breakdown, top 10 species, full species table; filterable by site via pill tabs
4. **Størrelsesfordeling** — 10 stat cards (mean, median, SD, % undersized, recruit %, aspect ratio), size histogram (red bars below 55mm), before/after comparison, `research_size_sample` table
5. **Skadeindeks** — damage 0/1/2 breakdown, visual bar charts per site, survival/lethal rates, trend over time
6. **Bunndyr & bifangst** — bycatch-only species (excluding target), substrate + epifaunal cover from transects, frequency table

**Key calculations:**
- Shannon H' = −Σ(pi × ln(pi)) calculated from extrapolated counts
- BACI effect = (H'_after_impact − H'_before_impact) − (H'_after_control − H'_before_control)
- Size bins = 5mm width classes, coloured red if < 55mm (undersized threshold)
- Damage survival = (damage_0 + damage_1) / total × 100

**Data sources used:**
- `research_session`, `research_transect`, `research_catch_sample`, `research_species_record`, `research_scallop_measurement`, `research_size_sample`, `control_site`, `species_reference`

### 3. index.html — New card added
Added a 5th card linking to `research-dashboard.html` with the same blue research styling. Fully bilingual.

---

## What Is Still Pending

### High priority
- **AI Insights tab in research-dashboard.html** — same pattern as dashboard.html AI tab (anomaly detection, trip summary, optimal conditions, natural language query) but adapted for research data (Shannon diversity trends, species composition, damage index patterns). Tomorrow's task.

### Fangstreg CSV importer (waiting on them)
- Fangstreg responded that a proper API is on their roadmap but not available yet
- Workaround: scheduled CSV/XLSX export from their portal (Fangstrapport + Halrapport)
- **Waiting for**: sample CSV from Fangstreg so we can see exact column names
- **Plan when CSV arrives**:
  1. Add `source` column to `daily_log` table in Supabase (`'manual'` or `'fangstreg'`)
  2. Add `source = 'manual'` to `saveDailyLog()` in captain.html
  3. Build CSV drag-and-drop importer in dashboard.html (Overview or dedicated panel)
  4. Fangstreg always wins for kg_landed if both sources have same date
- SQL for source column when ready: `ALTER TABLE daily_log ADD COLUMN source text DEFAULT 'manual';`

### captain.html known issues (from previous session, still unresolved)
- Some HTML buttons/labels may still be missing `data-no` / `data-en` translation attributes — needs audit
- Activity type logging: Supabase check constraint violation was fixed, but test end-to-end on deployed version
- The `towSpeed` field does not exist in HTML (handled gracefully in JS, but could add it)

### Data to add
- 2023 historical fieldwork data needs logging to validate the platform
- Control site data uploaded (30 polygons) but no actual research session data yet for 2026

---

## How to Edit Files

### Standard workflow
1. Go to GitHub repo → click file → click pencil icon (top right)
2. Make changes
3. Scroll to bottom → "Commit changes" → commit to main branch
4. Vercel auto-deploys in ~30–60 seconds
5. Hard refresh browser (Ctrl+Shift+R) to see changes

### For large files (dashboard.html, research-dashboard.html)
- These files are large — GitHub's web editor can be slow
- Copy full file content from Claude → paste into GitHub editor → commit
- Always test on deployed Vercel URL after committing, not just locally

---

## Key Principles (for next developer or next session)

- **All files are single HTML files** — no build tools, no framework, no separate CSS/JS files
- **Supabase is the only backend** — all data in Supabase, accessed via the JS client
- **Vercel serverless function** at `api/ai.js` handles Claude API calls (keeps API key server-side)
- **Language switching**: dashboard.html and research-dashboard.html use a `setLang(lang)` function that calls `getElementById` for every translatable element — when adding new elements, always add them to `setLang()` too
- **Chart.js**: all charts use `charts[id].destroy()` before re-creating — never create a chart without destroying first
- **Leaflet maps**: each page has its own map instance variable — never initialise a map on a hidden element (causes sizing issues); always call `map.invalidateSize()` after showing
- **Start new chats every 30–40 exchanges** to manage context window

---

## For a New Developer

The platform is a set of standalone HTML files sharing a common design system and Supabase backend. There is no package.json, no build step, no node_modules. To get started:

1. Clone the GitHub repo
2. Open any HTML file in a browser — it will connect to Supabase automatically (credentials are inline in each file — this is intentional for simplicity, the Supabase anon key is safe to expose)
3. Log in with `dagny@avaocean.no` credentials (ask Dagny)
4. To make changes: edit the file, commit to main, Vercel deploys automatically

The Supabase project is `hpfxkamqbsbaohrwbppa.supabase.co`. All table schemas are visible in the Supabase dashboard under Table Editor → click a table → "Definition" tab.

The AI features in dashboard.html call `/api/ai` which is a Vercel Edge Function in `api/ai.js`. This function proxies requests to the Anthropic Claude API. The API key is stored as a Vercel environment variable (`ANTHROPIC_API_KEY`) — never hardcoded.
