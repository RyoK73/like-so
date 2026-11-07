import { toast } from "@/design-system/toast";
import { downloadImage } from "@/sketch-detail/handoff-toolbar/download-image-button/downloadImage";

vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

const NOW = new Date(2026, 10, 6, 14, 30, 25);
const PNG = new Blob(["png"], { type: "image/png" });
const OBJECT_URL = "blob:test-object-url";

let downloadedNames: string[];

beforeEach(() => {
  vi.clearAllMocks();
  downloadedNames = [];
  URL.createObjectURL = vi.fn(() => OBJECT_URL);
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloadedNames.push(this.download);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("should save the PNG with the built file name and notify the success", async () => {
  const getBlob = vi.fn().mockResolvedValue(PNG);

  await downloadImage({ title: "sample", now: NOW, getBlob });

  expect(URL.createObjectURL).toHaveBeenCalledWith(PNG);
  expect(downloadedNames).toEqual(["sample-20261106-143025.png"]);
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "success",
      title: "ダウンロードしました",
    }),
  );
});

it("should neither make the PNG nor save it when the title is empty", async () => {
  const getBlob = vi.fn().mockResolvedValue(PNG);

  await downloadImage({ title: "  ", now: NOW, getBlob });

  expect(getBlob).not.toHaveBeenCalled();
  expect(downloadedNames).toEqual([]);
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "error",
      title: "タイトルが空のためダウンロードできません",
    }),
  );
});

it("should neither make the PNG nor save it when the title has only forbidden characters", async () => {
  const getBlob = vi.fn().mockResolvedValue(PNG);

  await downloadImage({ title: "///", now: NOW, getBlob });

  expect(getBlob).not.toHaveBeenCalled();
  expect(downloadedNames).toEqual([]);
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "error",
      title: "タイトルにファイル名に使える文字がないためダウンロードできません",
    }),
  );
});

it("should notify the error and not save when the PNG cannot be made", async () => {
  const getBlob = vi.fn().mockRejectedValue(new Error("export failed"));

  await expect(
    downloadImage({ title: "sample", now: NOW, getBlob }),
  ).resolves.toBeUndefined();

  expect(downloadedNames).toEqual([]);
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({ type: "error" }),
  );
  expect(toast.add).not.toHaveBeenCalledWith(
    expect.objectContaining({ type: "success" }),
  );
});

it("should revoke the object URL after saving", async () => {
  const getBlob = vi.fn().mockResolvedValue(PNG);

  await downloadImage({ title: "sample", now: NOW, getBlob });

  expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
});
