const FEE_RATE = 0.02;

/** fee = round(subtotal * 0.02, 2) */
export function computeFee(subtotalUSD: number): number {
  return Math.round(subtotalUSD * FEE_RATE * 100) / 100;
}

export function computeTotal(subtotalUSD: number): number {
  return Math.round((subtotalUSD + computeFee(subtotalUSD)) * 100) / 100;
}

/** Cents variant — avoids floating-point drift inside the API */
export function computeFeeCents(subtotalCents: number): number {
  return Math.round(subtotalCents * FEE_RATE);
}

export function computeTotalCents(subtotalCents: number): number {
  return subtotalCents + computeFeeCents(subtotalCents);
}
