# Bug reports ("Hiba jelzése")

Students report problems with a flag button (⚑) in the top bar of every lesson, mini test and
daily challenge, or with the **Hibát találtam** link at the bottom of the settings screen. They
pick what is wrong (wrong task/solution, something does not work, other) and may write a few
words. They never see any report, their own or anyone else's.

Reports go to the same Supabase project as the friends feature (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`). No sign-in is needed, and the friends feature can stay off.

## Setup

Apply the migration `supabase/migrations/202611010001_bug_reports.sql`, after the social-layer
migration: `supabase db push` applies both, or paste the file into **SQL Editor → Run**.
Nothing else is needed. Without a configured Supabase project the button still works, but
reports wait in the browser (see below) until a build with the Supabase variables is live.

## Where to read them

Supabase dashboard → **Table Editor → `bug_reports_inbox`** (newest first). Columns:

| column | meaning |
|---|---|
| `created_local` | time (Belgrade) |
| `status` | `new` → set it yourself to `seen`, `fixed` or `wontfix` (in `bug_reports`) |
| `kind` | `wrong_answer`, `bug` or `other` |
| `message` | what the student wrote (may be empty for `wrong_answer`) |
| `question_origin` | lesson · generator · level (or part · step for a fixed check question) |
| `question_prompt`, `correct_answer`, `student_answer` | the task on screen, the expected answer, what the student entered (JSON) |
| `reproduce` | a command that prints exactly the same question: `npm run samples -- <lesson> --gen=<generator> --level=<n> --seed=<seed> --n=1` |
| `page`, `grade`, `app_version`, `viewport`, `recent_errors` | where it happened, and the last uncaught errors of that page load |
| `teacher_note` | your own note (in `bug_reports`) |
| `client_id` | a random id of the device: reports with the same id came from the same browser |

The view is read-only. To change `status` or `teacher_note`, open the **`bug_reports`** table.
Useful SQL (SQL Editor):

```sql
-- open reports
select * from bug_reports_inbox where status = 'new';
-- mark one as fixed
update bug_reports set status = 'fixed', teacher_note = 'javítva a 0.2-ben' where id = 42;
-- delete handled reports older than 90 days
delete from bug_reports where status <> 'new' and created_at < now() - interval '90 days';
```

To get an email for every new report, add a **Database Webhook** (Database → Webhooks) on
`bug_reports` INSERT. This is optional and not set up by the migration.

## Who can see what

- Students (anon key, signed in or not) can only call `submit_bug_report()`. There is no SELECT,
  INSERT, UPDATE or DELETE grant on `bug_reports` or `bug_reports_inbox` for `anon` or
  `authenticated`, and RLS is on with no policy. The API cannot list reports.
- The dashboard (service role / postgres) sees everything.
- Limits against flooding with the public key: 5 reports per device in 10 minutes, 30 per day,
  300 per hour in total; message ≤ 2000 characters, context ≤ 16 kB.

## What a report contains

The student's text and choice, and automatically: the question on screen (lesson, generator,
level, seed, task text, expected answer, the student's checked answer), the page address, the
grade, the app version, browser user agent, screen size, language, light/dark theme, online
state, and the last few uncaught JavaScript errors. **Not** included: name, nickname, IP address,
friends account, or the progress file. The dialog asks students not to write personal data;
still treat the free text as possibly personal (see `docs/SOCIAL_PRIVACY.md`) and delete
handled reports regularly.

## Offline and errors

Every report is first saved in `localStorage` (`zsebmatek-reports`, at most 10). It is sent at
once when possible, otherwise when the app starts again or the device comes back online. The
student sees "Köszönjük! Elküldtük a tanárnak." or "…Elmentettük, és amint lehet, elküldjük."
A report the server refuses as invalid is dropped; one that keeps failing is given up after 20
tries.

## Code

- `src/report/ReportButton.tsx` — the flag button, the settings link and the dialog
- `src/report/context.ts` — the question on screen (set by `QuestionRunner`) and the recent errors
- `src/report/report.ts` — the report context and the local outbox (pure, unit-tested:
  `npm run test:report`)
- `src/report/send.ts` — saving and sending (`submit_bug_report` RPC)
