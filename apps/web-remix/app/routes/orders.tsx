import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Заказы — Retasker" },
    { name: "description", content: "Список заказов на бирже фриланса Retasker" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const search = url.searchParams.get("search") || "";

  const response = await fetch(`/api/orders?${new URLSearchParams({ status, search })}`);
  if (!response.ok) {
    throw new Response("Failed to load orders", { status: response.status });
  }
  
  return response.json();
}

export default function OrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Заказы
          </h1>
          <Link
            to="/orders/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Создать заказ
          </Link>
        </div>

        {/* Фильтры */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex gap-4">
            <select className="border border-gray-300 rounded-md px-3 py-2">
              <option value="">Все статусы</option>
              <option value="OPEN">Открытые</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="COMPLETED">Завершенные</option>
            </select>
            <input
              type="text"
              placeholder="Поиск заказов..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Список заказов */}
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{order.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${(order.budgetCents / 100).toFixed(0)}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'OPEN' ? 'Открыт' :
                     order.status === 'IN_PROGRESS' ? 'В работе' : 'Завершен'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span className="font-medium">Категория:</span> {order.category}
                </div>
                <div>
                  <span className="font-medium">Дедлайн:</span> {order.deadline || 'Не указан'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Заказы не найдены</p>
            <Link
              to="/orders/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Создать первый заказ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
