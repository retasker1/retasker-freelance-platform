import { Context } from 'telegraf';
import { ApiService } from '../services/api';
import { BotContext } from '../types';

export async function startHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService;
  
  console.log('=== START COMMAND RECEIVED ===');
  console.log('User ID:', ctx.from?.id);
  console.log('Username:', ctx.from?.username);
  console.log('First name:', ctx.from?.first_name);
  
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      console.log('ERROR: No telegram ID');
      await ctx.reply('Ошибка: не удалось получить ID пользователя.');
      return;
    }
    
    console.log('Looking for user with telegramId:', telegramId);

    // Проверяем, есть ли пользователь в системе
    const user = await apiService.getUserByTelegramId(telegramId);
    
    if (!user) {
      console.log('User not found, showing registration message');
      await ctx.reply(
        'Добро пожаловать в Retasker! 🚀\n\n' +
        'Для начала работы необходимо зарегистрироваться на платформе.\n' +
        'Перейдите на сайт: https://retasker.com\n\n' +
        'После регистрации вы сможете:\n' +
        '• Создавать заказы\n' +
        '• Откликаться на проекты\n' +
        '• Общаться с заказчиками/исполнителями\n' +
        '• Управлять сделками'
      );
      return;
    }

    // Сохраняем ID пользователя в контексте
    botCtx.userId = user.id;
    console.log('User found, userId set to:', user.id);

    // Проверяем, есть ли параметр start (для перехода к сделке)
    const startParam = ctx.message && 'text' in ctx.message 
      ? ctx.message.text.split(' ')[1] 
      : null;

    if (startParam && startParam.startsWith('deal_')) {
      const dealId = startParam.replace('deal_', '');
      const deal = await apiService.getDeal(dealId, user.id);
      
      if (deal) {
        botCtx.dealId = dealId;
        await showDealInfo(ctx, deal, user.id);
        return;
      }
    }

    // Показываем главное меню
    await showMainMenu(ctx, user);
    
  } catch (error) {
    console.error('Error in start handler:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

async function showMainMenu(ctx: Context, user: any) {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📋 Мои сделки', callback_data: 'my_deals' },
          { text: '💬 Чат', callback_data: 'chat_menu' }
        ],
        [
          { text: '🌐 Открыть сайт', url: 'https://retasker.com' },
          { text: 'ℹ️ Помощь', callback_data: 'help' }
        ]
      ]
    }
  };

  await ctx.reply(
    `Привет, ${user.firstName}! 👋\n\n` +
    'Добро пожаловать в Retasker Bot!\n\n' +
    'Выберите действие:',
    keyboard
  );
}

async function showDealInfo(ctx: Context, deal: any, userId: string) {
  const isCustomer = deal.customerId === userId;
  const isFreelancer = deal.freelancerId === userId;
  
  let roleText = '';
  let actions = [];

  if (isCustomer) {
    roleText = 'Вы - заказчик';
    if (deal.status === 'delivered') {
      actions.push([{ text: '✅ Подтвердить завершение', callback_data: `confirm_${deal.id}` }]);
    }
  } else if (isFreelancer) {
    roleText = 'Вы - исполнитель';
    if (deal.status === 'active') {
      actions.push([{ text: '📤 Отправить результат', callback_data: `deliver_${deal.id}` }]);
    }
  }

  actions.push([{ text: '💬 Открыть чат', callback_data: `chat_${deal.id}` }]);
  actions.push([{ text: '⚠️ Подать жалобу', callback_data: `complaint_${deal.id}` }]);

  const keyboard = {
    reply_markup: {
      inline_keyboard: actions
    }
  };

  const statusText = {
    'active': '🟢 Активна',
    'delivered': '🟡 Доставлено',
    'completed': '✅ Завершена',
    'cancelled': '❌ Отменена'
  }[deal.status] || '❓ Неизвестно';

  await ctx.reply(
    `📋 Информация о сделке\n\n` +
    `📝 Заказ: ${deal.order.title}\n` +
    `💰 Сумма: $${(deal.finalPrice / 100).toFixed(2)}\n` +
    `📊 Статус: ${statusText}\n` +
    `👤 ${roleText}\n\n` +
    `Выберите действие:`,
    keyboard
  );
}
