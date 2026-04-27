import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { OrdersGateway } from '../ws/orders.gateway';
import { KhqrProvider } from './khqr.provider';
import { BankProvider } from './bank.provider';
import { StripeProvider } from './stripe.provider';
import type { DeliveryJobData } from '../delivery/delivery.processor';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma:   PrismaService,
    private readonly orders:   OrdersService,
    private readonly gateway:  OrdersGateway,
    private readonly khqr:     KhqrProvider,
    private readonly bank:     BankProvider,
    private readonly stripe:   StripeProvider,
    @InjectQueue('delivery') private readonly deliveryQueue: Queue<DeliveryJobData>,
  ) {}

  // ── Guards ──────────────────────────────────────────────────────────────────
  // Optional userId: if the order is owned, requester must match; otherwise
  // anonymous (anyone with the orderId can pay it).
  private async guardOrder(orderId: string, requestingUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // Owned-order ownership check (skip when both sides are anonymous)
    if (order.userId && requestingUserId && order.userId !== requestingUserId) {
      throw new ConflictException('Order belongs to another user');
    }

    if (order.status !== 'PENDING') throw new ConflictException('Order is not pending');

    const succeeded = await this.prisma.payment.findFirst({
      where: { orderId, status: 'SUCCEEDED' },
    });
    if (succeeded) throw new ConflictException('Order already paid');
    return order;
  }

  // ── After PAID: emit WS + enqueue delivery ──────────────────────────────────
  private async onPaid(orderId: string, method: 'DIRECT' | 'CODE') {
    this.gateway.emitStatus(orderId, 'PAID');
    await this.deliveryQueue.add(
      'process',
      { orderId, method },
      { jobId: `delivery-${orderId}`, removeOnComplete: true, removeOnFail: false },
    );
    this.logger.log(`Delivery job enqueued for order ${orderId} (${method})`);
  }

  // ── KHQR ────────────────────────────────────────────────────────────────────
  async initiateKhqr(orderId: string, requestingUserId?: string) {
    const order  = await this.guardOrder(orderId, requestingUserId);
    const result = await this.khqr.initiate(order);
    await this.prisma.payment.create({
      data: {
        orderId,
        method:      'KHQR',
        provider:    'khqr',
        providerRef: result.paymentId,
        amountCents: order.totalCents,
        status:      'PENDING',
      },
    });
    return result;
  }

  // ── Bank ─────────────────────────────────────────────────────────────────────
  async initiateBank(orderId: string, bankCode: string, requestingUserId?: string) {
    const order  = await this.guardOrder(orderId, requestingUserId);
    const result = await this.bank.initiate(order, { bankCode });
    await this.prisma.payment.create({
      data: {
        orderId,
        method:      'BANK',
        provider:    bankCode,
        providerRef: result.paymentId,
        amountCents: order.totalCents,
        status:      'PENDING',
      },
    });
    return result;
  }

  // ── Card ─────────────────────────────────────────────────────────────────────
  async initiateCard(orderId: string, requestingUserId?: string) {
    const order  = await this.guardOrder(orderId, requestingUserId);
    const result = await this.stripe.initiate(order);
    await this.prisma.payment.create({
      data: {
        orderId,
        method:      'CARD',
        provider:    'stripe',
        providerRef: result.paymentId,
        amountCents: order.totalCents,
        status:      'INITIATED',
      },
    });
    return result;
  }

  // ── Payment status ───────────────────────────────────────────────────────────
  async getPaymentStatus(paymentId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { providerRef: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // ── Webhook ingestion (all providers) ───────────────────────────────────────
  async handleWebhook(provider: string, body: unknown, headers: Record<string, string>) {
    let event: { providerRef: string; status: 'SUCCEEDED' | 'FAILED' | 'EXPIRED'; raw: Record<string, unknown> };

    if (provider === 'stripe') {
      event = await this.stripe.parseWebhook(body, headers);
    } else if (provider === 'khqr') {
      event = await this.khqr.parseWebhook(body, headers);
    } else {
      event = await this.bank.parseWebhook(body, headers);
    }

    // Idempotency — skip already-processed events
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { provider_eventId: { provider, eventId: event.providerRef } },
    });
    if (existing?.processedAt) {
      this.logger.debug(`Duplicate webhook ${provider}/${event.providerRef} — skipped`);
      return { ignored: true };
    }

    await this.prisma.webhookEvent.upsert({
      where:  { provider_eventId: { provider, eventId: event.providerRef } },
      create: { provider, eventId: event.providerRef, payload: event.raw as any },
      update: {},
    });

    if (event.status === 'SUCCEEDED') {
      const payment = await this.prisma.payment.findFirst({
        where: { providerRef: event.providerRef },
      });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data:  { status: 'SUCCEEDED' },
        });
        const updated = await this.orders.transition(payment.orderId, 'PAID', {
          provider,
          providerRef: event.providerRef,
        });
        await this.onPaid(payment.orderId, updated.method as 'DIRECT' | 'CODE');
      }
    }

    await this.prisma.webhookEvent.update({
      where: { provider_eventId: { provider, eventId: event.providerRef } },
      data:  { processedAt: new Date() },
    });

    return { ok: true };
  }

  // ── Bank redirect return ─────────────────────────────────────────────────────
  async handleBankReturn(paymentId: string, status: string, token: string) {
    if (!this.bank.verifyReturn(paymentId, status, token)) {
      throw new BadRequestException('Invalid return token');
    }
    if (status === 'success') {
      await this.handleWebhook('bank', { ref: paymentId, status: 'SUCCESS' }, {});
    }
    return { status };
  }

  // ── Dev simulator — mark KHQR as paid without real scan ─────────────────────
  async simulateKhqr(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.orders.transition(orderId, 'PAID', {
      provider:  'khqr',
      simulated: true,
    });
    await this.onPaid(orderId, updated.method as 'DIRECT' | 'CODE');
    return { ok: true };
  }
}
