import { create } from 'zustand';
import {
  HubPlayer,
  Zone,
  POI,
  PlayerCurrency,
  UpgradeType,
  UPGRADES,
  LootItem,
  LootRarity,
  LootType,
  LootModifier,
  LootModifierData,
  RARITY_DROP_RATES,
  LOOT_ITEM_PREFIXES,
  LOOT_MODIFIER_DATA,
} from '@game/shared';

interface Upgrades {
  trap_damage: number;
  trap_cooldown: number;
  ability_power: number;
  ability_cooldown: number;
}

interface MissionResults {
  poiName: string;
  waveReached: number;
  enemiesKilled: number;
  goldEarned: number;
  essenceEarned: number;
  lootCollected: LootItem[];
}

interface GameStore {
  connected: boolean;
  playerName: string;
  playerId: string | null;
  playerLevel: number;
  players: Map<string, HubPlayer>;
  zones: Zone[];
  pois: POI[];
  nearbyPOI: POI | null;
  currentMission: POI | null;
  notification: { message: string; type: 'info' | 'error' } | null;
  currency: PlayerCurrency;
  upgrades: Upgrades;
  showUpgradeShop: boolean;
  inventory: LootItem[];
  showInventory: boolean;
  missionResults: MissionResults | null;

  setConnected: (connected: boolean) => void;
  setPlayerName: (name: string) => void;
  setPlayerId: (id: string | null) => void;
  setPlayerLevel: (level: number) => void;
  setPlayers: (players: Map<string, HubPlayer>) => void;
  setZones: (zones: Zone[]) => void;
  setPOIs: (pois: POI[]) => void;
  setNearbyPOI: (poi: POI | null) => void;
  setCurrentMission: (poi: POI | null) => void;
  addPlayer: (player: HubPlayer) => void;
  removePlayer: (id: string) => void;
  updatePlayerPosition: (id: string, x: number, y: number) => void;
  setNotification: (notification: { message: string; type: 'info' | 'error' } | null) => void;
  addCurrency: (gold: number, essence: number) => void;
  purchaseUpgrade: (type: UpgradeType) => boolean;
  setShowUpgradeShop: (show: boolean) => void;
  addLoot: (item: LootItem) => void;
  removeLoot: (itemId: string) => void;
  sellLoot: (itemId: string) => void;
  setShowInventory: (show: boolean) => void;
  generateLoot: (waveLevel: number) => LootItem;
  setMissionResults: (results: MissionResults | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  connected: false,
  playerName: '',
  playerId: null,
  playerLevel: 1,
  players: new Map(),
  zones: [],
  pois: [],
  nearbyPOI: null,
  currentMission: null,
  notification: null,
  currency: { gold: 100, essence: 10 },
  upgrades: {
    trap_damage: 0,
    trap_cooldown: 0,
    ability_power: 0,
    ability_cooldown: 0,
  },
  showUpgradeShop: false,
  inventory: [],
  showInventory: false,
  missionResults: null,

  setConnected: connected => set({ connected }),
  setPlayerName: playerName => set({ playerName }),
  setPlayerId: playerId => set({ playerId }),
  setPlayerLevel: playerLevel => set({ playerLevel }),

  setPlayers: players => set({ players }),
  setZones: zones => set({ zones }),
  setPOIs: pois => set({ pois }),
  setNearbyPOI: nearbyPOI => set({ nearbyPOI }),
  setCurrentMission: currentMission => set({ currentMission }),

  addPlayer: player =>
    set(state => {
      const newPlayers = new Map(state.players);
      newPlayers.set(player.id, player);
      return { players: newPlayers };
    }),

  removePlayer: id =>
    set(state => {
      const newPlayers = new Map(state.players);
      newPlayers.delete(id);
      return { players: newPlayers };
    }),

  updatePlayerPosition: (id, x, y) =>
    set(state => {
      const newPlayers = new Map(state.players);
      const player = newPlayers.get(id);
      if (player) {
        newPlayers.set(id, { ...player, position: { x, y } });
      }
      return { players: newPlayers };
    }),

  setNotification: notification => set({ notification }),

  addCurrency: (gold, essence) =>
    set(state => ({
      currency: {
        gold: state.currency.gold + gold,
        essence: state.currency.essence + essence,
      },
    })),

  purchaseUpgrade: type => {
    const state = get();
    const upgrade = UPGRADES[type];
    const upgradeKey = type as unknown as keyof Upgrades;
    const currentLevel = state.upgrades[upgradeKey];

    if (currentLevel >= upgrade.maxLevel) return false;

    const costGold = upgrade.costGold[currentLevel];
    const costEssence = upgrade.costEssence[currentLevel];

    if (state.currency.gold < costGold || state.currency.essence < costEssence) return false;

    set({
      currency: {
        gold: state.currency.gold - costGold,
        essence: state.currency.essence - costEssence,
      },
      upgrades: {
        ...state.upgrades,
        [upgradeKey]: currentLevel + 1,
      },
    });

    return true;
  },

  setShowUpgradeShop: show => set({ showUpgradeShop: show }),

  addLoot: item =>
    set(state => ({
      inventory: [...state.inventory, item],
    })),

  removeLoot: itemId =>
    set(state => ({
      inventory: state.inventory.filter(i => i.id !== itemId),
    })),

  sellLoot: itemId => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    set({
      currency: {
        gold: state.currency.gold + item.sellValue,
        essence: state.currency.essence,
      },
      inventory: state.inventory.filter(i => i.id !== itemId),
    });
  },

  setShowInventory: show => set({ showInventory: show }),

  generateLoot: waveLevel => {
    const roll = Math.random();
    let rarity: LootRarity;

    if (roll < RARITY_DROP_RATES[LootRarity.EPIC]) {
      rarity = LootRarity.EPIC;
    } else if (roll < RARITY_DROP_RATES[LootRarity.EPIC] + RARITY_DROP_RATES[LootRarity.RARE]) {
      rarity = LootRarity.RARE;
    } else {
      rarity = LootRarity.COMMON;
    }

    const types = [LootType.WEAPON, LootType.ARMOR, LootType.ACCESSORY, LootType.CONSUMABLE];
    const type = types[Math.floor(Math.random() * types.length)];

    const prefixes = LOOT_ITEM_PREFIXES[type];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const modifierCount = rarity === LootRarity.EPIC ? 3 : rarity === LootRarity.RARE ? 2 : 1;
    const availableModifiers = Object.values(LootModifier).filter(
      m => m !== LootModifier.DAMAGE_BOOST
    );
    const modifiers: LootModifierData[] = [];

    for (let i = 0; i < modifierCount; i++) {
      const modType = availableModifiers[Math.floor(Math.random() * availableModifiers.length)];
      const baseValue = rarity === LootRarity.EPIC ? 15 : rarity === LootRarity.RARE ? 10 : 5;
      const variance = Math.floor(Math.random() * baseValue);
      const value = baseValue + variance + waveLevel;

      modifiers.push({
        type: modType,
        value,
        name: LOOT_MODIFIER_DATA[modType].name,
        description: LOOT_MODIFIER_DATA[modType].description.replace('X', String(value)),
      });
    }

    const typeNames: Record<LootType, string> = {
      [LootType.WEAPON]: 'Blade',
      [LootType.ARMOR]: 'Guard',
      [LootType.ACCESSORY]: 'Charm',
      [LootType.CONSUMABLE]: 'Tonic',
    };

    const icons: Record<LootType, string> = {
      [LootType.WEAPON]: '⚔️',
      [LootType.ARMOR]: '🛡️',
      [LootType.ACCESSORY]: '💍',
      [LootType.CONSUMABLE]: '🧪',
    };

    const baseSellValue = rarity === LootRarity.EPIC ? 100 : rarity === LootRarity.RARE ? 50 : 20;
    const sellValue = baseSellValue + waveLevel * 10;

    return {
      id: `loot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${prefix} ${typeNames[type]}`,
      type,
      rarity,
      level: waveLevel,
      modifiers,
      sellValue,
      icon: icons[type],
    };
  },

  reset: () =>
    set({
      connected: false,
      playerId: null,
      playerLevel: 1,
      players: new Map(),
      zones: [],
      pois: [],
      nearbyPOI: null,
      currentMission: null,
      notification: null,
      currency: { gold: 100, essence: 10 },
      upgrades: {
        trap_damage: 0,
        trap_cooldown: 0,
        ability_power: 0,
        ability_cooldown: 0,
      },
      showUpgradeShop: false,
      inventory: [],
      showInventory: false,
      missionResults: null,
    }),
}));
