import { MapData, Vec2i } from '../types';
import { DungeonGenerator } from './dungeonGenerator';

export type Intent = 
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'WAIT' };

export interface GameState {
  map: MapData | null;
  playerPos: Vec2i;
  turn: number;
}

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      map: null,
      playerPos: { x: 0, y: 0 },
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
    this.state.turn = 0;
  }

  public processInput(intent: Intent): boolean {
    if (!this.state.map) return false;

    let acted = false;

    switch (intent.type) {
      case 'MOVE':
        acted = this.handleMove(intent.dx, intent.dy);
        break;
      case 'WAIT':
        acted = true;
        break;
    }

    if (acted) {
      this.tick();
      return true;
    }
    return false;
  }

  private handleMove(dx: number, dy: number): boolean {
    const { map, playerPos } = this.state;
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

  private tick() {
    this.state.turn += 1;
    // Future: update AI, process systems, etc.
  }
}
