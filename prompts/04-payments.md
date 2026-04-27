# Agent 4 — Payments

## Mission
Implement the three payment providers behind a unified interface. All must be testable end-to-end without real money.

## Provider interface

```ts
// apps/api/src/payments/provider.interface.ts
export interface PaymentProvider {
  initiate(order: Order): Promise<InitiateResult>;
  // Webhook handlers parse + verify signature, return normalized event
  parseWebhook(req): Promise<NormalizedEvent>;
}
```

## Providers

### 1. KHQR (Bakong-compatible)
- `POST /payments/khqr  { orderId }` →
  ```ts
  { paymentId, qrString, expiresAt }   // qrString is the EMVCo KHQR payload
  ```
- Generate per Bakong KHQR spec (merchant info + dynamic amount + CRC16). In dev, use a deterministic stub generator; structure code so swapping in real Bakong SDK is one file.
- Status: poll Bakong every 3s in a BullMQ repeating job for 10 minutes; on `paid` → transition order to PAID, mark Payment SUCCEEDED.
- Expose `GET /payments/:id/status` for client polling fallback.

### 2. Direct Bank (ABA / ACLEDA / Wing / Chip Mong)
- `POST /payments/bank  { orderId, bankCode }` → `{ paymentId, redirectUrl, ref }`
- `redirectUrl` returns to `${WEB_ORIGIN}/checkout/return?paymentId=…&status=…`.
- Dev: a stub bank page at `/dev/bank/:bankCode/:paymentId` that simulates 2s "processing" then redirects success/failure.
- On return, server verifies signed token, transitions order.

### 3. Visa / Mastercard (Stripe)
- `POST /payments/card  { orderId }` → `{ clientSecret }` (Payment Intent, off_session=false).
- Frontend uses Stripe Elements to confirm.
- Webhook `POST /payments/webhook/stripe`:
  - Verify signature with `STRIPE_WEBHOOK_SECRET`.
  - Handle `payment_intent.succeeded`, `payment_intent.payment_failed`.
  - Idempotent via `WebhookEvent.eventId = event.id`.

## Webhook plumbing
- All providers post to `POST /payments/webhook/:provider`.
- Common middleware: raw-body, signature verification per provider, idempotency check (`WebhookEvent` unique `provider + eventId`), 200 OK once persisted.
- Webhook → enqueue order transition (don't do DB heavy work in webhook handler).

## Server-side rules
- Never trust client amount. Always re-derive from `Package.priceCents`.
- Reject creating a payment if order already has a SUCCEEDED payment.
- KHQR `expiresAt` = now + 10 min. After expiry, payment is `EXPIRED` and a new one can be created.
- Refunds out of scope (admin endpoint stub OK).

## Tests
- Unit: KHQR string generation (CRC16 round-trip), Stripe webhook signature, idempotency.
- E2E: full happy path for each provider hitting the dev stubs.

## Acceptance
- All three flows end with `Order.status = PAID` then auto-progresses to `DELIVERED`.
- Replaying a webhook delivers no double effects.
- Documentation: `apps/api/src/payments/README.md` with provider diagrams.
