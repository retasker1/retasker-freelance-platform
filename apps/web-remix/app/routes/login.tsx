import { Form, Link } from "react-router";
import React, { useState, useEffect } from "react";
import type { Route } from "./+types/login";
import { useUser } from "../hooks/useUser";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Вход — Retasker" },
    { name: "description", content: "Войдите в систему через Telegram" },
  ];
}

export default function LoginPage() {
  const { user, login, loading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // useEffect должен быть вне условных блоков
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Если пользователь уже авторизован, показываем сообщение
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Вы уже авторизованы</h2>
          <p className="text-gray-600 mb-4">Перенаправляем на главную страницу...</p>
        </div>
      </div>
    );
  }

  // Показываем загрузку пока проверяется авторизация
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }


  const handleTelegramOAuth = () => {
    // Telegram OAuth 2.0 - как у Fragment
    const botId = "8429934306"; // ID бота (только цифры)
    const baseUrl = 'https://3dfu5ii9t8is.share.zrok.io';
    
    const origin = encodeURIComponent(baseUrl);
    const redirectUri = encodeURIComponent(`${baseUrl}/auth/callback`);
    
    const oauthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&return_to=${redirectUri}`;
    
    // Перенаправляем в том же окне, как на Fragment
    window.location.href = oauthUrl;
  };

  const handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Вход в Retasker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Войдите через Telegram для безопасного доступа
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Войти через Telegram
            </h3>
            <p className="text-gray-600 mb-6">
              Безопасный вход через официальный Telegram OAuth 2.0
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleTelegramOAuth}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Войти через Telegram
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Безопасный вход через официальный Telegram OAuth 2.0
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Как сменить аккаунт?
                </h4>
                <p className="text-xs text-blue-700">
                  Для входа под другим аккаунтом:
                  <br />
                  • Выйдите из Telegram в браузере
                  <br />
                  • Или откройте сайт в режиме инкогнито
                  <br />
                  • Или используйте другой браузер
                </p>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleClearStorage}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Очистить данные браузера (для отладки)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}