import { render, waitFor } from "@testing-library/react";
import * as fabric from "fabric";
import { useRef } from "react";
import { useFabricCanvas } from "@/sketch-detail/canvas/useFabricCanvas";
import { useViewport } from "@/sketch-detail/viewport/useViewport";
import { act } from "@testing-library/react";

const FRAME = { width: 1200, height: 800 };
// The max size is 900x600, so the initial view is zoom 0.75 and the element is 900x600.
const MAX_SIZE = { width: 900, height: 600 };

// jsdom has no layout, so report the max size as soon as the canvas container is observed.
class ImmediateResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { ...MAX_SIZE } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

const renderViewport = () => {
  const result: { canvas: fabric.Canvas | null } = { canvas: null };
  const TestComponent = () => {
    const { canvasElRef, fabricCanvasRef, isLoaded } = useFabricCanvas({
      ...FRAME,
      backgroundColor: "transparent",
      canvasJson: {},
    });
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    useViewport({
      fabricCanvasRef,
      canvasContainerRef,
      frame: FRAME,
      isLoaded,
    });
    result.canvas = fabricCanvasRef.current;
    // fabric wraps the canvas element, so React must own its parent element.
    return (
      <div ref={canvasContainerRef}>
        <div>
          <canvas ref={canvasElRef} />
        </div>
        <button type="button">button</button>
      </div>
    );
  };
  const view = render(<TestComponent />);
  return { result, ...view };
};

const renderFitted = async () => {
  const rendered = renderViewport();
  await waitFor(() =>
    expect(rendered.result.canvas?.viewportTransform[0]).toBeCloseTo(0.75),
  );
  return { ...rendered, canvas: rendered.result.canvas! };
};

const dispatchWheel = (target: Element, init: WheelEventInit) => {
  const event = new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => target.dispatchEvent(event));
  return event;
};

const dispatchSpace = (type: "keydown" | "keyup", target: Element) =>
  target.dispatchEvent(
    new KeyboardEvent(type, { code: "Space", bubbles: true, cancelable: true }),
  );

describe("useViewport", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ImmediateResizeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("wheel", () => {
    it("should pan vertically with deltaY", async () => {
      const { canvas } = await renderFitted();

      dispatchWheel(canvas.wrapperEl, { deltaY: 100 });

      expect(canvas.viewportTransform[5]).toBeCloseTo(-100);
      expect(canvas.viewportTransform[4]).toBeCloseTo(0);
    });

    it("should zoom in with ctrl and a negative deltaY, and prevent the default", async () => {
      const { canvas } = await renderFitted();

      const event = dispatchWheel(canvas.wrapperEl, {
        ctrlKey: true,
        deltaY: -100,
      });

      expect(canvas.viewportTransform[0]).toBeCloseTo(0.75 * 0.999 ** -100);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe("pan mode (Space)", () => {
    it("should turn off selection while Space is held, and restore it on release", async () => {
      const { canvas } = await renderFitted();
      expect(canvas.selection).toBe(true);
      expect(canvas.skipTargetFind).toBe(false);

      dispatchSpace("keydown", document.body);
      expect(canvas.selection).toBe(false);
      expect(canvas.skipTargetFind).toBe(true);

      dispatchSpace("keyup", document.body);
      expect(canvas.selection).toBe(true);
      expect(canvas.skipTargetFind).toBe(false);
    });

    it("should not enter the pan mode while a button has the focus", async () => {
      const { canvas, getByRole } = await renderFitted();
      const button = getByRole("button");
      button.focus();

      dispatchSpace("keydown", button);

      expect(canvas.selection).toBe(true);
      expect(canvas.skipTargetFind).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should stop reacting to the wheel after unmount", async () => {
      const { canvas, unmount } = await renderFitted();
      const wrapperEl = canvas.wrapperEl;
      const before = [...canvas.viewportTransform];

      unmount();
      dispatchWheel(wrapperEl, { deltaY: 100 });

      expect(canvas.viewportTransform).toEqual(before);
    });
  });
});
