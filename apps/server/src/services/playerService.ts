import prisma from '../db/prisma';

interface PlayerData {
  id: string;
  name: string;
  level: number;
  experience: number;
  gold: number;
  essence: number;
  class: string;
}

interface InventoryItem {
  id: string;
  itemName: string;
  itemType: string;
  rarity: string;
  level: number;
  sellValue: number;
  icon: string;
  modifiers: object;
}

interface ProgressData {
  highestWaveReached: number;
  totalEnemiesKilled: number;
  totalGoldEarned: number;
  totalEssenceEarned: number;
  trapDamageLevel: number;
  trapCooldownLevel: number;
  abilityPowerLevel: number;
  abilityCooldownLevel: number;
}

export async function createPlayer(userId: string, name: string, playerClass: string) {
  const player = await prisma.player.create({
    data: {
      userId,
      name,
      class: playerClass,
      gold: 100,
      essence: 10,
      level: 1,
      experience: 0,
    },
  });

  await prisma.progress.create({
    data: {
      playerId: player.id,
    },
  });

  return player;
}

export async function getPlayerByUserId(userId: string) {
  return prisma.player.findUnique({
    where: { userId },
    include: {
      progress: true,
      inventory: true,
    },
  });
}

export async function getPlayerById(playerId: string) {
  return prisma.player.findUnique({
    where: { id: playerId },
    include: {
      progress: true,
      inventory: true,
    },
  });
}

export async function updatePlayer(playerId: string, data: Partial<PlayerData>) {
  return prisma.player.update({
    where: { id: playerId },
    data,
  });
}

export async function updateProgress(playerId: string, data: Partial<ProgressData>) {
  return prisma.progress.upsert({
    where: { playerId },
    create: { playerId, ...data },
    update: data,
  });
}

export async function savePlayerProgress(
  playerId: string,
  playerData: PlayerData,
  progressData: ProgressData,
  inventoryItems: InventoryItem[]
): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    await tx.player.update({
      where: { id: playerId },
      data: {
        name: playerData.name,
        level: playerData.level,
        experience: playerData.experience,
        gold: playerData.gold,
        essence: playerData.essence,
        class: playerData.class,
      },
    });

    await tx.progress.upsert({
      where: { playerId },
      create: { playerId, ...progressData },
      update: progressData,
    });

    await tx.inventory.deleteMany({
      where: { playerId },
    });

    if (inventoryItems.length > 0) {
      await tx.inventory.createMany({
        data: inventoryItems.map(item => ({
          playerId,
          itemName: item.itemName,
          itemType: item.itemType,
          rarity: item.rarity,
          level: item.level,
          sellValue: item.sellValue,
          icon: item.icon,
          modifiers: JSON.stringify(item.modifiers),
        })),
      });
    }
  });
}

export async function addInventoryItem(playerId: string, item: InventoryItem) {
  return prisma.inventory.create({
    data: {
      playerId,
      itemName: item.itemName,
      itemType: item.itemType,
      rarity: item.rarity,
      level: item.level,
      sellValue: item.sellValue,
      icon: item.icon,
      modifiers: JSON.stringify(item.modifiers),
    },
  });
}

export async function removeInventoryItem(itemId: string): Promise<void> {
  await prisma.inventory.delete({
    where: { id: itemId },
  });
}

export async function getInventory(playerId: string) {
  return prisma.inventory.findMany({
    where: { playerId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateCurrency(playerId: string, gold: number, essence: number) {
  return prisma.player.update({
    where: { id: playerId },
    data: { gold, essence },
  });
}

export async function deletePlayer(playerId: string): Promise<void> {
  await prisma.player.delete({
    where: { id: playerId },
  });
}
