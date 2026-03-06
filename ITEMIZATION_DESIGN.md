# ITEMIZATION_DESIGN (FORD) — Raritäten, Affixe, Materials, Uniques

## 1) Philosophie
- **Lesbar & Systemisch:** Wenige, sinnvolle Mods; Materialien & Fraktionen prägen Affix‑Gewichte.
- **UO‑Gefühl:** Qualität + Skill + Material‑Tiers > reines „Itemlevel“.
- **Deterministisch:** Seeds je Drop; JSON‑getrieben (items/affixes/uniques/loot_tables).

---

## 2) Raritäten & Power‑Budget
`common < uncommon < rare < epic < legendary`

| Rarity    | Affix‑Slots | Budget (Bsp.) | Quelle                                   |
|-----------|-------------|----------------|------------------------------------------|
| common    | 0–1         | 1              | Basiskisten, T1‑Mobs                     |
| uncommon  | 1–2         | 2              | T1‑Elite, T2‑Zonen                       |
| rare      | 2–3         | 4              | Dungeons, Named                          |
| epic      | 3–4         | 7              | Lich/Daemon‑Zonen, Boss                  |
| legendary | 4–5         | 10             | Unique‑Quellen, Signatur‑Events          |

**Budgetregeln (Daumen):** +1 **ATK** ≈ 1 Budget; +2% **Resist** ≈ 1 Budget; starker Proc 2–4.

---

## 3) Affixe (Prefix/Suffix) — Beispiele
**Prefix (Offensiv/Handling):**
- `keen` (+ATK), `weighted` (+Base‑Dmg), `quick` (−Recovery, min 0), `balanced` (+HitChance),
- `trueflight` (Bogen: +Reichweite), `channeling` (Stab: Fizzle −x%).

**Suffix (Defensiv/Utility):**
- `of_guarding` (+Parry%), `of_ash` (+Fire‑Res), `of_venom` (+Poison‑Res),
- `of_the_kestrel` (Bogen: +Move‑Tiles beim Schuss), `of_focus` (+Mana).

**Konflikte:** `quick` × `weighted`; caster‑Prefix nur auf Stab/Schmuck.

---

## 4) Materials & Tiers (Auszug)
- **Metall:** Iron → Bronze → Verite → Valorite (Dmg/Resist leicht ↑, Gewicht ↑).
- **Holz:** Normal → Oak → Yew → Heartwood (Bogen‑Reload ↓, Durability ↑).
- **Leder/Stoff:** beweglich vs. Schutz; Mods auf Resists/Weight.

---

## 5) Uniques & Sets
- **Uniques (Named):** feste Mods + Lore‑Flair, geringe Varianz; Drop an Named/Boss.
- **Sets:** 2–4 Teile; stufenweise Boni (2pc/3pc/4pc).

---

## 6) JSON‑Skizzen
**`data/affixes.json`**
```json
{
  "prefix": {
    "keen":      { "slot": "weapon", "mods": { "atk": "+1..+3" } },
    "weighted":  { "slot": "weapon", "mods": { "base_dmg": "+1..+2" } },
    "quick":     { "slot": "weapon", "mods": { "recovery": "-1..-1" }, "conflicts": ["weighted"] },
    "channeling":{ "slot": "staff|jewelry", "mods": { "fizzle_pct": "-2..-6" } }
  },
  "suffix": {
    "of_guarding": { "slot": "weapon|shield", "mods": { "parry_pct": "+2..+6" } },
    "of_ash":      { "slot": "armor", "mods": { "res_fire": "+3..+8" } }
  }
}
```

**`data/uniques.json`**
```json
{
  "blackthorns_remnant": {
    "base_id": "broadsword",
    "rarity": "epic",
    "mods": { "atk": 2, "base_dmg": 1, "recovery": -1, "parry_undead_pct": 3 },
    "lore": "Ein Dornfragment, in Stahl gefasst."
  }
}
```

---

## 7) Generator (vereinfacht)
1) Basis‑Item → 2) Rarität würfeln → 3) Slots/Budget → 4) Affixe picken (Biome/Fraktion)
→ 5) Roll innerhalb Min/Max → 6) Mods anwenden → 7) Seed speichern.

---

## 8) Balancing‑Leitplanken
- **Min‑Schaden** 1, **Recovery** nicht unter 0.
- Resists clamp 75%. Procs mit internen Cooldowns.
- Uniques über Budget, aber mit Tradeoffs (Gewicht, Resist‑Lücken).
