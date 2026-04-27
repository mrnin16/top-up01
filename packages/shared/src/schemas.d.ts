import { z } from 'zod';
import { TopupMethod } from './enums.js';
export declare const RegisterSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}>, {
    name: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    emailOrPhone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    emailOrPhone: string;
}, {
    password: string;
    emailOrPhone: string;
}>;
export declare const OtpSendSchema: z.ZodEffects<z.ZodObject<{
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
}>, {
    email?: string | undefined;
    phone?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
}>;
export declare const OtpVerifySchema: z.ZodObject<{
    token: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    token: string;
}, {
    code: string;
    token: string;
}>;
export declare const ValidateAccountSchema: z.ZodObject<{
    gameUserId: z.ZodString;
    zoneId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    gameUserId: string;
    zoneId: string;
}, {
    gameUserId: string;
    zoneId: string;
}>;
export declare const CreateOrderSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodString;
    packageId: z.ZodString;
    method: z.ZodNativeEnum<typeof TopupMethod>;
    gameUserId: z.ZodOptional<z.ZodString>;
    zoneId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    packageId: string;
    method: TopupMethod;
    gameUserId?: string | undefined;
    zoneId?: string | undefined;
}, {
    productId: string;
    packageId: string;
    method: TopupMethod;
    gameUserId?: string | undefined;
    zoneId?: string | undefined;
}>, {
    productId: string;
    packageId: string;
    method: TopupMethod;
    gameUserId?: string | undefined;
    zoneId?: string | undefined;
}, {
    productId: string;
    packageId: string;
    method: TopupMethod;
    gameUserId?: string | undefined;
    zoneId?: string | undefined;
}>;
export declare const InitiateKhqrSchema: z.ZodObject<{
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
}, {
    orderId: string;
}>;
export declare const InitiateBankSchema: z.ZodObject<{
    orderId: z.ZodString;
    bankCode: z.ZodEnum<["aba", "acleda", "wing", "chipmong"]>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    bankCode: "aba" | "acleda" | "wing" | "chipmong";
}, {
    orderId: string;
    bankCode: "aba" | "acleda" | "wing" | "chipmong";
}>;
export declare const InitiateCardSchema: z.ZodObject<{
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
}, {
    orderId: string;
}>;
