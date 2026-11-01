# Fixed frame, pan and zoom

## Overview

The **frame** means `frame_size`'s frame, not the `<canvas>` element.

A sketch is drawn inside a fixed frame (`sketch.width` × `sketch.height`, in px).
The canvas element fills the whole canvas container (the whole screen).
The frame is placed at its center, and the content of the frame is panned and zoomed.
The toolbars and the navigation menu float over the canvas.
Panning and zooming use the `viewportTransform` of fabric.
The calculations are pure functions that do not depend on fabric (`src/sketch-detail/viewport/viewportMath.ts`).

## Terms and coordinates

| Term              | Meaning                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Frame             | The drawing range of the sketch. `sketch.width` × `sketch.height`                                         |
| Canvas container  | The `div` that holds the `<canvas>` element (`canvasContainerRef`). It fills the whole screen.            |
| Container size    | The inner size of the canvas container, measured by `ResizeObserver`.                                     |
| Element           | The `<canvas>` element. The same size as the container size.                                              |
| Frame coordinate  | A coordinate of a shape, with the top-left of the frame as the origin. It does not change by zoom or pan. |
| Screen coordinate | A position on the screen, with the top-left of the element as the origin.                                 |
| Zoom `z`          | The display scale. `1` is 100%.                                                                           |
| `t`               | Where the frame origin (the top-left of the frame) appears on the screen. It is `(tx, ty)` in px.         |

With only pan and zoom, `viewportTransform` has the form `[z, 0, 0, z, tx, ty]`.
The frame coordinate `s` and the screen coordinate `p` are related as follows.

```
p = s × z + t
s = (p − t) / z
```

Only `z` and `t` change by zoom and pan.
The data of the shapes (frame coordinates) does not change, so the saved content is not affected.

## Initial fit

The element is the same size as the container size (the whole container).
The frame fits within 80% (`FIT_RATIO`) of the width and the height of the container, and is placed at the center of the container.
If the frame is small, it is not enlarged, and the zoom is 100%.
The overlap with the toolbars is not considered.

```
scale = min(1, 0.8 × container width / frame width, 0.8 × container height / frame height)
element size = container size
initial zoom = scale    (not rounded)
initial tx = round((container width − frame width × scale) / 2)
initial ty = round((container height − frame height × scale) / 2)
```

| Frame     | Container size | Initial zoom | Initial t  |
| --------- | -------------- | ------------ | ---------- |
| 400×300   | 1000×800       | 1            | (300, 250) |
| 1200×800  | 1000×800       | about 0.667  | (100, 133) |
| 1000×1000 | 1000×500       | 0.4          | (300, 50)  |

When the window is resized, the zoom and the pan are not kept, and the view goes back to the initial one.
The zoom and the pan are not saved. A sketch always opens with the initial view.

## Zoom

The zoom is limited to 10% to 400% (`clampZoom`).

### Zoom around the pointer

The point under the pointer stays at the same screen position before and after the zoom.
In other words, the frame coordinate `s` under the pointer does not change by the zoom.

1. Get the frame coordinate under the pointer from its screen coordinate `p`: `s = (p − t) / z`
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
A shape larger than the frame can also be added, and the part outside the frame is shown without being clipped.

- Move: when the center is about to leave the frame, the center is stopped at the edge of the frame (`clampCenter`).
  Scaling and rotation are not limited.
- Load: a shape whose center is already outside the frame is kept as it is.
- Create: a shape is created at the frame coordinate of the center of the view, clamped into the frame (`getNewShapeCenter`).

```
frame coordinate of the center of the view = ((element width/2 − tx) / z, (element height/2 − ty) / z)
```

## Files

| File                                               | Role                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/sketch-detail/viewport/viewportMath.ts`       | Pure functions for the calculations above                                                              |
| `src/sketch-detail/viewport/viewportStyle.ts`      | Functions for the background of the grid and where the frame appears on the screen (the frame outline) |
| `src/sketch-detail/viewport/useViewport.ts`        | Hook that applies wheel, space + drag and resize operations to the view of fabric                      |
| `src/sketch-detail/viewport/useFrameConstraint.ts` | Hook that stops the center of a shape in the frame while moving                                        |
