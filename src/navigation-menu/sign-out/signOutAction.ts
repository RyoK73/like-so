"use server";
import { signOut } from "@/supabase/auth/signOut";
import { createSupabaseActionClient } from "@/supabase/utils/actionClient";
import { redirect } from "next/navigation";

type SignOutState = { error: string } | undefined;

const signOutAction = async (): Promise<SignOutState> => {
  const supabaseClient = await createSupabaseActionClient();
  const result = await signOut(supabaseClient);
  if (!result.ok) {
    // TODO(#71): Log `result.error` on the server.
    return { error: "サインアウトに失敗しました" };
  }
  redirect("/");
};

export { signOutAction };
