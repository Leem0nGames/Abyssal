# Dungeon Defense - Multiplayer Game

Un juego multiplayer de defensa con hub world, misiones, trampas y clases de personajes.

## Stack Tecnológico

- **Frontend**: React + Vite + TypeScript
- **2D Rendering**: PixiJS (Hub World)
- **3D Rendering**: Three.js + React Three Fiber (Misiones)
- **Backend**: Node.js + Colyseus (WebSocket multiplayer)
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Monorepo**: pnpm workspaces

## Estructura del Proyecto

```
/
├── apps/
│   ├── client/          # Aplicación React
│   │   └── src/
│   │       ├── game/           # Componentes del juego
│   │       │   ├── MissionScene.tsx    # Escena 3D de misiones
│   │       │   ├── GameRenderer.ts     # Renderer PixiJS del hub
│   │       │   ├── UpgradeShop.tsx     # Tienda de mejoras
│   │       │   ├── Inventory.tsx       # Inventario de loot
│   │       │   └── ResultsScreen.tsx   # Pantalla de resultados
│   │       ├── ui/             # Sistema de UI reusable
│   │       │   ├── components/         # Botones, Cards, Modals, etc.
│   │       │   ├── stores/             # Zustand stores
│   │       │   └── hooks/              # Custom hooks
│   │       ├── hooks/          # useColyseus (networking)
│   │       └── store/          # gameStore (estado global)
│   │
│   └── server/          # Servidor Colyseus
│       └── src/
│           ├── rooms/          # Game rooms (HubRoom)
│           ├── services/        # Lógica de negocio
│           └── db/             # Prisma + PostgreSQL
│
├── packages/
│   └── shared/          # Tipos compartidos entre cliente/servidor
│
└── docker-compose.yml   # PostgreSQL para desarrollo
```

## Características del Juego

### Hub World

- Mapa 2D renderizado con PixiJS
- Sistema de zonas desbloqueables por nivel
- Puntos de interés (POIs) para entrar a misiones
- Multiplayer en tiempo real via WebSocket

### Sistema de Clases

| Clase        | Elemento | Habilidades                |
| ------------ | -------- | -------------------------- |
| Elementalist | Fuego    | Fireball, Flame Strike     |
| Witch        | Agua     | Frost Nova, Ice Shard      |
| Summoner     | Tierra   | Summon Minion, Earthquake  |
| Arcanist     | Aire     | Lightning Bolt, Wind Blade |

### Sistema de Misiones

- Enemigos que siguen un camino predefinido
- Colocación de trampas en el suelo
- Uso de habilidades con cooldowns
- Sistema de oleadas progresivas

### Trampas

| Tipo    | Daño Base | Descripción      |
| ------- | --------- | ---------------- |
| Spike   | 30        | Daño instantáneo |
| Fire    | 50        | +Quemadura       |
| Boulder | 80        | +Stun            |

### Sistema de Tier

- T1 → T2: +50% daño, -500ms cooldown
- T2 → T3: +125% daño, -1000ms cooldown

### Loot System

- Common (60%), Rare (30%), Epic (10%)
- Modificadores aleatorios
- Sistema de venta por oro

### Currency

- **Gold**: Recompensa de enemigos y venta de loot
- **Essence**: Recompensa de oleadas y misiones

## Instalación

### Requisitos

- Node.js 18+
- Docker (para PostgreSQL)
- pnpm o npm

### Setup

```bash
# 1. Clonar el repositorio
cd /home/user/studio

# 2. Instalar dependencias
pnpm install
# o
npm install

# 3. Iniciar PostgreSQL con Docker
docker-compose up -d

# 4. Generar cliente Prisma
cd apps/server
npx prisma generate
npx prisma db push

# 5. Construir paquete compartido
cd packages/shared
npm run build

# 6. Iniciar el servidor
cd apps/server
npm run dev

# 7. Iniciar el cliente (en otra terminal)
cd apps/client
npm run dev
```

### Variables de Entorno

```env
# apps/server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/gamedb"
PORT=2567
```

```env
# apps/client/.env
VITE_SERVER_URL=ws://localhost:2567
```

## Controles

### Hub World

| Tecla | Acción              |
| ----- | ------------------- |
| W/↑   | Mover arriba        |
| S/↓   | Mover abajo         |
| A/←   | Mover izquierda     |
| D/→   | Mover derecha       |
| E     | Interactuar con POI |

### Misión

| Tecla     | Acción              |
| --------- | ------------------- |
| Q         | Seleccionar Spike   |
| E         | Seleccionar Fire    |
| R         | Seleccionar Boulder |
| 1         | Usar habilidad 1    |
| 2         | Usar habilidad 2    |
| Click     | Colocar trampa      |
| Click Izq | Mejorar trampa      |
| ESC       | Salir de misión     |

## API de Red (Colyseus)

### Mensajes del Cliente

```typescript
// Movimiento
room.send('move', { x: number, y: number });

// Interactuar con POI
room.send('interact:poi');

// Mensajes del Servidor
room.onMessage('poi:interaction', data => {
  // data.poi - El POI seleccionado
  // data.event - Evento de entrada a misión
});
```

## Sistema de UI

El proyecto incluye un sistema de UI reusable:

```tsx
import { UIManager, HUD, useUIStore, Button, Modal } from './ui';

// Componente principal
function App() {
  return (
    <UIManager>
      <GameWorld />
      <HUD wave={1} enemies={5} health={100} />
    </UIManager>
  );
}

// Abrir paneles
const { openPanel } = useUIStore();
openPanel('inventory');
openPanel('shop');
openPanel('map');

// Notificaciones
import { useToast } from './ui';
const { success, error } = useToast();
success('¡Misión completada!');
error('No tienes suficiente oro');
```

## Persistencia

El juego guarda automáticamente:

- Progreso del jugador (nivel, experiencia)
- Inventario y currency
- Mejoras compradas

## Comandos Disponibles

### Cliente

```bash
cd apps/client
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Previsualizar build
```

### Servidor

```bash
cd apps/server
npm run dev      # Desarrollo con hot-reload
npm run build    # Compilar TypeScript
npm start        # Producción
```

### Base de Datos

```bash
cd apps/server
npm run db:generate    # Generar cliente Prisma
npm run db:migrate      # Aplicar migraciones
npm run db:push         # Sincronizar schema
npm run db:studio       # Abrir Prisma Studio
```

## Arquitectura de Estado

### Game Store (Zustand)

```typescript
interface GameStore {
  // Estado del jugador
  playerId: string | null;
  playerLevel: number;
  currency: { gold: number; essence: number };
  inventory: LootItem[];
  upgrades: Upgrades;

  // Estado del mundo
  players: Map<string, HubPlayer>;
  zones: Zone[];
  pois: POI[];
  nearbyPOI: POI | null;

  // UI
  showUpgradeShop: boolean;
  showInventory: boolean;
  currentMission: POI | null;
}
```

## Próximas Funcionalidades

- [ ] Sistema de quests
- [ ] Logros
- [ ] Sistema de amigos/party
- [ ] Chat en tiempo real
- [ ] Rankings globales
- [ ] Más tipos de enemigos
- [ ] Sistema de mazmorras procedural
- [ ] Modo PvP

## Licencia

MIT
