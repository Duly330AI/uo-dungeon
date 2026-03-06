# FORD - Development Roadmap (Web Edition)

**Stand:** 2026-03-06
**Projekt:** FORD (Single-Player 2D-Dungeon-Crawler)
**Tech-Stack:** React, Vite, TypeScript, HTML5 Canvas/WebGL, Web Audio API

> **Hinweis zur Architektur:** Die ursprünglichen Design-Dokumente (`.md`) wurden für Python + Arcade konzipiert. Da das Projekt nun in einer modernen Web-Umgebung (React/TS) entwickelt wird, adaptieren wir die Kernprinzipien (strikte Trennung von Logik und Präsentation, Datengetriebenheit, Determinismus) für den Browser. Die neu hinzugefügten **Kenney-Assets** (Spritesheets & Audio) werden nativ über Canvas und Web Audio eingebunden.

---

## 🗺️ Übersicht der Meilensteine

1. **Milestone 1: Core Engine & Exploration** (Pre-Alpha 1)
   *Exit-Kriterium: Spieler kann sich auf einer generierten Map bewegen, Kollisionen und Sichtlinien (Fog of War) funktionieren.*
2. **Milestone 2: Combat System & AI** (Pre-Alpha 2)
   *Exit-Kriterium: 1v3 Combat läuft stabil, AI wählt Ziele/Taktiken, Replay ist seed-stable.*
3. **Milestone 3: RPG Progression & Skills** (Alpha 1)
   *Exit-Kriterium: Skills steigen bei Nutzung (0.1-Gains), UI zeigt Paperdoll und Skill-Locks.*
4. **Milestone 4: Itemization, Loot & Inventory** (Alpha 2)
   *Exit-Kriterium: Gegner droppen Loot, Items können im Grid-Inventar verwaltet und ausgerüstet werden.*
5. **Milestone 5: Crafting, Nodes & Economy** (Beta 1)
   *Exit-Kriterium: Spieler kann Ressourcen abbauen, Items craften und bei Händlern kaufen/verkaufen.*
6. **Milestone 6: Save/Load, Polish & Release** (1.0)
   *Exit-Kriterium: Spiel kann jederzeit gespeichert/geladen werden, 60 FPS stabil, keine Memory Leaks.*

---

## 🟢 Milestone 1: Core Engine & Exploration (Pre-Alpha 1)
*Fokus: Die Welt wird generiert, gezeichnet und ist begehbar.*

*   **Game Loop & State Management:**
    *   Aufbau eines deterministischen, rundenbasierten Game-Loops in TypeScript (unabhängig von React-Render-Zyklen).
    *   Zustandsverwaltung (z.B. mit Zustand oder React Context) für die UI-Anbindung.
*   **Dungeon Generator (`DUNGEON_GENERATOR.md`):**
    *   Implementierung des BSP-Algorithmus (Binary Space Partitioning) zur Raum- und Korridorgenerierung.
    *   Zuweisung von Biomen und Raum-Tags.
*   **Rendering (Canvas):**
    *   Einbinden der Kenney Spritesheets (`roguelikeSheet_transparent.png`, `roguelikeDungeon_transparent.png`).
    *   Pixel-Perfect Rendering (16x16 Tiles, hochskaliert).
    *   Kamera-System, das dem Spieler folgt.
*   **Bewegung & Sicht:**
    *   Grid-basierte 8-Wege-Bewegung (WASD/Pfeiltasten).
    *   Kollisionsabfrage gegen Wände (`WALL`-Tiles).
    *   Line of Sight (Bresenham-Algorithmus) & Fog of War.
*   **Audio-Grundgerüst:**
    *   Einrichten des Web Audio Managers.
    *   Einbinden der Kenney Schritt-Sounds (`footstep00.ogg` - `footstep09.ogg`).

## 🟡 Milestone 2: Combat System & AI (Pre-Alpha 2)
*Fokus: Der rundenbasierte Kampf nach UO-Regeln funktioniert.*

*   **Combat Engine (`COMBAT_RULES.md`):**
    *   Implementierung der Formeln für Hit Chance, Parry, Damage und Recovery.
    *   Dodge-Mechanik (Dash + Evade-Bonus).
*   **Encounter & Initiative:**
    *   Wechsel in den Combat-Modus bei Sichtkontakt (Encounter-Bubble).
    *   Initiative-Wurf (basierend auf DEX, STAM und Waffe) und Runden-Queue.
*   **Gegner-KI (`AI_DESIGN.md`):**
    *   Utility-AI System (Scoring-basiert).
    *   Verhaltensmuster: Melee (ranlaufen, angreifen), Ranged (Kiten), Caster.
    *   Threat-Memory und Zielwahl.
*   **Kampf-Feedback:**
    *   Einbinden der Kenney Combat-Sounds (`drawKnife.ogg`, `knifeSlice.ogg`, `chop.ogg`).
    *   Visuelles Feedback (Schadenszahlen, Screen-Shake, Hit-Flashes).
    *   Combat-Log im UI (Journal).

## 🟠 Milestone 3: RPG Progression & Skills (Alpha 1)
*Fokus: Der Charakter wächst durch Nutzung seiner Fähigkeiten (Ultima Online Style).*

*   **Skill-System (`GAMEPLAY.md` & `UI_SPEC_UO_STYLE.md`):**
    *   Laden der `skills.json` und `progression_rules.json`.
    *   Implementierung der 0.1-Skill-Gains bei Nutzung (Sweet-Spot Mechanik).
    *   Stat-Gains (STR, DEX, INT, STAM) gekoppelt an Skill-Affinitäten.
*   **Magie-System (`MAGIC_SYSTEM.md`):**
    *   Zauberbuch (Spells aus `spells.json`).
    *   Mana-Kosten, Reagenzien-Verbrauch, Cast-Runden.
    *   Fizzle-Mechanik (abhängig vom Magery-Skill).
*   **UI-Erweiterungen:**
    *   Paperdoll & Stats-Panel (Taste C).
    *   Skill-Fenster mit Locks (Up/Down/Lock) (Taste K).
    *   Hotbar (1-0) für Spells und Aktionen.

## 🔴 Milestone 4: Itemization, Loot & Inventory (Alpha 2)
*Fokus: Looten, Ausrüsten und Inventar-Management.*

*   **Inventar-System:**
    *   Grid-basiertes Inventar mit Stacks, Split- und Merge-Funktionen.
    *   Gewichtsberechnung (Encumbrance).
*   **Ausrüstung (Equipment):**
    *   Slots (Waffe, Offhand, Rüstung, Accessoires).
    *   Dynamische Stat-Aggregation (Basis + Equip + Skills).
*   **Loot & Affixe (`ITEMIZATION_DESIGN.md`):**
    *   Loot-Tabellen für Monster-Drops und Truhen.
    *   Affix-Generator (Prefix/Suffix) für Raritäten (Common bis Legendary).
*   **UI & Audio:**
    *   Datengetriebene Tooltips (Schaden, Delay, Resistenzen).
    *   Kenney UI-Sounds (`click.ogg`, `rollover.ogg`, `switch.ogg`) für Drag & Drop.
    *   Kenney Item-Sounds (`handleCoins.ogg`, `cloth.ogg`, `metalPot.ogg`).

## 🟣 Milestone 5: Crafting, Nodes & Economy (Beta 1)
*Fokus: Die Welt bietet Ressourcen und eine funktionierende Wirtschaft.*

*   **Gathering (Nodes):**
    *   Spawnen von Erzadern, Bäumen und Kräutern im Dungeon.
    *   Interaktion (Taste E) mit Tool- und Skill-Checks.
    *   Depletion und rundenbasierter Respawn.
*   **Crafting-System:**
    *   Crafting-Stationen (Forge, Alchemy).
    *   Rezept-System (`recipes.json`) mit Erfolgs-/Fail-Chancen.
    *   Rundenbasierte Crafting-Queue.
*   **Händler & Ökonomie (`ECONOMY_AND_VENDORS.md`):**
    *   NPC-Vendors mit dynamischen Inventaren und Restock-Timern.
    *   Buy/Sell-Spread basierend auf Item-Rarität und Qualität.
    *   Gold als Währung.
    *   *Hinweis:* `data/vendors.json` und `data/biomes.json` werden in diesem Milestone als minimale Datenbasis angelegt.

## 🔵 Milestone 6: Save/Load, Polish & Release (1.0)
*Fokus: Persistenz, Feinschliff und Stabilität.*

*   **Save/Load System (`SAVELOAD.md`):**
    *   Serialisierung des kompletten Game-States (Player, World, RNG-Seeds, Queues).
    *   Speichern in `localStorage` oder IndexedDB (Web-kompatibel).
    *   Autosave-Trigger (Raumwechsel, Elite-Kill).
*   **Balancing-Pass:**
    *   Feinabstimmung der `combat_rules.json`, `balance.json` und Drop-Raten.
    *   Sicherstellen der TTK (Time to Kill) und des Skill-Gain-Tempos.
*   **Audio & Visual Polish:**
    *   Abmischen aller Kenney-Sounds (Lautstärke, Panning, Variationen).
    *   Partikeleffekte für Magie und Treffer.
*   **QA & Testing:**
    *   Beheben von Memory Leaks im Canvas-Rendering.
    *   Sicherstellen der 60 FPS Zielvorgabe.
    *   Testen der Save-Game Integrität.

---

## 🛠️ Nächste unmittelbare Schritte (Action Items)

1.  **Projekt-Setup bereinigen:** Sicherstellen, dass Vite, React und Tailwind korrekt für ein Fullscreen-Canvas-Game konfiguriert sind.
2.  **Asset-Pipeline:** Die Kenney-Spritesheets laden und eine Hilfsfunktion schreiben, die 16x16 Tiles (mit 1px Margin) korrekt auf den Canvas zeichnet.
3.  **Daten-Loader:** Einen Service schreiben, der die JSON-Dateien (z.B. `combat_rules.json`, `skills.json`) asynchron lädt und dem Game-State zur Verfügung stellt.
4.  **M1 Starten:** Den BSP-Dungeon-Generator in TypeScript implementieren.
