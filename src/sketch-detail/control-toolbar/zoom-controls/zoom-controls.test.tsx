import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "@/design-system/toast";
import { ZoomControls } from "@/sketch-detail/control-toolbar/zoom-controls/zoom-controls";

vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

const TOAST_ID = "zoom-input-issue";

type Props = Partial<React.ComponentProps<typeof ZoomControls>>;

const createProps = (override: Props = {}) => ({
  zoom: 1,
  initialZoom: 1,
  disabled: false,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onSetZoom: vi.fn(),
  ...override,
});

const renderControls = (override: Props = {}) => {
  const props = createProps(override);
  const view = render(<ZoomControls {...props} />);
  const rerenderWith = (next: Props) =>
    view.rerender(<ZoomControls {...props} {...next} />);
  return { props, rerenderWith };
};

const getZoomIn = () => screen.getByRole("button", { name: "拡大" });
const getZoomOut = () => screen.getByRole("button", { name: "縮小" });
const getInput = () => screen.getByRole("textbox", { name: "倍率" });

const commitText = async (text: string) => {
  const user = userEvent.setup();
  const input = getInput();
  await user.clear(input);
  if (text !== "") await user.type(input, text);
  await user.keyboard("{Enter}");
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("disabled", () => {
  it("should disable only the zoom in button at the max zoom", () => {
    renderControls({ zoom: 4 });

    expect(getZoomIn()).toBeDisabled();
    expect(getZoomOut()).toBeEnabled();
  });

  it("should disable only the zoom out button at the min zoom", () => {
    renderControls({ zoom: 0.1 });

    expect(getZoomOut()).toBeDisabled();
    expect(getZoomIn()).toBeEnabled();
  });

  it("should enable both buttons at zoom 1", () => {
    renderControls({ zoom: 1 });

    expect(getZoomIn()).toBeEnabled();
    expect(getZoomOut()).toBeEnabled();
  });

  it("should disable the buttons and the input when `disabled` is true", () => {
    renderControls({ disabled: true });

    expect(getZoomIn()).toBeDisabled();
    expect(getZoomOut()).toBeDisabled();
    expect(getInput()).toBeDisabled();
  });
});

// The initial zoom (the fitted view) is 100%, and the range is 10% to 400% of it.
describe("with an initial zoom of 0.6", () => {
  it("should show 100 and enable both buttons at the initial zoom", () => {
    renderControls({ zoom: 0.6, initialZoom: 0.6 });

    expect(getInput()).toHaveValue("100");
    expect(getZoomIn()).toBeEnabled();
    expect(getZoomOut()).toBeEnabled();
  });

  it("should show the percent of the initial zoom", () => {
    renderControls({ zoom: 0.5, initialZoom: 0.6 });

    expect(getInput()).toHaveValue("83");
  });

  it("should disable only the zoom in button at 400% of the initial zoom", () => {
    renderControls({ zoom: 2.4, initialZoom: 0.6 });

    expect(getZoomIn()).toBeDisabled();
    expect(getZoomOut()).toBeEnabled();
  });

  it("should disable only the zoom out button at 10% of the initial zoom", () => {
    renderControls({ zoom: 0.06, initialZoom: 0.6 });

    expect(getZoomOut()).toBeDisabled();
    expect(getZoomIn()).toBeEnabled();
  });

  it("should call `onSetZoom` with the entered percent", async () => {
    const { props } = renderControls({ zoom: 0.6, initialZoom: 0.6 });

    await commitText("150");

    expect(props.onSetZoom).toHaveBeenCalledExactlyOnceWith(150);
  });

  it("should clamp 401 to 400 and show the fixed max toast", async () => {
    const { props } = renderControls({ zoom: 0.6, initialZoom: 0.6 });

    await commitText("401");

    expect(props.onSetZoom).toHaveBeenCalledExactlyOnceWith(400);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        type: "info",
        title: "倍率は400%以下にしてください。400%に設定しました。",
        id: TOAST_ID,
      }),
    );
  });
});

describe("operations", () => {
  it("should call `onZoomIn` when the zoom in button is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderControls();

    await user.click(getZoomIn());

    expect(props.onZoomIn).toHaveBeenCalledOnce();
  });

  it("should call `onZoomOut` when the zoom out button is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderControls();

    await user.click(getZoomOut());

    expect(props.onZoomOut).toHaveBeenCalledOnce();
  });

  it("should call `onSetZoom` with the percent when a number is entered", async () => {
    const { props } = renderControls();

    await commitText("150");

    expect(props.onSetZoom).toHaveBeenCalledExactlyOnceWith(150);
  });
});

describe("display", () => {
  it("should show the zoom as a rounded percent", () => {
    renderControls({ zoom: 0.835 });

    expect(getInput()).toHaveValue("84");
  });

  it("should follow the zoom when it changes, even while editing", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderControls({ zoom: 1 });
    await user.clear(getInput());
    await user.type(getInput(), "15");

    rerenderWith({ zoom: 1.2 });

    expect(getInput()).toHaveValue("120");
  });
});

describe("toast", () => {
  it.each([[""], ["abc"], ["150%"]])(
    "should show a warning toast for the invalid text %j",
    async (text) => {
      const { props } = renderControls();

      await commitText(text);

      expect(props.onSetZoom).not.toHaveBeenCalled();
      expect(toast.add).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          type: "warning",
          title: "数値を入力してください",
          id: TOAST_ID,
        }),
      );
    },
  );

  it("should clamp to 10% and show an info toast for 9", async () => {
    const { props } = renderControls();

    await commitText("9");

    expect(props.onSetZoom).toHaveBeenCalledExactlyOnceWith(10);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        type: "info",
        title: "倍率は10%以上にしてください。10%に設定しました。",
        id: TOAST_ID,
      }),
    );
  });

  it("should clamp to 400% and show an info toast for 401", async () => {
    const { props } = renderControls();

    await commitText("401");

    expect(props.onSetZoom).toHaveBeenCalledExactlyOnceWith(400);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        type: "info",
        title: "倍率は400%以下にしてください。400%に設定しました。",
        id: TOAST_ID,
      }),
    );
  });

  it.each([[10], [400]])(
    "should not show a toast for the boundary %j",
    async (percent) => {
      const { props } = renderControls();

      await commitText(String(percent));

      expect(props.onSetZoom).toHaveBeenCalledExactlyOnceWith(percent);
      expect(toast.add).not.toHaveBeenCalled();
    },
  );
});
