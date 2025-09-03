import { Context } from 'telegraf';
import { BotContext, Deal } from '../types';

export async function deliverHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService!;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем активные сделки пользователя как исполнителя
    const deals = await apiService.getUserDeals(botCtx.userId);
    const freelancerDeals = deals.filter((deal: Deal) => deal.freelancerId === botCtx.userId && deal.status === 'ACTIVE');
    
    if (freelancerDeals.length === 0) {
      await ctx.reply(
        'У вас нет активных сделок в качестве исполнителя.\n\n' +
        'Откликнитесь на заказ на сайте: https://retasker.com'
      );
      return;
    }

    // Создаем клавиатуру с кнопками для каждой сделки
    const keyboard = {
      reply_markup: {
        inline_keyboard: freelancerDeals.map((deal: Deal) => [
          {
            text: `${deal.order.title} - $${(deal.order.budgetCents / 100).toFixed(2)}`,
            callback_data: `deliver_${deal.id}`
          }
        ])
      }
    };

    await ctx.reply(
      '📤 Выберите сделку для отправки результата:',
      keyboard
    );
    
  } catch (error) {
    console.error('Error in deliver handler:', error);
    await ctx.reply('Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}

export async function confirmDeliver(ctx: Context, dealId: string) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService!;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем информацию о сделке
    const deal = await apiService.getDeal(dealId);
    if (!deal) {
      await ctx.reply('Сделка не найдена или у вас нет доступа к ней.');
      return;
    }

    // Проверяем, что пользователь - исполнитель
    if (deal.freelancerId !== botCtx.userId) {
      await ctx.reply('Только исполнитель может отправить результат.');
      return;
    }

    // Проверяем статус сделки
    if (deal.status !== 'ACTIVE') {
      await ctx.reply('Сделка не активна. Результат можно отправить только для активных сделок.');
      return;
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Да, отправить результат', callback_data: `confirm_deliver_${dealId}` },
            { text: '❌ Отмена', callback_data: `deal_${dealId}` }
          ]
        ]
      }
    };

    await ctx.reply(
      `📤 Подтверждение отправки результата\n\n` +
      `Сделка: ${deal.order.title}\n` +
      `Сумма: $${(deal.order.budgetCents / 100).toFixed(2)}\n\n` +
      `Вы уверены, что хотите отправить результат? После отправки заказчик сможет его проверить и подтвердить завершение.`,
      keyboard
    );
    
  } catch (error) {
    console.error('Error confirming deliver:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function executeDeliver(ctx: Context, dealId: string) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService!;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Отправляем результат
    const success = await apiService.deliverDeal(dealId, botCtx.userId);
    
    if (success) {
      await ctx.reply(
        '✅ Результат успешно отправлен!\n\n' +
        'Заказчик получит уведомление и сможет проверить результат. ' +
        'После подтверждения средства будут переведены на ваш счет.'
      );
    } else {
      await ctx.reply('❌ Ошибка при отправке результата. Попробуйте позже.');
    }
    
  } catch (error) {
    console.error('Error executing deliver:', error);
    await ctx.reply('Произошла ошибка при отправке результата. Попробуйте позже.');
  }
}
