-- Security regression tests for the social layer (pgTAP).
-- Run with a local Supabase stack:  supabase test db
--
-- These tests do not need real email addresses; the auth users are test fixtures.

begin;
set search_path = public, extensions;
create extension if not exists pgtap with schema extensions;
select plan(9);

-- Three auth users: A and B are friends, C is a stranger.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'a@example.invalid', '', now(), now(), now(), '{}', '{}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'b@example.invalid', '', now(), now(), now(), '{}', '{}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'c@example.invalid', '', now(), now(), now(), '{}', '{}');

insert into public.profiles (id, nickname, avatar, friend_code, recovery_hash, social_enabled, xp_total, streak_current)
values
  ('11111111-1111-4111-8111-111111111111', 'Anna', 'fox', 'AAAA2222', extensions.crypt('AAAA2222BBBB3333CCCC', extensions.gen_salt('bf')), true, 100, 3),
  ('22222222-2222-4222-8222-222222222222', 'Béla', 'owl', 'BBBB3333', extensions.crypt('BBBB3333CCCC4444DDDD', extensions.gen_salt('bf')), true, 80, 2),
  ('33333333-3333-4333-8333-333333333333', 'Cila', 'cat', 'CCCC4444', extensions.crypt('CCCC4444DDDD5555EEEE', extensions.gen_salt('bf')), true, 60, 1);

insert into public.friendships (requester_id, addressee_id, status, responded_at)
values ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'accepted', now());

insert into public.xp_events (user_id, event_key, event_type, xp, week_start, day)
values
  ('11111111-1111-4111-8111-111111111111', 'answer:g5-termeszetes-szamok-1-01:1:p1:test-a', 'answer', 10, public.iso_week_start(public.belgrade_today()), public.belgrade_today()),
  ('22222222-2222-4222-8222-222222222222', 'answer:g5-termeszetes-szamok-1-01:1:p1:test-b', 'answer', 10, public.iso_week_start(public.belgrade_today()), public.belgrade_today()),
  ('33333333-3333-4333-8333-333333333333', 'answer:g5-termeszetes-szamok-1-01:1:p1:test-c', 'answer', 10, public.iso_week_start(public.belgrade_today()), public.belgrade_today());

-- A badge must not multiply the weekly XP through a join.
insert into public.user_badges (user_id, badge_key)
values ('11111111-1111-4111-8111-111111111111', 'xp:100');

-- Act as Anna (A).
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(
  (select count(id) from public.profiles),
  1::bigint,
  'A can read only her own profile row'
);

select is(
  (select count(*) from public.friendships),
  1::bigint,
  'A can read only her own friendship row'
);

select is(
  (select count(*) from public.xp_events),
  1::bigint,
  'A can read only her own XP events'
);

select is(
  (select count(*) from public.friend_leaderboard()),
  2::bigint,
  'the leaderboard contains A and her accepted friend B'
);

select is(
  (select count(*) from public.friend_leaderboard() where nickname = 'Cila'),
  0::bigint,
  'a stranger never appears in the leaderboard'
);

select is(
  (select week_xp from public.friend_leaderboard() where user_id = '11111111-1111-4111-8111-111111111111'),
  10,
  'weekly XP is not multiplied by the number of badges'
);

select throws_ok(
  $$ select public.recover_account_migrate('AAAA2222', 'AAAA2222BBBB3333CCCC', '11111111-1111-4111-8111-111111111111') $$,
  '42501',
  null,
  'the recovery migration RPC is service-role only'
);

select throws_ok(
  $$ update public.profiles set nickname = 'Hacked' where id = '11111111-1111-4111-8111-111111111111' $$,
  '42501',
  null,
  'profiles cannot be updated directly (no update grant)'
);

select is(
  (select count(id) from public.profiles where id = '22222222-2222-4222-8222-222222222222'),
  0::bigint,
  'a friend profile is not directly readable; use the friends RPC'
);

select * from finish();
rollback;
