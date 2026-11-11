# Toolbars

## Overview

There are four UIs that float over the screen.
This document first describes what the four have in common, and then describes each one.

| Name            | Component        | Position                                                            | Page                          |
| --------------- | ---------------- | ------------------------------------------------------------------- | ----------------------------- |
| Navigation menu | `NavigationMenu` | `left-4` from the left edge, vertically centered (`fixed`)          | `/sketches`, `/sketches/[id]` |
| Title toolbar   | `TitleToolbar`   | `top-4` from the top edge, horizontally centered (`absolute`)       | `/sketches/[id]`              |
| Control toolbar | `ControlToolbar` | `bottom-4` from the bottom edge, horizontally centered (`absolute`) | `/sketches/[id]`              |
| Handoff toolbar | `HandoffToolbar` | `right-4` from the right edge, vertically centered (`absolute`)     | `/sketches/[id]`              |

`src/app/sketches/layout.tsx` renders the navigation menu.
`SketchCanvas` (`src/sketch-detail/sketch-canvas.tsx`) renders the other three.
See [Overview](./overview.en.md) for the details of `SketchCanvas`.

## Common specifications

### How they float

- They float over the content or the canvas (`z-10`).
- All four have their own position.
  The navigation menu is `fixed`, and the other three are `absolute`.
  They do not take any width or height from the content, so pointer events reach the canvas outside the toolbars.
- The common classes for the frame, the shadow and the icon buttons are in `src/design-system/constants.ts`.
  The title toolbar uses `floatingToolbarClassName`, and the other three use `iconItemListClassName` (which includes `floatingToolbarClassName`).
  `iconItemClassName` sets the size of an icon button.
  See `DESIGN.md` for the colors and the frames.

### Icon buttons and tooltips

- The icon-only items show their names in a tooltip with `IconButton` (`src/design-system/icon-button.tsx`) or `MyToolTip` (`src/design-system/tool-tip.tsx`).
- `MyToolTipProvider` is placed in `src/app/layout.tsx`.
- The side where the tooltip opens depends on where the toolbar is on the screen. Each toolbar holds it as `TOOLTIP_SIDE` in its own `constants.ts`.
  It is not exported outside.
- See `tooltip` in `DESIGN.md` for the look of the tooltip.
- `IconButton` accepts an optional `tooltipHint` (a supplement such as a shortcut key).
  The tooltip shows "name (`tooltipHint`)".
  `aria-label` stays as the name.

### `role` and `aria-label`

| Toolbar         | Element / `role` | `aria-label`           |
| --------------- | ---------------- | ---------------------- |
| Navigation menu | `<nav>`          | ナビゲーションメニュー |
| Title toolbar   | None (input UI)  | None                   |
| Control toolbar | `role="toolbar"` | 操作                   |
| Handoff toolbar | `role="toolbar"` | 受け渡し               |

- A UI that lines up buttons for operations has `role="toolbar"`.
- The navigation menu has links for moving around, so it is a `<nav>`.
- The title toolbar only lines up inputs and is not an operation UI, so it has no `role`.
  Each input has its own `aria-label` ("タイトル" and "説明").
- `ShapeNavigation` inside the control toolbar also has `role="toolbar"` (`aria-label` is "図形の操作").

## Navigation menu

`NavigationMenu` (`src/navigation-menu/navigation-menu.tsx`) is a Server Component.
`src/app/sketches/layout.tsx` renders it, so it appears on both `/sketches` and `/sketches/[id]`.
It is fixed (`fixed`) at `left-4` from the left edge of the screen and vertically centered.
It does not take any width from the content, so a page that must not go under the menu uses `navigationMenuInsetClassName` (`src/design-system/constants.ts`) for its left padding.
`/sketches` uses this padding.
`/sketches/[id]` does not add it, because the canvas fills the whole screen.
Each item is an icon-only button or link.
The tooltip opens on the right of the item (`TOOLTIP_SIDE` is `"right"`).
`index.ts` exports only `NavigationMenu`.

### Visibility

`NavigationMenu` passes a client made by `createSupabaseServerClient` to `getAuthState` to get the auth state.
When the state is `signedOut`, it shows no menu at all (it returns `null`).
The items are defined in `menuItems`, and an item is shown only when the auth state is in its `visibleFor`.

| Item             | Component             | `guest` | `registered` | Status      |
| ---------------- | --------------------- | ------- | ------------ | ----------- |
| Sketch list      | `SketchListLink`      | Shown   | Shown        | Implemented |
| New sketch       | `NewSketchIconButton` | Shown   | Shown        | Implemented |
| Theme toggle     | `ThemeToggleButton`   | Shown   | Shown        | Implemented |
| Register account | `SignUpLink`          | Shown   | Hidden       | Implemented |
| Sign in          | `SignInLink`          | Shown   | Hidden       | Implemented |
| Sign out         | `SignOutButton`       | Hidden  | Shown        | Implemented |

### Files

| File                         | Role                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `navigation-menu.tsx`        | Server Component. Lines up the items for the auth state                      |
| `sketch-list-link.tsx`       | Client Component. A link to `/sketches`                                      |
| `new-sketch-icon-button.tsx` | Passes an icon and the tooltip side to `NewSketchButton` (`src/new-sketch/`) |
| `constants.ts`               | Holds the tooltip side (`TOOLTIP_SIDE`). Not exported outside                |
| `sign-up-link.tsx`           | A link to `/signup`                                                          |
| `sign-in-link.tsx`           | A link to `/signin`                                                          |
| `theme-toggle-button.tsx`    | Client Component. Switches between `dark` and `light`                        |
| `sign-out/`                  | `SignOutButton` and `signOutAction` (Server Action). Handles signing out     |
| `index.ts`                   | Exports `NavigationMenu`                                                     |

### Details

- `SketchListLink` highlights itself as the current page (`bg-paint-yellow`) only when `usePathname` equals `/sketches`.
  It does not highlight on `/sketches/[id]`.
- `NewSketchIconButton` passes `variant="icon"` and `tooltipSide` to `NewSketchButton`.
  With `variant="icon"`, `NewSketchButton` uses `IconButton`.
  The button has no brush frame.
  See [Routing](./routing.en.md) for the flow of creating a sketch.
- `ThemeToggleButton` switches between `dark` and `light` on each click with `useTheme` of `next-themes`.
  It shows the icon (`LuSun` or `LuMoonStar`) with the CSS `dark:` variant.
  It shows the button and its tooltip ("テーマ切り替え") with `IconButton`.
  It depends on `ThemeProvider` (`src/design-system/`).
  See [Overview](./overview.en.md) for the tech stack.
- `SignOutButton` calls `signOutAction` with `useActionState` (Client Component).
  It is `disabled` while the action is pending.
  Its icon is `LuLogOut`.
  It shows the button and its tooltip ("サインアウト") with `IconButton`.
  On success, it redirects to `/`.
  On failure, `signOutAction` returns "サインアウトに失敗しました", and the button shows it as a toast (`error`).
- `NavigationMenu` passes a common `className` (`iconItemClassName`) to each item.

## Title toolbar

`TitleToolbar` (`src/sketch-detail/title-toolbar/title-toolbar.tsx`) is a Client Component.
It floats over the canvas at the top center.
`index.ts` exports only `TitleToolbar`.

- `title` and `description` are always shown as inputs.
  The inputs have no border until they are focused.
- The input for `description` grows with the number of lines (with a maximum height).
- `width × height` and the updated time are display only.
- See [Saving sketches](./save.en.md) for the validation and the saving of the input.
- It has no icon buttons, so it has no tooltip.

## Control toolbar

`ControlToolbar` (`src/sketch-detail/control-toolbar/control-toolbar.tsx`) floats over the canvas, centered and slightly lifted from the bottom edge of the screen.
The toolbar has its own frame and position (`absolute`), and receives its content as `children`.
`index.ts` exports `ControlToolbar` and `ZoomControls`.
The tooltip opens above the item (`TOOLTIP_SIDE` in `control-toolbar/constants.ts` is `"top"`).

The content is the shape navigation (`ShapeNavigation`) and the zoom controls (`ZoomControls`).

- The buttons of the shape navigation are the rectangle, the circle, undo, redo and delete.
- The zoom controls are "− zoom input % +" (see [Fixed frame, pan and zoom](./viewport.en.md)).
- All of them are disabled until `isLoaded` becomes `true`.
- The shape navigation is also disabled while the canvas is being restored by undo / redo (`isOperable` is `false`).
- Undo and redo are also disabled while there is nothing to undo or redo.
- The delete button (`LuTrash2`) deletes the selected shapes.
  Its tooltip is "削除(Delete / Backspaceキー)", shown with `tooltipHint` of `IconButton`.
  It does not subscribe to the selection, so it is enabled even when no shape is selected, and then it does nothing.
  When several shapes are selected (drag selection), it deletes all of them.
- The Delete and Backspace keys do the same deletion.
  This is because the "delete" key on a Mac is reported as Backspace.
  Both the deletion and the key handling are in `useDeleteSelectedShape` (`src/sketch-detail/selection/`).
  The Delete and Backspace keys do not delete in these cases:
  - Any of Ctrl, Meta, Alt and Shift is held.
  - The key is pressed in an input, a textarea or a `contenteditable` element.
  - The IME is composing text.
  - The button is disabled (`isLoaded` is `false`, or `isOperable` is `false`).

## Handoff toolbar

It has the buttons to hand the sketch over to LLMs and others.
`SketchCanvas` renders it, so it appears only on `/sketches/[id]`.
It floats over the canvas, is fixed (`absolute`) at `right-4` from the right edge of the screen, and is vertically centered.
It is always shown and has no toggle.
Its buttons are lined up vertically.
`index.ts` exports only `HandoffToolbar`.

| Button   | Component             | Icon         | Tooltip            |
| -------- | --------------------- | ------------ | ------------------ |
| Copy     | `CopyImageButton`     | `LuCopy`     | 画像をコピー       |
| Download | `DownloadImageButton` | `LuDownload` | 画像をダウンロード |

Both are shown with `IconButton`.
They are disabled until the canvas is loaded (`isLoaded` is `true`).
The tooltip opens on the left of the item (`TOOLTIP_SIDE` in `handoff-toolbar/constants.ts` is `"left"`).

### How the PNG is made

`exportFramePng` (`handoff-toolbar/exportFramePng.ts`) returns a `Promise<Blob>`.

- The range is the whole frame (`sketch.width` × `sketch.height`).
  It is output at the scale 1 (the px of the frame as they are), whatever the pan and the zoom are.
  The part of a shape outside the frame is cut off.
- The background of fabric is `transparent`, so `backgroundColor` is set to the paper color only while drawing.
  The paper color is read from the CSS variable `--canvas` with `getComputedStyle` at the time of the click (`getPaperColor`).
  The grid is not included.
- `viewportTransform` is set to the identity matrix only while drawing.
  The drawing is synchronous, and `viewportTransform` and `backgroundColor` are restored right after it.
  They are restored even when an exception occurs, so the pan and the zoom on the screen do not change.
- It outputs the image as it is even when there is no shape.

### Copy

`copyImage` (`handoff-toolbar/copy-image-button/copyImage.ts`) passes `ClipboardItem({ "image/png": Promise<Blob> })` to `navigator.clipboard.write`.
Safari needs the write to start inside the user's action, so it passes a `Promise<Blob>` instead of a `Blob`.
It tells the result with a toast: `success` ("コピーしました") on success and `error` on failure.
There is no fallback for the environments where the Clipboard API is not available.

### Download

`downloadImage` (`handoff-toolbar/download-image-button/downloadImage.ts`) checks the title, makes the PNG, and saves it.
`buildPngFileName` makes the file name in the form `{title}-{YYYYMMDD-HHmmss}.png` (local time).
It trims the spaces around the title and replaces the characters that cannot be used in a file name (`/ \ : * ? " < > |`) with `_`.
In the following cases, it neither makes the PNG nor saves it, and tells the error with a toast (`error`).

| Condition                                           | Toast message                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| A title that is empty after trimming                | タイトルが空のため、ダウンロードできません。                             |
| A title of unusable characters only (such as `///`) | タイトルにファイル名として使える文字がないため、ダウンロードできません。 |

On success, it tells it with a toast (`success`, "ダウンロードしました") and releases the object URL it made.
