import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/deals/[id] - получить сделку по ID и проверить участие пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
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

    if (!deal) {
      return NextResponse.json(
        { ok: false, error: 'Сделка не найдена' },
        { status: 404 }
      );
    }

    // Если передан userId, проверяем участие
    if (userId) {
      const isParticipant = deal.customerId === userId || deal.freelancerId === userId;
      if (!isParticipant) {
        return NextResponse.json(
          { ok: false, error: 'Доступ запрещен' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      data: deal
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка загрузки сделки' },
      { status: 500 }
    );
  }
}

// PUT /api/deals/[id] - обновить сделку
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, finalPrice } = body;

    const deal = await prisma.deal.findUnique({
      where: { id: params.id }
    });

    if (!deal) {
      return NextResponse.json(
        { ok: false, error: 'Сделка не найдена' },
        { status: 404 }
      );
    }

    const updateData: { status?: string; finalPrice?: number } = {};
    if (status) updateData.status = status;
    if (finalPrice) updateData.finalPrice = finalPrice;

    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      ok: true,
      data: updatedDeal
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка обновления сделки' },
      { status: 500 }
    );
  }
}
