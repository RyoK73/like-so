import * as fabric from "fabric";
import { useRef, useState, useEffect, RefObject, useCallback } from "react";
import { saveToDb } from "@/sketch-detail/save/saveToDb";
import { SketchInfo, CanvasFrame } from "@/sketch-detail/save/saveToDb.types";
import { revalidateSketchList } from "@/sketch-detail/save/revalidateSketchList";
import pDebounce from "p-debounce";

const SAVE_DELAY: number = 250;

// Wrapped by the debounce, so that it runs once per debounced save, not once per `save()` call.
const saveToDbAndRevalidate = async (...args: Parameters<typeof saveToDb>) => {
  const saveResult = await saveToDb(...args);
  if (saveResult.ok) {
    void revalidateSketchList();
  }
  return saveResult;
};

// `isSketchLoaded` is false while the canvas loads a sketch. Nothing is saved until it turns to true,
// because loading adds the objects and fires `object:added` for each of them.
const useSave = (
  fabricCanvasRef: RefObject<fabric.Canvas | null>,
  sketchIdRef: RefObject<string | undefined>,
  frameRef: RefObject<CanvasFrame | null>,
  isSketchLoaded: boolean,
) => {
  const [isAutoSave, setAutoSave] = useState(true);
  const sketchInfoRef = useRef<SketchInfo>(null);
  const [err, setErr] = useState<Error>();
  const debounceSaveToDb = pDebounce(saveToDbAndRevalidate, SAVE_DELAY);

  const save = useCallback(async () => {
    if (fabricCanvasRef.current === null) {
      setErr(new Error("Error: fabricCanvasRef is null."));
      return;
    }
    if (sketchInfoRef.current === null) {
      setErr(new Error("Error: sketchInfoRef is null."));
      return;
    }
    if (frameRef.current === null) {
      setErr(new Error("Error: frameRef is null."));
      return;
    }
    const saveResult = await debounceSaveToDb(
      fabricCanvasRef.current,
      sketchInfoRef.current,
      frameRef.current,
      sketchIdRef.current,
    );

    if (!saveResult.ok) {
      setErr(saveResult.error);
      return;
    }

    sketchIdRef.current = saveResult.value.id;
    setErr(undefined);
  }, [fabricCanvasRef, sketchIdRef, frameRef, debounceSaveToDb]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!isSketchLoaded || !canvas) return;

    const handler = () => {
      if (!isAutoSave) return;
      save();
    };
    canvas.on("object:added", handler);
    canvas.on("object:modified", handler);

    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:modified", handler);
    };
  }, [sketchInfoRef, fabricCanvasRef, isAutoSave, isSketchLoaded, save]);

  return { isAutoSave, setAutoSave, sketchInfoRef, err, save };
};

export { useSave };
