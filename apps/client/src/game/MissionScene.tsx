import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { 
  TrapType, 
  AbilityType, 
  StatusEffectType,
  ABILITIES,
  PlayerClass,
  CLASS_ABILITIES,
  ElementType 
} from '@game/shared';

interface Trap {
  id: string;
  type: TrapType;
  damage: number;
  position: { x: number; z: number };
  cooldown: number;
  lastTriggered: number;
  isActive: boolean;
  isTriggered: boolean;
}

interface StatusEffect {
  type: StatusEffectType;
  damage: number;
  duration: number;
  startTime: number;
  isActive: boolean;
}

interface Enemy {
  id: string;
  health: number;
  maxHealth: number;
  pathIndex: number;
  pathProgress: number;
  isDead: boolean;
  statusEffects: StatusEffect[];
  isSlowed: boolean;
  isFrozen: boolean;
  isStunned: boolean;
}

interface AbilityProjectile {
  id: string;
  type: AbilityType;
  position: { x: number; y: number; z: number };
  target: { x: number; z: number };
  speed: number;
  damage: number;
  effect?: StatusEffectType;
  effectDuration?: number;
  effectDamage?: number;
  radius?: number;
}

interface PathPoint {
  x: number;
  z: number;
}

const PATH: PathPoint[] = [
  { x: 0, z: -8 },
  { x: 0, z: -4 },
  { x: -4, z: -4 },
  { x: -4, z: 0 },
  { x: 4, z: 0 },
  { x: 4, z: 4 },
  { x: 0, z: 4 },
  { x: 0, z: 8 },
];

const ELEMENT_COLORS: Record<ElementType, string> = {
  [ElementType.FIRE]: '#ff4400',
  [ElementType.WATER]: '#00ccff',
  [ElementType.EARTH]: '#8b4513',
  [ElementType.AIR]: '#9932cc',
};

function TrapMesh({ trap, onRemove }: { trap: Trap; onRemove: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (trap.isTriggered) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 15) * 0.3);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getColors = () => {
    if (trap.isTriggered) return { base: '#ff0000', emissive: '#ff0000', intensity: 2 };
    switch (trap.type) {
      case TrapType.SPIKE: return { base: '#888888', emissive: '#444444', intensity: 0.3 };
      case TrapType.FIRE: return { base: '#ff4400', emissive: '#ff2200', intensity: 0.8 };
      case TrapType.BOULDER: return { base: '#665544', emissive: '#332211', intensity: 0.3 };
      default: return { base: '#666666', emissive: '#000000', intensity: 0 };
    }
  };

  const colors = getColors();

  return (
    <mesh
      ref={meshRef}
      position={[trap.position.x, 0.2, trap.position.z]}
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
    >
      <cylinderGeometry args={[0.6, 0.8, 0.4, 8]} />
      <meshStandardMaterial
        color={colors.base}
        emissive={colors.emissive}
        emissiveIntensity={colors.intensity}
        roughness={0.5}
      />
    </mesh>
  );
}

function AbilityEffect({ 
  position, 
  element,
  onComplete 
}: { 
  position: { x: number; z: number };
  element: ElementType;
  onComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);

  useFrame(() => {
    if (meshRef.current) {
      setScale(prev => Math.min(prev + 0.15, 3));
      meshRef.current.scale.setScalar(scale);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(onComplete, 500);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <mesh ref={meshRef} position={[position.x, 0.5, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 1, 16]} />
      <meshBasicMaterial 
        color={ELEMENT_COLORS[element]} 
        transparent 
        opacity={Math.max(0, 1 - scale / 3)} 
      />
    </mesh>
  );
}

function EnemyMesh({ 
  enemy, 
  traps, 
  onTriggerTrap, 
  onStatusEffect,
}: { 
  enemy: Enemy; 
  traps: Trap[];
  onTriggerTrap: (trap: Trap) => void;
  onStatusEffect: (enemyId: string, effect: StatusEffect) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({ x: 0, z: 0 });
  const currentPosRef = useRef({ x: PATH[0].x, z: PATH[0].z });
  const lastEffectTickRef = useRef(0);

  useFrame((state, delta) => {
    if (enemy.isDead || !groupRef.current) return;

    if (enemy.isStunned) return;

    const speedMultiplier = enemy.isSlowed ? 0.4 : enemy.isFrozen ? 0 : 1;

    const currentTarget = PATH[enemy.pathIndex];
    const dx = currentTarget.x - currentPosRef.current.x;
    const dz = currentTarget.z - currentPosRef.current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const baseSpeed = 2;
    if (dist > 0.1 && speedMultiplier > 0) {
      velocityRef.current.x = (dx / dist) * baseSpeed * speedMultiplier;
      velocityRef.current.z = (dz / dist) * baseSpeed * speedMultiplier;
    } else {
      if (enemy.pathIndex < PATH.length - 1) {
        currentPosRef.current = { ...currentTarget };
      }
      velocityRef.current.x *= 0.9;
      velocityRef.current.z *= 0.9;
    }

    currentPosRef.current.x += velocityRef.current.x * delta;
    currentPosRef.current.z += velocityRef.current.z * delta;

    groupRef.current.position.x = currentPosRef.current.x;
    groupRef.current.position.z = currentPosRef.current.z;
    
    const bobSpeed = enemy.isSlowed ? 1.5 : enemy.isFrozen ? 0 : 3;
    groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * bobSpeed) * 0.1;
    
    if (!enemy.isFrozen && !enemy.isSlowed) {
      groupRef.current.rotation.y += 0.02;
    }

    const now = Date.now();
    if (now - lastEffectTickRef.current > 500) {
      for (const effect of enemy.statusEffects) {
        if (effect.isActive && effect.type === StatusEffectType.BURN) {
          onStatusEffect(enemy.id, { ...effect, damage: effect.damage / 6 });
        }
      }
      lastEffectTickRef.current = now;
    }

    for (const trap of traps) {
      if (trap.isActive && !trap.isTriggered) {
        const trapDx = currentPosRef.current.x - trap.position.x;
        const trapDz = currentPosRef.current.z - trap.position.z;
        const trapDist = Math.sqrt(trapDx * trapDx + trapDz * trapDz);
        if (trapDist < 1.2) {
          onTriggerTrap(trap);
        }
      }
    }
  });

  if (enemy.isDead) return null;

  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  const hasBurn = enemy.statusEffects.some(e => e.type === StatusEffectType.BURN && e.isActive);
  const hasSlow = enemy.statusEffects.some(e => e.type === StatusEffectType.SLOW && e.isActive);
  const hasFreeze = enemy.statusEffects.some(e => e.type === StatusEffectType.FREEZE && e.isActive);
  const hasStun = enemy.statusEffects.some(e => e.type === StatusEffectType.STUN && e.isActive);

  let bodyColor = '#8b0000';
  if (hasBurn) bodyColor = '#ff2200';
  else if (hasFreeze) bodyColor = '#00ccff';
  else if (healthPercent < 50) bodyColor = '#aa2222';

  return (
    <group ref={groupRef} position={[PATH[0].x, 0.5, PATH[0].z]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 1, 4, 8]} />
        <meshStandardMaterial 
          color={bodyColor} 
          roughness={0.7}
          emissive={hasBurn ? '#ff0000' : hasFreeze ? '#0066ff' : '#000000'}
          emissiveIntensity={hasBurn || hasFreeze ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={bodyColor} 
          roughness={0.7}
          emissive={hasBurn ? '#ff0000' : hasFreeze ? '#0066ff' : '#000000'}
          emissiveIntensity={hasBurn || hasFreeze ? 0.5 : 0}
        />
      </mesh>
      
      <mesh position={[-0.12, 1.3, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color={hasStun ? '#ffff00' : hasFreeze ? '#00ffff' : '#ff0000'} 
          emissive={hasStun ? '#ffff00' : hasFreeze ? '#00ffff' : '#ff0000'} 
          emissiveIntensity={0.8} 
        />
      </mesh>
      <mesh position={[0.12, 1.3, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color={hasStun ? '#ffff00' : hasFreeze ? '#00ffff' : '#ff0000'} 
          emissive={hasStun ? '#ffff00' : hasFreeze ? '#00ffff' : '#ff0000'} 
          emissiveIntensity={0.8} 
        />
      </mesh>
      
      {hasBurn && (
        <pointLight position={[0, 1, 0]} color="#ff4400" intensity={2} distance={3} />
      )}
      {hasFreeze && (
        <pointLight position={[0, 1, 0]} color="#00ccff" intensity={2} distance={3} />
      )}
      {hasSlow && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial color="#9933ff" transparent opacity={0.5} />
        </mesh>
      )}
      
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[1.2, 0.12]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      <mesh position={[0, 2, 0.01]}>
        <planeGeometry args={[healthPercent / 100 * 1.1, 0.08]} />
        <meshBasicMaterial 
          color={healthPercent < 30 ? '#ff0000' : healthPercent < 60 ? '#ffaa00' : '#00ff00'} 
        />
      </mesh>
    </group>
  );
}

function AbilityProjectileMesh({ 
  projectile,
  onHit,
}: { 
  projectile: AbilityProjectile;
  onHit: (id: string, hit: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ability = ABILITIES[projectile.type];

  useFrame((_, delta) => {
    if (meshRef.current) {
      const dx = projectile.target.x - projectile.position.x;
      const dz = projectile.target.z - projectile.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.5) {
        onHit(projectile.id, true);
        return;
      }

      const speed = projectile.speed * delta;
      projectile.position.x += (dx / dist) * speed;
      projectile.position.z += (dz / dist) * speed;

      meshRef.current.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
    }
  });

  return (
    <mesh ref={meshRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial 
        color={ELEMENT_COLORS[ability.element]} 
      />
    </mesh>
  );
}

function PathVisualization() {
  return (
    <>
      {PATH.map((point, i) => (
        <mesh key={i} position={[point.x, 0.02, point.z]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
          <meshStandardMaterial 
            color={i === 0 ? '#00ff00' : i === PATH.length - 1 ? '#ff0000' : '#4444ff'} 
            emissive={i === 0 ? '#00ff00' : i === PATH.length - 1 ? '#ff0000' : '#4444ff'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

function Room() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 5, -10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5, 10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} />
      </mesh>
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} />
      </mesh>
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} />
      </mesh>
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[20, 0.5, 20]} />
        <meshStandardMaterial color="#050510" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 8, 0]} intensity={60} castShadow />
      <pointLight position={[-6, 5, -6]} intensity={20} color="#ff4444" />
      <pointLight position={[6, 5, 6]} intensity={20} color="#4444ff" />
      <spotLight position={[0, 9, 0]} angle={0.6} penumbra={0.5} intensity={40} castShadow />
    </>
  );
}

function TrapSelector({ 
  selectedTrap, 
  onSelect,
}: { 
  selectedTrap: TrapType | null; 
  onSelect: (type: TrapType | null) => void;
}) {
  const traps = [
    { type: TrapType.SPIKE, name: 'Spike', damage: 30, icon: '⬆️' },
    { type: TrapType.FIRE, name: 'Fire', damage: 50, icon: '🔥' },
    { type: TrapType.BOULDER, name: 'Boulder', damage: 80, icon: '🪨' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: 20,
      display: 'flex',
      gap: '0.5rem',
      zIndex: 10,
    }}>
      {traps.map((trap) => (
        <button
          key={trap.type}
          onClick={() => onSelect(selectedTrap === trap.type ? null : trap.type)}
          style={{
            padding: '0.5rem 0.75rem',
            background: selectedTrap === trap.type ? trap.type === TrapType.FIRE ? '#ff4400' : '#666' : '#222',
            border: selectedTrap === trap.type ? '2px solid #fff' : '2px solid #444',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span>{trap.icon}</span>
          <span>{trap.name}</span>
        </button>
      ))}
    </div>
  );
}

function AbilityBar({ 
  abilities,
  cooldowns,
  onUseAbility,
  selectedAbility,
  onSelectAbility,
}: { 
  abilities: AbilityType[];
  cooldowns: Record<AbilityType, number>;
  onUseAbility: (type: AbilityType) => void;
  selectedAbility: AbilityType | null;
  onSelectAbility: (type: AbilityType | null) => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 10,
    }}>
      {abilities.map((type, index) => {
        const ability = ABILITIES[type];
        const cooldownRemaining = Math.max(0, cooldowns[type] - Date.now());
        const onCooldown = cooldownRemaining > 0;
        const isSelected = selectedAbility === type;

        return (
          <button
            key={type}
            onClick={() => onSelectAbility(isSelected ? null : type)}
            onDoubleClick={() => !onCooldown && onUseAbility(type)}
            disabled={onCooldown}
            style={{
              padding: '0.6rem 1rem',
              background: isSelected ? ELEMENT_COLORS[ability.element] : '#222',
              border: isSelected ? '2px solid #fff' : '2px solid #444',
              borderRadius: 8,
              color: '#fff',
              cursor: onCooldown ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.15rem',
              minWidth: '80px',
              opacity: onCooldown ? 0.6 : 1,
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{ability.icon}</span>
            <span style={{ fontSize: '0.65rem' }}>{ability.name}</span>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
              {index + 1}
            </span>
            {onCooldown && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}>
                {(cooldownRemaining / 1000).toFixed(1)}s
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface MissionSceneProps {
  poiName: string;
  playerClass: PlayerClass;
  onExit: () => void;
}

export function MissionScene({ poiName, playerClass, onExit }: MissionSceneProps) {
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [traps, setTraps] = useState<Trap[]>([]);
  const [selectedTrap, setSelectedTrap] = useState<TrapType | null>(null);
  const [abilities, setAbilities] = useState<AbilityProjectile[]>([]);
  const [abilityEffects, setAbilityEffects] = useState<{ id: string; position: { x: number; z: number }; element: ElementType }[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<AbilityType, number>>({} as Record<AbilityType, number>);
  const [selectedAbility, setSelectedAbility] = useState<AbilityType | null>(null);
  const [phase, setPhase] = useState<'playing' | 'spawning'>('spawning');
  const [log, setLog] = useState<string[]>([]);
  const spawnTimerRef = useRef(0);
  const enemiesToSpawnRef = useRef(0);

  const classAbilities = CLASS_ABILITIES[playerClass];

  const addLog = useCallback((message: string) => {
    setLog(prev => [...prev.slice(-12), `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const spawnEnemy = useCallback(() => {
    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      health: 100 + wave * 25,
      maxHealth: 100 + wave * 25,
      pathIndex: 0,
      pathProgress: 0,
      isDead: false,
      statusEffects: [],
      isSlowed: false,
      isFrozen: false,
      isStunned: false,
    };
    setEnemies(prev => [...prev, enemy]);
    addLog(`Enemy spawned! (HP: ${enemy.health})`);
  }, [wave, addLog]);

  useEffect(() => {
    if (phase === 'spawning') {
      enemiesToSpawnRef.current = 2 + wave;
      spawnTimerRef.current = 0;
      setPhase('playing');
      addLog(`Wave ${wave} - ${enemiesToSpawnRef.current} enemies incoming!`);
    }
  }, [wave, phase, addLog]);

  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      if (enemiesToSpawnRef.current > 0) {
        spawnTimerRef.current += 100;
        if (spawnTimerRef.current >= 1500) {
          spawnEnemy();
          enemiesToSpawnRef.current--;
          spawnTimerRef.current = 0;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase, spawnEnemy]);

  const handleTriggerTrap = useCallback((trap: Trap) => {
    const now = Date.now();
    if (now - trap.lastTriggered < trap.cooldown) return;

    setTraps(prev => prev.map(t => 
      t.id === trap.id ? { ...t, lastTriggered: now, isTriggered: true } : t
    ));

    setEnemies(prev => {
      let totalDamage = 0;
      const updated = prev.map(enemy => {
        if (!enemy.isDead) {
          totalDamage += trap.damage;
          return { ...enemy, health: enemy.health - trap.damage };
        }
        return enemy;
      });

      if (totalDamage > 0) {
        addLog(`💥 Trap dealt ${totalDamage} total damage!`);
      }

      return updated;
    });

    setTimeout(() => {
      setTraps(prev => prev.map(t => 
        t.id === trap.id ? { ...t, isTriggered: false } : t
      ));
    }, 300);
  }, [addLog]);

  const applyAbilityEffect = useCallback((enemyId: string, effect: StatusEffect) => {
    setEnemies(prev => {
      return prev.map(enemy => {
        if (enemy.id !== enemyId || enemy.isDead) return enemy;

        const now = Date.now();
        const existingEffect = enemy.statusEffects.find(e => e.type === effect.type);

        if (existingEffect) {
          return enemy;
        }

        const newEffect: StatusEffect = {
          ...effect,
          startTime: now,
          isActive: true,
        };

        let isSlowed = enemy.isSlowed;
        let isFrozen = enemy.isFrozen;
        let isStunned = enemy.isStunned;

        if (effect.type === StatusEffectType.SLOW) isSlowed = true;
        if (effect.type === StatusEffectType.FREEZE) isFrozen = true;
        if (effect.type === StatusEffectType.STUN) isStunned = true;

        addLog(`✨ Applied ${effect.type} to enemy!`);

        return {
          ...enemy,
          statusEffects: [...enemy.statusEffects, newEffect],
          isSlowed,
          isFrozen,
          isStunned,
        };
      });
    });
  }, [addLog]);

  const handleAbilityHit = useCallback((projectileId: string, hit: boolean) => {
    const projectile = abilities.find(a => a.id === projectileId);
    if (!projectile || !hit) {
      setAbilities(prev => prev.filter(a => a.id !== projectileId));
      return;
    }

    const ability = ABILITIES[projectile.type];

    setAbilityEffects(prev => [...prev, {
      id: `effect-${Date.now()}`,
      position: { x: projectile.target.x, z: projectile.target.z },
      element: ability.element,
    }]);

    setEnemies(prev => {
      let totalDamage = 0;
      const updated = prev.map(enemy => {
        if (!enemy.isDead) {
          const dx = enemy.id === projectile.id ? 0 : Math.random() * 2 - 1;
          const dz = Math.random() * 2 - 1;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist < (projectile.radius || 1)) {
            totalDamage += projectile.damage;
            
            if (projectile.effect) {
              const effect: StatusEffect = {
                type: projectile.effect,
                damage: projectile.effectDamage || 0,
                duration: projectile.effectDuration || 0,
                startTime: Date.now(),
                isActive: true,
              };
              applyAbilityEffect(enemy.id, effect);
            }

            return { ...enemy, health: enemy.health - projectile.damage };
          }
        }
        return enemy;
      });

      if (totalDamage > 0) {
        addLog(`⚡ ${ability.name} dealt ${totalDamage} damage!`);
      }

      return updated;
    });

    setAbilities(prev => prev.filter(a => a.id !== projectileId));
  }, [abilities, applyAbilityEffect, addLog]);

  const useAbility = useCallback((type: AbilityType) => {
    const now = Date.now();
    if (cooldowns[type] && now < cooldowns[type]) return;

    const ability = ABILITIES[type];
    const targetX = (Math.random() - 0.5) * 6;
    const targetZ = (Math.random() - 0.5) * 6;

    const projectile: AbilityProjectile = {
      id: `proj-${Date.now()}`,
      type,
      position: { x: 0, y: 1, z: 4 },
      target: { x: targetX, z: targetZ },
      speed: 12,
      damage: ability.damage,
      effect: ability.effect,
      effectDuration: ability.effectDuration,
      effectDamage: ability.effectDamage,
      radius: ability.radius,
    };

    setAbilities(prev => [...prev, projectile]);
    setCooldowns(prev => ({ ...prev, [type]: now + ability.cooldown }));
    setSelectedAbility(null);
    addLog(`Cast ${ability.name}!`);
  }, [cooldowns, addLog]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEnemies(prev => {
        return prev.map(enemy => {
          if (enemy.isDead) return enemy;

          const updatedEffects = enemy.statusEffects.filter(effect => {
            const elapsed = now - effect.startTime;
            return elapsed < effect.duration;
          });

          let isSlowed = updatedEffects.some(e => e.type === StatusEffectType.SLOW);
          let isFrozen = updatedEffects.some(e => e.type === StatusEffectType.FREEZE);
          let isStunned = updatedEffects.some(e => e.type === StatusEffectType.STUN);

          return {
            ...enemy,
            statusEffects: updatedEffects,
            isSlowed,
            isFrozen,
            isStunned,
          };
        });
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setEnemies(prev => {
      const updated = prev.map(enemy => {
        if (!enemy.isDead && enemy.health <= 0) {
          const reward = 25 + wave * 15;
          addLog(`💀 Enemy defeated! +${reward} gold`);
          return { ...enemy, isDead: true };
        }
        return enemy;
      });

      const livingCount = updated.filter(e => !e.isDead).length;
      const totalCount = updated.length;

      if (totalCount > 0 && livingCount === 0 && enemiesToSpawnRef.current === 0) {
        addLog(`🏆 Wave ${wave} complete!`);
        setTimeout(() => {
          setWave(w => w + 1);
          setPhase('spawning');
        }, 2000);
      }

      return updated;
    });
  }, [enemies, wave, addLog]);

  const handleFloorClick = useCallback((e: any) => {
    if (selectedTrap) {
      const point = e.point;
      if (Math.abs(point.x) > 9 || Math.abs(point.z) > 9) return;

      const trapDamage = {
        [TrapType.SPIKE]: 30,
        [TrapType.FIRE]: 50,
        [TrapType.BOULDER]: 80,
      };

      const trap: Trap = {
        id: `trap-${Date.now()}`,
        type: selectedTrap,
        damage: trapDamage[selectedTrap],
        position: { x: point.x, z: point.z },
        cooldown: 3000,
        lastTriggered: 0,
        isActive: true,
        isTriggered: false,
      };

      setTraps(prev => [...prev, trap]);
      addLog(`Trap placed at (${point.x.toFixed(1)}, ${point.z.toFixed(1)})`);
      setSelectedTrap(null);
    }
  }, [selectedTrap, addLog]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.key === '1') useAbility(classAbilities[0]);
      if (e.key === '2') useAbility(classAbilities[1]);
      if (e.key === 'q' || e.key === 'Q') setSelectedTrap(prev => prev === TrapType.SPIKE ? null : TrapType.SPIKE);
      if (e.key === 'w' && !['w', 'W'].includes(e.key)) return;
      if (e.key === 'e' || e.key === 'E') setSelectedTrap(prev => prev === TrapType.FIRE ? null : TrapType.FIRE);
      if (e.key === 'r' || e.key === 'R') setSelectedTrap(prev => prev === TrapType.BOULDER ? null : TrapType.BOULDER);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, useAbility, classAbilities]);

  const livingEnemies = enemies.filter(e => !e.isDead).length;
  const pendingSpawn = enemiesToSpawnRef.current;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'rgba(0,0,0,0.85)',
        padding: '1rem',
        borderRadius: 8,
        color: '#fff',
        minWidth: '160px',
      }}>
        <h2 style={{ margin: 0, marginBottom: '0.5rem', color: '#ff6' }}>⚔️ {poiName}</h2>
        <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
          Wave: <span style={{ color: '#0ff', fontWeight: 'bold' }}>{wave}</span>
        </div>
        <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
          Enemies: <span style={{ color: '#f66', fontWeight: 'bold' }}>{livingEnemies}</span>
          {pendingSpawn > 0 && <span style={{ color: '#888' }}> (+{pendingSpawn})</span>}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
          Double-click ability to cast
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        background: 'rgba(0,0,0,0.85)',
        padding: '0.75rem',
        borderRadius: 8,
        color: '#fff',
        width: '180px',
        maxHeight: '150px',
        overflowY: 'auto',
        fontSize: '0.7rem',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#888' }}>COMBAT LOG</div>
        {log.map((l, i) => (
          <div key={i} style={{ 
            color: l.includes('💀') ? '#0f0' : l.includes('⚡') ? '#ff0' : l.includes('✨') ? '#0ff' : '#aaa',
            marginBottom: '0.1rem' 
          }}>
            {l}
          </div>
        ))}
      </div>

      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          padding: '0.4rem 1rem',
          background: '#444',
          border: 'none',
          borderRadius: 4,
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.8rem',
        }}
      >
        Exit (ESC)
      </button>

      {selectedTrap && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'rgba(0,0,0,0.7)',
          padding: '0.4rem 1rem',
          borderRadius: 4,
          color: '#0f0',
          fontSize: '0.8rem',
        }}>
          Click floor to place {selectedTrap} trap
        </div>
      )}

      <TrapSelector selectedTrap={selectedTrap} onSelect={setSelectedTrap} />
      
      <AbilityBar 
        abilities={classAbilities}
        cooldowns={cooldowns}
        onUseAbility={useAbility}
        selectedAbility={selectedAbility}
        onSelectAbility={setSelectedAbility}
      />

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={55} />
        <OrbitControls 
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
        
        <Lighting />
        <Room />
        <PathVisualization />
        
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0.02, 0]}
          onClick={handleFloorClick}
        >
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        {traps.map(trap => (
          <TrapMesh 
            key={trap.id} 
            trap={trap} 
            onRemove={() => setTraps(prev => prev.filter(t => t.id !== trap.id))}
          />
        ))}
        
        {abilityEffects.map(effect => (
          <AbilityEffect
            key={effect.id}
            position={effect.position}
            element={effect.element}
            onComplete={() => setAbilityEffects(prev => prev.filter(e => e.id !== effect.id))}
          />
        ))}
        
        {abilities.map(projectile => (
          <AbilityProjectileMesh
            key={projectile.id}
            projectile={projectile}
            onHit={handleAbilityHit}
          />
        ))}
        
        {enemies.map(enemy => (
          <EnemyMesh
            key={enemy.id}
            enemy={enemy}
            traps={traps}
            onTriggerTrap={handleTriggerTrap}
            onStatusEffect={applyAbilityEffect}
          />
        ))}
        
        <fog attach="fog" args={['#050510', 20, 50]} />
      </Canvas>
    </div>
  );
}
