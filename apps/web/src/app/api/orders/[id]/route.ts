import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для обновления заказа
const updateOrderSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  budgetCents: z.number().int().min(1000).max(10000000).optional(),
  category: z.string().min(1).optional(),
  deadline: z.string().min(1).optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
});

// GET /api/orders/[id] - получить заказ по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true }
        },
        responses: {
          include: {
            freelancer: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки заказа' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - обновить заказ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Проверяем, существует ли заказ
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: any = { ...validatedData };
    if (validatedData.deadline) {
      updateData.deadline = new Date(validatedData.deadline);
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка обновления заказа' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - удалить заказ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем, существует ли заказ
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    await prisma.order.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Заказ удален' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления заказа' },
      { status: 500 }
    );
  }
}
