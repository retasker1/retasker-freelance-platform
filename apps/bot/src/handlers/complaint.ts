import { Context } from 'telegraf';
import { BotContext, Deal } from '../types';

export async function complaintHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService!;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем все сделки пользователя
    const deals = await apiService.getUserDeals(botCtx.userId);
    
    if (deals.length === 0) {
      await ctx.reply(
        'У вас нет сделок для подачи жалобы.\n\n' +
        'Создайте заказ или откликнитесь на существующий проект на сайте: https://retasker.com'
      );
      return;
    }

    // Создаем клавиатуру с кнопками для каждой сделки
    const keyboard = {
      reply_markup: {
        inline_keyboard: deals.map((deal: Deal) => [
          {
            text: `${deal.order.title} - $${(deal.order.budgetCents / 100).toFixed(2)}`,
            callback_data: `complaint_${deal.id}`
          }
        ])
      }
    };

    await ctx.reply(
      '⚠️ Выберите сделку для подачи жалобы:',
      keyboard
    );
    
  } catch (error) {
    console.error('Error in complaint handler:', error);
    await ctx.reply('Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}

export async function startComplaint(ctx: Context, dealId: string) {
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

    // Сохраняем dealId в контексте для обработки жалобы
    botCtx.dealId = dealId;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '❌ Некачественная работа', callback_data: 'complaint_reason_quality' },
            { text: '⏰ Нарушение сроков', callback_data: 'complaint_reason_deadline' }
          ],
          [
            { text: '💰 Спор по оплате', callback_data: 'complaint_reason_payment' },
            { text: '🚫 Неадекватное поведение', callback_data: 'complaint_reason_behavior' }
          ],
          [
            { text: '📝 Другое', callback_data: 'complaint_reason_other' },
            { text: '❌ Отмена', callback_data: `deal_${dealId}` }
          ]
        ]
      }
    };

    await ctx.reply(
      `⚠️ Подача жалобы\n\n` +
      `Сделка: ${deal.order.title}\n` +
      `Сумма: $${(deal.order.budgetCents / 100).toFixed(2)}\n` +
      `Статус: ${deal.status}\n\n` +
      `Выберите причину жалобы:`,
      keyboard
    );
    
  } catch (error) {
    console.error('Error starting complaint:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleComplaintReason(ctx: Context, reason: string) {
  const botCtx = ctx as BotContext;
  
  try {
    if (!botCtx.dealId) {
      await ctx.reply('Ошибка: не найдена сделка для жалобы.');
      return;
    }

    // Сохраняем причину жалобы в контексте
    botCtx.complaintReason = reason;

    const reasonTexts = {
      'quality': 'Некачественная работа',
      'deadline': 'Нарушение сроков',
      'payment': 'Спор по оплате',
      'behavior': 'Неадекватное поведение',
      'other': 'Другое'
    };

    await ctx.reply(
      `📝 Описание жалобы\n\n` +
      `Причина: ${reasonTexts[reason as keyof typeof reasonTexts]}\n\n` +
      `Пожалуйста, опишите подробно суть проблемы. ` +
      `Ваше описание поможет администрации разобраться в ситуации.\n\n` +
      `Отправьте сообщение с описанием:`
    );
    
  } catch (error) {
    console.error('Error handling complaint reason:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function submitComplaint(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService!;
  
  try {
    if (!botCtx.userId || !botCtx.dealId) {
      await ctx.reply('Ошибка: не найдены данные для подачи жалобы.');
      return;
    }

    const reason = botCtx.complaintReason;
    if (!reason) {
      await ctx.reply('Ошибка: не выбрана причина жалобы.');
      return;
    }

    // Отправляем жалобу
    const success = await apiService.createComplaint(
      botCtx.dealId, 
      botCtx.userId, 
      reason
    );
    
    if (success) {
      await ctx.reply(
        '✅ Жалоба успешно подана!\n\n' +
        'Администрация рассмотрит вашу жалобу в ближайшее время. ' +
        'Мы свяжемся с вами для уточнения деталей.'
      );
      
      // Очищаем контекст
      botCtx.complaintReason = undefined;
      botCtx.dealId = undefined;
    } else {
      await ctx.reply('❌ Ошибка при подаче жалобы. Попробуйте позже.');
    }
    
  } catch (error) {
    console.error('Error submitting complaint:', error);
    await ctx.reply('Произошла ошибка при подаче жалобы. Попробуйте позже.');
  }
}
