import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Retasker — Биржа фриланса в Telegram" },
    { name: "description", content: "MVP версия Retasker — платформа для анонимного общения между заказчиками и исполнителями через Telegram бота с виртуальным балансом" },
  ];
}

export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать в Retasker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Биржа фриланса в Telegram с анонимным общением и безопасными сделками
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Войдите через Telegram
          </h3>
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Войти через Telegram
            </Link>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Или найдите бота в Telegram: @RetaskerRobot
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Создавайте заказы</h3>
            <p className="text-gray-600">Размещайте свои задачи и получайте отклики от исполнителей</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Анонимное общение</h3>
            <p className="text-gray-600">Общайтесь через Telegram бота без раскрытия личных данных</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Безопасные сделки</h3>
            <p className="text-gray-600">Виртуальный баланс и автоматические выплаты</p>
          </div>
        </div>
      </div>
    </div>
  );
}