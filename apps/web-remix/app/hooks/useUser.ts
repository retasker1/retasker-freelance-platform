import { useState, useEffect } from "react";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt?: string;
  telegramId?: string;
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
    let isMounted = true;
    
    const initializeAuth = async () => {
      // Проверяем, есть ли данные пользователя в localStorage
      const savedUser = localStorage.getItem("retasker_user");
      console.log("Checking localStorage for user:", savedUser);
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log("Parsed user data:", userData);
          
          // Проверяем, что ID в правильном формате (cuid)
          if (userData.id && !userData.id.startsWith('user_')) {
            console.log("Valid user found in localStorage, setting user");
            if (isMounted) {
              setUser(userData);
              setLoading(false);
            }
            return;
          } else {
            // Если ID в старом формате, очищаем localStorage
            console.log("Old user ID format detected, clearing localStorage");
            localStorage.removeItem("retasker_user");
          }
        } catch (error) {
          console.error("Error parsing saved user:", error);
          localStorage.removeItem("retasker_user");
        }
      } else {
        console.log("No user found in localStorage");
      }

      // Пытаемся авторизоваться через Telegram Web App
      const telegramAuthSuccess = await checkTelegramAuth();
      
      // Если дошли сюда и компонент еще смонтирован, завершаем загрузку
      if (isMounted) {
        if (telegramAuthSuccess) {
          console.log("Telegram auth successful, user should be set");
        } else {
          console.log("No Telegram auth, setting loading to false");
        }
        setLoading(false);
      }
    };

    // Таймаут на случай, если авторизация зависнет
    const timeout = setTimeout(() => {
      console.log("Auth timeout, setting loading to false");
      if (isMounted) {
        setLoading(false);
      }
    }, 3000); // Уменьшили таймаут до 3 секунд

    initializeAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkTelegramAuth = async () => {
    try {
      // Проверяем, запущены ли мы в Telegram Web App
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        console.log("Telegram Web App detected, attempting auth...");
        const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
        const result = await loginWithTelegramData(telegramUser);
        if (result.success) {
          console.log("Telegram auth successful");
          return true; // Успешная авторизация
        } else {
          console.log("Telegram auth failed:", result.error);
        }
      } else {
        console.log("No Telegram Web App detected");
      }
    } catch (error) {
      console.error("Telegram auth check error:", error);
    }
    
    return false; // Неуспешная авторизация
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
          // Используем данные из базы данных, а не из Telegram OAuth
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
          isActive: userData.isActive || true,
          createdAt: userData.createdAt,
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
        
        // Используем данные из API
        const user = {
          id: data.id,
          telegramId: data.telegramId,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          photoUrl: data.photoUrl,
          isActive: data.isActive,
          createdAt: data.createdAt,
        };
        
        setUser(user);
        localStorage.setItem("retasker_user", JSON.stringify(user));
        return { success: true, user };
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

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("retasker_user", JSON.stringify(updatedUser));
  };

  return { user, loading, login, logout, updateUser };
}
