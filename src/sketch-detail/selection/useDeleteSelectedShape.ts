import type { Canvas } from "fabric";
import { RefObject, useCallback, useEffect } from "react";

// While the user types in these elements, the Delete key must not delete a shape.
const EDITABLE_SELECTOR =
  "input, textarea, [contenteditable]:not([contenteditable='false'])";

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;

// The Delete key process needs to know whether it is disabled or not.
const useDeleteSelectedShape = (
  fabricCanvasRef: RefObject<Canvas | null>,
  disabled: boolean,
) => {
  const deleteSelectedShape = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (disabled || !canvas) return;
    const selectedShapes = canvas.getActiveObjects();
    if (selectedShapes.length === 0) return;
    // Release the selection first. Shapes in a multiple selection are moved out of it by this.
    canvas.discardActiveObject();
    canvas.remove(...selectedShapes);
  }, [fabricCanvasRef, disabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete") return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }
      if (event.isComposing) return; // The IME is converting text.
      if (isEditableTarget(event.target)) return;
      deleteSelectedShape();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedShape]);

  return { deleteSelectedShape };
};

export { useDeleteSelectedShape };
