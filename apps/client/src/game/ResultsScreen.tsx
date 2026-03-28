import { useState, useEffect } from 'react';
import { LootItem, RARITY_COLORS, LootRarity } from '@game/shared';

interface MissionResultsProps {
  poiName: string;
  waveReached: number;
  enemiesKilled: number;
  goldEarned: number;
  essenceEarned: number;
  lootCollected: LootItem[];
  onContinue: () => void;
}

export function ResultsScreen({
  poiName,
  waveReached,
  enemiesKilled,
  goldEarned,
  essenceEarned,
  lootCollected,
  onContinue,
}: MissionResultsProps) {
  const [show, setShow] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    gold: 0,
    essence: 0,
    enemies: 0,
    wave: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        gold: Math.floor(goldEarned * eased),
        essence: Math.floor(essenceEarned * eased),
        enemies: Math.floor(enemiesKilled * eased),
        wave: Math.floor(waveReached * eased),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [show, goldEarned, essenceEarned, enemiesKilled, waveReached]);

  const getRating = () => {
    if (waveReached >= 10) return { stars: 3, text: 'S-Tier', color: '#ffd700' };
    if (waveReached >= 7) return { stars: 2, text: 'A-Tier', color: '#c0c0c0' };
    if (waveReached >= 4) return { stars: 1, text: 'B-Tier', color: '#cd7f32' };
    return { stars: 0, text: 'C-Tier', color: '#666' };
  };

  const rating = getRating();

  return (
    <div className={`results-overlay ${show ? 'visible' : ''}`}>
      <div className={`results-container ${show ? 'visible' : ''}`}>
        <div className="results-header">
          <h1>Mission Complete!</h1>
          <h2>{poiName}</h2>
        </div>

        <div className="rating-section">
          <div className="rating-badge" style={{ borderColor: rating.color }}>
            <span className="rating-text" style={{ color: rating.color }}>
              {rating.text}
            </span>
            <div className="stars">
              {[1, 2, 3].map(i => (
                <span key={i} className={`star ${i <= rating.stars ? 'filled' : ''}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⚔️</div>
            <div className="stat-value">{animatedStats.wave}</div>
            <div className="stat-label">Wave Reached</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💀</div>
            <div className="stat-value">{animatedStats.enemies}</div>
            <div className="stat-label">Enemies Slain</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-icon">💰</div>
            <div className="stat-value">+{animatedStats.gold}</div>
            <div className="stat-label">Gold Earned</div>
          </div>
          <div className="stat-card essence">
            <div className="stat-icon">✨</div>
            <div className="stat-value">+{animatedStats.essence}</div>
            <div className="stat-label">Essence Earned</div>
          </div>
        </div>

        {lootCollected.length > 0 && (
          <div className="loot-section">
            <h3>Loot Collected</h3>
            <div className="loot-grid">
              {lootCollected.map((item, index) => (
                <div
                  key={item.id}
                  className="loot-item"
                  style={{
                    borderColor: RARITY_COLORS[item.rarity as LootRarity],
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <span className="loot-icon">{item.icon}</span>
                  <span
                    className="loot-name"
                    style={{ color: RARITY_COLORS[item.rarity as LootRarity] }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="continue-btn" onClick={onContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}
