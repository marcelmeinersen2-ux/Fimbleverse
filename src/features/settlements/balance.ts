// Running-balance computation: the single source of truth for "who owes whom".
//
// Convention: a positive balance means the FIRST user (by id order passed in)
// owes the SECOND. We keep it direction-neutral by returning a signed number
// relative to a named reference user, so the UI can phrase it plainly.
//
// Every expense is split 50/50: the payer covers the whole amount, so the
// non-payer owes half. Settlements move the balance back toward zero.
// This is a pure function — no I/O — so it is cheap to unit-test (CLAUDE.md 17).

export type PayerRef = string; // user id

export interface ExpenseInput {
  payerId: PayerRef;
  amount: number;
}

export interface SettlementInput {
  fromUserId: PayerRef; // who handed over money / who owes, per direction
  toUserId: PayerRef;
  amount: number;
}

/**
 * Net amount that `subjectId` owes the other member.
 * Positive  → subject owes the other person.
 * Negative  → the other person owes the subject.
 * Zero      → even.
 */
export function netOwedBy(
  subjectId: PayerRef,
  otherId: PayerRef,
  expenses: ExpenseInput[],
  settlements: SettlementInput[],
): number {
  let balance = 0;

  for (const e of expenses) {
    const half = e.amount / 2;
    if (e.payerId === otherId) {
      // Other paid; subject owes half.
      balance += half;
    } else if (e.payerId === subjectId) {
      // Subject paid; other owes half → reduces what subject owes.
      balance -= half;
    }
    // Expenses paid by neither (shouldn't happen in a 2-person household)
    // are ignored.
  }

  for (const s of settlements) {
    // If subject paid the other, subject owes less.
    if (s.fromUserId === subjectId && s.toUserId === otherId) {
      balance -= s.amount;
    } else if (s.fromUserId === otherId && s.toUserId === subjectId) {
      balance += s.amount;
    }
  }

  return Math.round(balance * 100) / 100;
}

/** Plain-language phrasing for the UI. */
export function describeBalance(
  subjectName: string,
  otherName: string,
  net: number,
): string {
  if (net === 0) return 'You are even';
  if (net > 0) return `${subjectName} owes ${otherName} ${net.toFixed(2)} zł`;
  return `${otherName} owes ${subjectName} ${Math.abs(net).toFixed(2)} zł`;
}
