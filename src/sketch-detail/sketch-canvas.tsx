"use client";
import { useEffect, useRef } from "react";
import { toast } from "@/design-system/toast";
import { ShapeNavigation } from "@/sketch-detail/shape-navigation";
import { SketchError } from "@/sketch-detail/sketch-error";
import { useFabricCanvas } from "@/sketch-detail/canvas/useFabricCanvas";
import { useShapes } from "@/sketch-detail/shapes/useShapes";
import { useSave } from "@/sketch-detail/save/useSave";
import type { CanvasFrame } from "@/sketch-detail/save/saveToDb.types";
import { useFrameConstraint } from "@/sketch-detail/viewport/useFrameConstraint";
import { useViewport } from "@/sketch-detail/viewport/useViewport";
import {
  getFrameOnScreen,
  getGridBackgroundStyle,
} from "@/sketch-detail/viewport/viewportStyle";
import type { GetSketch } from "@/supabase/sketch-crud/getSketch.types";

// The paper and the grid are drawn by CSS (`bg-canvas`), so fabric stays transparent. The canvas stays light in both modes.
const CANVAS_BACKGROUND = "transparent";
const SAVE_ERROR_TOAST_ID = "save-sketch-error";

const SketchCanvas = ({ sketch }: { sketch: GetSketch }) => {
  const { canvasElRef, fabricCanvasRef, isLoaded, loadError } = useFabricCanvas(
    {
      width: sketch.width,
      height: sketch.height,
      backgroundColor: CANVAS_BACKGROUND,
      canvasJson: sketch.canvas_json,
    },
  );
  const frame = { width: sketch.width, height: sketch.height };
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { view } = useViewport({
    fabricCanvasRef,
    canvasContainerRef,
    frame,
    isLoaded,
  });
  useFrameConstraint(fabricCanvasRef, frame, isLoaded);
  const { createShape } = useShapes(fabricCanvasRef, frame);
  // Until the canvas container is measured, show the frame as it is.
  const transform = view?.transform ?? { zoom: 1, tx: 0, ty: 0 };
  const elementSize = view?.elementSize ?? frame;
  const frameOnScreen = getFrameOnScreen(transform, frame);

  const sketchIdRef = useRef<string | undefined>(sketch.id);
  const frameRef = useRef<CanvasFrame | null>({
    width: sketch.width,
    height: sketch.height,
    frame_id: sketch.frame_id,
  });
  const { sketchInfoRef, err } = useSave(
    fabricCanvasRef,
    sketchIdRef,
    frameRef,
    isLoaded,
  );

  useEffect(() => {
    sketchInfoRef.current = {
      title: sketch.title,
      description: sketch.description,
      cell_size: sketch.cell_size,
    };
  }, [sketchInfoRef, sketch.title, sketch.description, sketch.cell_size]);

  useEffect(() => {
    if (err) {
      // TODO(#70): Log `err` according to the policy decided in #70.
      toast.add({
        type: "error",
        title: "保存に失敗しました。",
        id: SAVE_ERROR_TOAST_ID,
      });
    }
  }, [err]);

  // Do not edit when the canvas is not restored, or the next auto-save would overwrite the sketch.
  if (loadError) {
    return (
      <SketchError message="スケッチの読み込みに失敗しました。ページを再読み込みしてください。" />
    );
  }

  return (
    // The canvas container is measured to decide the size of the canvas element. Its children are absolute, so they do not change its size.
    <div ref={canvasContainerRef} className="absolute inset-0">
      <div
        className="relative overflow-hidden bg-canvas bg-[linear-gradient(var(--canvas-grid)_1px,transparent_1px),linear-gradient(90deg,var(--canvas-grid)_1px,transparent_1px)]"
        style={{
          width: elementSize.width,
          height: elementSize.height,
          ...getGridBackgroundStyle(transform, sketch.cell_size),
        }}
      >
        {/* fabric wraps the canvas element, so React must own its parent element. */}
        <div>
          <canvas ref={canvasElRef} />
        </div>
        {/* Outline the frame on the paper. */}
        <div
          aria-hidden
          className="pointer-events-none absolute rotate-0 brush-a ring-1 ring-border"
          style={frameOnScreen}
        />
      </div>
      <ShapeNavigation disabled={!isLoaded} onAddShape={createShape} />
    </div>
  );
};

export { SketchCanvas };
