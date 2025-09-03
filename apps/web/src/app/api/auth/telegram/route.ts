import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Функция для проверки подписи Telegram
function verifyTelegramAuth(authData: any): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN не найден в переменных окружения');
    return false;
  }

  // Создаем секретный ключ из токена бота
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  // Извлекаем hash из данных
  const { hash, ...data } = authData;
  
  // Создаем строку для проверки
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  // Создаем HMAC
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  // Сравниваем хеши
  return hmac === hash;
}

export async function POST(request: NextRequest) {
  try {
    const authData = await request.json();
    
    // Проверяем подпись Telegram
    if (!verifyTelegramAuth(authData)) {
      return NextResponse.json(
        { error: 'Неверная подпись Telegram' },
        { status: 401 }
      );
    }

    // Проверяем, что данные не устарели (не старше 24 часов)
    const authDate = new Date(authData.auth_date * 1000);
    const now = new Date();
    const hoursDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'Данные аутентификации устарели' },
        { status: 401 }
      );
    }

    // Ищем пользователя в базе данных
    let user = await prisma.user.findUnique({
      where: { tgId: authData.id.toString() }
    });

    // Если пользователь не найден, создаем нового
    if (!user) {
      user = await prisma.user.create({
        data: {
          tgId: authData.id.toString(),
          displayName: authData.first_name + (authData.last_name ? ` ${authData.last_name}` : ''),
          username: authData.username || null,
          isActive: true,
        }
      });
    } else {
      // Обновляем данные существующего пользователя
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: authData.first_name + (authData.last_name ? ` ${authData.last_name}` : ''),
          username: authData.username || null,
          isActive: true,
        }
      });
    }

    // Возвращаем данные пользователя
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        tgId: user.tgId,
        displayName: user.displayName,
        username: user.username,
        isActive: user.isActive,
      }
    });

  } catch (error) {
    console.error('Ошибка аутентификации Telegram:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}