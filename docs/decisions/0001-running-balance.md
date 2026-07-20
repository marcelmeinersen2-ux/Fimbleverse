# 0001 — One running balance instead of month-by-month settling

**Status:** Accepted · **Date:** 2026-07-19

## Context

The household's existing Excel sheet settles up per month, but real life leaks
across months: partial payments, a Revolut correction, cross-month debts
("owns from April", "glasses 1400"). These were patched by hand in cells because
the monthly model can't hold them.

## Decision

Model settling up as a single continuous all-time running balance. Three record
types feed it: expenses (split 50/50), payments, and one-off adjustments. The
balance is computed from these, never stored.

## Alternatives considered

- **Month-by-month like the sheet.** Rejected: it's the source of the current
  pain and needs carry-over logic to handle cross-month debts.
- **Per-expense custom splits.** Not needed; the sheet shows a strict 50/50.

## Consequences

- Simpler to build than carry-over months, and it ends manual corrections.
- Cross-month items are one-offs, so a single "adjustment" primitive suffices —
  no recurring-adjustment system.
- On import the balance needs a correct starting point; the household chose to
  start from even (the sheet's final "You are even" state), so history is kept
  as reference only and not imported.
