#!/bin/bash
#
# Torque Dash - Quick Install Script for Ubuntu
# Автоматическая установка на Ubuntu 20.04/22.04/24.04
#
# Использование:
#   chmod +x QUICK_INSTALL_UBUNTU.sh
#   sudo ./QUICK_INSTALL_UBUNTU.sh
#

set -e  # Остановка при ошибке

echo "=================================="
echo "  Torque Dash - Quick Install"
echo "=================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции для вывода
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    error "Запустите скрипт с sudo!"
fi

# Получение имени обычного пользователя
REAL_USER=${SUDO_USER:-$USER}
REAL_HOME=$(eval echo ~$REAL_USER)

info "Установка для пользователя: $REAL_USER"
info "Домашняя директория: $REAL_HOME"
echo ""

# 1. Обновление системы
info "Обновление системы..."
apt update
apt upgrade -y

# 2. Установка необходимых пакетов
info "Установка базовых пакетов..."
apt install -y curl wget git unzip build-essential

# 3. Установка Node.js
info "Установка Node.js 20.x LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    info "Node.js установлен: $(node --version)"
else
    info "Node.js уже установлен: $(node --version)"
fi

# 4. Установка PostgreSQL
info "Установка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
    info "PostgreSQL установлен"
else
    info "PostgreSQL уже установлен"
fi

# 5. Настройка базы данных
info "Настройка базы данных..."

# Генерация случайного пароля
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

# Создание пользователя и БД
sudo -u postgres psql -c "DROP DATABASE IF EXISTS torquedash;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS torquedash;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER torquedash WITH PASSWORD '$DB_PASSWORD';" 
sudo -u postgres psql -c "CREATE DATABASE torquedash OWNER torquedash;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE torquedash TO torquedash;"

info "База данных создана"
info "Пользователь БД: torquedash"
info "Пароль БД: $DB_PASSWORD"

# Сохранение пароля в файл
echo "$DB_PASSWORD" > $REAL_HOME/.torquedash_db_password
chown $REAL_USER:$REAL_USER $REAL_HOME/.torquedash_db_password
chmod 600 $REAL_HOME/.torquedash_db_password
info "Пароль сохранён в: $REAL_HOME/.torquedash_db_password"

# 6. Клонирование проекта
info "Клонирование Torque Dash..."
INSTALL_DIR="$REAL_HOME/torque-dash"

if [ -d "$INSTALL_DIR" ]; then
    warn "Директория $INSTALL_DIR уже существует. Удалить? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
    else
        error "Установка прервана"
    fi
fi

# Клонирование с GitHub
cd $REAL_HOME

# Очистка git credential cache (на всякий случай)
sudo -u $REAL_USER git config --global --unset credential.helper 2>/dev/null || true

info "Клонирование с https://github.com/NeepOwO/torque-dash.git"
if sudo -u $REAL_USER git clone https://github.com/NeepOwO/torque-dash.git; then
    info "✅ Клонирование успешно"
else
    warn "Git clone не удался. Пробуем альтернативный способ (ZIP)..."
    
    # Альтернативный способ: скачать ZIP архив
    info "Скачивание ZIP архива..."
    sudo -u $REAL_USER wget -O torque-dash.zip https://github.com/NeepOwO/torque-dash/archive/refs/heads/master.zip || {
        error "Не удалось скачать проект. Проверьте интернет-соединение."
    }
    
    info "Распаковка архива..."
    sudo -u $REAL_USER unzip -q torque-dash.zip
    sudo -u $REAL_USER mv torque-dash-master torque-dash
    sudo -u $REAL_USER rm torque-dash.zip
    info "✅ Загрузка через ZIP успешна"
fi

cd $INSTALL_DIR

# 7. Установка зависимостей
info "Установка зависимостей Node.js..."
sudo -u $REAL_USER npm install

# 8. Создание директории для загрузок
info "Создание директории для загрузок..."
mkdir -p public/uploads
chown -R $REAL_USER:$REAL_USER public/uploads
chmod 755 public/uploads

# 9. Настройка конфигурации
info "Настройка конфигурации..."

# Генерация случайных ключей сессии
SESSION_KEY1=$(openssl rand -base64 32)
SESSION_KEY2=$(openssl rand -base64 32)
SESSION_KEY3=$(openssl rand -base64 32)

# Создание .env файла
cat > .env << EOF
PORT=3000
DATABASE_URL=postgres://torquedash:$DB_PASSWORD@localhost:5432/torquedash
SESSION_KEYS=$SESSION_KEY1,$SESSION_KEY2,$SESSION_KEY3
LIVE_ONLY_MODE=false
NODE_ENV=production
EOF

chown $REAL_USER:$REAL_USER .env
chmod 600 .env

info "Конфигурация создана (.env)"

# 10. Создание systemd service
info "Создание systemd service..."

cat > /etc/systemd/system/torque-dash.service << EOF
[Unit]
Description=Torque Dash - OBD2 Dashboard
Documentation=https://github.com/yourusername/torque-dash
After=network.target postgresql.service

[Service]
Type=simple
User=$REAL_USER
WorkingDirectory=$INSTALL_DIR
Environment="NODE_ENV=production"
EnvironmentFile=$INSTALL_DIR/.env
ExecStart=$(which node) $INSTALL_DIR/app.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=torque-dash

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable torque-dash

info "Systemd service создан"

# 11. Настройка firewall
info "Настройка firewall (UFW)..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp  # SSH
    ufw allow 3000/tcp  # Node.js
    ufw reload
    info "Firewall настроен (порты 22, 3000 открыты)"
else
    warn "UFW не установлен. Настройте firewall вручную."
fi

# 12. Запуск сервиса
info "Запуск Torque Dash..."
systemctl start torque-dash
sleep 3

# Проверка статуса
if systemctl is-active --quiet torque-dash; then
    info "✅ Torque Dash успешно запущен!"
else
    error "❌ Не удалось запустить Torque Dash. Проверьте логи: sudo journalctl -u torque-dash -n 50"
fi

# 13. Вывод информации
echo ""
echo "=================================="
echo "  Установка завершена!"
echo "=================================="
echo ""
echo -e "${GREEN}✅ Torque Dash установлен и запущен!${NC}"
echo ""
echo "📋 Информация:"
echo "  - Директория: $INSTALL_DIR"
echo "  - Порт: 3000"
echo "  - База данных: torquedash"
echo "  - Пользователь БД: torquedash"
echo "  - Пароль БД: (сохранён в $REAL_HOME/.torquedash_db_password)"
echo ""
echo "🌐 Доступ:"
echo "  - Локально: http://localhost:3000"
echo "  - По сети: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📱 Настройка Torque Pro:"
echo "  1. Сначала зарегистрируйтесь на сайте"
echo "  2. Settings → Data Logging & Upload"
echo "  3. Webserver URL: http://$(hostname -I | awk '{print $1}'):3000/api/upload"
echo "  4. Email Address: <ваш email из регистрации>"
echo ""
echo "🔧 Управление сервисом:"
echo "  sudo systemctl start torque-dash     # Запустить"
echo "  sudo systemctl stop torque-dash      # Остановить"
echo "  sudo systemctl restart torque-dash   # Перезапустить"
echo "  sudo systemctl status torque-dash    # Статус"
echo "  sudo journalctl -u torque-dash -f    # Логи"
echo ""
echo "📚 Документация:"
echo "  - Полное руководство: $INSTALL_DIR/INSTALL_UBUNTU.md"
echo "  - Настройки пользователя: $INSTALL_DIR/USER_SETTINGS_GUIDE.md"
echo "  - Dashboard гайд: $INSTALL_DIR/DASHBOARD_GUIDE.md"
echo ""
echo "⚠️  ВАЖНО: Сохраните пароль БД из файла:"
echo "    cat $REAL_HOME/.torquedash_db_password"
echo ""
echo "🎉 Готово! Откройте http://$(hostname -I | awk '{print $1}'):3000 в браузере!"
echo ""

