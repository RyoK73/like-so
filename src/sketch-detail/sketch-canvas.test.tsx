import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fabric from "fabric";
import { SketchCanvas } from "@/sketch-detail/sketch-canvas";
import { saveToDb } from "@/sketch-detail/save/saveToDb";
import { toast } from "@/design-system/toast";
import type { GetSketch } from "@/supabase/sketch-crud/getSketch.types";

vi.mock("@/sketch-detail/save/saveToDb", () => ({ saveToDb: vi.fn() }));
vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

const sketchId = "11111111-1111-4111-8111-111111111111";
const rectJson = {
  version: fabric.version,
  objects: [
    {
      type: "Rect",
      version: fabric.version,
      left: 10,
      top: 10,
      width: 100,
      height: 50,
      fill: "transparent",
    },
  ],
};
const createSketch = (override: Partial<GetSketch> = {}): GetSketch => ({
  id: sketchId,
  title: "my sketch",
  description: "my description",
  width: 800,
  height: 600,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
  canvas_json: {},
  cell_size: 16,
  frame_id: "22222222-2222-4222-8222-222222222222",
  fabric_version: fabric.version,
  ...override,
});

const getAddShapeButton = (name: string) =>
  screen.getByRole("button", { name: `${name}を追加` });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(saveToDb).mockResolvedValue({
    ok: true,
    value: { id: sketchId },
  } as Awaited<ReturnType<typeof saveToDb>>);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("should enable the shape buttons after the sketch is loaded", async () => {
  render(<SketchCanvas sketch={createSketch()} />);

  expect(getAddShapeButton("四角形")).toBeDisabled();
  await waitFor(() => expect(getAddShapeButton("四角形")).toBeEnabled());
  expect(getAddShapeButton("円")).toBeEnabled();
});

it("should add a shape and save the sketch when a shape button is clicked", async () => {
  const user = userEvent.setup();
  render(<SketchCanvas sketch={createSketch()} />);
  await waitFor(() => expect(getAddShapeButton("円")).toBeEnabled());

  await user.click(getAddShapeButton("円"));

  await waitFor(() => expect(saveToDb).toHaveBeenCalledOnce());
  const savedCanvas = vi.mocked(saveToDb).mock.calls[0][0];
  expect(savedCanvas.getObjects()).toHaveLength(1);
  expect(savedCanvas.getObjects()[0]).toBeInstanceOf(fabric.Circle);
});

it("should save with the title, description, cell_size, frame and id of the sketch", async () => {
  const user = userEvent.setup();
  const sketch = createSketch();
  render(<SketchCanvas sketch={sketch} />);
  await waitFor(() => expect(getAddShapeButton("四角形")).toBeEnabled());

  await user.click(getAddShapeButton("四角形"));

  await waitFor(() => expect(saveToDb).toHaveBeenCalledOnce());
  const [, sketchInfo, frame, savedId] = vi.mocked(saveToDb).mock.calls[0];
  expect(sketchInfo).toEqual({
    title: "my sketch",
    description: "my description",
    cell_size: 16,
  });
  expect(frame).toEqual({
    width: 800,
    height: 600,
    frame_id: sketch.frame_id,
  });
  expect(savedId).toBe(sketchId);
});

it("should not save just by opening a sketch that has objects", async () => {
  render(<SketchCanvas sketch={createSketch({ canvas_json: rectJson })} />);
  await waitFor(() => expect(getAddShapeButton("四角形")).toBeEnabled());

  await new Promise((resolve) => setTimeout(resolve, 400)); // Longer than SAVE_DELAY(250ms).

  expect(saveToDb).not.toHaveBeenCalled();
});

it("should show an error toast with a fixed id when saving fails", async () => {
  vi.mocked(saveToDb).mockResolvedValue({
    ok: false,
    error: new Error("internal detail"),
  });
  const user = userEvent.setup();
  render(<SketchCanvas sketch={createSketch()} />);
  await waitFor(() => expect(getAddShapeButton("円")).toBeEnabled());

  await user.click(getAddShapeButton("円"));

  await waitFor(() =>
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        title: "保存に失敗しました。",
        id: "save-sketch-error",
      }),
    ),
  );
});

it("should show an alert and a link without the buttons when loading fails", async () => {
  vi.spyOn(fabric.Canvas.prototype, "loadFromJSON").mockRejectedValue(
    new Error("test load error"),
  );

  render(<SketchCanvas sketch={createSketch()} />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "スケッチの読み込みに失敗しました。ページを再読み込みしてください。",
  );
  expect(
    screen.getByRole("link", { name: "スケッチ一覧へ戻る" }),
  ).toHaveAttribute("href", "/sketches");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
