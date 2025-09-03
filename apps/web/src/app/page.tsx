'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

// Интерфейс для данных Telegram пользователя
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверяем, есть ли сохраненные данные пользователя
  useEffect(() => {
    const savedUser = localStorage.getItem('telegramUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('telegramUser');
      }
    }
  }, []);

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem('telegramUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать в Retasker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Биржа фриланса в Telegram с анонимным общением и безопасными сделками
        </p>

        {isAuthenticated && user ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Добро пожаловать, {user.first_name}!
            </h3>
            <p className="text-green-700 mb-4">
              Вы успешно вошли через Telegram
            </p>
            <div className="space-x-4">
              <a 
                href="/orders"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Перейти к заказам
              </a>
              <button 
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Войдите через Telegram
            </h3>
            <div className="text-center">
              <a
                href="https://t.me/RetaskerRobot?start=web_auth"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.54-.44.68-.89.42l-2.46-1.81-1.19 1.15c-.13.13-.24.24-.49.24l.18-2.56 4.59-4.14c.2-.18-.04-.28-.31-.1l-5.68 3.58-2.45-.77c-.53-.16-.54-.53.11-.79l9.57-3.69c.44-.16.83.1.69.79z"/>
                </svg>
                Войти через Telegram
              </a>
            </div>
            <p className="text-blue-700 text-sm mt-4 text-center">
              Или найдите бота в Telegram: <strong>@RetaskerRobot</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Создавайте заказы</h3>
            <p className="text-gray-600">
              Размещайте свои задачи и получайте отклики от исполнителей
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Анонимное общение</h3>
            <p className="text-gray-600">
              Общайтесь через Telegram бота без раскрытия личных данных
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Безопасные сделки</h3>
            <p className="text-gray-600">
              Виртуальный баланс и защищенные платежи
            </p>
          </div>
        </div>
      </div>


    </div>
  )
}