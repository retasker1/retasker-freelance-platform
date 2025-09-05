import React from 'react';

interface OrderPreviewProps {
  formData: {
    title: string;
    description: string;
    budget: string;
    category: string;
    deadline: string;
    isUrgent: boolean;
    workType: string;
    tags: string;
  };
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function OrderPreview({ formData, onEdit, onSubmit, isSubmitting }: OrderPreviewProps) {
  const categories = [
    { value: "web", label: "Веб-разработка" },
    { value: "mobile", label: "Мобильная разработка" },
    { value: "design", label: "Дизайн" },
    { value: "marketing", label: "Маркетинг" },
    { value: "writing", label: "Копирайтинг" },
    { value: "translation", label: "Переводы" },
    { value: "data", label: "Анализ данных" },
    { value: "ai", label: "ИИ и машинное обучение" },
    { value: "blockchain", label: "Блокчейн" },
    { value: "other", label: "Другое" },
  ];

  const workTypes = [
    { value: "FIXED", label: "Фиксированная цена" },
    { value: "HOURLY", label: "Почасовая оплата" },
    { value: "MILESTONE", label: "По этапам" },
  ];

  const getCategoryLabel = (value: string) => 
    categories.find(cat => cat.value === value)?.label || value;
  
  const getWorkTypeLabel = (value: string) => 
    workTypes.find(type => type.value === value)?.label || value;

  const tagList = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Предварительный просмотр заказа
          </h3>
          {formData.isUrgent && (
            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
              🔥 Срочно
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Основная информация */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Название</h4>
          <p className="text-gray-700 break-words">{formData.title || 'Без названия'}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Описание</h4>
          <p className="text-gray-700 whitespace-pre-wrap break-words max-w-full overflow-hidden">{formData.description || 'Описание не указано'}</p>
        </div>

        {/* Детали заказа */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Бюджет</h4>
            <p className="text-2xl font-bold text-indigo-600 break-words">${formData.budget || '0'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Категория</h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 max-w-full truncate">
              {getCategoryLabel(formData.category)}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Приоритет</h4>
            {formData.isUrgent ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                🔥 Срочно
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Обычный
              </span>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Тип работы</h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 max-w-full truncate">
              {getWorkTypeLabel(formData.workType)}
            </span>
          </div>
        </div>

        {/* Дедлайн */}
        {formData.deadline && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Срок выполнения</h4>
            <p className="text-gray-700">
              {new Date(formData.deadline).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Теги */}
        {tagList.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Теги</h4>
            <div className="flex flex-wrap gap-2">
              {tagList.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 max-w-full truncate"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 flex-wrap">
        <button
          onClick={onEdit}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
        >
          Назад к редактированию
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log('Кнопка "Создать заказ" нажата');
            onSubmit();
          }}
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSubmitting ? "Создание..." : "Создать заказ"}
        </button>
      </div>
    </div>
  );
}
