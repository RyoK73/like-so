"use server";
import { redirect } from "next/navigation";
import { version } from "fabric";
import { createSupabaseAnonActionClient } from "@/supabase/utils/anonActionClient";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { signInAnonymously } from "@/supabase/auth/signIn";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

type NewSketchState = { error: string } | null;

// Create an empty sketch and redirect to its page. Sign in anonymously first when signed out.
// Used as the action of `useActionState`, so the first argument is the previous state.
const startNewSketch = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: NewSketchState,
): Promise<NewSketchState> => {
  const supabaseClient = await createSupabaseAnonActionClient();

  if ((await getAuthState(supabaseClient)) === "signedOut") {
    const signInResult = await signInAnonymously(supabaseClient);
    if (!signInResult.ok) {
      // TODO(#71): Log `signInResult.error` on the server.
      return { error: "サインインに失敗しました。" };
    }
  }

  // Do not pass `id`, so that this always inserts a new row.
  // width and height are filled in by the trigger (desktop_fhd), so they are omitted on purpose.
  // TODO(#68): Remove the cast to `InsertSketch` when the frame selection UI is implemented. This implementation is temporary.
  const upsertResult = await upsertSketch(supabaseClient, {
    fabric_version: version,
  } as InsertSketch);
  if (!upsertResult.ok) {
    // TODO(#71): Log `upsertResult.error` on the server.
    return { error: "スケッチの作成に失敗しました。" };
  }

  // `redirect` throws, so keep it out of try/catch.
  redirect(`/sketches/${upsertResult.value.id}`);
};

export { startNewSketch };
export type { NewSketchState };
