import { useRef, Suspense, useState } from 'react';
import { Room } from 'colyseus.js';
import { HubState, PlayerClass, CLASS_DATA } from '@game/shared';
import { useColyseus, useKeyboardMovement, useGameRenderer } from './hooks/useColyseus';
import { useGameStore } from './store/gameStore';
import { MissionScene } from './game/MissionScene';
import './index.css';

const POI_ICONS: Record<string, string> = {
  dungeon: '🏰',
  ruins: '🏛️',
  forest: '🌲',
};

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
};

const CLASS_ICONS: Record<string, string> = {
  elementalist: '🔥',
  witch: '🧙‍♀️',
  summoner: '🦋',
  arcanist: '✨',
};

function ClassSelection({ onSelect }: { onSelect: (playerClass: PlayerClass) => void }) {
  const [selectedClass, setSelectedClass] = useState<PlayerClass | null>(null);

  return (
    <div className="class-selection">
      <h2>Choose Your Class</h2>
      <div className="class-grid">
        {Object.values(PlayerClass).map((playerClass) => {
          const classData = CLASS_DATA[playerClass];
          const isSelected = selectedClass === playerClass;
          
          return (
            <div
              key={playerClass}
              className={`class-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedClass(playerClass)}
              style={{ '--class-color': classData.color } as React.CSSProperties}
            >
              <div className="class-icon">{CLASS_ICONS[playerClass]}</div>
              <h3>{classData.name}</h3>
              <div className="class-element">
                {ELEMENT_ICONS[classData.element]} {classData.element}
              </div>
              <div className="class-subelement">
                {classData.subElement}
              </div>
              <p className="class-description">{classData.description}</p>
            </div>
          );
        })}
      </div>
      <button
        className="confirm-class-btn"
        disabled={!selectedClass}
        onClick={() => selectedClass && onSelect(selectedClass)}
      >
        Confirm Class
      </button>
    </div>
  );
}

function App() {
  const roomRef = useRef<Room<HubState> | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [selectedClass, setSelectedClass] = useState<PlayerClass>(PlayerClass.ELEMENTALIST);
  const [showClassSelect, setShowClassSelect] = useState(true);
  
  const { connected, playerId, playerLevel, players, zones, pois, nearbyPOI, currentMission, notification, setCurrentMission } = useGameStore();
  const { connect } = useColyseus();

  useKeyboardMovement(roomRef, playerId, players, pois, playerLevel);
  useGameRenderer(gameContainerRef, players, playerId, zones, pois, playerLevel);

  const handleClassSelect = (playerClass: PlayerClass) => {
    setSelectedClass(playerClass);
    setShowClassSelect(false);
  };

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const level = parseInt(formData.get('level') as string) || 1;

    const room = await connect(name, level, selectedClass);
    roomRef.current = room;
  };

  if (currentMission) {
    return (
      <div className="mission-container">
        <Suspense fallback={<div className="loading">Loading 3D Scene...</div>}>
          <MissionScene 
            poiName={currentMission.name} 
            onExit={() => setCurrentMission(null)} 
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="sidebar">
        <h1>Hub World</h1>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {showClassSelect ? (
          <ClassSelection onSelect={handleClassSelect} />
        ) : (
          <>
            <div className="card">
              <div className="status">
                <div className={`dot ${connected ? 'online' : 'offline'}`} />
                <span>{connected ? 'Connected' : 'Disconnected'}</span>
              </div>

              {!connected && (
                <form onSubmit={handleJoin} className="form">
                  <div className="selected-class">
                    <span className="class-badge" style={{ background: CLASS_DATA[selectedClass].color }}>
                      {CLASS_ICONS[selectedClass]} {CLASS_DATA[selectedClass].name}
                    </span>
                    <button type="button" onClick={() => setShowClassSelect(true)} className="change-class-btn">
                      Change
                    </button>
                  </div>
                  <input name="name" placeholder="Player name" required />
                  <input name="level" type="number" defaultValue={1} min={1} max={100} />
                  <button type="submit">Join Hub</button>
                </form>
              )}

              {connected && playerId && (
                <div className="player-info">
                  <span className="player-level-badge">Lvl {playerLevel}</span>
                  <span className="player-class-badge" style={{ background: CLASS_DATA[selectedClass].color }}>
                    {CLASS_ICONS[selectedClass]} {CLASS_DATA[selectedClass].name}
                  </span>
                </div>
              )}
            </div>

            {nearbyPOI && (
              <div className="card nearby-poi">
                <div className="poi-header">
                  <span className="poi-icon">{POI_ICONS[nearbyPOI.type]}</span>
                  <h3>{nearbyPOI.name}</h3>
                </div>
                <p className="poi-type">{nearbyPOI.type.toUpperCase()}</p>
                {playerLevel >= nearbyPOI.minLevel ? (
                  <p className="poi-hint">Press <strong>E</strong> to enter</p>
                ) : (
                  <p className="poi-locked">Requires Level {nearbyPOI.minLevel}</p>
                )}
              </div>
            )}

            <div className="card">
              <h2>Players ({players.size})</h2>
              {players.size === 0 ? (
                <p className="empty">No players in hub</p>
              ) : (
                <ul className="player-list">
                  {Array.from(players.values()).map((player, index) => (
                    <li key={player.id}>
                      <span
                        className="player-color"
                        style={{
                          background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'][
                            index % 8
                          ],
                        }}
                      />
                      <span className="player-name">
                        {player.id === playerId && '(You) '}
                        {player.name}
                      </span>
                      <span className="player-level">Lvl {player.level}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h2>Zones</h2>
              <ul className="zone-list">
                {zones.map((zone) => {
                  const isLocked = playerLevel < zone.minLevel;
                  return (
                    <li key={zone.id} className={isLocked ? 'locked' : 'unlocked'}>
                      <span className="zone-icon">{isLocked ? '🔒' : '🌍'}</span>
                      <span className="zone-name">{zone.name}</span>
                      <span className="zone-level">Lvl {zone.minLevel}+</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="card">
              <h2>Points of Interest</h2>
              <ul className="poi-list">
                {pois.map((poi) => {
                  const isLocked = playerLevel < poi.minLevel;
                  return (
                    <li key={poi.id} className={isLocked ? 'locked' : 'unlocked'}>
                      <span className="poi-icon">{POI_ICONS[poi.type]}</span>
                      <span className="poi-name">{poi.name}</span>
                      <span className="poi-level">{isLocked ? `Lvl ${poi.minLevel}` : 'Available'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="card controls">
              <h2>Controls</h2>
              <div className="controls-grid">
                <div className="control-item">
                  <div className="keys">
                    <div className="key-row"><span className="key">W</span></div>
                    <div className="key-row">
                      <span className="key">A</span>
                      <span className="key">S</span>
                      <span className="key">D</span>
                    </div>
                  </div>
                  <span>Move</span>
                </div>
                <div className="control-item">
                  <span className="key big">E</span>
                  <span>Interact</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="game-area">
        <div ref={gameContainerRef} className="game-container" />
      </div>
    </div>
  );
}

export default App;
