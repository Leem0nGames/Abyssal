import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../stores';
import { Modal, Button, Card, Badge, ProgressBar } from '../components';
import { UpgradeType, UPGRADES, Upgrade } from '@game/shared';

const UPGRADE_ICONS: Record<UpgradeType, string> = {
  [UpgradeType.TRAP_DAMAGE]: '🪤',
  [UpgradeType.TRAP_COOLDOWN]: '⏱️',
  [UpgradeType.ABILITY_POWER]: '✨',
  [UpgradeType.ABILITY_COOLDOWN]: '🔮',
};

const UPGRADE_NAMES: Record<UpgradeType, string> = {
  [UpgradeType.TRAP_DAMAGE]: 'Trap Damage',
  [UpgradeType.TRAP_COOLDOWN]: 'Trap Cooldown',
  [UpgradeType.ABILITY_POWER]: 'Ability Power',
  [UpgradeType.ABILITY_COOLDOWN]: 'Ability Cooldown',
};

const UPGRADE_DESCRIPTIONS: Record<UpgradeType, string> = {
  [UpgradeType.TRAP_DAMAGE]: 'Increase trap damage dealt to enemies',
  [UpgradeType.TRAP_COOLDOWN]: 'Reduce trap cooldown between triggers',
  [UpgradeType.ABILITY_POWER]: 'Increase ability damage and effects',
  [UpgradeType.ABILITY_COOLDOWN]: 'Reduce ability cooldowns',
};

export function ShopPanel() {
  const { currency, upgrades, purchaseUpgrade } = useGameStore();
  const { activePanel, closePanel, addToast } = useUIStore();

  const isOpen = activePanel === 'shop';

  const handlePurchase = (type: UpgradeType) => {
    const success = purchaseUpgrade(type);
    if (success) {
      addToast({
        message: `Upgraded ${UPGRADE_NAMES[type]}!`,
        type: 'success',
        duration: 2000,
      });
    } else {
      addToast({
        message: 'Not enough currency!',
        type: 'error',
        duration: 2000,
      });
    }
  };

  const upgradeTypes = Object.values(UpgradeType);

  return (
    <Modal isOpen={isOpen} onClose={closePanel} title="Upgrade Shop" size="lg">
      <div className="shop">
        <div className="shop__header">
          <div className="shop__currency">
            <span className="gold">💰 {currency.gold.toLocaleString()}</span>
            <span className="essence">✨ {currency.essence.toLocaleString()}</span>
          </div>
        </div>

        <div className="shop__grid">
          {upgradeTypes.map(type => {
            const upgrade = UPGRADES[type];
            const currentLevel = upgrades[type as unknown as keyof typeof upgrades];
            const isMaxed = currentLevel >= upgrade.maxLevel;
            const costGold = isMaxed ? 0 : upgrade.costGold[currentLevel];
            const costEssence = isMaxed ? 0 : upgrade.costEssence[currentLevel];
            const canAfford = currency.gold >= costGold && currency.essence >= costEssence;

            return (
              <Card
                key={type}
                icon={UPGRADE_ICONS[type]}
                title={UPGRADE_NAMES[type]}
                subtitle={`Level ${currentLevel}/${upgrade.maxLevel}`}
                variant={isMaxed ? 'highlight' : 'default'}
                className="shop__upgrade-card"
              >
                <p className="shop__description">{UPGRADE_DESCRIPTIONS[type]}</p>

                <div className="shop__effect">
                  <span className="shop__effect-label">Effect:</span>
                  <span className="shop__effect-value">
                    +{upgrade.effectPerLevel[currentLevel] || 0}
                    {type === UpgradeType.TRAP_DAMAGE && ' damage'}
                    {type === UpgradeType.TRAP_COOLDOWN && 'ms reduction'}
                    {type === UpgradeType.ABILITY_POWER && ' power'}
                    {type === UpgradeType.ABILITY_COOLDOWN && 'ms reduction'}
                  </span>
                </div>

                <div className="shop__next-effect">
                  {!isMaxed && (
                    <>
                      <span className="shop__effect-label">Next level:</span>
                      <span className="shop__effect-value shop__effect-value--next">
                        +{upgrade.effectPerLevel[currentLevel + 1] || 0}
                        {type === UpgradeType.TRAP_DAMAGE && ' damage'}
                        {type === UpgradeType.TRAP_COOLDOWN && 'ms reduction'}
                        {type === UpgradeType.ABILITY_POWER && ' power'}
                        {type === UpgradeType.ABILITY_COOLDOWN && 'ms reduction'}
                      </span>
                    </>
                  )}
                </div>

                <div className="shop__progress">
                  <ProgressBar
                    value={currentLevel}
                    max={upgrade.maxLevel}
                    variant="success"
                    size="sm"
                    showValue
                  />
                </div>

                <div className="shop__footer">
                  {isMaxed ? (
                    <Badge variant="gold" size="lg">
                      MAXED
                    </Badge>
                  ) : (
                    <>
                      <div className="shop__cost">
                        <span className={`gold ${!canAfford ? 'insufficient' : ''}`}>
                          💰 {costGold}
                        </span>
                        <span className={`essence ${!canAfford ? 'insufficient' : ''}`}>
                          ✨ {costEssence}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePurchase(type)}
                        disabled={!canAfford}
                      >
                        Upgrade
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
