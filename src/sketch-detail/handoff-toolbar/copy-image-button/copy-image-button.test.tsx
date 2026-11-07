import { render, screen } from "@testing-library/react";
import { CopyImageButton } from "@/sketch-detail/handoff-toolbar/copy-image-button/copy-image-button";

const LABEL = "画像をコピー";

const renderButton = (isLoaded: boolean) =>
  render(
    <CopyImageButton
      fabricCanvasRef={{ current: null }}
      frame={{ width: 400, height: 300 }}
      isLoaded={isLoaded}
    />,
  );

it("should be disabled while the canvas is not loaded", () => {
  renderButton(false);

  expect(screen.getByRole("button", { name: LABEL })).toBeDisabled();
});

it("should be enabled when the canvas is loaded", () => {
  renderButton(true);

  expect(screen.getByRole("button", { name: LABEL })).toBeEnabled();
});
