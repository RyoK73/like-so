import type { Canvas } from "fabric";
import { RefObject, useEffect, useRef, useState } from "react";
import { toast } from "@/design-system/toast";
import { CanvasJson, useHistory } from "@/sketch-detail/history/useHistory";

const RESTORE_ERROR_TOAST_ID = "restore-history-error";

// Connects `useHistory` to the fabric canvas: records canvas changes, and applies `present` to the canvas on undo / redo.
const useCanvasHistory = (
  fabricCanvasRef: RefObject<Canvas | null>,
  isLoaded: boolean,
) => {
  const { history, recordHistory, undo, redo } = useHistory();
  const [isOperable, setIsOperable] = useState(true); // `true` normally. `false` while restoring, which disables the buttons.
  const isRestoringRef = useRef(false); // Skips recording while the canvas is being restored by undo / redo.
  const isRecordScheduledRef = useRef(false); // `true` until the scheduled record runs. Merges events fired in the same tick into one record.
  const currentCanvasRef = useRef<CanvasJson | null>(null);
  const isInitialRecorded = useRef(false);
  const lastOperationRef = useRef<"undo" | "redo" | null>(null); // Used to move the history back when the restore fails.

  const undoAndRecordOperation = () => {
    lastOperationRef.current = "undo";
    undo();
  };
  const redoAndRecordOperation = () => {
    lastOperationRef.current = "redo";
    redo();
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!isLoaded || !canvas) return;

    if (!isInitialRecorded.current) {
      const initial: CanvasJson = canvas.toJSON();
      isInitialRecorded.current = true;
      currentCanvasRef.current = initial;
      recordHistory(initial);
    }

    // Records the canvas after the current event handlers finish.
    const record = () => {
      if (isRestoringRef.current) return;
      // Removing a multiple selection fires `object:removed` for each shape. Record the canvas once for them.
      if (isRecordScheduledRef.current) return;
      isRecordScheduledRef.current = true;
      // `createShape` adds a shape first and moves it after. Read the canvas after that.
      queueMicrotask(() => {
        isRecordScheduledRef.current = false;
        const recordedCanvas: CanvasJson = canvas.toJSON();
        currentCanvasRef.current = recordedCanvas;
        recordHistory(recordedCanvas);
      });
    };
    canvas.on("object:added", record);
    canvas.on("object:modified", record);
    canvas.on("object:removed", record);

    return () => {
      canvas.off("object:added", record);
      canvas.off("object:modified", record);
      canvas.off("object:removed", record);
    };
  }, [fabricCanvasRef, isLoaded, recordHistory]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!isLoaded || !canvas) return;
    // `past` is empty until the first record is applied.
    if (history.past.length === 0) return;
    if (history.present === currentCanvasRef.current) return;

    const targetCanvas = history.present;
    const operation = lastOperationRef.current;
    lastOperationRef.current = null;
    isRestoringRef.current = true;
    setIsOperable(false);
    // `loadFromJSON` clears the background color.
    const backgroundColor = canvas.backgroundColor;
    canvas
      .loadFromJSON(targetCanvas)
      .then(() => {
        // Updated only on success, so that the canvas and the history stay in sync when the restore fails.
        currentCanvasRef.current = targetCanvas;
        if (!canvas.backgroundColor) canvas.backgroundColor = backgroundColor;
        canvas.requestRenderAll();
      })
      .catch(() => {
        // TODO(#70): Log the error according to the policy decided in #70.
        toast.add({
          type: "error",
          title: "履歴の復元に失敗しました",
          id: RESTORE_ERROR_TOAST_ID,
        });
        // The canvas was not changed. Move the history back with the opposite operation.
        // `currentCanvasRef` is unchanged, so the early return above prevents restoring again.
        if (operation === "undo") redo();
        if (operation === "redo") undo();
      })
      .finally(() => {
        isRestoringRef.current = false;
        setIsOperable(true);
      });
  }, [
    fabricCanvasRef,
    isLoaded,
    history.past.length,
    history.present,
    undo,
    redo,
  ]);

  return {
    undo: undoAndRecordOperation,
    redo: redoAndRecordOperation,
    canUndo: history.past.length >= 2,
    canRedo: history.future.length > 0,
    isOperable,
  };
};

export { useCanvasHistory };
