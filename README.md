# Payments Dashboard

Мини-система учета оплат, проектов и закрывающих документов (актов) для digital-агентства.
Помогает менеджерам видеть, по каким оплатам акты ещё не отправлены, какие висят без подписи
слишком долго, а какие уже закрыты.

- **Frontend (Vercel):** https://frontend-ivory-rho-38.vercel.app
- **Backend (Railway):** https://payments-dashboard-production-c39d.up.railway.app — Swagger: [`/docs`](https://payments-dashboard-production-c39d.up.railway.app/docs)

## Стек и почему он выбран

| Слой      | Технология                              |
|-----------|------------------------------------------|
| Backend   | FastAPI + Python                         |
| Frontend  | React + TypeScript + Tailwind (Vite)     |
| БД        | PostgreSQL + SQLAlchemy + Alembic        |
| API       | REST                                     |
| Деплой    | Railway (backend) + Vercel (frontend)    |

### Почему FastAPI, а не Laravel

- **Скорость развёртывания.** Python — основной стек, поэтому сервис быстрее поднять и
  поддерживать, не нанимая PHP-компетенцию.
- **Валидация и типы из коробки.** Pydantic проверяет вход и сериализует выход, а OpenAPI-схема
  и Swagger UI (`/docs`) генерируются автоматически — не нужно отдельно описывать контракты.
- **Асинхронность под будущие задачи.** Парсинг банковских выписок и фоновые задачи (см.
  «Как масштабировать») естественно ложатся на async-стек.
- **Лёгкий слой данных.** SQLAlchemy + Alembic дают явные модели и версионируемые миграции
  без «магии» полноценного фреймворка, которая в задаче такого размера избыточна.

Laravel дал бы готовый Eloquent + Artisan, но потянул бы за собой PHP-окружение и Composer
ради функциональности, которая здесь не нужна.

### Почему React, а не Vue

ТЗ предпочитает Vue, но допускает React. Выбран React + TypeScript + Vite, потому что это
основной фронтенд-стек команды: строгая типизация контракта API (общие типы в `src/types`),
быстрый Vite-билд и предсказуемый деплой на Vercel. Архитектурно подход стек-независим —
данные, бизнес-логика и отображение разделены (см. ниже), поэтому переписать UI на Vue/Nuxt
можно без изменений в backend: тот же REST-контракт и те же типы.

## Архитектура

Четыре сущности, связанные внешними ключами:

- **Client** — клиент агентства (ИНН, ОГРН, расчётный счёт, контактное лицо).
- **Project** — проект клиента (`client_id`), статус `active / completed / paused`.
- **Payment** — оплата по проекту (`project_id`, `client_id`): дата, сумма, назначение,
  этап услуги, номера счёта и договора.
- **Act** — закрывающий документ, ровно один на оплату (`payment_id`, one-to-one).
  При создании оплаты акт создаётся автоматически со статусом `not_sent`.

```
Client 1───* Project 1───* Payment 1───1 Act
   └──────────────* Payment
```

### Где бизнес-логика

Логика вынесена в `backend/app/services`, роутеры остаются тонкими:

- `act_service` — вычисление статуса акта и проставление `sent_at` / `signed_at`.
- `payment_service` — создание оплаты вместе с актом, фильтрация и поиск.
- `project_service` — агрегаты по проекту (сумма оплат, закрытые/незакрытые акты, общий статус).
- `dashboard_service` — сводные цифры для дашборда.

### Логика статуса акта (вычисляется автоматически)

| is_sent | is_signed | условие                                  | статус               |
|---------|-----------|-------------------------------------------|----------------------|
| false   | false     | —                                         | `not_sent`           |
| true    | false     | `payment_date` менее 30 дней назад        | `waiting_signature`  |
| true    | false     | `payment_date` 30+ дней назад             | `attention_required` |
| true    | true      | —                                         | `closed`             |

Статус пересчитывается при каждом чтении, поэтому акт сам «переезжает» в
`attention_required` по мере старения оплаты — без cron-задач.

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/api/clients` | список клиентов |
| POST  | `/api/clients` | создать клиента |
| GET   | `/api/projects` | проекты с суммой оплат и статусом актов |
| POST  | `/api/projects` | создать проект |
| GET   | `/api/payments` | оплаты с фильтрами |
| POST  | `/api/payments` | создать оплату (+ акт `not_sent`) |
| PATCH | `/api/payments/{id}/act` | обновить акт (`is_sent`, `is_signed`, `manager_comment`) |
| GET   | `/api/dashboard/summary` | сводка по дашборду |

Фильтры `GET /api/payments`: `project_id`, `client_id`, `date_from`, `date_to`,
`act_status`, `service_stage`, `search` (по `payment_purpose` и `client.name`).

## Соответствие ТЗ

- **Сущности и связи:** `Client/LegalEntity → Project → Payment → Act`, `Act` one-to-one к `Payment`.
- **Таблица проектов:** название, юрлицо, сумма оплат, кол-во оплат, закрытые/незакрытые акты,
  общий статус документооборота.
- **Таблица оплат:** дата, плательщик, проект, сумма, назначение, этап, статусы «отправлен» и
  «подписан» (с датами), комментарий менеджера (редактируется), действия.
- **Статусы актов:** `not_sent / waiting_signature / closed / attention_required` — расчёт на
  backend, кнопки «отправлен»/«подписан», правка комментария с сохранением.
- **Фильтры:** проект, юрлицо, период (от/до), статус акта, этап/услуга, поиск.
- **Сводка:** 7 показателей (сумма, проекты, платежи, закрыто, не закрыто, без акта, ждут подписи).
- **Разделение слоёв:** данные (`models`) ↔ бизнес-логика (`services`) ↔ отображение (React).
- **Расчёт итогов** — на backend (`dashboard_service`, `project_service`), не на фронте.

## Допущения

- **Один акт на оплату** (one-to-one). Реальное агентство иногда дробит акт по этапам — здесь
  для простоты считаем, что закрывающий документ соответствует одной оплате.
- **Статус акта не хранится как источник истины, а вычисляется** из `is_sent` / `is_signed` /
  возраста оплаты. В БД лежит закешированное значение, но при каждом чтении оно
  пересчитывается, чтобы `attention_required` появлялся автоматически.
- **Порог «требует внимания» — 30 дней** от `payment_date` (константа
  `ATTENTION_THRESHOLD_DAYS` в `act_service`).
- **Нет аутентификации.** Предполагается внутренний инструмент за периметром компании;
  авторизация — следующий шаг.
- **Суммы в рублях**, хранятся как `Numeric(12,2)`; форматирование валюты — на фронте.
- **Простановка `is_signed` без `is_sent`** трактуется как «отправлен и подписан» — нельзя
  подписать неотправленный акт, поэтому сервис добирает `is_sent=true`.
- **Seed-данные** генерируются относительно текущей даты, чтобы статусы всегда были
  актуальны при демонстрации.

## Как масштабировать

- **Парсинг банковских выписок (источник данных по ТЗ).** Сейчас оплаты заливаются seed-ом,
  но в проде вход — PDF-выписка из банка. Предполагаемый конвейер:
  `POST /api/imports` (загрузка PDF) → `pdfplumber` извлекает строки операций
  (дата, сумма, плательщик/ИНН, назначение) → нормализация → матчинг: ИНН → `Client`,
  ключевые слова назначения/номер договора → `Project` и `service_stage` → создание `Payment`
  + авто-`Act` (`not_sent`). Неоднозначные строки уходят в «черновики» на ручную привязку
  менеджером. Слой логики уже изолирован в `services`, поэтому парсер встаёт рядом как
  `services/statement_parser.py` и переиспользует `payment_service.create_payment`.
- **Очередь фоновых задач.** Парсинг крупных выписок, рассылка напоминаний по «зависшим»
  актам и периодический пересчёт статусов выносятся в `Celery` (брокер Redis/RabbitMQ),
  чтобы не блокировать API-воркеры.
- **Уведомления.** На статусе `attention_required` — триггер в почту/мессенджер ответственному
  менеджеру.
- **Производительность.** При росте объёма — индексы на `payments(payment_date)`,
  `payments(client_id, project_id)`, материализованные представления для сводки дашборда
  вместо пересчёта на лету.

## Структура

```
/backend
  /app
    /models      SQLAlchemy модели
    /schemas     Pydantic схемы
    /routers     FastAPI роутеры
    /services    бизнес-логика
    /db          подключение к БД
    config.py
    seed.py
  main.py
  alembic.ini
  Dockerfile
/migrations      Alembic миграции
/frontend        React + TypeScript + Tailwind (Vite)
  vercel.json
railway.json
```

## Запуск локально

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                 # при необходимости поправьте DATABASE_URL

alembic upgrade head        # применить миграции
python -m app.seed          # залить демо-данные
uvicorn main:app --reload
```

API: http://localhost:8000, документация: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:8000
npm run dev
```

UI: http://localhost:5173

> Важно: открывать нужно `http://localhost:5173`, а не сам файл `index.html`. Это SPA на Vite —
> в исходном `index.html` только `<div id="root">` и модуль `main.tsx`, который собирает
> dev-сервер. При открытии файла напрямую экран будет белым.

## Деплой

### Backend → Railway

1. `railway login` и `railway init` (или через дашборд: New Project → Deploy from GitHub repo).
2. Добавить плагин **PostgreSQL** — Railway создаст переменную `DATABASE_URL`.
   Конфиг сам нормализует `postgres://` → `postgresql+psycopg2://`.
3. Сборка идёт по `railway.json` → `backend/Dockerfile` (контекст сборки — корень репозитория,
   чтобы попали и `backend/`, и `migrations/`). При старте контейнер выполняет
   `alembic upgrade head`, поднимает API на `$PORT`.
4. Переменные окружения:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (reference на плагин Postgres);
   - `CORS_ORIGINS` — URL фронтенда с Vercel (`https://frontend-ivory-rho-38.vercel.app`);
   - `RUN_SEED=1` — однократно для заливки демо-данных, затем `RUN_SEED=0` (миграция
     `alembic upgrade head` идемпотентна, данные в Postgres сохраняются между рестартами).
5. Скопировать публичный URL сервиса и вставить выше и в `VITE_API_URL` фронтенда.

Текущий деплой развёрнут именно так: Postgres-плагин + `DATABASE_URL` reference, `RUN_SEED=0`.

### Frontend → Vercel

1. `vercel` / `vercel --prod` или импорт репозитория в дашборде.
2. **Root Directory = `frontend`** (там лежит `vercel.json` с фреймворком Vite и SPA-rewrites).
3. Переменная окружения `VITE_API_URL=<публичный URL Railway>` (build-time для Vite).
4. Скопировать выданный URL и вставить выше; добавить его в `CORS_ORIGINS` на Railway.

Проект развёрнут: фронтенд на Vercel (`VITE_API_URL` указывает на Railway-backend), CORS на
backend сужен до домена фронтенда.
