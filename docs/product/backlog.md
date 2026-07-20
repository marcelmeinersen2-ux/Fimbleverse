# Product Backlog & Roadmap

_Household app for Marcel and Ewa. This document records what we're building, in what order, and — just as importantly — what we're deliberately **not** building yet and why._

Items are ordered using the decision framework in `CLAUDE.md` §5: household value → privacy/security risk → frequency of use → coordination reduction → UX quality → reliability → effort → extensibility.

**Status legend:**

- **Committed** — agreed, will be built. Ordered by build sequence.
- **Planned** — agreed for the roadmap, not yet scheduled in detail.
- **Earmarked** — likely valuable, but should prove real demand before we build it.
- **Parked (with conditions)** — intentionally not built. The conditions under which we'd revisit are recorded so future-us doesn't re-litigate from scratch.

---

## Household context

- Two-person household: **Marcel** and **Ewa**, equal participants.
- Timezone: **Europe/Warsaw** (configurable per household/user per `CLAUDE.md` §1).
- Currency: **PLN only** (no conversion needed for now).
- Expense categories (from real sheet): **food, bills, animals, other**.
- Expenses split **50/50**; settling up via a single all-time running balance.
- Both use **Google Calendar**.
- Location currently shared personally via Google Maps and Apple Find My (see Parked items — not integrable).

---

## 0. Foundation (Committed — must come first)

Per `CLAUDE.md` §25, no household features ship before the foundation is safe.

- Next.js + TypeScript + Supabase project setup.
- Supabase Auth; two-person household + membership model.
- Row Level Security proving Household A cannot read Household B's data.
- Mobile-first navigation and semantic design tokens.
- Simple household home screen.
- GitHub PR checks, Vercel preview deployments, `.env.example`.

**Why first:** everything below depends on auth, household isolation, and deployment safety being proven.

---

## Committed features

### 1. Shared expense tracking + settling up

**Problem:** Marcel and Ewa track who spent what, when, on what, and in which category — currently in a per-month Excel sheet. They want it shared, mobile-first, and less manual. The current sheet also handles _settling up_, but does so awkwardly: debts leak across months and are patched by hand.

**What the real sheet (Sep 2025 – Jun 2026) told us:**

- One tab per month. Each row: date, description, category, amount — where **payer is encoded by which of two columns the amount sits in** (left = Ewa, right = Marcel). In the app this collapses to a single `payer` field.
- Exactly **four categories: food, bills, animals, other** (sheet has "other"/"others" typos — a category table fixes this permanently).
- Every month has a settle-up block at a strict **50/50 split** ("Marcel should pay Ewa X"). Confirms the 50/50 default.
- **Settlement is its own beast.** May/June show partial payments ("paid 2500, left 1371.5"), a Revolut correction (5600), and cross-month debts ("Marcel owns from April", "Ewa owns for glasses 1400"). The month-by-month model can't hold these, so they're written into cells by hand. **This is the actual pain to solve.**

**Model — two layers, one balance, three record types:**

1. **Expenses** (clean part): each row → `{date, payer, amount (PLN), category, description}` + `household_id/created_at/created_by`. Shared data, no per-expense visibility rules. Shifts the running balance by half (50/50).
2. **Settlements** (the structure the sheet lacks):
   - **Payment** — "Marcel paid Ewa X" — shifts balance back.
   - **Adjustment** — a one-off manual correction (glasses, Revolut) with a note — shifts balance by a stated amount.

**Settle-up decision (agreed): one continuous running balance**, all-time, not month-by-month. One number = what one owes the other right now. Monthly category views still exist; settling is just decoupled from the calendar. Cross-month items are **one-offs**, so no recurring-adjustment system is needed — the single "adjustment" primitive absorbs every correction in the sheet.

- PLN only.
- Categories seeded from real data (food, bills, animals, other), editable without code changes.
- Mobile add-expense form: amount, category, who paid, date (defaults to today), short description.
- Views: filterable list (month/category/payer), per-category monthly totals, and the current running balance.

**Import path for existing history — with caveats to handle, not guess:**
- Malformed dates in a few rows ("22,01.2026", "30.06.206").
- "other"/"others" typo → normalize to `other`.
- A few months where category totals don't perfectly reconcile.
- Reconstruct the running balance from all expenses + noted payments/corrections, land on **one current figure, and show it to Marcel and Ewa to sanity-check against where they think they stand before going live.** Do not assert correctness.

**Why first feature:** self-contained, no external providers, usable fast, ends the spreadsheet pain directly, and its "shared record with a category + household boundary" shape is the reusable foundation for bills, shopping, and documents (a justified abstraction per `CLAUDE.md` §5).

---

### 2. Calendar coordination (Google Calendar)

**Problem:** Coordinate both calendars in-app so events (travel, doctor's appointments, ad-hoc plans) can be written into both people's calendars.

- Each person connects **their own** Google Calendar via the **app's own OAuth** — not Claude's MCP access (MCP is dev-time only per `CLAUDE.md` §10.1).
- Scopes: read + create/update/delete events (write is the point).
- Combined view of both calendars + free/busy for finding open slots.
- Each personal calendar defaults to **free/busy**, with a one-tap "share full details with household" toggle. Capability for full detail is built; full visibility is a **choice each person makes**, not a hardcoded default (`CLAUDE.md` §10.5).
- Event creation: Claude drafts (title, date/time, Europe/Warsaw timezone, target calendars) → shows exactly what lands where → explicit confirmation → write. Every write confirmed; retries idempotent (no duplicate events).
- Always-visible "last synced" status and disconnect control.
- Neither person can change the other's calendar connection or privacy settings.

**Why second:** OAuth, token encryption, and sync are genuinely more involved than expenses. Higher privacy surface.

---

### 3. Quick add

**Problem:** Nearly every feature reduces to _capturing something fast on a phone_ — an expense, a list item, a note, an event.

- One consistent fast-capture entry point on the home screen.
- Routes to the right target (expense / shopping item / note / event) with minimal taps.

**Why committed, sequenced after home screen exists:** it's a cross-cutting affordance that multiplies the daily usefulness of every other feature. Build once there are ≥2 things worth quick-adding.

---

### 4. Who's home / away

**Problem:** For a couple, the real question is "is my partner around today / travelling this week" — not a live map dot.

- **Derived from calendars** (travel/away events) plus an optional one-tap manual "I'm out" status.
- No live location tracking. No third-party location scraping.
- Lightweight read on top of the calendar feature.

**Why committed:** cheap (mostly a read over calendar data), genuinely useful for a couple, and sidesteps the privacy minefield of live location entirely.

---

### 5. Embedded maps for places

**Problem:** Travel destinations and appointment addresses are clearer with a map.

- Embed maps for a **place** (trip destination, doctor's address, restaurant) — legitimate and clean.
- Rides along with travel/appointment events.
- **Not** live person-location (see Parked).

**Why committed:** low effort, real clarity for the travel/appointment flows already being built.

---

### 6. Cat feeding log

**Problem:** Marcel and Ewa share cat-feeding duty. Both need to see at a glance whether the cats have already been fed today — so nobody double-feeds and nobody has to ask.

- **Smallest lovable version:** today's feeding status as a fast checkbox — fed / not yet — visible to both, shared household data.
- Capture **what they got** (e.g. which food) and **whether they had a snack**, kept lightweight — a quick tap, not a form.
- Surfaces on the home screen and via **quick add** (feature 3); a natural quick-capture target.
- Pairs with the existing **"animals" expense category** for cat-related spending, but is a separate _daily log_ — not an expense and not a reminder.
- **Deliberately minimal history.** Today's status is the point. No streaks, no charts, no gamification (`CLAUDE.md` §3.4). A short recent history (e.g. last few days) only if it proves useful.

**Why committed:** touched daily, reduces a real coordination question between two people, tiny surface area, no external providers or privacy weight. One of the cheapest high-frequency wins available.

---

## Planned features

Agreed for the roadmap; detailed specs to follow. Rough priority order.

### 7. Recurring bills & subscriptions

- Handles _upcoming_ money (rent, utilities, Netflix, insurance) vs. expenses' _past_ money.
- Shares the expense data model; due dates + rhythm.
- Answers "what's leaving our account this month" without either person holding it in their head.
- **Low effort once expenses exist; high daily calm.**

### 8. Shared shopping / grocery list

- List on phone, check off in store, optionally turn a completed shop into an expense entry.
- Ties to the existing "grocery" expense category.
- **Highest-frequency feature** (touched several times a week) — strong daily-use driver, mobile-first.

### 9. Household tasks & chores

- **Not** a corporate project board (`CLAUDE.md` §15 explicitly warns against this).
- Light "who's handling X" + simple recurring items (bins Tuesday, water plants).
- **Must stay quiet, simple, and non-blame-oriented** (equal-participation principle). Build only if it can stay calm.

### 10. Documents & important info

- Shared reference shelf: insurance, warranties, passport expiry, wifi password.
- **Includes car/home maintenance dates** (service due, inspection, boiler check) as a category here rather than a separate feature.
- Storage + privacy weight (uploads, file-type validation, per-item visibility) — build once foundation is proven.

### 11. Notes & reminders for each other

- Lightweight shared notes/reminders.
- Most valuable when **attached to something else** (a reminder on a bill, an appointment) rather than standalone — phones already do plain reminders well.
- Pet care (vet dates, medication) is intended to be served by **reminders + calendar + the "animals" expense category**, not a dedicated pet module.

---

## Earmarked (prove demand first)

Likely valuable, but should be wished-for in practice before we build them.

### Simple meal planning

- **Only if kept dead simple:** seven "what are we eating" slots, where a planned meal can push items onto the shopping list. Not a recipe database.
- Value: kills the daily "what's for dinner" negotiation.
- **Condition to build:** the shopping list ships and both actually use it.

### Household home dashboard

- A calm home screen surfacing "next appointment, this week's spending, open shopping items."
- **Condition to build:** there are enough features producing data worth summarizing (naturally a later step).

### Budgets / spending limits per category

- "Keep groceries under X."
- **Condition to build:** several months of real expense history exist to set sane limits — and it must avoid the anxious-dashboard feeling (`CLAUDE.md` §15).

---

## Parked (with conditions)

Intentionally not built. Recorded so we remember _why_, not just _that_.

### Live shared location (from Find My / Google Maps) — WILL NOT BUILD as described

- **Apple Find My has no public API.** Reading it requires scraping (fragile, against terms) or Apple credentials (security nonstarter, forbidden by `CLAUDE.md` §16). Not buildable responsibly.
- **Google Maps location sharing** has no clean official API for reading each other's live position. Same problem class.
- **The only clean alternative** (not yet chosen): the app becomes its _own_ location source — phones opt in to share device geolocation _with the app directly_, explicit and revocable, encrypted, off by default, both people consenting.
- **Condition to revisit:** the calendar-derived "who's home/away" view (feature 4) turns out not to be enough, AND both Marcel and Ewa explicitly want app-as-location-source with full opt-in. Never on by default.

### Bank / financial automation — WILL NOT BUILD

- Connecting a real bank / auto-importing transactions. Large privacy + security surface, ongoing risk. Manual entry is fine for two people (trust over cleverness, `CLAUDE.md` §3.6).
- **Condition to revisit:** none anticipated.

### Gamification / streaks / points — WILL NOT BUILD

- Violates calm-technology and no-manipulation principles (`CLAUDE.md` §3.4). Skip entirely.

### Social / multi-household / guest access — WILL NOT BUILD

- Building for these two people only; don't generalize to hypothetical users (`CLAUDE.md` §5).
- **Condition to revisit:** a concrete real use case appears (e.g. childcare access), specced properly at that time.

---

## Suggested build sequence

1. **Foundation** (§0)
2. **Expenses** (blocked on Excel sheet)
3. **Calendar coordination**
4. **Quick add** (once home screen + ≥2 capture targets exist)
5. **Who's home/away** + **embedded maps** (ride on calendar)
6. **Cat feeding log** (cheap, daily-use, can slot in early — a good first quick-add target)
7. Then **bills** and **shopping list** as the next planned pair
7. Remaining planned features as they earn priority; earmarked features only on demonstrated demand

**Governing rule (`CLAUDE.md` §26):** the project succeeds when both Marcel and Ewa trust it and naturally choose to use it — not when it has the most features.

---

_Last updated: 2026-07-19_
