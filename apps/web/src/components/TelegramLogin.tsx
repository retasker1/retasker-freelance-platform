'use client';

import { useEffect } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginProps {
  botName: string;
  onAuthCallback: (user: TelegramUser) => void;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

export default function TelegramLogin({ botName, onAuthCallback }: TelegramLoginProps) {
  useEffect(() => {
    // Создаем глобальную функцию для обработки авторизации
    window.onTelegramAuth = onAuthCallback;

    // Загружаем скрипт Telegram Login Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.async = true;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Очистка при размонтировании
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [botName, onAuthCallback]);

  // Для разработки - показываем заглушку
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-white mb-4">Telegram Login (Development)</h3>
          <p className="text-gray-400 text-sm mb-4">
            В режиме разработки Telegram Login Widget не работает на localhost.
            Для тестирования используйте кнопку ниже.
          </p>
          <button 
            onClick={() => onAuthCallback({
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              auth_date: Math.floor(Date.now() / 1000),
              hash: 'test_hash'
            })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Войти как тестовый пользователь
          </button>
        </div>
        <p className="text-gray-400 text-sm text-center max-w-md">
          Войдите через Telegram для создания заказов и откликов на платформе
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="telegram-login-container" className="mb-4"></div>
      <p className="text-gray-400 text-sm text-center max-w-md">
        Войдите через Telegram для создания заказов и откликов на платформе
      </p>
    </div>
  );
}
