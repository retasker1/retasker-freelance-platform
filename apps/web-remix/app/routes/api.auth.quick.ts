import { json } from "@remix-run/node";
import { prisma } from "../lib/prisma";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return json({ success: false, error: "Token required" });
    }

    // Находим пользователя по токену
    const user = await prisma.user.findFirst({
      where: {
        authToken: token,
        tokenExpiresAt: {
          gt: new Date(), // Токен еще не истек
        },
      },
    });

    if (!user) {
      return json({ success: false, error: "Неверный или истекший токен" });
    }

    // Очищаем токен после использования
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authToken: null,
        tokenExpiresAt: null,
      },
    });

    return json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
      },
    });

  } catch (error) {
    console.error("Quick auth error:", error);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
