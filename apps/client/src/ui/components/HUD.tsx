import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../stores';
import { ProgressBar, Badge, CurrencyDisplay, Button } from '../components';

interface HUDProps {
  wave?: number;
  enemiesRemaining?: number;
  health?: number;
  maxHealth?: number;
  energy?: number;
  maxEnergy?: number;
}

export function HUD({
  wave = 1,
  enemiesRemaining = 0,
  health = 100,
  maxHealth = 100,
  energy = 50,
  maxEnergy = 100,
}: HUDProps) {
  const { currency, upgrades, inventory } = useGameStore();
  const { togglePanel, openPanel } = useUIStore();

  return (
    <div className="hud">
      <div className="hud__top-left">
        <div className="hud__stats">
          <div className="hud__health">
            <span className="hud__label">❤️ Health</span>
            <ProgressBar value={health} max={maxHealth} variant="danger" size="md" />
          </div>
          <div className="hud__energy">
            <span className="hud__label">⚡ Energy</span>
            <ProgressBar value={energy} max={maxEnergy} variant="warning" size="md" />
          </div>
        </div>
      </div>

      <div className="hud__top-center">
        <div className="hud__wave-info">
          <Badge variant="primary" size="lg">
            Wave {wave}
          </Badge>
          <Badge variant="danger" size="md">
            {enemiesRemaining} Enemies
          </Badge>
        </div>
      </div>

      <div className="hud__top-right">
        <div className="hud__currency">
          <CurrencyDisplay gold={currency.gold} essence={currency.essence} size="md" />
        </div>
        <div className="hud__quick-actions">
          <Button variant="secondary" size="sm" onClick={() => openPanel('inventory')}>
            🎒 {inventory.length}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openPanel('shop')}>
            ⚡
          </Button>
          <Button variant="ghost" size="sm" onClick={() => togglePanel('map')}>
            🗺️
          </Button>
        </div>
      </div>

      <div className="hud__upgrades">
        <div className="hud__upgrade-item">
          <span className="hud__upgrade-icon">🪤</span>
          <span className="hud__upgrade-level">+{upgrades.trap_damage}</span>
        </div>
        <div className="hud__upgrade-item">
          <span className="hud__upgrade-icon">⏱️</span>
          <span className="hud__upgrade-level">-{upgrades.trap_cooldown * 100}ms</span>
        </div>
        <div className="hud__upgrade-item">
          <span className="hud__upgrade-icon">✨</span>
          <span className="hud__upgrade-level">+{upgrades.ability_power}</span>
        </div>
        <div className="hud__upgrade-item">
          <span className="hud__upgrade-icon">🔮</span>
          <span className="hud__upgrade-level">-{upgrades.ability_cooldown * 100}ms</span>
        </div>
      </div>
    </div>
  );
}

export function Minimap() {
  const { players, playerId, zones, pois } = useGameStore();
  const { showMinimap, toggleMinimap } = useUIStore();

  if (!showMinimap) {
    return (
      <button className="minimap__toggle" onClick={toggleMinimap}>
        🗺️
      </button>
    );
  }

  return (
    <div className="minimap">
      <div className="minimap__header">
        <span>Hub Map</span>
        <button onClick={toggleMinimap}>✕</button>
      </div>
      <div className="minimap__content">
        <div className="minimap__zones">
          {zones.map(zone => (
            <div key={zone.id} className="minimap__zone">
              <span className="minimap__zone-icon">🌍</span>
              <span className="minimap__zone-name">{zone.name}</span>
            </div>
          ))}
        </div>
        <div className="minimap__pois">
          {pois.map(poi => (
            <div key={poi.id} className="minimap__poi">
              <span className="minimap__poi-icon">
                {poi.type === 'dungeon' && '🏰'}
                {poi.type === 'ruins' && '🏛️'}
                {poi.type === 'forest' && '🌲'}
              </span>
              <span className="minimap__poi-name">{poi.name}</span>
            </div>
          ))}
        </div>
        <div className="minimap__players">
          {Array.from(players.values()).map(player => (
            <div
              key={player.id}
              className={`minimap__player ${player.id === playerId ? 'minimap__player--you' : ''}`}
            >
              <span className="minimap__player-icon">👤</span>
              <span>{player.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
