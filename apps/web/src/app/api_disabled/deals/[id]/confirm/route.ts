import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/deals/[id]/confirm - подтвердить завершение (для заказчика)
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

    // Проверяем, что пользователь - заказчик
    if (deal.customerId !== userId) {
      return NextResponse.json(
        { ok: false, error: 'Только заказчик может подтвердить завершение' },
        { status: 403 }
      );
    }

    // Проверяем статус сделки
    if (deal.status !== 'delivered') {
      return NextResponse.json(
        { ok: false, error: 'Сделка не в статусе "доставлено"' },
        { status: 400 }
      );
    }

    // Обновляем статус сделки на "завершено"
    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: { status: 'completed' },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            description: true,
            budgetCents: true,
            status: true,
          }
        },
        customer: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        },
        freelancer: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        }
      }
    });

    // Обновляем статус заказа на "завершен"
    await prisma.order.update({
      where: { id: deal.orderId },
      data: { status: 'completed' }
    });

    return NextResponse.json({
      ok: true,
      data: updatedDeal,
      message: 'Сделка завершена. Средства переведены исполнителю.'
    });
  } catch (error) {
    console.error('Error confirming deal:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка подтверждения завершения' },
      { status: 500 }
    );
  }
}
