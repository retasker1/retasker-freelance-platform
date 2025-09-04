import { useUser } from "../hooks/useUser";
import { UserIndicator } from "./UserIndicator";

export function AuthHeader() {
  const { user, loading } = useUser();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              Retasker
            </a>
          </div>
          <nav className="flex items-center space-x-8">
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Главная
            </a>
            <a 
              href="/orders" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Заказы
            </a>
            <a 
              href="/me" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Личный кабинет
            </a>
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <UserIndicator user={user} />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
