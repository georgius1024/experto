# Experto Crede - backend-компонент

- Скопируйте `.env.sample` в `.env`
- Отредактируйте в нем параметры `APP_LISTEN_PORT` и `APP_PUBLIC_URL` в соответствии с хоcтингом
- сгенерируйте уникальный ключ приложения и заполните поле `APP_KEY`
- в параметрах `SSL_CERT` и `SSL_KEY` укажите пути к сертификатам SSL
- **укажите endpoint вашего медиа-серврера** в `MEDIA_API_URL`
- настройте переметры smtp-сервера
- в папку `/public/` поместите файлы фронтенд-приложения
- выполните `npm i` для установки зависимостей
- выполните `npm run experts` и создайте список экспертов
- запустите сервис командой `npm run start`
