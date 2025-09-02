'use client';

import { useState } from 'react';
import TelegramLogin from '../components/TelegramLogin';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export default function HomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    try {
      // Отправляем данные пользователя на сервер для проверки и сохранения
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramUser),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('Пользователь авторизован:', userData);
      } else {
        console.error('Ошибка авторизации');
      }
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Retasker</h1>
        <p className="text-gray-300 text-center mb-12">Фриланс платформа в Telegram</p>
        
        {user ? (
          <div className="max-w-md mx-auto bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Добро пожаловать!</h2>
            <div className="flex items-center space-x-4 mb-4">
              {user.photo_url && (
                <img 
                  src={user.photo_url} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="text-white font-medium">
                  {user.first_name} {user.last_name}
                </p>
                {user.username && (
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Создать заказ
              </button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Просмотреть заказы
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <TelegramLogin 
              botName="retasker_bot" 
              onAuthCallback={handleTelegramAuth}
            />
          </div>
        )}
      </div>
    </div>
  );
}
