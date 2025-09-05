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

    // Отладочная информация для тегов
    console.log("Orders loaded:", orders.map(order => ({
      id: order.id,
      title: order.title,
      category: order.category,
      tags: order.tags,
      tagsParsed: order.tags ? (() => {
        try {
          return JSON.parse(order.tags);
        } catch {
          return null;
        }
      })() : null
    })));

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
  const method = request.method;
  
  if (method === "POST") {
    // Создание нового заказа
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

      // Отладочная информация для тегов
      console.log("Creating order with tags:", {
        tags,
        isArray: Array.isArray(tags),
        length: Array.isArray(tags) ? tags.length : 0,
        stringified: Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : null
      });

      // Создаем заказ в базе данных
      const newOrder = await prisma.order.create({
        data: {
          shortCode,
          title,
          description,
          budgetCents: parseInt(budgetCents),
          category: category || "other",
          deadline: deadline ? new Date(deadline) : null,
          priority: priority || "URGENT",
          workType: workType || "FIXED",
          tags: Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : null,
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
  
  if (method === "PUT") {
    // Обновление существующего заказа
    try {
      const body = await request.json();
      const { 
        orderId, 
        title, 
        description, 
        budgetCents, 
        category, 
        priority, 
        workType, 
        tags, 
        deadline 
      } = body;

      // Валидация обязательных полей
      if (!orderId || !title || !description || !budgetCents || !category || !workType) {
        return Response.json({ 
          error: "Отсутствуют обязательные поля" 
        }, { status: 400 });
      }

      // Проверяем, что заказ существует
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!existingOrder) {
        return Response.json({ 
          error: "Заказ не найден" 
        }, { status: 404 });
      }

      // Обновляем заказ
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          title: title.trim(),
          description: description.trim(),
          budgetCents: Math.round(budgetCents),
          category,
          priority: priority || 'MEDIUM',
          workType,
          tags: Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : (tags ? JSON.stringify(tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)) : null),
          deadline: deadline ? new Date(deadline) : null,
          updatedAt: new Date(),
        },
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
        }
      });

      return Response.json({ 
        success: true, 
        order: updatedOrder 
      }, {
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });

    } catch (error) {
      console.error("Error updating order:", error);
      return Response.json({ 
        error: "Внутренняя ошибка сервера" 
      }, { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
