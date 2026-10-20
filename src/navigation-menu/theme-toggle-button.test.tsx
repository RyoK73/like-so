import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggleButton } from "@/navigation-menu/theme-toggle-button";

// Tests verify behavior from the user's perspective, not code correctness.
// Icon visibility is controlled by CSS, which makes it hard to verify from the user's perspective that the icon is displayed correctly,
// so there are no icon display tests here.

const renderThemeToggleButton = (): HTMLElement => {
  render(<ThemeToggleButton />);
  return screen.getByRole("button", { name: "テーマ切り替え" });
};

it("should show tooltip with `テーマ切り替え` on the mouse hover", async () => {
  const event = userEvent.setup();
  const button = renderThemeToggleButton();
  await event.hover(button);
  expect(await screen.findByText("テーマ切り替え")).toBeInTheDocument();
});
