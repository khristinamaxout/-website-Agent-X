# Деплой на Timeweb Cloud (S3)

## Быстрый старт

1. Установите зависимости (один раз):
   ```bash
   npm install
   ```

2. Сожмите изображения и соберите папку для заливки:
   ```bash
   npm run prepare:timeweb
   ```

3. Загрузите **содержимое папки `dist/`** в корень S3-бакета (не саму папку `dist`, а файлы внутри).

## Структура `dist/`

```
dist/
├── index.html          ← главная (в корне бакета!)
├── examples.html
├── privacy.html
├── offer.html
├── 404.html
├── robots.txt
├── styles.css
├── script.js
├── ...
└── images/
```

## Настройка бакета Timeweb

1. **S3 → Создать бакет** → тариф **1 ГБ**, тип **публичный**
2. Загрузить файлы из `dist/`
3. **Настройки → Веб-сайт** → включить статический сайт
   - Индекс: `index.html`
   - Ошибка 404: `404.html`
4. (Опционально) **CDN** → источник = ваш бакет → свой домен + SSL

Документация: [Статические сайты в S3](https://timeweb.cloud/docs/s3-storage/supported-features/static-websites)

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` собирает чистую папку `dist/` (`npm run prepare:timeweb`) и публикует только её — без черновиков и локального мусора из корня репозитория.

Переменная `SITE_BASE_URL` в CI задаёт абсолютные URL для `sitemap.xml`, `robots.txt` и Open Graph.

## Команды

| Команда | Действие |
|---------|----------|
| `npm run compress` | Сжать изображения в `images/` |
| `npm run build:timeweb` | Собрать `dist/` |
| `npm run prepare:timeweb` | Сжать + собрать |
