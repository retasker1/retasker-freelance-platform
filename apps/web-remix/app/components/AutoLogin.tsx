import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";

export function AutoLogin() {
  const { user, login } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAutoLogin = async () => {
      // Проверяем, есть ли сохраненный пользователь
      const savedUser = localStorage.getItem("retasker_user");
      if (savedUser) {
        setIsChecking(false);
        return;
      }

      // Проверяем, запущены ли мы в Telegram Web App
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
        try {
          const result = await login(telegramUser.id.toString());
          if (result.success) {
            console.log("Auto-login successful");
          }
        } catch (error) {
          console.error("Auto-login failed:", error);
        }
      }
      
      setIsChecking(false);
    };

    checkAutoLogin();
  }, [login]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return null;
}

