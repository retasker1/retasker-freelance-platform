import { getUserSession } from "./session.server";
import { prisma } from "./prisma";

export async function requireAuth(request: Request) {
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  // Дополнительно проверяем пользователя в базе данных
  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });
  
  if (!user || !user.isActive) {
    throw new Response("User not found or inactive", { status: 401 });
  }
  
  return { user, session };
}

export async function optionalAuth(request: Request) {
  const session = await getUserSession(request);
  
  if (!session) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });
  
  if (!user || !user.isActive) {
    return null;
  }
  
  return { user, session };
}
