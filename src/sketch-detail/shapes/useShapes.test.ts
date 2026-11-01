import { renderHook } from "@testing-library/react";
import * as fabric from "fabric";
import { useShapes } from "@/sketch-detail/shapes/useShapes";

// The element is 900x600. The frame is larger than the element, so it is zoomed out in the initial view.
const ELEMENT = { width: 900, height: 600 };

const createCanvas = () => {
  // fabric wraps the canvas element, so it needs a parent element.
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  const canvasEl = document.createElement("canvas");
  parent.appendChild(canvasEl);
  return new fabric.Canvas(canvasEl, { ...ELEMENT });
};

const createShapeAndGetCenter = (
  canvas: fabric.Canvas,
  frame: { width: number; height: number },
) => {
  const { result } = renderHook(() => useShapes({ current: canvas }, frame));

  result.current.createShape("rect");

  const objects = canvas.getObjects();
  expect(objects).toHaveLength(1);
  return objects[0].getCenterPoint();
};

describe("useShapes: stroke of a created shape", () => {
  const createShapeAndGetObject = (
    ...args: Parameters<ReturnType<typeof useShapes>["createShape"]>
  ) => {
    const canvas = createCanvas();
    const { result } = renderHook(() =>
      useShapes({ current: canvas }, { width: 1200, height: 800 }),
    );

    result.current.createShape(...args);

    return canvas.getObjects()[0];
  };

  it("should keep the stroke width on resize for a rect", () => {
    expect(createShapeAndGetObject("rect").strokeUniform).toBe(true);
  });

  it("should keep the stroke width on resize for a circle", () => {
    expect(createShapeAndGetObject("circle").strokeUniform).toBe(true);
  });

  it("should keep the given colors and stroke width", () => {
    const shape = createShapeAndGetObject("rect", "red", "blue", 5);

    expect(shape.strokeUniform).toBe(true);
    expect(shape.fill).toBe("red");
    expect(shape.stroke).toBe("blue");
    expect(shape.strokeWidth).toBe(5);
  });
});

describe("useShapes: where a shape is created", () => {
  it("should create a shape at the center of the frame in the initial view", () => {
    const canvas = createCanvas();
    canvas.setViewportTransform([0.75, 0, 0, 0.75, 0, 0]);

    const center = createShapeAndGetCenter(canvas, {
      width: 1200,
      height: 800,
    });

    expect(center.x).toBeCloseTo(600);
    expect(center.y).toBeCloseTo(400);
  });

  it("should create a shape at the frame coordinate of the center of the view after pan and zoom", () => {
    const canvas = createCanvas();
    canvas.setViewportTransform([2, 0, 0, 2, -600, -400]);

    const center = createShapeAndGetCenter(canvas, {
      width: 1200,
      height: 800,
    });

    expect(center.x).toBeCloseTo(525);
    expect(center.y).toBeCloseTo(350);
  });

  it("should create a shape at the nearest point in the frame when the center of the view is outside", () => {
    const canvas = createCanvas();
    // The center of the view is the frame coordinate (-50, 300), 50 px left of the frame.
    canvas.setViewportTransform([1, 0, 0, 1, 500, 0]);

    const center = createShapeAndGetCenter(canvas, { width: 400, height: 300 });

    expect(center.x).toBeCloseTo(0);
    expect(center.y).toBeCloseTo(300);
  });
});
