import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Пользователи в базе данных:');
    console.log(users);
    
    if (users.length === 0) {
      console.log('❌ Пользователей нет в базе данных!');
      console.log('Нужно авторизоваться заново.');
    } else {
      console.log(`✅ Найдено ${users.length} пользователей`);
    }
  } catch (error) {
    console.error('Ошибка при проверке пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
