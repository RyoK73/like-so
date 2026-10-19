import { NewSketchIconButton } from "@/navigation-menu/new-sketch-icon-button";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-icons/lu", () => ({
  LuSquarePlus: () => <svg data-testid="LuSquarePlus" />,
}));
vi.mock("@/new-sketch/start-new-sketch", () => ({ startNewSketch: vi.fn() }));
const ARIA_LABEL = "新規スケッチ作成";

it("should have a `LuSquarePlus` icon", () => {
  render(<NewSketchIconButton />);
  const button = screen.getByRole("button", { name: ARIA_LABEL });
  expect(within(button).getByTestId("LuSquarePlus")).toBeInTheDocument();
});

it("should show tooltip with `新規スケッチ作成` on the mouse hover", async () => {
  const event = userEvent.setup();
  render(<NewSketchIconButton />);
  const button = screen.getByRole("button", { name: ARIA_LABEL });
  await event.hover(button);
  expect(await screen.findByText("新規スケッチ作成")).toBeInTheDocument();
});
