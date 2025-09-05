import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/orderDetail";
import { useUser } from "../hooks/useUser";

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
  const apiUrl = new URL(`/api/orders/${orderId}`, url.origin);
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

export default function OrderDetailPage() {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {order.title}
              </h1>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {order.description}
              </p>
            </div>
            
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${(order.budgetCents / 100).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}