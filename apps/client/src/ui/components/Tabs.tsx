import { useState, ReactNode, Children } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({ tabs, defaultTab, onChange, variant = 'default' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className={`ui-tabs ui-tabs--${variant}`}>
      <div className="ui-tabs__list" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ui-tabs__tab ${activeTab === tab.id ? 'ui-tabs__tab--active' : ''} ${
              tab.disabled ? 'ui-tabs__tab--disabled' : ''
            }`}
            onClick={() => handleTabClick(tab.id, tab.disabled)}
            role="tab"
            aria-selected={activeTab === tab.id}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="ui-tabs__icon">{tab.icon}</span>}
            <span className="ui-tabs__label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="ui-tabs__content" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return <div className={`ui-tabs__panel ${className}`}>{children}</div>;
}
