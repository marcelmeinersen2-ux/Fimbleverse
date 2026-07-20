-- Local development seed. FICTIONAL DATA ONLY (CLAUDE.md 8.6).
-- Real household history is never committed here.
--
-- Note: auth users are created via the Supabase CLI / dashboard in local dev.
-- This seed assumes two local test users exist and fills in household data.
-- Replace the UUIDs below with your local test users' ids, or run the
-- documented `supabase` auth signup steps in docs/operations/runbook.md.

-- Fictional test household.
insert into public.households (id, name, timezone, currency)
values ('00000000-0000-0000-0000-0000000000aa', 'Test household', 'Europe/Warsaw', 'PLN')
on conflict do nothing;

-- Seed the four real categories (names only — not sensitive).
insert into public.expense_categories (household_id, name, sort_order) values
  ('00000000-0000-0000-0000-0000000000aa', 'food',    1),
  ('00000000-0000-0000-0000-0000000000aa', 'bills',   2),
  ('00000000-0000-0000-0000-0000000000aa', 'animals', 3),
  ('00000000-0000-0000-0000-0000000000aa', 'other',   4)
on conflict do nothing;

-- A couple of fictional example expenses for local UI development.
-- (Requires test profiles to exist; see runbook. Left commented so the seed
-- runs cleanly before test users are created.)
-- insert into public.expenses (...) values (...);
