/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadData } from './services/dataService';
import { AssetManager } from './services/assetManager';
import { AudioManager } from './services/audioManager';
import { MapData, Vec2i, Entity } from './types';
import { getVisibleTiles } from './util/fov';
import { GameEngine, Intent } from './systems/engine';

const TILE_SIZE = 32; // Scale up 16x16 sprites to 32x32 for better visibility

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(new GameEngine());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);

  const render = useCallback((ctx: CanvasRenderingContext2D, map: MapData, playerPos: Vec2i, entities: Entity[], playerStats: { hp: number, maxHp: number }) => {
    const canvas = ctx.canvas;
    const visible = getVisibleTiles(map, playerPos, 8);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const dungeonSheet = AssetManager.getImage('dungeon');
    const charSheet = AssetManager.getImage('chars');

    if (!dungeonSheet || !charSheet) {
      // Fallback rendering only if explicitly missing assets
      ctx.fillStyle = '#333';
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (!visible[y][x]) continue;
          if (map.tiles[y][x] === 'WALL') {
            ctx.fillRect(x * TILE_SIZE - (playerPos.x * TILE_SIZE - canvas.width / 2 + TILE_SIZE / 2), y * TILE_SIZE - (playerPos.y * TILE_SIZE - canvas.height / 2 + TILE_SIZE / 2), TILE_SIZE, TILE_SIZE);
          }
        }
      }
      ctx.fillStyle = 'red';
      ctx.fillRect(canvas.width / 2 - TILE_SIZE / 2, canvas.height / 2 - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      return;
    }

    // Camera centers on player
    const cameraX = playerPos.x * TILE_SIZE - canvas.width / 2 + TILE_SIZE / 2;
    const cameraY = playerPos.y * TILE_SIZE - canvas.height / 2 + TILE_SIZE / 2;

    const drawSprite = (img: HTMLImageElement, sx: number, sy: number, x: number, y: number) => {
      ctx.drawImage(img, sx * 16, sy * 16, 16, 16, Math.floor(x * TILE_SIZE - cameraX), Math.floor(y * TILE_SIZE - cameraY), TILE_SIZE, TILE_SIZE);
    };

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!visible[y][x]) continue;

        const tile = map.tiles[y][x];
        if (tile === 'WALL') {
          drawSprite(dungeonSheet, 1, 0, x, y); // Wall sprite
        } else {
          drawSprite(dungeonSheet, 0, 0, x, y); // Floor sprite
        }
      }
    }

    // Render entities
    for (const entity of entities) {
      if (!visible[entity.pos.y][entity.pos.x]) continue;
      if (entity.kind === 'door') {
        drawSprite(dungeonSheet, entity.state === 'closed' ? 3 : 4, 0, entity.pos.x, entity.pos.y);
      } else if (entity.kind === 'chest') {
        drawSprite(dungeonSheet, entity.state === 'closed' ? 5 : 6, 0, entity.pos.x, entity.pos.y);
      } else if (entity.kind === 'enemy') {
        drawSprite(charSheet, 0, 5, entity.pos.x, entity.pos.y); // Enemy sprite (row 5)
        // Health bar for enemy
        if (entity.hp !== undefined && entity.maxHp !== undefined) {
          const hpPct = entity.hp / entity.maxHp;
          const sx = Math.floor(entity.pos.x * TILE_SIZE - cameraX);
          const sy = Math.floor(entity.pos.y * TILE_SIZE - cameraY);
          ctx.fillStyle = 'red';
          ctx.fillRect(sx, sy - 4, TILE_SIZE, 3);
          ctx.fillStyle = 'green';
          ctx.fillRect(sx, sy - 4, TILE_SIZE * hpPct, 3);
        }
      }
    }

    // Render player
    drawSprite(charSheet, 0, 4, playerPos.x, playerPos.y); // Player sprite

    // UI Overlay (HP)
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`HP: ${playerStats.hp}/${playerStats.maxHp}`, 10, 20);
    ctx.fillText(`Turn: ${engineRef.current.getState().turn}`, 10, 40);

  }, []);

  useEffect(() => {
    async function init() {
      try {
        AudioManager.init();

        const [combatRules, skills, spells, monsters] = await Promise.all([
          loadData('/data/combat_rules.json'),
          loadData('/data/skills.json'),
          loadData('/data/spells.json'),
          loadData('/data/monsters.json'),
          AssetManager.loadImage('dungeon', '/assets/roguelikeDungeon_transparent.png'),
          AssetManager.loadImage('chars', '/assets/roguelikeSheet_transparent.png')
        ]);
        
        engineRef.current.init(combatRules, monsters);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load game data or assets:', err);
        setError(err.message || 'Unknown error occurred while loading assets.');
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (loading || error) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let intent: Intent | null = null;
      switch (e.key) {
        case '1': case 'z': intent = { type: 'MOVE', dx: -1, dy: 1 }; break;
        case '2': case 'x': case 'ArrowDown': intent = { type: 'MOVE', dx: 0, dy: 1 }; break;
        case '3': case 'c': intent = { type: 'MOVE', dx: 1, dy: 1 }; break;
        case '4': case 'a': case 'ArrowLeft': intent = { type: 'MOVE', dx: -1, dy: 0 }; break;
        case '5': case 's': intent = { type: 'WAIT' }; break;
        case '6': case 'd': case 'ArrowRight': intent = { type: 'MOVE', dx: 1, dy: 0 }; break;
        case '7': case 'q': intent = { type: 'MOVE', dx: -1, dy: -1 }; break;
        case '8': case 'w': case 'ArrowUp': intent = { type: 'MOVE', dx: 0, dy: -1 }; break;
        case '9': case 'e': intent = { type: 'MOVE', dx: 1, dy: -1 }; break;
        case 'f': setIsInteracting(true); setLogs(prev => [...prev.slice(-4), 'Interact in which direction?']); return;
      }

      if (intent) {
        if (isInteracting && intent.type === 'MOVE') {
          const interactIntent: Intent = { type: 'INTERACT', dx: intent.dx, dy: intent.dy };
          const result = engineRef.current.processInput(interactIntent);
          setIsInteracting(false);
          if (result.acted) {
            if (result.message) {
              setLogs(prev => [...prev.slice(-4), result.message!]);
            }
          } else if (result.message) {
            setLogs(prev => [...prev.slice(-4), result.message!]);
          }
        } else {
          const result = engineRef.current.processInput(intent);
          if (result.acted) {
            if (result.actionType === 'move') {
              AudioManager.playFootstep();
            }
            if (result.message) {
              setLogs(prev => [...prev.slice(-4), result.message!]);
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loading, error, isInteracting]);

  useEffect(() => {
    if (loading || error || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const renderLoop = () => {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.imageSmoothingEnabled = false;
      }

      const state = engineRef.current.getState();
      if (state.map) {
        render(ctx, state.map, state.playerPos, state.entities, state.playerStats);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [loading, error, render]);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-black h-full w-full flex items-center justify-center flex-col">
        <h1 className="text-2xl font-bold mb-4">Error Loading Game</h1>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-white text-black rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-4 text-white bg-black h-full w-full flex items-center justify-center">Loading game data and assets...</div>;

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full bg-black"
      />
      <div className="absolute bottom-4 left-4 text-white bg-black/50 p-2 rounded">
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </>
  );
}

