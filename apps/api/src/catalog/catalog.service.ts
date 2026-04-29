import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GAME_CHECKER_SLUG_MAP,
  RAPIDAPI_BASE_URL,
  RAPIDAPI_HOST,
  RAPIDAPI_KEY,
} from './game-checker.constants';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

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
      orderBy: [{ sortOrder: 'asc' }, { hot: 'desc' }, { isNew: 'desc' }, { title: 'asc' }],
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

    const gamePath = GAME_CHECKER_SLUG_MAP[slug];
    if (!gamePath) {
      // No external checker wired up for this product — fall back to a basic
      // length check so the UI still gates the "Pay" button on plausible input.
      const valid = gameUserId.length >= 6 && zoneId.length >= 3;
      return { valid, displayName: valid ? 'LinaG_★' : null };
    }

    try {
      const url = `${RAPIDAPI_BASE_URL}/${gamePath}/${encodeURIComponent(gameUserId)}/${encodeURIComponent(zoneId)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key':  RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      });

      if (!res.ok) return { valid: false, displayName: null };

      const body = (await res.json()) as { success?: boolean; data?: { username?: string } };
      if (!body?.success || !body.data?.username) {
        return { valid: false, displayName: null };
      }
      return { valid: true, displayName: body.data.username };
    } catch (err) {
      this.logger.warn(`Game checker call failed for ${slug}: ${(err as Error).message}`);
      return { valid: false, displayName: null };
    }
  }
}
