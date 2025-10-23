# Инструкция по обновлению до версии 2.0 / Upgrade Instructions to v2.0

## 🎉 Добро пожаловать в Torque Dash 2.0!

Эта версия включает major обновления библиотек и новую систему кастомных панелей приборов.

---

## ⚠️ Важно перед обновлением / Important Before Upgrading

### Требования:
- **Node.js**: версия 14.x или выше (рекомендуется 18.x LTS)
- **PostgreSQL**: версия 10 или выше
- **npm**: версия 6.x или выше

### Резервное копирование:
```bash
# Сделайте бэкап базы данных
pg_dump your_database > backup_$(date +%Y%m%d).sql

# Сделайте копию файлов конфигурации
cp config/config.js config/config.js.backup
```

---

## 📦 Шаги обновления / Upgrade Steps

### Шаг 1: Остановите сервер
```bash
# Если используется process manager
pm2 stop torque-dash

# Или просто Ctrl+C если запущен напрямую
```

### Шаг 2: Получите новый код
```bash
# Если используете Git
git pull origin master

# Или скачайте и распакуйте архив
```

### Шаг 3: Обновите зависимости
```bash
# Удалите старые node_modules
rm -rf node_modules
rm package-lock.json

# Установите новые зависимости
npm install
```

### Шаг 4: Миграция базы данных
Новая версия добавляет две новые таблицы:
- **Dashboards** - для хранения пользовательских панелей
- **Обновление Sessions** - добавлено поле latestData

База данных обновится автоматически при первом запуске благодаря Sequelize sync.

**Важно:** Если вы использовали `{force: true}` в sequelize.sync(), удалите эту опцию, чтобы не потерять данные!

```javascript
// app.js - убедитесь что выглядит так:
sequelize.sync()  // БЕЗ {force: true}
```

### Шаг 5: Проверьте конфигурацию
Файл `config/config.js` должен содержать настройки базы данных. Никаких изменений не требуется, но убедитесь что настройки корректны:

```javascript
module.exports = {
    db: {
        uri: process.env.DATABASE_URL || 'your_database_url',
        options: {
            // ...
        }
    },
    // ...
}
```

### Шаг 6: Запустите сервер
```bash
# Для разработки
npm run dev

# Для production
npm start

# Или через PM2
pm2 start app.js --name torque-dash
```

### Шаг 7: Проверьте работоспособность
1. Откройте браузер и зайдите на ваш сайт
2. Войдите в аккаунт
3. Проверьте что старые функции работают:
   - Overview
   - Map View
   - Share
4. Проверьте новый раздел **Dashboards**

---

## 🆕 Что нового / What's New

### Обновленные библиотеки:
- **Express**: 4.16.4 → 4.19.2
- **Sequelize**: 5.4.0 → 6.37.3
- **bcrypt**: 3.0.4 → 5.1.1
- **express-handlebars**: 3.0.2 → 7.1.3
- **pg**: 7.9.0 → 8.12.0
- И многие другие...

### Новые зависимости:
- **socket.io**: 4.7.5 - для WebSocket в реальном времени
- **axios**: 1.7.4 - замена устаревшего request
- **nanoid**: 3.3.7 - для генерации ID
- **pg-hstore**: 2.3.4 - для Sequelize 6

### Новые функции:
- ✨ Кастомные панели приборов
- 🎨 Визуальный редактор с drag-and-drop
- 📊 6 типов виджетов (циферблаты, индикаторы, дисплеи)
- 🔄 Real-time обновление данных через WebSocket
- 🎥 Browser source для OBS/стриминга
- 🌐 Публичные ссылки для sharing панелей

---

## 🔧 Breaking Changes / Критические изменения

### 1. Express Handlebars
Изменен API инициализации:

**Старая версия:**
```javascript
const exphbs = require('express-handlebars');
app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs'}));
```

**Новая версия:**
```javascript
const { engine } = require('express-handlebars');
app.engine('hbs', engine({
    defaultLayout: 'main', 
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
```

✅ **Уже исправлено в app.js**

### 2. Sequelize
Метод `sequelize.import()` устарел, теперь используется `require()`:

**Старая версия:**
```javascript
const model = sequelize.import(path.join(__dirname, file));
```

**Новая версия:**
```javascript
const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
```

✅ **Уже исправлено в models/index.js**

### 3. Request → Axios
Библиотека `request` удалена, используется `axios`:

**Старая версия:**
```javascript
request({
    method: 'GET',
    url: url,
    qs: req.query
});
```

**Новая версия:**
```javascript
axios.get(url, {
    params: req.query
}).catch(err => console.log(err.message));
```

✅ **Уже исправлено в controllers/UploadController.js**

### 4. WebSocket сервер
Теперь используется `http.Server` вместо прямого `app.listen()`:

**Старая версия:**
```javascript
app.listen(port);
```

**Новая версия:**
```javascript
const server = http.createServer(app);
const io = new Server(server);
server.listen(port);
```

✅ **Уже исправлено в app.js**

---

## 🐛 Возможные проблемы / Possible Issues

### Проблема 1: Ошибка "Cannot find module 'express-handlebars'"
**Решение:**
```bash
npm install
# или
npm install express-handlebars@7.1.3
```

### Проблема 2: Ошибка подключения к БД
**Решение:** Sequelize 6 требует явного указания диалекта:
```javascript
// config/config.js
db: {
    options: {
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.DATABASE_URL ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    }
}
```

### Проблема 3: WebSocket не работает
**Проверьте:**
1. Порт не заблокирован firewall
2. Если используете прокси (nginx), добавьте WebSocket поддержку:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Проблема 4: "Layout not found"
**Решение:** Проверьте пути к layouts и partials в app.js:
```javascript
app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
```

---

## 📊 Миграция данных / Data Migration

### Существующие данные
Все ваши существующие данные сохранятся:
- ✅ Пользователи (Users)
- ✅ Сессии (Sessions)
- ✅ Логи (Logs)

### Новые таблицы
Автоматически создадутся:
- ✅ Dashboards

### Обновленные таблицы
К таблице Sessions добавится поле:
- ✅ latestData (JSONB) - для кэширования последних данных

---

## 🚀 После обновления / After Upgrade

### Проверьте функционал:
1. ✅ Вход в систему работает
2. ✅ Overview показывает сессии
3. ✅ Map View открывается
4. ✅ Torque может загружать данные
5. ✅ Новый раздел Dashboards доступен

### Создайте первую панель:
1. Перейдите в **Dashboards**
2. Нажмите **Create New Dashboard**
3. Добавьте несколько виджетов
4. Выберите датчики
5. Сохраните панель
6. Попробуйте Live режим с активной сессией

### Настройте Browser Source (опционально):
1. Создайте панель
2. Включите публичный доступ (Share)
3. Скопируйте ссылку
4. Добавьте в OBS как Browser Source

---

## 🔄 Откат / Rollback

Если что-то пошло не так:

### Шаг 1: Остановите сервер
```bash
pm2 stop torque-dash
```

### Шаг 2: Восстановите код
```bash
git checkout v1.0  # или предыдущая версия
```

### Шаг 3: Восстановите зависимости
```bash
rm -rf node_modules
npm install
```

### Шаг 4: Восстановите базу данных (если нужно)
```bash
psql your_database < backup_YYYYMMDD.sql
```

### Шаг 5: Запустите
```bash
npm start
```

---

## 📞 Поддержка / Support

Если возникли проблемы:

1. **Проверьте логи:**
```bash
# PM2
pm2 logs torque-dash

# Прямой запуск
# Смотрите вывод в консоли
```

2. **Проверьте версии:**
```bash
node --version  # должно быть >= 14.x
npm --version   # должно быть >= 6.x
```

3. **Проверьте зависимости:**
```bash
npm list --depth=0
```

4. **Очистите кэш:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Чеклист обновления / Upgrade Checklist

- [ ] Сделан бэкап базы данных
- [ ] Сделан бэкап конфигурации
- [ ] Остановлен сервер
- [ ] Получен новый код
- [ ] Удалены старые node_modules
- [ ] Установлены новые зависимости
- [ ] Проверена конфигурация
- [ ] Запущен сервер
- [ ] Проверен вход в систему
- [ ] Проверены старые функции
- [ ] Проверены новые функции
- [ ] Создана тестовая панель
- [ ] Протестирован live режим

---

**Готово! Вы обновились до версии 2.0! 🎉**

Теперь можете создавать крутые кастомные панели приборов!

