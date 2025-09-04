import { Link } from "react-router";
import type { Route } from "./+types/me";
import { useUser } from "../hooks/useUser";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { UserStats } from "../components/UserStats";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Личный кабинет — Retasker" },
    { name: "description", content: "Личный кабинет пользователя Retasker" },
  ];
}

export default function ProfilePage() {
  const { user, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Требуется авторизация
            </h1>
            <p className="text-gray-600 mb-6">
              Для доступа к личному кабинету необходимо войти через Telegram
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Войти через Telegram
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Личный кабинет
          </h1>
          <div className="flex space-x-3">
            <Link
              to="/orders/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать заказ
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Информация о профиле
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Редактировать
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Фото профиля"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName || ""}
              </h3>
              <p className="text-gray-600">
                {user.username ? `@${user.username}` : `ID: ${user.telegramId}`}
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? "Активен" : "Неактивен"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Дата регистрации</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telegram ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {user.telegramId}
              </p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <UserStats />

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link
            to="/orders"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Мои заказы</h3>
            <p className="text-gray-600">Просмотр и управление заказами</p>
          </Link>

          <Link
            to="/deals"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Мои сделки</h3>
            <p className="text-gray-600">Активные и завершенные сделки</p>
          </Link>
        </div>

        {/* Модальное окно редактирования */}
        {isEditing && (
          <ProfileEditForm onClose={() => setIsEditing(false)} />
        )}
      </div>
    </div>
  );
}
