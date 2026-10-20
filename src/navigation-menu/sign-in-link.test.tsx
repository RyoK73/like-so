import { SignInLink } from "@/navigation-menu/sign-in-link";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-icons/lu", () => ({
  LuLogIn: () => <svg data-testid="LuLogIn" />,
}));

it("should have href attribute that has `/signin`", () => {
  render(<SignInLink />);
  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "/signin");
});

it("should have `LuLogIn` icons", () => {
  render(<SignInLink />);
  const link = screen.getByRole("link", { name: "サインイン" });
  expect(within(link).getByTestId("LuLogIn")).toBeInTheDocument();
});

it("should show tooltip with `サインイン` on the mouse hover", async () => {
  const event = userEvent.setup();
  render(<SignInLink />);
  const link = screen.getByRole("link", { name: "サインイン" });
  await event.hover(link);
  expect(await screen.findByText("サインイン")).toBeInTheDocument();
});
