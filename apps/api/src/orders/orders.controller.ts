import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderSchema } from '@topup/shared';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  // Create order — works for guests AND signed-in users.
  // If a token is present, the order is linked to the user (saved to history).
  // Otherwise, it's an anonymous order tied only to its (unguessable) cuid.
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() body: unknown) {
    const dto = CreateOrderSchema.parse(body);
    return this.orders.create(req.user?.userId ?? null, dto);
  }

  // List my orders — requires auth (need a userId to filter on)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: any, @Query('page') page?: string) {
    return this.orders.findMine(req.user.userId, page ? parseInt(page, 10) : 1);
  }

  // Get single order — anonymous if order has no owner; otherwise owner-or-admin
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.orders.findOne(id, req.user?.userId, req.user?.role);
  }
}
