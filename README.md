# Top-up — Game & Service Top-up Platform

Top up Mobile Legends, Free Fire, Spotify, and more. Instant delivery. KHQR, bank transfer, and cards accepted.

## Quick start (5 commands)

```bash
git clone <repo> && cd Top-up
cp .env.example .env          # review values — defaults work for local dev
pnpm install                  # install all workspace deps
docker-compose up             # boots postgres + redis + mailhog + api + web
# → web at http://localhost:3000   api at http://localhost:4000/docs
```

The `api` container automatically runs `prisma migrate deploy` and `prisma db seed` on first boot.

## Demo accounts

| Email | Password | Role |
|---|---|---|
| `lina@example.com` | `password123` | User |
| `admin@topup.local` | `admin123` | Admin |

## Dev without Docker

```bash
pnpm install
# Start postgres + redis separately (or use docker-compose up postgres redis)
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed
pnpm dev                      # runs web (3000) + api (4000) concurrently
```

## Services

| Service | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Swagger | http://localhost:4000/docs |
| Mail UI | http://localhost:8025 |

## Running tests

```bash
pnpm -r test            # all unit tests
pnpm -r typecheck       # TypeScript
pnpm --filter web exec playwright test   # E2E (needs docker-compose stack running)
```

## Monorepo layout

```
apps/
  web/        Next.js 14 (App Router) consumer app
  api/        NestJS 10 REST + WebSocket API
packages/
  shared/     Zod schemas, types, pricing utils
docs/
  ARCHITECTURE.md
  ER.md
```

## Agent prompts

See `prompts/` for per-agent instructions (Architect, Database, Backend, Payments, Frontend, DevOps, QA).
