import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

// Integration tests — require a running Postgres + Redis (use docker-compose)
// Run with: pnpm --filter api test:integration
describe('Auth (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  const email = `int+${Date.now()}@example.com`;

  it('POST /auth/register — creates user and returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Integration Test', password: 'test1234' })
      .expect(201);

    expect(res.body).toMatchObject({ access: expect.any(String), refresh: expect.any(String) });
  });

  it('POST /auth/register — duplicate email returns 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Dup', password: 'test1234' })
      .expect(409);
  });

  it('POST /auth/login — returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ emailOrPhone: email, password: 'test1234' })
      .expect(201);

    expect(res.body.access).toBeDefined();
  });

  it('POST /auth/login — wrong password returns 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ emailOrPhone: email, password: 'wrong' })
      .expect(401);
  });
});
