import { UpgradeType, UPGRADES } from '@game/shared';
import { useGameStore } from '../store/gameStore';

export function UpgradeShop() {
  const { currency, upgrades, purchaseUpgrade, setShowUpgradeShop } = useGameStore();

  const upgradeTypes = [
    UpgradeType.TRAP_DAMAGE,
    UpgradeType.TRAP_COOLDOWN,
    UpgradeType.ABILITY_POWER,
    UpgradeType.ABILITY_COOLDOWN,
  ];

  const handlePurchase = (type: UpgradeType) => {
    const success = purchaseUpgrade(type);
    if (!success) {
      const upgrade = UPGRADES[type];
      const currentLevel = upgrades[type];
      const costGold = upgrade.costGold[currentLevel];
      const costEssence = upgrade.costEssence[currentLevel];
      const canAfford = currency.gold >= costGold && currency.essence >= costEssence;
      if (currentLevel >= upgrade.maxLevel) {
        alert('Maximum level reached!');
      } else if (!canAfford) {
        alert('Not enough currency!');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          border: '2px solid #444',
          borderRadius: 12,
          padding: '1.5rem',
          minWidth: '400px',
          maxWidth: '500px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0, color: '#ff6' }}>⚡ Upgrade Shop</h2>
          <button
            onClick={() => setShowUpgradeShop(false)}
            style={{
              background: '#444',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#ffd700' }}>💰 Gold: {currency.gold}</div>
          <div style={{ color: '#9932cc' }}>✨ Essence: {currency.essence}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {upgradeTypes.map(type => {
            const upgrade = UPGRADES[type];
            const currentLevel = upgrades[type];
            const isMaxed = currentLevel >= upgrade.maxLevel;
            const costGold = isMaxed ? 0 : upgrade.costGold[currentLevel];
            const costEssence = isMaxed ? 0 : upgrade.costEssence[currentLevel];
            const canAfford = currency.gold >= costGold && currency.essence >= costEssence;
            const effectValue = isMaxed ? 0 : upgrade.effectPerLevel[currentLevel];

            const effectLabels: Record<UpgradeType, string> = {
              [UpgradeType.TRAP_DAMAGE]: '+damage',
              [UpgradeType.TRAP_COOLDOWN]: '-cooldown',
              [UpgradeType.ABILITY_POWER]: '+damage',
              [UpgradeType.ABILITY_COOLDOWN]: '-cooldown',
            };

            return (
              <div
                key={type}
                style={{
                  background: isMaxed ? '#1a3a1a' : '#252540',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{upgrade.name}</div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{upgrade.description}</div>
                  </div>
                  <button
                    onClick={() => handlePurchase(type)}
                    disabled={isMaxed || !canAfford}
                    style={{
                      background: isMaxed ? '#444' : canAfford ? '#2a7a2a' : '#7a2a2a',
                      border: 'none',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      cursor: isMaxed || !canAfford ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      opacity: isMaxed || !canAfford ? 0.7 : 1,
                    }}
                  >
                    {isMaxed ? 'MAX' : `Buy (${costGold}g + ${costEssence}e)`}
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.25rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {[...Array(upgrade.maxLevel)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 20,
                        height: 8,
                        borderRadius: 2,
                        background: i < currentLevel ? '#4a4' : '#333',
                      }}
                    />
                  ))}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Level {currentLevel}/{upgrade.maxLevel} • Next: {effectLabels[type]} {effectValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
