import { Room, Client } from 'colyseus';
import { HubState, HubPlayer, Zone, POI, POIType, MoveResult } from '@game/shared';
import { savePlayerProgress, getPlayerByUserId } from '../services/playerService';

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

interface MissionReward {
  gold: number;
  essence: number;
  wave: number;
  enemiesKilled: number;
  currency: { gold: number; essence: number };
  level: number;
  experience: number;
  inventory: Array<{
    itemName: string;
    itemType: string;
    rarity: string;
    level: number;
    sellValue: number;
    icon: string;
    modifiers: object;
  }>;
  progress: {
    trapDamageLevel: number;
    trapCooldownLevel: number;
    abilityPowerLevel: number;
    abilityCooldownLevel: number;
  };
}

interface PlayerSessionData {
  playerId: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  gold: number;
  essence: number;
  currency: { gold: number; essence: number };
  class: string;
  inventory: Array<{
    id: string;
    itemName: string;
    itemType: string;
    rarity: string;
    level: number;
    sellValue: number;
    icon: string;
    modifiers: object;
  }>;
  progress: {
    highestWaveReached: number;
    totalEnemiesKilled: number;
    totalGoldEarned: number;
    totalEssenceEarned: number;
    trapDamageLevel: number;
    trapCooldownLevel: number;
    abilityPowerLevel: number;
    abilityCooldownLevel: number;
  };
}

export class HubRoom extends Room<HubState> {
  private zones = ZONES;
  private pois = POIS;
  private playerSessions: Map<string, PlayerSessionData> = new Map();

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

    this.onMessage('interact:poi', client => {
      this.handlePOIInteraction(client);
    });

    this.onMessage('mission:complete', async (client, reward: MissionReward) => {
      await this.handleMissionComplete(client, reward);
    });

    this.onMessage('player:save', async client => {
      await this.savePlayerData(client.sessionId);
    });
  }

  private async handleMissionComplete(client: Client, reward: MissionReward) {
    const session = this.playerSessions.get(client.sessionId);
    if (!session) {
      console.log(`⚠️ No session for client ${client.sessionId}`);
      return;
    }

    console.log(`💾 Saving mission rewards for ${session.name}...`);

    session.gold += reward.gold;
    session.essence += reward.essence;
    session.currency.gold = session.gold;
    session.currency.essence = session.essence;

    if (reward.wave > session.progress.highestWaveReached) {
      session.progress.highestWaveReached = reward.wave;
    }
    session.progress.totalEnemiesKilled += reward.enemiesKilled;
    session.progress.totalGoldEarned += reward.gold;
    session.progress.totalEssenceEarned += reward.essence;

    const newItems = reward.inventory.map((item, idx) => ({
      id: `loot-${Date.now()}-${idx}`,
      ...item,
    }));
    session.inventory = [...session.inventory, ...newItems];

    if (reward.level > session.level) {
      session.level = reward.level;
    }
    session.experience += reward.experience;

    await this.savePlayerData(client.sessionId);

    client.send('mission:saved', {
      gold: session.gold,
      essence: session.essence,
      level: session.level,
    });
  }

  private async savePlayerData(sessionId: string): Promise<void> {
    const session = this.playerSessions.get(sessionId);
    if (!session) return;

    try {
      await savePlayerProgress(
        session.playerId,
        {
          id: session.playerId,
          name: session.name,
          level: session.level,
          experience: session.experience,
          gold: session.gold,
          essence: session.essence,
          class: session.class,
        },
        {
          highestWaveReached: session.progress.highestWaveReached,
          totalEnemiesKilled: session.progress.totalEnemiesKilled,
          totalGoldEarned: session.progress.totalGoldEarned,
          totalEssenceEarned: session.progress.totalEssenceEarned,
          trapDamageLevel: session.progress.trapDamageLevel,
          trapCooldownLevel: session.progress.trapCooldownLevel,
          abilityPowerLevel: session.progress.abilityPowerLevel,
          abilityCooldownLevel: session.progress.abilityCooldownLevel,
        },
        session.inventory
      );
      console.log(`✅ Player data saved for ${session.name}`);
    } catch (error) {
      console.error(`❌ Failed to save player data for ${session.name}:`, error);
    }
  }

  private isInBounds(x: number, y: number): boolean {
    return (
      x >= PLAYER_RADIUS &&
      x <= MAP_WIDTH - PLAYER_RADIUS &&
      y >= PLAYER_RADIUS &&
      y <= MAP_HEIGHT - PLAYER_RADIUS
    );
  }

  private getZoneAt(x: number, y: number): Zone | null {
    for (const zone of this.zones) {
      const { bounds } = zone;
      if (
        x >= bounds.x &&
        x < bounds.x + bounds.width &&
        y >= bounds.y &&
        y < bounds.y + bounds.height
      ) {
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
        reason: `Requires level ${poi.minLevel} to enter ${poi.name}`,
      });
      return;
    }

    console.log(`⚔️ ${player.name} entering ${poi.name} (${poi.type})`);

    client.send('poi:interaction', {
      success: true,
      poi,
      event: { type: 'enter_poi', poi },
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
        y: player.position.y,
      };
    }

    const zone = this.getZoneAt(x, y);
    if (zone && player.level < zone.minLevel) {
      console.log(
        `🚫 ${player.name} (lvl ${player.level}) blocked from ${zone.name} (min lvl ${zone.minLevel})`
      );
      return {
        success: false,
        reason: `Requires level ${zone.minLevel} to enter ${zone.name}`,
        x: player.position.x,
        y: player.position.y,
      };
    }

    player.position = { x, y };
    this.setState({ ...this.state });

    return { success: true, x, y };
  }

  async onJoin(
    client: Client,
    options: { name: string; level?: number; class?: string; playerId?: string; userId?: string }
  ) {
    console.log(`🔌 Client connected: ${client.sessionId}`);

    let sessionData: PlayerSessionData;

    if (options.playerId) {
      try {
        const dbPlayer = await getPlayerByUserId(options.userId || options.playerId);
        if (dbPlayer) {
          console.log(`📂 Loading saved data for ${dbPlayer.name}`);
          sessionData = {
            playerId: dbPlayer.id,
            userId: options.userId || options.playerId,
            name: dbPlayer.name,
            level: dbPlayer.level,
            experience: dbPlayer.experience,
            gold: dbPlayer.gold,
            essence: dbPlayer.essence,
            currency: { gold: dbPlayer.gold, essence: dbPlayer.essence },
            class: dbPlayer.class,
            inventory: dbPlayer.inventory.map((item: any) => ({
              id: item.id,
              itemName: item.itemName,
              itemType: item.itemType,
              rarity: item.rarity,
              level: item.level,
              sellValue: item.sellValue,
              icon: item.icon,
              modifiers: JSON.parse(item.modifiers),
            })),
            progress: dbPlayer.progress
              ? {
                  highestWaveReached: dbPlayer.progress.highestWaveReached,
                  totalEnemiesKilled: dbPlayer.progress.totalEnemiesKilled,
                  totalGoldEarned: dbPlayer.progress.totalGoldEarned,
                  totalEssenceEarned: dbPlayer.progress.totalEssenceEarned,
                  trapDamageLevel: dbPlayer.progress.trapDamageLevel,
                  trapCooldownLevel: dbPlayer.progress.trapCooldownLevel,
                  abilityPowerLevel: dbPlayer.progress.abilityPowerLevel,
                  abilityCooldownLevel: dbPlayer.progress.abilityCooldownLevel,
                }
              : {
                  highestWaveReached: 0,
                  totalEnemiesKilled: 0,
                  totalGoldEarned: 0,
                  totalEssenceEarned: 0,
                  trapDamageLevel: 0,
                  trapCooldownLevel: 0,
                  abilityPowerLevel: 0,
                  abilityCooldownLevel: 0,
                },
          };
        } else {
          throw new Error('Player not found in database');
        }
      } catch (error) {
        console.log('📝 Creating new player data');
        sessionData = {
          playerId: options.playerId || `temp_${client.sessionId}`,
          userId: options.userId || options.playerId || client.sessionId,
          name: options.name || `Player_${client.sessionId.slice(0, 6)}`,
          level: options.level || 1,
          experience: 0,
          gold: 100,
          essence: 10,
          currency: { gold: 100, essence: 10 },
          class: options.class || 'elementalist',
          inventory: [],
          progress: {
            highestWaveReached: 0,
            totalEnemiesKilled: 0,
            totalGoldEarned: 0,
            totalEssenceEarned: 0,
            trapDamageLevel: 0,
            trapCooldownLevel: 0,
            abilityPowerLevel: 0,
            abilityCooldownLevel: 0,
          },
        };
      }
    } else {
      sessionData = {
        playerId: `temp_${client.sessionId}`,
        userId: client.sessionId,
        name: options.name || `Player_${client.sessionId.slice(0, 6)}`,
        level: options.level || 1,
        experience: 0,
        gold: 100,
        essence: 10,
        currency: { gold: 100, essence: 10 },
        class: options.class || 'elementalist',
        inventory: [],
        progress: {
          highestWaveReached: 0,
          totalEnemiesKilled: 0,
          totalGoldEarned: 0,
          totalEssenceEarned: 0,
          trapDamageLevel: 0,
          trapCooldownLevel: 0,
          abilityPowerLevel: 0,
          abilityCooldownLevel: 0,
        },
      };
    }

    this.playerSessions.set(client.sessionId, sessionData);

    const player: HubPlayer = {
      id: client.sessionId,
      name: sessionData.name,
      level: sessionData.level,
      class: sessionData.class as any,
      position: { x: 128, y: 128 },
    };

    this.state.players.set(client.sessionId, player);
    this.setState({ ...this.state });

    client.send('player:data', {
      playerId: sessionData.playerId,
      userId: sessionData.userId,
      gold: sessionData.gold,
      essence: sessionData.essence,
      level: sessionData.level,
      experience: sessionData.experience,
      inventory: sessionData.inventory,
      progress: sessionData.progress,
    });

    console.log(
      `✅ Player "${sessionData.name}" (${sessionData.class}, lvl ${sessionData.level}) joined. Total: ${this.state.players.size}`
    );
  }

  async onLeave(client: Client, _consented: boolean) {
    const session = this.playerSessions.get(client.sessionId);
    if (session) {
      console.log(`👋 Player "${session.name}" leaving - saving data...`);
      await this.savePlayerData(client.sessionId);
      this.playerSessions.delete(client.sessionId);
    }

    const player = this.state.players.get(client.sessionId);
    if (player) {
      console.log(`👋 Player "${player.name}" left the hub`);
      this.state.players.delete(client.sessionId);
      this.setState({ ...this.state });
    }
  }

  onDispose() {
    console.log('🗑️ HubRoom disposed:', this.roomId);

    for (const [sessionId] of this.playerSessions) {
      this.savePlayerData(sessionId).catch(err => {
        console.error(`Failed to save on dispose: ${err}`);
      });
    }
  }
}
