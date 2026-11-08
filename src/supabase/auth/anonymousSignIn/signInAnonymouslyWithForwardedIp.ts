import "server-only";
import { headers } from "next/headers";
import { Result } from "@/utils/utility.types";
import { parseForwardedIp } from "@/supabase/auth/anonymousSignIn/parseForwardedIp";
import { createSupabaseSecretActionClient } from "@/supabase/auth/anonymousSignIn/secretActionClient";

// Sign in anonymously with the IP of the user, so that the rate limit is counted per user, not per server.
// This is the only entry point of anonymous sign-in. It must run on the server.
const signInAnonymouslyWithForwardedIp = async (): Promise<Result<void>> => {
  const requestHeaders = await headers();
  const forwardedIp = parseForwardedIp(requestHeaders.get("x-forwarded-for"));

  // On Vercel the header is always set, so a missing header in production is abnormal.
  // Do not fall back to the IP of the server silently, because that brings back the shared rate limit.
  // Outside production (local development and tests), the header may be missing, so sign in without it.
  if (!forwardedIp && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: new Error("The x-forwarded-for header is missing."),
    };
  }

  const supabaseClient = await createSupabaseSecretActionClient(forwardedIp);
  const { error: anonymouslySignInError } =
    await supabaseClient.auth.signInAnonymously();

  if (anonymouslySignInError)
    return { ok: false, error: anonymouslySignInError };
  return { ok: true, value: undefined };
};

export { signInAnonymouslyWithForwardedIp };
