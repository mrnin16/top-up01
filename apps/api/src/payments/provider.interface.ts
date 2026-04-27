import { Order } from '@prisma/client';

export interface InitiateResult {
  paymentId: string;
  qrString?:    string;
  expiresAt?:   Date;
  redirectUrl?: string;
  clientSecret?: string;
  ref?: string;
}

export interface NormalizedEvent {
  providerRef: string;
  status: 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  initiate(order: Order, extra?: Record<string, unknown>): Promise<InitiateResult>;
  parseWebhook(body: unknown, headers: Record<string, string>): Promise<NormalizedEvent>;
}
