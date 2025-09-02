import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// В реальном приложении это должно быть в переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'your_bot_token_here';

function verifyTelegramAuth(user: TelegramUser): boolean {
  // В режиме разработки пропускаем проверку для тестовых данных
  if (process.env.NODE_ENV === 'development' && user.hash === 'test_hash') {
    return true;
  }

  const { hash, ...userData } = user;
  
  // Создаем строку для проверки
  const dataCheckString = Object.keys(userData)
    .sort()
    .map(key => `${key}=${userData[key as keyof typeof userData]}`)
    .join('\n');

  // Создаем секретный ключ
  const secretKey = crypto
    .createHash('sha256')
    .update(BOT_TOKEN)
    .digest();

  // Вычисляем HMAC
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}

export async function POST(request: NextRequest) {
  try {
    const user: TelegramUser = await request.json();

    // Проверяем подлинность данных от Telegram
    if (!verifyTelegramAuth(user)) {
      return NextResponse.json(
        { error: 'Неверная подпись Telegram' },
        { status: 401 }
      );
    }

    // Проверяем, что данные не устарели (не более 24 часов)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - user.auth_date > 86400) {
      return NextResponse.json(
        { error: 'Данные авторизации устарели' },
        { status: 401 }
      );
    }

    // Здесь можно сохранить пользователя в базу данных
    // Пока просто возвращаем данные пользователя
    const userResponse = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      isAuthenticated: true,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Ошибка при обработке Telegram авторизации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
