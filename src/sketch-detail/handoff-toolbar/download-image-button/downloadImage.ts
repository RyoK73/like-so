import { toast } from "@/design-system/toast";
import {
  buildPngFileName,
  type PngFileNameError,
} from "@/sketch-detail/handoff-toolbar/buildPngFileName";

const FILE_NAME_ERROR_MESSAGES: Record<PngFileNameError, string> = {
  empty: "タイトルが空のため、ダウンロードできません",
  "no-valid-chars":
    "タイトルにファイル名として使える文字がないため、ダウンロードできません",
};

type DownloadImageParams = {
  title: string;
  now: Date;
  getBlob: () => Promise<Blob>;
};

const REVOKE_DELAY_MS = 1000;

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
  } finally {
    // Revoking right after click() may cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
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
    // TODO(#70): Log the error according to the policy decided in #70.
    toast.add({ type: "error", title: "ダウンロードに失敗しました" });
  }
};

export { downloadImage };
