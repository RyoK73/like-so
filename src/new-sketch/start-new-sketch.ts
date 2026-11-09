"use server";
import { redirect } from "next/navigation";
import { version } from "fabric";
import { createSupabaseAnonActionClient } from "@/supabase/utils/anonActionClient";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { signInAnonymouslyWithForwardedIp } from "@/supabase/auth/anonymousSignIn/signInAnonymouslyWithForwardedIp";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";
import { isSketchLimitError } from "@/supabase/sketch-crud/sketchLimit";

type NewSketchState = { error: string } | null;

// Create an empty sketch and redirect to its page. Sign in anonymously first when signed out.
// Used as the action of `useActionState`, so the first argument is the previous state.
const startNewSketch = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: NewSketchState,
): Promise<NewSketchState> => {
  let supabaseClient = await createSupabaseAnonActionClient();

  if ((await getAuthState(supabaseClient)) === "signedOut") {
    // The sign-in uses its own client, so this client does not know the new session.
    const signInResult = await signInAnonymouslyWithForwardedIp();
    if (!signInResult.ok) {
      // TODO(#71): Log `signInResult.error` on the server.
      return { error: "サインインに失敗しました。" };
    }
    // Create the client again, so that it reads the session cookies written by the sign-in.
    supabaseClient = await createSupabaseAnonActionClient();
  }

  // Do not pass `id`, so that this always inserts a new row.
  // width and height are filled in by the trigger (desktop_fhd), so they are omitted on purpose.
  // TODO(#68): Remove the cast to `InsertSketch` when the frame selection UI is implemented. This implementation is temporary.
  const upsertResult = await upsertSketch(supabaseClient, {
    fabric_version: version,
  } as InsertSketch);
  if (!upsertResult.ok) {
    if (isSketchLimitError(upsertResult.error)) {
      return { error: "スケッチの作成上限に達しました。" };
    }
    // TODO(#71): Log `upsertResult.error` on the server.
    return { error: "スケッチの作成に失敗しました。" };
  }

  // `redirect` throws, so keep it out of try/catch.
  redirect(`/sketches/${upsertResult.value.id}`);
};

export { startNewSketch };
export type { NewSketchState };
