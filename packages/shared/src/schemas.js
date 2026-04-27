"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitiateCardSchema = exports.InitiateBankSchema = exports.InitiateKhqrSchema = exports.CreateOrderSchema = exports.ValidateAccountSchema = exports.OtpVerifySchema = exports.OtpSendSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const enums_js_1 = require("./enums.js");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(8).optional(),
    name: zod_1.z.string().min(1).max(80),
    password: zod_1.z.string().min(8).max(128),
}).refine(d => d.email || d.phone, { message: 'email or phone required' });
exports.LoginSchema = zod_1.z.object({
    emailOrPhone: zod_1.z.string().min(3),
    password: zod_1.z.string().min(1),
});
exports.OtpSendSchema = zod_1.z.object({
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
}).refine(d => d.phone || d.email, { message: 'phone or email required' });
exports.OtpVerifySchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    code: zod_1.z.string().length(6),
});
exports.ValidateAccountSchema = zod_1.z.object({
    gameUserId: zod_1.z.string().min(6),
    zoneId: zod_1.z.string().min(3),
});
exports.CreateOrderSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    packageId: zod_1.z.string().cuid(),
    method: zod_1.z.nativeEnum(enums_js_1.TopupMethod),
    gameUserId: zod_1.z.string().min(6).optional(),
    zoneId: zod_1.z.string().min(3).optional(),
}).superRefine((d, ctx) => {
    if (d.method === enums_js_1.TopupMethod.DIRECT && (!d.gameUserId || !d.zoneId)) {
        ctx.addIssue({ code: 'custom', message: 'gameUserId and zoneId required for DIRECT' });
    }
});
exports.InitiateKhqrSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid(),
});
exports.InitiateBankSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid(),
    bankCode: zod_1.z.enum(['aba', 'acleda', 'wing', 'chipmong']),
});
exports.InitiateCardSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid(),
});
//# sourceMappingURL=schemas.js.map