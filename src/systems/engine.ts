import { MapData, Vec2i, Entity } from '../types';
import { DungeonGenerator } from './dungeonGenerator';

export type Intent = 
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'INTERACT'; dx: number; dy: number }
  | { type: 'WAIT' };

export interface GameState {
  map: MapData | null;
  playerPos: Vec2i;
  entities: Entity[];
  turn: number;
}

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      map: null,
      playerPos: { x: 0, y: 0 },
      entities: [],
      turn: 0,
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public init() {
    const generator = new DungeonGenerator(80, 60);
    const mapData = generator.generate();
    
    let startPos = { x: 1, y: 1 };
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        if (mapData.tiles[y][x] === 'FLOOR') {
          startPos = { x, y };
          break;
        }
      }
      if (startPos.x !== 1) break;
    }

    this.state.map = mapData;
    this.state.playerPos = startPos;
    this.state.entities = [
      { id: 'door1', kind: 'door', pos: { x: startPos.x + 1, y: startPos.y }, blocksMovement: true, interactable: true, state: 'closed' },
      { id: 'chest1', kind: 'chest', pos: { x: startPos.x + 2, y: startPos.y }, blocksMovement: false, interactable: true, state: 'closed' }
    ];
    this.state.turn = 0;
  }

  public processInput(intent: Intent): { acted: boolean; message?: string } {
    if (!this.state.map) return { acted: false };

    let acted = false;
    let message: string | undefined;

    switch (intent.type) {
      case 'MOVE':
        acted = this.handleMove(intent.dx, intent.dy);
        break;
      case 'INTERACT':
        const result = this.handleInteract(intent.dx, intent.dy);
        acted = result.acted;
        message = result.message;
        break;
      case 'WAIT':
        acted = true;
        break;
    }

    if (acted) {
      this.tick();
      return { acted: true, message };
    }
    return { acted: false };
  }

  private handleMove(dx: number, dy: number): boolean {
    const { map, playerPos, entities } = this.state;
    if (!map) return false;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Bounds check
    if (newX < 0 || newX >= map.width || newY < 0 || newY >= map.height) {
      return false;
    }

    // Wall check
    if (map.tiles[newY][newX] === 'WALL') {
      return false;
    }

    // Entity collision check
    const entityAt = entities.find(e => e.pos.x === newX && e.pos.y === newY && e.blocksMovement);
    if (entityAt) return false;

    // Diagonal corner-cutting check
    if (dx !== 0 && dy !== 0) {
      const tile1 = map.tiles[playerPos.y][newX];
      const tile2 = map.tiles[newY][playerPos.x];
      if (tile1 === 'WALL' || tile2 === 'WALL') {
        return false; // Blocked by corner
      }
    }

    this.state.playerPos = { x: newX, y: newY };
    return true;
  }

  private handleInteract(dx: number, dy: number): { acted: boolean; message?: string } {
    const { playerPos, entities } = this.state;
    const targetX = playerPos.x + dx;
    const targetY = playerPos.y + dy;

    const entity = entities.find(e => e.pos.x === targetX && e.pos.y === targetY && e.interactable);
    if (!entity) return { acted: false, message: 'Nothing to interact with.' };

    if (entity.kind === 'door') {
      entity.state = entity.state === 'closed' ? 'open' : 'closed';
      entity.blocksMovement = entity.state === 'closed';
      return { acted: true, message: `Door ${entity.state}.` };
    } else if (entity.kind === 'chest') {
      if (entity.state === 'open') return { acted: false, message: 'Chest is empty.' };
      entity.state = 'open';
      return { acted: true, message: 'Chest opened and looted.' };
    }

    return { acted: false };
  }

  private tick() {
    this.state.turn += 1;
    // Future: update AI, process systems, etc.
  }
}
