import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  getCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  getProducts(params: { category?: string; q?: string; limit?: number; cursor?: string }) {
    const { category, q, limit = 20, cursor } = params;
    return this.prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { sub: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { category: true },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ hot: 'desc' }, { isNew: 'desc' }, { title: 'asc' }],
    });
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        category: true,
        packages: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async validateAccount(slug: string, gameUserId: string, zoneId: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product) throw new NotFoundException('Product not found');

    // Mock validation — real provider would call game API
    const valid = gameUserId.length >= 6 && zoneId.length >= 3;
    if (!valid) return { valid: false, displayName: null };

    return { valid: true, displayName: 'LinaG_★' };
  }
}
