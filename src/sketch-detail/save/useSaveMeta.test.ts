import { act, renderHook } from "@testing-library/react";
import { useSaveMeta } from "@/sketch-detail/save/useSaveMeta";
import { updateSketchMeta } from "@/supabase/sketch-crud/updateSketchMeta";
import { toast } from "@/design-system/toast";
import { revalidateSketchList } from "@/sketch-detail/save/revalidateSketchList";

vi.mock("@/supabase/sketch-crud/updateSketchMeta", () => ({
  updateSketchMeta: vi.fn(),
}));
vi.mock("@/sketch-detail/save/revalidateSketchList", () => ({
  revalidateSketchList: vi.fn(),
}));
vi.mock("@/supabase/utils/browserClient", () => ({
  createSupabaseBrowserClient: vi.fn(() => ({ client: "test client" })),
}));
vi.mock("@/design-system/toast", () => ({
  toast: { add: vi.fn() },
}));

const SAVE_DELAY = 500;
const SKETCH_ID = "sketch-id";
const INITIAL = { title: "initial title", description: "initial description" };
const META_ERROR_TOAST_ID = "save-sketch-meta-error";

const okResult = { ok: true, value: {} } as Awaited<
  ReturnType<typeof updateSketchMeta>
>;

const renderUseSaveMeta = () => {
  const onValidChange = vi.fn();
  const hook = renderHook(() =>
    useSaveMeta({ sketchId: SKETCH_ID, initial: INITIAL, onValidChange }),
  );
  return { ...hook, onValidChange };
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.mocked(updateSketchMeta).mockResolvedValue(okResult);
  vi.mocked(revalidateSketchList).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSaveMeta", () => {
  it("should not save on the first render", async () => {
    renderUseSaveMeta();

    await advance(SAVE_DELAY * 2);

    expect(updateSketchMeta).not.toHaveBeenCalled();
  });

  it("should save once with the trimmed title after the delay when a valid title is input", async () => {
    const { result } = renderUseSaveMeta();

    act(() => result.current.setTitle("  new title  "));
    await advance(SAVE_DELAY - 1);
    expect(updateSketchMeta).not.toHaveBeenCalled();
    await advance(1);

    expect(updateSketchMeta).toHaveBeenCalledOnce();
    expect(updateSketchMeta).toHaveBeenCalledWith(
      expect.anything(),
      SKETCH_ID,
      { title: "new title", description: INITIAL.description },
    );
  });

  it("should save only the last value once when inputs are made in a row within the delay", async () => {
    const { result } = renderUseSaveMeta();

    act(() => result.current.setTitle("a"));
    await advance(200);
    act(() => result.current.setTitle("ab"));
    await advance(SAVE_DELAY);

    expect(updateSketchMeta).toHaveBeenCalledOnce();
    expect(updateSketchMeta).toHaveBeenCalledWith(
      expect.anything(),
      SKETCH_ID,
      { title: "ab", description: INITIAL.description },
    );
  });

  it("should call onValidChange immediately, without waiting for the save", async () => {
    const { result, onValidChange } = renderUseSaveMeta();

    act(() => result.current.setTitle("new title"));

    expect(onValidChange).toHaveBeenCalledWith({
      title: "new title",
      description: INITIAL.description,
    });
    expect(updateSketchMeta).not.toHaveBeenCalled();
  });

  it("should not save, not call onValidChange and return an error when the title is empty", async () => {
    const { result, onValidChange } = renderUseSaveMeta();

    act(() => result.current.setTitle(""));
    await advance(SAVE_DELAY * 2);

    expect(updateSketchMeta).not.toHaveBeenCalled();
    expect(onValidChange).not.toHaveBeenCalled();
    expect(result.current.errors.title).toBeDefined();
  });

  it("should save and clear the error when an invalid title is fixed", async () => {
    const { result, onValidChange } = renderUseSaveMeta();

    act(() => result.current.setTitle(""));
    await advance(SAVE_DELAY);
    expect(updateSketchMeta).not.toHaveBeenCalled();
    expect(onValidChange).not.toHaveBeenCalled();
    expect(result.current.errors.title).toBeDefined();

    act(() => result.current.setTitle("fixed title"));
    await advance(SAVE_DELAY);

    expect(updateSketchMeta).toHaveBeenCalledOnce();
    expect(result.current.errors.title).toBeUndefined();
  });

  it("should not save and return an error when the description has 501 characters", async () => {
    const { result } = renderUseSaveMeta();

    act(() => result.current.setDescription("a".repeat(501)));
    await advance(SAVE_DELAY * 2);

    expect(updateSketchMeta).not.toHaveBeenCalled();
    expect(result.current.errors.description).toBeDefined();
  });

  it("should not save when the value returns to the last saved value", async () => {
    const { result } = renderUseSaveMeta();

    act(() => result.current.setTitle("changed"));
    await advance(200);
    act(() => result.current.setTitle(INITIAL.title));
    await advance(SAVE_DELAY * 2);

    expect(updateSketchMeta).not.toHaveBeenCalled();
  });

  it("should not show a toast when the save succeeds", async () => {
    const { result } = renderUseSaveMeta();

    act(() => result.current.setTitle("new title"));
    await advance(SAVE_DELAY);

    expect(toast.add).not.toHaveBeenCalled();
  });

  describe("revalidateSketchList", () => {
    it("should be called once after the save succeeds", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("new title"));
      await advance(SAVE_DELAY);

      expect(revalidateSketchList).toHaveBeenCalledOnce();
    });

    it("should not be called when the value returns to the last saved value", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("changed"));
      await advance(200);
      act(() => result.current.setTitle(INITIAL.title));
      await advance(SAVE_DELAY * 2);

      expect(revalidateSketchList).not.toHaveBeenCalled();
    });

    it("should not be called when the input is invalid", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle(""));
      await advance(SAVE_DELAY * 2);

      expect(revalidateSketchList).not.toHaveBeenCalled();
    });

    it("should be called once when inputs are made in a row within the delay", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("a"));
      await advance(200);
      act(() => result.current.setTitle("ab"));
      await advance(SAVE_DELAY);

      expect(updateSketchMeta).toHaveBeenCalledOnce();
      expect(revalidateSketchList).toHaveBeenCalledOnce();
    });

    it("should neither throw nor show a toast, and should remember the saved value, even so revalidateSketchList rejects", async () => {
      vi.mocked(revalidateSketchList).mockRejectedValue(new Error("test"));
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("new title"));
      await advance(SAVE_DELAY);
      // The same value as the saved one is skipped, so the save is not called again.
      act(() => result.current.setTitle("other"));
      await advance(200);
      act(() => result.current.setTitle("new title"));
      await advance(SAVE_DELAY * 2);

      expect(toast.add).not.toHaveBeenCalled();
      expect(updateSketchMeta).toHaveBeenCalledOnce();
    });
  });

  describe("when the save fails", () => {
    beforeEach(() => {
      vi.mocked(updateSketchMeta).mockResolvedValue({
        ok: false,
        error: new Error("test error"),
      });
    });

    it("should not call revalidateSketchList", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("new title"));
      await advance(SAVE_DELAY);

      expect(revalidateSketchList).not.toHaveBeenCalled();
    });

    it("should show the toast of the meta error and keep the input value and onValidChange", async () => {
      const { result, onValidChange } = renderUseSaveMeta();

      act(() => result.current.setTitle("new title"));
      await advance(SAVE_DELAY);

      expect(toast.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          id: META_ERROR_TOAST_ID,
        }),
      );
      expect(result.current.title).toBe("new title");
      expect(onValidChange).toHaveBeenLastCalledWith({
        title: "new title",
        description: INITIAL.description,
      });
    });

    it("should try to save again at the next input", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("new title"));
      await advance(SAVE_DELAY);
      act(() => result.current.setTitle("new title 2"));
      await advance(SAVE_DELAY);

      expect(updateSketchMeta).toHaveBeenCalledTimes(2);
      expect(updateSketchMeta).toHaveBeenLastCalledWith(
        expect.anything(),
        SKETCH_ID,
        { title: "new title 2", description: INITIAL.description },
      );
    });
  });

  describe("while a save is in flight", () => {
    let resolveFirstSave: (value: typeof okResult) => void;

    beforeEach(() => {
      vi.mocked(updateSketchMeta).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstSave = resolve;
          }),
      );
    });

    it("should wait for the first save, then save the latest value once", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("a"));
      await advance(SAVE_DELAY);
      expect(updateSketchMeta).toHaveBeenCalledTimes(1);

      act(() => result.current.setTitle("ab"));
      await advance(SAVE_DELAY * 2);
      expect(updateSketchMeta).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveFirstSave(okResult);
        await vi.advanceTimersByTimeAsync(SAVE_DELAY);
      });

      expect(updateSketchMeta).toHaveBeenCalledTimes(2);
      expect(updateSketchMeta).toHaveBeenLastCalledWith(
        expect.anything(),
        SKETCH_ID,
        { title: "ab", description: INITIAL.description },
      );
      expect(revalidateSketchList).toHaveBeenCalledTimes(2);
    });

    it("should save only the last value once after the first save when inputs are made several times", async () => {
      const { result } = renderUseSaveMeta();

      act(() => result.current.setTitle("a"));
      await advance(SAVE_DELAY);
      act(() => result.current.setTitle("ab"));
      await advance(SAVE_DELAY);
      act(() => result.current.setTitle("abc"));
      await advance(SAVE_DELAY);
      act(() => result.current.setTitle("abcd"));
      await advance(SAVE_DELAY);
      expect(updateSketchMeta).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveFirstSave(okResult);
        await vi.advanceTimersByTimeAsync(SAVE_DELAY);
      });

      expect(updateSketchMeta).toHaveBeenCalledTimes(2);
      expect(updateSketchMeta).toHaveBeenLastCalledWith(
        expect.anything(),
        SKETCH_ID,
        { title: "abcd", description: INITIAL.description },
      );
    });
  });
});
