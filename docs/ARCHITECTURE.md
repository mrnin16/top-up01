# Architecture

## System diagram

```
Browser / Mobile
     │
     ▼ HTTP / WS
┌────────────────────┐
│   Next.js 14 web   │  :3000
│   (App Router)     │
└────────┬───────────┘
         │ REST + WS (socket.io)
         ▼
┌────────────────────┐
│   NestJS API       │  :4000
│   REST + WS GW     │
└──┬─────┬───────────┘
   │     │
   │     ▼ BullMQ jobs
   │  ┌──────────┐
   │  │  Redis 7 │  :6379
   │  └──────────┘
   │
   ▼ Prisma
┌──────────────┐
│ PostgreSQL 16│  :5432
└──────────────┘

External:
  Bakong KHQR API  (payment confirmation polling)
  Bank redirect    (ABA / ACLEDA / Wing / Chip Mong)
  Stripe           (Visa / Mastercard)
  Mailhog (dev)    :1025 / :8025
```

## Order state machine

```
          ┌──────────────────────────────────┐
          │               pay()              │
  POST /orders ──► PENDING ─────────────────► PAID
                      │                        │
                   fail()                 enqueueDelivery()
                      │                        │
                      ▼                        ▼
                   FAILED              DELIVERING ──► DELIVERED
                                            │
                                         fail()
                                            │
                                            ▼
                                         FAILED
```

All transitions are enforced in `OrdersService.transition()` and written to `AuditLog`.

## Payment sequence diagrams

### KHQR
```
Client           API              Bakong/Poll job
  │── POST /payments/khqr ──► │
  │◄── { qrString, expiry } ──│
  │                            │── BullMQ repeat every 3s ──►
  │ (user scans QR)            │◄── paid ────────────────────
  │                            │── order.transition(PAID) ──►
  │◄── WS { status: PAID } ───│
  │── (redirect /orders/:id) ─►│
```

### Bank redirect
```
Client           API              Bank (stub)
  │── POST /payments/bank ──►│
  │◄── { redirectUrl } ──────│
  │── window.location = redirectUrl ──────────────►
  │                                                │ (user approves)
  │◄────── GET /checkout/return?status=success ───
  │── API verifies token, transitions order ─────►│
  │◄── WS { status: PAID } ─────────────────────
```

### Stripe card
```
Client                API               Stripe
  │── POST /payments/card ──►│
  │◄── { clientSecret } ─────│── createPaymentIntent ──►
  │                           │◄── intent.client_secret ──
  │── stripe.confirmPayment() ──────────────────────────►
  │                                                      │
  │                           │◄── webhook payment_intent.succeeded
  │                           │── order.transition(PAID)
  │◄── WS { status: PAID } ──│
```

## Folder map

```
apps/api/src/
├── auth/           JWT auth, refresh, OTP
├── catalog/        Categories, products, validate-account
├── orders/         CRUD + state machine
├── payments/       KHQR, Bank, Stripe providers
├── delivery/       BullMQ processor (direct + code delivery)
├── ws/             Socket.io OrdersGateway
├── common/         ProblemFilter, RequestIdMiddleware
├── health/         /healthz /readyz
└── prisma/         PrismaService (global)

apps/web/src/
├── app/            Next.js App Router pages
│   ├── page.tsx          Home
│   ├── p/[slug]/         Product detail
│   ├── checkout/[id]/    Payment
│   ├── orders/[id]/      Success / receipt
│   └── auth/             Login, register
├── components/
│   ├── home/             HomeClient, HeroCard, GameGrid, CategoryChips
│   ├── detail/           DetailClient (3-step stepper)
│   ├── checkout/         CheckoutClient (KHQR / Bank / Card)
│   ├── success/          SuccessClient (live WS updates)
│   └── layout/           TopNav, MobileLayout
└── lib/
    ├── api.ts            Fetch wrapper with auth + retry
    └── store.ts          Zustand (checkout draft, auth, theme)
```

## Pricing rule

`fee = round(subtotal * 0.02, 2)` — implemented once in `packages/shared/src/pricing.ts`.  
Server always recomputes from `Package.priceCents`; client values are display-only.  
All DB amounts are **integer cents**; USD conversion at API boundaries only.

## Naming conventions

- DB models: PascalCase
- API endpoints: kebab-case, RESTful nouns
- TS files: camelCase (services, controllers), PascalCase (classes)
- Env vars: SCREAMING_SNAKE_CASE
