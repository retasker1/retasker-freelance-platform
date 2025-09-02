# Настройка GitHub репозитория

## Шаг 1: Создание удаленного репозитория

1. Перейдите на [GitHub](https://github.com)
2. Нажмите "New repository"
3. Название: `retasker-freelance-platform`
4. Описание: `MVP версия Retasker — платформа для анонимного общения между заказчиками и исполнителями через Telegram бота с виртуальным балансом`
5. Выберите "Public" или "Private"
6. **НЕ** инициализируйте с README, .gitignore или license
7. Нажмите "Create repository"

## Шаг 2: Настройка защиты веток

### Защита main ветки
1. Перейдите в Settings → Rules → Rulesets
2. Нажмите "New ruleset" → "New branch ruleset"
3. Название: `main branch protection`
4. Target branches: `main`
5. В разделе "Rules" отметьте:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (минимум 1)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
6. Нажмите "Create ruleset"

### Защита develop ветки
1. Повторите для ветки `develop`
2. Название: `develop branch protection`
3. Target branches: `develop`
4. Те же настройки, что и для main

## Шаг 3: Подключение локального репозитория

```bash
# Добавить удаленный origin
git remote add origin https://github.com/retasker1/retasker-freelance-platform.git

# Отправить все ветки
git push -u origin main
git push -u origin develop
git push -u origin release/v0.1.0
git push -u origin feature/repo-setup
```

## Шаг 4: Настройка GitHub Actions

После первого push в develop, GitHub Actions автоматически запустится и проверит:
- Установку зависимостей
- Линтинг кода
- Проверку типов
- Сборку проекта

## Шаг 5: Создание первого Pull Request

1. Перейдите в раздел Pull Requests
2. Нажмите "New Pull Request"
3. Base: `develop`, Compare: `feature/repo-setup`
4. Заголовок: `feat: initialize project structure and git flow setup`
5. Описание: используйте шаблон PR
6. Нажмите "Create Pull Request"

## Шаг 6: Создание Release Pull Request

1. Создайте PR из `release/v0.1.0` в `main`
2. Заголовок: `chore(release): v0.1.0`
3. После мержа создастся тег `v0.1.0`

## Важные замечания

- **Никогда не пущите напрямую в `main` или `develop`**
- Все изменения через Pull Requests
- Используйте Conventional Commits
- Создавайте feature ветки от `develop`
- Релизы только через `release/*` ветки
- Hotfixes через `hotfix/*` ветки

## Проверка настройки

После настройки у вас должно быть:
- ✅ Защищенные ветки main и develop
- ✅ Работающий GitHub Actions CI
- ✅ PR шаблон
- ✅ CODEOWNERS файл
- ✅ Правильная структура веток
