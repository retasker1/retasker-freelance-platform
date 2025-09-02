// Скрипт для тестирования Retasker API

const API_BASE = 'http://localhost:3000/api';

// Функция для выполнения HTTP запросов
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`\n${options.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`Error in ${options.method || 'GET'} ${endpoint}:`, error);
    return { error };
  }
}

// Тестируем API
async function testAPI() {
  console.log('🚀 Тестирование Retasker API...\n');

  // 1. Создаем тестового пользователя
  console.log('1️⃣ Создаем тестового пользователя...');
  const userData = {
    tgId: '123456789',
    displayName: 'Иван Петров',
    avatarUrl: 'https://t.me/i/userpic/320/123456789.jpg'
  };
  
  const { data: user } = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  if (!user || user.error) {
    console.error('❌ Не удалось создать пользователя');
    return;
  }

  console.log('✅ Пользователь создан:', user.id);

  // 2. Создаем тестовый заказ
  console.log('\n2️⃣ Создаем тестовый заказ...');
  const orderData = {
    title: 'Нужен дизайн логотипа для IT компании',
    description: 'Требуется создать современный, минималистичный логотип для IT стартапа. Цветовая схема: синий и белый. Должен быть запоминающимся и хорошо смотреться в разных размерах.',
    budgetCents: 50000 // 500 рублей
  };

  const { data: order } = await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });

  if (!order || order.error) {
    console.error('❌ Не удалось создать заказ');
    return;
  }

  console.log('✅ Заказ создан:', order.id);

  // 3. Получаем список заказов
  console.log('\n3️⃣ Получаем список заказов...');
  await apiRequest('/orders');

  // 4. Получаем конкретный заказ
  console.log('\n4️⃣ Получаем конкретный заказ...');
  await apiRequest(`/orders/${order.id}`);

  // 5. Создаем отклик на заказ
  console.log('\n5️⃣ Создаем отклик на заказ...');
  const responseData = {
    priceCents: 45000, // 450 рублей
    message: 'Готов выполнить работу качественно и в срок. У меня есть опыт создания логотипов для IT компаний.'
  };

  const { data: response } = await apiRequest(`/orders/${order.id}/responses`, {
    method: 'POST',
    body: JSON.stringify(responseData)
  });

  if (response && !response.error) {
    console.log('✅ Отклик создан:', response.id);
  }

  // 6. Получаем отклики на заказ
  console.log('\n6️⃣ Получаем отклики на заказ...');
  await apiRequest(`/orders/${order.id}/responses`);

  // 7. Получаем профиль пользователя
  console.log('\n7️⃣ Получаем профиль пользователя...');
  await apiRequest(`/users/${user.id}`);

  // 8. Тестируем поиск заказов
  console.log('\n8️⃣ Тестируем поиск заказов...');
  await apiRequest('/orders?q=логотип&minBudget=10000&status=OPEN');

  console.log('\n🎉 Тестирование API завершено!');
}

// Запускаем тесты
testAPI().catch(console.error);

