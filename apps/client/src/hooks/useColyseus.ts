import { useEffect, useRef, useCallback } from 'react';
import { Client, Room } from 'colyseus.js';
import { HubState, HubPlayer, Zone, POI, MoveResult, PlayerClass } from '@game/shared';
import { useGameStore } from '../store/gameStore';
import { GameRenderer } from '../game/GameRenderer';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567';
const MOVE_SPEED = 8;
const PLAYER_RADIUS = 12;
const MAP_SIZE = 50 * 32;

export function useColyseus() {
  const { 
    setConnected, setPlayerId, setPlayerLevel, setPlayers, 
    setZones, setPOIs, setNotification, setCurrentMission, reset 
  } = useGameStore();

  const connect = useCallback(async (name: string, level: number = 1, playerClass: PlayerClass = PlayerClass.ELEMENTALIST) => {
    try {
      const client = new Client(SERVER_URL);
      const room = await client.joinOrCreate<HubState>('hub', { name, level, class: playerClass });

      const id = room.sessionId;
      setPlayerId(id);
      setPlayerLevel(level);
      setConnected(true);

      room.onStateChange((state: HubState) => {
        const playersMap = new Map<string, HubPlayer>();
        Object.entries(state.players).forEach(([key, value]) => {
          playersMap.set(key, value as HubPlayer);
        });
        setPlayers(playersMap);

        if (state.zones) {
          setZones(state.zones as Zone[]);
        }
        if (state.pois) {
          setPOIs(state.pois as POI[]);
        }
      });

      room.onMessage('move:result', (result: MoveResult) => {
        if (!result.success && result.reason) {
          setNotification({ message: result.reason, type: 'error' });
          setTimeout(() => setNotification(null), 3000);
        }
      });

      room.onMessage('zone:check', (data: { zone: Zone; canEnter: boolean }) => {
        if (!data.canEnter) {
          setNotification({ 
            message: `Requires level ${data.zone.minLevel} to enter ${data.zone.name}`, 
            type: 'error' 
          });
          setTimeout(() => setNotification(null), 3000);
        }
      });

      room.onMessage('poi:interaction', (data: { success: boolean; reason?: string; poi?: POI; event?: { type: string; poi: POI } }) => {
        if (data.success && data.event) {
          setNotification({ 
            message: `⚔️ Entering ${data.event.poi.name}...`, 
            type: 'info' 
          });
          setCurrentMission(data.event.poi);
        } else if (data.reason) {
          setNotification({ message: data.reason, type: 'error' });
          setTimeout(() => setNotification(null), 3000);
        }
      });

      room.onLeave((code: number) => {
        console.log(`Disconnected (code: ${code})`);
        setConnected(false);
        setPlayerId(null);
        setCurrentMission(null);
        reset();
      });

      return room;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }, [setConnected, setPlayerId, setPlayerLevel, setPlayers, setZones, setPOIs, setNotification, setCurrentMission, reset]);

  return { connect };
}

export function useKeyboardMovement(
  roomRef: React.MutableRefObject<Room<HubState> | null>,
  playerId: string | null,
  players: Map<string, HubPlayer>,
  pois: POI[],
  playerLevel: number
) {
  const { updatePlayerPosition, setNearbyPOI, setNotification } = useGameStore();

  const getNearbyPOI = (x: number, y: number): POI | null => {
    for (const poi of pois) {
      const dx = x - poi.position.x;
      const dy = y - poi.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= poi.radius) {
        return poi;
      }
    }
    return null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!roomRef.current || !playerId) return;

      const player = players.get(playerId);
      if (!player) return;

      if (e.key === 'e' || e.key === 'E') {
        const nearby = getNearbyPOI(player.position.x, player.position.y);
        if (nearby) {
          if (playerLevel < nearby.minLevel) {
            setNotification({ 
              message: `Requires level ${nearby.minLevel} to enter ${nearby.name}`, 
              type: 'error' 
            });
            setTimeout(() => setNotification(null), 3000);
          } else {
            roomRef.current.send('interact:poi');
          }
        }
        return;
      }

      let { x, y } = player.position;
      let moved = false;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          y = Math.max(PLAYER_RADIUS, y - MOVE_SPEED);
          moved = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          y = Math.min(MAP_SIZE - PLAYER_RADIUS, y + MOVE_SPEED);
          moved = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          x = Math.max(PLAYER_RADIUS, x - MOVE_SPEED);
          moved = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          x = Math.min(MAP_SIZE - PLAYER_RADIUS, x + MOVE_SPEED);
          moved = true;
          break;
        default:
          return;
      }

      e.preventDefault();
      if (moved) {
        updatePlayerPosition(playerId, x, y);
        roomRef.current.send('move', { x, y });
        
        const nearby = getNearbyPOI(x, y);
        setNearbyPOI(nearby);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerId, players, roomRef, updatePlayerPosition, pois, playerLevel, setNearbyPOI, setNotification]);
}

export function useGameRenderer(
  containerRef: React.RefObject<HTMLDivElement>,
  players: Map<string, HubPlayer>,
  playerId: string | null,
  zones: Zone[],
  pois: POI[],
  playerLevel: number
) {
  const rendererRef = useRef<GameRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new GameRenderer();
    renderer.init(containerRef.current);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [containerRef]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPlayerLevel(playerLevel);
      rendererRef.current.updateZones(zones);
    }
  }, [zones, playerLevel]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updatePOIs(pois);
    }
  }, [pois]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updatePlayers(players, playerId);
    }
  }, [players, playerId]);

  return rendererRef;
}
