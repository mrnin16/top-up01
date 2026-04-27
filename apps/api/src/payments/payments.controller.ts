import {
  Controller, Post, Get, Body, Param, Query, Req, Res,
  UseGuards, Headers, RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { BankProvider } from './bank.provider';
import { InitiateKhqrSchema, InitiateBankSchema, InitiateCardSchema } from '@topup/shared';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly bank:     BankProvider,
  ) {}

  // ── Initiate KHQR ────────────────────────────────────────────────────────────
  // Optional auth: guest checkout uses orderId as proof; signed-in users get
  // ownership check.
  @ApiOperation({ summary: 'Create KHQR payment — returns QR string' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('payments/khqr')
  initiateKhqr(@Body() body: unknown, @Req() req: any) {
    const dto = InitiateKhqrSchema.parse(body);
    return this.payments.initiateKhqr(dto.orderId, req.user?.userId);
  }

  // ── Initiate Bank ────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Create bank redirect payment — returns redirectUrl' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('payments/bank')
  initiateBank(@Body() body: unknown, @Req() req: any) {
    const dto = InitiateBankSchema.parse(body);
    return this.payments.initiateBank(dto.orderId, dto.bankCode, req.user?.userId);
  }

  // ── Initiate Card (Stripe) ───────────────────────────────────────────────────
  @ApiOperation({ summary: 'Create Stripe PaymentIntent — returns clientSecret' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('payments/card')
  initiateCard(@Body() body: unknown, @Req() req: any) {
    return this.payments.initiateCard(InitiateCardSchema.parse(body).orderId, req.user?.userId);
  }

  // ── Payment status ───────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Poll payment status by paymentId' })
  @Get('payments/:id/status')
  getStatus(@Param('id') id: string) {
    return this.payments.getPaymentStatus(id);
  }

  // ── Webhook (all providers) ──────────────────────────────────────────────────
  @ApiOperation({ summary: 'Receive webhook from payment provider' })
  @Post('payments/webhook/:provider')
  webhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    const body = provider === 'stripe' ? req.rawBody : req.body;
    return this.payments.handleWebhook(provider, body, headers);
  }

  // ── Bank redirect return ─────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Bank redirect return URL (server-side verify + redirect)' })
  @Get('checkout/return')
  async bankReturn(
    @Query('paymentId') paymentId: string,
    @Query('status')    status:    string,
    @Query('token')     token:     string,
    @Res() res: Response,
  ) {
    const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
    try {
      const result = await this.payments.handleBankReturn(paymentId, status, token);
      const orderId = paymentId.replace(/^bank-/, '');
      res.redirect(`${webOrigin}/orders/${orderId}?status=${result.status}`);
    } catch {
      res.redirect(`${webOrigin}/checkout/return?status=error`);
    }
  }

  // ── Dev stub: Bank UI page ───────────────────────────────────────────────────
  @ApiOperation({ summary: 'Dev bank stub — approve or decline a payment' })
  @Get('dev/bank/:bankCode/:paymentId')
  devBank(
    @Param('bankCode')  bankCode:  string,
    @Param('paymentId') paymentId: string,
    @Query('amount')    amount:    string,
    @Query('returnUrl') returnUrl: string,
    @Res() res: Response,
  ) {
    const successToken = this.bank.signReturn(paymentId, 'success');
    const failToken    = this.bank.signReturn(paymentId, 'fail');
    const successUrl   = `${returnUrl}&token=${successToken}&status=success`;
    const failUrl      = `${returnUrl}&token=${failToken}&status=fail`;
    const amountUSD    = (parseInt(amount ?? '0', 10) / 100).toFixed(2);

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${bankCode.toUpperCase()} — Dev Bank</title>
  <style>
    body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f8fafc}
    .card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.10);text-align:center;max-width:360px;width:100%}
    h2{margin:0 0 4px;font-size:20px}
    p{color:#64748b;margin:0 0 24px;font-size:14px}
    .amount{font-size:32px;font-weight:700;margin:16px 0;color:#0f172a}
    .actions{display:flex;gap:12px;justify-content:center}
    a{padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;transition:opacity .15s}
    .approve{background:#16a34a;color:#fff}
    .decline{background:#dc2626;color:#fff}
    a:hover{opacity:.85}
  </style>
</head>
<body>
  <div class="card">
    <h2>Dev Bank — ${bankCode.toUpperCase()}</h2>
    <p>Simulated payment confirmation</p>
    <div class="amount">$${amountUSD}</div>
    <p style="font-size:12px;color:#94a3b8">Payment ID: ${paymentId}</p>
    <div class="actions">
      <a class="approve" href="${successUrl}">✓ Approve</a>
      <a class="decline" href="${failUrl}">✗ Decline</a>
    </div>
  </div>
</body>
</html>`);
  }

  // ── Dev: simulate KHQR scan (guest-friendly) ─────────────────────────────────
  @ApiOperation({ summary: 'Dev only — mark KHQR as paid without real scan' })
  @Post('dev/khqr/simulate/:orderId')
  simulateKhqr(@Param('orderId') orderId: string) {
    return this.payments.simulateKhqr(orderId);
  }
}
