import { signOut } from "@/supabase/auth/signOut";
import { signOutAction } from "@/navigation-menu/sign-out/signOutAction";
import { redirect } from "next/navigation";

vi.mock("@/supabase/utils/actionClient", () => ({
  createSupabaseActionClient: vi.fn(),
}));
vi.mock("@/supabase/auth/signOut", () => ({
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

it("should call `redirect` with `/` when `ok: true` is returned ", async () => {
  vi.mocked(signOut).mockResolvedValue({ ok: true, value: undefined });
  await signOutAction();
  expect(redirect).toHaveBeenCalledWith("/");
});

it("should return error: 'サインアウトに失敗しました' and not call `redirect` when `ok: false` is returned", async () => {
  vi.mocked(signOut).mockResolvedValue({ ok: false, error: new Error("test") });
  const result = await signOutAction();
  expect(result).toEqual({ error: "サインアウトに失敗しました" });
  expect(redirect).not.toHaveBeenCalled();
});
