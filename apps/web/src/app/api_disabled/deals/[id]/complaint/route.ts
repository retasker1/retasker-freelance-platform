import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для жалобы
const complaintSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
});

// POST /api/deals/[id]/complaint - подать жалобу
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = complaintSchema.parse(body);

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

    // Проверяем, что пользователь - участник сделки
    const isParticipant = deal.customerId === validatedData.userId || deal.freelancerId === validatedData.userId;
    if (!isParticipant) {
      return NextResponse.json(
        { ok: false, error: 'Только участники сделки могут подавать жалобы' },
        { status: 403 }
      );
    }

    // Проверяем, что жалоба еще не подана
    const existingComplaint = await prisma.complaint.findFirst({
      where: {
        dealId: params.id,
        authorId: validatedData.userId
      }
    });

    if (existingComplaint) {
      return NextResponse.json(
        { ok: false, error: 'Жалоба уже подана' },
        { status: 409 }
      );
    }

    // Создаем жалобу
    const complaint = await prisma.complaint.create({
      data: {
        dealId: params.id,
        authorId: validatedData.userId,
        text: validatedData.description,
        status: 'OPEN',
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            tgId: true,
          }
        },
        deal: {
          select: {
            id: true,
            status: true,
            order: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      data: complaint,
      message: 'Жалоба подана. Администрация рассмотрит её в ближайшее время.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Ошибка подачи жалобы' },
      { status: 500 }
    );
  }
}
