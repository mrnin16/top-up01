import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import Stripe from 'stripe';
import { PaymentProvider, InitiateResult, NormalizedEvent } from './provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(config.get<string>('STRIPE_SECRET_KEY') ?? 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    });
  }

  async initiate(order: Order): Promise<InitiateResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount:   order.totalCents,
      currency: order.currency.toLowerCase(),
      metadata: { orderId: order.id, ref: order.ref },
    });
    return { paymentId: intent.id, clientSecret: intent.client_secret! };
  }

  async parseWebhook(body: unknown, headers: Record<string, string>): Promise<NormalizedEvent> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    const sig           = headers['stripe-signature'] ?? '';

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(body as string | Buffer, sig, webhookSecret);
    } catch {
      throw new Error('Invalid Stripe signature');
    }

    const intent = event.data.object as Stripe.PaymentIntent;
    const status =
      event.type === 'payment_intent.succeeded'       ? 'SUCCEEDED' :
      event.type === 'payment_intent.payment_failed'  ? 'FAILED'    : 'FAILED';

    return { providerRef: intent.id, status, raw: event as unknown as Record<string, unknown> };
  }
}
