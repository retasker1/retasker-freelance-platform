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

export async function action({ request }: Route.ActionArgs) {
  try {
    const method = request.method;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (method === "PUT" && userId) {
      // Обновление профиля пользователя
      const body = await request.json();
      const { firstName, lastName, username, photoUrl } = body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          username: username || undefined,
          photoUrl: photoUrl || undefined,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          telegramId: true,
          firstName: true,
          lastName: true,
          username: true,
          photoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return Response.json(updatedUser);
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

