import { render, screen } from "@testing-library/react";
import { SketchList } from "@/sketch-list/sketch-list";
import { getSketchList } from "@/supabase/sketch-crud/getSketchList";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { dateTimeTestHelper } from "@/sketch-list/testUtility";

const { generateTestDateTime } = dateTimeTestHelper();

vi.mock("@/supabase/utils/serverClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/supabase/sketch-crud/getSketchList", () => ({
  getSketchList: vi.fn(),
}));

const renderSketchList = async () => render(await SketchList());

describe("SketchList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      {} as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
  });

  test("should render the title, description, and updated_at of each sketch in the given order", async () => {
    const newerSketch = {
      id: "id-2",
      title: "second",
      description: "newer description",
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-03T00:00:00Z",
    };
    const olderSketch = {
      id: "id-1",
      title: "first",
      description: "older description",
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-02T00:00:00Z",
    };
    vi.mocked(getSketchList).mockResolvedValue({
      ok: true,
      value: [newerSketch, olderSketch],
    });

    await renderSketchList();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent(newerSketch.title);
    expect(links[0]).toHaveTextContent(newerSketch.description);
    expect(links[0]).toHaveTextContent(
      generateTestDateTime(new Date(newerSketch.updated_at)),
    );
    expect(links[1]).toHaveTextContent(olderSketch.title);
    expect(links[1]).toHaveTextContent(olderSketch.description);
    expect(links[1]).toHaveTextContent(
      generateTestDateTime(new Date(olderSketch.updated_at)),
    );
  });

  test("should link each sketch to /sketches/[id]", async () => {
    const sketch = {
      id: "id-1",
      title: "first",
      description: "description",
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-02T00:00:00Z",
    };
    vi.mocked(getSketchList).mockResolvedValue({
      ok: true,
      value: [sketch],
    });

    await renderSketchList();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/sketches/${sketch.id}`,
    );
  });

  test("should not render the description line when the description is empty", async () => {
    const sketchWithoutDescription = {
      id: "id-1",
      title: "no description",
      description: "",
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-02T00:00:00Z",
    };
    vi.mocked(getSketchList).mockResolvedValue({
      ok: true,
      value: [sketchWithoutDescription],
    });

    await renderSketchList();

    const link = screen.getByRole("link");
    expect(link.querySelectorAll("span")).toHaveLength(1);
  });

  test("should render a message when there are no sketches", async () => {
    vi.mocked(getSketchList).mockResolvedValue({ ok: true, value: [] });

    await renderSketchList();

    expect(screen.getByText("スケッチがまだありません。")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("should render an error message when fetching fails", async () => {
    vi.mocked(getSketchList).mockResolvedValue({
      ok: false,
      error: new Error("test error"),
    });

    await renderSketchList();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "スケッチ一覧の取得に失敗しました。",
    );
  });
});
