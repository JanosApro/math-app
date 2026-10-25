# Social layer — privacy and child-safety notes

> **This is an engineering note, not legal advice.** The social layer must not be enabled for
> students until the school/operator has reviewed the applicable child-consent, data-protection,
> retention and deletion rules. Pseudonymous profiles are still personal data under the GDPR.

## What the social layer collects

Only the minimum needed for friends and a friends-only weekly leaderboard:

| Data | Why |
|---|---|
| Supabase anonymous user id | identifies the account without email/phone |
| nickname (chosen by the student) | shown to accepted friends |
| avatar key (one of six emoji) | shown to accepted friends |
| random friend code | add friends by exact code |
| bcrypt hash of a random recovery code | account recovery without email |
| total XP, current/best streak | shared progress |
| XP event rows (fixed type, key, week/day) | weekly leaderboard and anti-duplicate checks |
| activity days | server-computed streak |
| server-awarded badge keys | shared badges |
| accepted/pending friendships | friends-only access |
| recovery-attempt timestamps | rate limiting |

## What it does **not** collect

- No email address, phone number, real name, address, birth date, school name or class.
- No contacts, address book, location, photos, microphone or camera.
- No messages, chat, comments or public profile.
- No public leaderboard, searchable directory or global ranking.
- No advertising or analytics SDKs.
- Detailed lesson progress (which question was answered, attempts, mistakes) stays in the
  browser's localStorage and is **not** uploaded.

## Why pseudonyms are not automatically anonymous

A nickname, a persistent random id, a friend code and a recovery hash can single out a child.
Under the GDPR this is **pseudonymised personal data**, not anonymous data. The school/operator
must treat it as personal data, document the legal basis, and provide the required information to
children and guardians.

## Child consent (GDPR Article 8 and school context)

- The app is for school-age children. Social features are optional and must not be a condition
  for using the math lessons.
- Before launch, the school/operator must decide whether guardian consent is required, how it is
  collected, and how withdrawal works. In many EU countries the digital-consent age is 16, with a
  lower age (not below 13) only where national law allows it; do not assume a lower age.
- A school may rely on a different legal basis for a school-organised activity, but that must be
  reviewed by the school's data-protection officer. This repository does not make that decision.
- The UI must show a short, age-appropriate privacy notice before the first social opt-in, and a
  link to the full notice. The teacher should explain it in class.

## Retention

Suggested starting point for review (not yet a final policy):

- Active social account: profile, friendships, XP events, activity days and badges are kept while
  the account is active.
- Deleted account: the auth user is deleted; profile, friendships, XP events, activity days and
  badges cascade-delete immediately. The recovery-attempt log is cleaned after 7 days.
- Backups: Supabase project backups may retain deleted data for the backup window. The operator
  must document the backup retention and restore procedure.
- Inactive accounts: define an inactivity period (for example one school year) and a deletion or
  anonymisation process before launch.
- XP events older than the current and previous school year are not needed for the weekly
  leaderboard; a scheduled cleanup can be added later.

## Deletion and access rights

- **In-app deletion:** Friends → Barátfiók törlése calls the `delete-account` Edge Function and
  removes the auth user and all social rows.
- **Local progress:** deleting the social account does **not** delete the math progress on the
  device. The student can also use Settings → Haladás törlése and the export/import file.
- **Access/portability:** the current UI does not yet provide a machine-readable social-data
  export. Before launch, add an export of the profile, friendships, XP events, activity days and
  badges, or document how the operator answers such requests.
- **Guardian requests:** the school/operator needs a contact and a procedure for guardian access
  or deletion requests. The app has no email address to contact the child, which is intentional.

## Security measures in this implementation

- Supabase Anonymous Auth; no email or password.
- RLS on every exposed table; own-row read-only direct access.
- Friends-only reads through SECURITY DEFINER functions that check an accepted friendship.
- Fixed server-side XP amounts; the client never sends an XP value, streak or badge.
- Idempotency keys, daily caps and a per-minute rate limit to reduce duplicate awards and basic
  leaderboard cheating.
- Service-role key only in Edge Functions; never in the browser or `VITE_` variables.
- Recovery codes are stored as bcrypt hashes and are shown once. Recovery is rate-limited.
- Account deletion cascades through foreign keys.

## Risks and open items before launch

1. **Legal review:** legal basis, guardian consent, age-appropriate notice, school policy,
   processor agreement with Supabase, international transfers, DPIA if required.
2. **Retention policy:** confirm the inactivity period, backup retention and XP-event cleanup.
3. **Data-subject requests:** add a social-data export and document the guardian request process.
4. **Moderation:** nicknames are user-chosen. Add a nickname filter/reporting route if the school
   requires it; there is no chat, so the risk is limited but not zero.
5. **Local cheating:** local gameplay cannot be fully verified. The fixed amounts and caps are a
   mitigation, not a guarantee. Do not present the leaderboard as a high-stakes competition.
6. **Device security:** a shared device or XSS can expose the local session/recovery code. The app
   has no third-party scripts, but the operator should still review the deployment and CSP.
7. **Recovery code loss:** without email there is no support recovery. Document this clearly and
   offer a new code while the student is signed in.
8. **Teacher access:** teachers do not get a dashboard or access to children's social data. If the
   school wants one, it needs a separate role design and privacy review.

## Recommended pre-launch checklist

- [ ] School/operator and data-protection officer reviewed this document.
- [ ] Privacy notice and guardian-consent flow approved (if required).
- [ ] Retention/inactivity/backup policy written down.
- [ ] Social-data export and guardian request procedure ready.
- [ ] Nickname moderation/reporting decision recorded.
- [ ] Supabase project has anonymous sign-in enabled and email/phone sign-up disabled if not needed.
- [ ] RLS and Edge Function secrets verified in the production project.
- [ ] `npm run test:social`, `npm run check`, `npm run build` and `supabase test db` pass.
- [ ] A small pilot with teacher supervision, then review before opening to all students.
