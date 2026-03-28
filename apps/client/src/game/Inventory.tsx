import { useGameStore } from '../store/gameStore';
import { RARITY_COLORS, RARITY_NAMES, LOOT_TYPE_NAMES, LootRarity } from '@game/shared';

export function Inventory() {
  const { inventory, sellLoot, setShowInventory, currency } = useGameStore();

  const sortedInventory = [...inventory].sort((a, b) => {
    const rarityOrder = { [LootRarity.EPIC]: 0, [LootRarity.RARE]: 1, [LootRarity.COMMON]: 2 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const handleSell = (itemId: string) => {
    sellLoot(itemId);
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
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
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
          <h2 style={{ margin: 0, color: '#ff6' }}>🎒 Inventory</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ color: '#ffd700', fontSize: '0.9rem' }}>💰 {currency.gold}</div>
            <div style={{ color: '#9932cc', fontSize: '0.9rem' }}>✨ {currency.essence}</div>
            <button
              onClick={() => setShowInventory(false)}
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
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            color: '#888',
          }}
        >
          <span style={{ color: RARITY_COLORS[LootRarity.EPIC] }}>● Epic</span>
          <span style={{ color: RARITY_COLORS[LootRarity.RARE] }}>● Rare</span>
          <span style={{ color: RARITY_COLORS[LootRarity.COMMON] }}>● Common</span>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            paddingRight: '0.5rem',
          }}
        >
          {sortedInventory.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666',
              }}
            >
              No items in inventory
            </div>
          ) : (
            sortedInventory.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#252540',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: `1px solid ${RARITY_COLORS[item.rarity]}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 6,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span style={{ color: RARITY_COLORS[item.rarity], fontWeight: 'bold' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.3rem',
                        background: `${RARITY_COLORS[item.rarity]}30`,
                        color: RARITY_COLORS[item.rarity],
                        borderRadius: 3,
                      }}
                    >
                      {RARITY_NAMES[item.rarity]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>
                    {LOOT_TYPE_NAMES[item.type]} • Level {item.level}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.25rem' }}>
                    {item.modifiers.map(m => (
                      <span
                        key={m.type}
                        style={{
                          display: 'inline-block',
                          marginRight: '0.5rem',
                          color: '#4a4',
                        }}
                      >
                        {m.description}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#ffd700',
                      marginBottom: '0.25rem',
                    }}
                  >
                    💰 {item.sellValue}
                  </div>
                  <button
                    onClick={() => handleSell(item.id)}
                    style={{
                      background: '#2a7a2a',
                      border: 'none',
                      borderRadius: 4,
                      color: '#fff',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #333',
            fontSize: '0.8rem',
            color: '#666',
            textAlign: 'center',
          }}
        >
          {inventory.length} item(s) • Total sell value: 💰{' '}
          {inventory.reduce((sum, item) => sum + item.sellValue, 0)}
        </div>
      </div>
    </div>
  );
}
