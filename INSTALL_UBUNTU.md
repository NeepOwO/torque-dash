# 🐧 Установка Torque Dash на Ubuntu Linux

Полное руководство по установке и настройке на Ubuntu 20.04/22.04/24.04

---

## 📋 Содержание

1. [Требования](#требования)
2. [Установка Node.js](#установка-nodejs)
3. [Установка PostgreSQL](#установка-postgresql)
4. [Настройка базы данных](#настройка-базы-данных)
5. [Установка приложения](#установка-приложения)
6. [Настройка конфигурации](#настройка-конфигурации)
7. [Первый запуск](#первый-запуск)
8. [Автозапуск (systemd)](#автозапуск-systemd)
9. [Nginx (опционально)](#nginx-reverse-proxy)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Требования

### Минимальные:
- Ubuntu 20.04 LTS или новее
- 1 GB RAM
- 10 GB свободного места
- Доступ через SSH или консоль

### Рекомендуемые:
- Ubuntu 22.04 LTS
- 2 GB RAM
- 20 GB свободного места
- Доменное имя (для публичного доступа)

---

## 📦 Установка Node.js

### Способ 1: Через NodeSource (рекомендуется)

```bash
# Обновите систему
sudo apt update
sudo apt upgrade -y

# Установите curl (если не установлен)
sudo apt install -y curl

# Добавьте репозиторий Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установите Node.js
sudo apt install -y nodejs

# Проверьте версию
node --version  # Должно быть v20.x.x
npm --version   # Должно быть 10.x.x
```

### Способ 2: Через NVM (для разработчиков)

```bash
# Установите NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Перезагрузите shell
source ~/.bashrc

# Установите Node.js LTS
nvm install --lts
nvm use --lts

# Проверьте
node --version
npm --version
```

---

## 🗄️ Установка PostgreSQL

### Установка PostgreSQL 15

```bash
# Установите PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Проверьте статус
sudo systemctl status postgresql

# Должно быть: active (running)
```

### Настройка PostgreSQL

```bash
# Переключитесь на пользователя postgres
sudo -i -u postgres

# Запустите psql
psql

# Создайте пользователя базы данных
CREATE USER torquedash WITH PASSWORD 'your_strong_password_here';

# Создайте базу данных
CREATE DATABASE torquedash OWNER torquedash;

# Дайте права
GRANT ALL PRIVILEGES ON DATABASE torquedash TO torquedash;

# Выйдите из psql
\q

# Вернитесь к своему пользователю
exit
```

### Разрешите удаленные подключения (если нужно)

```bash
# Редактируйте postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Найдите и измените:
listen_addresses = 'localhost'  # или '*' для всех интерфейсов

# Редактируйте pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Добавьте строку для локальных подключений:
host    torquedash    torquedash    127.0.0.1/32    md5

# Перезапустите PostgreSQL
sudo systemctl restart postgresql
```

### Проверка подключения

```bash
# Проверьте подключение
psql -h localhost -U torquedash -d torquedash

# Если просит пароль - введите тот, что указали
# Если подключилось - всё работает!

# Выйдите
\q
```

---

## 📥 Установка приложения

### Способ 1: Git Clone (рекомендуется)

```bash
# Установите git (если не установлен)
sudo apt install -y git

# Перейдите в домашнюю директорию или /opt
cd ~
# или
cd /opt

# Клонируйте репозиторий
git clone https://github.com/yourusername/torque-dash.git

# Перейдите в директорию
cd torque-dash

# Установите зависимости
npm install

# Это займёт несколько минут
```

### Способ 2: Загрузка ZIP

```bash
# Скачайте архив
wget https://github.com/yourusername/torque-dash/archive/refs/heads/master.zip

# Или используйте curl
curl -L https://github.com/yourusername/torque-dash/archive/refs/heads/master.zip -o torque-dash.zip

# Установите unzip (если нужно)
sudo apt install -y unzip

# Распакуйте
unzip master.zip

# Переименуйте директорию
mv torque-dash-master torque-dash

# Перейдите в директорию
cd torque-dash

# Установите зависимости
npm install
```

### Создайте директорию для загрузок

```bash
# Создайте директорию для изображений
mkdir -p public/uploads

# Установите права
chmod 755 public/uploads
```

---

## ⚙️ Настройка конфигурации

### Отредактируйте config.js

```bash
# Откройте конфигурацию
nano config/config.js
```

Измените параметры:

```javascript
let config = {
    port: process.env.PORT || 3000,
    
    // Live-only mode (опционально)
    liveOnlyMode: process.env.LIVE_ONLY_MODE === 'true' || false,
    
    db: {
        // Замените на ваши данные!
        uri: process.env.DATABASE_URL || 'postgres://torquedash:your_strong_password_here@localhost:5432/torquedash',
        options: {
            logging: false
        }
    },
    
    session: {
        // Замените на случайные строки!
        keys: process.env.SESSION_KEYS || ['random_string_1', 'random_string_2', 'random_string_3']
    }
};
```

**Важно:** Замените `your_strong_password_here` на реальный пароль!

### Или используйте переменные окружения

```bash
# Создайте .env файл
nano .env
```

Добавьте:

```bash
PORT=3000
DATABASE_URL=postgres://torquedash:your_strong_password_here@localhost:5432/torquedash
SESSION_KEYS=random_key_1,random_key_2,random_key_3
LIVE_ONLY_MODE=false
```

**Защитите .env файл:**

```bash
chmod 600 .env
```

---

## 🚀 Первый запуск

### Тестовый запуск

```bash
# Убедитесь, что вы в директории проекта
cd ~/torque-dash  # или /opt/torque-dash

# Запустите сервер
npm start
```

**Вывод должен быть:**

```
Executing (default): CREATE TABLE IF NOT EXISTS "Users" ...
Executing (default): CREATE TABLE IF NOT EXISTS "Sessions" ...
Executing (default): CREATE TABLE IF NOT EXISTS "Logs" ...
Executing (default): CREATE TABLE IF NOT EXISTS "Dashboards" ...
Server is running on http://localhost:3000
```

### Проверка работы

```bash
# В другом терминале:
curl http://localhost:3000

# Должно вернуть HTML страницу
```

### Откройте в браузере

Если сервер локальный:
```
http://localhost:3000
```

Если удалённый сервер:
```
http://YOUR_SERVER_IP:3000
```

**Вы должны увидеть страницу входа!**

### Остановка сервера

```bash
# Нажмите Ctrl+C в терминале, где запущен сервер
```

---

## 🔄 Автозапуск (systemd)

Настройте автоматический запуск при загрузке системы.

### Создайте systemd service

```bash
# Создайте файл сервиса
sudo nano /etc/systemd/system/torque-dash.service
```

Вставьте:

```ini
[Unit]
Description=Torque Dash - OBD2 Dashboard
Documentation=https://github.com/yourusername/torque-dash
After=network.target postgresql.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/torque-dash
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /home/YOUR_USERNAME/torque-dash/app.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=torque-dash

[Install]
WantedBy=multi-user.target
```

**Замените:**
- `YOUR_USERNAME` на ваше имя пользователя (например, `ubuntu` или ваш логин)
- Путь `/home/YOUR_USERNAME/torque-dash` на реальный путь к проекту

**Если используете /opt:**
```ini
User=root  # или создайте специального пользователя
WorkingDirectory=/opt/torque-dash
ExecStart=/usr/bin/node /opt/torque-dash/app.js
```

### Узнайте путь к Node.js

```bash
which node
# Вернёт: /usr/bin/node (или другой путь)
```

Используйте этот путь в `ExecStart`.

### Активируйте сервис

```bash
# Перезагрузите systemd
sudo systemctl daemon-reload

# Включите автозапуск
sudo systemctl enable torque-dash

# Запустите сервис
sudo systemctl start torque-dash

# Проверьте статус
sudo systemctl status torque-dash
```

**Должно быть:**
```
● torque-dash.service - Torque Dash - OBD2 Dashboard
   Loaded: loaded (/etc/systemd/system/torque-dash.service; enabled)
   Active: active (running) since ...
```

### Управление сервисом

```bash
# Запустить
sudo systemctl start torque-dash

# Остановить
sudo systemctl stop torque-dash

# Перезапустить
sudo systemctl restart torque-dash

# Статус
sudo systemctl status torque-dash

# Логи
sudo journalctl -u torque-dash -f
```

---

## 🌐 Nginx Reverse Proxy

Настройте Nginx для доступа через порт 80/443 (HTTP/HTTPS).

### Установите Nginx

```bash
sudo apt install -y nginx
```

### Создайте конфигурацию

```bash
sudo nano /etc/nginx/sites-available/torque-dash
```

Вставьте:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен или IP

    # Размер загружаемых файлов (для изображений)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Активируйте конфигурацию

```bash
# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/torque-dash /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

### Проверка

Откройте в браузере:
```
http://your-domain.com
# или
http://YOUR_SERVER_IP
```

### SSL/HTTPS с Let's Encrypt

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получите сертификат
sudo certbot --nginx -d your-domain.com

# Следуйте инструкциям
# Выберите: 2 (Redirect HTTP to HTTPS)

# Проверьте автообновление
sudo certbot renew --dry-run
```

Теперь доступно по HTTPS:
```
https://your-domain.com
```

---

## 🔥 Firewall (UFW)

Настройте firewall для безопасности.

```bash
# Включите UFW
sudo ufw enable

# Разрешите SSH (ВАЖНО!)
sudo ufw allow 22/tcp

# Разрешите HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Если НЕ используете Nginx, разрешите порт Node.js
sudo ufw allow 3000/tcp

# Проверьте статус
sudo ufw status

# Должно показать:
# 22/tcp    ALLOW       Anywhere
# 80/tcp    ALLOW       Anywhere
# 443/tcp   ALLOW       Anywhere
```

---

## 👤 Первая регистрация

### Создайте первого пользователя

1. Откройте браузер: `http://your-server:3000` (или домен)
2. Нажмите **Register**
3. Введите email и пароль (минимум 8 символов)
4. Нажмите **Register**
5. Войдите с этими данными

**Готово! У вас есть первый аккаунт.**

---

## 📱 Настройка Torque Pro

### В приложении Torque Pro:

1. **Settings** → **Data Logging & Upload**
2. **Webserver URL:**
   ```
   http://your-domain.com/api/upload
   # или
   http://YOUR_SERVER_IP:3000/api/upload
   ```
3. **Email Address:** ваш email из регистрации
4. **Upload to Webserver:** ✅ Включить
5. Нажмите **OK**

### Проверка:

1. Запустите Torque Pro
2. Начните запись
3. Данные должны начать отправляться на сервер
4. Проверьте в веб-интерфейсе: **Overview** → должна появиться сессия

---

## 🛠️ Troubleshooting

### Проблема: Не могу подключиться к серверу

**Проверьте:**
```bash
# Запущен ли сервис?
sudo systemctl status torque-dash

# Слушает ли порт?
sudo netstat -tlnp | grep 3000

# Firewall
sudo ufw status
```

**Решение:**
```bash
# Запустите сервис
sudo systemctl start torque-dash

# Проверьте логи
sudo journalctl -u torque-dash -n 50
```

### Проблема: Ошибка подключения к БД

**Проверьте:**
```bash
# Запущен ли PostgreSQL?
sudo systemctl status postgresql

# Можете ли подключиться?
psql -h localhost -U torquedash -d torquedash
```

**Решение:**
```bash
# Запустите PostgreSQL
sudo systemctl start postgresql

# Проверьте пароль в config.js
nano config/config.js
```

### Проблема: npm install падает с ошибками

**Решение:**
```bash
# Очистите кеш
npm cache clean --force

# Удалите node_modules
rm -rf node_modules package-lock.json

# Переустановите
npm install
```

### Проблема: Permission denied для public/uploads

**Решение:**
```bash
# Дайте права
chmod 755 public/uploads

# Если запущено от другого пользователя
sudo chown -R YOUR_USERNAME:YOUR_USERNAME public/uploads
```

### Проблема: WebSocket не работает (Dashboard не обновляется)

**Проверьте Nginx конфигурацию:**
```bash
sudo nano /etc/nginx/sites-available/torque-dash

# Убедитесь, что есть секция для WebSocket:
location /socket.io/ {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ...
}

# Перезапустите Nginx
sudo systemctl restart nginx
```

### Проблема: Высокое использование RAM

**Решение:**
```bash
# Включите Live-Only Mode для экономии памяти
# В .env или config.js:
LIVE_ONLY_MODE=true

# Или для пользователя через Settings в веб-интерфейсе
```

---

## 📊 Мониторинг

### Просмотр логов

```bash
# Логи systemd
sudo journalctl -u torque-dash -f

# Последние 100 строк
sudo journalctl -u torque-dash -n 100

# За последний час
sudo journalctl -u torque-dash --since "1 hour ago"
```

### Использование ресурсов

```bash
# CPU и RAM
htop

# Или
top

# Место на диске
df -h

# Размер базы данных
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('torquedash'));"
```

---

## 🔄 Обновление

### Обновление приложения

```bash
# Перейдите в директорию
cd ~/torque-dash

# Остановите сервис
sudo systemctl stop torque-dash

# Сделайте backup БД
sudo -u postgres pg_dump torquedash > ~/torquedash_backup_$(date +%Y%m%d).sql

# Обновите код (git)
git pull origin master

# Или скачайте новую версию и замените файлы

# Обновите зависимости
npm install

# Запустите сервис
sudo systemctl start torque-dash

# Проверьте статус
sudo systemctl status torque-dash
```

---

## 🎯 Checklist установки

- [ ] Ubuntu обновлена (`sudo apt update && sudo apt upgrade`)
- [ ] Node.js установлен (`node --version`)
- [ ] PostgreSQL установлен и запущен
- [ ] База данных создана
- [ ] Проект скачан/клонирован
- [ ] Зависимости установлены (`npm install`)
- [ ] Конфигурация настроена (`config/config.js`)
- [ ] Директория uploads создана
- [ ] Сервис systemd настроен
- [ ] Сервис запущен и работает
- [ ] Firewall настроен
- [ ] Nginx установлен и настроен (опционально)
- [ ] SSL сертификат получен (опционально)
- [ ] Первый пользователь зарегистрирован
- [ ] Torque Pro настроен и отправляет данные

---

## 📚 Полезные команды

```bash
# Статус всего
sudo systemctl status torque-dash postgresql nginx

# Перезапуск всего
sudo systemctl restart torque-dash nginx

# Просмотр портов
sudo netstat -tlnp

# Процессы Node.js
ps aux | grep node

# Размер БД
sudo -u postgres psql -c "\l+"

# Backup БД
sudo -u postgres pg_dump torquedash > backup.sql

# Restore БД
sudo -u postgres psql torquedash < backup.sql
```

---

## 🆘 Поддержка

**Документация:**
- [README.md](README.md)
- [DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md)
- [USER_SETTINGS_GUIDE.md](USER_SETTINGS_GUIDE.md)

**Проблемы?**
- GitHub Issues: https://github.com/yourusername/torque-dash/issues
- Email: support@example.com

---

**Готово! Ваш сервер Torque Dash работает на Ubuntu! 🐧🚗💨**

