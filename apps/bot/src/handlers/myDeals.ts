import { Context } from 'telegraf';

export async function myDealsHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Получаем сделки пользователя
    const deals = await botCtx.apiService.getUserDeals(botCtx.userId);
    
    if (!deals || deals.length === 0) {
      await ctx.reply('🤝 У вас пока нет сделок.\n\n' +
        'Найдите интересные заказы: /orders');
      return;
    }

    let message = '🤝 <b>Ваши сделки:</b>\n\n';
    
    deals.forEach((deal: any, index: number) => {
      const budget = (deal.amountCents / 100).toFixed(0);
      
      const statusEmoji: Record<string, string> = {
        'PENDING': '⏳',
        'ACTIVE': '🟢',
        'DELIVERED': '📦',
        'COMPLETED': '✅',
        'CANCELLED': '❌'
      };
      
      const statusText: Record<string, string> = {
        'PENDING': 'Ожидает подтверждения',
        'ACTIVE': 'В работе',
        'DELIVERED': 'Доставлено',
        'COMPLETED': 'Завершено',
        'CANCELLED': 'Отменено'
      };
      
      const emoji = statusEmoji[deal.status] || '❓';
      const text = statusText[deal.status] || 'Неизвестно';
      
      message += `${index + 1}. ${emoji} <b>Сделка #${deal.id.substring(0, 8)}</b>\n` +
        `💰 Сумма: $${budget}\n` +
        `📊 Статус: ${text}\n` +
        `📅 Создана: ${new Date(deal.createdAt).toLocaleDateString('ru-RU')}\n\n`;
    });

    message += '💡 <b>Управление сделками:</b>\n' +
      'Используйте кнопки ниже для взаимодействия со сделками';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💬 Чат', callback_data: 'chat_menu' },
          { text: '📋 Заказы', callback_data: 'orders' }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in my deals handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке ваших сделок. Попробуйте позже.');
  }
}
