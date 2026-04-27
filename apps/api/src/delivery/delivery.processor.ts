import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrdersService } from '../orders/orders.service';
import { OrdersGateway } from '../ws/orders.gateway';
import { randomUUID, randomInt } from 'crypto';

export interface DeliveryJobData {
  orderId: string;
  method:  'DIRECT' | 'CODE';
}

@Processor('delivery')
export class DeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(DeliveryProcessor.name);

  constructor(
    private readonly orders:  OrdersService,
    private readonly gateway: OrdersGateway,
  ) {
    super();
  }

  async process(job: Job<DeliveryJobData>) {
    const { orderId, method } = job.data;
    this.logger.log(`Processing delivery job ${job.id} for order ${orderId} (${method})`);

    // PENDING → PAID → DELIVERING
    await this.orders.transition(orderId, 'DELIVERING');
    this.gateway.emitStatus(orderId, 'DELIVERING');

    if (method === 'CODE') {
      const redeemCode = [
        'TPUP',
        randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase(),
        randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase(),
        randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase(),
      ].join('-');

      await this.orders.transition(orderId, 'DELIVERED', { redeemCode });
      this.gateway.emitStatus(orderId, 'DELIVERED', { redeemCode });
      this.logger.log(`Code delivered to order ${orderId}: ${redeemCode}`);

    } else {
      // Mock direct top-up: random 5–30 second delay simulating provider latency
      const delayMs = randomInt(5_000, 30_000);
      this.logger.log(`Direct delivery: waiting ${delayMs}ms for order ${orderId}`);
      await new Promise<void>(r => setTimeout(r, delayMs));

      const providerRef = `DIRECT-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      await this.orders.transition(orderId, 'DELIVERED', { providerRef });
      this.gateway.emitStatus(orderId, 'DELIVERED', { providerRef });
      this.logger.log(`Direct delivery complete for order ${orderId}`);
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<DeliveryJobData>, err: Error) {
    this.logger.error(`Delivery job ${job.id} failed for order ${job.data.orderId}: ${err.message}`);
    await this.orders
      .transition(job.data.orderId, 'FAILED', { error: err.message })
      .catch(() => {});
    this.gateway.emitStatus(job.data.orderId, 'FAILED', { error: err.message });
  }
}
