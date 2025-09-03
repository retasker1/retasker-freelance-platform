import { Context } from 'telegraf';
import { BotContext, Deal, User } from '../types';

export async function startHandler(ctx: Context) {
  const botCtx = ctx as BotContext;
  const apiService = botCtx.apiService!;
  
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

    // Проверяем, есть ли параметр start (для перехода к сделке или веб-аутентификации)
    const startParam = ctx.message && 'text' in ctx.message 
      ? ctx.message.text.split(' ')[1] 
      : null;

    if (startParam && startParam.startsWith('deal_')) {
      const dealId = startParam.replace('deal_', '');
      const deal = await apiService.getDeal(dealId);
      
      if (deal) {
        botCtx.dealId = dealId;
        await showDealInfo(ctx, deal, user.id);
        return;
      }
    }

    // Обработка веб-аутентификации
    if (startParam === 'web_auth') {
      await ctx.reply(
        '🔐 Аутентификация для веб-сайта\n\n' +
        'Вы успешно аутентифицированы в Telegram!\n\n' +
        'Теперь вы можете:\n' +
        '• Создавать заказы на сайте\n' +
        '• Управлять своими проектами\n' +
        '• Общаться через бота\n\n' +
        'Перейдите на сайт: https://retasker.com\n\n' +
        'Ваш аккаунт уже связан с Telegram!'
      );
      return;
    }

    // Показываем главное меню
    await showMainMenu(ctx, user);
    
  } catch (error) {
    console.error('Error in start handler:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

async function showMainMenu(ctx: Context, user: User) {
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
    `Привет, ${user.displayName}! 👋\n\n` +
    'Добро пожаловать в Retasker Bot!\n\n' +
    'Выберите действие:',
    keyboard
  );
}

export async function showDealInfo(ctx: Context, deal: Deal, userId: string) {
  const isCustomer = deal.customerId === userId;
  const isFreelancer = deal.freelancerId === userId;
  
  let roleText = '';
  let actions: Array<Array<{ text: string; callback_data: string }>> = [];

  if (isCustomer) {
    roleText = 'Вы - заказчик';
    if (deal.status === 'DELIVERED') {
      actions.push([{ text: '✅ Подтвердить завершение', callback_data: `confirm_${deal.id}` }]);
    }
  } else if (isFreelancer) {
    roleText = 'Вы - исполнитель';
    if (deal.status === 'ACTIVE') {
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

  const statusTexts = {
    'ACTIVE': '🟢 Активна',
    'DELIVERED': '🟡 Доставлено',
    'COMPLETED': '✅ Завершена',
    'CANCELLED': '❌ Отменена'
  };
  const statusText = statusTexts[deal.status as keyof typeof statusTexts] || '❓ Неизвестно';

  await ctx.reply(
    `📋 Информация о сделке\n\n` +
    `📝 Заказ: ${deal.order.title}\n` +
    `💰 Сумма: $${(deal.order.budgetCents / 100).toFixed(2)}\n` +
    `📊 Статус: ${statusText}\n` +
    `👤 ${roleText}\n\n` +
    `Выберите действие:`,
    keyboard
  );
}
