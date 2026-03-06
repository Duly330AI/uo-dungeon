/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadData } from './services/dataService';
import { DungeonGenerator } from './systems/dungeonGenerator';
import { MapData, Vec2i } from './types';
import { getVisibleTiles } from './util/fov';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<MapData | null>(null);
  const [playerPos, setPlayerPos] = useState<Vec2i>({ x: 0, y: 0 });

  const render = useCallback((ctx: CanvasRenderingContext2D, map: MapData, playerPos: Vec2i) => {
    const canvas = ctx.canvas;
    const visible = getVisibleTiles(map, playerPos, 8);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tileSize = 16;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!visible[y][x]) continue;

        const tile = map.tiles[y][x];
        ctx.fillStyle = tile === 'WALL' ? '#333' : '#eee';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
      }
    }

    // Render player
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerPos.x * tileSize, playerPos.y * tileSize, tileSize - 1, tileSize - 1);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await loadData('/data/combat_rules.json');
        await loadData('/data/skills.json');
        await loadData('/data/spells.json');
        await loadData('/data/monsters.json');
        
        const generator = new DungeonGenerator(80, 60);
        const mapData = generator.generate();
        setMap(mapData);

        // Find valid start position
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
        setPlayerPos(startPos);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (loading || !canvasRef.current || !map) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    render(ctx, map, playerPos);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(ctx, map, playerPos);
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      let newPos = { ...playerPos };
      if (e.key === 'w') newPos.y -= 1;
      if (e.key === 's') newPos.y += 1;
      if (e.key === 'a') newPos.x -= 1;
      if (e.key === 'd') newPos.x += 1;

      if (map.tiles[newPos.y] && map.tiles[newPos.y][newPos.x] !== 'WALL') {
        setPlayerPos(newPos);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loading, map, playerPos, render]);

  if (loading) return <div>Loading game data...</div>;

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full"
    />
  );
}
