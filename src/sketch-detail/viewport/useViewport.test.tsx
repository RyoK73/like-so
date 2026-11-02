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
  const result = {
    canvas: null,
    view: undefined,
    zoomIn: () => {},
    zoomOut: () => {},
    setZoom: () => {},
  } as {
    canvas: fabric.Canvas | null;
    view: ReturnType<typeof useViewport>["view"];
    zoomIn: ReturnType<typeof useViewport>["zoomIn"];
    zoomOut: ReturnType<typeof useViewport>["zoomOut"];
    setZoom: ReturnType<typeof useViewport>["setZoom"];
  };
  const TestComponent = () => {
    const { canvasElRef, fabricCanvasRef, isLoaded } = useFabricCanvas({
      ...FRAME,
      backgroundColor: "transparent",
      canvasJson: {},
    });
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const { view, zoomIn, zoomOut, setZoom } = useViewport({
      fabricCanvasRef,
      canvasContainerRef,
      frame: FRAME,
      isLoaded,
    });
    result.canvas = fabricCanvasRef.current;
    result.view = view;
    result.zoomIn = zoomIn;
    result.zoomOut = zoomOut;
    result.setZoom = setZoom;
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

  describe("zoom operations", () => {
    // The center of the element is (450, 300), and the frame coordinate there is (600, 400) in the initial view.
    const frameAtCenter = (
      canvas: fabric.Canvas,
      element: { width: number; height: number },
    ) => ({
      x:
        (element.width / 2 - canvas.viewportTransform[4]) /
        canvas.viewportTransform[0],
      y:
        (element.height / 2 - canvas.viewportTransform[5]) /
        canvas.viewportTransform[3],
    });

    it("should zoom in by 1.25 and update the view", async () => {
      const { canvas, result } = await renderFitted();

      act(() => result.zoomIn());

      expect(canvas.viewportTransform[0]).toBeCloseTo(INITIAL_ZOOM * 1.25);
      expect(result.view?.transform.zoom).toBeCloseTo(INITIAL_ZOOM * 1.25);
    });

    it("should zoom out by 1.25 and update the view", async () => {
      const { canvas, result } = await renderFitted();

      act(() => result.zoomOut());

      expect(canvas.viewportTransform[0]).toBeCloseTo(INITIAL_ZOOM / 1.25);
      expect(result.view?.transform.zoom).toBeCloseTo(INITIAL_ZOOM / 1.25);
    });

    it("should keep the frame coordinate at the center of the element when zooming", async () => {
      const { canvas, result } = await renderFitted();

      act(() => result.zoomIn());

      const center = frameAtCenter(canvas, CONTAINER_SIZE);
      expect(center.x).toBeCloseTo(600);
      expect(center.y).toBeCloseTo(400);
    });

    it("should zoom by the wheel based on the magnification set by zoomIn", async () => {
      const { canvas, result } = await renderFitted();
      act(() => result.zoomIn());

      dispatchWheel(canvas.wrapperEl, { ctrlKey: true, deltaY: -100 });

      const expected = INITIAL_ZOOM * 1.25 * 0.999 ** -100;
      expect(canvas.viewportTransform[0]).toBeCloseTo(expected);
      expect(result.view?.transform.zoom).toBeCloseTo(expected);
    });

    it("should zoom in based on the zoom magnification after the wheel", async () => {
      const { canvas, result } = await renderFitted();
      dispatchWheel(canvas.wrapperEl, { ctrlKey: true, deltaY: -100 });
      const afterWheel = INITIAL_ZOOM * 0.999 ** -100;

      act(() => result.zoomIn());

      expect(canvas.viewportTransform[0]).toBeCloseTo(afterWheel * 1.25);
      expect(result.view?.transform.zoom).toBeCloseTo(afterWheel * 1.25);
    });

    // The percent is relative to the initial zoom (0.6), so 150% is 0.9.
    it("should set the zoom based on a percent of the initial zoom and keep the center", async () => {
      const { canvas, result } = await renderFitted();

      act(() => result.setZoom(150));

      expect(canvas.viewportTransform[0]).toBeCloseTo(INITIAL_ZOOM * 1.5);
      expect(result.view?.transform.zoom).toBeCloseTo(INITIAL_ZOOM * 1.5);
      const center = frameAtCenter(canvas, CONTAINER_SIZE);
      expect(center.x).toBeCloseTo(600);
      expect(center.y).toBeCloseTo(400);
    });

    it.each([
      [5, INITIAL_ZOOM * 0.1],
      [500, INITIAL_ZOOM * 4],
    ])("should clamp setZoom(%j) to the zoom %j", async (percent, zoom) => {
      const { canvas, result } = await renderFitted();

      act(() => result.setZoom(percent));

      expect(canvas.viewportTransform[0]).toBe(zoom);
      expect(result.view?.transform.zoom).toBe(zoom);
    });

    // The deltaY -1346 was found by searching for a wheel zoom after which `zoom * (max / zoom)` is just below the maximum (by about 4e-16).
    // The error depends on the current zoom, so it does not happen from the initial view.
    it("should land exactly on the maximum with setZoom after a wheel zoom", async () => {
      const { canvas, result } = await renderFitted();
      dispatchWheel(canvas.wrapperEl, { ctrlKey: true, deltaY: -1346 });
      expect(result.view?.transform.zoom).toBeLessThan(INITIAL_ZOOM * 4);

      act(() => result.setZoom(400));

      expect(canvas.viewportTransform[0]).toBe(INITIAL_ZOOM * 4);
      expect(result.view?.transform.zoom).toBe(INITIAL_ZOOM * 4);
    });

    it("should expose the initial zoom in the view", async () => {
      const { result } = await renderFitted();

      expect(result.view?.initialZoom).toBeCloseTo(INITIAL_ZOOM);
    });

    it("should update the initial zoom and the range when the container is resized", async () => {
      const { canvas, result } = await renderFitted();

      resizeContainer({ width: 1000, height: 800 });
      expect(result.view?.initialZoom).toBeCloseTo(2 / 3);

      act(() => result.setZoom(400));
      expect(canvas.viewportTransform[0]).toBeCloseTo((2 / 3) * 4);
    });

    it.each([
      [-100000, INITIAL_ZOOM * 4],
      [100000, INITIAL_ZOOM * 0.1],
    ])(
      "should stop the wheel zoom (deltaY %j) at the zoom %j",
      async (deltaY, zoom) => {
        const { canvas, result } = await renderFitted();

        dispatchWheel(canvas.wrapperEl, { ctrlKey: true, deltaY });

        expect(canvas.viewportTransform[0]).toBeCloseTo(zoom);
        expect(result.view?.transform.zoom).toBeCloseTo(zoom);
      },
    );

    it("should clamp the pan so that the frame still overlaps the element after zooming", async () => {
      const { canvas, result } = await renderFitted();
      // Push the frame to the right edge. tx is at most the element width minus the overlap (900 - 50).
      dispatchWheel(canvas.wrapperEl, { deltaX: -2000 });
      expect(canvas.viewportTransform[4]).toBe(850);

      act(() => result.zoomIn());

      expect(canvas.viewportTransform[4]).toBe(850);
    });

    it("should do nothing when called before the canvas is loaded", async () => {
      const { result } = renderViewport();

      act(() => {
        result.zoomIn();
        result.zoomOut();
        result.setZoom(150);
      });

      await waitFor(() =>
        expect(result.canvas?.viewportTransform[0]).toBeCloseTo(INITIAL_ZOOM),
      );
      expect(result.view?.transform.zoom).toBeCloseTo(INITIAL_ZOOM);
    });

    it("should zoom around the center of the resized element", async () => {
      const { canvas, result } = await renderFitted();
      resizeContainer({ width: 1000, height: 800 });
      const before = frameAtCenter(canvas, { width: 1000, height: 800 });

      act(() => result.zoomIn());

      const after = frameAtCenter(canvas, { width: 1000, height: 800 });
      expect(after.x).toBeCloseTo(before.x, 0);
      expect(after.y).toBeCloseTo(before.y, 0);
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
