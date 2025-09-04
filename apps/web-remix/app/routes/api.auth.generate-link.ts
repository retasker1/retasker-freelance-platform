import { json } from "@remix-run/node";
import { prisma } from "../lib/prisma";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return json({ success: false, error: "Telegram ID required" });
    }

    // Генерируем простой токен для ссылки
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    // Сохраняем токен в базе данных
    await prisma.user.upsert({
      where: { telegramId: telegramId.toString() },
      update: {
        authToken: token,
        tokenExpiresAt: expiresAt,
      },
      create: {
        telegramId: telegramId.toString(),
        firstName: `User_${telegramId}`, // Обязательное поле
        authToken: token,
        tokenExpiresAt: expiresAt,
      },
    });
    
    // Создаем приватную ссылку
    const baseUrl = "https://3dfu5ii9t8is.share.zrok.io";
    const authLink = `${baseUrl}/auth/quick?token=${token}`;

    return json({ 
      success: true, 
      authLink,
      token,
      expiresIn: 15 * 60 // 15 минут в секундах
    });

  } catch (error) {
    console.error("Generate auth link error:", error);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
