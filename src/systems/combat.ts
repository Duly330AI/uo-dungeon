import type { CombatState, Intent, Outcome } from "../types";
import { RngStream } from "../util/rngStream";

export function resolveTurn(state: CombatState, intents: Intent[], rng: RngStream): Outcome[] {
  const outcomes: Outcome[] = [];

  for (const intent of intents) {
    switch (intent.type) {
      case "wait":
        outcomes.push({
          actorId: intent.actorId,
          type: "wait",
          message: "Actor waits.",
        });
        break;
      case "move":
        outcomes.push({
          actorId: intent.actorId,
          type: "moved",
          message: "Actor moved.",
        });
        break;
      case "attack":
      case "shoot": {
        const hit = rng.nextFloat() < 0.75;
        outcomes.push({
          actorId: intent.actorId,
          targetId: intent.targetId,
          type: hit ? "hit" : "miss",
          amount: hit ? 1 : 0,
          message: hit ? "Attack connected." : "Attack missed.",
        });
        break;
      }
      case "cast":
        outcomes.push({
          actorId: intent.actorId,
          targetId: intent.targetId,
          type: "message",
          message: `Spell cast: ${intent.spellId ?? "unknown"}`,
        });
        break;
      case "useItem":
        outcomes.push({
          actorId: intent.actorId,
          type: "message",
          message: `Used item: ${intent.itemId ?? "unknown"}`,
        });
        break;
      default:
        outcomes.push({
          actorId: intent.actorId,
          type: "message",
          message: "Unsupported intent.",
        });
        break;
    }
  }

  state.turn += 1;
  return outcomes;
}
