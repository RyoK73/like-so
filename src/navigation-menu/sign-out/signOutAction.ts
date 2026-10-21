"use server";
import { signOut } from "@/supabase/auth/signOut";
import { SignOutState } from "@/navigation-menu/sign-out/sign-out-button";
import { createSupabaseActionClient } from "@/supabase/utils/actionClient";
import { redirect } from "next/navigation";

const signOutAction = async (): Promise<SignOutState> => {
  const supabaseClient = await createSupabaseActionClient();
  const result = await signOut(supabaseClient);
  if (!result.ok) return { error: "サインアウトに失敗しました" };
  redirect("/");
};

export { signOutAction };
