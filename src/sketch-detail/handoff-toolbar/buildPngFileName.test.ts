import { buildPngFileName } from "@/sketch-detail/handoff-toolbar/buildPngFileName";

// `new Date(year, monthIndex, ...)` uses the local time.
const NOW = new Date(2026, 10, 6, 14, 30, 25);

it("should build `{title}-{YYYYMMDD-HHmmss}.png` from the local time", () => {
  expect(buildPngFileName("sample", NOW)).toEqual({
    ok: true,
    value: "sample-20261106-143025.png",
  });
});

it("should pad the month, day, hour, minute, and second with zeros", () => {
  expect(buildPngFileName("sample", new Date(2026, 0, 2, 3, 4, 5))).toEqual({
    ok: true,
    value: "sample-20260102-030405.png",
  });
});

it("should replace the characters that cannot be used in a file name with `_`", () => {
  expect(buildPngFileName("a/b:c", NOW)).toEqual({
    ok: true,
    value: "a_b_c-20261106-143025.png",
  });
  expect(buildPngFileName('a\\b*c?d"e<f>g|h', NOW)).toEqual({
    ok: true,
    value: "a_b_c_d_e_f_g_h-20261106-143025.png",
  });
});

it("should trim the spaces around the title", () => {
  expect(buildPngFileName(" sample ", NOW)).toEqual({
    ok: true,
    value: "sample-20261106-143025.png",
  });
});

it("should build another file name for another second", () => {
  const first = buildPngFileName("sample", NOW);
  const second = buildPngFileName("sample", new Date(2026, 10, 6, 14, 30, 26));

  expect(first).toEqual({ ok: true, value: expect.any(String) });
  expect(second).toEqual({ ok: true, value: expect.any(String) });
  expect(first).not.toEqual(second);
});

describe("error", () => {
  it("should return the `empty` error for an empty title", () => {
    expect(buildPngFileName("", NOW)).toEqual({ ok: false, error: "empty" });
  });

  it("should return the `empty` error for a title of spaces only", () => {
    expect(buildPngFileName("   ", NOW)).toEqual({ ok: false, error: "empty" });
  });

  it("should return the `no-valid-chars` error for a title of forbidden characters only", () => {
    expect(buildPngFileName("///", NOW)).toEqual({
      ok: false,
      error: "no-valid-chars",
    });
  });
});
