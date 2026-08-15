import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed achievements
  const achievements = [
    { key: 'first_game', name: 'First Steps', description: 'Play your first game', icon: '🎮', category: 'general', points: 10, requirement: { type: 'games', value: 1 } },
    { key: 'ten_games', name: 'Getting Serious', description: 'Play 10 games', icon: '🎯', category: 'general', points: 25, requirement: { type: 'games', value: 10 } },
    { key: 'fifty_games', name: 'Dedicated Player', description: 'Play 50 games', icon: '🏆', category: 'general', points: 50, requirement: { type: 'games', value: 50 } },
    { key: 'score_1000', name: 'Four Digits', description: 'Score 1,000 points in a single game', icon: '⭐', category: 'score', points: 30, requirement: { type: 'score', value: 1000 } },
    { key: 'score_5000', name: 'High Roller', description: 'Score 5,000 points in a single game', icon: '💎', category: 'score', points: 75, requirement: { type: 'score', value: 5000 } },
    { key: 'score_10000', name: 'Legend', description: 'Score 10,000 points in a single game', icon: '👑', category: 'score', points: 150, requirement: { type: 'score', value: 10000 } },
    { key: 'combo_3', name: 'Combo Starter', description: 'Reach a 3x combo multiplier', icon: '🔥', category: 'combo', points: 20, requirement: { type: 'combo', value: 3 } },
    { key: 'combo_5', name: 'Combo Master', description: 'Reach a 5x combo multiplier', icon: '💥', category: 'combo', points: 50, requirement: { type: 'combo', value: 5 } },
    { key: 'first_search', name: 'Curious Mind', description: 'Perform your first search', icon: '🔍', category: 'general', points: 5, requirement: { type: 'search', value: 1 } },
    { key: 'first_purchase', name: 'Shopper', description: 'Make your first shop purchase', icon: '🛒', category: 'general', points: 15, requirement: { type: 'purchase', value: 1 } },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: a,
      create: a,
    });
  }

  // Seed shop items
  const shopItems = [
    { key: 'double_score', name: 'Double Score', description: 'Your next game scores 2x points', icon: '✨', category: 'booster', price: 50, metadata: { multiplier: 2, duration: 1 } },
    { key: 'triple_score', name: 'Triple Score', description: 'Your next game scores 3x points', icon: '🌟', category: 'booster', price: 120, metadata: { multiplier: 3, duration: 1 } },
    { key: 'extra_life', name: 'Extra Life', description: 'Get one extra life in your next game', icon: '❤️', category: 'booster', price: 30, metadata: { extraLives: 1 } },
    { key: 'shield', name: 'Shield', description: 'Protect yourself from one hit', icon: '🛡️', category: 'booster', price: 40, metadata: { shieldHits: 1 } },
    { key: 'theme_dark', name: 'Dark Theme', description: 'Unlock the dark theme', icon: '🌙', category: 'cosmetic', price: 200, metadata: { theme: 'dark' } },
    { key: 'theme_neon', name: 'Neon Theme', description: 'Unlock the neon theme', icon: '🌈', category: 'cosmetic', price: 300, metadata: { theme: 'neon' } },
    { key: 'profile_badge', name: 'VIP Badge', description: 'Show a VIP badge on your profile', icon: '🏅', category: 'cosmetic', price: 500, metadata: { badge: 'vip' } },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements and ${shopItems.length} shop items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
