import { describe, it, expect } from 'vitest';
import { netOwedBy, describeBalance } from '@/features/settlements/balance';

const EWA = 'ewa';
const MARCEL = 'marcel';

describe('netOwedBy', () => {
  it('is zero with no activity', () => {
    expect(netOwedBy(MARCEL, EWA, [], [])).toBe(0);
  });

  it('non-payer owes half of an expense', () => {
    // Ewa paid 100 → Marcel owes 50.
    const net = netOwedBy(MARCEL, EWA, [{ payerId: EWA, amount: 100 }], []);
    expect(net).toBe(50);
  });

  it('payer is owed half (negative from their side)', () => {
    // Marcel paid 100 → Marcel is owed 50 → net owed BY Marcel is -50.
    const net = netOwedBy(MARCEL, EWA, [{ payerId: MARCEL, amount: 100 }], []);
    expect(net).toBe(-50);
  });

  it('nets multiple expenses on both sides', () => {
    // Ewa 200 (Marcel owes 100), Marcel 80 (Marcel owed 40) → 60.
    const net = netOwedBy(MARCEL, EWA, [
      { payerId: EWA, amount: 200 },
      { payerId: MARCEL, amount: 80 },
    ], []);
    expect(net).toBe(60);
  });

  it('a payment reduces what the payer owes', () => {
    // Marcel owes 100, then pays Ewa 100 → even.
    const net = netOwedBy(MARCEL, EWA,
      [{ payerId: EWA, amount: 200 }],
      [{ fromUserId: MARCEL, toUserId: EWA, amount: 100 }],
    );
    expect(net).toBe(0);
  });

  it('an adjustment in the other direction increases the balance', () => {
    // Even, then adjustment: Marcel owes Ewa 1400 (glasses).
    const net = netOwedBy(MARCEL, EWA, [],
      [{ fromUserId: EWA, toUserId: MARCEL, amount: 1400 }]);
    // Ewa "paid toward" Marcel? Direction: from Ewa to Marcel means Ewa gave
    // Marcel value, so Marcel owes more.
    expect(net).toBe(1400);
  });

  it('rounds to two decimals', () => {
    const net = netOwedBy(MARCEL, EWA, [{ payerId: EWA, amount: 33.33 }], []);
    expect(net).toBe(16.67);
  });

  it('is symmetric: what one owes, the other is owed', () => {
    const expenses = [
      { payerId: EWA, amount: 540 },
      { payerId: MARCEL, amount: 276 },
    ];
    const marcelSide = netOwedBy(MARCEL, EWA, expenses, []);
    const ewaSide = netOwedBy(EWA, MARCEL, expenses, []);
    expect(marcelSide).toBe(-ewaSide);
  });
});

describe('describeBalance', () => {
  it('says even at zero', () => {
    expect(describeBalance('Marcel', 'Ewa', 0)).toBe('You are even');
  });
  it('phrases a positive balance as subject owing', () => {
    expect(describeBalance('Marcel', 'Ewa', 50)).toBe('Marcel owes Ewa 50.00 zł');
  });
  it('phrases a negative balance as the other owing', () => {
    expect(describeBalance('Marcel', 'Ewa', -50)).toBe('Ewa owes Marcel 50.00 zł');
  });
});
