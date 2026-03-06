# FORD Tutorial & FTUE (First Time User Experience)

**Status:** Living Document • **Last Updated:** 2025-10-25

This document defines the First Time User Experience (FTUE) for FORD, covering the first 15 minutes of gameplay from character creation to the first quest completion.

---

## 🎯 **FTUE Goals**

| Goal | Why | Success Metric |
|------|-----|----------------|
| **Teach Core Mechanics** | Movement, combat, inventory, skills | Player completes tutorial quest |
| **Establish Tone** | Dark fantasy, UO-inspired, player agency | Player feels immersed |
| **Build Confidence** | Gradual difficulty curve, clear feedback | Player feels capable, not overwhelmed |
| **Create Investment** | Hook with story, mystery, progression | Player wants to continue |
| **Respect Player Time** | No excessive text, skip option available | < 15 minutes to first quest |

---

## 📊 **FTUE Flow (15 Minutes)**

```
┌────────────────────────────────────────────────────────────┐
│ PHASE 1: CHARACTER CREATION (2 min)                        │
│  └─> Name, Visual, Starting Skills (template or custom)   │
│                                                            │
│ PHASE 2: INTRO & CONTEXT (1 min)                          │
│  └─> Brief narration, wake up in Abbey, meet Guide        │
│                                                            │
│ PHASE 3: MOVEMENT & INTERACTION (2 min)                   │
│  └─> Walk around Abbey courtyard, interact with objects   │
│                                                            │
│ PHASE 4: INVENTORY & UI (2 min)                           │
│  └─> Open inventory, equip weapon, use item               │
│                                                            │
│ PHASE 5: FIRST COMBAT (4 min)                             │
│  └─> Fight 1 skeleton (tutorial prompts), learn turns     │
│                                                            │
│ PHASE 6: QUEST INTRO (2 min)                              │
│  └─> Receive quest "Clear the Crypt", explore objectives  │
│                                                            │
│ PHASE 7: FREE EXPLORATION (2 min+)                        │
│  └─> Tutorial complete, player free to explore            │
└────────────────────────────────────────────────────────────┘
```

---

## 👤 **Phase 1: Character Creation (2 min)**

### **Screen: New Character**

**UI Elements:**

- Character preview (placeholder sprite)
- Name input field
- Starting template selector
- Optional: Advanced customization toggle

### **Starting Templates:**

| Template | Skills (3 at 50) | Stats | Gear | Description |
|----------|------------------|-------|------|-------------|
| **Warrior** | Swords 50, Tactics 50, Parrying 50 | STR 70, DEX 50, INT 30 | Short Sword, Wooden Shield, Chainmail Tunic | Balanced melee fighter |
| **Mage** | Magery 50, Meditation 50, Evaluate Intelligence 50 | STR 30, DEX 40, INT 80 | Quarterstaff, Robe, 50x mixed reagents | Pure spellcaster |
| **Ranger** | Archery 50, Tactics 50, Hiding 50 | STR 50, DEX 70, INT 30 | Short Bow, 50 arrows, Leather Armor | Ranged skirmisher |
| **Rogue** | Swords 50, Hiding 50, Stealth 50 | STR 40, DEX 80, INT 30 | Dagger, Leather Armor | Stealth & speed |
| **Paladin** | Swords 50, Chivalry 50, Healing 50 | STR 60, DEX 40, INT 50 | Long Sword, Heater Shield, Platemail | Holy warrior |
| **Custom** | Choose 3 skills (50 each) | Distribute 150 points | Starting gear based on skills | Full customization |

### **UX Flow:**

```
1. Player clicks "New Game"
2. Name input → "What is your name, traveler?"
3. Template selection → 6 cards (5 presets + Custom)
4. [Optional] Advanced → Skill point distribution, stat allocation
5. Confirm → "Begin your journey?"
6. Fade to black → Intro narration
```

**Design Note:**

- **Presets are ENCOURAGED** for new players (bold text, "Recommended")
- **Custom is VISIBLE** but not pushed (for veterans/second playthroughs)
- **No gender/race choice** (keep it simple, pixel art flexibility)

---

## 📖 **Phase 2: Intro & Context (1 min)**

### **Narration (Skippable)**

**Text overlay on black screen:**

> *"The Abbey stands alone on the moors, a sanctuary for those who seek refuge from the dark. You awaken in the infirmary, your memories foggy, your body weak. The herbalist speaks of strange happenings—undead rising, crypts unsealed, whispers in the night.*
>
> *You have no past here, only a future to carve with sword and spell. The Abbey needs defenders. Will you answer the call?"*

**Audio:** Ambient wind, distant bell toll, somber music

**Duration:** 20-30 seconds (ESC to skip)

### **Fade In: Abbey Infirmary**

**Scene:**

- Player lies in bed (sprite sitting up animation)
- NPC "Brother Alaric" (herbalist) stands nearby
- Soft lighting, peaceful interior

**Dialogue:**

```
Brother Alaric: "Ah, you're awake. Rest easy—you're safe within the Abbey walls."
[Player auto-stands, faces NPC]

Brother Alaric: "The world beyond is treacherous. Undead stir in the old crypt.
                 We need brave souls like you."

[Tutorial Prompt: "Press W/A/S/D or Arrow Keys to move"]

Brother Alaric: "Explore the courtyard. Speak with Sister Elena when you're ready.
                 She'll guide you."
```

**Goal:** Establish setting, tone, and immediate motivation.

---

## 🚶 **Phase 3: Movement & Interaction (2 min)**

### **Tutorial Objectives:**

1. **Move around courtyard** (WASD / Arrow Keys)
2. **Interact with objects** (Press E)
3. **Find Sister Elena**

### **Scene: Abbey Courtyard**

**Layout:**

- Open courtyard with stone tiles
- 3-4 NPCs (passive, ambient)
- Interactive objects: barrel, chest, sign
- Sister Elena near courtyard exit

**Tutorial Prompts (contextual):**

- **First Movement:** "Use W/A/S/D to move. Try moving to the barrel."
- **Approach Barrel:** "Press E to interact with objects."
- **Interact with Barrel:** "You found 3 apples! (Added to inventory)"
- **Approach Chest:** "Some objects require keys or tools to open."
- **Approach Sister Elena:** "Press E to speak with NPCs."

**Sister Elena Dialogue:**

```
Sister Elena: "Welcome, traveler. I see you've found your bearings."

[Tutorial Prompt: "Press I or Tab to open your inventory"]

Sister Elena: "Take this." [Gives: 1x Heal Potion]
              "It will mend wounds in battle. Open your inventory to see it."
```

**Goal:** Teach movement, interaction, inventory basics without combat pressure.

---

## 🎒 **Phase 4: Inventory & UI (2 min)**

### **Tutorial Objectives:**

1. **Open inventory** (I or Tab)
2. **Equip weapon** (if not already equipped)
3. **Use consumable item** (Heal Potion)
4. **View character sheet** (C)

### **Tutorial Prompts:**

- **Inventory Opens:** "This is your inventory. Items are organized by type.
                        Your weapon should be equipped (highlighted)."
- **Hover over Weapon:** "This is your [Short Sword]. It deals [6] damage per hit."
- **Hover over Heal Potion:** "Heal Potion: Restores 25 HP. Press U to use items quickly."
- **Close Inventory:** "Press I or ESC to close."

**Sister Elena (continued):**

```
Sister Elena: "There's a skeleton lurking near the crypt entrance.
               It guards the path. Defeat it, and we'll know you're ready."

[Tutorial Prompt: "Combat is turn-based. You act, then enemies act. Plan carefully."]

Sister Elena: "Follow the path east. I'll pray for your safety."

[Quest Added: "First Blood" - Defeat the Skeleton Guardian]
```

**Goal:** Familiarize with UI, inventory, and item usage before combat.

---

## ⚔️ **Phase 5: First Combat (4 min)**

### **Tutorial Combat: Skeleton Guardian**

**Scene:**

- Small clearing near crypt entrance
- 1 Skeleton (low HP, weak attack)
- Clear terrain, no obstacles

**Skeleton Stats (Easy Mode):**

- HP: 30 (player likely has 50-80)
- Attack: 4-6 damage
- Swords: 20 (low hit chance)
- No special abilities

### **Combat Tutorial Flow:**

**Turn 1: Player Turn**

```
[Tutorial Overlay]
"Combat has begun! This is your turn."

"You can:"
  • Move (up to 3 tiles) - Click a tile or use WASD
  • Attack - Click the enemy or press A
  • Use Item - Press U
  • End Turn - Press Space

"Try moving closer to the skeleton, then attack."
```

**Player Actions:**

- Moves 2 tiles toward skeleton
- Attacks skeleton (auto-targets)

**Combat Log:**

```
> You move closer to the Skeleton.
> You attack the Skeleton for 8 damage! (Skeleton HP: 30 → 22)
> Your turn ends.
```

**Turn 2: Enemy Turn**

```
[Tutorial]
"The enemy's turn. Watch their actions."

> Skeleton moves 1 tile toward you.
> Skeleton attacks you for 5 damage! (Your HP: 60 → 55)
> Enemy turn ends.
```

**Turn 3-5: Continue Combat**

- Player attacks again (likely kills in 3-5 hits)
- Skeleton attacks if alive
- No tutorial prompts (let player experiment)

**Combat Victory:**

```
> You strike the Skeleton for 10 damage!
> Skeleton is defeated!

[Loot]: 15 gold, 2x Bone

[XP Gained]: Swords +0.8, Tactics +0.5

[Tutorial]
"Victory! You've completed your first battle."
"You gained skill experience. Skills improve through use."
"Return to Sister Elena for your reward."
```

**Goal:** Teach turn-based combat, movement, attacking, and loot/XP without overwhelming.

---

## 📜 **Phase 6: Quest Intro (2 min)**

### **Return to Abbey Courtyard**

**Sister Elena:**

```
Sister Elena: "Well done! You've proven yourself capable."

[Quest Complete: "First Blood"]
[Reward]: 50 gold, 1x Iron Ingot, +100 XP

Sister Elena: "The crypt remains sealed, but more undead stir within.
               Brother Marcus believes a necromancer is at work."

[New Quest: "Clear the Crypt"]
Objectives:
  • Explore the crypt (0/1)
  • Defeat 10 Skeletons (0/10)
  • Find the Necromancer's Lair (0/1)

Sister Elena: "Take this map. It will guide you."

[Map Unlocked: Crypt Level 1]

Sister Elena: "Return when you've cleansed the crypt. May the light guide you."
```

**Tutorial Prompt:**

```
[Tutorial Complete!]
"You've learned the basics. The rest is up to you."

"Tips for survival:"
  • Rest to regenerate mana and stamina
  • Upgrade gear with loot from enemies
  • Explore to find hidden treasures
  • Skills improve through use—experiment!

"Press M to view your map. Press J to view quests."
```

**Goal:** Establish main quest, give player direction, signal freedom begins.

---

## 🌍 **Phase 7: Free Exploration (Ongoing)**

### **Player is Now Free To:**

- ✅ Explore Abbey grounds (vendors, NPCs, lore)
- ✅ Enter the Crypt (dungeon crawling begins)
- ✅ Experiment with skills/builds
- ✅ Return to town to rest, sell loot, buy gear
- ✅ Pursue side quests (if available)
- ✅ Engage with crafting (future feature)

### **Optional Tutorial Hints (Contextual):**

- **First Death:** "You've fallen in battle. You'll respawn at the Abbey.
                     Equipment is safe, but you lose half your carried gold."
- **First Spell Cast:** "Spells consume mana and reagents. Rest to regenerate mana."
- **First Skill Cap:** "You've reached 100 in [Skill]! This is the maximum."
- **First Quest Choice:** "Some quests have multiple outcomes. Choose wisely."

---

## 🎓 **Tutorial Design Principles**

### **DO:**

✅ **Show, don't tell** - Let players DO the action, not just read about it
✅ **One concept at a time** - Movement → Inventory → Combat (sequential)
✅ **Contextual prompts** - Only show hints when relevant
✅ **Allow failure** - Player can die in tutorial (respawn at Abbey)
✅ **Respect agency** - Let players skip/ignore optional content
✅ **Celebrate wins** - Positive feedback on first victory

### **DON'T:**

❌ **Wall of text** - No multi-paragraph tutorials
❌ **Forced reading** - All text skippable (ESC)
❌ **Hand-holding** - No forced optimal paths
❌ **Interruptions** - Don't pause gameplay for popups
❌ **Repetition** - Only explain once, trust player memory

---

## 📊 **FTUE Metrics (Telemetry)**

### **Track These Events:**

| Event | Purpose |
|-------|---------|
| `ftue_start` | Player begins character creation |
| `ftue_template_selected` | Which starting template chosen |
| `ftue_intro_skipped` | Did player skip narration? |
| `ftue_first_movement` | Time to first input |
| `ftue_inventory_opened` | Did player open inventory during tutorial? |
| `ftue_first_combat_start` | Combat initiated |
| `ftue_first_combat_end` | Combat result (win/loss/flee) |
| `ftue_first_death` | Player died during tutorial |
| `ftue_quest_accepted` | "Clear the Crypt" accepted |
| `ftue_complete` | Tutorial phase fully complete |
| `ftue_time_total` | Total time from start to completion |

### **Success Criteria:**

- **90%+ complete tutorial** within 20 minutes
- **< 5% abandon** during combat phase
- **> 70% use presets** (not custom builds)
- **Average completion time:** 12-15 minutes

---

## 🎨 **Visual Design Notes**

### **Tutorial UI Style:**

- **Overlay boxes** with semi-transparent black background
- **Gold border** on tutorial prompts (distinct from dialogue)
- **Small icon** (book/scroll) in corner = tutorial hint
- **Animated arrows** pointing to interactive elements
- **Fade in/out** smoothly (no jarring popups)

### **Color Coding:**

| Color | Usage |
|-------|-------|
| **Gold** | Tutorial prompts, positive feedback |
| **White** | NPC dialogue, neutral info |
| **Green** | Success messages, XP gains |
| **Red** | Danger warnings, damage taken |
| **Blue** | Quest updates, lore |

---

## 🔧 **Implementation Checklist**

### **Character Creation:**

- [ ] Name input field with validation
- [ ] 5 preset templates + 1 custom option
- [ ] Stat/skill preview before confirm
- [ ] Skip intro option (for returning players)

### **Intro Sequence:**

- [ ] Narration text with fade effects
- [ ] Background music track
- [ ] Skip button (ESC)
- [ ] Fade to infirmary scene

### **Movement Tutorial:**

- [ ] Contextual prompts on first input
- [ ] Interactive objects (barrel, chest, sign)
- [ ] NPC interaction prompts

### **Inventory Tutorial:**

- [ ] Highlight new items in inventory
- [ ] Equip weapon tutorial prompt
- [ ] Use item tutorial prompt
- [ ] Character sheet overview

### **Combat Tutorial:**

- [ ] Turn-based combat UI
- [ ] Step-by-step prompts (move, attack, end turn)
- [ ] Combat log with clear feedback
- [ ] Victory screen with loot/XP
- [ ] Respawn system if player dies

### **Quest System:**

- [ ] Quest log UI (J key)
- [ ] Quest tracking HUD element
- [ ] Objective completion notifications
- [ ] Reward claim screen

### **Post-Tutorial:**

- [ ] "Tutorial Complete" message
- [ ] Disable tutorial prompts flag
- [ ] Unlock full UI (map, journal, etc.)
- [ ] Enable free exploration

---

## 📁 **Related Files**

- **Code:** `game/tutorial/tutorial_manager.py`
- **Code:** `game/ui/tutorial_overlay.py`
- **Data:** `data/quests/tutorial_quests.json`
- **Data:** `data/npcs/abbey_npcs.json`
- **Assets:** `assets/ui/tutorial_icons/`
- **Docs:** `docs/QUEST_SYSTEM.md`
- **Docs:** `docs/GAMEPLAY.md`

---

## 🧪 **Testing the FTUE**

### **Playtesting Checklist:**

- [ ] Complete tutorial in < 15 minutes (timed)
- [ ] Skip all optional text (speedrun mode)
- [ ] Die during first combat (respawn works?)
- [ ] Ignore tutorial prompts (can player figure it out?)
- [ ] Try each starting template (balance check)
- [ ] Use gamepad instead of keyboard
- [ ] Observe new player (user study)

### **A/B Testing Ideas:**

| Variant | Test | Hypothesis |
|---------|------|------------|
| **Intro Length** | 30s vs 60s narration | Shorter = less drop-off |
| **Combat Difficulty** | Skeleton HP 30 vs 50 | Easier = higher completion |
| **Prompt Frequency** | Every action vs key moments only | Less intrusive = better |
| **Preset vs Custom** | Push presets harder | More use presets = smoother |

---

## 💡 **Future Enhancements (Post-MVP)**

### **Tutorial Improvements:**

- **Voice Acting** for intro narration
- **Animated Cutscene** for opening (2D pixel art)
- **Interactive Dialogue Choices** during intro (flavor only)
- **Mentor NPC** who follows player through crypt
- **Skill-Specific Tutorials** (cast first spell, stealth, etc.)
- **Dynamic Difficulty** (adjust skeleton HP based on player build)

### **Advanced Features:**

- **Tutorial Replay** option in settings
- **Hint System** toggle (for players who need more guidance)
- **Accessibility Mode** with extended tutorials
- **Veteran Mode** skip tutorial entirely (unlock after first completion)

---

## 📖 **Narrative Context (Lore Hooks)**

### **Mystery Seeds (Planted in FTUE):**

1. **"Your memories foggy"** → Amnesia plotline (who is player?)
2. **"Strange happenings"** → Necromancer arc begins
3. **"Whispers in the night"** → Foreshadow daemon threat
4. **Abbey as sanctuary** → Safe hub, will it remain safe?
5. **Brother Marcus mention** → Future quest giver

### **Tone & Atmosphere:**

- **Dark but not grimdark** - Hope exists, player is a beacon
- **UO-inspired** - No spoon-feeding, player earns victories
- **Mysterious** - Not all answers given, encourage exploration
- **Player-driven** - No chosen one narrative, you ARE the story

---

**Questions?** Check `docs/WORLD_BIBLE.md` for full lore context and `docs/QUEST_SYSTEM.md` for quest design patterns.
