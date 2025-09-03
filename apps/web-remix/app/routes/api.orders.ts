import type { Route } from "./+types/api.orders";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // TODO: Подключить Prisma для получения заказов
    // Пока возвращаем тестовые данные
    const orders = [
      {
        id: "1",
        title: "Разработка лендинга",
        description: "Нужен современный лендинг для IT-компании",
        budgetCents: 50000, // 500 USD
        status: "OPEN",
        category: "web-development",
        deadline: "2024-01-15",
        createdAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "2", 
        title: "Дизайн логотипа",
        description: "Создание логотипа для стартапа",
        budgetCents: 15000, // 150 USD
        status: "IN_PROGRESS",
        category: "design",
        deadline: "2024-01-10",
        createdAt: "2024-01-02T14:30:00Z",
      },
    ];

    // Фильтрация по статусу
    let filteredOrders = orders;
    if (status) {
      filteredOrders = orders.filter(order => order.status === status);
    }

    // Поиск по тексту
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.title.toLowerCase().includes(searchLower) ||
        order.description.toLowerCase().includes(searchLower)
      );
    }

    return Response.json({ orders: filteredOrders });
  } catch (error) {
    console.error("Orders API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { title, description, budgetCents, category, deadline } = body;

    // Валидация данных
    if (!title || !description || !budgetCents) {
      return new Response("Missing required fields", { status: 400 });
    }

    // TODO: Подключить Prisma для создания заказа
    // TODO: Добавить аутентификацию пользователя

    const newOrder = {
      id: Date.now().toString(),
      title,
      description,
      budgetCents: parseInt(budgetCents),
      status: "OPEN",
      category: category || "other",
      deadline: deadline || null,
      createdAt: new Date().toISOString(),
    };

    return Response.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
