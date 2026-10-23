"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/design-system/button";
import { toast } from "@/design-system/toast";
import { useFabricCanvas } from "@/sketch-detail/canvas/useFabricCanvas";
import { useShapes, type ShapeType } from "@/sketch-detail/shapes/useShapes";
import { useSave } from "@/sketch-detail/save/useSave";
import type { CanvasFrame } from "@/sketch-detail/save/saveToDb.types";
import type { GetSketch } from "@/supabase/sketch-crud/getSketch.types";

// The paper and the grid are drawn by CSS (`bg-canvas`), so fabric stays transparent. The canvas stays light in both modes.
const CANVAS_BACKGROUND = "transparent";
const SAVE_ERROR_TOAST_ID = "save-sketch-error";

const SHAPE_BUTTONS: { type: ShapeType; label: string }[] = [
  { type: "rect", label: "四角形" },
  { type: "circle", label: "円" },
  { type: "triangle", label: "三角形" },
];

const SketchCanvas = ({ sketch }: { sketch: GetSketch }) => {
  const { canvasElRef, fabricCanvasRef, isLoaded, loadError } = useFabricCanvas(
    {
      width: sketch.width,
      height: sketch.height,
      backgroundColor: CANVAS_BACKGROUND,
      canvasJson: sketch.canvas_json,
    },
  );
  const { createShape } = useShapes(fabricCanvasRef);

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
      <>
        <p role="alert">
          スケッチの読み込みに失敗しました。ページを再読み込みしてください。
        </p>
        <Link href="/sketches" className="underline">
          スケッチ一覧へ戻る
        </Link>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div role="toolbar" aria-label="図形の追加" className="flex gap-2">
        {SHAPE_BUTTONS.map(({ type, label }) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            disabled={!isLoaded}
            onClick={() => createShape(type)}
          >
            {`${label}を追加`}
          </Button>
        ))}
      </div>
      {/* fabric wraps the canvas element, so React must own its parent element. */}
      <div className="overflow-auto">
        <div
          className="w-fit overflow-hidden rounded-xl border bg-canvas bg-[linear-gradient(var(--canvas-grid)_1px,transparent_1px),linear-gradient(90deg,var(--canvas-grid)_1px,transparent_1px)] shadow-float"
          style={{
            backgroundSize: `${sketch.cell_size}px ${sketch.cell_size}px`,
          }}
        >
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
};

export { SketchCanvas };
