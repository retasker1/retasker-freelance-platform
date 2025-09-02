import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - получение профиля пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        rating: true,
        ratingsCount: true,
        balanceCents: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            responses: true,
            dealsAsCustomer: true,
            dealsAsFreelancer: true
          }
        },
        orders: {
          where: { status: 'OPEN' },
          select: {
            id: true,
            title: true,
            budgetCents: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        responses: {
          select: {
            id: true,
            priceCents: true,
            createdAt: true,
            order: {
              select: {
                id: true,
                title: true,
                budgetCents: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении пользователя' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - обновление профиля пользователя
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // TODO: Проверить права доступа (только владелец профиля)
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        displayName: body.displayName,
        avatarUrl: body.avatarUrl
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        rating: true,
        ratingsCount: true,
        balanceCents: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении пользователя' },
      { status: 500 }
    )
  }
}

