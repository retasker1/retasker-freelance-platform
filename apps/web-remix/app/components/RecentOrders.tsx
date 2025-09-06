import React from "react";
import { Link } from "react-router";

interface Order {
  id: string;
  shortCode: string;
  title: string;
  description: string;
  budgetCents: number;
  workType: string;
  category: string;
  priority: string;
  tags: string[];
  createdAt: string;
}

interface RecentOrdersProps {
  orders: Order[];
  showAllLink?: boolean;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ 
  orders, 
  showAllLink = true 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWorkTypeText = (workType: string) => {
    const types: { [key: string]: string } = {
      'FIXED': 'Фикс',
      'HOURLY': 'Почасовая',
      'MILESTONE': 'По этапам'
    };
    return types[workType] || workType;
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'WEB_DEVELOPMENT': 'Веб-разработка',
      'MOBILE_DEVELOPMENT': 'Мобильная разработка',
      'DESIGN': 'Дизайн',
      'TRANSLATION': 'Переводы',
      'WRITING': 'Копирайтинг',
      'MARKETING': 'Маркетинг',
      'OTHER': 'Другое'
    };
    return categories[category] || category;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Последние заказы
        </h3>
        {showAllLink && (
          <Link
            to="/orders"
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            Все заказы
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Пока нет заказов
          </h4>
          <p className="text-gray-600 mb-6">
            Станьте первым, кто создаст заказ на платформе!
          </p>
          <Link
            to="/orders/new"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать заказ
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-4 sm:p-6"
            >
              {/* Заголовок и цена - адаптивная версия */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {order.shortCode}
                    </span>
                    {order.priority === 'URGENT' && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        🔥 Срочно
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 break-words">
                    {order.title || 'Без названия'}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-3 break-words text-sm sm:text-base">
                    {order.description || 'Описание не указано'}
                  </p>
                </div>
                <div className="flex justify-between sm:block sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    ${order.budgetCents ? (order.budgetCents / 100).toFixed(0) : '0'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {getWorkTypeText(order.workType)}
                  </div>
                </div>
              </div>

              {/* Статусы и категории - адаптивная версия */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Открыт
                  </span>
                  
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {getCategoryLabel(order.category)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : 'Дата не указана'}
                </div>
              </div>

              {/* Теги */}
              {order.tags && Array.isArray(order.tags) && order.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {order.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 max-w-full truncate">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий - адаптивная версия */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <Link 
                  to={`/orders?view=${order.id}`}
                  className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium text-center border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
