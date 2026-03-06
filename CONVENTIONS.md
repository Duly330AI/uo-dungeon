# FORD Project Conventions

**Status:** Living Document • **Last Updated:** 2025-10-25

This document defines naming conventions, coding standards, and data format rules for the FORD project. All contributors must follow these conventions to ensure consistency across code, data, and documentation.

---

## 🔤 **Naming Conventions**

### **General Rules**

| Type | Convention | Example | Notes |
|------|------------|---------|-------|
| **File Names** | `snake_case.ext` | `combat_rules.json` | Lowercase, underscores |
| **Directory Names** | `snake_case` | `data/schemas/` | Lowercase, underscores |
| **TypeScript Modules** | `camelCase` oder `kebab-case` | `skillSystem.ts` |  |
| **TypeScript Classes** | `PascalCase` | `SkillSystem` | No underscores |
| **TypeScript Functions** | `camelCase` | `calculateDamage()` | Lowercase, underscores |
| **TypeScript Constants** | `SCREAMING_SNAKE_CASE` | `MAX_SKILL_CAP` | All caps |

---

## 🎮 **Game Data Conventions**

### **IDs (All JSON Data)**

**Rule:** All IDs use `snake_case`, lowercase, descriptive, no abbreviations unless standard.

| Type | Pattern | Examples | ❌ Wrong |
|------|---------|----------|---------|
| **Items** | `{category}_{name}` | `reagent_bloodmoss`, `weapon_broadsword`, `armor_chainmail_tunic` | ~~Bloodmoss~~, ~~broadsword~~, ~~ChainmailTunic~~ |
| **Skills** | `{name}` | `magery`, `swordsmanship`, `evaluate_intelligence` | ~~sorcery~~, ~~Magery~~, ~~eval_int~~ |
| **Spells** | `{name}` | `fireball`, `ice_shards`, `minor_ward` | ~~Fireball~~, ~~IceShards~~, ~~minorWard~~ |
| **Monsters** | `{name}` | `skeleton`, `orc_lord`, `bone_mage` | ~~Skeleton~~, ~~orcLord~~, ~~BoneMage~~ |
| **Quests** | `{short_desc}` | `clear_the_crypt`, `escort_merchant` | ~~clearTheCrypt~~, ~~quest_1~~ |
| **Vendors** | `{location}_{role}` | `abbey_herbalist`, `crypt_blacksmith` | ~~AbbeyHerbalist~~, ~~vendor1~~ |
| **Biomes** | `{type}_{flavor}` | `crypt_undead`, `moor_swamp` | ~~CryptUndead~~, ~~swamp~~ |
| **Factions** | `{name}` | `undead`, `orc`, `daemon` | ~~Undead~~, ~~Orcs~~ |

### **Display Names (Localized)**

**Rule:** Display names are stored in **localization files** (`i18n/en.json`, `i18n/de.json`), not in data files.

**Data files reference IDs only:**

```json
{
  "id": "reagent_bloodmoss",
  "type": "reagent",
  "base_value": 8
}
```

**Localization provides display names:**

```json
{
  "items": {
    "reagent_bloodmoss": {
      "name": "Blood Moss",
      "description": "A crimson moss used in spellcasting."
    }
  }
}
```

**Exception:** `data/spells.json` currently has a `name` field for development convenience. This will be migrated to i18n in Phase 3.

---

## 🎯 **Canonical Names (Reference)**

### **Skills (Final Decision)**

| ID | Display Name (EN) | Display Name (DE) | Notes |
|----|-------------------|-------------------|-------|
| `magery` | Magery | Magie | ✅ **Canonical** (not "sorcery") |
| `evaluate_intelligence` | Evaluate Intelligence | Intelligenz Einschätzen | UO classic name |
| `meditation` | Meditation | Meditation | |
| `resist_spells` | Resisting Spells | Zauberwiderstand | ✅ **Canonical** (not "resisting_spells") |
| `swordsmanship` | Swordsmanship | Schwertkunst | |
| `tactics` | Tactics | Taktik | |
| `anatomy` | Anatomy | Anatomie | |
| `healing` | Healing | Heilkunde | |
| `hiding` | Hiding | Verbergen | |
| `stealth` | Stealth | Schleichen | |

### **Reagents (UO Classic)**

| ID | Display Name (EN) | Display Name (DE) | Item Type |
|----|-------------------|-------------------|-----------|
| `reagent_black_pearl` | Black Pearl | Schwarze Perle | reagent |
| `reagent_bloodmoss` | Blood Moss | Blutmoos | reagent |
| `reagent_garlic` | Garlic | Knoblauch | reagent |
| `reagent_ginseng` | Ginseng | Ginseng | reagent |
| `reagent_mandrake_root` | Mandrake Root | Alraunenwurzel | reagent |
| `reagent_nightshade` | Nightshade | Nachtschatten | reagent |
| `reagent_sulfurous_ash` | Sulfurous Ash | Schwefelasche | reagent |
| `reagent_spiders_silk` | Spider's Silk | Spinnenseide | reagent |

**✅ Always reference by ID in data files!**

---

## 📊 **JSON Schema Conventions**

### **Common Fields**

| Field | Type | Required | Usage |
|-------|------|----------|-------|
| `id` | `string` | ✅ Yes | Unique identifier, snake_case |
| `name` | `string` | ⚠️ Temporary | Display name (will move to i18n) |
| `type` | `string` | ✅ Yes | Category/classification |
| `description` | `string` | ❌ No | Short description (will move to i18n) |

### **Schema Field Names**

**Rule:** Use `name` not `display_name` for consistency.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },  // ✅ Correct
    "type": { "type": "string" }
  }
}
```

---

## 🔧 **Code Conventions**

### **TypeScript Style**

- **Formatter:** Prettier
- **Linter:** ESLint
- **Type Hints:** Required for all functions/components
- **Docstrings:** TSDoc style

### **Import Order**

1. React / Framework imports
2. Third-party packages (lucide-react, etc.)
3. Local application imports

```typescript
# ✅ Good
import React, { useState } from 'react';

import { Shield } from 'lucide-react';

import { SkillSystem } from '../systems/skillSystem';
```

---

## 📁 **File Organization**

### **Data Files**

```
data/
  combat_rules.json           # Core combat mechanics
  skills.json                 # Skill definitions
  spells.json                 # Spell definitions
  items/                      # (Future) Item definitions
  monsters/                   # (Future) Monster definitions
  quests/                     # (Future) Quest definitions
  vendors/                    # (Future) Vendor definitions
  biomes/                     # (Future) Biome definitions
  encounters/                 # (Future) Encounter tables
  schemas/                    # JSON schemas for validation
    *.schema.json
```

### **Documentation**

```
docs/
  ARCHITECTURE*.md            # System architecture
  GAMEPLAY*.md                # Gameplay mechanics
  AI_DESIGN.md                # AI architecture
  COMBAT_RULES.md             # Combat formulas
  MAGIC_SYSTEM.md             # Magic mechanics
  ITEMIZATION_DESIGN.md       # Loot & items
  ECONOMY_AND_VENDORS.md      # Economy
  QUEST_SYSTEM.md             # Quests
  DUNGEON_GENERATOR.md        # Proc-gen
  SOUND_DESIGN.md             # Audio
  WORLD_BIBLE.md              # Lore & factions
  LOCALIZATION.md             # i18n
  RELEASE_PLAN.md             # Packaging
  DEVELOPMENT.md              # Dev setup
  CONVENTIONS.md              # This file
  tasks/                      # Task breakdown
```

---

## 🌐 **Localization Conventions**

### **File Structure**

```
i18n/
  en.json                     # English (base language)
  de.json                     # German
```

### **Key Format**

Hierarchical dot-notation: `category.subcategory.item.field`

```json
{
  "ui": {
    "ok": "OK",
    "cancel": "Cancel"
  },
  "items": {
    "reagent_bloodmoss": {
      "name": "Blood Moss",
      "description": "A crimson moss..."
    }
  },
  "skills": {
    "magery": {
      "name": "Magery",
      "description": "The art of spellcasting."
    }
  }
}
```

---

## ✅ **Validation Rules**

### **CI Checks**

1. **Schema Validation:** All JSON must validate against schemas
2. **Cross-References:** IDs must exist (items, skills, reagents)
3. **Naming Convention:** IDs must match `^[a-z0-9_]+$` pattern
4. **Localization:** All display text must have i18n keys
5. **No Duplicates:** All IDs must be unique within scope

### **Pre-commit Hooks**

- JSON formatting (2-space indent)
- Trailing whitespace removal
- End-of-file fixer
- Markdown linting

---

## 🔄 **Migration Notes**

### **Breaking Changes (Oct 25, 2025)**

**Phase 1 Migration:**

1. ✅ `data/skills.json`: `sorcery` → `magery`
2. ✅ `data/spells.json`: Reagent display names → IDs
3. ✅ `data/schemas/*.json`: `display_name` → `name`
4. ✅ All docs: Updated to use canonical names

**Future Phase 3:**

- Move `name` fields to `i18n/` files
- Remove display text from data files
- Update validation to enforce i18n-only

---

## 📚 **References**

- **Prettier/ESLint:** TypeScript style guide
- **UO Naming:** Classic Ultima Online conventions
- **JSON Schema:** Draft 2020-12 specification
- **i18n:** ICU MessageFormat for pluralization

---

**Questions?** Check `docs/DEVELOPMENT.md` or ask in project chat.
