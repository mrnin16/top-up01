# Top-up — Agent Team Prompts

Drop these prompt files into your Claude Code agent team. Start with `00-kickoff.md` (shared context for all agents), then assign one of `01`–`07` per agent.

| Order | Prompt | Role |
|---|---|---|
| 0 | [00-kickoff.md](./00-kickoff.md) | **Read first — all agents** |
| 1 | [01-architect.md](./01-architect.md) | Repo, monorepo, infra, shared package |
| 2 | [02-database.md](./02-database.md) | Prisma schema, migrations, seed |
| 3 | [03-backend.md](./03-backend.md) | NestJS API + WebSocket gateway |
| 4 | [04-payments.md](./04-payments.md) | KHQR + Bank + Stripe providers |
| 5 | [05-frontend.md](./05-frontend.md) | Next.js consumer app |
| 6 | [06-devops.md](./06-devops.md) | Docker, CI, prod, observability |
| 7 | [07-qa.md](./07-qa.md) | Unit, integration, E2E, perf, a11y |

## Visual reference
The interactive prototype `Top-up.html` and its companion JSX files (`data.jsx`, `screens.jsx`, `payment.jsx`, `mobile.jsx`, `app-styles.jsx`, `styles.css`) are the **source of truth** for the UI. Every agent should read them before writing code.

## Suggested execution order

1. Architect builds the skeleton + shared package.
2. Database lands the schema + seed (unblocks both back and front).
3. Backend + Frontend + Payments work in parallel against the contracts.
4. DevOps wires CI, Docker, and observability throughout.
5. QA runs alongside, finalizing the E2E suite once flows stabilize.

## Definition of done
A new visitor can sign up, top up Mobile Legends via Direct + KHQR (simulated), and see DELIVERED in under 60 seconds on a freshly-booted local stack. Same for code-method (Spotify) and card. All E2E tests green in CI.
