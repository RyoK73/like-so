import { toast } from "@/design-system/toast";
import { copyImage } from "@/sketch-detail/handoff-toolbar/copy-image-button/copyImage";

vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

const PNG = new Blob(["png"], { type: "image/png" });

class FakeClipboardItem {
  constructor(public items: Record<string, Promise<Blob> | Blob>) {}
}

const stubClipboard = (write: ReturnType<typeof vi.fn>) => {
  vi.stubGlobal("ClipboardItem", FakeClipboardItem);
  vi.stubGlobal("navigator", { clipboard: { write } });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("should write the PNG promise as a `ClipboardItem` and notify the success", async () => {
  const write = vi.fn().mockResolvedValue(undefined);
  stubClipboard(write);
  const blob = Promise.resolve(PNG);

  await copyImage(blob);

  expect(write).toHaveBeenCalledTimes(1);
  const [items] = write.mock.calls[0] as [FakeClipboardItem[]];
  expect(items).toHaveLength(1);
  expect(items[0]).toBeInstanceOf(FakeClipboardItem);
  expect(items[0].items["image/png"]).toBe(blob);
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({ type: "success", title: "コピーしました" }),
  );
});

it("should notify the error when the browser rejects the write in clipboard", async () => {
  stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));

  await expect(copyImage(Promise.resolve(PNG))).resolves.toBeUndefined();

  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({ type: "error" }),
  );
});

it("should notify the error without throwing when the browser is missing the clipboard API", async () => {
  vi.stubGlobal("navigator", {});
  vi.stubGlobal("ClipboardItem", undefined);

  await expect(copyImage(Promise.resolve(PNG))).resolves.toBeUndefined();

  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({ type: "error" }),
  );
});

it("should notify the error when the PNG cannot be made", async () => {
  // Like the real `ClipboardItem`, the fake write rejects when the blob promise rejects.
  stubClipboard(
    vi.fn(async ([item]: FakeClipboardItem[]) => {
      await item.items["image/png"];
    }),
  );
  const failed = Promise.reject(new Error("export failed"));

  await expect(copyImage(failed)).resolves.toBeUndefined();

  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({ type: "error" }),
  );
  expect(toast.add).not.toHaveBeenCalledWith(
    expect.objectContaining({ type: "success" }),
  );
});
