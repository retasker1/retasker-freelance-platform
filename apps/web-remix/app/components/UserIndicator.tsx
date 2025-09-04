import { Link } from "react-router";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

interface UserIndicatorProps {
  user: User | null;
}

export function UserIndicator({ user }: UserIndicatorProps) {
  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        Войти
      </Link>
    );
  }

  const displayName = user.username ? `@${user.username}` : (user.firstName || 'Пользователь');

  return (
    <div className="flex items-center space-x-3">
      <Link
        to="/me"
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {user.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {displayName}
        </span>
      </Link>
    </div>
  );
}

