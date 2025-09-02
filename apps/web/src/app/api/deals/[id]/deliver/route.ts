import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/deals/[id]/deliver - отправить результат (для исполнителя)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        freelancer: true,
        customer: true,
        order: true
      }
    });

    if (!deal) {
      return NextResponse.json(
        { ok: false, error: 'Сделка не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь - исполнитель
    if (deal.freelancerId !== userId) {
      return NextResponse.json(
        { ok: false, error: 'Только исполнитель может отправить результат' },
        { status: 403 }
      );
    }

    // Проверяем статус сделки
    if (deal.status !== 'active') {
      return NextResponse.json(
        { ok: false, error: 'Сделка не активна' },
        { status: 400 }
      );
    }

    // Обновляем статус сделки на "доставлено"
    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: { status: 'delivered' },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            description: true,
            budgetCents: true,
            category: true,
            deadline: true,
            status: true,
          }
        },
        response: {
          select: {
            id: true,
            message: true,
            proposedPrice: true,
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramId: true,
          }
        },
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramId: true,
          }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      data: updatedDeal,
      message: 'Результат отправлен. Ожидайте подтверждения от заказчика.'
    });
  } catch (error) {
    console.error('Error delivering result:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка отправки результата' },
      { status: 500 }
    );
  }
}
