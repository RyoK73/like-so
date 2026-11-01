import {
  clampCenter,
  clampPan,
  clampZoom,
  fitFrame,
  getNewShapeCenter,
  resolveWheelAction,
  zoomAt,
  type WheelInput,
} from "@/sketch-detail/viewport/viewportMath";

// Terms: the frame is `sketch.width x height`, the max size is the largest size of the canvas element, and the element is the `<canvas>` element.
// A transform is `{ zoom, tx, ty }`. `(tx, ty)` is where the frame origin (the top-left of the frame) appears on the element.

const WHEEL_BASE = 0.999;

const wheel = (input: Partial<WheelInput>): WheelInput => ({
  deltaX: 0,
  deltaY: 0,
  shiftKey: false,
  ctrlKey: false,
  ...input,
});

// Compare with `toBeCloseTo` so that `-0` and `0` are the same.
const expectPan = (
  action: ReturnType<typeof resolveWheelAction>,
  dx: number,
  dy: number,
) => {
  expect(action.type).toBe("pan");
  if (action.type !== "pan") return;
  expect(action.dx).toBeCloseTo(dx);
  expect(action.dy).toBeCloseTo(dy);
};

const expectZoomFactor = (
  action: ReturnType<typeof resolveWheelAction>,
  factor: number,
) => {
  expect(action.type).toBe("zoom");
  if (action.type !== "zoom") return;
  expect(action.factor).toBeCloseTo(factor);
};

describe("fitFrame", () => {
  // The element is the whole container, and the frame is centered in it within 80% of the container. It is never enlarged.
  it.each([
    {
      name: "the frame is smaller than the container",
      frame: { width: 400, height: 300 },
      container: { width: 1000, height: 800 },
      zoom: 1,
      tx: 300,
      ty: 250,
    },
    {
      name: "the width limits the zoom",
      frame: { width: 1200, height: 800 },
      container: { width: 1000, height: 800 },
      zoom: 2 / 3,
      tx: 100,
      ty: 133,
    },
    {
      name: "the height limits the zoom",
      frame: { width: 1000, height: 1000 },
      container: { width: 1000, height: 500 },
      zoom: 0.4,
      tx: 300,
      ty: 50,
    },
    {
      name: "the frame is exactly 80% of the container",
      frame: { width: 800, height: 640 },
      container: { width: 1000, height: 800 },
      zoom: 1,
      tx: 100,
      ty: 80,
    },
    {
      name: "the frame is larger than the container",
      frame: { width: 2000, height: 1000 },
      container: { width: 1000, height: 500 },
      zoom: 0.4,
      tx: 100,
      ty: 50,
    },
    {
      name: "the centering offset is a half pixel",
      frame: { width: 401, height: 300 },
      container: { width: 1000, height: 800 },
      zoom: 1,
      tx: 300,
      ty: 250,
    },
  ])("$name", ({ frame, container, zoom, tx, ty }) => {
    const result = fitFrame(frame, container);

    expect(result.zoom).toBeCloseTo(zoom, 10);
    expect(result.tx).toBe(tx);
    expect(result.ty).toBe(ty);
    expect(result.elementSize).toEqual(container);
  });
});

describe("clampZoom", () => {
  it.each([
    [0.05, 0.1],
    [0.1, 0.1],
    [1, 1],
    [4, 4],
    [5, 4],
  ])("should clamp %f to %f", (input, expected) => {
    expect(clampZoom(input)).toBe(expected);
  });
});

describe("zoomAt", () => {
  const framePointAt = (
    transform: { zoom: number; tx: number; ty: number },
    pointer: { x: number; y: number },
  ) => ({
    x: (pointer.x - transform.tx) / transform.zoom,
    y: (pointer.y - transform.ty) / transform.zoom,
  });

  it("should zoom in around the pointer", () => {
    const result = zoomAt({ zoom: 1, tx: 0, ty: 0 }, { x: 100, y: 50 }, 2);

    expect(result.zoom).toBeCloseTo(2);
    expect(result.tx).toBeCloseTo(-100);
    expect(result.ty).toBeCloseTo(-50);
  });

  it("should zoom out around the pointer and go back to the start", () => {
    const result = zoomAt(
      { zoom: 2, tx: -100, ty: -50 },
      { x: 100, y: 50 },
      0.5,
    );

    expect(result.zoom).toBeCloseTo(1);
    expect(result.tx).toBeCloseTo(0);
    expect(result.ty).toBeCloseTo(0);
  });

  it.each([
    {
      name: "zoom in at the maximum",
      transform: { zoom: 4, tx: -30, ty: -20 },
      factor: 2,
    },
    {
      name: "zoom out at the minimum",
      transform: { zoom: 0.1, tx: 40, ty: 10 },
      factor: 0.5,
    },
  ])("should not change anything: $name", ({ transform, factor }) => {
    const result = zoomAt(transform, { x: 100, y: 50 }, factor);

    expect(result).toEqual(transform);
  });

  it("should stop at the maximum and keep the frame coordinate under the pointer", () => {
    const before = { zoom: 3, tx: -30, ty: -20 };
    const pointer = { x: 100, y: 50 };

    const result = zoomAt(before, pointer, 2);

    expect(result.zoom).toBeCloseTo(4);
    const frameBefore = framePointAt(before, pointer);
    const frameAfter = framePointAt(result, pointer);
    expect(frameAfter.x).toBeCloseTo(frameBefore.x);
    expect(frameAfter.y).toBeCloseTo(frameBefore.y);
  });
});

describe("clampPan", () => {
  const frame = { width: 1200, height: 800 };
  const element = { width: 900, height: 600 };

  it.each([
    {
      name: "tx is too large",
      tx: 900,
      ty: 0,
      expected: { tx: 850, ty: 0 },
    },
    {
      name: "tx is too small",
      tx: -1200,
      ty: 0,
      expected: { tx: -1150, ty: 0 },
    },
    // The same rule for the y axis (element height 600, frame height 800).
    {
      name: "ty is too large",
      tx: 0,
      ty: 700,
      expected: { tx: 0, ty: 550 },
    },
    {
      name: "ty is too small",
      tx: 0,
      ty: -800,
      expected: { tx: 0, ty: -750 },
    },
  ])("$name", ({ tx, ty, expected }) => {
    const result = clampPan({ zoom: 1, tx, ty }, frame, element);

    expect(result).toEqual({ zoom: 1, ...expected });
  });

  it.each([
    { name: "tx is too large", tx: 2000, ty: 0, expected: { tx: 950, ty: 0 } },
    {
      name: "tx is too small",
      tx: -2000,
      ty: 0,
      expected: { tx: -350, ty: 0 },
    },
    { name: "ty is too large", tx: 0, ty: 2000, expected: { tx: 0, ty: 750 } },
    {
      name: "ty is too small",
      tx: 0,
      ty: -2000,
      expected: { tx: 0, ty: -250 },
    },
  ])(
    "should keep 50px of the frame on the full-size element when $name",
    ({ tx, ty, expected }) => {
      const result = clampPan(
        { zoom: 1, tx, ty },
        { width: 400, height: 300 },
        { width: 1000, height: 800 },
      );

      expect(result).toEqual({ zoom: 1, ...expected });
    },
  );

  it("should not change a transform in the range", () => {
    const transform = { zoom: 1, tx: -100, ty: 30 };

    expect(clampPan(transform, frame, element)).toEqual(transform);
  });

  it("should use the frame size on the screen (frame width x zoom) for the range", () => {
    // The frame is 600 px wide on the screen at zoom 0.5, so tx is in -550 to 850.
    expect(clampPan({ zoom: 0.5, tx: -700, ty: 0 }, frame, element).tx).toBe(
      -550,
    );
    expect(clampPan({ zoom: 0.5, tx: 900, ty: 0 }, frame, element).tx).toBe(
      850,
    );
  });

  it("should use the frame size on the screen instead of 50 when it is smaller than 50", () => {
    const smallFrame = { width: 20, height: 20 };

    expect(clampPan({ zoom: 1, tx: 900, ty: 0 }, smallFrame, element).tx).toBe(
      880,
    );
    expect(clampPan({ zoom: 1, tx: -10, ty: 0 }, smallFrame, element).tx).toBe(
      0,
    );
  });
});

describe("resolveWheelAction", () => {
  it("should pan vertically with deltaY", () => {
    expectPan(resolveWheelAction(wheel({ deltaY: 100 })), 0, -100);
  });

  it("should pan horizontally with deltaX", () => {
    expectPan(resolveWheelAction(wheel({ deltaX: 50 })), -50, 0);
  });

  it("should pan diagonally with deltaX and deltaY", () => {
    expectPan(resolveWheelAction(wheel({ deltaX: 30, deltaY: 40 })), -30, -40);
  });

  it("should pan horizontally with deltaY while shift is pressed", () => {
    expectPan(
      resolveWheelAction(wheel({ shiftKey: true, deltaY: 100 })),
      -100,
      0,
    );
  });

  it("should pan horizontally with deltaX while shift is pressed (the browser swapped the axes)", () => {
    expectPan(
      resolveWheelAction(wheel({ shiftKey: true, deltaX: 100 })),
      -100,
      0,
    );
  });

  it("should do nothing while shift is pressed and both deltas are 0", () => {
    expect(resolveWheelAction(wheel({ shiftKey: true })).type).toBe("none");
  });

  it("should zoom in with ctrl and a negative deltaY", () => {
    expectZoomFactor(
      resolveWheelAction(wheel({ ctrlKey: true, deltaY: -100 })),
      WHEEL_BASE ** -100,
    );
  });

  it("should zoom out with ctrl and a positive deltaY", () => {
    expectZoomFactor(
      resolveWheelAction(wheel({ ctrlKey: true, deltaY: 100 })),
      WHEEL_BASE ** 100,
    );
  });

  it("should zoom instead of pan with ctrl and shift", () => {
    expectZoomFactor(
      resolveWheelAction(wheel({ ctrlKey: true, shiftKey: true, deltaY: 100 })),
      WHEEL_BASE ** 100,
    );
  });
});

describe("space + drag", () => {
  // Panning by drag is `clampPan` applied to the dragged transform.
  const frame = { width: 1200, height: 800 };
  const element = { width: 900, height: 600 };

  it("should move the transform by the drag distance", () => {
    const result = clampPan(
      { zoom: 1, tx: 0 + 30, ty: 0 + 20 },
      frame,
      element,
    );

    expect(result).toEqual({ zoom: 1, tx: 30, ty: 20 });
  });

  it("should stop the drag at the range of the pan", () => {
    const result = clampPan(
      { zoom: 1, tx: 0 + 5000, ty: 0 - 5000 },
      frame,
      element,
    );

    expect(result).toEqual({ zoom: 1, tx: 850, ty: -750 });
  });
});

describe("clampCenter", () => {
  const frame = { width: 400, height: 300 };

  it("should not change a center in the frame", () => {
    expect(clampCenter({ x: 200, y: 150 }, frame)).toEqual({ x: 200, y: 150 });
  });

  it.each([
    [
      { x: -10, y: 50 },
      { x: 0, y: 50 },
    ],
    [
      { x: 410, y: 50 },
      { x: 400, y: 50 },
    ],
    [
      { x: 200, y: -5 },
      { x: 200, y: 0 },
    ],
    [
      { x: 200, y: 305 },
      { x: 200, y: 300 },
    ],
  ])("should stop %j at the edge: %j", (center, expected) => {
    expect(clampCenter(center, frame)).toEqual(expected);
  });

  it.each([[{ x: 0, y: 0 }], [{ x: 400, y: 300 }]])(
    "should treat the boundary %j as in the frame",
    (center) => {
      expect(clampCenter(center, frame)).toEqual(center);
    },
  );

  it("should clamp a center outside a corner to the corner", () => {
    expect(clampCenter({ x: -10, y: -10 }, frame)).toEqual({ x: 0, y: 0 });
  });

  // The loaded objects are not passed to `clampCenter`. It needs the hook that listens to fabric, so it is written with that hook.
  it.todo("should keep a loaded shape whose center is outside the frame");
});

describe("getNewShapeCenter", () => {
  const element = { width: 900, height: 600 };

  it("should return the center of the view at zoom 1", () => {
    const result = getNewShapeCenter({ zoom: 1, tx: 0, ty: 0 }, element, {
      width: 1200,
      height: 800,
    });

    expect(result).toEqual({ x: 450, y: 300 });
  });

  it("should return the center of the frame when the frame is centered in a full-size element", () => {
    const result = getNewShapeCenter(
      { zoom: 1, tx: 300, ty: 250 },
      { width: 1000, height: 800 },
      { width: 400, height: 300 },
    );

    expect(result).toEqual({ x: 200, y: 150 });
  });

  it("should return the frame coordinate at the center of the view when zoomed", () => {
    // The center of the element (450, 300) is the frame coordinate ((450 + 600) / 2, (300 + 400) / 2) = (525, 350).
    const result = getNewShapeCenter({ zoom: 2, tx: -600, ty: -400 }, element, {
      width: 1200,
      height: 800,
    });

    expect(result).toEqual({ x: 525, y: 350 });
  });

  it("should return the nearest point in the frame when the center of the view is outside", () => {
    // The center of the view is the frame coordinate (-50, 300).
    const result = getNewShapeCenter({ zoom: 1, tx: 500, ty: 0 }, element, {
      width: 400,
      height: 300,
    });

    expect(result).toEqual({ x: 0, y: 300 });
  });
});
