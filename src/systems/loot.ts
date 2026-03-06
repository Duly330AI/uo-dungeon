import type { Drop } from "../types";
import { RngStream } from "../util/rngStream";

interface LootEntry {
  itemId: string;
  minQty: number;
  maxQty: number;
  weight: number;
}

const lootTables: Record<string, LootEntry[]> = {};
const claimedUnique = new Set<string>();

export function registerLootTable(tableId: string, entries: LootEntry[]): void {
  lootTables[tableId] = entries;
}

export function rollTable(tableId: string, rng: RngStream, uniqueOnce = false): Drop[] {
  if (uniqueOnce && claimedUnique.has(tableId)) {
    return [];
  }

  const entries = lootTables[tableId];
  if (!entries || entries.length === 0) {
    return [];
  }

  const totalWeight = entries.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
  if (totalWeight <= 0) {
    return [];
  }

  let needle = rng.nextFloat() * totalWeight;
  for (const entry of entries) {
    needle -= Math.max(0, entry.weight);
    if (needle <= 0) {
      if (uniqueOnce) {
        claimedUnique.add(tableId);
      }
      return [
        {
          itemId: entry.itemId,
          qty: rng.nextInt(entry.minQty, entry.maxQty),
        },
      ];
    }
  }

  return [];
}
