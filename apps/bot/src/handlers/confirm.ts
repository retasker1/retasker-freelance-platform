import { Context } from 'telegraf';

export async function confirmHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Получаем доставленные сделки пользователя
    const deals = await botCtx.apiService.getUserDeals(botCtx.userId);
    const deliveredDeals = deals.filter((deal: any) => deal.status === 'DELIVERED');
    
    if (!deliveredDeals || deliveredDeals.length === 0) {
      await ctx.reply('✅ У вас нет доставленных сделок для подтверждения.\n\n' +
        'Проверьте ваши сделки: /my_deals');
      return;
    }

    let message = '✅ <b>Выберите сделку для подтверждения завершения:</b>\n\n';
    
    deliveredDeals.slice(0, 5).forEach((deal: any, index: number) => {
      const budget = (deal.amountCents / 100).toFixed(0);
      
      message += `${index + 1}. <b>Сделка #${deal.id.substring(0, 8)}</b>\n` +
        `💰 Сумма: $${budget}\n` +
        `📅 Доставлена: ${new Date(deal.deliveredAt || deal.updatedAt).toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = {
      inline_keyboard: deliveredDeals.slice(0, 5).map((deal: any) => [
        { text: `✅ Подтвердить #${deal.id.substring(0, 8)}`, callback_data: `confirm_${deal.id}` }
      ])
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in confirm handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}

export async function confirmCompletion(ctx: Context, dealId: string) {
  try {
    const message = '✅ <b>Подтверждение завершения сделки</b>\n\n' +
      'Вы уверены, что хотите подтвердить завершение этой сделки?\n\n' +
      'После подтверждения:\n' +
      '• Сделка будет помечена как завершенная\n' +
      '• Исполнитель получит оплату\n' +
      '• Сделка будет закрыта';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Да, подтвердить', callback_data: `execute_confirm_${dealId}` },
          { text: '❌ Отмена', callback_data: 'my_deals' }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error confirming completion:', error);
    await ctx.reply('❌ Ошибка при подтверждении завершения. Попробуйте позже.');
  }
}

export async function executeConfirm(ctx: Context, dealId: string) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Выполняем подтверждение
    const success = await botCtx.apiService.confirmDeal(dealId, botCtx.userId);

    if (success) {
      await ctx.reply('🎉 <b>Сделка успешно завершена!</b>\n\n' +
        '• Сделка помечена как завершенная\n' +
        '• Исполнитель получил уведомление\n' +
        '• Оплата будет произведена автоматически\n\n' +
        'Спасибо за использование Retasker!', { parse_mode: 'HTML' });
    } else {
      await ctx.reply('❌ Ошибка при подтверждении завершения. Попробуйте позже.');
    }
  } catch (error) {
    console.error('Error executing confirm:', error);
    await ctx.reply('❌ Ошибка при подтверждении завершения. Попробуйте позже.');
  }
}
