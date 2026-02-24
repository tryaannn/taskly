import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser (client-component) Supabase client.
 * Uses anon key + HttpOnly cookies managed by the SSR helper.
 * Safe to call multiple times — createBrowserClient memoises internally.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
