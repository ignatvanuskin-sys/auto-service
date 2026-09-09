# GearFlow AI — цифровая система продаж и автоматизации автосервиса

Сайт с booking-first воронкой + CRM + автоматизация Telegram/WhatsApp + AI-квалификация заявок.
Стек: Next.js 16 (App Router) + TypeScript + Tailwind + PostgreSQL 16 + Prisma 6.

## Быстрый запуск (development)

```bash
cp .env.example .env        # заполнить DATABASE_URL, CRON_SECRET, ADMIN_*
npm install
npx prisma migrate dev      # применяет prisma/migrations (init, otp)
npm run seed                # 12 услуг, 4 мастера, owner + master-аккаунты, 40 клиентов, брони, отзывы
npm run dev                 # http://localhost:3000
```

Проверки:

```bash
npm run lint && npm run typecheck && npm test        # unit (vitest): слоты, capacity, телефон
node scripts/smoke.mjs                               # 51 HTTP-проверка (нужен запущенный dev + БД)
npm run test:e2e                                      # Playwright: главная, бронь 4 шага (390px), админ, overflow
node scripts/seocheck.mjs                            # cron-идемпотентность + title/H1/canonical всех страниц
npm run build
```

Демо-доступ (dev/staging; в production сменить!):

- owner: `owner@gearflow.kz` / `ADMIN_PASSWORD` → `/admin/login` (полный доступ)
- master: `master@gearflow.kz` / `Master123!` → только свои записи и статусы работ
- кабинет клиента: номер из сида, напр. `+77001000000` → код виден в логе dev-сервера `[otp:dev]`

## Production-запуск (Docker)

```bash
docker build -t gearflow-ai .
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://USER:PASS@HOST:5432/gearflow \
  -e ADMIN_SESSION_SECRET=$(openssl rand -base64 32) \
  -e CRON_SECRET=$(openssl rand -base64 24) \
  -e ADMIN_EMAIL=owner@your-domain.kz -e ADMIN_PASSWORD='<strong>' \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.kz \
  gearflow-ai
# контейнер сам делает migrate deploy; HEALTHCHECK: /api/health
```

Cron напоминаний (каждые 15 минут):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.kz/api/cron/reminders
```

## Ключевые решения и гарантии

- **Double-booking невозможен**: `pg_advisory_xact_lock` на слот + проверка вместимости цеха
  (по умолчанию = числу мастеров, переопределяется `SLOT_CAPACITY`) + проверка пересечений
  у клиента и у мастера + `UNIQUE(masterId, slotStart)`. Гонка 6 параллельных броней → ≤ capacity
  успехов, остальные — 409 (покрыто smoke-тестом).
- **Слот валидируется сервером**: рабочий день (Вс — выходной), сетка начала часа, границы 9:00–20:00,
  услуга/мастер существуют. Availability и создание используют одну capacity-логику.
- **AI только квалифицирует** (Claude structured output → эвристический фолбэк без ключа):
  создаёт `Lead`, запись подтверждает человек. Срочные лиды — мгновенный алерт в лог админа.
- **Уведомления идемпотентны** (дедуп по booking+type; maintenance — не чаще 1/7 дней на клиента);
  ошибка провайдера не роняет бронь. Cron закрыт `CRON_SECRET` (401 без него).
- **Кабинет — по OTP** (6 цифр, 5 минут, 5 попыток, rate-limit). Без сессии данные по номеру не отдаются.
- **RBAC**: owner — всё (удаление услуг — только owner), admin — CRM без удаления услуг,
  master — только свои записи и статусы `in_progress/done`. Сессии — HMAC + timingSafeEqual,
  httpOnly, Secure в prod; rate-limit на логин (10/10 мин).
- **Админка функциональна**: записи, лиды (смена статуса), клиенты, услуги (CRUD),
  отзывы (модерация), уведомления (журнал + resend), дашборд с воронкой.
- **SEO**: уникальные title/description/H1, canonical, OG/Twitter, AutoRepair/Service/FAQ/Review
  schema.org, sitemap, robots; `/admin`, `/account`, manage-ссылки — noindex.

## Стек — обоснование

- **Next.js App Router + TypeScript + Tailwind** — SSR/SSG для SEO локального бизнеса,
  TypeScript — против runtime-ошибок в CRM-логике.
- **API routes** — без отдельного бэкенда; очереди изолированы (`queueNotification`/
  `deliverNotification`) — при росте выносятся в Fastify + BullMQ + Redis.
- **PostgreSQL + Prisma** — реляционная CRM-модель; миграции в `prisma/migrations`.
- **Docker + GitHub Actions** — lint → typecheck → test → build; cron-джоба в CI.

## Известные ограничения (не блокеры)

- Доставка Telegram/WhatsApp реально уходит только при заданных токенах; иначе — лог + статус
  в `Notification` (бронь создаётся всегда).
- OTP-код в production требует SMS-провайдера (`SMS_PROVIDER_SEND_URL` + `SMS_PROVIDER_API_KEY`);
  без него вход по коду недоступен (manage-ссылки из SMS работают независимо).
- Rate limiting — in-memory на инстанс; для multi-instance вынести в Redis.
- Фото цеха/мастеров — контентная задача бизнеса (сейчас — типографика и карточки без стоков).
- CSRF: state-changing API — JSON + SameSite=Lax; отдельный CSRF-токен не вводился (оценка риска: низкая).

## Контент перед запуском (владелец бизнеса)

- `src/lib/site.ts`: телефон, ссылки мессенджеров, адрес, часы + **реальные цифры**
  (рейтинг, число отзывов/авто, годы) вместо демо-значений.
- Главная/отзывы: заменить демо-отзывы реальными (с деталями: авто, услуга, цена).
- `team`: реальные мастера; `contacts`: проверить адрес; `NEXT_PUBLIC_SITE_URL` — прод-домен.
- Seed (`prisma/seed.ts`) — только для dev/staging; в production БД пустая + свои услуги через админку,
  owner создаётся первым логином из `ADMIN_EMAIL`/`ADMIN_PASSWORD` (потом пароль сменить!).

## Масштабирование (single-instance assumptions)

- In-memory rate limiting достаточен для single-instance деплоя (Docker/1 реплика).
  При горизонтальном масштабировании вынести `src/lib/ratelimit.ts` в Redis — интерфейс
  (`rateLimited(key, limit, windowMs)`) уже изолирован в одном модуле.
- Сессии (admin/account) — stateless HMAC, sticky sessions не нужны.
- Cron `/api/cron/reminders` идемпотентен — безопасен при наложении запусков, но при
  нескольких инстансах дергать cron должен один шедулер (иначе двойная доставка в окне гонки).
