import {
  getFrameOnScreen,
  getGridBackgroundStyle,
} from "@/sketch-detail/viewport/viewportStyle";

// A transform is `{ zoom, tx, ty }`. `(tx, ty)` is where the frame origin (the top-left of the frame) appears on the element.

describe("getGridBackgroundStyle", () => {
  it("should draw the grid at cell_size at zoom 1 with no pan", () => {
    expect(getGridBackgroundStyle({ zoom: 1, tx: 0, ty: 0 }, 16)).toEqual({
      backgroundSize: "16px 16px",
      backgroundPosition: "0px 0px",
    });
  });

  it("should scale the cell size by the zoom", () => {
    expect(getGridBackgroundStyle({ zoom: 2, tx: 0, ty: 0 }, 16)).toEqual({
      backgroundSize: "32px 32px",
      backgroundPosition: "0px 0px",
    });
  });

  it("should move the grid with the pan (tx, ty)", () => {
    expect(getGridBackgroundStyle({ zoom: 1, tx: -100, ty: 30 }, 16)).toEqual({
      backgroundSize: "16px 16px",
      backgroundPosition: "-100px 30px",
    });
  });
});

describe("getFrameOnScreen", () => {
  const frame = { width: 1200, height: 800 };

  it("should be the frame at the top-left of the element at zoom 1 with no pan", () => {
    expect(getFrameOnScreen({ zoom: 1, tx: 0, ty: 0 }, frame)).toEqual({
      left: 0,
      top: 0,
      width: 1200,
      height: 800,
    });
  });

  it("should scale the size by the zoom and put the position at (tx, ty)", () => {
    expect(getFrameOnScreen({ zoom: 0.75, tx: -40, ty: 25 }, frame)).toEqual({
      left: -40,
      top: 25,
      width: 900,
      height: 600,
    });
  });
});
