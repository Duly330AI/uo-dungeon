# RELEASE_PLAN (FORD) — Packaging & Distribution (Arcade + PyInstaller)

## 1) Zielplattformen
Windows (x64), Linux (x86_64), macOS (Intel/Universal, signieren optional).

## 2) Build‑Tooling
- **Poetry** für Dependencies (`pyproject.toml`).
- **PyInstaller**: one‑folder Bundles; Assets unter `data/` & `audio/` via `--add-data` einbinden.
- **Start‑Script**: `python -m ford.main` → in `entrypoint.spec` verankern.

## 3) Artefakte
- ZIP pro OS: `FORD_v{version}_{os}.zip` – enthält `ATTRIBUTIONS.md`, `LICENSE`, `README`.
- Saves: OS‑konform (`%APPDATA%/FORD`, `~/.local/share/FORD`).
- Crash/Logs: `logs/` unter User‑Pfad.

## 4) Channels & Versionierung
- SemVer (`0.x` bis Beta). Channels: `alpha` → `beta` → `stable`. Git‑Tags treiben CI.

## 5) CI/CD (Skizze GitHub Actions)
- Matrix: `windows-latest`, `ubuntu-latest`, `macos-latest`.
- Steps: `poetry install` → Lint/Tests → PyInstaller Build → Upload Artefakte.
- Optional: Upload zu **itch.io** via `butler`. **Steam** später via `steamcmd`.

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
