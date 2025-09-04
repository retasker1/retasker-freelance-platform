export async function action({ request }: any) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { telegramId, firstName, lastName, username, photoUrl } = body;

    console.log("Auth API received:", { telegramId, firstName, lastName, username });

    if (!telegramId) {
      return Response.json({
        success: false,
        message: "Telegram ID required"
      });
    }

    // Временно создаем фиктивного пользователя для тестирования
    const mockUser = {
      id: `user_${telegramId}`,
      telegramId: telegramId.toString(),
      firstName: firstName || "Пользователь",
      lastName: lastName || null,
      username: username || null,
      photoUrl: photoUrl || null,
      isActive: true,
    };

    console.log("Returning mock user:", mockUser);

    return Response.json({
      success: true,
      user: mockUser
    });
  } catch (error) {
    console.error("Auth API error:", error);
    return Response.json({
      success: false,
      message: "Internal server error"
    });
  }
}