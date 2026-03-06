# FORD Combat Rules - Technical Reference

**Status:** Living Document • **Last Updated:** 2025-10-25

This document describes the mathematical formulas and rules governing turn-based combat in FORD. All formulas reference `data/combat_rules.json` for configurable parameters.

---

## 🎯 **Combat Flow Overview**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ENCOUNTER START                                          │
│    └─> Roll Initiative (all combatants)                     │
│    └─> Sort by Initiative (descending)                      │
│                                                              │
│ 2. TURN START (per combatant)                               │
│    └─> Check Status Effects (DoT, stun, etc.)               │
│    └─> Regenerate Resources (stamina, mana if meditating)   │
│                                                              │
│ 3. ACTION PHASE                                              │
│    ├─> MOVE (up to movement_tiles)                          │
│    ├─> ATTACK (if in range, not stunned)                    │
│    │   ├─> Calculate Hit Chance                             │
│    │   ├─> Roll vs Hit Chance                               │
│    │   ├─> Defender: Roll Parry/Dodge                       │
│    │   └─> On Hit: Calculate Damage                         │
│    ├─> CAST SPELL (if cast_rounds remaining)                │
│    ├─> USE ITEM (consumable, tool, etc.)                    │
│    └─> END TURN (wait, defend, etc.)                        │
│                                                              │
│ 4. TURN END                                                  │
│    └─> Apply Status Effect Ticks                            │
│    └─> Update Recovery Counter                              │
│    └─> Check Victory/Defeat Conditions                      │
│                                                              │
│ 5. ROUND END (all combatants acted)                         │
│    └─> Increment Round Counter                              │
│    └─> Check Engagement Break Conditions                    │
│    └─> Return to Turn Start (next in initiative order)      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚔️ **Hit Chance Formula**

### **Formula:**

```python
hit_chance = base + (atk_skill - def_skill) / skill_scale + (atk_stat - def_stat) / atkdef_scale
hit_chance = clamp(hit_chance, min, max)
```

### **Parameters** (from `combat_rules.json`)

| Parameter | Value | Description |
|-----------|-------|-------------|
| `base` | 0.7 | Baseline hit chance (70%) |
| `atk_skill` | Attacker's weapon skill (0-100) | Swords, Archery, etc. |
| `def_skill` | Defender's weapon skill (0-100) | Active defense via equipped weapon |
| `skill_scale` | 200.0 | Divisor for skill difference |
| `atk_stat` | Attacker's primary stat | STR for melee, DEX for ranged |
| `def_stat` | Defender's primary stat | DEX for dodge, STR for resist |
| `atk_stat_factor` | 0.005 | Multiplier for attack stat |
| `def_stat_factor` | 0.005 | Multiplier for defense stat |
| `atkdef_scale` | 200.0 | Divisor for stat difference |
| `min` | 0.02 | Minimum hit chance (2%) |
| `max` | 0.98 | Maximum hit chance (98%) |

### **Example Calculation:**

**Scenario:** Knight attacks Skeleton (rough parity)

- **Attacker:** Swords 60, STR 70
- **Defender:** Swords 60, DEX 70

```python
# Step 1: Base calculation
hit_chance = 0.7

# Step 2: Skill difference
skill_diff = (60 - 60) / 200.0 = 0.00
hit_chance += 0.00  # = 0.70

# Step 3: Stat difference
stat_diff = (70 - 70) / 200.0 = 0.00
hit_chance += 0.00  # = 0.70

# Step 4: Clamp to [0.02, 0.98]
final_hit_chance = 0.70  # 70%
```

**Result:** 70% chance to hit

---

## 🛡️ **Parry Formula**

**Resolution Order (mandatory):**
1. Calculate `hit_chance` including temporary evade modifiers (e.g. from `dodge`).
2. Roll hit/miss.
3. On hit, roll parry.
4. Apply damage reduction from parry, then final damage.

### **Formula:**

```python
parry_chance = shield_base + (parry_skill / skill_scale) + (dex * dex_factor)
parry_chance = min(parry_chance, cap)
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `shield_base` | 0.10 | Base parry chance with shield (10%) |
| `parry_skill` | Defender's Parrying skill (0-100) | |
| `skill_scale` | 200.0 | Divisor for skill contribution |
| `dex_factor` | 0.0025 | DEX contribution per point |
| `cap` | 0.60 | Maximum parry chance (60%) |
| `damage_reduction` | 0.5 | Damage reduction on successful parry (50%) |

### **Example Calculation:**

**Scenario:** Defender with shield parries attack

- **Parrying Skill:** 50
- **DEX:** 60
- **Shield:** Equipped

```python
# Step 1: Base parry with shield
parry_chance = 0.10

# Step 2: Skill contribution
parry_chance += 50 / 200.0  # +0.25 = 0.35

# Step 3: DEX contribution
parry_chance += 60 * 0.0025  # +0.15 = 0.50

# Step 4: Cap at 60%
final_parry_chance = min(0.50, 0.60) = 0.50  # 50%
```

**Result:** 50% chance to parry (reduces damage by 50% on success)

---

## 💥 **Damage Formula**

### **Formula:**

```python
base_damage = weapon_damage  # From weapon definition
str_bonus = (STR / str_per_bonus) * weapon_damage
tactics_bonus = weapon_damage * (tactics_skill * tactics_mult)
anatomy_bonus = weapon_damage * (anatomy_skill * anatomy_mult)

total_damage = base_damage + str_bonus + tactics_bonus + anatomy_bonus
total_damage = max(total_damage, min_damage)
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `weapon_damage` | From weapon definition | Base weapon damage (e.g., 10 for broadsword) |
| `str_per_bonus` | 10 | STR points needed for +1 weapon damage bonus |
| `tactics_mult` | 0.003 | Tactics skill multiplier (0.3% per point) |
| `anatomy_mult` | 0.002 | Anatomy skill multiplier (0.2% per point) |
| `min_damage` | 1 | Minimum damage on hit |

### **Example Calculation:**

**Scenario:** Broadsword attack

- **Weapon Damage:** 10
- **STR:** 70
- **Tactics:** 60
- **Anatomy:** 40

```python
# Step 1: Base weapon damage
base_damage = 10

# Step 2: STR bonus
str_bonus = (70 / 10) * 10 = 7

# Step 3: Tactics bonus
tactics_bonus = 10 * (60 * 0.003) = 1.8

# Step 4: Anatomy bonus
anatomy_bonus = 10 * (40 * 0.002) = 0.8

# Step 5: Sum all bonuses
total_damage = 10 + 7 + 1.8 + 0.8 = 19.6 ≈ 20
```

**Result:** 20 damage (before armor reduction)

---

## 🏃 **Movement Formula**

### **Formula:**

```python
movement_tiles = base_tiles + floor(DEX / dex_tile_step)
movement_tiles = min(movement_tiles, max_tiles)
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `base_tiles` | 3 | Base movement per turn (3 tiles) |
| `dex_tile_step` | 40 | DEX points for +1 movement tile |
| `max_tiles` | 6 | Maximum movement per turn |

### **Example Calculation:**

**Scenario:** Character movement

- **DEX:** 80

```python
movement_tiles = 3 + floor(80 / 40)
              = 3 + 2 = 5 tiles
```

**Result:** Can move 5 tiles per turn

---

## 🔄 **Recovery (Attack Cooldown)**

### **Formula:**

```python
recovery_turns = weapon_base_delay - floor(DEX / dex_reduction_step)
recovery_turns = max(recovery_turns, 0)
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `weapon_base_delay` | Varies by weapon | Turns before next attack |
| `dex_reduction_step` | 40 | DEX points to reduce recovery by 1 turn |
| `max_recovery` | 3 | Maximum recovery turns |

### **Weapon Base Delays:**

| Weapon | Base Delay | Category |
|--------|------------|----------|
| Dagger, Short Sword | 0 | Fast |
| Long Sword, Maul | 1 | Medium |
| Halberd | 2 | Heavy |
| Heavy Crossbow | 3 | Very Heavy |

### **Example Calculation:**

**Scenario:** Halberd wielder

- **Weapon:** Halberd (base_delay = 2)
- **DEX:** 60

```python
recovery_turns = 2 - floor(60 / 40)
              = 2 - 1 = 1 turn
```

**Result:** Must wait 1 turn after attacking before next attack

---

## 🎲 **Initiative Formula**

### **Formula:**

```python
initiative = random(1-100) + (DEX * dex_weight) + (STAM * stam_weight) + weapon_ready_bonus
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `random(1-100)` | Roll 1-100 | Random integer between 1 and 100 |
| `dex_weight` | 0.8 | DEX contribution weight |
| `stam_weight` | 0.2 | Stamina contribution weight |
| `weapon_ready_bonus` | Varies | Bonus based on weapon category |

### **Weapon Ready Bonuses:**

| Category | Bonus | Examples |
|----------|-------|----------|
| Light | +10 | Dagger, Short Bow |
| Medium | 0 | Long Sword, Mace |
| Heavy | -10 | Halberd, Heavy Crossbow |

### **Example Calculation:**

**Scenario:** Initiative roll

- **Roll:** 65 (random 1-100)
- **DEX:** 70
- **STAM:** 80
- **Weapon:** Long Sword (Medium, +0)

```python
initiative = 65 + (70 * 0.8) + (80 * 0.2) + 0
          = 65 + 56 + 16 + 0
          = 137
```

**Result:** Initiative 137 (higher acts first)

---

## 🏹 **Ranged Combat - Reload**

### **Formula:**

```python
reload_turns = bow_base_reload - floor(DEX / dex_reload_step)
reload_turns = max(reload_turns, 0)
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `bow_base_reload` | 1 | Short/Long Bow reload turns |
| `xbow_base_reload` | 2 | Crossbow reload turns |
| `heavy_xbow_base_reload` | 3 | Heavy Crossbow reload turns |
| `dex_reload_step` | 50 | DEX points to reduce reload by 1 turn |

### **Example Calculation:**

**Scenario:** Crossbow reload

- **Weapon:** Crossbow (base_reload = 2)
- **DEX:** 60

```python
reload_turns = 2 - floor(60 / 50)
            = 2 - 1 = 1 turn
```

**Result:** Must spend 1 turn reloading after firing

---

## 🎭 **Dodge Mechanic**

### **Formula:**

```python
# Combat Dodge (Main Action)
stamina_cost = 15
movement_tiles = 1  # Dash movement
evade_bonus = +0.3  # +30% to avoid attacks until turn end
duration_turns = 1  # Bonus lasts until end of current turn
```

### **Parameters** (from `combat_rules.json`)

| Parameter | Value | Description |
|-----------|-------|-------------|
| `stamina_cost` | 15 | Stamina consumed per dodge |
| `movement_tiles` | 1 | Tiles moved during dodge (dash) |
| `evade_bonus` | 0.3 | Evasion chance increase (+30%) |
| `duration_turns` | 1 | Turns the evade bonus lasts |
| `blocks_recovery` | false | Does not interfere with weapon recovery |
| `requires_clear_path` | true | Cannot dodge into walls/obstacles |

### **Mechanics:**

**Combat Dodge:**

- **Main Action** (consumes turn's primary action)
- Move **1 tile** in any direction (dash)
- Gain **+30% evasion** against all attacks until end of turn
- Costs **15 stamina**
- Does **not** affect weapon recovery counter
- Blocked if **immobilized** (stunned, rooted, etc.)

**Exploration Mode:**

- No separate real-time dodge-roll mechanic
- Space is reserved for turn actions (`dodge` or `end_turn`, depending on bindings)

### **Example Scenario:**

**Turn 1:**

- Knight uses **Dodge** action
- Moves 1 tile away from enemy
- Costs 15 stamina
- Gains +30% evade chance

**Enemy Turn:**

- Orc attacks Knight
- Base hit chance: 70%
- After dodge bonus: 70% - 30% = **40% hit chance**

**Turn 2:**

- Evade bonus expires
- Knight can attack normally (recovery not affected)

---

## ⚡ **Critical Hits**

### **Status:** Disabled (for MVP)

```json
"crit": {
  "enabled": false,
  "chance": 0.02,
  "mult": 1.25
}
```

### **Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `enabled` | false | Critical hits disabled for MVP |
| `chance` | 0.02 | Base crit chance (2%) when enabled |
| `mult` | 1.25 | Damage multiplier on crit (125%) |

### **Future Implementation (Post-MVP):**

**Base Mechanics:**

- **Base Crit Chance:** 2%
- **Crit Multiplier:** 1.25× total damage
- **Visual/Audio:** Special effect + sound on crit

**Skill Modifiers:**

- **Anatomy Skill:** +0.02% crit chance per point (max +2% at 100 skill)
- **Tactics Skill:** +0.01% crit chance per point (max +1% at 100 skill)
- **Total Max Crit:** 5% (2% base + 2% Anatomy + 1% Tactics)

**Weapon Quality:**

- **Exceptional:** +1% crit chance
- **Legendary:** +2% crit chance

**Example Calculation (Future):**

```python
# High-skilled warrior with exceptional weapon
base_crit = 0.02
anatomy_bonus = 80 * 0.0002  # = 0.016 (1.6%)
tactics_bonus = 70 * 0.0001  # = 0.007 (0.7%)
weapon_bonus = 0.01  # Exceptional

total_crit_chance = base_crit + anatomy_bonus + tactics_bonus + weapon_bonus
                  = 0.02 + 0.016 + 0.007 + 0.01
                  = 0.053  # 5.3% crit chance
```

---

## 🏹 **Ranged Combat - Advanced**

### **Ammunition System:**

**Ammunition Types:**

- **Arrows:** Used by bows (Short Bow, Long Bow)
- **Bolts:** Used by crossbows (Crossbow, Heavy Crossbow)

**Mechanics:**

- **1 ammo consumed per shot**
- **No ammo = Cannot attack**
- **Fallback behavior** (configurable):
  - `fail`: Cannot shoot, turn wasted
  - `fallback_melee`: Use equipped melee weapon (if any)

### **Reload Mechanics (Detailed):**

**Reload Turn Requirements:**

```python
reload_turns = weapon_base_reload - floor(DEX / dex_reload_step)
reload_turns = max(reload_turns, 0)
```

**Reload Turn Table:**

| Weapon | Base Reload | DEX 0 | DEX 50 | DEX 100 |
|--------|-------------|-------|--------|---------|
| Short Bow | 1 | 1 turn | 0 turns | 0 turns |
| Long Bow | 1 | 1 turn | 0 turns | 0 turns |
| Crossbow | 2 | 2 turns | 1 turn | 0 turns |
| Heavy Crossbow | 3 | 3 turns | 2 turns | 1 turn |

**State Machine:**

1. **Ready** → Fire (consumes ammo) → **Reloading**
2. **Reloading** → Wait N turns → **Ready**
3. If **no ammo**: Cannot transition to Ready

### **Range & Accuracy:**

**Standard Ranges:**

- **Melee:** 1 tile
- **Ranged (Bow/Crossbow):** 6 tiles
- **Magic:** 5 tiles (varies by spell)

**Future Range Modifiers (Post-MVP):**

- **Point-Blank (1-2 tiles):** +10% hit chance
- **Optimal (3-5 tiles):** No modifier
- **Long Range (6+ tiles):** -10% hit chance per tile beyond 6

### **Movement Penalties:**

**Current (MVP):**

- No movement penalty for ranged attacks

**Future:**

- **Moved this turn:** -15% hit chance
- **Stationary (didn't move):** +5% hit chance

---

## 📊 **Combat Resolution Example**

### **Full Combat Turn Walkthrough:**

**Actors:**

- **Knight:** HP 100, STR 70, DEX 50, Swords 60, Tactics 50, Anatomy 40
- **Orc:** HP 80, STR 60, DEX 40, Swords 30, Parrying 20 (shield)

**Weapon:** Knight uses Broadsword (damage 10, recovery 1)

---

**STEP 1: Initiative**

```python
Knight: random(1-100) → 75 + (50 * 0.8) + (80 * 0.2) + 0 = 131
Orc:    random(1-100) → 45 + (40 * 0.8) + (60 * 0.2) + 0 = 89

Turn Order: Knight → Orc
```

---

**STEP 2: Knight's Turn - Attack**

**2.1 - Calculate Hit Chance:**

```python
hit_chance = 0.7 + (60 - 30) / 200.0 + (70 - 40) / 200.0
          = 0.7 + 0.15 + 0.15 = 1.00  # -> clamped to 0.98

Roll: 0.63 → HIT!
```

**2.2 - Orc Parry Roll:**

```python
parry_chance = 0.10 + (20 / 200.0) + (40 * 0.0025)
            = 0.10 + 0.10 + 0.10 = 0.30  # 30%

Roll: 0.75 → FAIL (no parry)
```

**2.3 - Calculate Damage:**

```python
base_damage = 10
str_bonus = (70 / 10) * 10 = 7
tactics_bonus = 10 * (50 * 0.003) = 1.5
anatomy_bonus = 10 * (40 * 0.002) = 0.8

total_damage = 10 + 7 + 1.5 + 0.8 = 19.3 ≈ 19
```

**Result:** Orc takes 19 damage (HP: 80 → 61)

**2.4 - Knight Recovery:**

```python
recovery_turns = 1 - floor(50 / 40) = 1 - 1 = 0
```

Knight can attack again next turn!

---

**STEP 3: Orc's Turn - Attack**

```python
hit_chance = 0.7 + (30 - 60) / 200.0 + (60 - 50) / 200.0
          = 0.7 - 0.15 + 0.05 = 0.60  # 60%

Roll: 0.55 → HIT!
```

Orc misses the attack.

---

**Round 1 Complete:** Knight dealt 19 damage, Orc dealt 0.

---

## 🎓 **Design Notes**

### **Skill Caps & Balancing:**

- **Sweet Spot:** 50 skill = competitive performance
- **Skill Scale 200:** ±100 skill difference = ±50% hit chance shift
- **Stat Scale 200:** ±100 stat difference = ±50% modifier shift
- **Parry Cap 60%:** Prevents full block builds, encourages offense
- **Effective Avoidance Cap 85%:** Combined dodge/parry interactions cannot exceed this cap
- **Min Hit 2%:** Always some risk, no invulnerability
- **Max Hit 98%:** Always some uncertainty, no guarantees

### **Turn Economy:**

- **Fast Weapons (0 recovery):** Lower damage, more turns
- **Heavy Weapons (2-3 recovery):** Higher damage, fewer turns
- **Movement 3-6 tiles:** Enough for tactical positioning
- **DEX value:** Affects movement, recovery, reload, initiative
- **Defense order clarity:** Dodge modifies hit chance; parry is only rolled on successful hits

### **Skill Synergies:**

| Build | Core Skills | Strategy |
|-------|-------------|----------|
| **Melee Tank** | Swords, Tactics, Parrying | High defense, consistent damage |
| **Archer** | Archery, Tactics, Anatomy | Positioning, burst damage |
| **Berserker** | Mace, Tactics, Anatomy, STR | High damage, no defense |
| **Duelist** | Fencing, Anatomy, Parrying, DEX | Fast attacks, moderate defense |

---

## 📁 **Related Files**

- **Data:** `data/combat_rules.json` - Configurable parameters
- **Code:** `game/systems/combat_system.py` - Implementation
- **Docs:** `docs/GAMEPLAY.md` - Combat mechanics overview
- **Docs:** `docs/GAMEPLAY_ADDENDUM_UO.md` - UO-specific rules

---

## 🔧 **Testing & Validation**

### **Validation Checklist:**

- [ ] Hit chance stays within [2%, 98%]
- [ ] Parry chance caps at 60%
- [ ] Damage is always ≥ 1
- [ ] Movement is within [3, 6] tiles
- [ ] Recovery is ≥ 0 turns
- [ ] Initiative rolls are deterministic with seed

### **Test Scenarios:**

1. **Skill Parity:** 50/50 skills → 70% hit chance
2. **Skill Dominance:** 100 vs 0 → 98% hit chance (capped)
3. **Skill Disadvantage:** 0 vs 100 → 2% hit chance (capped)
4. **Max Parry:** 100 Parrying, 100 DEX → 60% (capped)
5. **Zero Recovery:** 100 DEX with Dagger → 0 recovery
6. **Max Movement:** 100 DEX → 5 tiles (base 3 + 2)

---

**Questions?** Check `docs/ARCHITECTURE_UO_ADDENDUM.md` for implementation details.
