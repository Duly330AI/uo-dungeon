import { MapData, TileType } from '../types';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class DungeonGenerator {
  private width: number;
  private height: number;
  private tiles: TileType[][];
  private rooms: Rect[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = Array(height).fill(null).map(() => Array(width).fill("WALL"));
  }

  generate(): MapData {
    const root: Rect = { x: 1, y: 1, width: this.width - 2, height: this.height - 2 };
    this.split(root, 5);
    this.createCorridors();
    return { width: this.width, height: this.height, tiles: this.tiles };
  }

  private split(rect: Rect, depth: number) {
    if (depth === 0 || (rect.width < 10 && rect.height < 10)) {
      this.createRoom(rect);
      return;
    }

    const splitHorizontal = Math.random() > 0.5;
    if (splitHorizontal && rect.height > 10) {
      const splitY = Math.floor(Math.random() * (rect.height - 6)) + 3;
      this.split({ x: rect.x, y: rect.y, width: rect.width, height: splitY }, depth - 1);
      this.split({ x: rect.x, y: rect.y + splitY, width: rect.width, height: rect.height - splitY }, depth - 1);
    } else if (rect.width > 10) {
      const splitX = Math.floor(Math.random() * (rect.width - 6)) + 3;
      this.split({ x: rect.x, y: rect.y, width: splitX, height: rect.height }, depth - 1);
      this.split({ x: rect.x + splitX, y: rect.y, width: rect.width - splitX, height: rect.height }, depth - 1);
    } else {
        this.createRoom(rect);
    }
  }

  private createRoom(rect: Rect) {
    const roomWidth = Math.floor(Math.random() * (rect.width - 4)) + 3;
    const roomHeight = Math.floor(Math.random() * (rect.height - 4)) + 3;
    const roomX = rect.x + Math.floor(Math.random() * (rect.width - roomWidth));
    const roomY = rect.y + Math.floor(Math.random() * (rect.height - roomHeight));

    for (let y = roomY; y < roomY + roomHeight; y++) {
      for (let x = roomX; x < roomX + roomWidth; x++) {
        this.tiles[y][x] = "FLOOR";
      }
    }
    this.rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
  }

  private createCorridors() {
    for (let i = 0; i < this.rooms.length - 1; i++) {
        const roomA = this.rooms[i];
        const roomB = this.rooms[i+1];
        
        const centerA = { x: Math.floor(roomA.x + roomA.width / 2), y: Math.floor(roomA.y + roomA.height / 2) };
        const centerB = { x: Math.floor(roomB.x + roomB.width / 2), y: Math.floor(roomB.y + roomB.height / 2) };

        this.drawCorridor(centerA.x, centerA.y, centerB.x, centerB.y);
    }
  }

  private drawCorridor(x1: number, y1: number, x2: number, y2: number) {
    let x = x1;
    let y = y1;

    while (x !== x2) {
        this.tiles[y][x] = "FLOOR";
        x += x < x2 ? 1 : -1;
    }
    while (y !== y2) {
        this.tiles[y][x] = "FLOOR";
        y += y < y2 ? 1 : -1;
    }
  }
}
