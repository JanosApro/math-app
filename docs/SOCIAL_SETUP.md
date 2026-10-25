# Social layer — setup

The social layer is **optional**. Without a Supabase project the math app works exactly as
before: the Friends screen shows “not configured” and no network calls are made.

Read `docs/SOCIAL_PRIVACY.md` before enabling this for students. It lists the child-consent,
retention and deletion points that need a real privacy review before launch.

## 1. Create the Supabase project

1. Create a project at <https://supabase.com>.
2. **Authentication → Providers → Anonymous sign-ins** → enable.
   (No email, phone or real name is required.)
3. Copy the **Project URL** and the **anon public** key from **Project Settings → API**.
   Never copy the `service_role` key into the frontend or into a `VITE_` variable.

## 2. Local configuration

```bash
cp .env.example .env
# edit .env:
# VITE_SUPABASE_URL=https://<project-ref>.supabase.co
# VITE_SUPABASE_ANON_KEY=<anon public key>
npm install
npm run dev
```

The app builds without these variables; the social screen simply stays disabled.

### GitHub Pages build

The published site is built by `.github/workflows/deploy-pages.yml`. Add the two values as
**repository Actions variables** (Settings → Secrets and variables → Actions → Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not add the `service_role` key there. If the variables are missing, the deployed app simply
keeps the Friends tab disabled; the math app is unaffected.

## 3. Database migration

The version-controlled migration is:

```
supabase/migrations/202610250001_social_layer.sql
```

It creates:

- `profiles` (pseudonymous profile, friend code, recovery hash, shared XP/streak),
- `friendships` (pending / accepted),
- `xp_events` (fixed server-side XP awards with idempotency keys),
- `activity_days` (server-computed streak),
- `user_badges` (server-awarded badges),
- `recovery_attempts` (rate limit for account recovery),
- RLS policies, least-privilege column grants, and all SECURITY DEFINER RPCs.

Apply it with the Supabase CLI:

```bash
npm install -g supabase          # once
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

If the repository has no `supabase/config.toml` yet, run `supabase init` once before
`supabase link`. Do not commit `.env`, `supabase/.temp` or local branch files.

## 4. Edge Functions

Two functions use the service-role key **only on the server**:

- `delete-account` — deletes the caller's auth user; all social rows cascade.
- `recover-account` — verifies the recovery code and migrates the old anonymous identity to the
  new anonymous session, then deletes the old auth user.

Deploy them:

```bash
supabase functions deploy delete-account
supabase functions deploy recover-account
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are normally available to Edge Functions automatically.
If your project does not inject them, set them as secrets too. The service-role key must never
appear in `src/`, `.env`, or any `VITE_` variable.

## 5. Verify

```bash
npm run test:social     # pure client outbox/code/event-key tests
npm run check           # type check + content validation
npm run build           # production build
supabase test db        # RLS/RPC tests (requires a local Supabase stack)
```

The SQL security test is `supabase/tests/social_security.test.sql`. It checks that a user sees
only their own rows, that the friends-only leaderboard does not include strangers, and that the
service-role-only recovery RPC cannot be called by a normal user.

## 6. What the student sees

- **Friends → Barátok bekapcsolása** creates an anonymous Supabase user and a pseudonymous profile.
- The first time, a **recovery code** is shown. It is the only way to recover the social account on
  a new device; there is no email recovery. The code is stored only as a bcrypt hash server-side.
- The profile has a random **friend code**, a nickname and an emoji avatar. No real name, email,
  phone number, contacts, location or messages are collected.
- Friends are added by exact friend code; requests must be accepted. Only accepted friends can see
  XP, streak and badges and appear in the weekly leaderboard.
- **Barátok kikapcsolása** hides the profile and stops XP sync. **Barátfiók törlése** deletes the
  auth user and all social rows. Local math progress stays in the browser.

## 7. Security model (short)

- RLS on every exposed table; direct access is read-only and own-row only.
- Friends-only data is returned by SECURITY DEFINER functions that check `auth.uid()` and an
  accepted friendship.
- XP, streak and badge writes happen only in `award_xp` / `refresh_streak` / `award_badges`.
  The client sends a **type + idempotency key**, never an amount.
- Fixed awards, unique `(user_id, event_key)`, daily type caps, a daily total cap and a per-minute
  rate limit prevent duplicate awards and basic leaderboard cheating.
- The weekly leaderboard is computed from `xp_events` for the current ISO week, not from a
  client-supplied score.
- The service-role key is used only by the two Edge Functions.

## 8. Known limitations

- **Local gameplay cannot be fully verified server-side.** A determined client can invent event
  keys. The fixed amounts and caps limit the damage; the leaderboard is friends-only. A fully
  cheat-proof design would require moving question generation/answer checking to the server,
  which would conflict with the offline-first math app.
- **Shared XP starts when social is enabled.** Existing local XP/streak is not uploaded; this is
  deliberate (the server cannot verify historical local data). The screen says so.
- **Recovery is code-based.** If the recovery code is lost and the device is lost, the social
  account cannot be recovered. The local math progress can still be restored from the export file.
- **No public profiles, messaging, contact import or global leaderboard** — by design.
