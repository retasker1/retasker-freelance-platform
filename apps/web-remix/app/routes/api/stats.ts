import type { LoaderArgs, LoaderData } from "./+types/api.stats";
import { prisma } from "../../lib/prisma";

export async function loader({}: LoaderArgs) {
  try {
    // Получаем статистику из базы данных
    const [
      activeOrdersCount,
      completedOrdersCount,
      totalUsersCount,
      totalBudget
    ] = await Promise.all([
      // Количество активных заказов
      prisma.order.count({
        where: { status: "OPEN" }
      }),
      
      // Количество завершенных заказов
      prisma.order.count({
        where: { status: "COMPLETED" }
      }),
      
      // Количество пользователей
      prisma.user.count(),
      
      // Общий объем (сумма всех заказов)
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { budgetCents: true }
      })
    ]);

    // Форматируем данные
    const stats = {
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      totalUsers: totalUsersCount,
      totalBudget: totalBudget._sum.budgetCents || 0
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({
      activeOrders: 0,
      completedOrders: 0,
      totalUsers: 0,
      totalBudget: 0
    });
  }
}
