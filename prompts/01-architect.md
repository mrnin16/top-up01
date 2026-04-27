# Agent 1 — Architect

## Mission
Set up the monorepo skeleton, infra, and shared contracts so all other agents can work in parallel.

## Deliverables

1. **Monorepo** with pnpm workspaces:
   ```
   top-up/
   ├── apps/web        (Next.js 14, TypeScript, Tailwind, shadcn/ui)
   ├── apps/api        (NestJS 10, TypeScript)
   ├── packages/shared (zod schemas, types, constants, pricing util)
   ├── docs/
   ├── .github/workflows/
   ├── docker-compose.yml
   ├── .env.example
   └── README.md
   ```

2. **`packages/shared`**:
   - `pricing.ts` — `computeFee(subtotalUSD)`, `computeTotal(subtotalUSD)` — fee = `round(subtotal * 0.02, 2)`.
   - `enums.ts` — `OrderStatus`, `PaymentMethod`, `TopupMethod`.
   - `schemas.ts` — zod schemas for: register, login, createOrder, validateAccount, payment payloads.
   - `types.ts` — re-exports zod inferred types.

3. **`docker-compose.yml`** services:
   - `postgres:16` (port 5432, volume)
   - `redis:7` (port 6379)
   - `mailhog` (1025/8025)
   - `api` (build from `apps/api`, depends on postgres + redis)
   - `web` (build from `apps/web`, depends on api)

4. **`.env.example`**: every key the system needs — `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `KHQR_MERCHANT_ID`, `KHQR_BAKONG_TOKEN`, `BANK_RETURN_URL`, `WEB_ORIGIN`, `API_ORIGIN`.

5. **`docs/ARCHITECTURE.md`**:
   - System diagram (web ↔ api ↔ postgres / redis / providers)
   - Order state machine
   - Sequence diagrams for the 3 payment flows
   - Folder map and naming conventions

6. **CI** (`.github/workflows/ci.yml`):
   - install → lint → typecheck → unit tests → build
   - matrix: api + web

7. **README.md**: setup in <5 commands. Demo accounts. Quickstart for each agent.

## Acceptance
- `pnpm install && docker-compose up` boots the stack.
- `pnpm -r typecheck` passes on the empty skeleton.
- CI green on a fresh PR.
- Other agents can `import { computeFee } from '@topup/shared'` from both `apps/web` and `apps/api`.
