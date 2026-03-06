#!/usr/bin/env python3
"""Unified content validator for FORD.

Runs in one pass:
1) JSON schema checks (lightweight implementation, no external deps)
2) Cross-reference checks (items/skills/spells/vendors/quests/biomes/encounters)
3) Doc/data drift checks via scripts/check_doc_data_consistency.py
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


class Reporter:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


def load_json(path: Path, rep: Reporter) -> Any:
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        rep.warn(f"missing file: {path}")
    except json.JSONDecodeError as e:
        rep.error(f"invalid JSON in {path}: {e}")
    except Exception as e:  # defensive
        rep.error(f"failed reading {path}: {e}")
    return None


def _type_ok(value: Any, expected: Any) -> bool:
    if isinstance(expected, list):
        return any(_type_ok(value, t) for t in expected)
    if expected == "object":
        return isinstance(value, dict)
    if expected == "array":
        return isinstance(value, list)
    if expected == "string":
        return isinstance(value, str)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "null":
        return value is None
    return True


def validate_against_schema(value: Any, schema: dict[str, Any], path: str, rep: Reporter) -> None:
    expected_type = schema.get("type")
    if expected_type is not None and not _type_ok(value, expected_type):
        rep.error(f"{path}: expected type {expected_type}, got {type(value).__name__}")
        return

    if "enum" in schema and value not in schema["enum"]:
        rep.error(f"{path}: value {value!r} not in enum {schema['enum']}")

    if isinstance(value, str) and "pattern" in schema:
        if re.match(schema["pattern"], value) is None:
            rep.error(f"{path}: value {value!r} does not match pattern {schema['pattern']}")

    if isinstance(value, (int, float)):
        if "minimum" in schema and value < schema["minimum"]:
            rep.error(f"{path}: value {value} < minimum {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            rep.error(f"{path}: value {value} > maximum {schema['maximum']}")

    if isinstance(value, dict):
        required = schema.get("required", [])
        for req in required:
            if req not in value:
                rep.error(f"{path}: missing required key {req!r}")

        props: dict[str, Any] = schema.get("properties", {})
        additional = schema.get("additionalProperties", True)

        for key, val in value.items():
            key_path = f"{path}.{key}"
            if key in props:
                validate_against_schema(val, props[key], key_path, rep)
            else:
                if isinstance(additional, dict):
                    validate_against_schema(val, additional, key_path, rep)
                elif additional is False:
                    rep.error(f"{path}: additional property not allowed: {key!r}")

    if isinstance(value, list) and "items" in schema:
        item_schema = schema["items"]
        for i, item in enumerate(value):
            validate_against_schema(item, item_schema, f"{path}[{i}]", rep)


def validate_schema_file(data_path: Path, schema_path: Path, rep: Reporter) -> Any:
    data = load_json(data_path, rep)
    schema = load_json(schema_path, rep)
    if data is None or schema is None:
        return data

    if not isinstance(data, list):
        rep.error(f"{data_path}: expected top-level array")
        return data

    for i, obj in enumerate(data):
        validate_against_schema(obj, schema, f"{data_path.name}[{i}]", rep)
    return data


def validate_cross_refs(root: Path, rep: Reporter) -> None:
    data_dir = root / "data"

    items = load_json(data_dir / "items.json", rep) or []
    skills = load_json(data_dir / "skills.json", rep) or []
    spells = load_json(data_dir / "spells.json", rep) or []
    monsters = load_json(data_dir / "monsters.json", rep) or []

    item_ids = {x.get("id") for x in items if isinstance(x, dict) and x.get("id")}
    skill_ids = {x.get("id") for x in skills if isinstance(x, dict) and x.get("id")}
    monster_ids = {x.get("id") for x in monsters if isinstance(x, dict) and x.get("id")}

    for spell in spells:
        if not isinstance(spell, dict):
            continue
        sid = spell.get("id", "<unknown_spell>")
        reagents = spell.get("cost", {}).get("reagents", {})
        if isinstance(reagents, dict):
            for reagent_id in reagents.keys():
                if reagent_id not in item_ids:
                    rep.error(f"spell {sid}: unknown reagent id {reagent_id!r}")

    optional_files = {
        "vendors": data_dir / "vendors.json",
        "quests": data_dir / "quests.json",
        "biomes": data_dir / "biomes.json",
        "encounters": data_dir / "encounters.json",
    }

    vendors = load_json(optional_files["vendors"], rep)
    if isinstance(vendors, list):
        for v in vendors:
            if not isinstance(v, dict):
                continue
            vid = v.get("id", "<unknown_vendor>")
            for e in v.get("inventory", []) or []:
                if isinstance(e, dict):
                    item_id = e.get("item_id")
                    if item_id and item_id not in item_ids:
                        rep.error(f"vendor {vid}: unknown item_id {item_id!r}")

    quests = load_json(optional_files["quests"], rep)
    if isinstance(quests, list):
        for q in quests:
            if not isinstance(q, dict):
                continue
            qid = q.get("id", "<unknown_quest>")
            for req in q.get("requirements", []) or []:
                if isinstance(req, dict) and req.get("type") == "skill":
                    sid = req.get("id")
                    if sid and sid not in skill_ids:
                        rep.error(f"quest {qid}: unknown required skill {sid!r}")
            for obj in q.get("objectives", []) or []:
                if isinstance(obj, dict) and obj.get("type") == "collect":
                    item_id = obj.get("item_id")
                    if item_id and item_id not in item_ids:
                        rep.error(f"quest {qid}: unknown collect item_id {item_id!r}")

    biomes = load_json(optional_files["biomes"], rep)
    if isinstance(biomes, list):
        for b in biomes:
            if not isinstance(b, dict):
                continue
            bid = b.get("id", "<unknown_biome>")
            for reagent_id in b.get("reagents_bias", []) or []:
                if reagent_id not in item_ids:
                    rep.error(f"biome {bid}: unknown reagent_bias item {reagent_id!r}")

    encounters = load_json(optional_files["encounters"], rep)
    if isinstance(encounters, list):
        for enc in encounters:
            if not isinstance(enc, dict):
                continue
            eid = enc.get("id", "<unknown_encounter>")
            for entry in enc.get("entries", []) or []:
                if isinstance(entry, dict):
                    mob_id = entry.get("mob_id")
                    if mob_id and monster_ids and mob_id not in monster_ids:
                        rep.error(f"encounter {eid}: unknown mob_id {mob_id!r}")
                    rs = entry.get("requires_skill")
                    if rs and rs not in skill_ids:
                        rep.error(f"encounter {eid}: unknown requires_skill {rs!r}")


def run_drift_check(root: Path, rep: Reporter) -> None:
    script = root / "scripts" / "check_doc_data_consistency.py"
    if not script.exists():
        rep.error(f"missing drift script: {script}")
        return

    proc = subprocess.run(
        [sys.executable, str(script), "--root", str(root)],
        text=True,
        capture_output=True,
    )
    if proc.returncode != 0:
        out = (proc.stdout or "") + (proc.stderr or "")
        rep.error("drift check failed:\n" + out.strip())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="project root")
    parser.add_argument("--strict", action="store_true", help="treat warnings as errors")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_dir = root / "data"
    schemas_dir = data_dir / "schemas"

    rep = Reporter()

    schema_map = {
        data_dir / "items.json": schemas_dir / "item.schema.json",
        data_dir / "skills.json": schemas_dir / "skill.schema.json",
        data_dir / "spells.json": schemas_dir / "spell.schema.json",
    }

    for data_path, schema_path in schema_map.items():
        validate_schema_file(data_path, schema_path, rep)

    validate_cross_refs(root, rep)
    run_drift_check(root, rep)

    if rep.warnings:
        print("[WARN]")
        for w in rep.warnings:
            print(f" - {w}")

    if rep.errors:
        print("[FAIL]")
        for e in rep.errors:
            print(f" - {e}")
        return 1

    if args.strict and rep.warnings:
        print("[FAIL] strict mode: warnings present")
        return 1

    print("[OK] Content validation passed (schema + cross-ref + drift).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
