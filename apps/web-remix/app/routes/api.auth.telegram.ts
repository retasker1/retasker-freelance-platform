import type { Route } from "./+types/api.auth.telegram";

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

    // TODO: Добавить проверку подписи hash
    // TODO: Подключить Prisma для сохранения пользователя

    // Пока возвращаем успешный ответ
    return Response.json({
      success: true,
      user: {
        id,
        firstName: first_name,
        lastName: last_name,
        username,
        photoUrl: photo_url,
      },
    });
  } catch (error) {
    console.error("Telegram auth error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
