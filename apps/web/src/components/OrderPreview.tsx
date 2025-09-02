'use client';

interface OrderPreviewData {
  title: string;
  description: string;
  budgetCents: number;
  category: string;
  deadline: string;
}

interface OrderPreviewProps {
  orderData: OrderPreviewData;
  onEdit: () => void;
  onConfirm: () => void;
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

export default function OrderPreview({ 
  orderData, 
  onEdit, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: OrderPreviewProps) {
  const getCategoryText = (category: string) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Предварительный просмотр заказа</h2>
      
      <div className="space-y-6">
        {/* Название */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Название заказа</h3>
          <p className="text-gray-300">{orderData.title}</p>
        </div>

        {/* Описание */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Описание задачи</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{orderData.description}</p>
        </div>

        {/* Детали */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Бюджет</h3>
                         <p className="text-gray-300">
               {(orderData.budgetCents / 100).toLocaleString('en-US', {
                 style: 'currency',
                 currency: 'USD',
                 minimumFractionDigits: 0,
               })}
             </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Категория</h3>
            <p className="text-gray-300">{getCategoryText(orderData.category)}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Срок выполнения</h3>
            <p className="text-gray-300">{new Date(orderData.deadline).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>

        {/* Информационное сообщение */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">Что происходит дальше?</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Заказ будет опубликован на платформе</li>
            <li>• Фрилансеры смогут подавать отклики</li>
            <li>• Вы сможете выбрать подходящего исполнителя</li>
            <li>• Работа будет выполняться через безопасную сделку</li>
          </ul>
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
            type="button"
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            disabled={isLoading}
          >
            Редактировать
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Создание...' : 'Создать заказ'}
          </button>
        </div>
      </div>
    </div>
  );
}
