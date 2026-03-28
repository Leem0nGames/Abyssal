export enum PlayerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum ElementType {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
}

export enum SubElementType {
  LAVA = 'lava',
  ICE = 'ice',
  STORM = 'storm',
  STONE = 'stone',
  STEAM = 'steam',
  LIGHTNING = 'lightning',
  MAGMA = 'magma',
  FROST = 'frost',
}

export enum PlayerClass {
  ELEMENTALIST = 'elementalist',
  WITCH = 'witch',
  SUMMONER = 'summoner',
  ARCANIST = 'arcanist',
}

export enum StatusEffectType {
  BURN = 'burn',
  SLOW = 'slow',
  FREEZE = 'freeze',
  STUN = 'stun',
  POISON = 'poison',
}

export enum AbilityType {
  FIREBALL = 'fireball',
  ICEBOLT = 'icebolt',
  STONESHARD = 'stoneshard',
  LIGHTNING = 'lightning',
  LAVA_BURST = 'lava_burst',
  FROST_NOVA = 'frost_nova',
  EARTHQUAKE = 'earthquake',
  STORM_CALL = 'storm_call',
}

export interface StatusEffect {
  type: StatusEffectType;
  damage: number;
  duration: number;
  startTime: number;
  source: AbilityType;
}

export interface Ability {
  id: AbilityType;
  name: string;
  element: ElementType;
  damage: number;
  cooldown: number;
  effect?: StatusEffectType;
  effectDuration?: number;
  effectDamage?: number;
  radius?: number;
  description: string;
  icon: string;
}

export const ABILITIES: Record<AbilityType, Ability> = {
  [AbilityType.FIREBALL]: {
    id: AbilityType.FIREBALL,
    name: 'Fireball',
    element: ElementType.FIRE,
    damage: 60,
    cooldown: 3000,
    effect: StatusEffectType.BURN,
    effectDuration: 3000,
    effectDamage: 20,
    description: 'Hurls a blazing fireball. Burns enemies over time.',
    icon: '🔥',
  },
  [AbilityType.ICEBOLT]: {
    id: AbilityType.ICEBOLT,
    name: 'Ice Bolt',
    element: ElementType.WATER,
    damage: 45,
    cooldown: 2500,
    effect: StatusEffectType.SLOW,
    effectDuration: 2000,
    description: 'Launches a piercing shard of ice. Slows enemies.',
    icon: '❄️',
  },
  [AbilityType.STONESHARD]: {
    id: AbilityType.STONESHARD,
    name: 'Stone Shard',
    element: ElementType.EARTH,
    damage: 50,
    cooldown: 2800,
    description: 'Summons a deadly stone spike from the ground.',
    icon: '🪨',
  },
  [AbilityType.LIGHTNING]: {
    id: AbilityType.LIGHTNING,
    name: 'Lightning',
    element: ElementType.AIR,
    damage: 70,
    cooldown: 4000,
    effect: StatusEffectType.STUN,
    effectDuration: 1000,
    description: 'Strikes with devastating lightning. Stuns enemies.',
    icon: '⚡',
  },
  [AbilityType.LAVA_BURST]: {
    id: AbilityType.LAVA_BURST,
    name: 'Lava Burst',
    element: ElementType.FIRE,
    damage: 80,
    cooldown: 5000,
    effect: StatusEffectType.BURN,
    effectDuration: 4000,
    effectDamage: 30,
    radius: 2,
    description: 'Erupts lava in an area. Heavy burn damage.',
    icon: '🌋',
  },
  [AbilityType.FROST_NOVA]: {
    id: AbilityType.FROST_NOVA,
    name: 'Frost Nova',
    element: ElementType.WATER,
    damage: 40,
    cooldown: 6000,
    effect: StatusEffectType.FREEZE,
    effectDuration: 1500,
    description: 'Freezes all nearby enemies in place.',
    icon: '🌀',
  },
  [AbilityType.EARTHQUAKE]: {
    id: AbilityType.EARTHQUAKE,
    name: 'Earthquake',
    element: ElementType.EARTH,
    damage: 90,
    cooldown: 7000,
    radius: 3,
    description: 'Shatters the ground. Massive area damage.',
    icon: '💥',
  },
  [AbilityType.STORM_CALL]: {
    id: AbilityType.STORM_CALL,
    name: 'Storm Call',
    element: ElementType.AIR,
    damage: 55,
    cooldown: 4500,
    effect: StatusEffectType.SLOW,
    effectDuration: 3000,
    description: 'Calls down a storm. Slows and damages.',
    icon: '🌪️',
  },
};

export const CLASS_ABILITIES: Record<PlayerClass, AbilityType[]> = {
  [PlayerClass.ELEMENTALIST]: [AbilityType.FIREBALL, AbilityType.LAVA_BURST],
  [PlayerClass.WITCH]: [AbilityType.ICEBOLT, AbilityType.FROST_NOVA],
  [PlayerClass.SUMMONER]: [AbilityType.STONESHARD, AbilityType.EARTHQUAKE],
  [PlayerClass.ARCANIST]: [AbilityType.LIGHTNING, AbilityType.STORM_CALL],
};

export interface ClassInfo {
  id: PlayerClass;
  name: string;
  element: ElementType;
  subElement: SubElementType;
  description: string;
  color: string;
}

export const CLASS_DATA: Record<PlayerClass, ClassInfo> = {
  [PlayerClass.ELEMENTALIST]: {
    id: PlayerClass.ELEMENTALIST,
    name: 'Elementalist',
    element: ElementType.FIRE,
    subElement: SubElementType.LAVA,
    description: 'Master of primal elements. Summons fire and lava to devastate foes.',
    color: '#ff4400',
  },
  [PlayerClass.WITCH]: {
    id: PlayerClass.WITCH,
    name: 'Witch',
    element: ElementType.WATER,
    subElement: SubElementType.ICE,
    description: 'Ancient practitioner of dark arts. Commands ice and frost magic.',
    color: '#00ccff',
  },
  [PlayerClass.SUMMONER]: {
    id: PlayerClass.SUMMONER,
    name: 'Summoner',
    element: ElementType.EARTH,
    subElement: SubElementType.STONE,
    description: 'Channeler of terrestrial forces. Calls upon stone and storms.',
    color: '#8b4513',
  },
  [PlayerClass.ARCANIST]: {
    id: PlayerClass.ARCANIST,
    name: 'Arcanist',
    element: ElementType.AIR,
    subElement: SubElementType.LIGHTNING,
    description: 'Keeper of arcane secrets. Wields lightning and storm power.',
    color: '#9932cc',
  },
};

export interface HubPlayer {
  id: string;
  name: string;
  level: number;
  class: PlayerClass;
  position: { x: number; y: number };
}

export interface Zone {
  id: string;
  name: string;
  minLevel: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export enum POIType {
  DUNGEON = 'dungeon',
  RUINS = 'ruins',
  FOREST = 'forest',
}

export interface POI {
  id: string;
  name: string;
  type: POIType;
  position: { x: number; y: number };
  radius: number;
  minLevel: number;
}

export enum TrapType {
  SPIKE = 'spike',
  FIRE = 'fire',
  BOULDER = 'boulder',
}

export interface Trap {
  id: string;
  type: TrapType;
  damage: number;
  cooldown: number;
  position: { x: number; z: number };
  ownerId: string;
  lastTriggered: number;
  isActive: boolean;
}

export interface HubState {
  players: Map<string, HubPlayer>;
  zones: Zone[];
  pois: POI[];
  traps: Trap[];
}

export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  position: { x: number; y: number };
  score: number;
  createdAt: number;
}

export interface Session {
  id: string;
  playerId: string;
  connectedAt: number;
  lastActivity: number;
}

export enum GamePhase {
  WAITING = 'waiting',
  PLAYING = 'playing',
  ENDED = 'ended',
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Map<string, Player>;
  maxPlayers: number;
  startedAt: number | null;
  endedAt: number | null;
}

export interface MoveResult {
  success: boolean;
  reason?: string;
  x?: number;
  y?: number;
}

export interface MissionEvent {
  type: 'enter_poi';
  poi: POI;
}

export interface TrapEvent {
  type: 'trap_triggered' | 'trap_placed' | 'enemy_damaged';
  trap?: Trap;
  damage?: number;
  enemyId?: string;
}
