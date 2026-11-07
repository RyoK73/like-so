// The paper is drawn by CSS (`bg-canvas`), so read the color from the same variable. The paper stays light in both modes.
const getPaperColor = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--canvas")
    .trim();

export { getPaperColor };
