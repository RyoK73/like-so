// TODO:
// [x] `/sketches`へのhrefを持ったリンクである
// [x] `LuLibraryBig`アイコンを子として持っている
// [x] マウスホバー時に`スケッチ一覧へ`と表示される
// [x] 現在`/sketches`にいる場合、強調表示される

import { render, screen, within } from "@testing-library/react";
import { SketchListLink } from "@/navigation-menu/sketch-list-link";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";

vi.mock("react-icons/lu", () => ({
  LuLibraryBig: () => <svg data-testid="LuLibraryBig" />,
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const renderLink = (): HTMLElement => {
  render(<SketchListLink />);
  return screen.getByRole("link", { name: "スケッチ一覧へ" });
};

it("should have an href attribute that has `/sketches`", () => {
  const link = renderLink();
  expect(link).toHaveAttribute("href", "/sketches");
});

it("should have a `LuLibraryBig` icon", () => {
  const link = renderLink();
  expect(within(link).getByTestId("LuLibraryBig")).toBeInTheDocument();
});

it("should show tooltip with `スケッチ一覧へ` on the mouse hover", async () => {
  const event = userEvent.setup();
  const link = renderLink();
  await event.hover(link);
  expect(await screen.findByText("スケッチ一覧へ")).toBeInTheDocument();
});
describe("Verify the display staus according to pathname", () => {
  it("should have `primary-text-light` classname when the path is `/sketches`", () => {
    vi.mocked(usePathname).mockReturnValue("/sketches");
    const link = renderLink();
    expect(link).toHaveClass("primary-text-light");
  });

  it("should not have `primary-text-light` classname when the path is not `/sketches`", () => {
    vi.mocked(usePathname).mockReturnValue("/sketches/foo");
    const link = renderLink();
    expect(link).not.toHaveClass("primary-text-light");
  });
});
