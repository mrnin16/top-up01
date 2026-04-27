import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { KhqrProvider } from './khqr.provider';
import { KhqrPollProcessor } from './khqr-poll.processor';
import { BankProvider } from './bank.provider';
import { StripeProvider } from './stripe.provider';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [
    AuthModule,
    OrdersModule,
    WsModule,
    // Queues only — root is registered globally in AppModule
    BullModule.registerQueue({ name: 'khqr-poll' }),
    BullModule.registerQueue({ name: 'delivery' }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, KhqrProvider, KhqrPollProcessor, BankProvider, StripeProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
