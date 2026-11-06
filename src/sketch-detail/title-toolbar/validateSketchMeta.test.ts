import { validateSketchMeta } from "@/sketch-detail/title-toolbar/validateSketchMeta";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;

const validDescription = "description";
const validTitle = "title";

describe("validateSketchMeta: title", () => {
  it("should be valid and return the title as it is when the title is 'abc'", () => {
    const result = validateSketchMeta({
      title: "abc",
      description: validDescription,
    });

    expect(result).toEqual({
      ok: true,
      value: { title: "abc", description: validDescription },
    });
  });

  it("should trim the title when it has spaces on both sides", () => {
    const result = validateSketchMeta({
      title: "  abc  ",
      description: validDescription,
    });

    expect(result).toEqual({
      ok: true,
      value: { title: "abc", description: validDescription },
    });
  });

  it("should return an error when the title is an empty string", () => {
    const result = validateSketchMeta({
      title: "",
      description: validDescription,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toBeDefined();
  });

  it("should return an error when the title is only half-width and full-width spaces", () => {
    const result = validateSketchMeta({
      title: " 　 　",
      description: validDescription,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toBeDefined();
  });

  it("should be valid when the title has 100 characters", () => {
    const result = validateSketchMeta({
      title: "a".repeat(TITLE_MAX),
      description: validDescription,
    });

    expect(result.ok).toBe(true);
  });

  it("should return an error when the title has 101 characters", () => {
    const result = validateSketchMeta({
      title: "a".repeat(TITLE_MAX + 1),
      description: validDescription,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toBeDefined();
  });

  it("should be valid when the title has 100 characters after trim", () => {
    const result = validateSketchMeta({
      title: ` ${"a".repeat(TITLE_MAX)} `,
      description: validDescription,
    });

    expect(result.ok).toBe(true);
  });

  it("should count by code points: 100 emojis are valid", () => {
    const result = validateSketchMeta({
      title: "😀".repeat(TITLE_MAX),
      description: validDescription,
    });

    expect(result.ok).toBe(true);
  });

  it("should count by code points: 101 emojis are an error", () => {
    const result = validateSketchMeta({
      title: "😀".repeat(TITLE_MAX + 1),
      description: validDescription,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toBeDefined();
  });
});

describe("validateSketchMeta: description", () => {
  it("should be valid when the description is an empty string", () => {
    const result = validateSketchMeta({ title: validTitle, description: "" });

    expect(result).toEqual({
      ok: true,
      value: { title: validTitle, description: "" },
    });
  });

  it("should be valid when the description has 500 characters", () => {
    const result = validateSketchMeta({
      title: validTitle,
      description: "a".repeat(DESCRIPTION_MAX),
    });

    expect(result.ok).toBe(true);
  });

  it("should return an error when the description has 501 characters", () => {
    const result = validateSketchMeta({
      title: validTitle,
      description: "a".repeat(DESCRIPTION_MAX + 1),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.description).toBeDefined();
  });

  it("should count by code points: 500 emojis are valid", () => {
    const result = validateSketchMeta({
      title: validTitle,
      description: "😀".repeat(DESCRIPTION_MAX),
    });

    expect(result.ok).toBe(true);
  });

  it("should keep newlines and leading spaces as they are", () => {
    const description = "  line1\n    line2\n";

    const result = validateSketchMeta({ title: validTitle, description });

    expect(result).toEqual({
      ok: true,
      value: { title: validTitle, description },
    });
  });

  it("should be valid and keep the description as it is when it is only spaces", () => {
    const result = validateSketchMeta({
      title: validTitle,
      description: "   ",
    });

    expect(result).toEqual({
      ok: true,
      value: { title: validTitle, description: "   " },
    });
  });
});

describe("validateSketchMeta: both", () => {
  it("should be invalid as a whole when only the title is invalid", () => {
    const result = validateSketchMeta({ title: "", description: "valid" });

    expect(result.ok).toBe(false);
  });

  it("should be invalid as a whole when only the description is invalid", () => {
    const result = validateSketchMeta({
      title: validTitle,
      description: "a".repeat(DESCRIPTION_MAX + 1),
    });

    expect(result.ok).toBe(false);
  });
});
