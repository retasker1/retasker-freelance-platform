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
  const [telegramId, setTelegramId] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      setError("Введите Telegram ID");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(telegramId.trim());
    if (result.success) {
      // Перенаправляем на главную страницу
      window.location.href = "/";
    } else {
      setError(result.error || "Ошибка авторизации");
    }
    setIsLoading(false);
  };

  const openTelegramBot = () => {
    // Открываем бота в Telegram
    window.open("https://t.me/RetaskerRobot", "_blank");
  };

  const handleTelegramOAuth = () => {
    // Telegram OAuth 2.0 - как у Fragment
    const botId = "8429934306:AAFAUR6XQoN5vchfpES29-8YVYdiJbPNYRk"; // Замените на ID вашего бота из токена
    
            // Используем публичный домен для OAuth
        const baseUrl = 'https://3dfu5ii9t8is.share.zrok.io';
    
    const origin = encodeURIComponent(baseUrl);
    const redirectUri = encodeURIComponent(`${baseUrl}/auth/callback`);
    
    const oauthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&return_to=${redirectUri}`;
    
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в Retasker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Войдите через Telegram для доступа к платформе
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Войти через Telegram
            </h3>
            <p className="text-gray-600 mb-6">
              Для входа в систему используйте нашего Telegram бота
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleTelegramOAuth}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Войти через Telegram OAuth
              </button>
              
              <button
                onClick={openTelegramBot}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Открыть бота в Telegram
              </button>
            </div>
            
            <div className="border-t pt-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-4">
                  Если вы уже регистрировались ранее, нажмите кнопку ниже:
                </p>
                
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    setError("");
                    
                    // Пытаемся найти сохраненного пользователя
                    const savedUser = localStorage.getItem("retasker_user");
                    if (savedUser) {
                      try {
                        const userData = JSON.parse(savedUser);
                        // Проверяем, что пользователь все еще существует в базе
                        const response = await fetch("/api/auth/telegram_web", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ telegramId: userData.telegramId }),
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          if (data.success) {
                            // Обновляем данные пользователя
                            localStorage.setItem("retasker_user", JSON.stringify(data.user));
                            window.location.href = "/";
                            return;
                          }
                        }
                        
                        // Если проверка не удалась, удаляем старые данные
                        localStorage.removeItem("retasker_user");
                        setError("Сессия устарела. Войдите заново через бота.");
                      } catch (error) {
                        console.error("Session restore error:", error);
                        setError("Ошибка восстановления сессии");
                      }
                    } else {
                      setError("Сохраненная сессия не найдена. Сначала войдите в бота.");
                    }
                    
                    setIsLoading(false);
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isLoading ? "Проверка..." : "Быстрый вход"}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Или введите ваш Telegram ID вручную:
                </p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="text"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="Ваш Telegram ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? "Вход..." : "Войти по ID"}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>После входа в бота вы сможете:</p>
              <ul className="mt-2 text-left space-y-1">
                <li>• Создавать заказы</li>
                <li>• Просматривать отклики</li>
                <li>• Управлять сделками</li>
                <li>• Общаться с исполнителями</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}