# Примеры использования / Usage Examples

## Примеры Dashboard конфигураций

### 1. Спортивная панель / Racing Dashboard

Идеально для трековых дней и спортивной езды.

```javascript
{
  "settings": {
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#000000",
    "gridSize": 20
  },
  "widgets": [
    // Тахометр в центре
    {
      "type": "tachometer",
      "x": 810,
      "y": 300,
      "width": 300,
      "height": 300,
      "sensorKey": "kc",
      "config": {
        "label": "RPM",
        "maxValue": 8000,
        "warningThreshold": 6500,
        "dangerThreshold": 7500,
        "primaryColor": "#00ff00",
        "warningColor": "#ffaa00",
        "dangerColor": "#ff0000",
        "needleColor": "#ffffff"
      }
    },
    // Спидометр слева
    {
      "type": "speedometer",
      "x": 450,
      "y": 300,
      "width": 300,
      "height": 300,
      "sensorKey": "kff1001",
      "config": {
        "label": "Speed",
        "unit": "km/h",
        "maxValue": 300,
        "primaryColor": "#00aaff"
      }
    },
    // Температура охлаждающей жидкости
    {
      "type": "temperature",
      "x": 150,
      "y": 200,
      "width": 120,
      "height": 500,
      "sensorKey": "k5",
      "config": {
        "label": "Coolant",
        "unit": "°C",
        "maxValue": 120,
        "orientation": "vertical"
      }
    },
    // Давление турбины
    {
      "type": "circular-gauge",
      "x": 1170,
      "y": 300,
      "width": 300,
      "height": 300,
      "sensorKey": "kff1202",
      "config": {
        "label": "Boost",
        "unit": "bar",
        "minValue": -1,
        "maxValue": 2,
        "primaryColor": "#ff00ff"
      }
    },
    // Цифровой дисплей мощности
    {
      "type": "digital-display",
      "x": 810,
      "y": 650,
      "width": 300,
      "height": 150,
      "sensorKey": "kff1226",
      "config": {
        "label": "Horsepower",
        "unit": "HP",
        "decimals": 0,
        "fontSize": 56,
        "glowColor": "#ff00ff",
        "primaryColor": "#ff00ff"
      }
    }
  ]
}
```

### 2. Экономичная панель / Economy Dashboard

Для экономичной езды и контроля расхода топлива.

```javascript
{
  "settings": {
    "width": 1280,
    "height": 720,
    "backgroundColor": "#1a3a1a",
    "gridSize": 20
  },
  "widgets": [
    // Мгновенный расход
    {
      "type": "digital-display",
      "x": 100,
      "y": 100,
      "width": 400,
      "height": 200,
      "sensorKey": "kff1201",
      "config": {
        "label": "Instant MPG",
        "unit": "MPG",
        "decimals": 1,
        "fontSize": 64,
        "glowColor": "#00ff00",
        "primaryColor": "#00ff00"
      }
    },
    // Средний расход
    {
      "type": "digital-display",
      "x": 100,
      "y": 350,
      "width": 400,
      "height": 150,
      "sensorKey": "kff1205",
      "config": {
        "label": "Average MPG",
        "unit": "MPG",
        "decimals": 1,
        "fontSize": 48,
        "primaryColor": "#88ff88"
      }
    },
    // Уровень топлива
    {
      "type": "linear-gauge",
      "x": 550,
      "y": 100,
      "width": 600,
      "height": 80,
      "sensorKey": "k2f",
      "config": {
        "label": "Fuel Level",
        "unit": "%",
        "minValue": 0,
        "maxValue": 100,
        "orientation": "horizontal",
        "showGradient": true,
        "gradientColors": ["#ff0000", "#ffff00", "#00ff00"]
      }
    },
    // Скорость
    {
      "type": "speedometer",
      "x": 550,
      "y": 250,
      "width": 280,
      "height": 280,
      "sensorKey": "kd",
      "config": {
        "label": "Speed",
        "unit": "km/h",
        "maxValue": 200,
        "primaryColor": "#00ff00"
      }
    },
    // Обороты
    {
      "type": "circular-gauge",
      "x": 870,
      "y": 250,
      "width": 280,
      "height": 280,
      "sensorKey": "kc",
      "config": {
        "label": "RPM",
        "maxValue": 6000,
        "primaryColor": "#00aa00"
      }
    }
  ]
}
```

### 3. Компактная панель / Compact Dashboard

Минималистичный дизайн для небольших экранов.

```javascript
{
  "settings": {
    "width": 1280,
    "height": 400,
    "backgroundColor": "#0a0a0a",
    "gridSize": 10
  },
  "widgets": [
    // Скорость
    {
      "type": "digital-display",
      "x": 50,
      "y": 100,
      "width": 250,
      "height": 200,
      "sensorKey": "kff1001",
      "config": {
        "label": "Speed",
        "unit": "km/h",
        "decimals": 0,
        "fontSize": 72,
        "glowColor": "#00aaff",
        "primaryColor": "#00aaff"
      }
    },
    // Обороты
    {
      "type": "digital-display",
      "x": 350,
      "y": 100,
      "width": 250,
      "height": 200,
      "sensorKey": "kc",
      "config": {
        "label": "RPM",
        "unit": "",
        "decimals": 0,
        "fontSize": 72,
        "glowColor": "#ff0000",
        "primaryColor": "#ff0000"
      }
    },
    // Температура
    {
      "type": "linear-gauge",
      "x": 650,
      "y": 120,
      "width": 200,
      "height": 60,
      "sensorKey": "k5",
      "config": {
        "label": "Coolant",
        "unit": "°C",
        "minValue": 50,
        "maxValue": 110,
        "orientation": "horizontal",
        "showGradient": true
      }
    },
    // Нагрузка
    {
      "type": "linear-gauge",
      "x": 650,
      "y": 220,
      "width": 200,
      "height": 60,
      "sensorKey": "k4",
      "config": {
        "label": "Load",
        "unit": "%",
        "minValue": 0,
        "maxValue": 100,
        "orientation": "horizontal",
        "primaryColor": "#ffaa00"
      }
    },
    // Топливо
    {
      "type": "linear-gauge",
      "x": 900,
      "y": 120,
      "width": 60,
      "height": 160,
      "sensorKey": "k2f",
      "config": {
        "label": "Fuel",
        "unit": "%",
        "minValue": 0,
        "maxValue": 100,
        "orientation": "vertical",
        "showGradient": true,
        "gradientColors": ["#ff0000", "#ffff00", "#00ff00"]
      }
    },
    // Напряжение
    {
      "type": "digital-display",
      "x": 1000,
      "y": 100,
      "width": 220,
      "height": 180,
      "sensorKey": "k42",
      "config": {
        "label": "Battery",
        "unit": "V",
        "decimals": 1,
        "fontSize": 48,
        "primaryColor": "#ffff00"
      }
    }
  ]
}
```

### 4. Панель мониторинга / Monitoring Dashboard

Для длительных поездок и мониторинга всех систем.

```javascript
{
  "settings": {
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#1a1a2e",
    "gridSize": 20
  },
  "widgets": [
    // Спидометр
    {
      "type": "speedometer",
      "x": 100,
      "y": 100,
      "width": 400,
      "height": 400,
      "sensorKey": "kd",
      "config": {
        "label": "Vehicle Speed",
        "unit": "km/h",
        "maxValue": 220
      }
    },
    // Тахометр
    {
      "type": "tachometer",
      "x": 550,
      "y": 100,
      "width": 400,
      "height": 400,
      "sensorKey": "kc",
      "config": {
        "label": "Engine RPM",
        "maxValue": 7000
      }
    },
    // Температура охлаждающей жидкости
    {
      "type": "temperature",
      "x": 1000,
      "y": 100,
      "width": 150,
      "height": 400,
      "sensorKey": "k5",
      "config": {
        "label": "Coolant",
        "unit": "°C",
        "maxValue": 120
      }
    },
    // Температура масла
    {
      "type": "temperature",
      "x": 1200,
      "y": 100,
      "width": 150,
      "height": 400,
      "sensorKey": "k5c",
      "config": {
        "label": "Oil",
        "unit": "°C",
        "maxValue": 150
      }
    },
    // Температура воздуха
    {
      "type": "temperature",
      "x": 1400,
      "y": 100,
      "width": 150,
      "height": 400,
      "sensorKey": "kf",
      "config": {
        "label": "Intake",
        "unit": "°C",
        "maxValue": 80
      }
    },
    // Давление во впуске
    {
      "type": "circular-gauge",
      "x": 100,
      "y": 550,
      "width": 300,
      "height": 300,
      "sensorKey": "kb",
      "config": {
        "label": "MAP",
        "unit": "kPa",
        "maxValue": 250
      }
    },
    // Расход воздуха
    {
      "type": "circular-gauge",
      "x": 450,
      "y": 550,
      "width": 300,
      "height": 300,
      "sensorKey": "k10",
      "config": {
        "label": "MAF",
        "unit": "g/s",
        "maxValue": 200
      }
    },
    // Положение дросселя
    {
      "type": "circular-gauge",
      "x": 800,
      "y": 550,
      "width": 300,
      "height": 300,
      "sensorKey": "k11",
      "config": {
        "label": "Throttle",
        "unit": "%",
        "maxValue": 100
      }
    },
    // Нагрузка двигателя
    {
      "type": "circular-gauge",
      "x": 1150,
      "y": 550,
      "width": 300,
      "height": 300,
      "sensorKey": "k4",
      "config": {
        "label": "Load",
        "unit": "%",
        "maxValue": 100
      }
    },
    // Уровень топлива
    {
      "type": "linear-gauge",
      "x": 100,
      "y": 900,
      "width": 700,
      "height": 80,
      "sensorKey": "k2f",
      "config": {
        "label": "Fuel Level",
        "unit": "%",
        "maxValue": 100,
        "orientation": "horizontal",
        "showGradient": true,
        "gradientColors": ["#ff0000", "#ffaa00", "#00ff00"]
      }
    },
    // Напряжение
    {
      "type": "digital-display",
      "x": 850,
      "y": 900,
      "width": 250,
      "height": 150,
      "sensorKey": "k42",
      "config": {
        "label": "Battery",
        "unit": "V",
        "decimals": 1,
        "fontSize": 48
      }
    },
    // Расход топлива
    {
      "type": "digital-display",
      "x": 1150,
      "y": 900,
      "width": 300,
      "height": 150,
      "sensorKey": "kff1201",
      "config": {
        "label": "Fuel Economy",
        "unit": "MPG",
        "decimals": 1,
        "fontSize": 48,
        "primaryColor": "#00ff00"
      }
    }
  ]
}
```

## Примеры интеграции / Integration Examples

### JavaScript API

```javascript
// Создание dashboard через API
fetch('/api/dashboards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Dashboard',
    description: 'Custom racing dashboard',
    config: {
      widgets: [...],
      settings: {...}
    }
  })
})
.then(res => res.json())
.then(dashboard => {
  console.log('Dashboard created:', dashboard.id);
});

// Подключение к live данным
const socket = io();
socket.emit('join-session', 'your-session-id');
socket.on('sensor-data', (data) => {
  console.log('New data:', data.values);
  // Update your widgets
});
```

### OBS Browser Source Settings

```
URL: https://your-server.com/dashboard/live/abc123xyz
Width: 1920
Height: 1080
FPS: 30
✓ Shutdown source when not visible
✓ Refresh browser when scene becomes active
Custom CSS: (leave empty)
```

### Nginx Configuration

```nginx
# WebSocket proxy
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Regular proxy
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Советы по дизайну / Design Tips

### Цветовые схемы

**Классическая (зеленые приборы):**
- Background: `#0a0a0a`
- Primary: `#00ff00`
- Warning: `#ffaa00`
- Danger: `#ff0000`

**Спортивная (красная):**
- Background: `#1a0000`
- Primary: `#ff0000`
- Secondary: `#ffffff`
- Accent: `#ffaa00`

**Синяя (современная):**
- Background: `#0a1a2e`
- Primary: `#00aaff`
- Secondary: `#00ffff`
- Text: `#ffffff`

**Фиолетовая (киберпанк):**
- Background: `#1a0a2e`
- Primary: `#ff00ff`
- Secondary: `#00ffff`
- Glow: `#ff00ff`

### Расположение виджетов

**Правило третей:** Размещайте важные элементы на пересечении линий сетки 3x3

**Z-паттерн:** Располагайте информацию слева-направо, сверху-вниз

**Группировка:** Связанные датчики рядом (RPM + Speed, Temperature + Pressure)

**Размер:** Более важные датчики делайте крупнее

---

Все примеры можно скопировать и вставить в редактор или загрузить через API!

