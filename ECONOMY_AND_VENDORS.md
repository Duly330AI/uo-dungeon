
# Ökonomie & Händler (NPC-Vendors, Preisformeln, Sinks)

**Stand:** 2025-10-25 · **Leitbild:** UO-Feeling mit klaren Gold-Sinks (Reparatur, Reagenzien, Reisen).

## Kernprinzipien

- **Einfaches Wertschema**: Item-Basiswert × Seltenheitsfaktor × Qualitätsmod.
- **Buy/Sell-Spread**: Händler kaufen günstiger als sie verkaufen.
- **Fraktions-/Ruf-Hooks**: Discounts/Markups optional.
- **Restock**: Periodisch, mit regionalem Flavor (Biomes).

## Daten

### `data/items/*.json` (Ausschnitt)
```json
{
  "id": "reagent_bloodmoss",
  "display_name": "Blood Moss",
  "type": "reagent",
  "base_value": 8,
  "rarity": "common",
  "weight": 0.1
}
```

### `data/vendors/*.json`
```json
{
  "id": "abbey_herbalist",
  "name": "Herbalist Marta",
  "biomes": ["crypt_undead", "moor_swamp"],
  "categories": ["reagents", "consumables"],
  "modifiers": {"buy": 1.00, "sell": 0.55},
  "inventory": [
    {"item_id": "reagent_bloodmoss", "min": 5, "max": 20, "restock_turns": 1200},
    {"item_id": "bandage", "min": 10, "max": 30, "restock_turns": 800}
  ]
}
```

## Preisformel

```
price_sell_to_player  = base_value * rarity_factor * quality_mod * vendor.modifiers.buy
price_buy_from_player = base_value * rarity_factor * quality_mod * vendor.modifiers.sell
```

`rarity_factor`: common 1.0 · uncommon 1.5 · rare 2.5 · epic 5.0 (konfigurierbar).
`quality_mod`: broken 0.4 · worn 0.7 · normal 1.0 · fine 1.2 · masterwork 1.6.

## Gold-Sinks (MVP)

- Reparaturen (skaliert mit Item-Tier).
- Schnellreise/Mark-MoonGate (Gebühr).
- Quest-Gebühren (Zulassung/Prüfungen).

## Schnittstellen

```python
class Economy:
    def price_for_player(self, item_id, vendor_id, quality="normal"): ...
    def transact(self, actor_id, vendor_id, items_to_buy, items_to_sell): ...
    def restock_tick(self, turns_elapsed): ...
```
