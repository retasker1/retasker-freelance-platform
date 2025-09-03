import { Context } from 'telegraf';

export async function chatHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Получаем сделки пользователя
    const deals = await botCtx.apiService.getUserDeals(botCtx.userId);
    
    if (!deals || deals.length === 0) {
      await ctx.reply('💬 У вас пока нет активных сделок для общения.\n\n' +
        'Найдите интересные заказы: /orders');
      return;
    }

    let message = '💬 <b>Выберите сделку для общения:</b>\n\n';
    
    deals.slice(0, 5).forEach((deal: any, index: number) => {
      const budget = (deal.amountCents / 100).toFixed(0);
      
      message += `${index + 1}. <b>Сделка #${deal.id.substring(0, 8)}</b>\n` +
        `💰 Сумма: $${budget}\n` +
        `📅 Создана: ${new Date(deal.createdAt).toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = {
      inline_keyboard: deals.slice(0, 5).map((deal: any) => [
        { text: `💬 Сделка #${deal.id.substring(0, 8)}`, callback_data: `chat_${deal.id}` }
      ])
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in chat handler:', error);
    await ctx.reply('❌ Произошла ошибка при загрузке чатов. Попробуйте позже.');
  }
}

export async function openChat(ctx: Context, dealId: string) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService) {
      await ctx.reply('❌ Сервис недоступен. Попробуйте позже.');
      return;
    }

    // Получаем сообщения сделки
    const messages = await botCtx.apiService.getMessages(dealId);
    
    let message = '💬 <b>История сообщений:</b>\n\n';
    
    if (!messages || messages.length === 0) {
      message += 'Пока нет сообщений. Начните общение!';
    } else {
      messages.slice(-10).forEach((msg: any) => {
        const time = new Date(msg.createdAt).toLocaleString('ru-RU');
        const sender = msg.isFromBot ? '🤖 Бот' : '👤 Вы';
        message += `${sender} (${time}):\n${msg.content}\n\n`;
      });
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📝 Отправить сообщение', callback_data: `send_msg_${dealId}` },
          { text: '🔄 Обновить', callback_data: `refresh_chat_${dealId}` }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error opening chat:', error);
    await ctx.reply('❌ Ошибка при загрузке чата. Попробуйте позже.');
  }
}

export async function sendMessage(ctx: Context, dealId: string, content: string) {
  try {
    const botCtx = ctx as any;
    
    if (!botCtx.apiService || !botCtx.userId) {
      await ctx.reply('❌ Необходимо войти в систему. Используйте /start');
      return;
    }

    // Отправляем сообщение
    const message = await botCtx.apiService.createMessage(
      dealId, 
      botCtx.userId, 
      content, 
      false // isFromCustomer - нужно определить по роли пользователя
    );

    if (message) {
      await ctx.reply('✅ Сообщение отправлено!');
      // Обновляем чат
      await openChat(ctx, dealId);
    } else {
      await ctx.reply('❌ Ошибка при отправке сообщения. Попробуйте позже.');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    await ctx.reply('❌ Ошибка при отправке сообщения. Попробуйте позже.');
  }
}
