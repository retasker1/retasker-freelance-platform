import { prisma } from "../lib/prisma";

/**
 * Генерирует следующий короткий код для заказа
 * Формат: ORD-0001, ORD-0002, ..., ORD-9999
 */
export async function generateOrderShortCode(): Promise<string> {
  try {
    // Находим последний заказ с коротким кодом
    const lastOrder = await prisma.order.findFirst({
      where: {
        shortCode: {
          startsWith: "ORD-"
        }
      },
      orderBy: {
        shortCode: 'desc'
      }
    });

    let nextNumber = 1;
    
    if (lastOrder && lastOrder.shortCode) {
      // Извлекаем номер из последнего кода
      const match = lastOrder.shortCode.match(/ORD-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Проверяем, не превысили ли лимит 9999
    if (nextNumber > 9999) {
      throw new Error("Достигнут лимит количества заказов (9999)");
    }

    // Форматируем номер с ведущими нулями
    const shortCode = `ORD-${nextNumber.toString().padStart(4, '0')}`;
    
    return shortCode;
  } catch (error) {
    console.error("Error generating short code:", error);
    throw error;
  }
}

/**
 * Проверяет, существует ли короткий код
 */
export async function isShortCodeExists(shortCode: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { shortCode }
    });
    return !!order;
  } catch (error) {
    console.error("Error checking short code:", error);
    return false;
  }
}
