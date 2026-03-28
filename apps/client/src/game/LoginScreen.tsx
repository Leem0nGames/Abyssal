import { useState } from 'react';
import { PlayerClass, CLASS_DATA } from '@game/shared';

interface LoginScreenProps {
  onLogin: (name: string, playerClass: PlayerClass) => void;
}

const CLASS_ICONS: Record<string, string> = {
  elementalist: '🔥',
  witch: '🧙‍♀️',
  summoner: '🦋',
  arcanist: '✨',
};

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<'name' | 'class'>('name');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>(PlayerClass.ELEMENTALIST);

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep('class');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>⚔️ KAGERO</h1>
          <p>Defend the realm against the darkness</p>
        </div>

        {step === 'name' ? (
          <form className="login-form" onSubmit={handleSubmitName}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              maxLength={20}
            />
            <button type="submit" disabled={!name.trim()}>
              Continue →
            </button>
          </form>
        ) : (
          <div className="class-selection">
            <h2>Choose Your Class</h2>
            <div className="class-grid">
              {Object.values(PlayerClass).map(pc => {
                const classData = CLASS_DATA[pc];
                const isSelected = selectedClass === pc;
                return (
                  <div
                    key={pc}
                    className={`class-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedClass(pc)}
                    style={{ '--class-color': classData.color } as React.CSSProperties}
                  >
                    <div className="class-icon">{CLASS_ICONS[pc]}</div>
                    <h3>{classData.name}</h3>
                    <div className="class-element">
                      {ELEMENT_ICONS[classData.element]} {classData.element}
                    </div>
                    <div className="class-subelement">{classData.subElement}</div>
                    <p className="class-description">{classData.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="class-actions">
              <button className="back-btn" onClick={() => setStep('name')}>
                ← Back
              </button>
              <button className="start-btn" onClick={() => onLogin(name, selectedClass)}>
                Start Adventure ⚔️
              </button>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>Move with WASD • Interact with E</p>
        </div>
      </div>
    </div>
  );
}
