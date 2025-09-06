// 📋 Примеры конфигураций баннера
// Этот файл содержит примеры для разных типов баннеров

// 🎯 **Пример 1: Промо-акция**
export const PROMO_BANNER = {
  link: "https://your-promo-page.com",
  image: "promo-banner.webp",
  title: "Скидка 50% на первые заказы!",
  description: "Ограниченное предложение для новых пользователей. Создайте заказ и получите скидку.",
  ctaText: "Получить скидку",
  showBanner: true,
} as const;

// 🎯 **Пример 2: Telegram канал**
export const TELEGRAM_BANNER = {
  link: "https://t.me/retasker_channel",
  image: "telegram-banner.webp",
  title: "Подпишитесь на наш канал",
  description: "Получайте уведомления о новых заказах и обновлениях платформы.",
  ctaText: "Подписаться",
  showBanner: true,
} as const;

// 🎯 **Пример 3: Внешний сайт**
export const EXTERNAL_BANNER = {
  link: "https://your-company.com",
  image: "company-banner.webp",
  title: "Узнайте больше о нашей компании",
  description: "Мы создаем лучшие решения для фрилансеров и заказчиков.",
  ctaText: "Посетить сайт",
  showBanner: true,
} as const;

// 🎯 **Пример 4: Внутренняя страница**
export const INTERNAL_BANNER = {
  link: "/orders/new",
  image: "create-order-banner.webp",
  title: "Создайте свой первый заказ",
  description: "Разместите задачу и найдите идеального исполнителя за считанные минуты.",
  ctaText: "Создать заказ",
  showBanner: true,
} as const;

// 🎯 **Пример 5: Email контакт**
export const CONTACT_BANNER = {
  link: "mailto:support@retasker.com",
  image: "contact-banner.webp",
  title: "Нужна помощь?",
  description: "Свяжитесь с нашей службой поддержки для решения любых вопросов.",
  ctaText: "Написать нам",
  showBanner: true,
} as const;

// 🎯 **Пример 6: Отключенный баннер**
export const DISABLED_BANNER = {
  link: "https://example.com",
  image: "banner.webp",
  title: "Баннер отключен",
  description: "Этот баннер временно скрыт.",
  ctaText: "Кнопка",
  showBanner: false, // ← Баннер не будет показан
} as const;

// 📝 **Как использовать:**
// 1. Скопируйте нужную конфигурацию
// 2. Вставьте в app/config/banner.ts
// 3. Измените значения под ваши нужды
// 4. Сохраните файл

// 🔄 **Быстрое переключение:**
// Замените содержимое BANNER_CONFIG на любую из конфигураций выше
