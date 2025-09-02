'use client';

import { useState, useEffect } from 'react';
import { Order } from '../lib/api';

interface OrdersListProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onCreateOrder: () => void;
  onEditOrder: (order: Order) => void;
  isLoading?: boolean;
}

export default function OrdersList({ 
  orders, 
  onOrderClick, 
  onCreateOrder, 
  onEditOrder, 
  isLoading = false 
}: OrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const categories = [
    { value: '', label: 'Все категории' },
    { value: 'web-development', label: 'Веб-разработка' },
    { value: 'mobile-development', label: 'Мобильная разработка' },
    { value: 'design', label: 'Дизайн' },
    { value: 'writing', label: 'Копирайтинг' },
    { value: 'translation', label: 'Переводы' },
    { value: 'marketing', label: 'Маркетинг' },
    { value: 'other', label: 'Другое' },
  ];

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'open', label: 'Открыт' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершен' },
    { value: 'cancelled', label: 'Отменен' },
  ];

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || order.category === selectedCategory;
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Заказы</h1>
          <p className="text-gray-400 mt-1">
            Найдено заказов: {filteredOrders.length} из {orders.length}
          </p>
        </div>
        <button
          onClick={onCreateOrder}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Создать заказ
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
              Поиск
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Поиск по названию или описанию..."
            />
          </div>

          {/* Категория */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Категория
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Статус */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Статус
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Список заказов */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {orders.length === 0 ? 'Заказы не найдены' : 'Заказы не найдены по заданным фильтрам'}
          </div>
          {orders.length === 0 && (
            <button
              onClick={onCreateOrder}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Создать первый заказ
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors cursor-pointer"
              onClick={() => onOrderClick(order)}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{order.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-3 line-clamp-2">
                    {order.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                         <span className="flex items-center gap-1">
                       <span className="font-medium">Бюджет:</span>
                       {(order.budgetCents / 100).toLocaleString('en-US', {
                         style: 'currency',
                         currency: 'USD',
                         minimumFractionDigits: 0,
                       })}
                     </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Категория:</span>
                      {getCategoryText(order.category)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Срок:</span>
                      {new Date(order.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditOrder(order);
                    }}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
