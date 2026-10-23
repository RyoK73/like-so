import { act, renderHook } from "@testing-library/react";
import { CanvasJson, useHistory } from "@/sketch-detail/history/useHistory";

const createTestCanvasJson = (id: number): CanvasJson => ({
  version: "0.0.0",
  objects: [id],
});

const inputValues = {
  first: createTestCanvasJson(1),
  second: createTestCanvasJson(2),
  third: createTestCanvasJson(3),
};

describe("useHistory", () => {
  describe("set", () => {
    test("set should return current current value", () => {
      const { result } = renderHook(() => useHistory());
      act(() => {
        Object.values(inputValues).map((value) => result.current.set(value));
      });

      expect(result.current.history.future).toEqual([]);
      expect(result.current.history.present).toEqual(inputValues.third);
      expect(result.current.history.past).toEqual([
        inputValues.first,
        inputValues.second,
        inputValues.third,
      ]);
    });
  });

  describe("undo", () => {
    it("should return previous value", () => {
      const { result } = renderHook(() => useHistory());
      act(() => {
        Object.values(inputValues).map((value) => result.current.set(value));
        result.current.undo();
      });

      expect(result.current.history.future).toEqual([inputValues.third]);
      expect(result.current.history.present).toEqual(inputValues.second);
      expect(result.current.history.past).toEqual([
        inputValues.first,
        inputValues.second,
      ]);
    });
    it("should return raw value when input times < 2", () => {
      const { result } = renderHook(() => useHistory());
      act(() => {
        result.current.set(inputValues.first);
        result.current.undo();
      });

      expect(result.current.history.present).toEqual(inputValues.first);
    });
  });

  describe("redo", () => {
    it("should return subsequent value", () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        Object.values(inputValues).map((value) => result.current.set(value));
        result.current.undo();
        result.current.undo();
        result.current.redo();
      });

      expect(result.current.history.future).toEqual([inputValues.third]);
      expect(result.current.history.present).toEqual(inputValues.second);
      expect(result.current.history.past).toEqual([
        inputValues.first,
        inputValues.second,
      ]);
    });

    it("should return raw history when undo has not run yet", () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        Object.values(inputValues).map((value) => result.current.set(value));
      });
      expect(result.current.history.present).toEqual(inputValues.third);
    });
  });
});
