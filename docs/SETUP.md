# Инструкция по настройке проекта

## Предварительные требования

- Node.js 18+ 
- npm 8+
- Git
- PostgreSQL (для продакшена) или SQLite (для разработки)

## Установка

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/your-username/retasker-freelance-platform.git
   cd retasker-freelance-platform
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   ```

3. **Настройка переменных окружения**
   ```bash
   # Скопируйте примеры файлов окружения
   cp apps/web/.env.example apps/web/.env.local
   cp apps/bot/.env.example apps/bot/.env.local
   ```

4. **Настройка базы данных**
   ```bash
   # Создание миграций
   npx prisma migrate dev
   
   # Генерация Prisma клиента
   npx prisma generate
   ```

5. **Запуск в режиме разработки**
   ```bash
   # Запуск всех сервисов
   npm run dev
   
   # Или запуск отдельных сервисов
   npm run dev --workspace=apps/web
   npm run dev --workspace=apps/bot
   ```

## Структура команд

- `npm run dev` - запуск всех сервисов в режиме разработки
- `npm run build` - сборка всех сервисов
- `npm run lint` - проверка кода линтером
- `npm run format` - форматирование кода
- `npm run test` - запуск тестов
- `npm run type-check` - проверка типов TypeScript

## Git Flow

Проект использует Git Flow. Основные команды:

```bash
# Создание feature ветки
git checkout -b feature/your-feature-name

# Создание release ветки
git checkout -b release/v1.0.0

# Создание hotfix ветки
git checkout -b hotfix/v1.0.1-fix-description
```

## Разработка

1. Создайте feature ветку от `develop`
2. Внесите изменения
3. Сделайте коммит с Conventional Commits
4. Отправьте PR в `develop`
5. После ревью и мержа создайте release PR в `main`
