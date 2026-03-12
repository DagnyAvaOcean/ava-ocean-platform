# Ava Ocean Platform — Handover Note (Updated)
## Date: 12 March 2026
## Project: captain.html bug fixes and improvements

---

## Owner
- **Dagny** — Chief Impact Officer at Ava Ocean
- PhD student at NTNU (Nærings-ph.d. program) focused on seabed habitat impact assessment
- GitHub repo: `https://github.com/DagnyAvaOcean/ava-ocean-platform`
- Deployed via **Vercel** (auto-deploys from GitHub main branch)
- Editing done **directly on GitHub** (pencil icon in browser)
- Dagny has limited coding experience — all instructions must be step-by-step

---

## What the Platform Does
- Mobile-optimized data collection tool for fishing trips on the **Ava Ray** (precision scallop harvester)
- Used at sea in Arctic waters (Bjørnøya, Concordia, Kveithola)
- Built as **single HTML files** with:
  - Supabase backend (auth + database)
  - Inline CSS (including base64-embedded fonts for ABCFavorit and ProtoGrotesk)
  - Inline JavaScript
  - Logos now extracted to separate PNG file

## Repo Structure
```
ava-ocean-platform/
├── api/                  (Vercel serverless functions including ai.js)
├── README.md
├── ava-ocean-logo-mark-lime-purple-master.png  (shared logo file)
├── captain.html          (main data collection tool — FIXED)
├── dashboard.html        (reporting dashboard — logos cleaned)
├── factory.html          (factory interface — logos cleaned, lang fix applied)
├── index.html            (landing page — logos cleaned)
└── vercel.json           (Vercel config)
```

## Architecture
- **Supabase project**: `hpfxkamqbsbaohrwbppa.supabase.co`
- **Supabase key**: starts with `eyJhbGciOi...` (anon key, stored in HTML)
- **Data hierarchy**: trip_registry → activity_log → tow_log → bycatch_report
- **Additional tables**: daily_log, site_registry
- **Activity types** (5 total): `fishing`, `steaming`, `wow`, `downtime_harvester`, `downtime_factory`
- **Database constraints** (on activity_log):
  - `activity_type`: must be one of the 5 types above (constraint was updated during this session)
  - `sea_state`: must be one of `calm`, `slight`, `moderate`, `rough`, `very_rough`, `high`
  - `visibility`: must be one of `good`, `moderate`, `poor`, `fog`
- **Accounts**: captain@avaocean.no, dagny@avaocean.no, management@avaocean.no

---

## All Fixes Completed This Session

### Fix 1: Translation system
- **Root cause**: `setLang()` was using `.value` for `<button>` elements, but buttons display via `.textContent`. This made ALL button translations silently fail.
- **Fix**: Changed `if(el.tagName==='INPUT'||el.tagName==='BUTTON')` to `if(el.tagName==='INPUT')` in setLang()
- **Applied to**: captain.html, factory.html (dashboard.html and index.html checked — dashboard had no tagName check, index.html needs checking)
- Created centralized `getActivityLabel()` and `getActivityIcon()` helper functions in captain.html
- "Steaming" now correctly shows as "TRANSITT" in Norwegian (was hardcoded English in HTML `data-no` attribute)
- Language switching re-renders dynamic content (activity list, banner)

### Fix 2: Activity start/stop (captain.html)
- `selectActivityType()` now handles ALL 5 activity types (was only 3: fishing/steaming/wow)
- CSS highlighting works for downtime_harvester and downtime_factory (using `sel-wow` class)
- Added guard to prevent starting a new activity while one is already running
- "End →" button appears correctly for all non-fishing activities
- **Database constraint updated** via SQL:
  ```sql
  ALTER TABLE activity_log DROP CONSTRAINT activity_log_activity_type_check;
  ALTER TABLE activity_log ADD CONSTRAINT activity_log_activity_type_check 
  CHECK (activity_type = ANY (ARRAY['fishing', 'steaming', 'wow', 'downtime_harvester', 'downtime_factory']));
  ```

### Fix 3: Manual GPS entry (captain.html)
- Hidden GPS inputs (`towLatStart`, `towLonStart`, `actLatStart`, etc.) are now dynamically converted to visible text fields
- Users can type coordinates manually as backup when GPS doesn't work
- GPS capture button still works alongside manual entry
- Placeholders show format hints (e.g., "Breddegrad (f.eks. 74.123456)")

### Fix 4: Tow saving and bycatch (captain.html)
- `towSpeed` reference now handles missing HTML element gracefully (element doesn't exist in HTML)
- After saving bycatch or skipping, tow list reloads from database
- Flow: Start fishing → Log tow → Save tow → Bycatch screen → Save/skip bycatch → Back to fishing screen → Log next tow

### Fix 5: Base64 images extracted (ALL files)
- Base64-encoded logos removed from ALL HTML files: captain.html, index.html, dashboard.html, factory.html
- Logo uploaded as separate file: `ava-ocean-logo-mark-lime-purple-master.png`
- Both `login-logo` and `header-logo` img tags now reference the PNG file directly
- File size reduced from ~1,142,436 characters to much smaller
- **Note**: Base64 fonts (ABCFavorit, ProtoGrotesk) remain embedded in CSS — this is intentional for offline reliability

---

## Known Remaining Issues

### Translation inconsistencies
- Need full audit of HTML body for buttons/labels missing `data-no` and `data-en` attributes
- The `setLang()` function works by finding elements with `data-no` attributes and swapping text
- For `<input>` and `<button>` elements it sets `.value`; for others it sets `.textContent`
- Dynamically generated content (in JavaScript) needs manual translation using `currentLang==='no'?'Norwegian':'English'` pattern

### Database constraints discovered
The activity_log table also has these check constraints:
- `sea_state`: must be one of `calm`, `slight`, `moderate`, `rough`, `very_rough`, `high`
- `visibility`: must be one of `good`, `moderate`, `poor`, `fog`

### File structure
- The file is still a single monolithic HTML file with inline CSS and JS
- Future improvement: split into `captain.html`, `captain.css`, `captain.js`
- This would make editing much easier

---

## Planned Next Features (in order)

### 1. Benthic Assessment Tab (captain.html)
- New data collection interface for Dagny's PhD fieldwork
- Needs: Dagny to share PhD methodology/proposal for data structure design
- Will be added as a new screen within captain.html

### 2. Dashboard / Reporting
- Visualize collected data meaningfully
- Trip summaries, catch statistics, environmental metrics

### 3. PWA / Offline Capability (AFTER features are built)
- Service worker for caching
- Local queue for data when offline
- Sync when connection returns
- "Pending sync" indicator for captain

---

## How to Continue Work

### To fix translations:
1. Get the full HTML content from the raw GitHub URL
2. Search for all buttons, labels, options that are missing `data-no="..."` and `data-en="..."` attributes
3. Also check JavaScript for hardcoded strings that need the `no?'Norwegian':'English'` pattern

### To fix any JavaScript bugs:
1. The JavaScript is between the second `<script>` tag and `</script>` near the end of the file
2. The first `<script>` is the Supabase library import — don't touch it
3. All app logic is in the second script block

### To edit the file:
1. Go to GitHub repo → click captain.html → click pencil icon
2. Make changes
3. Commit to main branch
4. Vercel auto-deploys in ~30-60 seconds

### Supabase access:
- Dashboard: app.supabase.com
- Use SQL Editor (open "New query" tab) for database changes
- Table Editor for viewing data directly
