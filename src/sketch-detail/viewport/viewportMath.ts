type Size = { width: number; height: number };
type Point = { x: number; y: number };
// `(tx, ty)` is where the frame origin (the top-left of the frame) appears on the element.
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
  | { type: "zoom"; zoomMultiplier: number }
  | { type: "none" };

// The range of the zoom as a ratio of the initial zoom (the fitted view, which is shown as 100%).
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
// The frame and the element must overlap by this many px on the screen.
const MIN_OVERLAP = 50;
const WHEEL_ZOOM_BASE = 0.999;
// One press of the zoom in button multiplies the zoom by this. The zoom out button divides by it.
const ZOOM_STEP = 1.25;
// The initial frame fits within this ratio of the container.
const FIT_RATIO = 0.8;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// The element is the whole container. The frame is centered in it, and fits within `FIT_RATIO` of the container. It is never enlarged.
const fitFrame = (
  frame: Size,
  container: Size,
): { elementSize: Size; zoom: number; tx: number; ty: number } => {
  const zoom = Math.min(
    1,
    (container.width * FIT_RATIO) / frame.width,
    (container.height * FIT_RATIO) / frame.height,
  );
  return {
    elementSize: container,
    zoom,
    tx: Math.round((container.width - frame.width * zoom) / 2),
    ty: Math.round((container.height - frame.height * zoom) / 2),
  };
};

const clampZoom = (zoom: number, initialZoom = 1) =>
  clamp(zoom, initialZoom * MIN_ZOOM, initialZoom * MAX_ZOOM);

const canZoomIn = (zoom: number, initialZoom = 1) =>
  zoom < initialZoom * MAX_ZOOM;
const canZoomOut = (zoom: number, initialZoom = 1) =>
  zoom > initialZoom * MIN_ZOOM;

// The initial zoom is 100%.
const zoomToPercent = (zoom: number, initialZoom = 1) =>
  Math.round((zoom / initialZoom) * 100);
const percentToZoom = (percent: number, initialZoom = 1) =>
  (percent / 100) * initialZoom;

// Keep the point (in frame coordinates) under the pointer at the same screen position.
const zoomAt = (
  transform: Transform,
  pointer: Point,
  zoomMultiplier: number,
  initialZoom = 1,
): Transform => {
  const zoom = clampZoom(transform.zoom * zoomMultiplier, initialZoom);
  if (zoom === transform.zoom) return transform;

  const frameX = (pointer.x - transform.tx) / transform.zoom;
  const frameY = (pointer.y - transform.ty) / transform.zoom;
  return {
    zoom,
    tx: pointer.x - frameX * zoom,
    ty: pointer.y - frameY * zoom,
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
  if (ctrlKey) {
    return { type: "zoom", zoomMultiplier: WHEEL_ZOOM_BASE ** deltaY };
  }

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

// The frame coordinate at the center of the view, clamped into the frame.
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
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  canZoomIn,
  canZoomOut,
  clampCenter,
  clampPan,
  clampZoom,
  fitFrame,
  getNewShapeCenter,
  percentToZoom,
  resolveWheelAction,
  zoomAt,
  zoomToPercent,
};
export type { Point, Size, Transform, WheelAction, WheelInput };
