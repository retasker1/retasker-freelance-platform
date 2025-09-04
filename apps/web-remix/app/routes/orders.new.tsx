import { Form, useActionData, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/orders.new";
import { useUser } from "../hooks/useUser";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Создать заказ — Retasker" },
    { name: "description", content: "Создайте новый заказ на бирже фриланса Retasker" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  return { user: { id: "temp-user", firstName: "Пользователь" } };
}

export async function action({ request }: Route.ActionArgs) {
  // В реальном приложении здесь должна быть проверка авторизации
  const user = { id: "temp-user", firstName: "Пользователь" };
  
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budget = formData.get("budget") as string;
  const category = formData.get("category") as string;
  const deadline = formData.get("deadline") as string;

  // Валидация
  const errors: Record<string, string> = {};
  
  if (!title || title.length < 5) {
    errors.title = "Название должно содержать минимум 5 символов";
  }
  
  if (!description || description.length < 20) {
    errors.description = "Описание должно содержать минимум 20 символов";
  }
  
  if (!budget || isNaN(Number(budget)) || Number(budget) < 1) {
    errors.budget = "Бюджет должен быть числом больше 0";
  }
  
  if (!category) {
    errors.category = "Выберите категорию";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values: { title, description, budget, category, deadline } };
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
        title,
        description,
        budgetCents: Math.round(Number(budget) * 100), // Конвертируем в центы
        category,
        deadline: deadline || null,
        customerId: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    // Перенаправляем на страницу заказов
    return redirect("/orders");
  } catch (error) {
    console.error("Create order error:", error);
    return { 
      errors: { general: "Ошибка при создании заказа. Попробуйте еще раз." },
      values: { title, description, budget, category, deadline }
    };
  }
}

export default function NewOrderPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { user } = useUser();

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
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Войти через Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    { value: "web", label: "Веб-разработка" },
    { value: "mobile", label: "Мобильная разработка" },
    { value: "design", label: "Дизайн" },
    { value: "marketing", label: "Маркетинг" },
    { value: "writing", label: "Копирайтинг" },
    { value: "translation", label: "Переводы" },
    { value: "other", label: "Другое" },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Создать новый заказ
          </h1>
          <p className="mt-2 text-gray-600">
            Опишите вашу задачу и получите отклики от исполнителей
          </p>
        </div>

        {actionData?.errors?.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{actionData.errors.general}</p>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Название заказа *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={actionData?.values?.title || ""}
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
              defaultValue={actionData?.values?.description || ""}
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
                  min="1"
                  step="0.01"
                  defaultValue={actionData?.values?.budget || ""}
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
                defaultValue={actionData?.values?.category || ""}
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
              defaultValue={actionData?.values?.deadline || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Оставьте пустым, если срок не критичен
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <a
              href="/orders"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Отмена
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Создание..." : "Создать заказ"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
