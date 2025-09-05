import type { Route } from "./+types/orders";
import { prisma } from "../../lib/prisma";
import { generateOrderShortCode } from "~/utils/shortCode";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const category = url.searchParams.get("category");
    const priority = url.searchParams.get("priority");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const viewMode = url.searchParams.get("viewMode") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const userId = url.searchParams.get("userId"); // Для фильтрации "Мои заказы"

    // Строим условия для фильтрации
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр "Мои заказы"
    if (viewMode === "my" && userId) {
      where.customerId = userId;
      console.log("Filtering by userId:", userId);
    } else if (viewMode === "my" && !userId) {
      console.log("Warning: viewMode is 'my' but no userId provided");
    }

    // Строим сортировку
    const orderBy: any = {};
    if (sortBy === "budgetCents") {
      orderBy.budgetCents = sortOrder;
    } else if (sortBy === "title") {
      orderBy.title = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Пагинация
    const skip = (page - 1) * limit;

    // Получаем заказы из базы данных
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          shortCode: true,
          title: true,
          description: true,
          budgetCents: true,
          status: true,
          category: true,
          priority: true,
          workType: true,
          tags: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
          customerId: true,
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
        orderBy,
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    // Вычисляем пагинацию
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return Response.json({ 
      orders, 
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
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
    const { 
      title, 
      description, 
      budgetCents, 
      category, 
      deadline, 
      customerId,
      tags,
      priority,
      workType
    } = body;

    // Валидация данных
    if (!title || !description || !budgetCents || !customerId) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Проверяем, существует ли пользователь в базе данных
    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }

    // Генерируем короткий код для заказа
    const shortCode = await generateOrderShortCode();

    // Создаем заказ в базе данных
    const newOrder = await prisma.order.create({
      data: {
        shortCode,
        title,
        description,
        budgetCents: parseInt(budgetCents),
        category: category || "other",
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || "MEDIUM",
        workType: workType || "FIXED",
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
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
