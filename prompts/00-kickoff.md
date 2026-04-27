# Top-up Platform — Agent Team Kickoff

> Read this first. Then dispatch the role-specific prompts in `prompts/`.

You are building **Top-up**, a multi-tenant digital top-up platform for games (Mobile Legends, Free Fire, PUBG, Genshin, etc.), subscriptions (Spotify, Netflix), mobile data (Smart, Metfone), and gift cards.

Users browse a catalog, pick a package, choose:
1. **Direct top-up** — delivered to their game by Game ID + Zone ID
2. **Voucher code** — redeemed in-game

Payment methods: **KHQR**, **Direct Bank** (ABA / ACLEDA / Wing / Chip Mong), **Visa / Mastercard**.

The UI must be fully responsive (web + mobile web). A working interactive prototype lives in `Top-up.html` — it is the visual + interaction spec.

## Tech stack (use exactly)

| Layer | Choice |
|---|---|
| Frontend | **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui** |
| State / data | TanStack Query + Zustand for cart/checkout |
| Backend | **NestJS (TypeScript)** REST + WebSocket gateway |
| Database | **PostgreSQL 16** + Prisma ORM |
| Cache / queue | Redis + BullMQ (delivery jobs, KHQR polling) |
| Auth | JWT (access + refresh) + email/phone OTP; Google OAuth optional |
| Payments | KHQR (Bakong-compatible), Bank-redirect stubs, Stripe for Visa/Master |
| Infra | Docker Compose for dev; one-click `docker-compose up` |
| Testing | Jest (unit) + Playwright (E2E) |

## Repo layout (pnpm workspaces)

```
top-up/
├── apps/
│   ├── web/        # Next.js 14
│   └── api/        # NestJS
├── packages/
│   └── shared/     # zod schemas, types, constants
├── docs/
│   ├── ARCHITECTURE.md
│   └── ER.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## Agent split

| # | Role | Prompt file |
|---|---|---|
| 1 | Architect | `prompts/01-architect.md` |
| 2 | Database | `prompts/02-database.md` |
| 3 | Backend | `prompts/03-backend.md` |
| 4 | Payments | `prompts/04-payments.md` |
| 5 | Frontend | `prompts/05-frontend.md` |
| 6 | DevOps | `prompts/06-devops.md` |
| 7 | QA | `prompts/07-qa.md` |

## Visual reference

`Top-up.html` (this project) is the source of truth for layout, color tokens, spacing, and interactions. Read also: `data.jsx`, `screens.jsx`, `payment.jsx`, `mobile.jsx`. **Match the prototype.** Do not reinvent the visual language.

## Global acceptance criteria

- New visitor can sign up, browse, top up Mobile Legends with Direct method (Game ID + Zone), pay via KHQR (simulated), and see "Delivered" in **<60s** end-to-end on the seeded local stack.
- Same flow with Spotify (code method) yields a copyable redeem code.
- Bank and card flows reach `paid` via stub / Stripe-test webhooks.
- Fully responsive at 1440×900 (desktop) and 390×844 (mobile).
- All E2E tests green in CI.
- `docker-compose up` boots a working stack with seeded data.

## Coordination rules

- Use the shared Prisma schema as the contract between back and front.
- Types in `packages/shared` are the source of truth — never duplicate.
- Every endpoint documented via Swagger at `/docs`.
- Pricing math (`fee = round(subtotal * 0.02, 2)`) lives in `packages/shared/pricing.ts`. Both server and client import it.
- All money is integer cents in DB; convert to USD only at the edge.
