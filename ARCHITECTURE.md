# FORD • ARCHITECTURE.md

Ziel dieses Dokuments: **klare, stabile Architektur-Guidelines** für Entwicklung, Tests, Wartung und Erweiterbarkeit.
FORD ist ein Single-Player 2D-Dungeon-Crawler in **React + TypeScript + HTML5 Canvas**, mit **vollständig rundenbasiertem Gameplay** (Erkundung + Kampf), **datengetriebenen** Systemen und strikt **getrennter** Rendering- vs. Gameplay-Logik.

---

## 1) Architekturprinzipien

1. **Trennung von Zuständigkeiten**

   * **systems/**: reine, deterministische **Gameplay-Logik** (kein DOM/Canvas).
   * **components/**: **Präsentation** (React, Canvas, Audio, Effekte).
   * **entities/**: **Datencontainer** + dünne Helfer.
   * **util/**: wiederverwendbare **Hilfen** (BSP, LOS, Pfadfindung, RNG, Profiler).
   * **data/**: **JSON-Daten** + **Schemas** (einzige Quelle für Content & Regeln).

2. **Datengetrieben**
   Items, Skills, Effekte, Kampfregeln, Loot, Rezepte, Nodes, Balance, UI-Farben leben in `data/*.json` und werden **beim Start validiert**.

3. **Determinismus**
   Eigener RNG-Wrapper mit **expliziten States** (Save/Load-fähig). Tests und Replays ergeben **identische** Abläufe bei gleichem Seed.

4. **Kompromisslose Testbarkeit**
   **systems/** & **util/** sind frei von Browser-APIs; Unit-/Property-/Integrationstests laufen **headless**. Components/UI nur als Import-Smoketests in CI.

5. **Ereignisorientiert**
   Szenen erzeugen **Intents** (Benutzerabsichten). **Systems** verarbeiten und liefern **Outcomes** (Ereignisse) zurück.
   Scenes setzen daraus **sichtbare Effekte** (Sprites, Partikel, Audio) um.

6. **Stabile IDs**
   Alle spielrelevanten Entitäten (Items, Rezepte, Skills, Tabellen, Nodes) besitzen **stabile IDs**. Keine Wiederverwendung gelöschter IDs.

---

## 2) Projektstruktur (Top-Level)

```
game/
  main.py                 # App/Window bootstrap
  components/             # React-Components, Canvas, Adapter
  systems/                # Reine Logik (combat, skills, loot, crafting, save, ...)
  entities/               # Datenmodelle (player, enemy, projectiles, ...)
  util/                   # BSP, LOS, RNG, pathfinding, camera, prof, ...
  assets/                 # CC0 Platzhaltergrafiken/SFX (kein Code)
data/
  ...                     # JSON-Daten + schemas/
tests/
  ...                     # Unit/Integration/Perf
```

---

## 3) Schichten & Abhängigkeitsregeln

```
scenes ─┬──► adapters (feedback/audio/ui/nodes/drops/tiles)
        │
        └──► systems (combat, skills, loot, ...)
                    ▲
entities ◄──────────┘  (Datenmodelle)
        ▲
        └── util (bsp, los, path, rng, camera, prof, config)
```

**Regeln:**

* `systems/*` **importieren niemals** React/DOM/Canvas.
* `scenes/*` **dürfen** `systems/*`, `entities/*`, `util/*` importieren.
* Datenzugriff ausschließlich über `data_loader/validation`.
* Adapter-APIs (z. B. `util/feedback.py`) sind **No-Ops** in Tests und werden in `scenes/*` gebunden.

---

## 4) Koordinatensysteme & Einheiten

* **Tile-Koordinaten (tX, tY)**: ganzzahlig, Basis für Pfadfindung, Kollision, Kampfreichweiten.
* **Welt-Pixel (wx, wy)**: `tile * TILE_PX`, vor Skalierung (TILE_PX = 16).
* **Bildschirm-Pixel (sx, sy)**: nach Skalierung (Scale = 4 → 64 px je Tile).
* **Kamera**: integer-Offsets (Pixel-Perfect), clamped an Map-Bounds.
* **Bewegung**: in **Tiles/Zug**; keine `dt`-basierte Simulationsbewegung in der Logik.

---

## 5) Datenfluss (Intent → Outcome)

```text
Input (Keyboard/Mouse)
   │
   ▼
Scene erzeugt Intent(en)
   - Move(to tile)
   - Attack(target)
   - Shoot(target)
   - Cast(spell, target)
   - UseItem(item)
   - Wait
   │
   ▼
systems/combat.resolve_intent(state, intent, rng)
   │
   **Combat** (rundenbasiert):
   ├─ Intent (Move/Attack/Shoot/Cast/UseItem/Wait)
   ├─ nutzt: stats, effects, los, damage, ammo, skills hooks
   ├─ liefert: Outcomes (Hit/Miss/Crit/Block/Damage/ApplyEffect/Death/Drop/Msg)
   └─ Adapter (Partikel, Audio, Hit-Stop)
   │
   ▼
Outcome Events (Hit, Miss, Crit, Block, Damage, ApplyEffect, Death, Drop, Log)
   │
   ├─ Scene: Visuals (Particles, ScreenShake, Projectiles), Audio
   └─ systems/…: State-Updates, Logs, Hooks (loot, skills, drops)
```

**Wichtig:** Systems geben **nur Datenereignisse** zurück. Visualisierung erfolgt **nachgelagert** durch Scene/Adapter.

---

## 6) Hauptschleifen & Zeit

* **Exploration**: **rundenbasiert** (M1).
* **Combat**: **rundenbasiert** (M2). State-Änderungen (HP, Effekte, Position pro Zug) sind **diskret**.
* Beide Modi teilen sich dieselbe Simulationszeit (`sim_turn`), daher keine Zeit-Synchronisationsprobleme.

**Timekeeper (`util/timekeeper.py`)**

* liefert `sim_turn` und Modi-Flags (`exploration_active`, `combat_active`).
* steuert Runden-Fortschritt für Crafting, Respawn und Effekte einheitlich.
* stellt Monotonic-Zeit für Profiler/Respawn bereit.

---

## 7) RNG & Determinismus

**Streams:** `core`, `loot`, `combat`, `craft`.
**API:**

```python
rng = RngStream(seed=1337, algo="pcg32")
state = rng.export_state()
rng2 = RngStream.import_state(state)
```

* **Systems** akzeptieren `rng` als Parameter (kein globales `random`).
* Save/Load persistiert alle Stream-States (M5).
* Integrationstests vergleichen Sequenzen/Outcomes fixierter Seeds.

---

## 8) Kernmodule (Public API)

| Modul                   | Zweck                                  | Importiert                                            |
| ----------------------- | -------------------------------------- | ----------------------------------------------------- |
| `systems/combat.py`     | Intents→Outcomes, Rundenablauf         | stats, effects, los, damage, ammo, skills hooks |
| `systems/initiative.py` | Reihenfolge (DEX, Ties, Rundenwechsel) | rng                                                   |
| `systems/stats.py`      | ATK/DEF/CRIT/EVA/RES Formeln           | data                                                  |
| `systems/effects.py`    | Buff/Debuff/DoT/CC Ticks/Stacks        | data                                                  |
| `systems/loot.py`       | Gewichtet/Nested Tabellen              | data, rng                                             |
| `systems/items.py`      | Itemmodelle, Mods, Damage/Defense      | data                                                  |
| `systems/inventory.py`  | Slots, Stacks, Transaktionen           | items                                                 |
| `systems/equipment.py`  | Equip/Unequip, Stataggregation         | items                                                 |
| `systems/item_use.py`   | Consumables → Effects                  | effects                                               |
| `systems/skills.py`     | XP-Kurven, Hooks, Boni                 | data                                                  |
| `systems/crafting.py`   | Queue/Jobs/Erfolg/Fail/Crit            | data, inventory, rng                                  |
| `systems/nodes.py`      | Node-State (Depletion/Respawn/Yield)   | data, rng                                             |
| `systems/save_*`        | Save-Contract/Schema/Service/Migration | data                                                  |
| `util/*`                | BSP, LOS, Pfad, Kamera, RNG, Profiler  | —                                                     |
| `components/*`          | React, Canvas, Adapter-Bindings        | systems                                               |

---

## 9) Entities (Datenmodelle)

**Dataclasses**/TypeScript-Interfaces (keine DOM-Abhängigkeit):

```python
@dataclass
class EntityId:
    kind: Literal["player", "enemy", "projectile"]
    uid: str  # stable

@dataclass
class Stats:
    hp: int; hp_max: int
    mana: int; stamina: int
    base: dict[str, int]  # str/dex/int
    mods: dict[str, float]  # applied from equipment/effects

@dataclass
class Player:
    id: EntityId
    pos_tile: Vec2i
    stats: Stats
    inventory: Inventory
    equipment: Equipment
    skills: Skills
```

Enemies referenzieren `monsters.json`-Archetypen + laufzeitliche Felder (HP, Effekte, pos).

---

## 10) Karten-Pipeline (BSP → TileMap → Layers)

1. **BSP-Generator (`util/bsp.py`)** erzeugt **Grid** (`WALL|FLOOR`).
2. **Adapter (`util/tilemap.py`)** wandelt Grid zu **Layer-Daten** (`ground`, `walls`, `decals`, `light-blockers`).
3. **Renderer** zeichnet die Tiles auf das Canvas.
4. **Kollision (`systems/collision.py`)** arbeitet direkt auf dem **Grid** (Nachbarzellen).

**Performance:** Culling per **Viewport + Margin**; SpriteLists pro Layer.

---

## 11) Kollision & Bewegung (M1)

* **Tile-Kollision** gegen **WALL**-Tiles.
* Zugbasierte Nachbarfeld-Prüfung (inkl. Diagonalen nur bei legalem Pfad).
* Keine Echtzeit-Slide-Physik in der Simulationslogik.

---

## 12) Kampfarchitektur (M2)

* **Initiative** → Zugreihenfolge, Rundenwechsel.
* **Intent-Typen**: Move, Attack, Shoot, Cast, UseItem, Wait.
* **Regeln**: `combat_rules.json` (To-Hit, Crit, Block, Ranges, MinDamage).
* **Effekte**: `effects.json` (apply/tick/expire, stack rules).
* **LOS**: Bresenham-Ray über Grid (Wände blocken).
* **Projektile**: **logisches** Raycast → Outcome; visuell verzögert animiert.
* **Combat-Log** (JSON) für Replay/Debug.

---

## 13) Skills, Loot, Inventory, Hotbar (M3)

* **Skills** steigen per **Hooks** (On-Hit, On-Use, On-Gather, On-Craft).
* **Loot**: gewichtete Tabellen, nested, zyklensicher.
* **Inventory**: transaktionale Operationen (add/remove/split/merge/move).
* **Equipment**: Slot-Regeln, Stataggregation.
* **Hotbar**: referenziert Inventar-Slots; Aktionen leiten an Systems weiter.
* **Tooltips** erzeugen **Strings** (UI-Farben in `ui.json`).

---

## 14) Nodes, Berufe, Crafting (M4)

* **Nodes**: Depletion/Respawn, Tool-Checks, Skill-Boni (extra yield, Zeitreduktion).
* **Spawner**: seed-basiert; Mindestabstände; Biome/Tags optional.
* **Crafting**: Stationen (Forge/Alchemy), Queue, Jobs, Erfolg/Fail/Crit, Reservierungen **atomar**.
* Tickt auf Rundenzeit in Exploration und Combat; UI meldet Abschlüsse ohne Spam.

---

## 15) Save & Load (M5)

* **Save-Schema** (`save_v1`): World (Seed/BSP/Nodes/Discovered recipes), Player (Pos/Stats/Inv/Equip/Skills/Hotbar), Stations (Queues), RNG-Streams, Timekeeper.
* **Serializer**: JSON (Default, gzip) oder MsgPack; **SHA-256** Checksumme.
* **Atomare Writes**: temp→fsync→rename.
* **Slots**: last/auto-###/quick + `meta.json`.
* **Migration**: vN→vN+1 registriert, idempotent, getestet.

---

## 16) Adapter-Schicht (UI/FX/Audio/World)

Adapter bieten **stabile, testfreundliche** Oberflächen:

* `util/feedback.py` → `emit_hit_particles`, `screen_shake(intensity, ms)`
* `util/drops_adapter.py` → `spawn_drop`, `pickup_drop`
* `util/nodes_adapter.py` → `spawn_node`, `despawn_node`
* `util/audio_adapter.py` → `play_sfx(name)`
* `scenes/ui_*` → Hotbar/Combat/Crafting Overlays

In Tests liefern Adapter **No-Ops**; in `components/*` werden sie mit Browser-Implementierungen gebunden.

---

## 17) Konfiguration & Balance

**Konfigurationskaskade:**

1. `data/config.default.json`
2. optionale `config.json` (lokal)
3. **ENV** (z. B. `FORD_SEED`, `FORD_SIZE`)

**Balance-Overrides** in `data/balance.json` (zentrale Tuning-Punkte).

---

## 18) Performance-Budgets (Leitwerte)

* **BSP 128×128**: < **50 ms** Ø (CI, M1)
* **Rundenlogik (1P+3E)**: < **2 ms** Ø (CI, M2)
* **100k Loot-Rolls**: < **250 ms** (CI, M3)
* **2 000 Node-Ticks**: < **1 ms** Logik (CI, M4)
* **Save+Write**: < **50 ms** (M5)

**Hilfen:** `util/prof.py` (Kontextmanager/Decorator), Debug-Overlay (F3) mit rollierenden Mittelwerten.

---

## 19) Fehlerbehandlung & Logs

* **Validierung**: harte Fehler beim Laden von `data/*.json` → Startabbruch mit präziser Pfadangabe.
* **Systems-Fehler**: Intent-Ablehnung mit **klaren Codes** (`OUT_OF_RANGE`, `NO_LOS`, `NO_AMMO`, `INVALID_TARGET`).
* **Combat-Log**: strukturierte JSON-Einträge (Würfe, Mods, Outcomes) – optional in Dev-Builds persistieren.

---

## 20) Öffentliche APIs (Signaturen, exemplarisch)

```python
# systems/combat.py
def resolve_turn(state: CombatState, intents: list[Intent], rng: RngStream) -> list[Outcome]: ...

# systems/initiative.py
def roll_initiative(rng: RngStream, participants: list[Actor]) -> Initiative: ...

# systems/loot.py
def roll_table(table_id: str, rng: RngStream, unique_once: bool = False) -> list[Drop]: ...

# systems/crafting.py
class CraftingStationState:
    def enqueue(self, recipe_id: str, count: int, inv: Inventory, rng: RngStream) -> None: ...
    def tick_turns(self, turns: int, inv: Inventory, rng: RngStream) -> list[CraftOutcome]: ...

# systems/inventory.py
class Inventory:
    def add(self, item_id: str, qty: int) -> None: ...
    def remove(self, item_id: str, qty: int) -> None: ...
    def split_stack(self, slot: int, qty: int) -> int: ...
```

---

## 21) Testpyramide & Headless-Strategie

* **Unit (breit):** stats, combat, effects, loot, inv, equip, skills, crafting, nodes, save.
* **Property:** BSP-Konnektivität, Loot-Gewichte, Kollisions-Fuzz.
* **Integration:** Player vs. Trio (M2), Kampf→Drop→Pickup→Equip/Use (M3), Erz→Ingot→Sword→Equip (M4), Save/Load-Roundtrip (M5).
* **Smoke (UI/Components):** reine Import/Init-Tests, **skip** ohne DOM (`jsdom`).

---

## 22) Erweiterbarkeit (Extension Points)

* Neue **Effekte**: `effects.json` + Handler in `systems/effects.py`.
* Neue **Schadenstypen**: `combat_rules.json` + `systems/damage.py`.
* Neue **Stationen**: `stations.json` + Registrierung in `util/stations.py`.
* **Controller-Support**: nur Scene-Eingabemapping, Systems bleiben unverändert.
* **Shader/Polish**: Scene-lokal (Vignette/Scanlines), Systems unberührt.

---

## 23) Security/Cheating (Single-Player Kontext)

* Client == Spiel; kein Netzcode.
* **Integrität**: Save-Checksumme (SHA-256), Fehler toleriert (Recovery).
* Debug-Features bleiben **dev-only** (Flags/Build-Config).

---

## 24) Glossar (Begriffe)

* **Intent**: Spieler-/KI-Absicht (Move/Attack/…); reines Datamodell.
* **Outcome**: Ergebnis-Event(s) (Hit/Damage/ApplyEffect/Drop/Log).
* **Stream RNG**: separater Zufallsstrom je Domäne (combat/loot/…).
* **Tile/World/Screen**: Koordinatenräume (siehe §4).
* **Adapter**: Schnittstelle zwischen Logik und Präsentation.

---

## 25) Anhang: Mini-Sequenzen

**Angriff (Ranged)**

```
Scene: click auf Gegner → Intent.Shoot(target)
→ systems/los.check(...)
→ hit_chance = base + (atk_skill - def_skill)/skill_scale + (ATK - DEF)/atkdef_scale
→ roll random(0-1) vs hit_chance
→ on hit: damage = weapon_base_dmg * (1 + str_bonus + tactics + anatomy) * (1 - resist[type])
```

**Gather → Craft**

```
Scene: Interact(E) → begin_gather(node)
→ systems/gather: tool+skill prüfen, Dauer bestimmen
→ Abschluss: nodes.gather → inventory.add(drops)
→ Scene: near station → enqueue(recipe_id) in crafting
→ TickTurns(1) → success/fail/crit → outputs to inv
```

---

**Status:** Dieses Dokument ist die **verbindliche Referenz**. Änderungen an Architekturregeln erfolgen über PRs mit Review; breaking Änderungen erfordern Updates in `TOOLING.md`, `data.md` und relevanten Tasks (`tasks/*`).


## ARCHITECTURE – UO Addendum — UO Addendum

# ARCHITECTURE – UO Addendum


## Datenfluss (Skills) — UO Addendum

## Datenfluss (Skills)
1. **Event**: `onSkillUse(skillId, context)` ermittelt `p_success` (z. B. HitChance).
2. **Lookup**: `skills.json[skillId].xp_curve` → `progression_rules.json.curves[curveName]`.
3. **Formel**: `progression_rules.json.skill` + Kurvenprofil bestimmen `P(gain)` (Chance auf **+0.1**).
4. **Stat-Gains**: bei Skill-Gain Roll auf STR/DEX/INT/STAM gemäß `skills.json[skillId].stats` und `progression_rules.json.stats`.
5. **Caps**: `progression_rules.json.caps` (per Skill, total, per Stat).


## Datenfluss (Kampf) — UO Addendum

## Datenfluss (Kampf)
- **combat_rules.json** versorgt das Kampfsystem: `hit_chance`, `parry`, `damage`, `movement`, `recovery`, `initiative`, `dodge`.
- Optional kann jede Waffe einen `base_delay` tragen; sonst greift die Map in `combat_rules.recovery.weapon_base_delay`.


## Engagement & Zeit — UO Addendum

## Engagement & Zeit
- **Encounter-Bubble** (R=12 Tiles), alle Gegner mit LOS joinen; neue Gegner treten am Rundenbeginn bei.
- **Rundenzeit**: 1 Runde = 3 s Simulationszeit. Crafting läuft auf Rundenzeit weiter (Outputs markiert), Node-Respawn konfigurierbar.
- **Escape**: LOS-frei + Distanz ≥ *leash_break* (10 Tiles) über 1 volle Runde → Exploration.
