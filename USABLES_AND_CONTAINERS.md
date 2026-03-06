# Usables & Containers – Datengetriebene Interaktionen (UO‑Style)

**Ziel**: Einheitliches, datengetriebenes System für **bedienbare Weltobjekte** (Hebel, Knöpfe, Türen, Druckplatten, Kisten/Truhen/Regale/Fässer/Körbe/Schränke/Schreibtische/Bücherregale).
Fokus: **Rundenkampf‑kompatibel**, **Skill‑Hooks** (Lockpicking/Detect Hidden/Tinkering/Strength), **Loot‑Tables**, **Traps**, **Ownership** (Diebstahl), **Persistenz**.

---

## 1) Designprinzipien
- **Datengetrieben**: Alle Objekte deklarativ in `usables.json` (oder verteilt per Biome‑Datei). Keine Logik hartkodiert.
- **State‑Machines**: Einheitlicher Kernzustand: `locked`, `open`, `armed_trap`, `durability`, `spawn_epoch` (Loot/Respawn).
- **Deterministisch**: Loot‑Rolls und Trap‑Seeds pro `placement_id` → reproduzierbar über Sessions.
- **Kompatibel**: Nutzt existierende Dateien:
  - `loot_tables.json` – für Container‑Inhalte
  - `combat_rules.json` – für Trap‑Schaden/Resists
  - `progression_rules.json` – für Skill‑Gains bei Lockpick/Disarm/Detect
- **Sicher im Kampf**: Öffnen, Suchen, Entschärfen sind **Hauptaktionen** im rundenbasierten Modus.

---

## 2) Gemeinsames Daten‑Schema

```jsonc
{
  "id": "chest_small_oak_01",
  "type": "container|lever|button|door|pressure_plate|bookshelf|cabinet|wardrobe|barrel|basket|crate|desk",
  "name": "Small Oak Chest",
  "sprite": "tiles/props/chest_small_oak.png",
  "placement": {
    "placement_id": "map01_x123y045",
    "pos": {"x":123, "y":45},
    "rot": 0
  },
  "interact": {
    "open": true,
    "lock": {"locked": true, "difficulty": 45, "key_id": "key_bandit_camp"},
    "trap": {
      "armed": true, "type": "poison_gas", "difficulty": 40,
      "power": 35, "radius": 1, "on_open": true, "on_fail_disarm": true
    },
    "container": {
      "capacity": 20, "weight_max": 200.0,
      "loot_table": "bandit_cache_t1", "respawn": {"mode": "daily", "hours": 24},
      "allowed_tags": ["material","consumable","weapon","reagent"]
    },
    "toggle": {"group_id": "crypt_gate_A", "mode": "flip"},
    "pressure_plate": {"weight_min": 20, "hold_to_activate": true},
    "readable": {"pages": 3, "lore_id": "bandit_notes_01"},
    "movable": false, "pickup_allowed": false
  },
  "ownership": {"faction": "bandits", "trespass": true},
  "durability": {"hp": 20, "breakable": true, "bash_dc": 45, "noise": 0.8},
  "fx": {"open": "sfx/chest_open.wav", "trap": "sfx/trap_poison.wav"}
}
```

**Erläuterungen**
- `lock.difficulty`: DC für **Lockpicking**; mit Schlüssel (`key_id`) Umgehung ohne Check.
- `trap`: Typen: `needle`, `poison_gas`, `explosion`, `dart`, `fireburst`. Werden über `combat_rules.json` → Resist‑Mitigation gerechnet.
- `container.respawn`: `none|daily|interval` (Stunden). Loot wird **beim ersten Öffnen** erzeugt oder on‑spawn (`spawn_epoch`).
- `toggle.group_id`: Hebel/Knopf aktiviert/deaktiviert alle **Targets** in derselben Gruppe (Türen, Portcullis, Fallen, Lichter).
- `ownership`: markiert **Diebstahl**; UI zeigt Hinweis, Guards/NPC reagieren (später).

---

## 3) Interaktions‑Verben & Kosten (Kampfmodus)

| Aktion         | Typ        | Kosten             | Hooks/Checks                                  |
|----------------|------------|--------------------|-----------------------------------------------|
| **Open/Close** | Hauptakt.  | 1 Aktion           | Check: `locked==false`. Trigger: `trap.on_open` |
| **Lockpick**   | Hauptakt.  | 1 Aktion           | Wurf vs. `lock.difficulty` mit `lockpicking`   |
| **Disarm**     | Hauptakt.  | 1 Aktion           | Wurf vs. `trap.difficulty` mit `tinkering`/`detect_hidden` |
| **Search**     | Hauptakt.  | 1 Aktion           | Erhöht `detect_hidden`‑Effekt, findet versteckte Fächer |
| **Inspect**    | Nebenakt.  | 0 Aktionen         | Zeigt Hinweise (Kratzer, Geruch, Zischen…)     |
| **Take All**   | Nebenakt.  | 0 Aktionen         | Nur wenn offen                                 |
| **Read**       | Hauptakt.  | 1 Aktion           | Bücher/Notizen; kann Flags/Quests setzen       |
| **Press/Flip** | Hauptakt.  | 1 Aktion           | Schaltet `toggle.group_id`                     |
| **Bash**       | Hauptakt.  | 1 Aktion           | STR/Weapon vs. `bash_dc`. Lärm/Alarm möglich   |

> Exploration: dieselben Verben, aber als turn-basierte Aktionen ohne Echtzeit-Timer.

---

## 4) Würfe & Formeln (UO‑Feeling)

**Lockpicking‑Erfolg** (0.02..0.98):
```
P = clamp(0.02, 0.5 + (skill - difficulty) / 200, 0.98)
```
On‑Use → **Skill‑Gain‑Check** (0.1) über `progression_rules.json` (Sweet‑Spot ~50%).

**Disarm Trap** (Tinkering/Detect Hidden Hybrid):
```
skill = 0.7 * tinkering + 0.3 * detect_hidden
P     = clamp(0.02, 0.5 + (skill - difficulty) / 200, 0.98)
```
Miss bei `trap.on_fail_disarm == true` → Trap löst aus.

**Trap‑Schaden** (nutzt `combat_rules.json`):
`final = floor( base * (1 - resist[type]) )`, min 1. `type` gemäß Trap‑Typ → `poison|fire|energy|pierce`.

**Detect Hidden (Search/Passiv)**: erhöht **Erkennungs‑Stufe** → schaltet Tooltips (Kratzer, Zündschnur), gibt **+Disarm‑Hint** (+0.05..+0.15 auf P).

**Bash**:
```
atk = STR + weapon_dmg + tactics*0.2
P   = clamp(0.02, 0.5 + (atk - bash_dc)/200, 0.95)
on success: durability.hp -= roll(5..10)
on fail: noise += 0.2
```

---

## 5) Container‑Loot & Respawn

- **Spawn‑Moment**: Standard bei **erstem Öffnen** → erzeugt Items aus `loot_table`.
- **Seed**: `seed = hash(placement_id) ^ world_seed` → deterministisch.
- **Respawn**:
  - `none` – einmalige Beute.
  - `daily|interval` – Timer beginnt **nach dem Leeren** (oder nach Öffnen, konfigurierbar).
  - Bei Respawn erzeugt System **neue Items** (alte Reste bleiben, falls `preserve_unlooted: true`).

**Spezialcontainer**
- **Bookshelf**: Loot‑Table bevorzugt `reagent_*`, `scroll_*`, `book_*`.
- **Cabinet/Wardrobe**: `cloth_bolt`, `leather`, einfache Klamotten/Tools.
- **Barrel/Crate**: Materialien, Nahrung/Trinken, Pfeile/Bolzen.
- **Basket** (leichter Behälter): kleines `weight_max`, tragbar (`pickup_allowed: true`).

---

## 6) Beispiele

### 6.1 Lever → Türgruppe
```json
{
  "id": "lever_crypt_A",
  "type": "lever",
  "name": "Rusty Lever",
  "placement": {"placement_id": "crypt01_lever_A", "pos": {"x":40,"y":12}},
  "interact": {
    "toggle": {"group_id": "crypt_gate_A", "mode": "flip"}
  },
  "fx": {"open": "sfx/lever_flip.wav"}
}
```

### 6.2 Locked & Trapped Chest
```json
{
  "id": "chest_bandit_t1_01",
  "type": "container",
  "name": "Bandit Chest",
  "placement": {"placement_id": "bandit_camp_chest_01", "pos": {"x":23,"y":88}},
  "interact": {
    "open": true,
    "lock": {"locked": true, "difficulty": 45, "key_id": null},
    "trap": {"armed": true, "type": "poison_gas", "difficulty": 40, "power": 35, "radius": 1, "on_open": true, "on_fail_disarm": true},
    "container": {"capacity": 20, "weight_max": 200, "loot_table": "bandit_cache_t1", "respawn": {"mode": "interval", "hours": 48}},
    "movable": false
  },
  "durability": {"hp": 25, "breakable": true, "bash_dc": 55},
  "ownership": {"faction": "orc", "trespass": true}
}
```

### 6.3 Bookshelf (lesen + Scrolls)
```json
{
  "id": "bookshelf_mage_01",
  "type": "bookshelf",
  "name": "Dusty Bookshelf",
  "placement": {"placement_id": "tower_lib_shelf_A", "pos": {"x":10,"y":6}},
  "interact": {
    "open": false,
    "readable": {"pages": 4, "lore_id": "notes_on_mana_flow"},
    "container": {"capacity": 8, "weight_max": 60, "loot_table": "library_scrolls_t1", "respawn": {"mode": "daily", "hours": 24}}
  }
}
```

### 6.4 Barrel (tragbar)
```json
{
  "id": "barrel_food_01",
  "type": "barrel",
  "name": "Food Barrel",
  "placement": {"placement_id": "farm_barrel_A", "pos": {"x":5,"y":32}},
  "interact": {
    "open": true,
    "container": {"capacity": 10, "weight_max": 120, "loot_table": "food_common", "respawn": {"mode": "none"}},
    "movable": true, "pickup_allowed": true
  },
  "durability": {"hp": 10, "breakable": true, "bash_dc": 25}
}
```

---

## 7) Ownership & Crime (optional Zukunft)

- **Stehlen** aus `ownership.trespass == true` markierten Containern erzeugt **Crime‑Event** (Fraktion/Guards).
- **Lärm** (Bash/Explosion) weckt nahe Gegner; **call_for_help** kann ausgelöst werden (`ai/factions.json.defaults.call_for_help_radius`).

---

## 8) Engine‑Pseudocode (Interaktion)

```ts
function interact(actor, usable, verb) {
  if (inCombat() && isMainAction(verb) && !actor.hasMainAction) return Fail("No action left");

  switch(verb) {
    case "Open":
      if (usable.lock?.locked) return Fail("Locked");
      if (usable.trap?.armed && usable.trap.on_open) triggerTrap(usable);
      openUI(usable.container);
      afterAction(actor);
      return Success;
    case "Lockpick":
      const p = hitChance(actor.skills.lockpicking, usable.lock.difficulty);
      rollGain("lockpicking", actor, p);
      if (roll() < p) usable.lock.locked = false; else maybeTriggerAntiTamper(usable);
      afterAction(actor);
      return;
    case "Disarm":
      const skill = 0.7*actor.skills.tinkering + 0.3*actor.skills.detect_hidden;
      const q = hitChance(skill, usable.trap.difficulty);
      rollGain("tinkering", actor, q); rollGain("detect_hidden", actor, q);
      if (roll() < q) usable.trap.armed = false;
      else if (usable.trap.on_fail_disarm) triggerTrap(usable);
      afterAction(actor);
      return;
    case "Press":
      toggleGroup(usable.interact.toggle.group_id, usable.interact.toggle.mode);
      afterAction(actor);
      return;
    case "Bash":
      const prob = bashChance(actor, usable.durability.bash_dc);
      if (roll() < prob) damageObject(usable, rollInt(5,10));
      else raiseNoise(usable);
      afterAction(actor);
      return;
  }
}
```

---

## 9) QA‑Szenarien
- Truhe mit **Lock+Trap**: Detect Hidden → Disarm → Open → Loot → Respawn in 48h.
- Hebel schaltet **2 Gittertore** und **1 Falle**. Reihenfolge egal; Konsistenz nach Save/Load.
- Bash‑Versuch mit STR‑Build vs. hoher `bash_dc`: niedrige Erfolgsrate; Lärm zieht Gegner an.
- Bookshelf spawnt **Scrolls/Reagents**, Read triggert Lore‑Flag, kein Combat‑Spam.
- Basket **tragbar**, Inhalt limitiert durch `weight_max`; kein Exploit mit Respawn.

---

## 10) Dateiorganisation
- `data/usables/*.json` – Templates + Platzierungen je Map/Region
- `data/loot_tables.json` – bereits vorhanden
- `data/combat_rules.json` – Trap‑Schaden/Resists
- `data/progression_rules.json` – Skill‑Gains (Lockpick/Disarm/Detect)
- `ai/factions.json` – Call‑for‑Help & Ownership‑Reaktionen
