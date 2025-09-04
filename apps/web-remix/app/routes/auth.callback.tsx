import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";

export default function AuthCallback() {
  const { login } = useUser();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Обработка авторизации...");

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Получаем hash из URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const authResult = params.get("tgAuthResult");
        
        if (!authResult) {
          setStatus("error");
          setMessage("Неверные параметры авторизации");
          return;
        }

        // Декодируем Base64 и парсим результат авторизации
        const decodedData = atob(authResult);
        const authData = JSON.parse(decodedData);
        
        if (authData.id && authData.first_name) {
          // Используем Telegram OAuth API для получения правильного пользователя
          const response = await fetch("/api/auth/telegram_web", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              telegramId: authData.id.toString(),
              firstName: authData.first_name,
              lastName: authData.last_name || null,
              username: authData.username || null,
              photoUrl: authData.photo_url || null,
            }),
          });

                           if (response.ok) {
                   const result = await response.json();
                   if (result.success) {
                     // Авторизуем пользователя с данными из базы данных
                     // НЕ используем данные из Telegram OAuth
                     await login(result.user);
                   } else {
                     throw new Error("Failed to authenticate user");
                   }
                 } else {
                   throw new Error("API error");
                 }
          
          setStatus("success");
          setMessage("Авторизация успешна! Перенаправляем...");
          
          // Перенаправляем на главную
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Неполные данные авторизации");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage("Ошибка обработки авторизации");
      }
    };

    processAuth();
  }, []); // Убираем login из зависимостей

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Обработка авторизации...
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Успешно!
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ошибка
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </a>
          </>
        )}
      </div>
    </div>
  );
}
