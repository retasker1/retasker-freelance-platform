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
      const { firstName, lastName, photoUrl } = body;

      console.log("Updating user with ID:", userId);
      console.log("Received data:", { firstName, lastName, photoUrl });
      
      // Сначала пытаемся найти по ID, если не найден - ищем по Telegram ID
      let user = await prisma.user.findUnique({
        where: { id: userId }
      });

      console.log("User found by ID:", user);

      if (!user && userId.startsWith('user_')) {
        // Если ID в старом формате, извлекаем Telegram ID
        const telegramId = userId.replace('user_', '');
        console.log("Searching by Telegram ID:", telegramId);
        user = await prisma.user.findUnique({
          where: { telegramId: telegramId }
        });
        console.log("User found by Telegram ID:", user);
      }

      if (!user) {
        console.log("User not found, returning 404");
        return new Response("User not found", { status: 404 });
      }

                         const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName !== undefined ? lastName : undefined, // Позволяем явно установить null
          // username не обновляем - он остается из Telegram
          photoUrl: photoUrl !== undefined ? photoUrl : user.photoUrl, // Сохраняем оригинальную фотографию, если новая не указана
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

