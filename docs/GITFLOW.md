# Git Flow для проекта Retasker

## 🌳 **Структура веток**

### **Основные ветки:**
- `main` - стабильная ветка для продакшена
- `develop` - основная ветка разработки

### **Вспомогательные ветки:**
- `feature/*` - новые функции
- `release/*` - подготовка релизов
- `hotfix/*` - критические исправления

## 🔄 **Workflow для разработки**

### **1. Начало новой задачи:**
```bash
# Обновляем develop
git checkout develop
git pull origin develop

# Создаем feature ветку
git checkout -b feature/название-задачи
```

### **2. Работа над задачей:**
```bash
# Делаем коммиты с описательными сообщениями
git add .
git commit -m "feat: добавить новую функцию"
git commit -m "fix: исправить баг в авторизации"
git commit -m "refactor: упростить код"
```

### **3. Завершение задачи:**
```bash
# Загружаем feature ветку
git push -u origin feature/название-задачи

# Создаем Pull Request на GitHub
# Сливаем PR в develop
# Удаляем feature ветку
```

## 📋 **Правила коммитов**

### **Формат сообщений:**
```
тип(область): краткое описание

Подробное описание изменений (опционально)

Closes #123
```

### **Типы коммитов:**
- `feat:` - новая функция
- `fix:` - исправление бага
- `refactor:` - рефакторинг кода
- `docs:` - документация
- `style:` - форматирование
- `test:` - тесты
- `chore:` - служебные изменения

## ⚠️ **Важные правила**

1. **НИКОГДА не коммитим в main или develop напрямую**
2. **Всегда создаем feature ветки для новых задач**
3. **Используем rebase вместо merge** для чистоты истории
4. **Регулярно обновляем develop** и rebase feature ветки
5. **Удаляем feature ветки после слияния**

## 🚀 **Быстрый старт**

```bash
# Проверяем текущую ветку
git branch

# Если не на develop - переключаемся
git checkout develop

# Обновляем develop
git pull origin develop

# Создаем feature ветку
git checkout -b feature/новая-задача

# Работаем, коммитим, пушим
git add .
git commit -m "feat: описание изменений"
git push -u origin feature/новая-задача
```

## 🔧 **Полезные команды**

```bash
# Посмотреть все ветки
git branch -a

# Посмотреть статус
git status

# Посмотреть историю
git log --oneline -10

# Обновить develop
git checkout develop && git pull origin develop

# Rebase feature ветки на develop
git checkout feature/название
git rebase develop
```

## 📚 **Дополнительные ресурсы**

- [Git Flow модель](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

