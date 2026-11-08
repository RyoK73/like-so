import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";
import { updateUser } from "@/supabase/auth/utility";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

// `email_change` is for the code sent by `convertAnonymousUserToPermanentUser`.
type VerifyOTPType = "email" | "email_change";

const signInWithOTP = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
  email: string,
): Promise<Result<void>> => {
  const { error: signInError } = await supabaseClient.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (signInError) return { ok: false, error: signInError };
  return { ok: true, value: undefined };
};

const verifyOTP = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
  email: string,
  token: string,
  type: VerifyOTPType = "email",
): Promise<Result<void>> => {
  const { error: verifyOTPError } = await supabaseClient.auth.verifyOtp({
    email: email,
    token: token,
    type: type,
  });

  if (verifyOTPError) return { ok: false, error: verifyOTPError };
  return { ok: true, value: undefined };
};

const convertAnonymousUserToPermanentUser = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
  email: string,
): Promise<Result<void>> => {
  return await updateUser(supabaseClient, email);
};

export { signInWithOTP, verifyOTP, convertAnonymousUserToPermanentUser };
export type { VerifyOTPType };
