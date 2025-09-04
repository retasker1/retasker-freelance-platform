import { useLoaderData, Link, useSearchParams } from "react-router";
import type { Route } from "./+types/orders";
import { useUser } from "../hooks/useUser";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Заказы — Retasker" },
    { name: "description", content: "Список заказов на бирже фриланса Retasker" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Проверяем авторизацию через заголовки
  const authHeader = request.headers.get("Authorization");
  const cookieHeader = request.headers.get("Cookie");
  
  // Если нет авторизации, перенаправляем на страницу входа
  if (!authHeader && !cookieHeader) {
    throw new Response("Unauthorized", { 
      status: 401,
      headers: {
        "Location": "/login"
      }
    });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const priority = url.searchParams.get("priority") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const viewMode = url.searchParams.get("viewMode") || "all"; // "all" или "my"
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  // Получаем userId из localStorage через клиентскую сторону
  // Это временное решение, в продакшене нужно передавать через заголовки
  let userId = null;
  
  // Для фильтрации "Мои заказы" нужно передать userId
  // Пока что будем получать его из URL параметра или использовать заглушку
  const urlUserId = url.searchParams.get("userId");
  if (urlUserId) {
    userId = urlUserId;
  }

  // Используем полный URL для fetch
  const apiUrl = new URL("/api/orders", url.origin);
  apiUrl.searchParams.set("status", status);
  apiUrl.searchParams.set("search", search);
  apiUrl.searchParams.set("category", category);
  apiUrl.searchParams.set("priority", priority);
  apiUrl.searchParams.set("sortBy", sortBy);
  apiUrl.searchParams.set("sortOrder", sortOrder);
  apiUrl.searchParams.set("viewMode", viewMode);
  apiUrl.searchParams.set("page", page.toString());
  apiUrl.searchParams.set("limit", limit.toString());
  if (userId) {
    apiUrl.searchParams.set("userId", userId);
  }

  const response = await fetch(apiUrl.toString());
  if (!response.ok) {
    throw new Response("Failed to load orders", { status: response.status });
  }
  
  const data = await response.json();
  
  // Отладочная информация
  console.log("Orders loader:", {
    viewMode,
    userId,
    ordersCount: data.orders?.length || 0,
    filters: { status, search, category, priority, sortBy, sortOrder, viewMode, page, limit }
  });
  
  return { 
    ...data, 
    filters: { status, search, category, priority, sortBy, sortOrder, viewMode, page, limit }
  };
}

export default function OrdersPage() {
  const { orders, filters, pagination } = useLoaderData<typeof loader>();
  const { user, loading } = useUser();

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем сообщение
  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Требуется авторизация
            </h3>
            <p className="text-gray-600 mb-6">
              Для просмотра заказов необходимо войти в систему
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Войти в систему
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Заказы
            </h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.firstName}!
              </p>
            )}
          </div>
          <Link
            to="/orders/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать заказ
          </Link>
        </div>

        {/* Переключатель режима просмотра */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filters.viewMode === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("viewMode", "all");
                  // Убираем userId для показа всех заказов
                  url.searchParams.delete("userId");
                  window.location.href = url.toString();
                }}
              >
                Все заказы
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filters.viewMode === "my"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("viewMode", "my");
                  // Добавляем userId для фильтрации "Мои заказы"
                  if (user?.id) {
                    url.searchParams.set("userId", user.id);
                  }
                  window.location.href = url.toString();
                }}
              >
                Мои заказы
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {filters.viewMode === "all" 
                ? "Показаны все заказы" 
                : `Показаны только ваши заказы (${user?.firstName || 'Пользователь'})`
              }
            </div>
          </div>

          {/* Фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("status", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="">Все статусы</option>
                <option value="OPEN">Открытые</option>
                <option value="IN_PROGRESS">В работе</option>
                <option value="COMPLETED">Завершенные</option>
                <option value="CANCELLED">Отмененные</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={filters.category}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("category", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="">Все категории</option>
                <option value="web">Веб-разработка</option>
                <option value="mobile">Мобильная разработка</option>
                <option value="design">Дизайн</option>
                <option value="marketing">Маркетинг</option>
                <option value="writing">Копирайтинг</option>
                <option value="ai">ИИ и машинное обучение</option>
                <option value="blockchain">Блокчейн</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={filters.priority}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("priority", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="">Все приоритеты</option>
                <option value="URGENT">Срочные</option>
                <option value="MEDIUM">Обычные</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сортировка</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  const url = new URL(window.location.href);
                  url.searchParams.set("sortBy", sortBy);
                  url.searchParams.set("sortOrder", sortOrder);
                  window.location.href = url.toString();
                }}
              >
                <option value="createdAt-desc">Новые сначала</option>
                <option value="createdAt-asc">Старые сначала</option>
                <option value="budgetCents-desc">Дорогие сначала</option>
                <option value="budgetCents-asc">Дешевые сначала</option>
                <option value="title-asc">По названию А-Я</option>
                <option value="title-desc">По названию Я-А</option>
              </select>
            </div>
          </div>

          {/* Поиск */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Поиск по названию или описанию..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={filters.search}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("search", e.target.value);
                  // Добавляем задержку для поиска
                  clearTimeout((window as any).searchTimeout);
                  (window as any).searchTimeout = setTimeout(() => {
                    window.location.href = url.toString();
                  }, 500);
                }}
              />
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("search");
                  window.location.href = url.toString();
                }}
              >
                Очистить
              </button>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.title}
                    </h3>
                    {order.priority === 'URGENT' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        🔥 Срочно
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{order.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-green-600">
                    ${(order.budgetCents / 100).toFixed(0)}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'OPEN' ? 'Открыт' :
                     order.status === 'IN_PROGRESS' ? 'В работе' :
                     order.status === 'COMPLETED' ? 'Завершен' : 'Отменен'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">Категория:</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {order.category === 'web' ? 'Веб-разработка' :
                       order.category === 'mobile' ? 'Мобильная разработка' :
                       order.category === 'design' ? 'Дизайн' :
                       order.category === 'marketing' ? 'Маркетинг' :
                       order.category === 'writing' ? 'Копирайтинг' :
                       order.category === 'ai' ? 'ИИ и машинное обучение' :
                       order.category === 'blockchain' ? 'Блокчейн' : 'Другое'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Дедлайн:</span>
                  <div className="mt-1">
                    {order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Тип работы:</span>
                  <div className="mt-1">
                    {order.workType === 'FIXED' ? 'Фиксированная цена' :
                     order.workType === 'HOURLY' ? 'Почасовая оплата' : 'По этапам'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Создан:</span>
                  <div className="mt-1">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>

              {/* Теги */}
              {order.tags && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700 text-sm">Теги:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {JSON.parse(order.tags).map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Подробнее
                </button>
                {order.status === 'OPEN' && (
                  <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">
                    Откликнуться
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white shadow rounded-lg p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} из {pagination.totalCount} заказов
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", (pagination.page - 1).toString());
                    window.location.href = url.toString();
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                
                {/* Номера страниц */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.searchParams.set("page", pageNum.toString());
                          window.location.href = url.toString();
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === pagination.page
                            ? "bg-indigo-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", (pagination.page + 1).toString());
                    window.location.href = url.toString();
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 && (
                   <div className="bg-white shadow rounded-lg p-6 text-center">
                     <div className="text-6xl mb-4">📋</div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                       Заказы не найдены
                     </h3>
                     <p className="text-gray-600 mb-6">
                       Создайте свой первый заказ и начните получать отклики от исполнителей
                     </p>
                     <Link
                       to="/orders/new"
                       className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                     >
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                       </svg>
                       Создать первый заказ
                     </Link>
                   </div>
                 )}
      </div>
    </div>
  );
}
