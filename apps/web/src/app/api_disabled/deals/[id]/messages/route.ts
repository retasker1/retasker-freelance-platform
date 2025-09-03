import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации для отправки сообщения
const sendMessageSchema = z.object({
  senderId: z.string().min(1),
  content: z.string().min(1).max(2000),
  isFromCustomer: z.boolean(),
});

// GET /api/deals/[id]/messages - получить сообщения чата
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь - участник сделки
    const deal = await prisma.deal.findUnique({
      where: { id: params.id }
    });

    if (!deal) {
      return NextResponse.json(
        { ok: false, error: 'Сделка не найдена' },
        { status: 404 }
      );
    }

    const isParticipant = deal.customerId === userId || deal.freelancerId === userId;
    if (!isParticipant) {
      return NextResponse.json(
        { ok: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: { dealId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
          }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка загрузки сообщений' },
      { status: 500 }
    );
  }
}

// POST /api/deals/[id]/messages - отправить сообщение
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Проверяем, что сделка существует
    const deal = await prisma.deal.findUnique({
      where: { id: params.id }
    });

    if (!deal) {
      return NextResponse.json(
        { ok: false, error: 'Сделка не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь - участник сделки
    const isParticipant = deal.customerId === validatedData.senderId || deal.freelancerId === validatedData.senderId;
    if (!isParticipant) {
      return NextResponse.json(
        { ok: false, error: 'Только участники сделки могут отправлять сообщения' },
        { status: 403 }
      );
    }

    // Проверяем, что роль соответствует действительности
    const isActuallyCustomer = deal.customerId === validatedData.senderId;
    if (isActuallyCustomer !== validatedData.isFromCustomer) {
      return NextResponse.json(
        { ok: false, error: 'Неверная роль отправителя' },
        { status: 400 }
      );
    }

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        dealId: params.id,
        senderId: validatedData.senderId,
        type: 'text',
        payload: JSON.stringify({ content: validatedData.content, isFromCustomer: validatedData.isFromCustomer }),
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
          }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      data: message
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Ошибка отправки сообщения' },
      { status: 500 }
    );
  }
}
