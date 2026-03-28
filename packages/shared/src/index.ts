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

export enum TrapTier {
  T1 = 't1',
  T2 = 't2',
  T3 = 't3',
}

export interface TrapTierStats {
  tier: TrapTier;
  name: string;
  damageMultiplier: number;
  cooldownReduction: number;
  upgradeCost: { gold: number; essence: number };
}

export const TRAP_TIER_DATA: Record<TrapTier, TrapTierStats> = {
  [TrapTier.T1]: {
    tier: TrapTier.T1,
    name: 'T1',
    damageMultiplier: 1.0,
    cooldownReduction: 0,
    upgradeCost: { gold: 75, essence: 15 },
  },
  [TrapTier.T2]: {
    tier: TrapTier.T2,
    name: 'T2',
    damageMultiplier: 1.5,
    cooldownReduction: 500,
    upgradeCost: { gold: 150, essence: 30 },
  },
  [TrapTier.T3]: {
    tier: TrapTier.T3,
    name: 'T3',
    damageMultiplier: 2.25,
    cooldownReduction: 1000,
    upgradeCost: { gold: 300, essence: 60 },
  },
};

export const TRAP_TIER_COLORS: Record<TrapTier, string> = {
  [TrapTier.T1]: '#9d9d9d',
  [TrapTier.T2]: '#1eff00',
  [TrapTier.T3]: '#a335ee',
};

export interface Trap {
  id: string;
  type: TrapType;
  tier: TrapTier;
  damage: number;
  cooldown: number;
  position: { x: number; z: number };
  ownerId: string;
  lastTriggered: number;
  isActive: boolean;
  upgradeLevel: number;
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

export interface PlayerCurrency {
  gold: number;
  essence: number;
}

export enum UpgradeType {
  TRAP_DAMAGE = 'trap_damage',
  TRAP_COOLDOWN = 'trap_cooldown',
  ABILITY_POWER = 'ability_power',
  ABILITY_COOLDOWN = 'ability_cooldown',
}

export interface Upgrade {
  id: UpgradeType;
  name: string;
  description: string;
  maxLevel: number;
  costGold: number[];
  costEssence: number[];
  effectPerLevel: number[];
}

export const UPGRADES: Record<UpgradeType, Upgrade> = {
  [UpgradeType.TRAP_DAMAGE]: {
    id: UpgradeType.TRAP_DAMAGE,
    name: 'Trap Damage',
    description: 'Increase trap damage',
    maxLevel: 10,
    costGold: [50, 100, 200, 350, 500, 700, 1000, 1500, 2000, 3000],
    costEssence: [10, 20, 35, 50, 75, 100, 150, 200, 300, 500],
    effectPerLevel: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60],
  },
  [UpgradeType.TRAP_COOLDOWN]: {
    id: UpgradeType.TRAP_COOLDOWN,
    name: 'Trap Speed',
    description: 'Reduce trap cooldown',
    maxLevel: 5,
    costGold: [100, 250, 500, 1000, 2000],
    costEssence: [25, 50, 100, 200, 400],
    effectPerLevel: [500, 750, 1000, 1250, 1500],
  },
  [UpgradeType.ABILITY_POWER]: {
    id: UpgradeType.ABILITY_POWER,
    name: 'Ability Power',
    description: 'Increase ability damage',
    maxLevel: 10,
    costGold: [75, 150, 300, 500, 750, 1000, 1500, 2000, 3000, 5000],
    costEssence: [15, 30, 50, 75, 100, 150, 200, 300, 500, 750],
    effectPerLevel: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75],
  },
  [UpgradeType.ABILITY_COOLDOWN]: {
    id: UpgradeType.ABILITY_COOLDOWN,
    name: 'Ability Haste',
    description: 'Reduce ability cooldowns',
    maxLevel: 5,
    costGold: [150, 350, 750, 1500, 3000],
    costEssence: [30, 75, 150, 300, 600],
    effectPerLevel: [200, 400, 600, 800, 1000],
  },
};

export enum LootRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
}

export enum LootType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
}

export enum LootModifier {
  DAMAGE_BOOST = 'damage_boost',
  COOLDOWN_REDUCTION = 'cooldown_reduction',
  TRAP_EFFICIENCY = 'trap_efficiency',
  GOLD_FIND = 'gold_find',
  ESSENCE_FIND = 'essence_find',
  CRITICAL_HIT = 'critical_hit',
}

export interface LootModifierData {
  type: LootModifier;
  value: number;
  name: string;
  description: string;
}

export interface LootItem {
  id: string;
  name: string;
  type: LootType;
  rarity: LootRarity;
  level: number;
  modifiers: LootModifierData[];
  sellValue: number;
  icon: string;
}

export const LOOT_MODIFIER_DATA: Record<LootModifier, { name: string; description: string }> = {
  [LootModifier.DAMAGE_BOOST]: {
    name: 'Damage Boost',
    description: '+X% ability damage',
  },
  [LootModifier.COOLDOWN_REDUCTION]: {
    name: 'Cooldown Reduction',
    description: '-X% ability cooldowns',
  },
  [LootModifier.TRAP_EFFICIENCY]: {
    name: 'Trap Efficiency',
    description: '+X% trap damage',
  },
  [LootModifier.GOLD_FIND]: {
    name: 'Gold Find',
    description: '+X% gold from kills',
  },
  [LootModifier.ESSENCE_FIND]: {
    name: 'Essence Find',
    description: '+X% essence from kills',
  },
  [LootModifier.CRITICAL_HIT]: {
    name: 'Critical Hit',
    description: '+X% critical hit chance',
  },
};

export const LOOT_TYPE_NAMES: Record<LootType, string> = {
  [LootType.WEAPON]: 'Weapon',
  [LootType.ARMOR]: 'Armor',
  [LootType.ACCESSORY]: 'Accessory',
  [LootType.CONSUMABLE]: 'Consumable',
};

export const RARITY_COLORS: Record<LootRarity, string> = {
  [LootRarity.COMMON]: '#9d9d9d',
  [LootRarity.RARE]: '#1eff00',
  [LootRarity.EPIC]: '#a335ee',
};

export const RARITY_NAMES: Record<LootRarity, string> = {
  [LootRarity.COMMON]: 'Common',
  [LootRarity.RARE]: 'Rare',
  [LootRarity.EPIC]: 'Epic',
};

export const RARITY_DROP_RATES: Record<LootRarity, number> = {
  [LootRarity.COMMON]: 0.6,
  [LootRarity.RARE]: 0.3,
  [LootRarity.EPIC]: 0.1,
};

export const LOOT_ITEM_PREFIXES: Record<LootType, string[]> = {
  [LootType.WEAPON]: ['Ancient', 'Cursed', 'Enchanted', 'Blessed', 'Shadow'],
  [LootType.ARMOR]: ['Sturdy', 'Runed', 'Guardian', 'Spirit', 'Dragon'],
  [LootType.ACCESSORY]: ['Mystic', 'Arcane', 'Ethereal', 'Celestial', 'Void'],
  [LootType.CONSUMABLE]: ['Elixir', 'Potion', 'Rune', 'Scroll', 'Crystal'],
};
