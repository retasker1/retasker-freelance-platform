import React, { useState, useEffect } from 'react';
import { categories, tagsByCategory, getTagsByCategory } from '../utils/tagsConfig';

interface OrderEditFormProps {
  order: {
    id: string;
    title: string;
    description: string;
    budgetCents: number;
    category: string;
    priority: string;
    workType: string;
    tags: string;
    deadline: string;
  };
  onSave: (updatedOrder: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function OrderEditForm({ order, onSave, onCancel, isSubmitting = false }: OrderEditFormProps) {
  const [formData, setFormData] = useState({
    title: order.title || '',
    description: order.description || '',
    budget: order.budgetCents ? (order.budgetCents / 100).toString() : '',
    category: order.category || '',
    isUrgent: order.priority === 'URGENT',
    workType: order.workType || 'FIXED',
    tags: order.tags ? (() => {
      try {
        return JSON.parse(order.tags);
      } catch {
        return order.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    })() : [],
    deadline: order.deadline ? new Date(order.deadline).toISOString().split('T')[0] : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const workTypes = [
    { value: "FIXED", label: "Фиксированная цена" },
    { value: "HOURLY", label: "Почасовая оплата" },
    { value: "MILESTONE", label: "По этапам" },
  ];

  const getAvailableTags = () => {
    return getTagsByCategory(formData.category);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Очищаем теги при смене категории
      if (name === 'category') {
        newData.tags = [];
      }
      
      return newData;
    });
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Название должно содержать минимум 5 символов';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Описание должно содержать минимум 20 символов';
    }

    if (!formData.budget) {
      newErrors.budget = 'Бюджет обязателен';
    } else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Бюджет должен быть положительным числом';
    }

    if (!formData.category) {
      newErrors.category = 'Категория обязательна';
    }

    if (!formData.workType) {
      newErrors.workType = 'Тип работы обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updatedOrder = {
      ...formData,
      budgetCents: Math.round(Number(formData.budget) * 100),
      priority: formData.isUrgent ? 'URGENT' : 'MEDIUM',
    };

    onSave(updatedOrder);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Редактировать заказ
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Название */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Название заказа *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Краткое описание задачи"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Описание */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание заказа *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Подробное описание задачи, требований и ожиданий"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Бюджет и категория */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Бюджет ($) *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="1"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Приоритет и тип работы */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isUrgent"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Срочный заказ
                    </span>
                    <p className="text-xs text-gray-500">
                      Отметьте, если заказ требует быстрого выполнения
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-1">
                  Тип работы *
                </label>
                <select
                  id="workType"
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.workType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {workTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.workType && (
                  <p className="mt-1 text-sm text-red-600">{errors.workType}</p>
                )}
              </div>
            </div>

            {/* Дедлайн и теги */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Дедлайн
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Теги
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  <div className="flex flex-wrap gap-2">
                    {getAvailableTags().map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Выберите подходящие теги (необязательно)
                </p>
                {formData.tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Выбранные теги:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
