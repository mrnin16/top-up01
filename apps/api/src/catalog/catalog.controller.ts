import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ValidateAccountSchema } from '@topup/shared';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Public platform settings (KHQR image, merchant info, announcement) ──
  // No auth required — used by the checkout flow for every visitor.
  @ApiOperation({ summary: 'Public platform settings (KHQR image, merchant info, multilingual text)' })
  @Get('settings/public')
  async publicSettings() {
    // Fixed keys + all "text.*" multilingual display strings (e.g. text.heroTitle.en, text.heroTitle.km)
    const fixed = ['khqrImageUrl', 'khqrMerchantName', 'khqrMerchantId', 'khqrAccountNo', 'khqrCity', 'announcementText', 'uiMode', 'defaultBrandColor'];
    const rows = await this.prisma.setting.findMany({
      where: {
        OR: [
          { key: { in: fixed } },
          { key: { startsWith: 'text.' } },
        ],
      },
    });
    return Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
  }

  @Get('categories')
  categories() {
    return this.catalog.getCategories();
  }

  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @Get('products')
  products(
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.catalog.getProducts({
      category,
      q,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Get('products/:slug')
  product(@Param('slug') slug: string) {
    return this.catalog.getProduct(slug);
  }

  @Post('products/:slug/validate-account')
  validateAccount(@Param('slug') slug: string, @Body() body: unknown) {
    const dto = ValidateAccountSchema.parse(body);
    return this.catalog.validateAccount(slug, dto.gameUserId, dto.zoneId);
  }
}
