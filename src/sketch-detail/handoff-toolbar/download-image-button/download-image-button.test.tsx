import { render, screen } from "@testing-library/react";
import { DownloadImageButton } from "@/sketch-detail/handoff-toolbar/download-image-button/download-image-button";

const LABEL = "画像をダウンロード";

const renderButton = (isLoaded: boolean) =>
  render(
    <DownloadImageButton
      fabricCanvasRef={{ current: null }}
      frame={{ width: 400, height: 300 }}
      title="ねこ"
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
