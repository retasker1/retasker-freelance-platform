import type { Route } from "./+types/orders";
import { prisma } from "../../lib/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Строим условия для фильтрации
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем заказы из базы данных
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          }
        },
        _count: {
          select: {
            deals: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { title, description, budgetCents, category, deadline, customerId } = body;

    // Валидация данных
    if (!title || !description || !budgetCents || !customerId) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Создаем заказ в базе данных
    const newOrder = await prisma.order.create({
      data: {
        title,
        description,
        budgetCents: parseInt(budgetCents),
        category: category || "other",
        deadline: deadline ? new Date(deadline) : null,
        customerId,
        status: "OPEN"
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          }
        }
      }
    });

    return Response.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
