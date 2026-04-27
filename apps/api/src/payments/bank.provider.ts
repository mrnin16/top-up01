import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import { PaymentProvider, InitiateResult, NormalizedEvent } from './provider.interface';
import { createHmac } from 'crypto';

const BANK_NAMES: Record<string, string> = {
  aba:      'ABA Bank',
  acleda:   'ACLEDA',
  wing:     'Wing Bank',
  chipmong: 'Chip Mong Bank',
};

@Injectable()
export class BankProvider implements PaymentProvider {
  constructor(private readonly config: ConfigService) {}

  async initiate(order: Order, extra?: Record<string, unknown>): Promise<InitiateResult> {
    const bankCode   = (extra?.bankCode as string) ?? 'aba';
    const webOrigin  = this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
    const apiOrigin  = this.config.get<string>('API_ORIGIN') ?? 'http://localhost:4000';
    const paymentId  = `bank-${order.id}`;
    const ref        = `${bankCode.toUpperCase()}-${order.ref}`;
    const returnUrl  = `${webOrigin}/checkout/return?paymentId=${paymentId}&ref=${ref}`;
    // Dev stub bank page built into the API
    const redirectUrl = `${apiOrigin}/dev/bank/${bankCode}/${paymentId}?amount=${order.totalCents}&returnUrl=${encodeURIComponent(returnUrl)}`;

    return { paymentId, redirectUrl, ref };
  }

  async parseWebhook(body: unknown, headers: Record<string, string>): Promise<NormalizedEvent> {
    const payload = body as Record<string, string>;
    return {
      providerRef: payload.ref ?? '',
      status:      payload.status === 'SUCCESS' ? 'SUCCEEDED' : 'FAILED',
      raw:         payload,
    };
  }

  verifyReturn(paymentId: string, status: string, token: string): boolean {
    const expected = createHmac('sha256', process.env.JWT_SECRET ?? 'secret')
      .update(`${paymentId}:${status}`)
      .digest('hex')
      .slice(0, 16);
    return token === expected;
  }

  signReturn(paymentId: string, status: string): string {
    return createHmac('sha256', process.env.JWT_SECRET ?? 'secret')
      .update(`${paymentId}:${status}`)
      .digest('hex')
      .slice(0, 16);
  }
}
