import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'ws' })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // Accept all connections; populate userId only if a valid token was sent.
  // Anonymous clients can subscribe to anonymous orders.
  async handleConnection(client: Socket) {
    const token = (client.handshake.auth as any)?.token as string | undefined;
    if (!token) return;   // anonymous — no userId set
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      }) as { sub: string };
      (client as any).userId = payload.sub;
    } catch {
      // Invalid token: leave as anonymous (don't disconnect — they may still
      // subscribe to anonymous orders).
    }
  }

  handleDisconnect(client: Socket) {
    client.rooms.forEach(r => client.leave(r));
  }

  @SubscribeMessage('subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const userId = (client as any).userId as string | undefined;
    const order  = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new WsException('Order not found');

    // Owned orders require the matching userId
    if (order.userId && order.userId !== userId) {
      throw new WsException('Forbidden');
    }
    // Anonymous orders: anyone with the orderId can subscribe

    client.join(`order:${data.orderId}`);
    client.emit('status', {
      type:        'status',
      status:      order.status,
      redeemCode:  order.redeemCode,
      deliveredAt: order.deliveredAt,
    });
  }

  // Called by services after each transition
  emitStatus(orderId: string, status: string, extra?: Record<string, unknown>) {
    this.server.to(`order:${orderId}`).emit('status', { type: 'status', status, ...extra });
  }
}
