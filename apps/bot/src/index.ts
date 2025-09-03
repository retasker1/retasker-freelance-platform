import { Telegraf, Context } from 'telegraf';
import { config } from 'dotenv';
import { ApiService } from './services/api';
import { startHandler, showDealInfo } from './handlers/start';
import { myDealsHandler } from './handlers/myDeals';
import { chatHandler } from './handlers/chat';
import { deliverHandler } from './handlers/deliver';
import { confirmHandler } from './handlers/confirm';
import { complaintHandler } from './handlers/complaint';
import { BotContext } from './types';

// Загружаем переменные окружения
config();

console.log('=== BOT STARTING ===');
console.log('Environment variables:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('APP_API_BASE:', process.env.APP_API_BASE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('===================');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const apiService = new ApiService(process.env.APP_API_BASE || 'http://localhost:3000');

// Добавляем сервис API в контекст
bot.use((ctx, next) => {
  (ctx as BotContext).apiService = apiService;
  return next();
});

// Обработчики команд
bot.start(startHandler);
bot.command('my_deals', myDealsHandler);
bot.command('chat', chatHandler);
bot.command('deliver', deliverHandler);
bot.command('confirm', confirmHandler);
bot.command('complaint', complaintHandler);

// Обработчик callback-кнопок
bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any)?.data;
  if (!data) return;

  try {
    await ctx.answerCbQuery();

    // Получаем userId для callback-кнопок
    const botCtx = ctx as BotContext;
    if (!botCtx.userId) {
      const telegramId = ctx.from?.id.toString();
      if (telegramId && botCtx.apiService) {
        const user = await botCtx.apiService.getUserByTelegramId(telegramId);
        if (user) {
          botCtx.userId = user.id;
          console.log('Callback: User ID set to:', user.id);
        }
      }
    }

    if (data === 'my_deals') {
      await myDealsHandler(ctx);
    } else if (data === 'chat_menu') {
      await chatHandler(ctx);
    } else if (data === 'help') {
      await ctx.reply(
        '🤖 Retasker Bot - Помощь\n\n' +
        'Основные команды:\n' +
        '/start - Начать работу с ботом\n' +
        '/my_deals - Мои сделки\n' +
        '/chat - Открыть чат\n' +
        '/deliver - Отправить результат\n' +
        '/confirm - Подтвердить завершение\n' +
        '/complaint - Подать жалобу\n\n' +
        'Для получения поддержки обращайтесь на сайт: https://retasker.com'
      );
    } else if (data.startsWith('deal_')) {
      const dealId = data.replace('deal_', '');
      const botCtx = ctx as BotContext;
      if (botCtx.apiService) {
        const deal = await botCtx.apiService.getDeal(dealId);
        if (deal && botCtx.userId) {
          await showDealInfo(ctx, deal, botCtx.userId);
        }
      }
    } else if (data.startsWith('chat_')) {
      const dealId = data.replace('chat_', '');
      const { openChat } = await import('./handlers/chat');
      await openChat(ctx, dealId);
    } else if (data.startsWith('deliver_')) {
      const dealId = data.replace('deliver_', '');
      const { confirmDeliver } = await import('./handlers/deliver');
      await confirmDeliver(ctx, dealId);
    } else if (data.startsWith('confirm_deliver_')) {
      const dealId = data.replace('confirm_deliver_', '');
      const { executeDeliver } = await import('./handlers/deliver');
      await executeDeliver(ctx, dealId);
    } else if (data.startsWith('confirm_')) {
      const dealId = data.replace('confirm_', '');
      const { confirmCompletion } = await import('./handlers/confirm');
      await confirmCompletion(ctx, dealId);
    } else if (data.startsWith('execute_confirm_')) {
      const dealId = data.replace('execute_confirm_', '');
      const { executeConfirm } = await import('./handlers/confirm');
      await executeConfirm(ctx, dealId);
    } else if (data.startsWith('complaint_')) {
      const dealId = data.replace('complaint_', '');
      const { startComplaint } = await import('./handlers/complaint');
      await startComplaint(ctx, dealId);
    } else if (data.startsWith('complaint_reason_')) {
      const reason = data.replace('complaint_reason_', '');
      const { handleComplaintReason } = await import('./handlers/complaint');
      await handleComplaintReason(ctx, reason);
    } else if (data.startsWith('send_msg_')) {
      const dealId = data.replace('send_msg_', '');
      await ctx.reply('Отправьте сообщение для чата:');
      // Сохраняем состояние для обработки следующего сообщения
      (ctx as BotContext).dealId = dealId;
      (ctx as BotContext).waitingForMessage = true;
    } else if (data.startsWith('refresh_chat_')) {
      const dealId = data.replace('refresh_chat_', '');
      const { openChat } = await import('./handlers/chat');
      await openChat(ctx, dealId);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
  const botCtx = ctx as BotContext;
  
  // Если ожидается сообщение для чата
  if (botCtx.waitingForMessage && botCtx.dealId) {
    const { sendMessage } = await import('./handlers/chat');
    await sendMessage(ctx, botCtx.dealId, ctx.message.text);
    botCtx.waitingForMessage = false;
    return;
  }
  
  // Если ожидается описание жалобы
  if (botCtx.dealId && botCtx.complaintReason) {
    const { submitComplaint } = await import('./handlers/complaint');
    await submitComplaint(ctx, ctx.message.text);
    return;
  }

  await ctx.reply(
    'Неизвестная команда. Используйте /start для начала работы.'
  );
});

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

// Запуск бота
if (process.env.NODE_ENV === 'production') {
  // В продакшене используем webhook
  const port = process.env.PORT || 3001;
  bot.launch({
    webhook: {
      domain: process.env.BOT_WEBHOOK_URL!,
      port: Number(port),
    },
  });
  console.log(`Bot webhook started on port ${port}`);
} else {
  // В разработке используем polling
  bot.launch();
  console.log('Bot started in development mode');
}

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
