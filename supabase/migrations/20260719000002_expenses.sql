-- Expenses + settlements: the first household feature.
-- Model per docs/product/backlog.md 1: expenses (50/50) and settlements
-- (payment | adjustment) all feed one continuous running balance.

-- ── categories ────────────────────────────────────────────────────────
-- Per-household, editable. Seeded with the four real categories from the
-- historical sheet (food, bills, animals, other).
create table public.expense_categories (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name         text not null,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now(),
  unique (household_id, name)
);

create index expense_categories_household_idx
  on public.expense_categories (household_id);

-- ── expenses ──────────────────────────────────────────────────────────
-- All expenses are shared household spending. Payer is a single field
-- (the sheet's two-column trick collapses to this).
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  category_id  uuid not null references public.expense_categories (id),
  payer_id     uuid not null references public.profiles (id),
  amount       numeric(12,2) not null check (amount > 0),
  spent_on     date not null,
  description  text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid not null references public.profiles (id)
);

create index expenses_household_date_idx
  on public.expenses (household_id, spent_on desc);
create index expenses_category_idx on public.expenses (category_id);

-- ── settlements ───────────────────────────────────────────────────────
-- payment:    "X paid Y" — moves the balance back toward even.
-- adjustment: a one-off manual correction (glasses, Revolut) with a note.
create type public.settlement_kind as enum ('payment', 'adjustment');

create table public.settlements (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  kind         public.settlement_kind not null,
  -- Who paid whom. For a payment, from_user hands money to to_user.
  -- For an adjustment, direction still says who owes whom the amount.
  from_user_id uuid not null references public.profiles (id),
  to_user_id   uuid not null references public.profiles (id),
  amount       numeric(12,2) not null check (amount > 0),
  note         text not null default '',
  settled_on   date not null,
  created_at   timestamptz not null default now(),
  created_by   uuid not null references public.profiles (id),
  check (from_user_id <> to_user_id)
);

create index settlements_household_date_idx
  on public.settlements (household_id, settled_on desc);

-- ── updated_at trigger for expenses ───────────────────────────────────
create trigger expenses_touch before update on public.expenses
  for each row execute function public.touch_updated_at();

-- ── RLS: every table scoped to household membership ───────────────────
alter table public.expense_categories enable row level security;
alter table public.expenses            enable row level security;
alter table public.settlements         enable row level security;

-- expense_categories
create policy categories_select on public.expense_categories
  for select using (public.is_household_member(household_id));
create policy categories_insert on public.expense_categories
  for insert with check (public.is_household_member(household_id));
create policy categories_update on public.expense_categories
  for update using (public.is_household_member(household_id))
             with check (public.is_household_member(household_id));
create policy categories_delete on public.expense_categories
  for delete using (public.is_household_member(household_id));

-- expenses: any member may read/add; edits and deletes limited to members.
create policy expenses_select on public.expenses
  for select using (public.is_household_member(household_id));
create policy expenses_insert on public.expenses
  for insert with check (
    public.is_household_member(household_id) and created_by = auth.uid()
  );
create policy expenses_update on public.expenses
  for update using (public.is_household_member(household_id))
             with check (public.is_household_member(household_id));
create policy expenses_delete on public.expenses
  for delete using (public.is_household_member(household_id));

-- settlements
create policy settlements_select on public.settlements
  for select using (public.is_household_member(household_id));
create policy settlements_insert on public.settlements
  for insert with check (
    public.is_household_member(household_id) and created_by = auth.uid()
  );
create policy settlements_delete on public.settlements
  for delete using (public.is_household_member(household_id));
