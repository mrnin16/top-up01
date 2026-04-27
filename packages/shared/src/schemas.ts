import { z } from 'zod';
import { TopupMethod, PaymentMethod } from './enums.js';

export const RegisterSchema = z.object({
  email:    z.string().email().optional(),
  phone:    z.string().min(8).optional(),
  name:     z.string().min(1).max(80),
  password: z.string().min(8).max(128),
}).refine(d => d.email || d.phone, { message: 'email or phone required' });

export const LoginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password:     z.string().min(1),
});

export const OtpSendSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
}).refine(d => d.phone || d.email, { message: 'phone or email required' });

export const OtpVerifySchema = z.object({
  token: z.string().min(1),
  code:  z.string().length(6),
});

export const ValidateAccountSchema = z.object({
  gameUserId: z.string().min(6),
  zoneId:     z.string().min(3),
});

export const CreateOrderSchema = z.object({
  productId:  z.string().cuid(),
  packageId:  z.string().cuid(),
  method:     z.nativeEnum(TopupMethod),
  gameUserId: z.string().min(6).optional(),
  zoneId:     z.string().min(3).optional(),
}).superRefine((d, ctx) => {
  if (d.method === TopupMethod.DIRECT && (!d.gameUserId || !d.zoneId)) {
    ctx.addIssue({ code: 'custom', message: 'gameUserId and zoneId required for DIRECT' });
  }
});

export const InitiateKhqrSchema = z.object({
  orderId: z.string().cuid(),
});

export const InitiateBankSchema = z.object({
  orderId:  z.string().cuid(),
  bankCode: z.enum(['aba', 'acleda', 'wing', 'chipmong']),
});

export const InitiateCardSchema = z.object({
  orderId: z.string().cuid(),
});
