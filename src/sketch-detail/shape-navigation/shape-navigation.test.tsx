import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShapeNavigation } from "@/sketch-detail/shape-navigation/shape-navigation";

const RECT_LABEL = "四角形を追加";
const CIRCLE_LABEL = "円を追加";

const renderNavigation = (disabled = false) => {
  const onAddShape = vi.fn();
  render(<ShapeNavigation disabled={disabled} onAddShape={onAddShape} />);
  return { onAddShape };
};

it("should render a toolbar named `図形の追加`", () => {
  renderNavigation();

  expect(
    screen.getByRole("toolbar", { name: "図形の追加" }),
  ).toBeInTheDocument();
});

it("should call `onAddShape` with `rect` once when the rectangle button is clicked", async () => {
  const user = userEvent.setup();
  const { onAddShape } = renderNavigation();

  await user.click(screen.getByRole("button", { name: RECT_LABEL }));

  expect(onAddShape).toHaveBeenCalledExactlyOnceWith("rect");
});

it("should call `onAddShape` with `circle` once when the circle button is clicked", async () => {
  const user = userEvent.setup();
  const { onAddShape } = renderNavigation();

  await user.click(screen.getByRole("button", { name: CIRCLE_LABEL }));

  expect(onAddShape).toHaveBeenCalledExactlyOnceWith("circle");
});

it("should enable both buttons when `disabled` is false", () => {
  renderNavigation(false);

  expect(screen.getByRole("button", { name: RECT_LABEL })).toBeEnabled();
  expect(screen.getByRole("button", { name: CIRCLE_LABEL })).toBeEnabled();
});

it("should disable both buttons and not call `onAddShape` when `disabled` is true", async () => {
  const user = userEvent.setup();
  const { onAddShape } = renderNavigation(true);
  const rectButton = screen.getByRole("button", { name: RECT_LABEL });
  const circleButton = screen.getByRole("button", { name: CIRCLE_LABEL });

  await user.click(rectButton);
  await user.click(circleButton);

  expect(rectButton).toBeDisabled();
  expect(circleButton).toBeDisabled();
  expect(onAddShape).not.toHaveBeenCalled();
});

it("should show a rectangle icon in the rectangle button", () => {
  renderNavigation();

  const button = screen.getByRole("button", { name: RECT_LABEL });

  expect(button.querySelector("svg")).toBeInTheDocument();
  expect(button.querySelector("svg rect")).toBeInTheDocument();
});

it("should show a circle icon in the circle button", () => {
  renderNavigation();

  const button = screen.getByRole("button", { name: CIRCLE_LABEL });

  expect(button.querySelector("svg")).toBeInTheDocument();
  expect(button.querySelector("svg circle")).toBeInTheDocument();
});

it("should show the tooltip when the rectangle button is hovered", async () => {
  const user = userEvent.setup();
  renderNavigation();

  await user.hover(screen.getByRole("button", { name: RECT_LABEL }));

  expect(await screen.findByText(RECT_LABEL)).toBeInTheDocument();
});

it("should show the tooltip when the circle button is hovered", async () => {
  const user = userEvent.setup();
  renderNavigation();

  await user.hover(screen.getByRole("button", { name: CIRCLE_LABEL }));

  expect(await screen.findByText(CIRCLE_LABEL)).toBeInTheDocument();
});
