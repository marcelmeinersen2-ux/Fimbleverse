// Runtime validation at the server boundary. Even though forms validate
// client-side, we re-validate here — never trust the client (CLAUDE.md 7).
import { z } from 'zod';

export const expenseInput = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero').max(1_000_000),
  categoryId: z.string().uuid('Pick a category'),
  payerId: z.string().uuid('Pick who paid'),
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date'),
  description: z.string().max(200).default(''),
});
export type ExpenseInput = z.infer<typeof expenseInput>;

export const settlementInput = z.object({
  kind: z.enum(['payment', 'adjustment']),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.coerce.number().positive().max(1_000_000),
  note: z.string().max(200).default(''),
  settledOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine((v) => v.fromUserId !== v.toUserId, {
  message: 'Payment must be between two different people',
  path: ['toUserId'],
});
export type SettlementInput = z.infer<typeof settlementInput>;
