import { useLoaderData, Link, useSearchParams } from "react-router";
import type { Route } from "./+types/orders";
import { useUser } from "../hooks/useUser";
import { useState } from "react";
import { DealResponseForm } from "../components/DealResponseForm";

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
  const view = url.searchParams.get("view"); // ID заказа для просмотра
  const status = url.searchParams.get("status") || "";
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const priority = url.searchParams.get("priority") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const viewMode = url.searchParams.get("viewMode") || "all"; // "all" или "my"
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  // Если запрашивается просмотр конкретного заказа
  if (view) {
    try {
      const { prisma } = await import("../lib/prisma");
      const order = await prisma.order.findUnique({
        where: { id: view },
        select: {
          id: true,
          shortCode: true,
          title: true,
          description: true,
          budgetCents: true,
          status: true,
          category: true,
          priority: true,
          workType: true,
          tags: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
          customerId: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              photoUrl: true,
            },
          },
          deals: {
            include: {
              freelancer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  photoUrl: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Response("Order not found", { status: 404 });
      }

      return { 
        order, 
        isOrderView: true,
        filters: { status, search, category, priority, sortBy, sortOrder, viewMode, page, limit }
      };
    } catch (error) {
      console.error("Failed to load order:", error);
      throw new Response("Internal server error", { status: 500 });
    }
  }

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
    isOrderView: false,
    filters: { status, search, category, priority, sortBy, sortOrder, viewMode, page, limit }
  };
}

export default function OrdersPage() {
  const data = useLoaderData<typeof loader>();
  const { user, loading } = useUser();
  const [showDealForm, setShowDealForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleDealResponse = (order: any) => {
    setSelectedOrder(order);
    setShowDealForm(true);
  };

  const handleDealSuccess = () => {
    setShowDealForm(false);
    setSelectedOrder(null);
    // Перезагружаем страницу для обновления данных
    window.location.reload();
  };

  const handleDealCancel = () => {
    setShowDealForm(false);
    setSelectedOrder(null);
  };

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

  // Если это просмотр конкретного заказа
  if (data.isOrderView && data.order) {
    const order = data.order;
    const isOwner = user.id === order.customerId;
    const canRespond = !isOwner && order.status === 'OPEN';

    return (
      <>
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-4xl mx-auto">
            {/* Навигация */}
            <div className="mb-6">
              <Link 
                to="/orders" 
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к списку заказов
              </Link>
            </div>

          {/* Основная информация о заказе */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900 truncate">
                    {order.title || 'Без названия'}
                  </h1>
                  {order.priority === 'URGENT' && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 flex-shrink-0">
                      🔥 Срочно
                    </span>
                  )}
                  {order.priority === 'HIGH' && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800 flex-shrink-0">
                      ⚡ Высокий
                    </span>
                  )}
                  {order.priority === 'LOW' && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                      📋 Низкий
                    </span>
                  )}
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full flex-shrink-0 ${
                    order.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'OPEN' ? 'Открыт' :
                     order.status === 'IN_PROGRESS' ? 'В работе' :
                     order.status === 'COMPLETED' ? 'Завершен' : 
                     order.status === 'CANCELLED' ? 'Отменен' : 'Неизвестно'}
                  </span>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6 break-words">
                  {order.description || 'Описание не указано'}
                </p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${order.budgetCents ? (order.budgetCents / 100).toFixed(0) : '0'}
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {order.workType === 'FIXED' ? 'Фиксированная цена' :
                   order.workType === 'HOURLY' ? 'Почасовая оплата' : 
                   order.workType === 'MILESTONE' ? 'По этапам' : 'Не указано'}
                </div>
              </div>
            </div>

            {/* Детальная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Категория</h3>
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 max-w-full truncate">
                  {order.category === 'web' ? 'Веб-разработка' :
                   order.category === 'mobile' ? 'Мобильная разработка' :
                   order.category === 'design' ? 'Дизайн' :
                   order.category === 'marketing' ? 'Маркетинг' :
                   order.category === 'writing' ? 'Копирайтинг' :
                   order.category === 'ai' ? 'ИИ и машинное обучение' :
                   order.category === 'blockchain' ? 'Блокчейн' : 
                   order.category || 'Другое'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Дедлайн</h3>
                <p className="text-sm text-gray-900 break-words">
                  {order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Создан</h3>
                <p className="text-sm text-gray-900 break-words">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : 'Дата не указана'}
                </p>
              </div>
            </div>

            {/* Теги */}
            {order.tags && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Теги</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const tags = JSON.parse(order.tags);
                      return tags.map((tag: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 max-w-full truncate">
                          {tag}
                        </span>
                      ));
                    } catch (error) {
                      console.error("Error parsing tags:", error);
                      return null;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Информация о заказчике */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Заказчик</h3>
              <div className="flex items-center">
                {order.customer?.photoUrl && (
                  <img 
                    src={order.customer.photoUrl} 
                    alt={order.customer?.firstName || 'Пользователь'}
                    className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.customer?.firstName || 'Неизвестно'} {order.customer?.lastName || ''}
                  </p>
                  {order.customer?.username && (
                    <p className="text-sm text-gray-500 truncate">@{order.customer.username}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                {isOwner ? (
                  <div className="flex space-x-3 flex-wrap">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium whitespace-nowrap">
                      Редактировать заказ
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium whitespace-nowrap">
                      Удалить заказ
                    </button>
                  </div>
                ) : canRespond ? (
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDealForm(true);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium whitespace-nowrap"
                  >
                    Откликнуться на заказ
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm break-words">
                    {order.status !== 'OPEN' ? 'Заказ закрыт для откликов' : 'Вы не можете откликнуться на свой заказ'}
                  </p>
                )}
              </div>
              
              <div className="text-sm text-gray-500 whitespace-nowrap">
                ID заказа: {order.shortCode || order.id || 'Неизвестно'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Форма отклика для детального просмотра */}
      {showDealForm && selectedOrder && (
        <DealResponseForm
          orderId={selectedOrder.id || ''}
          orderTitle={selectedOrder.title || 'Без названия'}
          orderBudget={selectedOrder.budgetCents ? selectedOrder.budgetCents / 100 : 0}
          onSuccess={handleDealSuccess}
          onCancel={handleDealCancel}
        />
      )}
    </>
    );
  }

  // Обычный список заказов
  const { orders, filters, pagination } = data;

  return (
    <>
      {/* Основной контент списка заказов */}
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Заказы
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Найдите подходящий заказ или создайте свой
              </p>
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

          {/* Фильтры и поиск */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Поиск
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Название заказа..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Все приоритеты</option>
                  <option value="URGENT">Срочно</option>
                  <option value="MEDIUM">Обычный</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Все статусы</option>
                  <option value="OPEN">Открыт</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="COMPLETED">Завершен</option>
                  <option value="CANCELLED">Отменен</option>
                </select>
              </div>
            </div>
          </div>

          {/* Список заказов */}
          <div className="space-y-6">
            {orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <div key={order.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {order.title || 'Без названия'}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 break-words">
                        {order.description || 'Описание не указано'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${order.budgetCents ? (order.budgetCents / 100).toFixed(0) : '0'}
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        {order.workType === 'FIXED' ? 'Фиксированная цена' :
                         order.workType === 'HOURLY' ? 'Почасовая оплата' : 
                         order.workType === 'MILESTONE' ? 'По этапам' : 'Не указано'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'OPEN' ? 'Открыт' :
                         order.status === 'IN_PROGRESS' ? 'В работе' :
                         order.status === 'COMPLETED' ? 'Завершен' : 
                         order.status === 'CANCELLED' ? 'Отменен' : 'Неизвестно'}
                      </span>
                      
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {order.category === 'web' ? 'Веб-разработка' :
                         order.category === 'mobile' ? 'Мобильная разработка' :
                         order.category === 'design' ? 'Дизайн' :
                         order.category === 'marketing' ? 'Маркетинг' :
                         order.category === 'writing' ? 'Копирайтинг' :
                         order.category === 'ai' ? 'ИИ и машинное обучение' :
                         order.category === 'blockchain' ? 'Блокчейн' : 
                         order.category || 'Другое'}
                      </span>

                      {order.priority === 'URGENT' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          🔥 Срочно
                        </span>
                      )}
                      {order.priority === 'HIGH' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          ⚡ Высокий
                        </span>
                      )}
                      {order.priority === 'LOW' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          📋 Низкий
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : 'Дата не указана'}
                    </div>
                  </div>

                  {/* Теги */}
                  {order.tags && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const tags = JSON.parse(order.tags);
                            return tags.map((tag: string, index: number) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 max-w-full truncate">
                                {tag}
                              </span>
                            ));
                          } catch (error) {
                            console.error("Error parsing tags:", error);
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                    <Link 
                      to={`/orders?view=${order.id}`}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                    >
                      Подробнее
                    </Link>
                    {order.status === 'OPEN' && user && user.id !== order.customerId && (
                      <button 
                        onClick={() => handleDealResponse(order)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium whitespace-nowrap"
                      >
                        Откликнуться
                      </button>
                    )}
                    {order.status === 'OPEN' && user && user.id === order.customerId && (
                      <span className="px-3 py-1 text-sm text-gray-500 font-medium whitespace-nowrap">
                        Ваш заказ
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Заказы не найдены
                </h3>
                <p className="text-gray-500 mb-6">
                  Попробуйте изменить фильтры или создать новый заказ
                </p>
                <Link
                  to="/orders/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Создать заказ
                </Link>
              </div>
            )}
          </div>

          {/* Пагинация */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    to={`/orders?page=${page}`}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Форма отклика */}
      {showDealForm && selectedOrder && (
        <DealResponseForm
          orderId={selectedOrder.id || ''}
          orderTitle={selectedOrder.title || 'Без названия'}
          orderBudget={selectedOrder.budgetCents ? selectedOrder.budgetCents / 100 : 0}
          onSuccess={handleDealSuccess}
          onCancel={handleDealCancel}
        />
      )}
    </>
  );
}