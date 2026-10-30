import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { saveToDb } from "@/sketch-detail/save/saveToDb";
import { Canvas, version } from "fabric";
import { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";
import { CanvasFrame } from "@/sketch-detail/save/saveToDb.types";

vi.mock(import("@/supabase/sketch-crud/handleDb"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    upsertSketch: vi.fn(),
  };
});

const browserClientStub = {} as ReturnType<typeof createSupabaseBrowserClient>;

vi.mock("@/supabase/utils/browserClient", () => ({
  createSupabaseBrowserClient: vi.fn(() => browserClientStub),
}));

const canvas = new Canvas();

describe("saveToDb", () => {
  const testTitle = "Test Title";
  const testFrame: CanvasFrame = {
    width: 1920,
    height: 1080,
    frame_id: "test-frame-id",
  };

  it("should call insertSketch to save into Db with the valid arguments.", () => {
    saveToDb(canvas, { title: testTitle }, testFrame);
    const validArgument: InsertSketch = {
      title: testTitle,
      canvas_json: canvas.toJSON(),
      fabric_version: version,
      width: testFrame.width,
      height: testFrame.height,
      frame_id: testFrame.frame_id,
    };
    expect(upsertSketch).toHaveBeenCalledWith(browserClientStub, validArgument);
  });

  it("should save a custom size when frame_id is null.", () => {
    const customFrame: CanvasFrame = {
      width: 800,
      height: 600,
      frame_id: null,
    };
    saveToDb(canvas, { title: testTitle }, customFrame);

    expect(upsertSketch).toHaveBeenCalledWith(
      browserClientStub,
      expect.objectContaining({ width: 800, height: 600, frame_id: null }),
    );
  });

  it("should save a custom size when frame_id is omitted.", () => {
    saveToDb(canvas, { title: testTitle }, { width: 800, height: 600 });

    expect(upsertSketch).toHaveBeenCalledWith(
      browserClientStub,
      expect.objectContaining({ width: 800, height: 600 }),
    );
  });

  it("should pass cell_size to upsertSketch when sketchInfo has it.", () => {
    saveToDb(canvas, { title: testTitle, cell_size: 32 }, testFrame);

    expect(upsertSketch).toHaveBeenCalledWith(
      browserClientStub,
      expect.objectContaining({ cell_size: 32 }),
    );
  });

  it("should not pass cell_size to upsertSketch when sketchInfo omits it.", () => {
    saveToDb(canvas, { title: testTitle }, testFrame);

    expect(upsertSketch).toHaveBeenCalledWith(
      browserClientStub,
      expect.not.objectContaining({ cell_size: expect.anything() }),
    );
  });

  it("should pass sketchId as id to upsertSketch.", () => {
    saveToDb(canvas, { title: testTitle }, testFrame, "test-sketch-id");

    expect(upsertSketch).toHaveBeenCalledWith(
      browserClientStub,
      expect.objectContaining({ id: "test-sketch-id" }),
    );
  });

  it("should return id", async () => {
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: true,
      value: {
        canvas_json: "test json",
        title: testTitle,
        fabric_version: version,
        created_at: Date.now().toString(),
        description: "",
        cell_size: 32,
        frame_id: testFrame.frame_id ?? null,
        width: testFrame.width,
        height: testFrame.height,
        id: "test-id",
        user_id: "test-user-id",
        updated_at: Date.now().toString(),
      },
    });
    const saveResult = await saveToDb(canvas, { title: testTitle }, testFrame);
    if (!saveResult.ok) {
      throw new Error(saveResult.error.message);
    }

    expect(saveResult.value.id).not.toBeNull();
    expect(saveResult.value.id).not.toBeUndefined();
  });

  it("should return an error when upsertSketch fails", async () => {
    const testError: Error = {
      name: "Test Error",
      message: "Test Error Message",
    };
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: false,
      error: testError,
    });
    const saveResult = await saveToDb(canvas, { title: testTitle }, testFrame);
    if (saveResult.ok) throw new Error(`saveResult returns ${saveResult.ok}`);

    expect(saveResult.ok).toBe(false);
    expect(saveResult.error).toEqual(testError);
  });
});
