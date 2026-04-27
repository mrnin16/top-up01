import { Module } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [OrdersGateway],
  exports: [OrdersGateway],   // ← exported so PaymentsModule + DeliveryModule can inject it
})
export class WsModule {}
