-- Zsebmatek social layer — optional, pseudonymous friends and weekly XP leaderboard.
--
-- Design notes:
-- * Math progress stays in localStorage. This schema stores only the social summary:
--   pseudonymous profile, friendships, fixed XP events, activity days and server-awarded badges.
-- * XP, streaks and badges are written ONLY by SECURITY DEFINER functions. The client never sends
--   an XP amount, a streak or a badge: it sends an event type + an idempotency key.
-- * Fixed awards + daily caps + unique (user_id, event_key) prevent duplicate awards and make
--   basic leaderboard cheating harder. Local gameplay cannot be fully verified server-side; the
--   caps are the deliberate safety valve.
-- * RLS is enabled on every exposed table. Direct table access is read-only and limited to the
--   caller's own rows. Friends-only data is returned by SECURITY DEFINER functions that check an
--   accepted friendship.
-- * The service_role key is never used in the browser. The two Edge Functions use it only for
--   account deletion and anonymous-account recovery.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade on update cascade,
  nickname text not null default 'Felfedező',
  avatar text not null default 'fox',
  friend_code text not null unique,
  social_enabled boolean not null default false,
  xp_total integer not null default 0 check (xp_total >= 0),
  streak_current integer not null default 0 check (streak_current >= 0),
  streak_best integer not null default 0 check (streak_best >= 0),
  recovery_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_len check (char_length(nickname) between 1 and 20),
  constraint profiles_avatar_allowed check (avatar in ('fox', 'owl', 'cat', 'panda', 'rocket', 'star')),
  constraint profiles_friend_code_format check (friend_code ~ '^[A-HJ-NP-Z2-9]{8}$')
);

create table public.friendships (
  id uuid primary key default extensions.gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade on update cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade on update cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade on update cascade,
  event_key text not null,
  event_type text not null,
  xp integer not null check (xp > 0),
  week_start date not null,
  day date not null,
  created_at timestamptz not null default now(),
  constraint xp_events_unique_key unique (user_id, event_key),
  constraint xp_events_key_format check (event_key ~ '^[a-z0-9:_-]{1,120}$')
);

create table public.activity_days (
  user_id uuid not null references public.profiles (id) on delete cascade on update cascade,
  day date not null,
  primary key (user_id, day)
);

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade on update cascade,
  badge_key text not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_key),
  constraint user_badges_key_format check (badge_key ~ '^[a-z0-9:_-]{1,120}$')
);

-- Not exposed to clients. Used to rate-limit recovery-code attempts.
create table public.recovery_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);

create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);
create index xp_events_user_week_idx on public.xp_events (user_id, week_start);
create index xp_events_user_day_idx on public.xp_events (user_id, day);
create index recovery_attempts_user_time_idx on public.recovery_attempts (user_id, attempted_at);

-- ---------------------------------------------------------------------------------------------
-- 2. Helpers
-- ---------------------------------------------------------------------------------------------

create or replace function public.belgrade_today()
returns date
language sql
stable
set search_path = public, pg_temp
as $$
  select (now() at time zone 'Europe/Belgrade')::date;
$$;

create or replace function public.iso_week_start(p_day date)
returns date
language sql
immutable
set search_path = public, pg_temp
as $$
  select (p_day - ((extract(isodow from p_day)::integer) - 1))::date;
$$;

create or replace function public.normalize_code(p_code text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function public.random_code(p_len integer)
returns text
language plpgsql
volatile
set search_path = public, extensions, pg_temp
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
  out text := '';
  i integer;
begin
  if p_len < 4 or p_len > 64 then
    raise exception 'invalid code length' using errcode = '22023';
  end if;
  bytes := extensions.gen_random_bytes(p_len);
  for i in 0..p_len - 1 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return out;
end;
$$;

create or replace function public.generate_friend_code()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  code text;
begin
  loop
    code := public.random_code(8);
    exit when not exists (select 1 from public.profiles where friend_code = code);
  end loop;
  return code;
end;
$$;

create or replace function public.generate_recovery_code()
returns text
language sql
volatile
set search_path = public, pg_temp
as $$
  select public.random_code(20);
$$;

/** Public JSON of a profile — never includes recovery_hash. */
create or replace function public.public_profile(p public.profiles)
returns jsonb
language sql
immutable
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'id', p.id,
    'nickname', p.nickname,
    'avatar', p.avatar,
    'friend_code', p.friend_code,
    'social_enabled', p.social_enabled,
    'xp_total', p.xp_total,
    'streak_current', p.streak_current,
    'streak_best', p.streak_best,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  );
$$;

-- ---------------------------------------------------------------------------------------------
-- 3. Profile RPCs
-- ---------------------------------------------------------------------------------------------

/** Creates the caller's profile on first use. Returns the profile and, once, the recovery code. */
create or replace function public.ensure_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  code text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into p from public.profiles where id = uid;
  if found then
    return jsonb_build_object('profile', public.public_profile(p), 'recovery_code', null);
  end if;

  code := public.generate_recovery_code();
  insert into public.profiles (id, nickname, avatar, friend_code, recovery_hash)
  values (
    uid,
    'Felfedező',
    'fox',
    public.generate_friend_code(),
    extensions.crypt(code, extensions.gen_salt('bf'))
  )
  returning * into p;

  return jsonb_build_object('profile', public.public_profile(p), 'recovery_code', code);
end;
$$;

create or replace function public.set_profile(
  p_nickname text,
  p_avatar text,
  p_social_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  nick text;
  av text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  nick := left(trim(regexp_replace(coalesce(p_nickname, ''), '\s+', ' ', 'g')), 20);
  if nick = '' then
    nick := 'Felfedező';
  end if;
  av := case when p_avatar in ('fox', 'owl', 'cat', 'panda', 'rocket', 'star') then p_avatar else 'fox' end;

  update public.profiles
     set nickname = nick,
         avatar = av,
         social_enabled = coalesce(p_social_enabled, social_enabled),
         updated_at = now()
   where id = uid
   returning * into p;

  if not found then
    raise exception 'profile not found' using errcode = 'P0001';
  end if;
  return public.public_profile(p);
end;
$$;

create or replace function public.rotate_recovery_code()
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  uid uuid := auth.uid();
  code text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  code := public.generate_recovery_code();
  update public.profiles
     set recovery_hash = extensions.crypt(code, extensions.gen_salt('bf')),
         updated_at = now()
   where id = uid;
  if not found then
    raise exception 'profile not found' using errcode = 'P0001';
  end if;
  return code;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- 4. Friends RPCs
-- ---------------------------------------------------------------------------------------------

/** Exact-code lookup only; no listing, no enumeration. Requires the caller to have social on. */
create or replace function public.find_by_friend_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  target public.profiles;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = uid and social_enabled) then
    raise exception 'social disabled' using errcode = '42501';
  end if;

  select * into target
    from public.profiles
   where friend_code = public.normalize_code(p_code)
     and social_enabled
   limit 1;

  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'id', target.id,
    'nickname', target.nickname,
    'avatar', target.avatar
  );
end;
$$;

create or replace function public.send_friend_request(p_code text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  target public.profiles;
  recent integer;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = uid and social_enabled) then
    return 'disabled';
  end if;

  select * into target
    from public.profiles
   where friend_code = public.normalize_code(p_code)
     and social_enabled
   limit 1;
  if not found then
    return 'not_found';
  end if;
  if target.id = uid then
    return 'self';
  end if;

  if exists (
    select 1 from public.friendships
     where status = 'accepted'
       and ((requester_id = uid and addressee_id = target.id) or (requester_id = target.id and addressee_id = uid))
  ) then
    return 'already_friends';
  end if;

  if exists (
    select 1 from public.friendships
     where status = 'pending'
       and ((requester_id = uid and addressee_id = target.id) or (requester_id = target.id and addressee_id = uid))
  ) then
    return 'pending';
  end if;

  select count(*) into recent
    from public.friendships
   where requester_id = uid
     and created_at > now() - interval '24 hours';
  if recent >= 20 then
    return 'rate_limited';
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (uid, target.id, 'pending');
  return 'sent';
end;
$$;

create or replace function public.respond_friend_request(p_id uuid, p_accept boolean)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  requester uuid;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  update public.friendships
     set status = case when p_accept then 'accepted' else status end,
         responded_at = now()
   where id = p_id
     and addressee_id = uid
     and status = 'pending'
   returning requester_id into requester;

  if not found then
    return false;
  end if;

  if p_accept then
    -- remove a reverse pending request, if one exists
    delete from public.friendships
     where status = 'pending'
       and requester_id = uid
       and addressee_id = requester;
  else
    delete from public.friendships where id = p_id;
  end if;
  return true;
end;
$$;

create or replace function public.remove_friend(p_friend_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  delete from public.friendships
   where status = 'accepted'
     and ((requester_id = uid and addressee_id = p_friend_id) or (requester_id = p_friend_id and addressee_id = uid));
  return found;
end;
$$;

create or replace function public.list_friend_requests()
returns table (
  request_id uuid,
  requester_id uuid,
  nickname text,
  avatar text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = uid and social_enabled) then
    raise exception 'social disabled' using errcode = '42501';
  end if;
  return query
    select f.id, p.id, p.nickname, p.avatar, f.created_at
      from public.friendships f
      join public.profiles p on p.id = f.requester_id
     where f.addressee_id = uid
       and f.status = 'pending'
       and p.social_enabled
     order by f.created_at desc;
end;
$$;

create or replace function public.list_friends()
returns table (
  friend_id uuid,
  nickname text,
  avatar text,
  xp_total integer,
  streak_current integer,
  week_xp integer,
  badges jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = uid and social_enabled) then
    raise exception 'social disabled' using errcode = '42501';
  end if;
  return query
    select p.id,
           p.nickname,
           p.avatar,
           p.xp_total,
           p.streak_current,
           coalesce((
             select sum(e.xp)::integer
               from public.xp_events e
              where e.user_id = p.id
                and e.week_start = public.iso_week_start(public.belgrade_today())
           ), 0) as week_xp,
           coalesce((
             select jsonb_agg(ub.badge_key order by ub.awarded_at)
               from public.user_badges ub
              where ub.user_id = p.id
           ), '[]'::jsonb) as badges
      from public.friendships f
      join public.profiles p
        on p.id = case when f.requester_id = uid then f.addressee_id else f.requester_id end
     where f.status = 'accepted'
       and uid in (f.requester_id, f.addressee_id)
       and p.social_enabled
     order by p.nickname;
end;
$$;

create or replace function public.friend_leaderboard()
returns table (
  user_id uuid,
  nickname text,
  avatar text,
  week_xp integer,
  xp_total integer,
  streak_current integer,
  badges jsonb,
  is_self boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = uid and social_enabled) then
    raise exception 'social disabled' using errcode = '42501';
  end if;

  return query
    with friend_ids as (
      select uid as id
      union
      select case when f.requester_id = uid then f.addressee_id else f.requester_id end
        from public.friendships f
       where f.status = 'accepted'
         and uid in (f.requester_id, f.addressee_id)
    )
    select p.id,
           p.nickname,
           p.avatar,
           coalesce((
             select sum(e.xp)::integer
               from public.xp_events e
              where e.user_id = p.id
                and e.week_start = public.iso_week_start(public.belgrade_today())
           ), 0) as week_xp,
           p.xp_total,
           p.streak_current,
           coalesce((
             select jsonb_agg(distinct ub.badge_key)
               from public.user_badges ub
              where ub.user_id = p.id
           ), '[]'::jsonb) as badges,
           p.id = uid as is_self
      from public.profiles p
     where p.id in (select id from friend_ids)
       and p.social_enabled
     order by week_xp desc, p.xp_total desc, p.nickname;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- 5. XP / streak / badge engine (server-side amounts only)
-- ---------------------------------------------------------------------------------------------

create or replace function public.refresh_streak(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  today date := public.belgrade_today();
  cursor_day date;
  day_value date;
  prev_day date := null;
  current_run integer := 0;
  best_run integer := 0;
  run integer := 0;
begin
  if exists (select 1 from public.activity_days where user_id = p_user and day = today) then
    cursor_day := today;
  else
    cursor_day := today - 1;
  end if;

  loop
    exit when not exists (select 1 from public.activity_days where user_id = p_user and day = cursor_day);
    current_run := current_run + 1;
    cursor_day := cursor_day - 1;
  end loop;

  for day_value in
    select day from public.activity_days where user_id = p_user order by day
  loop
    if prev_day is not null and day_value = prev_day + 1 then
      run := run + 1;
    else
      run := 1;
    end if;
    best_run := greatest(best_run, run);
    prev_day := day_value;
  end loop;

  update public.profiles
     set streak_current = current_run,
         streak_best = greatest(streak_best, best_run, current_run),
         updated_at = now()
   where id = p_user;
end;
$$;

create or replace function public.award_badges(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  p public.profiles;
begin
  select * into p from public.profiles where id = p_user;
  if not found then
    return;
  end if;

  insert into public.user_badges (user_id, badge_key)
  select p_user, v.key
    from (values ('streak:7', 7), ('streak:30', 30), ('streak:100', 100)) as v(key, threshold)
   where p.streak_current >= v.threshold
  on conflict do nothing;

  insert into public.user_badges (user_id, badge_key)
  select p_user, v.key
    from (values ('xp:100', 100), ('xp:500', 500), ('xp:1000', 1000), ('xp:2500', 2500), ('xp:5000', 5000)) as v(key, threshold)
   where p.xp_total >= v.threshold
  on conflict do nothing;

  if exists (select 1 from public.xp_events where user_id = p_user and event_type = 'lesson') then
    insert into public.user_badges (user_id, badge_key) values (p_user, 'first-lesson')
    on conflict do nothing;
  end if;

  insert into public.user_badges (user_id, badge_key)
  select p_user, event_key
    from public.xp_events
   where user_id = p_user
     and event_type = 'chapter'
  on conflict do nothing;
end;
$$;

/**
 * Award one fixed XP event. The client sends a type + idempotency key, never an amount.
 * Returns { awarded, duplicate, xp, profile }.
 */
create or replace function public.award_xp(p_event_type text, p_event_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_type text := lower(trim(coalesce(p_event_type, '')));
  v_key text := lower(trim(coalesce(p_event_key, '')));
  v_xp integer;
  v_prefix text;
  v_today date := public.belgrade_today();
  v_week date := public.iso_week_start(public.belgrade_today());
  v_day_total integer;
  v_type_total integer;
  v_recent integer;
  v_event_id bigint;
  p public.profiles;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into p from public.profiles where id = uid;
  if not found then
    raise exception 'profile not found' using errcode = 'P0001';
  end if;
  if not p.social_enabled then
    raise exception 'social disabled' using errcode = '42501';
  end if;

  if v_key !~ '^[a-z0-9:_-]{1,120}$' then
    raise exception 'invalid event key' using errcode = '22023';
  end if;

  case v_type
    when 'answer' then v_xp := 10; v_prefix := 'answer:';
    when 'answer_hint' then v_xp := 5; v_prefix := 'answer:';
    when 'part' then v_xp := 20; v_prefix := 'part:';
    when 'part_replay' then v_xp := 5; v_prefix := 'part_replay:';
    when 'lesson' then v_xp := 50; v_prefix := 'lesson:';
    when 'lesson_replay' then v_xp := 10; v_prefix := 'lesson_replay:';
    when 'daily' then v_xp := 30; v_prefix := 'daily:';
    when 'daily_answer' then v_xp := 5; v_prefix := 'daily_answer:';
    when 'chapter' then v_xp := 150; v_prefix := 'chapter:';
    else
      raise exception 'invalid event type' using errcode = '22023';
  end case;

  if left(v_key, length(v_prefix)) <> v_prefix then
    raise exception 'event key does not match its type' using errcode = '22023';
  end if;

  -- date-bound events cannot be replayed for another day
  if v_type = 'daily' and v_key <> 'daily:' || v_today::text then
    raise exception 'daily event must be today' using errcode = '22023';
  end if;
  if v_type = 'daily_answer' and v_key not like 'daily_answer:' || v_today::text || ':%' then
    raise exception 'daily answer event must be today' using errcode = '22023';
  end if;
  if v_type in ('part_replay', 'lesson_replay') and v_key not like '%:' || v_today::text then
    raise exception 'replay event must be today' using errcode = '22023';
  end if;

  -- basic rate limit (the client syncs in small batches)
  select count(*) into v_recent
    from public.xp_events
   where user_id = uid
     and created_at > now() - interval '1 minute';
  if v_recent >= 40 then
    raise exception 'too many XP events' using errcode = 'P0001';
  end if;

  select coalesce(sum(xp), 0) into v_day_total
    from public.xp_events
   where user_id = uid and day = v_today;
  if v_day_total + v_xp > 1000 then
    raise exception 'daily XP cap reached' using errcode = 'P0001';
  end if;

  if v_type in ('answer', 'answer_hint') then
    select coalesce(sum(xp), 0) into v_type_total
      from public.xp_events
     where user_id = uid and day = v_today and event_type in ('answer', 'answer_hint');
    if v_type_total + v_xp > 200 then
      raise exception 'daily answer XP cap reached' using errcode = 'P0001';
    end if;
  elsif v_type in ('part', 'part_replay') then
    select coalesce(sum(xp), 0) into v_type_total
      from public.xp_events
     where user_id = uid and day = v_today and event_type in ('part', 'part_replay');
    if v_type_total + v_xp > 100 then
      raise exception 'daily part XP cap reached' using errcode = 'P0001';
    end if;
  elsif v_type in ('lesson', 'lesson_replay') then
    select coalesce(sum(xp), 0) into v_type_total
      from public.xp_events
     where user_id = uid and day = v_today and event_type in ('lesson', 'lesson_replay');
    if v_type_total + v_xp > 150 then
      raise exception 'daily lesson XP cap reached' using errcode = 'P0001';
    end if;
  elsif v_type in ('daily', 'daily_answer') then
    select coalesce(sum(xp), 0) into v_type_total
      from public.xp_events
     where user_id = uid and day = v_today and event_type in ('daily', 'daily_answer');
    if v_type_total + v_xp > 100 then
      raise exception 'daily challenge XP cap reached' using errcode = 'P0001';
    end if;
  elsif v_type = 'chapter' then
    select coalesce(sum(xp), 0) into v_type_total
      from public.xp_events
     where user_id = uid and day = v_today and event_type = 'chapter';
    if v_type_total + v_xp > 150 then
      raise exception 'daily chapter XP cap reached' using errcode = 'P0001';
    end if;
  end if;

  insert into public.xp_events (user_id, event_key, event_type, xp, week_start, day)
  values (uid, v_key, v_type, v_xp, v_week, v_today)
  on conflict (user_id, event_key) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object(
      'awarded', false,
      'duplicate', true,
      'xp', 0,
      'profile', public.public_profile(p)
    );
  end if;

  insert into public.activity_days (user_id, day) values (uid, v_today)
  on conflict do nothing;

  update public.profiles
     set xp_total = xp_total + v_xp,
         updated_at = now()
   where id = uid
   returning * into p;

  perform public.refresh_streak(uid);
  perform public.award_badges(uid);

  select * into p from public.profiles where id = uid;
  return jsonb_build_object(
    'awarded', true,
    'duplicate', false,
    'xp', v_xp,
    'profile', public.public_profile(p)
  );
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- 6. Account recovery (called only by the recover-account Edge Function with service_role)
-- ---------------------------------------------------------------------------------------------

/**
 * Moves the old anonymous social identity to p_new_user after checking the recovery code.
 * The Edge Function then deletes the old auth user. The new user must not have social data yet.
 */
create or replace function public.recover_account_migrate(
  p_friend_code text,
  p_recovery_code text,
  p_new_user uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  old_profile public.profiles;
  old_id uuid;
  attempts integer;
begin
  if p_new_user is null then
    raise exception 'missing new user' using errcode = '22023';
  end if;

  delete from public.recovery_attempts where attempted_at < now() - interval '7 days';
  insert into public.recovery_attempts (user_id) values (p_new_user);
  select count(*) into attempts
    from public.recovery_attempts
   where user_id = p_new_user
     and attempted_at > now() - interval '1 hour';
  if attempts > 5 then
    raise exception 'too many recovery attempts' using errcode = 'P0001';
  end if;

  select * into old_profile
    from public.profiles
   where friend_code = public.normalize_code(p_friend_code)
   limit 1;
  if not found then
    raise exception 'invalid recovery code' using errcode = 'P0001';
  end if;
  if extensions.crypt(public.normalize_code(p_recovery_code), old_profile.recovery_hash) is distinct from old_profile.recovery_hash then
    raise exception 'invalid recovery code' using errcode = 'P0001';
  end if;

  old_id := old_profile.id;
  if old_id = p_new_user then
    raise exception 'already this account' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.xp_events where user_id = p_new_user)
     or exists (select 1 from public.friendships where requester_id = p_new_user or addressee_id = p_new_user) then
    raise exception 'current account already has social data' using errcode = 'P0001';
  end if;

  -- Remove the fresh, empty profile of the new session, then move the old profile to it.
  delete from public.profiles where id = p_new_user;
  update public.profiles
     set id = p_new_user,
         updated_at = now()
   where id = old_id;

  return old_id;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- 7. RLS and least-privilege grants
-- ---------------------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.xp_events enable row level security;
alter table public.activity_days enable row level security;
alter table public.user_badges enable row level security;
alter table public.recovery_attempts enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists friendships_select_participant on public.friendships;
create policy friendships_select_participant on public.friendships
  for select to authenticated
  using (auth.uid() in (requester_id, addressee_id));

drop policy if exists xp_events_select_own on public.xp_events;
create policy xp_events_select_own on public.xp_events
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists activity_days_select_own on public.activity_days;
create policy activity_days_select_own on public.activity_days
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_badges_select_own on public.user_badges;
create policy user_badges_select_own on public.user_badges
  for select to authenticated
  using (auth.uid() = user_id);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.friendships from anon, authenticated;
revoke all on table public.xp_events from anon, authenticated;
revoke all on table public.activity_days from anon, authenticated;
revoke all on table public.user_badges from anon, authenticated;
revoke all on table public.recovery_attempts from anon, authenticated;

-- Column-level select: recovery_hash is never readable by the browser.
grant select (id, nickname, avatar, friend_code, social_enabled, xp_total, streak_current, streak_best, created_at, updated_at)
  on public.profiles to authenticated;
grant select on public.friendships to authenticated;
grant select on public.xp_events to authenticated;
grant select on public.activity_days to authenticated;
grant select on public.user_badges to authenticated;

-- PostgreSQL grants EXECUTE to PUBLIC by default. Remove that for every function in this
-- schema first, then grant only the intended RPCs below.
revoke execute on all functions in schema public from public, anon;

-- Internal helpers are not callable by clients.
revoke all on function public.public_profile(public.profiles) from public, anon, authenticated;
revoke all on function public.random_code(integer) from public, anon, authenticated;
revoke all on function public.generate_friend_code() from public, anon, authenticated;
revoke all on function public.generate_recovery_code() from public, anon, authenticated;
revoke all on function public.refresh_streak(uuid) from public, anon, authenticated;
revoke all on function public.award_badges(uuid) from public, anon, authenticated;
revoke all on function public.recover_account_migrate(text, text, uuid) from public, anon, authenticated;

-- Public RPCs for signed-in (including anonymous) users.
grant execute on function public.ensure_profile() to authenticated;
grant execute on function public.set_profile(text, text, boolean) to authenticated;
grant execute on function public.rotate_recovery_code() to authenticated;
grant execute on function public.find_by_friend_code(text) to authenticated;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.remove_friend(uuid) to authenticated;
grant execute on function public.list_friend_requests() to authenticated;
grant execute on function public.list_friends() to authenticated;
grant execute on function public.friend_leaderboard() to authenticated;
grant execute on function public.award_xp(text, text) to authenticated;

-- Only the Edge Function (service_role) may migrate an account.
grant execute on function public.recover_account_migrate(text, text, uuid) to service_role;
