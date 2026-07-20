-- Foundation: households, membership, profiles.
-- Establishes the tenancy model and RLS boundary that every later table builds on.
-- See docs/architecture/data-model.md and CLAUDE.md sections 8 and 9.

-- ── Extensions ────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── households ────────────────────────────────────────────────────────
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Our household',
  -- Timezone is configurable per household (CLAUDE.md 1). Warsaw by default.
  timezone    text not null default 'Europe/Warsaw',
  currency    text not null default 'PLN',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── profiles ──────────────────────────────────────────────────────────
-- One row per auth user. Mirrors auth.users id.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── household_members ─────────────────────────────────────────────────
-- Which user belongs to which household, and their role.
-- Roles kept deliberately simple for a two-person household (CLAUDE.md 9).
create type public.household_role as enum ('member', 'admin');

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  role         public.household_role not null default 'member',
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index household_members_user_idx on public.household_members (user_id);

-- ── Membership helper ─────────────────────────────────────────────────
-- SECURITY DEFINER function to test membership without recursive RLS.
-- Used by policies on every household-scoped table.
create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.user_id = auth.uid()
  );
$$;

-- ── updated_at trigger ────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger households_touch before update on public.households
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.households        enable row level security;
alter table public.profiles          enable row level security;
alter table public.household_members enable row level security;

-- profiles: a user sees and edits only their own profile.
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

-- households: visible only to members.
create policy households_select_member on public.households
  for select using (public.is_household_member(id));
-- Only admins may rename / change settings.
create policy households_update_admin on public.households
  for update using (
    exists (select 1 from public.household_members hm
            where hm.household_id = id and hm.user_id = auth.uid()
              and hm.role = 'admin')
  );

-- household_members: a user sees membership rows of households they belong to.
create policy household_members_select on public.household_members
  for select using (public.is_household_member(household_id));
