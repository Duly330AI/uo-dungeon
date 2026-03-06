# RELEASE_PLAN (FORD) — Packaging & Distribution (Web / PWA / Desktop)

## 1) Zielplattformen
Web-Browser (Chrome, Firefox, Safari), optional Desktop via Electron/Tauri (Windows, macOS, Linux).

## 2) Build‑Tooling
- **npm / yarn / pnpm** für Dependencies (`package.json`).
- **Vite**: Bundler für statische Assets (HTML, JS, CSS). Assets unter `public/` oder importiert.
- **Start‑Script**: `npm run dev` (lokal) / `npm run build` (Produktion).

## 3) Artefakte
- Statische Dateien in `dist/` (HTML, JS, CSS, Assets).
- Saves: Browser-Persistenz (`IndexedDB`, `localStorage`).
- Crash/Logs: Console Logs, optional Sentry/Telemetry.

## 4) Channels & Versionierung
- SemVer (`0.x` bis Beta). Channels: `alpha` → `beta` → `stable`. Git‑Tags treiben CI.

## 5) CI/CD (Skizze GitHub Actions)
- Matrix: `ubuntu-latest`.
- Steps: `npm install` → Lint/Tests (`Vitest`) → `npm run build` → Deploy to Vercel/Netlify/GitHub Pages.
- Optional: Desktop-Builds via Tauri/Electron für Steam/itch.io.

## 6) Milestones (Beispiel)
- **Pre‑Alpha**: Core‑Loop spielbar (1 Zone, 5 Gegner, 1 Boss, Craft T1).
- **Alpha**: 3 Zonen, Magie Kreise 1–3, Händler, Named‑Mobs, Economy‑Stub.
- **Beta**: Content‑Lock, Balancing‑Pass, Save/Load stabil, Audio Pass 2.
- **1.0**: Release‑Builds, Trailer, Store‑Seiten, Demo.

## 7) QA‑Gate
- 60 FPS Ziel; keine GC‑Spikes > 40 ms.
- 2 h Stresstest ohne Crash/Leak.
- Save/Load 20× deterministisch.
- Balance: TTK‑Spannung T1–T3, Loot‑Dichte stimmig.
