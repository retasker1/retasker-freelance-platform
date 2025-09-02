import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id] - получение заказа по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            rating: true,
            ratingsCount: true,
            avatarUrl: true
          }
        },
        responses: {
          include: {
            freelancer: {
              select: {
                id: true,
                displayName: true,
                rating: true,
                ratingsCount: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        deal: {
          include: {
            freelancer: {
              select: {
                id: true,
                displayName: true,
                rating: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - обновление заказа
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // TODO: Проверить права доступа (только владелец заказа)
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        budgetCents: body.budgetCents,
        status: body.status
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

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - удаление заказа
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Проверить права доступа (только владелец заказа)
    
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Заказ удален' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа' },
      { status: 500 }
    )
  }
}

