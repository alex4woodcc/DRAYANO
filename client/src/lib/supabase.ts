import { createClient } from '@supabase/supabase-js';

/**
 * Resolve env in a way that works in:
 * - Vite client (import.meta.env.*)
 * - Node/SSR (process.env.*)
 * - Optional window overrides (handy for quick local testing)
 */
function resolveEnv(name: string): string | undefined {
  // Vite client
  // @ts-ignore
  const viteVal = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as any)[name] : undefined;
  // Node/SSR fallback
  const nodeVal = typeof process !== 'undefined' && process.env ? process.env[name] : undefined;
  // Browser override (optional)
  const winVal = typeof window !== 'undefined' ? (window as any)[name] : undefined;
  return viteVal ?? nodeVal ?? winVal;
}

const supabaseUrl = resolveEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = resolveEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  // Helpful hint: Vite loads .env from the *root configured in vite.config.ts* (here it is "client").
  // Put your file at: client/.env (or .env.local) with:
  //   VITE_SUPABASE_URL=https://xxxxx.supabase.co
  //   VITE_SUPABASE_ANON_KEY=eyJ...
  throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env (no quotes).');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
