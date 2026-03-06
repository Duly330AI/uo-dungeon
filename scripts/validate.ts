import fs from 'fs';
import path from 'path';
import Ajv, { type ErrorObject } from 'ajv/dist/2020.js';

const ajv = new Ajv({ allErrors: true });
const args = process.argv.slice(2);
const isStrict = args.includes('--strict');

const dataRoot = fs.existsSync(path.join(process.cwd(), 'public', 'data')) ? 'public/data' : 'data';

console.log(`Running TypeScript validator... (Strict mode: ${isStrict}, dataRoot: ${dataRoot})`);

function readJson(relPath: string, required = false): unknown {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    const msg = `Missing file: ${fullPath}`;
    if (required || isStrict) {
      throw new Error(msg);
    }
    console.warn(`[WARN] ${msg}`);
    return null;
  }

  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return 'unknown validation error';
  }
  return errors
    .map((e) => `${e.instancePath || '/'} ${e.message || 'invalid'}`)
    .join('; ');
}

function validateArrayItems(data: unknown, schemaRelPath: string, label: string): boolean {
  try {
    const schema = readJson(schemaRelPath, true);
    const validate = ajv.compile(schema as object);

    if (!Array.isArray(data)) {
      console.error(`${label}: expected top-level array`);
      return false;
    }

    let ok = true;
    for (const [idx, item] of data.entries()) {
      if (!validate(item)) {
        console.error(`${label}[${idx}] invalid: ${formatErrors(validate.errors)}`);
        ok = false;
      }
    }
    if (ok) {
      console.log(`${label} validated successfully.`);
    }
    return ok;
  } catch (err) {
    console.error(`${label}: ${(err as Error).message}`);
    return false;
  }
}

let hasErrors = false;

// Required core files
const itemsData = readJson(`${dataRoot}/items.json`, true) as any[];
const skillsData = readJson(`${dataRoot}/skills.json`, true) as any[];
const spellsData = readJson(`${dataRoot}/spells.json`, true) as any[];
const monstersData = readJson(`${dataRoot}/monsters.json`, true) as any[];
const combatRulesData = readJson(`${dataRoot}/combat_rules.json`, true) as Record<string, any>;

// Schema validation for core files
if (!validateArrayItems(itemsData, `${dataRoot}/schemas/item.schema.json`, 'items.json')) hasErrors = true;
if (!validateArrayItems(skillsData, `${dataRoot}/schemas/skill.schema.json`, 'skills.json')) hasErrors = true;
if (!validateArrayItems(spellsData, `${dataRoot}/schemas/spell.schema.json`, 'spells.json')) hasErrors = true;

// Optional files + schemas
const optional = [
  { data: `${dataRoot}/biomes.json`, schema: `${dataRoot}/schemas/biome.schema.json`, label: 'biomes.json' },
  { data: `${dataRoot}/encounters.json`, schema: `${dataRoot}/schemas/encounter.schema.json`, label: 'encounters.json' },
  { data: `${dataRoot}/quests.json`, schema: `${dataRoot}/schemas/quest.schema.json`, label: 'quests.json' },
  { data: `${dataRoot}/vendors.json`, schema: `${dataRoot}/schemas/vendor.schema.json`, label: 'vendors.json' },
];

for (const entry of optional) {
  const full = path.join(process.cwd(), entry.data);
  if (!fs.existsSync(full)) {
    if (isStrict) {
      console.error(`Missing file: ${full}`);
      hasErrors = true;
    } else {
      console.warn(`[WARN] Missing optional file: ${full}`);
    }
    continue;
  }

  const data = readJson(entry.data, true);
  if (!validateArrayItems(data, entry.schema, entry.label)) {
    hasErrors = true;
  }
}

// Cross-reference checks
const itemIds = new Set(itemsData.map((i: any) => i.id));
for (const spell of spellsData) {
  if (spell.cost?.reagents) {
    for (const reagentId of Object.keys(spell.cost.reagents)) {
      if (!itemIds.has(reagentId)) {
        console.error(`Spell '${spell.id}' uses unknown reagent: '${reagentId}'`);
        hasErrors = true;
      }
    }
  }

  if (spell.id === 'caster_magery') {
    console.error(`Forbidden legacy id in spells.json: 'caster_magery'`);
    hasErrors = true;
  }
}

// Drift checks
function ensureContains(filePath: string, pattern: RegExp, label: string): void {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    if (isStrict) {
      console.error(`Missing doc file for drift check: ${fullPath}`);
      hasErrors = true;
    }
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  if (!pattern.test(content)) {
    console.error(`${filePath}: missing expected pattern for ${label}: ${pattern}`);
    hasErrors = true;
  }
}

if (combatRulesData?.hit_chance?.base !== 0.7) {
  console.error(`${dataRoot}/combat_rules.json: expected hit_chance.base == 0.7, got ${combatRulesData?.hit_chance?.base}`);
  hasErrors = true;
}
ensureContains('COMBAT_RULES.md', /\|\s*`base`\s*\|\s*0\.7\s*\|/, 'combat rules base hit value');

for (const spell of spellsData) {
  if (spell.fizzle && spell.fizzle.magery_factor !== undefined && spell.fizzle.magery_factor !== 0.002) {
    console.error(`${dataRoot}/spells.json: spell '${spell.id}' has magery_factor ${spell.fizzle.magery_factor}, expected 0.002`);
    hasErrors = true;
  }
}
ensureContains('MAGIC_SYSTEM.md', /"magery_factor"\s*:\s*0\.002/, 'magery factor');

if (hasErrors) {
  process.exit(1);
}

console.log('[OK] Content validation passed (schema + cross-ref + drift).');
