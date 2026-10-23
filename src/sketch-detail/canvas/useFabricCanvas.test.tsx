import { render, waitFor } from "@testing-library/react";
import * as fabric from "fabric";
import { useFabricCanvas } from "@/sketch-detail/canvas/useFabricCanvas";

type HookResult = ReturnType<typeof useFabricCanvas>;

const renderCanvas = (canvasJson: Record<string, unknown>) => {
  const result: { current: HookResult | null } = { current: null };
  const TestComponent = () => {
    const value = useFabricCanvas({
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      canvasJson,
    });
    result.current = value;
    // fabric wraps the canvas element, so React must own its parent element.
    return (
      <div>
        <canvas ref={value.canvasElRef} />
      </div>
    );
  };
  const view = render(<TestComponent />);
  return { result, ...view };
};

const rectJson = {
  version: fabric.version,
  objects: [
    {
      type: "Rect",
      version: fabric.version,
      left: 10,
      top: 10,
      width: 100,
      height: 50,
      fill: "transparent",
    },
  ],
};

describe("useFabricCanvas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should be ready with an empty canvas when canvasJson is an empty object", async () => {
    const { result } = renderCanvas({});

    expect(result.current?.isLoaded).toBe(false);
    await waitFor(() => expect(result.current?.isLoaded).toBe(true));
    expect(result.current?.fabricCanvasRef.current?.getObjects()).toHaveLength(
      0,
    );
  });

  test("should load the objects of canvasJson", async () => {
    const { result } = renderCanvas(rectJson);

    await waitFor(() => expect(result.current?.isLoaded).toBe(true));
    const objects = result.current?.fabricCanvasRef.current?.getObjects();
    expect(objects).toHaveLength(1);
    expect(objects?.[0]).toBeInstanceOf(fabric.Rect);
  });

  test("should create the canvas with the given size and background color", async () => {
    const { result } = renderCanvas({});

    await waitFor(() => expect(result.current?.isLoaded).toBe(true));
    const canvas = result.current?.fabricCanvasRef.current;
    expect(canvas?.getWidth()).toBe(800);
    expect(canvas?.getHeight()).toBe(600);
    expect(canvas?.backgroundColor).toBe("#ffffff");
  });

  test("should keep the background of canvasJson when it has one", async () => {
    const { result } = renderCanvas({ background: "#ff0000" });

    await waitFor(() => expect(result.current?.isLoaded).toBe(true));
    expect(result.current?.fabricCanvasRef.current?.backgroundColor).toBe(
      "#ff0000",
    );
  });

  test("should set loadError and keep isLoaded false when loading fails", async () => {
    const loadError = new Error("test load error");
    vi.spyOn(fabric.Canvas.prototype, "loadFromJSON").mockRejectedValue(
      loadError,
    );

    const { result } = renderCanvas({});

    await waitFor(() => expect(result.current?.loadError).toBe(loadError));
    expect(result.current?.isLoaded).toBe(false);
  });

  test("should abort loading when the component unmounts", async () => {
    const loadSpy = vi
      .spyOn(fabric.Canvas.prototype, "loadFromJSON")
      .mockReturnValue(new Promise(() => {}));

    const { unmount } = renderCanvas({});
    const signal = loadSpy.mock.calls[0]?.[2]?.signal;
    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);
  });

  test("should not set loadError when loading is aborted", async () => {
    let rejectLoad: (reason: unknown) => void = () => {};
    vi.spyOn(fabric.Canvas.prototype, "loadFromJSON").mockReturnValue(
      new Promise((_, reject) => {
        rejectLoad = reject;
      }),
    );

    const { result, unmount } = renderCanvas({});
    unmount();
    rejectLoad(new Error("aborted"));
    await Promise.resolve();

    expect(result.current?.loadError).toBeUndefined();
  });
});
