import { create } from 'zustand';
import { HubPlayer, Zone, POI } from '@game/shared';

interface GameStore {
  connected: boolean;
  playerId: string | null;
  playerLevel: number;
  players: Map<string, HubPlayer>;
  zones: Zone[];
  pois: POI[];
  nearbyPOI: POI | null;
  currentMission: POI | null;
  notification: { message: string; type: 'info' | 'error' } | null;
  
  setConnected: (connected: boolean) => void;
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
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  playerId: null,
  playerLevel: 1,
  players: new Map(),
  zones: [],
  pois: [],
  nearbyPOI: null,
  currentMission: null,
  notification: null,

  setConnected: (connected) => set({ connected }),
  setPlayerId: (playerId) => set({ playerId }),
  setPlayerLevel: (playerLevel) => set({ playerLevel }),
  
  setPlayers: (players) => set({ players }),
  setZones: (zones) => set({ zones }),
  setPOIs: (pois) => set({ pois }),
  setNearbyPOI: (nearbyPOI) => set({ nearbyPOI }),
  setCurrentMission: (currentMission) => set({ currentMission }),
  
  addPlayer: (player) =>
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.set(player.id, player);
      return { players: newPlayers };
    }),

  removePlayer: (id) =>
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.delete(id);
      return { players: newPlayers };
    }),

  updatePlayerPosition: (id, x, y) =>
    set((state) => {
      const newPlayers = new Map(state.players);
      const player = newPlayers.get(id);
      if (player) {
        newPlayers.set(id, { ...player, position: { x, y } });
      }
      return { players: newPlayers };
    }),

  setNotification: (notification) => set({ notification }),

  reset: () => set({ 
    connected: false, 
    playerId: null, 
    playerLevel: 1,
    players: new Map(),
    zones: [],
    pois: [],
    nearbyPOI: null,
    currentMission: null,
    notification: null
  }),
}));
