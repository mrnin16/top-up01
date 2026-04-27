import { computeFee, computeTotal, computeFeeCents, computeTotalCents } from './pricing';

describe('computeFee', () => {
  it('rounds to 2 decimal places', () => {
    expect(computeFee(0.30)).toBe(0.01);
    expect(computeFee(14.99)).toBe(0.30);
    expect(computeFee(299.99)).toBe(6.00);
  });

  it('returns 0 for 0', () => {
    expect(computeFee(0)).toBe(0);
  });
});

describe('computeTotal', () => {
  it('adds fee to subtotal', () => {
    expect(computeTotal(14.99)).toBeCloseTo(15.29, 2);
    expect(computeTotal(0.30)).toBeCloseTo(0.31, 2);
  });
});

describe('computeFeeCents', () => {
  it('rounds to nearest cent', () => {
    expect(computeFeeCents(30)).toBe(1);     // $0.30 → $0.01
    expect(computeFeeCents(1499)).toBe(30);  // $14.99 → $0.30
    expect(computeFeeCents(29999)).toBe(600); // $299.99 → $6.00
  });
});

describe('computeTotalCents', () => {
  it('adds fee cents to subtotal cents', () => {
    expect(computeTotalCents(1499)).toBe(1529);
    expect(computeTotalCents(30)).toBe(31);
  });
});
