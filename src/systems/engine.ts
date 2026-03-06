import { MapData, Vec2i, Entity } from '../types';
import { DungeonGenerator } from './dungeonGenerator';

export type Intent = 
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'INTERACT'; dx: number; dy: number }
  | { type: 'WAIT' };

export interface GameState {
  map: MapData | null;
  playerPos: Vec2i;
  playerStats: { hp: number; maxHp: number; attack: number; defense: number };
  entities: Entity[];
  turn: number;
}

export class GameEngine {
  private state: GameState;
  private combatRules: any;
  private monsterTemplates: any[] = [];

  constructor() {
    this.state = {
      map: null,
      playerPos: { x: 0, y: 0 },
      playerStats: { hp: 100, maxHp: 100, attack: 10, defense: 5 },
      entities: [],
      turn: 0,
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public init(combatRules: any, monsterData: any[]) {
    this.combatRules = combatRules;
    this.monsterTemplates = monsterData;

    const generator = new DungeonGenerator(80, 60);
    const mapData = generator.generate();
    
    let startPos = { x: 1, y: 1 };
    // Find valid start pos
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
    this.state.playerStats = { hp: 100, maxHp: 100, attack: 10, defense: 5 };
    this.state.entities = [
      { id: 'door1', kind: 'door', pos: { x: startPos.x + 1, y: startPos.y }, blocksMovement: true, interactable: true, state: 'closed' },
      { id: 'chest1', kind: 'chest', pos: { x: startPos.x + 2, y: startPos.y }, blocksMovement: false, interactable: true, state: 'closed' }
    ];

    // Spawn some monsters
    this.spawnMonsters(5);

    this.state.turn = 0;
  }

  private spawnMonsters(count: number) {
    if (!this.state.map) return;
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.state.map.width);
        y = Math.floor(Math.random() * this.state.map.height);
      } while (this.state.map.tiles[y][x] === 'WALL' || (x === this.state.playerPos.x && y === this.state.playerPos.y));

      const template = this.monsterTemplates.find(m => m.id === 'goblin') || this.monsterTemplates[0];
      
      this.state.entities.push({
        id: `monster_${i}`,
        kind: 'enemy',
        pos: { x, y },
        blocksMovement: true,
        interactable: false,
        state: 'idle',
        hp: template.hp,
        maxHp: template.hp,
        name: template.id,
        stats: { attack: 8, defense: 2 } // Simplified stats
      });
    }
  }

  public processInput(intent: Intent): { acted: boolean; message?: string } {
    if (!this.state.map) return { acted: false };
    if (this.state.playerStats.hp <= 0) return { acted: false, message: 'You are dead.' };

    let acted = false;
    let message: string | undefined;

    switch (intent.type) {
      case 'MOVE':
        const moveResult = this.handleMove(intent.dx, intent.dy);
        acted = moveResult.acted;
        message = moveResult.message;
        break;
      case 'INTERACT':
        const interactResult = this.handleInteract(intent.dx, intent.dy);
        acted = interactResult.acted;
        message = interactResult.message;
        break;
      case 'WAIT':
        acted = true;
        message = 'You wait.';
        break;
    }

    if (acted) {
      const aiMessage = this.tick();
      if (aiMessage) {
        message = message ? `${message} ${aiMessage}` : aiMessage;
      }
      return { acted: true, message };
    }
    return { acted: false, message };
  }

  private handleMove(dx: number, dy: number): { acted: boolean; message?: string } {
    const { map, playerPos, entities } = this.state;
    if (!map) return { acted: false };

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Bounds check
    if (newX < 0 || newX >= map.width || newY < 0 || newY >= map.height) {
      return { acted: false };
    }

    // Wall check
    if (map.tiles[newY][newX] === 'WALL') {
      return { acted: false };
    }

    // Entity collision/combat check
    const entityAt = entities.find(e => e.pos.x === newX && e.pos.y === newY && e.blocksMovement);
    if (entityAt) {
      if (entityAt.kind === 'enemy') {
        return this.resolveCombat('player', entityAt);
      }
      return { acted: false, message: 'Blocked.' };
    }

    // Diagonal corner-cutting check
    if (dx !== 0 && dy !== 0) {
      const tile1 = map.tiles[playerPos.y][newX];
      const tile2 = map.tiles[newY][playerPos.x];
      if (tile1 === 'WALL' || tile2 === 'WALL') {
        return { acted: false }; // Blocked by corner
      }
    }

    this.state.playerPos = { x: newX, y: newY };
    return { acted: true };
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

  private resolveCombat(attackerId: string, defender: Entity): { acted: boolean; message: string } {
    // Simplified combat using stats
    const attackerStats = attackerId === 'player' ? this.state.playerStats : this.state.entities.find(e => e.id === attackerId)?.stats;
    
    if (!attackerStats) return { acted: false, message: 'Combat error: Attacker not found.' };

    const atk = attackerStats.attack || 0;
    const def = defender.stats?.defense || 0;

    // Simple hit chance formula: Base 70% + 5% per point of difference
    let hitChance = (this.combatRules?.hit_chance?.base || 0.7) + (atk - def) * 0.05;
    hitChance = Math.max(0.1, Math.min(0.95, hitChance)); // Clamp between 10% and 95%

    const roll = Math.random();

    if (roll <= hitChance) {
      // Damage formula: 1 to 5 + 10% of Attack
      const baseDmg = Math.floor(Math.random() * 5) + 1;
      const damage = Math.floor(baseDmg + atk * 0.1);
      
      defender.hp = (defender.hp || 0) - damage;
      
      let msg = attackerId === 'player' 
        ? `You hit ${defender.name} for ${damage} damage.`
        : `${attackerId === 'monster' ? defender.name : 'Enemy'} hits you for ${damage} damage.`; // Simplified name handling for enemy-on-player

      if (attackerId !== 'player' && defender === undefined) {
          // Special case for player being defender (not an Entity in this array)
          // This function signature assumes defender is an Entity. 
          // We need to handle Player as defender separately or unify them.
          // For now, let's look at how this is called.
      }
      
      if ((defender.hp || 0) <= 0) {
        if (defender.id === 'player') {
             msg += " You die.";
        } else {
            defender.state = 'dead';
            defender.blocksMovement = false;
            defender.kind = 'chest'; // Turn into lootable corpse
            defender.name = `Dead ${defender.name}`;
            this.state.entities = this.state.entities.filter(e => e.id !== defender.id);
            msg += ` ${defender.name} dies.`;
        }
      }
      return { acted: true, message: msg };
    } else {
      return { acted: true, message: attackerId === 'player' ? `You miss ${defender.name}.` : `${defender.name} misses you.` };
    }
  }

  private tick(): string | undefined {
    this.state.turn += 1;
    let log = '';

    // Monster AI
    const playerPos = this.state.playerPos;
    
    // Filter out dead entities just in case
    this.state.entities = this.state.entities.filter(e => e.state !== 'dead');

    for (const entity of this.state.entities) {
      if (entity.kind !== 'enemy') continue;

      const dx = playerPos.x - entity.pos.x;
      const dy = playerPos.y - entity.pos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 8) { // Aggro range
        if (dist < 1.5) { // Adjacent
          // Attack player
          // We need to treat player as an Entity for resolveCombat, or adapt resolveCombat.
          // Adapting resolveCombat to handle player as defender is tricky because player is not in entities array.
          // Let's inline the monster attack logic here for now to keep it simple and safe, mirroring resolveCombat logic.
          
          const attackerStats = entity.stats || { attack: 0, defense: 0 };
          const defenderStats = this.state.playerStats;
          
          const atk = attackerStats.attack;
          const def = defenderStats.defense;
          
          let hitChance = (this.combatRules?.hit_chance?.base || 0.7) + (atk - def) * 0.05;
          hitChance = Math.max(0.1, Math.min(0.95, hitChance));

          if (Math.random() <= hitChance) {
             const baseDmg = Math.floor(Math.random() * 5) + 1;
             const damage = Math.floor(baseDmg + atk * 0.1);
             this.state.playerStats.hp -= damage;
             log += `${entity.name} hits you for ${damage} damage. `;
          } else {
             log += `${entity.name} misses you. `;
          }

        } else {
          // Move towards player
          const stepX = Math.sign(dx);
          const stepY = Math.sign(dy);
          
          // Try diagonal
          if (!this.isBlocked(entity.pos.x + stepX, entity.pos.y + stepY)) {
             entity.pos.x += stepX;
             entity.pos.y += stepY;
          } else if (!this.isBlocked(entity.pos.x + stepX, entity.pos.y)) {
             entity.pos.x += stepX;
          } else if (!this.isBlocked(entity.pos.x, entity.pos.y + stepY)) {
             entity.pos.y += stepY;
          }
        }
      }
    }
    return log.trim() || undefined;
  }

  private isBlocked(x: number, y: number): boolean {
    if (!this.state.map) return true;
    if (this.state.map.tiles[y][x] === 'WALL') return true;
    if (this.state.playerPos.x === x && this.state.playerPos.y === y) return true;
    if (this.state.entities.some(e => e.pos.x === x && e.pos.y === y && e.blocksMovement)) return true;
    return false;
  }
}
