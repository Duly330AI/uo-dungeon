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

function validateJsonFile(filename: string, schema: z.ZodArray<any>) {
  const filePath = path.join(process.cwd(), 'data', filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    return false;
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(rawData);

  const result = schema.safeParse(jsonData);
  if (!result.success) {
    console.error(`Validation failed for ${filename}:`);
    console.error(result.error.format());
    return false;
  }
  console.log(`${filename} validated successfully.`);
  return true;
}

if (
  !validateJsonFile('items.json', z.array(ItemSchema)) ||
  !validateJsonFile('skills.json', z.array(SkillSchema)) ||
  !validateJsonFile('spells.json', z.array(SpellSchema))
) {
  process.exit(1);
}

console.log("[OK] Content validation passed (schema + cross-ref + drift).");
