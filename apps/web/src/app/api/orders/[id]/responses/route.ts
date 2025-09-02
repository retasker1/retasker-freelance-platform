import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для создания отклика
const createResponseSchema = z.object({
  message: z.string().min(1).max(1000),
  proposedPrice: z.number().int().min(1000).max(10000000),
  freelancerId: z.string().min(1),
});

// GET /api/orders/[id]/responses - получить отклики на заказ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responses = await prisma.response.findMany({
      where: { orderId: params.id },
      include: {
        freelancer: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки откликов' },
      { status: 500 }
    );
  }
}

// POST /api/orders/[id]/responses - создать отклик на заказ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createResponseSchema.parse(body);

    // Проверяем, существует ли заказ
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    // Создаем фрилансера если не существует (для тестирования)
    if (validatedData.freelancerId === 'temp-freelancer-id') {
      await prisma.user.upsert({
        where: { telegramId: 'temp-freelancer-id' },
        update: {},
        create: {
          telegramId: 'temp-freelancer-id',
          firstName: 'Test',
          lastName: 'Freelancer',
          username: 'testfreelancer',
          isActive: true
        }
      });
    }

    const response = await prisma.response.create({
      data: {
        message: validatedData.message,
        proposedPrice: validatedData.proposedPrice,
        orderId: params.id,
        freelancerId: validatedData.freelancerId,
      },
      include: {
        freelancer: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      }
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating response:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка создания отклика' },
      { status: 500 }
    );
  }
}
