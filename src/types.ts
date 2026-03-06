export type EntityKind = "player" | "enemy" | "projectile";
export type IntentType = "move" | "attack" | "shoot" | "cast" | "useItem" | "wait";
export type OutcomeType =
  | "moved"
  | "hit"
  | "miss"
  | "blocked"
  | "damaged"
  | "death"
  | "drop"
  | "message"
  | "wait";

export type TileType = "WALL" | "FLOOR" | "DOOR";

export interface MapData {
  width: number;
  height: number;
  tiles: TileType[][];
}

export interface Vec2i {
  x: number;
  y: number;
}

export interface EntityId {
  kind: EntityKind;
  uid: string; // stable
}

export interface Stats {
  hp: number;
  hpMax: number;
  mana: number;
  stamina: number;
  base: Record<string, number>; // str/dex/int
  mods: Record<string, number>; // applied from equipment/effects
}

export interface ItemStack {
  itemId: string;
  qty: number;
}

export interface Inventory {
  slots: Array<ItemStack | null>;
}

export interface Equipment {}
export interface Skills {}

export interface Player {
  id: EntityId;
  posTile: Vec2i;
  stats: Stats;
  inventory: Inventory;
  equipment: Equipment;
  skills: Skills;
}

export interface Actor {
  id: string;
  dex: number;
}

export interface Initiative {
  order: string[];
  byId: Record<string, number>;
}

export interface Intent {
  actorId: string;
  type: IntentType;
  targetId?: string;
  to?: Vec2i;
  spellId?: string;
  itemId?: string;
}

export interface Outcome {
  actorId: string;
  type: OutcomeType;
  targetId?: string;
  amount?: number;
  message?: string;
}

export interface CombatState {
  turn: number;
  actors: Record<string, Actor>;
}

export interface Drop {
  itemId: string;
  qty: number;
}
