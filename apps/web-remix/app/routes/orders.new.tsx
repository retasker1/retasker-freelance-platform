import { Form, useActionData, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/orders.new";
import { useUser } from "../hooks/useUser";
import { OrderFormProgress } from "../components/OrderFormProgress";
import { OrderPreview } from "../components/OrderPreview";
import { useState, useEffect } from "react";
import { categories, tagsByCategory, getTagsByCategory } from "../utils/tagsConfig";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Создать заказ — Retasker" },
    { name: "description", content: "Создайте новый заказ на бирже фриланса Retasker" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // В реальном приложении здесь должна быть проверка авторизации
  // Пока возвращаем null, проверка будет в компоненте
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  
  if (!userId) {
    return { 
      errors: { general: "Требуется авторизация для создания заказа" },
      values: {}
    };
  }
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budget = formData.get("budget") as string;
  const category = formData.get("category") as string;
  const deadline = formData.get("deadline") as string;
  // Получаем все значения тегов (множественные поля с одинаковым именем)
  const tagsArray = formData.getAll("tags") as string[];
  const tags = tagsArray.filter(tag => tag && tag.trim().length > 0);
  
  console.log("Tags from form:", tagsArray);
  console.log("Filtered tags:", tags);
  const isUrgent = formData.get("isUrgent") === "on";
  const workType = formData.get("workType") as string;
  const action = formData.get("action") as string;

  // Улучшенная валидация
  const errors: Record<string, string> = {};
  
  // Валидация названия
  if (!title || title.trim().length < 5) {
    errors.title = "Название должно содержать минимум 5 символов";
  } else if (title.trim().length > 100) {
    errors.title = "Название не должно превышать 100 символов";
  }
  
  // Валидация описания
  if (!description || description.trim().length < 20) {
    errors.description = "Описание должно содержать минимум 20 символов";
  } else if (description.trim().length > 2000) {
    errors.description = "Описание не должно превышать 2000 символов";
  }
  
  // Валидация бюджета
  const budgetNum = Number(budget);
  if (!budget || isNaN(budgetNum)) {
    errors.budget = "Бюджет должен быть числом";
  } else if (budgetNum < 5) {
    errors.budget = "Минимальный бюджет $5";
  } else if (budgetNum > 50000) {
    errors.budget = "Максимальный бюджет $50,000";
  }
  
  // Валидация категории
  if (!category) {
    errors.category = "Выберите категорию";
  }
  
  // Валидация дедлайна
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
      errors.deadline = "Дедлайн не может быть в прошлом";
    } else if (deadlineDate > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      errors.deadline = "Дедлайн не может быть более чем через год";
    }
  }
  
  // Валидация тегов
  if (tags && tags.length > 0) {
    if (tags.length > 10) {
      errors.tags = "Максимум 10 тегов";
    }
    for (const tag of tags) {
      if (tag.length > 20) {
        errors.tags = "Каждый тег не должен превышать 20 символов";
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { 
      errors, 
      values: { title, description, budget, category, deadline, tags, isUrgent, workType } 
    };
  }

  // Если это предварительный просмотр, возвращаем данные без создания заказа
  if (action === "preview") {
    return { 
      preview: true,
      values: { title, description, budget, category, deadline, tags, isUrgent, workType } 
    };
  }

  try {
    // Создаем заказ через API
    const url = new URL(request.url);
    const apiUrl = new URL("/api/orders", url.origin);
    
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        budgetCents: Math.round(budgetNum * 100), // Конвертируем в центы
        category,
        deadline: deadline || null,
        tags: tags,
        priority: isUrgent ? "URGENT" : "MEDIUM",
        workType: workType || "FIXED",
        customerId: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create order");
    }

    // Перенаправляем на страницу заказов
    return redirect("/orders");
  } catch (error) {
    console.error("Create order error:", error);
    return { 
      errors: { general: "Ошибка при создании заказа. Попробуйте еще раз." },
      values: { title, description, budget, category, deadline, tags, isUrgent, workType }
    };
  }
}

export default function NewOrderPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { user, loading } = useUser();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: actionData?.values?.title || "",
    description: actionData?.values?.description || "",
    budget: actionData?.values?.budget || "",
    category: actionData?.values?.category || "",
    deadline: actionData?.values?.deadline || "",
    isUrgent: actionData?.values?.isUrgent || false,
    workType: actionData?.values?.workType || "FIXED",
    tags: actionData?.values?.tags ? (() => {
      // Если tags уже массив, возвращаем его
      if (Array.isArray(actionData.values.tags)) {
        return actionData.values.tags;
      }
      // Если это строка, пытаемся распарсить как JSON
      try {
        return JSON.parse(actionData.values.tags);
      } catch {
        // Если не JSON, разбиваем по запятым
        return actionData.values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    })() : [],
  });

  // Обновляем formData при изменении actionData
  useEffect(() => {
    if (actionData?.values) {
      setFormData({
        title: actionData.values.title || "",
        description: actionData.values.description || "",
        budget: actionData.values.budget || "",
        category: actionData.values.category || "",
        deadline: actionData.values.deadline || "",
        isUrgent: actionData.values.isUrgent || false,
        workType: actionData.values.workType || "FIXED",
        tags: actionData.values.tags ? (() => {
          // Если tags уже массив, возвращаем его
          if (Array.isArray(actionData.values.tags)) {
            return actionData.values.tags;
          }
          // Если это строка, пытаемся распарсить как JSON
          try {
            return JSON.parse(actionData.values.tags);
          } catch {
            // Если не JSON, разбиваем по запятым
            return actionData.values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          }
        })() : [],
      });
    }
  }, [actionData]);

  // Показываем предварительный просмотр если actionData.preview === true
  useEffect(() => {
    if (actionData?.preview) {
      setShowPreview(true);
    }
  }, [actionData]);

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Проверка авторизации...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Требуется авторизация
            </h1>
            <p className="text-gray-600 mb-6">
              Для создания заказов необходимо войти через Telegram
            </p>
            <div className="space-y-3">
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Войти через Telegram
              </a>
              <div className="text-xs text-gray-500">
                <p>Статус загрузки: {loading ? 'Загрузка...' : 'Завершено'}</p>
                <p>Пользователь: {user ? 'Авторизован' : 'Не авторизован'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Приоритет теперь только один - срочный (чекбокс)

  const workTypes = [
    { value: "FIXED", label: "Фиксированная цена" },
    { value: "HOURLY", label: "Почасовая оплата" },
    { value: "MILESTONE", label: "По этапам" },
  ];

  const getAvailableTags = () => {
    return getTagsByCategory(formData.category);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Очищаем теги при смене категории
      if (field === 'category') {
        newData.tags = [];
      }
      
      return newData;
    });
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };


  // Если показываем предварительный просмотр
  if (showPreview) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <OrderFormProgress formData={formData} showPreview={true} />
          <OrderPreview
            formData={formData}
            userId={user.id}
            onEdit={handleEdit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <OrderFormProgress formData={formData} />
        
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Создать новый заказ
              </h1>
              <p className="mt-2 text-gray-600">
                Опишите вашу задачу и получите отклики от исполнителей
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Очистить данные
              </button>
              <button
                onClick={() => {
                  window.location.href = '/login';
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
              >
                Войти заново
              </button>
            </div>
          </div>
        </div>

        {actionData?.errors?.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{actionData.errors.general}</p>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <input type="hidden" name="userId" value={user.id} />
          {/* Скрытые поля для тегов */}
          {formData.tags.map((tag, index) => (
            <input key={index} type="hidden" name="tags" value={tag} />
          ))}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Название заказа *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                actionData?.errors?.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Например: Создать лендинг для интернет-магазина"
            />
            {actionData?.errors?.title && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Описание задачи *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                actionData?.errors?.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Подробно опишите, что нужно сделать, какие требования, сроки и т.д."
            />
            {actionData?.errors?.description && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Бюджет (USD) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  required
                  min="5"
                  max="50000"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    actionData?.errors?.budget ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="100"
                />
              </div>
              {actionData?.errors?.budget && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.budget}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  actionData?.errors?.category ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {actionData?.errors?.category && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.category}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Желаемый срок выполнения
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                actionData?.errors?.deadline ? "border-red-300" : "border-gray-300"
              }`}
            />
            {actionData?.errors?.deadline && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.deadline}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Оставьте пустым, если срок не критичен
            </p>
          </div>

          {/* Новые поля */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isUrgent"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
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
              <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-2">
                Тип работы
              </label>
              <select
                id="workType"
                name="workType"
                value={formData.workType}
                onChange={(e) => handleInputChange('workType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {workTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
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
            {formData.tags && formData.tags.length > 0 && (
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

          <div className="flex justify-between">
            <a
              href="/orders"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Отмена
            </a>
            <div className="flex space-x-3">
              <button
                type="submit"
                name="action"
                value="preview"
                disabled={!formData.title || !formData.description || !formData.budget || !formData.category}
                className="px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Предварительный просмотр
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Создание..." : "Создать заказ"}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
