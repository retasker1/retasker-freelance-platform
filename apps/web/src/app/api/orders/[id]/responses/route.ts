import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponseSchema } from '@/lib/validation'

// GET /api/orders/[id]/responses - получение откликов на заказ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = params

    const responses = await prisma.response.findMany({
      where: { orderId },
      include: {
        freelancer: {
          select: {
            id: true,
            displayName: true,
            rating: true,
            ratingsCount: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении откликов' },
      { status: 500 }
    )
  }
}

// POST /api/orders/[id]/responses - создание отклика на заказ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = params
    const body = await request.json()

    // Валидация данных
    const validatedData = createResponseSchema.parse(body)

    // TODO: Получить userId из аутентификации
    // Временно создаем фрилансера, если его нет
    let freelancerId = 'temp-freelancer-id'
    
    // Проверяем, есть ли пользователь с временным ID
    let freelancer = await prisma.user.findUnique({
      where: { tgId: 'temp-freelancer-id' }
    })
    
    if (!freelancer) {
      // Создаем временного фрилансера
      freelancer = await prisma.user.create({
        data: {
          tgId: 'temp-freelancer-id',
          displayName: 'Временный фрилансер',
          rating: 0,
          ratingsCount: 0,
          balanceCents: 0,
          isAdmin: false
        }
      })
      freelancerId = freelancer.id
    } else {
      freelancerId = freelancer.id
    }

    // Проверяем, что заказ существует и открыт
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    if (order.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Заказ уже не принимает отклики' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь еще не оставлял отклик
    const existingResponse = await prisma.response.findFirst({
      where: {
        orderId,
        freelancerId
      }
    })

    if (existingResponse) {
      return NextResponse.json(
        { error: 'Вы уже оставляли отклик на этот заказ' },
        { status: 400 }
      )
    }

    // Создаем отклик
    const response = await prisma.response.create({
      data: {
        ...validatedData,
        orderId,
        freelancerId
      },
      include: {
        freelancer: {
          select: {
            id: true,
            displayName: true,
            rating: true
          }
        }
      }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Неверные данные отклика' },
        { status: 400 }
      )
    }

    console.error('Error creating response:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании отклика' },
      { status: 500 }
    )
  }
}
