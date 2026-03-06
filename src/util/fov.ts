import { MapData, Vec2i } from '../types';

export function getVisibleTiles(map: MapData, playerPos: Vec2i, radius: number): boolean[][] {
  const visible = Array(map.height).fill(null).map(() => Array(map.width).fill(false));

  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const targetX = playerPos.x + x;
      const targetY = playerPos.y + y;

      if (targetX >= 0 && targetX < map.width && targetY >= 0 && targetY < map.height) {
        if (hasLineOfSight(map, playerPos, { x: targetX, y: targetY })) {
          visible[targetY][targetX] = true;
        }
      }
    }
  }
  return visible;
}

function hasLineOfSight(map: MapData, start: Vec2i, end: Vec2i): boolean {
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (map.tiles[y0][x0] === 'WALL') return false;
    if (x0 === x1 && y0 === y1) return true;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}
