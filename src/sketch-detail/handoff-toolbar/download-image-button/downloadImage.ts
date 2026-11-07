import { toast } from "@/design-system/toast";
import {
  buildPngFileName,
  type PngFileNameError,
} from "@/sketch-detail/handoff-toolbar/buildPngFileName";

const FILE_NAME_ERROR_MESSAGES: Record<PngFileNameError, string> = {
  empty: "タイトルが空のためダウンロードできません",
  "no-valid-chars":
    "タイトルにファイル名に使える文字がないためダウンロードできません",
};

type DownloadImageParams = {
  title: string;
  now: Date;
  getBlob: () => Promise<Blob>;
};

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};

const downloadImage = async ({
  title,
  now,
  getBlob,
}: DownloadImageParams): Promise<void> => {
  // Check the title first, so that the PNG is not made for nothing.
  const fileName = buildPngFileName(title, now);
  if (!fileName.ok) {
    toast.add({
      type: "error",
      title: FILE_NAME_ERROR_MESSAGES[fileName.error],
    });
    return;
  }

  try {
    saveBlob(await getBlob(), fileName.value);
    toast.add({ type: "success", title: "ダウンロードしました" });
  } catch {
    toast.add({ type: "error", title: "ダウンロードに失敗しました" });
  }
};

export { downloadImage };
