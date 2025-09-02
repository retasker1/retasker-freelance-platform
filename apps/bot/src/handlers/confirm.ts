import { Context } from 'telegraf';
import { BotContext } from '../types';

export async function confirmHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем сделки в статусе "доставлено" для заказчика
    const deals = await apiService.getUserDeals(botCtx.userId, 'delivered');
    const customerDeals = deals.filter(deal => deal.customerId === botCtx.userId);
    
    if (customerDeals.length === 0) {
      await ctx.reply(
        'У вас нет сделок, ожидающих подтверждения.\n\n' +
        'Исполнители еще не отправили результаты по вашим заказам.'
      );
      return;
    }

    // Создаем клавиатуру с кнопками для каждой сделки
    const keyboard = {
      reply_markup: {
        inline_keyboard: customerDeals.map(deal => [
          {
            text: `${deal.order.title} - $${(deal.finalPrice / 100).toFixed(2)}`,
            callback_data: `confirm_${deal.id}`
          }
        ])
      }
    };

    await ctx.reply(
      '✅ Выберите сделку для подтверждения завершения:',
      keyboard
    );
    
  } catch (error) {
    console.error('Error in confirm handler:', error);
    await ctx.reply('Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}

export async function confirmCompletion(ctx: Context, dealId: string) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем информацию о сделке
    const deal = await apiService.getDeal(dealId, botCtx.userId);
    if (!deal) {
      await ctx.reply('Сделка не найдена или у вас нет доступа к ней.');
      return;
    }

    // Проверяем, что пользователь - заказчик
    if (deal.customerId !== botCtx.userId) {
      await ctx.reply('Только заказчик может подтвердить завершение.');
      return;
    }

    // Проверяем статус сделки
    if (deal.status !== 'delivered') {
      await ctx.reply('Сделка не в статусе "доставлено". Подтверждение возможно только после отправки результата исполнителем.');
      return;
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Да, подтвердить завершение', callback_data: `execute_confirm_${dealId}` },
            { text: '❌ Отмена', callback_data: `deal_${dealId}` }
          ]
        ]
      }
    };

    await ctx.reply(
      `✅ Подтверждение завершения сделки\n\n` +
      `Сделка: ${deal.order.title}\n` +
      `Исполнитель: ${deal.freelancer.firstName} ${deal.freelancer.lastName}\n` +
      `Сумма: $${(deal.finalPrice / 100).toFixed(2)}\n\n` +
      `Вы уверены, что работа выполнена качественно и можно завершить сделку? ` +
      `После подтверждения средства будут переведены исполнителю.`,
      keyboard
    );
    
  } catch (error) {
    console.error('Error confirming completion:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function executeConfirm(ctx: Context, dealId: string) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Подтверждаем завершение
    const success = await apiService.confirmCompletion(dealId, botCtx.userId);
    
    if (success) {
      await ctx.reply(
        '🎉 Сделка успешно завершена!\n\n' +
        'Средства переведены исполнителю. ' +
        'Спасибо за использование Retasker!'
      );
    } else {
      await ctx.reply('❌ Ошибка при подтверждении завершения. Попробуйте позже.');
    }
    
  } catch (error) {
    console.error('Error executing confirm:', error);
    await ctx.reply('Произошла ошибка при подтверждении завершения. Попробуйте позже.');
  }
}
