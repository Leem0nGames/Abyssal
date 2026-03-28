import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../stores';
import { Modal, Button, Card, Tabs, Badge } from '../components';
import { LootItem, LootRarity, RARITY_COLORS } from '@game/shared';

const RARITY_NAMES: Record<LootRarity, string> = {
  [LootRarity.COMMON]: 'Common',
  [LootRarity.RARE]: 'Rare',
  [LootRarity.EPIC]: 'Epic',
};

export function InventoryPanel() {
  const { inventory, sellLoot, currency } = useGameStore();
  const { activePanel, closePanel } = useUIStore();
  const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);
  const [filterRarity, setFilterRarity] = useState<LootRarity | 'all'>('all');

  const isOpen = activePanel === 'inventory';

  const filteredInventory =
    filterRarity === 'all' ? inventory : inventory.filter(item => item.rarity === filterRarity);

  const handleSell = (item: LootItem) => {
    sellLoot(item.id);
    setSelectedItem(null);
  };

  const handleSellAll = () => {
    filteredInventory.forEach(item => {
      sellLoot(item.id);
    });
  };

  const totalSellValue = filteredInventory.reduce((sum, item) => sum + item.sellValue, 0);

  return (
    <Modal isOpen={isOpen} onClose={closePanel} title="Inventory" size="lg">
      <div className="inventory">
        <div className="inventory__tabs">
          <Tabs
            tabs={[
              {
                id: 'all',
                label: `All (${inventory.length})`,
                content: null,
              },
              {
                id: 'common',
                label: `Common (${inventory.filter(i => i.rarity === LootRarity.COMMON).length})`,
                content: null,
              },
              {
                id: 'rare',
                label: `Rare (${inventory.filter(i => i.rarity === LootRarity.RARE).length})`,
                content: null,
              },
              {
                id: 'epic',
                label: `Epic (${inventory.filter(i => i.rarity === LootRarity.EPIC).length})`,
                content: null,
              },
            ]}
            variant="pills"
            onChange={tabId => setFilterRarity(tabId as LootRarity | 'all')}
          />
        </div>

        <div className="inventory__content">
          <div className="inventory__items">
            {filteredInventory.length === 0 ? (
              <div className="inventory__empty">
                <span>No items</span>
              </div>
            ) : (
              filteredInventory.map(item => (
                <div
                  key={item.id}
                  className={`inventory__item ${selectedItem?.id === item.id ? 'inventory__item--selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ borderColor: RARITY_COLORS[item.rarity] }}
                >
                  <span className="inventory__item-icon">{item.icon}</span>
                  <div className="inventory__item-info">
                    <span
                      className="inventory__item-name"
                      style={{ color: RARITY_COLORS[item.rarity] }}
                    >
                      {item.name}
                    </span>
                    <span className="inventory__item-level">Lv.{item.level}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="inventory__details">
            {selectedItem ? (
              <>
                <Card
                  icon={selectedItem.icon}
                  title={selectedItem.name}
                  subtitle={`Level ${selectedItem.level} ${RARITY_NAMES[selectedItem.rarity]}`}
                  variant={selectedItem.rarity === LootRarity.EPIC ? 'highlight' : 'default'}
                >
                  <div className="inventory__item-modifiers">
                    {selectedItem.modifiers.map((mod, index) => (
                      <div key={index} className="inventory__modifier">
                        {mod.description}
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="inventory__sell">
                  <div className="inventory__sell-value">
                    Sell for: <span className="gold">{selectedItem.sellValue} gold</span>
                  </div>
                  <Button variant="success" onClick={() => handleSell(selectedItem)}>
                    Sell
                  </Button>
                </div>
              </>
            ) : (
              <div className="inventory__no-selection">
                <span>Select an item to view details</span>
              </div>
            )}
          </div>
        </div>

        <div className="inventory__footer">
          <div className="inventory__footer-info">
            <Badge variant="gold">{totalSellValue} gold</Badge>
            <span>{filteredInventory.length} items</span>
          </div>
          <Button
            variant="secondary"
            onClick={handleSellAll}
            disabled={filteredInventory.length === 0}
          >
            Sell All
          </Button>
        </div>
      </div>
    </Modal>
  );
}
