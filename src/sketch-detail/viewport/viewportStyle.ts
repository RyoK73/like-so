import type { CSSProperties } from "react";
import type { Size, Transform } from "@/sketch-detail/viewport/viewportMath";

// The grid is drawn by repeating the background image of one cell over the element.
// - `backgroundSize`: the size of one cell on the screen, `cellSize x zoom` px.
// - `backgroundPosition`: where the first cell starts, which is the frame origin `(tx, ty)`. It decides where the whole grid is.
const getGridBackgroundStyle = (
  { zoom, tx, ty }: Transform,
  cellSize: number,
): Pick<CSSProperties, "backgroundSize" | "backgroundPosition"> => ({
  backgroundSize: `${cellSize * zoom}px ${cellSize * zoom}px`,
  backgroundPosition: `${tx}px ${ty}px`,
});

// Where the frame appears on the element.
const getFrameOnScreen = (
  { zoom, tx, ty }: Transform,
  frame: Size,
): { left: number; top: number; width: number; height: number } => ({
  left: tx,
  top: ty,
  width: frame.width * zoom,
  height: frame.height * zoom,
});

export { getFrameOnScreen, getGridBackgroundStyle };
