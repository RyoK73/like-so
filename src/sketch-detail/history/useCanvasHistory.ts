import type { Canvas } from "fabric";
import { RefObject, useEffect, useRef, useState } from "react";
import { toast } from "@/design-system/toast";
import { CanvasJson, useHistory } from "@/sketch-detail/history/useHistory";

const RESTORE_ERROR_TOAST_ID = "restore-history-error";

// Connects `useHistory` to the fabric canvas: records the changes of the canvas, and applies `present` to the canvas on undo / redo.
const useCanvasHistory = (
  fabricCanvasRef: RefObject<Canvas | null>,
  isLoaded: boolean,
) => {
  const { history, recordHistory, undo, redo } = useHistory();
  const [isOperable, setIsOperable] = useState(true); // `true` normally. `false` while restoring, to disable the buttons.
  const isRestoringRef = useRef(false); // To skip the record function trigger while restoring process.
  const currentCanvasRef = useRef<CanvasJson | null>(null);
  const isInitialRecorded = useRef(false);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!isLoaded || !canvas) return;

    if (!isInitialRecorded.current) {
      const initial: CanvasJson = canvas.toJSON();
      isInitialRecorded.current = true;
      currentCanvasRef.current = initial;
      recordHistory(initial);
    }

    // A wrapper of recordHistory
    const record = () => {
      if (isRestoringRef.current) return;
      // `createShape` adds a shape first and moves it after. Read the canvas after that.
      queueMicrotask(() => {
        const recordedCanvas: CanvasJson = canvas.toJSON();
        currentCanvasRef.current = recordedCanvas;
        recordHistory(recordedCanvas);
      });
    };
    canvas.on("object:added", record);
    canvas.on("object:modified", record);

    return () => {
      canvas.off("object:added", record);
      canvas.off("object:modified", record);
    };
  }, [fabricCanvasRef, isLoaded, recordHistory]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!isLoaded || !canvas) return;
    // `past` is empty until the first record is applied.
    if (history.past.length === 0) return;
    if (history.present === currentCanvasRef.current) return;

    const targetCanvas = history.present;
    currentCanvasRef.current = targetCanvas;
    isRestoringRef.current = true;
    setIsOperable(false);
    // `loadFromJSON` clears the background color.
    const backgroundColor = canvas.backgroundColor;
    canvas
      .loadFromJSON(targetCanvas)
      .then(() => {
        if (!canvas.backgroundColor) canvas.backgroundColor = backgroundColor;
        canvas.requestRenderAll();
      })
      .catch(() => {
        // TODO(#70): Log the error according to the policy decided in #70.
        toast.add({
          type: "error",
          title: "履歴の復元に失敗しました。",
          id: RESTORE_ERROR_TOAST_ID,
        });
      })
      .finally(() => {
        isRestoringRef.current = false;
        setIsOperable(true);
      });
  }, [fabricCanvasRef, isLoaded, history.past.length, history.present]);

  return {
    undo,
    redo,
    canUndo: history.past.length >= 2,
    canRedo: history.future.length > 0,
    isOperable,
  };
};

export { useCanvasHistory };
