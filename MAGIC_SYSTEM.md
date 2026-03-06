# MAGIC_SYSTEM (FORD) — Schulen, Kreise, Reagenzien, Casting

## 1) Ziele

- UO-nah, aber vollständig rundenbasiert.
- Magie bleibt ein eigenständiger Build: DPS, CC, Support, Utility.
- Datengetrieben über `spells.json`, `combat_rules.json`, `progression_rules.json`.

---

## 2) Kernskills

- `magery`: Cast-Erfolg, Fizzle-Reduktion, Power-Scaling.
- `evaluate_intelligence`: zusätzlicher Schadensbeitrag.
- `meditation`: Mana-Regeneration, optionale Cast-Zeit-Reduktion.
- `resist_spells`: Resistenz gegen gegnerische Zauber.

---

## 3) Schulen & Kreise

- Schulen: `fire`, `cold`, `poison`, `energy`, `earth` (optional später: `necromancy`).
- Kreise: 1-8 (höherer Kreis = mehr Kosten, mehr Wirkung, höhere Anforderungen).

---

## 4) Reagenzien (Canonical IDs)

Verwendet werden ausschließlich Item-IDs aus `items.json`:

- `reagent_black_pearl`
- `reagent_bloodmoss`
- `reagent_garlic`
- `reagent_ginseng`
- `reagent_mandrake_root`
- `reagent_nightshade`
- `reagent_sulfurous_ash`
- `reagent_spiders_silk`

---

## 5) Zauber-Datenmodell

```json
{
  "id": "fireball",
  "name": "Fireball",
  "school": "fire",
  "circle": 3,
  "cost": {
    "mana": 8,
    "reagents": {
      "reagent_black_pearl": 1,
      "reagent_sulfurous_ash": 1
    }
  },
  "cast_rounds": 1,
  "range_tiles": 5,
  "effects": [
    {
      "type": "damage",
      "element": "fire",
      "base": 18,
      "variance_pct": 0.2,
      "scaling": { "INT": 0.15 }
    }
  ],
  "fizzle": { "base": 0.15, "magery_factor": 0.002 },
  "resist_check": { "type": "resist_spells", "scale": 200 },
  "ai_tags": ["nuke"]
}
```

Regeln:

- Fizzle wird vor Wirkung geprüft; bei Fizzle werden Mana und Reagenzien verbraucht.
- Resist wird verteidigungsseitig über `resist_spells` + Element-Resists berechnet.
- Scrolls können optional ohne `magery`-Check genutzt werden.

---

## 5.1) Fizzle-Mechanik

```python
fizzle_chance = base - (magery_skill * magery_factor)
fizzle_chance = clamp(fizzle_chance, 0.00, 0.50)
```

Parameter:

- `base`: typ. `0.08-0.20` (je Kreis)
- `magery_factor`: typ. `0.0015-0.0020`

Beispiel (Circle 3, Fireball):

```python
base = 0.15
magery_skill = 60
magery_factor = 0.002

fizzle_chance = 0.15 - (60 * 0.002)
              = 0.03  # 3%
```

Grandmaster-Verhalten:

- Bei `magery = 100` und Standardwerten soll High-Circle-Casting nicht mehr mit fixer 10%-Failrate bestraft werden.
- Zielwert: nahe 0% Fizzle bei gut ausgebautem Magier (abhängig von Zauber/Balancing).

---

## 5.2) Mana-Management

Mana-Pool:

```python
mana_max = base_mana + (INT * int_mult)
```

Default:

- `base_mana = 0`
- `int_mult = 1.5`

Regeneration ist rundenbasiert:

- Basis-Rate und Meditation-Boni werden pro Runde verrechnet.
- Keine getrennte Echtzeit-Regeneration; Mana-Regeln sind in Exploration und Combat identisch rundenbasiert.

---

## 5.3) Resist-Check

```python
resist_chance = base_resist + (resist_spells_skill - caster_magery_skill) / scale
resist_chance = clamp(resist_chance, 0.05, 0.95)
```

- `caster_magery_skill` ist der canonical Name.
- Element-Resists wirken danach auf den Endschaden.

---

## 6) Beispiele

- `fireball` (Circle 3): direkter Elementarschaden.
- `ice_shackles` (Circle 4): Root/Move-Reduktion für 1 Runde.
- `poison_cloud` (Circle 5): AoE-DoT.
- `blink` (Circle 3): Positionszauber, interagiert nicht mit Recovery.
- `stone_ward` (Circle 2): temporärer Resist-Buff.

---

## 7) Balance-Leitlinien

- Skill-Gains bleiben usage-basiert (+0.1) und folgen dem Sweet-Spot in `progression_rules`.
- Resist-Deckel pro Element: 75%.
- Magier-Builds werden über Headless-Simulation gegen Melee/Ranged validiert.
