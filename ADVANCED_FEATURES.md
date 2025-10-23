# Расширенные возможности Dashboard / Advanced Dashboard Features

## 🎨 Работа с изображениями / Working with Images

### Режимы изображений / Image Modes

#### 1. Background Mode (Фон)
Одно изображение используется как фон виджета с настраиваемой прозрачностью.

**Применение:**
- Кастомные циферблаты
- Брендинг (логотипы, эмблемы)
- Декоративные элементы

**Настройки:**
```javascript
{
  backgroundImageUrl: "https://example.com/gauge-background.png",
  backgroundOpacity: 0.5, // 0.0 - полностью прозрачный, 1.0 - непрозрачный
  imageMode: "background"
}
```

**Пример использования:**
1. Откройте редактор виджета
2. В разделе **Images** введите URL изображения
3. Установите **Background Opacity** (прозрачность)
4. Выберите **Image Mode**: Background Only

#### 2. Dual Mode (Двойной режим)
Два изображения - одно как фон, второе заполняется по мере роста значения.

**Применение:**
- Топливный бак (пустой → полный)
- Температурные шкалы
- Батарея (разряженная → заряженная)
- Кастомные индикаторы прогресса

**Настройки:**
```javascript
{
  backgroundImageUrl: "https://example.com/tank-empty.png", // Пустой бак
  foregroundImageUrl: "https://example.com/tank-full.png",  // Полный бак
  backgroundOpacity: 0.8,
  foregroundOpacity: 1.0,
  imageMode: "dual",
  fillDirection: "vertical" // или "horizontal"
}
```

**Как это работает:**
- Background всегда отображается полностью
- Foreground отображается только на % соответствующий значению датчика
- Например: топливо = 50% → foreground отображается на 50% высоты

**Пример создания:**
1. Подготовьте 2 изображения:
   - `fuel-empty.png` - пустой бак (серый)
   - `fuel-full.png` - полный бак (зеленый)
2. В редакторе:
   - Background Image URL: ссылка на пустой бак
   - Foreground Image URL: ссылка на полный бак
   - Image Mode: Dual
3. При изменении значения датчика топлива, изображение заполняется!

### Примеры изображений

#### Топливный бак:
```javascript
{
  type: "linear-gauge",
  sensorKey: "k2f",
  orientation: "vertical",
  backgroundImageUrl: "/images/fuel-tank-empty.png",
  foregroundImageUrl: "/images/fuel-tank-full.png",
  imageMode: "dual",
  backgroundOpacity: 0.7,
  foregroundOpacity: 1.0
}
```

#### Кастомный циферблат:
```javascript
{
  type: "circular-gauge",
  sensorKey: "kc",
  backgroundImageUrl: "/images/custom-dial.png",
  backgroundOpacity: 0.8,
  imageMode: "background",
  // Стрелка будет рисоваться поверх изображения
}
```

---

## 🎬 Анимация и сглаживание / Animation & Smoothing

### Сглаживание значений (Smoothing)

Вместо резких скачков значений, виджет плавно переходит к новому значению.

**Параметр:** `smoothing` (0.0 - 1.0)
- **0.0** = мгновенное обновление (нет сглаживания)
- **0.2** = легкое сглаживание (рекомендуется)
- **0.5** = среднее сглаживание
- **0.8** = сильное сглаживание
- **1.0** = очень медленное изменение

**Применение:**
- Датчики с быстро меняющимися значениями (RPM, скорость)
- Для плавности отображения
- Для эстетики и читаемости

**Пример:**
```javascript
{
  type: "tachometer",
  sensorKey: "kc",
  smoothing: 0.3, // Плавные переходы оборотов
  label: "RPM"
}
```

**В редакторе:**
1. Выберите виджет
2. В панели свойств найдите **Animation** → **Smoothing**
3. Передвиньте ползунок (0 = резко, 1 = плавно)
4. Протестируйте в live режиме

### Задержка обновления (Update Delay)

Искусственная задержка перед обновлением значения.

**Параметр:** `updateDelay` (миллисекунды)
- **0** = нет задержки
- **100** = 0.1 секунды
- **500** = 0.5 секунды
- **1000** = 1 секунда

**Применение:**
- Показывать пиковые значения дольше
- Снизить нагрузку на отрисовку
- Синхронизация с другими элементами

**Пример:**
```javascript
{
  type: "digital-display",
  sensorKey: "kff1226",
  updateDelay: 200, // Задержка 200ms
  label: "Horsepower"
}
```

### Комбинация: Smoothing + Delay

```javascript
{
  type: "speedometer",
  sensorKey: "kff1001",
  smoothing: 0.4,      // Плавное изменение
  updateDelay: 100,    // Небольшая задержка
  label: "Speed"
}
```

**Результат:**
- Данные приходят каждую секунду
- Задержка 100ms перед началом изменения
- Плавный переход к новому значению за ~0.5 сек

---

## 💡 Виджет-индикатор (Indicator Light)

Новый тип виджета - лампочка/индикатор, который загорается по условию.

### Основные возможности

#### Формы (Shapes):
- **Circle** - круглый индикатор
- **Square** - квадратный
- **Triangle** - треугольный (предупреждающий знак)
- **Icon** - кастомное изображение/иконка

#### Условия срабатывания (Condition Types):

1. **Threshold (Порог)**
   - Срабатывает при пересечении значения
   - Операторы: `<`, `>`, `<=`, `>=`, `==`, `!=`

2. **Range (Диапазон)**
   - Срабатывает когда значение в диапазоне
   - Настройки: rangeMin, rangeMax

3. **Always (Всегда)**
   - Всегда включен (для тестирования)

#### Режимы мигания (Blink Patterns):
- **Steady** - постоянное свечение
- **Blink** - медленное мигание
- **Fast Blink** - быстрое мигание
- **Pulse** - пульсация (плавное изменение яркости)

### Примеры использования

#### 1. Лампа низкого уровня топлива

```javascript
{
  type: "indicator-light",
  sensorKey: "k2f", // Fuel Level
  shape: "circle",
  size: 80,
  onColor: "#ff6600", // Оранжевый
  offColor: "#333333", // Темный
  glowIntensity: 25,
  
  // Условие: топливо меньше 20%
  conditionType: "threshold",
  thresholdOperator: "<",
  thresholdValue: 20,
  
  // Мигание
  blinkPattern: "blink",
  blinkSpeed: 500,
  
  label: "Low Fuel Warning"
}
```

**Результат:** Оранжевая лампа мигает когда топливо < 20%

#### 2. Индикатор перегрева

```javascript
{
  type: "indicator-light",
  sensorKey: "k5", // Coolant Temperature
  shape: "triangle",
  size: 70,
  onColor: "#ff0000", // Красный
  offColor: "#222222",
  
  // Условие: температура больше 95°C
  conditionType: "threshold",
  thresholdOperator: ">",
  thresholdValue: 95,
  
  // Быстрое мигание при опасности
  blinkPattern: "fast-blink",
  blinkSpeed: 300,
  
  label: "OVERHEAT!"
}
```

#### 3. Индикатор диапазона оборотов (оптимальная зона)

```javascript
{
  type: "indicator-light",
  sensorKey: "kc", // Engine RPM
  shape: "circle",
  size: 60,
  onColor: "#00ff00", // Зеленый
  offColor: "#333333",
  
  // Условие: обороты в диапазоне 2000-4000
  conditionType: "range",
  rangeMin: 2000,
  rangeMax: 4000,
  
  // Постоянное свечение
  blinkPattern: "steady",
  
  label: "Eco Zone"
}
```

#### 4. Иконка Check Engine

```javascript
{
  type: "indicator-light",
  sensorKey: "custom_error_code", // Ваш кастомный датчик
  shape: "icon",
  iconUrl: "/images/check-engine-icon.png",
  iconSize: 50,
  onColor: "#ffaa00",
  
  conditionType: "threshold",
  thresholdOperator: ">",
  thresholdValue: 0, // Любая ошибка
  
  blinkPattern: "pulse",
  
  label: "Check Engine"
}
```

### Настройка в редакторе

1. Добавьте виджет **Indicator Light** из палитры
2. Выберите виджет (двойной клик)
3. В правой панели **Indicator Settings**:

   **Внешний вид:**
   - Shape: выберите форму
   - On Color: цвет когда включен
   - Off Color: цвет когда выключен
   - Icon URL: если выбрали shape=icon

   **Условие:**
   - Condition Type: выберите тип условия
   - Threshold Operator: оператор сравнения
   - Threshold Value: пороговое значение

   **Анимация:**
   - Blink Pattern: режим мигания
   - Blink Speed: скорость мигания (мс)

4. Подключите к датчику в поле **Sensor**
5. Сохраните

---

## 🎯 Практические примеры

### Пример 1: Панель предупреждений

Создайте набор индикаторов для предупреждений:

```javascript
const warnings = [
  {
    // Низкое топливо
    type: "indicator-light",
    x: 100, y: 100,
    sensorKey: "k2f",
    thresholdOperator: "<",
    thresholdValue: 15,
    onColor: "#ff6600",
    blinkPattern: "blink",
    label: "LOW FUEL"
  },
  {
    // Высокая температура
    type: "indicator-light",
    x: 200, y: 100,
    sensorKey: "k5",
    thresholdOperator: ">",
    thresholdValue: 100,
    onColor: "#ff0000",
    blinkPattern: "fast-blink",
    label: "HIGH TEMP"
  },
  {
    // Низкое напряжение батареи
    type: "indicator-light",
    x: 300, y: 100,
    sensorKey: "k42",
    thresholdOperator: "<",
    thresholdValue: 11.5,
    onColor: "#ffaa00",
    blinkPattern: "pulse",
    label: "LOW BATTERY"
  }
];
```

### Пример 2: Спидометр с изображением + индикатор

```javascript
// Спидометр с кастомным циферблатом
{
  type: "speedometer",
  x: 400, y: 200,
  width: 400, height: 400,
  sensorKey: "kff1001",
  backgroundImageUrl: "/images/vintage-speedometer.png",
  backgroundOpacity: 0.7,
  smoothing: 0.3
}

// Индикатор превышения скорости
{
  type: "indicator-light",
  x: 650, y: 150,
  width: 80, height: 80,
  sensorKey: "kff1001",
  shape: "triangle",
  thresholdOperator: ">",
  thresholdValue: 120,
  onColor: "#ff0000",
  blinkPattern: "fast-blink",
  label: "SPEED!"
}
```

### Пример 3: Топливный бак с двойным изображением

```javascript
{
  type: "linear-gauge",
  x: 1600, y: 300,
  width: 200, height: 600,
  sensorKey: "k2f",
  orientation: "vertical",
  
  // Двойное изображение
  backgroundImageUrl: "/images/fuel-tank-outline.png",
  foregroundImageUrl: "/images/fuel-tank-filled.png",
  imageMode: "dual",
  fillDirection: "vertical",
  backgroundOpacity: 0.6,
  foregroundOpacity: 0.9,
  
  // Плавное изменение
  smoothing: 0.5,
  updateDelay: 200,
  
  label: "Fuel"
}
```

---

## 📚 Советы и лучшие практики

### Изображения:
1. **Формат:** используйте PNG с прозрачностью
2. **Размер:** оптимизируйте (не больше 500KB)
3. **Разрешение:** соответствие размеру виджета
4. **Хостинг:** используйте CDN или локальный сервер

### Сглаживание:
1. **RPM/Скорость:** smoothing 0.2-0.4
2. **Температура:** smoothing 0.5-0.7 (медленное изменение)
3. **Топливо:** smoothing 0.6-0.8 (очень медленное)
4. **Индикаторы:** smoothing 0 (мгновенно)

### Индикаторы:
1. **Критичные предупреждения:** fast-blink, яркий цвет
2. **Информационные:** steady или pulse
3. **Группировка:** размещайте вместе по типу
4. **Размер:** достаточно большой для видимости

### Производительность:
1. Не более 3-4 мигающих индикаторов одновременно
2. Оптимизируйте размер изображений
3. Используйте задержку для снижения нагрузки
4. Smoothing > 0 = меньше перерисовок

---

## 🔧 Troubleshooting

### Изображения не загружаются:
- Проверьте URL (должен быть доступен публично)
- Проверьте CORS политику сервера
- Убедитесь что формат поддерживается (PNG, JPG, GIF)

### Индикатор не срабатывает:
- Проверьте что датчик выбран
- Проверьте условие (threshold, operator)
- Проверьте что данные приходят
- Посмотрите console.log для отладки

### Сглаживание работает странно:
- Попробуйте другое значение smoothing
- Проверьте частоту обновления данных
- Убедитесь что smooth update loop запущен

---

**Приятного создания! Create amazing dashboards! 🚗✨**

