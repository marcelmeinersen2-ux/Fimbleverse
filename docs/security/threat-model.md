# Threat model (initial)

Scope: auth, household isolation, expense/settlement data. Expands as calendar
and uploads land (CLAUDE.md 16.4).

**Assets:** household spending records, member identities, session cookies.
**Trust boundaries:** browser ↔ server actions ↔ Postgres (RLS). Secrets stay
server-side.
**Primary abuse case:** one household reading/modifying another's data.
**Mitigation:** RLS on every table via `is_household_member()`; server-side
auth resolution (never inferred from client/email); Zod validation at the
server boundary; created_by pinned to `auth.uid()` on insert.
**Residual risk:** RLS policies need integration tests across the A/B/anon
matrix (tracked in data-model.md) before production launch.

**Logging:** no tokens, cookies, or full personal request bodies are logged
(CLAUDE.md 16.2).
