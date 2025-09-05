import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const user = await prisma.user.create({
      data: {
        telegramId: '123456789',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        isActive: true,
      }
    });
    
    console.log('✅ Тестовый пользователь создан:');
    console.log('ID:', user.id);
    console.log('Telegram ID:', user.telegramId);
    console.log('Имя:', user.firstName, user.lastName);
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
