import {
  Controller, Get, Patch, Post, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard }   from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { AdminService }   from './admin.service';
import { ConfigService }  from '@nestjs/config';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin:  AdminService,
    private readonly config: ConfigService,
  ) {}

  // ── Stats ─────────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Dashboard stats (orders, revenue, users, products)' })
  @Get('stats')
  stats() { return this.admin.getStats(); }

  // ── Products ──────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'List all products with order count' })
  @Get('products')
  products() { return this.admin.getProducts(); }

  @ApiOperation({ summary: 'Update product (vip, discount, imageUrl, active, etc.)' })
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.admin.updateProduct(id, body);
  }

  @ApiOperation({ summary: 'Apply discount % to ALL products at once' })
  @Post('products/discount-all')
  discountAll(@Body('percent') percent: number) {
    return this.admin.applyDiscountToAll(Number(percent));
  }

  // ── File upload ───────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Upload an image, returns { url }' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    const base = this.config.get<string>('API_ORIGIN') ?? 'http://localhost:4000';
    return { url: `${base}/uploads/${file.filename}`, filename: file.filename };
  }

  // ── Settings ──────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Get all platform settings' })
  @Get('settings')
  getSettings() { return this.admin.getSettings(); }

  @ApiOperation({ summary: 'Update platform settings (key/value pairs)' })
  @Patch('settings')
  updateSettings(@Body() body: Record<string, string>) {
    return this.admin.updateSettings(body);
  }

  // ── Orders (admin view) ───────────────────────────────────────────────────────
  @ApiOperation({ summary: 'All orders paginated (admin view)' })
  @Get('orders')
  orders(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.admin.getOrders(page);
  }
}
