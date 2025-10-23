# 📤 Загрузка на GitHub Fork

Пошаговое руководство по загрузке проекта на ваш GitHub fork.

---

## 🎯 Шаг 1: Создайте Fork на GitHub

### Через веб-интерфейс:

1. **Откройте оригинальный репозиторий:**
   ```
   https://github.com/davekrejci/torque-dash
   ```

2. **Нажмите кнопку "Fork"** в правом верхнем углу

3. **Выберите свой аккаунт** как владельца fork

4. **Дождитесь создания fork**
   - GitHub создаст копию: `https://github.com/YOUR_USERNAME/torque-dash`

5. **Скопируйте URL вашего fork:**
   ```
   https://github.com/YOUR_USERNAME/torque-dash.git
   ```

---

## 🔧 Шаг 2: Настройка Git (если не настроен)

```bash
# Укажите ваше имя
git config --global user.name "Your Name"

# Укажите ваш email с GitHub
git config --global user.email "your-email@example.com"

# Проверьте настройки
git config --list
```

---

## 📁 Шаг 3: Инициализация и добавление файлов

Выполните в PowerShell:

```powershell
# Убедитесь, что вы в директории проекта
cd C:\Users\Neep\Downloads\torque-dash-master\torque-dash-master

# Добавьте все файлы
git add .

# Проверьте статус
git status

# Создайте первый commit
git commit -m "feat: Add custom dashboards, user settings, and live-only mode

- Add customizable real-time dashboards with drag-and-drop editor
- Add 7 widget types (speedometer, tachometer, gauges, indicators)
- Add image upload functionality for custom dashboard backgrounds
- Add user settings page with Live-Only mode toggle
- Add per-user Live-Only mode configuration
- Update all dependencies to 2024/2025 versions
- Add WebSocket real-time data streaming
- Add comprehensive documentation (guides, installation, migration)
- Add Ubuntu Linux installation guide and auto-install script
- Add support for OBS/streaming browser sources"
```

---

## 🔗 Шаг 4: Добавление Remote

```powershell
# Добавьте ваш fork как remote
# ЗАМЕНИТЕ YOUR_USERNAME на ваше имя пользователя GitHub!
git remote add origin https://github.com/YOUR_USERNAME/torque-dash.git

# Проверьте remote
git remote -v
```

**Должно показать:**
```
origin  https://github.com/YOUR_USERNAME/torque-dash.git (fetch)
origin  https://github.com/YOUR_USERNAME/torque-dash.git (push)
```

---

## 🚀 Шаг 5: Push на GitHub

```powershell
# Создайте ветку main (если её нет)
git branch -M main

# Push на GitHub
git push -u origin main
```

### Если попросит авторизацию:

#### Вариант 1: Personal Access Token (рекомендуется)

1. **Создайте токен на GitHub:**
   - Откройте: https://github.com/settings/tokens
   - **Generate new token** → **Classic**
   - Название: `Torque Dash Upload`
   - Выберите срок действия (например, 90 дней)
   - Права: выберите **repo** (полный доступ к репозиториям)
   - **Generate token**
   - **СКОПИРУЙТЕ ТОКЕН** (он больше не появится!)

2. **Используйте токен вместо пароля:**
   ```powershell
   # При запросе password введите токен
   git push -u origin main
   ```
   - Username: ваш логин GitHub
   - Password: **вставьте токен** (не пароль!)

#### Вариант 2: GitHub CLI

```powershell
# Установите GitHub CLI
winget install --id GitHub.cli

# Авторизуйтесь
gh auth login

# Следуйте инструкциям
# Выберите: GitHub.com → HTTPS → Yes → Login with a web browser

# После авторизации push должен работать
git push -u origin main
```

#### Вариант 3: SSH Key

```powershell
# Генерация SSH ключа
ssh-keygen -t ed25519 -C "your-email@example.com"

# Нажмите Enter для default location
# Введите пароль (или оставьте пустым)

# Скопируйте публичный ключ
cat ~\.ssh\id_ed25519.pub
# или
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Добавьте ключ на GitHub:**
1. Откройте: https://github.com/settings/keys
2. **New SSH key**
3. Title: `My Windows PC`
4. Key: вставьте содержимое `id_ed25519.pub`
5. **Add SSH key**

**Измените remote на SSH:**
```powershell
git remote set-url origin git@github.com:YOUR_USERNAME/torque-dash.git
git push -u origin main
```

---

## ✅ Шаг 6: Проверка

После успешного push:

1. **Откройте ваш fork:**
   ```
   https://github.com/YOUR_USERNAME/torque-dash
   ```

2. **Проверьте:**
   - ✅ Все файлы загружены
   - ✅ Коммит появился
   - ✅ README.md отображается
   - ✅ Документация доступна

3. **Поделитесь ссылкой:**
   ```
   https://github.com/YOUR_USERNAME/torque-dash
   ```

---

## 📝 Дальнейшие изменения

### Внесение изменений:

```powershell
# 1. Измените файлы

# 2. Проверьте изменения
git status

# 3. Добавьте изменённые файлы
git add .
# или конкретные файлы:
git add README.md config/config.js

# 4. Сделайте commit
git commit -m "fix: описание изменения"

# 5. Push на GitHub
git push
```

### Типы commit сообщений:

- `feat:` - новая функция
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование, стиль кода
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигурации

**Примеры:**
```bash
git commit -m "feat: add new widget type"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update installation guide"
```

---

## 🔄 Синхронизация с оригинальным репозиторием

Если хотите получать обновления из оригинального репозитория:

```powershell
# Добавьте оригинальный репозиторий как upstream
git remote add upstream https://github.com/davekrejci/torque-dash.git

# Проверьте remotes
git remote -v
# Должно показать:
# origin    https://github.com/YOUR_USERNAME/torque-dash.git
# upstream  https://github.com/davekrejci/torque-dash.git

# Получите обновления из upstream
git fetch upstream

# Слейте изменения в вашу ветку
git merge upstream/main

# Push в ваш fork
git push
```

---

## 🌿 Создание веток (для экспериментов)

```powershell
# Создайте новую ветку для разработки
git checkout -b feature/my-new-feature

# Работайте в этой ветке
# ... делайте изменения ...

# Commit
git add .
git commit -m "feat: add my new feature"

# Push новой ветки
git push -u origin feature/my-new-feature

# На GitHub создайте Pull Request в main
```

---

## 🛠️ Полезные команды

```powershell
# Проверить статус
git status

# Посмотреть историю
git log --oneline

# Посмотреть изменения
git diff

# Отменить изменения в файле
git checkout -- filename.js

# Отменить последний commit (но оставить изменения)
git reset --soft HEAD~1

# Посмотреть remotes
git remote -v

# Обновить с GitHub
git pull

# Посмотреть ветки
git branch -a

# Переключиться на ветку
git checkout main
```

---

## 📊 .gitignore

Уже создан файл `.gitignore` который исключает:

```
node_modules/
public/uploads/*
!public/uploads/.gitkeep
.env
*.log
.DS_Store
package-lock.json  # Опционально
```

**Не забудьте НЕ загружать:**
- ❌ `node_modules/` (большая папка)
- ❌ `.env` (секретные данные)
- ❌ `public/uploads/*` (загруженные файлы пользователей)
- ❌ Логи

---

## 🔐 Безопасность

### НЕ загружайте на GitHub:

- ❌ Пароли БД
- ❌ API ключи
- ❌ Session keys (если hardcoded)
- ❌ `.env` файл
- ❌ Персональные данные

### Если случайно загрузили секреты:

1. **Удалите из истории:**
   ```powershell
   # Используйте git-filter-repo или BFG Repo-Cleaner
   # https://github.com/newren/git-filter-repo
   ```

2. **Смените все секреты:**
   - Пароли БД
   - API ключи
   - Session keys

3. **Обновите `.gitignore`** и сделайте новый commit

---

## 🎯 Checklist загрузки

- [ ] Fork создан на GitHub
- [ ] Git настроен (user.name, user.email)
- [ ] Все файлы добавлены (`git add .`)
- [ ] Commit создан (`git commit -m "..."`)
- [ ] Remote добавлен (`git remote add origin ...`)
- [ ] Push выполнен (`git push -u origin main`)
- [ ] Файлы видны на GitHub
- [ ] `.gitignore` настроен правильно
- [ ] Секретные данные НЕ загружены
- [ ] README.md отображается корректно
- [ ] Документация доступна

---

## 📚 Дополнительные ресурсы

**Git:**
- https://git-scm.com/doc
- https://learngitbranching.js.org/

**GitHub:**
- https://docs.github.com/en
- https://guides.github.com/

**GitHub CLI:**
- https://cli.github.com/

---

**Готово! Ваш проект на GitHub! 🎉**

