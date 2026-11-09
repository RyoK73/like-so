import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { parsePublicEnv, parseServerEnv } from "@/supabase/utils/env";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

// The client only for anonymous sign-in. It uses the secret key, so that Supabase accepts `sb-forwarded-for`.
// Do not use it for anything else: the secret key bypasses RLS. Use `createSupabaseAnonActionClient` for the DB.
// Like `createSupabaseAnonActionClient`, it can write cookies, so that the new session is sent back in the response.
const createSupabaseSecretActionClient = async (forwardedIp?: string) => {
  const cookieStore = await cookies();

  const publicEnv = parsePublicEnv();
  const serverEnv = parseServerEnv();

  return createServerClient<DatabaseModified>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SECRET_KEY,
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
      // Without the IP, the header is not added at all.
      global: {
        headers: forwardedIp ? { "sb-forwarded-for": forwardedIp } : {},
      },
    },
  );
};

export { createSupabaseSecretActionClient };
