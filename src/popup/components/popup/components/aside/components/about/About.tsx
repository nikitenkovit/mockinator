import React from 'react';
import styles from './About.module.css';

export const About = () => {
  return (
    <div className={styles.container}>
      <h1>Mockinator - Расширение для браузера</h1>
      <p className={styles.block}>
        Mockinator — это расширение для браузера, которое позволяет
        перехватывать <code>fetch</code>-запросы и возвращать mock-данные. Оно
        идеально подходит для тестирования и отладки веб-приложений, когда
        реальный сервер недоступен или требуется эмуляция различных сценариев
        ответов.
      </p>

      <hr />

      <h2>Что умеет Mockinator?</h2>
      <ol>
        <li>
          <strong>Перехват запросов:</strong>
          <ul className={styles.block}>
            <li>
              Перехватывает <code>fetch</code>-запросы на указанные URL и методы
              (GET, POST, PUT, DELETE и т.д.).
            </li>
            <li>Возвращает mock-данные вместо реального ответа от сервера.</li>
          </ul>
        </li>
        <li>
          <strong>Настройка правил:</strong>
          <ul className={styles.block}>
            <li>Каждое правило позволяет указать:</li>
            <ul>
              <li>
                <strong>Название правила</strong> (для удобства организации).
              </li>
              <li>
                <strong>Метод запроса</strong> (GET, POST, PUT и т.д.).
              </li>
              <li>
                <strong>Часть URL</strong> (например, <code>/api/data</code>).
              </li>
              <li>
                <strong>Тип ответа</strong> (успешный, ошибка, редирект).
              </li>
              <li>
                <strong>Mock-данные</strong> (JSON, текст, HTML, XML).
              </li>
              <li>
                <strong>Задержку ответа</strong> (в миллисекундах).
              </li>
              <li>
                <strong>Редирект</strong> (если выбран тип ответа "редирект").
              </li>
            </ul>
          </ul>
        </li>
        <li>
          <strong>Активация/деактивация правил:</strong>
          <ul className={styles.block}>
            <li>
              Каждое правило можно активировать или деактивировать в любой
              момент.
            </li>
            <li>
              Расширение автоматически деактивируется при переходе на другую
              вкладку.
            </li>
          </ul>
        </li>
        <li>
          <strong>Импорт/экспорт правил:</strong>
          <ul className={styles.block}>
            <li>
              Правила можно экспортировать в файл и импортировать из файла для
              удобства переноса настроек.
            </li>
          </ul>
        </li>
        <li>
          <strong>Валидация полей:</strong>
          <ul className={styles.block}>
            <li>
              Поля <code>PATH</code> и <code>DATA</code> обязательны для
              заполнения.
            </li>
            <li>
              Минимальная длина для <code>PATH</code> и <code>DATA</code> — 5
              символов.
            </li>
            <li>
              Если поля невалидны, кнопка "Активировать перехват" будет
              заблокирована.
            </li>
          </ul>
        </li>
      </ol>

      <hr />

      <h2>Как пользоваться Mockinator?</h2>
      <ol>
        <li>
          <strong>Установка расширения:</strong>
          <ul className={styles.block}>
            <li>
              Следуйте инструкции в разделе для разработчиков, чтобы установить
              расширение в браузер.
            </li>
          </ul>
        </li>
        <li>
          <strong>Добавление правил:</strong>
          <ul className={styles.block}>
            <li>Откройте popup расширения.</li>
            <li>Нажмите кнопку "Add Rule", чтобы добавить новое правило.</li>
            <li>Заполните поля:</li>
            <ul>
              <li>
                <strong>Название правила</strong> (опционально).
              </li>
              <li>
                <strong>Метод</strong> (например, GET).
              </li>
              <li>
                <strong>PATH</strong> (часть URL, например,{' '}
                <code>/api/data</code>).
              </li>
              <li>
                <strong>Тип ответа</strong> (успешный, ошибка, редирект).
              </li>
              <li>
                <strong>Mock-данные</strong> (если выбран тип ответа
                "успешный").
              </li>
              <li>
                <strong>Задержка</strong> (опционально).
              </li>
              <li>
                <strong>Редирект</strong> (если выбран тип ответа "редирект").
              </li>
            </ul>
          </ul>
        </li>
        <li>
          <strong>Активация правила:</strong>
          <ul className={styles.block}>
            <li>
              Убедитесь, что поля <code>PATH</code> и <code>DATA</code>{' '}
              заполнены корректно.
            </li>
            <li>Включите переключатель "Активировать перехват".</li>
          </ul>
        </li>
        <li>
          <strong>Проверка работы:</strong>
          <ul className={styles.block}>
            <li>Откройте вкладку с вашим приложением.</li>
            <li>
              Выполните запрос, который соответствует указанному{' '}
              <code>PATH</code> и методу.
            </li>
            <li>Расширение вернёт mock-данные вместо реального ответа.</li>
          </ul>
        </li>
        <li>
          <strong>Импорт/экспорт правил:</strong>
          <ul className={styles.block}>
            <li>
              Используйте кнопки "Импорт" и "Экспорт" для сохранения и загрузки
              правил.
            </li>
          </ul>
        </li>
      </ol>

      <hr />

      <h2>Благодарности</h2>
      <p className={styles.block}>
        Спасибо за использование Mockinator! Если у вас есть предложения или
        вопросы, создайте issue в репозитории.
      </p>
    </div>
  );
};
