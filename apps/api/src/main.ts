import 'reflect-metadata';
import { NestFactory }             from '@nestjs/core';
import { ValidationPipe, Logger }  from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication }  from '@nestjs/platform-express';
import { AppModule }               from './app.module';
import { ProblemFilter }           from './common/problem.filter';
import { join }                    from 'path';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:   ['log', 'warn', 'error', 'debug'],
    rawBody:  true,  // needed for Stripe webhook signature verification
  });

  // Serve uploaded files at /uploads/<filename>
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalFilters(new ProblemFilter());

  // Allow localhost dev, LAN, and any deployed frontend (set EXTRA_ORIGINS as comma-separated list)
  const allowedOrigins = [
    process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    'http://localhost:3000',
    'http://192.168.1.4:3000',
    ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : []),
  ];
  app.enableCors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Swagger, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const config = new DocumentBuilder()
    .setTitle('Top-up API')
    .setDescription('Game & service top-up platform REST API + WebSocket')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('auth',     'Registration, login, refresh, OTP')
    .addTag('catalog',  'Categories, products, validate-account')
    .addTag('orders',   'Create & manage orders')
    .addTag('payments', 'KHQR, Bank redirect, Stripe')
    .addTag('health',   'Liveness & readiness')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API   → http://localhost:${port}`);
  logger.log(`Docs  → http://localhost:${port}/docs`);
}

bootstrap();
