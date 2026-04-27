import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeFeeCents, computeTotalCents } from '@topup/shared';
import type { CreateOrderDto } from '@topup/shared';
import { randomInt } from 'crypto';

export type AnyStatus =
  | 'PENDING' | 'PAID' | 'DELIVERING' | 'DELIVERED' | 'FAILED' | 'REFUNDED';

const VALID_TRANSITIONS: Record<AnyStatus, AnyStatus[]> = {
  PENDING:    ['PAID', 'FAILED'],
  PAID:       ['DELIVERING', 'FAILED'],
  DELIVERING: ['DELIVERED', 'FAILED'],
  DELIVERED:  [],
  FAILED:     [],
  REFUNDED:   [],
};

// Prisma include used on every order fetch
const ORDER_INCLUDE = {
  product: {
    select: {
      id: true, slug: true, title: true, sub: true,
      currencyLabel: true, emblem: true, gradFrom: true, gradTo: true,
      imageUrl: true, currencyImageUrl: true, vip: true, discountPercent: true,
    },
  },
  package: {
    select: { id: true, amount: true, bonus: true, priceCents: true },
  },
  payments: {
    select: { method: true, status: true, provider: true, providerRef: true, createdAt: true },
  },
} as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ───────────────────────────────────────────────────────────────────
  // userId can be null for anonymous (guest) orders.
  async create(userId: string | null, dto: CreateOrderDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: dto.packageId },
      include: { product: true },
    });
    if (!pkg || !pkg.active)              throw new BadRequestException('Package not found');
    if (pkg.product.id !== dto.productId) throw new BadRequestException('Package/product mismatch');
    if (!pkg.product.active)              throw new BadRequestException('Product unavailable');

    const subtotalCents  = pkg.priceCents;
    const discountPct    = pkg.product.discountPercent ?? 0;
    const discountCents  = Math.round(subtotalCents * discountPct / 100);
    const effectiveSub   = subtotalCents - discountCents;
    const feeCents       = computeFeeCents(effectiveSub);
    const totalCents     = effectiveSub + feeCents;
    const ref            = `TP-${String(randomInt(100000, 999999))}`;

    return this.prisma.order.create({
      data: {
        ref, userId,
        productId:  dto.productId,
        packageId:  dto.packageId,
        method:     dto.method as any,
        gameUserId: dto.gameUserId,
        zoneId:     dto.zoneId,
        subtotalCents, discountCents, feeCents, totalCents,
      },
      include: ORDER_INCLUDE,
    });
  }

  // ── Find one ────────────────────────────────────────────────────────────────
  // Anonymous orders (no userId) are accessible to anyone with the cuid.
  // Owned orders require the owner or an admin.
  async findOne(id: string, requestingUserId?: string, role?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        ...ORDER_INCLUDE,
        audits: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Anonymous order — anyone holding the orderId can read it
    if (!order.userId) return order;

    // Owned order — requester must be the owner or an admin
    if (order.userId !== requestingUserId && role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    return order;
  }

  // ── List mine ────────────────────────────────────────────────────────────────
  findMine(userId: string, page = 1) {
    const take = 20;
    const skip = (page - 1) * take;
    return this.prisma.order.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take, skip,
      include: ORDER_INCLUDE,
    });
  }

  // ── State machine transition ─────────────────────────────────────────────────
  async transition(
    orderId: string,
    next:    AnyStatus,
    meta?:   Record<string, unknown>,
    actorId?: string,
  ) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const allowed = VALID_TRANSITIONS[order.status as AnyStatus] ?? [];
    if (!allowed.includes(next)) {
      throw new ConflictException(`Cannot transition from ${order.status} to ${next}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status:      next,
        deliveredAt: next === 'DELIVERED' ? new Date() : undefined,
        redeemCode:  meta?.redeemCode as string | undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action:   `ORDER_${next}`,
        entity:   'Order',
        entityId: orderId,
        orderId,
        meta:     meta as any,
      },
    });

    return updated;
  }
}
