# ORTA Studio MVP

Minimal Next.js + Supabase implementation of the approved ORTA Studio product flow: public studio pages, quote intake, secure project tracking, customer project workspace, and a simple admin dashboard.

## Stack

- Next.js 16 + React 19
- TypeScript
- Supabase Postgres, Auth, and private Storage
- Manrope (self-hosted package)
- Phosphor icons
- Vercel-ready runtime

The public and workspace screens use the Next.js Pages Router. Server APIs use Next.js App Route Handlers. This keeps the browser UI fully interactive while retaining server-only Supabase operations.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase credentials, development runs against the included demo project data. Demo mode is not enabled automatically in production.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/202608060001_orta_mvp.sql` in the Supabase SQL editor or with the Supabase CLI.
3. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it to the browser)
4. Create the ORTA admin user in Supabase Auth, then authorize that user's UUID:

```sql
insert into public.admin_users (user_id)
values ('YOUR-AUTH-USER-UUID');
```

Project files are stored in the private `project-files` bucket. Customer downloads use short-lived signed URLs.

## Secure customer access

- `ORTA-260001`-style Project IDs are display/lookup IDs only; they are never used as access credentials.
- Initial customer links use 32-byte random tokens. Only SHA-256 hashes are stored on the project row.
- Tracking-link resends generate separate 24-hour access tokens, so requesting a new link does not invalidate the customer's original link.
- Resend requests have a two-minute per-project cooldown.
- The resend response is intentionally non-enumerating: it does not reveal whether a Project ID exists.

## Email delivery

Quote confirmations and tracking-link resends are queued in `notification_outbox`. Before production launch, connect a transactional email worker/provider to that table. The worker should build the secure customer URL from the queued token, send it to `recipient`, mark the row `sent`, set `processed_at`, and remove the raw token from `payload` after successful delivery.

No email vendor is hard-coded in this MVP because none was selected for the project.

## Main routes

- `/` — Home
- `/services` — Services
- `/request` — Request a Quote
- `/tracking` — Project Tracking
- `/project/[token]` — secure Customer Project
- `/admin/login` — Admin sign-in
- `/admin` — Admin Dashboard
- `/admin/projects/[code]` — Project Details

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

The visual QA record is in `design-qa.md`.

## Vercel

Import the repository into Vercel, add the three Supabase environment variables, apply the database migration, and configure the email worker before production traffic is enabled. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
