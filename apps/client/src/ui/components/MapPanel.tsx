import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../stores';
import { Modal, Card, Badge } from '../components';
import { Zone, POI } from '@game/shared';

const POI_ICONS: Record<string, string> = {
  dungeon: '🏰',
  ruins: '🏛️',
  forest: '🌲',
};

const POI_COLORS: Record<string, string> = {
  dungeon: '#ff6b6b',
  ruins: '#ffd93d',
  forest: '#6bcb77',
};

export function MapPanel() {
  const { zones, pois, playerId, playerLevel, players } = useGameStore();
  const { activePanel, closePanel } = useUIStore();

  const isOpen = activePanel === 'map';

  const myPlayer = playerId ? players.get(playerId) : null;

  return (
    <Modal isOpen={isOpen} onClose={closePanel} title="World Map" size="xl">
      <div className="world-map">
        <div className="world-map__zones">
          <h3>Regions</h3>
          <div className="world-map__zone-list">
            {zones.map(zone => {
              const isUnlocked = playerLevel >= zone.minLevel;
              const playersInZone = Array.from(players.values()).filter(p => true).length;

              return (
                <Card
                  key={zone.id}
                  title={zone.name}
                  subtitle={`Level ${zone.minLevel}+ | ${playersInZone} players`}
                  variant={isUnlocked ? 'default' : 'default'}
                  className={`world-map__zone-card ${!isUnlocked ? 'world-map__zone-card--locked' : ''}`}
                >
                  {!isUnlocked && (
                    <Badge variant="danger" size="sm">
                      🔒 Locked
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div className="world-map__pois">
          <h3>Points of Interest</h3>
          <div className="world-map__poi-list">
            {pois.map(poi => {
              const isUnlocked = playerLevel >= poi.minLevel;
              const poiColor = POI_COLORS[poi.type] || '#888';

              return (
                <div
                  key={poi.id}
                  className={`world-map__poi-card ${!isUnlocked ? 'world-map__poi-card--locked' : ''}`}
                >
                  <div className="world-map__poi-marker" style={{ backgroundColor: poiColor }}>
                    {POI_ICONS[poi.type]}
                  </div>
                  <div className="world-map__poi-info">
                    <span className="world-map__poi-name">{poi.name}</span>
                    <span className="world-map__poi-type">{poi.type}</span>
                    {!isUnlocked && (
                      <Badge variant="danger" size="sm">
                        Requires Level {poi.minLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="world-map__legend">
          <h4>Legend</h4>
          <div className="world-map__legend-items">
            <div className="world-map__legend-item">
              <span style={{ color: POI_COLORS.dungeon }}>🏰</span>
              <span>Dungeon</span>
            </div>
            <div className="world-map__legend-item">
              <span style={{ color: POI_COLORS.ruins }}>🏛️</span>
              <span>Ruins</span>
            </div>
            <div className="world-map__legend-item">
              <span style={{ color: POI_COLORS.forest }}>🌲</span>
              <span>Forest</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
