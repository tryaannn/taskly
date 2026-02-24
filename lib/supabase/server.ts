import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server (Server Component / Route Handler / Server Action) Supabase client.
 * Reads & writes HttpOnly cookies so the session is never exposed to JS.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies can't be set.
            // Ignored: the middleware will refresh the session cookie.
          }
        },
      },
    }
  );
}

/**
 * Service-role client — bypasses RLS.
 * Only use in trusted server code (API routes), never expose to browser.
 */
export function createServiceClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
