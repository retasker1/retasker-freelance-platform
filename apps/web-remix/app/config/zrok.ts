// Конфигурация zrok URL
export const ZROK_CONFIG = {
  // Обновите этот URL при смене zrok
  BASE_URL: "https://i0ry1plrze97.share.zrok.io",
  DOMAIN: "i0ry1plrze97.share.zrok.io"
};

// Функция для обновления URL
export function updateZrokUrl(newUrl: string) {
  const domain = newUrl.replace("https://", "");
  ZROK_CONFIG.BASE_URL = newUrl;
  ZROK_CONFIG.DOMAIN = domain;
  console.log(`Zrok URL обновлен на: ${newUrl}`);
}
