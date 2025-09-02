export default function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать в Retasker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Биржа фриланса в Telegram с анонимным общением и безопасными сделками
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Создавайте заказы</h3>
            <p className="text-gray-600">
              Размещайте свои задачи и получайте отклики от исполнителей
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Анонимное общение</h3>
            <p className="text-gray-600">
              Общайтесь через Telegram бота без раскрытия личных данных
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Безопасные сделки</h3>
            <p className="text-gray-600">
              Виртуальный баланс и защищенные платежи
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Войти через Telegram
          </button>
        </div>
      </div>
    </div>
  )
}


