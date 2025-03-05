# Mockinator - Расширение для браузера

Mockinator — это расширение для браузера, которое позволяет перехватывать `fetch`-запросы и возвращать mock-данные. Оно идеально подходит для тестирования и отладки веб-приложений, когда реальный сервер недоступен или требуется эмуляция различных сценариев ответов.

---

## Часть 1: Для пользователей

### Что умеет Mockinator?

1. **Перехват запросов**:

   - Перехватывает `fetch`-запросы на указанные URL и методы (GET, POST, PUT, DELETE и т.д.).
   - Возвращает mock-данные вместо реального ответа от сервера.

2. **Настройка правил**:

   - Каждое правило позволяет указать:
     - **Название правила** (для удобства организации).
     - **Метод запроса** (GET, POST, PUT и т.д.).
     - **Часть URL** (например, `/api/data`).
     - **Тип ответа** (успешный, ошибка, редирект).
     - **Mock-данные** (JSON, текст, HTML, XML).
     - **Задержку ответа** (в миллисекундах).
     - **Редирект** (если выбран тип ответа "редирект").

3. **Активация/деактивация правил**:

   - Каждое правило можно активировать или деактивировать в любой момент.
   - Расширение автоматически деактивируется при переходе на другую вкладку.

4. **Импорт/экспорт правил**:

   - Правила можно экспортировать в файл и импортировать из файла для удобства переноса настроек.

5. **Валидация полей**:
   - Поля `PATH` и `DATA` обязательны для заполнения.
   - Минимальная длина для `PATH` и `DATA` — 5 символов.
   - Если поля невалидны, кнопка "Активировать перехват" будет заблокирована.

---

### Как пользоваться Mockinator?

1. **Установка расширения**:

   - Следуйте инструкции в разделе для разработчиков, чтобы установить расширение в браузер.

2. **Добавление правил**:

   - Откройте popup расширения.
   - Нажмите кнопку "Add Rule", чтобы добавить новое правило.
   - Заполните поля:
     - **Название правила** (опционально).
     - **Метод** (например, GET).
     - **PATH** (часть URL, например, `/api/data`).
     - **Тип ответа** (успешный, ошибка, редирект).
     - **Mock-данные** (если выбран тип ответа "успешный").
     - **Задержка** (опционально).
     - **Редирект** (если выбран тип ответа "редирект").

3. **Активация правила**:

   - Убедитесь, что поля `PATH` и `DATA` заполнены корректно.
   - Включите переключатель "Активировать перехват".

4. **Проверка работы**:

   - Откройте вкладку с вашим приложением.
   - Выполните запрос, который соответствует указанному `PATH` и методу.
   - Расширение вернёт mock-данные вместо реального ответа.

5. **Импорт/экспорт правил**:
   - Используйте кнопки "Импорт" и "Экспорт" для сохранения и загрузки правил.

## Часть 2: Для разработчиков

### Установка и запуск

1. **Клонирование репозитория**:
   Выполните команду:

   git clone https://.git
   cd mockinator

2. **Установка зависимостей**:
   Выполните:

   npm install

3. **Запуск в режиме разработки**:
   Для сборки расширения в режиме разработки выполните:

   npm run dev

   Это создаст папку `dev` с файлами расширения.

4. **Сборка для production**:
   Для сборки расширения в production-режиме выполните:

   npm run build

   Это создаст папку `dist` с оптимизированными файлами расширения.

5. **Добавление расширения в браузер**:

- Откройте браузер Chrome.
- Перейдите в `chrome://extensions/`.
- Включите режим разработчика (переключатель в правом верхнем углу).
- Нажмите "Загрузить распакованное расширение".
- Выберите папку `dev` (для разработки) или `dist` (для production).

---

### Структура проекта

- **`public/`**: Статические файлы (HTML, иконки, manifest.json).
- **`src/`**: Исходный код расширения.
- **`background/`**: Фоновый скрипт для управления расширением.
- **`popup/`**: Код для popup-интерфейса.
- **`types/`**: Типы TypeScript.
- **`test/`**: Тестовые файлы для проверки работы расширения.
- **`vite.config.ts`**: Конфигурация сборки с использованием Vite.
- **`package.json`**: Зависимости и скрипты для управления проектом.

---

### Работа с кодом

1. **Добавление новых функций**:

- Для добавления новых функций создавайте новые компоненты или модули в папке `src/`.
- Используйте TypeScript для типизации кода.

2. **Тестирование**:

- Используйте файлы в папке `test/` для проверки работы расширения.
- Для тестирования popup-интерфейса откройте `public/popup.html` в браузере.

3. **Обновление manifest.json**:

- Если вы добавляете новые разрешения или функциональность, обновите файл `public/manifest.json`.

4. **Использование Vite**:

- Проект использует Vite для сборки. Это позволяет быстро разрабатывать и тестировать расширение.
- Для горячей перезагрузки используйте команду `npm run dev`.

---

### Советы для разработчиков

1. **Локальное тестирование**:

- Используйте `chrome://extensions/` для тестирования расширения в браузере.
- Включите режим разработчика для автоматической перезагрузки расширения при изменениях.

2. **Отладка**:

- Для отладки фонового скрипта используйте DevTools (нажмите на "service worker" в `chrome://extensions/`).
- Для отладки popup-интерфейса откройте DevTools прямо в popup.

3. **Оптимизация**:

- Используйте production-сборку (`npm run build`) перед публикацией расширения.
- Убедитесь, что все зависимости оптимизированы и минифицированы.

4. **Документация**:

- Обновляйте `README.md` при добавлении новых функций или изменении структуры проекта.

---

### Лицензия

Этот проект распространяется под лицензией MIT.

---

### Благодарности

Спасибо за использование Mockinator! Если у вас есть предложения или вопросы, создайте issue в репозитории.
