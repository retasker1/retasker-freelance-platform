import type { Route } from "./+types/auth.telegram";
import { prisma } from "../../lib/prisma";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = body;

    // Валидация данных Telegram
    if (!id || !first_name || !auth_date || !hash) {
      return new Response("Invalid Telegram data", { status: 400 });
    }

    // TODO: Добавить проверку подписи hash для безопасности
    // Пока пропускаем проверку для разработки

    // Ищем или создаем пользователя в базе данных
    let user = await prisma.user.findUnique({
      where: { telegramId: id.toString() }
    });

    if (!user) {
      // Создаем нового пользователя
      user = await prisma.user.create({
        data: {
          telegramId: id.toString(),
          firstName: first_name,
          lastName: last_name || null,
          username: username || null,
          photoUrl: photo_url || null,
          isActive: true,
        }
      });
    } else {
      // Обновляем существующего пользователя
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: first_name,
          lastName: last_name || null,
          username: username || null,
          photoUrl: photo_url || null,
          isActive: true,
        }
      });
    }

    // Возвращаем JSON с данными пользователя для всех запросов
    return Response.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error("Telegram auth error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
