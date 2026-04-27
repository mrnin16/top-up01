import { Test } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

const TRANSITIONS: [string, string, boolean][] = [
  ['PENDING',    'PAID',       true],
  ['PENDING',    'FAILED',     true],
  ['PENDING',    'DELIVERING', false],
  ['PENDING',    'DELIVERED',  false],
  ['PAID',       'DELIVERING', true],
  ['PAID',       'FAILED',     true],
  ['PAID',       'PENDING',    false],
  ['DELIVERING', 'DELIVERED',  true],
  ['DELIVERING', 'FAILED',     true],
  ['DELIVERING', 'PAID',       false],
  ['DELIVERED',  'PAID',       false],
  ['FAILED',     'PENDING',    false],
];

describe('OrdersService — state machine', () => {
  let service: OrdersService;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prismaMock = {
      order: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    } as unknown as jest.Mocked<PrismaService>;

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  test.each(TRANSITIONS)('from %s → %s: allowed=%s', async (from, to, allowed) => {
    prismaMock.order.findUniqueOrThrow.mockResolvedValue({ id: 'ord1', status: from } as any);

    if (allowed) {
      await expect(service.transition('ord1', to as any)).resolves.toBeDefined();
    } else {
      await expect(service.transition('ord1', to as any)).rejects.toThrow(ConflictException);
    }
  });
});
