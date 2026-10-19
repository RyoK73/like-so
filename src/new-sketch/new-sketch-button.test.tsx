import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewSketchButton } from "@/new-sketch/new-sketch-button";
import { startNewSketch } from "@/new-sketch/start-new-sketch";
import { toast } from "@/design-system/toast";

vi.mock("@/new-sketch/start-new-sketch", () => ({ startNewSketch: vi.fn() }));
vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

describe("NewSketchButton", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("should call startNewSketch when clicked", async () => {
    vi.mocked(startNewSketch).mockResolvedValue(null);

    render(<NewSketchButton />);
    await userEvent.click(
      screen.getByRole("button", { name: "新規スケッチ作成" }),
    );

    expect(startNewSketch).toHaveBeenCalledTimes(1);
    expect(toast.add).not.toHaveBeenCalled();
  });

  test("should show an error toast when creating fails", async () => {
    vi.mocked(startNewSketch).mockResolvedValue({ error: "作成に失敗" });

    render(<NewSketchButton />);
    await userEvent.click(
      screen.getByRole("button", { name: "新規スケッチ作成" }),
    );

    expect(toast.add).toHaveBeenCalledWith({
      type: "error",
      title: "作成に失敗",
    });
  });
});
