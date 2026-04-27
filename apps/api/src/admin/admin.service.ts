import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateProductDto {
  title?:           string;
  sub?:             string;
  active?:          boolean;
  hot?:             boolean;
  isNew?:           boolean;
  vip?:             boolean;
  discountPercent?: number;      // 0-100
  imageUrl?:        string;
  gradFrom?:        string;
  gradTo?:          string;
  emblem?:          string;
  supportsDirect?:  boolean;
  supportsCode?:    boolean;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Products ─────────────────────────────────────────────────────────────────
  getProducts() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        packages: { orderBy: { sortOrder: 'asc' } },
        _count:   { select: { orders: true } },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { title: 'asc' }],
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Product not found');

    if (dto.discountPercent !== undefined) {
      if (dto.discountPercent < 0 || dto.discountPercent > 100) {
        throw new BadRequestException('discountPercent must be 0-100');
      }
    }

    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async applyDiscountToAll(percent: number) {
    if (percent < 0 || percent > 100) {
      throw new BadRequestException('percent must be 0-100');
    }
    const { count } = await this.prisma.product.updateMany({ data: { discountPercent: percent } });
    return { updated: count, discountPercent: percent };
  }

  // ── Settings ─────────────────────────────────────────────────────────────────
  async getSettings() {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
  }

  async updateSettings(data: Record<string, string>) {
    const ops = Object.entries(data).map(([key, value]) =>
      this.prisma.setting.upsert({
        where:  { key },
        create: { key, value },
        update: { value },
      }),
    );
    await this.prisma.$transaction(ops);
    return this.getSettings();
  }

  // ── Orders (admin view) ───────────────────────────────────────────────────────
  getOrders(page = 1) {
    const take = 50;
    const skip = (page - 1) * take;
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take, skip,
      include: {
        product: { select: { title: true, emblem: true, gradFrom: true, gradTo: true } },
        package: { select: { amount: true, bonus: true } },
        user:    { select: { email: true, name: true } },
        payments:{ select: { method: true, status: true } },
      },
    });
  }

  async getStats() {
    const [totalOrders, delivered, revenue, users, products] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { in: ['DELIVERED', 'PAID', 'DELIVERING'] } } }),
      this.prisma.user.count(),
      this.prisma.product.count({ where: { active: true } }),
    ]);
    return {
      totalOrders,
      deliveredOrders: delivered,
      totalRevenueCents: revenue._sum.totalCents ?? 0,
      totalUsers: users,
      activeProducts: products,
    };
  }
}
