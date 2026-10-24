import { useEffect, type RefObject } from "react";
import { Canvas, Point } from "fabric";
import { clampCenter } from "@/sketch-detail/viewport/viewportMath";
import type { Size } from "@/sketch-detail/viewport/viewportMath";

// Stop the center of a moving shape at the edge of the frame.
// `object:moving` fires only while a shape is moved, so a loaded shape whose center is already outside stays as it is.
const useFrameConstraint = (
  fabricCanvasRef: RefObject<Canvas | null>,
  frame: Size,
  isLoaded: boolean,
) => {
  const { width, height } = frame;

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!isLoaded || !canvas) return;
    const onMoving = ({
      target,
    }: {
      target: ReturnType<Canvas["getObjects"]>[number];
    }) => {
      const center = target.getCenterPoint();
      const clamped = clampCenter(center, { width, height });
      if (clamped.x === center.x && clamped.y === center.y) return;
      target.setPositionByOrigin(
        new Point(clamped.x, clamped.y),
        "center",
        "center",
      );
    };

    canvas.on("object:moving", onMoving);
    return () => {
      canvas.off("object:moving", onMoving);
    };
  }, [fabricCanvasRef, width, height, isLoaded]);
};

export { useFrameConstraint };
