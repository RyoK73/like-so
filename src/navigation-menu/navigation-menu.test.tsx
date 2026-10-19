import { getAuthState } from "@/supabase/auth/getAuthState";
import { NavigationMenu } from "@/navigation-menu/navigation-menu";
import { render, screen, within } from "@testing-library/react";

vi.mock("@/supabase/auth/getAuthState", () => ({
  getAuthState: vi.fn(),
}));
vi.mock("@/supabase/utils/serverClient", () => ({
  createSupabaseServerClient: () => {},
}));

it("should show SketchListLink, NewSketchButton, ThemeToggleButton, SignOutButton, SignUpButton for the guest user", async () => {
  vi.mocked(getAuthState).mockResolvedValue("guest");
  render(await NavigationMenu());
  const navigation = screen.getByRole("navigation", {
    name: "ナビゲーションメニュー",
  });
  const items = within(navigation).getAllByRole("listitem");
  expect(items).toHaveLength(5);
  expect(
    within(items[0]).getByRole("link", { name: "スケッチ一覧へ" }),
  ).toBeInTheDocument();
  expect(
    within(items[1]).getByRole("button", { name: "新規スケッチ作成" }),
  ).toBeInTheDocument();
  expect(
    within(items[2]).getByRole("button", { name: "テーマ切り替え" }),
  ).toBeInTheDocument();
  expect(
    within(items[3]).getByRole("button", { name: "サインアウト" }),
  ).toBeInTheDocument();
  expect(
    within(items[4]).getByRole("link", { name: "アカウント登録" }),
  ).toBeInTheDocument();
});
it("should show SketchListLink, NewSketchButton, ThemeToggleButton, SignOutButton for the registered user", async () => {
  vi.mocked(getAuthState).mockResolvedValue("registered");
  render(await NavigationMenu());
  const navigation = screen.getByRole("navigation", {
    name: "ナビゲーションメニュー",
  });
  const items = within(navigation).getAllByRole("listitem");
  expect(items).toHaveLength(4);
  expect(
    within(items[0]).getByRole("link", { name: "スケッチ一覧へ" }),
  ).toBeInTheDocument();
  expect(
    within(items[1]).getByRole("button", { name: "新規スケッチ作成" }),
  ).toBeInTheDocument();
  expect(
    within(items[2]).getByRole("button", { name: "テーマ切り替え" }),
  ).toBeInTheDocument();
  expect(
    within(items[3]).getByRole("button", { name: "サインアウト" }),
  ).toBeInTheDocument();
});
it("should show nothing for the signout user", async () => {
  vi.mocked(getAuthState).mockResolvedValue("signedOut");
  render(await NavigationMenu());
  const navigation = screen.queryByRole("navigation", {
    name: "ナビゲーションメニュー",
  });
  expect(navigation).toBeNull();
});
it("should throw an error when an error occurs", async () => {
  const error = new Error("Test Error");
  vi.mocked(getAuthState).mockRejectedValue(error);
  await expect(NavigationMenu()).rejects.toBe(error);
});
