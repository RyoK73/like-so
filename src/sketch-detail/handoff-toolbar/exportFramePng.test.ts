import type * as fabric from "fabric";
import { exportFramePng } from "@/sketch-detail/handoff-toolbar/exportFramePng";

// jsdom cannot draw the canvas, so the fabric canvas is replaced by a plain object that records what it sees.
const FRAME = { width: 1200, height: 800 };
const PAPER_COLOR = "rgb(250, 249, 245)";
const ORIGINAL_TRANSFORM = [0.5, 0, 0, 0.5, 10, 20];
const IDENTITY = [1, 0, 0, 1, 0, 0];
const PNG = new Blob(["png"], { type: "image/png" });

type StateAtDraw = { transform: number[]; backgroundColor: string };

const createFakeCanvas = (
  options: { throws?: boolean; blob?: Blob | null } = {},
) => {
  const { throws = false, blob = PNG } = options;
  const statesAtDraw: StateAtDraw[] = [];
  const canvas = {
    viewportTransform: [...ORIGINAL_TRANSFORM],
    backgroundColor: "transparent",
    toCanvasElement: vi.fn(() => {
      statesAtDraw.push({
        transform: [...canvas.viewportTransform],
        backgroundColor: String(canvas.backgroundColor),
      });
      if (throws) throw new Error("draw failed");
      return {
        toBlob: (callback: (blob: Blob | null) => void) => callback(blob),
      };
    }),
  };
  return {
    canvas,
    statesAtDraw,
    createFakeFabricCanvas: () => canvas as unknown as fabric.Canvas,
  };
};

it("should draw the whole frame at the scale 1 regardless of the zoom", async () => {
  const { canvas, createFakeFabricCanvas } = createFakeCanvas();

  await exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR);

  expect(canvas.toCanvasElement).toHaveBeenCalledWith(1, {
    left: 0,
    top: 0,
    width: 1200,
    height: 800,
  });
});

it("should use the identity viewport transform while drawing", async () => {
  const { statesAtDraw, createFakeFabricCanvas } = createFakeCanvas();

  await exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR);

  expect(statesAtDraw).toHaveLength(1);
  expect(statesAtDraw[0].transform).toEqual(IDENTITY);
});

it("should paint the paper color while drawing", async () => {
  const { statesAtDraw, createFakeFabricCanvas } = createFakeCanvas();

  await exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR);

  expect(statesAtDraw[0].backgroundColor).toBe(PAPER_COLOR);
});

it("should restore the viewport transform after drawing", async () => {
  const { canvas, createFakeFabricCanvas } = createFakeCanvas();

  await exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR);

  expect(canvas.viewportTransform).toEqual(ORIGINAL_TRANSFORM);
});

it("should restore the background color after drawing", async () => {
  const { canvas, createFakeFabricCanvas } = createFakeCanvas();

  await exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR);

  expect(canvas.backgroundColor).toBe("transparent");
});

it("should restore the viewport transform and the background color when drawing throws", async () => {
  const { canvas, createFakeFabricCanvas } = createFakeCanvas({ throws: true });

  await expect(
    exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR),
  ).rejects.toThrow();

  expect(canvas.viewportTransform).toEqual(ORIGINAL_TRANSFORM);
  expect(canvas.backgroundColor).toBe("transparent");
});

it("should reject when the blob cannot be made", async () => {
  const { createFakeFabricCanvas } = createFakeCanvas({ blob: null });

  await expect(
    exportFramePng(createFakeFabricCanvas(), FRAME, PAPER_COLOR),
  ).rejects.toThrow();
});
