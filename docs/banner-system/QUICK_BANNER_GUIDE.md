# 🚀 Быстрая инструкция по баннеру

## ⚡ **Быстрое изменение баннера**

### 1. Добавить изображение:
```bash
# Поместить файл в папку
cp your-banner.webp public/banners/banner.webp
```

### 2. Изменить ссылку:
```typescript
// В файле app/config/banner.ts
export const BANNER_CONFIG = {
  link: "https://your-website.com", // ← Ваша ссылка
  image: "banner.webp",             // ← Имя файла
  // ... остальное
};
```

### 3. Скрыть баннер:
```typescript
showBanner: false, // ← Временно скрыть
```

## 📋 **Требования к изображению**
- **Размер:** 1200x700 пикселей
- **Формат:** WebP, JPG или PNG
- **Файл:** не более 2MB

## 📁 **Файлы для изменения**
- `app/config/banner.ts` - настройки
- `public/banners/` - папка для изображений

---
**📖 Полная инструкция:** `BANNER_MANAGEMENT_GUIDE.md`
