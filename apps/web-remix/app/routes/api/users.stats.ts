import type { Route } from "./+types/users.stats";
import { prisma } from "../../lib/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    // Получаем статистику пользователя
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalDeals,
      activeDeals,
      completedDeals,
      totalSpent,
      totalEarned
    ] = await Promise.all([
      // Заказы как заказчик
      prisma.order.count({
        where: { customerId: userId }
      }),
      prisma.order.count({
        where: { 
          customerId: userId,
          status: { in: ["OPEN", "IN_PROGRESS"] }
        }
      }),
      prisma.order.count({
        where: { 
          customerId: userId,
          status: "COMPLETED"
        }
      }),
      // Сделки как заказчик
      prisma.deal.count({
        where: { customerId: userId }
      }),
      prisma.deal.count({
        where: { 
          customerId: userId,
          status: { in: ["PENDING", "ACTIVE", "DELIVERED"] }
        }
      }),
      prisma.deal.count({
        where: { 
          customerId: userId,
          status: "COMPLETED"
        }
      }),
      // Потрачено как заказчик
      prisma.deal.aggregate({
        where: { 
          customerId: userId,
          status: "COMPLETED"
        },
        _sum: { amountCents: true }
      }),
      // Заработано как исполнитель
      prisma.deal.aggregate({
        where: { 
          freelancerId: userId,
          status: "COMPLETED"
        },
        _sum: { amountCents: true }
      })
    ]);

    const stats = {
      orders: {
        total: totalOrders,
        active: activeOrders,
        completed: completedOrders
      },
      deals: {
        total: totalDeals,
        active: activeDeals,
        completed: completedDeals
      },
      finances: {
        totalSpent: totalSpent._sum.amountCents || 0,
        totalEarned: totalEarned._sum.amountCents || 0,
        netProfit: (totalEarned._sum.amountCents || 0) - (totalSpent._sum.amountCents || 0)
      }
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
