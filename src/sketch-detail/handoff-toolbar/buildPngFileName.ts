import type { Result } from "@/utils/utility.types";

type PngFileNameError = "empty" | "no-valid-chars";

// The characters that cannot be used in a file name on common file systems.
const FORBIDDEN_CHARS = /[/\\:*?"<>|]/g;

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

// The local time, such as `20261106-143025`.
const formatTimestamp = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

const buildPngFileName = (
  title: string,
  now: Date,
): Result<string, PngFileNameError> => {
  const trimmed = title.trim();
  if (trimmed === "") return { ok: false, error: "empty" };
  if (trimmed.replace(FORBIDDEN_CHARS, "").trim() === "") {
    return { ok: false, error: "no-valid-chars" };
  }
  const safeTitle = trimmed.replace(FORBIDDEN_CHARS, "_");
  return { ok: true, value: `${safeTitle}-${formatTimestamp(now)}.png` };
};

export { buildPngFileName };
export type { PngFileNameError };
