import { prisma } from "../../lib/prisma";

export async function action({ request }: any) {
  // Обработка CORS preflight запросов
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
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

    // Ищем существующего пользователя или создаем нового
    let user = await prisma.user.findUnique({
      where: { telegramId: telegramId.toString() }
    });

               if (!user) {
             // Создаем нового пользователя
             user = await prisma.user.create({
               data: {
                 telegramId: telegramId.toString(),
                 firstName: firstName || `User_${telegramId}`,
                 lastName: lastName || null,
                 username: username || null,
                 photoUrl: photoUrl || null,
                 isActive: true,
               }
             });
             console.log("New user created:", user);
           } else {
             // Обновляем только те поля, которые пользователь не редактировал
             // Проверяем, были ли поля изменены пользователем
             const shouldUpdateUsername = !user.username || user.username === `user_${telegramId}` || user.username.includes('_updated') || user.username.startsWith('@');
             const shouldUpdatePhoto = !user.photoUrl || user.photoUrl.includes('via.placeholder.com') || user.photoUrl.includes('ui-avatars.com');
             
             // Убираем "Retasker Pro" из lastName, если оно там есть
             const shouldCleanLastName = user.lastName && user.lastName.includes('Retasker Pro');
             
             // Обновляем только username, photoUrl и очищаем lastName от "Retasker Pro"
             if (shouldUpdateUsername || shouldUpdatePhoto || shouldCleanLastName) {
               const updateData: any = {};
               if (shouldUpdateUsername && username) {
                 updateData.username = username; // Используем оригинальный username из Telegram
               }
               if (shouldUpdatePhoto && photoUrl) {
                 updateData.photoUrl = photoUrl; // Используем оригинальную фотографию из Telegram
               }
               if (shouldCleanLastName) {
                 updateData.lastName = user.lastName?.replace(' Retasker Pro', '').replace('Retasker Pro', '') || null;
               }
               
               if (Object.keys(updateData).length > 0) {
                 user = await prisma.user.update({
                   where: { id: user.id },
                   data: updateData
                 });
                 console.log("Updated user fields from Telegram:", updateData);
               }
             }
             
             console.log("Existing user found, returning from database:", user);
           }

    console.log("Returning user:", user);

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
        createdAt: user.createdAt,
      }
    }, {
      headers: {
        "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (error) {
    console.error("Auth API error:", error);
    return Response.json({
      success: false,
      message: "Internal server error"
    }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
}
