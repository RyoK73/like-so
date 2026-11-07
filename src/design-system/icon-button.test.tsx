import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "@/design-system/icon-button";
import { ComponentProps } from "react";

const LABEL = "削除";
const LABEL_HINT = "Deleteキー";
const renderIconButton = (
  props?: Partial<ComponentProps<typeof IconButton>>,
) => {
  render(
    <IconButton label={LABEL} side="right" {...props}>
      <svg />
    </IconButton>,
  );
};

it("should use `label` as the accessible name and the tooltip on hover", async () => {
  const event = userEvent.setup();
  renderIconButton();

  const button = screen.getByRole("button", { name: LABEL });
  await event.hover(button);
  expect(await screen.findByText(LABEL)).toBeInTheDocument();
});

it("should show `label(tooltipHint)` in the tooltip on hover", async () => {
  const event = userEvent.setup();
  renderIconButton({ tooltipHint: LABEL_HINT });

  await event.hover(screen.getByRole("button", { name: LABEL }));
  expect(
    await screen.findByText(`${LABEL}(${LABEL_HINT})`),
  ).toBeInTheDocument();
});

it("should not include `tooltipHint` in the accessible name", () => {
  renderIconButton({ tooltipHint: LABEL_HINT });

  expect(screen.getByRole("button")).toHaveAccessibleName(LABEL);
});

it("should show only `label` in the tooltip when `tooltipHint` is not given", async () => {
  const event = userEvent.setup();
  renderIconButton();

  await event.hover(screen.getByRole("button", { name: LABEL }));
  expect(await screen.findByText(LABEL)).toBeInTheDocument();
  expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
});

it("should be disabled when `disabled` is given", () => {
  renderIconButton({ disabled: true });

  expect(screen.getByRole("button", { name: LABEL })).toBeDisabled();
});
