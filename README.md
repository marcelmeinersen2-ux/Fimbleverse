# Household

A private, calm app for two people to share home life — starting with shared
expense tracking and settling up. Built for Marcel and Ewa.

See `CLAUDE.md` for the full project charter and `docs/product/backlog.md` for
the roadmap.

## Stack

Next.js (App Router) · TypeScript (strict) · Supabase (Postgres, Auth, RLS) ·
Tailwind · Zod · Vitest. Hosted on Vercel.

## What's built so far

- Foundation: households, membership, profiles, with Row Level Security proving
  one household can't read another's data.
- Passwordless (magic-link) sign in.
- Expenses: add and list shared expenses across four categories
  (food, bills, animals, other).
- Balance: a single running "who owes whom" figure, split 50/50, shown as a
  plain sentence. Starts from an even balance.
- Settlements model (payments + one-off adjustments) in the schema; recording
  UI is next.

## Getting started

Prerequisites: Node 20, pnpm 9.12, the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
pnpm install
cp .env.example .env.local          # fill in local Supabase values
supabase start                      # boots local Postgres + Auth
supabase db reset                   # applies migrations + seed
pnpm db:types                       # regenerate src/types/database.ts
pnpm dev                            # http://localhost:3000
```

`supabase start` prints your local `NEXT_PUBLIC_SUPABASE_URL` and anon key —
put those in `.env.local`.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test        # includes the running-balance unit tests
pnpm build
```

## Layout

- `src/app` — routes (`(auth)` sign in, `(app)` the signed-in shell)
- `src/features` — domain modules (`expenses`, `settlements`, `household`)
- `src/lib` — `auth`, `database`, `validation`, `utils`
- `src/server` — server actions
- `supabase/migrations` — schema + RLS (system of record for structure)
- `docs/` — product, architecture, decisions, security, operations
- `reference/` — the parsed historical sheet (not imported; kept as archive)

## Deployment

See `docs/operations/deployment.md`. Production deploys require the release
checklist and explicit approval (`CLAUDE.md` 14, 24).
