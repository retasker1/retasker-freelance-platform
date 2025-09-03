import { Context } from 'telegraf';

export async function ordersHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService) {
      await ctx.reply('❌ Сервис недоступен. Попробуйте позже.');
      return;
    }

    // Получаем открытые заказы
    const orders = await botCtx.apiService.getOpenOrders();
    
    if (!orders || orders.length === 0) {
      await ctx.reply('📋 Пока нет открытых заказов.\n\n' +
        'Создайте заказ на сайте: https://retasker.com/orders/new');
      return;
    }

    let message = '📋 <b>Открытые заказы:</b>\n\n';
    
    orders.slice(0, 10).forEach((order: any, index: number) => {
      const budget = (order.budgetCents / 100).toFixed(0);
      const deadline = order.deadline ? 
        new Date(order.deadline).toLocaleDateString('ru-RU') : 
        'Не указан';
      
      message += `${index + 1}. <b>${order.title}</b>\n` +
        `💰 Бюджет: $${budget}\n` +
        `📅 Дедлайн: ${deadline}\n` +
        `📝 ${order.description.substring(0, 100)}${order.description.length > 100 ? '...' : ''}\n\n`;
    });

    if (orders.length > 10) {
      message += `... и еще ${orders.length - 10} заказов\n\n`;
    }

    message += '💡 <b>Как откликнуться:</b>\n' +
      '1. Перейдите на сайт: https://retasker.com/orders\n' +
      '2. Найдите интересный заказ\n' +
      '3. Нажмите "Откликнуться"\n' +
      '4. Ожидайте ответа заказчика';

    await ctx.reply(message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error in orders handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке заказов. Попробуйте позже.');
  }
}

export async function myOrdersHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Получаем заказы пользователя
    const orders = await botCtx.apiService.getUserOrders(botCtx.userId);
    
    if (!orders || orders.length === 0) {
      await ctx.reply('📋 У вас пока нет заказов.\n\n' +
        'Создайте заказ на сайте: https://retasker.com/orders/new');
      return;
    }

    let message = '📋 <b>Ваши заказы:</b>\n\n';
    
    orders.forEach((order: any, index: number) => {
      const budget = (order.budgetCents / 100).toFixed(0);
      const deadline = order.deadline ? 
        new Date(order.deadline).toLocaleDateString('ru-RU') : 
        'Не указан';
      
      const statusEmoji: Record<string, string> = {
        'OPEN': '🟢',
        'IN_PROGRESS': '🟡',
        'COMPLETED': '✅',
        'CANCELLED': '❌'
      };
      
      const statusText: Record<string, string> = {
        'OPEN': 'Открыт',
        'IN_PROGRESS': 'В работе',
        'COMPLETED': 'Завершен',
        'CANCELLED': 'Отменен'
      };
      
      const emoji = statusEmoji[order.status] || '❓';
      const text = statusText[order.status] || 'Неизвестно';
      
      message += `${index + 1}. ${emoji} <b>${order.title}</b>\n` +
        `💰 Бюджет: $${budget}\n` +
        `📅 Дедлайн: ${deadline}\n` +
        `📊 Статус: ${text}\n` +
        `📝 ${order.description.substring(0, 80)}${order.description.length > 80 ? '...' : ''}\n\n`;
    });

    message += '💡 <b>Управление заказами:</b>\n' +
      'Перейдите на сайт: https://retasker.com/orders';

    await ctx.reply(message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error in my orders handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке ваших заказов. Попробуйте позже.');
  }
}
