# 🔄 Migration Guide: User Settings for Live-Only Mode

## Что изменилось в версии 2.1?

### До версии 2.1:
```
Live-Only Mode → только глобальная настройка
                → требуется перезапуск сервера
                → для всех пользователей сразу
```

### С версии 2.1:
```
Live-Only Mode → индивидуально для каждого пользователя
                → через веб-интерфейс
                → без перезапуска сервера
                → независимые настройки
```

---

## 📊 Сравнение

| Функция | Старый способ | Новый способ |
|---------|---------------|--------------|
| **Уровень** | Глобальный | Пользовательский + Глобальный |
| **Интерфейс** | Config файл | Web UI + Config |
| **Перезапуск** | Требуется | НЕ требуется |
| **Для кого** | Все сразу | Каждый сам |
| **Гибкость** | Низкая | Высокая |

---

## 🔧 Миграция базы данных

### Новое поле в таблице Users:

```sql
ALTER TABLE "Users" 
ADD COLUMN "liveOnlyMode" BOOLEAN NOT NULL DEFAULT false;
```

**Sequelize автоматически создаст это поле при следующем запуске!**

### Проверка:

```sql
-- Проверить структуру таблицы
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Users' AND column_name = 'liveOnlyMode';

-- Должно вернуть:
-- column_name    | data_type | column_default
-- liveOnlyMode   | boolean   | false
```

---

## 🚀 Обновление с предыдущей версии

### Шаг 1: Остановите сервер
```bash
Ctrl+C
```

### Шаг 2: Обновите код
```bash
git pull origin master
# или скопируйте новые файлы
```

### Шаг 3: Установите зависимости
```bash
npm install
```

### Шаг 4: Запустите сервер
```bash
npm start
```

**Sequelize автоматически добавит новое поле `liveOnlyMode` в таблицу Users!**

### Шаг 5: Проверьте
1. Войдите в систему
2. Откройте `/settings`
3. Убедитесь, что страница загружается
4. Попробуйте переключить Live-Only Mode

---

## ⚙️ Настройка после обновления

### Сценарий 1: Использовали глобальную настройку

**Было:**
```bash
LIVE_ONLY_MODE=true npm start
```

**Теперь:**
- Глобальная настройка продолжает работать
- ВСЕ пользователи по-прежнему в live-only режиме
- **ИЛИ** отключите глобальную и позвольте пользователям выбирать:

```bash
# Отключить глобальную
unset LIVE_ONLY_MODE
npm start

# Пользователи сами включают в Settings
```

### Сценарий 2: Не использовали Live-Only Mode

**Было:**
- Обычный режим с сохранением логов

**Теперь:**
- Всё работает как раньше
- Плюс каждый пользователь может включить Live-Only
- По умолчанию выключено для всех

### Сценарий 3: Хотели разные режимы для разных пользователей

**Было:**
- Невозможно! Все пользователи одинаковы

**Теперь:**
- ✅ Возможно!
- Пользователь A: Normal mode (сохраняет логи)
- Пользователь B: Live-Only mode (не сохраняет)
- Независимо друг от друга

---

## 🔍 Проверка обновления

### 1. Проверьте базу данных:

```bash
# PostgreSQL
psql your_database -c "SELECT email, \"liveOnlyMode\" FROM \"Users\";"
```

**Ожидаемый результат:**
```
      email       | liveOnlyMode
------------------+--------------
 user1@test.com  |     f
 user2@test.com  |     f
```

### 2. Проверьте API:

```bash
curl -X GET http://localhost:3000/api/users/settings \
  -H "Cookie: your-session-cookie"
```

**Ожидаемый результат:**
```json
{
  "email": "user@test.com",
  "liveOnlyMode": false
}
```

### 3. Проверьте интерфейс:

1. Войдите на сайт
2. Должна появиться ссылка **Settings** в sidebar
3. Откройте Settings
4. Должна быть секция **Live-Only Mode**
5. Переключатель должен работать

---

## 🐛 Troubleshooting

### Проблема: Поле liveOnlyMode не создалось

**Решение:**
```sql
-- Создать вручную
ALTER TABLE "Users" 
ADD COLUMN "liveOnlyMode" BOOLEAN NOT NULL DEFAULT false;
```

### Проблема: Страница Settings не открывается (404)

**Проверьте:**
1. Файл `views/settings.hbs` существует?
2. Роут `/settings` добавлен в `routes/web.js`?
3. Метод `renderSettings` в `controllers/PageController.js`?

**Решение:**
```bash
# Убедитесь, что все файлы на месте
ls views/settings.hbs
grep "renderSettings" controllers/PageController.js
grep "/settings" routes/web.js
```

### Проблема: API не работает

**Проверьте:**
```bash
# Методы добавлены в UserController?
grep "toggleLiveOnlyMode" controllers/UserController.js
grep "getSettings" controllers/UserController.js

# Роуты добавлены?
grep "settings/live-mode" routes/api.js
```

### Проблема: Переключатель не работает

**Откройте консоль браузера (F12):**
```javascript
// Проверьте наличие ошибок
// Проверьте AJAX запросы
// Network tab → XHR
```

**Проверьте jQuery:**
```html
<!-- Должен быть подключен в main.hbs -->
<script src="/js/lib/jquery-3.3.1.min.js"></script>
```

---

## 📝 Changelog

### Added:
- ✅ Поле `liveOnlyMode` в модели User
- ✅ API endpoints: `/api/users/settings`, `/api/users/settings/live-mode`
- ✅ Страница Settings (`/settings`)
- ✅ View: `views/settings.hbs`
- ✅ Методы в UserController: `getSettings`, `toggleLiveOnlyMode`
- ✅ Обновлена логика в UploadController (проверка user.liveOnlyMode)
- ✅ Ссылка Settings в sidebar

### Changed:
- ✨ UploadController теперь проверяет: `config.liveOnlyMode OR user.liveOnlyMode`
- ✨ Приоритет: глобальная настройка ИЛИ пользовательская
- ✨ Логи показывают источник режима: `[LIVE-ONLY GLOBAL]` или `[LIVE-ONLY USER]`

### Documentation:
- 📖 Новый файл: `USER_SETTINGS_GUIDE.md`
- 📖 Обновлен: `README.md`
- 📖 Обновлен: `LIVE_ONLY_MODE.md`
- 📖 Новый файл: `MIGRATION_TO_USER_SETTINGS.md` (этот файл)

---

## 🎓 Обучение пользователей

### Сообщите пользователям:

**Subject: New Feature - Individual Live-Only Mode Settings**

```
Привет!

Обновление системы: теперь каждый пользователь может сам выбрать,
сохранять ли историю данных или только транслировать в реальном времени.

Как использовать:
1. Войдите на сайт
2. Откройте Settings (⚙️) в боковом меню
3. Переключите Live-Only Mode
4. Готово!

Live-Only Mode:
✓ Экономит место в базе
✓ Идеально для OBS/стриминга
✓ Данные не сохраняются (конфиденциальность)

Подробнее: https://your-server/settings

Вопросы? Читайте документацию или пишите!
```

---

## ✅ Checklist обновления

- [ ] Обновлен код (git pull / копирование файлов)
- [ ] Установлены зависимости (npm install)
- [ ] Перезапущен сервер
- [ ] Поле liveOnlyMode создано в БД
- [ ] Страница /settings открывается
- [ ] API endpoints работают
- [ ] Переключатель работает
- [ ] Логи показывают правильный режим
- [ ] Пользователи уведомлены
- [ ] Документация прочитана

---

**Готово! Наслаждайтесь новой функцией! 🎉**

