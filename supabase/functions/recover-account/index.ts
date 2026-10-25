/**
 * Edge Function: recover-account
 *
 * The student signs in anonymously on a new device and enters the old friend code + recovery
 * code. The function verifies the caller, calls the service-role-only migration RPC and then
 * deletes the old auth user. The browser never receives the service_role key.
 *
 * The migration RPC is rate-limited in SQL and refuses a new account that already has social data.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'unauthorized' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anonKey || !serviceKey) return json({ error: 'server_misconfigured' }, 500);

  let body: { friendCode?: unknown; recoveryCode?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  const friendCode = typeof body.friendCode === 'string' ? body.friendCode.trim() : '';
  const recoveryCode = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim() : '';
  if (friendCode.length < 6 || friendCode.length > 32 || recoveryCode.length < 12 || recoveryCode.length > 64) {
    return json({ error: 'invalid_recovery' }, 400);
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: oldUserId, error: migrateError } = await admin.rpc('recover_account_migrate', {
    p_friend_code: friendCode,
    p_recovery_code: recoveryCode,
    p_new_user: data.user.id,
  });
  if (migrateError || !oldUserId) {
    // Do not reveal whether the friend code or the recovery code was wrong.
    console.error('recover-account migration failed', migrateError?.message);
    return json({ error: 'invalid_recovery' }, 400);
  }

  // The migration already moved every social row to the new user. If deleting the now-empty old
  // auth user fails, the recovery itself has still succeeded; log the cleanup issue but do not
  // make the student think the recovery failed.
  const { error: deleteError } = await admin.auth.admin.deleteUser(oldUserId as string);
  if (deleteError) console.error('recover-account old user delete failed', deleteError.message);

  return json({ ok: true, cleanup: !deleteError });
});
