import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для обновления пользователя
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().max(50).optional(),
  username: z.string().max(50).optional(),
  photoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/users/[id] - получить пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            title: true,
            status: true,
            budgetCents: true,
            createdAt: true,
          }
        },
        responses: {
          select: {
            id: true,
            message: true,
            proposedPrice: true,
            status: true,
            createdAt: true,
            order: {
              select: {
                id: true,
                title: true,
                status: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователя' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - обновить пользователя
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}
