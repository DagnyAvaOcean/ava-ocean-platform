# Ava Ocean Platform — Handover Note
## Last updated: May 2026
## Session: Full platform review, admin tools, API planning, methodology

---

## Owner & Context

- **Dagny** — Chief Impact Officer at Ava Ocean, PhD student at NTNU (Industrial PhD / Nærings-ph.d.)
- PhD supervisors: Snorre (NTNU) and Fabian Zimmermann (HI / Institute of Marine Research)
- Research focus: Environmental impact of novel seabed harvesting technology in the Barents Sea
- Target species: *Chlamys islandica* (Iceland scallop)
- Field sites: Bjørnøya, Concordia, Kveithola
- Vessel: **Ava Ray** (formerly Arctic Pearl / Ava Pearl)
- Commercial research licence — vessel and operations must comply with licence conditions
- GitHub repo: `https://github.com/DagnyAvaOcean/ava-ocean-platform` (private)
- Deployed via **Vercel** (auto-deploys from GitHub main branch on every commit)
- Dagny edits files directly in GitHub web editor (pencil icon), copies code in Notepad, uses Ctrl shortcuts (Windows/Lenovo PC)
- Dagny has limited coding experience — all instructions must be step-by-step with exact find/replace snippets
- Mobile testing done on phone; bugs communicated via screenshots

---

## Platform Architecture

### Tech stack
- **Frontend**: Plain HTML files (no framework, no build tools) — functional but has scaling limitations
- **Backend/DB**: Supabase (`hpfxkamqbsbaohrwbppa.supabase.co`) — auth + PostgreSQL database
- **Deployment**: Vercel (from GitHub main branch)
- **APIs used**: Anthropic Claude API (via `/api/ai` Vercel function) for AI Insights tab

### Files in the repo
| File | Purpose |
|---|---|
| `index.html` | Home/landing page with links to all tools |
| `captain.html` | Mobile field data entry for captain at sea |
| `dashboard.html` | Operational dashboard for management (Dagny + Øystein) |
| `research-dashboard.html` | PhD research data dashboard |
| `factory.html` | Factory sample data entry |
| `methodology.html` | Scientific methodology reference page |
| `api/ai.js` | Vercel serverless function — proxies Claude API calls |
| `vercel.json` | Vercel config |
| `ABCFavorit-Bold.woff2` | Custom font |
| `protogroteskweb-light.woff2` | Custom font |
| `ava-ocean-logo-mark-lime-purple-master.png` | Logo |

### Migration plan
The plain HTML architecture works now but has real scaling limits (monolithic files, no code sharing, no type safety). Recommended path: **continue HTML through 2026 field season**, then migrate to React/Next.js with developer support (2–3 weeks) between field seasons (winter 2026/2027). Supabase stays unchanged — it's the right infrastructure choice.

---

## Database Schema (Supabase)

### Core operational tables
```
trip_registry
  id, trip_code, vessel_name, captain_name, trip_date, return_date,
  departure_port, site_id (→ site_registry), processed_meat_kg,
  trip_closed, trip_notes, is_demo (bool, default false)

activity_log
  id, trip_id (→ trip_registry), activity_type (fishing/steaming/wow/
  downtime_harvester/downtime_factory), time_start, time_end,
  fuel_start_litres, fuel_end_litres, wave_height_m, wind_speed_knots,
  wind_direction, sea_state, visibility, lat_start, lon_start,
  lat_end, lon_end, notes, is_demo

tow_log
  id, activity_id (→ activity_log), trip_id (→ trip_registry),
  tow_number, time_start, time_end, lat_start, lon_start, lat_end, lon_end,
  harvester_fill_pct, depth_m, speed_knots, notes, is_demo,
  harvester_config_id (→ harvester_config) [PENDING — not yet created]

bycatch_report
  id, tow_id (→ tow_log), trip_id (→ trip_registry),
  species_common, species_scientific, category, count_small,
  count_medium, count_large, returned_to_sea

daily_log
  id, trip_id (→ trip_registry), log_date, kg_landed,
  bycatch_brunpolse_kg, bycatch_other_kg, source ('manual'/'fangstreg'), notes
```

### Research tables
```
research_session
  id, trip_id (→ trip_registry), session_type, baci_designation
  (impact/control), before_after (before/after), date, site_id, notes

research_transect
  id, session_id (→ research_session), time_start, time_end,
  lat_start, lon_start, lat_end, lon_end, harvester (not harvester_side),
  depth_m, notes

research_catch_sample
  id, transect_id (→ research_transect), session_id, sample_code,
  baskets_total, baskets_subsample, harvester_fill_pct,
  harvester_volume_section_l, total_harvester_volume_l,
  subsample_volume_l, subsample_fraction, extrapolation_factor,
  is_subsample, basket_type, notes

research_species_record
  id, sample_id (→ research_catch_sample), species_common,
  species_scientific, category, count_subsample,
  total_count_extrapolated, damage_index_mean, notes

research_scallop_measurement
  id, sample_id (→ research_catch_sample), shell_width_mm,
  damage_index (0/1/2), is_undersized, notes

research_size_sample
  id, sample_id (→ research_catch_sample), [size measurement fields]

research_photo_log
  id, session_id, sample_id, photo_number, photo_timestamp,
  photo_type, quadrat_position, station_id, empty_shells_weight_g,
  measured_shells_weight_g, notes

research_video_log
  id, session_id, control_site_id, video_timestamp, video_type,
  duration_seconds, latitude, longitude, rov_heading,
  rov_transect_length_m, visibility, notes
```

### Reference tables
```
site_registry — field sites (Bjørnøya, Concordia, Kveithola)
factory_sample_log — factory yield, damage, population data
harvester_config — [PENDING CREATION] harvester specs per season
trip_economics — [PENDING CREATION] price inputs per trip
daily_economics — [PENDING CREATION] daily P&L entries
```

### Critical field name gotchas
- `research_transect` uses `time_start`/`time_end` (NOT `start_time`/`end_time`)
- `research_transect` uses `harvester` (NOT `harvester_side`)
- `trip_registry` uses `trip_date` (NOT `departure_date`) in Fangstreg importer
- `activity_log_activity_type_check` constraint — valid values: `fishing`, `steaming`, `wow`, `downtime_harvester`, `downtime_factory`

---

## Platform Constants (hardcoded)

| Constant | Value | Notes |
|---|---|---|
| Harvester width (2026) | 12 m | 3 nozzles × 4m each |
| Vessel basket volume (2026) | 28,000 L | One large basket on vessel |
| HFO emission factor | 3.114 kg CO₂/L | IMO standard |
| Minimum scallop size | 55 mm | Legal minimum shell width |
| Subsample basket volume | 40 L | Per subsample basket |

### Harvester configuration — PENDING DATABASE CHANGE
**The 2023 and 2026 harvesters are different and not directly comparable. This must be resolved before importing 2023 data.**

| | 2023 | 2026 |
|---|---|---|
| Setup | 2 harvesters — port + starboard | 1 harvester — stern |
| Nozzles | 4 × 2m each side = 8m per side | 3 × 4m = 12m total |
| Swept width | 16m combined | 12m |
| Basket capacity | 8,088L per unit | 28,000L vessel basket |
| Fill logging | S fill% + B fill% separately | Single fill% |
| Subsampling | One side only | From vessel basket |

SQL to create `harvester_config` table and configs was written — see session transcript. Must be run in Supabase SQL Editor before 2023 data is imported.

---

## User Accounts & Access Control

### Current accounts
| Email | Role | Access |
|---|---|---|
| `dagny@avaocean.no` | Admin / Researcher | Everything |
| `management@avaocean.no` | CEO (Øystein) | Dashboard + AI Insights |
| `captain@avaocean.no` | Captain (Robin) | Captain.html + basic dashboard |

### Access matrix (target state)
| Feature | Dagny | Øystein | Captain |
|---|---|---|---|
| captain.html | ✅ | ❌ | ✅ |
| Overview dashboard | ✅ | ✅ | ✅ |
| CPUE & Emissions | ✅ | ✅ | ❌ |
| Activities | ✅ | ✅ | ✅ |
| Harvester Log | ✅ | ✅ | ✅ |
| Bycatch | ✅ | ✅ | ❌ |
| Tow Map | ✅ | ✅ | ✅ |
| Factory | ✅ | ✅ | ❌ |
| AI Insights | ✅ | ✅ | ❌ |
| Fangstreg Import | ✅ | ❌ | ❌ |
| Economics / P&L | ✅ | ✅ | ❌ |
| Early Warning | ✅ | ✅ | ✅ |
| FIP/MSC | ✅ | ✅ | ❌ |
| Research Dashboard | ✅ | ❌ | ❌ |
| **Admin** | ✅ only | ❌ | ❌ |

Currently enforced via email checks in JS. Proper Supabase RLS + `user_roles` table is a Priority 3 task.

---

## Features Built (complete)

### captain.html
- Login with Supabase auth
- Trip selection / creation (with `is_demo` flag for training trips)
- 5 activity types: fishing, steaming, WOW, downtime_harvester, downtime_factory
- Activity start/end with fuel, weather conditions, GPS
- Manual GPS text entry as fallback (coordinates typed directly)
- Tow logging with fill slider, depth, GPS start/end, timestamps
- Bycatch logging per tow (species, category, S/M/L counts, returned to sea)
- Daily catch log screen (kg_landed per date, auto tow count)
- Trip close with metrics summary (CPUE, emissions, area swept)
- Delete tow button (with bycatch cascade)
- Demo trip toggle (🧪 badge in trip list)
- Norwegian/English toggle
- Mobile-optimised (tested on phone)

### dashboard.html
- Login with Supabase auth
- Overview tab: stat cards, charts, drill-down trip → date → tow hierarchy with Leaflet map
- CPUE & Emissions tab: per-trip metrics, tow-level CPUE table, daily summary, monthly emissions
- Activities tab: full activity log table with CSV export
- Harvester Log tab: tow table + 6 scatter/bar charts (fill vs speed, depth, sea state, duration, site, time)
- Bycatch tab: species + size charts, full table, CSV export
- Tow Map tab: Leaflet map with GPS tracks coloured by fill%
- Factory tab: yield charts, population split, damage rate, site comparison table
- AI Insights tab (Dagny + management only): anomaly detection, trip report generator, optimal conditions, free-form data query
- Fangstreg Import tab: drag-drop CSV importer for Halrapport (UTF-16, tab-separated)
- Admin tab (Dagny only): delete demo trips, delete single trip, delete single tow, delete daily log entry
- Trip filter in sidebar applies to all tabs
- Norwegian/English toggle
- Mobile responsive

### research-dashboard.html
- Login with Supabase auth (research-specific)
- Shannon Diversity H' calculation and display
- BACI design display (BI/BC/AI/AC groups)
- Species composition charts
- Size distribution histograms
- Damage index tracking
- Transect/session management
- Auto-creates transect from captain's tow data
- Auto-calculates subsample volume and extrapolation factor

### methodology.html
- Standalone reference page (no login required)
- Full formula documentation: Shannon H', BACI, Damage Index, Size Classification, CPUE (3 formulations), Catch Volume Conversion, Extrapolation Factor, CO₂ Emissions, Daily P&L
- Platform constants table
- Pending confirmation flags (density factor)
- Scrollspy navigation
- Matches platform dark design system

### Fangstreg CSV importer
- Handles UTF-16 encoding
- Parses Halrapport format (tab-separated, DD.MM.YYYY dates)
- Maps to trip by date range
- Preview table with new/update status per row
- Fangstreg data wins over manual entries on conflict
- Import result summary

---

## Known Issues & Gotchas

1. **Admin panel language switching** — some labels still English when switched to Norwegian. Fix written, not yet committed.
2. **Admin access restriction** — currently only Dagny is restricted; fix written, not yet committed.
3. **Harvester config table** — not yet created in Supabase. Critical before 2023 data import.
4. **Density factor pending** — kg/litre conversion for *Chlamys islandica* needs confirmation from Øystein. Blocks economics module.
5. **2023 historical data** — not yet imported. Blocked on harvester_config table.
6. **Daily P&L module** — designed but not built. Blocked on density factor + two new Supabase tables.
7. **monolithic HTML files** — `research-dashboard.html` is ~100KB. Editing is hard. Migration to React planned for winter 2026/2027.
8. **API secrets** — BarentsWatch client secret cannot be stored in plain HTML. Must go in Vercel `/api/` serverless functions.

---

## Prioritised Backlog

### 🔴 Priority 1 — Before field season
1. Fix Admin language switching (fix written above — 10 min)
2. Restrict Admin to Dagny only (fix written above — 10 min)
3. Create `harvester_config` table in Supabase (SQL written in session)
4. Confirm catch weight density factor with Øystein

### 🟠 Priority 2 — During field season
5. MET Norway weather auto-fill in captain.html (Locationforecast API, free, no auth)
6. BarentsWatch AIS GPS auto-fill in captain.html (needs MMSI number + BarentsWatch account)
7. Daily economics / P&L tab in dashboard.html (needs density factor first)
8. Ice map overlay in dashboard.html (MET Norway Icemap API, free, no auth)
9. Early warning system — per-site traffic lights for ice/swell/drift ice
10. Edit tow / edit activity (currently can only delete)

### 🟡 Priority 3 — After field season / winter 2026
11. FIP/MSC compliance tab in dashboard.html
12. Proper role-based access control (Supabase RLS + user_roles table)
13. 2023 historical data import (needs harvester_config first)
14. Research dashboard improvements (BACI visualisation, Shannon trends)
15. Fangstreg API integration (replace CSV import)
16. Platform migration to React/Next.js (hire developer, 2–3 weeks)

### 🔵 Priority 4 — Year 2–3 PhD
17. OBIS open data publishing (Darwin Core via Norway GBIF/IPT)
18. Seabed 2030 / GEBCO bathymetry submission
19. GOOS / OceanSITES water quality data (YSI EXO2 via ERDDAP/NetCDF)
20. Paid data API (Supabase RLS + Vercel + Stripe)
21. AI-automated management reports (Vercel cron jobs)

---

## API Integrations — Planned

| API | Purpose | Auth | Status |
|---|---|---|---|
| MET Norway Locationforecast | Wind, waves, air temp auto-fill | None needed | Ready to build |
| MET Norway Oceanforecast | Sea temp, currents | None needed | Ready to build |
| MET Norway Icemap | Barents Sea ice edge image | None needed | Ready to build |
| MET Norway Frost | Historical weather archive | Free registration | Year 2 PhD |
| BarentsWatch AIS | Vessel GPS position | OAuth2 (client_id + secret) | Needs MMSI + account |
| BarentsWatch Waveforecast | Wave height + wind | Same OAuth2 | After AIS |
| Barents-2.5 Ocean Model | High-res Barents Sea ocean data | Copernicus registration | Year 2 PhD |
| Copernicus Marine | Global ocean reanalysis | Free registration | Year 2 PhD |
| ICES Data Portal | Stock assessments, quota advice | None | Year 2 PhD |

---

## Open Data Publishing (Year 2–3)

| Target | Data type | Format | Route |
|---|---|---|---|
| OBIS | Biodiversity / species records | Darwin Core | Norway GBIF/IPT node |
| Seabed 2030 / GEBCO | Bathymetry | CSAR/BAG | DCDB portal |
| GOOS / OceanSITES | Water quality (YSI EXO2) | NetCDF + CF metadata | ERDDAP |

---

## How to Continue Work

### Editing files
1. Go to GitHub repo → click file → click pencil icon (top right)
2. Make changes using find/replace (Ctrl+H in Notepad for complex edits)
3. Commit to main branch with descriptive message
4. Vercel auto-deploys in ~30–60 seconds

### Supabase
- Dashboard: `app.supabase.com`
- SQL Editor → New query (for database changes)
- Table Editor (for viewing/checking data)
- Always verify column names before writing queries — schema mismatches are the most common bug

### Testing
- Desktop: open `https://ava-ocean-platform.vercel.app`
- Mobile: open same URL on phone (captain.html is mobile-optimised)
- Console errors: right-click → Inspect → Console tab

### Adding a new page
1. Copy structure from an existing HTML file
2. Same Supabase URL/key constants at top of script
3. Same font imports and CSS variables
4. Add link from `index.html`
5. Add to Vercel deployment (automatic — just commit to repo)
