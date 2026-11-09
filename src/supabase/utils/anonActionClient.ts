import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { parsePublicEnv } from "@/supabase/utils/env";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

// For Server Actions only. Unlike `createSupabaseServerClient`, this client can write cookies,
// so that a session created in the action (e.g. anonymous sign-in) is sent back in the response.
// It uses the anon key, so RLS is enabled. Use it for DB operations.
// For anonymous sign-in, use `createSupabaseSecretActionClient`.
const createSupabaseAnonActionClient = async () => {
  const cookieStore = await cookies();

  const publicEnv = parsePublicEnv();

  return createServerClient<DatabaseModified>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};

export { createSupabaseAnonActionClient };
