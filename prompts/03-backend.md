# Agent 3 — Backend (NestJS)

## Mission
Implement the REST API + WebSocket gateway. Use Prisma. Document with Swagger at `/docs`.

## Modules

```
apps/api/src/
├── auth/           register, login, refresh, OTP, JWT guards
├── catalog/        categories, products (with packages), validate-account
├── orders/         create, get, list mine, state machine
├── payments/       (delegate to Payments agent)
├── delivery/       BullMQ worker — direct top-up + code generation
├── ws/             OrdersGateway — emits status events
├── common/         pipes, interceptors, idempotency, rate-limit
└── health/         /healthz, /readyz
```

## Endpoints

```
POST  /auth/register                 { email, phone?, name, password }
POST  /auth/login                    { emailOrPhone, password } → { access, refresh }
POST  /auth/refresh                  { refresh } → { access }
POST  /auth/otp/send                 { phone | email }
POST  /auth/otp/verify               { token, code }

GET   /categories
GET   /products?category=&q=&limit=&cursor=
GET   /products/:slug                (includes active packages, sorted)

POST  /products/:slug/validate-account   { gameUserId, zoneId }
        → mock rule: gameUserId.length>=6 && zoneId.length>=3 → { valid:true, displayName:"LinaG_★" }

POST  /orders                        { productId, packageId, method, gameUserId?, zoneId? }
                                      → server recomputes subtotal/fee/total from DB
GET   /orders/:id                    (owner or admin)
GET   /orders                        (mine, paginated)

GET   /healthz   GET /readyz
```

## Order state machine

```
PENDING ──pay()──► PAID ──enqueueDelivery()──► DELIVERING ──worker──► DELIVERED
   │                                                                    │
   └──fail()──► FAILED                                          (terminal)
```

- All transitions go through `OrdersService.transition(orderId, next, meta)`.
- Every transition writes an `AuditLog` row.
- Illegal transitions throw `ConflictException`.

## Delivery worker (BullMQ)

- Queue `delivery`, processor in `apps/api/src/delivery/delivery.processor.ts`.
- For `method = DIRECT`:
  - Mock: random delay 5–30s, then `transition(orderId, DELIVERED, { providerRef })`.
  - Provide `DeliveryAdapter` interface so a real provider plugs in later.
- For `method = CODE`:
  - Generate `TPUP-XXXX-XXXX-XXXX` (crypto.randomUUID-based), store on order, set `DELIVERED` immediately.

## WebSocket (`/ws/orders/:id`)

- Subscribe: emit current status; emit on every transition.
- Auth: JWT in handshake `auth` field; deny if order owner != user.
- Events: `{ type:'status', status, deliveredAt?, redeemCode? }`.

## Cross-cutting

- **Idempotency-Key** header on `POST /orders` and `POST /payments/*` — store key+userId+responseHash for 24h in Redis.
- **Rate-limit** auth + payments: 10 req/min/IP, sliding window in Redis.
- **Validation** with zod schemas from `@topup/shared`.
- **Pricing**: server recomputes `subtotalCents`, `feeCents`, `totalCents` from DB `Package.priceCents` — never trust client.
- **Logging** with pino; include `orderId`, `userId`, `requestId` in every line.
- **Errors** as RFC 7807 problem+json.

## Auth details

- Argon2id for password hash.
- Access JWT 15min; refresh JWT 30d (rotated, stored hashed in DB).
- Email/phone OTP: 6-digit, 10min TTL, 5-attempt cap, send via Mailhog in dev.

## Acceptance

- Swagger renders every endpoint at `/docs`.
- `curl` happy path documented in module READMEs.
- 80% coverage on `orders/*` and `auth/*`.
- WS demo: open two browsers — admin transitions order → user sees live status update.
