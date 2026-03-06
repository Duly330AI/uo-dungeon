# FORD • GAMEPLAY.md

> Single-Player 2D-Dungeon-Crawler in **Python + Arcade**.
> Kern: **Erkunden und Kämpfe vollständig rundenbasiert**, **Progression über Skills**, **datengetrieben** (Items, Rezepte, Gegner, Regeln liegen in `data/*.json`).

---

## 1) Ziel & Kern-Loop

**Kurz:** Erkunde einen prozeduralen Dungeon, sammle Ressourcen, besiege Gegner in **rundenbasierten** Gefechten, crafte Ausrüstung, steigere Skills durch Nutzung, sichere Fortschritt per Save/Load.

**Kern-Loop:**

1. **Erkunden** (Runden): Räume aufdecken, Licht & Geräusche beachten; jede Aktion verbraucht Züge.
2. **Engagement**: Gegner sichten → Wechsel in **Initiative-/Encounter-Modus**.
3. **Kampf** (Runden): Aktionen planen (Move/Attack/Shoot/Cast/Use/Wait), Formeln entscheiden Treffer/Schaden.
4. **Belohnung**: Loot aufsammeln, Skills steigen (usage-based).
5. **Berufe & Crafting**: Nodes (Erz/Holz/Kräuter) ernten → an Stationen craften.
6. **Fortschritt sichern**: Save-Slot, Autosave, QuickSave/Load.

---

## 2) Steuerung & UI

### Tasten (Standard)

- **Bewegung**: `WASD` oder Pfeile (8-Wege mit Diagonalen)
- **Dodge (Kampfaktion)**: `Leertaste` (wenn verfügbar; kostet Ausdauer)
- **Interagieren / Aufheben / Station nutzen**: `E`
- **Hotbar**: `1–0` (10 Slots; Consumables/Aktionen)
- **Licht an/aus**: `L` (Debug/Style)
- **Dungeon neu seedn**: `R` (nur im Dev/Testing sinnvoll)
- **Debug-Overlay**: `F3` (FPS/Seed/Coords/Profiler)
- **QuickSave/QuickLoad**: `F5` / `F9` (wenn aktiviert; Save-Policy beachten)

> **Remapping** geplant über `game/util/input.py`. Standard-Belegung ist datengetrieben.

### HUD

- **Bars** links oben: HP / Mana / Stamina
- **Hotbar** unten: 10 Slots mit Stack-Zahl / Cooldown
- **Tooltip** (Hover): Name, Typ, Rarity, Damage/Defense, Mods, Stack/Value
- **Kampf-Overlay** (im Fight): Initiative-Leiste, aktuelle Aktion, Reichweiten-Highlight

---

## 3) Welt, Sicht & Licht

- **Tile-Größe**: 16×16 px (gerendert in **64 px** via integer Scale 4×, Pixel-Perfect).
- **Prozedural** (BSP): Räume + Korridore, Wände kollidierbar.
- **Sichtlinie (LOS)**: Bresenham-Ray. Wände/Light-Blocker stoppen Sicht & Projektile.
- **Licht**: Spieler trägt Fackel (Radius konfigurierbar). Wände werfen Schatten.
  Licht ist **stilistisch**, **nicht** stealth-relevant (später optional).

---

## 4) Attribute & Ressourcen (UO-Style)

HP – Lebenspunkte.
Formel (Default): HP = 30 + STR * 1.5 (datengetrieben).

Mana – Zauberkosten.
Formel: Mana = 0 + INT * 1.5.

Stamina – Ausdauerressource; beeinflusst Initiative/Tempo, Movement und Erholung.
Formel: STAM_pool = 10 + STAM (STAM ist Attribut, nicht nur Pool).

ATK/DEF – Angriffs-/Verteidigungswert (abgeleitet aus Skill + Attributen + Gear).
Vorschlag:

ATK_melee = weapon_skill + floor(DEX/5) + gear_atk + buffs

DEF_melee = max(parrying, defender_weapon_skill) + floor(DEX/5) + shield_def + buffs

Resistenzen – pro Schadenstyp 0.0..1.0 (clamped).
Empfohlene Typen: slash | pierce | blunt | fire | cold | poison | energy.

Stats entstehen aus: Basiswerte + Ausrüstung + Effekte + Skill-Boni + (später) Tränke/Mods.

Stat-Affinitäten der Skills (STR/DEX/INT/STAM)

Jeder Skill hat Gewichte auf STR/DEX/INT/STAM (z. B. swords stark STR/DEX, magery stark INT). Bei Skill-Nutzung können zugehörige Attribute langsam steigen (0.1-Schritte, harte Caps optional), z. B.:

Chance auf Stat-Gain bei Skill-Gain (klein, getrennt konfigurierbar).

Tages-Softcap (z. B. 2.0 Punkte pro Attribut), um Power-Grinding zu dämpfen.

Skill-Gains (UO-Feeling, 0.1-Schritte)

Inkrement: immer +0.1 pro erfolgreichem Gain.

Gain-Check bei JEDEM Skill-Use (egal ob Erfolg/Fail), aber höchste Gain-Wahrscheinlichkeit, wenn die Aktion weder trivial noch unmöglich ist (Sweet-Spot).

Empfohlene Gain-Chance:

p_success = Treffer/Erfolgs-Wahrscheinlichkeit der Aktion (aus deinen Treffer-/Cast-Formeln).

sweet = 0.6 - abs(p_success - 0.5) → max bei ~50% Erfolg.

slowdown = 1 - (skill/cap)^2 → starkes Abflachen ab ~70+.

Gain-Wkeit: P(gain) = clamp( base *sweet* slowdown, min_gain, max_gain )
Default: base=0.25, min_gain=0.01, max_gain=0.20. Skill-Total-Cap optional (z. B. 700.0). Bei Erreichen muss ein anderer Skill droppen (Auto-Lock/Down-Flag).

## 5) Kampf (Rundenbasiert, UO-Trefferlogik)
### 5.1 Einstieg & Rundenablauf

Engagement: Gegner sieht Spieler (Radius + LOS) → Kampfmodus.

Initiative (DEX/STAM-getrieben):
Pro Kampfrunde: initiative_roll = random(1-100) + DEX*0.8 + STAM*0.2 + weapon_ready_bonus.
Ties: höhere DEX, sonst random.

Aktionen pro Zug:

1 Hauptaktion (Attack / Shoot / Cast / UseItem)

Bewegung: Basis 3 Tiles + DEX-Bonus (s. unten)

Warten: Position/Initiative halten.

Rundenwechsel: Nach letztem Actor beginnt Runde +1. Effekte ticken am konfigurierten Zeitpunkt (Start/Ende).

Die „Dodge“-Aktion ist eine reine Kampfaktion (kein iFrame-Echtzeit-Roll) und bleibt vollständig turn-based.

### 5.2 UO-Treffer, Parry & Schaden
Trefferchance (UO-Gefühl – oft verfehlt bei ~60 Wrestling)

Statt klassischer Tabletop-Würfel verwenden wir eine Skill-vs-Skill-Formel (70% bei gleich guten Kämpfern):

att_skill = relevanter Angriffs-Skill (z. B. swords/fencing/macefighting, unarmed: wrestling)
def_skill = max(defender.parrying, defender.relevanter_Abwehrskill)   # z. B. wrestling oder gleiche Waffengattung
ATK = att_skill + floor(DEX/5) + gear_atk + buffs
DEF = def_skill + floor(DEX/5) + shield_def + buffs

# Baseline 70/30 bei gleichen Werten, leicht durch ATK/DEF verschiebbar

HitChance = clamp( 0.02,
                   0.70 + (att_skill - def_skill)/200 + (ATK - DEF)/200,
                   0.98 )

Ergebnis: Bei ~60 vs ~60 liegst du um ~70% → weniger Frust, trotzdem klare Skill-Unterschiede.

Parry/Block

Parry-Check nach erfolgreichem Trefferwurf:
ParryChance = clamp(0.0, shield_base + Parrying/200 + DEX/400, shield_cap)
Erfolg ⇒ Schaden reduziert (z. B. −50%) oder 0 bei perfektem Block (konfigurierbar).
Reihenfolge: HitRoll -> Evade-Modifikator (aus Dodge) -> Parry -> Damage.

Schaden
base = weapon_base_dmg
str_bonus = floor(STR/10)
mult = 1 + 0.003*Tactics + 0.002*Anatomy               # datengetrieben
final = max(1, floor( (base + str_bonus) *mult* (1 - resist[type]) ))

Ranged zieht Munition; ohne Pfeile → Verhalten (fail | fallback_melee) einstellbar.

Crits

Aus per Default (UO hat keine normalen Crits). Optional „Lucky Blow“ (z. B. 2% für 1.25×).

### 5.3 DEX & Geschwindigkeit im Rundenkampf

Tempo wird rein über Cooldown-Runden und Bewegungsbonus abgebildet:

Bewegung pro Zug:
move_tiles = 3 + floor(DEX / 40) (DEX 0/40/80/100 ⇒ 3/4/5/5 Tiles)

Waffen-Erholung (Swing-Cooldown in Runden):
Jede Waffe hat base_delay (z. B. Dagger 0, Longsword 1, Halberd 2, Heavy Xbow 3).
Nach einem Attack erhält der Actor:

recovery_rounds = clamp(0, base_delay - floor(DEX/40), max_recovery)

Solange recovery > 0, ist Attack gesperrt (du kannst aber Move/UseItem/Cast).
→ Leichte Waffen + hohe DEX = jede Runde angreifen; schwere Waffen fühlen sich träge an.

Bögen/Armbrüste (Reload):
reload_rounds = bow_base_reload - floor(DEX/50) (min 0). Heavy Xbow z. B. Basis 2.

Zauberzeit (optional):
Spells haben cast_rounds; INT/meditation können sie um 1 reduzieren (min 0).

### 5.4 Ranges & Sonstiges

Reichweiten: Melee 1, Ranged 6, Caster 5 Tiles.

Dodge-Aktion (optional): 1 Tile reposition, +evade% bis Zugende.

Datengetrieben: Alle Konstanten in data/combat_rules.json.

### 5.5 Skill-/Stat-Progression (praktisch)

Skill-Use → Erfolgswurf (Treffer, Parry, Cast, Kochen etc.) → berechne p_success.

Gain-Roll (0.1 Schritt) mit Sweet-Spot und Slowdown (siehe oben).

Stat-Gain: Wenn Skill gained, separater kleiner Wurf auf die zugehörigen Stats (aus Skill-Affinitäten).
Beispiel: P(stat_gain_STR) = 0.05 * stats_affinity.STR, Cap/Tag in progression_rules.

### 5.3 Status-Effekte (Auszug)

- **Bleed** (DoT phys), **Poison** (DoT poison): ticken pro Runde
- **Stun**: blockiert **1 Zug** (oder konfiguriert)
- **Guard**: +DEF für N Runden
- **Haste**: +1 Move-Tile pro Zug
- **Evade**: erhöhte Ausweichchance

Effekte definieren **apply/tick/expire** in `data/effects.json`. Stacking-Regeln: `none|add|refresh`.

### 5.4 Gegnerverhalten (KI)

- **Melee**: ranlaufen, schlagen; bei niedrigem HP **Guard**
- **Ranged**: hält **Kite-Distanz** (z. B. 4–6 Tiles), schießt, repositioniert
- **Caster**: priorisiert **CC/DoT**, verwaltet Mana, fallback Nahkampf

---

## 6) Bewegung & Kollision (Erkunden)

- **Rundenbasiert**, **8-Wege**.
- Pro Zug: Bewegung bis `move_tiles`; keine `dt`-basierte Laufzeitbewegung.
- Kollision auf Tile-Grid gegen **Walls**; diagonale Bewegung nur bei legalen Nachbarfeldern.
- **Dodge** ist nur als Kampfaktion verfügbar.

---

## 7) Skills & Progression (usage-based)

**Skills**: `swords, archery, magery, lockpicking, mining, woodcutting, alchemy, smithing, healing`

- **Anstieg durch Nutzung**:
  - Treffer mit Schwert → `swords` chance auf 0.1 Skill-Gain
  - Bogen → `archery` chance auf 0.1 Skill-Gain   (mit Pfeilverbrauch)
  - Zauber → `magery` chance auf 0.1 Skill-Gain
  - Trank nutzen → `healing` chance auf 0.1 Skill-Gain
  - Abbau/Ernte → `mining/woodcutting` chance auf 0.1 Skill-Gain
  - Crafting → `smithing/alchemy` chance auf 0.1 Skill-Gain
- **Cap**: standard **100** (datengetrieben).
- **Boni**: je Skill (z. B. `+1% Trefferchance pro 0.1 swords-Skill`, `archery: +Crit`, `+1% Trefferchance pro 0.1 archery Skill`, `alchemy: Potency+`).

Skill-Gain-Kurven in `data/skills.json` (z. B. polynomial `a * level^p` oder Tabellen).

---

## 8) Berufe & Nodes

**Nodes**: `ore`, `tree`, `herb`

- **Interaktion**: `E` in Nachbarschaft (1 Tile)
- **Tool-Check**: z. B. `pickaxe_stone` für `iron_ore_vein`
- **Dauer**: abhängig von Tier/Skill; **Skill** reduziert Zeit &/oder erhöht Yield
- **Yield**: feste Item-Range oder **Loot-Tabelle**
- **Depletion/Respawn**: Node verschwindet, respawnt nach `respawn_sec`

Parameter in `data/nodes.json` + Balancing in `data/balance.json`.

---

## 9) Crafting & Stationen

**Stationen**: `forge`, `alchemy`

- **Rezepte** in `data/recipes.json` (Inputs → Outputs, `time_sec`, Skill-Min, Tool-Anforderung, Erfolg/Crit, Fail-Returns)
- **Queue** pro Station, Jobs laufen auf Simulations-Rundenzeit
- **Ergebnis**: ins Inventar (oder World-Drop bei Platzmangel)
- **Skill-Hooks**: `smithing/alchemy` Boni (Crit-Chance, Output+)

Optional: **Rezept-Freischaltung** über Drops/Scrolls.

---

## 10) Items, Ausrüstung, Hotbar

### 10.1 Item-Typen

- **Weapon** (Schadenstyp + base_dmg Wert), **Armor** (DEF), **Consumable** (Use-Effekte),
  **Material**, **Currency (`gold`)**, **Ammo (`arrows`)**

### 10.2 Inventar

- **Slots** (z. B. 30), Stacks (Default max 99), atomare Operationen (add/remove/split/merge/move).
- Optional **Gewichtslimit** (Balance-Flag).

### 10.3 Equipment

- Slots: **weapon**, **offhand**, **armor**, **accessory**
- Stat-Aggregation: Basis + Equip + Effekte + Skills (reproduzierbar)

### 10.4 Hotbar (10)

- **1–0** aktiviert Slot-Aktionen: Consumable nutzen, z. B. **Heiltrank**;
  für Waffen ggf. **Special** (später).
- Hotbar referenziert **Inventar-Slots** (kein Doppel-Item-Duplikat).

---

## 11) Loot & Raritäten

**Tabellen** in `data/loot_tables.json` (Gewichte, Mengenbereiche, **nested tables**).

- Gegner ziehen bei Tod aus ihrer **Drop-Tabelle** (`monsters.json`).
- **Rarity**: `common|rare|epic` (Farb-Codierung in `data/ui.json`)
- **Gold**: als Item (stackbar), mit Komfort-APIs (`add_gold/remove_gold`).

---

## 12) Gegner

**Archetypen** in `data/monsters.json`:

- **Melee** (HP/ATK hoch, kurze Reichweite, +1% Trefferchance pro 0.1 Wrestling Skill)
- **Ranged** (Abstand halten, Projektile)
- **Caster** (Spells, Mana, DoT/CC)
Felder: `hp, atk, def, speed, resist, drop_table_id, spells?, projectile?`

---

## 13) Schwierigkeitsgrad & Balance

- **Standardwerte** in `data/combat_rules.json` & `data/balance.json`.
- Balancing erfolgt **datengetrieben** (keine Hardcodes).
- Beispiele:
  - **Kampf**: Crit 5%, Block 50% Reduktion, MinDamage 1
  - **Welt**: Node-Respawn T1 Erz 120 s, Baum 180 s, Kraut 90 s (auf Simulationszeit)
  - **Crafting**: Ingot 5 s, Potion 4 s, Sword 8 s
  - **Skills**: Boni pro 10 Level (konfigurierbar)

---

## 14) Audio & Feedback

- **SFX**: Schritt, Schlag, Treffer, Pickup, Craft-Complete (Platzhalter).
- **Trefferfeedback**: Particles, Screen-Shake (Intensität nach Crit/Schaden).
- **UI**: Farb-Codes für Rarity & Schadenstypen; Tooltips konsistent.

---

## 15) Speichern/Laden (Kurz)

- **Slots**: `saves/slot-#/last.save`, `auto-###.save`, `quick.save`
- **Autosave**: Raumwechsel, Craft-Abschluss, Elite-Kill (gedrosselt)
- **Policy**: Save/QuickSave jederzeit am Zuggrenzen-Snapshot erlaubt; während laufender Ergebnis-Animationen wird auf den nächsten sicheren Snapshot verschoben
- **Integrität**: SHA-256-Checksumme (Korruption → Recovery auf letzte gültige Datei)

Details: `SAVELOAD.md` (wenn vorhanden) & `M5`-Tasks.

---

## 16) Accessibility & Optionen (geplant)

- **Textgröße/UI-Skalierung**
- **Farbenblind-Modi** (alternative Rarity-Farben, Schadenstyp-Icons)
- **Key-Remap** (Input-JSON)
- **An-/Abschaltung von Screen-Shake** und Partikelgrenzen

---

## 17) Onboarding & Tipps

- **Erste Schritte**:
  1. Bewegen, Licht testen (`L`), Karte erkunden.
  2. Erste Gegner **pullen**, nicht überziehen (1–2 max).
  3. Drops looten → **Health Potion** in **Hotbar (1)** legen.
  4. **Erzader** finden (`E`), Material für **Ingot** sammeln.
  5. **Forge** nutzen: `iron_ingot` craften → **Iron Sword** herstellen & ausrüsten.
  6. Skills steigen automatisch mit (Swords/Mining/Smithing).

- **Kampf-Hinweis**: **Position** ist König – Ecke/Engpass nutzen, Ranged auf Distanz halten.
- **Ressourcen**: Pfeile nicht verschwenden; Caster sparen Mana für CC.

---

## 18) Debug/Dev (nur in Non-Release-Builds)

- `F3` Overlay (FPS/Seed/Coords/Profiler)
- `R` reseeded Dungeon
- Optional: Log-Ausgabe von Würfen/Outcomes (Combat-Log)

---

## 19) Beispielwerte (Default, anpassbar)

| Kategorie         | Default                                   |
|-------------------|-------------------------------------------|
| Crit              | 5% Basis (nat20), 1.5× Schaden            |
| Block             | an, 50% Reduktion                         |
| MinDamage         | 1                                         |
| Ranges            | melee 1 · ranged 6 · caster 5             |
| Dodge-Aktion      | 1 Tile Dash, Evade-Bonus bis Zugende      |
| Node Respawn T1   | 120–180 s                                 |
| Craft Zeiten      | Ingot 5s · Potion 4s · Sword 8s           |
| Skill Cap         | 100                                       |

> Diese Vorgaben leben in `data/combat_rules.json` & `data/balance.json`.

---

## 20) Akzeptanzkriterien (Gameplay)

- **Erkunden**: Begehbarer Dungeon, Kollisionen korrekt, Kamera Pixel-Perfect.
- **Engagement**: Sichtkontakt → Initiative-/Encounter-Modus; nach Ende zurück in Exploration.
- **Kampf**: Eine Runde mit Spieler + 3 Gegnern läuft stabil; invalid actions werden abgelehnt (Reichweite/LOS/Ammo).
- **Effekte**: DoT/Buffs/Stun wirken und ticken korrekt; Stun skippt genau 1 Zug (oder wie konfiguriert).
- **Loot**: Drop-Tabellen liefern erwartete Items/Mengen (stochastisch plausibel).
- **Berufe**: Node-Interaktion prüft Tools/Skill, respawned korrekt.
- **Crafting**: Queue/Reservierungen atomar; Erfolg/Fail/Crit gemäß Rezepten.
- **Hotbar**: Consumables nutzbar, Stacks sinken; Fehlpfade (leer) reagieren sauber.
- **Progression**: Skills steigen bei Nutzung; Boni greifen in Formeln.
- **Saves**: Quick/Auto/Manual arbeiten, Save-Policy wird respektiert.
- **Performance**: Zielwerte aus ARCHITECTURE/TOOLING eingehalten.

---

## 21) Glossar

- **Intent**: beabsichtigte Aktion (Move/Attack/Shoot/Cast/Use/Wait).
- **Outcome**: Ergebnis-Event (Hit, Damage, ApplyEffect, Death, Drop).
- **LOS**: Line of Sight – Sichtlinie.
- **Kite-Distanz**: Abstand, den Ranged-Gegner halten wollen.
- **Node**: Sammelstelle (Erz/Baum/Kraut).
- **Station**: Crafting-Ort (Forge/Alchemy).
- **Rarity**: Seltenheit (common/rare/epic).

---

## 22) Roadmap-Hinweise (optional/future)

- **Traits/Perks**: permanente Verbesserungen außerhalb Skills
- **Bossräume**: spezielle Muster/Mechaniken
- **Events**: Raumfallen, Schalter, Türen/Schlösser (`lockpicking`)
- **Handel**: NPC-Shop, Preise aus `value` Feldern der Items
- **Shader-Polish**: Vignette/Scanlines, UI-Animations

---

## 23) Verweise

- **Architektur**: `ARCHITECTURE.md`
- **Tooling/CI**: `TOOLING.md`
- **Datenformate**: `data.md`
- **Tasks**: `task.md` + `tasks/M1..M5.md`
- **Save/Load**: `M5` + `SAVELOAD.md` (falls vorhanden)

> Dieses Dokument ist **spielmechanische Referenz**. Änderungen an Regeln passieren **datengetrieben** (JSON) und werden hier kurz dokumentiert.

## GAMEPLAY – UO Addendum (Skill-Progression, Engagement, Dodge) — UO Addendum

# GAMEPLAY – UO Addendum (Skill-Progression, Engagement, Dodge)

## B) Skill-Progression – Wie genau spielen die Dateien zusammen? — UO Addendum

## B) Skill-Progression – Wie genau spielen die Dateien zusammen?

**Rollen der Dateien**

- `skills.json` — pro Skill `id`, `cap`, `xp_curve` (**Kurven-Profil**), optional `stats`-Affinitäten (STR/DEX/INT/STAM).
- `progression_rules.json` — zentrale **Nutzungs-basierte Gain-Formel** (0.1-Schritte, Sweet-Spot, Slowdown) und **Kurven-Profile** unter `curves` (z. B. `linear`, `slow_start`, `fast_start`).
- `combat_rules.json` — Kampfformeln (Treffer/Parry/Schaden/Initiative/Bewegung/Recovery/Dodge).

**Wichtiger Hinweis**: `xp_curve` in `skills.json` ist **kein** „XP-bis-Level“-System. Es ist ein **Profil-Schlüssel**, der in `progression_rules.json.curves` auf eine Kurve zeigt, die die **Wahrscheinlichkeit eines 0.1-Gains** über den Skillverlauf moduliert.

**Ablauf (Pseudocode)**

```
onSkillUse(skillId, context):
  s = getSkill(actor, skillId)                   # aktueller Wert 0..cap
  cap = getCap(skillId)                          # z. B. 100
  cfg = progression_rules.skill                  # Basiswerte
  curve = progression_rules.curves[ skills[skillId].xp_curve or "linear" ]

  p_success = computeSuccessChance(context)      # 0..1 (HitChance, Craft-Success etc.)
  sweet = 1.0 - abs(p_success - cfg.sweet_spot_center) / 0.5
  slowdown = slowdown_fn(s.value/cap, curve.slowdown)   # z. B. quadratic/cubic/sqrt
  P = clamp(cfg.min_gain,
            cfg.base * curve.base_mult * sweet * slowdown,
            cfg.max_gain)

  if roll() < P:
      s.value = min(cap, s.value + cfg.increment)       # +0.1
      tryStatGains(skillId)                              # Chance je Stat nach Skill-Affinitäten
```

Damit ist klar: **`progression_rules.json` gibt die Formel vor**, `skills.json.xp_curve` **parametrisiert** sie pro Skill.

---

## C) Turn-based Engagement & Runden-Kampf — UO Addendum

## C) Turn-based Engagement & Runden-Kampf

**Auslöser**: Gegner sieht Spieler (Radius + LOS) → **Encounter-Bubble** (Radius 12 Tiles) → **Kampfmodus**.

- **Teilnehmer**: Alle Gegner in der Bubble mit LOS. Neue Gegner, die später eintreten, joinen am **Beginn der nächsten Runde**. Beschwörungen joinen sofort.
- **Entkommen**:
  - Am **Rundenende**: Wenn **kein** Gegner LOS hat **und** Distanz ≥ *leash_break* (10 Tiles) für die gesamte Runde, steigt ein **Disengage-Countdown** (1 Runde). Hält die Bedingung über eine volle Runde → Exploration.
  - Optionale **„Flee“-Aktion** (Hauptaktion): verleiht +leash_margin (leichteres Entkommen) und +evade% bis Zugende.
- **Zeitbasis**: 1 Runde = **3 s** Sim-Zeit.
- **Crafting-Queues**: Laufen auf Rundenzeit **weiter**. Abschlüsse während des Kampfes werden **markiert** und sind nach dem Kampf abholbar (kein UI-Spam).
- **Node-Respawn**: **Pausiert** per Default (Anti-Exploit). Umschaltbar in `world_rules.json`.

---

## D) Die „Dodge“-Aktion — UO Addendum

## D) Die „Dodge“-Aktion

- *Space* ist an die **„Dodge“-Aktion** gebunden:
  - **Hauptaktion**, bewegt **1 Tile** („dash“) und gewährt `+evade%` bis **Zugende**.
  - **Stamina-Kosten** & Werte stehen in `combat_rules.json.dodge`.
  - Beeinflusst **recovery** nicht; blockiert, wenn „immobilized“.
