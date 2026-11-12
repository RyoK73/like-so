type AuthErrorInfo = {
  message: string;
  // Whether the user should be led to /signin (the email is already registered).
  suggestSignIn: boolean;
};

// Supabase's `AuthError` has `code`, but `Result` only guarantees `Error`.
const getErrorCode = (error: Error): string | undefined => {
  if (!("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
};

const toAuthErrorInfo = (error: Error): AuthErrorInfo => {
  switch (getErrorCode(error)) {
    case "email_exists":
      return {
        message:
          "このメールアドレスは登録済みです。別のメールアドレスを入力するか、サインインしてください。",
        suggestSignIn: true,
      };
    case "over_email_send_rate_limit":
      return {
        message:
          "短時間にコードを送信しすぎました。しばらくしてからもう一度お試しください。",
        suggestSignIn: false,
      };
    // Supabase returns this for both a wrong code and an expired code.
    case "otp_expired":
      return {
        message: "コードが正しくないか、有効期限が切れています",
        suggestSignIn: false,
      };
    case "validation_failed":
    case "email_address_invalid":
      return {
        message: "メールアドレスの形式を確認してください",
        suggestSignIn: false,
      };
    default:
      return {
        message: "処理に失敗しました。時間をおいてもう一度お試しください。",
        suggestSignIn: false,
      };
  }
};

export { toAuthErrorInfo };
export type { AuthErrorInfo };
