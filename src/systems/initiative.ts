import type { Actor, Initiative } from "../types";
import { RngStream } from "../util/rngStream";

export function rollInitiative(rng: RngStream, participants: Actor[]): Initiative {
  const sorted = [...participants].sort((a, b) => {
    if (a.dex !== b.dex) {
      return b.dex - a.dex;
    }
    return rng.nextFloat() < 0.5 ? -1 : 1;
  });

  const order = sorted.map((actor) => actor.id);
  const byId: Record<string, number> = {};
  order.forEach((id, idx) => {
    byId[id] = idx;
  });

  return { order, byId };
}
