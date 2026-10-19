import Link from "next/link";
import { buttonVariants } from "@/design-system/button";
import { NewSketchButton } from "@/new-sketch";
import { Introduction } from "@/landing-page/introduction";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";

const LandingPage = async () => {
  const supabaseClient = await createSupabaseServerClient();
  const authState = await getAuthState(supabaseClient);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center text-foreground">
      <Introduction />
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {authState === "signedOut" && (
          <>
            <NewSketchButton ariaLabel="ゲストとして続ける">
              ゲストとして続ける
            </NewSketchButton>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "outline" })}
            >
              サインアップ
            </Link>
            <Link
              href="/signin"
              className={buttonVariants({ variant: "outline" })}
            >
              サインイン
            </Link>
          </>
        )}
        {authState === "guest" && (
          <>
            <Link href="/sketches" className={buttonVariants()}>
              スケッチ一覧へ
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "outline" })}
            >
              アカウント登録（他の端末でも使えるようにする）
            </Link>
          </>
        )}
        {authState === "registered" && (
          <Link href="/sketches" className={buttonVariants()}>
            スケッチ一覧へ
          </Link>
        )}
      </div>
    </main>
  );
};

export { LandingPage };
