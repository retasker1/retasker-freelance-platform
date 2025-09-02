import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - получение списка пользователей (для админов)
export async function GET(request: NextRequest) {
  try {
    // TODO: Проверить права доступа (только админы)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role') // customer, freelancer, admin

    const where: any = {}
    if (role) {
      // Логика фильтрации по роли будет добавлена позже
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          rating: true,
          ratingsCount: true,
          balanceCents: true,
          isAdmin: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              responses: true,
              dealsAsCustomer: true,
              dealsAsFreelancer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    )
  }
}

// POST /api/users - создание пользователя (при регистрации через Telegram)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация данных Telegram
    if (!body.tgId || !body.displayName) {
      return NextResponse.json(
        { error: 'Неверные данные пользователя' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже пользователь с таким tgId
    const existingUser = await prisma.user.findUnique({
      where: { tgId: body.tgId }
    })

    if (existingUser) {
      return NextResponse.json(existingUser)
    }

    // Создаем нового пользователя
    const user = await prisma.user.create({
      data: {
        tgId: body.tgId,
        displayName: body.displayName,
        avatarUrl: body.avatarUrl,
        rating: 0,
        ratingsCount: 0,
        balanceCents: 0,
        isAdmin: false
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя' },
      { status: 500 }
    )
  }
}
