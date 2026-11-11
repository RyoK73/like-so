import type { SketchMeta } from "@/supabase/sketch-crud/updateSketchMeta.types";

// These constants must be checked in #132.
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

type SketchMetaErrors = { title?: string; description?: string };
type ValidateSketchMetaResult =
  { ok: true; value: SketchMeta } | { ok: false; errors: SketchMetaErrors };

// Count by code points, so that the count matches `char_length` of Postgres.
const countCodePoints = (text: string): number => [...text].length;

// The title is trimmed. The description is kept as it is.
const validateSketchMeta = (input: SketchMeta): ValidateSketchMetaResult => {
  const title = input.title.trim();
  const errors: SketchMetaErrors = {};

  if (title === "") {
    errors.title = "タイトルを入力してください";
  } else if (countCodePoints(title) > TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (countCodePoints(input.description) > DESCRIPTION_MAX_LENGTH) {
    errors.description = `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
  }

  if (errors.title !== undefined || errors.description !== undefined) {
    return { ok: false, errors };
  }
  return { ok: true, value: { title, description: input.description } };
};

export { validateSketchMeta };
export type { SketchMetaErrors, ValidateSketchMetaResult };
