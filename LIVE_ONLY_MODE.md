# Режим Live-Only / Live-Only Mode Guide

## 🚀 Что это такое?

**Live-Only Mode** - режим работы БЕЗ сохранения логов датчиков в базу данных, только real-time трансляция.

### Что РАБОТАЕТ:
- ✅ База данных PostgreSQL (требуется!)
- ✅ Аутентификация пользователей
- ✅ Регистрация и вход
- ✅ Сохранение Dashboard'ов
- ✅ Все функции интерфейса
- ✅ WebSocket real-time streaming
- ✅ Сессии создаются (но без логов)

### Что НЕ сохраняется:
- ❌ Логи датчиков (таблица Logs)
- ❌ История показаний
- ❌ Детальные данные сессий
- ⚠️ Только последние данные в памяти (5 минут)

### Преимущества:
- 💾 Экономия места в базе данных
- ⚡ Быстрая работа без записи в БД
- 🔄 Только real-time данные
- 📊 Dashboard'ы и настройки сохраняются

---

## ⚙️ Включение режима

### ⭐ Метод 1: Индивидуальные настройки пользователя (NEW!)

**С версии 2.1** каждый пользователь может включить Live-Only Mode через веб-интерфейс!

**Как включить:**
1. Войдите в систему
2. Откройте **Settings** в боковом меню (⚙️ Settings)
3. Найдите секцию **Live-Only Mode**
4. Нажмите переключатель или кнопку **Toggle Live Mode**
5. Готово! Изменения применяются мгновенно

**Преимущества:**
- ✅ Не нужно перезапускать сервер
- ✅ Каждый пользователь выбирает сам
- ✅ Легко переключаться туда-обратно
- ✅ Визуальный интерфейс с подсказками
- ✅ Независимые настройки для разных пользователей

**Подробное руководство:** [USER_SETTINGS_GUIDE.md](USER_SETTINGS_GUIDE.md)

---

### Метод 2: Глобальная настройка (Администратор)

Для включения режима для **ВСЕХ** пользователей одновременно.

#### Через переменную окружения:

```bash
# Linux/Mac
export LIVE_ONLY_MODE=true
npm start

# Windows PowerShell
$env:LIVE_ONLY_MODE = "true"
npm start

# Windows CMD
set LIVE_ONLY_MODE=true
npm start
```

#### Через config.js:

```javascript
// config/config.js
let config = {
    liveOnlyMode: true,  // Принудительно включить
    // ...
};
```

#### Через Docker:

```yaml
# docker-compose.yml
services:
  torque-dash:
    environment:
      - LIVE_ONLY_MODE=true
```

---

## 🎯 Как это работает

### Обработка данных:

```
Torque App → GET /api/upload
    ↓
Проверка пользователя (ВСЕГДА)
    ↓
Проверка Session (создается если нет)
    ↓
Проверка режима: config.liveOnlyMode OR user.liveOnlyMode?
    ↓ YES
Обновить Session.latestData
Сохранить в памяти (Map)
WebSocket broadcast → Dashboard
НЕ создавать Log в БД
Ответ: OK! [LIVE-ONLY GLOBAL/USER - NO LOGS SAVED]
    ↓ NO
Создать Log в базе данных
Обновить Session.latestData
WebSocket broadcast → Dashboard
Ответ: OK!
```

### Приоритет настроек:

1. **Глобальная настройка** (`config.liveOnlyMode`) - применяется ко ВСЕМ
2. **Пользовательская настройка** (`user.liveOnlyMode`) - если глобальная выключена

**Логика:**
```javascript
const isLiveOnlyMode = config.liveOnlyMode || user.liveOnlyMode;
```

Если хотя бы одна из настроек `true` - режим включен.

### В памяти хранится:
```javascript
{
    sessionId: "abc123",
    timestamp: 1704067200000,
    lon: -122.4194,
    lat: 37.7749,
    values: {
        kc: "2500",    // RPM
        kd: "60",      // Speed
        k5: "85",      // Temperature
        // ...
    },
    email: "user@example.com"
}
```

---

## 📡 Настройка Torque Pro

### Стандартная настройка (ОБЯЗАТЕЛЬНО):

**Settings → Data Logging & Upload:**
- Webserver URL: `http://your-server:3000/api/upload`
- Email Address: ваш email из зарегистрированного аккаунта (ОБЯЗАТЕЛЬНО!)
- Upload to Webserver: ✓ Включено

⚠️ **Важно:** В live-only mode ТРЕБУЕТСЯ регистрация пользователя!

1. Зайдите на сайт
2. Зарегистрируйтесь (Register)
3. Используйте тот же email в Torque Pro

**Для пересылки на другие серверы:**

Используйте настройки пользователя на странице Share, или URL с параметром:
```
http://your-server:3000/api/upload?forward_urls=http://server1.com/api,http://server2.com/api
```

---

## 🖥️ API в Live-Only режиме

### GET /api/upload

Принимает данные от Torque (работает как обычно).

**Ответ в live-only mode:**
```
OK! [LIVE-ONLY MODE]
```

---

### GET /api/live-sessions

Получить список активных сессий (только в live-only mode).

**Ответ:**
```json
{
    "sessions": [
        {
            "sessionId": "abc123",
            "email": "user@example.com",
            "lastUpdate": 1704067200000,
            "age": 5000
        }
    ],
    "mode": "live-only"
}
```

**Пример:**
```javascript
fetch('/api/live-sessions')
    .then(res => res.json())
    .then(data => {
        console.log('Active sessions:', data.sessions);
    });
```

---

### GET /api/live-sessions/:sessionId

Получить последние данные конкретной сессии.

**Ответ:**
```json
{
    "sessionId": "abc123",
    "timestamp": 1704067200000,
    "lon": -122.4194,
    "lat": 37.7749,
    "values": {
        "kc": "2500",
        "kd": "60",
        "k5": "85"
    },
    "email": "user@example.com"
}
```

**Пример:**
```javascript
fetch('/api/live-sessions/abc123')
    .then(res => res.json())
    .then(data => {
        console.log('Latest data:', data.values);
    });
```

---

## 🎨 Использование с Dashboard

### 1. Создание Dashboard без БД

В live-only mode dashboard не сохраняются в БД, но можно:
- Создать конфигурацию локально (JSON файл)
- Загрузить через браузер
- Использовать browser source напрямую

### 2. Подключение к live сессии

```javascript
// В dashboard viewer
const socket = io();
socket.emit('join-session', 'abc123');

socket.on('sensor-data', (data) => {
    console.log('Real-time data:', data.values);
    // Обновить виджеты
});
```

### 3. Простой Live Dashboard (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Live Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <h1>Live Data</h1>
    <div id="data"></div>

    <script>
        const socket = io();
        const sessionId = 'abc123'; // Ваш session ID
        
        socket.emit('join-session', sessionId);
        
        socket.on('sensor-data', (data) => {
            document.getElementById('data').innerHTML = `
                <p>RPM: ${data.values.kc || 'N/A'}</p>
                <p>Speed: ${data.values.kd || 'N/A'} km/h</p>
                <p>Temp: ${data.values.k5 || 'N/A'} °C</p>
            `;
        });
    </script>
</body>
</html>
```

---

## 🔄 Автоматическая очистка

Данные автоматически удаляются через 5 минут после последнего обновления.

**Механизм:**
```javascript
// Проверка каждые 5 минут
setInterval(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [sessionId, data] of liveDataStore.entries()) {
        if (data.timestamp < fiveMinutesAgo) {
            liveDataStore.delete(sessionId);
            console.log('Cleaned old session:', sessionId);
        }
    }
}, 5 * 60 * 1000);
```

---

## 💾 Миграция: Live-Only → Normal Mode

### Если хотите начать сохранять логи датчиков:

1. **Остановите сервер:**
   ```bash
   Ctrl+C
   ```

2. **Отключите live-only mode:**
   ```bash
   unset LIVE_ONLY_MODE
   # или удалите из config.js
   ```

3. **Запустите сервер:**
   ```bash
   npm start
   ```

4. **Готово!** Теперь все логи сохраняются в базу данных

⚠️ **Внимание:** База данных и пользователи остаются без изменений!

---

## 🎯 Сценарии использования

### Сценарий 1: Экономия места в БД
```
1. Настройте PostgreSQL
2. Создайте пользователей
3. LIVE_ONLY_MODE=true npm start
4. Пользователи подключают Torque
5. Данные транслируются в реальном времени
6. БД не растет от логов
```

### Сценарий 2: OBS overlay без истории
```
1. Запустите в live-only mode
2. Создайте Dashboard в интерфейсе
3. Подключите к активной сессии
4. Используйте Browser Source в OBS
5. Real-time данные без сохранения истории
```

### Сценарий 3: Демонстрация с аутентификацией
```
1. Настройте сервер с БД
2. LIVE_ONLY_MODE=true npm start
3. Создайте demo аккаунт
4. Покажите real-time dashboard
5. История не сохраняется (чистая БД)
```

---

## ⚠️ Важные замечания

### Безопасность
- В live-only mode аутентификация РАБОТАЕТ
- Требуется зарегистрированный пользователь
- Только владелец email может отправлять данные
- Безопасность на уровне обычного режима

### Производительность
- Ограничено памятью сервера
- При большом количестве сессий может быть медленно
- Рекомендуется: до 50 активных сессий одновременно

### Данные
- Хранятся только последние значения
- История недоступна
- После перезапуска сервера всё удаляется

---

## 🔧 Troubleshooting

### Проблема: Данные не приходят

**Проверьте:**
```bash
# Убедитесь что режим включен
echo $LIVE_ONLY_MODE

# Проверьте логи
# Должны видеть: [LIVE-ONLY] Data from session...
```

### Проблема: Сессия исчезает

**Причина:** Прошло более 5 минут без данных

**Решение:** 
- Проверьте что Torque отправляет данные
- Уменьшите интервал отправки в Torque

### Проблема: Память растёт

**Решение:**
- Автоочистка должна работать
- Проверьте что старые сессии удаляются
- Перезапустите сервер если нужно

---

## 📊 Мониторинг

### Проверка активных сессий:
```bash
curl http://localhost:3000/api/live-sessions
```

### Проверка конкретной сессии:
```bash
curl http://localhost:3000/api/live-sessions/abc123
```

### Логи:
```bash
# При получении данных
[LIVE-ONLY] Data from session abc123: { kc: '2500', kd: '60', ... }
```

---

## 🚀 Быстрый старт

```bash
# 1. Установка
git clone https://github.com/NeepOwO/torque-dash.git
cd torque-dash
npm install

# 2. Настройте базу данных
# config/config.js - укажите PostgreSQL URI

# 3. Запуск в live-only mode
LIVE_ONLY_MODE=true npm start

# 4. Создайте аккаунт
# Откройте http://localhost:3000
# Register → введите email и пароль

# 5. Настройте Torque Pro
# Webserver URL: http://your-ip:3000/api/upload
# Email: тот же что при регистрации

# 6. Создайте Dashboard
# Dashboards → Create New Dashboard

# 7. Подключитесь к сессии в Live режиме
# Editor → Select Session → Start Live

# 8. Смотрите данные в реальном времени!
# Логи НЕ сохраняются, только трансляция
```

---

**Готово! Наслаждайтесь live-only режимом! 🚗💨**

