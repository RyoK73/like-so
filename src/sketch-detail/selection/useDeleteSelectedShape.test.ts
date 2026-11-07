import { act, renderHook } from "@testing-library/react";
import { ActiveSelection, Canvas, Rect } from "fabric";
import type { RefObject } from "react";
import { useDeleteSelectedShape } from "@/sketch-detail/selection/useDeleteSelectedShape";

type Trigger = "function" | "key";
const triggers: Trigger[] = ["function", "key"];

const canvases: Canvas[] = [];

const createRect = () => new Rect({ left: 0, top: 0, width: 10, height: 10 });

const setup = ({ disabled = false }: { disabled?: boolean } = {}) => {
  const canvas = new Canvas();
  canvases.push(canvas);
  const fabricCanvasRef: RefObject<Canvas | null> = { current: canvas };
  const hook = renderHook(
    (props: { disabled: boolean }) =>
      useDeleteSelectedShape(fabricCanvasRef, props.disabled),
    { initialProps: { disabled } },
  );
  return { canvas, fabricCanvasRef, ...hook };
};

const pressKey = (
  init: KeyboardEventInit,
  target: EventTarget = document,
): void => {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, ...init }),
    );
  });
};

// Deletes through the given entry point: calling the returned function directly, or pressing the Delete key.
// (Backspace is covered in "Delete / Backspace keys".)
const deleteBy = (
  trigger: Trigger,
  result: { current: ReturnType<typeof useDeleteSelectedShape> },
) => {
  if (trigger === "function") {
    act(() => result.current.deleteSelectedShape());
    return;
  }
  pressKey({ key: "Delete" });
};

afterEach(async () => {
  await Promise.all(canvases.splice(0).map((canvas) => canvas.dispose()));
  document.body.replaceChildren();
});

describe("useDeleteSelectedShape", () => {
  describe.each(triggers)("via %s", (trigger) => {
    it("should delete only the selected shape", () => {
      const { canvas, result } = setup();
      const [a, b, c] = [createRect(), createRect(), createRect()];
      canvas.add(a, b, c);
      canvas.setActiveObject(b);

      deleteBy(trigger, result);

      expect(canvas.getObjects()).toEqual([a, c]);
    });

    it("should do nothing when no shape is selected", () => {
      const { canvas, result } = setup();
      canvas.add(createRect(), createRect());
      const onRemoved = vi.fn();
      canvas.on("object:removed", onRemoved);

      deleteBy(trigger, result);

      expect(canvas.getObjects()).toHaveLength(2);
      expect(onRemoved).not.toHaveBeenCalled();
      canvas.off("object:removed", onRemoved);
    });

    it("should delete all the shapes of a multiple selection", () => {
      const { canvas, result } = setup();
      const [a, b, c] = [createRect(), createRect(), createRect()];
      canvas.add(a, b, c);
      canvas.setActiveObject(new ActiveSelection([a, b], { canvas }));

      deleteBy(trigger, result);

      expect(canvas.getObjects()).toEqual([c]);
    });

    it("should release a multiple selection after deleting, so that it does not keep references to the deleted shapes", () => {
      const { canvas, result } = setup();
      const [a, b] = [createRect(), createRect()];
      canvas.add(a, b);
      canvas.setActiveObject(new ActiveSelection([a, b], { canvas }));

      deleteBy(trigger, result);

      expect(canvas.getActiveObjects()).toEqual([]);
    });

    it("should not delete when `disabled` is true", () => {
      const { canvas, result } = setup({ disabled: true });
      const a = createRect();
      canvas.add(a);
      canvas.setActiveObject(a);

      deleteBy(trigger, result);

      expect(canvas.getObjects()).toEqual([a]);
    });

    it("should delete after `disabled` changes from true to false", () => {
      const { canvas, result, rerender } = setup({ disabled: true });
      const a = createRect();
      canvas.add(a);
      canvas.setActiveObject(a);
      deleteBy(trigger, result);

      expect(canvas.getObjects()).toEqual([a]);
      rerender({ disabled: false });

      deleteBy(trigger, result);

      expect(canvas.getObjects()).toEqual([]);
    });

    it("should do nothing without throwing when the canvas is null", () => {
      const { fabricCanvasRef, result } = setup();
      fabricCanvasRef.current = null;

      expect(() => deleteBy(trigger, result)).not.toThrow();
    });

    it("should delete only one shape when deleting twice with one shape selected", () => {
      const { canvas, result } = setup();
      const [a, b] = [createRect(), createRect()];
      canvas.add(a, b);
      canvas.setActiveObject(a);

      deleteBy(trigger, result);
      deleteBy(trigger, result);

      expect(canvas.getObjects()).toEqual([b]);
    });
  });

  describe.each(["Delete", "Backspace"])("%s key", (key) => {
    const setupSelected = (options?: { disabled?: boolean }) => {
      const hook = setup(options);
      const a = createRect();
      hook.canvas.add(a);
      hook.canvas.setActiveObject(a);
      return { ...hook, a };
    };

    it("should delete the selected shape", () => {
      const { canvas } = setupSelected();

      pressKey({ key });

      expect(canvas.getObjects()).toEqual([]);
    });

    it.each(["ctrlKey", "metaKey", "altKey", "shiftKey"] as const)(
      "should not delete when the key is pressed with %s",
      (modifier) => {
        const { canvas, a } = setupSelected();

        pressKey({ key, [modifier]: true });

        expect(canvas.getObjects()).toEqual([a]);
      },
    );

    it.each([
      ["input", () => document.createElement("input")],
      ["textarea", () => document.createElement("textarea")],
      [
        "contenteditable",
        () => {
          const div = document.createElement("div");
          div.setAttribute("contenteditable", "true");
          return div;
        },
      ],
    ])("should not delete when the key target is %s", (_name, createTarget) => {
      const { canvas, a } = setupSelected();
      const target = createTarget();
      document.body.append(target);

      pressKey({ key }, target);

      expect(canvas.getObjects()).toEqual([a]);
    });

    it("should not delete while the IME is composing", () => {
      const { canvas, a } = setupSelected();

      pressKey({ key, isComposing: true });

      expect(canvas.getObjects()).toEqual([a]);
    });

    it("should not delete after the hook is unmounted", () => {
      const { canvas, a, unmount } = setupSelected();
      unmount();

      pressKey({ key });

      expect(canvas.getObjects()).toEqual([a]);
    });
  });
});
