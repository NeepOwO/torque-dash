# Руководство по загрузке изображений / Image Upload Guide

## 📤 Загрузка изображений на сервер

Вместо использования внешних URL, вы можете загружать изображения прямо на сервер.

---

## 🎨 Использование в редакторе

### 1. Через интерфейс редактора

1. **Откройте редактор dashboard**
2. **Выберите виджет** (двойной клик)
3. **В панели свойств** найдите секцию **Images**
4. **Загрузите изображение:**

   **Кнопка Upload (📤):**
   - Нажмите кнопку с иконкой upload
   - Выберите файл на компьютере
   - Изображение автоматически загрузится
   - URL появится в поле ввода

   **Кнопка Browse (🖼️):**
   - Нажмите кнопку с иконкой images
   - Откроется галерея загруженных изображений
   - Выберите нужное изображение
   - URL вставится в поле

5. **Сохраните dashboard**

### 2. Поддерживаемые форматы

- **JPEG/JPG** - фотографии
- **PNG** - с прозрачностью (рекомендуется)
- **GIF** - анимация не поддерживается, только статичное
- **WEBP** - современный формат
- **SVG** - векторная графика

### 3. Ограничения

- **Максимальный размер файла:** 5 MB
- **Рекомендуемый размер:** до 500 KB для быстрой загрузки
- **Разрешение:** соответствующее размеру виджета

---

## 🔧 API для загрузки

### POST /api/upload-image

Загружает изображение на сервер.

**Требования:** аутентификация

**Формат:** multipart/form-data

**Параметры:**
- `image` - файл изображения

**Пример (JavaScript):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('/api/upload-image', {
    method: 'POST',
    body: formData
})
.then(res => res.json())
.then(data => {
    console.log('Uploaded:', data.url);
});
```

**Ответ:**
```json
{
    "success": true,
    "url": "/uploads/image-1234567890.png",
    "filename": "image-1234567890.png",
    "originalName": "my-image.png",
    "size": 123456,
    "mimetype": "image/png"
}
```

---

### GET /api/images

Получает список всех загруженных изображений.

**Требования:** аутентификация

**Ответ:**
```json
{
    "images": [
        {
            "filename": "image-1234567890.png",
            "url": "/uploads/image-1234567890.png",
            "size": 123456,
            "created": "2025-01-01T00:00:00.000Z",
            "modified": "2025-01-01T00:00:00.000Z"
        }
    ]
}
```

---

### DELETE /api/images/:filename

Удаляет загруженное изображение.

**Требования:** аутентификация

**Пример:**
```javascript
fetch('/api/images/image-1234567890.png', {
    method: 'DELETE'
})
.then(res => res.json())
.then(data => {
    console.log('Deleted:', data.message);
});
```

---

## 📁 Хранение файлов

### Расположение
Изображения сохраняются в: `public/uploads/`

### Именование файлов
Автоматическое: `название-timestamp-random.ext`

Пример: `speedometer-1704067200000-123456789.png`

### Доступ
Все изображения доступны по URL: `http://your-server.com/uploads/filename.png`

---

## 💡 Рекомендации

### Оптимизация изображений

**Перед загрузкой:**
1. Сожмите изображения (TinyPNG, ImageOptim)
2. Используйте правильный формат:
   - **PNG** - для графики с прозрачностью
   - **JPG** - для фотографий
   - **WEBP** - лучшее сжатие
3. Масштабируйте под нужный размер

**Размеры:**
- Для виджета 200x200: изображение ~400x400 (для Retina)
- Для виджета 400x400: изображение ~800x800
- Не загружайте огромные изображения для маленьких виджетов

### Организация

**Именование файлов:**
- Используйте понятные имена
- `speedometer-dial.png`
- `fuel-tank-empty.png`
- `fuel-tank-full.png`

**Парные изображения для Dual Mode:**
```
gauge-background.png
gauge-foreground.png

tank-empty.png
tank-full.png

battery-low.png
battery-high.png
```

---

## 🎯 Примеры использования

### Пример 1: Загрузка через UI

```
1. Редактор → Выберите виджет
2. Images → Background Image → Click Upload (📤)
3. Выберите файл: my-speedometer.png
4. Файл загружается
5. URL появляется: /uploads/my-speedometer-1704067200000-123456789.png
6. Изображение автоматически применяется
```

### Пример 2: Загрузка через API

```javascript
// HTML
<input type="file" id="imageFile" accept="image/*">
<button onclick="uploadMyImage()">Upload</button>

// JavaScript
async function uploadMyImage() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Select a file first');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Uploaded! URL:', data.url);
            // Использовать data.url в конфигурации виджета
        }
    } catch (err) {
        console.error('Upload failed:', err);
    }
}
```

### Пример 3: Dual Mode с загруженными изображениями

```javascript
// Загрузите два изображения:
// 1. background: /uploads/tank-empty.png
// 2. foreground: /uploads/tank-full.png

// Конфигурация виджета:
{
    type: "linear-gauge",
    sensorKey: "k2f",
    backgroundImageUrl: "/uploads/tank-empty.png",
    foregroundImageUrl: "/uploads/tank-full.png",
    imageMode: "dual",
    backgroundOpacity: 0.8,
    foregroundOpacity: 1.0,
    fillDirection: "vertical"
}
```

---

## 🔒 Безопасность

### Проверки на сервере:
- ✅ Проверка типа файла (только изображения)
- ✅ Ограничение размера (5 MB)
- ✅ Безопасное именование файлов
- ✅ Требуется аутентификация

### Рекомендации:
1. Не загружайте чужие изображения без прав
2. Удаляйте неиспользуемые изображения
3. Регулярно проверяйте папку uploads на мусор

---

## 🧹 Управление файлами

### Очистка неиспользуемых изображений

**Вручную:**
```bash
# На сервере
cd public/uploads
ls -lh  # Посмотреть файлы
rm old-image.png  # Удалить файл
```

**Через API:**
```javascript
// Удалить конкретное изображение
fetch('/api/images/old-image.png', {
    method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log('Deleted'));
```

### Резервное копирование

```bash
# Создать архив загруженных изображений
cd public
tar -czf uploads-backup.tar.gz uploads/

# Восстановить
tar -xzf uploads-backup.tar.gz
```

---

## 🐛 Troubleshooting

### Изображение не загружается

**Проверьте:**
1. Размер файла < 5 MB
2. Формат файла (jpg, png, gif, webp, svg)
3. Вы авторизованы
4. Права на запись в папку `public/uploads`

**Ошибка "Failed to upload":**
```bash
# Проверьте права на папку
chmod 755 public/uploads

# Или создайте папку если нет
mkdir -p public/uploads
```

### Изображение загрузилось но не отображается

**Проверьте:**
1. URL правильный: `/uploads/filename.png`
2. Файл существует: `ls public/uploads/`
3. Путь в конфигурации виджета
4. Console browser (F12) на ошибки загрузки

### Изображения занимают много места

**Решение:**
1. Удалите неиспользуемые через API
2. Оптимизируйте изображения перед загрузкой
3. Используйте WEBP формат для лучшего сжатия

---

**Приятной работы с изображениями! 🎨📤**

