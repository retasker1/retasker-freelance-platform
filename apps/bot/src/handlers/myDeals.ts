import { Context } from 'telegraf';
import { BotContext } from '../types';

export async function myDealsHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем все сделки пользователя
    const deals = await apiService.getUserDeals(botCtx.userId);
    
    if (deals.length === 0) {
      await ctx.reply(
        'У вас пока нет сделок.\n\n' +
        'Создайте заказ или откликнитесь на существующий проект на сайте: https://retasker.com'
      );
      return;
    }

    // Группируем сделки по статусу
    const activeDeals = deals.filter(d => d.status === 'active');
    const deliveredDeals = deals.filter(d => d.status === 'delivered');
    const completedDeals = deals.filter(d => d.status === 'completed');

    let message = '📋 Ваши сделки:\n\n';

    if (activeDeals.length > 0) {
      message += '🟢 Активные сделки:\n';
      for (const deal of activeDeals) {
        const isCustomer = deal.customerId === botCtx.userId;
        const role = isCustomer ? 'Заказчик' : 'Исполнитель';
        message += `• ${deal.order.title} (${role}) - $${(deal.finalPrice / 100).toFixed(2)}\n`;
      }
      message += '\n';
    }

    if (deliveredDeals.length > 0) {
      message += '🟡 Ожидают подтверждения:\n';
      for (const deal of deliveredDeals) {
        const isCustomer = deal.customerId === botCtx.userId;
        const role = isCustomer ? 'Заказчик' : 'Исполнитель';
        message += `• ${deal.order.title} (${role}) - $${(deal.finalPrice / 100).toFixed(2)}\n`;
      }
      message += '\n';
    }

    if (completedDeals.length > 0) {
      message += '✅ Завершенные сделки:\n';
      for (const deal of completedDeals) {
        const isCustomer = deal.customerId === botCtx.userId;
        const role = isCustomer ? 'Заказчик' : 'Исполнитель';
        message += `• ${deal.order.title} (${role}) - $${(deal.finalPrice / 100).toFixed(2)}\n`;
      }
    }

    // Создаем клавиатуру с кнопками для каждой активной сделки
    const keyboard = {
      reply_markup: {
        inline_keyboard: deals
          .filter(d => d.status === 'active' || d.status === 'delivered')
          .map(deal => [
            {
              text: `${deal.order.title} - $${(deal.finalPrice / 100).toFixed(2)}`,
              callback_data: `deal_${deal.id}`
            }
          ])
      }
    };

    await ctx.reply(message, keyboard);
    
  } catch (error) {
    console.error('Error in myDeals handler:', error);
    await ctx.reply('Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}
