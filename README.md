# Payments Dashboard

Мини-система учета оплат, проектов и закрывающих документов (актов) для digital-агентства.
Помогает менеджерам видеть, по каким оплатам акты ещё не отправлены, какие висят без подписи
слишком долго, а какие уже закрыты.

## Стек и почему он выбран

| Слой      | Технология                              |
|-----------|------------------------------------------|
| Backend   | FastAPI + Python                         |
| Frontend  | React + TypeScript + Tailwind            |
| БД        | PostgreSQL + SQLAlchemy + Alembic        |
| API       | REST                                     |
| Деплой    | Railway (backend) + Vercel (frontend)    |

**Почему FastAPI, а не Laravel:** Python — основной стек, поэтому развернуть и поддерживать
сервис быстрее. FastAPI даёт автоматическую валидацию через Pydantic, типизацию и
OpenAPI-документацию из коробки, а асинхронность пригодится на следующем шаге — парсинге
банковских выписок и фоновых задачах. SQLAlchemy + Alembic закрывают миграции и доступ к
данным без лишнего ORM-магического слоя.

## Архитектура

Четыре сущности, связанные через внешние ключи:

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

Вся логика вынесена в `app/services`, роутеры остаются тонкими:

- `act_service` — вычисление статуса акта и корректное проставление `sent_at` / `signed_at`.
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
`attention_required` по мере старения оплаты.

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
/migrations      Alembic миграции
/frontend        React + TypeScript + Tailwind (Фаза 2)
```

## Запуск локально

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

## Деплой

Ссылки будут добавлены в Фазе 3.
