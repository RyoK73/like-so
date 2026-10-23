type Size = { width: number; height: number };
type Point = { x: number; y: number };
// `(tx, ty)` is where the scene origin (the top-left of the frame) appears on the element.
type Transform = { zoom: number; tx: number; ty: number };

type WheelInput = {
  deltaX: number;
  deltaY: number;
  shiftKey: boolean;
  ctrlKey: boolean;
};
// `dx` and `dy` are the amounts to add to `tx` and `ty`.
type WheelAction =
  | { type: "pan"; dx: number; dy: number }
  | { type: "zoom"; factor: number }
  | { type: "none" };

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
// The frame and the element must overlap by this many px on the screen.
const MIN_OVERLAP = 50;
const WHEEL_ZOOM_BASE = 0.999;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// The element is the largest size that fits the area with the aspect ratio of the frame. It is never enlarged.
const fitFrame = (frame: Size, area: Size): { element: Size; zoom: number } => {
  const zoom = Math.min(
    1,
    area.width / frame.width,
    area.height / frame.height,
  );
  return {
    element: {
      width: Math.round(frame.width * zoom),
      height: Math.round(frame.height * zoom),
    },
    zoom,
  };
};

const clampZoom = (zoom: number) => clamp(zoom, MIN_ZOOM, MAX_ZOOM);

// Keep the scene point under the pointer at the same screen position.
const zoomAt = (
  transform: Transform,
  pointer: Point,
  factor: number,
): Transform => {
  const zoom = clampZoom(transform.zoom * factor);
  if (zoom === transform.zoom) return transform;

  const sceneX = (pointer.x - transform.tx) / transform.zoom;
  const sceneY = (pointer.y - transform.ty) / transform.zoom;
  return {
    zoom,
    tx: pointer.x - sceneX * zoom,
    ty: pointer.y - sceneY * zoom,
  };
};

const clampPanAxis = (t: number, frameOnScreen: number, element: number) => {
  const overlap = Math.min(MIN_OVERLAP, frameOnScreen);
  return clamp(t, overlap - frameOnScreen, element - overlap);
};

const clampPan = (
  transform: Transform,
  frame: Size,
  element: Size,
): Transform => ({
  zoom: transform.zoom,
  tx: clampPanAxis(transform.tx, frame.width * transform.zoom, element.width),
  ty: clampPanAxis(transform.ty, frame.height * transform.zoom, element.height),
});

const resolveWheelAction = ({
  deltaX,
  deltaY,
  shiftKey,
  ctrlKey,
}: WheelInput): WheelAction => {
  if (ctrlKey) return { type: "zoom", factor: WHEEL_ZOOM_BASE ** deltaY };

  if (shiftKey) {
    // Some browsers swap the axes while shift is pressed, so use the larger one.
    const amount = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX : deltaY;
    if (amount === 0) return { type: "none" };
    return { type: "pan", dx: -amount, dy: 0 };
  }

  if (deltaX === 0 && deltaY === 0) return { type: "none" };
  return { type: "pan", dx: -deltaX, dy: -deltaY };
};

const clampCenter = (center: Point, frame: Size): Point => ({
  x: clamp(center.x, 0, frame.width),
  y: clamp(center.y, 0, frame.height),
});

// The scene coordinate at the center of the view, clamped into the frame.
const getNewShapeCenter = (
  transform: Transform,
  element: Size,
  frame: Size,
): Point =>
  clampCenter(
    {
      x: (element.width / 2 - transform.tx) / transform.zoom,
      y: (element.height / 2 - transform.ty) / transform.zoom,
    },
    frame,
  );

export {
  clampCenter,
  clampPan,
  clampZoom,
  fitFrame,
  getNewShapeCenter,
  resolveWheelAction,
  zoomAt,
};
export type { Point, Size, Transform, WheelAction, WheelInput };
