import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { OrdersGateway } from '../ws/orders.gateway';
import type { DeliveryJobData } from '../delivery/delivery.processor';

export interface KhqrPollJobData {
  orderId:   string;
  ref:       string;
  startedAt: number;  // ms timestamp
}

// Implement this interface to swap in the real Bakong SDK
export interface BakongAdapter {
  checkPayment(ref: string): Promise<'PAID' | 'PENDING' | 'EXPIRED'>;
}

// Dev stub — always returns PENDING (dev flow uses /dev/khqr/simulate endpoint)
const devStub: BakongAdapter = {
  checkPayment: async () => 'PENDING',
};

@Processor('khqr-poll')
export class KhqrPollProcessor extends WorkerHost {
  private readonly logger = new Logger(KhqrPollProcessor.name);

  // Swap devStub for real Bakong adapter via DI once available
  private readonly bakong: BakongAdapter = devStub;

  // 10-minute expiry window
  private readonly EXPIRY_MS = 10 * 60_000;

  constructor(
    private readonly prisma:   PrismaService,
    private readonly orders:   OrdersService,
    private readonly gateway:  OrdersGateway,
    @InjectQueue('delivery') private readonly deliveryQueue: Queue<DeliveryJobData>,
  ) {
    super();
  }

  async process(job: Job<KhqrPollJobData>) {
    const { orderId, ref, startedAt } = job.data;

    // Stop polling after 10 minutes
    if (Date.now() - startedAt > this.EXPIRY_MS) {
      this.logger.warn(`KHQR poll expired for order ${orderId}`);

      // Mark payment expired
      await this.prisma.payment.updateMany({
        where: { orderId, provider: 'khqr', status: 'PENDING' },
        data:  { status: 'EXPIRED' },
      });

      // Remove the repeating job
      await job.discard();
      return;
    }

    const status = await this.bakong.checkPayment(ref);
    this.logger.debug(`KHQR poll ${ref}: ${status}`);

    if (status === 'PAID') {
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order || order.status !== 'PENDING') return;

      await this.prisma.payment.updateMany({
        where: { orderId, provider: 'khqr', status: 'PENDING' },
        data:  { status: 'SUCCEEDED' },
      });

      const updated = await this.orders.transition(orderId, 'PAID', {
        provider: 'khqr',
        bakongRef: ref,
      });

      this.gateway.emitStatus(orderId, 'PAID');

      await this.deliveryQueue.add(
        'process',
        { orderId, method: updated.method as 'DIRECT' | 'CODE' },
        { jobId: `delivery-${orderId}`, removeOnComplete: true },
      );

      await job.discard();  // stop the repeating poll
    }
  }
}
