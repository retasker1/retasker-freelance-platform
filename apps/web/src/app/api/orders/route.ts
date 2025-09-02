import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrderSchema, searchOrdersSchema } from '@/lib/validation'

// GET /api/orders - получение списка заказов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || undefined
    const minBudget = searchParams.get('minBudget') ? parseInt(searchParams.get('minBudget')!) : undefined
    const maxBudget = searchParams.get('maxBudget') ? parseInt(searchParams.get('maxBudget')!) : undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Валидация параметров
    const searchParamsValidated = searchOrdersSchema.parse({
      q: query,
      minBudget,
      maxBudget,
      status: status as any,
      page,
      limit
    })

    // Построение фильтра
    const where: any = {}
    
    // Добавляем фильтр по статусу только если он указан
    if (searchParamsValidated.status) {
      where.status = searchParamsValidated.status
    }

    if (searchParamsValidated.q) {
      where.OR = [
        { title: { contains: searchParamsValidated.q, mode: 'insensitive' } },
        { description: { contains: searchParamsValidated.q, mode: 'insensitive' } }
      ]
    }

    if (searchParamsValidated.minBudget || searchParamsValidated.maxBudget) {
      where.budgetCents = {}
      if (searchParamsValidated.minBudget) {
        where.budgetCents.gte = searchParamsValidated.minBudget
      }
      if (searchParamsValidated.maxBudget) {
        where.budgetCents.lte = searchParamsValidated.maxBudget
      }
    }

    // Получение заказов с пагинацией
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              displayName: true,
              rating: true,
              ratingsCount: true
            }
          },
          responses: {
            select: {
              id: true,
              priceCents: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (searchParamsValidated.page - 1) * searchParamsValidated.limit,
        take: searchParamsValidated.limit
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(total / searchParamsValidated.limit)

    return NextResponse.json({
      data: orders,
      pagination: {
        page: searchParamsValidated.page,
        limit: searchParamsValidated.limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    )
  }
}

// POST /api/orders - создание нового заказа
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация данных
    const validatedData = createOrderSchema.parse(body)
    
    // Создание заказа
    const order = await prisma.order.create({
      data: {
        ...validatedData,
        customerId: validatedData.customerId
      },
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            rating: true
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Неверные данные заказа' },
        { status: 400 }
      )
    }
    
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    )
  }
}
