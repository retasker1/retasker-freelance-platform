import { Context } from 'telegraf';
import { BotContext } from '../types';

export async function chatHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем активные сделки пользователя
    const deals = await apiService.getUserDeals(botCtx.userId, 'active');
    const deliveredDeals = await apiService.getUserDeals(botCtx.userId, 'delivered');
    const allActiveDeals = [...deals, ...deliveredDeals];
    
    if (allActiveDeals.length === 0) {
      await ctx.reply(
        'У вас нет активных сделок для общения.\n\n' +
        'Создайте заказ или откликнитесь на существующий проект на сайте: https://retasker.com'
      );
      return;
    }

    // Создаем клавиатуру с кнопками для каждой сделки
    const keyboard = {
      reply_markup: {
        inline_keyboard: allActiveDeals.map(deal => [
          {
            text: `${deal.order.title} - $${(deal.finalPrice / 100).toFixed(2)}`,
            callback_data: `chat_${deal.id}`
          }
        ])
      }
    };

    await ctx.reply(
      '💬 Выберите сделку для общения:',
      keyboard
    );
    
  } catch (error) {
    console.error('Error in chat handler:', error);
    await ctx.reply('Произошла ошибка при загрузке чатов. Попробуйте позже.');
  }
}

export async function openChat(ctx: Context, dealId: string) {
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

    // Получаем сообщения чата
    const messages = await apiService.getChatMessages(dealId);
    
    // Сохраняем dealId в контексте для обработки сообщений
    botCtx.dealId = dealId;

    let messageText = `💬 Чат по сделке: ${deal.order.title}\n\n`;
    
    if (messages.length === 0) {
      messageText += 'Пока сообщений нет. Начните общение!';
    } else {
      // Показываем последние 10 сообщений
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        const sender = msg.isFromCustomer ? 'Заказчик' : 'Исполнитель';
        const time = new Date(msg.createdAt).toLocaleString('ru-RU');
        messageText += `${sender} (${time}):\n${msg.content}\n\n`;
      }
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📤 Отправить сообщение', callback_data: `send_msg_${dealId}` }],
          [{ text: '🔄 Обновить', callback_data: `refresh_chat_${dealId}` }],
          [{ text: '⬅️ Назад к сделкам', callback_data: 'my_deals' }]
        ]
      }
    };

    await ctx.reply(messageText, keyboard);
    
  } catch (error) {
    console.error('Error opening chat:', error);
    await ctx.reply('Произошла ошибка при открытии чата. Попробуйте позже.');
  }
}

export async function sendMessage(ctx: Context, dealId: string, content: string) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  try {
    if (!botCtx.userId) {
      await ctx.reply('Сначала выполните команду /start');
      return;
    }

    // Получаем информацию о сделке для определения роли
    const deal = await apiService.getDeal(dealId, botCtx.userId);
    if (!deal) {
      await ctx.reply('Сделка не найдена или у вас нет доступа к ней.');
      return;
    }

    const isFromCustomer = deal.customerId === botCtx.userId;
    
    // Отправляем сообщение
    const success = await apiService.sendMessage(dealId, botCtx.userId, content, isFromCustomer);
    
    if (success) {
      await ctx.reply('✅ Сообщение отправлено!');
      // Обновляем чат
      await openChat(ctx, dealId);
    } else {
      await ctx.reply('❌ Ошибка при отправке сообщения. Попробуйте позже.');
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    await ctx.reply('Произошла ошибка при отправке сообщения. Попробуйте позже.');
  }
}
