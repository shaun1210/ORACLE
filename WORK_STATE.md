# ORACLE — Work State Log

## Objective
Build and polish ORACLE, a Game of Thrones-themed productivity planner with FastAPI backend (PostgreSQL) and Vite+React frontend, with immersive CSS-generated medieval visual design replacing image-based backdrops.

## Important Details
- Pure CSS/SVG-generated backgrounds instead of image files for all panels (parchment, lava, knight backgrounds replaced with gradient/noise equivalents)
- Calendar background matches a specific reference: dark/aged brown leather with faint "Valar Morghulis" text, cinematic blood splatter, thin etched grid, heavy metallic **iron** frame studded with rivets, **bronze** house-sigil medallions, plus 3D-set dressing (stone castle + dragon top-right, dragonglass dagger + autumn leaves bottom).
- Backend switched to PostgreSQL via SQLAlchemy async + Alembic migrations.
- `maester_portrait.jpg` kept as a character avatar (not a backdrop).
- PowerShell on Windows — use `;` not `&&`.

## Status: Active — Calendar restyle to match GOT Browser UI reference (DONE, build clean)

### MAJOR CORRECTION — "realistic" actually means the reference's CLEAN DARK CSS, NOT photorealistic photos
- User was unhappy: "this design is very very bad" (my CSS-grunge + later my image-background attempt both failed).
- User pointed to `C:\Users\kenneth ornello\Downloads\Game of Thrones Browser UI.zip`.
- Extracted it to `C:\Users\kenneth ornello\Desktop\oracle\GOT_REF_UI` and read `src/App.tsx` + `src/index.css`.
- **KEY FINDING:** the reference is a Figma-exported React+Tailwind app that achieves its realism with **ZERO photographic textures** — refined dark palette + elegant fonts + subtle gradients + gold/blood glow:
  - Palette: bg `#0d0904`, panel `#120b06`, surface `#1d1208`/`#261709`, border `#4a3418`/`#2a1a08`/`#3d2810`, gold `#c9a84c` (bright `#e8c870`, dim `#7a5c28`), body `#b09060`, muted `#6a4e28`, blood `#8a1c1c`.
  - Fonts: `Cinzel`, `Cinzel Decorative`, `IM Fell English`, `MedievalSharp`.
  - Cells: `linear-gradient(135deg,#1e1208,#170e06)`, today=blood border, selected=gold-dim border, gold-glow titles. The two zip images (`image.png`,`image-1.png`) are UNUSED → realism = clean CSS.
- The "photorealistic image assets" direction was WRONG for this target; reverted it.

### Changes in `frontend/src/components/Calendar/Calendar.scss`
- Scoped reference palette as `--cal-*` vars on `.calendar-container`.
- Container: clean dark `linear-gradient(180deg,#100a05,#0d0802)` + thin gold-edged border + inner vignette. No fake texture.
- Header title: gold + gold-glow text-shadow, Cinzel, 0.3em spacing. Nav buttons ghost w/ gold hover.
- Grid/cells: reference gradients, muted borders, today=red border, selected=gold-dim, hover=warm.
- `compact-event` chips: dark translucent + blood left border + IM Fell English.
- Event form + modal: clean dark panels (removed feTurbulence noise; removed `glass-panel` parchment class from form).
- Added `IM Fell English`, `Cinzel Decorative`, `MedievalSharp` to global font `@import` (global.scss).
- Build verified clean (1429 modules).

### Open scope question
- ORACLE's OTHER panels (TodoList, HabitTracker, WarRoom, etc.) still use the light parchment + iron theme, which clashes with the new dark calendar. User only complained about the calendar. Decide: keep calendar dark-only, or roll the same dark GOT language across the whole app.

## Frontend Architecture
- Provenance in the codebase: `maester_portrait.jpg` is the only reverse-image; look for it at `frontend/public/` etc.
- Calendar visual breakdown (matches reference):
  - `.calendar-container` field: aged brown leather (multiple radial toning + base `linear-gradient` #5a3d1f→#2c1b0b + coarse grain SVG noise), faint "Valar Morghulis" ghost text + stealth subtext, ~12 blood-splatter radial layers, scorch/burn patches, warm center lantern glow.
  - Frame: `border: 14px solid transparent; border-image: linear-gradient(...iron greys...)` + `::before` rivets (18px metal studs masked to edge strips) + `::after` smoking atmosphere/vignette.
  - Grid: `.month-grid` thin etched lines, dark etched weekday header band, `z-index: 6`.
  - `CalendarMedallions.jsx`/`.scss`: bronze embossed circles (`.sigil-medallion` → `.medallion-ring` → `.medallion-face` → `.medallion-sigil`), sigils: **wolf (direwolf), dragon (three-headed), stag, lion, kraken, flames**; positioned `.med-top/left/right` with `-0/-1/-2/-3` variants; sides collapse at ≤1250px.
  - `CalendarScene.jsx`/`.scss` added: `.scene-castle-group` (StoneCastle SVG + Dragon SVG) top-right; `.scene-dagger-left` dragonglass dagger; `.scene-leaf-a/b/c/d` autumn leaves bottom; `::before/::after` smoke/mist.
  - Header/nav/add-event, cells, `.compact-event`, `.event-form`, `.event-modal` all themed to dark leather+iron (was parchment).
- Other components: RealmBackground (gradient/mist/embers/particles), TodoList, HabitTracker, WarRoom, MaesterChatbot all use CSS mixins from `_textures.scss` (`parchment-texture`, `dark-stone-panel`, `ember-glow-panel`, `banner-panel`); all `@import` migrated to `@use ... as *`.

## Backend (complete, awaiting DB)
- PostgreSQL async via SQLAlchemy + asyncpg, Alembic migrations (alembic.ini uses psycopg2 sync URL).
- Models in `backend/models/__init__.py`; schemas in `backend/schemas.py`; engine/session in `backend/database.py`; CRUD in `backend/repositories.py`; 7 routers (schedule, todos, habits, treasury, campaigns, ravens, ai).

## Verification
- `npx vite build` passes clean (1433 modules transformed).

## Next Move
1. Start PostgreSQL instance, run `alembic upgrade head`, then start backend + frontend to confirm full stack runs.
2. Optionally tune calendar scene scale/positions, blood/text opacity per user feedback.

## Relevant Recent Files
- `frontend/src/components/Calendar/Calendar.jsx` — renders `<CalendarMedallions />` + `<CalendarScene />`
- `frontend/src/components/Calendar/Calendar.scss` — leather field, iron frame, etched grid, header, cells, form, modal
- `frontend/src/components/Calendar/CalendarMedallions.jsx` + `.scss` — bronze house sigils
- `frontend/src/components/Calendar/CalendarScene.jsx` + `.scss` — castle/dragon/dagger/leaves
