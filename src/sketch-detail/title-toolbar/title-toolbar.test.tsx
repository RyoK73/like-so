import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { TitleToolbar } from "@/sketch-detail/title-toolbar/title-toolbar";
import { dateTimeTestHelper } from "@/sketch-list/testUtility";
import { updateSketchMeta } from "@/supabase/sketch-crud/updateSketchMeta";

vi.mock("@/supabase/sketch-crud/updateSketchMeta", () => ({
  updateSketchMeta: vi.fn(),
}));
vi.mock("@/supabase/utils/browserClient", () => ({
  createSupabaseBrowserClient: vi.fn(() => ({})),
}));

const { generateTestDateTime } = dateTimeTestHelper();
const UPDATED_AT = "2026-10-02T00:00:00Z";

const renderToolbar = (
  props: Partial<ComponentProps<typeof TitleToolbar>> = {},
) =>
  render(
    <TitleToolbar
      sketchId="sketch-id"
      title="my sketch"
      description="my description"
      width={1920}
      height={1080}
      updatedAt={UPDATED_AT}
      onSaved={vi.fn()}
      {...props}
    />,
  );

it("should render the title and the description in the inputs, and the size and updated_at", () => {
  renderToolbar();

  expect(screen.getByRole("textbox", { name: "タイトル" })).toHaveValue(
    "my sketch",
  );
  expect(screen.getByRole("textbox", { name: "説明" })).toHaveValue(
    "my description",
  );
  expect(screen.getByText("1920 × 1080")).toBeInTheDocument();
  expect(
    screen.getByText(generateTestDateTime(new Date(UPDATED_AT))),
  ).toBeInTheDocument();
});

it("should render the empty description input when the description is an empty string", () => {
  renderToolbar({ description: "" });

  expect(screen.getByRole("textbox", { name: "説明" })).toHaveValue("");
});

it("should render the minimum size 320 × 320", () => {
  renderToolbar({ width: 320, height: 320 });

  expect(screen.getByText("320 × 320")).toBeInTheDocument();
});

it("should call onSaved with the trimmed title when a valid title is typed", async () => {
  vi.mocked(updateSketchMeta).mockResolvedValue({
    ok: true,
    value: {},
  } as Awaited<ReturnType<typeof updateSketchMeta>>);

  const onSaved = vi.fn();
  renderToolbar({ onSaved });
  const titleInput = screen.getByRole("textbox", { name: "タイトル" });

  await userEvent.clear(titleInput);
  await userEvent.type(titleInput, "new");

  await waitFor(() => {
    expect(onSaved).toHaveBeenLastCalledWith({
      title: "new",
      description: "my description",
    });
  });
});

it("should show the error and mark the title input as invalid when the title is cleared", async () => {
  renderToolbar();
  const titleInput = screen.getByRole("textbox", { name: "タイトル" });

  await userEvent.clear(titleInput);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "タイトルを入力してください。",
  );
  expect(titleInput).toHaveAttribute("aria-invalid", "true");
});
