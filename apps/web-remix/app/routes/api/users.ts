import type { Route } from "./+types/users";
import { prisma } from "../../lib/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const telegramId = url.searchParams.get("telegramId");

    if (telegramId) {
      // Ищем пользователя по Telegram ID
      const user = await prisma.user.findUnique({
        where: { telegramId },
        select: {
          id: true,
          telegramId: true,
          firstName: true,
          lastName: true,
          username: true,
          photoUrl: true,
          isActive: true,
          createdAt: true,
        }
      });

      if (user) {
        return Response.json([user]); // Возвращаем массив для совместимости с ботом
      } else {
        return Response.json([]); // Пустой массив если пользователь не найден
      }
    } else {
      // Возвращаем всех пользователей (для админки)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          telegramId: true,
          firstName: true,
          lastName: true,
          username: true,
          photoUrl: true,
          isActive: true,
          createdAt: true,
        }
      });

      return Response.json(users);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

