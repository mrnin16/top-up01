"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pricing_1 = require("./pricing");
describe('computeFee', () => {
    it('rounds to 2 decimal places', () => {
        expect((0, pricing_1.computeFee)(0.30)).toBe(0.01);
        expect((0, pricing_1.computeFee)(14.99)).toBe(0.30);
        expect((0, pricing_1.computeFee)(299.99)).toBe(6.00);
    });
    it('returns 0 for 0', () => {
        expect((0, pricing_1.computeFee)(0)).toBe(0);
    });
});
describe('computeTotal', () => {
    it('adds fee to subtotal', () => {
        expect((0, pricing_1.computeTotal)(14.99)).toBeCloseTo(15.29, 2);
        expect((0, pricing_1.computeTotal)(0.30)).toBeCloseTo(0.31, 2);
    });
});
describe('computeFeeCents', () => {
    it('rounds to nearest cent', () => {
        expect((0, pricing_1.computeFeeCents)(30)).toBe(1); // $0.30 → $0.01
        expect((0, pricing_1.computeFeeCents)(1499)).toBe(30); // $14.99 → $0.30
        expect((0, pricing_1.computeFeeCents)(29999)).toBe(600); // $299.99 → $6.00
    });
});
describe('computeTotalCents', () => {
    it('adds fee cents to subtotal cents', () => {
        expect((0, pricing_1.computeTotalCents)(1499)).toBe(1529);
        expect((0, pricing_1.computeTotalCents)(30)).toBe(31);
    });
});
//# sourceMappingURL=pricing.test.js.map