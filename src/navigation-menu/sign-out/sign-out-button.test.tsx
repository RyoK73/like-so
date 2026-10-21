import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOutAction } from "@/navigation-menu/sign-out/signOutAction";
import { SignOutButton } from "@/navigation-menu/sign-out/sign-out-button";
import { Toaster } from "@/design-system/toast";

vi.mock("@/navigation-menu/sign-out/signOutAction", () => ({
  signOutAction: vi.fn(),
}));

vi.mock("react-icons/lu", () => ({
  LuLogOut: () => <svg data-testid="LuLogOut" />,
}));

const renderSignOutButton = (): HTMLElement => {
  render(
    <Toaster>
      <SignOutButton />
    </Toaster>,
  );
  return screen.getByRole("button", { name: "サインアウト" });
};

afterEach(() => {
  vi.resetAllMocks();
});
it("should have `LuLogOut` icon", () => {
  const button = renderSignOutButton();
  expect(within(button).getByTestId("LuLogOut")).toBeInTheDocument();
});

it("should call `signOutAction` when the button is clicked", async () => {
  const event = userEvent.setup();
  const button = renderSignOutButton();
  await event.click(button);

  expect(signOutAction).toHaveBeenCalled();
});

it("should show toast when signOutAction returns `{error}`", async () => {
  vi.mocked(signOutAction).mockResolvedValue({
    error: "サインアウトに失敗しました",
  });

  const event = userEvent.setup();
  const button = renderSignOutButton();
  await event.click(button);

  expect(
    await screen.findByText("サインアウトに失敗しました"),
  ).toBeInTheDocument();
});

it("should be disabled while isPending is true", async () => {
  let resolveLoad: (value: any) => void = () => {};
  vi.mocked(signOutAction).mockReturnValue(
    new Promise((resolve) => {
      resolveLoad = resolve;
    }),
  );
  const event = userEvent.setup();
  const button = renderSignOutButton();
  await event.click(button);

  expect(button).toBeDisabled();
  await act(async () => {
    resolveLoad(undefined);
  });
  expect(button).not.toBeDisabled();
});
