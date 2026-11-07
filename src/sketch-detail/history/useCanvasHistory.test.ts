import { act, renderHook } from "@testing-library/react";
import type { Canvas } from "fabric";
import { toast } from "@/design-system/toast";
import type { CanvasJson } from "@/sketch-detail/history/useHistory";
import { useCanvasHistory } from "@/sketch-detail/history/useCanvasHistory";

type Handler = () => void;

const createTestCanvasJson = (id: number): CanvasJson => ({
  version: "0.0.0",
  objects: [id],
});

const json = {
  initial: createTestCanvasJson(0),
  first: createTestCanvasJson(1),
  second: createTestCanvasJson(2),
};

// A minimal stand-in for `fabric.Canvas`. `change` mimics a user operation: the canvas changes first, then the event fires.

const createFakeCanvas = (initial: CanvasJson) => {
  let current = initial;
  const handlers = new Map<string, Set<Handler>>();
  const emit = (name: string) => handlers.get(name)?.forEach((h) => h());

  const canvas = {
    backgroundColor: "transparent",
    requestRenderAll: vi.fn(),
    on: vi.fn((name: string, handler: Handler) => {
      handlers.set(name, (handlers.get(name) ?? new Set()).add(handler));
    }),
    off: vi.fn((name: string, handler: Handler) => {
      handlers.get(name)?.delete(handler);
    }),
    toJSON: vi.fn(() => current),
    // `loadFromJSON` of fabric clears the canvas first (`object:removed` for each object), then fires `object:added` for each restored object.
    loadFromJSON: vi.fn(async (next: CanvasJson) => {
      emit("object:removed");
      emit("object:added");
      current = next;
    }),
  };

  const change = (next: CanvasJson, event = "object:added") => {
    current = next;
    emit(event);
  };

  return { canvas, change, emit };
};

const setup = ({ isLoaded = true }: { isLoaded?: boolean } = {}) => {
  const fakeCanvas = createFakeCanvas(json.initial);
  const fabricCanvasRef = { current: fakeCanvas.canvas as unknown as Canvas };
  const hook = renderHook(
    (props: { isLoaded: boolean }) =>
      useCanvasHistory(fabricCanvasRef, props.isLoaded),
    { initialProps: { isLoaded } },
  );
  return { fakeCanvas, ...hook };
};

// Recording is delayed to the next microtask, so flush it inside `act`.
const changeCanvas = async (
  fakeCanvas: ReturnType<typeof createFakeCanvas>,
  next: CanvasJson,
  event?: string,
) => {
  await act(async () => {
    fakeCanvas.change(next, event);
  });
};

const loadedJson = (
  fakeCanvas: ReturnType<typeof createFakeCanvas>,
  call: number,
) => fakeCanvas.canvas.loadFromJSON.mock.calls[call]?.[0];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useCanvasHistory", () => {
  describe("recording", () => {
    it("should not record changes while the canvas is not loaded", async () => {
      const { fakeCanvas } = setup({ isLoaded: false });

      await changeCanvas(fakeCanvas, json.first);

      expect(fakeCanvas.canvas.on).not.toHaveBeenCalled();
      expect(fakeCanvas.canvas.toJSON).not.toHaveBeenCalled();
    });

    it("should record the loaded canvas as the first entry", async () => {
      const { fakeCanvas, result } = setup();

      await changeCanvas(fakeCanvas, json.first);
      await act(async () => result.current.undo());

      expect(fakeCanvas.canvas.toJSON).toHaveBeenCalledTimes(2);
      expect(loadedJson(fakeCanvas, 0)).toEqual(json.initial);
    });

    it("should have nothing to undo or redo right after the first record", () => {
      const { result } = setup();

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it("should be able to undo after `object:added`", async () => {
      const { fakeCanvas, result } = setup();

      await changeCanvas(fakeCanvas, json.first, "object:added");

      expect(result.current.canUndo).toBe(true);
    });

    it("should be able to undo after `object:modified`", async () => {
      const { fakeCanvas, result } = setup();

      await changeCanvas(fakeCanvas, json.first, "object:modified");

      expect(result.current.canUndo).toBe(true);
    });

    it("should be able to undo after `object:removed`", async () => {
      const { fakeCanvas, result } = setup();

      await changeCanvas(fakeCanvas, json.first, "object:removed");

      expect(result.current.canUndo).toBe(true);
    });

    it("should restore the previous canvas on undo after `object:removed`", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first, "object:added");
      await changeCanvas(fakeCanvas, json.second, "object:removed");

      await act(async () => result.current.undo());

      expect(loadedJson(fakeCanvas, 0)).toEqual(json.first);
    });

    it("should restore the removed state again on redo after undo", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first, "object:added");
      await changeCanvas(fakeCanvas, json.second, "object:removed");
      await act(async () => result.current.undo());

      await act(async () => result.current.redo());

      expect(loadedJson(fakeCanvas, 1)).toEqual(json.second);
    });

    it("should record one entry when `object:removed` fires several times at once", async () => {
      const { fakeCanvas, result } = setup();

      // Deleting a multiple selection fires `object:removed` for each shape in the same tick.
      await act(async () => {
        fakeCanvas.change(json.first, "object:removed");
        fakeCanvas.emit("object:removed");
      });
      await act(async () => result.current.undo());

      expect(result.current.canUndo).toBe(false);
      expect(loadedJson(fakeCanvas, 0)).toEqual(json.initial);
    });

    it("should record one entry when events fire several times in the same tick", async () => {
      const { fakeCanvas } = setup();
      const recordedBefore = fakeCanvas.canvas.toJSON.mock.calls.length;

      await act(async () => {
        fakeCanvas.change(json.first, "object:added");
        fakeCanvas.emit("object:modified");
        fakeCanvas.emit("object:removed");
      });

      expect(fakeCanvas.canvas.toJSON).toHaveBeenCalledTimes(
        recordedBefore + 1,
      );
    });

    it("should not record history on `object:removed` while restoring process is running", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      const recorded = fakeCanvas.canvas.toJSON.mock.calls.length;

      // The fake `loadFromJSON` fires `object:removed` while restoring.
      await act(async () => result.current.undo());

      expect(fakeCanvas.canvas.toJSON).toHaveBeenCalledTimes(recorded);
      expect(result.current.canRedo).toBe(true);
    });

    it("should not be able to redo after a new change following undo", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      await act(async () => result.current.undo());
      expect(result.current.canRedo).toBe(true);

      await changeCanvas(fakeCanvas, json.second);

      expect(result.current.canRedo).toBe(false);
    });

    it("should not record history on `object:added` while restoring process is running", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      const recorded = fakeCanvas.canvas.toJSON.mock.calls.length;

      await act(async () => result.current.undo());

      expect(fakeCanvas.canvas.toJSON).toHaveBeenCalledTimes(recorded);
      expect(result.current.canRedo).toBe(true);
    });
  });

  describe("restoring", () => {
    it("should call `loadFromJSON` with the previous value on undo", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);

      await act(async () => result.current.undo());

      expect(fakeCanvas.canvas.loadFromJSON).toHaveBeenCalledTimes(1);
      expect(loadedJson(fakeCanvas, 0)).toEqual(json.initial);
    });

    it("should call `loadFromJSON` with the next value on redo", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      await act(async () => result.current.undo());

      await act(async () => result.current.redo());

      expect(fakeCanvas.canvas.loadFromJSON).toHaveBeenCalledTimes(2);
      expect(loadedJson(fakeCanvas, 1)).toEqual(json.first);
    });

    it("should disable operations while restoring and enable them again after it finishes", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      let finish: () => void = () => {};
      fakeCanvas.canvas.loadFromJSON.mockImplementationOnce(
        () => new Promise<void>((resolve) => (finish = resolve)),
      );

      await act(async () => result.current.undo());
      expect(result.current.isOperable).toBe(false);

      await act(async () => finish());
      expect(result.current.isOperable).toBe(true);
    });

    it("should not restore on undo when there is only the first entry", async () => {
      const { fakeCanvas, result } = setup();

      await act(async () => result.current.undo());

      expect(fakeCanvas.canvas.loadFromJSON).not.toHaveBeenCalled();
    });

    it("should not restore on redo when there is nothing to redo", async () => {
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);

      await act(async () => result.current.redo());

      expect(fakeCanvas.canvas.loadFromJSON).not.toHaveBeenCalled();
    });

    it("should stop restoring and show an error toast when `loadFromJSON` fails", async () => {
      const add = vi.spyOn(toast, "add").mockReturnValue("toast-id");
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      fakeCanvas.canvas.loadFromJSON.mockRejectedValueOnce(new Error("failed"));

      await act(async () => result.current.undo());

      expect(result.current.isOperable).toBe(true);
      expect(add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "履歴の復元に失敗しました。",
        }),
      );
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
      // The rollback must not restore the canvas again.
      expect(fakeCanvas.canvas.loadFromJSON).toHaveBeenCalledTimes(1);
    });

    it("should put the history position back when `loadFromJSON` fails on redo", async () => {
      vi.spyOn(toast, "add").mockReturnValue("toast-id");
      const { fakeCanvas, result } = setup();
      await changeCanvas(fakeCanvas, json.first);
      await act(async () => result.current.undo());
      fakeCanvas.canvas.loadFromJSON.mockRejectedValueOnce(new Error("failed"));

      await act(async () => result.current.redo());

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
      // One call for the undo, and one for the failed redo.
      expect(fakeCanvas.canvas.loadFromJSON).toHaveBeenCalledTimes(2);
    });
  });
});
