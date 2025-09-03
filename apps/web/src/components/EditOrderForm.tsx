'use client';

import { useState } from 'react';
import { z } from 'zod';

// Схема валидации для редактирования заказа
const editOrderSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов').max(2000, 'Описание слишком длинное'),
  budgetCents: z.number().int().min(1000, 'Минимальный бюджет 10 рублей').max(10000000, 'Максимальный бюджет 100,000 рублей'),
  status: z.enum(['OPEN', 'IN_DEAL', 'CLOSED']),
});

type EditOrderData = z.infer<typeof editOrderSchema>;

interface Order {
  id: string;
  title: string;
  description: string;
  budgetCents: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EditOrderFormProps {
  order: Order;
  onSubmit: (data: EditOrderData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}



const statusOptions = [
  { value: 'OPEN', label: 'Открыт' },
  { value: 'IN_DEAL', label: 'В сделке' },
  { value: 'CLOSED', label: 'Закрыт' },
];

export default function EditOrderForm({ order, onSubmit, onCancel, isLoading = false }: EditOrderFormProps) {
  const [formData, setFormData] = useState<EditOrderData>({
    title: order.title,
    description: order.description,
    budgetCents: order.budgetCents,
    status: order.status as 'OPEN' | 'IN_DEAL' | 'CLOSED',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditOrderData, string>>>({});

  const handleInputChange = (field: keyof EditOrderData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Валидация данных
      const validatedData = editOrderSchema.parse(formData);
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof EditOrderData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof EditOrderData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Редактировать заказ</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Название заказа */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Название заказа *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Краткое описание задачи"
            maxLength={100}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Описание задачи *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Подробно опишите задачу, требования и ожидаемый результат..."
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
            <p className="text-sm text-gray-400 ml-auto">
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        {/* Бюджет, категория и статус в одной строке */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Бюджет */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
              Бюджет (руб.) *
            </label>
            <input
              type="number"
              id="budget"
              value={formData.budgetCents / 100}
              onChange={(e) => handleInputChange('budgetCents', Math.round(parseFloat(e.target.value || '0') * 100))}
              min="10"
              max="100000"
              step="10"
              className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.budgetCents ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="1000"
            />
            {errors.budgetCents && (
              <p className="mt-1 text-sm text-red-400">{errors.budgetCents}</p>
            )}
          </div>



          {/* Статус */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Статус *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as string)}
              className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-400">{errors.status}</p>
            )}
          </div>
        </div>



        {/* Информация о заказе */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Информация о заказе</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <span className="font-medium">ID:</span> {order.id}
            </div>
            <div>
              <span className="font-medium">Создан:</span> {new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </div>
            <div>
              <span className="font-medium">Обновлен:</span> {new Date(order.updatedAt).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            disabled={isLoading}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
}
