import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для создания сделки
const createDealSchema = z.object({
  orderId: z.string().min(1),
  responseId: z.string().min(1),
  finalPrice: z.number().int().min(100).max(10000000),
});

// GET /api/deals - получить список сделок пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: any = {
      OR: [
        { customerId: userId },
        { freelancerId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            title: true,
            description: true,
            budgetCents: true,

            status: true,
          }
        },

        customer: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        },
        freelancer: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      ok: true,
      data: { deals }
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка загрузки сделок' },
      { status: 500 }
    );
  }
}

// POST /api/deals - создать новую сделку
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDealSchema.parse(body);

    // Проверяем, что заказ и отклик существуют
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: { customer: true }
    });

    const response = await prisma.response.findUnique({
      where: { id: validatedData.responseId },
      include: { freelancer: true }
    });

    if (!order || !response) {
      return NextResponse.json(
        { ok: false, error: 'Заказ или отклик не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что отклик относится к заказу
    if (response.orderId !== order.id) {
      return NextResponse.json(
        { ok: false, error: 'Отклик не относится к данному заказу' },
        { status: 400 }
      );
    }

    // Проверяем, что сделка еще не создана
    const existingDeal = await prisma.deal.findUnique({
      where: {
        orderId: validatedData.orderId
      }
    });

    if (existingDeal) {
      return NextResponse.json(
        { ok: false, error: 'Сделка уже существует' },
        { status: 409 }
      );
    }

    // Создаем сделку
    const deal = await prisma.deal.create({
      data: {
        orderId: validatedData.orderId,
        customerId: order.customerId,
        freelancerId: response.freelancerId,
        status: 'ACTIVE',
      },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            description: true,
            budgetCents: true,

            status: true,
          }
        },

        customer: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        },
        freelancer: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        }
      }
    });

    // Обновляем статус заказа на "в работе"
    await prisma.order.update({
      where: { id: validatedData.orderId },
      data: { status: 'in_progress' }
    });

    // Отклик принят (статус не хранится в Response)

    return NextResponse.json({
      ok: true,
      data: deal
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Ошибка создания сделки' },
      { status: 500 }
    );
  }
}
