import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DeliveryProcessor } from './delivery.processor';
import { OrdersModule } from '../orders/orders.module';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [
    OrdersModule,
    WsModule,
    BullModule.registerQueue({ name: 'delivery' }),
  ],
  providers: [DeliveryProcessor],
})
export class DeliveryModule {}
