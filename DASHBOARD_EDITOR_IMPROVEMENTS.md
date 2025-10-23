# Dashboard Editor Improvements - План улучшений

## Проблемы для исправления:

### 1. ❌ Properties Panel - нет прокрутки
**Проблема:** Все параметры не влезают в панель  
**Решение:** Добавить overflow-y: scroll и фиксированную высоту

### 2. ❌ Меню torqueDASH не видно  
**Проблема:** Боковое меню навигации не отображается в редакторе  
**Решение:** Проверить layout и добавить sidebar

---

## Новые функции для виджетов:

### 3. ⭐ Расширенные настройки круговых виджетов

#### 3.1 Угол отображения:
- **startAngle** (0-360°) - начальный угол шкалы
- **endAngle** (0-360°) - конечный угол шкалы  
- **Примеры:**
  - Полный круг: 0° - 360° (100%)
  - Полукруг: 180° - 360° (50%)
  - Четверть круга: 270° - 360° (25%)
  - Минимум: 36° (10% от круга)

#### 3.2 Деления и метки:
- **tickCount** - количество делений/полосочек (5-100)
- **showTicks** - показывать деления (да/нет)
- **tickLength** - длина делений (px)
- **majorTickInterval** - интервал крупных делений
- **showNumbers** - показывать цифры (да/нет)

#### 3.3 Поворот виджета:
- **rotation** (0-360°) - поворот всего виджета

#### 3.4 Размер стрелки/указателя:
- **needleLength** - длина стрелки (% от радиуса)
- **needleWidth** - ширина стрелки (px)

### 4. ⭐ Настройки для изображений

#### 4.1 Позиционирование изображения:
- **imageStartAngle** - начальный угол заполнения
- **imageEndAngle** - конечный угол заполнения
- **imageFillMode** - режим заполнения:
  - `linear` - линейное (как прогресс-бар)
  - `circular` - круговое (по часовой стрелке)
  - `radial` - радиальное (от центра)

#### 4.2 Масштабирование:
- **imageScale** - масштаб изображения (0.1-3.0)
- **imageOffsetX** - смещение по X (px)
- **imageOffsetY** - смещение по Y (px)

### 5. ⭐ Отображение значений датчика

#### 5.1 Цифровое значение:
- **showValue** - показывать число (да/нет)
- **valuePosition** - позиция:
  - `center` - в центре
  - `top` - вверху
  - `bottom` - внизу
  - `custom` - произвольная (X, Y)
- **valueFormat** - формат:
  - `0` - целое число
  - `0.0` - 1 знак после запятой
  - `0.00` - 2 знака после запятой
- **valueSize** - размер шрифта (px)
- **valueColor** - цвет текста

#### 5.2 Единицы измерения:
- **unit** - единица (km/h, °C, RPM и т.д.)
- **showUnit** - показывать единицу (да/нет)
- **unitSize** - размер шрифта единицы (px)

### 6. ⭐ Дополнительные настройки

#### 6.1 Цветовые зоны:
- **zones** - массив зон с цветами:
  ```javascript
  [
    { from: 0, to: 3000, color: '#00ff00' },      // зеленый
    { from: 3000, to: 6000, color: '#ffff00' },   // желтый
    { from: 6000, to: 8000, color: '#ff0000' }    // красный
  ]
  ```

#### 6.2 Анимация:
- **animationDuration** - длительность анимации (ms)
- **animationEasing** - тип анимации:
  - `linear`
  - `ease-in-out`
  - `bounce`

---

## Новый UI панели свойств:

### Структура с категориями (вкладки):

```
[Basic] [Display] [Style] [Image] [Advanced]
```

#### Вкладка "Basic":
- Sensor Key
- Label
- Min/Max Value
- Unit

#### Вкладка "Display":
- Show Value (checkbox)
- Value Position (select)
- Value Format (select)
- Show Unit (checkbox)
- Font Size

#### Вкладка "Style":
- Start Angle (slider + input)
- End Angle (slider + input)
- Rotation (slider + input)
- Tick Count (slider + input)
- Show Ticks (checkbox)
- Colors (zones)

#### Вкладка "Image":
- Background Image
- Foreground Image
- Image Mode
- Start/End Angle for image
- Opacity

#### Вкладка "Advanced":
- Smoothing
- Update Delay
- Animation settings

---

## Примеры конфигураций:

### Полукруглый спидометр (как в машине):
```javascript
{
  type: 'speedometer',
  startAngle: 180,
  endAngle: 360,
  rotation: 0,
  tickCount: 12,
  showNumbers: true,
  showValue: true,
  valuePosition: 'bottom',
  zones: [
    { from: 0, to: 60, color: '#00ff00' },
    { from: 60, to: 120, color: '#ffff00' },
    { from: 120, to: 200, color: '#ff0000' }
  ]
}
```

### Минималистичный круговой индикатор:
```javascript
{
  type: 'circular-gauge',
  startAngle: 0,
  endAngle: 270,
  rotation: 45,
  showTicks: false,
  showNumbers: false,
  showValue: true,
  valuePosition: 'center',
  valueFormat: '0.0',
  needleWidth: 3
}
```

### С кастомным изображением:
```javascript
{
  type: 'speedometer',
  backgroundImageUrl: '/uploads/gauge-bg.png',
  foregroundImageUrl: '/uploads/gauge-needle.png',
  imageMode: 'dual',
  imageStartAngle: 180,
  imageEndAngle: 360,
  showValue: false,
  showNumbers: false
}
```

---

## Приоритеты реализации:

1. ✅ Исправить прокрутку панели свойств
2. ✅ Добавить sidebar с навигацией
3. ⭐ Добавить основные настройки углов (startAngle, endAngle, rotation)
4. ⭐ Добавить настройки отображения значений
5. ⭐ Добавить настройки делений (ticks)
6. ⭐ Добавить настройки для изображений
7. ⭐ Добавить UI с вкладками
8. ⭐ Обновить виджеты для поддержки новых параметров

---

**Начинаем реализацию!** 🚀

