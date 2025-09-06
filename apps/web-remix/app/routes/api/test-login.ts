import { json } from "react-router";
import { prisma } from "../../lib/prisma";

export async function POST() {
  try {
    // Создаем или находим тестового пользователя
    const testUser = await prisma.user.upsert({
      where: { telegramId: "test-user-123" },
      update: {},
      create: {
        telegramId: "test-user-123",
        firstName: "Test",
        lastName: "User",
        username: "test_user",
        photoUrl: "https://via.placeholder.com/150",
      },
    });

    return json({
      success: true,
      user: testUser
    });
  } catch (error) {
    console.error("Test login error:", error);
    return json({
      success: false,
      error: "Ошибка создания тестового пользователя"
    }, { status: 500 });
  }
}
