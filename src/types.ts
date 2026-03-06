export type EntityKind = "player" | "enemy" | "projectile";

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

// Placeholder interfaces for now, to be expanded in Phase 2
export interface Inventory {}
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
