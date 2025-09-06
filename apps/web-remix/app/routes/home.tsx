import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { useUser } from "../hooks/useUser";
import { AdBanner } from "../components/AdBanner";
import { RecentOrders } from "../components/RecentOrders";
import { BANNER_CONFIG } from "../config/banner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Retasker — Биржа фриланса в Telegram" },
    { name: "description", content: "MVP версия Retasker — платформа для анонимного общения между заказчиками и исполнителями через Telegram бота с виртуальным балансом" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // Получаем последние 3 заказа
    const ordersResponse = await fetch(`${new URL(request.url).origin}/api/orders?limit=3&status=OPEN`);
    
    if (!ordersResponse.ok) {
      console.error("Orders API response not ok:", ordersResponse.status);
      throw new Error(`Orders API returned ${ordersResponse.status}`);
    }
    
    const ordersData = await ordersResponse.json();
    console.log("Home loader - Orders data:", ordersData);
    
    return {
      recentOrders: ordersData.orders || []
    };
  } catch (error) {
    console.error("Error loading home data:", error);
    return {
      recentOrders: []
    };
  }
}

export default function Home() {
  const { user } = useUser();
  const { recentOrders } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и описание */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Добро пожаловать в Retasker
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Биржа фриланса в Telegram с анонимным общением и безопасными сделками
          </p>
        </div>

      {/* Рекламный баннер */}
      {BANNER_CONFIG.showBanner && (
        <div className="mb-8">
          <AdBanner
            title={BANNER_CONFIG.title}
            description={BANNER_CONFIG.description}
            ctaText={BANNER_CONFIG.ctaText}
            ctaLink={BANNER_CONFIG.link}
            imageUrl={BANNER_CONFIG.image ? `/banners/${BANNER_CONFIG.image}` : undefined}
          />
        </div>
      )}

      {/* Как это работает */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Как это работает
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">1. Разместите или найдите заказ</h4>
              <p className="text-gray-600 text-sm">
                Создайте заказ как заказчик или найдите подходящий проект как исполнитель
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">2. Свяжитесь и договоритесь</h4>
              <p className="text-gray-600 text-sm">
                Откликнитесь на заказ или выберите исполнителя из откликов и начните сделку
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">3. Работайте анонимно</h4>
              <p className="text-gray-600 text-sm">
                Общайтесь через Telegram бота, выполняйте работу и получайте безопасные платежи
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/orders/new"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Создать заказ
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Найти работу
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Последние заказы */}
      <div className="mb-12">
        <RecentOrders orders={recentOrders} />
      </div>

      {/* Призыв к действию для неавторизованных пользователей */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-2xl mx-auto mb-12 text-center">
          <h3 className="text-2xl font-semibold text-blue-800 mb-4">
            Готовы начать работать?
          </h3>
          <p className="text-blue-700 mb-6">
            Войдите через Telegram и получите доступ ко всем возможностям платформы
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Войти через Telegram
          </Link>
          <p className="text-sm text-blue-600 mt-4">
            Или найдите бота в Telegram: @RetaskerRobot
          </p>
        </div>
      )}

      {/* Преимущества платформы */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-5xl mb-6">📋</div>
          <h3 className="text-2xl font-bold mb-4">Создавайте заказы</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Размещайте свои задачи и получайте отклики от проверенных исполнителей
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-5xl mb-6">🤖</div>
          <h3 className="text-2xl font-bold mb-4">Анонимное общение</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Общайтесь через Telegram бота без раскрытия личных данных
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-5xl mb-6">💰</div>
          <h3 className="text-2xl font-bold mb-4">Безопасные сделки</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Виртуальный баланс и автоматические выплаты гарантируют безопасность
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Часто задаваемые вопросы
          </h3>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Как работает анонимное общение?
              </h4>
              <p className="text-gray-600">
                Все сообщения пересылаются через Telegram бота. Ваши личные данные (имя, номер телефона) не передаются другой стороне. Общение происходит только через бота.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Как пополнить баланс?
              </h4>
              <p className="text-gray-600">
                В MVP версии пополнение баланса происходит через администратора. Обратитесь в поддержку для пополнения виртуального баланса.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Что если исполнитель не выполнит работу?
              </h4>
              <p className="text-gray-600">
                Деньги заморожены на виртуальном балансе до подтверждения выполнения. Если есть проблемы, вы можете подать жалобу, и администратор рассмотрит спор.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Как получить деньги за выполненную работу?
              </h4>
              <p className="text-gray-600">
                После подтверждения заказчиком выполнения работы, средства автоматически переводятся на ваш виртуальный баланс. Вывод средств через администратора.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Можно ли отменить сделку?
              </h4>
              <p className="text-gray-600">
                Да, сделку можно отменить до начала выполнения работы. Деньги вернутся на ваш баланс. После начала работы отмена возможна только через жалобу.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Как связаться с поддержкой?
              </h4>
              <p className="text-gray-600">
                Напишите в Telegram бот @RetaskerRobot или обратитесь к администратору через личный кабинет. Мы отвечаем в течение 24 часов.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}