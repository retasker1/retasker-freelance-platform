import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/show";
import { useUser } from "../../hooks/useUser";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Детали заказа — Retasker" },
    { name: "description", content: "Подробная информация о заказе на бирже фриланса Retasker" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Получаем ID заказа из URL
  const url = new URL(request.url);
  const orderId = url.searchParams.get("id");
  
  if (!orderId) {
    throw new Response("Order ID is required", { status: 400 });
  }

  // Получаем заказ с полной информацией
  const apiUrl = new URL(`/api/orders/detail?id=${orderId}`, url.origin);
  const response = await fetch(apiUrl.toString());
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Response("Заказ не найден", { status: 404 });
    }
    throw new Response("Failed to load order", { status: response.status });
  }
  
  const order = await response.json();
  
  return { order };
}

export default function OrderShowPage() {
  const { order } = useLoaderData<typeof loader>();
  const { user, loading } = useUser();

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
              Для просмотра заказа необходимо войти в систему
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

  const isOwner = user.id === order.customerId;
  const canRespond = !isOwner && order.status === 'OPEN';

  return (
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {order.title}
                </h1>
                {order.priority === 'URGENT' && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    🔥 Срочно
                  </span>
                )}
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
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
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {order.description}
              </p>
            </div>
            
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${(order.budgetCents / 100).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">
                {order.workType === 'FIXED' ? 'Фиксированная цена' :
                 order.workType === 'HOURLY' ? 'Почасовая оплата' : 'По этапам'}
              </div>
            </div>
          </div>

          {/* Детальная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Категория</h3>
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                {order.category === 'web' ? 'Веб-разработка' :
                 order.category === 'mobile' ? 'Мобильная разработка' :
                 order.category === 'design' ? 'Дизайн' :
                 order.category === 'marketing' ? 'Маркетинг' :
                 order.category === 'writing' ? 'Копирайтинг' :
                 order.category === 'ai' ? 'ИИ и машинное обучение' :
                 order.category === 'blockchain' ? 'Блокчейн' : 'Другое'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Дедлайн</h3>
              <p className="text-sm text-gray-900">
                {order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Создан</h3>
              <p className="text-sm text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          {/* Теги */}
          {order.tags && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(order.tags).map((tag: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Информация о заказчике */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Заказчик</h3>
            <div className="flex items-center">
              {order.customer.photoUrl && (
                <img 
                  src={order.customer.photoUrl} 
                  alt={order.customer.firstName}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {order.customer.firstName} {order.customer.lastName || ''}
                </p>
                {order.customer.username && (
                  <p className="text-sm text-gray-500">@{order.customer.username}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              {isOwner ? (
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                    Редактировать заказ
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
                    Удалить заказ
                  </button>
                </div>
              ) : canRespond ? (
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                  Откликнуться на заказ
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  {order.status !== 'OPEN' ? 'Заказ закрыт для откликов' : 'Вы не можете откликнуться на свой заказ'}
                </p>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              ID заказа: {order.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

