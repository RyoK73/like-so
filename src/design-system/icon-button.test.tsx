import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "@/design-system/icon-button";

const LABEL = "テスト操作";

it("should use `label` as the accessible name and the tooltip on hover", async () => {
  const event = userEvent.setup();
  render(
    <IconButton label={LABEL} side="right">
      <svg />
    </IconButton>,
  );
  const button = screen.getByRole("button", { name: LABEL });
  await event.hover(button);
  expect(await screen.findByText(LABEL)).toBeInTheDocument();
});

it("should be disabled when `disabled` is given", () => {
  render(
    <IconButton label={LABEL} side="right" disabled>
      <svg />
    </IconButton>,
  );
  expect(screen.getByRole("button", { name: LABEL })).toBeDisabled();
});
