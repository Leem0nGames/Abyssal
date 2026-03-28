import { Room, Client } from 'colyseus';
import { HubState, HubPlayer, Zone, POI, POIType, MoveResult } from '@game/shared';

const MAP_WIDTH = 50 * 32;
const MAP_HEIGHT = 50 * 32;
const PLAYER_RADIUS = 12;

const ZONES: Zone[] = [
  {
    id: 'spawn',
    name: 'Spawn Area',
    minLevel: 1,
    bounds: { x: 0, y: 0, width: 256, height: 256 },
  },
  {
    id: 'forest',
    name: 'Dark Forest',
    minLevel: 5,
    bounds: { x: 256, y: 256, width: 384, height: 384 },
  },
  {
    id: 'mountains',
    name: 'Frozen Mountains',
    minLevel: 10,
    bounds: { x: 640, y: 0, width: 512, height: 384 },
  },
  {
    id: 'castle',
    name: 'Dragon Castle',
    minLevel: 20,
    bounds: { x: 1024, y: 768, width: 576, height: 576 },
  },
];

const POIS: POI[] = [
  {
    id: 'crypt_entrance',
    name: 'Ancient Crypt',
    type: POIType.DUNGEON,
    position: { x: 400, y: 400 },
    radius: 40,
    minLevel: 5,
  },
  {
    id: 'temple_ruins',
    name: 'Ruined Temple',
    type: POIType.RUINS,
    position: { x: 800, y: 200 },
    radius: 50,
    minLevel: 10,
  },
  {
    id: 'enchanted_forest',
    name: 'Enchanted Grove',
    type: POIType.FOREST,
    position: { x: 300, y: 700 },
    radius: 45,
    minLevel: 3,
  },
  {
    id: 'frost_dungeon',
    name: 'Frost Cavern',
    type: POIType.DUNGEON,
    position: { x: 1000, y: 150 },
    radius: 40,
    minLevel: 15,
  },
  {
    id: 'castle_depths',
    name: 'Dragon Lair',
    type: POIType.DUNGEON,
    position: { x: 1300, y: 1050 },
    radius: 60,
    minLevel: 25,
  },
];

export class HubRoom extends Room<HubState> {
  private zones = ZONES;
  private pois = POIS;

  onCreate(_options: Record<string, unknown>) {
    console.log('🏠 HubRoom created:', this.roomId);

    this.setState({
      players: new Map(),
      zones: this.zones,
      pois: this.pois,
      traps: [],
    });

    this.onMessage('move', (client, data: { x: number; y: number }) => {
      const result = this.handlePlayerMove(client, data.x, data.y);
      client.send('move:result', result);
    });

    this.onMessage('check:zone', (client, data: { x: number; y: number }) => {
      const zone = this.getZoneAt(data.x, data.y);
      if (zone) {
        const player = this.state.players.get(client.sessionId);
        const canEnter = player && player.level >= zone.minLevel;
        client.send('zone:check', { zone, canEnter });
      }
    });

    this.onMessage('interact:poi', (client) => {
      this.handlePOIInteraction(client);
    });
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= PLAYER_RADIUS && x <= MAP_WIDTH - PLAYER_RADIUS &&
           y >= PLAYER_RADIUS && y <= MAP_HEIGHT - PLAYER_RADIUS;
  }

  private getZoneAt(x: number, y: number): Zone | null {
    for (const zone of this.zones) {
      const { bounds } = zone;
      if (x >= bounds.x && x < bounds.x + bounds.width &&
          y >= bounds.y && y < bounds.y + bounds.height) {
        return zone;
      }
    }
    return null;
  }

  private getPOIInRange(x: number, y: number): POI | null {
    for (const poi of this.pois) {
      const dx = x - poi.position.x;
      const dy = y - poi.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= poi.radius) {
        return poi;
      }
    }
    return null;
  }

  private handlePOIInteraction(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const poi = this.getPOIInRange(player.position.x, player.position.y);
    
    if (!poi) {
      client.send('poi:interaction', { success: false, reason: 'No POI nearby' });
      return;
    }

    if (player.level < poi.minLevel) {
      client.send('poi:interaction', { 
        success: false, 
        reason: `Requires level ${poi.minLevel} to enter ${poi.name}` 
      });
      return;
    }

    console.log(`⚔️ ${player.name} entering ${poi.name} (${poi.type})`);
    
    client.send('poi:interaction', { 
      success: true, 
      poi,
      event: { type: 'enter_poi', poi }
    });
  }

  private handlePlayerMove(client: Client, x: number, y: number): MoveResult {
    const player = this.state.players.get(client.sessionId);
    if (!player) {
      return { success: false, reason: 'Player not found' };
    }

    if (!this.isInBounds(x, y)) {
      return { 
        success: false, 
        reason: 'Out of bounds',
        x: player.position.x,
        y: player.position.y
      };
    }

    const zone = this.getZoneAt(x, y);
    if (zone && player.level < zone.minLevel) {
      console.log(`🚫 ${player.name} (lvl ${player.level}) blocked from ${zone.name} (min lvl ${zone.minLevel})`);
      return {
        success: false,
        reason: `Requires level ${zone.minLevel} to enter ${zone.name}`,
        x: player.position.x,
        y: player.position.y
      };
    }

    player.position = { x, y };
    this.setState({ ...this.state });

    return { success: true, x, y };
  }

  onJoin(client: Client, options: { name: string; level?: number; class?: string }) {
    console.log(`🔌 Client connected: ${client.sessionId}`);

    const player: HubPlayer = {
      id: client.sessionId,
      name: options.name || `Player_${client.sessionId.slice(0, 6)}`,
      level: options.level || 1,
      class: (options.class as any) || 'elementalist',
      position: { x: 128, y: 128 },
    };

    this.state.players.set(client.sessionId, player);
    this.setState({ ...this.state });

    console.log(`✅ Player "${player.name}" (${player.class}, lvl ${player.level}) joined. Total: ${this.state.players.size}`);
  }

  onLeave(client: Client, _consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      console.log(`👋 Player "${player.name}" left the hub`);
      this.state.players.delete(client.sessionId);
      this.setState({ ...this.state });
    }
  }

  onDispose() {
    console.log('🗑️ HubRoom disposed:', this.roomId);
  }
}
