import { prisma } from "../../lib/prisma";

export async function loader({ request }: any) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const userId = url.searchParams.get("userId");
  const status = url.searchParams.get("status") || "";

  try {
    let whereClause: any = {};

    // Фильтр по заказу
    if (orderId) {
      whereClause.orderId = orderId;
    }

    // Фильтр по пользователю (как заказчик или исполнитель)
    if (userId) {
      whereClause.OR = [
        { customerId: userId },
        { freelancerId: userId }
      ];
    }

    // Фильтр по статусу
    if (status) {
      whereClause.status = status;
    }

    const deals = await prisma.deal.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
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
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          }
        },
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ deals });
  } catch (error) {
    console.error("Failed to load deals:", error);
    return Response.json({ error: "Failed to load deals" }, { status: 500 });
  }
}

export async function action({ request }: any) {
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

  try {
    const body = await request.json();
    const { orderId, freelancerId, amountCents, message } = body;

    // Валидация
    if (!orderId || !freelancerId || !amountCents) {
      return Response.json({
        success: false,
        error: "Missing required fields"
      }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    // Проверяем, что заказ существует и открыт
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!order) {
      return Response.json({
        success: false,
        error: "Order not found"
      }, {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    if (order.status !== 'OPEN') {
      return Response.json({
        success: false,
        error: "Order is not open for responses"
      }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    // Проверяем, что пользователь не пытается откликнуться на свой заказ
    if (order.customerId === freelancerId) {
      return Response.json({
        success: false,
        error: "You cannot respond to your own order"
      }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    // Проверяем, что пользователь еще не откликался на этот заказ
    const existingDeal = await prisma.deal.findFirst({
      where: {
        orderId: orderId,
        freelancerId: freelancerId
      }
    });

    if (existingDeal) {
      return Response.json({
        success: false,
        error: "You have already responded to this order"
      }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    // Создаем отклик
    const deal = await prisma.deal.create({
      data: {
        orderId: orderId,
        customerId: order.customerId,
        freelancerId: freelancerId,
        amountCents: amountCents,
        status: 'PENDING'
      },
      include: {
        order: {
          select: {
            id: true,
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
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          }
        },
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          }
        }
      }
    });

    // Если есть сообщение, создаем его
    if (message && message.trim()) {
      await prisma.message.create({
        data: {
          content: message.trim(),
          dealId: deal.id,
          userId: freelancerId
        }
      });
    }

    return Response.json({
      success: true,
      deal: deal
    }, {
      headers: {
        "Access-Control-Allow-Origin": "https://4klnm84lswj4.share.zrok.io",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });

  } catch (error) {
    console.error("Failed to create deal:", error);
    return Response.json({
      success: false,
      error: "Internal server error"
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
