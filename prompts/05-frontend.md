# Agent 5 — Frontend (Next.js)

## Mission
Build the consumer web app. Match the prototype `Top-up.html` for layout, type, color, motion, and interaction.

**Read first** in this project: `Top-up.html`, `data.jsx`, `screens.jsx`, `payment.jsx`, `mobile.jsx`, `app-styles.jsx`, `styles.css`. They are the visual + interaction spec.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui.
- TanStack Query for server state; Zustand for cart/checkout draft.
- next-intl for `en` + `km`.
- Stripe.js + Elements for card flow.

## Routes

```
/                       Home — hero, category chips, product grid, search
/p/[slug]               Product detail — 3-step stepper, method picker, ID inputs, package grid, sticky summary
/checkout/[orderId]     Payment — KHQR / Bank / Card switcher
/checkout/return        Bank return handler (verify + redirect)
/orders/[id]            Success / receipt — code copy or live "delivering…" via WS
/account                Profile, settings, theme, language
/account/orders         Order history
/account/saved-ids      Saved Game IDs
/auth/login  /auth/register  /auth/otp
```

## Responsive

- Tailwind breakpoints. <768px = mobile layout from `mobile.jsx`:
  - Top: greeting + bell
  - Search bar
  - Horizontally-scrolling category chips
  - Hero card
  - 3-column product grid
  - Bottom tab bar (Home / Deals / Orders / Account)
- ≥768px = desktop layout from `screens.jsx`: top nav, hero, category pills, 4-6 col product grid, sidebar summary on detail.
- All forms use `min-h-[44px]` controls for touch targets.

## Theme

- Expose `--brand` CSS variable on `:root`; default `#2563eb`.
- `data-theme="dark"` on `<html>` swaps tokens (mirror what `styles.css` does).
- Settings page: brand-color picker + dark-mode toggle; persisted in localStorage and to user profile via `PATCH /me`.

## Key interactions

- **Validate-account**: debounce 400ms; `POST /products/:slug/validate-account`; show green confirmation card with returned `displayName`.
- **Package picker**: animated "Popular" / "Best" tags; selection state lifted to checkout draft store.
- **Sticky summary** on detail (desktop) and bottom action bar (mobile).
- **KHQR**: render `qrString` as SVG via `qrcode.react`; live timer driven by `expiresAt`; subscribe to `/ws/orders/:id`; on `PAID` → push to `/orders/:id`.
- **Card form**: Stripe Elements; mirror prototype's gradient card visual that updates as user types.
- **Success**: animated check ring (CSS keyframes from `app-styles.jsx`); copy code with toast.

## API client

- Generate types from Swagger (or import from `@topup/shared`).
- `lib/api.ts` wraps fetch with auth + idempotency key + retry.
- Auth: store access in memory; refresh in httpOnly cookie; auto-refresh on 401.

## SEO + perf

- Static rendering for `/` and `/p/[slug]` with revalidate=300.
- `next/image` for any future product art.
- Lighthouse perf ≥ 90 on home + detail.

## Acceptance

- Pixel-close match to prototype on home, detail, payment, success at 1440 and 390 widths.
- All flows talk to the real API; no mock data shipped to prod build.
- Lang toggle swaps `en` ↔ `km` correctly.
- Brand color changes propagate everywhere within one render.
