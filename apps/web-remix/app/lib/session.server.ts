import { createCookieSessionStorage } from "@remix-run/node";

// Создаем хранилище сессий
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret-key"],
    secure: process.env.NODE_ENV === "production",
  },
});

export { getSession, commitSession, destroySession };

// Типы для сессии
export interface SessionData {
  userId: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

// Утилиты для работы с сессией
export async function createUserSession(userData: SessionData, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userData.userId);
  session.set("telegramId", userData.telegramId);
  session.set("firstName", userData.firstName);
  session.set("lastName", userData.lastName);
  session.set("username", userData.username);
  session.set("photoUrl", userData.photoUrl);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  
  const userId = session.get("userId");
  const telegramId = session.get("telegramId");
  const firstName = session.get("firstName");
  const lastName = session.get("lastName");
  const username = session.get("username");
  const photoUrl = session.get("photoUrl");
  
  if (!userId || !telegramId || !firstName) {
    return null;
  }
  
  return {
    userId,
    telegramId,
    firstName,
    lastName,
    username,
    photoUrl,
  };
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
