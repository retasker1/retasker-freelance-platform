import { useState, useEffect } from "react";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isActive: boolean;
}

// Интерфейс для Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли данные пользователя в localStorage
    const savedUser = localStorage.getItem("retasker_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("retasker_user");
      }
    }

    // Пытаемся авторизоваться через Telegram Web App
    checkTelegramAuth();
  }, []);

  const checkTelegramAuth = async () => {
    try {
      // Проверяем, запущены ли мы в Telegram Web App
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
        const result = await loginWithTelegramData(telegramUser);
        if (result.success) {
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Telegram auth check error:", error);
    }
    
    setLoading(false);
  };

  const loginWithTelegramData = async (telegramUser: any) => {
    try {
      const response = await fetch("/api/auth/telegram_web", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          photoUrl: telegramUser.photo_url
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem("retasker_user", JSON.stringify(data.user));
          return { success: true, user: data.user };
        }
      }
      return { success: false, error: "Ошибка авторизации" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Ошибка сети" };
    }
  };

  const login = async (userData: any) => {
    try {
      console.log("Attempting login with userData:", userData);
      
      // Если передали объект пользователя (из быстрого входа)
      if (userData && typeof userData === 'object') {
        const user = {
          id: userData.id,
          telegramId: userData.telegramId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          photoUrl: userData.photoUrl,
          isActive: true,
        };
        
        console.log("Setting user:", user);
        setUser(user);
        localStorage.setItem("retasker_user", JSON.stringify(user));
        console.log("User saved to localStorage");
        return { success: true, user };
      }
      
      // Если передали telegramId (старый способ)
      const telegramId = userData;
      const response = await fetch("/api/simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramId, test: "login" }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        
        // Создаем фиктивного пользователя для тестирования
        const mockUser = {
          id: `user_${telegramId}`,
          telegramId: telegramId,
          firstName: "Тестовый",
          lastName: "Пользователь",
          username: `user_${telegramId}`,
          photoUrl: null,
          isActive: true,
        };
        
        setUser(mockUser);
        localStorage.setItem("retasker_user", JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      }
      
      const errorText = await response.text();
      console.log("Error response:", errorText);
      return { success: false, error: "Ошибка авторизации: " + response.status };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Ошибка сети: " + error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("retasker_user");
  };

  return { user, loading, login, logout };
}
