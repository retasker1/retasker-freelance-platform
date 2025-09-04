import { useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";

interface UserStatsData {
  orders: {
    total: number;
    active: number;
    completed: number;
  };
  deals: {
    total: number;
    active: number;
    completed: number;
  };
  finances: {
    totalSpent: number;
    totalEarned: number;
    netProfit: number;
  };
}

export function UserStats() {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users.stats?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Статистика
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Статистика
        </h2>
        <p className="text-gray-500">Не удалось загрузить статистику</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Статистика
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Заказы */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Заказы</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Всего:</span>
              <span className="text-sm font-medium">{stats.orders.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Активные:</span>
              <span className="text-sm font-medium text-blue-600">{stats.orders.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Завершенные:</span>
              <span className="text-sm font-medium text-green-600">{stats.orders.completed}</span>
            </div>
          </div>
        </div>

        {/* Сделки */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Сделки</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Всего:</span>
              <span className="text-sm font-medium">{stats.deals.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Активные:</span>
              <span className="text-sm font-medium text-blue-600">{stats.deals.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Завершенные:</span>
              <span className="text-sm font-medium text-green-600">{stats.deals.completed}</span>
            </div>
          </div>
        </div>

        {/* Финансы */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Финансы</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Потрачено:</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(stats.finances.totalSpent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Заработано:</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(stats.finances.totalEarned)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-sm font-medium text-gray-900">Итого:</span>
              <span className={`text-sm font-bold ${
                stats.finances.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(stats.finances.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
