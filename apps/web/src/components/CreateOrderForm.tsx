'use client';

import { useState } from 'react';
import { z } from 'zod';

// Схема валидации для создания заказа
const createOrderSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов').max(2000, 'Описание слишком длинное'),
  budgetCents: z.number().int().min(1000, 'Минимальный бюджет 10 рублей').max(10000000, 'Максимальный бюджет 100,000 рублей'),
  category: z.string().min(1, 'Выберите категорию'),
  deadline: z.string().min(1, 'Укажите срок выполнения'),
});

type CreateOrderData = z.infer<typeof createOrderSchema>;

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  { value: 'web-development', label: 'Веб-разработка' },
  { value: 'mobile-development', label: 'Мобильная разработка' },
  { value: 'design', label: 'Дизайн' },
  { value: 'writing', label: 'Копирайтинг' },
  { value: 'translation', label: 'Переводы' },
  { value: 'marketing', label: 'Маркетинг' },
  { value: 'other', label: 'Другое' },
];

export default function CreateOrderForm({ onSubmit, onCancel, isLoading = false }: CreateOrderFormProps) {
  const [formData, setFormData] = useState<CreateOrderData>({
    title: '',
    description: '',
    budgetCents: 0,
    category: '',
    deadline: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOrderData, string>>>({});

  const handleInputChange = (field: keyof CreateOrderData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Валидация данных
      const validatedData = createOrderSchema.parse(formData);
      onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CreateOrderData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CreateOrderData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const formatBudget = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Создать заказ</h2>
      
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

        {/* Бюджет и категория в одной строке */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Бюджет */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
              Бюджет (USD) *
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
              placeholder="100"
            />
            {errors.budgetCents && (
              <p className="mt-1 text-sm text-red-400">{errors.budgetCents}</p>
            )}
          </div>

          {/* Категория */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Категория *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Выберите категорию</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Срок выполнения */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
            Срок выполнения *
          </label>
          <input
            type="date"
            id="deadline"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.deadline ? 'border-red-500' : 'border-slate-600'
            }`}
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-400">{errors.deadline}</p>
          )}
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
            {isLoading ? 'Создание...' : 'Создать заказ'}
          </button>
        </div>
      </form>
    </div>
  );
}
