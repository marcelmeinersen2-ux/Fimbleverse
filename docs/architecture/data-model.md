# Data model

Every household-scoped table carries `household_id` and is protected by Row
Level Security that checks membership via `public.is_household_member()`. This
enforces household separation in the database, not just in queries
(CLAUDE.md 8.2).

## Tables

**households** — id, name, timezone (default Europe/Warsaw), currency (PLN).
**profiles** — one per auth user; display_name. Mirrors `auth.users.id`.
**household_members** — (household_id, user_id, role). Roles: member | admin.

**expense_categories** — per-household, editable. Seeded: food, bills, animals, other.
**expenses** — household_id, category_id, payer_id, amount, spent_on, description,
created_by. All shared; payer is a single field.
**settlements** — kind (payment | adjustment), from_user_id, to_user_id, amount,
note, settled_on. Moves the running balance.

## Running balance

Computed, not stored: `netOwedBy()` in `src/features/settlements/balance.ts`.
Each expense splits 50/50 (non-payer owes half); payments and adjustments move
the balance toward or away from even. Pure function, unit-tested.

## RLS ownership summary

| Table | Read | Insert | Update | Delete |
|-------|------|--------|--------|--------|
| profiles | own | own | own | — |
| households | members | — | admin | — |
| household_members | members | (invite flow, later) | — | — |
| expense_categories | members | members | members | members |
| expenses | members | members (created_by = self) | members | members |
| settlements | members | members (created_by = self) | — | members |

## RLS test matrix (to implement as integration tests, CLAUDE.md 8.3)

Household A member 1 & 2, Household B member 1, and an anonymous user — proving
A cannot read or write B's rows.
