import type { Route } from "./+types/orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Заказы — Retasker" },
    { name: "description", content: "Список заказов на бирже фриланса Retasker" },
  ];
}

export default function OrdersPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Заказы
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Список заказов</h2>
          <p className="text-gray-600 mb-4">
            Здесь будут отображаться заказы после входа через Telegram.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Для доступа к заказам:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Войдите через Telegram на главной странице</li>
              <li>Создавайте и управляйте заказами</li>
              <li>Получайте отклики от фрилансеров</li>
            </ol>
          </div>
          
          <div className="mt-6">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
