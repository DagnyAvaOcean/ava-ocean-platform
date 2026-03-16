# Ava Ocean Platform — Handover Note
## Date: 16 March 2026
## Project: Ava Ocean Data Platform

---

## Owner
- **Dagny Elise Anastasiou** — Chief Impact Officer at Ava Ocean
- PhD student at NTNU (Nærings-ph.d. program, Department of Biological Sciences Ålesund)
- Focus: Environmental impact assessment of novel seabed harvesting technology in the Barents Sea
- Supervisors: Dr Snorre Bakke (NTNU), Dr Fabian Zimmerman (HI), Øystein Tvedt (AO, industry mentor)
- GitHub repo: `https://github.com/DagnyAvaOcean/ava-ocean-platform` (private)
- Deployed via **Vercel** (auto-deploys from GitHub main branch)
- Editing done **directly on GitHub** (pencil icon in browser)
- Dagny uses a **Lenovo PC** (Windows) — use Ctrl shortcuts, not Cmd
- Opens code files in **Notepad** to copy-paste content
- Limited coding experience — all instructions must be step-by-step

---

## Platform Overview

The Ava Ocean Platform is a suite of mobile-optimised web apps for data collection during fishing operations on the **Ava Ray**, a precision scallop harvester operating in Arctic waters (Bjørnøya, Kveitehola, Concordia grounds in the Barents Sea).

Each app is a **single HTML file** with inline CSS and JavaScript, using Supabase as backend. This architecture allows editing directly on GitHub and deploying via Vercel with zero build step.

| File | Purpose | Accent colour | Status |
|------|---------|---------------|--------|
| `index.html` | Landing page with 4 app cards | — | Rebuilt 16 Mar, deployed |
| `captain.html` | Captain's operational log (trips, activities, tows, bycatch) | Green `#A8E6CF` | Bug fixes 11–12 Mar, deployed |
| `research.html` | PhD research data collection (BACI study, commercial sampling) | Blue `#88C8FF` | Built 16 Mar, deployed |
| `factory.html` | Factory/processing log | Scallop/coral | Existing, untouched |
| `dashboard.html` | Management dashboard (operational) | Lime `#D9FFAC` | HTML structure fixed 16 Mar |

---

## Architecture

### Supabase
- **Project**: `hpfxkamqbsbaohrwbppa.supabase.co`
- **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZnhrYW1xYnNiYW9ocndicHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjQyOTEsImV4cCI6MjA4ODA0MDI5MX0.coiX7bWx0CiiUmuU_pRMK8pSqe38-luT30lgatJBTz8`
- **Accounts**: captain@avaocean.no, dagny@avaocean.no, management@avaocean.no

### Captain data hierarchy
`trip_registry → activity_log → tow_log → bycatch_report`

Activity types (5): `fishing`, `steaming`, `wow`, `downtime_harvester`, `downtime_factory`

Other captain tables: `factory_sample_log`, `daily_log`, `site_registry`

### Research data hierarchy
`research_session → research_transect → research_catch_sample → research_species_record / research_scallop_measurement`

Supporting tables: `species_reference`, `fishing_ground`, `control_site`, `research_video_log`, `research_size_sample`, `research_photo_log`

### Repo file structure
```
ava-ocean-platform/
├── index.html
├── captain.html
├── research.html
├── factory.html
├── dashboard.html
├── api/                                — Vercel serverless functions (AI proxy)
├── vercel.json
├── ABCFavorit-Bold.woff2               — Brand font (bold)
├── protogroteskweb-light.woff2         — Brand font (light)
├── ava-ocean-logo-mark-lime-purple-master.png
├── ava-ocean-logo-lime-purple-master-with-text....png
└── HANDOVER-NOTE-ava-ocean-platform.md
```

---

## 2026 Harvester Setup

The Ava Ray has been reconfigured for 2026 (different from 2023):

- **1 harvester** at the back of the vessel (2023 had 2 harvesters, one per side)
- **3 nozzles** suck scallops into **3 rotating filter drums**
- Scallops are pumped from drum bottoms into **1 large collection basket**
- Collection basket at 100% fill = **28 cubic metres (28,000 litres)**
- Small **sampling baskets** = **40 litres** each
- No starboard/port harvester distinction for 2026

### Commercial sampling workflow
1. Captain logs a tow in captain.html (GPS, times, harvester fill %)
2. Researcher takes a subsample — X small baskets scooped from the collection basket
3. Subsample volume = baskets × 40L (auto-calculated in research.html)
4. Total volume = harvester fill % × 28,000L (pulled from captain's tow log)
5. Extrapolation factor = total volume / subsample volume (auto-calculated)
6. Captain's tow IS the transect for commercial sessions — research.html auto-creates a transect record from the tow data

### BACI sampling workflow
1. Researcher logs own transect independently (GPS, times, conditions)
2. Collection bags draped over the harvester drums to capture all sorted fractions
3. All catch collected — no subsampling needed, extrapolation factor = 1
4. Species, scallop measurements, and environmental data recorded per transect

---

## Study Sites

Three Arctic scallop grounds south of Bjørnøya (Bear Island), Barents Sea:

| Ground | Latitude range | Longitude range | Control sites |
|--------|---------------|-----------------|---------------|
| Bjørnøya Sør | 73.94–74.37°N | 17.80–20.31°E | CS-1 to CS-10 |
| Kveitehola | 74.62–75.01°N | 18.46–20.40°E | CS-11 to CS-20 |
| Concordia | 75.13–75.75°N | 17.36–19.89°E | CS-21 to CS-30 |

- All boundary vertices and control site coordinates loaded into Supabase
- Source data: government regulation KML files

---

## research.html — Feature Summary

### Session types
- **Commercial** — subsampling from the captain's tows (auto-creates transect from tow)
- **BACI** — Before-After Control-Impact experimental design (manual transect)
- **Control** — control site sampling (manual transect)

### Tabs (6 total)
1. **Transect** — GPS, times, substrate type (sand/gravel/shell/mud/rock/mixed), epifaunal cover (barren/sparse/moderate/dense), water temp, salinity, video checkbox (harvester camera / drone / both), sampling occasion, control site picker, BACI designation (impact/control, before/after)
2. **Sample** — Commercial: pick captain's tow → shows GPS start/end, times, fill %, total volume. Auto-calculates subsample volume and extrapolation. BACI: pick transect, extrapolation = 1
3. **Species** — Searchable dropdown from species_reference table, auto-fills vulnerability & catch category, count, weight (g), portion of individual (1.0 = whole, 0.5 = half), notes. "+ New species" button adds permanently to database
4. **Scallop** — Width (mm), height (mm), growth, damage (0=none, 1=non-lethal, 2=lethal), recruitment (0/1). All fields Tab-navigable with tabindex. **Enter key saves and refocuses to width** for rapid sequential entry
5. **ROV** — Underwater drone metadata (depth, visibility, heading, transect length)
6. **Summary** — Live calculations: Shannon H', % target/bycatch, density, mean/median scallop size, % undersized (<65mm), % survival/lethal damage

### Key constants
- 1 sampling basket = 40 litres
- Harvester at 100% = 28,000 litres (28 m³)

---

## Database Tables (research)

All deployed to Supabase with RLS policies for authenticated users.

| Table | Records | Purpose |
|-------|---------|---------|
| `species_reference` | ~40 species | Master species list (20 original + 20 additional commercial/benthic) |
| `fishing_ground` | 157 vertices | Boundary polygons for 3 grounds |
| `control_site` | 30 sites × 5 vertices | Control squares with pre-calculated centres |
| `research_session` | — | Sessions (commercial/baci/control) |
| `research_transect` | — | Transects with GPS, conditions, substrate |
| `research_catch_sample` | — | Samples with subsample volumes, extrapolation |
| `research_species_record` | — | Species records per sample |
| `research_scallop_measurement` | — | Individual scallop measurements |
| `research_video_log` | — | Video/ROV metadata |
| `research_size_sample` | — | Size distribution samples |
| `research_photo_log` | — | Photo documentation (table exists, UI removed) |

### Key column names in research_transect (watch for bugs)
- GPS: `lat_start`, `lon_start`, `lat_end`, `lon_end`
- Times: `time_start`, `time_end` (NOT start_time/end_time)
- Harvester: `harvester` (NOT harvester_side)
- Substrate: `substrate_type`, `epifaunal_cover`
- Environmental: `water_temp_c`, `salinity_psu`

### SQL files used
- `research-tables-v2.sql` — main table creation, boundary data, control sites, 20 initial species
- `additional-species.sql` — 20 more commercial/benthic species

---

## captain.html — Fixes Completed (11–12 March)

1. Translation system — centralized `getActivityLabel()` and `getActivityIcon()`
2. Activity start/stop — all 5 activity types work, guard prevents double-start
3. Manual GPS entry — visible text fields when GPS fails
4. Tow saving and bycatch — graceful handling, tow list reloads after save
5. Base64 images extracted — logos replaced with external PNG files
6. Database constraint updated — `activity_log_activity_type_check` allows all 5 types

---

## dashboard.html — Structure Fixed (16 March)

Three HTML structural bugs were fixed:
1. Missing `</div>` to close `section-cpue` (line ~389)
2. Extra `</div>` closing `cpueSub-trip` that was never opened (line ~341, removed)
3. Unclosed `<a>` tag in sidebar logo area (added `</a>`)
4. Duplicate `</div><!-- end .main -->` at bottom (consolidated)

### Dashboard features (existing)
- 8 sections: Overview, CPUE & Emissions, Activities, Harvester Log, Bycatch, Tow Map, Factory, AI Insights
- AI Insights powered by Claude API via `/api/ai` serverless function
- Leaflet.js map with tow GPS tracks
- Chart.js for all visualisations
- Full bilingual NO/EN support
- Mobile responsive with hamburger menu
- CSV export for activities, tows, bycatch
- Trip filter across all sections

---

## index.html — Rebuilt (16 March)

- 7KB (down from ~200KB+ with base64 fonts)
- External font references
- 4 cards: Captain (green), Factory (scallop), Dashboard (orange), Research (blue)
- Bilingual NO/EN with localStorage persistence

---

## How to Edit and Deploy

### Edit a file on GitHub
1. Go to repo → click the file → click pencil icon (✏️)
2. Make changes
3. Write a commit message → Commit to main
4. Vercel auto-deploys in ~30–60 seconds

### Run SQL in Supabase
1. Go to app.supabase.com → SQL Editor → New query
2. Paste SQL → Click Run

### Replace a file from Claude output
1. Download the file from Claude
2. Open in Notepad → Ctrl+A → Ctrl+C
3. GitHub → click the file → pencil icon → Ctrl+A → Ctrl+V
4. Commit with a descriptive message

---

## Pending Items

### High priority
- [ ] **Test commercial tow linking end-to-end** — create a trip + tow in captain.html, then create a commercial session in research.html and verify the tow picker shows the data and sample saves correctly
- [ ] **Methodology document** — detailed writeup of what data goes where, sampling protocols, field procedures for the PhD
- [ ] **Log 2023 data** — import historical fieldwork data to validate the platform (spreadsheet available)

### Medium priority
- [ ] **Research dashboard** — separate `research-dashboard.html` for PhD data visualisation (BACI results, Shannon diversity, size distributions, species composition, control vs impact)
- [ ] **Digital caliper integration** — most USB calipers with data button emulate keyboard input, works with existing Tab/Enter navigation. Confirm model when purchased
- [ ] **R automation scripts** — pull from Supabase, run Shannon diversity, BACI analysis, size distributions, CPUE, output publication-ready figures
- [ ] **Full translation audit** — find all buttons/labels missing `data-no`/`data-en` attributes across all HTML files
- [ ] **Clean up photo JS** — savePhotoLog() and related functions still in research.html but photo tab removed

### Future phases
- [ ] **API integrations** — Fiskr (government catch reporting), Furuno GPS (NMEA), OceanSync weather station, YSI EXO2 sonde, fuel flow sensor
- [ ] **PWA/offline mode** — service worker for Arctic operations without connectivity
- [ ] **AI species detection** — Python CV model for ROV/drone footage
- [ ] **File split** — separate monolithic HTML files into .html + .css + .js

---

## Session Transcripts

Full development session transcripts stored for context continuity:

| Date | File | Topics |
|------|------|--------|
| 11 Mar | `2026-03-11-17-15-46-ava-ocean-captain-html-debug.txt` | captain.html debugging |
| 12 Mar | `2026-03-12-22-09-02-ava-ocean-platform-bugfixes.txt` | Bug fixes |
| 12 Mar | `2026-03-12-22-49-03-ava-ocean-platform-bugfixes-and-research-design.txt` | Research design |
| 16 Mar | `2026-03-16-03-49-18-ava-ocean-research-platform-build.txt` | research.html build, SQL, index.html, harvester setup, dashboard fixes |

Transcript catalog: `/mnt/transcripts/journal.txt`

---

## For a New Developer

If handing this project to a software engineer:

1. **Start here** — read this handover note
2. **Architecture** — each page is a self-contained HTML file with inline CSS/JS, talking to Supabase. No build tools, no bundler, no framework
3. **Deployment** — push to `main` branch on GitHub, Vercel auto-deploys
4. **Database** — all tables in Supabase with RLS. Use the SQL Editor for schema changes
5. **Session transcripts** — contain detailed reasoning for every design decision, available in `/mnt/transcripts/`
6. **Key gotcha** — the research_transect table uses `time_start`/`time_end` (not `start_time`/`end_time`) and `harvester` (not `harvester_side`)
7. **Testing** — test on mobile (the apps are used at sea on tablets in Arctic conditions)
8. **User** — Dagny has limited coding experience. All changes should be deployable via GitHub's web editor
