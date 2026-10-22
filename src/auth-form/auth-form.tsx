"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Label } from "@/design-system/label";
import { toast } from "@/design-system/toast";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import {
  signInWithOTP,
  verifyOTP,
  convertAnonymousUserToPermanentUser,
} from "@/supabase/auth/signIn";
import { toAuthErrorInfo, type AuthErrorInfo } from "@/auth-form/auth-error";

type AuthFormProps = {
  mode: "signin" | "signup";
  isGuest: boolean;
};

type AuthFormState = {
  step: "email" | "code";
  email: string;
  error: AuthErrorInfo | null;
};

const initialState: AuthFormState = { step: "email", email: "", error: null };

const AuthForm = ({ mode, isGuest }: AuthFormProps) => {
  const router = useRouter();

  // A guest keeps the same user id by attaching the email to the guest user.
  // The code of that flow is verified as `email_change`.
  const convertsGuest = isGuest && mode === "signup";

  const sendCode = async (email: string): Promise<AuthErrorInfo | null> => {
    const supabaseClient = createSupabaseBrowserClient();
    const result = convertsGuest
      ? await convertAnonymousUserToPermanentUser(supabaseClient, email)
      : await signInWithOTP(supabaseClient, email);

    return result.ok ? null : toAuthErrorInfo(result.error);
  };

  // The form is reset after the action, so every returned state keeps `email` to restore the field.
  const submit = async (
    prev: AuthFormState,
    formData: FormData,
  ): Promise<AuthFormState> => {
    switch (formData.get("intent")) {
      case "send": {
        const email = String(formData.get("email") ?? ""); // `?? ""` is to confirm that `email` is string.
        const error = await sendCode(email);
        return { step: error ? "email" : "code", email, error };
      }
      case "resend": {
        const error = await sendCode(prev.email);
        if (!error) {
          toast.add({ type: "success", title: "コードを再送しました" });
        }
        return { ...prev, error };
      }
      case "verify": {
        const result = await verifyOTP(
          createSupabaseBrowserClient(),
          prev.email,
          String(formData.get("code") ?? ""),
          convertsGuest ? "email_change" : "email",
        );

        if (!result.ok)
          return { ...prev, error: toAuthErrorInfo(result.error) };
        router.push("/sketches");
        router.refresh();
        return { ...prev, error: null };
      }
      case "change":
        return { step: "email", email: prev.email, error: null };
      default:
        return prev;
    }
  };

  const [state, formAction, isPending] = useActionState(submit, initialState);

  return (
    <div className="mx-auto my-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-6 shadow-float">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "signin"
          ? "サインイン"
          : isGuest
            ? "他の端末でも使えるようにする"
            : "新規登録"}
      </h1>

      {mode === "signin" && isGuest && (
        <p>
          現在はゲストとして利用中です。サインインすると、このゲストのスケッチは表示されなくなります。
        </p>
      )}
      {mode === "signup" && isGuest && (
        <p>
          メールアドレスを登録すると、今のスケッチを引き継いだまま、他の端末でも使えます。
        </p>
      )}
      {!isGuest && (
        <p>
          メールアドレスにコードを送ります。アカウントがない場合は、新しく作成されます。
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-email">メールアドレス</Label>
          <Input
            id="auth-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            readOnly={state.step === "code"}
          />
        </div>

        {state.step === "code" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="auth-code">確認コード(6桁)</Label>
            <Input
              id="auth-code"
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </div>
        )}

        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error.message}
            {state.error.suggestSignIn && (
              <>
                {" "}
                <Link href="/signin" className="underline">
                  サインインする
                </Link>
              </>
            )}
          </p>
        )}

        {/* The first submit button is used by the Enter key, so the main one comes first. */}
        <Button
          type="submit"
          name="intent"
          value={state.step === "email" ? "send" : "verify"}
          disabled={isPending}
        >
          {state.step === "email" ? "コードを送信" : "認証する"}
        </Button>

        {state.step === "code" && (
          <div className="flex gap-2">
            <Button
              type="submit"
              name="intent"
              value="resend"
              formNoValidate
              variant="outline"
              disabled={isPending}
            >
              コードを再送
            </Button>
            <Button
              type="submit"
              name="intent"
              value="change"
              formNoValidate
              variant="default"
              disabled={isPending}
            >
              メールアドレスを変更
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export { AuthForm };
export type { AuthFormProps };
