# AI DESIGN – Datengetriebene Gegner-Logik (UO-Feeling, vollständig rundenbasiert)

**Ziel**: Eine robuste, datengetriebene K.I., die
- im **Exploration-Modus** glaubwürdig patrouilliert/reagiert,
- beim **Kampfeintritt** rundenbasiert agiert (Utility-AI), inkl. **Synergien** (Melee schützt Caster, Archer kitet),
- optional später Fraktionskonflikte zwischen NPCs unterstützen kann,
- mit unseren bestehenden Dateien zusammenspielt: `monsters.json`, `data/combat_rules.json`, `data/progression_rules.json`,
- und sich klar & performant implementieren lässt.

> Begriffe: *Actor* = jede Einheit (Spieler, Monster, NPC).

---

## 1) High‑Level Architektur

**Schichten** (laufzeitlich):
1. **Perception** (Sicht/Hören/Bedrohungs‑Memory)
2. **Intent** (Zielwahl + Utility‑Scoring pro Taktik)
3. **Taktik/Plan** (Mikro‑Ziele: flanken, schützen, kiten, casten…)
4. **Bewegung** (Pathfinding, Leash, Hindernisse, Zonen)
5. **Aktion** (Attack/Cast/Use/Dodge gemäß `combat_rules.json`)
6. **Koordination** (Signale/Ereignisse wie „Beschützt Caster“)
7. **Regelwerke** (datengetrieben: `ai/*.json`, `combat_rules.json`)

**Datenquellen** (vorgeschlagen):
```
ai/factions.json         # Diplomatie-Matrix, Aggro-Settings
ai/behaviors.json        # Archetypen: melee/ranged/caster/scout/shaman/guardian
ai/tactics.json          # Utility-Regeln (Scores & Gewichte) pro Archetyp
ai/blackboard_keys.json  # standardisierte Kontextdaten (Threat, Ziele, Memory)
```

---

## 2) Faktionen & Diplomatie (MVP: spielerzentriert)

**Konzept**: Jede Einheit trägt `faction`. Eine Diplomatie-Matrix entscheidet **Freund/Neutral/Feind** (-1..+1).
Im MVP werden Konflikte primär in Spieler-Nähe aufgelöst; autonome AI-vs-AI-Weltkriege sind Post-MVP.

**Beispiel `ai/factions.json`:**
```json
{
  "relations": {
    "player":   {"player": 1,  "orc": -1, "undead": -1, "wildlife": 0, "daemon": -1},
    "orc":      {"player": -1, "orc": 1,  "undead": -1, "wildlife": 0, "daemon": -1},
    "undead":   {"player": -1, "orc": -1, "undead": 1,  "wildlife": -1, "daemon": -1},
    "wildlife": {"player": 0,  "orc": 0,  "undead": -1, "wildlife": 0, "daemon": -1},
    "daemon":   {"player": -1, "orc": -1, "undead": -1, "wildlife": -1, "daemon": 1}
  },
  "defaults": {
    "aggro_radius_tiles": 8,
    "call_for_help_radius": 10,
    "mutual_enemy_bias": 0.2     // tendiert zu Fokus auf stärksten gemeinsamen Feind
  }
}
```

**Exploration**: Gegner werden in Spieler-Nähe simuliert. Encounter-Bubble und Initiative regeln den Übergang in taktische Kämpfe.

---

## 3) Perception & Threat‑Memory

**Perception** liefert eine Liste **sichtbarer/gehörter** Ziele inkl. weicher Werte:
- `visibility`: 0..1 (Sichtqualität; beeinflusst Target‑Score)
- `noise`: 0..1 (gehört)
- `last_seen_at`: Position + Zeit (für **Suche**/„Investigate“)

**Threat‑Memory** (pro Actor Mini‑Map):
- `threat[entityId] = decay(threat + damageDealt*α + lastAttackerBonus + proximity*β)`
- Decay über Zeit, capped; erleichtert **Fokuswechsel** ohne zu „hüpfen“.

---

## 4) Utility‑AI: Zielwahl & Taktik

**Idee**: Keine starre Behavior‑Tree‑Verzweigung, sondern **Scores** je Option. Höchster Score gewinnt (mit leichter Stochastik, um Muster aufzulockern).

**Ziel‑Score** (vereinfacht):
```
Score(target) =
  w_threat * Threat(target) +
  w_dist   * fDist(distanceTiles) +
  w_hp     * (1 - target.HP%) +
  w_role   * RoleBias(target) +
  w_mutual * MutualEnemy(target)   // aus factions.defaults.mutual_enemy_bias
```
`RoleBias`: z. B. Caster priorisiert **niedrige Resistenz** oder Feinde ohne Parry/Shield.

**Taktik‑Score** (pro Archetyp aus `ai/tactics.json`):
- **melee_guard_caster**: +Score, wenn ein verbündeter Caster in 6 Tiles steht und bedroht ist.
- **ranged_kite**: +Score, wenn Distanz < sweet‑spot; wählt „Kite‑Move“ statt Standkampf.
- **caster_debuff**: +Score, wenn Ziel hohe DEF hat; wählt Debuff statt Damage.

**Beispiel `ai/tactics.json` (Auszug):**
```json
{
  "melee": {
    "actions": {
      "attack_melee": {"base": 0.7, "dist_pref": {"ideal": 1, "falloff": 0.2}},
      "guard_ally":   {"base": 0.5, "ally_role": "caster", "radius": 6},
      "chase":        {"base": 0.4},
      "flee":         {"base": 0.1, "hp_threshold": 0.15}
    }
  },
  "ranged": {
    "actions": {
      "shoot":  {"base": 0.7, "dist_pref": {"ideal": 4, "falloff": 0.1}},
      "kite":   {"base": 0.6, "min_dist": 3, "max_dist": 5},
      "switch": {"base": 0.2, "ammo_low": 3}  // z. B. Waffe wechseln/fliehen
    }
  },
  "caster": {
    "actions": {
      "debuff": {"base": 0.6, "target_def_high": true},
      "nuke":   {"base": 0.5},
      "fear":   {"base": 0.3, "if_outnumbered": 1.5}
    }
  }
}
```

---

## 5) Kampf (Rundenbasiert) – Entscheidungsablauf

**Bei Beginn des Actor‑Zuges**:
1. **Blackboard aktualisieren** (Perception, Threat, Status, Ammo, Cooldowns).
2. **Zielwahl** via Ziel‑Score (s. oben). Falls kein Ziel: *Hold/Patrol*.
3. **Aktionen scoren** (taktikspezifisch). Beispiel‑Aktionen:
   - `Attack` (melee/shoot/cast) – prüfe Reichweite, Recovery, Ammo/Mana, LOS
   - `MoveTo` (näher dran/weg, Deckung, Flank)
   - `Guard` (positioniert sich bei Verbündetem; gewährt Parry‑Bonus)
   - `Dodge` (wenn stark bedroht, s. `combat_rules.json.dodge`)
   - `UseItem` (Trank, Scroll), `Flee` (unter HP‑Schwelle), `Taunt` (Aggro‑Manipulation)

4. **Aktion ausführen** → Engine nutzt `combat_rules.json` (Hit/Parry/Schaden/Recovery).
5. **Koordination**: Falls konfiguriert, **Events** senden (z. B. „Guard me!“, „Focus Target!“).

---

## 6) Bewegung & Pfadfindung

- **Grid‑Pfad**: A* (Manhattan/Diagonal), Kosten: Geländetyp + Gefahren (Feuer/Spikes).
- **Leash**: Distanz zur Spawn‑Zone begrenzen, sonst **Leash‑State** (Rückzug).
- **Kiten** (Ranged): Zielkreis [min,max] Distanz anstreben, Pfad am Ziel vorbei.
- **Flanken**: Suche Position mit gleicher Distanz aber **besserem Winkel** (falls Richtung relevant).
- **Kollisionsvermeidung**: einfache **Reservation** pro Tile für die aktuelle Runde.

---

## 7) Beispiel‑Daten & Mapping

**monsters.json (Erweiterungsvorschlag pro Eintrag):**
```json
{
  "id": "orc",
  "hp": 20,
  "speed": 1.1,
  "ai": "melee",
  "faction": "orc",
  "loot_table": "orc_common",
  "ai_tags": ["aggressive", "pack_hunter"],
  "ai_exploration": {"patrol": true, "leash": 12, "aggro_radius": 8},
  "ai_combat": {"role": "melee", "preferred_target": "lowest_armor"}
}
```

**ai/behaviors.json (Archetypen):**
```json
{
  "melee":   {"engage_range": 1, "base_delay_class": "medium", "prefer_guard_caster": true},
  "ranged":  {"engage_range": 6, "kite_min": 3, "kite_max": 5},
  "caster":  {"engage_range": 5, "use_debuff_first": true}
}
```

**ai/blackboard_keys.json (Auszug):**
```json
{
  "threat": "map<entityId, number>",
  "focusTarget": "entityId|null",
  "allyInNeed": "entityId|null",
  "lastHurtBy": "entityId|null",
  "ammo": "number",
  "mana": "number",
  "recovery": "number",
  "position": "tile",
  "los": "map<entityId, bool>"
}
```

---

## 8) Implementierung – Pseudocode (TypeScript‑artig)

> Die Engine ist rundenbasiert; pro Actor‑Zug treffen wir eine **einzelne** Hauptentscheidung.

```ts
type Actor = {
  id: string;
  faction: string;
  role: "melee"|"ranged"|"caster";
  stats: { STR:number, DEX:number, INT:number, STAM:number };
  hp: number; pos: Tile; recovery: number;
  ammo?: number; mana?: number;
  blackboard: Blackboard;
};

function takeTurn(actor: Actor, ctx: CombatContext) {
  updatePerception(actor, ctx);
  updateThreat(actor, ctx);
  const target = pickTarget(actor, ctx);                // Utility: Ziel-Score
  if (!target) return Action.Wait();

  // Aktionen scoren
  const options: Scored<Action> = [];
  if (canAttack(actor, target, ctx)) options.push(scoreAttack(actor, target, ctx));
  options.push(scoreMove(actor, target, ctx));          // näher/weiter/flank/kite
  if (shouldGuardAlly(actor, ctx)) options.push(scoreGuard(actor, ctx));
  if (shouldDodge(actor, ctx)) options.push(scoreDodge(actor, ctx));
  if (shouldFlee(actor, ctx)) options.push(scoreFlee(actor, ctx));
  // weitere taktische Optionen…

  // Gewinner mit leichter Zufallskomponente (ε-greedy)
  const chosen = pickByScore(options);

  return exec(chosen, actor, ctx);                      // ruft Engine-APIs, nutzt combat_rules.json
}
```

**Zielwahl (Utility‑Scoring):**
```ts
function pickTarget(actor: Actor, ctx: CombatContext): Actor|undefined {
  const enemies = ctx.actors.filter(a => relation(actor.faction, a.faction) < 0 && ctx.los(actor,a));
  if (enemies.length === 0) return undefined;
  let best: Actor|undefined, bestScore = -Infinity;
  for (const e of enemies) {
    const d = distance(actor.pos, e.pos);
    const score =
      W.threat * threatOf(actor, e) +
      W.dist   * distScore(d, actor.role) +
      W.hp     * (1 - e.hp / e.maxHp) +
      W.role   * roleBias(actor.role, e) +
      W.mutual * mutualEnemyBias(actor, e, enemies);
    if (score > bestScore) { best = e; bestScore = score; }
  }
  return best;
}
```

**Kiten (Ranged):**
```ts
function scoreMove(actor: Actor, target: Actor, ctx: CombatContext): Scored<Action> {
  const d = distance(actor.pos, target.pos);
  if (actor.role === "ranged") {
    const idealMin = 3, idealMax = 5;
    if (d < idealMin) {
      const to = findRetreatTile(actor, target, ctx);
      return { action: Action.Move(to), score: 0.6 + (idealMin - d) * 0.1 };
    }
    if (d > idealMax) {
      const to = stepToward(actor.pos, target.pos, ctx);
      return { action: Action.Move(to), score: 0.5 + (d - idealMax) * 0.05 };
    }
  }
  // melee default: nähert sich
  const to = stepToward(actor.pos, target.pos, ctx);
  return { action: Action.Move(to), score: 0.4 };
}
```

**Guard Caster (Melee schützt Caster):**
```ts
function shouldGuardAlly(actor: Actor, ctx: CombatContext) {
  if (actor.role !== "melee") return false;
  const allyCasterInDanger = ctx.actors.find(a =>
    a.faction === actor.faction &&
    a.role === "caster" &&
    distance(actor.pos, a.pos) <= 6 &&
    isThreatened(a, ctx));
  actor.blackboard.allyInNeed = allyCasterInDanger?.id ?? null;
  return !!allyCasterInDanger;
}
```

**Dodge im Kampf (als Aktion mit Regeln aus `combat_rules.json`):**
```ts
function shouldDodge(actor: Actor, ctx: CombatContext) {
  if (actor.recovery > 0) return false;              // kein Dodge während Recovery
  const incoming = projectedDamageTo(actor, ctx);    // heuristischer Schätzer
  return incoming >= actor.hp * 0.35;                // z. B. Dodge ab 35% HP-Bedrohung
}
```

---

## 9) Exploration-AI (rundenbasiert) kurz

- Perception und Zielwahl laufen pro Simulationsrunde (LOS-Cache, eventbasiert).
- **Zustände**: `Idle/Patrol → Investigate (Geräusch) → Chase/Attack → LeashReturn → Idle`.
- AI-vs-AI bleibt eine optionale Erweiterung, nicht Teil des MVP-Kerns.

---

## 10) Performance & Stabilität

- **Tick‑Budget**: pro Frame nur N Akteure voll „denken“ lassen, Rest stichprobenartig.
- **LOS‑Cache** (RLE oder Bitmask) pro Zelle, invalidieren bei Bewegung/Hindernisänderung.
- **A***: Path‑Reuse (Zwischenziele), Abbruch nach Kostenbudget; bei Abbruch → „greedy step“.
- **Threat‑Decay**/Clamping: Glättet Fokuswechsel; verhindert Flip‑Flop.
- **Stochastik ε**: 5–10% Zufall in `pickByScore` verhindert deterministische Loops.

---

## 11) Debugging & Telemetrie

- Overlay‑Layer: LOS‑Kegel, Ziel‑Pfeil, Pfad, aktuelles Taktik‑Label („kite“, „guard“, „nuke“).
- Heatmaps: Aufenthaltsdichte, Knoten mit hohen Pfadkosten, „tote“ Winkel.
- Log‑Events: `AI:target_changed`, `AI:tactic`, `AI:flee`, `AI:call_for_help`.

---

## 12) QA‑Szenarien (kurz)

1. **Encounter-Fokus**: Orc-Patrouille trifft Spieler in Bubble -> Zielwahl und Fokuswechsel prüfen.
2. **Caster‑Schutz**: Melee flankiert/guarded, Caster debufft, Archer kitet.
3. **Leash/Disengage**: Langer Kite → Gegner leashed korrekt zurück.
4. **Ammo knapp**: Archer wechselt Verhalten (kite/retreat) unter Ammo‑Schwelle.
5. **Flee**: Unter 15% HP & unterlegen → Flee statt sinnlosem Attack‑Spam.

---

## 13) Hooks zu existierenden Dateien

- **`monsters.json`**: `ai`, `faction`, optionale `ai_*`‑Blöcke (Exploration/Combat).
- **`data/combat_rules.json`**: Range, Movement, Recovery, Dodge – AI fragt diese Werte **vor** Aktionswahl ab.
- **`data/progression_rules.json`**: irrelevant für Entscheidung, aber **Skill‑Uses** feuern den **usage‑Gain** (auch bei Fehlschlägen), d. h. AI‑Aktionen treiben Skills voran (UO‑like).

---

## 14) Erweiterungen

- **Moral/Fear**: Gruppen‑Moral als Zusatzscore (bricht bei Leader‑Tod schneller).
- **Boss‑Phasen**: Phasenabhängige Taktik‑Gewichte (Adds spawnen, Enrage).
- **Deckungssystem**: Ranged bevorzugt Tiles mit Cover‑Score.
- **Influence‑Maps**: Für „No‑Go“‑Zonen (Feuer, Fallen), global vorab berechnet.
