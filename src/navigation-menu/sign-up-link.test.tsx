import { SignUpLink } from "@/navigation-menu/sign-up-link";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-icons/lu", () => ({
  LuUserRoundPlus: () => <svg data-testid="LuUserRoundPlus" />,
}));

it("should have href attribute that has `/signup`", () => {
  render(<SignUpLink />);
  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "/signup");
});

it("should have `LuUserRoundPlus` icons", () => {
  render(<SignUpLink />);
  const link = screen.getByRole("link");
  expect(within(link).getByTestId("LuUserRoundPlus")).toBeInTheDocument();
});

it("should show tooltip with `サインアップ登録` on the mouse hover", async () => {
  const event = userEvent.setup();
  render(<SignUpLink />);
  const link = screen.getByRole("link");
  await event.hover(link);
  expect(await screen.findByText("サインアップ登録")).toBeInTheDocument();
});
