import { z } from 'zod';
import fs from 'fs';
import path from 'path';

console.log("Running TypeScript validator...");

// Define Zod schemas based on /data/schemas/*.schema.json
const ItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  name: z.string().optional(),
  type: z.enum([
    "weapon", "armor", "shield", "ammo", "reagent",
    "consumable", "material", "tool", "currency", "misc"
  ]),
  base_value: z.number().min(0),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]).optional(),
  weight: z.number().min(0).optional(),
});

const SkillSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  display_name: z.string(),
  cap: z.number().int().min(1),
  description_key: z.string().optional(),
});

const SpellSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  name: z.string(),
  school: z.enum(["fire", "cold", "toxic", "energy", "earth", "arcanum"]),
  circle: z.number().int().min(1).max(8),
  cost: z.object({
    mana: z.number().int().min(0),
    reagents: z.record(z.string(), z.number().int().min(1)).optional(),
  }),
  cast_rounds: z.number().int().min(0).optional(),
  range_tiles: z.number().int().min(0).optional(),
  effects: z.array(z.object({})).optional(),
  fizzle: z.object({
    base: z.number().min(0).max(1).optional(),
    magery_factor: z.number().optional(),
  }).optional(),
  resist_check: z.object({
    type: z.string(),
    scale: z.number(),
  }).nullable().optional(),
  ai_tags: z.array(z.string()).optional(),
});

const MonsterSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  hp: z.number().int().min(1),
  speed: z.number().min(0),
  ai: z.enum(["melee", "ranged", "caster"]),
  loot_table: z.string(),
});

function loadJsonFile(filename: string) {
  const filePath = path.join(process.cwd(), 'data', filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    return null;
  }
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

function validateJsonFile(filename: string, schema: z.ZodArray<any>, data: any) {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Validation failed for ${filename}:`);
    console.error(result.error.format());
    return false;
  }
  console.log(`${filename} validated successfully.`);
  return true;
}

const itemsData = loadJsonFile('items.json');
const skillsData = loadJsonFile('skills.json');
const spellsData = loadJsonFile('spells.json');
const monstersData = loadJsonFile('monsters.json');
const combatRulesData = loadJsonFile('combat_rules.json');

if (
  !itemsData || !skillsData || !spellsData || !monstersData || !combatRulesData ||
  !validateJsonFile('items.json', z.array(ItemSchema), itemsData) ||
  !validateJsonFile('skills.json', z.array(SkillSchema), skillsData) ||
  !validateJsonFile('spells.json', z.array(SpellSchema), spellsData) ||
  !validateJsonFile('monsters.json', z.array(MonsterSchema), monstersData)
) {
  process.exit(1);
}

// Cross-reference checks
const itemIds = new Set(itemsData.map((i: any) => i.id));
let hasErrors = false;

// Spell reagent check
for (const spell of spellsData) {
  const reagents = spell.cost.reagents;
  if (reagents) {
    for (const reagentId of Object.keys(reagents)) {
      if (!itemIds.has(reagentId)) {
        console.error(`Spell '${spell.id}' uses unknown reagent: '${reagentId}'`);
        hasErrors = true;
      }
    }
  }
}

// Drift checks (Doc/data consistency)
function ensureContains(filePath: string, pattern: RegExp, label: string) {
  const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  if (!pattern.test(content)) {
    console.error(`${filePath}: missing expected pattern for ${label}: ${pattern}`);
    hasErrors = true;
  }
}

// Check combat_rules.json vs COMBAT_RULES.md
if (combatRulesData.hit_chance.base !== 0.7) {
    console.error(`data/combat_rules.json: expected hit_chance.base == 0.7, got ${combatRulesData.hit_chance.base}`);
    hasErrors = true;
}
ensureContains('COMBAT_RULES.md', /\|\s*`base`\s*\|\s*0\.7\s*\|/, "combat rules base hit value");

// Check spells.json vs MAGIC_SYSTEM.md
for (const spell of spellsData) {
    if (spell.fizzle && spell.fizzle.magery_factor !== 0.002) {
        console.error(`data/spells.json: spell '${spell.id}' has magery_factor ${spell.fizzle.magery_factor}, expected 0.002`);
        hasErrors = true;
    }
}
ensureContains('MAGIC_SYSTEM.md', /"magery_factor"\s*:\s*0\.002/, "magery factor");

if (hasErrors) {
  process.exit(1);
}

console.log("[OK] Content validation passed (schema + cross-ref + drift).");
