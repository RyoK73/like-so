import { useEffect, useState, type RefObject } from "react";
import type { Canvas } from "fabric";
import {
  clampPan,
  fitFrame,
  resolveWheelAction,
  zoomAt,
  type Size,
  type Transform,
} from "@/sketch-detail/viewport/viewportMath";

type View = { transform: Transform; elementSize: Size };

type UseViewport = {
  fabricCanvasRef: RefObject<Canvas | null>;
  // The element that holds the canvas. Its content box is the max size of the canvas element.
  canvasContainerRef: RefObject<HTMLElement | null>;
  frame: Size;
  isLoaded: boolean;
};

// Do not start the pan mode while the user operates a control, so that Space can still press a button or type a space.
const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, a, [contenteditable='true']";
const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;

// Fit the canvas element in the canvas container, and pan and zoom the frame inside it.
// The view goes back to the initial one when the canvas container is resized.
const useViewport = ({
  fabricCanvasRef,
  canvasContainerRef,
  frame,
  isLoaded,
}: UseViewport) => {
  const [view, setView] = useState<View>();
  const { width: frameWidth, height: frameHeight } = frame;

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const container = canvasContainerRef.current;
    if (!isLoaded || !canvas || !container) return;

    const frameSize = { width: frameWidth, height: frameHeight };
    // Keep the elements now, because `useFabricCanvas` disposes the canvas before this cleanup runs.
    const wrapperEl = canvas.wrapperEl;
    const upperEl = canvas.upperCanvasEl;
    let currentViewInfo: View | undefined;

    const apply = (next: View) => {
      const { zoom, tx, ty } = next.transform;
      currentViewInfo = next;
      canvas.setViewportTransform([zoom, 0, 0, zoom, tx, ty]);
      canvas.requestRenderAll();
      setView(next);
    };

    const panTo = (transform: Transform) => {
      if (!currentViewInfo) return;
      apply({
        ...currentViewInfo,
        transform: clampPan(transform, frameSize, currentViewInfo.elementSize),
      });
    };

    const resetView = (containerSize: Size) => {
      const { elementSize, zoom, tx, ty } = fitFrame(frameSize, containerSize);
      canvas.setDimensions(elementSize);
      apply({ transform: { zoom, tx, ty }, elementSize });
    };

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Keep the current view while the canvas container is not measured yet.
      if (width <= 0 || height <= 0) return;
      resetView({ width, height });
    });
    observer.observe(container);

    const onWheel = (e: WheelEvent) => {
      if (!currentViewInfo) return;
      // Stop the browser from scrolling the page and from zooming it by pinch.
      e.preventDefault();
      const action = resolveWheelAction(e);
      const { transform } = currentViewInfo;
      if (action.type === "pan") {
        panTo({
          ...transform,
          tx: transform.tx + action.dx,
          ty: transform.ty + action.dy,
        });
      } else if (action.type === "zoom") {
        const rect = upperEl.getBoundingClientRect();
        const pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        panTo(zoomAt(transform, pointer, action.factor));
      }
    };
    wrapperEl.addEventListener("wheel", onWheel, { passive: false });

    // Pan mode: while Space is held, dragging moves the view instead of selecting shapes.
    let isPanMode = false;
    let isDragging = false;
    let last = { x: 0, y: 0 };
    const getCanvasInteraction = () => ({
      selection: canvas.selection,
      skipTargetFind: canvas.skipTargetFind,
      defaultCursor: canvas.defaultCursor,
    });
    let savedInteraction = getCanvasInteraction();

    const setCursor = (cursor: string) => {
      canvas.defaultCursor = cursor;
      upperEl.style.cursor = cursor;
    };

    const startPanMode = () => {
      savedInteraction = getCanvasInteraction();
      isPanMode = true;
      canvas.selection = false;
      canvas.skipTargetFind = true;
      setCursor("grab");
    };

    const endPanMode = () => {
      if (!isPanMode) return;
      isPanMode = false;
      isDragging = false;
      canvas.selection = savedInteraction.selection;
      canvas.skipTargetFind = savedInteraction.skipTargetFind;
      setCursor(savedInteraction.defaultCursor);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isInteractive(e.target)) return;
      e.preventDefault();
      if (!isPanMode) startPanMode();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") endPanMode();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!isPanMode) return;
      isDragging = true;
      last = { x: e.clientX, y: e.clientY };
      upperEl.setPointerCapture?.(e.pointerId);
      setCursor("grabbing");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !currentViewInfo) return;
      const { transform } = currentViewInfo;
      panTo({
        ...transform,
        tx: transform.tx + e.clientX - last.x,
        ty: transform.ty + e.clientY - last.y,
      });
      last = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      setCursor("grab");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", endPanMode);
    upperEl.addEventListener("pointerdown", onPointerDown);
    upperEl.addEventListener("pointermove", onPointerMove);
    upperEl.addEventListener("pointerup", onPointerUp);
    upperEl.addEventListener("pointercancel", onPointerUp);

    return () => {
      observer.disconnect();
      wrapperEl.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", endPanMode);
      upperEl.removeEventListener("pointerdown", onPointerDown);
      upperEl.removeEventListener("pointermove", onPointerMove);
      upperEl.removeEventListener("pointerup", onPointerUp);
      upperEl.removeEventListener("pointercancel", onPointerUp);
    };
  }, [fabricCanvasRef, canvasContainerRef, frameWidth, frameHeight, isLoaded]);

  return { view };
};

export { useViewport };
export type { View };
