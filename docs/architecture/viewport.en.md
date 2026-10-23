# Fixed frame, pan and zoom

## Overview

The **frame** means `frame_size`'s frame, not the `<canvas>` element.

A sketch is drawn inside a fixed frame (`sketch.width` × `sketch.height`, in px).
The canvas element is shrunk to fit the screen, and the content of the frame is panned and zoomed inside it.
Panning and zooming use the `viewportTransform` of fabric.
The calculations are pure functions that do not depend on fabric (`src/sketch-detail/viewport/viewportMath.ts`).

## Terms and coordinates

| Term              | Meaning                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Frame             | The drawing range of the sketch. `sketch.width` × `sketch.height`                                         |
| Area              | The free space on the screen for the canvas, without the toolbar. Measured by `ResizeObserver`.           |
| Element           | The `<canvas>` element. The largest size that fits the area, with the same aspect ratio as the frame.     |
| Scene coordinate  | A coordinate of a shape, with the top-left of the frame as the origin. It does not change by zoom or pan. |
| Screen coordinate | A position on the screen, with the top-left of the element as the origin.                                 |
| Zoom `z`          | The display scale. `1` is 100%.                                                                           |
| `t`               | Where the scene origin (the top-left of the frame) appears on the screen. It is `(tx, ty)` in px.         |

With only pan and zoom, `viewportTransform` has the form `[z, 0, 0, z, tx, ty]`.
The scene coordinate `s` and the screen coordinate `p` are related as follows.

```
p = s × z + t
s = (p − t) / z
```

Only `z` and `t` change by zoom and pan.
The data of the shapes (scene coordinates) does not change, so the saved content is not affected.

## Initial fit

The element is the largest size that fits the area.
If the frame is smaller than the area, it is not enlarged, and the element is the same size as the frame at 100%.

```
scale = min(1, area width / frame width, area height / frame height)
element width = round(frame width × scale)
element height = round(frame height × scale)
initial zoom = scale    (not rounded)
initial t = (0, 0)
```

| Frame    | Area    | Element | Initial zoom |
| -------- | ------- | ------- | ------------ |
| 400×300  | 900×600 | 400×300 | 1            |
| 1200×800 | 900×600 | 900×600 | 0.75         |
| 1200×800 | 900×300 | 450×300 | 0.375        |

When the window is resized, the zoom and the pan are not kept, and the view goes back to the initial one.
The zoom and the pan are not saved. A sketch always opens with the initial view.

## Zoom

The zoom is limited to 10% to 400% (`clampZoom`).

### Zoom around the pointer

The point under the pointer stays at the same screen position before and after the zoom.
In other words, the scene coordinate `s` under the pointer does not change by the zoom.

1. Get the scene coordinate under the pointer from its screen coordinate `p`: `s = (p − t) / z`
2. Decide the new zoom `z'`: `z' = clamp(z × factor, 0.1, 4)`
3. Decide `t'` so that `s` appears at the same `p`: `t' = p − s × z'`

Example (current zoom 1, `t = (0, 0)`, pointer `(100, 50)`, factor 2):

- `s = (100, 50)`
- `z' = 2`
- `t' = (100 − 100 × 2, 50 − 50 × 2) = (−100, −50)`
- Check: `s × z' + t' = (100, 50)`. It is back at the original pointer position.

Clamp `z'` first, and then calculate `t'`.
If `t'` is calculated first and only `z'` is clamped, the point under the pointer moves.

## Pan range

This keeps the frame from going completely off the screen.
`t` is limited so that the element and the frame overlap by at least `m` px (50 px) (`clampPan`).

```
frame size on the screen = frame width × z (the same for the height)
m' = min(50, frame size on the screen)
range of tx: m' − frame width on the screen  ≤  tx  ≤  element width − m'
range of ty: m' − frame height on the screen ≤  ty  ≤  element height − m'
```

Example (element 900×600, frame 1200×800, zoom 1): the range of `tx` is `−1150` to `850`, and the range of `ty` is `−750` to `550`.

## Wheel operations

`resolveWheelAction` sorts a wheel event into one of the following.

| Condition              | Action                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Ctrl (including pinch) | Zoom. The factor is `0.999 ** deltaY`. Zoom has priority even if Shift is pressed. |
| Shift                  | Horizontal pan. Uses the larger of `deltaX` and `deltaY` in absolute value.        |
| No modifier key        | Horizontal pan with `deltaX`, vertical pan with `deltaY` (diagonal on a trackpad). |

- The pan amount uses `delta` as screen px as it is, and subtracts it from `t` (`ty −= deltaY`).
- The zoom factor is `0.999 ** deltaY` so that it is proportional to the amount turned and returns to the start after a round trip.
  `deltaY = −100` (one notch up on a mouse) is about 1.105 times, and `+100` is about 0.905 times.
- With Shift+wheel, some browsers send the value in `deltaX` instead of `deltaY`.
  So with Shift, the larger of the two is used.
- Dragging while holding Space moves `t` by the drag distance (limited by the pan range).

## Limit of the center of a shape and where a shape is created

A shape only needs its **center** inside the frame.
A shape larger than the frame can also be added, and the part outside the frame is shown dimmed without being clipped.

- Move: when the center is about to leave the frame, the center is stopped at the edge of the frame (`clampCenter`).
  Scaling and rotation are not limited.
- Load: a shape whose center is already outside the frame is kept as it is.
- Create: a shape is created at the scene coordinate of the center of the view, clamped into the frame (`getNewShapeCenter`).

```
scene coordinate of the center of the view = ((element width/2 − tx) / z, (element height/2 − ty) / z)
```

## Files

| File                                               | Role                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/sketch-detail/viewport/viewportMath.ts`       | Pure functions for the calculations above                                         |
| `src/sketch-detail/viewport/useViewport.ts`        | Hook that connects wheel, space + drag and resize to fabric (not implemented)     |
| `src/sketch-detail/viewport/useFrameConstraint.ts` | Hook that stops the center of a shape in the frame while moving (not implemented) |
