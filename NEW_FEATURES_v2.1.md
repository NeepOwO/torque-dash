# Новые возможности v2.1 / New Features v2.1

## 🎉 Что нового / What's New

### Версия 2.1 добавляет расширенные возможности кастомизации виджетов!

---

## ✨ Основные новые возможности

### 1. 🖼️ Поддержка кастомных изображений

#### Одно изображение (фон)
- Наложение изображения как полупрозрачный фон
- Настройка прозрачности (0.0 - 1.0)
- Идеально для кастомных циферблатов, брендинга

#### Два изображения (фон + заливка)
- Фоновое изображение (пустое состояние)
- Переднее изображение (заполняется по мере роста значения)
- Идеально для: топливные баки, батареи, температурные шкалы

**Пример: топливный бак**
```javascript
{
  backgroundImageUrl: "/images/tank-empty.png",  // Пустой бак
  foregroundImageUrl: "/images/tank-full.png",   // Полный бак
  imageMode: "dual",
  backgroundOpacity: 0.7,
  foregroundOpacity: 1.0
}
```

---

### 2. 🎬 Плавная анимация значений

#### Сглаживание (Smoothing)
- Плавные переходы между значениями вместо резких скачков
- Параметр: `smoothing` (0 = мгновенно, 1 = очень плавно)
- Рекомендуется 0.2-0.4 для большинства датчиков

**Применение:**
- RPM, скорость: `smoothing: 0.3`
- Температура: `smoothing: 0.6`
- Топливо: `smoothing: 0.8`

#### Задержка обновления (Update Delay)
- Искусственная задержка перед обновлением значения
- Параметр: `updateDelay` (миллисекунды)
- Полезно для: показа пиковых значений, снижения нагрузки

**Пример:**
```javascript
{
  smoothing: 0.4,      // Плавное изменение
  updateDelay: 100,    // Задержка 100ms
}
```

---

### 3. 💡 Виджет-индикатор (Indicator Light)

Новый тип виджета для предупреждений и индикации!

#### Возможности:
- **4 формы:** круг, квадрат, треугольник, кастомная иконка
- **Условия срабатывания:**
  - Threshold (порог): <, >, <=, >=, ==, !=
  - Range (диапазон): срабатывает в диапазоне значений
  - Always (всегда): постоянно включен
- **4 режима мигания:**
  - Steady - постоянное свечение
  - Blink - медленное мигание
  - Fast Blink - быстрое мигание
  - Pulse - плавная пульсация

#### Примеры использования:

**Лампа низкого топлива:**
```javascript
{
  type: "indicator-light",
  sensorKey: "k2f",
  shape: "circle",
  onColor: "#ff6600",
  thresholdOperator: "<",
  thresholdValue: 20,  // Меньше 20%
  blinkPattern: "blink"
}
```

**Предупреждение о перегреве:**
```javascript
{
  type: "indicator-light",
  sensorKey: "k5",
  shape: "triangle",
  onColor: "#ff0000",
  thresholdOperator: ">",
  thresholdValue: 95,  // Больше 95°C
  blinkPattern: "fast-blink"
}
```

**Индикатор оптимальных оборотов:**
```javascript
{
  type: "indicator-light",
  sensorKey: "kc",
  shape: "circle",
  onColor: "#00ff00",
  conditionType: "range",
  rangeMin: 2000,
  rangeMax: 4000,
  blinkPattern: "steady"
}
```

---

## 📋 Как использовать новые возможности

### В редакторе Dashboard:

1. **Выберите или создайте виджет**
2. **Дважды кликните** для открытия свойств
3. **Найдите новые секции:**

#### Секция "Images" (Изображения):
- **Background Image URL** - ссылка на фоновое изображение
- **Background Opacity** - прозрачность фона (0-1)
- **Foreground Image URL** - ссылка на переднее изображение
- **Image Mode** - режим (background/dual)

#### Секция "Animation" (Анимация):
- **Smoothing** - плавность (0-1)
- **Update Delay** - задержка в миллисекундах

#### Для Indicator Light:
- **Shape** - форма (circle, square, triangle, icon)
- **Icon URL** - ссылка на иконку (если shape=icon)
- **On Color** - цвет когда включен
- **Off Color** - цвет когда выключен
- **Condition Type** - тип условия
- **Threshold Operator** - оператор сравнения
- **Threshold Value** - пороговое значение
- **Blink Pattern** - режим мигания
- **Blink Speed** - скорость мигания (мс)

---

## 🎯 Практические примеры

### Пример 1: Спидометр с кастомным циферблатом

```javascript
{
  type: "speedometer",
  sensorKey: "kff1001",
  x: 400, y: 200,
  width: 400, height: 400,
  
  // Кастомное изображение циферблата
  backgroundImageUrl: "https://example.com/vintage-dial.png",
  backgroundOpacity: 0.7,
  imageMode: "background",
  
  // Плавное изменение
  smoothing: 0.3,
  
  label: "Speed"
}
```

### Пример 2: Топливный бак с двойным изображением

```javascript
{
  type: "linear-gauge",
  sensorKey: "k2f",
  x: 1600, y: 300,
  width: 200, height: 600,
  orientation: "vertical",
  
  // Два изображения для эффекта заполнения
  backgroundImageUrl: "/images/fuel-empty.png",
  foregroundImageUrl: "/images/fuel-full.png",
  imageMode: "dual",
  backgroundOpacity: 0.6,
  foregroundOpacity: 0.9,
  
  // Медленное плавное изменение
  smoothing: 0.7,
  updateDelay: 200,
  
  label: "Fuel"
}
```

### Пример 3: Панель предупреждений

```javascript
// Низкое топливо
{
  type: "indicator-light",
  sensorKey: "k2f",
  x: 100, y: 100,
  width: 80, height: 80,
  shape: "circle",
  onColor: "#ff6600",
  thresholdOperator: "<",
  thresholdValue: 15,
  blinkPattern: "blink",
  label: "LOW FUEL"
}

// Перегрев
{
  type: "indicator-light",
  sensorKey: "k5",
  x: 200, y: 100,
  width: 80, height: 80,
  shape: "triangle",
  onColor: "#ff0000",
  thresholdOperator: ">",
  thresholdValue: 100,
  blinkPattern: "fast-blink",
  label: "OVERHEAT"
}

// Низкий заряд батареи
{
  type: "indicator-light",
  sensorKey: "k42",
  x: 300, y: 100,
  width: 80, height: 80,
  shape: "square",
  onColor: "#ffaa00",
  thresholdOperator: "<",
  thresholdValue: 11.5,
  blinkPattern: "pulse",
  label: "BATTERY"
}
```

---

## 🔧 Технические детали

### API изменения:

#### Базовый класс DashboardWidget теперь поддерживает:
```javascript
{
  // Изображения
  backgroundImageUrl: null,
  foregroundImageUrl: null,
  backgroundOpacity: 0.5,
  foregroundOpacity: 1.0,
  imageMode: 'background',
  fillDirection: 'vertical',
  
  // Анимация
  smoothing: 0.2,
  updateDelay: 0,
  
  // Множественные сенсоры
  sensorKeys: []
}
```

#### Новый класс IndicatorLight:
```javascript
{
  shape: 'circle',
  size: 60,
  offColor: '#333333',
  onColor: '#ff0000',
  glowIntensity: 20,
  
  conditionType: 'threshold',
  thresholdValue: 50,
  thresholdOperator: '<',
  rangeMin: 0,
  rangeMax: 100,
  
  blinkEnabled: false,
  blinkSpeed: 500,
  blinkPattern: 'steady',
  
  iconUrl: null,
  iconSize: 40
}
```

---

## 📚 Документация

Подробные гайды:
- **[ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)** - полное руководство по новым возможностям
- **[DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md)** - общее руководство по dashboard
- **[EXAMPLES.md](EXAMPLES.md)** - примеры конфигураций

---

## 🚀 Быстрый старт

### 1. Попробуйте индикатор:
1. Откройте редактор dashboard
2. Добавьте **Indicator Light** из палитры
3. Выберите датчик (например, Fuel Level)
4. Установите условие: `< 20`
5. Выберите blink pattern: Blink
6. Сохраните и запустите Live!

### 2. Добавьте кастомное изображение:
1. Найдите изображение циферблата (PNG)
2. Загрузите на хостинг или используйте URL
3. Добавьте любой виджет
4. В свойствах → Images → Background Image URL
5. Установите Opacity: 0.7
6. Сохраните!

### 3. Настройте сглаживание:
1. Выберите любой виджет
2. В свойствах → Animation → Smoothing
3. Установите 0.3
4. Запустите Live и наблюдайте плавные переходы!

---

## 💡 Советы

### Для лучших результатов:

**Изображения:**
- Используйте PNG с прозрачностью
- Размер до 500KB для быстрой загрузки
- Разрешение должно соответствовать размеру виджета

**Сглаживание:**
- Быстрые датчики (RPM, Speed): 0.2-0.4
- Медленные (Temperature): 0.5-0.7
- Очень медленные (Fuel): 0.7-0.9

**Индикаторы:**
- Критичные: fast-blink + яркий цвет
- Информационные: steady или pulse
- Не более 3-4 мигающих одновременно

---

## ⚡ Производительность

Оптимизации:
- Сглаживание снижает частоту перерисовки
- Задержка помогает при большом количестве виджетов
- Изображения кэшируются браузером
- Индикаторы используют requestAnimationFrame

---

## 🐛 Известные ограничения

1. **Изображения:** Должны быть доступны по CORS
2. **Smoothing:** Может добавить задержку на быстрые изменения
3. **Индикаторы:** Много мигающих = больше нагрузка на CPU

---

## 🎓 Что дальше?

Планируемые улучшения:
- [ ] Загрузка изображений прямо в редакторе
- [ ] Больше форм для индикаторов
- [ ] Анимированные GIF/APNG
- [ ] Звуковые оповещения
- [ ] Комплексные условия (AND/OR)
- [ ] Эффекты переходов

---

**Наслаждайтесь новыми возможностями! Enjoy the new features! 🚗✨**

Создавайте ещё более красивые и функциональные панели приборов!

