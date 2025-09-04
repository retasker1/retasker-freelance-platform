import type { Route } from "./+types/deals";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    // TODO: Подключить Prisma для получения сделок пользователя
    // Пока возвращаем тестовые данные
    const deals = [
      {
        id: "1",
        orderId: "1",
        customerId: userId,
        freelancerId: "freelancer_123",
        status: "ACTIVE",
        amountCents: 50000,
        createdAt: "2024-01-01T10:00:00Z",
        order: {
          title: "Разработка лендинга",
          description: "Нужен современный лендинг для IT-компании",
        },
      },
      {
        id: "2",
        orderId: "2", 
        customerId: "customer_456",
        freelancerId: userId,
        status: "COMPLETED",
        amountCents: 15000,
        createdAt: "2024-01-02T14:30:00Z",
        order: {
          title: "Дизайн логотипа",
          description: "Создание логотипа для стартапа",
        },
      },
    ];

    // Фильтрация по статусу
    let filteredDeals = deals;
    if (status) {
      filteredDeals = deals.filter(deal => deal.status === status);
    }

    return Response.json({ deals: filteredDeals });
  } catch (error) {
    console.error("Deals API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { orderId, freelancerId, action: dealAction } = body;

    // Валидация данных
    if (!orderId || !freelancerId || !dealAction) {
      return new Response("Missing required fields", { status: 400 });
    }

    // TODO: Подключить Prisma для управления сделками
    // TODO: Добавить аутентификацию пользователя

    let updatedDeal;
    switch (dealAction) {
      case "accept":
        updatedDeal = {
          id: Date.now().toString(),
          orderId,
          customerId: "current_user", // TODO: Получить из аутентификации
          freelancerId,
          status: "ACTIVE",
          amountCents: 0, // TODO: Получить из заказа
          createdAt: new Date().toISOString(),
        };
        break;
      case "deliver":
        updatedDeal = {
          id: "existing_deal_id",
          status: "DELIVERED",
          deliveredAt: new Date().toISOString(),
        };
        break;
      case "confirm":
        updatedDeal = {
          id: "existing_deal_id", 
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
        };
        break;
      default:
        return new Response("Invalid action", { status: 400 });
    }

    return Response.json({ deal: updatedDeal });
  } catch (error) {
    console.error("Deal action error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
