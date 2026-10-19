import { render, screen } from "@testing-library/react";
import { LandingPage } from "@/landing-page/landing-page";
import { getAuthState, type AuthState } from "@/supabase/auth/getAuthState";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";

vi.mock("@/supabase/utils/serverClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/supabase/auth/getAuthState", () => ({ getAuthState: vi.fn() }));
vi.mock("@/new-sketch/start-new-sketch", () => ({ startNewSketch: vi.fn() }));

const guestRegisterName = "アカウント登録（他の端末でも使えるようにする）";

const renderLandingPage = async (authState: AuthState) => {
  vi.mocked(getAuthState).mockResolvedValue(authState);
  render(await LandingPage());
};

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      {} as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
  });

  test.each<AuthState>(["signedOut", "guest", "registered"])(
    "should render the app name as the heading when %s",
    async (authState) => {
      await renderLandingPage(authState);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "ひらめきを、描いて、渡す",
        }),
      ).toBeInTheDocument();
    },
  );

  test("should render the continue-as-guest button and the signup and signin links when signedOut", async () => {
    await renderLandingPage("signedOut");

    expect(
      screen.getByRole("button", { name: "新規スケッチ作成" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "サインアップ" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.getByRole("link", { name: "サインイン" })).toHaveAttribute(
      "href",
      "/signin",
    );
    expect(
      screen.queryByRole("link", { name: "スケッチ一覧へ" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: guestRegisterName }),
    ).not.toBeInTheDocument();
  });

  test("should render the sketch list link and the register link when guest", async () => {
    await renderLandingPage("guest");

    expect(
      screen.getByRole("link", { name: "スケッチ一覧へ" }),
    ).toHaveAttribute("href", "/sketches");
    expect(
      screen.getByRole("link", { name: guestRegisterName }),
    ).toHaveAttribute("href", "/signup");
    expect(
      screen.queryByRole("button", { name: "新規スケッチ作成" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "サインイン" }),
    ).not.toBeInTheDocument();
  });

  test("should render only the sketch list link when registered", async () => {
    await renderLandingPage("registered");

    expect(
      screen.getByRole("link", { name: "スケッチ一覧へ" }),
    ).toHaveAttribute("href", "/sketches");
    expect(
      screen.queryByRole("link", { name: guestRegisterName }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "新規スケッチ作成" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "サインイン" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
