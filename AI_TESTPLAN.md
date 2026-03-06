# FORD AI Testing Plan

**Status:** Living Document • **Last Updated:** 2025-10-25

This document describes the testing strategy, tools, and validation approach for FORD's AI systems. Focus on determinism, reproducibility, and automated testing.

---

## 🎯 **Testing Goals**

| Goal | Description | Priority |
|------|-------------|----------|
| **Determinism** | AI behavior must be reproducible with same seed | ⭐⭐⭐ Critical |
| **Coverage** | Test all AI archetypes and tactics | ⭐⭐⭐ Critical |
| **Performance** | AI decision logic < 2ms per actor-turn (headless target) | ⭐⭐ High |
| **Balance** | No dominant strategies, fair challenge | ⭐⭐ High |
| **Faction AI** | Multi-party combat works correctly | ⭐⭐ High |
| **Regression** | New changes don't break existing behavior | ⭐ Medium |

---

## 🔬 **Test Architecture**

```
┌──────────────────────────────────────────────────────────┐
│ TEST HARNESS                                              │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ 1. UNIT TESTS (pytest)                         │      │
│  │    - Perception (LOS, threat, memory)          │      │
│  │    - Utility scoring (target, tactic)          │      │
│  │    - Pathfinding (A*, leash, zones)            │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ 2. INTEGRATION TESTS                           │      │
│  │    - Full combat scenarios                     │      │
│  │    - Multi-party faction battles               │      │
│  │    - AI coordination (guard, kite, synergy)    │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ 3. REPLAY SYSTEM                               │      │
│  │    - Record combat → Replay → Compare          │      │
│  │    - Golden files for regression               │      │
│  │    - Seed-based determinism validation         │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ 4. PROPERTY TESTS (Hypothesis)                 │      │
│  │    - Fuzz tactics with random scenarios        │      │
│  │    - Invariants: no crashes, valid moves       │      │
│  │    - Performance bounds                        │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ 5. HEADLESS SIMULATION                         │      │
│  │    - 10,000 combats overnight                  │      │
│  │    - Stats: win rates, turn counts, crashes    │      │
│  │    - Balance analysis                          │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

---

## 🧪 **1. Unit Tests (Pytest)**

### **Test: Perception - Line of Sight**

**File:** `tests/test_ai_perception.py`

```python
import pytest
from game.ai.perception import PerceptionSystem
from game.world.map import DungeonMap

def test_los_blocked_by_wall():
    """LOS should be blocked by solid walls."""
    dungeon = DungeonMap.from_array([
        ['#', '#', '#', '#', '#'],
        ['#', 'A', '.', '#', 'B'],  # Wall blocks A from seeing B
        ['#', '#', '#', '#', '#'],
    ])

    perception = PerceptionSystem(dungeon)
    actor_a = dungeon.get_entity('A')
    actor_b = dungeon.get_entity('B')

    visible = perception.can_see(actor_a, actor_b)
    assert visible == False, "Wall should block LOS"

def test_los_clear_diagonal():
    """LOS should work diagonally when clear."""
    dungeon = DungeonMap.from_array([
        ['A', '.', '.'],
        ['.', '.', '.'],
        ['.', '.', 'B'],
    ])

    perception = PerceptionSystem(dungeon)
    actor_a = dungeon.get_entity('A')
    actor_b = dungeon.get_entity('B')

    visible = perception.can_see(actor_a, actor_b)
    assert visible == True, "Clear diagonal should allow LOS"
```

### **Test: Threat Memory**

```python
def test_threat_decay():
    """Threat should decay over time."""
    threat_mem = ThreatMemory()
    actor_id = "enemy_1"

    threat_mem.add_threat(actor_id, 100)
    assert threat_mem.get_threat(actor_id) == 100

    # Simulate 10 turns
    for _ in range(10):
        threat_mem.decay_all(decay_rate=0.9)

    current_threat = threat_mem.get_threat(actor_id)
    assert 30 < current_threat < 40, f"Threat should decay to ~35 (got {current_threat})"

def test_threat_cap():
    """Threat should be capped at max value."""
    threat_mem = ThreatMemory(max_threat=100)

    threat_mem.add_threat("enemy", 150)
    assert threat_mem.get_threat("enemy") == 100, "Threat should be capped"
```

### **Test: Utility Scoring**

```python
def test_target_scoring_distance():
    """Closer targets should score higher (ranged AI)."""
    ai = RangedAI()
    targets = [
        {"id": "far", "distance": 10, "threat": 50, "hp_pct": 0.5},
        {"id": "near", "distance": 3, "threat": 50, "hp_pct": 0.5},
    ]

    scores = {t["id"]: ai.score_target(t) for t in targets}
    assert scores["near"] > scores["far"], "Ranged AI should prefer closer targets"

def test_tactic_selection_guard():
    """MeleeAI should guard caster when nearby and threatened."""
    ai = MeleeAI()
    context = {
        "allies": [
            {"id": "caster", "role": "caster", "distance": 4, "threat": 80}
        ],
        "self": {"hp_pct": 0.8}
    }

    tactic = ai.select_tactic(context)
    assert tactic == "guard_ally", "Should guard nearby threatened caster"
```

---

## 🔗 **2. Integration Tests**

### **Test Scenario: 2v2 Combat (Deterministic)**

**File:** `tests/test_combat_integration.py`

```python
import pytest
from game.combat.combat_system import CombatSystem
from game.ai.ai_director import AIDirector

@pytest.fixture
def seed_rng():
    """Set deterministic seed for reproducibility."""
    import random
    random.seed(42)
    yield
    random.seed()  # Reset

def test_2v2_melee_vs_caster(seed_rng):
    """Test 2v2 combat: Melee+Caster vs Melee+Caster."""
    combat = CombatSystem()

    # Team A: Melee + Caster
    knight = combat.add_actor("knight", faction="player", archetype="melee")
    mage = combat.add_actor("mage", faction="player", archetype="caster")

    # Team B: Orc + Shaman
    orc = combat.add_actor("orc", faction="orc", archetype="melee")
    shaman = combat.add_actor("shaman", faction="orc", archetype="caster")

    # Run combat for 20 turns or until victory
    for turn in range(20):
        combat.process_turn()
        if combat.is_over():
            break

    # Validate outcomes
    assert combat.turn_count <= 20, "Combat should end within 20 turns"
    assert combat.winner in ["player", "orc"], "One side should win"

    # Check AI behavior patterns
    assert knight.actions_taken["attack"] > 0, "Knight should attack"
    assert mage.actions_taken["cast"] > 0, "Mage should cast spells"

    # Verify determinism (run again with same seed)
    combat2 = run_same_scenario(seed=42)
    assert combat.turn_count == combat2.turn_count, "Same seed should produce same result"
```

### **Test: Multi-Party Faction Battle**

```python
def test_three_way_faction_battle(seed_rng):
    """Test Orcs vs Undead vs Player (3-way combat)."""
    combat = CombatSystem()

    # Player solo
    player = combat.add_actor("player", faction="player", archetype="melee")

    # Orcs
    orc1 = combat.add_actor("orc_1", faction="orc", archetype="melee")
    orc2 = combat.add_actor("orc_2", faction="orc", archetype="ranged")

    # Undead
    skeleton1 = combat.add_actor("skeleton_1", faction="undead", archetype="melee")
    skeleton2 = combat.add_actor("skeleton_2", faction="undead", archetype="melee")

    # Verify initial relations
    assert combat.get_relation("orc", "undead") == -1, "Orcs and Undead should be hostile"
    assert combat.get_relation("orc", "player") == -1, "Orcs and Player should be hostile"

    # Run combat
    for turn in range(30):
        combat.process_turn()
        if combat.survivors_count() <= 1:
            break

    # Validate multi-targeting
    # Orcs should attack both Undead AND Player
    assert orc1.attacked_factions == {"undead", "player"}, "Orcs should fight multiple factions"

    # Check last survivor
    survivor = combat.get_survivor()
    assert survivor is not None, "Should have a winner"
```

---

## 🎬 **3. Replay System**

### **Record Combat → Golden File**

**File:** `tests/test_replay.py`

```python
import json
from game.replay.recorder import CombatRecorder

def test_record_and_replay():
    """Record a combat, replay it, verify identical outcomes."""
    # RECORD phase
    recorder = CombatRecorder(seed=12345)
    combat = CombatSystem(recorder=recorder)

    # Setup scenario
    combat.add_actor("knight", faction="player", archetype="melee", stats={"STR": 70, "DEX": 50})
    combat.add_actor("orc", faction="orc", archetype="melee", stats={"STR": 60, "DEX": 40})

    # Run combat
    while not combat.is_over():
        combat.process_turn()

    # Save replay
    replay_data = recorder.export()
    with open("tests/replays/knight_vs_orc.json", "w") as f:
        json.dump(replay_data, f, indent=2)

    # REPLAY phase
    replayer = CombatReplayer(replay_data)
    combat2 = replayer.simulate()

    # VERIFY phase
    assert combat.turn_count == combat2.turn_count, "Turn count must match"
    assert combat.winner == combat2.winner, "Winner must match"
    assert combat.final_hp["knight"] == combat2.final_hp["knight"], "Final HP must match"

    print(f"✅ Replay verified: {combat.turn_count} turns, winner={combat.winner}")
```

### **Replay File Format:**

```json
{
  "seed": 12345,
  "version": "1.0",
  "actors": [
    {
      "id": "knight",
      "faction": "player",
      "archetype": "melee",
      "stats": {"STR": 70, "DEX": 50, "HP": 100}
    },
    {
      "id": "orc",
      "faction": "orc",
      "archetype": "melee",
      "stats": {"STR": 60, "DEX": 40, "HP": 80}
    }
  ],
  "turns": [
    {
      "turn": 1,
      "actor_id": "knight",
      "action": "attack",
      "target_id": "orc",
      "roll": 0.75,
      "damage": 18,
      "result": "hit"
    },
    {
      "turn": 2,
      "actor_id": "orc",
      "action": "attack",
      "target_id": "knight",
      "roll": 0.45,
      "damage": 0,
      "result": "miss"
    }
  ],
  "outcome": {
    "winner": "player",
    "turns": 8,
    "survivors": ["knight"]
  }
}
```

### **Golden File Regression Tests:**

```python
def test_golden_replay_knight_vs_orc():
    """Replay golden file and verify outcome hasn't changed."""
    replay_data = json.load(open("tests/replays/golden/knight_vs_orc.json"))

    replayer = CombatReplayer(replay_data)
    combat = replayer.simulate()

    expected_outcome = replay_data["outcome"]

    assert combat.winner == expected_outcome["winner"], "Winner changed (regression!)"
    assert combat.turn_count == expected_outcome["turns"], "Turn count changed"
    assert set(combat.survivors) == set(expected_outcome["survivors"]), "Survivors changed"
```

---

## 🎲 **4. Property-Based Tests (Hypothesis)**

### **Test: AI Never Crashes**

```python
from hypothesis import given, strategies as st

@given(
    seed=st.integers(min_value=0, max_value=1000000),
    actor_count=st.integers(min_value=2, max_value=8),
    archetypes=st.lists(st.sampled_from(["melee", "ranged", "caster"]), min_size=2, max_size=8)
)
def test_ai_no_crashes(seed, actor_count, archetypes):
    """AI should never crash regardless of scenario."""
    import random
    random.seed(seed)

    combat = CombatSystem()

    for i in range(actor_count):
        archetype = archetypes[i % len(archetypes)]
        faction = "faction_" + str(i % 2)  # 2 factions
        combat.add_actor(f"actor_{i}", faction=faction, archetype=archetype)

    # Run for max 50 turns or until end
    for turn in range(50):
        try:
            combat.process_turn()
        except Exception as e:
            pytest.fail(f"AI crashed on turn {turn}: {e}")

        if combat.is_over():
            break

    # Invariants
    assert combat.turn_count > 0, "Should have processed at least 1 turn"
    assert combat.is_over() or turn == 49, "Should end naturally or reach max turns"

@given(
    threat_values=st.lists(st.floats(min_value=0, max_value=200), min_size=1, max_size=10),
    decay_rate=st.floats(min_value=0.5, max_value=1.0)
)
def test_threat_memory_invariants(threat_values, decay_rate):
    """Threat memory should never go negative or NaN."""
    threat_mem = ThreatMemory()

    for i, threat in enumerate(threat_values):
        threat_mem.add_threat(f"enemy_{i}", threat)

    for _ in range(20):
        threat_mem.decay_all(decay_rate)

    for enemy_id in threat_mem.get_all_threats():
        threat = threat_mem.get_threat(enemy_id)
        assert threat >= 0, f"Threat should never be negative (got {threat})"
        assert not math.isnan(threat), "Threat should never be NaN"
```

---

## 🏃 **5. Headless Simulation (Performance & Balance)**

### **Overnight Batch Testing**

**File:** `tests/test_headless_sim.py`

```python
import multiprocessing as mp
from collections import defaultdict

def run_combat_batch(seed_range, archetype_matchup):
    """Run many combats and collect statistics."""
    results = []

    for seed in seed_range:
        combat = CombatSystem(seed=seed)

        # Setup matchup (e.g., "melee vs caster")
        archetype_a, archetype_b = archetype_matchup.split(" vs ")
        combat.add_actor("a", faction="team_a", archetype=archetype_a)
        combat.add_actor("b", faction="team_b", archetype=archetype_b)

        # Run combat
        while not combat.is_over() and combat.turn_count < 100:
            combat.process_turn()

        results.append({
            "seed": seed,
            "winner": combat.winner,
            "turns": combat.turn_count,
            "a_final_hp": combat.actors["a"].hp,
            "b_final_hp": combat.actors["b"].hp
        })

    return results

def test_balance_melee_vs_caster():
    """Run 1000 melee vs caster combats, check win rate."""
    num_combats = 1000
    seeds = range(num_combats)

    with mp.Pool() as pool:
        batches = [seeds[i:i+100] for i in range(0, num_combats, 100)]
        results = pool.starmap(run_combat_batch, [(batch, "melee vs caster") for batch in batches])

    # Flatten results
    all_results = [r for batch in results for r in batch]

    # Analyze
    wins = defaultdict(int)
    for r in all_results:
        wins[r["winner"]] += 1

    win_rate_a = wins["team_a"] / num_combats
    avg_turns = sum(r["turns"] for r in all_results) / num_combats

    print(f"Melee vs Caster Balance:")
    print(f"  Melee Win Rate: {win_rate_a * 100:.1f}%")
    print(f"  Caster Win Rate: {(1 - win_rate_a) * 100:.1f}%")
    print(f"  Avg Turns: {avg_turns:.1f}")

    # Balance assertion (40-60% win rate is acceptable)
    assert 0.40 <= win_rate_a <= 0.60, f"Balance issue: Melee win rate {win_rate_a * 100:.1f}%"
    assert avg_turns < 30, f"Combats too long: avg {avg_turns} turns"
```

### **Performance Profiling:**

```python
import cProfile
import pstats

def profile_ai_performance():
    """Profile AI decision-making speed."""
    combat = CombatSystem()

    # Setup large battle
    for i in range(20):
        faction = "faction_" + str(i % 3)
        archetype = ["melee", "ranged", "caster"][i % 3]
        combat.add_actor(f"actor_{i}", faction=faction, archetype=archetype)

    profiler = cProfile.Profile()
    profiler.enable()

    # Run 10 turns
    for _ in range(10):
        combat.process_turn()

    profiler.disable()

    stats = pstats.Stats(profiler)
    stats.sort_stats('cumtime')
    stats.print_stats(20)  # Top 20 functions

    # Assert performance budget
    total_time = sum(stat[2] for stat in stats.stats.values())
    assert total_time < 1.0, f"10 turns with 20 actors took {total_time}s (should be < 1s)"
```

---

## 📊 **Test Coverage Goals**

| Component | Target Coverage | Current | Status |
|-----------|----------------|---------|--------|
| **Perception** | 90% | TBD | 🔜 |
| **Utility AI** | 85% | TBD | 🔜 |
| **Pathfinding** | 80% | TBD | 🔜 |
| **Tactics** | 75% | TBD | 🔜 |
| **Faction Logic** | 85% | TBD | 🔜 |
| **Combat Integration** | 70% | TBD | 🔜 |

**Tool:** `pytest-cov`

```bash
pytest --cov=game/ai --cov-report=html
```

---

## ✅ **Test Checklist (Pre-Release)**

### **Determinism:**

- [ ] Same seed produces identical combat outcomes
- [ ] Replay system validates against golden files
- [ ] No random behavior without explicit seed

### **AI Behavior:**

- [ ] Melee AI guards casters when appropriate
- [ ] Ranged AI maintains distance (kiting)
- [ ] Caster AI uses mana efficiently
- [ ] Faction AI fights multi-party battles correctly
- [ ] Threat system prioritizes correctly

### **Performance:**

- [ ] AI decision time < 2ms per actor-turn
- [ ] 10,000 combats complete in < 1 hour
- [ ] No memory leaks in long simulations

### **Balance:**

- [ ] No archetype has > 65% win rate in 1v1
- [ ] Multi-party battles have varied outcomes
- [ ] Player can defeat 2-3 enemies of equal level

---

## 📁 **Related Files**

- **AI Design:** `docs/AI_DESIGN.md`
- **Test Code:** `tests/test_ai_*.py`
- **Replay System:** `game/replay/recorder.py`
- **Headless Sim:** `scripts/run_headless_sim.py`
- **CI Config:** `.github/workflows/ai_tests.yml`

---

## 🔧 **Running Tests**

```bash
# Unit tests (fast)
pytest tests/test_ai_perception.py tests/test_ai_utility.py

# Integration tests
pytest tests/test_combat_integration.py -v

# Replay tests
pytest tests/test_replay.py

# Property tests (slow)
pytest tests/test_ai_property.py --hypothesis-profile=ci

# Headless sim (overnight)
python scripts/run_headless_sim.py --combats 10000 --output results.json

# Coverage report
pytest --cov=game/ai --cov-report=html
open htmlcov/index.html
```

---

**Questions?** Check `docs/DEVELOPMENT.md` for test setup and CI configuration.
