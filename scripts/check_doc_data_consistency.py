#!/usr/bin/env python3
"""Check critical consistency between runtime data JSON and core markdown docs.

Scope is intentionally narrow and high-signal so it can run fast in pre-commit/CI.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def fail(msg: str, failures: list[str]) -> None:
    failures.append(msg)


def ensure_contains(path: Path, pattern: str, failures: list[str], label: str) -> None:
    text = read_text(path)
    if re.search(pattern, text, flags=re.MULTILINE) is None:
        fail(f"{path}: missing expected pattern for {label}: {pattern}", failures)


def ensure_not_contains(path: Path, pattern: str, failures: list[str], label: str) -> None:
    text = read_text(path)
    if re.search(pattern, text, flags=re.MULTILINE) is not None:
        fail(f"{path}: forbidden pattern for {label}: {pattern}", failures)


def iter_reagent_keys(spells: Iterable[dict]) -> Iterable[tuple[str, str]]:
    for spell in spells:
        reagents = spell.get("cost", {}).get("reagents", {})
        if isinstance(reagents, dict):
            for reagent_key in reagents.keys():
                yield spell.get("id", "<unknown_spell>"), str(reagent_key)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Project root")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_dir = root / "data"

    failures: list[str] = []

    # Data checks
    combat_rules = load_json(data_dir / "combat_rules.json")
    progression_rules = load_json(data_dir / "progression_rules.json")
    spells = load_json(data_dir / "spells.json")

    base_hit = combat_rules.get("hit_chance", {}).get("base")
    if base_hit != 0.7:
        fail(
            f"data/combat_rules.json: expected hit_chance.base == 0.7, got {base_hit!r}",
            failures,
        )

    if "anti_macro" in progression_rules.get("skill", {}):
        fail("data/progression_rules.json: skill.anti_macro must not exist", failures)

    for spell in spells:
        fizzle = spell.get("fizzle")
        if not isinstance(fizzle, dict):
            continue
        magery_factor = fizzle.get("magery_factor")
        if magery_factor != 0.002:
            fail(
                f"data/spells.json: spell '{spell.get('id')}' has magery_factor {magery_factor!r}, expected 0.002",
                failures,
            )

    for spell_id, reagent_key in iter_reagent_keys(spells):
        if not reagent_key.startswith("reagent_"):
            fail(
                f"data/spells.json: spell '{spell_id}' uses non-canonical reagent key '{reagent_key}'",
                failures,
            )

    # Core doc checks
    gameplay = root / "GAMEPLAY.md"
    combat_rules_md = root / "COMBAT_RULES.md"
    magic_system = root / "MAGIC_SYSTEM.md"
    data_schemas = root / "DATA_SCHEMAS.md"

    ensure_contains(
        gameplay,
        r"0\.70\s*\+\s*\(att_skill\s*-\s*def_skill\)/200",
        failures,
        "70% hit baseline formula",
    )
    ensure_not_contains(gameplay, r"anti_macro", failures, "anti-macro removal")

    ensure_contains(
        combat_rules_md,
        r"\|\s*`base`\s*\|\s*0\.7\s*\|",
        failures,
        "combat rules base hit value",
    )

    ensure_contains(
        magic_system,
        r'"magery_factor"\s*:\s*0\.002',
        failures,
        "magery factor",
    )
    ensure_not_contains(magic_system, r"caster_magery\b", failures, "old caster_magery name")

    ensure_contains(
        data_schemas,
        r"Source-of-Truth Policy",
        failures,
        "policy header",
    )

    if failures:
        print("[FAIL] Doc/data consistency check failed:")
        for msg in failures:
            print(f" - {msg}")
        return 1

    print("[OK] Doc/data consistency checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
