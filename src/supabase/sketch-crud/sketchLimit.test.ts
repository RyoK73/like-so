import { isSketchLimitError } from "@/supabase/sketch-crud/sketchLimit";

// PostgREST errors are plain objects with a `code`, so an `Error` with a `code` is enough here.
const errorWithCode = (code: string) =>
  Object.assign(new Error("test error"), { code });

describe("isSketchLimitError", () => {
  it("should return true for an error whose code is SK001", () => {
    expect(isSketchLimitError(errorWithCode("SK001"))).toBe(true);
  });

  it("should return false for an error with another code", () => {
    expect(isSketchLimitError(errorWithCode("23514"))).toBe(false);
  });

  it("should return false for an error without a code", () => {
    expect(isSketchLimitError(new Error("test error"))).toBe(false);
  });
});
