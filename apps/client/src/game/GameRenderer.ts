import * as PIXI from 'pixi.js';
import { HubPlayer, Zone, POI, POIType } from '@game/shared';

const TILE_SIZE = 32;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;
const PLAYER_RADIUS = 12;
const LABEL_OFFSET = 18;

const PLAYER_COLORS = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdfe6e9, 0xfd79a8, 0xa29bfe];

const ZONE_COLORS: Record<string, { fill: number; border: number; locked: number }> = {
  spawn: { fill: 0x1a3a1a, border: 0x2ecc71, locked: 0x1a3a1a },
  forest: { fill: 0x1a2e1a, border: 0x27ae60, locked: 0x1a1a1a },
  mountains: { fill: 0x2a2a3a, border: 0x3498db, locked: 0x1a1a2a },
  castle: { fill: 0x3a1a2a, border: 0x9b59b6, locked: 0x1a1a1a },
};

const POI_COLORS: Record<POIType, { fill: number; border: number; glow: number }> = {
  [POIType.DUNGEON]: { fill: 0x4a1a2a, border: 0xff4757, glow: 0xff6b81 },
  [POIType.RUINS]: { fill: 0x3a3a1a, border: 0xffa502, glow: 0xffbe76 },
  [POIType.FOREST]: { fill: 0x1a4a2a, border: 0x2ed573, glow: 0x7bed9f },
};

const POI_ICONS: Record<POIType, string> = {
  [POIType.DUNGEON]: 'D',
  [POIType.RUINS]: 'R',
  [POIType.FOREST]: 'F',
};

export class GameRenderer {
  private app!: PIXI.Application;
  private worldContainer!: PIXI.Container;
  private mapContainer!: PIXI.Container;
  private zonesContainer!: PIXI.Container;
  private poisContainer!: PIXI.Container;
  private playersContainer!: PIXI.Container;
  private playerSprites: Map<string, PIXI.Graphics> = new Map();
  private playerLabels: Map<string, PIXI.Text> = new Map();
  private zoneLabels: Map<string, PIXI.Text> = new Map();
  private poiGraphics: Map<string, PIXI.Graphics> = new Map();
  private poiLabels: Map<string, PIXI.Text> = new Map();
  private cameraX = MAP_WIDTH * TILE_SIZE / 2;
  private cameraY = MAP_HEIGHT * TILE_SIZE / 2;
  private playerLevel = 1;
  private animationTime = 0;

  init(container: HTMLElement) {
    this.app = new PIXI.Application({
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    container.appendChild(this.app.view as HTMLCanvasElement);

    this.worldContainer = new PIXI.Container();
    this.app.stage.addChild(this.worldContainer);

    this.mapContainer = new PIXI.Container();
    this.worldContainer.addChild(this.mapContainer);

    this.zonesContainer = new PIXI.Container();
    this.worldContainer.addChild(this.zonesContainer);

    this.poisContainer = new PIXI.Container();
    this.worldContainer.addChild(this.poisContainer);

    this.playersContainer = new PIXI.Container();
    this.worldContainer.addChild(this.playersContainer);

    this.drawMap();

    this.app.ticker.add(() => {
      this.animationTime += 0.05;
      this.updateCamera();
      this.updatePOIAnimations();
    });

    window.addEventListener('resize', () => {
      this.app.renderer.resize(container.clientWidth, container.clientHeight);
    });
  }

  private drawMap() {
    for (let x = 0; x < MAP_WIDTH; x++) {
      for (let y = 0; y < MAP_HEIGHT; y++) {
        const tile = new PIXI.Graphics();
        const isAlt = (x + y) % 2 === 0;
        
        tile.beginFill(isAlt ? 0x1a1a2e : 0x16213e);
        tile.drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        tile.endFill();
        tile.lineStyle(1, 0x333366);
        tile.drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        this.mapContainer.addChild(tile);
      }
    }
  }

  updateZones(zones: Zone[]) {
    this.zonesContainer.removeChildren();
    this.zoneLabels.clear();

    zones.forEach((zone) => {
      const colors = ZONE_COLORS[zone.id] || { fill: 0x333333, border: 0x666666, locked: 0x1a1a1a };
      const isLocked = this.playerLevel < zone.minLevel;

      const zoneGraphics = new PIXI.Graphics();
      
      zoneGraphics.beginFill(isLocked ? colors.locked : colors.fill, 0.6);
      zoneGraphics.drawRect(
        zone.bounds.x,
        zone.bounds.y,
        zone.bounds.width,
        zone.bounds.height
      );
      zoneGraphics.endFill();

      zoneGraphics.lineStyle(2, isLocked ? 0xff4444 : colors.border);
      zoneGraphics.drawRect(
        zone.bounds.x,
        zone.bounds.y,
        zone.bounds.width,
        zone.bounds.height
      );

      if (isLocked) {
        zoneGraphics.beginFill(0x000000, 0.5);
        for (let i = 0; i < zone.bounds.width; i += 20) {
          for (let j = 0; j < zone.bounds.height; j += 20) {
            if ((i + j) % 40 === 0) {
              zoneGraphics.drawRect(zone.bounds.x + i, zone.bounds.y + j, 10, 10);
            }
          }
        }
        zoneGraphics.endFill();
      }

      this.zonesContainer.addChild(zoneGraphics);

      const labelStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: isLocked ? 0xff4444 : 0xffffff,
      });
      const label = new PIXI.Text(
        `${zone.name}${isLocked ? ` (Lvl ${zone.minLevel}+)` : ''}`,
        labelStyle
      );
      label.position.set(
        zone.bounds.x + zone.bounds.width / 2,
        zone.bounds.y + 15
      );
      label.anchor.set(0.5);
      this.zonesContainer.addChild(label);
      this.zoneLabels.set(zone.id, label);
    });
  }

  updatePOIs(pois: POI[]) {
    const currentIds = new Set(pois.map(p => p.id));
    const existingIds = new Set(this.poiGraphics.keys());

    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const graphics = this.poiGraphics.get(id);
        const label = this.poiLabels.get(id);
        if (graphics) this.poisContainer.removeChild(graphics);
        if (label) this.poisContainer.removeChild(label);
        this.poiGraphics.delete(id);
        this.poiLabels.delete(id);
      }
    });

    pois.forEach((poi) => {
      const colors = POI_COLORS[poi.type];
      const isLocked = this.playerLevel < poi.minLevel;

      let graphics = this.poiGraphics.get(poi.id);
      let label = this.poiLabels.get(poi.id);

      if (!graphics) {
        graphics = new PIXI.Graphics();
        this.poisContainer.addChild(graphics);
        this.poiGraphics.set(poi.id, graphics);
      }

      if (!label) {
        label = new PIXI.Text(poi.name, {
          fontFamily: 'Arial',
          fontSize: 11,
          fontWeight: 'bold',
          fill: 0xffffff,
        });
        this.poisContainer.addChild(label);
        this.poiLabels.set(poi.id, label);
      }

      graphics.clear();

      if (!isLocked) {
        const pulse = Math.sin(this.animationTime * 2) * 0.3 + 0.7;
        graphics.beginFill(colors.glow, 0.2 * pulse);
        graphics.drawCircle(poi.position.x, poi.position.y, poi.radius * 1.5);
        graphics.endFill();
      }

      graphics.beginFill(isLocked ? 0x333333 : colors.fill, 0.8);
      graphics.drawCircle(poi.position.x, poi.position.y, poi.radius);
      graphics.endFill();

      graphics.lineStyle(2, isLocked ? 0x666666 : colors.border);
      graphics.drawCircle(poi.position.x, poi.position.y, poi.radius);

      graphics.lineStyle(1, isLocked ? 0x666666 : colors.glow, 0.5);
      graphics.drawCircle(poi.position.x, poi.position.y, poi.radius + 8);
      
      label.text = `${POI_ICONS[poi.type]} ${poi.name}${isLocked ? ` (Lvl ${poi.minLevel})` : ''}`;
      label.position.set(poi.position.x, poi.position.y - poi.radius - 12);
      label.anchor.set(0.5);
    });
  }

  private updatePOIAnimations() {
    this.poisContainer.children.forEach((child) => {
      child.visible = Math.sin(this.animationTime * 0.5) > -0.5;
    });
  }

  setPlayerLevel(level: number) {
    this.playerLevel = level;
  }

  updatePlayers(players: Map<string, HubPlayer>, myId: string | null) {
    const currentIds = new Set(players.keys());
    const existingIds = new Set(this.playerSprites.keys());

    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const sprite = this.playerSprites.get(id);
        const label = this.playerLabels.get(id);
        if (sprite) this.playersContainer.removeChild(sprite);
        if (label) this.playersContainer.removeChild(label);
        this.playerSprites.delete(id);
        this.playerLabels.delete(id);
      }
    });

    let index = 0;
    players.forEach((player, id) => {
      const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
      const isMe = player.id === myId;

      let sprite = this.playerSprites.get(id);
      let label = this.playerLabels.get(id);

      if (!sprite) {
        sprite = new PIXI.Graphics();
        this.playersContainer.addChild(sprite);
        this.playerSprites.set(id, sprite);
      }

      if (!label) {
        label = new PIXI.Text(player.name, {
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 0xffffff,
        });
        this.playersContainer.addChild(label);
        this.playerLabels.set(id, label);
      }

      sprite.clear();
      sprite.beginFill(color);
      sprite.drawCircle(0, 0, PLAYER_RADIUS);
      sprite.endFill();
      sprite.lineStyle(isMe ? 3 : 1, isMe ? 0xffffff : 0xaaaaaa);
      sprite.drawCircle(0, 0, PLAYER_RADIUS);

      label.text = player.name.charAt(0).toUpperCase();
      label.position.set(player.position.x, player.position.y - LABEL_OFFSET);
      label.anchor.set(0.5);

      sprite.position.set(player.position.x, player.position.y);

      if (isMe) {
        this.cameraX = player.position.x;
        this.cameraY = player.position.y;
      }

      index++;
    });
  }

  private updateCamera() {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    this.worldContainer.x = screenWidth / 2 - this.cameraX;
    this.worldContainer.y = screenHeight / 2 - this.cameraY;
  }

  destroy() {
    this.app.destroy(true, { children: true });
  }
}
