import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PaymentProvider, InitiateResult, NormalizedEvent } from './provider.interface';

function crc16(data: string): string {
  let crc = 0xffff;
  for (const char of data) {
    crc ^= char.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase().padStart(4, '0'));
}

function buildKhqrString(merchantId: string, amountCents: number, ref: string): string {
  const amount  = (amountCents / 100).toFixed(2);
  const txnRef  = ref.slice(0, 25);
  // Simplified EMVCo-compatible KHQR stub
  const payload =
    `000201` +
    `010212` +
    `2658` +
    `0006${merchantId.length.toString().padStart(2, '0')}${merchantId}` +
    `5303840` +
    `5405${amount}` +
    `5802KH` +
    `6304`;
  const checksum = crc16(payload);
  return `${payload}${checksum}`.toUpperCase();
}

@Injectable()
export class KhqrProvider implements PaymentProvider {
  constructor(
    private readonly config: ConfigService,
    @InjectQueue('khqr-poll') private readonly pollQueue: Queue,
  ) {}

  async initiate(order: Order): Promise<InitiateResult> {
    const merchantId = this.config.get<string>('KHQR_MERCHANT_ID') ?? '000000000000000';
    const qrString   = buildKhqrString(merchantId, order.totalCents, order.ref);
    const expiresAt  = new Date(Date.now() + 10 * 60_000);

    // Schedule polling job
    await this.pollQueue.add(
      'poll',
      { orderId: order.id, ref: order.ref },
      {
        repeat: { every: 3000 },
        removeOnComplete: true,
        jobId: `khqr-${order.id}`,
      },
    );

    return { paymentId: `khqr-${order.id}`, qrString, expiresAt };
  }

  async parseWebhook(body: unknown, _headers: Record<string, string>): Promise<NormalizedEvent> {
    const payload = body as Record<string, string>;
    return {
      providerRef: payload.transactionId ?? payload.ref ?? '',
      status:      payload.status === 'PAID' ? 'SUCCEEDED' : 'FAILED',
      raw:         payload,
    };
  }

  // Exported so the stub endpoint can call it
  buildQrString(merchantId: string, amountCents: number, ref: string) {
    return buildKhqrString(merchantId, amountCents, ref);
  }

  crc16 = crc16;
}
