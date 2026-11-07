import { toast } from "@/design-system/toast";

// Call this inside the click handler, before any `await`. Safari accepts the write only when it starts in the user's action, so the PNG is passed as a promise.
const copyImage = async (blob: Promise<Blob>): Promise<void> => {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast.add({ type: "success", title: "コピーしました" });
  } catch {
    // TODO(#70): Log the error according to the policy decided in #70.
    toast.add({ type: "error", title: "コピーに失敗しました" });
  }
};

export { copyImage };
