import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService }             from '@nestjs/config';
import { ThrottlerModule }                         from '@nestjs/throttler';
import { BullModule }                              from '@nestjs/bullmq';
import { PrismaModule }    from './prisma/prisma.module';
import { AuthModule }      from './auth/auth.module';
import { CatalogModule }   from './catalog/catalog.module';
import { OrdersModule }    from './orders/orders.module';
import { PaymentsModule }  from './payments/payments.module';
import { DeliveryModule }  from './delivery/delivery.module';
import { WsModule }        from './ws/ws.module';
import { HealthModule }    from './health/health.module';
import { AdminModule }     from './admin/admin.module';
import { RequestIdMiddleware } from './common/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Single global BullMQ connection
    BullModule.forRootAsync({
      imports:    [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        connection: { url: cs.get<string>('REDIS_URL') ?? 'redis://localhost:6379' },
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    CatalogModule,
    OrdersModule,
    PaymentsModule,
    DeliveryModule,
    WsModule,
    HealthModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
