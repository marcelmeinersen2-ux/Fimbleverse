# Reference data

## expense-history-2025-2026.json

The parsed expense history from the original Google Sheet (Sep 2025 – Jun 2026),
cleaned during the import review:

- Payer derived from which amount column held the value (left = Ewa, right = Marcel).
- Categories normalised to the four real ones: food, bills, animals, other
  ("others" typo folded into "other").
- Malformed dates corrected ("22,01.2026" → 2026-01-22, "30.05.206" → 2026-05-30).

**This is reference only — it is not seeded into the app.** Per the decision on
2026-07-19, the household starts fresh from an even balance (the sheet's final
state was "You are even"), and the old sheet is kept as the archive. This file
exists so the history isn't lost and could be imported later if you ever want
long-run charts.

It contains no tokens, addresses, or private notes — only dates, amounts,
categories, and short descriptions.
