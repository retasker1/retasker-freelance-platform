import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для создания пользователя
const createUserSchema = z.object({
  telegramId: z.string().min(1),
  firstName: z.string().min(1).max(50),
  lastName: z.string().max(50).optional(),
  username: z.string().max(50).optional(),
  photoUrl: z.string().url().optional(),
});

// GET /api/users - получить список пользователей (только для админов)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const total = await prisma.user.count();

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователей' },
      { status: 500 }
    );
  }
}

// POST /api/users - создать нового пользователя (регистрация через Telegram)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Проверяем, не существует ли уже пользователь с таким telegramId
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: validatedData.telegramId }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь уже существует' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        telegramId: validatedData.telegramId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        username: validatedData.username,
        photoUrl: validatedData.photoUrl,
        isActive: true,
      },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка создания пользователя' },
      { status: 500 }
    );
  }
}
