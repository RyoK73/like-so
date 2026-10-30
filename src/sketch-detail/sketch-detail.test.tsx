import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { SketchDetail } from "@/sketch-detail/sketch-detail";
import { SketchCanvas } from "@/sketch-detail/sketch-canvas";
import { TitleToolbar } from "@/sketch-detail/title-toolbar";
import { getSketch } from "@/supabase/sketch-crud/getSketch";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";

const validId = "11111111-1111-4111-8111-111111111111";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("@/supabase/utils/serverClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/supabase/sketch-crud/getSketch", () => ({ getSketch: vi.fn() }));
vi.mock("@/sketch-detail/sketch-canvas", () => ({
  SketchCanvas: vi.fn(() => <div data-testid="sketch-canvas" />),
}));
vi.mock("@/sketch-detail/title-toolbar", () => ({
  TitleToolbar: vi.fn(() => <div data-testid="title-toolbar" />),
}));

describe("SketchDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      {} as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
  });

  test("should pass the title, description, size and updated_at to TitleToolbar", async () => {
    vi.mocked(getSketch).mockResolvedValue({
      ok: true,
      value: {
        id: validId,
        title: "my sketch",
        description: "my description",
        width: 1920,
        height: 1080,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-02T00:00:00Z",
        canvas_json: {},
        cell_size: 32,
        frame_id: null,
        fabric_version: "7.4.0",
      },
    });

    render(await SketchDetail({ id: validId }));

    expect(screen.getByTestId("title-toolbar")).toBeInTheDocument();
    expect(vi.mocked(TitleToolbar).mock.calls[0][0]).toEqual({
      title: "my sketch",
      description: "my description",
      width: 1920,
      height: 1080,
      updatedAt: "2026-10-02T00:00:00Z",
    });
  });

  test("should pass the fetched sketch to SketchCanvas", async () => {
    const sketch = {
      id: validId,
      title: "my sketch",
      description: "",
      width: 1920,
      height: 1080,
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-02T00:00:00Z",
      canvas_json: { objects: [] },
      cell_size: 32,
      frame_id: null,
      fabric_version: "7.4.0",
    };
    vi.mocked(getSketch).mockResolvedValue({ ok: true, value: sketch });

    render(await SketchDetail({ id: validId }));

    expect(screen.getByTestId("sketch-canvas")).toBeInTheDocument();
    expect(vi.mocked(SketchCanvas).mock.calls[0][0]).toEqual({ sketch });
  });

  test("should call notFound without fetching when the id is not a uuid", async () => {
    await expect(SketchDetail({ id: "not-a-uuid" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    expect(notFound).toHaveBeenCalled();
    expect(getSketch).not.toHaveBeenCalled();
  });

  test("should call notFound when getSketch returns null", async () => {
    vi.mocked(getSketch).mockResolvedValue({ ok: true, value: null });

    await expect(SketchDetail({ id: validId })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  test("should render an error message and a link to `sketches` when fetching fails", async () => {
    vi.mocked(getSketch).mockResolvedValue({
      ok: false,
      error: new Error("test error"),
    });

    render(await SketchDetail({ id: validId }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "スケッチの取得に失敗しました。",
    );
    const link = screen.getByRole("link", { name: "スケッチ一覧へ戻る" });
    expect(link).toHaveAttribute("href", "/sketches");
  });
});
