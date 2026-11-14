import "server-only";
import { headers } from "next/headers";
import { checkBotId } from "botid/server";
import { Result } from "@/utils/utility.types";
import { parseForwardedIp } from "@/supabase/auth/anonymousSignIn/parseForwardedIp";
import { createSupabaseSecretActionClient } from "@/supabase/auth/anonymousSignIn/secretActionClient";

// Sign in anonymously with the IP of the user, so that the rate limit is counted per user, not per server.
// This is the only entry point of anonymous sign-in. It must run on the server.
const signInAnonymouslyWithForwardedIp = async (): Promise<Result<void>> => {
  // Check for a bot first, so that a bot never reaches the IP parsing or the Supabase client.
  // Do not catch an error of `checkBotId`. A broken check must not look like a retryable failure, so let it reach the error page.
  const verification = await checkBotId();
  if (verification.isBot) {
    return {
      ok: false,
      error: new Error("The request was detected as a bot."),
    };
  }

  const requestHeaders = await headers();
  const forwardedIp = parseForwardedIp(requestHeaders.get("x-forwarded-for"));

  // On Vercel the header is always a single valid IP, so anything else in production is abnormal.
  // Do not fall back to the IP of the server silently, because that brings back the shared rate limit.
  // Outside production (local development and tests), the header may be missing or not valid, so sign in without it.
  if (!forwardedIp && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: new Error("The x-forwarded-for header is not a single valid IP."),
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
