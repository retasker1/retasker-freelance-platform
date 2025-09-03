import { Context } from 'telegraf';

export async function startHandler(ctx: Context) {
  try {
    const botCtx = ctx as any;
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId || !botCtx.apiService) {
      await ctx.reply('❌ Ошибка инициализации. Попробуйте позже.');
      return;
    }

    // Получаем или создаем пользователя
    let user = await botCtx.apiService.getUserByTelegramId(telegramId);
    
    if (!user) {
      // Создаем нового пользователя через API аутентификации
      try {
        const authResponse = await botCtx.apiService.client.post('/api/auth/telegram', {
          id: ctx.from?.id,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          username: ctx.from?.username,
          photo_url: undefined, // Telegram User type doesn't have photo_url
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'dev_hash' // В разработке пропускаем проверку hash
        });
        
        if (authResponse.data && authResponse.data.user) {
          user = authResponse.data.user;
          console.log('New user created:', user);
        }
      } catch (error) {
        console.error('Error creating user:', error);
        await ctx.reply('❌ Ошибка регистрации. Попробуйте позже.');
        return;
      }
    }

    if (user) {
      botCtx.userId = user.id;
      console.log('User authenticated:', user.id);
    }

    const welcomeMessage = `🤖 <b>Добро пожаловать в Retasker!</b>\n\n` +
      `Привет, ${ctx.from?.first_name}! 👋\n\n` +
      `Retasker - это биржа фриланса в Telegram с анонимным общением и безопасными сделками.\n\n` +
      `📋 <b>Что вы можете делать:</b>\n` +
      `• Создавать заказы на сайте\n` +
      `• Просматривать открытые заказы\n` +
      `• Управлять своими сделками\n` +
      `• Общаться с заказчиками/исполнителями\n\n` +
      `🚀 <b>Начните прямо сейчас:</b>\n` +
      `• Создайте заказ: https://retasker.com/orders/new\n` +
      `• Просмотрите заказы: /orders\n` +
      `• Ваши заказы: /my_orders\n` +
      `• Ваши сделки: /my_deals\n\n` +
      `💡 <b>Нужна помощь?</b> Используйте /help`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 Заказы', callback_data: 'orders' },
          { text: '📝 Мои заказы', callback_data: 'my_orders' }
        ],
        [
          { text: '🤝 Мои сделки', callback_data: 'my_deals' },
          { text: '💬 Чат', callback_data: 'chat_menu' }
        ],
        [
          { text: '❓ Помощь', callback_data: 'help' }
        ]
      ]
    };

    await ctx.reply(welcomeMessage, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in start handler:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
}

export async function showDealInfo(ctx: Context, deal: any, userId: string) {
  try {
    const budget = (deal.amountCents / 100).toFixed(0);
    const statusEmoji: Record<string, string> = {
      'PENDING': '⏳',
      'ACTIVE': '🟢',
      'DELIVERED': '📦',
      'COMPLETED': '✅',
      'CANCELLED': '❌'
    };
    
    const statusText: Record<string, string> = {
      'PENDING': 'Ожидает подтверждения',
      'ACTIVE': 'В работе',
      'DELIVERED': 'Доставлено',
      'COMPLETED': 'Завершено',
      'CANCELLED': 'Отменено'
    };
    
    const emoji = statusEmoji[deal.status] || '❓';
    const text = statusText[deal.status] || 'Неизвестно';

    let message = `🤝 <b>Информация о сделке</b>\n\n` +
      `💰 Сумма: $${budget}\n` +
      `📊 Статус: ${emoji} ${text}\n` +
      `📅 Создана: ${new Date(deal.createdAt).toLocaleDateString('ru-RU')}\n\n`;

    if (deal.order) {
      message += `📋 <b>Заказ:</b>\n` +
        `• ${deal.order.title}\n` +
        `• ${deal.order.description.substring(0, 100)}${deal.order.description.length > 100 ? '...' : ''}\n\n`;
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💬 Открыть чат', callback_data: `chat_${deal.id}` }
        ]
      ]
    };

    if (deal.status === 'ACTIVE') {
      keyboard.inline_keyboard.push([
        { text: '📦 Доставить результат', callback_data: `deliver_${deal.id}` }
      ]);
    }

    if (deal.status === 'DELIVERED' && deal.customerId === userId) {
      keyboard.inline_keyboard.push([
        { text: '✅ Подтвердить завершение', callback_data: `confirm_${deal.id}` }
      ]);
    }

    if (deal.status === 'ACTIVE' || deal.status === 'DELIVERED') {
      keyboard.inline_keyboard.push([
        { text: '⚠️ Подать жалобу', callback_data: `complaint_${deal.id}` }
      ]);
    }

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error showing deal info:', error);
    await ctx.reply('❌ Ошибка при загрузке информации о сделке.');
  }
}
