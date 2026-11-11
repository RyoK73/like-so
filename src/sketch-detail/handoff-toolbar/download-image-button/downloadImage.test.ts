import { toast } from "@/design-system/toast";
import { downloadImage } from "@/sketch-detail/handoff-toolbar/download-image-button/downloadImage";

vi.mock("@/design-system/toast", () => ({ toast: { add: vi.fn() } }));

const NOW = new Date(2026, 10, 6, 14, 30, 25);
const PNG = new Blob(["png"], { type: "image/png" });
const OBJECT_URL = "blob:test-object-url";

let downloadedNames: string[];

beforeEach(() => {
  vi.useFakeTimers();
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
  vi.useRealTimers();
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
  vi.advanceTimersByTime(1000);

  expect(getBlob).not.toHaveBeenCalled();
  expect(downloadedNames).toEqual([]);
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "error",
      title: "タイトルが空のため、ダウンロードできません。",
    }),
  );
});

it("should neither make the PNG nor save it when the title has only forbidden characters", async () => {
  const getBlob = vi.fn().mockResolvedValue(PNG);

  await downloadImage({ title: "///", now: NOW, getBlob });
  vi.advanceTimersByTime(1000);

  expect(getBlob).not.toHaveBeenCalled();
  expect(downloadedNames).toEqual([]);
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "error",
      title: "タイトルにファイル名として使える文字がないため、ダウンロードできません。",
    }),
  );
});

it("should notify the error and not save when the PNG cannot be made", async () => {
  const getBlob = vi.fn().mockRejectedValue(new Error("export failed"));

  await expect(
    downloadImage({ title: "sample", now: NOW, getBlob }),
  ).resolves.toBeUndefined();
  vi.advanceTimersByTime(1000);

  expect(downloadedNames).toEqual([]);
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  expect(toast.add).toHaveBeenCalledWith(
    expect.objectContaining({ type: "error" }),
  );
  expect(toast.add).not.toHaveBeenCalledWith(
    expect.objectContaining({ type: "success" }),
  );
});
describe("revokeObjectUrl", () => {
  it("should not revoke the object URL right after saving", async () => {
    const getBlob = vi.fn().mockResolvedValue(PNG);

    await downloadImage({ title: "sample", now: NOW, getBlob });

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("should not revoke the object URL before the delay has passed", async () => {
    const getBlob = vi.fn().mockResolvedValue(PNG);

    await downloadImage({ title: "sample", now: NOW, getBlob });
    vi.advanceTimersByTime(999);

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("should revoke the object URL once the delay has passed", async () => {
    const getBlob = vi.fn().mockResolvedValue(PNG);

    await downloadImage({ title: "sample", now: NOW, getBlob });
    vi.advanceTimersByTime(1000);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });

  it("should not revoke the object URL right after the click fails", async () => {
    vi.mocked(HTMLAnchorElement.prototype.click).mockImplementationOnce(() => {
      throw new Error("click failed");
    });
    const getBlob = vi.fn().mockResolvedValue(PNG);

    await downloadImage({ title: "sample", now: NOW, getBlob });

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("should notify the error and revoke the object URL after the delay when the click fails", async () => {
    vi.mocked(HTMLAnchorElement.prototype.click).mockImplementationOnce(() => {
      throw new Error("click failed");
    });
    const getBlob = vi.fn().mockResolvedValue(PNG);

    await downloadImage({ title: "sample", now: NOW, getBlob });
    vi.advanceTimersByTime(1000);

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });
});
