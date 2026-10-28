import { render, waitFor } from "@testing-library/react";
import * as fabric from "fabric";
import { useFabricCanvas } from "@/sketch-detail/canvas/useFabricCanvas";
import { useFrameConstraint } from "@/sketch-detail/viewport/useFrameConstraint";

const FRAME = { width: 400, height: 300 };

const renderCanvas = (canvasJson: Record<string, unknown>) => {
  const result: { canvas: fabric.Canvas | null; isLoaded: boolean } = {
    canvas: null,
    isLoaded: false,
  };
  const TestComponent = () => {
    const { canvasElRef, fabricCanvasRef, isLoaded } = useFabricCanvas({
      ...FRAME,
      backgroundColor: "transparent",
      canvasJson,
    });
    useFrameConstraint(fabricCanvasRef, FRAME, isLoaded);
    result.canvas = fabricCanvasRef.current;
    result.isLoaded = isLoaded;
    // fabric wraps the canvas element, so React must own its parent element.
    return (
      <div>
        <canvas ref={canvasElRef} />
      </div>
    );
  };
  render(<TestComponent />);
  return result;
};

const createCenteredRect = (x: number, y: number) =>
  new fabric.Rect({
    originX: "center",
    originY: "center",
    left: x,
    top: y,
    width: 100,
    height: 50,
  });

const fireMoving = (canvas: fabric.Canvas, target: fabric.FabricObject) =>
  canvas.fire("object:moving", {
    target,
  } as unknown as fabric.CanvasEvents["object:moving"]);

describe("useFrameConstraint", () => {
  const checkCanvas = (canvas: fabric.Canvas | null) => {
    if (canvas === null) throw new Error("Unexpected Error: Missing Canvas");
    return canvas;
  };
  it("should keep a loaded shape whose center is outside the frame", async () => {
    const result = renderCanvas({
      version: fabric.version,
      objects: [
        {
          type: "Rect",
          version: fabric.version,
          originX: "center",
          originY: "center",
          left: 1000,
          top: 1000,
          width: 100,
          height: 50,
          fill: "transparent",
        },
      ],
    });
    await waitFor(() => expect(result.isLoaded).toBe(true));

    const center = checkCanvas(result.canvas).getObjects()[0].getCenterPoint();

    expect(center.x).toBe(1000);
    expect(center.y).toBe(1000);
  });

  it.each([
    { name: "right", from: { x: 450, y: 150 }, to: { x: 400, y: 150 } },
    { name: "left", from: { x: -20, y: 150 }, to: { x: 0, y: 150 } },
    { name: "bottom", from: { x: 200, y: 350 }, to: { x: 200, y: 300 } },
    { name: "top", from: { x: 200, y: -5 }, to: { x: 200, y: 0 } },
    { name: "corner", from: { x: -10, y: -10 }, to: { x: 0, y: 0 } },
  ])(
    "should stop the center at the edge when a shape is moved over the $name edge",
    async ({ from, to }) => {
      const result = renderCanvas({});
      await waitFor(() => expect(result.isLoaded).toBe(true));
      const canvas = checkCanvas(result.canvas);
      const rect = createCenteredRect(from.x, from.y);
      canvas.add(rect);

      fireMoving(canvas, rect);

      const center = rect.getCenterPoint();
      expect(center.x).toBeCloseTo(to.x);
      expect(center.y).toBeCloseTo(to.y);
    },
  );

  it("should not move a shape whose center is in the frame", async () => {
    const result = renderCanvas({});
    await waitFor(() => expect(result.isLoaded).toBe(true));
    const canvas = checkCanvas(result.canvas);
    const rect = createCenteredRect(200, 150);
    canvas.add(rect);

    fireMoving(canvas, rect);

    const center = rect.getCenterPoint();
    expect(center.x).toBeCloseTo(200);
    expect(center.y).toBeCloseTo(150);
  });

  it("should not constrain a shape that is scaled so that its center moves outside", async () => {
    const result = renderCanvas({});
    await waitFor(() => expect(result.isLoaded).toBe(true));
    const canvas = checkCanvas(result.canvas);
    const rect = createCenteredRect(450, 150);
    canvas.add(rect);

    canvas.fire("object:scaling", {
      target: rect,
    } as unknown as fabric.CanvasEvents["object:scaling"]);

    expect(rect.getCenterPoint().x).toBeCloseTo(450);
  });
});
