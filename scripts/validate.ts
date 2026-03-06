import fs from 'fs';
import path from 'path';
import Ajv from 'ajv/dist/2020.js';

const ajv = new Ajv({ allErrors: true });

const args = process.argv.slice(2);
const isStrict = args.includes('--strict');

console.log(`Running TypeScript validator... (Strict mode: ${isStrict})`);

function loadJsonFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    if (isStrict) {
      console.error(`Missing file: ${fullPath}`);
      return null;
    }
    return null;
  }
  const rawData = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(rawData);
}

function validateWithSchema(data: any, schemaPath: string, label: string) {
  const schema = loadJsonFile(schemaPath);
  if (!schema) {
    console.warn(`[WARN] Schema not found: ${schemaPath}`);
    return true; // Skip if schema doesn't exist
  }
  
  const validate = ajv.compile(schema);
  // If data is an array but schema is for a single item, we validate each item
  if (Array.isArray(data) && schema.type === 'object') {
    let valid = true;
    for (const item of data) {
      if (!validate(item)) {
        console.error(`Validation failed for ${label} item ${item.id || 'unknown'}:`);
        console.error(validate.errors);
        valid = false;
      }
    }
    return valid;
  } else {
    const valid = validate(data);
    if (!valid) {
      console.error(`Validation failed for ${label}:`);
      console.error(validate.errors);
      return false;
    }
    return true;
  }
}

let hasErrors = false;

// Load Data
const itemsData = loadJsonFile('public/data/items.json') || [];
const skillsData = loadJsonFile('public/data/skills.json') || [];
const spellsData = loadJsonFile('public/data/spells.json') || [];
const monstersData = loadJsonFile('public/data/monsters.json') || [];
const combatRulesData = loadJsonFile('public/data/combat_rules.json') || {};

// Validate against JSON schemas
if (!validateWithSchema(itemsData, 'public/data/schemas/item.schema.json', 'items.json')) hasErrors = true;
if (!validateWithSchema(skillsData, 'public/data/schemas/skill.schema.json', 'skills.json')) hasErrors = true;
if (!validateWithSchema(spellsData, 'public/data/schemas/spell.schema.json', 'spells.json')) hasErrors = true;

const optionalFiles = [
  { data: 'public/data/biomes.json', schema: 'public/data/schemas/biome.schema.json' },
  { data: 'public/data/encounters.json', schema: 'public/data/schemas/encounter.schema.json' },
  { data: 'public/data/quests.json', schema: 'public/data/schemas/quest.schema.json' },
  { data: 'public/data/vendors.json', schema: 'public/data/schemas/vendor.schema.json' },
];

for (const { data, schema } of optionalFiles) {
  const fullDataPath = path.join(process.cwd(), data);
  if (fs.existsSync(fullDataPath)) {
    const parsedData = loadJsonFile(data);
    if (!validateWithSchema(parsedData, schema, path.basename(data))) {
      hasErrors = true;
    }
  }
}

// Cross-reference checks
const itemIds = new Set(itemsData.map((i: any) => i.id));

// Spell reagent check & caster_magery ban
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
    console.error(`Spell 'caster_magery' is banned/invalid.`);
    hasErrors = true;
  }
}

// Drift checks (Doc/data consistency)
function ensureContains(filePath: string, pattern: RegExp, label: string) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf-8');
  if (!pattern.test(content)) {
    console.error(`${filePath}: missing expected pattern for ${label}: ${pattern}`);
    hasErrors = true;
  }
}

if (combatRulesData.hit_chance?.base !== 0.7) {
    console.error(`public/data/combat_rules.json: expected hit_chance.base == 0.7, got ${combatRulesData.hit_chance?.base}`);
    hasErrors = true;
}
ensureContains('COMBAT_RULES.md', /\|\s*`base`\s*\|\s*0\.7\s*\|/, "combat rules base hit value");

for (const spell of spellsData) {
    if (spell.fizzle && spell.fizzle.magery_factor !== undefined && spell.fizzle.magery_factor !== 0.002) {
        console.error(`public/data/spells.json: spell '${spell.id}' has magery_factor ${spell.fizzle.magery_factor}, expected 0.002`);
        hasErrors = true;
    }
}
ensureContains('MAGIC_SYSTEM.md', /"magery_factor"\s*:\s*0\.002/, "magery factor");

if (hasErrors) {
  process.exit(1);
}

console.log("[OK] Content validation passed (schema + cross-ref + drift).");
