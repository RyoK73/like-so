import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/auth-form/auth-form";
import {
  signInWithOTP,
  verifyOTP,
  convertAnonymousUserToPermanentUser,
} from "@/supabase/auth/signIn";
import { toast } from "@/design-system/toast";

const push = vi.fn();
const refresh = vi.fn();
const fakeClient = { fake: "client" };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/supabase/utils/browserClient", () => ({
  createSupabaseBrowserClient: () => fakeClient,
}));

vi.mock("@/supabase/auth/signIn", () => ({
  signInWithOTP: vi.fn(),
  verifyOTP: vi.fn(),
  convertAnonymousUserToPermanentUser: vi.fn(),
}));

vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

const ok = { ok: true, value: undefined } as const;

const fail = (code: string) =>
  ({ ok: false, error: Object.assign(new Error("e"), { code }) }) as const; // `Object.assign` acts AuthError type.

// jsdom ignores `formnovalidate` of a submit button, unlike browsers.
// So fill the required code field before resending or changing the email.
const typeCode = async (code = "123456") => {
  await userEvent.type(await screen.findByLabelText("確認コード（6桁）"), code);
};

const sendCode = async (email = "a@example.com") => {
  await userEvent.type(screen.getByLabelText("メールアドレス"), email);
  await userEvent.click(screen.getByRole("button", { name: "コードを送信" }));
};

describe("AuthForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(signInWithOTP).mockResolvedValue(ok);
    vi.mocked(verifyOTP).mockResolvedValue(ok);
    vi.mocked(convertAnonymousUserToPermanentUser).mockResolvedValue(ok);
  });

  test("should show only the email field at first", () => {
    render(<AuthForm mode="signin" isGuest={false} />);

    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("確認コード（6桁）"),
    ).not.toBeInTheDocument();
  });

  test.each(["signin", "signup"] as const)(
    "should send the code with signInWithOTP in %s when signed out",
    async (mode) => {
      render(<AuthForm mode={mode} isGuest={false} />);

      await sendCode();

      expect(signInWithOTP).toHaveBeenCalledWith(fakeClient, "a@example.com");
      expect(convertAnonymousUserToPermanentUser).not.toHaveBeenCalled();
    },
  );

  test("should show the code field and keep the email read-only after sending", async () => {
    render(<AuthForm mode="signin" isGuest={false} />);

    await sendCode();

    expect(await screen.findByLabelText("確認コード（6桁）")).toHaveAttribute(
      "autocomplete",
      "one-time-code",
    );
    expect(screen.getByLabelText("メールアドレス")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("メールアドレス")).toHaveValue(
      "a@example.com",
    );
  });

  test("should verify the code as email and go to /sketches when signed out", async () => {
    render(<AuthForm mode="signin" isGuest={false} />);
    await sendCode();

    await userEvent.type(
      await screen.findByLabelText("確認コード（6桁）"),
      "123456",
    );
    await userEvent.click(screen.getByRole("button", { name: "認証する" }));

    expect(verifyOTP).toHaveBeenCalledWith(
      fakeClient,
      "a@example.com",
      "123456",
      "email",
    );
    expect(push).toHaveBeenCalledWith("/sketches");
    expect(refresh).toHaveBeenCalled();
  });

  test("should convert the guest and verify the code as email_change on /signup", async () => {
    render(<AuthForm mode="signup" isGuest={true} />);

    await sendCode();
    await userEvent.type(
      await screen.findByLabelText("確認コード（6桁）"),
      "123456",
    );
    await userEvent.click(screen.getByRole("button", { name: "認証する" }));

    expect(convertAnonymousUserToPermanentUser).toHaveBeenCalledWith(
      fakeClient,
      "a@example.com",
    );
    expect(signInWithOTP).not.toHaveBeenCalled();
    expect(verifyOTP).toHaveBeenCalledWith(
      fakeClient,
      "a@example.com",
      "123456",
      "email_change",
    );
  });

  test("should treat a guest on /signin as a normal sign-in and warn about the sketches", async () => {
    render(<AuthForm mode="signin" isGuest={true} />);

    expect(
      screen.getByText(/ゲストのスケッチは表示されなくなります/),
    ).toBeInTheDocument();

    await sendCode();
    expect(signInWithOTP).toHaveBeenCalledWith(fakeClient, "a@example.com");
    expect(convertAnonymousUserToPermanentUser).not.toHaveBeenCalled();
  });

  test("should show an error with a /signin link when the email is already registered", async () => {
    vi.mocked(convertAnonymousUserToPermanentUser).mockResolvedValue(
      fail("email_exists"),
    );
    render(<AuthForm mode="signup" isGuest={true} />);

    await sendCode();

    expect(await screen.findByRole("alert")).toHaveTextContent("登録済み");
    expect(
      screen.getByRole("link", { name: "サインインする" }),
    ).toHaveAttribute("href", "/signin");
    expect(
      screen.queryByLabelText("確認コード（6桁）"),
    ).not.toBeInTheDocument();
  });

  test("should keep the typed email when sending the code fails", async () => {
    vi.mocked(signInWithOTP).mockResolvedValue(fail("validation_failed"));
    render(<AuthForm mode="signin" isGuest={false} />);

    await sendCode("a@example.com");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toHaveValue(
      "a@example.com",
    );
  });

  test("should keep the email, clear the code, not navigate when the code is wrong", async () => {
    vi.mocked(verifyOTP).mockResolvedValue(fail("otp_expired"));
    render(<AuthForm mode="signin" isGuest={false} />);
    await sendCode();

    await userEvent.type(
      await screen.findByLabelText("確認コード（6桁）"),
      "000000",
    );
    await userEvent.click(screen.getByRole("button", { name: "認証する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "コードが正しくない",
    );
    expect(screen.getByLabelText("メールアドレス")).toHaveValue(
      "a@example.com",
    );
    expect(screen.getByLabelText("確認コード（6桁）")).toHaveValue("");
    expect(push).not.toHaveBeenCalled();
  });

  test("should resend the code and show a toast", async () => {
    render(<AuthForm mode="signin" isGuest={false} />);
    await sendCode();

    await typeCode();
    await userEvent.click(screen.getByRole("button", { name: "コードを再送" }));

    expect(signInWithOTP).toHaveBeenCalledTimes(2);
    expect(toast.add).toHaveBeenCalledWith({
      type: "success",
      title: "コードを再送しました",
    });
  });

  test("should show an inline error when resending hits the rate limit", async () => {
    render(<AuthForm mode="signin" isGuest={false} />);
    await sendCode();
    vi.mocked(signInWithOTP).mockResolvedValue(
      fail("over_email_send_rate_limit"),
    );

    await typeCode();
    await userEvent.click(screen.getByRole("button", { name: "コードを再送" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("送信しすぎ");
    expect(toast.add).not.toHaveBeenCalled();
  });

  test("should go back to the email step when the email is changed", async () => {
    render(<AuthForm mode="signin" isGuest={false} />);
    await sendCode();

    await typeCode();
    await userEvent.click(
      screen.getByRole("button", { name: "メールアドレスを変更" }),
    );

    expect(
      screen.queryByLabelText("確認コード（6桁）"),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).not.toHaveAttribute(
      "readonly",
    );
    expect(
      screen.getByRole("button", { name: "コードを送信" }),
    ).toBeInTheDocument();
  });

  test("should disable the submit button while sending", async () => {
    let resolveSend: (value: typeof ok) => void = () => {};
    vi.mocked(signInWithOTP).mockReturnValue(
      new Promise((resolve) => {
        resolveSend = resolve;
      }),
    );
    render(<AuthForm mode="signin" isGuest={false} />);

    await sendCode();
    expect(screen.getByRole("button", { name: "コードを送信" })).toBeDisabled();

    resolveSend(ok);
    expect(
      await screen.findByLabelText("確認コード（6桁）"),
    ).toBeInTheDocument();
  });
});
