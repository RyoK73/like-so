import { act, renderHook, waitFor } from "@testing-library/react";
import { useSave } from "@/sketch-detail/save/useSave";
import { Canvas, Rect } from "fabric";
import { saveToDb } from "@/sketch-detail/save/saveToDb";
import { CanvasFrame } from "@/sketch-detail/save/saveToDb.types";
import { revalidateSketchList } from "@/sketch-detail/save/revalidateSketchList";

vi.mock("@/sketch-detail/save/saveToDb", () => ({
  saveToDb: vi.fn(),
}));
vi.mock("@/sketch-detail/save/revalidateSketchList", () => ({
  revalidateSketchList: vi.fn(),
}));

describe("useSave", () => {
  const fabricCanvasTestRef = { current: new Canvas() };
  const canvasIdTestRef = { current: "canvas_id" };
  const testFrame: CanvasFrame = {
    width: 1920,
    height: 1080,
    frame_id: "test-frame-id",
  };
  const frameTestRef: { current: CanvasFrame | null } = {
    current: testFrame,
  };
  const testError = new Error("Error: Test Error");

  beforeEach(() => {
    vi.clearAllMocks();
    frameTestRef.current = testFrame;
    vi.mocked(revalidateSketchList).mockResolvedValue(undefined);
    vi.mocked(saveToDb).mockResolvedValue({
      ok: true,
      value: {
        id: "test",
        user_id: "test",
        canvas_json: "test",
        created_at: "test",
        updated_at: "test",
        title: "test",
        description: "test",
        fabric_version: "test",
        cell_size: 32,
        frame_id: null,
        width: 1920,
        height: 1080,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call saveToDb when customHook calls", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      fabricCanvasTestRef.current.fire("object:modified");
    });

    await waitFor(() => {
      expect(saveToDb).toHaveBeenCalled();
    });
  });

  it("should call saveToDb when save funtion is called", async () => {
    const { result, rerender } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    rerender();

    expect(saveToDb).toHaveBeenCalled();
  });
  it("should return last one when save() called in a row.", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    const promises: Promise<void>[] = [];
    await act(async () => {
      for (let ct: number = 0; ct < 4; ct++) {
        promises.push(result.current.save());
      }
    });
    await Promise.all(promises);

    expect(saveToDb).toHaveBeenCalledOnce();
  });
  it("should call saveToDb with the frame of frameRef", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenCalledWith(
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      testFrame,
      canvasIdTestRef.current,
    );
  });
  it("should call saveToDb with the latest frame of frameRef", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });
    const customFrame: CanvasFrame = {
      width: 800,
      height: 600,
      frame_id: null,
    };
    frameTestRef.current = customFrame;

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenCalledWith(
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      customFrame,
      canvasIdTestRef.current,
    );
  });
  it("should pass cell_size in sketchInfoRef to saveToDb", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
        cell_size: 32,
      };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenCalledWith(
      fabricCanvasTestRef.current,
      { title: "test title", cell_size: 32 },
      testFrame,
      canvasIdTestRef.current,
    );
  });
  it("should set null to the err when saveToDb succeeds", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.err).toBeUndefined();
  });
  test("The second saveToDb calling should call saveToDb with the Id that first test returns", async () => {
    const testId: string = "returned-id";
    vi.mocked(saveToDb).mockResolvedValue({
      ok: true,
      value: {
        id: testId,
        user_id: "test",
        canvas_json: "test",
        created_at: "test",
        updated_at: "test",
        title: "test",
        description: "test",
        fabric_version: "test",
        cell_size: 32,
        frame_id: null,
        width: 1920,
        height: 1080,
      },
    });

    const canvasIdReturnableRef: { current: string | undefined } = {
      current: undefined,
    };

    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdReturnableRef, frameTestRef, true),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });
    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenNthCalledWith(
      1,
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      testFrame,
      undefined,
    );
    expect(saveToDb).toHaveBeenNthCalledWith(
      2,
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      testFrame,
      testId,
    );
  });
  describe("revalidateSketchList", () => {
    const renderUseSave = (idRef: { current: string | undefined }) => {
      const hook = renderHook(() =>
        useSave(fabricCanvasTestRef, idRef, frameTestRef, true),
      );
      act(() => {
        hook.result.current.sketchInfoRef.current = { title: "test title" };
      });
      return hook;
    };

    it("should be called once after the save succeeds", async () => {
      const { result } = renderUseSave(canvasIdTestRef);

      await act(async () => {
        await result.current.save();
      });

      expect(revalidateSketchList).toHaveBeenCalledOnce();
    });

    it("should be called after the first save of a new sketch, which has no id yet", async () => {
      const { result } = renderUseSave({ current: undefined });

      await act(async () => {
        await result.current.save();
      });

      expect(revalidateSketchList).toHaveBeenCalledOnce();
    });

    it("should not be called when the save fails, and err is set as before", async () => {
      vi.mocked(saveToDb).mockResolvedValue({ ok: false, error: testError });
      const { result } = renderUseSave(canvasIdTestRef);

      await act(async () => {
        await result.current.save();
      });

      expect(revalidateSketchList).not.toHaveBeenCalled();
      expect(result.current.err).toEqual(testError);
    });

    it("should not set err and should update the id, even so revalidateSketchList rejects", async () => {
      vi.mocked(revalidateSketchList).mockRejectedValue(new Error("test"));
      // Only `id` matters here, so the other columns are omitted.
      vi.mocked(saveToDb).mockResolvedValue({
        ok: true,
        value: { id: "returned-id" } as never,
      });
      const idRef: { current: string | undefined } = { current: undefined };
      const { result } = renderUseSave(idRef);

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.err).toBeUndefined();
      expect(idRef.current).toBe("returned-id");
    });

    it("should be called once when save() is called in a row", async () => {
      const { result } = renderUseSave(canvasIdTestRef);

      const promises: Promise<void>[] = [];
      await act(async () => {
        for (let ct = 0; ct < 4; ct++) {
          promises.push(result.current.save());
        }
      });
      await Promise.all(promises);

      expect(saveToDb).toHaveBeenCalledOnce();
      expect(revalidateSketchList).toHaveBeenCalledOnce();
    });
  });

  describe("isLoaded and object:added", () => {
    const renderUseSave = (isLoaded: boolean) => {
      const hook = renderHook(
        ({ loaded }) =>
          useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, loaded),
        { initialProps: { loaded: isLoaded } },
      );
      act(() => {
        hook.result.current.sketchInfoRef.current = { title: "test title" };
      });
      return hook;
    };

    it("should call saveToDb when an object is added after isLoaded is true", async () => {
      renderUseSave(true);

      await act(async () => {
        fabricCanvasTestRef.current.add(new Rect());
      });

      await waitFor(() => {
        expect(saveToDb).toHaveBeenCalled();
      });
    });

    it("should not call saveToDb when an object is added while isLoaded is false", async () => {
      renderUseSave(false);

      await act(async () => {
        fabricCanvasTestRef.current.add(new Rect());
        await new Promise((resolve) => setTimeout(resolve, 400)); // Longer than SAVE_DELAY(250ms).
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });

    it("should start to call saveToDb after isLoaded turns to true", async () => {
      const { rerender } = renderUseSave(false);

      rerender({ loaded: true });
      await act(async () => {
        fabricCanvasTestRef.current.add(new Rect());
      });

      await waitFor(() => {
        expect(saveToDb).toHaveBeenCalled();
      });
    });
  });

  describe("isLoaded and object:removed", () => {
    const SAVE_DELAY_WAIT = 400; // Longer than SAVE_DELAY(250ms).

    const renderUseSave = (isLoaded: boolean) => {
      const hook = renderHook(
        ({ loaded }) =>
          useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, loaded),
        { initialProps: { loaded: isLoaded } },
      );
      act(() => {
        hook.result.current.sketchInfoRef.current = { title: "test title" };
      });
      return hook;
    };

    // Adds the shapes before `useSave` subscribes, so that only the removal triggers a save.
    const addShapes = (count: number) => {
      const shapes = Array.from({ length: count }, () => new Rect());
      fabricCanvasTestRef.current.add(...shapes);
      return shapes;
    };

    it("should not call saveToDb when an object is removed while isLoaded is false", async () => {
      const [rect] = addShapes(1);
      renderUseSave(false);

      await act(async () => {
        fabricCanvasTestRef.current.remove(rect);
        await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_WAIT));
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });

    it("should call saveToDb when an object is removed after isLoaded is true", async () => {
      const [rect] = addShapes(1);
      renderUseSave(true);

      await act(async () => {
        fabricCanvasTestRef.current.remove(rect);
      });

      await waitFor(() => {
        expect(saveToDb).toHaveBeenCalled();
      });
    });

    it("should call saveToDb once when several objects are removed in a row", async () => {
      const shapes = addShapes(3);
      renderUseSave(true);

      await act(async () => {
        fabricCanvasTestRef.current.remove(...shapes);
        await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_WAIT));
      });

      expect(saveToDb).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error pattern", () => {
    it("should return an error as err when saveToDb returns an error", async () => {
      vi.mocked(saveToDb).mockResolvedValue({
        ok: false,
        error: testError,
      });
      const { result, rerender } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
      });

      await act(async () => {
        await result.current.save();
      });

      rerender();

      expect(result.current.err).toEqual(testError);
    });
    it("should not call saveToDb when isAutoSave is false", async () => {
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
        result.current.setAutoSave(false);
      });

      await act(async () => {
        fabricCanvasTestRef.current.fire("object:modified");
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });
    it("should not call saveToDb when sketchInfoRef is null", async () => {
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
      );

      await act(async () => {
        await result.current.save();
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });
    it("should retrun error when sketchInfoRef is null", async () => {
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
      );

      await act(async () => {
        fabricCanvasTestRef.current.fire("object:modified");
      });

      expect(result.current.err?.message).toEqual(
        "Error: sketchInfoRef is null.",
      );
    });
    it("should not call saveToDb when frameRef is null", async () => {
      frameTestRef.current = null;
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
      });

      await act(async () => {
        await result.current.save();
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });
    it("should return error when frameRef is null", async () => {
      frameTestRef.current = null;
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef, true),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.err?.message).toEqual("Error: frameRef is null.");
    });
    it("should return error and not call saveToDb when fabricCanvasRef is null", async () => {
      const nullCanvasRef = { current: null };
      const { result } = renderHook(() =>
        useSave(nullCanvasRef, canvasIdTestRef, frameTestRef, true),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
      });

      await act(async () => {
        await result.current.save();
      });

      expect(saveToDb).not.toHaveBeenCalled();
      expect(result.current.err?.message).toEqual(
        "Error: fabricCanvasRef is null.",
      );
    });
  });
});
