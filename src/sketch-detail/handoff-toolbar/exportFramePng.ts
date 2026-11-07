import type * as fabric from "fabric";

type Frame = { width: number; height: number };

const IDENTITY_TRANSFORM: fabric.TMat2D = [1, 0, 0, 1, 0, 0];

// Draw the whole frame at the scale 1, whatever the pan and the zoom are. The viewport transform and the background are changed only while drawing (synchronously), so the screen does not flicker.
const exportFramePng = async (
  fabricCanvas: fabric.Canvas,
  frame: Frame,
  paperColor: string,
): Promise<Blob> => {
  const originalTransform = fabricCanvas.viewportTransform;
  const originalBackground = fabricCanvas.backgroundColor;

  let element: HTMLCanvasElement;
  try {
    fabricCanvas.viewportTransform = [...IDENTITY_TRANSFORM];
    fabricCanvas.backgroundColor = paperColor;
    element = fabricCanvas.toCanvasElement(1, {
      left: 0,
      top: 0,
      width: frame.width,
      height: frame.height,
    });
  } finally {
    fabricCanvas.viewportTransform = originalTransform;
    fabricCanvas.backgroundColor = originalBackground;
  }

  return new Promise<Blob>((resolve, reject) => {
    element.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to make the PNG."));
    }, "image/png");
  });
};

export { exportFramePng };
export type { Frame };
