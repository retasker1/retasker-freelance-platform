import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для создания заказа
const createOrderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  budgetCents: z.number().int().min(1000).max(10000000),
  category: z.string().min(1),
  deadline: z.string().min(1),
  customerId: z.string().min(1),
});

// GET /api/orders - получить список заказов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    const total = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки заказов' },
      { status: 500 }
    );
  }
}

// POST /api/orders - создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Создаем пользователя если не существует (для тестирования)
    if (validatedData.customerId === 'temp-user-id') {
      const existingUser = await prisma.user.findFirst({
        where: { telegramId: 'temp-user-id' }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            telegramId: 'temp-user-id',
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser',
            isActive: true
          }
        });
      }
    }

    // Находим пользователя для создания заказа
    const user = await prisma.user.findFirst({
      where: { telegramId: validatedData.customerId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const order = await prisma.order.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        budgetCents: validatedData.budgetCents,
        category: validatedData.category,
        deadline: new Date(validatedData.deadline),
        status: 'open',
        customerId: user.id,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка создания заказа' },
      { status: 500 }
    );
  }
}
