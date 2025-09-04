# Скрипт для создания новой feature ветки
# Использование: .\scripts\new-feature.ps1 "название-задачи"

param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureName
)

# Проверяем, что мы на develop
$currentBranch = git branch --show-current
if ($currentBranch -ne "develop") {
    Write-Host "❌ Ошибка: Вы должны быть на ветке 'develop'" -ForegroundColor Red
    Write-Host "Текущая ветка: $currentBranch" -ForegroundColor Yellow
    Write-Host "Переключитесь на develop: git checkout develop" -ForegroundColor Yellow
    exit 1
}

# Обновляем develop
Write-Host "🔄 Обновляем develop..." -ForegroundColor Blue
git pull origin develop

# Создаем feature ветку
$branchName = "feature/$FeatureName"
Write-Host "🌿 Создаем ветку: $branchName" -ForegroundColor Green
git checkout -b $branchName

Write-Host "✅ Готово! Теперь вы на ветке: $branchName" -ForegroundColor Green
Write-Host "📝 Не забудьте:" -ForegroundColor Yellow
Write-Host "  - Делать коммиты с правильным форматом" -ForegroundColor Yellow
Write-Host "  - Регулярно обновлять develop и rebase" -ForegroundColor Yellow
Write-Host "  - Создать PR после завершения работы" -ForegroundColor Yellow

