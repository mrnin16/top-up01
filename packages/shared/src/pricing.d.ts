/** fee = round(subtotal * 0.02, 2) */
export declare function computeFee(subtotalUSD: number): number;
export declare function computeTotal(subtotalUSD: number): number;
/** Cents variant — avoids floating-point drift inside the API */
export declare function computeFeeCents(subtotalCents: number): number;
export declare function computeTotalCents(subtotalCents: number): number;
