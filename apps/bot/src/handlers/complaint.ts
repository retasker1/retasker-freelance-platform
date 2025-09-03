import { Context } from 'telegraf';

export async function complaintHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Получаем активные и доставленные сделки пользователя
    const deals = await botCtx.apiService.getUserDeals(botCtx.userId);
    const complaintableDeals = deals.filter((deal: any) => 
      deal.status === 'ACTIVE' || deal.status === 'DELIVERED'
    );
    
    if (!complaintableDeals || complaintableDeals.length === 0) {
      await ctx.reply('⚠️ У вас нет сделок для подачи жалобы.\n\n' +
        'Проверьте ваши сделки: /my_deals');
      return;
    }

    let message = '⚠️ <b>Выберите сделку для подачи жалобы:</b>\n\n';
    
    complaintableDeals.slice(0, 5).forEach((deal: any, index: number) => {
      const budget = (deal.amountCents / 100).toFixed(0);
      
      const statusEmoji: Record<string, string> = {
        'ACTIVE': '🟢',
        'DELIVERED': '📦'
      };
      
      const statusText: Record<string, string> = {
        'ACTIVE': 'В работе',
        'DELIVERED': 'Доставлено'
      };
      
      const emoji = statusEmoji[deal.status] || '❓';
      const text = statusText[deal.status] || 'Неизвестно';
      
      message += `${index + 1}. ${emoji} <b>Сделка #${deal.id.substring(0, 8)}</b>\n` +
        `💰 Сумма: $${budget}\n` +
        `📊 Статус: ${text}\n` +
        `📅 Создана: ${new Date(deal.createdAt).toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = {
      inline_keyboard: complaintableDeals.slice(0, 5).map((deal: any) => [
        { text: `⚠️ Жалоба #${deal.id.substring(0, 8)}`, callback_data: `complaint_${deal.id}` }
      ])
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in complaint handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке сделок. Попробуйте позже.');
  }
}

export async function startComplaint(ctx: Context, dealId: string) {
  try {
    const message = '⚠️ <b>Подача жалобы</b>\n\n' +
      'Выберите причину жалобы:';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '❌ Некачественная работа', callback_data: `complaint_reason_quality_${dealId}` },
          { text: '⏰ Нарушение сроков', callback_data: `complaint_reason_deadline_${dealId}` }
        ],
        [
          { text: '💬 Некорректное общение', callback_data: `complaint_reason_communication_${dealId}` },
          { text: '🚫 Отказ от работы', callback_data: `complaint_reason_refusal_${dealId}` }
        ],
        [
          { text: '🔍 Другое', callback_data: `complaint_reason_other_${dealId}` }
        ],
        [
          { text: '❌ Отмена', callback_data: 'my_deals' }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error starting complaint:', error);
    await ctx.reply('❌ Ошибка при создании жалобы. Попробуйте позже.');
  }
}

export async function handleComplaintReason(ctx: Context, reason: string) {
  try {
    const botCtx = ctx as any;
    
    // Парсим reason для получения dealId
    const parts = reason.split('_');
    const reasonType = parts[0];
    const dealId = parts[1];
    
    const reasonTexts: Record<string, string> = {
      'quality': 'Некачественная работа',
      'deadline': 'Нарушение сроков',
      'communication': 'Некорректное общение',
      'refusal': 'Отказ от работы',
      'other': 'Другое'
    };
    
    const reasonText = reasonTexts[reasonType] || 'Неизвестная причина';
    
    // Сохраняем данные жалобы в контексте
    botCtx.dealId = dealId;
    botCtx.complaintReason = reasonText;
    
    await ctx.reply(`📝 <b>Описание жалобы</b>\n\n` +
      `Причина: ${reasonText}\n\n` +
      `Опишите подробно суть проблемы. Это поможет нам разобраться в ситуации и принять справедливое решение.`, 
      { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error handling complaint reason:', error);
    await ctx.reply('❌ Ошибка при обработке причины жалобы. Попробуйте позже.');
  }
}

export async function submitComplaint(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId || !botCtx.dealId || !botCtx.complaintReason) {
      await ctx.reply('❌ Ошибка данных жалобы. Попробуйте создать жалобу заново.');
      return;
    }

    const description = (ctx.message as any)?.text || '';
    
    if (!description || description.length < 10) {
      await ctx.reply('❌ Описание жалобы должно содержать минимум 10 символов. Попробуйте еще раз.');
      return;
    }

    // Отправляем жалобу
    const success = await botCtx.apiService.createComplaint(
      botCtx.dealId, 
      botCtx.userId, 
      botCtx.complaintReason, 
      description
    );

    if (success) {
      await ctx.reply('✅ <b>Жалоба успешно подана!</b>\n\n' +
        'Мы рассмотрим вашу жалобу в течение 24 часов и свяжемся с вами для решения вопроса.\n\n' +
        'Спасибо за обращение!', { parse_mode: 'HTML' });
      
      // Очищаем контекст
      botCtx.dealId = undefined;
      botCtx.complaintReason = undefined;
    } else {
      await ctx.reply('❌ Ошибка при подаче жалобы. Попробуйте позже.');
    }
  } catch (error) {
    console.error('Error submitting complaint:', error);
    await ctx.reply('❌ Ошибка при подаче жалобы. Попробуйте позже.');
  }
}
