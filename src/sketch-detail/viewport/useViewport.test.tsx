import { render, waitFor } from "@testing-library/react";
import * as fabric from "fabric";
import { useRef } from "react";
import { useFabricCanvas } from "@/sketch-detail/canvas/useFabricCanvas";
import { useViewport } from "@/sketch-detail/viewport/useViewport";
import { act } from "@testing-library/react";

const FRAME = { width: 1200, height: 800 };
// The container is 900x600, so the initial view is zoom 0.6 (80% of the container), centered at (90, 60), and the element is 900x600.
const CONTAINER_SIZE = { width: 900, height: 600 };
const INITIAL_ZOOM = 0.6;
const INITIAL_TX = 90;
const INITIAL_TY = 60;

let observedSize = { ...CONTAINER_SIZE };
const notifiers = new Set<() => void>();

// jsdom has no layout, so report the container size as soon as the canvas container is observed.
class ImmediateResizeObserver {
  private notify: (() => void) | undefined;
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.notify = () =>
      this.callback(
        [{ target, contentRect: { ...observedSize } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    notifiers.add(this.notify);
    this.notify();
  }
  unobserve() {}
  disconnect() {
    if (this.notify) notifiers.delete(this.notify);
  }
}

const resizeContainer = (size: { width: number; height: number }) => {
  observedSize = size;
  act(() => notifiers.forEach((notify) => notify()));
};

const renderViewport = () => {
  const result: {
    canvas: fabric.Canvas | null;
    view: ReturnType<typeof useViewport>["view"];
  } = { canvas: null, view: undefined };
  const TestComponent = () => {
    const { canvasElRef, fabricCanvasRef, isLoaded } = useFabricCanvas({
      ...FRAME,
      backgroundColor: "transparent",
      canvasJson: {},
    });
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const { view } = useViewport({
      fabricCanvasRef,
      canvasContainerRef,
      frame: FRAME,
      isLoaded,
    });
    result.canvas = fabricCanvasRef.current;
    result.view = view;
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
    expect(rendered.result.canvas?.viewportTransform[0]).toBeCloseTo(
      INITIAL_ZOOM,
    ),
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
    observedSize = { ...CONTAINER_SIZE };
    notifiers.clear();
    vi.stubGlobal("ResizeObserver", ImmediateResizeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial view", () => {
    it("should fit the canvas element to the container and center the frame", async () => {
      const { canvas, result } = await renderFitted();

      expect(canvas.getWidth()).toBe(900);
      expect(canvas.getHeight()).toBe(600);
      expect(canvas.viewportTransform[0]).toBeCloseTo(INITIAL_ZOOM);
      expect(canvas.viewportTransform[3]).toBeCloseTo(INITIAL_ZOOM);
      expect(canvas.viewportTransform[4]).toBe(INITIAL_TX);
      expect(canvas.viewportTransform[5]).toBe(INITIAL_TY);
      expect(result.view?.elementSize).toEqual(CONTAINER_SIZE);
    });

    it("should go back to the centered view when the container is resized", async () => {
      const { canvas } = await renderFitted();
      dispatchWheel(canvas.wrapperEl, { deltaY: 100 });

      resizeContainer({ width: 1000, height: 800 });

      // zoom = min(1, 0.8 * 1000 / 1200, 0.8 * 800 / 800) = 2/3, and the frame on the screen is 800x533.33.
      expect(canvas.viewportTransform[0]).toBeCloseTo(2 / 3);
      expect(canvas.viewportTransform[4]).toBe(100);
      expect(canvas.viewportTransform[5]).toBe(133);
    });

    it("should keep the current view while the container has no size", async () => {
      const { canvas } = await renderFitted();
      dispatchWheel(canvas.wrapperEl, { deltaY: 100 });
      const before = [...canvas.viewportTransform];

      resizeContainer({ width: 0, height: 600 });

      expect(canvas.viewportTransform).toEqual(before);
    });
  });

  describe("wheel", () => {
    it("should pan vertically with deltaY", async () => {
      const { canvas } = await renderFitted();

      dispatchWheel(canvas.wrapperEl, { deltaY: 100 });

      expect(canvas.viewportTransform[5]).toBeCloseTo(INITIAL_TY - 100);
      expect(canvas.viewportTransform[4]).toBeCloseTo(INITIAL_TX);
    });

    it("should zoom in with ctrl and a negative deltaY, and prevent the default", async () => {
      const { canvas } = await renderFitted();

      const event = dispatchWheel(canvas.wrapperEl, {
        ctrlKey: true,
        deltaY: -100,
      });

      expect(canvas.viewportTransform[0]).toBeCloseTo(
        INITIAL_ZOOM * 0.999 ** -100,
      );
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
