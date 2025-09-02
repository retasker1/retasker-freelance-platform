'use client';

import { useState, useEffect } from 'react';
import { Order } from '../../lib/api';
import OrdersList from '../../components/OrdersList';
import CreateOrderForm from '../../components/CreateOrderForm';
import EditOrderForm from '../../components/EditOrderForm';
import OrderPreview from '../../components/OrderPreview';

type ViewMode = 'list' | 'create' | 'preview' | 'edit' | 'view';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка заказов
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Ошибка загрузки заказов');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Обработка данных формы (переход к предварительному просмотру)
  const handleFormSubmit = (orderData: any) => {
    setPreviewData(orderData);
    setViewMode('preview');
  };

  // Создание заказа (после подтверждения)
  const handleCreateOrder = async () => {
    if (!previewData) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...previewData,
          customerId: 'temp-user-id', // Временно используем тестового пользователя
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания заказа');
      }

      const newOrder = await response.json();
      setOrders(prev => [newOrder, ...prev]);
      setViewMode('list');
      setPreviewData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование заказа
  const handleEditOrder = async (orderData: any) => {
    if (!currentOrder) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${currentOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления заказа');
      }

      const updatedOrder = await response.json();
      setOrders(prev => prev.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      ));
      setViewMode('list');
      setCurrentOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление заказа
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления заказа');
      }

      setOrders(prev => prev.filter(order => order.id !== orderId));
      setViewMode('list');
      setCurrentOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики навигации
  const handleOrderClick = (order: Order) => {
    setCurrentOrder(order);
    setViewMode('view');
  };

  const handleCreateClick = () => {
    setCurrentOrder(null);
    setViewMode('create');
  };

  const handleEditClick = (order: Order) => {
    setCurrentOrder(order);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentOrder(null);
    setPreviewData(null);
    setError(null);
  };

  const handleBackToForm = () => {
    setViewMode('create');
  };

  // Отображение ошибок
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-400 mb-4">Ошибка</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchOrders();
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Рендеринг в зависимости от режима просмотра
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'list' && (
          <OrdersList
            orders={orders}
            onOrderClick={handleOrderClick}
            onCreateOrder={handleCreateClick}
            onEditOrder={handleEditClick}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'create' && (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-6 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              ← Назад к списку
            </button>
            <CreateOrderForm
              onSubmit={handleFormSubmit}
              onCancel={handleBackToList}
              isLoading={isLoading}
            />
          </div>
        )}

        {viewMode === 'preview' && previewData && (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-6 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              ← Назад к списку
            </button>
            <OrderPreview
              orderData={previewData}
              onEdit={handleBackToForm}
              onConfirm={handleCreateOrder}
              onCancel={handleBackToList}
              isLoading={isLoading}
            />
          </div>
        )}

        {viewMode === 'edit' && currentOrder && (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-6 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              ← Назад к списку
            </button>
            <EditOrderForm
              order={currentOrder}
              onSubmit={handleEditOrder}
              onCancel={handleBackToList}
              isLoading={isLoading}
            />
          </div>
        )}

        {viewMode === 'view' && currentOrder && (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-6 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              ← Назад к списку
            </button>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{currentOrder.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>ID: {currentOrder.id}</span>
                    <span>Создан: {new Date(currentOrder.createdAt).toLocaleDateString('ru-RU')}</span>
                    <span>Обновлен: {new Date(currentOrder.updatedAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(currentOrder)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(currentOrder.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Описание</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{currentOrder.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Детали заказа</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Бюджет:</span>
                                                 <span className="text-white font-medium">
                           {(currentOrder.budgetCents / 100).toLocaleString('en-US', {
                             style: 'currency',
                             currency: 'USD',
                             minimumFractionDigits: 0,
                           })}
                         </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Категория:</span>
                        <span className="text-white">{currentOrder.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Срок выполнения:</span>
                        <span className="text-white">{new Date(currentOrder.deadline).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Статус:</span>
                        <span className="text-white">{currentOrder.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
