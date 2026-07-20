# Deployment

Environments: local · PR preview · production. Every PR gets a Vercel preview.

## Environment variables

Set separately per environment. Never commit real values (see `.env.example`).

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser-safe.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, secret; used only where RLS +
  authenticated access can't solve the need (currently: not used).

## Production release checklist (CLAUDE.md 14)

1. CI passing.
2. Preview reviewed.
3. Migrations tested from a clean DB.
4. New env vars present in production.
5. Security/privacy reviewed.
6. Error monitoring ready for the changed area.
7. Rollback path exists.
8. Plain-language release summary written.
9. **Explicit production approval given** (CLAUDE.md 24).

Production deploys, manual production migrations, and destructive SQL all
require explicit approval each time.
