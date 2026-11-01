-- Zsebmatek bug reports — the "Hiba jelzése" button.
--
-- Design notes:
-- * Students can only SEND a report, through submit_bug_report(). Nobody can read reports
--   through the API: there is no SELECT grant and no RLS policy for anon/authenticated.
--   The teacher reads them in the Supabase dashboard (Table Editor → bug_reports_inbox or
--   bug_reports), where the dashboard uses the service role.
-- * No sign-in is needed: the function is callable with the public anon key, so reporting works
--   even when the friends feature is off. No user id and no IP address is stored.
-- * client_id is a random id the app keeps in localStorage. It only groups reports from the same
--   device and powers the rate limit. report_key makes offline retries idempotent.
-- * Limits keep the table from being flooded with the public anon key: per device 5 reports in
--   10 minutes and 30 per day, globally 300 per hour; message ≤ 2000 characters, context ≤ 16 kB.

create table public.bug_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  report_key text not null unique,
  client_id text not null,
  kind text not null,
  message text not null default '',
  context jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  teacher_note text,
  constraint bug_reports_key_format check (report_key ~ '^[a-z0-9-]{8,64}$'),
  constraint bug_reports_client_format check (client_id ~ '^[a-z0-9-]{8,64}$'),
  constraint bug_reports_kind check (kind in ('wrong_answer', 'bug', 'other')),
  constraint bug_reports_message_len check (char_length(message) <= 2000),
  constraint bug_reports_context_object check (jsonb_typeof(context) = 'object'),
  constraint bug_reports_context_size check (pg_column_size(context) <= 16384),
  constraint bug_reports_status check (status in ('new', 'seen', 'fixed', 'wontfix'))
);

create index bug_reports_created_idx on public.bug_reports (created_at desc);
create index bug_reports_client_time_idx on public.bug_reports (client_id, created_at);

alter table public.bug_reports enable row level security;
-- No policies: with RLS on and no policy, anon/authenticated could not read a row even with a grant.
revoke all on table public.bug_reports from anon, authenticated;

/**
 * Stores one report. Returns 'ok', or 'duplicate' when this report_key was already stored
 * (an offline retry). Raises 'rate limited' (P0001) when a limit is hit, so the app keeps the
 * report and tries again later.
 */
create or replace function public.submit_bug_report(
  p_report_key text,
  p_client_id text,
  p_kind text,
  p_message text,
  p_context jsonb
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_key text := lower(trim(coalesce(p_report_key, '')));
  v_client text := lower(trim(coalesce(p_client_id, '')));
  v_kind text := lower(trim(coalesce(p_kind, '')));
  v_message text := left(trim(coalesce(p_message, '')), 2000);
  v_context jsonb := coalesce(p_context, '{}'::jsonb);
  v_recent integer;
begin
  if v_key !~ '^[a-z0-9-]{8,64}$' or v_client !~ '^[a-z0-9-]{8,64}$' then
    raise exception 'invalid report id' using errcode = '22023';
  end if;
  if v_kind not in ('wrong_answer', 'bug', 'other') then
    raise exception 'invalid report kind' using errcode = '22023';
  end if;
  if jsonb_typeof(v_context) <> 'object' or pg_column_size(v_context) > 16384 then
    raise exception 'invalid report context' using errcode = '22023';
  end if;
  if v_message = '' and v_kind <> 'wrong_answer' then
    raise exception 'empty report' using errcode = '22023';
  end if;

  if exists (select 1 from public.bug_reports where report_key = v_key) then
    return 'duplicate';
  end if;

  select count(*) into v_recent
    from public.bug_reports
   where client_id = v_client and created_at > now() - interval '10 minutes';
  if v_recent >= 5 then
    raise exception 'rate limited' using errcode = 'P0001';
  end if;
  select count(*) into v_recent
    from public.bug_reports
   where client_id = v_client and created_at > now() - interval '1 day';
  if v_recent >= 30 then
    raise exception 'rate limited' using errcode = 'P0001';
  end if;
  select count(*) into v_recent
    from public.bug_reports
   where created_at > now() - interval '1 hour';
  if v_recent >= 300 then
    raise exception 'rate limited' using errcode = 'P0001';
  end if;

  insert into public.bug_reports (report_key, client_id, kind, message, context)
  values (v_key, v_client, v_kind, v_message, v_context)
  on conflict (report_key) do nothing;
  return case when found then 'ok' else 'duplicate' end;
end;
$$;

revoke all on function public.submit_bug_report(text, text, text, text, jsonb) from public;
grant execute on function public.submit_bug_report(text, text, text, text, jsonb) to anon, authenticated;

/**
 * The teacher's inbox: newest first, the useful context fields as columns.
 * security_invoker makes the view obey the caller's rights, and it is granted to nobody but the
 * dashboard (service role / postgres), so the API cannot read it either.
 */
create or replace view public.bug_reports_inbox
with (security_invoker = true)
as
select
  r.id,
  r.created_at at time zone 'Europe/Belgrade' as created_local,
  r.status,
  r.kind,
  r.message,
  r.context #>> '{question,origin}' as question_origin,
  r.context #>> '{question,prompt}' as question_prompt,
  r.context #>> '{question,correct}' as correct_answer,
  r.context #>> '{question,student}' as student_answer,
  case
    when r.context #>> '{question,generator}' is not null then
      format('npm run samples -- %s --gen=%s --level=%s --seed=%s --n=1',
        r.context #>> '{question,subtopic}', r.context #>> '{question,generator}',
        r.context #>> '{question,level}', r.context #>> '{question,seed}')
  end as reproduce,
  r.context ->> 'page' as page,
  r.context ->> 'grade' as grade,
  r.context ->> 'appVersion' as app_version,
  r.context #>> '{device,viewport}' as viewport,
  r.context -> 'errors' as recent_errors,
  r.teacher_note,
  r.client_id
from public.bug_reports r
order by r.created_at desc;

revoke all on table public.bug_reports_inbox from public, anon, authenticated;
