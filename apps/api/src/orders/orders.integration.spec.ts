import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Orders (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let access: string;
  let productId: string;
  let packageId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = module.get(PrismaService);

    // Login as seed user
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ emailOrPhone: 'lina@example.com', password: 'password123' });
    access = res.body.access;

    // Get MLBB product
    const products = await request(app.getHttpServer()).get('/products?category=mobile');
    const mlbb     = products.body.find((p: any) => p.slug === 'mlbb');
    productId      = mlbb.id;
    packageId      = mlbb.packages?.[0]?.id ?? (await prisma.package.findFirst({ where: { productId: mlbb.id } }))?.id;
  });

  afterAll(() => app.close());

  it('GET /products — returns catalog', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /products/mlbb/validate-account — short id returns invalid', async () => {
    const res = await request(app.getHttpServer())
      .post('/products/mlbb/validate-account')
      .send({ gameUserId: '123', zoneId: '21' })
      .expect(200);
    expect(res.body.valid).toBe(false);
  });

  it('POST /products/mlbb/validate-account — valid ids return displayName', async () => {
    const res = await request(app.getHttpServer())
      .post('/products/mlbb/validate-account')
      .send({ gameUserId: '312789045', zoneId: '2155' })
      .expect(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.displayName).toBe('LinaG_★');
  });

  it('POST /orders — bad packageId returns 400', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${access}`)
      .send({ productId, packageId: 'xxxxxxxxxxxxxxxxxxxxxxxx', method: 'DIRECT', gameUserId: '312789045', zoneId: '2155' })
      .expect(400);
  });

  it('POST /orders — happy path returns order with recomputed totals', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${access}`)
      .send({ productId, packageId, method: 'DIRECT', gameUserId: '312789045', zoneId: '2155' })
      .expect(201);

    expect(res.body.ref).toMatch(/^TP-\d+$/);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.feeCents).toBe(Math.round(res.body.subtotalCents * 0.02));
    expect(res.body.totalCents).toBe(res.body.subtotalCents + res.body.feeCents);
  });

  it('GET /orders — requires auth', async () => {
    await request(app.getHttpServer()).get('/orders').expect(401);
  });

  it('GET /orders — returns my orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
