import { useUIStore } from '../stores';
import { ToastContainer } from './Toast';
import { InventoryPanel } from './InventoryPanel';
import { ShopPanel } from './ShopPanel';
import { MapPanel } from './MapPanel';
import { Button } from './Button';

interface UIManagerProps {
  children?: React.ReactNode;
}

export function UIManager({ children }: UIManagerProps) {
  const { activePanel, togglePanel, closePanel } = useUIStore();

  const panelButtons = [
    { id: 'inventory', icon: '🎒', label: 'Inventory' },
    { id: 'shop', icon: '⚡', label: 'Shop' },
    { id: 'map', icon: '🗺️', label: 'Map' },
    { id: 'quest', icon: '📜', label: 'Quests' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ] as const;

  return (
    <div className="ui-manager">
      {children}

      <div className="ui-manager__sidebar">
        {panelButtons.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`ui-manager__sidebar-btn ${
              activePanel === id ? 'ui-manager__sidebar-btn--active' : ''
            }`}
            onClick={() => togglePanel(id)}
            title={label}
          >
            <span className="ui-manager__sidebar-icon">{icon}</span>
          </button>
        ))}
      </div>

      <div className="ui-manager__bottom-bar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const { togglePause } = useUIStore.getState();
            togglePause();
          }}
        >
          ⏸️ Menu
        </Button>
      </div>

      <ToastContainer />
      <InventoryPanel />
      <ShopPanel />
      <MapPanel />

      {activePanel === 'quest' && (
        <div className="ui-panel ui-panel--quest">
          <div className="ui-panel__header">
            <h2>Quests</h2>
            <button onClick={closePanel}>✕</button>
          </div>
          <div className="ui-panel__content">
            <p className="ui-empty">No active quests</p>
          </div>
        </div>
      )}

      {activePanel === 'settings' && (
        <div className="ui-panel ui-panel--settings">
          <div className="ui-panel__header">
            <h2>Settings</h2>
            <button onClick={closePanel}>✕</button>
          </div>
          <div className="ui-panel__content">
            <div className="ui-setting">
              <label>
                <input type="checkbox" />
                Show Minimap
              </label>
            </div>
            <div className="ui-setting">
              <label>
                <input type="checkbox" />
                Show FPS
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
