"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFee = computeFee;
exports.computeTotal = computeTotal;
exports.computeFeeCents = computeFeeCents;
exports.computeTotalCents = computeTotalCents;
const FEE_RATE = 0.02;
/** fee = round(subtotal * 0.02, 2) */
function computeFee(subtotalUSD) {
    return Math.round(subtotalUSD * FEE_RATE * 100) / 100;
}
function computeTotal(subtotalUSD) {
    return Math.round((subtotalUSD + computeFee(subtotalUSD)) * 100) / 100;
}
/** Cents variant — avoids floating-point drift inside the API */
function computeFeeCents(subtotalCents) {
    return Math.round(subtotalCents * FEE_RATE);
}
function computeTotalCents(subtotalCents) {
    return subtotalCents + computeFeeCents(subtotalCents);
}
//# sourceMappingURL=pricing.js.map