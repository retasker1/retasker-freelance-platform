import { Context } from 'telegraf';

export async function deliverHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Получаем активные сделки пользователя
    const deals = await botCtx.apiService.getUserDeals(botCtx.userId);
    const activeDeals = deals.filter((deal: any) => deal.status === 'ACTIVE');
    
    if (!activeDeals || activeDeals.length === 0) {
      await ctx.reply('📦 У вас нет активных сделок для доставки.\n\n' +
        'Найдите интересные заказы: /orders');
      return;
    }

    let message = '📦 <b>Выберите сделку для доставки результата:</b>\n\n';
    
    activeDeals.slice(0, 5).forEach((deal: any, index: number) => {
      const budget = (deal.amountCents / 100).toFixed(0);
      
      message += `${index + 1}. <b>Сделка #${deal.id.substring(0, 8)}</b>\n` +
        `💰 Сумма: $${budget}\n` +
        `📅 Создана: ${new Date(deal.createdAt).toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = {
      inline_keyboard: activeDeals.slice(0, 5).map((deal: any) => [
        { text: `📦 Доставить #${deal.id.substring(0, 8)}`, callback_data: `deliver_${deal.id}` }
      ])
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in deliver handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}

export async function confirmDeliver(ctx: Context, dealId: string) {
  try {
    const message = '📦 <b>Подтверждение доставки</b>\n\n' +
      'Вы уверены, что хотите доставить результат по этой сделке?\n\n' +
      'После доставки заказчик сможет проверить результат и подтвердить завершение сделки.';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Да, доставить', callback_data: `confirm_deliver_${dealId}` },
          { text: '❌ Отмена', callback_data: 'my_deals' }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error confirming deliver:', error);
    await ctx.reply('❌ Ошибка при подтверждении доставки. Попробуйте позже.');
  }
}

export async function executeDeliver(ctx: Context, dealId: string) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Выполняем доставку
    const success = await botCtx.apiService.deliverDeal(dealId, botCtx.userId);

    if (success) {
      await ctx.reply('✅ <b>Результат успешно доставлен!</b>\n\n' +
        'Заказчик получил уведомление и может проверить результат.\n' +
        'После проверки он подтвердит завершение сделки.', { parse_mode: 'HTML' });
    } else {
      await ctx.reply('❌ Ошибка при доставке результата. Попробуйте позже.');
    }
  } catch (error) {
    console.error('Error executing deliver:', error);
    await ctx.reply('❌ Ошибка при доставке результата. Попробуйте позже.');
  }
}
