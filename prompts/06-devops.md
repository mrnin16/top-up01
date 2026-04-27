# Agent 6 — DevOps

## Mission
One-command local dev, reliable CI, and a deployable production setup.

## Local dev

`docker-compose.yml` services: `postgres`, `redis`, `mailhog`, `api`, `web`.
- `docker-compose up` starts everything, runs migrations, seeds DB.
- `web` on `http://localhost:3000`, `api` on `http://localhost:4000`, mail UI on `http://localhost:8025`, Swagger on `http://localhost:4000/docs`.
- Hot reload: bind-mount source for `web` and `api`.

## CI (`.github/workflows/ci.yml`)

Jobs:
- `lint` — eslint + prettier check
- `typecheck` — `pnpm -r typecheck`
- `test` — Jest unit
- `e2e` — start docker-compose, run Playwright
- `build` — production build for web + api

Cache pnpm store. Fail fast on lint/typecheck.

## Production

- Provide Dockerfiles (`apps/web/Dockerfile`, `apps/api/Dockerfile`) — multi-stage, non-root user, distroless or alpine.
- `docker-compose.prod.yml` example with Postgres + Redis + reverse proxy (Caddy) terminating TLS.
- Document zero-downtime migrations strategy (expand → backfill → contract).

## Observability

- Pino logs to stdout, JSON.
- Prometheus `/metrics` on api (request count, duration, queue depth).
- Healthcheck endpoints wired to compose `healthcheck:` blocks.

## Secrets

- `.env.example` lists every key; never commit `.env`.
- Document rotating `JWT_SECRET`, `STRIPE_WEBHOOK_SECRET`, KHQR keys.

## Backups

- Document `pg_dump` cron sample for production.
- Document Redis persistence config (AOF every second).

## Acceptance

- Fresh clone → `cp .env.example .env && docker-compose up` → working stack in <3 minutes.
- CI runs <10 min on clean cache.
- Prod Dockerfiles produce images <300MB each.
