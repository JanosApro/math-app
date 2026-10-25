/** Supabase configuration. The anon key is public by design; the service_role key never is. */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const SUPABASE_URL = (env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/** The social UI stays hidden/disabled when the deployment has no Supabase project. */
export const SOCIAL_CONFIGURED =
  /^https?:\/\//.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20;

/** Auth storage is separate from the math progress key. */
export const SOCIAL_AUTH_STORAGE_KEY = 'zsebmatek-social-auth';
