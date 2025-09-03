export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Личный кабинет
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
          <p className="text-gray-600 mb-4">
            Для доступа к личному кабинету необходимо войти через Telegram.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Как войти:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Найдите бота @RetaskerRobot в Telegram</li>
              <li>Отправьте команду /start</li>
              <li>Следуйте инструкциям бота</li>
            </ol>
          </div>
          
          <div className="mt-6">
            <a 
              href="/" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

